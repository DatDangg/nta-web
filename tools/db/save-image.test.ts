// Test saveImage (CR-031 P3-T05): luật asset (thuần) + ghi file/metadata có version (cần TEST_DATABASE_URL, không có thì skip).
// Nằm ở tools/db vì dùng isProductionDatabaseUrl (tools/db/seed-db) như content-repo.test.ts.
import assert from "node:assert/strict";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { isProductionDatabaseUrl } from "./seed-db";
import type { Database } from "../../src/db/client";
import { getEntry, listVersions, softDeleteEntry, updateEntry } from "../../src/db/content-repo";
import { checkRecord, type ContentRecord } from "../../src/db/content-rules";
import * as schema from "../../src/db/schema";
import { ImageRejectedError } from "../../src/lib/uploads/image-file";
import { saveImage } from "../../src/lib/uploads/save-image";

const SHA = "d".repeat(64);

function assetRecord(overrides: Partial<ContentRecord> = {}, data: Record<string, unknown> = {}): ContentRecord {
  return {
    collection: "asset",
    slug: SHA,
    locale: "vi",
    body: null,
    sortOrder: null,
    data: { path: `/uploads/${SHA}.webp`, sha256: SHA, mime: "image/webp", bytes: 100, width: 10, height: 20, alt: { vi: "a", en: "b" }, ...data },
    ...overrides,
  };
}

describe("checkRecord — collection asset", () => {
  it("bản ghi hợp lệ không có lỗi", () => {
    assert.deepEqual(checkRecord(assetRecord()), []);
  });

  it("chặn path lệch slug/traversal, mime lệch đuôi, kích thước/dung lượng sai, alt sai, locale en", () => {
    const cases: [ContentRecord, RegExp][] = [
      [assetRecord({}, { path: `/uploads/../${SHA}.webp` }), /data.path/],
      [assetRecord({}, { path: `/uploads/${"e".repeat(64)}.webp` }), /data.path/],
      [assetRecord({}, { path: `/uploads/${SHA}.svg` }), /data.path/],
      [assetRecord({}, { mime: "image/png" }), /mime/],
      [assetRecord({}, { bytes: 6 * 1024 * 1024 }), /bytes/],
      [assetRecord({}, { width: 0 }), /width/],
      [assetRecord({}, { alt: { vi: 1 } }), /alt/],
      [assetRecord({}, { alt: { fr: "x" } }), /alt/],
      [assetRecord({}, { sha256: "x" }), /sha256/],
      [assetRecord({ slug: "anh-1" }, { sha256: "anh-1" }), /slug phải là sha256/],
      [assetRecord({ locale: "en" }), /locale/],
    ];
    for (const [record, pattern] of cases) assert.match(checkRecord(record).join("; "), pattern, JSON.stringify(record.data));
  });
});

const baseUrl = process.env.TEST_DATABASE_URL;
const skip = !baseUrl
  ? "TEST_DATABASE_URL chưa đặt — bỏ qua test saveImage cần DB"
  : isProductionDatabaseUrl(baseUrl)
    ? "TEST_DATABASE_URL trỏ DB prod — từ chối chạy"
    : false;

// PNG tối thiểu đủ header (inspectImage chỉ đọc magic bytes + IHDR); seed khác nhau → hash khác nhau.
function png(width: number, height: number, seed = 0): Uint8Array {
  const bytes = new Uint8Array(34);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52]);
  new DataView(bytes.buffer).setUint32(16, width);
  new DataView(bytes.buffer).setUint32(20, height);
  bytes[33] = seed;
  return bytes;
}

describe("saveImage (Postgres + thư mục tạm)", { skip }, () => {
  const actor = "test:upload";
  const databaseName = `nta_upload_test_${process.pid}_${Date.now()}`;
  let adminPool: Pool | undefined;
  let pool: Pool | undefined;
  let db: Database;
  let uploadDir: string;

  before(async () => {
    adminPool = new Pool({ connectionString: baseUrl });
    await adminPool.query(`create database ${databaseName}`);
    const url = new URL(String(baseUrl));
    url.pathname = `/${databaseName}`;
    pool = new Pool({ connectionString: url.toString() });
    db = drizzle(pool, { schema });
    await migrate(db, { migrationsFolder: path.resolve("drizzle") });
    uploadDir = await mkdtemp(path.join(tmpdir(), "nta-save-image-"));
  });

  after(async () => {
    await pool?.end();
    await adminPool?.query(`drop database if exists ${databaseName} with (force)`);
    await adminPool?.end();
    await rm(uploadDir, { recursive: true, force: true });
  });

  it("tạo file + asset version 1 với metadata đầy đủ; tên gốc chỉ giữ basename", async () => {
    const result = await saveImage(db, { bytes: png(300, 200), originalName: "C:/tmp/../anh goc.png", alt: { vi: " Ảnh ", en: "" }, actor, uploadDir });
    assert.equal(result.status, "created");
    assert.equal(result.asset.version, 1);
    assert.equal(result.asset.slug, result.image.sha256);
    assert.deepEqual(result.asset.data, {
      path: `/uploads/${result.image.sha256}.png`,
      sha256: result.image.sha256,
      mime: "image/png",
      bytes: 34,
      width: 300,
      height: 200,
      alt: { vi: "Ảnh" },
      originalName: "anh goc.png",
    });
    assert.deepEqual((await listVersions(db, result.asset.id)).map((version) => version.op), ["create"]);
    assert.deepEqual(await readdir(uploadDir), [`${result.image.sha256}.png`]);
  });

  it("trùng hash → dùng lại asset, không ghi metadata/version mới", async () => {
    const first = await saveImage(db, { bytes: png(10, 10, 1), actor, uploadDir });
    const again = await saveImage(db, { bytes: png(10, 10, 1), alt: { vi: "khác" }, actor, uploadDir });
    assert.equal(again.status, "reused");
    assert.equal(again.image.written, false);
    assert.equal(again.asset.id, first.asset.id);
    assert.equal((await listVersions(db, first.asset.id)).length, 1);
  });

  it("xoá mềm giữ file vật lý; upload lại cùng ảnh khôi phục bằng rollback (version mới)", async () => {
    const first = await saveImage(db, { bytes: png(10, 10, 2), actor, uploadDir });
    await softDeleteEntry(db, { id: first.asset.id, expectedVersion: 1, actor });
    assert.ok((await readdir(uploadDir)).includes(first.image.fileName));
    const again = await saveImage(db, { bytes: png(10, 10, 2), actor, uploadDir });
    assert.equal(again.status, "restored");
    assert.equal(again.asset.version, 3);
    assert.equal(again.asset.deletedAt, null);
  });

  it("sửa asset làm lệch path bị chặn (validate ở write-path)", async () => {
    const first = await saveImage(db, { bytes: png(10, 10, 3), actor, uploadDir });
    const data = { ...(first.asset.data as Record<string, unknown>), path: "/uploads/../../etc/passwd.png" };
    await assert.rejects(updateEntry(db, { id: first.asset.id, expectedVersion: 1, data, actor }), /data.path/);
    assert.equal((await getEntry(db, first.asset.id))?.version, 1);
  });

  it("từ chối SVG / nội dung giả trước khi ghi file hay DB", async () => {
    const before = await readdir(uploadDir);
    const svg = new TextEncoder().encode("<svg xmlns='http://www.w3.org/2000/svg'/>");
    await assert.rejects(saveImage(db, { bytes: svg, originalName: "x.png", actor, uploadDir }), ImageRejectedError);
    assert.deepEqual(await readdir(uploadDir), before);
  });

  it("thiếu UPLOAD_DIR → lỗi rõ", async () => {
    const saved = process.env.UPLOAD_DIR;
    delete process.env.UPLOAD_DIR;
    try {
      await assert.rejects(saveImage(db, { bytes: png(1, 1), actor }), /UPLOAD_DIR/);
    } finally {
      if (saved !== undefined) process.env.UPLOAD_DIR = saved;
    }
  });
});
