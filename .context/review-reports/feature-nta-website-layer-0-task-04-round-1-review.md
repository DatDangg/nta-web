# Review Report — feature nta-website · layer-0-task-04 (round 1)

Agent: reviewer

## Review level
`STRICT`

## Reason
Task is content-only (no auth/API/tenant/DB/payment), but the diff **modifies the shared content contract**
`src/content/types.ts` which every Layer-2 content page consumes, and adds all loader-consumed content
(`src/content/**`). A contract mismatch here can break multiple downstream pages silently, so the shared-contract
trigger makes STRICT the safer level. (Confirming evidence: the `gallery` type/content mismatch below is exactly
this class of defect and would not fail `build`/`typecheck`.)

## Blast radius
- `src/content/types.ts` — shared type contract for every content page (Layer 2).
- `src/content/**` — solutions (7×2), products (2×2), case-studies (2×2), blog (4×2), about (1×2), home.ts, overview.ts.
- `public/images/**` — placeholder assets referenced by content.
- Loaders `src/lib/content/*.ts` — read/validate the above at SSG time.
- No runtime/auth/DB/API surface touched.

## Verify commands + result
| Command | Result |
|---|---|
| `git status --short` / `git diff --stat` | **skip — Blocked**: shell permission denied (`Permission denied: shell`) |
| `npm run lint` | **skip** — shell denied; reviewed builder evidence only |
| `npm run typecheck` | **skip** — shell denied; reviewed builder evidence only |
| `npm run build` | **skip** — shell denied; reviewed builder evidence only |
| `test_command` | `null` → skip, not configured (per task file) |

Static review performed with Grep/Read on the working tree. See Residual risk.

## Requirements coverage (content count — actual)

| Group | VI | EN | Requirement | Status |
|---|---|---|---|---|
| home (`home.ts`) | 3 cards + 3 products + 1 case | same | ≥3 mảng, ≥3 product, ≥1 case | OK |
| about (`about.mdx`) | 1 | 1 | 5 khối (mission/capabilities/team/milestones/partners) | OK (4 capabilities) |
| solutions | 7 (`crm,hrm,lms,dentgo,boxai,flycam,custom-ai`) | 7 | 4 enterprise + 3 AI | OK |
| products | 2 (`music-app,hair-style-ai`) | 2 | ≥2 app, `downloadUrl: null` | OK |
| case studies | 2 (`oc-eo-learning,dental-clinic-operations`) | 2 | ≥2 | OK |
| blog | 4 | 4 | ≥3 posts | OK (count) |
| solution overview | 1 (`overview.ts`) | 1 | — | OK |

Copy-rule scans (grep over `src/content`):
- Em-dash `—` / middle-dot `·` / `TODO|lorem|ipsum|TBD|XXX`: **0 matches** → OK.
- ALL-CAPS có dấu (regex uppercase run ≥4 with Vietnamese diacritics): **0 matches** → OK.
- Fabricated numbers (`\d+(\.\d+)?%`, `99.9`, `100%`): **0 matches**. Both case-study `result` fields explicitly state no confirmed metrics → OK (no fabricated %).
- BR-004 anonymize: dental case uses "một phòng khám nha khoa tại Tây Nam Bộ" (VI) / "a dental clinic in the Mekong Delta" (EN), no real identity → OK.
- BR-003 (home 3 mảng): exactly 3 solution cards → OK.
- Asset existence: all `public/images/**` paths referenced by content exist → OK.

## Responsive Checklist Gate
N/A — diff touches only content (`src/content/**`) and static placeholder SVG assets under `public/images/**`;
no route/component/CSS/UI change in this task. No browser widths applicable.

## Skill gates
- `aislop`: **skip** — shell permission denied (cannot run `aislop scan --changes`).
- `oxlint` (anti-slop): **skip** — shell denied; repo also has no oxlint config (per task-03 notes).
- `ocr` (open-code-review): **skip** — shell denied / `ocr` not confirmed installed.
- AI-readable gate: **OK** — no AI-chaos indicators: files small (types.ts 57 lines, home.ts 40), no functions >50 lines,
  no magic numbers, no >3-step indirection, no WHAT-comments; naming self-descriptive.
- ai-friendly-web: **N/A** — no public deploy / web route change in this content task.
- blitzstrike: **skip** — not applicable (no auth/API/input attack surface) and shell denied.

## Findings

### [MAJOR] `CaseStudy.gallery` type does not match content shape (silent contract break)
- `src/content/types.ts:30` declares `gallery: string[]`.
- Content provides an array of objects:
  - `src/content/case-studies/vi/dental-clinic-operations.mdx:9-11` → `{ src, alt }`
  - `src/content/case-studies/vi/oc-eo-learning.mdx:9-11` → `{ src, alt }`
  - EN equivalents (`case-studies/en/*.mdx:9-11`) → `{ src, alt }`
- Loader `src/lib/content/load-mdx.ts:17-18` casts raw frontmatter `as T`, so neither `typecheck` nor `build`
  catches the mismatch. Design Screen 9 requires "gallery alt theo ảnh", i.e. per-image alt → object shape is correct,
  the **type is wrong**. Layer-2 `ImageGallery` mapping `gallery` as strings will pass an object to `src`/children
  → runtime error / broken image.
- Fix: change `CaseStudy.gallery` to `{ src: string; alt: string }[]` and update any consumer; do not downgrade
  content to `string[]` (would lose required alt).

### [MAJOR] EN solution `useCases` are untranslated generic duplicates across all 7 solutions
- All 7 EN files share identical use-cases `"Internal information lookup"` / `"Workflow support"`:
  `solutions/en/crm.mdx:14-15`, `hrm.mdx:14-15`, `lms.mdx:14-15`, `dentgo.mdx:14-15`,
  `boxai.mdx:14-15`, `flycam.mdx:14-15`, `custom-ai.mdx:14-15`.
- VI counterparts are specific and differ per solution, e.g. `solutions/vi/crm.mdx:14-15`
  ("Đội bán hàng B2B" / "Bộ phận chăm sóc khách hàng"), `solutions/vi/flycam.mdx:14-15`
  ("Khảo sát hiện trạng" / "Theo dõi khu vực cần kiểm tra"), `solutions/vi/custom-ai.mdx:14-15`
  ("Phân loại tài liệu" / "Tự động hóa tác vụ lặp lại").
- Violates design §1.7 "EN pattern: dịch sát nghĩa" and the task AC "Mọi copy đúng rules design §1.7";
  also an anti-slop duplication signal (same generic block on 7 pages).
- Fix: translate each VI `useCases` list to EN per solution.

### [MINOR] Banned slogan-equivalent "liền mạch" (Seamless)
- `src/content/solutions/vi/crm.mdx:12`: benefit "Phối hợp liền mạch giữa các nhóm".
- Design §1.7 (design-spec.md:80) bans empty slogans incl. "Seamless"; "liền mạch" is its VI equivalent.
- Fix: reword, e.g. "Phối hợp rõ ràng giữa các nhóm".

### [MINOR] `blog/first-steps` body too short for prose test
- `src/content/blog/vi/first-steps.mdx:10` and `src/content/blog/en/first-steps.mdx:10` contain a single
  sentence body, whereas the other 3 posts have 3-paragraph bodies (e.g. `blog/vi/digital-workflows.mdx:9-13`).
- Task-04 Description #4 requires body "đủ dài để test prose rendering". Count AC (≥3) still met via the other posts.
- Fix: expand the `first-steps` body to match sibling posts.

### [MINOR] Home product strip mixes a solution as "product"; no link target
- `src/content/home.ts:19` (VI) / `:32` (EN) add `BoxAI` as the 3rd `featuredProducts` entry. BoxAI is a
  solution (`src/content/solutions/**`, href `/solutions/ai`), not one of the 2 apps (`products/`). Chosen to meet
  "≥3 sản phẩm tiêu biểu" while R-07 only guarantees 2 apps — category mismatch.
- Also `HomeContent.featuredProducts` (`home.ts:5`) has no `slug`/`href`, so Layer-2 `ProductCard` cannot link to
  `/products/[slug]` without guessing.
- Fix: decide product-strip composition (add a real 3rd product or make the strip tolerate 2) and add `slug`/`href`.

### [MINOR] `about` partners placeholder defeats Screen 2 empty state
- `src/content/about/vi/about.mdx:21-22` / `about/en/about.mdx:21-22`: `partners` = one item with
  `logo: null` and placeholder name ("Đối tác sẽ được cập nhật..." / "Partner details will be added...").
- Design Screen 2 empty state says hide `PartnerLogos` when no partner/logo; a length-1 array prevents that and may
  render a fake partner entry.
- Fix: use `partners: []` until logos are confirmed (or ensure Layer 2 filters `logo === null`).

### [MINOR] Case-study `category` values do not match Screen 8 filter buckets
- Content sets industry values: `case-studies/vi/*.mdx:4` = "Giáo dục" / "Y tế" (EN "Education" / "Healthcare").
- Design Screen 8 FilterBar buckets = "Doanh nghiệp | AI | App AI" and Screen 9 MetaBar = "Khách hàng · Lĩnh vực · Năm".
  The single `category: string` field cannot serve both; a naive filter by category yields empty results.
- Fix: align `category` to the mảng buckets (enterprise/ai/app) and add a separate `sector`/`client` field for MetaBar
  (coordinate with Layer 2 tasks).

## Residual risk
- `npm run lint/typecheck/build` could **not** be re-run (shell permission denied); builder's PASS evidence is
  taken on trust. The MAJOR `gallery` mismatch would not be caught by these commands anyway (loader casts `as T`).
- Read-tool guardrail exceeded for this NORMAL/STRICT review (Grep/Glob/Read > cap) because content spans ~30 files;
  noted here instead of further retries. No unread area affected the findings above.
- `git diff` could not be produced (shell denied); review is based on the working tree + task file + design spec.
- Browser/manual rendering not run (not permitted); Layer-2 render behavior inferred from types + design spec.

## Verdict
❌ **FAIL** — 2 MAJOR (gallery type/content contract mismatch; untranslated duplicated EN solution use-cases).
Fix MAJOR findings, then re-run round 2 after `npm run typecheck` (ideally a loader smoke test that maps
`gallery` and `useCases`), and re-verify lint/typecheck/build.

Counts: CRITICAL 0 · MAJOR 2 · MINOR 6.
