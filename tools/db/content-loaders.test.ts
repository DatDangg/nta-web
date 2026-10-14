// Loader MDX web (src/lib/content/*) theo cờ CONTENT_SOURCE — CR-031 P3-T01; registry object TS (registry.ts) — P3-T02.
// Nằm ở tools/db vì import tools/db/* (tools/ bị .dockerignore loại). `server-only` + `next/cache` được stub
// (test-stubs/register.ts) vì gói thật chỉ chạy trong Next → test kiểm dữ liệu/lỗi, KHÔNG kiểm data cache của Next
// (cache + trang đã cache khi tắt DB được kiểm bằng bản build thật — xem Builder report của task).
// Phần parity cần PostgreSQL: chỉ chạy khi có TEST_DATABASE_URL; tạo database riêng nta_loader_test_* rồi xoá.
import "./test-stubs/register";
import assert from "node:assert/strict";
import path from "node:path";
import { after, before, describe, it, test } from "node:test";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import type { Locale } from "../../src/content/types";
import { closeDb } from "../../src/db/client";
import * as schema from "../../src/db/schema";
import { getAboutData } from "../../src/lib/content/about";
import { getAllCaseStudies, getCaseStudyBySlug } from "../../src/lib/content/case-studies";
import { getAllPosts, getMdxDocument, getPostBySlug } from "../../src/lib/content/posts";
import { getAllProducts, getProductBySlug } from "../../src/lib/content/products";
import * as registry from "../../src/lib/content/registry";
import { getAllSolutions, getSolutionBySlug } from "../../src/lib/content/solutions";
import { getEntries, getEntry } from "../../src/lib/content/store";
import { readFileSource } from "./file-source";
import { importRecords, isProductionDatabaseUrl } from "./seed-db";

const LOCALES: Locale[] = ["vi", "en"];
const savedEnv = { CONTENT_SOURCE: process.env.CONTENT_SOURCE, DATABASE_URL: process.env.DATABASE_URL };

function restoreEnv(name: keyof typeof savedEnv): void {
  const value = savedEnv[name];
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

async function withSource<T>(source: string | undefined, read: () => Promise<T>): Promise<T> {
  if (source === undefined) delete process.env.CONTENT_SOURCE;
  else process.env.CONTENT_SOURCE = source;
  try {
    return await read();
  } finally {
    restoreEnv("CONTENT_SOURCE");
  }
}

async function pairsBySlug<T>(slugs: string[], read: (slug: string) => Promise<T>): Promise<[string, T][]> {
  const pairs: [string, T][] = [];
  for (const slug of slugs) pairs.push([slug, await read(slug)]);
  return pairs;
}

// Mọi hàm export của loader MDX cho 1 locale (kể cả theo slug) — chụp thành 1 object để so deep-equal giữa 2 nguồn.
async function snapshotLoaders(locale: Locale) {
  const posts = await getAllPosts(locale);
  const solutions = await getAllSolutions(locale);
  const products = await getAllProducts(locale);
  const caseStudies = await getAllCaseStudies(locale);
  const postSlugs = posts.map((post) => post.slug);
  return {
    posts,
    solutions,
    products,
    caseStudies,
    about: await getAboutData(locale),
    postBySlug: await pairsBySlug(postSlugs, (slug) => getPostBySlug(locale, slug)),
    mdxDocuments: await pairsBySlug(postSlugs, (slug) => getMdxDocument(locale, slug)),
    solutionBySlug: await pairsBySlug(solutions.map((item) => item.slug), (slug) => getSolutionBySlug(locale, slug)),
    productBySlug: await pairsBySlug(products.map((item) => item.slug), (slug) => getProductBySlug(locale, slug)),
    caseStudyBySlug: await pairsBySlug(caseStudies.map((item) => item.slug), (slug) => getCaseStudyBySlug(locale, slug)),
    registry: await snapshotRegistry(locale),
  };
}

// Mọi getter registry (P3-T02) cho 1 locale, kể cả slug không đăng ký / sai nhóm.
async function snapshotRegistry(locale: Locale) {
  const listingItems = await registry.getListingItems(locale);
  return {
    enterpriseSlugs: await registry.getRegistrySlugs("enterprise"),
    aiSlugs: await registry.getRegistrySlugs("ai"),
    productSlugs: await registry.getRegistrySlugs("product"),
    registered: [
      await registry.isRegisteredSlug("ai", "boxai"),
      await registry.isRegisteredSlug("ai", "crm"),
      await registry.isRegisteredSlug("product", "khong-ton-tai"),
    ],
    listingPages: await registry.getListingPages(locale),
    listingItems,
    listingCtas: await registry.getListingCtas(locale),
    listingLabels: await registry.getListingLabels(locale),
    home: await registry.getHomeContent(locale),
    solutionOverview: await registry.getSolutionOverview(locale),
    detailTiles: await pairsBySlug([...Object.keys(listingItems), "khong-ton-tai"], (slug) => registry.getDetailTiles(locale, slug)),
  };
}

test("chế độ file (cờ chưa đặt) đọc src/content, không cần DATABASE_URL", async () => {
  delete process.env.DATABASE_URL;
  try {
    const posts = await withSource(undefined, () => getAllPosts("vi"));
    assert.ok(posts.length > 0);
    assert.deepEqual(await withSource("file", () => getAllPosts("vi")), posts);
    // Registry chế độ file = đúng hằng TS hiện tại (cùng thứ tự slug).
    assert.deepEqual(await withSource(undefined, () => registry.getRegistrySlugs("enterprise")), ["crm", "hrm", "lms", "dentgo"]);
    assert.deepEqual(await withSource(undefined, () => registry.getRegistrySlugs("product")), ["music-app", "hair-style-ai"]);
    assert.equal(await withSource(undefined, () => registry.isRegisteredSlug("enterprise", "boxai")), false);
    assert.ok((await withSource(undefined, () => registry.getHomeContent("en"))).featuredProducts.length > 0);
  } finally {
    restoreEnv("DATABASE_URL");
  }
});

test("cờ CONTENT_SOURCE lạ → loader báo lỗi rõ", async () => {
  await assert.rejects(withSource("database", () => getAllPosts("vi")), /CONTENT_SOURCE không hợp lệ/);
});

test("chế độ db + DB không kết nối được → NÉM lỗi rõ (không trả mảng rỗng)", async () => {
  // Cổng 1 trên loopback: không có Postgres → kết nối bị từ chối.
  process.env.DATABASE_URL = "postgres://user:fake@127.0.0.1:1/none";
  try {
    await assert.rejects(withSource("db", () => getAllPosts("vi")), (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /\[content-store\] Không đọc được nội dung post\/vi từ DB/);
      assert.doesNotMatch(error.message, /fake/);
      return true;
    });
    await assert.rejects(withSource("db", () => getAboutData("en")), /\[content-store\]/);
    await assert.rejects(withSource("db", () => registry.getRegistrySlugs("ai")), /\[content-store\] Không đọc được nội dung slug_registry\/vi/);
    await assert.rejects(withSource("db", () => registry.getHomeContent("vi")), /\[content-store\]/);
  } finally {
    await closeDb();
    restoreEnv("DATABASE_URL");
  }
});

const baseUrl = process.env.TEST_DATABASE_URL;
const skip = !baseUrl
  ? "TEST_DATABASE_URL chưa đặt — bỏ qua parity loader file ↔ db"
  : isProductionDatabaseUrl(baseUrl)
    ? "TEST_DATABASE_URL trỏ DB prod — từ chối chạy"
    : false;

describe("loader chế độ db (DB đã import seed) = chế độ file", { skip }, () => {
  const databaseName = `nta_loader_test_${process.pid}_${Date.now()}`;
  let adminPool: Pool | undefined;
  let pool: Pool | undefined;

  before(async () => {
    adminPool = new Pool({ connectionString: baseUrl });
    await adminPool.query(`CREATE DATABASE "${databaseName}"`);
    const url = new URL(baseUrl ?? "");
    url.pathname = `/${databaseName}`;
    pool = new Pool({ connectionString: url.toString() });
    const db = drizzle(pool, { schema });
    await migrate(db, { migrationsFolder: path.resolve("drizzle") });
    await importRecords(db, await readFileSource());
    process.env.DATABASE_URL = url.toString();
  });

  after(async () => {
    await closeDb();
    await pool?.end();
    await adminPool?.query(`DROP DATABASE IF EXISTS "${databaseName}"`);
    await adminPool?.end();
    restoreEnv("DATABASE_URL");
  });

  for (const locale of LOCALES) {
    it(`mọi loader ${locale}: db deep-equal file`, async () => {
      const fromFile = await withSource("file", () => snapshotLoaders(locale));
      const fromDb = await withSource("db", () => snapshotLoaders(locale));
      assert.ok(fromFile.posts.length > 0 && fromFile.solutions.length > 0 && fromFile.products.length > 0 && fromFile.caseStudies.length > 0);
      assert.ok(fromFile.about);
      assert.deepStrictEqual(fromDb, fromFile);
    });
  }

  it("store: getEntry theo khoá; bản ghi xoá mềm không còn trong store lẫn loader", async () => {
    const [first] = await getEntries("post", "vi");
    assert.ok(first);
    assert.deepEqual(await getEntry("post", first.slug, "vi"), first);
    assert.equal(await getEntry("post", "khong-ton-tai", "vi"), null);

    await pool?.query("UPDATE content_entries SET deleted_at = now() WHERE collection = 'post' AND locale = 'vi' AND slug = $1", [first.slug]);
    assert.equal(await getEntry("post", first.slug, "vi"), null);
    const posts = await withSource("db", () => getAllPosts("vi"));
    assert.ok(!posts.some((post) => post.slug === first.slug));
    assert.equal(await withSource("db", () => getPostBySlug("vi", first.slug)), null);
  });

  it("registry db: thiếu key bắt buộc / singleton → lỗi [content-registry] rõ (không TypeError ở trang)", async () => {
    const hide = (collection: string, slug: string) =>
      pool?.query("UPDATE content_entries SET deleted_at = now() WHERE collection = $1 AND slug = $2 AND locale = 'en'", [collection, slug]);
    const restore = () => pool?.query("UPDATE content_entries SET deleted_at = NULL WHERE locale = 'en' AND collection IN ('listing_page', 'listing_cta', 'solution_overview', 'home')");
    try {
      await hide("listing_page", "ai");
      await hide("listing_cta", "caseStudies");
      await hide("solution_overview", "enterprise");
      await hide("home", "home");
      await assert.rejects(withSource("db", () => registry.getListingPages("en")), /\[content-registry\] Thiếu bản ghi listing_page\/en\/ai trong DB/);
      await assert.rejects(withSource("db", () => registry.getListingCtas("en")), /\[content-registry\] Thiếu bản ghi listing_cta\/en\/caseStudies/);
      await assert.rejects(withSource("db", () => registry.getSolutionOverview("en")), /\[content-registry\] Thiếu bản ghi solution_overview\/en\/enterprise/);
      await assert.rejects(withSource("db", () => registry.getHomeContent("en")), /\[content-registry\] Thiếu bản ghi home\/en\/home/);
    } finally {
      await restore();
    }
    assert.ok((await withSource("db", () => registry.getListingPages("en"))).ai);
  });
});
