Agent: spec-validator (do change-request thực hiện inline theo `.agent/spec-validator.md`, chỉ đạo coordinator)

# Spec Validation Report — feature-contact-form-email-only · phase 1 (CR-039)

**Entry Mode:** partial_docs (change request + code + docs as-built)
**Sources validated against:** `spec/changes/2026-10-15-contact-form-email-only.md` (Acceptance), `SPECIFICATIONS.md` R-13 / R-13a (4.7.0) / R-16 / OQ#4 / C2,
`tools/contact-mail/Code.gs` + `code.test.ts` + `README.md`, `src/lib/api/forward.ts`, `src/lib/contact/useContactForm.ts`,
`docs/API_SPEC.md`, `docs/ERD.md`, `docs/runbook/deploy-vps.md`, `.env.local.example`, `docs/BRD.md`, `spec/test-scope/current.json` (v57),
reviewer round 2 `.context/review-reports/feature-contact-form-email-only-phase-1-task-01-round-2-review.md` (PASS).

## Verdict: ✅ PASS

## Feature Coverage Matrix

| # | Requirement / Acceptance | Nguồn | Status | Bằng chứng |
|---|---|---|---|---|
| 1 | Hợp lệ → đúng 1 email tới `ADMIN_EMAIL` đủ 8 thông tin (giờ VN, ngôn ngữ, tên, email, SĐT, công ty, nhu cầu nhãn, nội dung) | CR §Acceptance 1 · R-13a §4 | ✅ | `Code.gs` `doPost` → `sendContactMail_` → `buildMailBody_` (8 dòng, `formatSubmittedAt_` `Asia/Ho_Chi_Minh`, `needLabel_`, `orDash_`) |
| 2 | `replyTo` = email khách; tiêu đề `[NTA] Liên hệ mới — <tên>` | CR §2 · R-13a §4 | ✅ | `sendContactMail_` `replyTo: p.email`; `MAIL_SUBJECT_PREFIX_` + `buildMailSubject_` |
| 3 | Không ghi Sheet, không Telegram, không đọc `SHEET_NAME`/`TELEGRAM_*`, không `UrlFetchApp` | CR §3 · R-13a §4–5 | ✅ | grep `SpreadsheetApp|UrlFetchApp|LockService|SHEET_NAME|TELEGRAM_|htmlBody` trong `Code.gs` → 0; test kiểm tĩnh nguồn |
| 4 | Chỉ `{status:"ok"}` khi gửi thành công; lỗi gửi → `server_error` | CR §4 · R-13a §4 | ✅ | `sendContactMail_` try/catch → false → `server_error`; test MailApp ném lỗi |
| 5 | Token + validate giữ nguyên; không chèn HTML (plain text) / header (tiêu đề) | CR §5 · R-13a §4 | ✅ | `isValidToken_`, `validatePayload_` giữ; không `htmlBody`; `CONTROL_CHARS_` lọc tên + cắt 100; `REPLY_TO_PATTERN_` 1 địa chỉ, vẫn lỏng hơn zod web (G5) |
| 6 | Thiếu `ADMIN_EMAIL` → `server_error`, log mã cố định, không lộ dữ liệu | CR §6 · R-13a §4 | ✅ | `readAdminEmail_` trim → `contact-mail: admin_email_missing`, không gọi MailApp; log chỉ mã cố định |
| 7 | Đổi `ADMIN_EMAIL` có hiệu lực ngay, không redeploy | CR §7 · R-13a §4 | ✅ | đọc property mỗi request (không cache); test đổi giữa 2 request |
| 8 | Test + README cập nhật (property, quyền gửi mail, hạn mức) | CR §8 | ✅ | `code.test.ts` 51/51 PASS; README a–h (`ADMIN_EMAIL`, `testSendMail` cấp quyền, hạn mức ~100 / ~1500/ngày, xoá property cũ, phiên bản mới giữ URL `/exec`) |
| 9 | Hợp đồng web `CONTACT_FORM_TARGET`/`CONTACT_FORM_TOKEN`/JSON `{status:"ok"}` giữ nguyên | R-13a §2–3 | ✅ | `git diff src/` chỉ đổi 4 dòng comment (`forward.ts` ×3, `useContactForm.ts` ×1) |
| 10 | Honeypot/rate-limit/guard order R-18 giữ nguyên | R-13a §6 | ✅ | `route.ts` không đổi |
| 11 | R-16: bên thứ ba = email qua Apps Script, web không lưu DB | R-16 | ✅ | spec ghi chú 4.7.0; `docs/ERD.md` "Không lưu DB" + ContactSubmission khớp |

## Cross-Document Conflicts

| Conflict | Source A | Source B | Impact | Xử lý |
|---|---|---|---|---|
| OQ#4 ở BRD còn ghi "Google Sheet + Telegram" | `docs/BRD.md:176` (intent) | R-13a 4.7.0 | LOW | Thêm ghi chú CR-039 (không viết lại intent — CR đã được user duyệt) ở close-out |

Doc as-built (`docs/API_SPEC.md`, `docs/ERD.md`, `docs/runbook/deploy-vps.md`, `.env.local.example`): khớp R-13a 4.7.0, không còn mô tả Sheet/Telegram sống
(reviewer round 2 grep → 0). `docs/DESIGN.md`: không nhắc → no doc impact. Tham chiếu sống `tools/contact-sheet` → 0 (chỉ còn lịch sử).

## Contradictions / Edge cases
- Không mâu thuẫn giữa requirement. Edge case đã spec + code: thiếu property, lỗi hạn mức, tên chỉ ký tự điều khiển (`-`), email nhiều địa chỉ/`Tên <addr>` (bad_request).
- Trùng mail khi web timeout 10 s + khách gửi lại: spec ghi là rủi ro chấp nhận; runbook + README ghi.

## Test-scope
`spec/test-scope/current.json` v57: `specVersion` 4.7.0 khớp frontmatter, `specRefs` R-13a/R-13/R-16 tồn tại, `changed.files` khớp diff thật.

## Residual (không chặn)
- Hành vi thật `MailApp` (quyền, hạn mức, Spam, nhiều địa chỉ trong `to`) chỉ kiểm thủ công sau khi user dán script + chạy `testSendMail`.
- Reviewer MINOR (không chặn): chưa có test case riêng cho `"` trong email — regex đã chặn.
