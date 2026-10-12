# 2026-10-12 — `/products`: phóng to ảnh poster (carousel 1 ảnh/slide)

- **Class:** MODIFY (post-build, UI/layout) — KHÔNG đổi requirement
- **Risk:** LOW — 1 component riêng (`ScreenshotCarousel`), chỉ dùng ở 1 trang (`/products`)
- **Trạng thái:** ✅ DONE (archived 2026-10-12) — T01 PASS review, scope v13→v14
- **Nguồn:** mô tả trực tiếp của user (không qua `spec/changes/`)
- **Nhánh:** `main` (staging-direct)· **KHÔNG push**

## 1. Vấn đề

Ảnh poster 2 app (`music-app`, `hair-style-ai`) trên `/products` hiển thị **quá bé** (~85–100px bề ngang).

Root cause — ảnh bị lồng **3 tầng co giãn**, nhân lại còn ≈ 1/12 bề ngang container:

| Tầng | File:line | Hiệu ứng |
|---|---|---|
| Page grid | `src/app/[locale]/products/page.tsx:49` | `lg:grid-cols-2` → mỗi AppCard ≈ 1/2 container |
| Card layout | `src/components/cards/AppCard.tsx:18` | `md:grid-cols-2` → cột media ≈ 1/2 card |
| Carousel slide | `src/components/products/ScreenshotCarousel.tsx:63` | `w-full md:w-1/2 lg:w-1/3` → mỗi slide ≈ 1/3 cột media |

Ảnh là poster **dọc 9/16** (`cardPosterImageClass`, `src/components/cards/cardStyles.ts:11`).
Mỗi sản phẩm hiện chỉ có **1 screenshot** → carousel chỉ có 1 slide, nhưng slide vẫn bị ép còn 1/3 cột media.

## 2. Hướng sửa (user đã chốt — KHÔNG tự đổi)

**Carousel hiển thị 1 ảnh/slide**: bỏ `md:w-1/2 lg:w-1/3` ở slide, cho slide về `w-full` để mỗi ảnh
chiếm **trọn cột media** (to gấp ~3 lần). **GIỮ NGUYÊN** bố cục card 2 cột (không đổi `lg:grid-cols-2`
của page, không đổi `md:grid-cols-2` cột media của AppCard).

Phụ (khuyến nghị, cùng task): `sizes` prop của `next/image` trong carousel đang là
`"(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"` — khớp layout **3-up cũ**. Khi slide còn
**1-up**, cập nhật `sizes` cho đúng bề rộng cột media để `next/image` chọn kích thước tối ưu
(tránh tải ảnh lớn hơn cần thiết / tránh mờ).

## 3. Spec delta

- **KHÔNG thêm/sửa/xoá requirement nào.** `SPECIFICATIONS.md` giữ nguyên 27 req R-01…R-27; R-07
  (`/products`: mô tả, ảnh/screenshot, kênh tải) **không đổi ngữ nghĩa**.
- Đây thuần **layout hiển thị** (cách bố trí ảnh trong cột media), không đổi contract/hành vi.
- **Lý do KHÔNG bump `spec_version`:** theo `docs/SPEC_VERSIONING.md` — không requirement nào
  thêm/sửa/xoá/đổi ngữ nghĩa. Vẫn **sinh `spec/test-scope/current.json`** (`scopeVersion` +1) để
  template test biết vùng vừa sửa (theo `.agent/spec-publish.md` rule 2).

## 4. Acceptance

- [ ] Mỗi slide carousel chiếm 1 ảnh/slide (bỏ `md:w-1/2 lg:w-1/3`, về `w-full`)
- [ ] Ảnh poster to lên rõ rệt (≈ 3×) trong cột media; **không crop** (khung 9/16 khớp poster)
- [ ] Bố cục card 2 cột giữ nguyên (`AppCard` + `products/page.tsx` không đổi grid)
- [ ] `sizes` của `next/image` khớp layout 1-up
- [ ] Scroll/dots/arrow a11y không hồi quy (carousel vẫn dùng được)
- [ ] `/products` + `/en/products`: overflow 0, không méo ảnh
- [ ] lint · typecheck · build PASS; reviewer PASS

## 5. Task breakdown

- **T01** — `ScreenshotCarousel.tsx`: slide `w-full` + cập nhật `sizes` → builder → reviewer
  (NORMAL; 1 component, 1 trang, không shared/API/auth/schema).

## 6. Doc impact

`docs/DESIGN.md` screen "Sản phẩm App" chỉ liệt kê component, không ghi tỉ lệ/bố cục ảnh → **no doc impact**.
