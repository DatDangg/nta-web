# Spec Validation (pre-plan) — feature contact-page-redesign (CR-008)

**Agent:** spec-validator (thực hiện trong phiên, không có subagent riêng) · **Ngày:** 2026-10-13 · **Spec:** 3.6.0

## Kiểm tra
| # | Mục | Kết quả |
|---|---|---|
| 1 | Mọi acceptance trong change doc đều có R-xx tương ứng (R-10 §1–6, R-11, R-13) | PASS |
| 2 | Thông tin liên hệ trong spec khớp đúng lời user (SĐT, email, địa chỉ) | PASS |
| 3 | Quyết định user (form theo mockup, không reCAPTCHA, Maps nhúng, 24h + giờ làm việc, 3 tiện ích, Footer) phản ánh trong spec | PASS |
| 4 | Xung đột với requirement cũ: R-13 phone tuỳ chọn vs mockup bắt buộc; `CTAForm` (trang giải pháp) không có phone/need | RESOLVED — API giữ tuỳ chọn, bắt buộc kiểm ở client form `/contact` (R-13 ghi rõ) |
| 5 | Message 10–2000 (API) vs ≤500 (form `/contact`) | RESOLVED — như #4 |
| 6 | BR-002 (validate email + SĐT trước khi gửi) | PASS |
| 7 | R-24 a11y: select native + label, bộ đếm aria-live, iframe có title | PASS (ghi trong task 02) |
| 8 | Lịch sử: CR replace-placeholder (12/10) đã bỏ `MapEmbed` placeholder — nay thêm bản đồ thật, không mâu thuẫn | PASS |

## Verdict
**PASS** — chia task được. Điểm #4/#5 nêu lại ở checkpoint duyệt plan để user xác nhận.
