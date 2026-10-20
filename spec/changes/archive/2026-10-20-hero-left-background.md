---
id: hero-left-background
type: feature
status: done
created: 2026-10-20
---

# Hero trang chủ: hiện nền bên trái (thành phố + cây) như bản mẫu mới

## Yêu cầu
User (2026-10-20, kèm bản mẫu hero mới — chữ trái trên nền thành phố/cửa kính/cây mờ góc trái, robot + 5 panel kính bên phải):
"làm giống ảnh bản mẫu, thêm cái phần nền của bên trái".
Ảnh nền = ảnh user gửi trước đó (`hero-bg` 1916×821): nửa trái là thành phố + cửa kính + chậu cây mờ, nửa phải robot/khối xanh/panel.

## Bối cảnh
- Màn/route: `/` và `/en`, desktop lg+ (mobile: ảnh dưới chữ).
- Hiện tại (R-01b, CR-040/042): ảnh `hero-banner.jpg` neo phải trong stage 1440, nửa trái phủ trắng gần đặc (#fff → 0.94 ở 28%) + dải trắng 30% mép trái khung ảnh.

## Acceptance (bắt buộc)
- [x] Desktop: ảnh mới phủ kín bề ngang section, nửa trái thấy rõ thành phố/cửa kính/cây (lớp phủ trắng nhẹ hơn, chỉ đủ cho chữ đọc tốt).
- [x] 5 panel kính + wordmark NTA vẫn động, đè khớp panel trong ảnh.
- [x] Màn rất rộng (> 2048): ảnh không phóng to tiếp, panel không bị cắt, mép ảnh mờ sang trắng (không dùng nền blur — đã bỏ ở CR-042).
- [x] Chữ hero vẫn thẳng mép khung 1280, tương phản đủ đọc.
- [x] Mobile/tablet: ảnh mới crop vào robot.
- [x] Kiểm 1100, 1440, 1920, 2560; vi + en.

## Ghi chú
- Phạm vi: chỉ nền hero. Eyebrow "NTA AI SOLUTIONS", tiêu đề 2 dòng, nút header có mũi tên trong bản mẫu KHÔNG làm ở change này (chờ user chốt riêng).
- Liên quan: R-01b, `src/components/home/HeroVisual.tsx`.
