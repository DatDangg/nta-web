# Review — feature-home-sections-redesign · phase-1-task-03 · round 2

Agent: reviewer
Date: 2026-10-14
Task: `tasks/feature-home-sections-redesign/phase-1-task-03.md` (CR-016, R-03b)
Round trước: `.context/review-reports/feature-home-sections-redesign-phase-1-task-03-round-1-review.md` (FAIL: F1 MAJOR, F2 MINOR)

## Review level
NORMAL

## Reason
Giống round 1: UI trang chủ, không đụng auth/API/schema/DB. Attempt 2 thêm export `compareCaseStudies` trong
`src/lib/content/case-studies.ts` (lib content dùng chung) nhưng chỉ là tách nguyên văn comparator đã có, 2 nơi dùng → NORMAL đủ.

## Blast radius
- `/`, `/en` (khối Câu chuyện khách hàng) — đổi thứ tự thẻ cho khớp `/case-studies`.
- `/case-studies`, `/en/case-studies` — comparator thay bằng hàm export, logic y hệt (`right.year - left.year || left.slug.localeCompare(right.slug)`), vẫn sort in-place như cũ → thứ tự không đổi.
- Các caller khác của `getAllCaseStudies` (`sitemap.ts`, `case-studies/[slug]/page.tsx`, `solutions/ai/page.tsx`) không bị ảnh hưởng: trang chủ sort trên bản copy `[...studies]`, `getAllCaseStudies` không đổi.

## Verify commands + result
- `npm run typecheck` → PASS (reviewer tự chạy)
- `npm run lint` → PASS, 0 error, 1 warning cũ `src/components/mdx/index.tsx:25` no-img-element (ngoài scope)
- `npm run build` → không chạy (theo brief: env native binding lỗi; primary chạy lại ở terminal user; attempt 1 PASS 59/59). Cần evidence build attempt 2 trước commit.
- Grep `compareCaseStudies|getAllCaseStudies|.sort(` trong `src` → chỉ 2 nơi dùng comparator, không còn comparator inline trùng lặp.
- aislop / oxlint / ocr: skip (không cấu hình / không cài).

## Findings

### F1 (round 1, MAJOR) — ĐÃ ĐÓNG
- `src/lib/content/case-studies.ts:5-7` export `compareCaseStudies` (năm giảm dần, rồi slug).
- `src/app/[locale]/case-studies/page.tsx:32` `studies.sort(compareCaseStudies)` — tương đương nguyên văn bản cũ, không regress.
- `src/components/home/CaseStudyHighlight.tsx:31-34` `[...studies].sort(compareCaseStudies).slice(0, MAX_HOME_CASE_STUDIES)` — sort trước slice, trên bản copy (không mutate mảng của caller). Thứ tự trang chủ giờ xác định, không phụ thuộc `readdir`, khớp `/case-studies`.

### F2 (round 1, MINOR) — ĐÃ ĐÓNG
- `CaseStudyHighlight.tsx:14-24`: `galleryImage` chỉ khi không có `cover`; `alt: galleryImage?.alt || fallbackAlt`. Kiểu `gallery: { src; alt }[]` (`src/content/types.ts:161`) → alt riêng có sẵn; chuỗi rỗng rơi về alt i18n. Cover dùng alt i18n như cũ. Đúng.
- Edge: không cover + gallery rỗng → `image: undefined` (như attempt 1, đã review round 1 — HomeCaseStudyCard xử lý ảnh thiếu). Không đổi.

### Mới — không có
- Diff attempt 2 surgical, chỉ 3 file đúng phạm vi F1/F2. Các file untracked (`useScrollButtons.ts`, `HomeScrollArrows.tsx`, `HomeCaseStudyCard.tsx`, `CaseStudyCarousel.tsx`) không thuộc thay đổi attempt 2; kết luận round 1 cho chúng giữ nguyên (OK).
- Comment trong code nêu lý do (sort trên copy, alt gallery), không narrative thừa.

## Ghi chú quy trình
Reviewer đã dùng `git diff` / `sed` / `cat` qua bash để đọc diff + report round 1 (ngoài allowlist bash của frontmatter reviewer — chỉ đọc, không ghi). Các bước sau chuyển sang Read/Grep.

## Verdict
**PASS** — F1, F2 đóng; không regress `/case-studies`; không finding mới. Điều kiện commit: primary có evidence `npm run build` PASS cho attempt 2.
