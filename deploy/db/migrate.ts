// CLI chạy trong container `nta-migrate` (Dockerfile stage `migrator`, compose profile `tools`).
//   check   → chỉ chạy gate destructive trên migration chưa apply (exit 1 nếu bị chặn)
//   migrate → chạy lại gate rồi apply migration bằng drizzle-orm migrator (cùng bảng drizzle.__drizzle_migrations
//             với `npm run db:migrate` / drizzle-kit migrate)
// Không in DATABASE_URL ra log.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { checkMigrationSql, selectPendingMigrations, type JournalEntry } from "./migration-gate";

const MIGRATIONS_FOLDER = path.resolve(process.env.MIGRATIONS_FOLDER ?? "drizzle");

async function readJournal(): Promise<JournalEntry[]> {
  const raw = await readFile(path.join(MIGRATIONS_FOLDER, "meta", "_journal.json"), "utf8");
  const journal = JSON.parse(raw) as { entries: JournalEntry[] };
  return journal.entries;
}

async function readLastAppliedMillis(pool: Pool): Promise<number | null> {
  const exists = await pool.query<{ table: string | null }>(
    "select to_regclass('drizzle.__drizzle_migrations')::text as table",
  );
  if (!exists.rows[0]?.table) return null;
  const last = await pool.query<{ created_at: string | null }>(
    "select created_at from drizzle.__drizzle_migrations order by created_at desc limit 1",
  );
  const value = last.rows[0]?.created_at;
  return value === undefined || value === null ? null : Number(value);
}

// Trả về true nếu mọi migration chưa apply đều qua gate.
async function runGate(pool: Pool): Promise<boolean> {
  const pending = selectPendingMigrations(await readJournal(), await readLastAppliedMillis(pool));
  if (pending.length === 0) {
    console.log("[gate] không có migration chờ apply");
    return true;
  }
  let allowed = true;
  for (const entry of pending) {
    const sql = await readFile(path.join(MIGRATIONS_FOLDER, `${entry.tag}.sql`), "utf8");
    const result = checkMigrationSql(sql);
    const status = result.blocked ? "BLOCKED" : result.findings.length > 0 ? "APPROVED (HIGH_RISK_MIGRATION)" : "OK";
    console.log(`[gate] ${entry.tag}.sql → ${status}`);
    for (const finding of result.findings) {
      console.log(`[gate]   #${finding.statementIndex} ${finding.rule}: ${finding.statement}`);
    }
    if (result.blocked) allowed = false;
  }
  if (!allowed) {
    console.error(
      "[gate] FAIL — migration phá hoại thiếu dòng duyệt '-- HIGH_RISK_MIGRATION: approved YYYY-MM-DD by <user>'. Xem docs/runbook/db.md §6.",
    );
  }
  return allowed;
}

async function main(): Promise<number> {
  const mode = process.argv[2];
  if (mode !== "check" && mode !== "migrate") {
    console.error("usage: migrate.ts check|migrate");
    return 2;
  }
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    return 2;
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    if (!(await runGate(pool))) return 1;
    if (mode === "check") return 0;
    await migrate(drizzle(pool), { migrationsFolder: MIGRATIONS_FOLDER });
    console.log("[migrate] OK — đã apply mọi migration chờ");
    return 0;
  } finally {
    await pool.end();
  }
}

main().then(
  (code) => process.exit(code),
  (error: unknown) => {
    console.error("[migrate] FAIL", error instanceof Error ? error.message : error);
    process.exit(1);
  },
);
