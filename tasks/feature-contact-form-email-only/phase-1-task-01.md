# feature-contact-form-email-only · phase-1-task-01 — Apps Script chỉ gửi email tới `ADMIN_EMAIL` (bỏ Sheet + Telegram)

- **CR:** CR-039 · change doc `spec/changes/2026-10-15-contact-form-email-only.md` · spec R-13a (4.7.0), ghi chú R-16
- **Classification / Risk:** MODIFY + REMOVE · **MEDIUM**
  - Expected review level: **STRICT** (endpoint công khai nhận dữ liệu người dùng → email: token, header/HTML injection,
    log không lộ dữ liệu; luồng liên hệ là kênh khách hàng duy nhất, không còn bản lưu dự phòng).
  - Blast radius: script Apps Script (chạy trên Google, user dán + deploy), unit test của nó, README, doc as-built.
    **Không** đổi hành vi web: `src/app/api/contact/route.ts`, `src/lib/api/forward.ts` (chỉ comment), env, UI form.
  - Doc impact: `docs/API_SPEC.md` (§Forward tới Apps Script), `docs/ERD.md` (đoạn "Không lưu DB"), `docs/runbook/deploy-vps.md`
    (bảng env §4 + troubleshooting form), `.env.local.example` (comment CONTACT FORM) — as-built, reconcile.
    `.context/decisions.md` → **append** mục CR-039 (không sửa mục CR-037 cũ).
  - Migration gate: không áp dụng (không đụng DB).
- **Deps:** không. 1 task duy nhất cho phase 1.

## Quyết định thiết kế (change-request đã chốt)
- **Đổi tên thư mục `tools/contact-sheet/` → `tools/contact-mail/`** bằng `git mv` (giữ lịch sử). Lý do: tên cũ sai nghĩa sau khi bỏ Sheet.
  Glob test `tools/**/*.test.ts` (`package.json` script `test`) và `tsconfig.json` include `**/*.ts` tự bao thư mục mới —
  **không** cần sửa cấu hình. Import `../../src/lib/contact/company-info` giữ nguyên độ sâu.
  Tham chiếu sống cần sửa: `docs/API_SPEC.md:79`, `docs/ERD.md:28`, `docs/runbook/deploy-vps.md:106,158`, `.env.local.example:76`,
  header `Code.gs`/`code.test.ts`/`README.md`. **Không** sửa file lịch sử (`spec/changes/archive/*`, `spec/updates/2026-10-15-contact-form-google-sheet.md`,
  `tasks/feature-contact-form-google-sheet/*`, `.context/review-reports/*`, `.context/runs/*`, `spec/CHANGELOG.md` dòng cũ).
  `scripts/screenshots/contact-sheet.mjs` là công cụ chụp ảnh "contact sheet", **không liên quan** — không đổi.
- Script vẫn có thể nằm trong project Apps Script cũ (gắn Sheet) — chỉ thay code + cập nhật phiên bản triển khai cũ → URL `/exec` giữ nguyên,
  `CONTACT_FORM_TARGET` / `CONTACT_FORM_TOKEN` không đổi. Hướng dẫn cả trường hợp tạo project độc lập (script.google.com → Dự án mới).
- `src/lib/api/forward.ts`: hành vi **không đổi** (vẫn POST JSON, theo redirect, chỉ `{status:"ok"}` là thành công, timeout 10 s).
  Chỉ sửa comment dòng 3, 6, 28 (bỏ "ghi Sheet/Telegram/lock", hợp đồng trỏ task này). `src/lib/contact/useContactForm.ts:64` comment
  "Sheet ghi khách đến từ…" → "mail ghi ngôn ngữ…". Không đổi test web.

## Scope
1. `git mv tools/contact-sheet tools/contact-mail`.
2. `tools/contact-mail/Code.gs` (Apps Script V8, giữ style ES5 `var` như hiện tại):
   - Giữ nguyên: `doPost` parse JSON → `bad_request`; `isValidToken_` (so không short-circuit với `SECRET_TOKEN`) → `unauthorized`;
     `validatePayload_` (lỏng hơn web — G5); `doGet` → `method_not_allowed`; `jsonResponse_`; `NEED_LABELS_` (khớp `CONTACT_NEEDS`);
     `needLabel_`; `formatSubmittedAt_` (giờ VN, fallback giờ nhận).
   - Validate thêm cho `replyTo`: `email` không chứa khoảng trắng/ký tự điều khiển và có dạng `x@y` (vd `/^[^\s@]+@[^\s@]+$/`) — sai → `bad_request`
     (vẫn lỏng hơn zod email của web, không chặn payload web hợp lệ).
   - **Bỏ hẳn**: `SHEET_HEADER_`, `sanitizeCell_`, `buildRow_`, `appendContactRow_`, `LOCK_TIMEOUT_MS_`, `LockService`, `SpreadsheetApp`,
     `buildTelegramText_`, `notifyTelegram_`, `TELEGRAM_MAX_LENGTH_`, `UrlFetchApp`, đọc `SHEET_NAME` / `TELEGRAM_*`.
   - Thêm:
     - `buildMailSubject_(p)` → `'[NTA] Liên hệ mới — ' + tên` với tên đã bỏ ký tự điều khiển (`[\u0000-\u001F\u007F]` → khoảng trắng, gộp khoảng trắng, trim)
       và cắt ≤ 100 ký tự (thêm `…`).
     - `buildMailBody_(p, receivedAt)` → plain text, mỗi dòng 1 trường: Thời gian (giờ VN) · Ngôn ngữ · Tên · Email · SĐT · Công ty · Nhu cầu (nhãn) ·
       dòng trống · "Nội dung:" · nội dung nguyên văn. Field trống/null → `-`. Không HTML.
     - `sendContactMail_(adminEmail, p, receivedAt)` → `MailApp.sendEmail({ to, replyTo: p.email, subject, body, name: 'NTA Website' })`
       trong try/catch; lỗi → `console.error('contact-mail: send_failed')` + trả false. **Không** dùng `htmlBody`.
   - `doPost`: sau token + validate → `adminEmail = trim(props.getProperty('ADMIN_EMAIL'))`; rỗng → `console.error('contact-mail: admin_email_missing')`
     + `server_error` (kiểm **trước** khi gửi, không gọi MailApp); gửi OK → `{status:'ok'}`; lỗi → `server_error`.
   - Đọc `ADMIN_EMAIL` mỗi request (không cache) → đổi property có hiệu lực ngay.
   - Log chỉ mã cố định `contact-mail: <code>` — không in token, địa chỉ admin, dữ liệu liên hệ, message của exception.
   - Thêm hàm **công khai** `testSendMail()` (không gạch dưới, chạy được từ editor) gửi 1 mail thử tới `ADMIN_EMAIL` với payload mẫu — dùng để
     **cấp quyền gửi mail** lần đầu (phiên bản triển khai "Thực thi: Tôi" cần chủ script cấp scope `script.send_mail` trước, không thì `doPost`
     trả trang HTML lỗi quyền → web 500) và để test. Không nhận tham số từ web (Web App chỉ gọi `doGet`/`doPost`).
   - Header comment: mô tả mới (CR-039, R-13a 4.7.0), Script Properties: `SECRET_TOKEN` (bắt buộc), `ADMIN_EMAIL` (bắt buộc).
3. `tools/contact-mail/code.test.ts` (node:vm, chạy trong `npm test`):
   - Harness: stub `PropertiesService`, `ContentService`, `Utilities.formatDate` (giờ VN), `MailApp.sendEmail` (ghi lại lời gọi / ném lỗi theo option),
     `console`. **Không** stub `SpreadsheetApp`/`LockService`/`UrlFetchApp` — nếu script gọi tới sẽ ném ReferenceError → test bắt được.
   - Kiểm: token đúng → đúng 1 lần `sendEmail`, `to` = `ADMIN_EMAIL`, `replyTo` = email khách, `subject` đúng, body đủ 8 thông tin (nhãn nhu cầu,
     giờ VN, `-` cho field trống), không có `htmlBody`, trả `ok`; token sai/thiếu/`SECRET_TOKEN` rỗng → `unauthorized`, 0 mail; payload sai
     (giữ bộ case cũ + email có khoảng trắng/xuống dòng/thiếu `@`) → `bad_request`, 0 mail; `ADMIN_EMAIL` null/rỗng/khoảng trắng → `server_error`,
     0 mail, log `contact-mail: admin_email_missing`; `sendEmail` ném lỗi (message chứa email khách) → `server_error`, log đúng mã, không lộ email;
     tên chứa `\r\n`/tab → subject 1 dòng; tên 300 ký tự → subject cắt; nội dung chứa `<script>`/`<b>` → nằm nguyên văn trong `body` (plain);
     đổi `ADMIN_EMAIL` giữa 2 request → mail 2 tới địa chỉ mới; `doGet` → `method_not_allowed`; `NEED_LABELS_` đúng tập key `CONTACT_NEEDS`;
     `testSendMail` gửi tới `ADMIN_EMAIL`. Kiểm tĩnh nguồn: không chứa `SpreadsheetApp|UrlFetchApp|LockService|SHEET_NAME|TELEGRAM_|htmlBody`.
   - Bỏ toàn bộ test Sheet/Telegram/formula injection cũ.
4. `tools/contact-mail/README.md` — viết lại (tiếng Việt, từng bước):
   a. Dán script (dùng lại project Apps Script cũ — khuyến nghị, giữ URL — hoặc tạo project mới).
   b. Script Properties: `SECRET_TOKEN` (giữ nguyên giá trị cũ), `ADMIN_EMAIL` (test bằng mail user, sau đổi sang mail admin; nhiều địa chỉ
      cách nhau dấu phẩy nếu cần). **Xoá** property cũ `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `SHEET_NAME` (không còn dùng; xoá để khỏi giữ bí mật thừa).
   c. Cấp quyền gửi mail: chạy `testSendMail` trong editor → Google hỏi quyền "Gửi email thay bạn" → cho phép → nhận mail thử.
   d. Cập nhật triển khai: **Quản lý triển khai** → bút chì → **Phiên bản mới** (URL `/exec` giữ nguyên, không đổi secret GitHub, không redeploy web).
      Tạo triển khai mới chỉ khi lần đầu (khi đó đặt `CONTACT_FORM_TARGET` mới + chạy lại Deploy).
   e. Kiểm thử nhanh bằng `curl -L` (kỳ vọng `{"status":"ok"}` + 1 mail; token sai → `unauthorized`, không mail).
   f. Đổi người nhận: chỉ sửa `ADMIN_EMAIL` → có hiệu lực ngay.
   g. Hạn mức + rủi ro: Gmail thường ~100 người nhận/ngày, Workspace ~1500/ngày (xem Apps Script → Quotas); vượt → web báo lỗi; không còn bản lưu
      dự phòng; timeout web 10 s → có thể 2 mail trùng khi khách gửi lại; mail gửi từ tài khoản deploy script, lần đầu có thể vào Spam.
   h. Bảo mật: không commit URL/token/địa chỉ admin riêng tư; log chỉ mã cố định; nội dung plain text; xoay token như cũ.
   Sheet cũ (dữ liệu CR-037) **giữ nguyên** — script mới không ghi thêm; user tự quyết lưu/xoá.
5. Doc reconcile (as-built): `docs/API_SPEC.md` §Forward (script nhận `tools/contact-mail/`, kết quả `ok` = đã gửi mail), `docs/ERD.md:27-29`
   (mỗi lượt gửi = 1 email tới `ADMIN_EMAIL`, không Sheet/Telegram), `docs/runbook/deploy-vps.md:106` (đích = email) + `:156-160` (thêm nguyên nhân
   "chưa cấp quyền gửi mail / thiếu `ADMIN_EMAIL` / hết hạn mức", bỏ mục "Sheet 2 dòng trùng" → "2 mail trùng"), `.env.local.example:74-76`.
   `.context/decisions.md` append mục "CR-039 P1-T01". Kiểm `docs/DESIGN.md` — hiện không nhắc Sheet/Telegram → `no doc impact`.

## Verification plan
- `npm test` (gồm `tools/contact-mail/code.test.ts`), `npm run typecheck`, `npm run lint`, `npm run build` (lệnh theo `.context/project-config.md`).
  Fail có sẵn ngoài scope (`tools/db/content-rules.test.ts` thiếu `/uploads` local) ghi rõ, không tính.
- `git grep -n "contact-sheet" -- ':!spec/changes/archive' ':!spec/updates/2026-10-15-contact-form-google-sheet.md' ':!spec/CHANGELOG.md' ':!tasks/feature-contact-form-google-sheet' ':!.context/review-reports' ':!.context/runs' ':!scripts/screenshots'`
  → chỉ còn tham chiếu lịch sử hợp lệ (vd `.context/decisions.md` mục CR-037), 0 tham chiếu sống.
- `grep -nE "SpreadsheetApp|UrlFetchApp|LockService|SHEET_NAME|TELEGRAM_|htmlBody" tools/contact-mail/Code.gs` → 0.
- `git diff src/` chỉ đổi comment (không đổi logic `forward.ts`).
- Thủ công (user, sau khi dán script — ngoài khả năng agent): `testSendMail` → mail tới; gửi form `/vi/lien-he` + `/en/contact` trên prod → 1 mail
  mỗi lượt, Reply tới email khách; xoá `ADMIN_EMAIL` tạm → form báo lỗi; đặt lại → OK.

## Acceptance
- [ ] Form `/vi/lien-he`, `/en/contact` → 1 email tới `ADMIN_EMAIL` đủ: thời gian (giờ VN), ngôn ngữ, tên, email, SĐT, công ty, nhu cầu (nhãn), nội dung.
- [ ] `replyTo` = email khách; tiêu đề `[NTA] Liên hệ mới — <tên>`.
- [ ] Không ghi Sheet, không gọi Telegram; không đọc `SHEET_NAME` / `TELEGRAM_*`.
- [ ] Chỉ `{"status":"ok"}` khi gửi mail thành công; lỗi gửi → `server_error`.
- [ ] Token + validate giữ nguyên; body plain text, tên không chèn được header.
- [ ] Thiếu `ADMIN_EMAIL` → `server_error`, log mã cố định, không lộ dữ liệu.
- [ ] Đổi `ADMIN_EMAIL` có hiệu lực ngay, không redeploy.
- [ ] Test + README cập nhật; thư mục `tools/contact-mail/`, không còn tham chiếu sống tới `tools/contact-sheet/`.

## Retry / Escalation
- Attempt FAIL thật (reviewer/verify) → sửa trên đĩa, tăng `attempt`; cancel ≠ fail. 3 attempt FAIL → `architecture_review_needed`, dừng báo user.

## Verification summary
_(Builder điền: files changed, lệnh + kết quả, residual risk.)_
