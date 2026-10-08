---
id: fix-blog-list-date-format
type: feature
status: done
created: 2026-10-09
---

# Fix format ngày blog list cho khớp detail + design S11 (C-L2-1 từ phase review Layer 2)

## Yêu cầu
Sửa conflict **C-L2-1 (MED)** do spec-validator phase review Layer 2 phát hiện
(`.context/review-reports/feature-nta-website-layer-2-round-1-spec-review.md`):

- **Hiện trạng:** blog **list** (`src/components/cards/PostCard.tsx:20`) format ngày bằng
  `Intl.DateTimeFormat(locale, { dateStyle: 'medium' })` → VI ra `"8 thg 10, 2026"`.
  Trong khi blog **detail** (`src/components/blog/ArticleHeader.tsx:8`) format VI `dd/mm/yyyy`
  → `"08/10/2026"`; design S11 (`.context/design-spec.md:487`) yêu cầu VI `08/10/2026`, EN `Oct 8, 2026`.
- **Yêu cầu:** thống nhất format ngày hiển thị giữa blog list và blog detail = design S11
  (VI `dd/mm/yyyy`, EN `Oct 8, 2026`). Ưu tiên **1 nguồn format dùng chung** (date util) để tránh lệch lại.

## Phạm vi
- `src/components/cards/PostCard.tsx` (blog list card + RelatedPosts dùng chung) — đổi format ngày.
- `src/components/blog/ArticleHeader.tsx` — dùng cùng nguồn format (nếu tách util).
- (tùy chọn) util mới `src/lib/format/date.ts` hoặc tương đương nếu hợp pattern repo.

> Lưu ý blast radius: `PostCard` dùng ở `BlogFilter`, `RelatedPosts`, `blog/page.tsx` fallback
> (đều là surface blog). Không đụng format ngày của `CaseStudyCard` (chỉ hiển thị năm — design S8).

## Acceptance (bắt buộc)
- [ ] Blog list VI hiển thị `08/10/2026` (dd/mm/yyyy), EN `Oct 8, 2026` — khớp detail + design S11
- [ ] Blog detail giữ đúng format (không regression)
- [ ] 1 nguồn format dùng chung (không copy logic 2 nơi) — hoặc lý do không tách
- [ ] `npm run lint` · `npm run typecheck` · `npm run build` PASS; static HTML blog list còn SSG
- [ ] Reviewer độc lập PASS cho task modification

## Ghi chú
- Nguồn: spec-validator phase review Layer 2 round 1 (FAIL) — conflict C-L2-1 MED.
- Tham chiếu: R-24 (a11y `<time>`), design S11, R-09.
- Các gap khác (M-2 related content, M-4 CTAForm defer Layer 3, residual SSG pagination) **không** thuộc change này.
- Routing: post-build MODIFY → agent `change-request`.
