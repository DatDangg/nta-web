import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// CR-038 (R-09a/R-09): nhãn thẻ highlight blog "Tin mới"/"Latest" + breadcrumb chi tiết tin kiểu pill.
// Render ArticleHeader cần mock next-intl + navigation → kiểm bằng nguồn/message, xem tasks/feature-ai-news-naming-images/phase-1-task-01.md.
const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("blog.highlightEyebrow là 'Tin mới' (vi) / 'Latest' (en)", () => {
  const vi = JSON.parse(read("../../i18n/messages/vi.json")) as { blog: { highlightEyebrow: string } };
  const en = JSON.parse(read("../../i18n/messages/en.json")) as { blog: { highlightEyebrow: string } };
  assert.equal(vi.blog.highlightEyebrow, "Tin mới");
  assert.equal(en.blog.highlightEyebrow, "Latest");
});

test("ArticleHeader dùng Breadcrumb variant pill như DetailHero", () => {
  assert.match(read("./ArticleHeader.tsx"), /<Breadcrumb\b[^>]*variant="pill"/);
});
