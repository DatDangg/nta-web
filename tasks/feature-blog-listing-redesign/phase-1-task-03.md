# Task 03: Thanh lọc + tìm kiếm (URL), khối nổi bật, lưới "Bài viết mới nhất" + close-out

> Nguồn: CR-003 · Spec: R-09a §2–4 + §Chi tiết hành vi · Ref: `refs/mockup-blog-listing.png`

## Phase
1 — UI + close-out (phụ thuộc Task 01)

## Type
modification + addition

## Classification / Risk
- Change type: **MODIFY** (`/blog` listing) + **ADDITIVE** (lọc/tìm/nổi bật)
- Scope (mới, `src/components/blog/`): `BlogListing.tsx` (client: đọc/ghi `?category&q&page` bằng `router.replace`,
  debounce 300ms, lọc AND, chuẩn hoá bỏ dấu + `đ→d`, page size 12), `BlogToolbar.tsx` (chip `aria-pressed` trong
  `role="group"`, hàng chip cuộn ngang mobile, search `type="search"` + label sr-only), `FeaturedPosts.tsx`
  (1 lớn + ≤2 nhỏ + thẻ NỔI BẬT, nút "Xem tất cả bài viết" → cuộn + focus tiêu đề mục, reduced-motion),
  `BlogPostCard.tsx` (biến thể `large | compact | grid`: badge, ngày, phút đọc, "Đọc thêm →"), `lib/blog/filter.ts`
  (hàm thuần normalize/filter/paginate). Sửa: `src/app/[locale]/blog/page.tsx` (render `BlogListing` trong Suspense,
  fallback SSR = trạng thái không lọc), xoá dùng `BlogFilter` (file giữ hay bỏ → reviewer quyết theo dead-code).
  `messages/{vi,en}` (chip, search, featured card, latest, readMore, results, filterEmpty, clearFilters).
- Review level: **NORMAL** (`PostCard` + `Pagination` không đổi hành vi; `Pagination` giữ query params khác)
- Blast radius: `/blog`, `/en/blog` (dưới hero). Detail page không đụng.
- Doc impact (close-out): `.context/design-spec.md` Screen 10 (layout/components/page size 12/responsive/states/a11y/
  copy/URL) + Screen 11 (ví dụ ngày) + §1.9 components; `SPECIFICATIONS.md` không đổi thêm; `docs/DESIGN.md` nếu có mô tả listing.

## Acceptance Criteria
- [x] Khớp mockup ở 1440 (trừ thẻ Đăng ký nhận tin — ngoài phạm vi); 768 + 390 xếp đúng R-09a §Responsive, không scroll ngang
- [x] Chip lọc đúng; tìm "tri tue"/"trí tuệ" cùng kết quả; `?category=guides&q=noi dung` deep-link đúng; key lạ → Tất cả
- [x] Lọc rỗng → "Không có bài viết phù hợp" + xoá bộ lọc; chip không có bài vẫn hiện
- [x] Không lọc: 3 bài nổi bật + lưới 1 bài còn lại; "Xem tất cả" cuộn tới lưới + reset lọc
- [x] `role="status"` đọc số kết quả; focus ring thấy rõ; 0 console error
- [x] typecheck + lint + build PASS; reviewer PASS
- [x] Close-out: design-spec reconcile, `spec/test-scope/current.json` scope v22, progress, change doc → archive, BACKLOG done

## Feature Verification
- Acceptance: **PASS** · Reviewer: **FAIL r1 (MAJOR-1 race debounce) → PASS NORMAL r2** · Phase spec-validation: **PASS**
- Verify: `npm run typecheck` = PASS · `npm run lint` = 0 errors (1 warning có sẵn mdx/index.tsx) · `npm run build` = PASS
  (sandbox, stub `next/font` Inter — không commit) · Playwright `next start`: `func.mjs` 14 kịch bản (chip, tìm bỏ dấu, AND,
  rỗng + xoá lọc, gõ chậm, deep-link, key lạ/page vượt, q rỗng, Xem tất cả → focus `#blog-latest-title`) + `race.mjs`
  (gõ + chip / xoá lọc khi RSC chậm 350–600ms) PASS; 375/390/768/1024/1280/1440 không scroll ngang; 0 console error.
- `test_command: null` → skip (đề xuất unit test `lib/blog/filter.ts` khi có framework).

## Điều chỉnh trong lúc build
- Ghi URL lọc/tìm bằng `history.replaceState` thay `router.replace` (fix MAJOR-1: timer debounce cũ ghi đè chip/xoá lọc khi
  vòng server chậm). Spec R-09a §URL + design-spec Screen 10 cập nhật wording.
- `?page=99` khi chỉ 1 trang → dùng page đã kẹp để vẫn hiện khối nổi bật.
- Xoá `BlogFilter.tsx` + key `blog.intro` (dead code sau change).

## Residual risk (MINOR, non-blocking)
- `motion-safe:ease-out-expo` không sinh CSS (lỗi token toàn repo) — task riêng.
- `Pagination` chung dùng `router.push` (thêm history) — spec ghi rõ chỉ chip/từ khoá dùng replaceState; cần user xác nhận.
- Focus ring chip đang active khó thấy (global `*:focus-visible`, giống `ListingExplorer`).
- Chưa test runtime trang ≥2 / 0 bài / ≤3 bài (chỉ 4 bài) — đã đọc code.

## Review
| Round | Verdict | Report |
|---|---|---|
| 1 | FAIL (1 MAJOR, 3 MINOR) | `.context/review-reports/feature-blog-listing-redesign-phase-1-task-03-round-1-review.md` |
| 2 | **PASS NORMAL** (MAJOR-1, MINOR-2 fixed) | `.context/review-reports/feature-blog-listing-redesign-phase-1-task-03-round-2-review.md` |
| phase | **PASS** spec-validation | `.context/review-reports/feature-blog-listing-redesign-phase-1-spec-validation.md` |
