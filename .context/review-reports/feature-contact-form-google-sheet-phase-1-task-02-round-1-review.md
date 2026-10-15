Agent: reviewer

# Review — feature-contact-form-google-sheet · phase-1-task-02 · round 1 (CR-037)

- **Review level:** STRICT
- **Reason:** API công khai `POST /api/contact` gọi ra ngoài với PII; secret server-only mới (`CONTACT_FORM_TOKEN`); sửa file CI deploy (`deploy.yml`) + `docker-compose.yml`; đổi request shape (`locale`) dùng chung 2 form client (hook shared).
- **Blast radius:** `src/lib/api/forward.ts` (chỉ import bởi `src/app/api/contact/route.ts:3`), `src/lib/api/contact-schema.ts` (route), `src/lib/contact/useContactForm.ts` (dùng bởi `src/components/contact/ContactForm.tsx:23` + `CTAForm.tsx:15`, đều nằm dưới `NextIntlClientProvider` ở `src/app/[locale]/layout.tsx:74`), container `nta-web` env runtime, workflow Deploy prod. Không DB, không migration. `route.ts` không đổi.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm test` (reviewer tự chạy) | 193 tests — 190 pass, 1 fail, 2 skip. Fail duy nhất `tools/db/content-rules.test.ts:29` (thiếu `/uploads/*` local) — có sẵn, ngoài scope. 2 file test mới PASS. |
| `npm run typecheck` (reviewer tự chạy) | exit 0 |
| `npm run lint` | primary báo exit 0 (không chạy lại) |
| `npm run build` | host BLOCKED (sandbox @swc native binding) — primary dùng `docker build --target builder` PASS; `grep CONTACT_FORM_TOKEN .next/static` rỗng, chỉ có ở `.next/server/app/api/contact/route.js`. Reviewer chấp nhận evidence primary + bằng chứng tĩnh: `forward.ts` chỉ import từ route server; hook client không import. |
| `docker compose config --quiet` env giả | primary báo PASS |
| actionlint | skip, chưa cài |

## Responsive Checklist Gate
N/A — diff chỉ đổi body `fetch` trong hook (`useContactForm.ts:110`), không đổi markup/CSS/route UI.

## Skill gates
- aislop: skip, chưa cài (không có `node_modules/.bin/aislop`; không tải package lạ).
- oxlint (anti-slop): skip, oxlint not configured.
- ocr (open-code-review): skip, ocr not installed.
- AI-readable: OK — tên rõ (`postToWebApp`, `FORWARD_TIMEOUT_MS`), hàm < 50 dòng, comment giải thích WHY (cold start, redirect, lộ URL), 0 indicator đáng kể.
- ai-friendly-web: N/A (không đổi trang public).
- blitzstrike: skip, không cài / không có môi trường được phép.

## Đối chiếu trọng tâm
| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Secret server-only, không `NEXT_PUBLIC`, không build arg | OK | `forward.ts:14-22`; compose build args chỉ `NEXT_PUBLIC_SITE_URL` (`docker-compose.yml:25-26`); token chỉ ở `environment:` (`docker-compose.yml:37`) |
| Không lộ URL/token qua message lỗi/log/client | OK | mọi lỗi = message cố định (`forward.ts:21,29,34,57`), fetch lỗi được bọc (`forward.ts:54-57`); route catch không log, trả `FORWARD_ERROR_MESSAGE` (`route.ts:41-45`); test `assertRejectsWithoutSecrets` gồm TypeError chứa URL (`forward.test.ts:126`) |
| `deploy.yml` không echo secret | OK | chỉ thêm env workflow-level (`deploy.yml:23`); `docker compose config --quiet` (`:39`); echo duy nhất là `CONTENT_SOURCE` |
| Hợp đồng T01 (field, null, locale, submittedAt) | OK | body `forward.ts:40-50` khớp `phase-1-task-01.md:13-17`; `phone || null` chuyển `''` → `null` (Code.gs chấp nhận cả hai); test deepEqual `forward.test.ts:93-103` |
| Thành công chỉ khi JSON `{status:"ok"}` | OK | `forward.ts:28-32`; test 7 case thất bại (`forward.test.ts:116-127`) |
| redirect follow | OK | `redirect: 'follow'` + test server thật 302 → GET (`forward.test.ts:134-153`) |
| timeout 10 s | OK | `FORWARD_TIMEOUT_MS = 10000` (`forward.ts:4`) — xem LOW-2 |
| Guard order R-18 + honeypot không forward | OK | `route.ts:12-39` không đổi; honeypot return trước forward (`route.ts:34-36`) |
| locale: thiếu/'' → vi, sai → 400, rule cũ không vỡ | OK | `contact-schema.ts:38,62-64,83`; test `contact-schema.test.ts:13-53` (gồm `null`/`EN`/số → lỗi, regression từng field) |
| useLocale cho ContactForm + CTAForm | OK | hook dùng chung (`useContactForm.ts:65,110`), cả 2 component gọi hook |
| Doc as-built khớp code | OK | `docs/API_SPEC.md` (locale, 500, guard order, payload, điều kiện ok, residual risk trùng dòng), `docs/ERD.md`, `docs/runbook/deploy-vps.md` §4/§7, `docs/runbook/db.md` §1b, `docs/content-bot/10-server.md`, `.context/project-config.md` |
| Intent doc BRD chỉ tick OQ#4 | OK | diff `docs/BRD.md` đúng 1 dòng (OQ#4) |
| LOW-1 (lock 10 s = timeout 10 s → có thể trùng dòng) ghi rõ trong doc | OK | `docs/API_SPEC.md` mục Residual risk + `docs/runbook/deploy-vps.md` §7 "Sheet có 2 dòng trùng"; Code.gs không đổi |

## Findings
Không có CRITICAL / HIGH / MEDIUM.

- **[LOW-2] `src/lib/api/forward.test.ts:92`** — test chỉ assert `init.signal instanceof AbortSignal`, không chốt giá trị 10 000 ms; đổi hằng về 5 s sẽ không bị test bắt. Đề xuất (tuỳ chọn): export hằng hoặc tách `timeoutMs` thành tham số inject để assert. Không chặn PASS.
- **[LOW-3] `src/lib/api/forward.ts:18-19`** — kiểm `process.env.NEXT_PUBLIC_CONTACT_FORM_*` trong code server: Next inline `NEXT_PUBLIC_*` lúc build, nên guard chỉ bắt trường hợp biến có mặt lúc build (đúng trường hợp nguy hiểm — lộ bundle), không bắt khi chỉ đặt runtime. Hành vi chấp nhận được, cùng pattern có sẵn cho TARGET; chỉ ghi nhận, không cần sửa.
- **[LOW-4] `src/app/api/contact/route.ts:41`** (ngoài diff, có sẵn) — catch forward không log gì, vận hành chỉ chẩn đoán được qua Apps Script Executions (runbook §7 đã hướng dẫn). Nếu sau này thêm log, chỉ log loại lỗi, không log URL/token/PII. Đề xuất task riêng nếu cần.

## Residual risk
- Build host chưa chạy được trong sandbox; dựa vào evidence docker builder của primary (không tự build lại theo chỉ dẫn).
- E2E thật (Sheet + Telegram, redirect `script.googleusercontent.com` thật) chờ user deploy Web App + đặt 2 secret — theo §Rollout, checkpoint hỏi user trước khi push.
- LOW-1 trùng dòng Sheet hiếm gặp — đã chấp nhận, đã ghi doc.

## Verdict
✅ PASS
