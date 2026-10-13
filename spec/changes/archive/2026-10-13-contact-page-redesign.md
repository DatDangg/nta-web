---
id: contact-page-redesign
type: feature
status: done
created: 2026-10-13
---

# Thiết kế lại UI trang Liên hệ theo mockup + cập nhật thông tin liên hệ thật

## Yêu cầu
Sửa lại UI trang `/contact` (VI + EN) theo mockup user gửi 13/10/2026:
`spec/changes/assets/2026-10-13-contact-page-redesign/mockup-contact.png`
(ảnh nền hero: `hero-background.png` cùng thư mục).

Bố cục theo mockup:
- **Hero:** breadcrumb (Trang chủ › Liên hệ), tiêu đề 2 dòng "Liên hệ với NTA / Cùng tạo nên những **giá trị thực tiễn**"
  (cụm cuối màu brand), mô tả ngắn, ảnh nền `hero-background.png` + minh hoạ 3D bên phải.
- **Cột trái (card):** 3 khối thông tin có icon — Điện thoại · Email · Địa chỉ; bản đồ có pin văn phòng;
  mục "Văn phòng NTA" với 3 tiện ích (Bãi đỗ xe · Giao thông thuận tiện · Vị trí trung tâm).
- **Cột phải (card form):** eyebrow "GỬI THÔNG TIN CHO CHÚNG TÔI", tiêu đề "Để lại thông tin liên hệ", mô tả;
  lưới 2 cột: Họ và tên* · Email* · Số điện thoại* · Tên doanh nghiệp/Tổ chức; Nhu cầu của bạn* (select);
  Nội dung liên hệ* (textarea, bộ đếm ký tự); captcha; nút "Gửi liên hệ →".

Thông tin liên hệ thật (thay toàn bộ dữ liệu mẫu trong mockup):
- **Điện thoại:** 0335546831
- **Email:** admin@ntasolution.vn
- **Địa chỉ:** Tầng 2, tòa nhà Kim Hoàn, ngõ 19 Duy Tân, Cầu Giấy, Hà Nội, Việt Nam

## Bối cảnh / tái hiện (bug)
- Không áp dụng (feature).
- Hiện trạng: `src/app/[locale]/contact/page.tsx` chỉ có `PageHeader` + `ContactForm` (max-w-3xl);
  `ContactInfo.tsx` / `OfficeHours.tsx` có sẵn nhưng chưa được dùng; site chưa hiển thị SĐT/email/địa chỉ thật ở đâu.

## Acceptance (bắt buộc)
- [x] Trang `/contact` và `/en/contact` khớp bố cục mockup ở desktop; responsive mobile (1 cột: info → form hoặc theo chốt).
- [x] SĐT / email / địa chỉ hiển thị đúng như trên; SĐT là link `tel:`, email là link `mailto:`.
- [x] Bản đồ trỏ đúng địa chỉ Kim Hoàn, ngõ 19 Duy Tân (không dùng ảnh bản đồ trong mockup).
- [x] JSON-LD ContactPage/Organization cập nhật telephone/email/address mới.
- [x] Form giữ đủ states Default / Validating / Submitting / Success / Error (R-10); validate client + server khớp nhau.
- [x] Text VI + EN đầy đủ trong `src/i18n/messages/*.json`.
- [x] build / typecheck / lint PASS.

## Ghi chú
- Tham chiếu: R-10, R-13 (POST /api/contact), BR-002. Đóng luôn mục `[cần xác nhận] hotline/email/địa chỉ thật` ở Module 8.
- **Đã chốt với user (13/10/2026):**
  1. Form theo mockup: SĐT **bắt buộc**, thêm **Tên doanh nghiệp/Tổ chức** (tuỳ chọn) + **Nhu cầu của bạn** (select, bắt buộc),
     nội dung **tối đa 500** ký tự → spec delta R-10/R-13 + cập nhật `/api/contact` + schema.
  2. **Không** dùng reCAPTCHA thật; giữ honeypot + rate-limit hiện có (bỏ ô captcha khỏi UI).
  3. Bản đồ: nhúng Google Maps iframe (không API key, `loading="lazy"`, có `title`) + link "Mở Google Maps".
  4. Mockup đúng: "Phản hồi trong 24h", giờ làm việc **T2–T6, 8:30–17:30**.
  5. 3 tiện ích văn phòng (Bãi đỗ xe · Giao thông thuận tiện/gần Metro · Vị trí trung tâm) đúng với tòa Kim Hoàn.
  6. Cập nhật SĐT/email/địa chỉ ra **Footer** (R-11, BR-001).
  7. "Nhu cầu của bạn": Phần mềm CRM · Phần mềm nha khoa DentGo · Hệ thống đào tạo trực tuyến LMS · Quản trị nhân sự HRM ·
     BoxAI · Giải pháp AI theo yêu cầu · Flycam · Phát triển phần mềm theo yêu cầu · Khác.
  (Mục 3 + 7: user chấp nhận đề xuất bằng cách chạy `/change contact-page-redesign`.)
- Spec delta: `spec/updates/2026-10-13-contact-page-redesign.md` (3.5.1 → 3.6.0). Task: `tasks/feature-contact-page-redesign/`.

## Kết quả (13/10/2026)
- Spec 3.6.0 · scope v32 · 3 task: `tasks/feature-contact-page-redesign/` (commit task 01, 02, 03).
- Residual: kiểm vị trí ghim Google Maps trên trang thật; blob trang trí `GlassVisual` tràn 8px ở 1024 (có từ trước, dùng chung).
