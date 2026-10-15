---
id: contact-form-email-only
type: feature
status: in_progress
created: 2026-10-15
---

# Form liên hệ: chỉ gửi email tới admin, bỏ Google Sheet + Telegram (thay R-13a / CR-037)

## Yêu cầu
User (chat 2026-10-15): "cái liên hệ giờ đang lưu sheet… muốn đổi thành gửi thẳng vào mail admin… test mail t được thì đổi mail admin là xong"
→ chốt: **"chỉ gửi mail thôi, kh sheet kh tele"**.

- Apps Script (`tools/contact-sheet/Code.gs`) bỏ ghi Sheet + bỏ báo Telegram; thay bằng gửi 1 email (`MailApp`) chứa nội dung liên hệ.
- Địa chỉ nhận lấy từ Script Property (vd `ADMIN_EMAIL`) — test bằng mail user, sau đó chỉ đổi giá trị property sang mail admin, **không sửa code / không redeploy web**.
- `replyTo` = email khách để admin bấm Reply trả lời thẳng.
- Phía web (`src/lib/api/forward.ts`, `CONTACT_FORM_TARGET` / `CONTACT_FORM_TOKEN`) giữ hợp đồng hiện tại nếu không cần đổi.

## Acceptance (bắt buộc)
- [ ] Gửi form `/vi/lien-he` và `/en/contact` → 1 email tới địa chỉ trong `ADMIN_EMAIL`, đủ: thời gian (giờ VN), ngôn ngữ, tên, email, SĐT, công ty, nhu cầu (nhãn), nội dung.
- [ ] Email có `replyTo` = email khách; tiêu đề nhận diện được (vd "[NTA] Liên hệ mới — <tên>").
- [ ] Không ghi Sheet, không gọi Telegram; không còn đọc `SHEET_NAME` / `TELEGRAM_*`.
- [ ] Script chỉ trả `{"status":"ok"}` khi gửi mail thành công; lỗi gửi (vd hết hạn mức) → `server_error` để web báo lỗi cho người dùng (không mất liên hệ âm thầm).
- [ ] Token bí mật + validate payload giữ nguyên; nội dung người dùng không chèn được HTML vào mail (gửi plain text hoặc escape).
- [ ] Thiếu `ADMIN_EMAIL` → `server_error`, log mã cố định, không lộ dữ liệu.
- [ ] Đổi `ADMIN_EMAIL` sang địa chỉ khác có hiệu lực ngay, không redeploy.
- [ ] Test `tools/contact-sheet/code.test.ts` cập nhật theo; README hướng dẫn mới (property, cấp quyền gửi mail, hạn mức Gmail ~100/ngày · Workspace ~1500/ngày).

## Ghi chú
- Spec: thay R-13a (4.5.0) — "lưu" không còn là dòng Sheet; web vẫn không lưu DB (R-13). Rủi ro user chấp nhận: mail lỗi → không có bản lưu dự phòng.
- Có thể đổi tên thư mục `tools/contact-sheet` → `tools/contact-mail` (agent quyết khi làm).
- Sau khi dán script mới: Google hỏi cấp thêm quyền gửi email; cập nhật phiên bản triển khai cũ (giữ URL `/exec`) theo README §f.
- Mail gửi từ tài khoản Google deploy script.

## Log
- 2026-10-15 — /change (agent change-request): classify **MODIFY + REMOVE** (sửa đích R-13a; bỏ Sheet + Telegram), risk **MEDIUM** (review STRICT).
  Spec delta R-13a (+ ghi chú R-16, OQ#4, C2) → spec **4.6.0 → 4.7.0** (MINOR — hợp đồng web giữ nguyên, không xoá requirement);
  `spec/updates/2026-10-15-contact-form-email-only.md`, `spec/CHANGELOG.md`, test-scope **v57**.
  Quyết định: đổi thư mục `tools/contact-sheet` → `tools/contact-mail` (git mv; glob test/tsconfig tự bao, không đổi cấu hình);
  `src/lib/api/forward.ts` không đổi hành vi (chỉ comment). Thêm hàm `testSendMail()` để cấp quyền gửi mail + test.
  Plan: 1 task `tasks/feature-contact-form-email-only/phase-1-task-01.md`. **Dừng ở checkpoint duyệt plan**, chưa gọi builder.
