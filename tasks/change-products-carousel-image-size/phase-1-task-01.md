# Task 01: `/products` — phóng to ảnh poster (carousel 1 ảnh/slide)

> Nguồn: change `spec/changes/2026-10-12-products-carousel-image-size.md`

## Phase
1

## Type
modification (post-build MODIFY — UI/layout)

## Goal

Ảnh poster 2 app trên `/products` to lên rõ rệt (≈3×) bằng cách cho mỗi ảnh chiếm **trọn cột media**
(bỏ `md:w-1/2 lg:w-1/3`, slide về `w-full`), **giữ nguyên** bố cục card 2 cột. Cập nhật `sizes` của
`next/image` cho khớp layout 1-up.

## Classification / Risk
- Work item: FEATURE · Change type: **MODIFY** (post-build)
- Scope: `src/components/products/ScreenshotCarousel.tsx` (1 file)
- Review level: **NORMAL** (1 component riêng, 1 trang, không shared/API/auth/schema/tenant)
- Blast radius: `/products` + `/en/products` (grep xác nhận `ScreenshotCarousel` chỉ dùng ở đây)
- Doc impact: **none** (`docs/DESIGN.md` screen "Sản phẩm App" chỉ liệt kê component, không ghi tỉ lệ/bố cục ảnh)
- Decision impact: none (user đã chốt hướng — 1 ảnh/slide)

## Root cause (đã điều tra)

Ảnh bị lồng **3 tầng co giãn** nhân lại ≈ 1/12 bề ngang container:

| Tầng | File:line | Hiệu ứng |
|---|---|---|
| Page grid | `src/app/[locale]/products/page.tsx:49` | `lg:grid-cols-2` → mỗi AppCard ≈ 1/2 container |
| Card layout | `src/components/cards/AppCard.tsx:18` | `md:grid-cols-2` → cột media ≈ 1/2 card |
| Carousel slide | `src/components/products/ScreenshotCarousel.tsx:63` | `w-full md:w-1/2 lg:w-1/3` → mỗi slide ≈ 1/3 cột media |

Mỗi sản phẩm hiện chỉ có **1 screenshot** → carousel chỉ 1 slide nhưng vẫn bị ép còn 1/3 cột media
→ poster 9/16 ≈ 85–100px bề ngang.

## Description

1. **`ScreenshotCarousel.tsx:63`** — slide wrapper: đổi `"w-full shrink-0 snap-start md:w-1/2 lg:w-1/3"`
   → `"w-full shrink-0 snap-start"` (mỗi ảnh chiếm trọn cột media).
2. **`ScreenshotCarousel.tsx:67`** — `sizes`: đổi
   `"(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"`
   → `"(min-width: 1024px) 256px, (min-width: 768px) 45vw, 100vw"`
   (cột media ≈ 254px ở ≥1280 theo `max-w-container: 1280px` — xem spec-validation §5).
3. **KHÔNG đổi**: `products/page.tsx` (`lg:grid-cols-2`), `AppCard.tsx` (`md:grid-cols-2`),
   `cardPosterImageClass` (`aspect-[9/16]` dùng chung `ProductCard`), `ProductCard`, dots/arrows/scroll-snap.
4. **KHÔNG đụng** `src/components/layout/Header.tsx` (dirty sẵn ngoài scope — không revert/stage).

## Acceptance Criteria
- [x] Slide carousel là 1 ảnh/slide (`w-full`), không còn `md:w-1/2 lg:w-1/3`
- [x] Ảnh poster to lên rõ rệt (≈3×) trong cột media; không crop (khung `aspect-[9/16]` trong `cardPosterImageClass`)
- [x] Bố cục card 2 cột giữ nguyên (`AppCard` + page grid không đổi)
- [x] `sizes` khớp layout 1-up
- [x] Carousel dots/arrow/scroll-snap/a11y giữ nguyên
- [x] `/products` + `/en/products`: ảnh render, không méo/overflow
- [x] lint · typecheck · build PASS; reviewer PASS

## Verification Plan
- Commands (`.context/project-config.md`): `npm run lint` · `npm run typecheck` · `npm run build`
- `git diff` xác nhận chỉ 1 file source đổi trong scope + không đụng Header.tsx
- HTML build (`.next/server/app/[locale]/products.html` nếu có) — kiểm tra class `md:w-1/2`/`lg:w-1/3` **vắng mặt**
  trong slide carousel + `sizes` mới xuất hiện
- Grep xác nhận `ProductCard`/`AppCard`/`page.tsx` không đổi

## Feature Verification
- Acceptance: PASS · Verify: PASS (primary chạy thật) · Reviewer: PASS NORMAL (round-1, report `change-products-carousel-image-size-phase-1-task-01-round-1-review.md`)
- `npm.cmd run lint` = 0 errors (1 warning pre-existing `src/components/mdx/index.tsx`, ngoài scope)
- `npm.cmd run typecheck` = PASS
- `npm.cmd run build` = PASS (exit 0; 51 route SSG + `/[locale]/products`)
- HTML build VI+EN (`.next/server/app/vi/products.html`): `md:w-1/2`=0 · `lg:w-1/3`=0 · `w-full shrink-0 snap-start`=2 · `sizes (min-width: 1024px) 256px`=2 · `aspect-[9/16]`=2 ⇒ ảnh full cột media, không crop.
- `git diff`: chỉ 2 dòng / 1 file trong scope; `Header.tsx` dirty sẵn **không** bị đụng.
- MINOR-1 (magic number `256px`) — chấp nhận, khớp `max-w-container` (giá trị đã comment trong task/spec-validation); non-blocking.
- MINOR-3 (mobile `100vw` overfetch ~10–25%) — an toàn, non-blocking.
- Residual: chưa render browser thật 375/768/1280 (mới CSS math + HTML build).

## Retry / Escalation
- Attempt: 0 · Escalation: sau 3 attempt fail → `architecture_review_needed`
- Env caveat: nested subagent bị chặn (depth=1) → builder/reviewer/spec-validator chạy **INLINE**
  (round-1 self-review) như các change trước.

## DoD
- [x] Code written trong scope · [x] Check commands pass · [x] Reviewer PASS
- [x] `.context/progress.json` updated · [x] Doc impact recorded (none)
- [x] `spec/test-scope/current.json` sinh (scopeVersion +1)
- [x] committed — 1 task = 1 commit (branch `main`, **KHÔNG push**)

## Files to Modify
- `src/components/products/ScreenshotCarousel.tsx`
