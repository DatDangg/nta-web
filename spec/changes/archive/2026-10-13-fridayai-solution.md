---
id: fridayai-solution
type: feature
status: done
created: 2026-10-13
---

# Thêm giải pháp AI "FridayAI" (AI API Gateway) vào mục Giải pháp AI

## Yêu cầu
Lấy thông tin + hình ảnh từ https://fridayaix.com/ để thêm 1 giải pháp mới vào `/solutions/ai`
(thẻ trong lưới listing + trang chi tiết `/solutions/ai/fridayai` theo template detail chung — CR-004).
Dự kiến: thêm `src/content/solutions/{vi,en}/fridayai.mdx`, thêm slug vào `aiSlugs`, ảnh vào `public/images/solutions/fridayai/`.

## Nội dung đã thu thập từ fridayaix.com (13/10/2026)

**Định vị:** FRIDAYAI — AI API Gateway. Tagline: "One endpoint. Every AI model." —
"Trở thành điểm truy cập duy nhất cho tương lai của AI." Footer: "Nền tảng AI API Gateway cho developers. Nhanh, rẻ, đáng tin cậy."
Đơn vị: CÔNG TY TNHH CÔNG NGHỆ FRIDAYAI (MST 0111448781).

**Tính năng chính (đề xuất dùng cho `features` / Lưới tính năng):**
- Một endpoint truy cập nhiều model: Claude (Opus/Sonnet/Haiku), GPT, Gemini — site ghi "14 models" (thực tế liệt kê 12).
- Tương thích OpenAI SDK: chỉ đổi `base_url` + API key, không refactor; hỗ trợ Python, Node.js, Go, Java…
- Tích hợp với Cursor và Claude Code.
- Dashboard chi tiết, API key không giới hạn, playground.
- Gói Enterprise: giá volume, SLA 99.9%, rate limit tùy chỉnh, hóa đơn/hợp đồng VAT, tùy chọn on-premise, SSO & audit logs.

**Lợi ích / số liệu site công bố (`highlights`):**
- Latency trung bình < 180ms (P95), hạ tầng edge Đông Nam Á.
- Uptime 99.97% (30 ngày), SLA cam kết 99.9%.
- Pay-as-you-go; thanh toán MoMo, chuyển khoản, USDT, thẻ quốc tế; có hóa đơn VAT.
- Chính sách zero-log, không dùng dữ liệu để training (theo site).

**Đối tượng:** Developer/startup, doanh nghiệp cần cổng AI tập trung có VAT/SLA.

**FAQ (rút gọn từ site, 6 câu):** FridayAI là gì · tích hợp thế nào (đổi base_url) · thanh toán MoMo/CK ·
tốc độ/độ ổn định · có lưu prompt không (zero-log) · có dùng code để training không (không).

**Không đưa lên web (dễ lỗi thời / rủi ro):** bảng giá USD/MTok, giá gói PRO/MAX (VND), "Bonus 700%",
so sánh "30% cao hơn Claude Pro" — giá & khuyến mãi thay đổi liên tục, và claim so sánh với hãng khác cần nguồn xác minh.
Thay bằng CTA dẫn sang fridayaix.com hoặc /contact.

## Hình ảnh
- Site KHÔNG có ảnh raster: toàn bộ là SVG/CSS; `og:image` (`/og-image.png`) trả về 404/HTML.
- Đã lưu 2 ảnh chụp tham khảo (800px, chỉ để tham chiếu, chưa đủ chất lượng đưa lên web):
  `spec/changes/assets/2026-10-13-fridayai-solution/ref-01-hero.jpg` (hero logo + ô tìm kiếm),
  `ref-02-ecosystem.jpg` (sơ đồ logo trung tâm + các model xung quanh).
- Khi build: chụp lại full-res (1440–1920px) các khối hero, ecosystem, lưới model, gói subscription; hoặc user cung cấp logo/ảnh gốc.

## Acceptance
- [ ] Thẻ FridayAI xuất hiện trong lưới `/solutions/ai` (vi + en), có ảnh thẻ + mô tả ngắn.
- [ ] Trang `/solutions/ai/fridayai` dùng template detail chung: hero, tính năng, lợi ích/highlights, FAQ, CTA.
- [ ] Không có giá/khuyến mãi cứng trong nội dung; claim số liệu ghi rõ "theo nhà cung cấp".
- [ ] Ảnh full-res trong `public/images/solutions/fridayai/`, có alt; sitemap + mega menu (CR-010) cập nhật nếu menu liệt kê từng giải pháp.
- [ ] build / typecheck / lint PASS.

## User đã xác nhận (13/10/2026)
1. FridayAI là **sản phẩm của NTA** (dùng AI giá rẻ).
2. CTA dẫn sang **fridayaix.com**.
3. Ảnh: chụp từ website; logo lấy SVG của site.

## Kết quả
Done — spec 3.7.0 (R-06, R-06e) · scope v33 · task `tasks/feature-fridayai-solution/phase-1-task-01.md` · review PASS NORMAL round 1.
