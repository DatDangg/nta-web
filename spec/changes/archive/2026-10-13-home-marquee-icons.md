---
id: home-marquee-icons
type: feature
status: done
created: 2026-10-13
---

# Dải chữ chạy trang chủ: bỏ chữ đậm + thêm icon cho từng mục

## Yêu cầu
User (chat 13/10/2026, kèm ảnh mẫu): tắt bold ở dải chữ chạy (marquee) dưới hero trang chủ, thêm icon cho từng mục
theo kiểu ảnh — icon nét màu primary trong ô tròn trắng có bóng nhẹ, đứng trước nhãn; giữ dấu sao phân cách.

## Acceptance
- [x] Nhãn marquee không còn đậm (font-normal), cỡ chữ nhỏ lại cho cân với icon.
- [x] Mỗi mục (12 nhãn từ 3 panel hero, vi + en) có icon riêng trong ô tròn trắng.
- [x] Marquee vẫn liền mạch, dừng khi hover, reduced-motion đứng yên; icon `aria-hidden`.
- [x] typecheck / lint / build PASS.

## Ghi chú
- Class: MODIFY (UI thuần, không đổi nội dung/contract) → no spec delta, no doc impact.
- `Marquee` nhận `string | { label, icon }` (tương thích ngược). Icon map theo thứ tự item trong `app/[locale]/page.tsx`.
- Thêm icon `gear`, `plug` vào `components/listing/icons.tsx`.
