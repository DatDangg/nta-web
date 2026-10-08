# .context/compressed-summary.md

## Last compressed: 2026-10-09T18:05+07:00 (sau Layer 2 PASS round 2; 3 task kể từ compact trước)

> Source of truth cho resume các session sau. Đọc file này trước thay vì toàn bộ history.
> Kèm: `.context/progress.json` (full), `.context/error-memory.md` (5 entry cuối), `.context/decisions.md` (full).

### Completed Tasks (1 line mỗi task)
- layer-0-task-01: scaffold Next.js + TypeScript + Tailwind — DONE (`51b75e0`)
- layer-0-task-02: i18n VI/EN plumbing với next-intl — DONE (`965ea6e`)
- layer-0-task-03: content schema, MDX pipeline và loaders — DONE (`9419440`)
- layer-0-task-04: sample content VI/EN cho 9 nhóm trang — DONE (`dd392df`, fix attempt)
- layer-0-task-05: CI workflow, env example, gitignore, README — DONE (`4d47a82`)
- layer-0-task-06: remediation CI typegen, env, Solution/CaseStudy contract, spec reconcile — DONE (`c7c35c3`)
- layer-1-task-01: design tokens + Button/Section/Badge primitives — DONE (`e5b569c`, 3 rounds)
- layer-1-task-02: app shell Header/Footer/drawer + i18n nav — DONE (`268dc79`, 2 rounds)
- layer-1-task-03: PageHeader/Breadcrumb/CTABanner + card family (AppCard) — DONE (`19d51c6`, 2 rounds)
- layer-1-task-04: interactive components Reveal/FilterBar/Pagination/Skeleton/EmptyState — DONE (`843c7a4`, 3 rounds)
- layer-1-task-05: 404 not-found page (Screen 13) — DONE (`e40d486`, r1 FAIL → r2 PASS)
- fix-layer1-dead-links-phase-1-task-01: MODIFY post-build fix Gap 1–4 — DONE (`bb1900e`/`1b9ef39`)
- layer-2-task-01: trang chủ `/` Screen 1 — DONE (`f27aa8b`, r1 FAIL → r2 FAIL → r3 PASS STRICT)
- layer-2-task-02: Về NTA `/about` Screen 2 — DONE (`27cfec0`, r1 FAIL EN desc 164>160 → r2 PASS NORMAL)
- layer-2-task-03: Solutions Doanh nghiệp `/solutions/enterprise` + 4 slug (crm|hrm|lms|dentgo) Screens 3–4 — DONE (`9768c6b`, r1 PASS+5 MINOR → fix → r2 PASS)
- layer-2-task-04: Solutions AI `/solutions/ai` + 3 slug (boxai|flycam|custom-ai) Screens 5–6 — DONE (`15c74a8`, r1 FAIL 2 MAJOR → r2 PASS)
- layer-2-task-05: Sản phẩm App `/products` Screen 7 — DONE (`5f75907`, r1 FAIL → r2 PASS)
- layer-2-task-06: Case Studies list + detail Screens 8–9 — DONE (`686f515`, r1 FAIL client-only list → r2 PASS)
- layer-2-task-07: Blog list + `[slug]` MDX detail Screens 10–11 — DONE (`830f7d9`, r1 FAIL 3 MAJOR → r2 PASS STRICT)
- fix-blog-list-date-format-phase-1-task-01: MODIFY post-build fix C-L2-1 — DONE (`edb5c4f`, reviewer độc lập r2 PASS STRICT)
- Layer-2 phase review: r1 FAIL (C-L2-1 + gaps) → r2 **PASS** (`26419d8`/`9823382`)

### Key Decisions
- Xem `.context/decisions.md` (full). Nổi bật: R-03 = ≥2 sản phẩm (ratified); v1 static content files, không API động; giữ `about.partners: []` chờ xác nhận; O1 (case-study metric) omit → render định tính.
- Domain: ntasolution.vn; song ngữ VI/EN; style light minimal; Next.js App Router + TS + Tailwind; next-intl `localePrefix: 'as-needed'`.
- Enterprise slug order canonical: `crm, hrm, lms, dentgo`; AI slug: `boxai, flycam, custom-ai` (`src/lib/content/slug.ts`).
- Format ngày blog (list = detail = design S11): util chung `src/lib/format/date.ts::formatPostDate` (VI `08/10/2026`, EN `Oct 8, 2026`).
- Pagination SSG: server render page mặc định trong `<Suspense fallback>` + client component (`CaseStudyFilter`/`BlogFilter`) đọc `useSearchParams`.

### Error Patterns Learned (xem `.context/error-memory.md`)
- Reveal/animation App Router: `useLayoutEffect` không đủ chống SSR flash — gate ẩn bằng CSS/class ở server render.
- Text/a11y label hiển thị phải qua i18n, KHÔNG hardcode copy design (FilterBar task-04).
- Dependency component chỉ đi từ tầng dưới lên (page → shared/ui → lib); shared KHÔNG import page module (Error 2).
- **Order đọc từ filesystem (`readdir`/glob) KHÔNG tất định** → luôn sort theo danh sách canonical trước render; layout responsive key theo vị trí (index/nth-child), không theo slug/value (Error 3).
- Chỉ **một** `<main>` (ở layout) — page dùng `<div>`/`<section>`, không lồng `<main>` (Error 3).
- Metadata title per-slug: dùng brand map (CRM/HRM/LMS/DentGo; BoxAI/Flycam/Custom AI), không `slug.toUpperCase()`.
- **SSG dễ vỡ 2 kiểu** (Error 4 + 5): `useSearchParams` client-only → static HTML rỗng (fallback phải là nội dung thật); server `searchParams` → route thành dynamic. Verify bằng `.next/prerender-manifest.json` + grep `.next/server/app/<route>.html`, KHÔNG tin ký hiệu `●` route table.

### Current State
- Phase: loop (initial build)
- Current layer: **layer-3** (đã unlock); tasks: 01, 02, 03
- Layers done: 0, 1, 2 (Layer 2 phase review r2 PASS) · Còn layer 3 (3 task), 4 (4 task)
- Next task: **layer-3-task-01** — API `/api/health` + `/api/contact` (R-13/R-14/R-18/R-19; STRICT)
- Build hiện tại: 43 static pages; verify commands trong `.context/project-config.md` = `npm run lint` · `npm run typecheck` · `npm run build` (test_command: null)
- Branch: `main` (staging-direct); push KHÔNG tự động (`forbidden_branch: main`, `auto_push_after_pass: false`)
- Spec: `SPECIFICATIONS.md` **1.0.1** (27 req) · `spec/test-scope/current.json` scopeVersion 3

### Deferred / Non-blocking
- **[HARD carry-forward L3 task-03]** phải **thay** `CTABanner` bằng `CTAForm` compact ở solution detail (enterprise/AI) — không render 2 CTA song song (design §1.3); source: Layer-2 M-4/C-L2-3.
- **[SOFT] M-2** related sections (RelatedStudies/RelatedSolutions/CaseStudyLink) luôn ẩn vì content chưa khai `related`/`relatedCases` → cần author content hoặc ratify R-08 optional.
- **[SOFT] residual SSG pagination page-1-only** (chỉ page 1 trong static HTML) → Layer 4 SEO.
- Layer-2 MINOR m-1..m-10: pagination scroll, `<header>` lặp, carousel aria, Footer thiếu link (Gap 5 L1), metadata description dài (En blog 190), BlogFilter nhận `body` (payload), origin/PAGE_SIZE hardcode trùng.
- JSON-LD (BreadcrumbList/Service/Organization/WebSite) chưa render → Layer 4 SEO.
- `robots.txt`/`sitemap.xml`/`llms.txt` → Layer 4 task-01.
- Metadata `alternates` hardcode trên vài route (bỏ qua `createLocaleAlternates`) — defer Layer 4.
- Layer-0 OQ: team/partner/logo placeholder; CONTACT_FORM_TARGET chưa chốt giá trị (OQ#4); rate-limit threshold `[cần xác nhận]` (đề xuất 5 req/10 phút/IP) — chốt khi làm L3 task-01.

### Anomalies noted
- `usage()` / plugin `loop-guard` không có trong runtime → usage gate không kiểm được.
- Subagent reviewer/spec-validator thường xuyên bị `permission denied: shell` → primary phải tự chạy verify commands / persist report.
- Env subagent **depth limit** đôi khi chặn reviewer/spec-validator độc lập trong change-request → report inline; primary phải chạy lại độc lập.
