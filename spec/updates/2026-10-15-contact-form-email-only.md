# Spec update — 2026-10-15 · change `contact-form-email-only`

- **Spec version**: 4.6.0 → **4.7.0** (MINOR — sửa R-13a: đổi đích nhận liên hệ phía Apps Script; hợp đồng `POST /api/contact` (R-13) và hợp đồng web ↔ Web App không đổi, không xoá requirement nào nên không MAJOR)
- **Scope version**: v56 → **v57** (`feature-update`)
- **Trigger**: `feature-update` (change-request CR-039, MODIFY + REMOVE, risk medium)
- **Change file**: `spec/changes/2026-10-15-contact-form-email-only.md`
- **Task**: `tasks/feature-contact-form-email-only/phase-1-task-01.md` (Apps Script gửi email + test + README, đổi thư mục `tools/contact-sheet` → `tools/contact-mail`, reconcile doc)
- **Thời điểm phát hành**: bước planning — hiệu lực khi phase 1 PASS + user dán script mới, cấp quyền gửi mail, đặt `ADMIN_EMAIL`, cập nhật phiên bản triển khai cũ (giữ URL `/exec`)

## Thay đổi

**SỬA R-13a** — đích forward form liên hệ:
- Apps Script hợp lệ token + payload → gửi **đúng 1 email** (`MailApp`) tới Script Property **`ADMIN_EMAIL`**; đổi property có hiệu lực ngay, không sửa code / không redeploy web.
- Email **plain text**: thời gian (giờ VN), ngôn ngữ, tên, email, SĐT, công ty, nhu cầu (nhãn), nội dung; `replyTo` = email khách; tiêu đề `[NTA] Liên hệ mới — <tên>` (tên bỏ ký tự điều khiển/xuống dòng, cắt độ dài).
- Chỉ `{status:"ok"}` khi gửi mail không lỗi; thiếu `ADMIN_EMAIL` / gửi lỗi (hết hạn mức…) → `server_error` → web 500. Log chỉ mã cố định.
- Token `SECRET_TOKEN`, validate payload, `doGet` → `method_not_allowed` giữ nguyên.

**BỎ (trong R-13a)** — ghi Google Sheet (append dòng, `LockService`, header, chống formula injection, `SHEET_NAME`) và báo Telegram (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `UrlFetchApp`).

**Ghi chú R-16** — bên thứ ba nhận form = email tới admin qua Apps Script; web vẫn không lưu DB. OQ#4 / C2 ghi chú theo.

- Không đổi: `src/app/api/contact/route.ts`, `src/lib/api/forward.ts` (chỉ có thể sửa comment), env `CONTACT_FORM_TARGET` / `CONTACT_FORM_TOKEN`, timeout 10 s, rate-limit/honeypot/guard order R-18, UI form.

## Ảnh hưởng test
- Trực tiếp: `tools/contact-mail/Code.gs` (unit test node:vm `tools/contact-mail/code.test.ts` — stub `MailApp`), gửi thật form `/vi/lien-he` + `/en/contact` → mail tới `ADMIN_EMAIL`.
- Phụ thuộc: `POST /api/contact` (`forward.ts` coi `{status:"ok"}` là thành công, khác → 500).
- Regression: validate form client/server, honeypot, rate-limit, thông báo lỗi khi forward lỗi, form CTA rút gọn trang giải pháp.
- Chi tiết: `spec/test-scope/current.json` (scope v57).
