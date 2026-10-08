# Review — feature/nta-website · layer-2-task-03 · round 2

Agent: reviewer

> Round 1 was **PASS** with 5 MINOR findings. Round 2 verifies the final state after 3 fixes
> (#2 DentGo casing, #3 VI title, #4 related filter guard) + metadata refinement.
> Resolved items from round 1 are not re-litigated; deferred items (#1, #5) are treated as intentional.

## Review level

**NORMAL**

### Reason
- Scope: 1 overview route + 1 dynamic route (`crm|hrm|lms|dentgo`) × 2 locale. No auth/RBAC/tenant/schema/DB
  (`db_tool: none`), no mutation/data-loss, no external API contract.
- Changes since round 1 are surgical and page-local: a typed brand map, one i18n string, one filter guard.
  No shared component (`Breadcrumb`, `PageHeader`, `CTABanner`, `HomeImage`, `Section`, `SolutionCard`) was modified.
- Matches task expectation (`layer-2-task-03.md:18` → `Review level expected: NORMAL`).

## Blast radius
- Routes: `/solutions/enterprise`, `/en/solutions/enterprise`, `/solutions/enterprise/{crm,hrm,lms,dentgo}` (+`/en/...`)
  = 5 pages × 2 locale = 10 SSG routes.
- Data: reads `getAllSolutions` / `getSolutionBySlug` (Layer 0) + `getEnterpriseStaticParams` / `isEnterpriseSlug`
  (slug helpers). No writes.
- i18n: `src/i18n/messages/{vi,en}.json` (`solutions.enterprise.*`) — additive; only `title` value changed.
- Metadata: per-slug `generateMetadata` title now derived from `enterpriseBrandNames`; `alternates.languages` vi/en/x-default.

## Verify commands + result

Configured (`project-config.md`): `npm run lint`, `npm run typecheck`, `npm run build`; `test_command: null` → test skip.

- Shell tool: **permission denied** in this reviewer session (both `git status` and `npm run lint` attempts rejected).
  Per Tool Loop Guard I did **not** retry or vary the command. `lint` / `typecheck` / `build` are therefore
  **Blocked** for independent re-execution.
- Builder evidence (`.context/runs/fix-nta-website-layer-2-task-03.md:20`):
  `verify: "npm run lint PASS · npm run typecheck PASS · npm run build PASS (builder rework); 5 route × 2 locale SSG"`.
  History line 41 confirms the refine pass (brand map) with `lint/typecheck/build PASS`, `status=awaiting` → reviewer r2.
- `test`: **skip, test_command: null** (no test framework configured v1 — per config).
- Static cross-check of the fixes and acceptance criteria performed below.

> ⚠️ Verify commands could not be independently re-run (shell denied). Verdict relies on static review + builder
> evidence. See Residual risk.

## Verification of round-1 fixes

| # | Fix | Result | Evidence |
|---|---|---|---|
| 2 | No `DENTGO`; per-slug brand casing CRM/HRM/LMS/**DentGo** VI+EN; typed map, safe fallback, no `as any` | **FIXED** | `[slug]/page.tsx:13` `type EnterpriseSlug = (typeof enterpriseSlugs)[number]`; `:15-20` `Record<EnterpriseSlug, string>` = crm→CRM, hrm→HRM, lms→LMS, dentgo→DentGo; `:31` `isEnterpriseSlug(...) ? enterpriseBrandNames[solution.slug] : solution.slug` (type-narrowed, safe fallback); `:32` VI `Giải pháp ${brandName} \| NTA` / EN `${brandName} Solution \| NTA`. Grep `DENTGO`/`toUpperCase`/`as any` in `src/app/[locale]/solutions` → 0 matches. |
| 3 | VI breadcrumb/page title = "Giải pháp Doanh nghiệp" (design match); EN consistent | **FIXED** | `vi.json:73` `"title": "Giải pháp Doanh nghiệp"`; overview `page.tsx:35` uses `t('title')` for both crumb label + h1; detail `[slug]/page.tsx:58` uses `t('title')` for the crumb. Matches `design-spec.md:189` ("Trang chủ › Giải pháp Doanh nghiệp") and `:214` SEO. EN `en.json:73` `"Enterprise Solutions"` (design `:209`). |
| 4 | Related filter requires `category === 'enterprise'`; empty → `[]` | **FIXED** | `[slug]/page.tsx:52-54`: `solution.relatedCases?.length ? allSolutions.filter((c) => c.category === 'enterprise' && c.slug !== solution.slug && ...) : []`. Guard present; empty branch returns `[]`. |

## Acceptance criteria verification (final, static)

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | Overview renders 4 card links | OK | `page.tsx:31` filters `category === 'enterprise'` (exactly crm/hrm/lms/dentgo); `SolutionCard` builds `/solutions/${category}/${slug}`. |
| 2 | Grid 1→2→2×2 by bp | OK | `page.tsx:38` `grid-cols-1 md:grid-cols-2 lg:grid-cols-2` (4 items → 2×2 at lg). |
| 3 | Sidebar sticky ≥lg; main `max-w-[720px]` xl; Breadcrumb semantic | OK | `[slug]/page.tsx:59` `lg:grid-cols-[minmax(0,1fr)_18.75rem]`, `:65` `lg:py-12`; `RelatedSolutions.tsx:8` `lg:sticky lg:top-24` + `<aside aria-labelledby>`; `:60` `xl:max-w-[720px]`. |
| 4 | CTABanner alt at end; no CTAForm | OK | `page.tsx:49`, `[slug]/page.tsx:69` `variant="alt"` last child; no form imported in either page. |
| 5 | `generateStaticParams` 4 slugs × 2 locale; invalid slug → 404 | OK | `[slug]/page.tsx:22-24` → `getEnterpriseStaticParams()` (`slug.ts:18-20`, 4 slugs); locale params from `[locale]/layout.tsx`; `notFound()` at `:28/:30/:44/:51`. `getSolutionBySlug` (`solutions.ts:11`) returns null for unknown; AI slugs rejected by `category !== 'enterprise'`. |
| 6 | Per-slug metadata/alternates distinct | OK | `[slug]/page.tsx:32` distinct titles (CRM/HRM/LMS/DentGo); `:38` vi/en/x-default alternates. Overview `page.tsx:13-14` matches design. |
| 7 | Empty Related/Screenshot hidden | OK | `RelatedSolutions.tsx:5` and `ScreenshotSection.tsx:5` `return null`; `[slug]/page.tsx:52-54` yields `[]` when no `relatedCases`. |
| 8 | i18n-only visible copy; Gap 6 no double `/en` | OK | All visible body copy via `t(...)`/content loaders; `path = /solutions/enterprise/${slug}` → en alternate `/en/solutions/...` (no `/en/en`). |
| 9 | No scope creep / no shared-component fork | OK | New `components/solutions/*` only; reuses `Section`, `HomeImage`, `PageHeader`, `CTABanner`, `Reveal`, `SolutionCard`. |
| 10 | Anti-slop (no `as any`, dead code, `filter().map` copy) | OK | No `as any`; typed record + narrowed index; no `filter().map` clone. |

## Responsive Checklist Gate (diff touches UI → MANDATORY)

UI block present (`project-config.md:110-115`). Breakpoints: **375 / 768 / 1280**. No browser runtime
(shell denied) → verified by CSS math; live rendering not visually confirmed (Residual risk).
Changes since round 1 (brand map, `vi.json` title, filter guard) do **not** alter any layout class, so the
round-1 PASS on responsive behavior carries forward; re-confirmed against the current files:

| Item | Result | Evidence |
|---|---|---|
| No horizontal scroll; mobile-first; grid not fixed cols; container not fixed px | OK | `page.tsx:38` base 1 col → md 2; `[slug]/page.tsx:59` base 1 col → `lg:[minmax(0,1fr)_18.75rem]` (`minmax(0,…)` prevents overflow); `max-w-container` (not fixed px). |
| Font-size rem; fluid heading; spacing scale | OK | Tailwind tokens `text-h2/text-h3/text-body-lg` (rem); `py-12 md:py-16 xl:py-24`. No px font introduced in diff. |
| Images `max-width:100%;height:auto` + `sizes`; no video | OK | `ScreenshotSection.tsx:13` `h-auto w-full` + `sizes="(min-width:640px) 50vw, 100vw"`; `HomeImage` (Layer 1) intrinsic ratio. No video in diff. |
| Touch target ≥44px; mobile nav; table scroll/card | OK | `RelatedSolutions.tsx:13` `min-h-11` (2.75rem = 44px); no `<table>` in diff. |
| No bare `100vh`; reduced-motion; no `overflow:hidden` masking | OK | Grep `100vh|overflow-hidden` in `src/app/[locale]/solutions` → 0 matches; motion is `motion-safe:` (Layer 1). |

Any FAIL → FAIL; none. Unverified: actual pixel rendering / `scrollWidth` at 375 (no browser) → Residual risk.

## Skill gates

| Gate | Result | Evidence |
|---|---|---|
| `aislop scan --changes --json` (score ≥80) | **Blocked** | Shell permission denied → not executed. Not a PASS-blocker per instructions (cannot run). |
| `oxlint` anti-slop | **skip, oxlint not configured** | Glob `**/.oxlintrc*` → no files. |
| `ocr` Open Code Review | **Blocked** | Shell denied → `ocr review` not executed; not counted as FAIL. |
| AI-readable codebase (≥3 indicators → FAIL) | **OK** | <3 indicators: no vague names, pages 52/72 lines incl. JSX (functions <50), no >3-step indirection, no WHAT comments. Borderline: arbitrary `18.75rem`/`max-w-[720px]` (traceable to design spec). |
| ai-friendly-web | **N/A** | Pre-deploy Layer 2; `llms.txt`/`robots.txt`/`sitemap.xml` are Layer 4 SEO audit + Phase 6 DevOps (task DoD = `NO_DOC_IMPACT`). Not this task's deliverable. |
| blitzstrike pentest | **N/A** | NORMAL; no auth/API-public/input surface in this diff. |

## Findings

No CRITICAL / MAJOR findings. No security issues (no user input, no auth, no SQL/DB, no secrets; static content).

### MINOR (carried, intentional — not counted against verdict)

- **MINOR-1 — Metadata title/description hardcoded in overview page (not i18n-driven).**
  `src/app/[locale]/solutions/enterprise/page.tsx:12-15` keeps literal VI/EN `pageMetadata`.
  Explicitly deferred (consistent with home/about). Non-blocking.
- **MINOR-5 — ScreenshotSection / RelatedSolutions render `null` with current content**
  (`screenshots:` / `relatedCases:` absent in MDX). Empty state is required behavior; deferred by design. Non-blocking.

### Observation (no action required)

- `[slug]/page.tsx:31` fallback `: solution.slug` is practically unreachable (line 30 already rejects
  non-enterprise), but it is a safe, type-correct fallback — no defect.

## Verdict

✅ **PASS**

- Round-1 MINOR #2, #3, #4 are **FIXED** and verified statically; #1/#5 intentionally deferred (accepted).
- No CRITICAL/MAJOR findings; all acceptance criteria satisfied on static review.
- Bug-repro closure: N/A (feature task).
- Residual risk: verify commands (`lint`/`typecheck`/`build`) could NOT be independently re-run (shell permission
  denied in reviewer session) — relying on builder evidence
  (`.context/runs/fix-nta-website-layer-2-task-03.md:20`, rework PASS + 10 SSG routes). If independent
  re-verification is required, the primary agent must run the configured commands.
- Responsive gate verified by CSS math only (no browser runtime).
- Reviewer read-tool usage exceeded the nominal NORMAL cap (cross-check of design-spec, slug helpers, i18n,
  run journals); no repeated/looping probes were made.
