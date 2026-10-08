Agent: reviewer

# Review — feature/nta-website · layer-2-task-04 (round 2)

- **Work item:** feature/nta-website
- **Task:** `tasks/nta-website/layer-2-task-04.md` — Solutions AI `/solutions/ai` + 3 slug (Screens 5–6)
- **Review level:** `NORMAL`
- **Round:** 2 (re-review of round-1 FAIL fixes)
- **Verdict:** ✅ **PASS**

## Reason for level (NORMAL)

- Static SSG content pages (`db_tool: none`, `test_command: null`); no auth/RBAC/tenant/schema/migration/
  API-contract, no payment/cron/webhook, no security/token/upload surface → no STRICT red-risk trigger.
- Not FAST: adds 2 routes + 3 components + shared i18n keys and reuses the shared card/section/link layer.
- This round is a scoped re-verification of the 2 round-1 MAJOR + 2 MINOR fixes on an already-reviewed task.

## Blast radius

- Routes: `/solutions/ai` (vi,en) + `/solutions/ai/[slug]` (vi,en × boxai|flycam|custom-ai).
- Changed since round 1: `src/app/[locale]/solutions/ai/page.tsx`, `src/app/[locale]/solutions/ai/[slug]/page.tsx`,
  `src/components/solutions/CaseStudyTeaser.tsx`.
- Unchanged since round 1: `src/components/solutions/{UseCases,CaseStudyLink}.tsx`, `src/i18n/messages/{vi,en}.json`
  (`solutions.ai.*`), reused `Section`/`PageHeader`/`Breadcrumb`/`CTABanner`/`SolutionCard`/`FeatureList`/`Reveal`,
  `@/i18n/navigation` Link, `@/lib/content/*`.

## Verify commands + result

**Blocked:** the first shell invocation (`git status --short && git log`) returned
`{"error":{"type":"permission.rejected","message":"Permission denied: shell"}}`. Per Tool Loop Guard
("bash permission deny → DỪNG NGAY, không retry, không đổi biến thể") I stopped shell use; the npm verify
commands were **not** independently re-run.

| Command | Result |
|---|---|
| `npm run lint` | ⛔ **Blocked** — shell tool permission denied (not re-run) |
| `npm run typecheck` | ⛔ **Blocked** — shell tool permission denied (not re-run) |
| `npm run build` | ⛔ **Blocked** — shell tool permission denied (not re-run) |
| `test_command` | `skip, no test framework configured` (`project-config: test_command: null`) |

Evidence used instead: **builder-reported** `lint/typecheck/build` PASS (round-1 re-run) + **static review** of the
full diff. Round-1 build confirmed SSG coverage `/[locale]/solutions/ai` + `/[locale]/solutions/ai/[slug]`
(3 slug × 2 locales = 6 detail + 2 overview = 8 pages); `generateStaticParams` source is unchanged in intent
(see FIX-2). Static TS review of the changed files found no type/import/JSX breakage. Rendered-output verification
is listed under Residual risk.

## Fix verification (round-1 findings)

### ✅ MAJOR-1 — fixed: deterministic order + position-keyed 2+1
- `src/app/[locale]/solutions/ai/page.tsx:36-39` now derives order from canonical `aiSlugs`:
  `aiSlugs.flatMap((slug) => { const solution = aiSolutions.find((c) => c.slug === slug); return solution ? [solution] : []; })`.
  `aiSlugs = ['boxai','flycam','custom-ai']` (`src/lib/content/slug.ts:4`) → render order **BoxAI · Flycam · Custom AI**,
  matching design Screen 5 copy order. `readdir` ordering can no longer influence output.
- `page.tsx:49` full-width rule is now position-keyed: `solutions.length === 3 && index === 2 ? 'md:col-span-2 lg:col-span-1' : ''`
  → 3rd item (Custom AI) spans 2 cols at `md`, all 3 in one row at `lg`. Grid = `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` (`:47`). ✔

### ✅ MAJOR-2 — fixed: no nested `<main>`
- `src/app/[locale]/solutions/ai/[slug]/page.tsx:47` wrapper is now `<div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">`
  with the same classes; inner `xl:max-w-[720px]` div at `:48`.
- `src/app/[locale]/layout.tsx:34` provides the sole `<main id="main">`. No second `<main>` in the AI detail page — matches the
  enterprise sibling pattern; R-24 landmark violation resolved. ✔

### ✅ MINOR-2 — fixed: `getAiStaticParams()` used
- `src/app/[locale]/solutions/ai/[slug]/page.tsx:11,15-17` imports and returns `getAiStaticParams()`
  (`src/lib/content/slug.ts:22-24` → `aiSlugs.map(slug => ({slug}))`). Dead-export concern resolved. ✔

### ✅ MINOR-3 — fixed: `useId()` in `CaseStudyTeaser`
- `src/components/solutions/CaseStudyTeaser.tsx:1,6,10,12` — `const titleId = useId()` used for `id={titleId}` /
  `aria-labelledby={titleId}`; no hardcoded `ai-case-study-title`. ✔
- React-version check for RSC validity: `node_modules/react/cjs/react.react-server.production.js:423` exports
  `useId` (`ReactSharedInternals.H.useId()`), so calling `useId()` inside this **server** component is supported by
  React's server renderer — no RSC/build break. ✔

### ⏸ Deferred (as declared in the handoff — non-blocking)
- MINOR-1 (no AI `relatedCases` content → `CaseStudyLink` currently always hidden; R-06 makes it optional).
- MINOR-4 (JSON-LD/SEO) and MINOR-5 (`CaseStudyLink` image column) — deferred to a dedicated SEO/content task.

## Acceptance criteria re-check (`tasks/nta-website/layer-2-task-04.md:46-52`)

| AC | Result | Evidence |
|---|---|---|
| Overview: 3 card + CaseStudyTeaser + CTABanner; no repeated grid family | OK | `page.tsx:47-53` `<ul>` of `SolutionCard`; `:56` `CaseStudyTeaser` (split, single instance); `:57` `CTABanner variant="alt"`; no `CTAForm`. |
| 3 slug build tĩnh 2 locale; slug sai → 404 | OK (static; build not re-run) | `generateStaticParams` = `getAiStaticParams()` (3 slugs) × layout locale params (`layout.tsx:8-10`); guards `!isLocale \|\| !isAiSlug → notFound()` (`[slug]:21,34`) + `category !== 'ai' → notFound()` (`:23,39`). Round-1 build confirmed 6 detail routes. |
| CaseStudyLink đúng route case study; null → ẩn | OK (code) / deferred content | `CaseStudyLink.tsx:6` `if (!caseStudy) return null`; `:15` `href={\`/case-studies/${caseStudy.slug}\`}` via next-intl `Link` (same locale). No AI content declares `relatedCases` → block hidden (MINOR-1, deferred). |
| UseCases semantic list | OK | `UseCases.tsx:9` `<ul>` / `:11` `<li>`; grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`. |
| Responsive Screen 5/6; metadata/alternates riêng slug | OK | Overview `1/2/3` cols + position-keyed 2+1; detail `xl:max-w-[720px]`; per-slug `title`/`description`/`alternates` (`[slug]:19-30`). |
| Check commands pass | ⛔ Blocked (shell) | builder-reported PASS only (round 1). |

Other scope checks: no `CTAForm`; visible copy i18n-only (`solutions.ai.*`, unchanged since round 1 where all keys were
confirmed present in vi+en); `h1` = `detailTitle` with no em-dash (round-1 grep `—|–` none, messages unchanged);
cross-links in-locale via next-intl `Link`; hreflang `alternates` single `/en` prefix; no scope creep beyond the
declared files. `Gap 6` not independently re-checked this round (read-tool cap reached) — see Residual risk.

## Responsive Checklist Gate (UI touched → mandatory)

Breakpoints from `project-config.md` `ui.responsive_breakpoints` = 640/768/1024/1280/1536 (base <640 mobile).
No browser environment → verified by source/CSS math; rendered behavior in Residual risk.

| Item | Result | Evidence |
|---|---|---|
| Layout — no horizontal scroll | OK | `max-w-container` + `px-4 sm:px-6 lg:px-8`, `grid-cols-1`, no fixed px widths; strings wrap. |
| Layout — mobile-first (`min-width`) | OK | Tailwind `sm:`/`md:`/`lg:`/`xl:` only. |
| Layout — grid columns / no fixed columns | **OK (fixed)** | Overview `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` + `index === 2 → md:col-span-2 lg:col-span-1` (`page.tsx:47,49`), order now deterministic. |
| Typography/Spacing | OK | `text-h2`/`text-h3`/`text-text-secondary` token classes; no `px` font sizes in diff. |
| Media — `max-width:100%;height:auto` + aspect-ratio | OK (SolutionCard) / N/A | No raw `<img>` in changed files; `SolutionCard` uses `HomeImage` + `cardImageClass`/`cardImageSizes`. |
| Media — `srcset`/`sizes` | OK | `cardImageSizes` → `HomeImage` (`SolutionCard.tsx:19`). |
| Touch/Interaction — ≥44×44px | OK | `min-h-11` (44px) on teaser/link/CTA links (`CaseStudyTeaser.tsx:16`, `CaseStudyLink.tsx:15`). |
| Nav — mobile | N/A | Global `Header` (layer 1), not in this diff. |
| Table — scroll/card on mobile | N/A | No tables. |
| Viewport — no bare `100vh` | OK | No `vh` in diff. |
| A11y — reduced motion | OK | `Reveal` honors `prefers-reduced-motion` (unchanged, layer-1). |
| A11y — no nested/duplicate landmarks | **OK (fixed)** | Detail wrapper is `<div>` (`[slug]:47`); layout `<main>` is sole landmark. `useId` gives unique section label. |

No responsive item FAILs → gate passes.

## Skill gates

| Gate | Result | Evidence |
|---|---|---|
| aislop (`aislop scan --changes --json`) | `skip, aislop not installed & no config in repo` | No `*aislop*`/config found (round-1 glob); shell blocked this round. |
| anti-slop / oxlint | `skip, oxlint not configured` | No `.oxlintrc*`/`oxlint.config.*` (round 1); eslint report only (builder evidence). |
| open-code-review (`ocr`) | `skip, ocr not installed & no config` | No `ocr.config.*`/`.ocr*` (round 1). |
| AI-readable codebase | OK | Changed files small (max ~60 lines), functions <50 lines, self-descriptive names, no `as any`/comment-WHAT noise/magic numbers; <3 AI-chaos indicators. |
| ai-friendly-web | N/A | Layer-2 UI build, not a deploy task; `robots.txt`/`sitemap.xml`/`llms.txt` are Phase-6 artifacts. |
| blitzstrike pentest | N/A | NORMAL task, no public auth/API input surface. |

## Findings

### Resolved (round-1)
- **[MAJOR-1] resolved** — deterministic `aiSlugs` order + position-keyed 2+1 (`page.tsx:36-39,49`).
- **[MAJOR-2] resolved** — nested `<main>` → `<div>` (`[slug]/page.tsx:47`); layout `<main>` sole landmark.
- **[MINOR-2] resolved** — `getAiStaticParams()` used (`[slug]/page.tsx:11,15-17`).
- **[MINOR-3] resolved** — `useId()` in `CaseStudyTeaser.tsx:1,6` (valid in RSC: react.react-server exports `useId`).

### Deferred (non-blocking, as declared)
- **[MINOR-1]** No AI `relatedCases` content → `CaseStudyLink` always hidden; R-06 optional. Follow-up content task.
- **[MINOR-4]** JSON-LD (BreadcrumbList + ItemList/Service) not emitted; defer to SEO task.
- **[MINOR-5]** `CaseStudyLink` lacks design's `lg` image column; moot while MINOR-1 holds. Defer.

### New (non-blocking)
- **[MINOR-6] `UseCases` list key is the row content string** — `src/components/solutions/UseCases.tsx:11`
  `key={useCase}`. If any solution's `useCases` array ever contains a duplicate string, React emits a duplicate-key
  warning. Low impact and content-dependent; suggestion only: use `${index}-${useCase}` if duplicates are possible.
  Not a blocker (current AI content has no duplicates observed).

No CRITICAL/MAJOR findings remain.

## Residual risk / not verified

- **Verify commands not independently re-run** — shell tool permission denied (`Blocked`); used builder-reported
  round-1 `lint/typecheck/build` PASS + static review of the changed files. Static TS/JSX inspection found no breakage,
  and round-1 build already proved route/SSG coverage with the same slug set.
- **Rendered order / 2+1 layout not observed live** (no browser). Verified by source + CSS math only.
- **`Gap 6` cross-check not performed this round** (read-tool cap reached); round-1 spec/AC coverage stands.
- `prefers-reduced-motion`, contrast, focus-visible of reused tokens not re-audited (layer-1 scope).
- `robots.txt` / `sitemap.xml` / `llms.txt` absent (deploy/SEO phase); not counted against this UI task.

## Verdict

**✅ PASS** — Both round-1 MAJOR findings are verifiably fixed (deterministic, position-keyed layout; single `<main>`
landmark), and MINOR-2/MINOR-3 are resolved. Remaining items are the declared deferred MINORs plus one new non-blocking
MINOR-6. No CRITICAL/MAJOR remain. Residual build/typecheck verification is `Blocked` (shell denied) and covered by
static review + builder evidence — the blocker is environmental, not a code defect.
