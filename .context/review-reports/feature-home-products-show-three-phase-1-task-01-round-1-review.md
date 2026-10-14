# Review — feature-home-products-show-three · phase-1-task-01 · round 1

Agent: reviewer
Date: 2026-10-14
Change: CR-022 (`spec/changes/2026-10-14-home-products-show-three.md`)
Task: `tasks/feature-home-products-show-three/phase-1-task-01.md`
Scope reviewed (uncommitted diff): `src/components/home/ProductStrip.tsx`, `src/components/home/HomeProductCard.tsx`, `.context/design-spec.md` (CR-022 hunk only). Other dirty files (BACKLOG, progress, CR-023) out of scope.

## Review level
NORMAL

## Reason
UI-only responsive change on 1 public section; no API/schema/auth/data. Shared hook/components (`useScrollButtons`, `HomeScrollArrows`, `HomeSectionHeader`) are NOT modified (confirmed: not in `git diff`). `HomeProductCard` gets an optional prop with default = old value; only consumer is `ProductStrip` (grep). No red-risk trigger for STRICT.

## Blast radius
- Home page `/` + `/en`, section "Sản phẩm tiêu biểu" only.
- `HomeProductCard` used only by `ProductStrip` → default `sizes` unchanged for any other path.
- Case study (`CaseStudyCarousel`) shares `scrollStripClass`/`useScrollButtons`/`HomeScrollArrows`/`HomeSectionHeader` — none edited → behavior unchanged.

## Verify commands + result
| Command | Result |
|---|---|
| `npm run typecheck` (tsc --noEmit) | PASS (re-run by reviewer) |
| `npm run lint` | PASS — 0 errors, 1 pre-existing warning `src/components/mdx/index.tsx:25` no-img-element (out of scope) |
| `npm run build` | BLOCKED (builder: `Failed to load native binding`, environment SWC issue; not retried per Tool Loop Guard) → needs run in user terminal |
| Test | skip — no test framework configured |
| Browser visual 375/768/1024/1440, >3-card scenario | not executed (no dev server in review) — residual |

## Acceptance check (static analysis)
- **lg+ 3 cards on 1 row, no scroll** — OK. `%` widths resolve against flex container content box (strip `px-2` padding excluded, `-mx-2` only affects outer box). 3 × (W − 3rem)/3 + 2 × 1.5rem (`md:gap-6`) = W exactly → `scrollWidth == clientWidth` (padding included on both sides). Sub-pixel rounding at most ~1px, absorbed by `SCROLL_EDGE_TOLERANCE = 8` → both `canPrev/canNext` false. No overflow beyond strip, no page overflow.
- **Equal card height per row** — flex default `align-items: stretch`; CTA wrapper is `grid` → stretches child. Unchanged from CR-021.
- **lg+ arrows hidden / disabled** — `cardCount <= 3` wraps arrows in `lg:hidden`; fallback disabled via hook. OK.
- **> 3 cards keep carousel** — `isThreeUp` false → `cardWidthBaseClass` (identical to old class string) + arrows passed directly (identical to old JSX). OK.
- **< lg keeps scroll** — `md:`/base widths unchanged; at < lg inner wrapper `flex gap-3` reproduces the header's `flex items-center gap-3` layout for 2 buttons (size-12, no wrap needed). Visually equivalent.
- **Case study unchanged** — shared files untouched. OK.
- **Tailwind JIT** — both constants are full string literals in `src/**/*.tsx` (in `content` glob). Tailwind 3.4.18 normalizes `calc((100%-3rem)/3)` → `calc((100% - 3rem) / 3)` (same mechanism the existing `calc(50%-0.75rem)` relies on). Screen order sm<md<lg ensures `lg:w-*` overrides `md:w-*`. OK.
- **`sizes`** — lg+ card ≈ (min(1040, vw−64) − 48)/3 ≈ 304–331px; 340px hint is a correct upper bound. md range keeps `45vw` (unchanged behavior). OK.
- **a11y** — region `role="region" aria-label tabIndex=0` unchanged; at lg+ it stays focusable with ←/→ as no-op (accepted in task step 5). Hidden buttons use `display:none` → removed from a11y tree and tab order at lg+, no orphan focus. Labels unchanged (i18n keys reused). OK.
- **SSR/hydration** — `cardCount` derived from props, deterministic; no client-only branching. OK.

## Findings
| # | Severity | Location | Finding |
|---|---|---|---|
| F1 | LOW (non-blocking) | `ProductStrip.tsx:55` + `HomeSectionHeader.tsx:60-62` | At lg+ the header still renders its `actions` wrapper (`flex shrink-0 flex-wrap items-center gap-3`) because `actions` is non-null; its only child is `display:none`, so it is a 0-width flex item. The right column uses `lg:gap-8`, so a phantom 32px gap remains after the description → description column no longer flushes to the right edge of the 1040px block (shifted ~32px left vs. strip edge). Cosmetic only. Fixing it cleanly needs either a shared-header change (out of scope by design) or accepting it; recommend accept + note in residual risk, or verify visually and decide. |
| F2 | INFO | `ProductStrip.tsx:23-25` | `cardWidthThreeUpClass` duplicates the base string instead of composing (`${base} lg:w-[...]`). Literal duplication is safe for JIT (the `lg:` token is still a literal); nit only. |
| F3 | INFO | — | Visual verification (375/768/1024/1440, `/en`, >3-card temp data) and `npm run build` not executed → residual risk; should be confirmed before/at close-out per task Verify section. |

No CRITICAL/HIGH/MEDIUM findings. Diff is minimal, surgical, traceable to acceptance; `design-spec.md` as-built hunk matches implementation.

## Verdict
**PASS** (NORMAL) — with residual: build BLOCKED by environment (must pass in user terminal before push), browser visual check pending, F1 cosmetic gap accepted/optional.
