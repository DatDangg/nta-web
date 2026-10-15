// Test publish-post (CR-034). Phần đọc file/slug chạy không cần DB; phần ghi cần PostgreSQL (TEST_DATABASE_URL, không phải prod) —
// không có thì skip. Tạo database riêng nta_publish_test_* (xoá khi xong), KHÔNG import seed → bảng post rỗng trừ bài test tự tạo.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
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
import { MAX_UPLOAD_BYTES } from "../../src/lib/uploads/image-file";
import { saveImage } from "../../src/lib/uploads/save-image";
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
    const { posts: results } = await publishPost(db, { slug: SLUG, dryRun: true, actor, note });
    assert.deepEqual(results.map((result) => [result.key, result.status]), [
      [`post/vi/${SLUG}`, "missing"],
      [`post/en/${SLUG}`, "missing"],
    ]);
    assert.equal((await postEntries()).length, 0);
  });

  it("lần đầu: created cả 2 — version 1, updated_by + content_versions op create/actor/note đúng", async () => {
    const { posts: results } = await publishPost(db, { slug: SLUG, dryRun: false, actor, note });
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
    const { posts: results } = await publishPost(db, { slug: SLUG, dryRun: false, actor, note: "lần 2" });
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
    const { posts: results } = await publishPost(db, { slug: SLUG, dryRun: true, actor, note });
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
      const { posts: results } = await publishPost(db, { slug: otherSlug, dryRun: false, actor, note, blogDir });
      assert.deepEqual(results.map((result) => [result.locale, result.status]), [["vi", "created"], ["en", "exists"]]);
      const en = await getEntryByKey(db, { collection: "post", locale: "en", slug: otherSlug });
      assert.equal(en?.updatedBy, "cli:editor");
      assert.equal((await listVersions(db, existingEn.entry.id)).length, 1);
    } finally {
      await rm(blogDir, { recursive: true, force: true });
    }
  });
});

// CR-035 task-02: --images-dir. Ảnh mẫu là header PNG dựng tay (inspectImage chỉ đọc magic bytes + IHDR) — giống src/lib/uploads/uploads.test.ts.
function png(width: number, height: number): Buffer {
  const bytes = Buffer.alloc(33);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52]);
  bytes.writeUInt32BE(width, 16);
  bytes.writeUInt32BE(height, 20);
  return bytes;
}

const sha256 = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const SVG = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><script>alert(1)</script></svg>');

interface TestImage {
  bytes: Buffer;
  // Mặc định <sha256(bytes)>.png; ghi đè để giả file sai hash / sai đuôi.
  fileName?: string;
  inManifest?: boolean;
  onDisk?: boolean;
}

const nameOf = (image: TestImage) => image.fileName ?? `${sha256(image.bytes)}.png`;

// Bài vi/en của `slug` chèn <NewsImage> cho từng ảnh (giống render_post của tools/ai-news/generate.py).
async function makeImagePost(slug: string, imagePaths: string[]): Promise<string> {
  const blogDir = await mkdtemp(path.join(tmpdir(), "nta-publish-img-"));
  for (const locale of ["vi", "en"] as const) {
    await mkdir(path.join(blogDir, locale), { recursive: true });
    const tags = imagePaths.map((imagePath) => `<NewsImage src="${imagePath}" alt="tin" width="4" height="4" />`).join("\n\n");
    const source = (await realSource(locale)).replace(`slug: "${SLUG}"`, `slug: "${slug}"`).trimEnd() + `\n\n${tags}\n`;
    await writeFile(path.join(blogDir, locale, `${slug}.mdx`), source, "utf8");
  }
  return blogDir;
}

async function makeImagesDir(slug: string, images: TestImage[], manifestSlug = slug): Promise<string> {
  const imagesDir = await mkdtemp(path.join(tmpdir(), "nta-images-"));
  const entries = [];
  for (const image of images) {
    const fileName = nameOf(image);
    if (image.onDisk !== false) await writeFile(path.join(imagesDir, fileName), image.bytes);
    if (image.inManifest === false) continue;
    const [sha, ext] = fileName.split(".");
    entries.push({ file: fileName, sha256: sha, ext, width: 4, height: 4, bytes: image.bytes.length, sourceHost: "example.com", alt: { vi: "Ảnh tin", en: "News image" } });
  }
  await writeFile(path.join(imagesDir, "manifest.json"), JSON.stringify({ slug: manifestSlug, images: entries }), "utf8");
  return imagesDir;
}

describe("publish-post --images-dir (Postgres)", { skip }, () => {
  const databaseName = `nta_publish_img_test_${process.pid}_${Date.now()}`;
  let adminPool: Pool | undefined;
  let pool: Pool | undefined;
  let db: Database;
  let uploadDir: string;
  const cleanup: string[] = [];

  const assets = () => listEntries(db, { collection: "asset", includeDeleted: true });
  const posts = () => listEntries(db, { collection: "post", includeDeleted: true });
  const tempDir = async (dir: Promise<string>) => {
    const value = await dir;
    cleanup.push(value);
    return value;
  };

  // Mỗi ca từ chối: lỗi validate, không asset/post nào được ghi, không file nào vào uploadDir.
  async function assertRejectedWithoutWrites(options: PublishPostOptions, pattern: RegExp): Promise<void> {
    const before = { assets: (await assets()).length, posts: (await posts()).length };
    await assert.rejects(publishPost(db, options), (error: unknown) => error instanceof ContentValidationError && pattern.test(error.message));
    assert.deepEqual({ assets: (await assets()).length, posts: (await posts()).length }, before);
    assert.deepEqual(await readdir(uploadDir).catch(() => []), []);
  }

  before(async () => {
    adminPool = new Pool({ connectionString: baseUrl });
    await adminPool.query(`create database ${databaseName}`);
    const url = new URL(String(baseUrl));
    url.pathname = `/${databaseName}`;
    pool = new Pool({ connectionString: url.toString() });
    db = drizzle(pool, { schema });
    await migrate(db, { migrationsFolder: path.resolve("drizzle") });
    uploadDir = path.join(await tempDir(mkdtemp(path.join(tmpdir(), "nta-upload-root-"))), "uploads");
  });

  after(async () => {
    await pool?.end();
    await adminPool?.query(`drop database if exists ${databaseName} with (force)`);
    await adminPool?.end();
    for (const dir of cleanup) await rm(dir, { recursive: true, force: true });
  });

  it("bài có ảnh /uploads nhưng không --images-dir → từ chối, 0 ghi", async () => {
    const slug = "ai-weekly-2026-w43";
    const image = png(4, 4);
    const blogDir = await tempDir(makeImagePost(slug, [`/uploads/${sha256(image)}.png`]));
    await assertRejectedWithoutWrites({ slug, dryRun: true, actor, note, blogDir, uploadDir }, /I-7 ảnh upload không có trong DB[\s\S]*--images-dir/);
  });

  it("từ chối trước khi ghi: thiếu file / sai hash / sai đuôi / SVG / > 5 MB / không có trong manifest / slug manifest khác / ../", async () => {
    const slug = "ai-weekly-2026-w44";
    const good = png(5, 5);
    const big = Buffer.concat([png(6, 6), Buffer.alloc(MAX_UPLOAD_BYTES)]);
    const cases: Array<[string, TestImage, RegExp, string?]> = [
      ["thiếu file", { bytes: good, onDisk: false }, /thiếu file/],
      ["sai hash", { bytes: good, fileName: `${"a".repeat(64)}.png` }, /sha256 nội dung khác tên file/],
      ["sai đuôi", { bytes: good, fileName: `${sha256(good)}.jpg` }, /nội dung là png, đuôi tên file là jpg/],
      ["SVG", { bytes: SVG, fileName: `${sha256(SVG)}.png` }, /JPEG\/PNG\/WebP/],
      ["> 5 MB", { bytes: big }, /quá \d+ byte/],
      ["không có trong manifest", { bytes: good, inManifest: false }, /không có trong manifest/],
      ["slug manifest khác", { bytes: good }, /manifest slug "ai-weekly-2099-w01"/, "ai-weekly-2099-w01"],
    ];
    for (const [label, image, pattern, manifestSlug] of cases) {
      const blogDir = await tempDir(makeImagePost(slug, [`/uploads/${nameOf(image)}`]));
      const imagesDir = await tempDir(makeImagesDir(slug, [image], manifestSlug));
      await assertRejectedWithoutWrites({ slug, dryRun: false, actor, note, blogDir, imagesDir, uploadDir }, pattern).catch((error: Error) => {
        throw new Error(`${label}: ${error.message}`);
      });
    }
    const blogDir = await tempDir(makeImagePost(slug, [`/uploads/../${sha256(good)}.png`]));
    const imagesDir = await tempDir(makeImagesDir(slug, [{ bytes: good }]));
    await assertRejectedWithoutWrites({ slug, dryRun: false, actor, note, blogDir, imagesDir, uploadDir }, /I-7 đường dẫn ảnh không hợp lệ/);
  });

  it("file ảnh là symlink → từ chối, 0 ghi", async (t) => {
    const slug = "ai-weekly-2026-w45";
    const image = png(7, 7);
    const imagesDir = await tempDir(makeImagesDir(slug, [{ bytes: image, onDisk: false }]));
    const outside = path.join(await tempDir(mkdtemp(path.join(tmpdir(), "nta-outside-"))), "x.png");
    await writeFile(outside, image);
    try {
      await symlink(outside, path.join(imagesDir, nameOf({ bytes: image })));
    } catch (error) {
      t.skip(`không tạo được symlink trên máy này (${(error as NodeJS.ErrnoException).code})`);
      return;
    }
    const blogDir = await tempDir(makeImagePost(slug, [`/uploads/${nameOf({ bytes: image })}`]));
    await assertRejectedWithoutWrites({ slug, dryRun: false, actor, note, blogDir, imagesDir, uploadDir }, /không phải file thường/);
  });

  it("dry-run ảnh mới → image status=missing, 0 ghi file/DB; ảnh thừa trong manifest → cảnh báo", async () => {
    const slug = "ai-weekly-2026-w46";
    const image = png(8, 8);
    const extra = png(9, 9);
    const blogDir = await tempDir(makeImagePost(slug, [`/uploads/${nameOf({ bytes: image })}`]));
    const imagesDir = await tempDir(makeImagesDir(slug, [{ bytes: image }, { bytes: extra }]));
    const result = await publishPost(db, { slug, dryRun: true, actor, note, blogDir, imagesDir, uploadDir });
    assert.deepEqual(result.posts.map((post) => post.status), ["missing", "missing"]);
    assert.deepEqual(result.images, [{ path: `/uploads/${nameOf({ bytes: image })}`, status: "missing" }]);
    assert.equal(result.warnings.length, 1);
    assert.match(result.warnings[0], new RegExp(sha256(extra)));
    assert.equal((await assets()).length, 0);
    assert.equal((await posts()).length, 0);
    assert.deepEqual(await readdir(uploadDir).catch(() => []), []);
  });

  it("ghi: asset v1 actor workflow:ai-news + file trên uploadDir, rồi 2 bài v1; chạy lại → exists, 0 ghi", async () => {
    const slug = "ai-weekly-2026-w47";
    const image = png(10, 10);
    const urlPath = `/uploads/${nameOf({ bytes: image })}`;
    const blogDir = await tempDir(makeImagePost(slug, [urlPath]));
    const imagesDir = await tempDir(makeImagesDir(slug, [{ bytes: image }]));
    const result = await publishPost(db, { slug, dryRun: false, actor, note, blogDir, imagesDir, uploadDir });
    assert.deepEqual(result.images, [{ path: urlPath, status: "created" }]);
    assert.deepEqual(result.posts.map((post) => post.status), ["created", "created"]);
    const asset = await getEntryByKey(db, { collection: "asset", locale: "vi", slug: sha256(image) });
    assert.ok(asset);
    assert.equal(asset.version, 1);
    assert.equal(asset.updatedBy, actor);
    const data = asset.data as Record<string, unknown>;
    assert.equal(data.path, urlPath);
    assert.deepEqual(data.alt, { vi: "Ảnh tin", en: "News image" });
    assert.equal(data.originalName, "example.com");
    assert.deepEqual(await readFile(path.join(uploadDir, nameOf({ bytes: image }))), image);
    for (const locale of ["vi", "en"]) assert.equal((await getEntryByKey(db, { collection: "post", locale, slug }))?.version, 1);

    const counts = { assets: (await assets()).length, posts: (await posts()).length };
    const again = await publishPost(db, { slug, dryRun: false, actor, note, blogDir, imagesDir, uploadDir });
    assert.deepEqual(again.posts.map((post) => post.status), ["exists", "exists"]);
    assert.deepEqual(again.images, []);
    assert.deepEqual({ assets: (await assets()).length, posts: (await posts()).length }, counts);
    assert.equal((await listVersions(db, asset.id)).length, 1);
  });

  it("ảnh đã có asset sống → image status=exists, không upload lại", async () => {
    const slug = "ai-weekly-2026-w48";
    const image = png(11, 11);
    await saveImage(db, { bytes: image, actor: "cli:editor", uploadDir });
    const urlPath = `/uploads/${nameOf({ bytes: image })}`;
    const blogDir = await tempDir(makeImagePost(slug, [urlPath]));
    const imagesDir = await tempDir(makeImagesDir(slug, []));
    const result = await publishPost(db, { slug, dryRun: false, actor, note, blogDir, imagesDir, uploadDir });
    assert.deepEqual(result.images, [{ path: urlPath, status: "exists" }]);
    assert.equal((await getEntryByKey(db, { collection: "asset", locale: "vi", slug: sha256(image) }))?.version, 1);
  });

  it("asset trùng hash đã xoá mềm → restored, bài chèn được", async () => {
    const slug = "ai-weekly-2026-w49";
    const image = png(12, 12);
    const saved = await saveImage(db, { bytes: image, actor: "cli:editor", uploadDir });
    await softDeleteEntry(db, { id: saved.asset.id, expectedVersion: 1, actor: "cli:editor", confirmPublicUrlChange: true });
    const urlPath = `/uploads/${nameOf({ bytes: image })}`;
    const blogDir = await tempDir(makeImagePost(slug, [urlPath]));
    const imagesDir = await tempDir(makeImagesDir(slug, [{ bytes: image }]));
    const dry = await publishPost(db, { slug, dryRun: true, actor, note, blogDir, imagesDir, uploadDir });
    assert.deepEqual(dry.images, [{ path: urlPath, status: "missing" }]);
    const result = await publishPost(db, { slug, dryRun: false, actor, note, blogDir, imagesDir, uploadDir });
    assert.deepEqual(result.images, [{ path: urlPath, status: "restored" }]);
    assert.deepEqual(result.posts.map((post) => post.status), ["created", "created"]);
    const asset = await getEntryByKey(db, { collection: "asset", locale: "vi", slug: sha256(image) });
    assert.equal(asset?.deletedAt, null);
  });
});
