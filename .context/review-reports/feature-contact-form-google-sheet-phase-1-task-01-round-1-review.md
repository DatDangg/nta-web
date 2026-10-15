# Review — feature-contact-form-google-sheet · phase-1-task-01 · round 1

Agent: reviewer
Ngày: 2026-10-15 · CR-037 · spec R-13a (4.5.0)

## Review level
**STRICT**

## Reason
Endpoint công khai nhận PII, xác thực bằng secret token, gọi Telegram bằng token bot prod, chống formula injection trên Sheet (risk đỏ: security/token, webhook-like endpoint, dữ liệu cá nhân).

## Blast radius
Chỉ file mới `tools/contact-sheet/{Code.gs,code.test.ts,README.md}` + append `.context/decisions.md` + Verification summary trong task file. Không đụng `src/`, không đụng bot content. `code.test.ts` import `CONTACT_NEEDS` (read-only). Hợp đồng payload/response là đầu vào của task-02.
Ngoài scope (không xét): `spec/changes/BACKLOG.md`, `spec/changes/2026-10-15-ai-news-naming-images.md`.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm test` | 178 test · 175 pass · 2 skip (cần DB) · **1 fail** `tools/db/content-rules.test.ts` "ảnh tồn tại" — 9 ảnh `/uploads/<sha>` không có trên máy local. Ngoài scope: test + nội dung tham chiếu đều đã commit từ CR-031, diff hiện tại không đụng `tools/db/`/nội dung, không import `tools/contact-sheet/`. Toàn bộ test `tools/contact-sheet/code.test.ts` PASS. |
| `npm run lint` | 0 error, 1 warning có sẵn (`src/components/mdx/index.tsx` no-img-element). ESLint không quét `.gs`. |
| `npm run typecheck` | PASS (không quét `.gs`; vm nạp `Code.gs` trong test = bằng chứng cú pháp). |
| Grep `getUpdates\|setWebhook\|parse_mode` trong `Code.gs` | 0 kết quả (đọc toàn bộ file xác nhận). |

## Đối chiếu checklist
- Hợp đồng payload/response: khớp task §Hợp đồng (`ok` / `error` + `unauthorized|bad_request|server_error`, không echo dữ liệu, không lộ lỗi nội bộ). `doGet` → `method_not_allowed`. OK.
- Token: so sánh độ dài XOR + XOR từng ký tự trên độ dài `expected`, không short-circuit; `getProperty` trả `null`/`''` → false → `unauthorized`. Token check chạy TRƯỚC validate/ghi/Telegram. OK.
- Lock + appendRow: `waitLock(10000)` trong try, `releaseLock` trong finally, Telegram gửi SAU khi nhả lock; header 8 cột đúng thứ tự spec; giờ VN qua `Utilities.formatDate(date,'Asia/Ho_Chi_Minh','yyyy-MM-dd HH:mm:ss')`. OK.
- Formula injection `= + - @ \t \r` → tiền tố `'`, áp mọi ô. OK.
- Validate lỏng hơn web (`src/lib/api/contact-schema.ts`): name/email/message chỉ cần chuỗi không rỗng ≤ 5000 (web: 2–100 / regex / 10–2000); phone/company/need nhận `null`/`''`/chuỗi bất kỳ; `need` lạ ghi nguyên key. Mọi payload web chấp nhận đều qua. OK (G5).
- Telegram: text thuần, không `parse_mode`, `disable_web_page_preview`, ≤ 4000, thiếu token/chat → bỏ qua, lỗi/4xx → log mã cố định, không token/PII, kết quả vẫn `ok`. Chỉ gọi `sendMessage`. OK.
- README a–g đủ; secret ở GitHub repo Secrets → `deploy.yml` → compose (trỏ task-02 / runbook §4 — section tồn tại); chỉ placeholder, không URL/token thật. OK.
- API Apps Script V8 đúng: `ContentService.createTextOutput().setMimeType(ContentService.MimeType.JSON)`, `LockService.getScriptLock().waitLock/releaseLock`, `UrlFetchApp.fetch(url,{method,payload,muteHttpExceptions})`, `getResponseCode()`, `Utilities.formatDate`, `e.postData.contents`. OK.

## Findings

### HIGH
1. **`appendRow` tự ép kiểu chuỗi số → SĐT mất số 0 đầu** — `tools/contact-sheet/Code.gs:109-119` (`buildRow_`) + `:139` (`sheet.appendRow(row)`).
   `appendRow`/`setValues` trong Google Sheets parse chuỗi như khi người gõ tay: `"0901234567"` → số `901234567`. Web chỉ chấp nhận phone toàn chữ số (`PHONE_PATTERN = /^\d{9,15}$/`) nên **gần như mọi SĐT Việt Nam ghi vào Sheet bị sai** (mất `0`, chuỗi dài 15 số còn bị làm tròn/hiển thị dạng 9.01E+14). Cùng cơ chế: tên/công ty/nội dung kiểu `1/2`, `2026-10-15`, `1e5`, `TRUE` bị đổi thành ngày/số/boolean. Đây là sai dữ liệu PII cốt lõi (kênh gọi lại khách), vi phạm acceptance "1 dòng đủ 8 cột" về tính đúng giá trị. Test không bắt được vì stub `appendRow` chỉ lưu mảng chuỗi.
   Đề xuất (builder chọn 1, giữ đơn giản): (a) tiền tố `'` cho **mọi ô dữ liệu người dùng** (cột 2–8, không chỉ khi khớp ký tự công thức) — `'` vừa chống công thức vừa ép text, Sheet không hiển thị dấu `'`; hoặc (b) `sheet.getRange(nextRow, 1, 1, 8).setNumberFormat('@')` trước khi `setValues` (bỏ `appendRow`, vẫn trong lock). Cột thời gian để Sheet parse thành ngày là chấp nhận được. Thêm test: phone `"0901234567"` → ô ghi giữ được `0` đầu (với (a): kỳ vọng `"'0901234567"`).

### MEDIUM
— không có.

### LOW (không chặn)
2. Lock chờ tối đa 10 s trùng timeout web 10 s (README:58) — script có thể ghi xong sau khi web đã timeout → user bấm gửi lại → dòng trùng. Ghi chú cho task-02 (cân nhắc `waitLock` ngắn hơn, vd 5 s, hoặc chấp nhận trùng và ghi residual risk).
3. Exception ngoài các khối try (vd `PropertiesService` lỗi) → Apps Script trả trang HTML lỗi thay vì JSON. Khớp spec R-13a.3 (web coi HTML lỗi = thất bại) — chỉ ghi nhận, không cần sửa.
4. Bảng `NEED_LABELS_` chỉ khoá tập key, không khoá chữ nhãn với `vi.json` — builder đã ghi residual risk, chấp nhận.

## Verdict
**FAIL** — 1 HIGH (#1: SĐT/chuỗi số bị Sheet ép kiểu khi `appendRow`, mất số 0 đầu). Phần bảo mật (token, injection, Telegram, log, README) đạt. Sửa #1 + thêm test tương ứng rồi review round 2 (scope hẹp: `buildRow_`/`sanitizeCell_` hoặc khối ghi Sheet + test).
