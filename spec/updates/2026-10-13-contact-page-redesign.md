# Spec Update — 2026-10-13 contact-page-redesign

**spec_version:** 3.5.1 → 3.6.0 (MINOR)
**Trigger:** feature-update
**Change:** `spec/changes/2026-10-13-contact-page-redesign.md` (CR-008)

## Requirements
- **SỬA R-10** — `/contact` bố cục mới theo mockup: hero (nền sóng + breadcrumb pill + tiêu đề 2 dòng + minh hoạ),
  card thông tin (SĐT `0335546831`, email `admin@ntasolution.vn`, địa chỉ Tầng 2 tòa Kim Hoàn, ngõ 19 Duy Tân, Cầu Giấy, Hà Nội)
  + Google Maps nhúng + 3 tiện ích văn phòng; card form 2 cột (thêm Tên doanh nghiệp, Nhu cầu (select 9 mục),
  SĐT bắt buộc, nội dung 10–500 + bộ đếm). Không reCAPTCHA. JSON-LD có telephone/email/address.
- **SỬA R-11** — Footer hiển thị SĐT / email / địa chỉ (cùng nguồn dữ liệu với R-10).
- **SỬA R-13** — `POST /api/contact` nhận thêm `company` (≤150) và `need` (enum 9 key), đều tuỳ chọn ở API;
  chuyển tiếp sang `CONTACT_FORM_TARGET`. Các rule cũ giữ nguyên (CTA form ở trang giải pháp không đổi).
- **Đóng Open Question #2** (hotline/email/địa chỉ thật).

## Ảnh hưởng
- Module 8 (`/contact`, `/en/contact`): toàn bộ bố cục + form.
- Module 9 (Footer mọi trang): thêm khối thông tin liên hệ.
- API `/api/contact`: thêm 2 field tuỳ chọn — CTA form (`CTAForm`, trang chi tiết giải pháp) phải tiếp tục gửi được.
- Test luồng: validate từng trường (SĐT/Nhu cầu bắt buộc, nội dung 10–500, bộ đếm), gửi thành công / lỗi / 429,
  link `tel:`/`mailto:`, iframe bản đồ lazy + link mở Google Maps, responsive 1440/1024/768/390, vi/en, footer mọi trang.
