import assert from "node:assert/strict";
import { test } from "node:test";
import { CANONICAL_SITE_URL, resolveSiteUrl } from "./seo";

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
