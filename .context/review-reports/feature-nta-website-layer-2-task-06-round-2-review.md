# Review — feature/nta-website · layer-2-task-06 (round 2)

Agent: reviewer

## Review level
`NORMAL`

## Reason
- Static content-driven task: `db_tool: none`, `test_command: null`, no auth/RBAC/tenant/schema/migration, no payment, no API.
- Round‑1 escalation trigger (hidden client fetch) re-checked: `CaseStudyFilter` is the only client component and it consumes a server-passed list prop; no `fetch`/`axios`/SWR in `src/components/case-studies`.
- Round‑2 delta is a render-strategy/SEO fix + small a11y/cosmetic fixes confined to `/case-studies/*` (2 locales). Blast radius stays small → NORMAL (not FAST: UI + SSG/SEO + shared `EmptyState`; not STRICT: no red-risk category).

## Blast radius
- Routes: `/[locale]/case-studies` + `/[locale]/case-studies/[slug]` (vi + en) — 2 list + 4 detail SSG routes.
- Shared components: `src/components/ui/EmptyState.tsx` (modified, optional prop added), `FilterBar`, `Pagination`, `CaseStudyCard`, `PageHeader`, `Breadcrumb`, `CTABanner`.
- i18n namespace `caseStudies.*` (vi/en). Content: `src/content/case-studies/{vi,en}/*.mdx`.
- No DB/API/auth/middleware touched.

## Verify commands + result
| Command | Result |
|---|---|
| `npm run lint` | ✅ PASS (`eslint .`, exit 0, no output) |
| `npm run typecheck` | ✅ PASS (`tsc --noEmit`, exit 0) |
| `npm run build` | ✅ PASS — `next build` 33/33 static pages; route `/[locale]/case-studies` is `●` (SSG) with `/vi/case-studies` + `/en/case-studies`; `/[locale]/case-studies/[slug]` `●` with 4 paths (`dental-clinic-operations`, `oc-eo-learning` × vi/en) |
| `test` | skip — `test_command: null` (project-config) |
| `migration` | skip — `db_tool: none` |

Note: compound shell commands (`… ; echo …`) are rejected by the reviewer bash allowlist; the profile-allowlisted commands above were run individually (same behavior as round 1).

## Verification of the round‑1 MAJOR fix
**MAJOR ([round 1] list content client-only) → FIXED.** The `<Suspense>` boundary in `src/app/[locale]/case-studies/page.tsx:29` now carries a server-rendered fallback (`<ul>` of up to 9 `CaseStudyCard`s, `filter=all`, page 1). Evidence from the freshly rebuilt static output:

- `.next/server/app/vi/case-studies.html` contains the card markup marker `text-h3 font-semibold leading-tight` (CaseStudyCard) **and** `href="/case-studies/dental-clinic-operations"` + `href="/case-studies/oc-eo-learning"`. (Round 1: both absent.)
- `.next/server/app/en/case-studies.html` contains `href="/en/case-studies/dental-clinic-operations"`; no `/en/en/` double-prefix.
- Route classification in build output is `●` (SSG, uses `generateStaticParams`) — no server-side `searchParams` read: `CaseStudiesPage` destructures only `{ params }` (`page.tsx:22`); page metadata likewise (`page.tsx:16`).

## Acceptance criteria re-check (`tasks/nta-website/layer-2-task-06.md`)
| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | Filter client-side no reload; `aria-pressed` + result-count announce; `?filter=` kept on `?page=` change | ✅ | `CaseStudyFilter.tsx:32-38` `router.push(..., {scroll:false})`; `FilterBar.tsx:25` `aria-pressed`, `:33` `role="status"`; `Pagination.tsx:29-31` copies `searchParams` then `set('page')` → filter preserved |
| 2 | Empty filter → message + working "Xóa bộ lọc" | ✅ | `CaseStudyFilter.tsx:47` renders `EmptyState` when `filtered.length===0`; `clearFilter` deletes `filter`+`page` and pushes (`:40-45`) |
| 3 | ≥2 cases SSG × 2 locales; detail has MetaBar/Challenge/Solution/Result/Related | ✅ (Related hidden by empty content) | build: 4 detail SSG routes; `.next/server/app/vi/case-studies/dental-clinic-operations.html` contains `<dl class` + `Thách thức`/`Giải pháp`/`Kết quả`; `RelatedStudies.tsx:7` hides when `related: []` (accepted content gap, not fabricated) |
| 4 | Wrong slug → 404; BR-004; no fabricated metrics | ✅ | `[slug]/page.tsx:37` `notFound()`; content client anonymized (`Phòng khám nha khoa tại Tây Nam Bộ`, `Đơn vị đào tạo tại Óc Eo`); `result` copy states metrics unconfirmed; `metrics ?? []` → list hidden (`ResultBlock.tsx:5`) |
| 5 | MetaBar `<dl>`; pagination `aria-current`; responsive | ✅ | `MetaBar.tsx:7` `<dl>`; `Pagination.tsx:40` `aria-current` |
| 6 | Check commands pass | ✅ | lint/typecheck/build above |

Other task promises: single `<main>` (`layout.tsx:34`); deterministic order (`page.tsx:27` `localeCompare`); i18n-only visible copy (vi/en blocks line 125 parity); Gap 6 — case-study links built canonically (`/case-studies/${slug}` via `@/i18n/navigation` `Link`), no double `/en` in en HTML; no scope creep (only task-declared files + backward-compatible `EmptyState`); no count-up.

## Responsive Checklist Gate (diff touches UI → MANDATORY)
Verified at 375 / 768 / 1280 via CSS math (no browser env).

| Item | Result | Evidence |
|---|---|---|
| Layout — no horizontal scroll, mobile-first, grid/container | **OK** | List `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (→1/2/3); gallery `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`; MetaBar `grid-cols-1 sm:grid-cols-3 md:flex`; container `max-w-container px-4 sm:px-6 lg:px-8` (no fixed px); FilterBar internal `overflow-x-auto` wraps at `md` |
| Typography/Spacing | **OK** | Token classes only (`text-h2/h3/display/body/sm`); no inline `px` font-size in diff |
| Media | **OK** | `next/image` with `width`/`height` + `h-auto w-full` + `sizes` (ImageGallery, CaseStudyCard); no video/embed |
| Touch/Interaction ≥44px | **OK** | filter pills `min-h-11`; pagination buttons `min-h-11 min-w-11` |
| Viewport/A11y | **OK** | No `100vh`/`overflow-hidden` in `src/components/case-studies` (grep 0); no animation added → `prefers-reduced-motion` N/A |
| Browser verification | **Residual risk** | No browser available; validated by CSS math only |

Round‑1 responsive MINOR (Result block breakpoint) is now `md:grid-cols-4` (`ResultBlock.tsx:5`) → matches design Screen 9 (2×2 → 4 at ≥768). No responsive item FAILs.

## Skill gates
| Gate | Result | Evidence |
|---|---|---|
| `aislop` | skip, aislop not installed | `aislop scan --changes --json` → `command not found` (exit 127) |
| anti-slop / `oxlint` | skip, oxlint not configured | no `.oxlintrc*`, no `oxlint` dep/config in repo (only `eslint`); `npx oxlint` binary resolvable (1.87.0) but no project config → gate not applicable |
| `ocr` (open-code-review) | skip, ocr not installed | `ocr --version` → `command not found` (exit 127) |
| AI-readable codebase | OK | All new/changed files < 300 lines, functions < 50 lines, self-descriptive names; no ≥3 AI-chaos indicators (dense single-line JSX is repo-consistent) |
| ai-friendly-web | N/A | `sitemap.xml`/`robots.txt`/`llms.txt` explicitly scoped to layer-4-task-01, not this task |
| blitzstrike pentest | N/A | NORMAL, no public API/auth/input surface |

## Findings

### [MINOR] `RelatedStudies` still never exercised
- `src/content/case-studies/{vi,en}/*.mdx` both `related: []` → `src/components/case-studies/RelatedStudies.tsx:7` always returns `null`.
- Status: **accepted content gap** (per round‑2 task brief; do not fabricate links). Task AC "Related" is structurally implemented but not demonstrable. Recommend a later content task cross-linking the two cases so the populated path is testable.

### [OBSERVATION] JSON-LD coverage unchanged
- List page emits no `BreadcrumbList`/`ItemList`; detail emits only `Article` (`[slug]/page.tsx:42-46`). Known baseline; SEO/JSON-LD audit is layer-4-task-01. Not counted.

### [OBSERVATION] Round‑1 fabricated `datePublished` removed
- `src/app/[locale]/case-studies/[slug]/page.tsx` no longer sets `datePublished`; grep of `src` and of the built detail HTML → 0 matches. Resolved.

## Residual risks
- No browser environment: responsive verified by CSS math only; hydration/visual flash of the fallback list before client filter hydration not runtime-verified.
- `RelatedStudies` populated path unverifiable with current content (empty `related`).
- `?filter=`/`?page=` deep-link round-trip verified by code inspection, not by a running app.

## Verdict
✅ **PASS** — Round‑1 [MAJOR] (client-only list rendering / empty static HTML) is fixed and independently verified against the rebuilt `.next` artifacts (cards + `/case-studies/<slug>` links present in vi/en static HTML; route remains `●` SSG; no server-side `searchParams`). All round‑1 MINORs are resolved or explicitly accepted: `md:grid-cols-4`, single polite live region (`EmptyState announce={false}`, default preserved), no fabricated `datePublished`, MetaBar omits missing client. `npm run lint` / `typecheck` / `build` all pass (33/33; SSG routes confirmed). `test`/`migration` skipped per config. No CRITICAL/MAJOR findings; responsive gate has no FAIL.
