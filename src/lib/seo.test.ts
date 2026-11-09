import assert from "node:assert/strict";
import { test } from "node:test";
import { BASE_URL, CANONICAL_SITE_URL, createLocaleAlternates, LANGUAGE_TAG, localeHref, OG_LOCALE, resolveSiteUrl } from "./seo";
import { createWebSiteJsonLd } from "./seo/jsonld";

// Docker build không truyền build-arg → NEXT_PUBLIC_SITE_URL = "" (không phải undefined);
// `new URL("")` trong layout làm hỏng prerender. Xem tasks/feature-content-database/investigate-flaky-build.md.
test("unset, empty or whitespace NEXT_PUBLIC_SITE_URL falls back to the canonical URL", () => {
  assert.equal(CANONICAL_SITE_URL, "https://ntavietnam.tech");
  for (const raw of [undefined, "", "   ", "\n\t"]) {
    assert.equal(resolveSiteUrl(raw), CANONICAL_SITE_URL, JSON.stringify(raw));
  }
});

test("a configured NEXT_PUBLIC_SITE_URL is kept as-is (trimmed)", () => {
  assert.equal(resolveSiteUrl("https://staging.example.test"), "https://staging.example.test");
  assert.equal(resolveSiteUrl("  https://ntavietnam.tech  "), "https://ntavietnam.tech");
});

test("createLocaleAlternates: hreflang vi/en/ja + x-default = vi (CR-044)", () => {
  const { languages } = createLocaleAlternates("about") as { languages: Record<string, string> };
  assert.deepEqual(Object.keys(languages).sort(), ["en", "ja", "vi", "x-default"]);
  assert.equal(languages.vi, `${BASE_URL}/about`);
  assert.equal(languages.en, `${BASE_URL}/en/about`);
  assert.equal(languages.ja, `${BASE_URL}/ja/about`);
  assert.equal(languages["x-default"], languages.vi);
});

test("localeHref: vi không prefix (trang chủ '/'), en/ja có prefix", () => {
  assert.equal(localeHref("vi"), "/");
  assert.equal(localeHref("vi", "/contact"), "/contact");
  assert.equal(localeHref("en"), "/en");
  assert.equal(localeHref("ja", "blog/x"), "/ja/blog/x");
});

test("LANGUAGE_TAG / OG_LOCALE có ja", () => {
  assert.equal(LANGUAGE_TAG.ja, "ja-JP");
  assert.equal(OG_LOCALE.ja, "ja_JP");
  assert.equal(createWebSiteJsonLd("ja").inLanguage, "ja-JP");
  assert.equal(createWebSiteJsonLd("vi").inLanguage, "vi-VN");
  assert.equal(createWebSiteJsonLd("en").inLanguage, "en-US");
});
