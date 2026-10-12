# Spec Update — 2026-10-12 products-carousel-image-size

**spec_version:** 3.0.0 → 3.0.0 (**KHÔNG bump — không đổi requirement/behavior contract**)
**Trigger:** feature-update (change-request, class MODIFY UI/layout)
**Change:** `spec/changes/archive/2026-10-12-products-carousel-image-size.md` (risk LOW)
**Tasks:** T01 `ScreenshotCarousel` slide 1-up + `sizes` — **done**, review PASS (NORMAL)
**Nguồn:** mô tả trực tiếp của user (ảnh poster `/products` quá bé)

## Requirements

- **KHÔNG thêm/sửa/xoá requirement nào.** `SPECIFICATIONS.md` giữ nguyên 27 req R-01…R-27.
  - R-07 (`/products`: mô tả, ảnh/screenshot, kênh tải) **không đổi ngữ nghĩa** — vẫn render ảnh.
  - R-23 (responsive) / R-24 (a11y) **không đổi** — giữ nguyên breakpoint, alt, role, dots/arrow.
- **Lý do KHÔNG bump:** theo `docs/SPEC_VERSIONING.md` — chỉ đổi **layout hiển thị** (cách bố trí ảnh trong
  cột media), không requirement nào thêm/sửa/xoá/đổi ngữ nghĩa.

## Thay đổi

### T01 — `src/components/products/ScreenshotCarousel.tsx` (2 dòng)
- Slide wrapper: `"w-full shrink-0 snap-start md:w-1/2 lg:w-1/3"` → `"w-full shrink-0 snap-start"`.
  Mỗi ảnh chiếm **trọn cột media** (thay vì 1/3) → poster 9/16 to lên ≈3×.
- `next/image` `sizes`: `"(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"`
  → `"(min-width: 1024px) 256px, (min-width: 768px) 45vw, 100vw"` (khớp cột media ≈254px ở ≥1280 theo
  `max-w-container: 1280px`).
- **KHÔNG đổi:** `products/page.tsx` (`lg:grid-cols-2`), `AppCard.tsx` (`md:grid-cols-2`),
  `cardPosterImageClass` (`aspect-[9/16]`, dùng chung `ProductCard`), dots/arrows/scroll-snap.

### Root cause
Ảnh lồng 3 tầng co giãn → ≈1/12 bề ngang container: page `lg:grid-cols-2` × AppCard `md:grid-cols-2`
× slide `lg:w-1/3`; poster 9/16 ≈ 85–100px bề ngang.

## Test scope (v14)

- **Trang bị đổi:** `/products` + `/en/products` (slide carousel 1-up, `sizes` mới).
- **Blast radius:** `ScreenshotCarousel` chỉ dùng ở `/products` (+`/en/products`) — grep xác nhận.
- **Regression cần giữ:** `ProductCard` (trang chủ) dùng `cardPosterImageClass` khác nhánh → không hồi quy;
  4 trang enterprise + các carousel/section khác không đụng; khung 9/16 không crop poster.
- Verify: `npm.cmd run lint` (0 errors, 1 warning pre-existing `src/components/mdx/index.tsx`) · `typecheck`
  · `build` PASS; HTML build VI+EN xác nhận `md:w-1/2`=0, `lg:w-1/3`=0, `w-full shrink-0 snap-start`=2,
  `sizes … 256px`=2, `aspect-[9/16]`=2.
- `check-left-align` / test framework: **skip** — `test_command: null`.

## Phân tích

- **Không blocker.** Diff 2 dòng, 1 file; bố cục card 2 cột giữ nguyên theo user chốt.
- Residual: chưa render browser thật 375/768/1280 (mới CSS math + HTML build); `sizes` mobile overfetch
  ~10–25% (an toàn, non-blocking).
