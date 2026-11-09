// Fallback locale ja → en (R-20a.2/.3, CR-044 P2-T02) ở tầng loader/registry (chế độ file) + request i18n.
// Nằm ở tools/db vì cần stub `server-only`/`next/cache` (test-stubs/register.ts). Phần db dùng reader stub: src/lib/content/locale-fallback.test.ts.
import "./test-stubs/register";
import assert from "node:assert/strict";
import { test } from "node:test";
import { hasLocale } from "next-intl";
import enMessages from "../../src/i18n/messages/en.json";
import jaMessages from "../../src/i18n/messages/ja.json";
import { routing } from "../../src/i18n/routing";
import { COMPANY_CONTACT } from "../../src/lib/contact/company-info";
import { getAboutData } from "../../src/lib/content/about";
import { getAllCaseStudies, getCaseStudyBySlug } from "../../src/lib/content/case-studies";
import { getAllPosts, getPostBySlug } from "../../src/lib/content/posts";
import { getAllProducts, getProductBySlug } from "../../src/lib/content/products";
import * as registry from "../../src/lib/content/registry";
import { getAllSolutions, getSolutionBySlug } from "../../src/lib/content/solutions";
import { buildUiMessages } from "../../src/lib/content/ui-data";

const savedSource = process.env.CONTENT_SOURCE;

async function withFileSource<T>(read: () => Promise<T>): Promise<T> {
  process.env.CONTENT_SOURCE = "file";
  try {
    return await read();
  } finally {
    if (savedSource === undefined) delete process.env.CONTENT_SOURCE;
    else process.env.CONTENT_SOURCE = savedSource;
  }
}

test("file: collection MDX ja (chưa có thư mục ja) = bản en, không ném lỗi", () =>
  withFileSource(async () => {
    assert.deepEqual(await getAllSolutions("ja"), await getAllSolutions("en"));
    assert.deepEqual(await getAllProducts("ja"), await getAllProducts("en"));
    assert.deepEqual(await getAllCaseStudies("ja"), await getAllCaseStudies("en"));
    assert.deepEqual(await getAllPosts("ja"), await getAllPosts("en"));
    assert.deepEqual(await getAboutData("ja"), await getAboutData("en"));
  }));

test("file: chi tiết ja theo slug = bản en; slug không có ở cả hai → null (trang 404)", () =>
  withFileSource(async () => {
    const [solution] = await getAllSolutions("en");
    assert.deepEqual(await getSolutionBySlug("ja", solution.slug), await getSolutionBySlug("en", solution.slug));
    const [product] = await getAllProducts("en");
    assert.deepEqual(await getProductBySlug("ja", product.slug), await getProductBySlug("en", product.slug));
    const [study] = await getAllCaseStudies("en");
    assert.deepEqual(await getCaseStudyBySlug("ja", study.slug), await getCaseStudyBySlug("en", study.slug));
    const [post] = await getAllPosts("en");
    assert.deepEqual(await getPostBySlug("ja", post.slug), await getPostBySlug("en", post.slug));

    assert.equal(await getSolutionBySlug("ja", "khong-ton-tai"), null);
    assert.equal(await getProductBySlug("ja", "khong-ton-tai"), null);
    assert.equal(await getCaseStudyBySlug("ja", "khong-ton-tai"), null);
    assert.equal(await getPostBySlug("ja", "khong-ton-tai"), null);
  }));

test("file: registry object TS ja (không có bản ja trong seed) = bản en", () =>
  withFileSource(async () => {
    assert.deepEqual(await registry.getHomeContent("ja"), await registry.getHomeContent("en"));
    assert.deepEqual(await registry.getListingPages("ja"), await registry.getListingPages("en"));
    assert.deepEqual(await registry.getListingItems("ja"), await registry.getListingItems("en"));
    assert.deepEqual(await registry.getListingCtas("ja"), await registry.getListingCtas("en"));
    assert.deepEqual(await registry.getListingLabels("ja"), await registry.getListingLabels("en"));
    assert.deepEqual(await registry.getSolutionOverview("ja"), await registry.getSolutionOverview("en"));
  }));

test("file: vi/en không đổi (không bị fallback chạm vào)", () =>
  withFileSource(async () => {
    assert.notDeepEqual(await registry.getHomeContent("vi"), await registry.getHomeContent("en"));
    assert.notDeepEqual(await getAllSolutions("vi"), await getAllSolutions("en"));
  }));

// getRequestConfig của next-intl chỉ chạy trong React Server (ném lỗi ngoài Next) → kiểm đúng 2 mắt xích request.ts dùng:
// chọn locale theo routing.locales + import động messages/<locale>.json.
test("request: routing nhận ja (vi mặc định, as-needed); locale lạ → không hỗ trợ", () => {
  assert.deepEqual([...routing.locales], ["vi", "en", "ja"]);
  assert.equal(routing.defaultLocale, "vi");
  assert.equal(routing.localePrefix, "as-needed");
  assert.equal(hasLocale(routing.locales, "ja"), true);
  assert.equal(hasLocale(routing.locales, "fr"), false);
});

test("request file: import động messages/ja.json (như readFileMessages) = ja.json", async () => {
  const locale: string = "ja";
  const messages = (await import(`../../src/i18n/messages/${locale}.json`)).default;
  assert.deepEqual(messages, jaMessages);
});

test("request db (stub bản ghi): chưa có ui_messages/ja → giữ ja.json, KHÔNG lấy chữ en, tối đa 1 cảnh báo", () => {
  const warnings: string[] = [];
  const messages = buildUiMessages([], jaMessages, "ui_messages/ja", (message) => warnings.push(message));
  assert.deepEqual(messages, jaMessages);
  assert.notDeepEqual(messages, enMessages);
  assert.ok(warnings.length <= 1);
});

test("company_info file mode: ja dùng cùng hằng COMPANY_CONTACT", async () => {
  const { getCompanyContact } = await import("../../src/lib/contact/company-contact");
  assert.deepEqual(await withFileSource(() => getCompanyContact("ja")), COMPANY_CONTACT);
});
