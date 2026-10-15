# feature-contact-form-google-sheet · phase-1-task-02 — web: forward tới Apps Script (token trong body, locale, redirect 302) + env + doc reconcile

- **CR:** CR-037 · change doc `spec/changes/2026-10-15-contact-form-google-sheet.md` · spec R-13a (4.5.0), R-13, R-18
- **Classification / Risk:** ADDITIVE (đụng code forward hiện có — phần MODIFY của R-13) · **HIGH**
  - Expected review level: **STRICT** — API công khai `POST /api/contact`, secret server-only mới, gọi ra ngoài, PII, file CI deploy (`deploy.yml`) + `docker-compose.yml`.
  - Blast radius: `src/lib/api/forward.ts`, `src/lib/api/contact-schema.ts`, `src/lib/contact/useContactForm.ts` (dùng chung `ContactForm.tsx` + `CTAForm.tsx`), `src/app/api/contact/route.ts` (chỉ nếu cần truyền thời điểm), test mới `src/lib/api/forward.test.ts` + `src/lib/api/contact-schema.test.ts`; `.env.local.example`, `docker-compose.yml`, `.github/workflows/deploy.yml`.
  - Doc impact: `docs/API_SPEC.md` (request thêm `locale`, response `500 {status:"error",message}` hiện chưa ghi, payload forward, điều kiện thành công), `docs/ERD.md` (ContactSubmission → Google Sheet), `docs/runbook/deploy-vps.md` §4 (bảng env + danh sách secret dòng ~114 thêm `CONTACT_FORM_TOKEN`) + mục sự cố, **`docs/runbook/db.md` §1b** (script env tạm cho lệnh compose gõ tay: thêm dòng `read -rs CTK && printf 'CONTACT_FORM_TOKEN=%s\n'` — thiếu thì `up` tay tạo lại `nta-web` với token rỗng → form 500; spec-validation G1), **`docs/content-bot/10-server.md:44`** (bảng env thêm `CONTACT_FORM_TOKEN` — GitHub Actions secret), `.context/project-config.md` (`required:` dòng ~161 thêm `CONTACT_FORM_TOKEN`, bỏ ⚠️ OQ#4), `docs/BRD.md:176` tick OQ#4 (intent doc — được phép vì CR-037 đã được user duyệt), `docs/DESIGN.md` nếu có mô tả luồng form.
  - Migration gate: không áp dụng.
- **Deps:** task-01 (hợp đồng payload/response ở task-01 §Hợp đồng).

## Scope
1. `contact-schema.ts`: field tuỳ chọn `locale` (`'vi' | 'en'`); thiếu/`''` → `'vi'`; có mà sai → `errors.locale` (400). `ContactForm.locale` luôn có giá trị sau validate.
2. `useContactForm.ts`: gửi `locale` theo `useLocale()` (next-intl) — áp cho cả `/contact` và form CTA rút gọn. Không đổi UI.
3. `forward.ts`:
   - Đọc `CONTACT_FORM_TARGET` + **`CONTACT_FORM_TOKEN`**; thiếu một trong hai, hoặc có `NEXT_PUBLIC_CONTACT_FORM_TARGET` / `NEXT_PUBLIC_CONTACT_FORM_TOKEN` → throw "not configured" (route trả 500 như hiện tại), không gọi `fetch`.
   - Body JSON: `token`, `submittedAt` (`new Date().toISOString()`, cho phép inject clock để test), `locale`, `name`, `email`, `phone ?? null`, `company ?? null`, `need ?? null`, `message`.
   - `redirect: 'follow'` (rõ ràng): Web App trả 302 → fetch Node đổi sang GET tới `script.googleusercontent.com` (đúng cách Apps Script trả kết quả). Thành công **chỉ khi** `response.ok` **và** `await response.json()` là `{status:"ok"}`; JSON lỗi / HTML / `status` khác → throw.
   - Timeout: tăng `FORWARD_TIMEOUT_MS` 5000 → **10000** (Apps Script cold start 1–3 s + lock + ghi Sheet + Telegram; đề xuất — xem câu hỏi mở Q2 trong báo cáo plan). Message lỗi không chứa URL/token.
4. `route.ts`: không đổi guard order (R-18); honeypot vẫn trả 200 giả, không forward. Chỉ sửa nếu cần.
5. Env wiring: `.env.local.example` thêm `CONTACT_FORM_TOKEN=` (comment server-only, không `NEXT_PUBLIC_`); `docker-compose.yml` thêm `CONTACT_FORM_TOKEN: ${CONTACT_FORM_TOKEN:-}` + dòng comment header; `.github/workflows/deploy.yml` env `CONTACT_FORM_TOKEN: ${{ secrets.CONTACT_FORM_TOKEN }}` (không echo). Không thêm vào build args (server runtime only).
6. Doc reconcile theo Doc impact ở trên (as-built kèm evidence code).

## Tests (`node --import tsx --test`)
- `contact-schema.test.ts`: locale thiếu → `vi`; `en` → `en`; `fr`/số → `errors.locale`; các rule cũ không đổi (regression name/email/phone/company/need/message/honeypot).
- `forward.test.ts` (stub `fetch` + env):
  thiếu target / thiếu token / có biến `NEXT_PUBLIC_*` → throw, 0 lần fetch;
  body gửi đi có đủ field + `token` + `submittedAt` ISO + `locale`, header `Content-Type: application/json`, `redirect: 'follow'`;
  phản hồi `200 {"status":"ok"}` → resolve; `200 {"status":"error","code":"unauthorized"}` → throw; `200` HTML (trang lỗi Google) → throw; `500` → throw; timeout/abort → throw;
  message lỗi không chứa URL target / token.
- Route (nếu có test route hiện có): honeypot → không gọi forward.

## Verification plan
- `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` (đổi `src/`) — từ `.context/project-config.md`.
- `grep -rn "CONTACT_FORM_TOKEN" src .next/static 2>/dev/null` sau build → chỉ có trong code server (`forward.ts`), không có trong `.next/static`.
- `docker compose config --quiet` với env giả để chắc compose hợp lệ (nếu môi trường cho phép); actionlint `deploy.yml` (bỏ qua label `nta-web` như CR-036).
- Smoke local (tuỳ chọn): trỏ `CONTACT_FORM_TARGET` tới server giả trả 302 → 200 `{status:"ok"}` để xác nhận đường redirect thật của Node fetch.
- E2E thật (Sheet + Telegram) **sau khi user deploy Web App + đặt secret** → bước close-out, không chặn task PASS.

## Rollout (spec-validation G2 — push main = deploy prod, `auto_push_after_pass: true`)
- Hiện trạng prod: `CONTACT_FORM_TARGET` đang trống → form prod **đã** trả 500 từ trước (không phải regression do CR-037).
- Thứ tự an toàn: (1) task-01 PASS → user deploy Web App theo `tools/contact-sheet/README.md`, đặt GitHub Secrets `CONTACT_FORM_TARGET` + `CONTACT_FORM_TOKEN`;
  (2) task-02 PASS → **checkpoint hỏi user đã đặt 2 secret chưa** trước khi push (hoặc user ghi rõ chấp nhận push trước — form vẫn 500 như hiện tại cho tới khi đặt secret + chạy lại Deploy);
  (3) push → Deploy → E2E thật: gửi `/contact` + `/en/contact` → 1 dòng Sheet/lượt + 1 tin Telegram; token sai (curl) → không dòng.

## Acceptance
- [x] `/contact` + `/en/contact` (và CTA) gửi `locale` đúng; API nhận `locale` tuỳ chọn, sai → 400.
- [x] Forward gửi token trong body + `submittedAt` + `locale`; chỉ thành công khi JSON `{status:"ok"}` sau redirect.
- [x] Thiếu env / Web App lỗi / timeout → form báo lỗi như hiện tại (500 + message chung), không lộ URL/token ra client/log.
- [x] `CONTACT_FORM_TOKEN` được nối qua `.env.local.example`, compose, `deploy.yml`; không có giá trị thật trong repo.
- [x] Doc as-built + BRD OQ#4 + project-config cập nhật.

## Retry / Escalation
- Attempt FAIL thật (reviewer/verify) → sửa trên đĩa, tăng `attempt`; cancel ≠ fail.
- 3 attempt FAIL → `architecture_review_needed`, dừng báo user.

## Verification summary
_(builder, attempt 1 — 2026-10-15)_

**Code**
- `src/lib/api/contact-schema.ts`: `ContactForm.locale: 'vi' | 'en'` (luôn có); thiếu/`''` → `vi`; khác → `errors.locale` (400).
- `src/lib/contact/useContactForm.ts`: body `{ ...values, locale: useLocale() }` — áp chung `ContactForm.tsx` + `CTAForm.tsx`, không đổi UI.
- `src/lib/api/forward.ts`: đọc `CONTACT_FORM_TARGET` + `CONTACT_FORM_TOKEN`; thiếu / có `NEXT_PUBLIC_*` → throw, 0 fetch. Body đúng hợp đồng T01
  (`token`, `submittedAt` ISO — clock inject qua tham số `now`, `locale`, `phone/company/need` trống → `null`), `redirect: 'follow'`, timeout 10000 ms.
  Thành công chỉ khi `response.ok` + JSON `{status:"ok"}`. Lỗi mạng/timeout của fetch được bọc lại thành message chung (test phát hiện lỗi fetch gốc có thể mang URL target).
- `route.ts`: không đổi (guard order R-18 giữ nguyên; honeypot trả 200 giả trước bước forward — `route.ts:34-36`).
- Env: `.env.local.example` (`CONTACT_FORM_TOKEN=`, comment server-only + khớp Script Property `SECRET_TOKEN`), `docker-compose.yml`
  (`CONTACT_FORM_TOKEN: ${CONTACT_FORM_TOKEN:-}` + header), `deploy.yml` env `CONTACT_FORM_TOKEN: ${{ secrets.CONTACT_FORM_TOKEN }}` (không echo, không build arg).

**Tests** — mới `src/lib/api/contact-schema.test.ts` (4) + `src/lib/api/forward.test.ts` (5, gồm server HTTP local trả 302 → GET JSON để xác nhận đường redirect thật của Node fetch: `POST /exec` → `GET /echo?...`). 9/9 PASS.
Không có test route sẵn → honeypot không forward xác nhận bằng đọc code (`route.ts:34-36` return trước `forwardContactForm`).

**Verify**
- `npm test`: 193 tests — 190 pass, 1 fail, 2 skipped. Fail duy nhất = `tools/db/content-rules.test.ts` (thiếu `/uploads/*.jpg` local) — có sẵn từ T01, ngoài scope.
- `npm run lint`: exit 0 (0 error, 1 warning `no-img-element` có sẵn, không thuộc file đổi).
- `npm run typecheck`: exit 0.
- `npm run build`: **BLOCKED bởi môi trường** — `Failed to load next.config.ts: Failed to load native binding`; nguyên nhân
  `next-intl/node_modules/@swc/core` native addon từ chối cache dir (`C:\Users\datda\AppData\Local\swc`: "DACL grants replacement rights … to SID S-1-15-3-…"
  — SID AppContainer của sandbox agent). Lỗi xảy ra lúc nạp `next.config.ts`, trước khi đụng code `src/`. Thử `SWC_NATIVE_BINDING_CACHE` (scratchpad, `node_modules/.cache`) vẫn lỗi → dừng theo Tool Loop Guard.
  → Primary chạy thay `docker build --target builder -t nta-web-buildcheck:tmp .` (docker_build_evidence_command): **PASS** (next build đủ route);
  trong image: `grep -rln CONTACT_FORM_TOKEN .next/static` **rỗng**, chỉ có ở `.next/server/app/api/contact/route.js`; đã `docker rmi` image tạm.
- Bằng chứng tĩnh thay thế: `CONTACT_FORM_TOKEN` trong `src/` chỉ ở `forward.ts` (+ test); `forward.ts` chỉ được import bởi `src/app/api/contact/route.ts` (server route); client hook không import nó; không có `NEXT_PUBLIC_` mới.
- `docker compose config --quiet` (env giả): exit 0; render ra `CONTACT_FORM_TOKEN: faketok`, thiếu TARGET → `""` (cho phép trống như cũ).
- actionlint: skip (không cài trên máy).

**Doc reconcile** — `docs/API_SPEC.md` (request `locale`, response 500, guard order, mục Forward tới Apps Script + residual risk trùng dòng),
`docs/ERD.md` (ContactSubmission → Google Sheet ngoài hệ thống), `docs/runbook/deploy-vps.md` §4 (bảng env + danh sách secret) + §7 (sự cố form + trùng dòng),
`docs/runbook/db.md` §1b (`read -rs CTK … CONTACT_FORM_TOKEN`), `docs/content-bot/10-server.md` §3, `.context/project-config.md` `required:` (+`CONTACT_FORM_TOKEN`, bỏ ⚠️ OQ#4),
`docs/BRD.md` OQ#4 tick. `docs/DESIGN.md`: no doc impact (chỉ mô tả màn `/contact` + states, không mô tả luồng forward).

**Residual risk**
- LOW-1 (T01): script chờ lock 10 s = timeout web 10 s → web có thể báo lỗi trong khi Apps Script vẫn ghi muộn → khách gửi lại → trùng dòng Sheet. Chấp nhận, lọc tay (ghi ở API_SPEC + runbook §7). Không sửa `Code.gs`.
- `npm run build` trên host bị sandbox chặn; đã thay bằng build Docker PASS (xem trên).

**Review** — STRICT r1 **PASS** (`.context/review-reports/feature-contact-form-google-sheet-phase-1-task-02-round-1-review.md`); LOW-2 test chưa assert 10000 ms, LOW-3 check NEXT_PUBLIC_* chỉ có tác dụng lúc build (chấp nhận), LOW-4 route catch không log (có từ trước, ngoài scope).
- E2E thật (Sheet + Telegram) chờ user deploy Web App + đặt 2 secret — bước close-out theo §Rollout.
