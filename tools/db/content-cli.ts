// CLI bảo trì nội dung DB (CR-031 P2-T02) — dùng chung write-path với bot CR-030 (src/db/content-repo.ts).
//   npm run db:cli -- list [--collection post] [--locale vi] [--deleted]
//   npm run db:cli -- show <id | collection/locale/slug>
//   npm run db:cli -- history <id | collection/locale/slug>
//   npm run db:cli -- rollback <id | collection/locale/slug> --to <N> --expected-version <M> [--note "..."] [--confirm-prod]
// `show`/`history` tìm cả bản ghi đã xoá mềm. Lệnh ghi (rollback, upload) trên DB prod cần --confirm-prod (giống import-seed).
//   npm run db:cli -- revalidate --collection post [--slug x] | --all   (P3-T03: gọi POST /api/revalidate, không cần DATABASE_URL)
//   npm run db:cli -- upload <file> [--alt-vi "..."] [--alt-en "..."] [--confirm-prod]   (P3-T05: lưu ảnh vào UPLOAD_DIR + bản ghi asset)
//     URL endpoint từ REVALIDATE_URL (vd http://127.0.0.1:3005/api/revalidate), secret từ REVALIDATE_SECRET.
//   npm run db:cli -- publish-post <slug> [--dry-run] [--actor workflow:ai-news] [--note "..."] [--confirm-prod]   (CR-034)
//     Đăng src/content/blog/{vi,en}/<slug>.mdx vào DB — CHỈ chèn; bản đã có (kể cả xoá mềm) → exists. Mỗi locale in 1 dòng
//     "publish-post post/<locale>/<slug> status=missing|exists|created" (workflow ai-news grep status=missing để quyết định backup).
//   npm run db:cli -- create <collection/locale/slug> --file <path|-> [--actor <a>] [--note "..."] [--confirm-prod]   (CR-030)
//   npm run db:cli -- update <id | collection/locale/slug> --file <path|-> --expected-version <N> [--actor] [--note] [--confirm-prod]
//   npm run db:cli -- delete <id | collection/locale/slug> --expected-version <N> [--confirm-public-url-change] [--actor] [--note] [--confirm-prod]
//     --file (`-` = stdin) là JSON { "data": {...}, "body"?: string|null, "sortOrder"?: number|null }; update thiếu body/sortOrder = giữ nguyên.
//     Ghi qua content-repo (luật I-x, optimistic lock). KHÔNG tự revalidate — người gọi (bot Telegram) chạy `revalidate` sau khi ghi.
// Không in DATABASE_URL / REVALIDATE_SECRET ra log.
import { readFile } from "node:fs/promises";
import { userInfo } from "node:os";
import { parseArgs } from "node:util";
import { closeDb, getDb, type Database } from "../../src/db/client";
import {
  ContentConflictError,
  ContentNotFoundError,
  ContentValidationError,
  createEntry,
  getEntry,
  getEntryByKey,
  listEntries,
  listVersions,
  rollbackEntry,
  softDeleteEntry,
  updateEntry,
  type WriteResult,
} from "../../src/db/content-repo";
import type { ContentEntry } from "../../src/db/schema";
import { ImageRejectedError } from "../../src/lib/uploads/image-file";
import { saveImage } from "../../src/lib/uploads/save-image";
import { PUBLISH_POST_ACTOR, defaultPublishNote, publishPost } from "./publish-post";
import { isProductionDatabaseUrl } from "./seed-db";

const USAGE = "dùng: db:cli -- list|show|history|rollback|create|update|delete|upload|revalidate|publish-post ... (xem đầu file tools/db/content-cli.ts / docs/runbook/db.md §9)";

const OPTIONS = {
  collection: { type: "string" },
  locale: { type: "string" },
  deleted: { type: "boolean" },
  to: { type: "string" },
  "expected-version": { type: "string" },
  note: { type: "string" },
  "confirm-prod": { type: "boolean" },
  slug: { type: "string" },
  all: { type: "boolean" },
  "alt-vi": { type: "string" },
  "alt-en": { type: "string" },
  "dry-run": { type: "boolean" },
  actor: { type: "string" },
  file: { type: "string" },
  "confirm-public-url-change": { type: "boolean" },
} as const;

type CliValues = ReturnType<typeof parseArgs<{ options: typeof OPTIONS; allowPositionals: true }>>["values"];

function parsePositiveInteger(value: string | undefined, flag: string): number {
  const parsed = Number(value);
  if (value === undefined || !Number.isInteger(parsed) || parsed < 1) throw new UsageError(`${flag} phải là số nguyên ≥ 1`);
  return parsed;
}

class UsageError extends Error {}

async function resolveEntry(db: Database, target: string | undefined): Promise<ContentEntry> {
  if (!target) throw new UsageError("thiếu <id | collection/locale/slug>");
  const parts = target.split("/");
  const entry = /^\d+$/.test(target)
    ? await getEntry(db, Number(target), { includeDeleted: true })
    : parts.length === 3
      ? await getEntryByKey(db, { collection: parts[0], locale: parts[1], slug: parts[2] }, { includeDeleted: true })
      : undefined;
  if (!entry) throw new ContentNotFoundError(target);
  return entry;
}

// update/delete chỉ nhắm bản ghi đang sống; khôi phục bản đã xoá mềm đi qua rollback.
async function resolveLiveEntry(db: Database, target: string | undefined): Promise<ContentEntry> {
  const entry = await resolveEntry(db, target);
  if (entry.deletedAt) throw new ContentValidationError([`${target} đã xoá mềm — dùng rollback để khôi phục`]);
  return entry;
}

interface EntryPayload {
  data: Record<string, unknown>;
  body?: string | null;
  sortOrder?: number | null;
}

const PAYLOAD_KEYS = ["data", "body", "sortOrder"];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

// Đọc + kiểm hình dạng --file TRƯỚC khi chạm DB; sai → UsageError (exit 2). Luật nội dung do content-repo kiểm.
async function readPayload(file: string | undefined, command: string): Promise<EntryPayload> {
  if (!file) throw new UsageError(`${command} cần --file <path|->`);
  let text: string;
  try {
    text = file === "-" ? await readStdin() : await readFile(file, "utf8");
  } catch (error) {
    throw new UsageError(`không đọc được --file ${file}: ${error instanceof Error ? error.message : String(error)}`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new UsageError(`--file ${file}: JSON không hợp lệ — ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!isPlainObject(parsed)) throw new UsageError("--file phải là object JSON { data, body?, sortOrder? }");
  const unknownKeys = Object.keys(parsed).filter((key) => !PAYLOAD_KEYS.includes(key));
  if (unknownKeys.length > 0) throw new UsageError(`--file có key lạ: ${unknownKeys.join(", ")} (chỉ nhận ${PAYLOAD_KEYS.join(", ")})`);
  const { data, body, sortOrder } = parsed;
  if (!isPlainObject(data)) throw new UsageError("--file: data bắt buộc là object JSON");
  if (body !== undefined && body !== null && typeof body !== "string") throw new UsageError("--file: body phải là string hoặc null");
  if (sortOrder !== undefined && sortOrder !== null && !Number.isInteger(sortOrder)) throw new UsageError("--file: sortOrder phải là số nguyên hoặc null");
  return { data, body: body as string | null | undefined, sortOrder: sortOrder as number | null | undefined };
}

function writeOptions(values: CliValues): { actor: string; note?: string } {
  return { actor: values.actor ?? `cli:${userInfo().username}`, note: values.note };
}

function printWriteResult(command: string, result: WriteResult): void {
  for (const warning of result.warnings) console.warn(`[cảnh báo] ${warning}`);
  console.log(`[${command}] OK — ${formatEntryLine(result.entry)}`);
}

async function runCreate(db: Database, target: string | undefined, values: CliValues): Promise<void> {
  const parts = target?.split("/") ?? [];
  if (parts.length !== 3 || parts.includes("")) throw new UsageError("create cần <collection/locale/slug>");
  const payload = await readPayload(values.file, "create");
  const [collection, locale, slug] = parts;
  printWriteResult("create", await createEntry(db, { collection, locale, slug, ...payload, ...writeOptions(values) }));
}

async function runUpdate(db: Database, target: string | undefined, values: CliValues): Promise<void> {
  const expectedVersion = parsePositiveInteger(values["expected-version"], "--expected-version");
  const payload = await readPayload(values.file, "update");
  const entry = await resolveLiveEntry(db, target);
  printWriteResult("update", await updateEntry(db, { id: entry.id, expectedVersion, ...payload, ...writeOptions(values) }));
}

async function runDelete(db: Database, target: string | undefined, values: CliValues): Promise<void> {
  const expectedVersion = parsePositiveInteger(values["expected-version"], "--expected-version");
  const entry = await resolveLiveEntry(db, target);
  const confirmPublicUrlChange = values["confirm-public-url-change"] === true;
  printWriteResult("delete", await softDeleteEntry(db, { id: entry.id, expectedVersion, confirmPublicUrlChange, ...writeOptions(values) }));
}

function formatEntryLine(entry: ContentEntry): string {
  const deleted = entry.deletedAt ? "  [đã xoá]" : "";
  return `${String(entry.id).padStart(5)}  ${entry.collection}/${entry.locale}/${entry.slug}  v${entry.version}${deleted}`;
}

async function runList(db: Database, values: CliValues): Promise<void> {
  const entries = await listEntries(db, { collection: values.collection, locale: values.locale, includeDeleted: values.deleted });
  for (const entry of entries) console.log(formatEntryLine(entry));
  console.log(`${entries.length} bản ghi`);
}

async function runHistory(db: Database, target: string | undefined): Promise<void> {
  const entry = await resolveEntry(db, target);
  console.log(formatEntryLine(entry));
  for (const version of await listVersions(db, entry.id)) {
    const note = version.note ? `  — ${version.note}` : "";
    console.log(`  v${version.version}  ${version.op.padEnd(8)} ${version.actor}  ${version.createdAt.toISOString()}  sort_order=${version.sortOrder ?? "null"}${note}`);
  }
}

async function runRollback(db: Database, target: string | undefined, values: CliValues): Promise<void> {
  const entry = await resolveEntry(db, target);
  const result = await rollbackEntry(db, {
    id: entry.id,
    toVersion: parsePositiveInteger(values.to, "--to"),
    expectedVersion: parsePositiveInteger(values["expected-version"], "--expected-version"),
    actor: `cli:${userInfo().username}`,
    note: values.note,
  });
  printWriteResult("rollback", result);
}

// Ảnh mới chỉ hiện trên web khi nội dung trỏ tới /uploads/<hash>.<ext> → in path để dán vào bản ghi nội dung.
async function runUpload(db: Database, file: string | undefined, values: CliValues): Promise<void> {
  if (!file) throw new UsageError("thiếu <file>");
  const result = await saveImage(db, {
    bytes: await readFile(file),
    originalName: file,
    alt: { vi: values["alt-vi"], en: values["alt-en"] },
    actor: `cli:${userInfo().username}`,
  });
  const { image } = result;
  const fileNote = image.written ? "file mới" : "file đã có";
  console.log(`[upload] OK (${result.status}, ${fileNote}) — ${image.urlPath}  ${image.mime} ${image.width}x${image.height} ${image.bytes}B  ${formatEntryLine(result.asset)}`);
}

async function runPublishPost(db: Database, slug: string | undefined, values: CliValues): Promise<void> {
  if (!slug) throw new UsageError("thiếu <slug>");
  const results = await publishPost(db, {
    slug,
    dryRun: values["dry-run"] === true,
    actor: values.actor ?? PUBLISH_POST_ACTOR,
    note: values.note ?? defaultPublishNote(slug, process.env.GITHUB_RUN_ID),
  });
  for (const result of results) {
    for (const warning of result.warnings) console.warn(`[cảnh báo] ${result.key}: ${warning}`);
    console.log(`publish-post ${result.key} status=${result.status}`);
  }
}

function revalidateBody(values: CliValues): { all: true } | { collection: string; slug?: string } {
  if (values.all) {
    if (values.collection !== undefined || values.slug !== undefined) throw new UsageError("--all không đi kèm --collection/--slug");
    return { all: true };
  }
  if (!values.collection) throw new UsageError("revalidate cần --collection <c> [--slug <s>] hoặc --all");
  return values.slug === undefined ? { collection: values.collection } : { collection: values.collection, slug: values.slug };
}

// Gọi endpoint thay vì revalidateTag trực tiếp: cache nằm trong process Next đang chạy, CLI là process khác.
async function runRevalidate(values: CliValues): Promise<number> {
  const body = revalidateBody(values);
  const url = process.env.REVALIDATE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!url || !secret) {
    console.error("REVALIDATE_URL và REVALIDATE_SECRET phải được đặt (đặt secret bằng read -rs, không gõ trên dòng lệnh)");
    return 2;
  }
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", "x-revalidate-secret": secret },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    console.error(`[revalidate] FAIL — HTTP ${response.status} ${text}`);
    return 1;
  }
  console.log(`[revalidate] OK — ${text}`);
  return 0;
}

// Cờ chỉ có nghĩa ở vài lệnh. parseArgs khai báo chung → lệnh khác sẽ lặng lẽ bỏ qua; với cờ như --dry-run thì
// `rollback … --dry-run` vẫn GHI thật → từ chối ngay thay vì lờ đi.
const COMMAND_SCOPED_FLAGS: Partial<Record<keyof CliValues, readonly string[]>> = {
  "dry-run": ["publish-post"],
  actor: ["create", "update", "delete", "publish-post"],
  note: ["rollback", "create", "update", "delete", "publish-post"],
  "expected-version": ["rollback", "update", "delete"],
  to: ["rollback"],
  file: ["create", "update"],
  "confirm-public-url-change": ["delete"],
};

function assertFlagsSupported(command: string | undefined, values: CliValues): void {
  for (const [flag, commands] of Object.entries(COMMAND_SCOPED_FLAGS)) {
    if (values[flag as keyof CliValues] !== undefined && !commands.includes(command ?? "")) {
      throw new UsageError(`--${flag} chỉ dùng với: ${commands.join(", ")}`);
    }
  }
  if (values.actor !== undefined && values.actor.trim() === "") throw new UsageError("--actor không được rỗng");
}

async function runCommand(command: string | undefined, args: string[], values: CliValues): Promise<number> {
  assertFlagsSupported(command, values);
  if (command === "revalidate") return runRevalidate(values);
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    return 2;
  }
  const isWriteCommand =
    ["rollback", "create", "update", "delete", "upload"].includes(command ?? "") || (command === "publish-post" && !values["dry-run"]);
  if (isWriteCommand && isProductionDatabaseUrl(connectionString) && !values["confirm-prod"]) {
    console.error("[cli] từ chối: DATABASE_URL trỏ DB prod — lệnh ghi cần cờ --confirm-prod (backup trước, xem runbook §9)");
    return 2;
  }
  const db = getDb();
  try {
    if (command === "list") await runList(db, values);
    else if (command === "show") console.log(JSON.stringify(await resolveEntry(db, args[0]), null, 2));
    else if (command === "history") await runHistory(db, args[0]);
    else if (command === "rollback") await runRollback(db, args[0], values);
    else if (command === "create") await runCreate(db, args[0], values);
    else if (command === "update") await runUpdate(db, args[0], values);
    else if (command === "delete") await runDelete(db, args[0], values);
    else if (command === "upload") await runUpload(db, args[0], values);
    else if (command === "publish-post") await runPublishPost(db, args[0], values);
    else throw new UsageError(`lệnh không hợp lệ: ${command ?? "(trống)"}`);
    return 0;
  } finally {
    await closeDb();
  }
}

async function main(): Promise<number> {
  try {
    const { values, positionals } = parseArgs({ options: OPTIONS, allowPositionals: true, strict: true });
    const [command, ...args] = positionals;
    return await runCommand(command, args, values);
  } catch (error) {
    if (error instanceof UsageError || (error instanceof TypeError && "code" in error)) {
      console.error(`${error.message}\n${USAGE}`);
      return 2;
    }
    if (error instanceof ContentConflictError || error instanceof ContentValidationError || error instanceof ContentNotFoundError || error instanceof ImageRejectedError) {
      console.error(`[cli] FAIL — ${error.message}`);
      return 1;
    }
    throw error;
  }
}

main().then(
  (code) => process.exit(code),
  (error: unknown) => {
    console.error("[cli] FAIL", error instanceof Error ? error.message : error);
    process.exit(1);
  },
);
