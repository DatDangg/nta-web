# Review Report — feature nta-website · layer-0-task-04 (round 3)

Agent: reviewer

## Review level
`STRICT`

## Reason
Round 3 is the final verification after fix attempt 2 (add `slug` to 6 blog files). The lonely fix is
narrow, but it lands inside a **shared content contract** (`src/content/types.ts` + `src/lib/content/*`
loaders) consumed by every Layer-2 content page, and the loader casts `as T` — a contract mismatch is
silent and does **not** fail `lint`/`typecheck`/`build`. Round 1/2 were STRICT for the same reason and
surfaced exactly this defect class (`gallery`, missing `slug`). Keeping `STRICT` for consistency and
because the task diff still carries the shared `types.ts` change.

## Blast radius
- `src/content/types.ts` — shared type contract for all Layer-2 content pages.
- `src/content/**` — solutions (7×2), products (2×2), case-studies (2×2), blog (4×2), about (1×2),
  `home.ts`, `solutions/overview.ts`.
- `src/lib/content/*.ts` — loaders/validators run at SSG time (`load-mdx`, `posts`, `case-studies`,
  `solutions`, `products`, `about`, `slug`).
- `public/images/**` — placeholder SVGs referenced by content.
- No runtime/auth/DB/API/security surface touched.

## Verify commands + result
| Command | Result |
|---|---|
| `git status --short` / `git diff HEAD` | **skip — Blocked**: shell permission denied (`Permission denied: shell`). No retry per Tool Loop Guard. |
| `npm run lint` | **skip — Blocked**: shell denied; builder evidence only |
| `npm run typecheck` | **skip — Blocked**: shell denied; builder evidence only |
| `npm run build` | **skip — Blocked**: shell denied; builder evidence only |
| `test_command` | `null` → skip, not configured |

Builder evidence accepted (task file §Verification Summary, attempt 2): `npm run lint` PASS ·
`npm run typecheck` PASS · `npm run build` PASS (SSG 5/5); loader smoke returned 4 posts/locale with slugs
`first-steps, learning-content, responsible-ai, digital-workflows` and no exception. Static review of the
working tree performed with Grep/Read (could not diff against `9419440`). See Residual risk.

## Round-2 finding — resolution check

| # | Finding | Status | Evidence (static, working tree) |
|---|---|---|---|
| MAJOR 1 | 6 blog files missing loader-required `slug` → `getAllPosts` would throw | **FIXED** | `^slug:` matched in **all 8** `blog/{vi,en}/*.mdx` at line 2, each equal to its filename: `first-steps`, `learning-content`, `responsible-ai`, `digital-workflows`. `posts.ts:7` requires `['slug','title','date','category','excerpt','cover','body']`; all other required keys present in all 8 files (grep of `^(title\|date\|category\|excerpt\|cover):` → 8×5 hits); `body` is always set by `load-mdx.ts:17`. → `getAllPosts(locale)` cannot throw on missing fields for either locale; `Post.slug` valid and unique. |
| MINOR 2 | Home product strip 2 items vs Screen 1 "≥3–4" | Documented deviation (not a defect) | `home.ts:16-19` (VI) / `:28-31` (EN) keep only the 2 real apps with `slug`. Task file Notes explicitly records the deviation and the Layer-2 obligation (render 2-item strip, degrade `arrow/dots`). Per round-3 instruction, a documented MINOR does not block PASS. |

## Round-3 regression checks (no new regression found)

1. **`CaseStudy.gallery` contract** — `types.ts:32` = `{ src: string; alt: string }[]`; all 4 case files
   use object shape (`case-studies/{vi,en}/*.mdx:11-13`). ✓
2. **EN solution `useCases` remain distinct** — all 7 EN solutions have solution-specific lists:
   crm `B2B sales teams`/`Customer service departments`, hrm `Human resources departments`/`Businesses with
   multiple teams`, lms `Internal staff training`/`Online learning programs`, dentgo `Dental clinics`/
   `Practices with multiple treatment schedules`, boxai `Searching internal procedures`/`Supporting new
   employees`, flycam `Site surveys`/`Monitoring areas that need inspection`, custom-ai `Document
   classification`/`Automating repetitive tasks`. ✓
3. **`home.ts` / about / case `sector`/`client` match content** — `HomeContent.featuredProducts` items carry
   `slug` matching product filenames (`music-app`, `hair-style-ai`); `featuredCase.href`
   `/case-studies/oc-eo-learning` matches case slug `oc-eo-learning`. `about/{vi,en}` have exactly the 5
   `AboutData` blocks (mission, capabilities×4, team×2, milestones×2, partners `[]`). Cases:
   `category: enterprise`, `sector` (`Giáo dục`/`Y tế` · `Education`/`Healthcare`), anonymized `client`
   present — matches `types.ts:26-27`. ✓
4. **Content counts** — solutions 7×2, products 2×2, case-studies 2×2, blog 4×2 (≥3), about 1×2, home. ✓
5. **Product contract** — both products have filename-matching `slug`, `screenshots`, `downloadUrl: null`. ✓
6. **Copy rules** — grep across `src/content` for `—` / `·` / `TODO|lorem|ipsum|TBD|XXX` / `99.9` / `100%` /
   `liền mạch|seamless` → **0 matches**. Both case `result` fields state no confirmed metrics (no fabricated
   %). **BR-003** (exactly 3 home solution cards — `home.ts:11-15` / `:23-27`) OK. **BR-004** (anonymized
   clients, no real identity) OK. ✓

## Responsive Checklist Gate
**N/A** — the fix attempt and the task diff touch only content (`src/content/**`) and static placeholder
SVGs (`public/images/**`); no route/component/CSS change. No browser widths applicable.

## Skill gates
- `aislop`: **skip** — shell permission denied (cannot run `aislop scan --changes --json`).
- `oxlint` (anti-slop): **skip** — shell denied; repo has no oxlint config (per task-03 / round-2 notes).
- `ocr` (open-code-review): **skip** — shell denied / `ocr` not confirmed installed.
- AI-readable gate: **OK** — content-only; files small (`types.ts` 59, `home.ts` 38, `overview.ts` 24);
  no function >50 lines, no >3-step indirection, no magic numbers, no WHAT-comments; filenames/slugs
  self-descriptive and filename-consistent; no README/ARCHITECTURE update needed (content-only).
- ai-friendly-web: **N/A** — no public deploy / web route change.
- blitzstrike: **skip** — no auth/API/input attack surface; shell denied.

## Findings
No CRITICAL or MAJOR defects remain. The round-2 MAJOR is confirmed fixed.

- **[MINOR] (documented, non-blocking)** Home product strip has 2 items vs Screen 1 "≥3–4 ProductCard" /
  task Description "≥3 sản phẩm tiêu biểu". `home.ts:16-19` / `:28-31`. R-07 only guarantees 2 real apps and
  adding a fake 3rd violates anti-slop rules. Deviation is recorded in `tasks/nta-website/layer-0-task-04.md`
  Notes (line 90-91) with the Layer-2 obligation. Flag for awareness only; design owner should ratify 2 vs
  "≥3" later.

## Residual risk
- `git status` / `git diff HEAD` vs `9419440` could not be produced (shell denied). Review is based on the
  current working tree + task file + round-1/2 reports; the "no regression" claim rests on static reads of
  the working tree, not a diff.
- `npm run lint` / `npm run typecheck` / `npm run build` could not be re-run (shell denied); builder PASS
  evidence is taken on trust. If re-run they would not catch a content/type cast gap anyway (loader casts
  `as T`, no Layer-2 blog/case route wired yet).
- Read-tool budget (STRICT cap 25) reached before re-reading the remaining loaders
  (`case-studies.ts`, `solutions.ts`, `products.ts`, `about.ts`, `slug.ts`) and the 3 new blog **bodies**.
  These were unchanged by fix attempt 2 (only the 6 frontmatters gained `slug`) and were validated in
  round 2; bodies of the 3 new posts were accepted in round 2 (only `first-steps` body was previously
  flagged, now fixed to 3 paragraphs). Low risk, but not re-confirmed line-by-line this round.
- Manual/browser rendering not run (not permitted); Layer-2 render behavior inferred from design spec.

## Verdict
✅ **PASS** — the round-2 MAJOR (6 blog files missing `slug`) is fully fixed: all 8 `blog/{vi,en}/*.mdx`
carry a filename-matching `slug`, so `getAllPosts(locale)` returns 4 posts per locale without throwing and
`Post.slug` is valid. No regression found across `gallery`, EN `useCases`, `home.ts`/about/case fields, or
content counts; copy rules clean; BR-003/BR-004 OK. The only remaining item is the documented home-strip
MINOR, which per round-3 instructions does not block PASS.

Counts: CRITICAL 0 · MAJOR 0 · MINOR 1.
