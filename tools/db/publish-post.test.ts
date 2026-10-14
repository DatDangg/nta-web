// Test publish-post (CR-034). Phần đọc file/slug chạy không cần DB; phần ghi cần PostgreSQL (TEST_DATABASE_URL, không phải prod) —
// không có thì skip. Tạo database riêng nta_publish_test_* (xoá khi xong), KHÔNG import seed → bảng post rỗng trừ bài test tự tạo.
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import type { Database } from "../../src/db/client";
import {
  ContentNotFoundError,
  ContentValidationError,
  createEntry,
  getEntryByKey,
  listEntries,
  listVersions,
  softDeleteEntry,
  updateEntry,
} from "../../src/db/content-repo";
import * as schema from "../../src/db/schema";
import { parseMdxSource } from "../../src/lib/content/mdx-files";
import { defaultPublishNote, publishPost, type PublishPostOptions } from "./publish-post";
import { isProductionDatabaseUrl } from "./seed-db";

const SLUG = "ai-weekly-2026-w42";
const REAL_BLOG_DIR = path.resolve("src/content/blog");
const actor = "workflow:ai-news";
const note = defaultPublishNote(SLUG, "123456");

async function makeBlogDir(files: Partial<Record<"vi" | "en", string>>): Promise<string> {
  const blogDir = await mkdtemp(path.join(tmpdir(), "nta-publish-"));
  for (const [locale, source] of Object.entries(files)) {
    await mkdir(path.join(blogDir, locale), { recursive: true });
    await writeFile(path.join(blogDir, locale, `${SLUG}.mdx`), source, "utf8");
  }
  return blogDir;
}

const realSource = (locale: "vi" | "en") => readFile(path.join(REAL_BLOG_DIR, locale, `${SLUG}.mdx`), "utf8");

describe("publish-post (không cần DB)", () => {
  // Pool chưa kết nối — các ca dưới phải lỗi TRƯỚC khi chạm DB.
  const idlePool = new Pool({ connectionString: "postgres://nobody@127.0.0.1:1/none" });
  const idleDb: Database = drizzle(idlePool, { schema });
  after(() => idlePool.end());

  it("note mặc định kèm run id khi có GITHUB_RUN_ID", () => {
    assert.equal(defaultPublishNote(SLUG, "42"), `ai-news ${SLUG} run 42`);
    assert.equal(defaultPublishNote(SLUG, undefined), `ai-news ${SLUG}`);
  });

  it("slug lạ (path traversal) → lỗi validate, không đọc file", async () => {
    const options: PublishPostOptions = { slug: "../secret", dryRun: true, actor, note };
    await assert.rejects(publishPost(idleDb, options), ContentValidationError);
  });

  it("thiếu file 1 locale → ContentNotFoundError trước khi chạm DB", async () => {
    const blogDir = await makeBlogDir({ vi: await realSource("vi") });
    try {
      await assert.rejects(publishPost(idleDb, { slug: SLUG, dryRun: false, actor, note, blogDir }), ContentNotFoundError);
    } finally {
      await rm(blogDir, { recursive: true, force: true });
    }
  });
});

const baseUrl = process.env.TEST_DATABASE_URL;
const skip = !baseUrl
  ? "TEST_DATABASE_URL chưa đặt — bỏ qua test publish-post cần DB"
  : isProductionDatabaseUrl(baseUrl)
    ? "TEST_DATABASE_URL trỏ DB prod — từ chối chạy"
    : false;

describe("publish-post (Postgres)", { skip }, () => {
  const databaseName = `nta_publish_test_${process.pid}_${Date.now()}`;
  let adminPool: Pool | undefined;
  let pool: Pool | undefined;
  let db: Database;

  const postEntries = () => listEntries(db, { collection: "post", includeDeleted: true });

  before(async () => {
    adminPool = new Pool({ connectionString: baseUrl });
    await adminPool.query(`create database ${databaseName}`);
    const url = new URL(String(baseUrl));
    url.pathname = `/${databaseName}`;
    pool = new Pool({ connectionString: url.toString() });
    db = drizzle(pool, { schema });
    await migrate(db, { migrationsFolder: path.resolve("drizzle") });
  });

  after(async () => {
    await pool?.end();
    await adminPool?.query(`drop database if exists ${databaseName} with (force)`);
    await adminPool?.end();
  });

  it("validate cả 2 locale trước khi ghi: en lỗi (ảnh không có) → vi cũng không được ghi", async () => {
    const badEn = (await realSource("en")).replace("/images/blog/ai-weekly-cover.svg", "/images/blog/khong-co.svg");
    const blogDir = await makeBlogDir({ vi: await realSource("vi"), en: badEn });
    try {
      await assert.rejects(publishPost(db, { slug: SLUG, dryRun: false, actor, note, blogDir }), /post\/en\/.*I-7/);
      assert.equal((await postEntries()).length, 0);
    } finally {
      await rm(blogDir, { recursive: true, force: true });
    }
  });

  it("dry-run: báo missing cả 2 locale, không ghi", async () => {
    const results = await publishPost(db, { slug: SLUG, dryRun: true, actor, note });
    assert.deepEqual(results.map((result) => [result.key, result.status]), [
      [`post/vi/${SLUG}`, "missing"],
      [`post/en/${SLUG}`, "missing"],
    ]);
    assert.equal((await postEntries()).length, 0);
  });

  it("lần đầu: created cả 2 — version 1, updated_by + content_versions op create/actor/note đúng", async () => {
    const results = await publishPost(db, { slug: SLUG, dryRun: false, actor, note });
    assert.deepEqual(results.map((result) => result.status), ["created", "created"]);
    for (const locale of ["vi", "en"]) {
      const entry = await getEntryByKey(db, { collection: "post", locale, slug: SLUG });
      assert.ok(entry);
      assert.equal(entry.version, 1);
      assert.equal(entry.updatedBy, actor);
      assert.equal((entry.data as Record<string, unknown>).slug, SLUG);
      const versions = await listVersions(db, entry.id);
      assert.deepEqual(versions.map((version) => [version.version, version.op, version.actor, version.note]), [[1, "create", actor, note]]);
    }
  });

  it("chạy lại: exists, 0 ghi; bản đã sửa (v2) giữ nguyên", async () => {
    const vi = await getEntryByKey(db, { collection: "post", locale: "vi", slug: SLUG });
    assert.ok(vi);
    const edited = { ...(vi.data as Record<string, unknown>), title: "Tiêu đề đã sửa tay" };
    await updateEntry(db, { id: vi.id, expectedVersion: 1, data: edited, actor: "cli:editor" });
    const results = await publishPost(db, { slug: SLUG, dryRun: false, actor, note: "lần 2" });
    assert.deepEqual(results.map((result) => result.status), ["exists", "exists"]);
    const after = await getEntryByKey(db, { collection: "post", locale: "vi", slug: SLUG });
    assert.equal(after?.version, 2);
    assert.deepEqual(after?.data, edited);
    assert.equal((await listVersions(db, vi.id)).length, 2);
  });

  it("bản xoá mềm: exists, không khôi phục, không thêm dòng lịch sử", async () => {
    const en = await getEntryByKey(db, { collection: "post", locale: "en", slug: SLUG });
    assert.ok(en);
    await softDeleteEntry(db, { id: en.id, expectedVersion: 1, actor: "cli:editor", confirmPublicUrlChange: true });
    const results = await publishPost(db, { slug: SLUG, dryRun: true, actor, note });
    assert.deepEqual(results.map((result) => result.status), ["exists", "exists"]);
    await publishPost(db, { slug: SLUG, dryRun: false, actor, note });
    assert.equal(await getEntryByKey(db, { collection: "post", locale: "en", slug: SLUG }), undefined);
    assert.deepEqual((await listVersions(db, en.id)).map((version) => version.op), ["create", "delete"]);
  });

  it("chỉ thiếu 1 locale: chèn đúng locale đó, locale kia exists (giữ nguyên)", async () => {
    const otherSlug = "ai-weekly-2026-w41";
    const blogDir = await mkdtemp(path.join(tmpdir(), "nta-publish-"));
    try {
      for (const locale of ["vi", "en"] as const) {
        await mkdir(path.join(blogDir, locale), { recursive: true });
        const source = (await realSource(locale)).replace(`slug: "${SLUG}"`, `slug: "${otherSlug}"`);
        await writeFile(path.join(blogDir, locale, `${otherSlug}.mdx`), source, "utf8");
      }
      const enFile = parseMdxSource(await readFile(path.join(blogDir, "en", `${otherSlug}.mdx`), "utf8"));
      const existingEn = await createEntry(db, { collection: "post", slug: otherSlug, locale: "en", data: enFile.frontmatter, body: enFile.body, actor: "cli:editor" });
      const results = await publishPost(db, { slug: otherSlug, dryRun: false, actor, note, blogDir });
      assert.deepEqual(results.map((result) => [result.locale, result.status]), [["vi", "created"], ["en", "exists"]]);
      const en = await getEntryByKey(db, { collection: "post", locale: "en", slug: otherSlug });
      assert.equal(en?.updatedBy, "cli:editor");
      assert.equal((await listVersions(db, existingEn.entry.id)).length, 1);
    } finally {
      await rm(blogDir, { recursive: true, force: true });
    }
  });
});
