---
id: home-products-show-three
type: feature
status: done
created: 2026-10-14
---

# Trang chủ khối Sản phẩm: hiện đủ 3 thẻ, chỉ cuộn ngang khi nhiều hơn 3

## Yêu cầu
Khối Sản phẩm trên trang chủ (`src/components/home/ProductStrip.tsx`) hiện là dải cuộn ngang, mỗi thẻ rộng
~50% (md+) nên 3 thẻ (2 sản phẩm + thẻ CTA "Sắp có thêm ứng dụng mới" của CR-021) không hiện hết, phải cuộn.
User muốn: **hiển thị đủ 3 thẻ cùng lúc**; chỉ khi sau này có **nhiều hơn 3** thẻ thì mới cuộn ngang.

## Bối cảnh / tái hiện (bug)
- Màn/route/role: trang chủ `/` và `/en`, khối Sản phẩm (public)
- Bước tái hiện: n/a (feature, follow-up CR-021)
- Expected: 3 thẻ hiện đủ trên 1 hàng, không phải cuộn; > 3 thẻ → cuộn ngang như hiện tại
- Actual: thẻ rộng ~50% → chỉ thấy 2 thẻ, phải cuộn để thấy thẻ thứ 3

## Acceptance (bắt buộc)
- [x] ≤ 3 thẻ: hiện đủ cùng lúc trên 1 hàng (không cần cuộn), cả vi + en
- [x] > 3 thẻ: giữ hành vi cuộn ngang hiện tại (mũi tên / bàn phím / snap)
- [x] Khi không cuộn được, nút mũi tên không gây nhầm (ẩn hoặc disabled)
- [x] Mobile/tablet (< lg): giữ dải cuộn ngang như hiện tại (user chốt 2026-10-14)

## Ghi chú
Classify dự kiến: MODIFY (UI), follow-up CR-016/CR-021.
Đã chốt: desktop (lg+) hiện đủ 3 thẻ 1 hàng; mobile/tablet vẫn cuộn ngang.
