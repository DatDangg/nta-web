# Spec Review — feature nta-website · Layer 3 · round 1

> Phase review độc lập (READ-ONLY) cross-check `SPECIFICATIONS.md` (1.0.1, R-13/R-14/R-18/R-19/R-10/R-05/R-06/R-23/R-24/R-25) ↔ `docs/API_SPEC.md` ↔ `.context/design-spec.md` (Screens 4/6/12) ↔ `tasks/nta-website/layer-3-task-{01,02,03}.md` ↔ code thật ↔ artifact build `.next/**`.
> Tiền đề: Layer-2 phase review r2 PASS (`feature-nta-website-layer-2-round-2-spec-review.md`) với **HARD carry-forward M-4** = thay CTABanner.

Agent: spec-validator

> ⚠️ Report gốc do spec-validator tạo; subagent dừng do hết step nên không tự ghi file được — primary persist nguyên văn. Subagent **không tự chạy** lint/typecheck/build (shell deny) — xem Residual risk.

## VERDICT: ✅ PASS (Layer 3) — unlock Layer 4 có điều kiện carry-forward

Xác minh độc lập trên code + static HTML + `prerender-manifest.json` + `app-path-routes-manifest.json`. **HARD carry-forward M-4 đã ĐÓNG** (CTABanner đã bị thay, không render song song). Không có ❌ blocker, không HIGH conflict. Toàn bộ gap còn lại là MINOR non-blocking + residual runtime (shell deny) — không chạm phạm vi Layer 4 (SEO/perf/a11y/deploy).

---

## 1. Coverage matrix

| Req | Source | Status | Note (evidence file:line) |
|---|---|---|---|
| R-13 `POST /api/contact` shape | `SPECIFICATIONS.md:122-124`, `docs/API_SPEC.md:40-61` | ✅ | 200 `{status:"ok"}` `route.ts:66,71`; 400 `{status:"error",errors}` `:55,62`; 429 `{status:"error",message}` `:44-47`; 500 generic `:73-76`. Validate name 2–100/email/phone optional 9–15/message 10–2000 `contact-schema.ts:29-44` |
| R-14 `GET /api/health` | `SPECIFICATIONS.md:127`, `API_SPEC.md:63-67` | ✅ | `health/route.ts:1-6` `{status,timestamp ISO}` + `Cache-Control: no-store`. Build route `/api/health` có trong `app-path-routes-manifest.json:3` |
| R-18 guard order | `SPECIFICATIONS.md:147-149` | ✅ | rateLimit `route.ts:43` → validate `:60-63` → honeypot `:65-67` → forward `:69-71` — đúng thứ tự |
| R-18 honeypot 200 giả, không forward | `SPECIFICATIONS.md:148` | ✅ | `route.ts:65-67` return trước `forwardContactForm`; raw (không trim) → whitespace-only cũng trap |
| R-19 secret server-only | `SPECIFICATIONS.md:150-152` | ✅ | `forward.ts:6` `process.env.CONTACT_FORM_TARGET`; `:7` fail-closed nếu `NEXT_PUBLIC_CONTACT_FORM_TARGET` set; grep `src/` = không có `NEXT_PUBLIC_CONTACT_FORM_TARGET` dùng thật; không `console.*` trong `src/` |
| rate-limit 5/10min + XFF trust boundary (Decision 4) | `decisions.md:41-47`, `error-memory.md:102-108` | ✅ | `rate-limit.ts:1-2` (5, 10min), `:23` `>=5` → 429; `route.ts:38` dùng token **phải nhất** `.at(-1)` + `isValidIpAddress` + fallback `SHARED_FALLBACK_KEY` fail-closed |
| R-15 không route thừa | `SPECIFICATIONS.md:129` | ✅ | `app-path-routes-manifest.json` chỉ có `/api/health` + `/api/contact` |
| R-10 `/contact` form+hotline+map+info | `SPECIFICATIONS.md:105-106`, S12 | ✅ | `contact/page.tsx:33-40` PageHeader + 2 cột form/info + ContactInfo/OfficeHours/MapEmbed; `MapEmbed.tsx:6` iframe lazy + `title` |
| R-24 a11y Screen 12 | `SPECIFICATIONS.md:170`, `design-spec.md:529-531` | ✅ | `Input.tsx:11-14`/`Textarea.tsx:11-14` label for + `aria-describedby` + `aria-invalid`; error summary `role="alert"` `ContactForm.tsx:39`; success `role="status"` `:30`; honeypot `tabIndex=-1`+`aria-hidden` `:48`; iframe `title`; Button `min-h-11`=44px `Button.tsx:20,24-26` |
| R-23 responsive Screen 12 | `SPECIFICATIONS.md:162`, `design-spec.md:518-524` | 🟡 PARTIAL | `page.tsx:34` 1 cột→md 2 cột→lg 60/40 ✅; **lệch md: map không full-width** (MINOR #3) |
| R-25 BR-002 validate email+SĐT | `SPECIFICATIONS.md:172` | ✅ | Client `useContactForm.ts:21-24` + server `contact-schema.ts:29-44` validate email/phone trước khi gửi |
| R-05 enterprise + 4 slug + CTA | `SPECIFICATIONS.md:69-71`, S4 | ✅ | `enterprise/[slug]/page.tsx:22-24` 4 slug; `:69` `<CTAForm />`; `prerender-manifest.json:292-474` đủ 4×2 |
| R-06 AI + 3 slug + CTA | `SPECIFICATIONS.md:75-77`, S6 | ✅ | `ai/[slug]/page.tsx:15-17` 3 slug; `:54` `<CTAForm />`; manifest `:557-691` đủ 3×2 |
| R-05/R-06 + design §1.3 (1 CTA/intent) | `design-spec.md:43`, S4:223, S6:294 | ✅ | grep `CTABanner` ở 2 detail = **0**; mỗi detail đúng 1 `<CTAForm />`; 14/14 HTML chứa `id="cta-form-title"` |
| **HARD carry-forward M-4** (thay CTABanner) | `layer-2-round-2-spec-review.md:122-124` | ✅ **ĐÓNG** | 2 detail import `CTAForm` (`enterprise:8`, `ai:7`), render 1 lần (`:69`/`:54`); không còn CTABanner; CTABanner vẫn hợp lệ ở home/about/products/blog/case-studies/overview (không phạm vi) |
| R-20 i18n 2 locale form | `SPECIFICATIONS.md:156` | ✅ | `vi.json:155-162` + `en.json:155-162` key parity; `consultationTitle` VI "Nhận tư vấn"/EN "Get a consultation" khớp `design-spec.md:249` |
| Doc impact (API_SPEC/DESIGN) | gate §6 | ✅ | Contract khớp `API_SPEC.md` → `no doc impact`; `docs/DESIGN.md:98,107` đã ghi CTAForm ở S4/S6 → khớp code |

## 2. HARD carry-forward M-4 — xác minh độc lập (điểm trọng tâm)

| Tiêu chí | Evidence | Kết quả |
|---|---|---|
| CTABanner bị **thay** (không song song) ở 7 detail | grep `CTABanner` trong `src/app/[locale]/solutions/**` = 0 | ✅ |
| Mỗi detail đúng 1 CTA form | `enterprise:69`, `ai:54` — 1 `<CTAForm />`/file | ✅ |
| Không 2 CTA cùng intent/trang | RelatedSolutions/CaseStudyLink là link/block (không phải CTA form) | ✅ |
| Static HTML thực tế | 14/14 `.next/server/app/{vi,en}/solutions/{enterprise,ai}/<slug>.html` chứa `id="cta-form-title"` | ✅ |
| Build manifest | `prerender-manifest.json` đủ 14 detail route | ✅ |

**Kết luận: M-4 ĐÓNG.**

## 3. Gaps phân loại

**[MINOR] — không blocking unlock Layer 4:**

- **m-L3-1** `ContactForm.tsx:19-22` focus 429 là dead branch (`summaryRef` không gắn `<p role=alert>` 429 ở `:43`). *Đề xuất: gộp vào Layer 4 task-03 a11y sweep.*
- **m-L3-2** `useContactForm.ts:34-40` `updateField` để lại key `undefined` trong `errors` → edge case `hasFieldErrors`. (Đã fix một phần ở `:38-43` với `delete`; cần xác nhận edge còn lại.)
- **m-L3-3** `contact/page.tsx:34-40` md: map không full-width như design S12. *Đề xuất: Layer 4 task-03 responsive spot-check.*
- **m-L3-4** `useContactForm.ts:85-97` bỏ message server (dùng `messages[field]` local) + bỏ qua `errors.form`/`errors.honeypot`. **Builder journal claim #4 "fixed" KHÔNG khớp code** (đã ghi trong reviewer r1 task-03).
- **m-L3-5** `ctaForm.*` namespace không tạo, dùng `contact.consultationTitle` — chấp nhận (đúng tinh thần canonical reuse); task file ghi `ctaForm.*` → lệch tên, không phải defect.
- **OBS** Screen 4 base: design nói "sidebar xuống dưới CTAForm", code đặt CTAForm sau grid (từ Layer 2, ngoài scope task-03).
- **OBS** JSON-LD ContactPage chưa có (defer Layer 4 task-01 theo task note — hợp lý).
- **OBS** `updateField` dùng `values` closure (stale, pre-existing từ task-02).

**[MISSING]:** Không có (không requirement Layer 3 nào mất owner).

## 4. Gap blocking unlock Layer 4?

**Không có gap nào BLOCKING.** Các gap m-L3-1/3/4 map thẳng vào Layer 4 task-03 (a11y sweep) + task-01 (JSON-LD ContactPage). M-4 đã đóng.

## 5. Điều kiện unlock Layer 4

1. **[HYGIENE]** Primary persist report này vào `.context/review-reports/feature-nta-website-layer-3-round-1-spec-review.md` (subagent không ghi được do hết step).
2. **[CARRY-FORWARD → L4 task-03]** m-L3-1 (429 focus), m-L3-3 (map md full-width), m-L3-4 (server error message + `errors.form/honeypot`) đưa vào a11y/responsive sweep.
3. **[CARRY-FORWARD → L4 task-01]** JSON-LD ContactPage (OBS).
4. **[RESIDUAL]** Xác nhận GFE append rightmost XFF trên Cloud Run (L4 task-04 deploy) — nếu proxy KHÔNG append như giả định → MAJOR rate-limit mở lại.
5. **[SOFT, từ L2]** M-2 related content vẫn treo (không chạm L3/L4 code).

Verdict: **✅ PASS (Layer 3)** → cho phép chuyển Layer 4 khi user duyệt checkpoint.

## 6. Residual risk / phần chưa kiểm

- **Shell bị deny** (toàn bộ reviewer r1 L3 + session này): không tự chạy `npm run lint|typecheck|build` độc lập. Xác minh qua artifact build `.next/**` read-only (đủ route, SSG 14/14, `/vi/contact`+`/en/contact` trong `prerender-manifest.json:196-234`). Tin cậy evidence builder + task file (lint/typecheck/build PASS).
- Chưa browser-render trực quan 375/768/1280 → responsive/a11y đánh giá qua source + CSS math.
- Rate-limit in-memory per-instance (Decision 4) — không chính xác khi scale ngang (residual Layer 4).
