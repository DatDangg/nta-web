# feature-contact-form-google-sheet · phase-1-task-01 — Apps Script Web App (ghi Sheet + báo Telegram) + hướng dẫn dựng

- **CR:** CR-037 · change doc `spec/changes/2026-10-15-contact-form-google-sheet.md` · spec R-13a (4.5.0) · liên quan CR-030 (bot content), CR-008 (field `company`/`need`)
- **Classification / Risk:** ADDITIVE · **HIGH**
  - Expected review level: **STRICT** — endpoint công khai nhận dữ liệu cá nhân (PII), xác thực bằng secret token, gọi API bên thứ ba (Telegram) bằng token bot đang chạy prod, chống formula injection trên Sheet.
  - Blast radius: chỉ file mới trong `tools/contact-sheet/` (không chạy trên VPS/web; user copy vào Apps Script editor). Không đụng `src/`, không đụng code bot content.
  - Doc impact: README hướng dẫn mới trong `tools/contact-sheet/`. Doc as-built khác ở task-02.
  - Decision impact: append `.context/decisions.md` (đích forward = Apps Script, token trong body, Telegram gửi từ Apps Script).
  - Migration gate: không áp dụng (không DB).
- **Deps:** không. Hợp đồng payload dùng chung với task-02 (xem §Hợp đồng).

## Hợp đồng web → Apps Script (task-01 và task-02 phải khớp)
Request `POST <CONTACT_FORM_TARGET>`, `Content-Type: application/json`, body:
```json
{ "token": "<CONTACT_FORM_TOKEN>", "submittedAt": "2026-10-15T08:00:00.000Z", "locale": "vi",
  "name": "...", "email": "...", "phone": "..."|null, "company": "..."|null, "need": "crm"|null, "message": "..." }
```
Response (sau 302 → `script.googleusercontent.com`): JSON `{"status":"ok"}` khi đã ghi Sheet; `{"status":"error","code":"<unauthorized|bad_request|server_error>"}` khi không ghi. Không trả lại dữ liệu đã gửi, không trả chi tiết lỗi nội bộ.

## Scope
1. `tools/contact-sheet/Code.gs` (Apps Script, V8):
   - `doPost(e)`: parse `e.postData.contents` (JSON lỗi / thiếu → `bad_request`); so `token` với Script Property `SECRET_TOKEN` bằng so sánh độ dài + XOR từng ký tự (không short-circuit); thiếu property hoặc sai → `unauthorized`, **không** ghi, không Telegram.
   - Validate phía script chỉ là **chốt an toàn lỏng hơn web** (spec-validation G5 — mọi payload web chấp nhận thì script phải chấp nhận): đúng kiểu (chuỗi hoặc `null`; `phone`/`company`/`need` nhận cả `null` lẫn `''`), mỗi chuỗi ≤ 5000 ký tự, `name`/`email`/`message` không rỗng, `locale ∈ {vi,en}` → sai → `bad_request`. **Không** chặn `need` lạ: key có trong bảng nhãn → nhãn vi; key lạ → ghi nguyên key (bảng lệch không làm mất liên hệ).
   - `LockService.getScriptLock().waitLock(10000)` → `appendRow` vào sheet tên Script Property `SHEET_NAME` (mặc định sheet đầu tiên) của Spreadsheet gắn script (`SpreadsheetApp.getActiveSpreadsheet()`); header tự tạo nếu sheet rỗng: `Thời gian | Ngôn ngữ | Tên | Email | SĐT | Công ty | Nhu cầu | Nội dung`.
   - Cột thời gian: `submittedAt` hợp lệ → định dạng `yyyy-MM-dd HH:mm:ss` múi `Asia/Ho_Chi_Minh`; không hợp lệ → giờ nhận của script. Nhu cầu: key → nhãn tiếng Việt (bảng hằng trong script, khớp `contact.needs.*` vi); key lạ → ghi nguyên key (xem validate).
   - Chống formula injection: mọi ô chuỗi bắt đầu bằng `=`, `+`, `-`, `@`, tab, CR → thêm tiền tố `'`.
   - Sau khi ghi + nhả lock: gửi Telegram trong `try/catch` riêng — `UrlFetchApp.fetch('https://api.telegram.org/bot<TOKEN>/sendMessage', {method:'post', payload: {chat_id, text, disable_web_page_preview: true}, muteHttpExceptions: true})`; text thuần (không `parse_mode`), cắt ≤ 4000 ký tự; thiếu `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` → bỏ qua; lỗi → `console.error` chỉ mã lỗi/HTTP status cố định — **không** in nguyên văn exception của `UrlFetchApp` (message có thể chứa URL kèm token bot), không PII; **luôn** trả `{status:"ok"}` khi đã ghi Sheet. Không gọi `getUpdates`/`setWebhook`/`deleteWebhook`.
   - `doGet` → trả `{status:"error","code":"method_not_allowed"}` (không lộ gì).
   - Hàm thuần tách riêng (`isValidToken_`, `sanitizeCell_`, `validatePayload_`, `buildRow_`, `buildTelegramText_`) để test được ngoài Apps Script.
2. `tools/contact-sheet/code.test.ts` (chạy trong `npm test` — glob `tools/**/*.test.ts`): nạp `Code.gs` bằng `node:vm` với stub `SpreadsheetApp`/`LockService`/`UrlFetchApp`/`PropertiesService`/`ContentService`/`Utilities`, kiểm:
   token đúng → 1 `appendRow` đúng thứ tự cột + 1 lần `UrlFetchApp.fetch` tới `sendMessage` + trả ok; token sai/thiếu/property rỗng → 0 append, 0 fetch, `unauthorized`;
   JSON hỏng → `bad_request`; Telegram ném lỗi / trả 4xx → vẫn 1 append + ok; ô `=HYPERLINK(...)`, `+1`, `-2`, `@x`, bắt đầu bằng tab, bắt đầu bằng CR → có tiền tố `'`;
   text Telegram có đủ tên/email/SĐT/công ty/nhu cầu/nội dung/ngôn ngữ, không có token; không gọi URL nào khác ngoài `sendMessage`;
   `phone`/`company`/`need` = `null` và `''` đều được nhận; `need` lạ → ghi nguyên key, vẫn ok;
   **bảng nhãn nhu cầu trong script có đúng tập key của `CONTACT_NEEDS`** (`src/lib/contact/company-info.ts`) — test import `CONTACT_NEEDS` để phát hiện lệch về sau;
   Telegram ném lỗi có chứa chuỗi token → `console.error` không chứa token.
3. `tools/contact-sheet/README.md` — hướng dẫn user (tiếng Việt, từng bước):
   a. Mở Sheet có sẵn → Tiện ích mở rộng → Apps Script → dán `Code.gs`.
   b. Cài đặt dự án → Thuộc tính tập lệnh: `SECRET_TOKEN` (chuỗi ngẫu nhiên ≥ 32 ký tự — kèm lệnh sinh: `openssl rand -hex 32`), `TELEGRAM_BOT_TOKEN` (token bot content CR-030), `TELEGRAM_CHAT_ID` (cách lấy: chat id cuộc chat user đang dùng với bot — đọc từ log/DB bot hoặc `.env` bot, **không** gọi `getUpdates` khi bot đang chạy polling), `SHEET_NAME` (tuỳ chọn).
   c. Triển khai → Tùy chọn triển khai mới → Ứng dụng web: *Thực thi với tư cách: Tôi*, *Người có quyền truy cập: Bất kỳ ai* → cấp quyền → copy URL `/exec`.
   d. Kiểm thử nhanh bằng `curl -L -X POST ... -d '{"token":...}'` (kỳ vọng `{"status":"ok"}` + 1 dòng + 1 tin Telegram; token sai → `unauthorized`, không dòng).
   e. Đặt secret cho web: `CONTACT_FORM_TARGET` = URL `/exec`, `CONTACT_FORM_TOKEN` = đúng `SECRET_TOKEN` (nơi đặt: **GitHub repo Secrets** — `deploy.yml` đọc secret đưa vào compose; xem task-02 / `docs/runbook/deploy-vps.md` §4) → chạy lại workflow Deploy.
   f. Sửa script sau này: Quản lý triển khai → sửa phiên bản (giữ nguyên URL); xoay token: đổi `SECRET_TOKEN` + secret GitHub cùng lúc rồi deploy lại.
   g. Bảo mật: Sheet chứa PII → chỉ chia sẻ nội bộ; không commit URL/token.

## Verification plan
- `npm test` (gồm `tools/contact-sheet/code.test.ts`) PASS; `npm run lint` + `npm run typecheck` PASS (lint/tsc có thể không quét `.gs` — ghi rõ).
- `node --check` không áp dụng cho `.gs` → test vm nạp file là bằng chứng cú pháp.
- `grep -n "getUpdates\|setWebhook\|parse_mode" tools/contact-sheet/Code.gs` → 0 kết quả.
- Không verify được trên Google thật trong task (user deploy) → ghi residual risk; E2E thật ở close-out sau khi user deploy.

## Acceptance
- [ ] Token sai/thiếu → không ghi, không Telegram, trả `unauthorized`.
- [ ] Token đúng → 1 dòng đủ 8 cột (giờ VN, ngôn ngữ, tên, email, SĐT, công ty, nhu cầu, nội dung), chống formula injection.
- [ ] Telegram lỗi không ảnh hưởng ghi Sheet / kết quả `ok`; text thuần, không lộ token.
- [ ] README đủ các bước a–g; không có URL/token thật trong repo.

## Retry / Escalation
- Attempt FAIL thật (reviewer/verify) → sửa trên đĩa, tăng `attempt`; cancel ≠ fail.
- 3 attempt FAIL → `architecture_review_needed`, dừng báo user.

## Verification summary
_(builder điền)_
