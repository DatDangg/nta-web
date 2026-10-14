// CLI bảo trì nội dung DB (CR-031 P2-T02) — dùng chung write-path với bot CR-030 (src/db/content-repo.ts).
//   npm run db:cli -- list [--collection post] [--locale vi] [--deleted]
//   npm run db:cli -- show <id | collection/locale/slug>
//   npm run db:cli -- history <id | collection/locale/slug>
//   npm run db:cli -- rollback <id | collection/locale/slug> --to <N> --expected-version <M> [--note "..."] [--confirm-prod]
// `show`/`history` tìm cả bản ghi đã xoá mềm. Lệnh ghi (rollback) trên DB prod cần --confirm-prod (giống import-seed).
// (Lệnh revalidate thêm ở P3-T03.) Không in DATABASE_URL ra log.
import { userInfo } from "node:os";
import { parseArgs } from "node:util";
import { closeDb, getDb, type Database } from "../../src/db/client";
import {
  ContentConflictError,
  ContentNotFoundError,
  ContentValidationError,
  getEntry,
  getEntryByKey,
  listEntries,
  listVersions,
  rollbackEntry,
} from "../../src/db/content-repo";
import type { ContentEntry } from "../../src/db/schema";
import { isProductionDatabaseUrl } from "./seed-db";

const USAGE = "dùng: db:cli -- list|show|history|rollback ... (xem đầu file tools/db/content-cli.ts / docs/runbook/db.md §9)";

const OPTIONS = {
  collection: { type: "string" },
  locale: { type: "string" },
  deleted: { type: "boolean" },
  to: { type: "string" },
  "expected-version": { type: "string" },
  note: { type: "string" },
  "confirm-prod": { type: "boolean" },
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
  for (const warning of result.warnings) console.warn(`[cảnh báo] ${warning}`);
  console.log(`[rollback] OK — ${formatEntryLine(result.entry)}`);
}

async function runCommand(command: string | undefined, args: string[], values: CliValues): Promise<number> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    return 2;
  }
  if (command === "rollback" && isProductionDatabaseUrl(connectionString) && !values["confirm-prod"]) {
    console.error("[cli] từ chối: DATABASE_URL trỏ DB prod — lệnh ghi cần cờ --confirm-prod (backup trước, xem runbook §9)");
    return 2;
  }
  const db = getDb();
  try {
    if (command === "list") await runList(db, values);
    else if (command === "show") console.log(JSON.stringify(await resolveEntry(db, args[0]), null, 2));
    else if (command === "history") await runHistory(db, args[0]);
    else if (command === "rollback") await runRollback(db, args[0], values);
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
    if (error instanceof ContentConflictError || error instanceof ContentValidationError || error instanceof ContentNotFoundError) {
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
