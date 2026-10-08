# Review — feature/nta-website · layer-2-task-03 · round 1

Agent: reviewer

## Review level

**NORMAL**

### Reason
- Scope: 1 overview route + 1 dynamic route (`crm|hrm|lms|dentgo`) × 2 locale; no auth/RBAC/tenant/schema/DB
  (`db_tool: none`), no mutation/data-loss, no API contract.
- No shared component was modified: `Breadcrumb`, `PageHeader`, `CTABanner`, `HomeImage`, `Section`, `SolutionCard`
  are only *consumed*. New components live in `src/components/solutions/` (task-scoped).
- i18n messages only add `solutions.enterprise.*` keys; no rename of existing keys.
- Residual risk (hreflang/metadata + navigation `Link`) is read-only consumption → not red enough for STRICT.
- Matches task expectation (`layer-2-task-03.md` → `Review level expected: NORMAL`).

## Blast radius
- Routes: `/solutions/enterprise`, `/en/solutions/enterprise`, `/solutions/enterprise/{crm,hrm,lms,dentgo}` and `/en/...`
  = 5 pages × 2 locale = 10 SSG routes.
- Consumers reachable from Header/Footer nav and `SolutionCard` (home grid) → all enterprise links resolve here.
- Data: reads `getAllSolutions` / `getSolutionBySlug` (Layer 0 loaders) + `getEnterpriseStaticParams` (slug helpers).
- i18n: `src/i18n/messages/{vi,en}.json` (`solutions.enterprise.*`) — additive only.
- Unchanged/consumed: `Breadcrumb`, `PageHeader`, `CTABanner`, `HomeImage`, `Section`, `SolutionCard`, `Reveal`,
  `src/i18n/routing.ts` (`localePrefix: 'as-needed'`).

## Verify commands + result

Configured (`verify commands` from `.context/project-config.md`): `npm run lint`, `npm run typecheck`, `npm run build`;
`test_command: null` → test skip.

- Shell tool: **permission denied** in this reviewer session (`Permission denied: shell`). Per Tool Loop Guard I did
  NOT retry. All check commands are therefore **Blocked** for independent re-execution.
- Builder evidence (`.context/runs/builder-nta-website-layer-2-task-03.md:20`):
  `verify: "npm run lint PASS · npm run typecheck PASS · npm run build PASS (builder); overview + 4 slug × 2 locale SSG"`.
  History line 40 confirms 2 pages + 4 components + 2 i18n, all PASS, `status=awaiting` → reviewer.
- `test`: **skip, test_command: null** (no test framework configured v1 — per config).
- Static cross-check of the build claim (routes present, static params, keys exist) performed below.

> ⚠️ Verify commands could not be independently re-run (shell denied). Verdict relies on static review + builder
> evidence. See Residual risk.

## Acceptance criteria verification (static)

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | Overview renders 4 SolutionCards with correct links | OK | `enterprise/page.tsx:31` filters `category === 'enterprise'`; content has exactly crm/hrm/lms/dentgo enterprise (12 enterprise frontmatter matches, 4/locale). `SolutionCard.tsx:18` builds `/solutions/${category}/${slug}`. |
| 2 | Grid 1→2→2×2 | OK | `page.tsx:38` `grid-cols-1 md:grid-cols-2 lg:grid-cols-2` → 1 col base, 2 col md, 2×2 at lg with 4 items. |
| 3 | PageHeader + Breadcrumb Trang chủ › Giải pháp Doanh nghiệp | OK (copy MINOR) | `page.tsx:35` single item; `Breadcrumb.tsx:15` prepends `nav.home` → Home + title. Label text mismatch vs design (see MINOR-3). |
| 4 | SolutionIntro `max-w-[65ch]` | OK | Rendered via `PageHeader.tsx:19` (`max-w-[65ch]`, `mx-auto` for centered). No separate SolutionIntro fork. |
| 5 | CTABanner alt at end | OK | `page.tsx:49`, `[slug]/page.tsx:59` `variant="alt"` last child. |
| 6 | `generateStaticParams` crm|hrm|lms|dentgo × 2 locale | OK | `slug.ts:3,18-20` returns 4 slugs; `[locale]/layout.tsx:8-10` returns 2 locales → cartesian 8 detail pages. |
| 7 | Invalid slug → 404 | OK | `solutions.ts:11` returns null unless enterprise/ai slug; `[slug]/page.tsx:19,21,34,41` → `notFound()`; AI slugs rejected by `category !== 'enterprise'`. |
| 8 | Slugs match actual content | OK | MDX dirs: `src/content/solutions/{vi,en}/{crm,hrm,lms,dentgo}.mdx` all `category: enterprise`. |
| 9 | main FeatureList → BenefitList → ScreenshotSection | OK | `[slug]/page.tsx:51-53` order correct. |
| 10 | aside RelatedSolutions sticky `top-24` ≥lg; main `max-w-[720px]` xl | OK | `RelatedSolutions.tsx:8` `lg:sticky lg:top-24`; `[slug]/page.tsx:50` `xl:max-w-[720px]`; grid `lg:grid-cols-[minmax(0,1fr)_18.75rem]` (300px). |
| 11 | Empty Related/Screenshot hidden | OK | `RelatedSolutions.tsx:5` and `ScreenshotSection.tsx:5` return `null`; `[slug]/page.tsx:42-44` yields `[]` when `relatedCases` absent. |
| 12 | Semantic: Breadcrumb aria-label, `<aside>`, `<ul>/<li>` | OK | `Breadcrumb.tsx:18` `aria-label="Breadcrumb"` + `<ol>/<li>`; `RelatedSolutions.tsx:8` `<aside aria-labelledby>` + `<ul>/<li>`; lists in Feature/Benefit/Screenshot. |
| 13 | NO CTAForm (deferred Layer 3 task-03) | OK | Only `CTABanner` imported in both pages; grep finds no form usage. |
| 14 | Metadata per slug/locale distinct + alternates | OK (casing MINOR) | `[slug]/page.tsx:22` VI `Giải pháp CRM | NTA` / EN `CRM Solution | NTA`; `page.tsx:12-15` distinct. alternates vi/en/x-default at `:22-23` and `:28`. |
| 15 | i18n-only visible copy; content from loaders; Gap 6 no double `/en`; cross-locale links stay in locale | OK (MINOR metadata) | All visible body copy via `t(...)`; content via loaders. `routing.ts:6` `localePrefix: 'as-needed'` → alternates `.../en/solutions/...` correct (no `/en/en`). `Link` from `@/i18n/navigation` in `RelatedSolutions.tsx:1,13` keeps locale. Metadata strings hardcoded (MINOR-1). |
| 16 | No scope creep / no fork of shared components | OK | New `components/solutions/*` only; no changes to `components/shared/*`/`components/ui/*`; reuses `Section`, `HomeImage`, `PageHeader`, `CTABanner`. |
| 17 | Anti-slop (no `as any`, dead code, `filter().map` copy) | OK | No `as any`; no `filter().map` clone pattern; exports used. |

## Responsive Checklist Gate (diff touches UI → MANDATORY)

Project has `ui:` block (`project-config.md:110-115`). Breakpoints tested: **375 / 768 / 1280** (base/md/xl).
No browser runtime (shell denied) → verified by CSS math; rendering not visually confirmed (Residual risk).

| Item | Result | Evidence |
|---|---|---|
| No horizontal scroll; mobile-first (`min-width`); grid not fixed cols; container not fixed px | OK | `page.tsx:38` base 1 col → md 2; `[slug]/page.tsx:49` base 1 col → `lg:grid-cols-[minmax(0,1fr)_18.75rem]` (minmax(0,…) prevents overflow); `Section.tsx:26` + `PageHeader.tsx:15` `max-w-container px-4 sm:px-6 lg:px-8`; `Breadcrumb.tsx:19` `flex-wrap`. |
| Font-size rem; heading fluid `clamp()`; spacing scale/clamp | OK | Uses Tailwind tokens `text-h2/text-h3/text-body-lg`, `py-12 md:py-16 xl:py-24` (rem-based). Fluid heading token defined in Layer 1 (`text-display`) — outside this diff; no px font introduced here. |
| Images `max-width:100%;height:auto` + `aspect-ratio`; `srcset`/`sizes`; video aspect | OK | `HomeImage.tsx:24` `h-auto w-full` + width/height 1200×720 (intrinsic ratio); `ScreenshotSection.tsx:13` sets `sizes`; `SolutionCard` uses `cardImageSizes`. No video in diff. |
| Touch target ≥44px; mobile nav; table scroll/card | OK | Link targets `min-h-11` (2.75rem=44px): `RelatedSolutions.tsx:13`, `Breadcrumb.tsx:28`, `SolutionCard.tsx:22`. No `<table>` in diff (FeatureList is `<ul>`), so no table-scroll requirement. |
| No bare `100vh`; `prefers-reduced-motion`; no `overflow:hidden` masking | OK | No `100vh`/`overflow:hidden` in task files; motion is `motion-safe:` (`SolutionCard.tsx:22`) and `Reveal` (Layer 1). |

Any FAIL → FAIL; none. Unverified: actual pixel rendering / scrollWidth at 375 (no browser) → Residual risk.

## Skill gates

| Gate | Result | Evidence |
|---|---|---|
| `aislop scan --changes --json` (score ≥80) | **Blocked** | Shell permission denied → command not executed. Not a PASS-blocker per instructions (cannot run). |
| `oxlint` anti-slop | **skip, oxlint not configured** | No `.oxlintrc*`; `package.json:9` lint = `eslint .`. |
| `ocr` Open Code Review | **Blocked** | Shell denied → `ocr review` not executed; not counted as FAIL. |
| AI-readable codebase (≥3 indicators → FAIL) | **OK** | Indicators <3: no vague names, no function >50 lines (pages 26–62 lines incl. JSX, handlers tiny), no >3-step indirection, no WHAT comments. Only borderline: arbitrary values `18.75rem`/`max-w-[720px]` (`[slug]/page.tsx:49-50`) — 1 value, traceable to design spec. |
| ai-friendly-web | **N/A** | Pre-deploy Layer 2; `llms.txt`/`robots.txt`/`sitemap.xml` are Layer 4 SEO audit + Phase 6 DevOps per task scope; task DoD = `NO_DOC_IMPACT`. Not in this task's deliverable. |
| blitzstrike pentest | **N/A** | NORMAL; no auth/API-public/input-handling surface in this diff. |

## Findings

### MINOR-1 — Metadata title/description hardcoded in page (not i18n-driven)
- `src/app/[locale]/solutions/enterprise/page.tsx:12-15` and `src/app/[locale]/solutions/enterprise/[slug]/page.tsx:22`.
- Evidence: `pageMetadata` VI/EN objects + `` `Giải pháp ${slug.toUpperCase()} | NTA` `` are literal strings in the
  component, while all on-page copy is `t(...)`. Overlaps `solutions.enterprise.title/description` in messages.
- Impact: SEO metadata duplicated outside `src/i18n/messages`, harder to keep in sync; not user-visible body copy.
- Fix: move metadata title/description into `solutions.enterprise.meta.*` (or reuse existing keys) and read via
  `t(...)` in `generateMetadata`. Non-blocking.

### MINOR-2 — `slug.toUpperCase()` produces wrong brand casing for DentGo
- `src/app/[locale]/solutions/enterprise/[slug]/page.tsx:22` → VI `Giải pháp DENTGO | NTA`, EN `DENTGO Solution | NTA`.
- Evidence: design spec (`design-spec.md:212`) uses brand `Nha khoa (DentGo)`; expected `DentGo`, not `DENTGO`.
- Impact: SEO/brand polish only (design example `Giải pháp CRM | NTA` is fine for CRM/HRM/LMS acronyms).
- Fix: per-slug display label map (e.g. `dentgo → 'DentGo'`) or read title casing from content.

### MINOR-3 — Breadcrumb label text differs from design copy
- `page.tsx:35` / `[slug]/page.tsx:48` use `t('title')` = "Giải pháp cho doanh nghiệp" (VI), while design breadcrumb
  (`design-spec.md:189`) is "Giải pháp Doanh nghiệp" and `nav.enterprise` (`vi.json:19`) already holds that exact text.
- Impact: cosmetic inconsistency between h1 and breadcrumb label. Fix: use `nav.enterprise` for the crumb label.

### MINOR-4 — RelatedSolutions links assume enterprise category (latent)
- `[slug]/page.tsx:42-43` filters candidates by shared `relatedCases` without constraining `candidate.category === 'enterprise'`,
  but `RelatedSolutions.tsx:13` always links to `/solutions/enterprise/${slug}`.
- Impact: currently no content has `relatedCases` (verified: 0 matches for `relatedCases:` in `src/content/solutions/**`),
  so no live bug; if a future cross-category `relatedCases` is added, the link would 404.
- Fix: add `candidate.category === 'enterprise'` to the filter.

### MINOR-5 — ScreenshotSection / RelatedSolutions never render with current content (coverage observation)
- Evidence: no `screenshots:` and no `relatedCases:` keys in any `src/content/solutions/**` MDX (grep: 42 frontmatter
  matches = 14 files × slug/image/category only). Hence both components return `null` on all 8 detail pages.
- Impact: design Screen 4's screenshot + sidebar sections are invisible until content adds those fields; not a code
  defect (empty state is required behavior) but the deferred visual sections are effectively unreachable.
- Fix: add `screenshots`/`relatedCases` in Layer 0 task-04 content or track as a content follow-up. Non-blocking.

No CRITICAL / MAJOR findings. No security issues (no user input, no auth, no SQL/DB, no secrets; static content).

## Verdict

✅ **PASS**

- No CRITICAL/MAJOR findings; all acceptance criteria satisfied on static review.
- Bug-repro closure: N/A (feature task, not a bug).
- Residual risk: verify commands (`lint`/`typecheck`/`build`) could NOT be independently re-run (shell permission
  denied in reviewer session) — relying on builder evidence (`.context/runs/builder-nta-website-layer-2-task-03.md:20`)
  which asserts all three PASS + 10 SSG routes. If independent re-verification is required, the primary agent must run
  the configured commands.
- Responsive gate verified by CSS math only (no browser runtime).
- Reviewer read-tool usage exceeded the nominal NORMAL cap (deep cross-check of design-spec, SPECIFICATIONS R-05/R-20/
  R-21/R-23/R-24, content frontmatter, i18n keys, shared primitives); no repeated/looping probes were made.
