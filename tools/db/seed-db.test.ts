// Test cần PostgreSQL: chỉ chạy khi có TEST_DATABASE_URL (DB local/test, không phải prod) — không có thì skip.
import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as schema from "../../src/db/schema";
import { readFileSource } from "./file-source";
import { checkInvariants, compareRecords } from "./parity-check";
import { importRecords, isProductionDatabaseUrl, readDatabaseRecords } from "./seed-db";

const connectionString = process.env.TEST_DATABASE_URL;
const skip = !connectionString
  ? "TEST_DATABASE_URL chưa đặt — bỏ qua test import/parity cần DB"
  : isProductionDatabaseUrl(connectionString)
    ? "TEST_DATABASE_URL trỏ DB prod — từ chối chạy"
    : false;

test("import seed is idempotent and parity passes", { skip }, async () => {
  const pool = new Pool({ connectionString });
  try {
    const db = drizzle(pool, { schema });
    await migrate(db, { migrationsFolder: path.resolve("drizzle") });
    const records = await readFileSource();

    await importRecords(db, records);
    const afterFirst = await readDatabaseRecords(db);
    assert.deepEqual(compareRecords(records, afterFirst), []);
    assert.deepEqual(checkInvariants(afterFirst), []);

    const second = await importRecords(db, records);
    assert.equal(second.inserted.length, 0);
    assert.equal(second.skipped.length, records.length);
    assert.deepEqual(compareRecords(records, await readDatabaseRecords(db)), []);

    const versions = await pool.query<{ count: string }>(
      "select count(*) from content_versions v join content_entries e on e.id = v.entry_id where v.actor = 'seed' and v.op = 'create' and v.version = 1 and v.sort_order is not distinct from e.sort_order",
    );
    // Mỗi bản ghi seed đúng 1 dòng version 1 (import lần 2 không ghi thêm), snapshot sort_order khớp entry (MINOR-1).
    assert.equal(Number(versions.rows[0].count), records.length);
  } finally {
    await pool.end();
  }
});
