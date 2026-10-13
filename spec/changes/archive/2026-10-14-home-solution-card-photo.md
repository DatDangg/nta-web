---
id: home-solution-card-photo
type: feature
status: done
created: 2026-10-14
---

# Trang chủ khối Giải pháp: thẻ rộng hơn + ảnh minh hoạ bên phải dạng ảnh thật như mẫu (follow-up CR-017)

## Yêu cầu
User (2026-10-14): "chỉnh sửa cái này lại 1 chút, cho thẻ rộng ra xíu + dùng ảnh bên phải của mỗi thẻ như ảnh 2".

- Hiện tại: `assets/2026-10-14-home-solution-card-photo/current.png` — 3 thẻ hẹp, cao; chữ tiêu đề/mô tả/bullet
  xuống dòng nhiều; ảnh minh hoạ 3D (`/images/illustrations/home-*.png`) mờ dần sang trái (CR-017).
- Mẫu: `assets/2026-10-14-home-solution-card-photo/5.webp` — 3 thẻ ngang, rộng & thấp hơn; tiêu đề 1 dòng;
  ảnh bên phải mỗi thẻ là ảnh "thật"/render:
  - Giải pháp doanh nghiệp → laptop mở dashboard biểu đồ, bàn làm việc, cây xanh
  - Giải pháp AI → chip "AI" phát sáng + màn hình camera giao thông nổi phía trên
  - Ứng dụng AI → 2 điện thoại hiển thị app BoxAI
- Nội dung chữ/bullet trong thẻ **giữ nguyên** (mẫu chỉ tham chiếu bố cục + ảnh) — trừ khi user nói khác.

## Acceptance (bắt buộc)
- [ ] Thẻ rộng hơn hiện tại ở desktop (tiêu đề "Giải pháp doanh nghiệp" không xuống dòng ở 1440)
- [ ] Mỗi thẻ có ảnh bên phải theo phong cách mẫu `5.webp` (laptop / chip AI / điện thoại), tan vào nền thẻ
- [ ] Chữ không bị ảnh đè, đọc rõ ở 375 / 1024 / 1440 / 1920, VI + EN
- [ ] Ảnh `naturalWidth > 0`, overflow ngang 0
- [ ] lint · typecheck · build PASS; reviewer PASS

## Câu hỏi mở (chờ user trả lời trước khi xử lý)
1. **Nguồn ảnh**: anh có sẵn 3 ảnh gốc (laptop / chip AI / điện thoại) không? Nếu không:
   (a) cắt từ mockup `5.webp` (độ phân giải thấp, ~1354px cả hàng → ảnh mờ), hay
   (b) tạo ảnh AI tương tự (ghi rõ minh hoạ), hay (c) ảnh stock?
2. **"Rộng ra xíu"**: nới container khối này rộng hơn 1280px (vd ~1360–1440), hay giữ container và
   giảm padding/khoảng cách giữa thẻ?

## Trả lời của user (2026-10-14)
1. Ảnh: **tạo ảnh tương tự** mẫu — **KHÔNG** ghi chú "ảnh minh hoạ" (alt mô tả nội dung bình thường, không tiền tố).
2. Rộng: **nới container riêng khối này** (> 1280px).

⚠ Môi trường agent không có công cụ/API tạo ảnh AI (đã kiểm tra: không có key OpenAI/Gemini/…).
Chờ user chọn: (a) agent tự dựng ảnh render bằng code (khung laptop/điện thoại chứa ảnh chụp sản phẩm thật
trong `public/images/solutions/v2/*` + chip AI vẽ SVG phát sáng, chụp ra PNG nền trong suốt), hoặc
(b) agent viết prompt, user tự tạo ảnh bằng ChatGPT/Gemini rồi gửi lại.

→ User chọn **(b)** (2026-10-14): user tự tạo ảnh bằng ChatGPT/Gemini theo prompt dưới, gửi lại → agent tối ưu webp + gắn.
Tên file mong đợi: `home-enterprise-photo`, `home-ai-photo`, `home-apps-photo` (đặt vào `public/images/illustrations/`).

### Prompt tạo ảnh (chung: 3:2 ngang ~1536×1024, chủ thể lệch PHẢI, nửa trái nền trắng/xanh rất nhạt để fade, không chữ thừa, không logo hãng)
1. **Doanh nghiệp**: Photorealistic product shot of a modern silver laptop on a clean white desk, screen showing a bright business analytics dashboard (teal-green bar charts, line chart, donut chart, KPI cards), a small potted green plant and a smartphone nearby, soft blurred bright office with large windows in background, airy white and mint-green tones, soft natural light, shallow depth of field. Laptop placed on the right third, left half mostly empty soft white background. No text, no brand logos. 3:2 landscape.
2. **AI**: 3D render of a glowing square microchip with large "AI" letters on top, sitting on a dark-blue circuit board base with luminous cyan circuit traces, above it floating holographic glass screens showing a city traffic camera view with detection boxes, a car icon card and a small bar chart card, soft blue and teal glow, clean bright white background, high-end tech illustration style. Chip placed on the right third, left half mostly empty white background. No other text, no logos. 3:2 landscape.
3. **Ứng dụng AI**: Photorealistic render of two modern smartphones standing slightly angled, one in front of the other, screens showing a clean mobile app with a dark header, a grid of video camera thumbnails and an analytics chart, soft white and mint-green background with subtle bokeh, soft studio lighting, premium product shot. Phones placed on the right third, left half mostly empty soft white background. No brand logos, no readable text except UI shapes. 3:2 landscape.

## Ghi chú
- Follow-up CR-016/CR-017. File chính: `src/components/home/SolutionGridHome.tsx`, ảnh trong `src/content/home.ts` (VI+EN).
- Container hiện tại `max-w-container` = 1280px (`tailwind.config.ts:48`) — dùng chung toàn site, không sửa token chung; nếu nới thì chỉ cho section này.
