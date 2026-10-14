// Write-path nội dung có version (CR-031 R-16a): mỗi hàm ghi = 1 transaction gồm
//   SELECT … FOR UPDATE → kiểm expectedVersion → validate (src/db/content-rules.ts + I-1/I-3/I-5/I-7/I-8 cần DB/đĩa)
//   → ghi content_entries (version + 1) → ghi content_versions (op/actor/note/data/body/sort_order).
// Lỗi ở bất kỳ bước nào → cả transaction huỷ, không bao giờ có entry đổi mà thiếu dòng lịch sử.
// Dùng cho CLI (tools/db/content-cli.ts) và bot CR-030. Không import "server-only" (CLI chạy bằng tsx); không log DATABASE_URL.
import { access } from "node:fs/promises";
import path from "node:path";
import { and, asc, eq, isNull, ne, sql, type SQL } from "drizzle-orm";
import type { Database } from "./client";
import {
  checkRecord,
  collectImagePaths,
  isPublicUrlCollection,
  registryProblem,
  registryTargetCollection,
  type ContentRecord,
} from "./content-rules";
import { contentEntries, contentVersions, type ContentEntry, type ContentVersion, type ContentVersionOp } from "./schema";

type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

export class ContentConflictError extends Error {
  constructor(readonly entryId: number, readonly expectedVersion: number, readonly actualVersion: number) {
    super(`conflict: entry ${entryId} đang ở version ${actualVersion}, không phải ${expectedVersion} — đọc lại rồi thử lại`);
    this.name = "ContentConflictError";
  }
}

export class ContentValidationError extends Error {
  constructor(readonly problems: readonly string[]) {
    super(`dữ liệu không hợp lệ: ${problems.join("; ")}`);
    this.name = "ContentValidationError";
  }
}

export class ContentNotFoundError extends Error {
  constructor(what: string) {
    super(`không tìm thấy ${what}`);
    this.name = "ContentNotFoundError";
  }
}

export interface WriteOptions {
  // `cli:<user>`, `bot:<telegram-id>` — ghi vào updated_by + content_versions.actor.
  actor: string;
  note?: string | null;
  // Thư mục kiểm I-7 cho ảnh tĩnh; mặc định <cwd>/public.
  publicDir?: string;
}

export interface WriteResult {
  entry: ContentEntry;
  // Không chặn ghi nhưng người gọi phải báo lại (vd I-1 thiếu bản ngôn ngữ kia, I-8 cần redirect 301).
  warnings: string[];
}

export interface CreateEntryInput extends WriteOptions {
  collection: string;
  slug: string;
  locale: string;
  data: Record<string, unknown>;
  body?: string | null;
  sortOrder?: number | null;
}

export interface UpdateEntryInput extends WriteOptions {
  id: number;
  expectedVersion: number;
  data: Record<string, unknown>;
  // undefined = giữ nguyên giá trị hiện tại.
  body?: string | null;
  sortOrder?: number | null;
}

export interface SoftDeleteEntryInput extends WriteOptions {
  id: number;
  expectedVersion: number;
  // I-8: bắt buộc true khi xoá bản ghi có URL công khai (post/solution/product/case_study).
  confirmPublicUrlChange?: boolean;
}

export interface RollbackEntryInput extends WriteOptions {
  id: number;
  toVersion: number;
  expectedVersion: number;
}

interface Validation {
  problems: string[];
  warnings: string[];
}

function entryKey(record: Pick<ContentRecord, "collection" | "locale" | "slug">): string {
  return `${record.collection}/${record.locale}/${record.slug}`;
}

function toRecord(entry: ContentEntry): ContentRecord {
  return {
    collection: entry.collection,
    slug: entry.slug,
    locale: entry.locale,
    data: entry.data as Record<string, unknown>,
    body: entry.body,
    sortOrder: entry.sortOrder,
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

async function findLiveEntry(tx: Transaction, collection: string, locale: string, slug: string): Promise<ContentEntry | undefined> {
  const [row] = await tx
    .select()
    .from(contentEntries)
    .where(
      and(
        eq(contentEntries.collection, collection),
        eq(contentEntries.locale, locale as ContentEntry["locale"]),
        eq(contentEntries.slug, slug),
        isNull(contentEntries.deletedAt),
      ),
    );
  return row;
}

// I-7: ảnh /uploads/* phải là asset còn sống trong DB (data.path = đường dẫn, decisions.md); ảnh khác phải là file trong public/.
async function imageProblems(tx: Transaction, record: ContentRecord, publicDir: string): Promise<string[]> {
  // Bản ghi asset chính là nguồn của đường dẫn /uploads (file trên volume kiểm ở P3-T05) → không tự tham chiếu.
  if (record.collection === "asset") return [];
  const problems: string[] = [];
  for (const imagePath of collectImagePaths(record)) {
    if (imagePath.split("/").includes("..")) {
      problems.push(`I-7 đường dẫn ảnh không hợp lệ: ${imagePath}`);
    } else if (imagePath.startsWith("/uploads/")) {
      const [asset] = await tx
        .select({ id: contentEntries.id })
        .from(contentEntries)
        .where(
          and(eq(contentEntries.collection, "asset"), isNull(contentEntries.deletedAt), sql`${contentEntries.data}->>'path' = ${imagePath}`),
        )
        .limit(1);
      if (!asset) problems.push(`I-7 ảnh upload không có trong DB: ${imagePath}`);
    } else {
      const exists = await access(path.join(publicDir, imagePath.slice(1))).then(() => true, () => false);
      if (!exists) problems.push(`I-7 ảnh không tồn tại trong public/: ${imagePath}`);
    }
  }
  return problems;
}

// I-3/I-4 theo cả hai chiều cho bản ghi sắp ghi.
async function registryValidation(tx: Transaction, record: ContentRecord): Promise<Validation> {
  const result: Validation = { problems: [], warnings: [] };
  if (record.collection === "solution" || record.collection === "product") {
    const registry = await findLiveEntry(tx, "slug_registry", record.locale, record.slug);
    const problem = registryProblem(record, registry ? (registry.data as Record<string, unknown>).group : undefined);
    if (problem) result.problems.push(problem);
  }
  if (record.collection === "slug_registry") {
    const target = registryTargetCollection(record.data.group);
    const content = target ? await findLiveEntry(tx, target, record.locale, record.slug) : undefined;
    const problem = content ? registryProblem(toRecord(content), record.data.group) : null;
    if (problem) result.problems.push(problem);
    if (target && !content) result.warnings.push(`I-3 registry chưa có bản ghi ${target}/${record.locale}/${record.slug} — tạo tiếp để URL không 404`);
  }
  return result;
}

// I-1: cảnh báo (không chặn) khi locale kia chưa có bản còn sống — bot tạo vi rồi en tuần tự.
async function localePairWarnings(tx: Transaction, record: ContentRecord): Promise<string[]> {
  // Asset là 1 bản ghi / ảnh (locale cố định, alt vi/en trong data) → không có cặp vi/en.
  if (record.collection === "asset") return [];
  const others = await tx
    .select({ locale: contentEntries.locale })
    .from(contentEntries)
    .where(
      and(
        eq(contentEntries.collection, record.collection),
        eq(contentEntries.slug, record.slug),
        ne(contentEntries.locale, record.locale as ContentEntry["locale"]),
        isNull(contentEntries.deletedAt),
      ),
    );
  return others.length > 0 ? [] : [`I-1 ${record.collection}/${record.slug} chưa có bản ngôn ngữ còn lại — tạo cặp vi/en`];
}

async function validateRecord(tx: Transaction, record: ContentRecord, publicDir: string | undefined): Promise<Validation> {
  if (!isPlainObject(record.data)) return { problems: ["data phải là object JSON"], warnings: [] };
  const problems = checkRecord(record);
  // Collection/locale sai thì các bước sau vô nghĩa (và truy vấn locale sai sẽ vi phạm CHECK).
  if (problems.some((problem) => problem.startsWith("I-6 collection") || problem.startsWith("I-6 locale"))) {
    return { problems, warnings: [] };
  }
  const registry = await registryValidation(tx, record);
  problems.push(...registry.problems, ...(await imageProblems(tx, record, publicDir ?? path.join(process.cwd(), "public"))));
  return { problems, warnings: [...registry.warnings, ...(await localePairWarnings(tx, record))] };
}

async function lockEntry(tx: Transaction, id: number, expectedVersion: number): Promise<ContentEntry> {
  const [entry] = await tx.select().from(contentEntries).where(eq(contentEntries.id, id)).for("update");
  if (!entry) throw new ContentNotFoundError(`entry ${id}`);
  if (entry.version !== expectedVersion) throw new ContentConflictError(id, expectedVersion, entry.version);
  return entry;
}

async function insertVersion(tx: Transaction, entry: ContentEntry, op: ContentVersionOp, options: WriteOptions): Promise<void> {
  await tx.insert(contentVersions).values({
    entryId: entry.id,
    version: entry.version,
    op,
    data: entry.data,
    body: entry.body,
    sortOrder: entry.sortOrder,
    actor: options.actor,
    note: options.note ?? null,
  });
}

interface EntryChange {
  data: Record<string, unknown>;
  body: string | null;
  sortOrder: number | null;
  deletedAt: Date | SQL | null;
}

// UPDATE entry (version + 1) rồi INSERT dòng lịch sử — thứ tự này để lỗi khi ghi lịch sử kéo huỷ cả UPDATE.
async function writeNextVersion(
  tx: Transaction,
  current: ContentEntry,
  change: EntryChange,
  op: ContentVersionOp,
  options: WriteOptions,
): Promise<ContentEntry> {
  const [updated] = await tx
    .update(contentEntries)
    .set({ ...change, version: current.version + 1, updatedAt: sql`now()`, updatedBy: options.actor })
    .where(eq(contentEntries.id, current.id))
    .returning();
  await insertVersion(tx, updated, op, options);
  return updated;
}

function throwIfInvalid(validation: Validation): void {
  if (validation.problems.length > 0) throw new ContentValidationError(validation.problems);
}

export async function createEntry(db: Database, input: CreateEntryInput): Promise<WriteResult> {
  return db.transaction(async (tx) => {
    const record: ContentRecord = {
      collection: input.collection,
      slug: input.slug,
      locale: input.locale,
      data: input.data,
      body: input.body ?? null,
      sortOrder: input.sortOrder ?? null,
    };
    const validation = await validateRecord(tx, record, input.publicDir);
    throwIfInvalid(validation);
    // I-5: khoá (collection, slug, locale) là UNIQUE kể cả hàng đã xoá mềm → báo rõ thay vì lỗi constraint.
    const [existing] = await tx
      .select({ id: contentEntries.id, deletedAt: contentEntries.deletedAt })
      .from(contentEntries)
      .where(and(eq(contentEntries.collection, record.collection), eq(contentEntries.slug, record.slug), eq(contentEntries.locale, record.locale as ContentEntry["locale"])));
    if (existing) {
      const hint = existing.deletedAt ? " (đã xoá mềm — dùng rollback để khôi phục)" : "";
      throw new ContentValidationError([`I-5 ${entryKey(record)} đã tồn tại: entry ${existing.id}${hint}`]);
    }
    const [entry] = await tx
      .insert(contentEntries)
      .values({ ...record, locale: record.locale as ContentEntry["locale"], version: 1, updatedBy: input.actor })
      .returning();
    await insertVersion(tx, entry, "create", input);
    return { entry, warnings: validation.warnings };
  });
}

// Không đổi khoá (collection/slug/locale): đổi slug = tạo bản ghi mới + softDeleteEntry bản cũ (I-8, decisions.md).
export async function updateEntry(db: Database, input: UpdateEntryInput): Promise<WriteResult> {
  return db.transaction(async (tx) => {
    const current = await lockEntry(tx, input.id, input.expectedVersion);
    if (current.deletedAt) throw new ContentValidationError([`entry ${current.id} đã xoá mềm — dùng rollback để khôi phục trước khi sửa`]);
    const change: EntryChange = {
      data: input.data,
      body: input.body === undefined ? current.body : input.body,
      sortOrder: input.sortOrder === undefined ? current.sortOrder : input.sortOrder,
      deletedAt: null,
    };
    const validation = await validateRecord(tx, { ...toRecord(current), ...change }, input.publicDir);
    throwIfInvalid(validation);
    return { entry: await writeNextVersion(tx, current, change, "update", input), warnings: validation.warnings };
  });
}

async function deleteValidation(tx: Transaction, current: ContentEntry, input: SoftDeleteEntryInput): Promise<Validation> {
  const record = toRecord(current);
  const result: Validation = { problems: [], warnings: [] };
  if (isPublicUrlCollection(record.collection)) {
    if (input.confirmPublicUrlChange) {
      result.warnings.push(`I-8 URL của ${entryKey(record)} sẽ 404 — thêm redirect 301 trong next.config.ts rồi deploy`);
    } else {
      result.problems.push(`I-8 ${entryKey(record)} có URL công khai — cần cờ xác nhận (confirmPublicUrlChange) + redirect 301`);
    }
  }
  const target = record.collection === "slug_registry" ? registryTargetCollection(record.data.group) : null;
  if (target && (await findLiveEntry(tx, target, record.locale, record.slug))) {
    result.problems.push(`I-3 ${target}/${record.locale}/${record.slug} còn sống — xoá bản ghi nội dung trước khi xoá registry`);
  }
  if (record.collection === "solution" || record.collection === "product") {
    result.warnings.push(`I-3 slug_registry/${record.locale}/${record.slug} vẫn còn — xoá tiếp để menu không trỏ tới trang 404`);
  }
  return result;
}

export async function softDeleteEntry(db: Database, input: SoftDeleteEntryInput): Promise<WriteResult> {
  return db.transaction(async (tx) => {
    const current = await lockEntry(tx, input.id, input.expectedVersion);
    if (current.deletedAt) throw new ContentValidationError([`entry ${current.id} đã xoá mềm`]);
    const validation = await deleteValidation(tx, current, input);
    throwIfInvalid(validation);
    const change: EntryChange = { data: current.data as Record<string, unknown>, body: current.body, sortOrder: current.sortOrder, deletedAt: sql`now()` };
    return { entry: await writeNextVersion(tx, current, change, "delete", input), warnings: validation.warnings };
  });
}

// Rollback = ghi snapshot (data/body/sort_order) của version cũ thành version MỚI op 'rollback' — lịch sử không bị sửa/xoá.
// Entry đang xoá mềm → rollback khôi phục luôn (deleted_at = NULL): kết quả rollback luôn là bản ghi còn sống (decisions.md).
export async function rollbackEntry(db: Database, input: RollbackEntryInput): Promise<WriteResult> {
  return db.transaction(async (tx) => {
    const current = await lockEntry(tx, input.id, input.expectedVersion);
    if (!Number.isInteger(input.toVersion) || input.toVersion < 1 || input.toVersion >= current.version) {
      throw new ContentValidationError([`toVersion phải trong 1..${current.version - 1}`]);
    }
    const [snapshot] = await tx
      .select()
      .from(contentVersions)
      .where(and(eq(contentVersions.entryId, current.id), eq(contentVersions.version, input.toVersion)));
    if (!snapshot) throw new ContentNotFoundError(`version ${input.toVersion} của entry ${current.id}`);
    const change: EntryChange = {
      data: snapshot.data as Record<string, unknown>,
      body: snapshot.body,
      sortOrder: snapshot.sortOrder,
      deletedAt: null,
    };
    const validation = await validateRecord(tx, { ...toRecord(current), ...change }, input.publicDir);
    throwIfInvalid(validation);
    if (current.deletedAt) validation.warnings.push(`entry ${current.id} đang xoá mềm → được khôi phục`);
    const options: WriteOptions = { ...input, note: input.note ?? `rollback về v${input.toVersion}` };
    return { entry: await writeNextVersion(tx, current, change, "rollback", options), warnings: validation.warnings };
  });
}

export async function listVersions(db: Database, entryId: number): Promise<ContentVersion[]> {
  return db.select().from(contentVersions).where(eq(contentVersions.entryId, entryId)).orderBy(asc(contentVersions.version));
}

// Đọc mặc định bỏ hàng đã xoá mềm (giống web); includeDeleted cho CLI/bảo trì.
export async function getEntry(db: Database, id: number, options: { includeDeleted?: boolean } = {}): Promise<ContentEntry | undefined> {
  const [row] = await db
    .select()
    .from(contentEntries)
    .where(and(eq(contentEntries.id, id), options.includeDeleted ? undefined : isNull(contentEntries.deletedAt)));
  return row;
}

export interface ListEntriesFilter {
  collection?: string;
  locale?: string;
  includeDeleted?: boolean;
}

export async function listEntries(db: Database, filter: ListEntriesFilter = {}): Promise<ContentEntry[]> {
  return db
    .select()
    .from(contentEntries)
    .where(
      and(
        filter.collection ? eq(contentEntries.collection, filter.collection) : undefined,
        filter.locale ? eq(contentEntries.locale, filter.locale as ContentEntry["locale"]) : undefined,
        filter.includeDeleted ? undefined : isNull(contentEntries.deletedAt),
      ),
    )
    .orderBy(asc(contentEntries.collection), asc(contentEntries.locale), asc(contentEntries.sortOrder), asc(contentEntries.slug));
}

export interface EntryKey {
  collection: string;
  locale: string;
  slug: string;
}

export async function getEntryByKey(db: Database, key: EntryKey, options: { includeDeleted?: boolean } = {}): Promise<ContentEntry | undefined> {
  const [row] = await db
    .select()
    .from(contentEntries)
    .where(
      and(
        eq(contentEntries.collection, key.collection),
        eq(contentEntries.locale, key.locale as ContentEntry["locale"]),
        eq(contentEntries.slug, key.slug),
        options.includeDeleted ? undefined : isNull(contentEntries.deletedAt),
      ),
    );
  return row;
}
