---
id: products-remove-app-details
type: feature
status: done
created: 2026-10-13
---

# Bỏ khối "Chi tiết ứng dụng" ở trang /products

## Yêu cầu
Trang danh sách `/products` (+ `/en/products`): xoá khối "Chi tiết ứng dụng" / "App details" phía dưới
(2 thẻ AppCard có carousel ảnh). Thông tin chi tiết đã nằm ở trang `/products/[slug]` (CR-004 layer 3).

## Bối cảnh / tái hiện (bug)
- Không áp dụng (feature).

## Acceptance (bắt buộc)
- [x] `/products` và `/en/products` không còn khối "Chi tiết ứng dụng" / "App details".
- [x] Hero + danh sách thẻ + dải CTA giữ nguyên; thẻ vẫn link sang `/products/[slug]`.
- [x] Component chỉ khối này dùng (AppCard, ScreenshotCarousel, productThemes) xoá; i18n key carousel thừa xoá.
- [x] typecheck/lint/build PASS.

## Ghi chú
- Nguồn: user chat 13/10/2026 ("ở dưới có cái chi tiết ứng dụng, xóa cái đấy đi").
- R-07 vẫn thoả (mô tả + ảnh + kênh tải nằm ở trang chi tiết) → reconcile, không bump spec.
