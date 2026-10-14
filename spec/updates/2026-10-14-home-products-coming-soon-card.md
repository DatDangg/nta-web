# Spec update — 2026-10-14 · change `home-products-coming-soon-card`

- **Spec version**: 3.13.0 → **3.14.0** (MINOR — thêm behavior vào R-03a)
- **Scope version**: v43 → **v44** (`feature-update`)
- **Trigger**: `feature-update` (change-request CR-021, ADDITIVE UI)
- **Change file**: `spec/changes/archive/2026-10-14-home-products-coming-soon-card.md`
- **Task**: `tasks/feature-home-products-coming-soon-card/phase-1-task-01.md` (commit `769a4a2`)
- **Review**: `.context/review-reports/feature-home-products-coming-soon-card-phase-1-task-01-round-2-review.md`, round 2 **PASS**
  (round 1 FAIL F-1: thẻ CTA không rộng bằng thẻ sản phẩm ở lg+ → wrapper `flex` → `grid`)
- Ghi chú: CR-021 chạy song song CR-019 (3.13.0 · v43) → nhận 3.14.0 · v44.

## Thay đổi

**SỬA R-03a** (khối Sản phẩm tiêu biểu trang chủ) — thêm đoạn `(3.14.0 — CR-021)`:
- Cuối dải, sau thẻ sản phẩm cuối, có 1 thẻ CTA viền đứt "Sắp có thêm ứng dụng mới" / "More apps coming soon"
  (`ListingCtaCard` + `listingCtas[locale].products`, icon `plus`, nút "Liên hệ đội ngũ NTA" / "Contact the NTA team" → `/contact` / `/en/contact`).
- Rộng bằng 1 thẻ sản phẩm (85% mobile, ½ dải từ `md`), `snap-start`, cao giãn theo hàng; nằm trong vùng cuộn nên nút ←/→, phím ←/→, vuốt tính cả thẻ.
- Bỏ câu "hiện chỉ 2 sản phẩm nên ở desktop có thể cả 2 nút disabled" (giờ có 3 thẻ → nút → bật được ở desktop).
- Section vẫn ẩn khi không có sản phẩm (thẻ CTA không làm section hiện).

## Ảnh hưởng test
- `/`, `/en`: khối Sản phẩm có thẻ CTA cuối dải, nội dung và link khớp thẻ CTA cuối lưới `/products`.
- Regression: thẻ sản phẩm (poster, chip, link `/products/<slug>`), nút ←/→ disabled ở mép, cuộn bằng phím, không tràn ngang 375/1440; trang `/products` không đổi.
