# Spec Review — feature nta-website · Layer 2 · round 1

> Phase review Layer 2 (task-01..07). READ-ONLY cross-check `SPECIFICATIONS.md` (R-07..R-26) ↔ `.context/design-spec.md` (Screens 1–11) ↔ `tasks/nta-website/layer-2-task-{01..07}.md` ↔ code thật (`src/app/[locale]/**`, `src/components/**`, `src/i18n/messages/{vi,en}.json`).
> Tiền đề: Layer 1 round-2 PASS (`.context/review-reports/feature-nta-website-layer-1-round-2-spec-review.md`).

Agent: spec-validator

> ⚠️ Report gốc do spec-validator tạo; shell của subagent bị permission deny ở cuối step nên subagent không tự ghi file được. Primary persist nguyên văn nội dung report bên dưới. Subagent **không tự chạy** lint/typecheck/build (shell deny) — xem Residual risk.

## VERDICT: ❌ FAIL (phase review — ⚠️ GAPS FOUND)

Layer 2 delivered 7 tasks faithfully at page/component level; all 7 routes exist for both locales, i18n key parity holds, metadata/hreflang baseline present, and Layer-1 dead links (Gap 1–3) stayed closed. **However, cross-check against spec/design surfaces gaps** that should be resolved/ratified before unlocking Layer 3, plus several MINOR drifts.

Không có ❌ HIGH security/data-loss conflict. Blockers là **link contract / a11y landmark / task-doc drift**, không phải data/security.

---

## 1. Coverage matrix (Layer-2 scope ↔ spec/design ↔ code)

| Req | Source | Status | Note |
|---|---|---|---|
| R-01 Hero 2 CTA | `SPECIFICATIONS.md:53`; design S1 | ✅ | `Hero.tsx:15-20`; h1 duy nhất; 2 CTA canonical `common.cta.contact`/`viewSolutions`; `HomeImage priority` |
| R-02 3 mảng giải pháp | `SPECIFICATIONS.md:57`; design S1 | ✅ | `SolutionGridHome.tsx:19-28`; 3 card, ảnh thật; hover lift qua `cardLinkClass` |
| R-03 ≥2 sản phẩm tiêu biểu | `SPECIFICATIONS.md:59`; design S1 | ✅ | `ProductStrip.tsx`; 2 sản phẩm thật; strip rỗng → `null` (`:31`) |
| R-04 About 5 khối | `SPECIFICATIONS.md:64`; design S2 | ✅ | `about/page.tsx:61-67`; 7 section; timeline `<ol>`; logos grayscale→color |
| R-05 enterprise + 4 slug | `SPECIFICATIONS.md:69`; design S3–4 | 🟡 PARTIAL | Routes đủ, `generateStaticParams` 4 slug; **CTABanner thay vì CTAForm compact** — đúng theo plan (Layer 3 task-03) nhưng design S4 nói CTAForm → gap tạm thời có chủ đích, xem Gap M-4 |
| R-06 AI + 3 slug | `SPECIFICATIONS.md:75`; design S5–6 | 🟡 PARTIAL | Routes đủ; `CaseStudyLink` ẩn khi `relatedCases` vắng (`ai/[slug]:40`); **cùng gap CTAForm** (Layer 3) |
| R-07 `/products` | `SPECIFICATIONS.md:81`; design S7 | ✅ | `products/page.tsx`; 2 AppCard; `DownloadLinks` validate http(s) → Badge "Sắp ra mắt" |
| R-08 case-studies list+detail | `SPECIFICATIONS.md:87`; design S8–9 | 🟡 PARTIAL | List + detail đủ; **RelatedStudies luôn ẩn** (content `related: []`) — xem Gap M-2 |
| R-09 blog list+detail MDX | `SPECIFICATIONS.md:94`; design S10–11 | ✅ | `blog/page.tsx` + `[slug]`; `next-mdx-remote/rsc`; pagination `?page=`; ShareBar `role="status"`; `<time>` locale |
| R-11 nav/footer | `SPECIFICATIONS.md:109` | ✅ (Layer 1) | Không đổi; dead-link vẫn đóng |
| R-12 404 | `SPECIFICATIONS.md:112` | ✅ (Layer 1) | Không đổi |
| R-20 i18n VI/EN | `SPECIFICATIONS.md:153` | 🟡 PARTIAL | Key parity VI/EN ✅ symmetric; hreflang đã có ở L2 routes nhưng `x-default` chỉ trên vài route; metadata localized ✅. JSON-LD BreadcrumbList/Service/Article **chưa có đủ** (defer Layer 4 task-01) |
| R-21 SEO | `SPECIFICATIONS.md:155` | 🟡 PARTIAL | metadata/OG partial (blog detail OG image có); JSON-LD Article case/blog có; **Organization/WebSite + BreadcrumbList chưa** → defer Layer 4 |
| R-23 responsive | `SPECIFICATIONS.md:159` | ✅ | Grid 1→2→3, breakpoints Tailwind khớp; sidebar sticky detail enterprise = `RelatedSolutions` `lg:sticky lg:top-24` ✅ |
| R-24 a11y | `SPECIFICATIONS.md:167` | 🟡 PARTIAL | Nhiều landmark ✅; nhiều `<header>` element (không tạo banner landmark thứ hai) — xem m-3 |
| R-25 BR-004 anonymize | `SPECIFICATIONS.md:169` | ✅ | `dental-clinic-operations.mdx` ẩn danh ("Organization ... withheld") |
| R-26 content ≥9 nhóm | `SPECIFICATIONS.md:173` | ✅ | 9 nhóm trang đã build |

**Không requirement nào mất owner.** Layer-2 task→code mapping verified cho cả 7 task.

---

## 2. Gap list

> Ghi chú minh bạch: hai mục dự kiến CRITICAL ban đầu (C-1 pagination deep-link `/case-studies`, C-2 Product detail link contract) đã **tự đính chính** sau khi đối chiếu file:line — **không đứng vững**, KHÔNG phải gap. Verdict dựa trên nhóm dưới.

### MAJOR

**Gap M-2 — [MAJOR, content-gap] `RelatedStudies` / `RelatedSolutions` / `CaseStudyLink` gần như luôn ẩn vì content chưa khai `related`/`relatedCases` — section trong design S9 không bao giờ render.**
- Evidence: `case-studies/[slug]/page.tsx:38-41` `related` từ `study.related`; content `related: []` (task-06 note "Related ẩn — content `related: []`"). `RelatedStudies.tsx:7` ẩn khi rỗng. Tương tự `RelatedSolutions` (enterprise) cần `relatedCases` — content chưa có → `enterprise/[slug]:52-54` → `[]`. AI `CaseStudyLink` cần `relatedCases` → ẩn.
- Spec/design: design S9 `design-spec.md:397,404` "RelatedStudies (3 card)"; S6 `:294` CaseStudyLink; S4 `:223` RelatedSolutions.
- Impact: **3 section được spec/design yêu cầu không bao giờ hiển thị với content hiện tại**. Code có empty-guard đúng; gap là **nội dung thiếu**. Cần bổ sung content hoặc ghi rõ optional trong spec.

**Gap M-4 — [MAJOR, defer có kế hoạch] Solution detail (enterprise 4 + AI 3) thiếu CTAForm compact mà design S4/S6 yêu cầu; hiện dùng CTABanner alt.**
- Evidence: `enterprise/[slug]/page.tsx:69` + `ai/[slug]/page.tsx:54` render `CTABanner variant="alt"`. Design S4 `design-spec.md:223` "CTAForm cuối trang (compact variant)"; S6 `:294` "CTAForm (compact)".
- Plan: `layer-2-task-03.md` + `layer-2-task-04.md` ghi rõ "CTAForm compact → Layer 3 task-03" (`layer-3-task-03.md`). → **defer có kế hoạch, KHÔNG phải defect Layer 2**. Non-blocking.
- Residual: design §1.3 cấm 2 CTA cùng intent/trang — khi Layer 3 chèn CTAForm, phải **thay** CTABanner (không thêm song song).

### MINOR

- **m-1** `Pagination.goToPage` (`Pagination.tsx:31`) không `scroll:false` → đổi page nhảy lên đầu trang. Non-blocking.
- **m-2** Static HTML pagination chỉ chứa page 1 (fallback slice 0,9) — chấp nhận cho v1 SSG; ghi để Layer 4 SEO biết.
- **m-3** Nhiều `<header>` element (PageHeader/ArticleHeader) bên trong `<main>` — không tạo banner landmark thứ hai (HTML spec), không vi phạm; rà khi Layer 4 a11y sweep.
- **m-4** `ScreenshotCarousel` dots dùng `aria-current="true"` (chuỗi) thay vì `"page"`/`"step"`; `aria-label` dot không localized — non-blocking.
- **m-5** `CaseStudyCard.tsx:20` `<time dateTime={String(year)}>` — `dateTime` chỉ là năm; design S8 chỉ nói "năm"; chấp nhận.
- **m-6** `PostCard.tsx:20` dùng `Intl.DateTimeFormat(locale, {dateStyle:'medium'})` cho list; `ArticleHeader.tsx:8` dùng format VI `dd/mm/yyyy`. **Hai format ngày list≠detail** (design S11 `design-spec.md:487` yêu cầu VI "08/10/2026", EN "Oct 8, 2026"). List VI `dateStyle:'medium'` = "8 thg 10, 2026" ≠ design. PARTIAL, non-blocking nhưng là conflict format. → nâng thành conflict C-L2-1.
- **m-7** `home.ts` EN hrefs pre-localized `/en/...` — Layer 2 đã xử lý bằng `.replace(/^\/en(?=\/)/, '')` (`SolutionGridHome.tsx:25`, `CaseStudyHighlight.tsx:26`) → Gap 6 Layer-1 đã đóng đúng cách. ✅
- **m-8** `Footer.tsx:8` "Giải pháp" vẫn chỉ 2 link (thiếu 4+3 slug) — Gap 5 Layer-1 vẫn treo (non-blocking).
- **m-9** `ScreenshotCarousel.tsx` arrow hiển thị khi `>1` ảnh nhưng content 1 ảnh/sp → arrow/dots single-slide. Non-blocking.
- **m-10** `blog/[slug]` `generateStaticParams` nhận `params.locale` — pattern đúng.

---

## 3. Conflict mới (spec ↔ design ↔ code ↔ plan)

| # | Mức | Nội dung | Nguồn |
|---|---|---|---|
| C-L2-1 | MED | Format ngày blog **list** (`dateStyle:'medium'`) ≠ **detail** (`dd/mm/yyyy` VI) ≠ design S11 (`08/10/2026`) | `PostCard.tsx:20` vs `ArticleHeader.tsx:8` vs `design-spec.md:487` |
| C-L2-2 | LOW | Design S9 "RelatedStudies 3 card" nhưng content `related:[]` → không bao giờ render | `design-spec.md:397` vs `case-studies/[slug]:38` + content |
| C-L2-3 | LOW-MED | CTAForm compact (design S4/S6) chưa có ở L2, defer L3 (đúng plan) | `design-spec.md:223,294` vs `layer-2-task-03/04` vs `layer-3-task-03.md` |

Không có HIGH conflict, không ❌ security/data conflict, không dropped requirement.

---

## 4. Đã đạt (verified trên file nguồn)

- **7 route Layer 2 tồn tại cả 2 locale**; `generateStaticParams` đủ (enterprise 4 slug, AI 3 slug, case-studies + blog từ content).
- **i18n parity**: `vi.json`/`en.json` cùng key set — symmetric ✅. Không hardcode chuỗi UI (spot-check mọi component dùng `t()`/`getTranslations`).
- **Dead link L1 vẫn đóng**: `ProductCard.tsx:16` `/products`, `AppCard.tsx:20` `/products`; không còn `/privacy`, `/solutions` parent.
- **Metadata + hreflang** mỗi route L2 có `alternates.languages {vi,en,x-default}`; blog detail có `canonical` + OG image.
- **JSON-LD** Article ở case-study detail + blog detail, escape `<` đúng cách.
- **A11y nền**: `FilterBar` role/aria; `Pagination` `aria-current="page"`; `MetaBar` `<dl>`; `Breadcrumb` `<nav aria-label="Breadcrumb">`; rỗng → ẩn.
- **Responsive**: grid 1→2→3, sidebar `lg:sticky lg:top-24`, `max-w-[720px]` detail.
- **Empty states**: blog empty + link home; case filter empty + "Xóa bộ lọc"; related/gallery/screenshot/useCases/teaser ẩn khi rỗng.
- **BR-004**: case study ẩn danh đúng.

---

## 5. Verify commands

| Command | Result |
|---|---|
| `npm run lint` / `typecheck` / `build` | ⚠️ **Không chạy** — spec-validator shell bị permission deny (theo Tool Loop Guard, không retry) |

- Evidence bù: mỗi task có Verification Summary ghi PASS (lint/typecheck/build) + reviewer độc lập PASS (task-01 r3 STRICT, task-07 r2 STRICT, còn lại NORMAL). Không mâu thuẫn giữa các nguồn.
- `test: null` → skip, no test framework.

---

## 6. Điều kiện verify lại (nếu FAIL)

1. **C-L2-1 (MED):** thống nhất format ngày blog list = detail = design S11 (`Intl.DateTimeFormat` VI `dd/mm/yyyy`), hoặc cập nhật design chấp nhận `dateStyle:'medium'` — quyết định + sửa 1 nơi.
2. **C-L2-2 (LOW):** bổ sung `related`/`relatedCases` vào content HOẶC ghi rõ trong spec/design rằng related sections optional khi content thiếu (đang ẩn đúng empty-guard).
3. **M-1/M-2 (residual):** xác nhận pattern SSG page-1-only cho pagination là chấp nhận v1; ghi residual cho Layer 4 SEO.
4. **C-L2-3:** giữ nguyên — Layer 3 task-03 phải **thay** CTABanner bằng CTAForm (không song song) để tránh 2 CTA cùng intent.
5. MINOR m-1..m-10: opportunistic / Layer 4 sweep.
6. Re-run `npm run lint && npm run typecheck && npm run build`; re-run spec-validator **round 2**.

---

## 7. Recommendation

**Do NOT unlock Layer 3 yet** cho tới khi:
- **C-L2-1 (MED)** được ratify (format ngày list↔detail) — conflict thật giữa 2 task Layer 2.
- **C-L2-2** được chốt (content bổ sung hay spec ghi optional).
- **M-1 residual** (SSG pagination page-1-only) được xác nhận chấp nhận.

Các MAJOR "CTAForm" (M-4) và "related" (M-2) là có chủ đích / content-gap, không chặn nếu user chấp nhận. Nếu user chấp nhận các điểm trên ở human checkpoint → có thể **hạ verdict xuống PASS (điều kiện)** và unlock Layer 3.

Route cho fix: post-build modification → **`change-request`** (`/change` hoặc `/feature` MODIFY). Plan-text drift = doc reconcile.

---

## 8. Residual risk / phần chưa kiểm

- **Không tự chạy** lint/typecheck/build (shell deny) → dựa evidence reviewer + task file.
- **Không browser-test** responsive/a11y/landmark thật → landmark/nested `<header>` đánh giá bằng đọc code + HTML spec.
- **Không render thật** để xác nhận static HTML pagination page-1-only (suy từ code `slice(0,9)` fallback).
- Một số kết luận gap ban đầu (C-1, C-2) đã tự đính chính sau khi đối chiếu file:line — ghi minh bạch để tránh false-FAIL.
