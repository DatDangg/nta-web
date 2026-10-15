Agent: reviewer

# Review — feature-contact-form-email-only · phase-1-task-01 · round 2 (CR-039)

- **Task:** `tasks/feature-contact-form-email-only/phase-1-task-01.md`
- **Round 1:** `.context/review-reports/feature-contact-form-email-only-phase-1-task-01-round-1-review.md` (FAIL: MAJOR 1–2 doc reconcile; MINOR 3–5)
- **Diff:** working tree chưa commit (`git diff HEAD -M`), soát lại phần đổi từ round 1.

## Review level
**NORMAL** (re-review có trọng tâm)

## Reason
Round 1 đã review STRICT toàn bộ Code.gs/test/README, không còn finding bảo mật. Round 2 chỉ kiểm phần sửa: 2 dòng doc as-built,
1 regex validate `replyTo` và fallback tiêu đề trong `Code.gs`, + test mới. Phần sửa ở Code.gs chỉ siết thêm validate/hiển thị, không đổi hợp đồng.

## Blast radius
- `docs/API_SPEC.md:28`, `docs/ERD.md:88` (doc as-built).
- `tools/contact-mail/Code.gs:33` (`REPLY_TO_PATTERN_`), `:145` (`buildMailSubject_`); `tools/contact-mail/code.test.ts`.
- Web (`src/`) không đổi thêm — vẫn chỉ comment.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `node --import tsx --test tools/contact-mail/code.test.ts` | **51/51 PASS** (0 fail, 0 skip) |
| `npm run typecheck` | PASS (exit 0) |
| `npm run lint` | PASS — 0 error, 1 warning có sẵn `src/components/mdx/index.tsx:26`, ngoài diff |
| `npm run build` | không chạy theo chỉ đạo primary |
| Grep `Google Sheet|Telegram` trong `docs/API_SPEC.md`, `docs/ERD.md`, `docs/DESIGN.md`, `docs/runbook/deploy-vps.md` | 0 dòng |

## Responsive Checklist Gate
N/A — không đổi UI.

## Skill gates
- aislop: OK ở round 1 (0 finding); round 2 chỉ đổi regex + 1 biểu thức, không phát sinh pattern mới.
- oxlint: skip, oxlint not configured. · ocr: skip, chưa cài. · blitzstrike: skip. · ai-friendly-web: N/A.
- AI-readable: OK — 0 indicator.

## Kiểm lại findings round 1
| # | Finding | Trạng thái | Bằng chứng |
|---|---|---|---|
| 1 | [MAJOR] `docs/API_SPEC.md:28` còn Sheet/Telegram | **Đã sửa** | dòng mới: "… → gửi 1 email tới Script Property `ADMIN_EMAIL` (CR-039; không Sheet/Telegram, không lưu DB web)", khớp §Forward `:79-81` |
| 2 | [MAJOR] `docs/ERD.md:88` còn "lưu ở Google Sheet" | **Đã sửa** | "không Sheet — mỗi lượt gửi = 1 email tới `ADMIN_EMAIL`" / "Apps Script gửi mail, CR-039", khớp `:28-29` |
| 3 | [MINOR] `docs/BRD.md:176` intent doc | **Chuyển** cho `change-request` ghi chú lúc close-out (theo chỉ đạo primary) — không chặn |
| 4 | [MINOR] regex `replyTo` cho qua `, ; < > "` | **Đã sửa** | `Code.gs:33` `/^[^\s@,;<>"\u0000-\u001F\u007F]+@[^\s@,;<>"\u0000-\u001F\u007F]+$/`; test `code.test.ts:244-246` (dấu phẩy, chấm phẩy, `A<a@…>`) → bad_request, 0 mail. Vẫn lỏng hơn zod email web (G5 giữ). |
| 5 | [MINOR] tên chỉ có ký tự điều khiển → tiêu đề trống | **Đã sửa** | `Code.gs:145` `MAIL_SUBJECT_PREFIX_ + orDash_(name)`; test `code.test.ts:193-197` → `[NTA] Liên hệ mới — -` |

## Findings
- [MINOR] (không chặn) `tools/contact-mail/code.test.ts:244-246` — regex cấm thêm `"` nhưng chưa có case test riêng cho dấu `"` trong email. Đề xuất thêm 1 case nếu tiện; hành vi đã đúng theo regex.
- Không còn CRITICAL/MAJOR.

## Residual risk
- Hành vi thật của `MailApp` (scope gửi mail, hạn mức, Spam, `to` nhiều địa chỉ phẩy) chỉ kiểm thủ công sau khi user dán script + chạy `testSendMail`.
- `npm run build` chưa chạy trong review (primary chạy riêng); diff `src/` chỉ đổi comment.
- `npm test` toàn bộ: fail có sẵn ngoài scope `tools/db/content-rules.test.ts` (thiếu `/uploads` local) như round 1 — không liên quan diff.

## Verdict
✅ **PASS** — MAJOR 1–2 đã sửa, MINOR 4–5 đã sửa kèm test, MINOR 3 chuyển change-request close-out. Điều kiện commit còn lại: primary xác nhận `npm run build` PASS.
