Agent: reviewer

# Review — feature/nta-website · layer-2-task-04 (round 1)

- **Work item:** feature/nta-website
- **Task:** `tasks/nta-website/layer-2-task-04.md` — Solutions AI `/solutions/ai` + 3 slug (Screens 5–6)
- **Review level:** `NORMAL`
- **Round:** 1
- **Verdict:** ❌ **FAIL**

## Reason for level (NORMAL)

- Static SSG content pages (`db_tool: none`, `test_command: null`), no auth/RBAC/tenant/schema/migration/API-contract,
  no payment/cron/webhook, no security/token/upload surface → none of the STRICT red-risk triggers apply.
- Not FAST: adds 2 routes + 3 new components + shared i18n keys, and reuses the shared `Link`/`Section`/`PageHeader`/
  `SolutionCard` layer, so blast radius is broader than a single narrow file.
- Builder reported `lint/typecheck/build` PASS; independently re-run below.

## Blast radius

- Routes: `/solutions/ai` (vi,en) + `/solutions/ai/[slug]` (vi,en × boxai|flycam|custom-ai) = 8 pages.
- New: `src/components/solutions/{UseCases,CaseStudyLink,CaseStudyTeaser}.tsx`, `src/app/[locale]/solutions/ai/**`.
- Modified: `src/i18n/messages/{vi,en}.json` (`solutions.ai.*` only).
- Reused (not modified): `Section`, `PageHeader`, `Breadcrumb`, `CTABanner`, `SolutionCard`, `FeatureList`,
  `Reveal`, `@/i18n/navigation` Link, `@/lib/content/{solutions,case-studies,slug}`, `load-mdx`.
- Data read (not modified): `src/content/solutions/{vi,en}/*.mdx`, `src/content/case-studies/{vi,en}/*.mdx`.

## Verify commands + result

| Command | Result |
|---|---|
| `npm run lint` | ✅ PASS — `eslint .`, no warnings/errors |
| `npm run typecheck` | ✅ PASS — `tsc --noEmit`, no errors |
| `npm run build` | ✅ PASS — Compiled successfully; static pages 25/25 |
| `test_command` | `skip, no test framework configured` (`project-config: test_command: null`) |

Build SSG evidence (AI scope):
```
● /[locale]/solutions/ai              → /vi/solutions/ai, /en/solutions/ai
● /[locale]/solutions/ai/[slug]       → /vi/solutions/ai/boxai, /vi/solutions/ai/flycam,
                                        /vi/solutions/ai/custom-ai, [+3 more paths]  (EN × 3)
```
→ `generateStaticParams` covers `boxai|flycam|custom-ai × 2 locales` = 6 detail routes + 2 overview = 8. ✔

Notes: `git diff` confirms messages change is strictly additive (`solutions.ai.*` block in both locales, nothing else).
`git status --short` shows only the declared new files. Invalid slug → `notFound()` path is present in both
`generateMetadata` and the page (`[slug]/page.tsx:21,34,39`); build does not prerender any invalid slug.

## Responsive Checklist Gate (UI touched → mandatory)

Breakpoints from `project-config.md` `ui.responsive_breakpoints` = 640/768/1024/1280/1536 (base <640 mobile).
No browser environment → verified by CSS math + source, residual risk noted below.

| Item | Result | Evidence |
|---|---|---|
| Layout — no horizontal scroll | OK | `grid-cols-1` base, `max-w-container`, no fixed px widths; `CaseStudyLink`/`UseCases` wrap. |
| Layout — mobile-first (`min-width`) | OK | Tailwind `md:`/`lg:`/`xl:` only (mobile-first). |
| Layout — grid columns / no fixed columns | **FAIL** | Overview 2+1 special-case is keyed to slug `custom-ai` (not its position) while card order comes from unsorted `readdir` → layout not guaranteed. See MAJOR-1. |
| Typography / spacing | OK | `text-h2`/`text-body-lg` scale classes; no `px` font sizes in diff (token definitions not re-verified). |
| Media — img `max-width:100%;height:auto` + `aspect-ratio` | OK (SolutionCard) | `SolutionCard` uses `HomeImage` + `cardImageClass`/`cardImageSizes`; teaser/link have no images. |
| Media — `srcset`/`sizes` | OK | `cardImageSizes` passed to `HomeImage` in `SolutionCard.tsx:19`. |
| Touch/Interaction — ≥44×44px | OK | `min-h-11` (2.75rem = 44px) on card CTA (`SolutionCard.tsx:22`), teaser link, breadcrumb link, CTA button. |
| Nav — mobile | N/A | Global `Header` (layer-1), not in this diff. |
| Table — scroll/card on mobile | N/A | No tables in these screens. |
| Viewport — no bare `100vh` | OK | No `vh` usage in diff. |
| A11y — reduced motion | OK | `Reveal.tsx:18-22` honors `prefers-reduced-motion`. |
| A11y — no nested/duplicate landmarks | **FAIL** | Nested `<main>` inside layout `<main id="main">`. See MAJOR-2. |

Any responsive/a11y FAIL → verdict FAIL.

## Skill gates

| Gate | Result | Evidence |
|---|---|---|
| aislop (`aislop scan --changes --json`) | `skip, aislop/ocr not installed & no config in repo` | Glob for `*aislop*` / config → none; shell restricted to configured npm scripts. |
| anti-slop / oxlint | `skip, oxlint not configured` | Glob for `.oxlintrc*`/`oxlint.config.*` → none. `npm run lint` (eslint) PASS. |
| open-code-review (`ocr`) | `skip, ocr not installed & no config` | No `ocr.config.*`/`.ocr*` found. |
| AI-readable codebase | OK | New files small (max ~57 lines), functions <50 lines, self-descriptive names; no `as any`, no comment-WHAT noise, no magic numbers except layout col-span. <3 indicators. |
| ai-friendly-web | N/A | This is a Layer-2 UI build, not a deploy task; `robots.txt`/`sitemap.xml`/`llms.txt` are deploy/SEO-phase artifacts (`AGENTS.md` Phase 6). None exist yet in repo — deferred, see Residual risk. |
| blitzstrike pentest | N/A | NORMAL task, no public auth/API input surface. |

## Findings

### [MAJOR-1] Overview card order is non-deterministic and the `md` 2+1 layout is keyed to a slug, not a position
- **Files:** `src/app/[locale]/solutions/ai/page.tsx:44`; `src/lib/content/load-mdx.ts:10`
- **Evidence:** `loadMdxDirectory` iterates `readdir(...)` **without sorting** (`load-mdx.ts:10`), so
  `getAllSolutions('ai')` order is OS/filesystem order, not the design order (BoxAI · Flycam/Drone · AI tùy chỉnh,
  design-spec Screen 5 `:283`). Line 44 applies `md:col-span-2` only when `solution.slug === 'custom-ai'`,
  assuming it is the 3rd item. If `readdir` returns e.g. `boxai, custom-ai, flycam`, the full-width middle card
  produces `boxai | (custom-ai full-width) | flycam` instead of the intended 2+1, and the visible order diverges
  from the design copy order.
- **Impact:** Specified Screen 5 responsive behavior (design-spec `:272`) and copy order are not guaranteed;
  output varies by filesystem.
- **Fix:** Sort solutions deterministically before mapping (explicit `aiSlugs` order or a `order` field), and key
  the full-width rule to position (e.g. `md:[&>li:last-child]:col-span-2` / `:nth-child(3)`) instead of the slug.

### [MAJOR-2] Nested `<main>` landmark on the detail page (invalid HTML, WCAG a11y)
- **File:** `src/app/[locale]/solutions/ai/[slug]/page.tsx:47`
- **Evidence:** `src/app/[locale]/layout.tsx:34` already renders `<main id="main">{children}</main>`. The detail
  page adds a second `<main>` (line 47), producing nested `<main>` elements (HTML spec: a document must not have
  more than one non-hidden `<main>`). The sibling `solutions/enterprise/[slug]/page.tsx:59` correctly uses a
  `<div>` for the same wrapper, so this is a regression from the established pattern and violates R-24
  (semantic HTML / WCAG landmarks) / design a11y notes.
- **Impact:** Duplicate/nested `main` landmark; axe `landmark-main-is-top-level` / duplicate-main violations.
- **Fix:** Change line 47 `<main ...>` to `<div ...>` (match the enterprise sibling). The layout's `<main>` is
  already the page landmark.

### [MINOR-1] `CaseStudyLink` never renders because no AI solution declares `relatedCases`
- **Files:** `src/app/[locale]/solutions/ai/[slug]/page.tsx:40-42`; `src/content/solutions/{vi,en}/{boxai,flycam,custom-ai}.mdx`
- **Evidence:** Grep for `relatedCases` finds it only in `types.ts` + page code; none of the 6 AI content files
  declare it, so `relatedCase` is always `null` and the block is always hidden on all 3 detail pages. The
  "link to Óc Eo" AC (`layer-2-task-04.md:49`) is therefore not demonstrable via the UI.
- **Assessment:** R-06 states the related case is optional — "case study liên quan **nếu có dữ liệu (tùy chọn)**"
  (`SPECIFICATIONS.md:76`) — and the component's null→hidden behavior is correct, so this is non-blocking.
  Recommend a follow-up content task to add `relatedCases` (e.g. `boxai: [oc-eo-learning]`) if the business wants
  the linkage shown; note the Óc Eo case is categorized `enterprise`, not `ai`.

### [MINOR-2] Dead export `getAiStaticParams` (unused)
- **File:** `src/lib/content/slug.ts:22`
- **Evidence:** Grep shows only the definition, no call sites. The AI page defines its own inline
  `generateStaticParams` (`ai/page.tsx:15-17`), and the builder journal (`runs/builder-...:33`) claims usage
  "via getAiStaticParams" which is inaccurate. Helper predates this task (slug.ts not in this task's diff), so
  non-blocking, but it is dead code.
- **Fix:** Either use it in `ai/[slug]/page.tsx` or remove it.

### [MINOR-3] `CaseStudyTeaser` hardcodes element id
- **File:** `src/components/solutions/CaseStudyTeaser.tsx:8,10`
- **Evidence:** `id="ai-case-study-title"` / `aria-labelledby` are hardcoded. Safe while single-use, but breaks if
  the component is reused on another surface.
- **Fix:** Derive id via `useId()` or accept a prop.

### [MINOR-4] JSON-LD (BreadcrumbList + ItemList/Service) not rendered
- **Files:** `src/app/[locale]/solutions/ai/page.tsx`, `src/app/[locale]/solutions/ai/[slug]/page.tsx`
- **Evidence:** Task scope refs R-21/design Screen 5–6 (`SPECIFICATIONS.md:155`, design-spec `:285,:317`), but no
  JSON-LD is emitted and grep finds no JSON-LD component anywhere in `src`. Acceptance criteria only require
  metadata/alternates, and the sibling enterprise pages are equally missing it, so treat as deferred/non-blocking
  (recommend a dedicated SEO/JSON-LD task).

### [MINOR-5] `CaseStudyLink` lacks the design's `lg` "text + ảnh" second column
- **File:** `src/components/solutions/CaseStudyLink.tsx:10-17`
- **Evidence:** Design Screen 6 responsive (`:306`) specifies CaseStudyLink at `lg` = 2 columns "(text + ảnh)";
  the implementation is a 2-col grid but both columns are text (no image), even though `CaseStudy.gallery` exists.
  Moot today (MINOR-1 means it never renders), non-blocking.

## Positive checks (confirmed)

- Overview: 3 `SolutionCard` with correct derived links `/solutions/ai/{slug}` (`SolutionCard.tsx:18`), grid
  1/md/lg, `CaseStudyTeaser` (split, not a repeated grid), `CTABanner variant="alt"`; no `CTAForm`. ✔
- Detail: `generateStaticParams` = 3 slug × 2 locale (build confirms), invalid/non-AI slug → `notFound()`,
  `xl:max-w-[720px]` (`[slug]/page.tsx:48`), `PageHeader` + `Breadcrumb` with `href` back to `/solutions/ai`. ✔
- Cross-links use next-intl `Link` (`@/i18n/navigation`) → stay in-locale; hreflang/alternates use
  `/en/...` prefix exactly once (no double `/en`), `x-default` set; `routing.localePrefix: 'as-needed'` matches. ✔
- `h1` = `t('detailTitle')` = "{Tên} cho doanh nghiệp" / "{title} for your business"; no em-dash anywhere in
  messages (grep `—|–` → none). ✔
- `UseCases` uses semantic `<ul>` (`UseCases.tsx:9`); AI content has no numeric metrics, so R-24
  "numbers + descriptive text" is N/A (not violated). ✔
- Visible copy is i18n-only; page content comes from loaders; no fabricated content. ✔
- No `as any`, no swallowed errors, no dead branches in the new files. ✔
- Messages diff is strictly additive and every added key is used (`title`, `description`, `detailTitle`,
  `featuresTitle`, `useCasesTitle`, `caseStudyTitle`, `relatedCaseTitle`, `caseStudyLink`, `ctaTitle`,
  `ctaDescription`, `imageAlt`). ✔

## Residual risk / not verified

- No browser/mobile viewport available: responsive verified by CSS math + source inspection only; actual rendered
  order and 2+1 layout depend on runtime `readdir` order (MAJOR-1) and were not observed.
- `prefers-reduced-motion`, contrast, and focus-visible styling of reused tokens not re-audited (out of scope,
  covered by layer-1 tasks).
- `robots.txt` / `sitemap.xml` / `llms.txt` absent (deploy/SEO phase); not counted against this UI task.

## Verdict

**❌ FAIL** — 2 MAJOR findings (MAJOR-1 non-deterministic order + fragile 2+1 layout; MAJOR-2 nested `<main>`
violating R-24/semantic HTML). Builder must fix and re-submit for round 2. Do not commit/push until PASS.
