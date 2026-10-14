import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// Hồi quy CR-026 + CR-032: /en/<section>/<slug sai> trả 500 thay vì 404.
// Slug sai → generateMetadata của page gọi notFound() → Next resolve metadata của boundary not-found
// trong ngữ cảnh ISR on-demand (static) mà cache locale của next-intl còn trống → getTranslations()
// rơi về headers() → "Page changed from static to dynamic at runtime" → 500.
// Vì vậy metadata của not-found phải tĩnh, không gọi API next-intl phụ thuộc request.
// Xem tasks/bug-en-invalid-slug-500/phase-1-task-01.md.
const source = readFileSync(new URL("./not-found.tsx", import.meta.url), "utf8");

test("not-found does not export generateMetadata (would call next-intl → headers() in ISR)", () => {
  assert.doesNotMatch(source, /export\s+(async\s+)?function\s+generateMetadata\b/);
  assert.doesNotMatch(source, /export\s+const\s+generateMetadata\b/);
});

test("not-found exports static metadata: absolute title '404 | NTA' + noindex", () => {
  const match = source.match(/export\s+const\s+metadata\b[\s\S]*?\n\};/);
  assert.ok(match, "missing `export const metadata`");
  const block = match[0];
  assert.match(block, /title:\s*\{\s*absolute:\s*'404 \| NTA'\s*\}/);
  assert.match(block, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false\s*\}/);
  assert.doesNotMatch(block, /getTranslations|getLocale|getMessages/);
});
