---
id: home-solution-card-image
type: feature
status: done
closed: 2026-10-14
created: 2026-10-14
---

# Trang chủ khối Giải pháp: ảnh minh hoạ to, mờ dần sang trái như mẫu (follow-up CR-016)

## Yêu cầu
User: "phần solution chưa ổn lắm, thứ t cần là ở mấy thẻ kia đều có ảnh to và blur trái như ảnh mẫu ấy".
Mẫu: `spec/changes/archive/assets/2026-10-14-home-solution-card-image/4.webp` (3 thẻ Giải pháp doanh nghiệp · Giải pháp AI · Ứng dụng AI).

Hiện tại (`src/components/home/SolutionGridHome.tsx`, CR-016): ảnh `illustrations/home-*.png` nhỏ (~52–60% bề rộng),
nằm góc phải-dưới, mask mờ cả trái lẫn trên, và ở `lg` (3 cột) / mobile còn bị `opacity-30` → gần như không thấy.

Cần: ảnh **to, phủ kín nửa phải thẻ theo chiều cao** (từ mép trên tới mép dưới, tràn mép phải, `object-cover`),
**mờ dần sang trái** (gradient trắng → trong suốt) để cột chữ bên trái vẫn đọc rõ — như mẫu.

## Acceptance (bắt buộc)
- [x] Cả 3 thẻ: ảnh phủ full chiều cao thẻ ở nửa phải (~55–65% bề rộng), tràn sát mép phải/trên/dưới, bo theo góc thẻ.
- [x] Mép trái ảnh fade mượt vào nền trắng thẻ (không thấy viền ảnh); không còn fade từ trên xuống, không còn `opacity-30` ở desktop.
- [x] Chữ (tiêu đề, mô tả, bullet, link) không bị ảnh đè làm khó đọc — đạt tương phản như mẫu ở 1280/1440.
- [x] Mobile / tablet: ảnh vẫn hiện rõ (vd ảnh phía phải mờ trái hoặc ảnh trên đầu thẻ) và chữ đọc được; không tràn ngang.
- [x] build / typecheck / lint PASS.

## Ghi chú
- Ảnh hiện có: `public/images/illustrations/home-{enterprise,ai,apps}.png` (~1500×1050). Mẫu dùng ảnh laptop dashboard / khối chip AI / điện thoại BoxAI —
  nếu ảnh hiện có không hợp khi phóng to (nền không liền, chủ thể lệch) → báo user, không tự bịa ảnh.
- Chỉ đổi UI thẻ Giải pháp trang chủ; nội dung bullet giữ như CR-016.
