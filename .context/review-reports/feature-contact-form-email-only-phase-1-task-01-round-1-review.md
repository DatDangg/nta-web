Agent: reviewer

# Review — feature-contact-form-email-only · phase-1-task-01 · round 1 (CR-039)

- **Task:** `tasks/feature-contact-form-email-only/phase-1-task-01.md`
- **Diff:** working tree chưa commit (`git diff HEAD -M`), gồm rename `tools/contact-sheet/` → `tools/contact-mail/` (Code.gs, code.test.ts, README.md).
- **Đối chiếu:** `SPECIFICATIONS.md` R-13a (4.7.0) + R-16/OQ#4/C2, `spec/updates/2026-10-15-contact-form-email-only.md`, acceptance `spec/changes/2026-10-15-contact-form-email-only.md`.

## Review level
**STRICT**

## Reason
Endpoint công khai (Apps Script Web App) nhận dữ liệu người dùng → gửi email: token bí mật, chèn header/HTML vào mail, log không lộ dữ liệu,
kênh liên hệ khách hàng duy nhất không còn bản lưu dự phòng. Thuộc nhóm risk đỏ security/token + webhook-like endpoint.

## Blast radius
- `tools/contact-mail/Code.gs` (chạy trên Google, user dán + deploy), `tools/contact-mail/code.test.ts`, `tools/contact-mail/README.md`.
- `src/lib/api/forward.ts`, `src/lib/contact/useContactForm.ts`: **chỉ đổi comment** (đã soát `git diff HEAD -- src/`: 4 dòng comment, không đổi logic/hợp đồng).
- Doc as-built: `docs/API_SPEC.md`, `docs/ERD.md`, `docs/runbook/deploy-vps.md`, `.env.local.example`; `.context/decisions.md` (append CR-039, mục CR-037 giữ nguyên).
- Không đụng route `/api/contact`, env, UI, DB.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm test` | 194 test: 191 pass, 2 skip (cần `TEST_DATABASE_URL`), **1 fail ngoài scope**: `tools/db/content-rules.test.ts` (thiếu 9 file `/uploads/*.jpg|png` local). Diff không đụng `tools/db/`, nội dung hay `public/uploads` → fail có sẵn, không do task. Toàn bộ test `tools/contact-mail/code.test.ts` PASS. |
| `npm run typecheck` | PASS (exit 0) |
| `npm run lint` | PASS — 0 error, 1 warning có sẵn `src/components/mdx/index.tsx:26` (no-img-element), ngoài diff |
| `npm run build` | **không chạy** theo chỉ đạo primary (primary chạy riêng; sandbox subagent chặn swc native). Diff `src/` chỉ đổi comment → rủi ro build thấp. |
| Grep `contact-sheet` (loại trừ file lịch sử) | Còn: `.context/decisions.md:193` (mục CR-037 lịch sử), `:209` (mô tả đổi tên), change doc/spec update/test-scope/CHANGELOG/task của CR-039 (mô tả đổi tên). **0 tham chiếu sống.** |
| Grep `SpreadsheetApp|UrlFetchApp|LockService|SHEET_NAME|TELEGRAM_|htmlBody` trong `Code.gs` | 0 (test tĩnh trong `code.test.ts:303-305` cũng kiểm) |

## Responsive Checklist Gate
N/A — diff không đổi UI (chỉ 1 dòng comment trong hook `useContactForm.ts`).

## Skill gates
- **aislop:** OK — `npx aislop scan --changes --json` → 0 errors, 0 warnings, 0 ai-slop-indicator (lưu ý: `.gs` có thể không thuộc phạm vi scan).
- **oxlint (anti-slop):** skip, oxlint not configured (không có `.oxlintrc*`).
- **ocr (open-code-review):** skip, ocr không cấu hình trong repo.
- **AI-readable:** OK — tên hàm self-descriptive (`buildMailSubject_`, `sendContactMail_`, `readAdminEmail_`…), hàm ≤ 30 dòng, Code.gs 178 dòng, hằng có tên (không magic number), README cập nhật. 0 indicator.
- **ai-friendly-web:** N/A (không đổi trang public).
- **blitzstrike:** skip, không cài / không có môi trường được phép.

## Kiểm theo trọng tâm STRICT
| Hạng mục | Kết quả | Bằng chứng |
|---|---|---|
| Token giữ nguyên (so không short-circuit, `SECRET_TOKEN` rỗng/thiếu → unauthorized) | OK | `Code.gs:101-108`, kiểm trước validate `:47`; test `code.test.ts:203-220` (7 case, 0 mail) |
| Validate payload giữ nguyên (lỏng hơn web — G5) + thêm kiểm `replyTo` | OK | `Code.gs:111-123`, regex `:32` cấm whitespace/control/@ thừa; test `:222-251` |
| Plain text, không `htmlBody` | OK | `Code.gs:164-172`; test `:100`, `:156-162` |
| Subject lọc ký tự điều khiển, cắt 100 | OK | `Code.gs:141-145`; test `:182-201` (`\r\nBcc:`, tab, `\u0000\u007F`, 300 ký tự) |
| `replyTo` validate (không chèn header) | OK | regex `Code.gs:32`; test email có `\n Bcc:`, khoảng trắng, `\u0001`, 2 `@`, thiếu `@` |
| Chỉ `{"status":"ok"}` khi gửi thành công | OK | `Code.gs:60-63`, `sendContactMail_` trả false khi exception |
| Thiếu `ADMIN_EMAIL` → server_error, kiểm trước khi gửi, log mã cố định | OK | `Code.gs:55-59`; test `:255-262` (null/""/"   ", 0 mail, log đúng 1 dòng mã) |
| Gửi lỗi → server_error, log không lộ dữ liệu | OK | `Code.gs:174-177` (không in `err`); test `:264-273` |
| `ADMIN_EMAIL` đọc mỗi request | OK | `Code.gs:54-55`; test `:164-173` |
| Bỏ Sheet/Telegram/SHEET_NAME/TELEGRAM_*/UrlFetchApp | OK | grep 0; harness không stub các service đó (gọi tới → ReferenceError) |
| Hợp đồng web `forward.ts` không đổi hành vi | OK | diff chỉ 3 dòng comment |
| `doGet` → method_not_allowed, `NEED_LABELS_` khớp `CONTACT_NEEDS` | OK | test `:277-301` |
| `testSendMail()` công khai, không nhận tham số web | OK | `Code.gs:74-89` |
| README đúng | OK | a–h khớp code (tên property, mã log, `testSendMail`, `curl -L`, hạn mức, xoá property cũ) |
| Doc reconcile đủ | **FAIL** | xem finding 1–2 |

## Findings

### [MAJOR] 1. `docs/API_SPEC.md:28` — bảng endpoint còn mô tả đích cũ
Dòng `POST /api/contact` vẫn ghi "forward Apps Script Web App `CONTACT_FORM_TARGET` **ghi Google Sheet + báo Telegram**", mâu thuẫn với §Forward
cùng file (`:79-81` "không ghi Sheet, không Telegram (CR-039)") và với code `Code.gs`. Doc as-built sai so với hành vi thật.
**Fix:** đổi thành "… forward Apps Script Web App `CONTACT_FORM_TARGET` → gửi email tới Script Property `ADMIN_EMAIL` (không lưu DB web)".

### [MAJOR] 2. `docs/ERD.md:88` — bảng entity ContactSubmission còn "lưu ở Google Sheet ngoài hệ thống"
Mâu thuẫn với đoạn "Không lưu DB" đã sửa ở `docs/ERD.md:28-29` và với R-16 4.7.0.
**Fix:** đổi thành "— (không lưu DB web; gửi email tới `ADMIN_EMAIL` qua Apps Script, CR-039)" và cột cuối "… (Apps Script, CR-037 → CR-039)".

### [MINOR] 3. `docs/BRD.md:176` (intent doc) còn ghi chốt "Google Sheet … + báo Telegram (CR-037)"
Intent doc — builder/reviewer **không** tự sửa. CR-039 là change request user đã duyệt (SPECIFICATIONS OQ#4 đã ghi chú 4.7.0);
đề xuất agent `change-request` thêm ghi chú "đổi 15/10/2026 (CR-039): chỉ gửi email tới `ADMIN_EMAIL`" ở bước close-out, hoặc ghi rõ lý do không sửa. Không chặn PASS.

### [MINOR] 4. `tools/contact-mail/Code.gs:32` — `REPLY_TO_PATTERN_` cho qua `,` `;` `<` `>` `"`
Vd `email: "a@x.com,b@y.com"` → `replyTo` nhiều địa chỉ. Không phải chèn header (đã chặn CR/LF/control), endpoint cần token, web zod chặn trước → rủi ro thấp.
**Fix tuỳ chọn:** thêm `,;<>"()` vào lớp ký tự cấm (vẫn lỏng hơn zod, không vi phạm G5) + 1 test.

### [MINOR] 5. `tools/contact-mail/Code.gs:115, 141-144` — tên chỉ gồm ký tự điều khiển (vd `"\u0001"`) qua validate
`trim()` không bỏ `\u0001` nên `validatePayload_` nhận; subject thành `[NTA] Liên hệ mới — ` (tên rỗng). Chỉ là hiển thị, web zod nhiều khả năng đã chặn.
**Fix tuỳ chọn:** subject dùng `orDash_` khi tên sau lọc rỗng.

### Ghi chú (không phải defect)
- `spec/changes/2026-10-15-contact-form-email-only.md:14,27` còn nhắc `tools/contact-sheet/` — là văn bản yêu cầu gốc của CR, sẽ archive; chấp nhận.
- Residual risk: hành vi thật của `MailApp` (scope gửi mail, hạn mức, Spam, `to` nhiều địa chỉ phẩy) chỉ kiểm được thủ công sau khi user dán script + chạy `testSendMail`; `npm run build` chưa chứng minh trong review này.

## Verdict
❌ **FAIL** — code Apps Script + test + README đạt toàn bộ trọng tâm bảo mật/hợp đồng, nhưng doc reconcile as-built chưa đủ
(2 MAJOR: `docs/API_SPEC.md:28`, `docs/ERD.md:88` còn mô tả Sheet/Telegram). Sửa 2 dòng doc → round 2 (FAST/NORMAL đủ cho phần doc).
MINOR 3–5 không chặn PASS.
