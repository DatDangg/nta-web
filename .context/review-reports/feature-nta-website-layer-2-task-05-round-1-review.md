# Review — feature/nta-website · layer-2-task-05 (Screen 7 `/products`) · round-1

Agent: reviewer

- **Work item:** `feature/nta-website` — Task `layer-2-task-05`
- **Scope under review:** `src/app/[locale]/products/page.tsx`, `src/components/products/ScreenshotCarousel.tsx`,
  `src/components/products/DownloadLinks.tsx`, `src/i18n/messages/{vi,en}.json` (`products.*`)
- **Review level:** `NORMAL`
- **Reason:** single static route, no auth/tenant/schema/API/DB (`db_tool: none`), one client-leaf component
  (carousel). No red-risk trigger → not STRICT. Touches shared primitives composition + i18n, so not FAST.
- **Blast radius:** route `/products` (VI + EN); new page-local components; `products.*` i18n namespace;
  depends on shared `AppCard` / `PageHeader` / `CTABanner` / `Reveal` and `lib/content/products`. No shared
  component is modified, so blast radius is contained to this route.

## Verify commands + result

| Command | Result |
|---|---|
| `npm run lint` | **Blocked** — `shell` tool denied (`permission.rejected: Permission denied: shell`). Per Tool Loop Guard: stopped after first denial, no retry, no variant. |
| `npm run typecheck` | **Blocked** (same shell denial) |
| `npm run build` | **Blocked** (same shell denial) — SSG route list not obtainable |
| `test_command: null` | skip, no test framework configured (`project-config.md` L36/L86) |
| `aislop scan --changes --json` | skip, shell denied (not run) |
| `npx oxlint` | skip, shell denied / no oxlint config observed |
| `ocr` | skip, shell denied (not run) |

> Independent runtime/build verification could **not** be performed (all shell access denied). Findings below are
> from **static review** of code + content + config. This is recorded as residual risk; the task's DoD
> ("check commands pass") is **unverified by the reviewer**.

## Findings

### [MAJOR] Duplicate screenshot rendered twice per card (AppCard image + carousel slide #1)

- **Evidence:** `src/components/cards/AppCard.tsx:14,18` renders `product.screenshots[0]` as the card image.
  `src/app/[locale]/products/page.tsx:49-65` passes a `ScreenshotCarousel` whose `screenshots={product.screenshots}`
  (all screenshots, including `[0]`) into the `downloadLinks` slot. `ScreenshotCarousel.tsx:60-68` maps over the
  full list. Content: each product has exactly **one** screenshot
  (`src/content/products/vi/music-app.mdx:5-7`, `.../hair-style-ai.mdx:5-7`). Result: the same image is displayed
  twice on every card, and the carousel is a 1-slide redundant clone of the AppCard image (duplicate `alt` =
  duplicate screen-reader announcement).
- **Impact:** user-visible visual duplication on both cards; deviates from design Screen 7 (a single screenshot
  area per card + carousel as that area).
- **Suggested fix:** when a carousel is provided, do not also render AppCard's built-in image (add an
  AppCard variant/prop, e.g. `media`/`showImage=false`), or pass only `screenshots.slice(1)` to the carousel.
  Prefer giving AppCard a media slot so the carousel becomes the card's screenshot region.

### [MAJOR] Carousel multi-image behavior (R-23 / design "1→2→3 ảnh + arrow") is unreachable with current content

- **Evidence:** `ScreenshotCarousel.tsx:70` renders prev/next only when `screenshots.length > 1`; content provides
  one screenshot per product (MDX above). Therefore arrows never render, dots show a single item, swipe and the
  multi-slide responsive behavior cannot be exercised. Acceptance Criterion "carousel … + arrow" and R-23 are
  not demonstrably met in the shipped artifact.
- **Impact:** required interactive carousel behavior effectively absent; acceptance criteria partially unmet.
- **Suggested fix:** add ≥2–3 screenshots per product to `src/content/products/{vi,en}/*.mdx` (content-layer
  ownership), or if only one image is intended, drop the carousel and keep a single static screenshot (with
  rationale) so the AC matches the delivered behavior. This must be reconciled before PASS.

### [MINOR] `downloadUrl` is not protocol/allowlist validated

- **Evidence:** `src/components/products/DownloadLinks.tsx:14` uses `product.downloadUrl` directly as `href`.
  All current content is `downloadUrl: null` (MDX), so the link branch is unexercised. The task asks for
  "download links validated if present".
- **Suggested fix:** validate the URL (allow `https:` only, reject others) before rendering the `<a>`, or
  validate in the content loader.

### [MINOR] No `BreadcrumbList` JSON-LD on the route

- **Evidence:** page emits no JSON-LD. `design-spec.md` §1.8 and Screen 7 SEO list `BreadcrumbList`. Task item 4
  only requires `SoftwareApplication` when a real link exists (correctly skipped, all links null) — but the
  BreadcrumbList is a design-level expectation. Sibling `solutions/enterprise/page.tsx` also omits it, so this is
  a consistent (likely deferred) gap rather than a regression.
- **Suggested fix:** add BreadcrumbList via the shared layout/helper once available; track as a separate task if
  intentional deferral.

### [MINOR] No `canonical` in metadata `alternates`

- **Evidence:** `page.tsx:24` sets `alternates.languages` (vi/en/x-default) but no `canonical`. Sibling pages are
  the same. hreflang requirement itself is satisfied.

### [MINOR] Hardcoded English `aria-roledescription="carousel"` on the VI page

- **Evidence:** `ScreenshotCarousel.tsx:57`. Cosmetic a11y (design literally specifies `"carousel"`), but a
  localized roledescription would be more correct. Low priority.

### [MINOR] Heading hierarchy skips `h2` (h1 → h3)

- **Evidence:** `AppCard.tsx:20` emits `<h3>`; the page has no `h2` (PageHeader provides the `h1`). Screen 7 does
  not define an `h2`, so this is a soft design/a11y nit.

### [MINOR] `sizes` overestimates rendered width at `lg`

- **Evidence:** `ScreenshotCarousel.tsx:65` uses `(min-width:1024px) 33vw`, but at `lg` the card is half the
  container and each slide is `1/3` of the card ≈ ~16vw. Over-fetching → slight perf cost only.

### [INFO] SVG screenshots served through `next/image` optimizer without `dangerouslyAllowSVG`

- **Evidence:** `next.config.ts:5` is `{}` (no `images` config), screenshots are `.svg`
  (`/images/products/*.svg` in `public/`), and `ScreenshotCarousel`/`AppCard` use raw `next/image`. Next's
  optimizer rejects SVG unless `images.dangerouslyAllowSVG` is enabled. Not verifiable without running the build.
  `ScreenshotCarousel` mitigates with `onError` → `surface-sunken` fallback (`ScreenshotCarousel.tsx:50-52,62-63`),
  but `AppCard` has no `onError`. This pattern is **pre-existing/systemic** (AppCard, CaseStudyCard, PostCard all
  use raw `next/image`), i.e. out of this task's file scope.
- **Suggested action:** confirm image rendering at runtime (build/preview) and, if broken, open a separate
  repo-level task to enable `dangerouslyAllowSVG` (with a CSP/`contentDispositionType`) or switch to an SVG-safe
  wrapper. Recorded as **residual risk** — could not be verified (shell denied).

## Passing checks (static)

- Metadata title/DESCRIPTION exact: VI `Sản phẩm App | NTA`, EN `Apps | NTA` (`page.tsx:14-17`); `alternates.languages`
  2 locales + `x-default: vi` (`page.tsx:24`). No double `/en` (absolute URLs).
- Deterministic order: explicit `productSlugs` + `orderProducts` flatMap/find (`page.tsx:13,28-33`) — not `readdir`-order dependent.
- Single `<main>` landmark: provided once by `src/app/[locale]/layout.tsx:34`; page uses fragment/section and adds no nested `<main>`.
- Carousel a11y wiring present: `role="region"` + `aria-roledescription` + `tabIndex={0}` + `aria-label` (`:57`),
  prev/next `aria-label` (`:72-73`), dots as `<button>` with `aria-current` (`:79-88`), 44px targets (`min-h-11 min-w-11`).
- Images lazy, **no `priority`** (`:65`); no autoplay; reduced-motion honored (`motion-reduce:snap-none motion-reduce:scroll-auto` `:59` + `behavior='instant'` `:34`).
- Image-error fallback `bg-surface-sunken` (`:63`).
- `downloadUrl: null` → `<Badge>` shown, no dead link (`DownloadLinks.tsx:11`).
- i18n: all `products.*` keys used by the page exist in both `vi.json:113-123` and `en.json:113-123`.
- Dependency direction page → components/shared → lib/content respected; no `as any`, no dead code; files ≤300
  lines (73/93/18) and functions ≤50 lines.
- No scope creep observed in the new files (no unrelated refactors).

## Responsive Checklist Gate

Scope: **UI changed by this task only** (products page + carousel + download block). Breakpoints from
`project-config.md` `ui.responsive_breakpoints`; test widths **375 / 768 / 1280**. No browser environment →
verified via CSS math + class inspection; unverified parts noted.

| Item | Result | Evidence |
|---|---|---|
| Layout: no horizontal scroll / mobile-first | **OK** | Grid `grid-cols-1 gap-6 … lg:grid-cols-2` (`page.tsx:45`); container `max-w-container px-4 sm:px-6 lg:px-8`; carousel uses `overflow-x-auto` (horizontal scroll contained, `:59`). No fixed-width containers. |
| Layout: grid `auto-fit`/`minmax` vs fixed cols | **OK (with note)** | Uses fixed breakpoint columns (1→2), acceptable for a 2-card grid; no fixed pixel columns. |
| Typography/spacing: `rem`, fluid/clamp | **OK (note)** | Tailwind `text-*`/spacing are rem-based; section padding `py-12 md:py-16 xl:py-24`; card heading uses token `text-h2` (no per-component clamp — token-level, not verifiable here). |
| Media: `max-width:100%`, `height:auto`/`aspect-ratio`, `srcset`/`sizes` | **OK** | `w-full` + `aspect-[16/10] … xl:aspect-[4/5]` + `object-cover` (`:65`); `sizes` responsive (`:65`); `next/image` emits `srcset`. Duplicate image is covered by MAJOR #1. |
| Touch/interaction: ≥44px, nav/table mobile | **OK** | Arrows/dots/download link all `min-h-11 min-w-11`/`min-h-11` (44px). No `<table>` in scope (N/A). |
| Viewport/a11y: no bare `100vh`, reduced-motion, no `overflow:hidden` masking | **OK** | No viewport units in changed files; `prefers-reduced-motion` handled via `motion-reduce:*` (`:59`) + `matchMedia` (`:34`); no masking `overflow:hidden`. |
| 375px | **OK** | grid 1 col; carousel slides `w-full` → 1 slide; image `aspect-[16/10]`. |
| 768px | **OK** | grid still 1 col; carousel `md:w-1/2` → 2 slides; AppCard `md:grid-cols-2`. |
| 1280px | **OK** | grid `lg:grid-cols-2` → 2 cards; carousel `lg:w-1/3` → 3 slides; `xl:aspect-[4/5]`. |
| Actual 1→2→3 slide demonstration | **FAIL (contradiction)** | Content has 1 screenshot/product, so 2/3-slide states and arrows are unreachable (see MAJOR #2). |

**Responsive gate verdict:** **FAIL** — due to the 1→2→3 / arrows requirement not being reachable with current
content (MAJOR #2). CSS layout mechanics themselves are sound.

## Skill gates

- `aislop`: skip, shell denied (could not run `aislop scan`).
- `oxlint` (anti-slop): skip, shell denied / no oxlint config observed.
- `ocr` (open-code-review): skip, shell denied (could not run).
- AI-readable: **OK** — 0–1 chaos indicators (descriptive names, 1 responsibility/file, files/functions within
  `project-config` limits, no WHAT-comments).
- ai-friendly-web: **FAIL** — no `robots.txt`/`sitemap.xml`/`llms.txt` anywhere in repo (glob
  `**/{robots,sitemap,llms}*` → none) for a public-facing site. Note: ownership is R-21 / shell + DevOps, not this
  page task's files; recorded as a project-level MAJOR and should be tracked in a separate task. It does not, by
  itself, change the verdict (already FAIL).
- blitzstrike: N/A (not a STRICT auth/attack-surface task).

## Residual risk / Blocked

- Verify commands (lint/typecheck/build, SSG route list) **Blocked** — shell permission denied; no retry per guard.
- SVG-through-`next/image` behavior **unverified** (pre-existing, repo-wide).
- No browser → responsive checks verified by CSS math only; actual render/scroll-width unverified.

## Verdict

❌ **FAIL**

Blocking reasons: **MAJOR** duplicate screenshot rendering on every card (AppCard image + carousel slide #1), and
**MAJOR** carousel multi-image behavior (R-23 / design + AC "arrow") unreachable with single-screenshot content
(carousel effectively non-functional). Responsive gate FAIL and AI-friendly-web gate FAIL also recorded. Build
verification was Blocked, so the task's "check commands pass" DoD remains unverified.

Recommended return to builder (after reconciling content with layer-0 owner):
1. Fix AppCard/carousel composition to remove the duplicate screenshot (e.g. carousel becomes the card media).
2. Provide ≥2–3 screenshots per product (or remove the carousel if single-image is intended) so R-23/AC are met.
3. Add `downloadUrl` protocol validation; optionally add BreadcrumbList JSON-LD + `canonical`.
4. Have the builder re-run `npm run lint && npm run typecheck && npm run build` in an environment where shell is
   permitted, and attach exact output before re-review.
