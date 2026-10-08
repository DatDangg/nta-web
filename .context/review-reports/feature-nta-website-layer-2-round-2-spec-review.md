# Spec Review — feature nta-website · Layer 2 · round 2

> Phase re-review Layer 2 (task-01..07) sau khi fix gap **C-L2-1 (MED)**. READ-ONLY cross-check
> `SPECIFICATIONS.md` (1.0.1, R-07..R-26) ↔ `.context/design-spec.md` (Screens 1–11) ↔
> `tasks/nta-website/layer-2-task-{01..07}.md` ↔ code thật (`src/app/[locale]/**`, `src/components/**`,
> `src/i18n/messages/{vi,en}.json`) ↔ artifact build `.next/**`.
> Tiền đề: round 1 FAIL (`.context/review-reports/feature-nta-website-layer-2-round-1-spec-review.md`);
> change `fix-blog-list-date-format` commit `edb5c4f`; reviewer r2 PASS STRICT
> (`.context/review-reports/feature-fix-blog-list-date-format-phase-1-task-01-round-2-review.md`).

Agent: spec-validator

## VERDICT: ✅ PASS (Layer 2) — unlock Layer 3 có điều kiện carry-forward

**C-L2-1 (MED) đã ĐÓNG** và được xác minh độc lập trên code + static HTML + prerender-manifest.
Recheck toàn bộ Layer 2 (task-01..07) **không phát sinh gap/conflict mới** do blast radius `PostCard`
(`BlogFilter` / `RelatedPosts` / `blog/page.tsx` SSG fallback). Không còn ❌ blocker, không HIGH conflict.
Các gap còn lại (M-2, M-4, residual SSG pagination, MINOR m-1..m-10) đều **NON-BLOCKING** cho Layer 3
(không chạm phạm vi Layer 3 = API/contact form + integration) — xem §4 phân loại + §7 điều kiện.

---

## 1. C-L2-1 closure — xác minh độc lập

| Tiêu chí | Nguồn | Status | Evidence |
|---|---|---|---|
| Blog **list** VI = `08/10/2026` (dd/mm/yyyy) | design S11 `design-spec.md:487`; R-09 `SPECIFICATIONS.md:98-100` | ✅ | `.next/server/app/vi/blog.rsc:44` + `.next/server/app/vi/blog.html` chứa `<time dateTime="2026-10-08">08/10/2026` |
| Blog **list** EN = `Oct 8, 2026` | design S11:487 | ✅ | `.next/server/app/en/blog.rsc:44` `<time dateTime="2026-10-08">Oct 8, 2026` |
| Blog **detail** VI = `08/10/2026` (không regression) | change AC2 | ✅ | `.next/server/app/vi/blog/first-steps.rsc:41` + `.html` `<time dateTime="2026-10-08">08/10/2026` |
| Blog **detail** EN = `Oct 8, 2026` | change AC2 | ✅ | `.next/server/app/en/blog/first-steps.html` (reviewer r2 §2) |
| **1 nguồn util** dùng chung, không copy logic | change AC3 | ✅ | `src/lib/format/date.ts:17` `formatPostDate`; `PostCard.tsx:6,20` + `ArticleHeader.tsx:5,9` import cùng util |
| Không còn format cũ `dateStyle:'medium'` (VI "8 thg 10, 2026") | C-L2-1 | ✅ | `Grep "dateStyle"` trong `src/` = 0; `Grep literal "thg 10"` trong `.next/server/app/` = **No matches** |
| `Intl.DateTimeFormat` chỉ còn 1 chỗ (util) | change AC3 | ✅ | `Grep DateTimeFormat src/` = 2 match, **cả 2 trong `date.ts:8,18`** |
| Không đụng `CaseStudyCard` (year-only, design S8) | change Ghi chú | ✅ | `CaseStudyCard.tsx:20` vẫn `Intl.NumberFormat` year-only; `git log` commit `edb5c4f` scope 3 file code |
| A11y `<time dateTime>` giữ (R-24) | R-24 `SPECIFICATIONS.md:167` | ✅ | `PostCard.tsx:20` + `ArticleHeader.tsx:17` còn `<time dateTime={post.date}>` |

**Kết luận:** list = detail = design S11, một nguồn `formatPostDate`. **C-L2-1 đóng.**

## 2. Blast radius recheck (change chỉ chạm `PostCard` + `ArticleHeader`)

`PostCard` được mount ở 3 surface; tất cả nhận format mới qua cùng util, **không surface nào tự format ngày**:

| Surface | Vị trí | Đánh giá |
|---|---|---|
| Blog list — `BlogFilter` (client) | `BlogFilter.tsx:29` mount `PostCard` | ✅ nhận `formatPostDate`; không có logic ngày riêng |
| Blog detail — `RelatedPosts` | `RelatedPosts.tsx:12` mount `PostCard`; guard rỗng `:6` | ✅ cùng util; empty-guard nguyên vẹn |
| Blog list SSG fallback — `blog/page.tsx` | `page.tsx:42` `Suspense fallback` render `PostCard` | ✅ cùng util |
| Blog detail header — `ArticleHeader` | `ArticleHeader.tsx:9` | ✅ cùng util |
| `CaseStudyCard` | `CaseStudyCard.tsx:20` | ✅ **không đổi** (year-only, ngoài scope) |

**Không regression SSG:** `.next/prerender-manifest.json` có `/vi/blog` (line 341), `/en/blog` (317) +
8 detail path (`/vi|/en/blog/{first-steps,learning-content,responsible-ai,digital-workflows}` line 797–979);
`.next/server/app/vi/blog.html` chứa slug (`first-steps`/`learning-content`/`responsible-ai`).
**Không phát sinh gap/conflict mới** từ change.

## 3. Coverage matrix — Layer 2 (task-01..07) re-verified

| Req | Source | Status | Note (round 2) |
|---|---|---|---|
| R-01 Hero 2 CTA | `SPECIFICATIONS.md:53`; S1 | ✅ | Không đổi từ round 1 (`Hero.tsx`); không bị change chạm |
| R-02 3 mảng giải pháp | `SPECIFICATIONS.md:57`; S1 | ✅ | Không đổi |
| R-03 ≥2 sản phẩm | `SPECIFICATIONS.md:59`; S1 | ✅ | Không đổi |
| R-04 About 5 khối | `SPECIFICATIONS.md:64`; S2 | ✅ | Không đổi |
| R-05 enterprise + 4 slug | `SPECIFICATIONS.md:69`; S3–4 | 🟡 PARTIAL | Routes đủ; CTAForm defer → **M-4 (non-blocking, có plan L3 task-03)** |
| R-06 AI + 3 slug | `SPECIFICATIONS.md:75`; S5–6 | 🟡 PARTIAL | Routes đủ; CaseStudyLink ẩn khi thiếu `relatedCases` → **M-2**; CTAForm → M-4 |
| R-07 `/products` | `SPECIFICATIONS.md:81`; S7 | ✅ | Không đổi |
| R-08 case-studies list+detail | `SPECIFICATIONS.md:87`; S8–9 | 🟡 PARTIAL | `RelatedStudies` luôn ẩn (`related: []`, grep `src/content` xác nhận) → **M-2 (content-gap)** |
| **R-09** blog list+detail MDX | `SPECIFICATIONS.md:94` + clarify `:98-100`; S10–11 | ✅ **(nâng từ ✅ → xác nhận)** | **C-L2-1 đóng**: list = detail = S11, 1 util (§1) |
| R-11 nav/footer | `SPECIFICATIONS.md:109` | ✅ (L1) | Không đổi; Footer "Giải pháp" 2 link vẫn treo (m-8) |
| R-12 404 | `SPECIFICATIONS.md:112` | ✅ (L1) | Không đổi |
| R-20 i18n VI/EN | `SPECIFICATIONS.md:153` | 🟡 PARTIAL | Key parity ✅; JSON-LD đầy đủ defer Layer 4 |
| R-21 SEO | `SPECIFICATIONS.md:155` | 🟡 PARTIAL | Organization/WebSite + BreadcrumbList defer Layer 4 |
| R-23 responsive | `SPECIFICATIONS.md:159` | ✅ | Không đổi; change không đổi layout/CSS |
| R-24 a11y | `SPECIFICATIONS.md:167` | 🟡 PARTIAL | `<time dateTime>` giữ; nested `<header>`/carousel a11y = MINOR (m-3/m-4) |
| R-25 BR-004 anonymize | `SPECIFICATIONS.md:169` | ✅ | Không đổi |
| R-26 content ≥9 nhóm | `SPECIFICATIONS.md:173` | ✅ | 9 nhóm trang đã build |

Không requirement nào mất owner; task↔code mapping 7/7 task vẫn đứng.

## 4. Gap status sau round 1 — phân loại blocking vs non-blocking

| Gap | Mức round 1 | Trạng thái round 2 | Blocking unlock L3? | Khuyến nghị |
|---|---|---|---|---|
| **C-L2-1** format ngày blog | MED conflict | ✅ **ĐÓNG** (commit `edb5c4f`, spec 1.0.1) | — | Đã fix, không cần làm gì thêm |
| **M-2** related content luôn ẩn | MAJOR content-gap (C-L2-2 LOW) | ⚠️ **CÒN** — `src/content/case-studies/*/*.mdx` `related: []`; không content nào khai `relatedCases` | **Không** | **Ratify**: R-06 `SPECIFICATIONS.md:76` đã ghi "case study liên quan **nếu có dữ liệu (tùy chọn)**" → AI CaseStudyLink đúng spec. R-08 `:88` chưa ghi optional → hoặc (a) author `related` content ở task content sau, hoặc (b) change-request làm rõ R-08 optional. Code empty-guard đúng, không phải defect. |
| **M-4 / C-L2-3** CTAForm compact defer | MAJOR defer có kế hoạch | ⚠️ **CÒN** (đúng plan) | **Không** | Giữ. Layer 3 `layer-3-task-03.md:38-42` đã có. **Carry-forward cứng:** L3 task-03 phải **THAY** `CTABanner` (không render song song) — design §1.3 cấm 2 CTA cùng intent. |
| **Residual SSG pagination page-1-only** (round-1 m-2) | MINOR residual | ⚠️ **CÒN** — `blog/page.tsx:31` fallback `slice(0,9)`; `BlogFilter` client xử lý `?page=` | **Không** | **Chấp nhận cho v1 SSG**; ghi residual cho Layer 4 SEO (static HTML chỉ chứa page 1). |
| **m-1** `Pagination` không `scroll:false` | MINOR | CÒN | Không | Opportunistic / Layer 4 sweep |
| **m-3** nested `<header>` trong `<main>` | MINOR | CÒN | Không | Layer 4 a11y sweep (không vi phạm HTML spec) |
| **m-4** carousel `aria-current="true"` + dot label chưa localize | MINOR | CÒN | Không | Layer 4 a11y sweep |
| **m-5** `CaseStudyCard` `dateTime={String(year)}` | MINOR | CÒN (design S8 chỉ nói "năm") | Không | Chấp nhận |
| **m-8** Footer "Giải pháp" chỉ 2 link | MINOR | CÒN (Gap 5 L1 treo) | Không | Opportunistic |
| **m-9** carousel arrow khi 1 ảnh | MINOR | CÒN | Không | Layer 4 |
| m-2/m-6/m-7/m-10 | MINOR | m-6 ✅ resolved bởi C-L2-1; còn lại ✅/không đổi | Không | — |

**Không gap nào BLOCKING unlock Layer 3.** Không gap mới phát sinh.

## 5. Conflict mới (spec ↔ design ↔ code ↔ plan)

Không có conflict mới. Các conflict cũ:
- **C-L2-1** → ✅ đóng.
- **C-L2-2** (related) → giảm còn mức ratify-content (M-2), non-blocking.
- **C-L2-3** (CTAForm) → đúng plan defer L3, non-blocking.

Không HIGH conflict, không ❌ security/data-loss.

## 6. Verify commands + evidence

| Command | Result |
|---|---|
| `npm run lint` / `typecheck` / `build` | ✅ PASS (từ reviewer r2 STRICT — `.context/review-reports/feature-fix-blog-list-date-format-phase-1-task-01-round-2-review.md`; spec-validator không tự chạy build để tránh trùng, xác minh qua artifact `.next/**` read-only) |
| `test` | skip — `test_command: null`, chưa cấu hình test framework |
| `git log` | ✅ HEAD `edb5c4f` = `feat(feature-fix-blog-list-date-format): phase-1-task-01 unify blog list date with detail (C-L2-1)` |

Evidence read-only bổ sung: static HTML (`.next/server/app/{vi,en}/blog.html`, `.../blog/first-steps.html`),
`.next/prerender-manifest.json`, grep `dateStyle`/`thg 10`/`DateTimeFormat`.

## 7. Điều kiện unlock Layer 3

Layer 3 (API `/api/contact` + ContactForm/CTAForm + integration) **được unlock** với các carry-forward:

1. **[HARD] L3 task-03** phải **THAY** `CTABanner variant="alt"` ở 7 trang solution detail bằng `CTAForm`
   compact — **không render song song** (design §1.3, tránh 2 CTA cùng intent). Đã ghi trong
   `layer-3-task-03.md:41-42`.
2. **[SOFT] M-2:** chốt hướng — author `related`/`relatedCases` content HOẶC change-request làm rõ
   R-08 optional. Không chặn code Layer 3 (L3 không chạm related sections).
3. **[SOFT] Residual SSG pagination page-1-only:** ratify chấp nhận cho v1; carry sang Layer 4 SEO.
4. **[HYGIENE] `.context/progress.json:177`** `reviewReport` của task `fix-blog-list-date-format-phase-1-task-01`
   vẫn trỏ round-1 (`...round-1-review.md`), trong khi round-2 PASS đã có
   (`...round-1...`→ cập nhật thành `...task-01-round-2-review.md`). Đĩa là sự thật (round-2 report tồn tại);
   cập nhật pointer ở close-out. **Không chặn verdict.**

Verdict: **✅ PASS (Layer 2)** → cho phép chuyển Layer 3 khi user duyệt checkpoint.

## 8. Residual risk / phần chưa kiểm

- Không tự chạy lint/typecheck/build trong session này (đã có PASS từ reviewer r2 STRICT độc lập cùng commit
  `edb5c4f`; artifact `.next/**` khớp) → tin cậy evidence, không rerun để tránh trùng.
- Chưa browser-render trực quan 375/768/1280 (không môi trường browser) → format/SSG đánh giá qua static HTML
  + RSC payload.
- `formatPostDate` (`date.ts:18`) parse date-only ISO theo **UTC** — off-by-one tiềm ẩn ngoài TZ VN (+07),
  không regression, site chạy VN → chấp nhận (reviewer r2 MINOR #2).
- `PostCard.tsx:15` cast `useLocale() as Locale` bỏ type-guard (reviewer r2 MINOR #1) — an toàn do routing
  chỉ `vi`/`en`; đề xuất helper `toLocale()` ngoài scope.
