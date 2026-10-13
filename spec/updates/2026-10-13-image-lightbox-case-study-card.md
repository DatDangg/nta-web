# Spec Update — 2026-10-13 image-lightbox-case-study-card
**spec_version:** 3.8.0 → 3.9.0 (MINOR)
**Trigger:** feature-update (CR-013, ADDITIVE + MODIFY UI)
**Requirements:** THÊM **R-08d** (Module 6):
- **R-08d.1 — lightbox:** carousel ảnh `showcase.photos` (mọi variant) trong khung chi tiết dùng chung (R-08c) bấm mở lightbox
  `<dialog>` native: `object-contain`, alt/caption + bộ đếm "n / N"; đóng X / Esc / bấm nền; trước/sau bằng nút, ←/→, vuốt
  (vòng lặp đầu↔cuối); focus vào dialog khi mở, trả về ảnh đã bấm khi đóng; khoá cuộn; `motion-safe`; không thêm thư viện.
  Ngoài phạm vi: hero, `ScreenMock`/`VmsMock`, `ImageGallery` biến thể `default`.
- **R-08d.2 — thẻ `/case-studies`:** `ListingCard` kind `photo` — ảnh cover banner ngang 16/10 trên đầu thẻ, chữ bên dưới full
  width, thẻ cao đều. Kind `phone`/`window` không đổi.
**Thay đổi code:** `src/components/ui/Lightbox.tsx` (mới), `src/components/case-studies/showcase/ShowcasePhotos.tsx`,
`src/i18n/messages/{vi,en}.json`, `src/components/listing/ListingCard.tsx` — commit `c3ca0e6` (task 01), `03f371b` (task 02).
**Ảnh hưởng:** `/case-studies` (listing), `/case-studies/[slug]` showcase, `/solutions/enterprise/[slug]`, `/solutions/ai/[slug]`,
`/products/[slug]` (vi/en). Không đổi API/schema/route. `.context/design-spec.md` Screen 9 ghi chú lightbox áp dụng cho carousel showcase.
**Nguồn:** `spec/changes/archive/2026-10-13-image-lightbox-case-study-card.md`.
