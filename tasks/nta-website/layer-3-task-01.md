# Task 01: API `/api/health` + `/api/contact` (rateLimit → validate → honeypot → forward)

## Layer
3

## Type
build (initial)

## Goal
Dựng 2 API route: `GET /api/health` (uptime/Cloud Run) và `POST /api/contact` với guard pipeline
đúng thứ tự R-18: `rateLimit → validate(schema) → honeypot → forward` qua `CONTACT_FORM_TARGET`,
response 200/400/429 đúng contract API_SPEC, không lộ secret (R-19).

## Classification / Risk
- Work item type: FEATURE (initial build)
- Feature change type: ADDITIVE (initial build)
- Scope: CROSS_CUTTING (API contract dùng cho 2 UI surface: contact + CTAForm)
- Root cause category: API_CONTRACT (contract với client)
- Review level expected: **STRICT** (API contract + security: rate-limit/ honeypot/ secret/ input validation)
- Blast radius: `/api/contact` (public endpoint), `/api/health`, form flows Layer 3 task-02/03
- Doc impact: **API_SPEC** — đối chiếu `docs/API_SPEC.md`; khớp → `no doc impact`, lệch → reconcile
- Decision impact: YES nếu rate-limit threshold khác đề xuất → ghi `.context/decisions.md`

## Scope (spec refs)
- **R-13:** `POST /api/contact` — name 2–100, email bắt buộc, phone tuỳ chọn 9–15 số,
  message 10–2000, honeypot rỗng; `200 {status:"ok"}` / `400 {status:"error",errors}` /
  `429 {status:"error",message}`
- **R-14:** `GET /api/health` → `{status:"ok",timestamp}`
- **R-18:** guard order `rateLimit → validate → honeypot (filled → 200 giả, không forward) → handler`;
  route khác public
- **R-19:** HTTPS (deploy Layer 4), secret server-only — `CONTACT_FORM_TARGET` không `NEXT_PUBLIC_*`
- **R-16:** forward, KHÔNG lưu DB · **R-15:**不做 posts/case-studies API (static)
- **R-25 BR-002:** validate email + SĐT hợp lệ trước khi gửi

## Dependencies
- Layer 0 task-01 (scaffold), task-05 (env `CONTACT_FORM_TARGET` convention) —
  Chạy sau Layer 2 theo layer order (UI contact cần API contract)

## Description
1. `src/app/api/health/route.ts`: `GET` → `{status:"ok",timestamp: new Date().toISOString()}`;
   `Cache-Control: no-store`.
2. `src/app/api/contact/route.ts` — `POST` JSON:
   - **rateLimit:** in-memory sliding window theo IP (stateless-friendly, ghi chú giới hạn khi scale):
     đề xuất **5 request / 10 phút / IP** `[cần xác nhận]` (spec chưa định nghĩa) → vượt → `429`
     `{status:"error",message}` (copy theo design Screen 12)
   - **validate:** schema server-side (zod hoặc validator thuần — chọn đơn giản, ghi quyết định);
     fail → `400 {status:"error",errors: {field: message}}` (message i18n key hoặc string theo locale)
   - **honeypot:** field trap có giá trị → trả `200 {status:"ok"}` giả, **không forward**
   - **forward:** `fetch/POST CONTACT_FORM_TARGET` (đích chưa chốt OQ#4 — interface:
     URL env, timeout, failure → `500` không lộ chi tiết internal)
3. Method không phải POST → 405; body không JSON → 400. Không log nội dung PII.
4. Không route API nào khác (R-15 static — ghi chú trong Notes/close-out).

## Acceptance Criteria
- [x] `GET /api/health` → 200 `{status:"ok",timestamp}` (ISO string) + `Cache-Control: no-store`
- [x] `POST /api/contact` hợp lệ → 200 `{status:"ok"}` + forward được gọi (mock target trong verify)
- [x] Thiếu/bất hợp lệ field → 400 với `errors` đúng từng field (4 case: name/email/phone/message)
- [x] Honeypot filled → 200 giả, KHÔNG gọi forward (verify bằng mock); kể cả whitespace-only
- [x] Quá ngưỡng rate-limit (5/10min/IP) → 429 đúng shape; đổi XFF bên trái KHÔNG thoát ngưỡng
- [x] 500 không lộ chi tiết; `CONTACT_FORM_TARGET` chỉ đọc server-side (không xuất trong bundle client)
- [x] Guard đúng thứ tự R-18 `rateLimit → validate → honeypot → forward` (kiểm tra code order)
- [x] Check commands pass

## Verification Summary
- Commands: `npm run lint` (PASS, 1 warning `<img>` ngoài scope) · `npm run typecheck` (PASS) · `npm run build` (PASS; route `/api/contact`+`/api/health`)
- Test: `test_command: null` → skip; verify bằng curl matrix + mock `CONTACT_FORM_TARGET` (builder evidence); reviewer r2 verify tĩnh (shell deny)
- Manual evidence: health 200 ISO + no-store; valid 200 (mock nhận); 400 ×4 field; non-JSON 400; honeypot (kể cả whitespace) → 200 KHÔNG forward; request 6 → 429 (kể cả đổi XFF trái/thiếu XFF); `GET /api/contact` → 405; mock 503 → 500 generic; secret grep client bundle clean
- Reviewer report (round 2, PASS): `.context/review-reports/feature-nta-website-layer-3-task-01-round-2-review.md` (r1 FAIL MAJOR rate-limit bypass → r2 PASS STRICT)

## Retry / Error Memory
- Attempt: 1 (r1 FAIL: MAJOR rate-limit bypass qua `X-Forwarded-For` + 3 MINOR → fix → r2 PASS)
- Last failure type: SECURITY (client-controlled XFF leftmost → rate-limit bypass)
- Error memory entry: ghi vào `.context/error-memory.md` (Error 6 — trust boundary của proxy header)
- Escalation: none — sau 3 attempt fail → `architecture_review_needed`

## Doc / Decision Impact
- **Doc impact: NO_DOC_IMPACT** — contract khớp `docs/API_SPEC.md` (không đổi shape/status).
- **Decision impact: YES** — `.context/decisions.md` Decision 4 (rate-limit 5/10min/IP; `CONTACT_FORM_TARGET` server-only + mock verify).
- Residual: rate-limit in-memory **per-instance** (không share khi scale ngang) → ghi residual Layer 4/Cloud Run; premise "GFE append rightmost XFF" cần xác nhận trên hạ tầng thật (Layer 4).

## DoD (Definition of Done)
- [x] Code written (chỉ trong scope)
- [x] Tests: skip — `test_command: null` (verify curl matrix, ghi evidence)
- [x] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [x] Reviewer độc lập PASS (STRICT — API/security) round 2
- [x] `.context/progress.json` updated
- [x] Error Memory / Doc Impact recorded
- [x] committed — 1 task = 1 commit (branch `main`, KHÔNG push)

## Files to Create/Modify
- `src/app/api/health/route.ts`
- `src/app/api/contact/route.ts`
- `src/lib/api/rate-limit.ts`, `src/lib/api/contact-schema.ts`, `src/lib/api/forward.ts`
- `src/i18n/messages/{vi,en}.json` (message 400/429 nếu i18n)

## Notes
- `[cần xác nhận]` rate-limit threshold: đề xuất 5 req/10 phút/IP — confirm với user khi review
  (ảnh hưởng copy 429 + UX form thật); quyết định ghi `.context/decisions.md`.
- `[cần xác nhận]` OQ#4: `CONTACT_FORM_TARGET` — giá trị do user điền `.env.local`;
  verify local bằng mock endpoint; interface forward không đổi khi đổi đích.
- Cấm `NEXT_PUBLIC_CONTACT_FORM_TARGET` (R-19).
