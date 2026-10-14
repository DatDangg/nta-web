Agent: reviewer

# Review — feature-home-products-coming-soon-card · phase-1-task-01 · round 1

- Task: `tasks/feature-home-products-coming-soon-card/phase-1-task-01.md` (CR-021)
- Change doc: `spec/changes/2026-10-14-home-products-coming-soon-card.md` · Spec delta: `SPECIFICATIONS.md` R-03a (3.13.0)
- Diff reviewed: `src/components/home/ProductStrip.tsx`, `src/app/[locale]/page.tsx`, `.context/design-spec.md` (uncommitted, branch main)

## Review level
**NORMAL**

## Reason
Additive UI on 1 public section (homepage). No API/schema/auth/tenant. `ProductStrip` is used only by the homepage; `ListingCtaCard` is reused but NOT modified. Builder ran typecheck/lint PASS; build blocked by environment.

## Blast radius
- `src/components/home/ProductStrip.tsx` (homepage only, vi + en). New required prop `cta` — only call site `src/app/[locale]/page.tsx` updated (typecheck confirms no other caller).
- `ListingCtaCard` / `ListingExplorer` / `/products` untouched.

## Verify commands + result
| Command | Result |
|---|---|
| `npm run typecheck` (re-run by reviewer) | PASS (tsc --noEmit, exit 0) |
| `npm run lint` (re-run by reviewer) | PASS — 0 errors, 1 pre-existing warning `src/components/mdx/index.tsx:25` (out of scope) |
| `npm run build` | BLOCKED (environment: "Failed to load native binding") — not retried per instruction; prerender HTML grep not done |

## Acceptance check
| # | Acceptance | Result |
|---|---|---|
| 1 | Card at end of strip on `/` and `/en`, content = /products CTA | PASS (code) — `listingCtas[locale].products` + `href:'/contact'` + `icon:'plus'`, identical to `src/app/[locale]/products/page.tsx:82`; no new i18n strings |
| 2 | Dashed style as /products; **width = product card**; height stretches with row | **FAIL (width, lg+)** — see F-1. Height: PASS |
| 3 | Link `/contact` / `/en/contact` | PASS — `CardLink` -> next-intl `Link` from `@/i18n/navigation` (`ListingCard.tsx:13`), locale prefix added automatically |
| 4 | ←/→ buttons, keyboard, swipe, snap; no horizontal page overflow | PASS (code) — CTA wrapper is last child of `stripRef`, same `shrink-0 snap-start` + same width class; `scrollStrip` steps by `firstElementChild.offsetWidth` (a product card, same width); `canNext` from `scrollWidth`, so 3rd item enables → on desktop. Overflow contained by `overflow-x-auto`. Browser check at 375/1440 not done (residual) |
| 5 | Section hidden when no products | PASS — `if (products.length === 0) return null;` (`ProductStrip.tsx:27`) still precedes render |
| 6 | typecheck / lint / build | typecheck + lint PASS; build BLOCKED (env) |

## Findings

### F-1 — MEDIUM — CTA card does not fill the wrapper width on lg+ (acceptance "rộng bằng thẻ sản phẩm" not met)
- Location: `src/components/home/ProductStrip.tsx:68` wrapper `flex w-[85%] shrink-0 snap-start md:w-[calc(50%-0.75rem)]` + `src/components/listing/ListingCard.tsx:113` card root (`flex h-full ... min-h-[300px] flex-col items-center ...`, no `w-full` / `flex-1`).
- Cause: wrapper is a **row** flex container; the card is a flex item with default `flex: 0 1 auto`, `width: auto` → its main-size is its max-content width. It can shrink (flex-shrink 1) but never grows. Card max-content ≈ widest child (h3 "Sắp có thêm ứng dụng mới" at 1.375rem bold ≈ 290px; description capped `max-w-[28ch]` ≈ 250px; button ≈ 225px) + `p-7` (56px) + border ≈ **~350px** (en "More apps coming soon" ≈ ~310px).
- Effect: at 1440 the slot is `50% − 0.75rem` of 1040px ≈ **508px**; at lg 1024 ≈ 468px → the dashed card renders ~350px wide, left-aligned, leaving ~120–160px empty inside the slot next to full-width product cards. On mobile (85% ≈ 290–320px) and around md (≈348px) the card is wider than the slot, so it shrinks and *looks* correct — which is why this is easy to miss without a desktop check. On /products it fills because it sits in a grid cell / `<li>` block (stretch), not a row-flex wrapper.
- Height: OK — row-flex `align-items: stretch` stretches the card to the wrapper height, and the wrapper is stretched by the strip row.
- Suggested fix (no change to `ListingCtaCard`, consistent with task scope): change the wrapper from `flex` to `grid` (single implicit track; grid item stretches on both axes): `className="grid w-[85%] shrink-0 snap-start md:w-[calc(50%-0.75rem)]"`. Alternative: `flex flex-col` (column flex → cross-axis stretch fills width; `h-full` resolves against the stretched wrapper). Either keeps height = row height. Then verify visually at 375 / 768 / 1024 / 1440.

### F-2 — INFO — `listing-card-in` load animation in strip context
`.listing-card-in` (`src/app/globals.css:287`) runs `motion-load-in` on mount with `--d` default 0ms. The card is off-screen (below fold, end of strip), so the animation completes before the user sees it — no visible effect, no harm; product cards in the strip don't use it, so it is merely redundant. Acceptable; no action required.

### F-3 — INFO — client-component import / a11y
- `ListingCard.tsx` has no `'use client'` but also no server-only imports (`next/image`, `@/i18n/navigation`, `./icons`, `./themes`, `./types`) and no hooks → safe to import into the client `ProductStrip`; `ListingCard` (unused here) is tree-shaken.
- Heading order: card `h3` under section `h2` (`home-products-title`) — consistent with `HomeProductCard` `h3`. Focus ring `focusRing` on the CTA link (`outline-offset-4`) sits inside the card's `p-7`, not clipped by the strip's `overflow-x-auto`. Link has visible text label. OK.

### Residual risk
- Build + prerender grep (`.next/server/app/vi.html` / `en.html` containing CTA title + `/contact` / `/en/contact`) not verified — must run `npm run build` in the user's terminal.
- No browser check of scroll buttons/snap at 375/1440.

## Verdict
**FAIL** — 1 MEDIUM finding (F-1): acceptance "rộng bằng thẻ sản phẩm" is not met at lg/xl; fix is a one-class change on the wrapper (`flex` → `grid`, or `flex flex-col`) in `src/components/home/ProductStrip.tsx:68`. Everything else (content, link target, i18n, scroll/snap logic, empty-state hide, client safety, a11y) passes on code review. After fix: re-run typecheck/lint, build in user terminal, visual check at 1440 + 375.
