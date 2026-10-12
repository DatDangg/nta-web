# Task 01: Dữ liệu blog — category key + nhãn i18n, thời gian đọc, format ngày VI mới

> Nguồn: change `spec/changes/2026-10-13-blog-listing-redesign.md` (CR-003) · Spec: R-09 (clarify ngày), R-09a (§Kiểu dữ liệu, §Thời gian đọc)

## Phase
1 — Data/util (nền cho Task 02–03)

## Type
modification (post-build MODIFY + ADDITIVE)

## Classification / Risk
- Work item: FEATURE · Change type: **MODIFY** (đổi format ngày + kiểu category) + **ADDITIVE** (reading time)
- Scope: `src/content/types.ts` (`BlogCategory` union 6 key, `Post.category: BlogCategory`, `readingMinutes`),
  `src/lib/content/posts.ts` (validate key → throw khi lạ; tính `readingMinutes`), `src/lib/format/date.ts`
  (VI ghép tay `08 Th10, 2026`; EN giữ `Oct 8, 2026`; tính theo ISO, không lệch TZ), `src/content/blog/{vi,en}/*.mdx`
  (4×2 file: `category` → key), `src/i18n/messages/{vi,en}.json` (`blog.categories.*`, `blog.readingTime`),
  `src/components/blog/ArticleHeader.tsx` + `src/components/cards/PostCard.tsx` (badge = nhãn i18n).
- Review level: **STRICT** (shared util `date.ts` + type `Post` dùng ở list/detail/sitemap/RelatedPosts)
- Blast radius: `/blog`, `/blog/[slug]` (chuỗi ngày + nhãn badge), RelatedPosts (lọc cùng key — vẫn 0 bài liên quan
  như hiện tại), sitemap (chỉ dùng slug/date — không đổi), JSON-LD Article (ISO date — không đổi).
- Doc impact: docstring `date.ts`; design-spec Screen 11 (ví dụ ngày) — reconcile ở Task 03.
- Decision impact: category blog = key cố định + nhãn i18n (không còn chuỗi tự do theo locale).

## Acceptance Criteria
- [x] `formatPostDate('2026-10-08','vi')` = `08 Th10, 2026`; `('2026-03-15','vi')` = `15 Th3, 2026`; EN `Oct 8, 2026`
- [x] Key category lạ trong frontmatter → build/`getAllPosts` throw có đường dẫn file
- [x] `readingMinutes` = ceil(token/200), min 1 (4 bài hiện tại = 1)
- [x] Map: responsible-ai→`ai-tech`, digital-workflows→`practical`, learning-content→`guides`, first-steps→`nta-news` (vi+en)
- [x] Badge list + detail hiển thị nhãn i18n đúng locale; vi/en key parity
- [x] typecheck + lint + build PASS

## Verification Plan
`npm run typecheck` · `npm run lint` · `npm run build` · kiểm HTML build `/blog/first-steps` (vi/en) chuỗi ngày + badge.
`test_command: null` → kiểm format ngày bằng script node một lần (không thêm test framework).

## Feature Verification
- Acceptance: **PASS** · Reviewer: **PASS STRICT (round 1)** — 0 CRITICAL/MAJOR, 4 MINOR
- Verify: `npm run typecheck` = PASS · `npm run lint` = 0 errors (1 warning có sẵn `src/components/mdx/index.tsx:25`)
  · `npm run build` = PASS (cloud sandbox copy; stub `next/font` Inter chỉ trong bản build vì không có mạng Google Fonts —
  không commit. Máy dev: node_modules bản Windows + VM không mạng ⇒ không build được trong VM)
- HTML build: `/vi/blog/first-steps` "08 Th10, 2026" + badge "Hoạt động NTA"; `/en/...` "Oct 8, 2026" + "NTA activities";
  `/vi/blog` có "15 Th3, 2026"; reviewer chạy `formatPostDate` dưới TZ Kiritimati + Los_Angeles → không lệch ngày
- `test_command: null` → skip

## Residual risk (MINOR, non-blocking — reviewer r1)
- 6 key category khai 2 nơi (`types.ts` + `lib/blog/categories.ts`); `satisfies` không bắt thiếu key.
- `date` frontmatter chưa validate định dạng ISO (date sai → "NaN…", YAML không quote → Date object).
- Path trong message lỗi dựng từ `slug` (pattern có từ trước).
- `estimateReadingMinutes` export nhưng chỉ dùng nội bộ.

## Review
| Round | Verdict | Report |
|---|---|---|
| 1 | **PASS STRICT** (4 MINOR) | `.context/review-reports/feature-blog-listing-redesign-phase-1-task-01-round-1-review.md` |
