// Test write-path cần PostgreSQL: chỉ chạy khi có TEST_DATABASE_URL (DB local/test, không phải prod) — không có thì skip.
// Nằm ở tools/db (không phải src/db) vì import tools/db/* — tools/ bị .dockerignore loại, test trong src/ sẽ làm next build lỗi type.
// Tạo database riêng nta_repo_test_* (xoá khi xong) để không đụng DB mà seed-db.test dùng song song.
import assert from "node:assert/strict";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { readFileSource } from "./file-source";
import { importRecords, isProductionDatabaseUrl } from "./seed-db";
import type { Database } from "../../src/db/client";
import {
  ContentConflictError,
  ContentValidationError,
  createEntry,
  getEntry,
  getEntryByKey,
  listEntries,
  listVersions,
  rollbackEntry,
  softDeleteEntry,
  updateEntry,
} from "../../src/db/content-repo";
import * as schema from "../../src/db/schema";

const baseUrl = process.env.TEST_DATABASE_URL;
const skip = !baseUrl
  ? "TEST_DATABASE_URL chưa đặt — bỏ qua test write-path cần DB"
  : isProductionDatabaseUrl(baseUrl)
    ? "TEST_DATABASE_URL trỏ DB prod — từ chối chạy"
    : false;

const actor = "test:repo";
const databaseName = `nta_repo_test_${process.pid}_${Date.now()}`;
let adminPool: Pool | undefined;
let pool: Pool | undefined;
let db: Database;

async function entryOf(collection: string, locale: string, slug: string) {
  const entry = await getEntryByKey(db, { collection, locale, slug });
  assert.ok(entry, `${collection}/${locale}/${slug}`);
  return entry;
}

async function firstLive(collection: string, locale: string, index = 0) {
  const entry = (await listEntries(db, { collection, locale }))[index];
  assert.ok(entry, `${collection}/${locale}[${index}]`);
  return entry;
}

async function rejectsWith(promise: Promise<unknown>, pattern: RegExp): Promise<void> {
  await assert.rejects(promise, (error: unknown) => {
    assert.ok(error instanceof ContentValidationError, String(error));
    assert.match(error.message, pattern);
    return true;
  });
}

describe("content-repo (Postgres)", { skip }, () => {
  before(async () => {
    adminPool = new Pool({ connectionString: baseUrl });
    await adminPool.query(`create database ${databaseName}`);
    const url = new URL(String(baseUrl));
    url.pathname = `/${databaseName}`;
    pool = new Pool({ connectionString: url.toString() });
    db = drizzle(pool, { schema });
    await migrate(db, { migrationsFolder: path.resolve("drizzle") });
    await importRecords(db, await readFileSource());
  });

  after(async () => {
    await pool?.end();
    await adminPool?.query(`drop database if exists ${databaseName} with (force)`);
    await adminPool?.end();
  });

  it("update: version tăng, dòng lịch sử cùng nội dung + actor/note/sort_order", async () => {
    const item = await firstLive("listing_item", "vi");
    const data = { ...(item.data as Record<string, unknown>), title: "Tiêu đề mới" };
    const { entry } = await updateEntry(db, { id: item.id, expectedVersion: 1, data, sortOrder: 99, actor, note: "sửa thử" });
    assert.equal(entry.version, 2);
    assert.equal(entry.updatedBy, actor);
    const versions = await listVersions(db, item.id);
    assert.deepEqual(versions.map((version) => [version.version, version.op]), [[1, "create"], [2, "update"]]);
    assert.deepEqual(versions[1].data, data);
    assert.equal(versions[1].sortOrder, 99);
    assert.equal(versions[1].actor, actor);
    assert.equal(versions[1].note, "sửa thử");
    assert.equal(versions[0].sortOrder, item.sortOrder);
  });

  it("rollback: ghi snapshot cũ (data/body/sort_order) thành version mới, lịch sử giữ nguyên", async () => {
    const item = await firstLive("listing_item", "en", 1);
    const original = { data: item.data, body: item.body, sortOrder: item.sortOrder };
    assert.notEqual(item.sortOrder, null);
    await updateEntry(db, { id: item.id, expectedVersion: 1, data: { ...(item.data as Record<string, unknown>), title: "X" }, sortOrder: 42, actor });
    const { entry } = await rollbackEntry(db, { id: item.id, toVersion: 1, expectedVersion: 2, actor });
    assert.equal(entry.version, 3);
    assert.deepEqual({ data: entry.data, body: entry.body, sortOrder: entry.sortOrder }, original);
    const versions = await listVersions(db, item.id);
    assert.deepEqual(versions.map((version) => version.op), ["create", "update", "rollback"]);
    assert.equal(versions[1].sortOrder, 42);
    assert.equal(versions[2].sortOrder, item.sortOrder);
    assert.equal(versions[2].note, "rollback về v1");
    await rejectsWith(rollbackEntry(db, { id: item.id, toVersion: 3, expectedVersion: 3, actor }), /toVersion/);
  });

  it("expectedVersion lệch → ContentConflictError; 2 ghi đồng thời cùng version → đúng 1 thành công", async () => {
    const item = await firstLive("ui_messages", "vi");
    const data = item.data as Record<string, unknown>;
    await assert.rejects(updateEntry(db, { id: item.id, expectedVersion: 7, data, actor }), ContentConflictError);
    const results = await Promise.allSettled([
      updateEntry(db, { id: item.id, expectedVersion: 1, data, actor, note: "a" }),
      updateEntry(db, { id: item.id, expectedVersion: 1, data, actor, note: "b" }),
    ]);
    assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
    const rejected = results.find((result) => result.status === "rejected");
    assert.ok(rejected && rejected.status === "rejected" && rejected.reason instanceof ContentConflictError);
    assert.equal((await listVersions(db, item.id)).length, 2);
  });

  it("xoá mềm: I-8 cần cờ; ẩn khỏi đọc nhưng còn lịch sử; rollback khôi phục", async () => {
    const post = await firstLive("post", "vi");
    await rejectsWith(softDeleteEntry(db, { id: post.id, expectedVersion: 1, actor }), /I-8/);
    const deleted = await softDeleteEntry(db, { id: post.id, expectedVersion: 1, actor, confirmPublicUrlChange: true });
    assert.match(deleted.warnings.join(), /I-8 .*redirect 301/);
    assert.equal(await getEntry(db, post.id), undefined);
    assert.equal(await getEntryByKey(db, post), undefined);
    assert.ok(!(await listEntries(db, { collection: "post", locale: "vi" })).some((entry) => entry.id === post.id));
    assert.ok((await getEntry(db, post.id, { includeDeleted: true }))?.deletedAt);
    assert.deepEqual((await listVersions(db, post.id)).map((version) => version.op), ["create", "delete"]);
    await rejectsWith(updateEntry(db, { id: post.id, expectedVersion: 2, data: post.data as Record<string, unknown>, actor }), /xoá mềm/);
    const restored = await rollbackEntry(db, { id: post.id, toVersion: 1, expectedVersion: 2, actor });
    assert.equal(restored.entry.deletedAt, null);
    assert.deepEqual(restored.entry.data, post.data);
    assert.match(restored.warnings.join(), /khôi phục/);
    assert.ok(await getEntry(db, post.id));
  });

  it("validate chặn: thiếu field, slug sai, ảnh không tồn tại, upload không có asset — không ghi gì", async () => {
    const post = await firstLive("post", "en");
    const data = post.data as Record<string, unknown>;
    const { title: _title, ...withoutTitle } = data;
    await rejectsWith(updateEntry(db, { id: post.id, expectedVersion: 1, data: withoutTitle, actor }), /missing title/);
    await rejectsWith(updateEntry(db, { id: post.id, expectedVersion: 1, data: { ...data, slug: "khac" }, actor }), /I-2/);
    await rejectsWith(
      updateEntry(db, { id: post.id, expectedVersion: 1, data: { ...data, cover: "/images/khong-co.png" }, actor }),
      /I-7 ảnh không tồn tại/,
    );
    await rejectsWith(
      updateEntry(db, { id: post.id, expectedVersion: 1, data: { ...data, cover: "/uploads/2026/x.png" }, actor }),
      /I-7 ảnh upload/,
    );
    assert.equal((await getEntry(db, post.id))?.version, 1);
    assert.equal((await listVersions(db, post.id)).length, 1);

    // Asset hợp lệ theo luật P3-T05 (slug = sha256, path /uploads/<sha256>.<ext>); file trên volume không kiểm ở write-path.
    const sha = "c".repeat(64);
    const assetPath = `/uploads/${sha}.png`;
    const assetData = { path: assetPath, sha256: sha, mime: "image/png", bytes: 10, width: 1, height: 1, alt: {} };
    await createEntry(db, { collection: "asset", slug: sha, locale: "vi", data: assetData, actor });
    const ok = await updateEntry(db, { id: post.id, expectedVersion: 1, data: { ...data, cover: assetPath }, actor });
    assert.equal(ok.entry.version, 2);
  });

  it("create: I-3 registry trước, I-1 cảnh báo thiếu cặp, I-5 trùng khoá; xoá registry khi nội dung còn sống bị chặn", async () => {
    const crm = await entryOf("solution", "vi", "crm");
    const data = { ...(crm.data as Record<string, unknown>), slug: "crm-moi" };
    const solution = { collection: "solution", slug: "crm-moi", locale: "vi", data, body: crm.body, actor };
    await rejectsWith(createEntry(db, solution), /I-3/);
    const registry = await createEntry(db, { collection: "slug_registry", slug: "crm-moi", locale: "vi", data: { group: "enterprise" }, actor });
    assert.match(registry.warnings.join(), /I-3 registry chưa có bản ghi/);
    const created = await createEntry(db, solution);
    assert.equal(created.entry.version, 1);
    assert.deepEqual((await listVersions(db, created.entry.id)).map((version) => version.op), ["create"]);
    assert.match(created.warnings.join(), /I-1/);
    await rejectsWith(createEntry(db, solution), /I-5/);
    await rejectsWith(softDeleteEntry(db, { id: registry.entry.id, expectedVersion: 1, actor }), /I-3/);
    await rejectsWith(createEntry(db, { ...solution, slug: "khac", data: { ...data, slug: "khac", category: "ai" } }), /I-3/);
    await rejectsWith(createEntry(db, { ...solution, collection: "khac" }), /I-6 collection/);
  });

  it("lỗi giữa transaction (ghi lịch sử hỏng) → entry không đổi, không thiếu version", async () => {
    const item = await entryOf("solution_overview", "vi", "enterprise");
    // Chiếm trước (entry_id, version 2) → INSERT content_versions sau UPDATE entry vi phạm UNIQUE.
    await pool?.query(
      "insert into content_versions (entry_id, version, op, data, actor) values ($1, 2, 'update', '{}'::jsonb, 'test')",
      [item.id],
    );
    await assert.rejects(updateEntry(db, { id: item.id, expectedVersion: 1, data: { ...(item.data as Record<string, unknown>), x: 1 }, actor }));
    const current = await getEntry(db, item.id);
    assert.equal(current?.version, 1);
    assert.deepEqual(current?.data, item.data);
  });
});
