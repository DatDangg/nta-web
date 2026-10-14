# Spec update — 2026-10-14 · change `home-products-show-three`

- **Spec version**: 3.14.0 → **3.15.0** (MINOR — đổi behavior layout R-03a)
- **Scope version**: v44 → **v45** (`feature-update`)
- **Trigger**: `feature-update` (change-request CR-022, MODIFY UI, follow-up CR-016/CR-021)
- **Change file**: `spec/changes/archive/2026-10-14-home-products-show-three.md`
- **Task**: `tasks/feature-home-products-show-three/phase-1-task-01.md` (commit `69c734a`)
- **Review**: `.context/review-reports/feature-home-products-show-three-phase-1-task-01-round-1-review.md`, round 1 **PASS** (NORMAL)

## Thay đổi

**SỬA R-03a** (khối Sản phẩm tiêu biểu trang chủ) — thêm đoạn `(3.15.0 — CR-022)`:
- Từ `lg` (≥ 1024px), tổng thẻ (sản phẩm + thẻ CTA) ≤ 3 → hiện đủ 1 hàng, không cuộn (3 thẻ → ⅓ dải; ≤ 2 → ½ dải); cụm nút ←/→ ẩn ở `lg+`.
- > 3 thẻ → giữ carousel ngang (½ dải, nút ←/→, phím ←/→, snap).
- Dưới `lg` (mobile 85%, tablet ½ dải) luôn là dải cuộn ngang, nút ←/→ hiện.
- Gạch câu 3.14.0 "(2 sản phẩm + thẻ CTA → desktop nút → bật được)".

## Ảnh hưởng test
- `/`, `/en` ở 1024/1280/1440: 3 thẻ đủ 1 hàng, không thanh cuộn, không có nút ←/→ khối Sản phẩm.
- 375/768: vẫn cuộn ngang, nút ←/→ hoạt động, disabled ở mép.
- Regression: khối Câu chuyện khách hàng (dùng chung hook/nút) không đổi; thẻ sản phẩm + thẻ CTA nội dung/link không đổi; không tràn ngang trang.
