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
- [ ] Khớp mockup ở 1440 (trừ thẻ Đăng ký nhận tin — ngoài phạm vi); 768 + 390 xếp đúng R-09a §Responsive, không scroll ngang
- [ ] Chip lọc đúng; tìm "tri tue"/"trí tuệ" cùng kết quả; `?category=guides&q=noi dung` deep-link đúng; key lạ → Tất cả
- [ ] Lọc rỗng → "Không có bài viết phù hợp" + xoá bộ lọc; chip không có bài vẫn hiện
- [ ] Không lọc: 3 bài nổi bật + lưới 1 bài còn lại; "Xem tất cả" cuộn tới lưới + reset lọc
- [ ] `role="status"` đọc số kết quả; focus ring thấy rõ; 0 console error
- [ ] typecheck + lint + build PASS; reviewer PASS
- [ ] Close-out: design-spec reconcile, `spec/test-scope/current.json` scope v22, progress, change doc → archive, BACKLOG done
