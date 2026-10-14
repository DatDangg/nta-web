---
id: home-products-coming-soon-card
type: feature
status: done
created: 2026-10-14
---

# Trang chủ khối Sản phẩm: thêm thẻ "Sắp có thêm ứng dụng mới" như trang Sản phẩm

## Yêu cầu
Ở khối Sản phẩm trên trang chủ (`src/components/home/ProductStrip.tsx`), thêm 1 thẻ cuối dải thể hiện
"sắp có ứng dụng mới" — giống thẻ CTA viền đứt cuối lưới ở trang Sản phẩm (`/products`).
Nội dung tái dùng `listingCtas[locale].products` trong `src/content/listings.ts`:
- vi: "Sắp có thêm ứng dụng mới" — "NTA liên tục phát triển thêm ứng dụng AI. Có ý tưởng? Hãy trao đổi với chúng tôi." — nút "Liên hệ đội ngũ NTA"
- en: "More apps coming soon" — "NTA keeps building new AI apps. Have an idea? Let’s talk." — "Contact the NTA team"

## Bối cảnh / tái hiện (bug)
- Màn/route/role: trang chủ `/` và `/en`, khối Sản phẩm (public)
- Bước tái hiện: n/a (feature)
- Expected: cuối dải sản phẩm có thẻ "Sắp có thêm ứng dụng mới"
- Actual: chỉ có các thẻ sản phẩm

## Acceptance (bắt buộc)
- [x] Thẻ hiển thị ở cuối dải sản phẩm trang chủ, cả vi + en, nội dung giống thẻ CTA trang Sản phẩm
- [x] Phong cách khớp thẻ CTA trang Sản phẩm (viền đứt), kích thước đồng bộ với thẻ sản phẩm trên trang chủ
- [x] Nút/link trỏ cùng đích liên hệ như trang Sản phẩm
- [x] Cuộn ngang / nút mũi tên / bàn phím của dải vẫn hoạt động đúng; responsive mobile ổn

## Ghi chú
Classify dự kiến: ADDITIVE (UI). Tái dùng nội dung `listingCtas`, không thêm chuỗi mới.

## Kết quả (2026-10-14)
- Task commit `769a4a2`; review round 2 PASS; spec 3.14.0 (R-03a) · test-scope v44.
- Build chưa chạy được trong môi trường agent (native binding) — cần `npm.cmd run build` ở terminal user.
