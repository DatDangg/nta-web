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
- [ ] `/contact` + `/en/contact` (và CTA) gửi `locale` đúng; API nhận `locale` tuỳ chọn, sai → 400.
- [ ] Forward gửi token trong body + `submittedAt` + `locale`; chỉ thành công khi JSON `{status:"ok"}` sau redirect.
- [ ] Thiếu env / Web App lỗi / timeout → form báo lỗi như hiện tại (500 + message chung), không lộ URL/token ra client/log.
- [ ] `CONTACT_FORM_TOKEN` được nối qua `.env.local.example`, compose, `deploy.yml`; không có giá trị thật trong repo.
- [ ] Doc as-built + BRD OQ#4 + project-config cập nhật.

## Retry / Escalation
- Attempt FAIL thật (reviewer/verify) → sửa trên đĩa, tăng `attempt`; cancel ≠ fail.
- 3 attempt FAIL → `architecture_review_needed`, dừng báo user.

## Verification summary
_(builder điền)_
