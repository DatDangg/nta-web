# Review — feature/nta-website · layer-2-task-06 (round 1)

Agent: reviewer

## Review level
`NORMAL`

## Reason
- Static content-driven task, `db_tool: none`, no auth/RBAC/tenant/schema/migration, no payment.
- No hidden client data fetch: grep of `src/components/case-studies` for `fetch(|axios|XMLHttpRequest|useSWR|react-query` → 0 matches. No STRICT escalation trigger found.
- However, a blocking server-rendering/SEO defect was found (see MAJOR), so verdict is FAIL regardless of level.

## Blast radius
- Routes: `/[locale]/case-studies` and `/[locale]/case-studies/[slug]` (vi + en) — 2 list + 4 detail SSG routes.
- Shared components reused: `FilterBar`, `Pagination`, `EmptyState`, `CaseStudyCard`, `PageHeader`, `Breadcrumb`, `CTABanner` (each consumed by sibling pages too — but only case-studies uses the `useSearchParams` pattern).
- i18n namespace `caseStudies.*` (vi/en).
- Content frontmatter `src/content/case-studies/{vi,en}/*.mdx`.

## Verify commands + result
| Command | Result |
|---|---|
| `npm run lint` | ✅ PASS (`eslint .`, no errors) |
| `npm run typecheck` | ✅ PASS (`tsc --noEmit`, no errors) |
| `npm run build` | ✅ PASS — 33/33 static pages generated; SSG routes: `/vi/case-studies`, `/en/case-studies`, `/vi/case-studies/dental-clinic-operations`, `/vi/case-studies/oc-eo-learning`, `/en/case-studies/dental-clinic-operations`, `/en/case-studies/oc-eo-learning` |
| `test` | skip — `test_command: null` (project-config) |
| `migration` | skip — `db_tool: none` |

Note: the first shell call (a compound `git status && node -e ...`) was rejected by the reviewer bash allowlist; the profile-allowlisted commands above were then run individually. `git status --short` confirms the task files are untracked/new as expected (`src/app/[locale]/case-studies/`, `src/components/case-studies/`, modified `src/i18n/messages/{vi,en}.json`).

## Responsive Checklist Gate (diff touches UI → MANDATORY)
Verified at 375 / 768 / 1280 (Tailwind breakpoints from `project-config.ui`), via CSS math (no browser available).

| Item | Result | Evidence |
|---|---|---|
| Layout — no horizontal scroll, mobile-first, container | **OK** | List grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (CaseStudyFilter.tsx:47); gallery `grid-cols-1 md:grid-cols-2 xl:grid-cols-3` (ImageGallery.tsx:8); MetaBar `grid-cols-1 … sm:grid-cols-3 md:flex md:flex-wrap` (MetaBar.tsx:7); container `max-w-container px-4 sm:px-6 lg:px-8` (no fixed px). FilterBar scrolls internally on mobile (`overflow-x-auto snap-x`) and wraps at `md` (FilterBar.tsx:20) — no page-level overflow. Grids use breakpoint column counts (not auto-fit/minmax), but that matches design Screens 8/9 exactly. |
| Typography/Spacing | **OK** | Token utility classes only (`text-display/h2/h3/body-lg/sm`) — no inline `px` font sizes in the diff. |
| Media | **OK** | `next/image` with explicit `width`/`height` + `h-auto w-full` + `sizes` (ImageGallery.tsx:8, CaseStudyCard.tsx:19). No video/embed. |
| Touch/Interaction ≥44px | **OK** | Filter pills `min-h-11` (44px) (FilterBar.tsx:27); pagination `min-h-11 min-w-11` (Pagination.tsx:36,40,43); breadcrumb links `min-h-11`. No tables. |
| Viewport/A11y | **OK** | No `100vh`; no animation in this diff (Reveal not used) so `prefers-reduced-motion` is N/A; no `overflow:hidden` masking errors (`overflow-x-auto` is intentional internal scroll). |
| Browser verification | **Residual risk** | No browser environment; responsive validated by CSS math only. |

No responsive checklist item FAILs. One spec-fidelity deviation (Result block breakpoint) is recorded as MINOR below.

## Skill gates
| Gate | Result | Evidence |
|---|---|---|
| `aislop` | **skip, aislop not installed** | `aislop scan --changes --json` → `command not found` (exit 127) |
| anti-slop / `oxlint` | **skip, oxlint not configured** | no `.oxlintrc*`/oxlint config; binary not in `node_modules/.bin` |
| `ocr` (open-code-review) | **skip, ocr not installed** | `ocr --version` → `command not found` (exit 127) |
| AI-readable codebase | **OK** | All new files < 300 lines, functions < 50 lines, self-descriptive names; no ≥3 AI-chaos indicators (only a dense single-line-JSX style consistent with the rest of the repo) |
| ai-friendly-web | **N/A** | Public site, but `sitemap.xml`/`robots.txt`/`llms.txt` are explicitly scoped to layer-4-task-01 (SEO task) and are not in task-06's file list |
| blitzstrike pentest | **N/A** | NORMAL task, no public API/auth/input attack surface |

## Findings

### [MAJOR] Case-studies list content is client-only rendered — static HTML has no cards/links
- **Where:** `src/components/case-studies/CaseStudyFilter.tsx:25-26` (`useSearchParams`) combined with the Suspense wrapper in `src/app/[locale]/case-studies/page.tsx:27`.
- **Evidence (built artifacts):** `.next/server/app/vi/case-studies.html` contains the server shell (`aria-label="Case study"` section + `h1`) but **not** the client subtree classes — `snap-x snap-mandatory` (FilterBar) and `text-h3 font-semibold leading-tight` (CaseStudyCard) are **absent**. Both strings are present in `.next/server/app/vi.html` (where cards are server-rendered), proving the grep is valid and the list subtree is missing. Same structure for `.next/server/app/en/case-studies.html`.
- **Root cause:** `useSearchParams()` in a Client Component during static rendering de-opts the Client Component tree up to the closest `<Suspense>` boundary to client-side rendering; the boundary has no `fallback`, so the prerendered HTML for the list is empty.
- **Impact:** Both locales' list HTML contain zero case-study content/links (and no JSON-LD ItemList). No-JS users, non-JS crawlers, AI crawlers, and link/social previews see an empty page. This contradicts task line 47 ("list đã render từ server") and R-21 / design §1.8 SSG+SEO intent.
- **Suggested fix:** Keep the default (`filter=all`, page 1) grid server-rendered and hydrate filtering as an enhancement — e.g. render the initial `<ul>` in the server page and have the client component only toggle visibility/update the URL, or read `useSearchParams` in a small client child while the card list itself is rendered by a server component; add a `<noscript>` fallback listing all cases.

### [MINOR] `RelatedStudies` never exercised
- `src/content/case-studies/{vi,en}/*.mdx` both set `related: []`, so `RelatedStudies.tsx:7` always returns `null` even though the task AC lists "Related" as part of the detail page. Recommend cross-linking the two cases so the empty-vs-populated path is demonstrable.

### [MINOR] Result metrics breakpoint deviates from design
- `ResultBlock.tsx:5` uses `lg:grid-cols-4`; design Screen 9 specifies 4 columns at `md` (≥768). No overflow, cosmetic fidelity only.

### [MINOR] Duplicate polite live regions when filter is empty
- `FilterBar.tsx:33` (`role="status"` result count) and `EmptyState.tsx:10` (`aria-live="polite"`) both announce; screen readers may hear two updates. Consider one live region.

### [MINOR] Fabricated `datePublished`
- `src/app/[locale]/case-studies/[slug]/page.tsx:44` sets `datePublished: ${study.year}-01-01` — not a real publish date. Use a real date field or omit.

### [MINOR] Misleading MetaBar fallback
- `MetaBar.tsx:11` falls back to `item.value ?? 'NTA'`, which would display "NTA" as the *client* when data is missing. Prefer omitting the field or "-".

### [OBSERVATION] JSON-LD coverage
- List page has no JSON-LD (design Screen 8: BreadcrumbList + ItemList) and detail lacks BreadcrumbList (only Article). This is the known baseline; the SEO/JSON-LD audit is layer-4-task-01. Not counted.

## Residual risks
- NORMAL read-tool cap (15) was exceeded during investigation; sibling pages and the `en` HTML were not exhaustively inspected (identical components make the same result highly likely).
- No browser environment: responsive behavior verified by CSS math only.

## Verdict
❌ **FAIL** — 1 blocking **[MAJOR]** (case-studies list content is client-only rendered; static HTML is empty, defeating the server-rendered-list requirement and R-21 SEO intent). All explicit functional acceptance criteria (client filter without reload, `aria-pressed`, `role="status"`, `?filter=` preserved on `?page=`, pagination `aria-current`, pageSize 9/hidden ≤9, EmptyState + clear filter, MetaBar `<dl>`, hidden gallery/related, slug → 404, BR-004 anonymization, no fabricated metrics, single `<main>`, i18n-only copy, no double `/en`) pass; lint/typecheck/build pass. Fix the MAJOR (and ideally the MINORs) and re-run reviewer round 2.
