# Review — feature nta-website · layer-4-task-02 (round 1)

Agent: reviewer
Date: 2026-10-09
Task: `tasks/nta-website/layer-4-task-02.md` — Performance: next/image audit + font + bundle
HEAD base: `92f5a92` (uncommitted diff)

## Review level

**STRICT** (escalated from task-expected NORMAL).

## Reason

Task self-classifies NORMAL (perf tuning, no auth/data/API contract). However the diff
touches the **global locale layout** (`src/app/[locale]/layout.tsx`, render path for *every*
route) and a **shared MDX render component** (`src/components/mdx/index.tsx`, used by blog
detail + case-study content), plus global `next.config.ts`. Reviewer rules put
"shared service/hook/**component**/... " and cross-cutting render path in the STRICT bucket,
so I escalated to STRICT. No auth/tenant/schema/payment surface → no red-zone risk beyond
shared-component blast radius. Scope is narrow and additive.

## Blast radius

- All routes (2 locales): `<html className={inter.variable}>` changes global font variable.
- All MDX content (blog `[slug]`, any MDX body): `ArticleImage` render path.
- All images served through the Next image optimizer: `next.config.ts` `images.formats`.
- Indirect: Tailwind `font-sans` (`var(--font-sans)` → `var(--font-inter)`) for every page.

## Verify commands + result

Shell access was **denied** in this reviewer environment (`permission.rejected` on the first
`git status`/`git diff` call). Per Tool Loop Guard I did **not** retry; verification moved to
Read/Grep/Glob. Therefore:

- `npm run lint` → **Blocked** (shell denied; not re-run). Primary evidence: 0 error / 1 warn `<img>`.
- `npm run typecheck` → **Blocked** (shell denied; not re-run). Primary evidence: PASS.
- `npm run build` → **Blocked** (shell denied; not re-run). Primary evidence: PASS.
- `browser.trace` / Lighthouse (LCP, CLS, Performance score) → **Blocked**, see below.

Static cross-check done instead (all OK):
- Font is actually wired: `src/app/globals.css:29` defines `--font-sans: var(--font-inter, Inter), ...`,
  `tailwind.config.ts:39` maps `fontFamily.sans = ['var(--font-sans)']`; Tailwind preflight applies it
  on `html`. `inter.variable` sets `--font-inter` on `<html>` (`layout.tsx:50`) → Inter resolves.
  `display: 'swap'` set (`layout.tsx:14`) → no FOIT. `subsets: ['latin','vietnamese']` (`layout.tsx:13`).
- No `<link>` to Google Fonts anywhere (grep: 0 hits) → next/font self-host build-time. OK.
- Hero `priority`: single occurrence in repo (`src/components/home/Hero.tsx:26`), Hero used only by
  home (`src/app/[locale]/page.tsx:48`) → exactly 1 priority image/page. OK.
- Raw `<img>`: only the MDX fallback (`mdx/index.tsx:25`) — documented reason; all other usages use
  `next/image`. OK.
- `next.config.ts` valid `NextConfig` (`images.formats` only). No remotePatterns needed (local assets). OK.
- `<html className>` does not touch `generateMetadata` (layout.tsx:19-30) or JSON-LD scripts
  (layout.tsx:52-54). No functional regression observed in source.

## Responsive Checklist Gate

Diff touches UI (image `className`) → gate applies.

- Layout (no horizontal overflow): **OK** — image classes use `w-full h-auto` (`mdx/index.tsx:19,25`);
  next/image branch passes numeric width/height. No fixed-px container introduced.
- Typography/Spacing: **N/A** — no font-size/spacing values changed by this diff (font family only;
  `--font-sans` fallback chain unchanged from `globals.css`).
- Media (max-width/aspect/srcset): **OK** — `max-w`-equivalent via `w-full`, `h-auto`, `aspect-auto`;
  preserved `rounded-md`. `sizes` present. (MDX raster `sizes` accuracy → MINOR-1.)
- Touch/Interaction: **N/A** — no interactive/touch targets changed.
- Viewport/A11y (`100vh`, reduced-motion, overflow-hidden hiding errors): **N/A** — not touched.
- Breakpoint widths 375/768/1280: no browser environment available; verified by CSS math only
  (`w-full` + `max-w` prose container cannot overflow; no fixed px). Unverified rendering noted in
  Residual risk.

## Skill gates

- aislop: **skip, shell permission denied** (cannot run `aislop scan --changes --json`).
- oxlint (anti-slop): **skip, oxlint not configured** — repo uses eslint (`package.json` lint = `eslint .`);
  no `.oxlintrc*` present. Not a workflow failure.
- ocr (open-code-review): **skip, shell permission denied** (cannot execute `ocr`).
- AI-readable codebase: **OK** — files 41/67/9 lines, functions < 50 lines; the only comment
  (`mdx/index.tsx:24`) explains WHY (dimension-less Markdown images), not WHAT; names self-descriptive;
  no magic numbers. 0 chaos indicators.
- ai-friendly-web: **OK** — `public/llms.txt`, `src/app/robots.ts`, `src/app/sitemap.ts` all present.
- blitzstrike: **N/A** — perf task, no auth/API-public/input attack surface; no pentest env.

## Findings

### [MINOR-1] MDX next/image `sizes="100vw"` over-declares rendered width
`src/components/mdx/index.tsx:16` — article body is constrained (`prose max-w-[720px]`,
design §Screen 11), but `sizes="100vw"` tells the browser the image spans the full viewport.
For raster MDX images this makes the optimizer/srcset pick a larger candidate than actually
rendered (extra bytes). No current measurable impact because all content images are SVG
(optimizer passthrough), but it is a latent perf/spec mismatch ("sizes khớp layout grid").
Fix: use `sizes="(min-width: 1024px) 720px, 100vw"`, or render with `fill` inside the 720px
prose container.

### [MINOR-2] Default `alt=''` silently masks missing content alt
`src/components/mdx/index.tsx:13,25` — `alt={props.alt ?? ''}` makes an author-omitted alt
indistinguishable from an intentional decorative image for content images (design §1.6 expects
descriptive alt for content). Not a blocker (next/image requires alt, empty is the standard safe
default), but consider a dev-time warning when MDX content image lacks alt.

### [MINOR-3] Loose spread of `ComponentProps<'img'>` into `next/image`
`src/components/mdx/index.tsx:11-20` — `{...props}` forwards arbitrary img-only attributes
(e.g. `decoding`, `srcSet`, `color`) to the DOM via next/image's rest spread. Explicit
`width/height/src/alt/loading/className` are placed *after* the spread (correct order), so required
props and safety guards hold; typecheck reportedly passes. Nit-level type looseness only; destructure
the known props if you want tighter typing.

### Observation (not a defect): Lighthouse Performance score / LCP / CLS unverified
Task AC requires Lighthouse Performance ≥ 90 and LCP < 2.5s with evidence. Builder recorded
`Blocked` (environment Lighthouse only audits a11y/SEO/best-practices; no perf benchmark) and
measured `browser.trace` = 0 longTasks/0 longTaskBlocking on 3 pages. The task Notes explicitly
allow `Blocked + lý do` when the environment lacks a perf benchmark, so this is accepted as a
task-permitted gap — **but the headline performance goal remains unproven by any score**. Recommend
measuring on a real browser (local throttled or PageSpeed Insights against staging) before the
DevOps/production gate rather than treating task-02's perf goal as demonstrated.

## Residual risk

- Could not independently re-run `lint` / `typecheck` / `build` (shell denied) — relied on primary
  evidence. Type-safety of the MDX `{...props}` spread into `next/image` is asserted, not re-verified.
- No browser/Lighthouse environment → responsive rendering at 375/768/1280 and LCP/CLS not
  independently observed.
- Full diff not inspectable via `git diff` (shell denied); review is based on the 3 stated files
  read directly. If any other file was modified in this task, it was not reviewed.
- `next/font/google` requires network at build time (primary built successfully; noted for CI/Cloud Run).
- `next.config` `formats: ['image/avif','image/webp']` is a no-op for the current all-SVG content
  (harmless; benefits future raster assets).

## Verdict

**✅ PASS** — no CRITICAL/MAJOR defects found. Only MINOR findings, which are non-blocking.
Check-command and Lighthouse evidence are `Blocked` by reviewer shell/environment constraints
(not a code defect); performance score should be confirmed in a real browser before the
DevOps/production gate.
