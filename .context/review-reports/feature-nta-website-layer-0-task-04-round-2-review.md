# Review Report — feature nta-website · layer-0-task-04 (round 2)

Agent: reviewer

## Review level
`STRICT`

## Reason
Content-only task, but the diff still **modifies the shared contract** `src/content/types.ts`
(consumed by every Layer-2 content page) and defines all loader-consumed content under `src/content/**`.
A contract mismatch is silent (`load-mdx.ts` casts `as T`) and does not fail `lint`/`typecheck`/`build`,
so a shared-contract review carries more weight than a plain content check. Round 1 was STRICT for the same
reason and surfaced exactly this class of defect (`gallery` type vs content).

## Blast radius
- `src/content/types.ts` — shared type contract for all Layer-2 content pages.
- `src/content/**` — solutions (7×2), products (2×2), case-studies (2×2), blog (4×2), about (1×2), `home.ts`, `solutions/overview.ts`.
- `src/lib/content/*.ts` — loaders/validators at SSG time (`load-mdx`, `posts`, `case-studies`, `solutions`, `products`, `about`, `slug`).
- `public/images/**` — placeholder SVGs referenced by content.
- No runtime/auth/DB/API/security surface touched.

## Verify commands + result
| Command | Result |
|---|---|
| `git status --short` / `git diff HEAD` | **skip — Blocked**: shell permission denied (`Permission denied: shell`) |
| `npm run lint` | **skip — Blocked**: shell denied; copied builder evidence only |
| `npm run typecheck` | **skip — Blocked**: shell denied; copied builder evidence only |
| `npm run build` | **skip — Blocked**: shell denied; copied builder evidence only |
| `test_command` | `null` → skip, not configured |

Static review performed with Grep/Read on the working tree (I could not diff against `9419440`).
See Residual risk.

## Round-1 findings — resolution check

| # | Finding | Status | Evidence |
|---|---|---|---|
| MAJOR 1 | `CaseStudy.gallery` type `string[]` vs content `{src,alt}` | **FIXED** | `src/content/types.ts:32` = `{ src: string; alt: string }[]`; all 4 case files use object shape (`case-studies/{vi,en}/*.mdx:11-13`); no consumer assumes `string[]` (grep `gallery` → only loader `case-studies.ts:6` + types + content). |
| MAJOR 2 | EN solution `useCases` untranslated generic duplicates | **FIXED** | 7 EN solutions now have distinct, solution-specific lists: crm `B2B sales teams`/`Customer service departments`, hrm `Human resources departments`/`Businesses with multiple teams`, lms `Internal staff training`/`Online learning programs`, dentgo `Dental clinics`/`Practices with multiple treatment schedules`, boxai `Searching internal procedures`/`Supporting new employees`, flycam `Site surveys`/`Monitoring areas that need inspection`, custom-ai `Document classification`/`Automating repetitive tasks` — each translates its VI counterpart. |
| MINOR 3 | Banned slogan "liền mạch" (Seamless) in CRM VI | **FIXED** | `solutions/vi/crm.mdx:12` now "Phân công rõ ràng giữa các nhóm". Full content scan for `—`/`·`/`TODO`/`lorem`/`TBD`/`99.9`/`100%` → 0 matches. |
| MINOR 4 | `blog/first-steps` body too short | **FIXED** | `blog/{vi,en}/first-steps.mdx:10-14` now 3 paragraphs, matching sibling posts. |
| MINOR 5 | Home product strip mixed a solution (BoxAI) and had no link target | **FIXED** (with a remaining deviation, see MINOR 2) | `home.ts:16-19` (VI) / `:28-31` (EN) now contain only the 2 real apps with `slug`; no BoxAI; type `HomeContent.featuredProducts` (`home.ts:5`) matches content. |
| MINOR 6 | `about` partners placeholder defeats empty state | **FIXED** | `about/{vi,en}/about.mdx:20` = `partners: []`; `AboutData.partners` type unchanged. |
| MINOR 7 | Case `category` did not match Screen 8 buckets | **FIXED** | Both cases `category: enterprise`; `sector` (`Y tế`/`Giáo dục` — `Healthcare`/`Education`) and anonymized `client` added (`case-studies/{vi,en}/*.mdx:4-6`); `CaseStudy` type has `sector?`/`client?` (`types.ts:26-27`); BR-004 preserved (no real identity). |

## Requirements coverage (content count — actual)

| Group | VI | EN | Requirement | Status |
|---|---|---|---|---|
| home (`home.ts`) | 3 cards + 2 products + 1 case | same | 3 mảng, product strip, 1 case | OK (strip = 2, see MINOR 2) |
| about (`about.mdx`) | 1 | 1 | 5 khối | OK |
| solutions (detail) | 7 | 7 | 4 enterprise + 3 AI | OK |
| products | 2 | 2 | ≥2 app, `downloadUrl: null` | OK |
| case studies | 2 | 2 | ≥2 | OK |
| blog | 4 | 4 | ≥3 posts | count OK — but 6/8 files missing `slug` (see MAJOR 1) |

Copy rules (grep over `src/content`): em-dash `—` / middle-dot `·` / `TODO|lorem|ipsum|TBD|XXX` / `99.9` / `100%`
→ **0 matches** → OK. Both case `result` fields state no confirmed metrics → no fabricated %. BR-003 (exactly 3 solution cards) OK. BR-004 anonymize OK. All `public/images/**` paths referenced by content exist.

## Responsive Checklist Gate
**N/A** — the diff touches only content (`src/content/**`) and static placeholder SVGs (`public/images/**`);
no route/component/CSS change in this task. No browser widths applicable.

## Skill gates
- `aislop`: **skip** — shell permission denied (cannot run `aislop scan --changes --json`).
- `oxlint` (anti-slop): **skip** — shell denied; repo has no oxlint config (per task-03 notes).
- `ocr` (open-code-review): **skip** — shell denied / `ocr` not confirmed installed.
- AI-readable gate: **OK** — files small (types.ts 59, home.ts 38), no function >50 lines, no >3-step indirection,
  no magic numbers, no WHAT-comments; naming self-descriptive; no README/ARCHITECTURE update needed (content-only).
- ai-friendly-web: **N/A** — no public deploy / web route change.
- blitzstrike: **skip** — no auth/API/input attack surface; shell denied.

## Findings

### [MAJOR] 6 blog content files missing the loader-required `slug` field
- `src/lib/content/posts.ts:7` calls `assertRequiredFields(post, ['slug', 'title', 'date', 'category', 'excerpt', 'cover', 'body'], ...)`,
  and `src/lib/content/load-mdx.ts:16-17` only spreads raw frontmatter (`{ ...data, body }`) — it never derives
  `slug` from the file name.
- These blog files have **no `slug`** in frontmatter:
  - `src/content/blog/vi/learning-content.mdx`
  - `src/content/blog/vi/responsible-ai.mdx`
  - `src/content/blog/vi/digital-workflows.mdx`
  - `src/content/blog/en/learning-content.mdx`
  - `src/content/blog/en/responsible-ai.mdx`
  - `src/content/blog/en/digital-workflows.mdx`
  (Only `blog/{vi,en}/first-steps.mdx:2` has `slug`.)
- Impact: `getAllPosts(locale)` → `assertRequiredFields` **throws** (`slug` is `undefined`), so Screen 10 `/blog`
  and Screen 11 `/blog/[slug]` (both required routes, R-09) will fail at build time when Layer 2 wires them.
  The loader's cast `as T` means `lint`/`typecheck`/`build` do **not** catch it today (no blog route exists yet),
  which is why the current green build does not refute this.
- This violates the task AC "Loader-required frontmatter được kiểm tra" and `Post.slug: string` (`types.ts:38`).
  Round-1 task-03 delivered a single blog fixture; these 3×2 posts were added by task-04.
- Fix (pick one, prefer the first — content is the task-04 deliverable):
  1. Add `slug: learning-content` / `slug: responsible-ai` / `slug: digital-workflows` to the 6 files above; **or**
  2. Change the loader to derive `slug` from the file name (then drop the `slug` requirement in `posts.ts`),
     and make `first-steps.mdx` consistent with that convention.

### [MINOR] Home product strip has 2 items vs Screen 1 "≥3–4 ProductCard" / task Description "≥3 sản phẩm tiêu biểu"
- `home.ts:16-19` / `:28-31` list only `music-app` and `hair-style-ai`.
- Round-1 explicitly allowed "make the strip tolerate 2" and R-07 only guarantees 2 apps, so adding a fake 3rd
  product would violate anti-slop rules; the current 2-item strip is a pragmatic, documented deviation
  (`tasks/nta-website/layer-0-task-04.md:86`).
- Flag for awareness: Layer 2 must render a 2-item strip (Screen 1's arrow/dots must degrade gracefully),
  and the design owner should ratify 2 vs "≥3" (or add a real 3rd product later).

## Residual risk
- `npm run lint` / `npm run typecheck` / `npm run build` could **not** be re-run (shell permission denied);
  builder's PASS evidence is taken on trust. Even if run, they would not catch the MAJOR `slug` gap
  (no blog route wired + loader casts `as T`).
- `git status` / `git diff HEAD` vs `9419440` could not be produced (shell denied); review is based on the
  current working tree + task file + design spec, and on the round-1 report as baseline.
- Read-tool budget (STRICT cap 25) was used carefully; content spans ~35 files, all loader-required groups
  were read. Browser/manual rendering not run (not permitted); Layer-2 render behavior inferred from design spec.

## Verdict
❌ **FAIL** — 1 MAJOR (6 blog files missing loader-required `slug` → `getAllPosts` throws / `/blog` and
`/blog/[slug]` cannot build). All 7 round-1 findings (2 MAJOR + 6 MINOR) are confirmed fixed.
Add `slug` to the 6 blog frontmatters (or derive slug from filename in the loader) and re-run
`npm run lint` / `npm run typecheck` / `npm run build`.

Counts: CRITICAL 0 · MAJOR 1 · MINOR 1.
