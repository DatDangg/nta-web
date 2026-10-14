Agent: reviewer

# Review — feature-home-products-coming-soon-card · phase-1-task-01 · round 2

- Task: `tasks/feature-home-products-coming-soon-card/phase-1-task-01.md` (CR-021)
- Round 1: `.context/review-reports/feature-home-products-coming-soon-card-phase-1-task-01-round-1-review.md` (FAIL, F-1 MEDIUM)
- Scope reviewed: `src/components/home/ProductStrip.tsx`, `src/app/[locale]/page.tsx` (`cta` prop + `listingCtas` import), `.context/design-spec.md` (line 125), `SPECIFICATIONS.md` R-03a paragraph "(3.14.0 — CR-021)" (lines 73-76).
- Out of scope (CR-019, concurrent): R-09c in SPECIFICATIONS.md, spec/CHANGELOG.md, spec/test-scope/current.json, .context/progress.json, .dockerignore.

## Review level
**NORMAL**

## Reason
Additive UI in one homepage section; no API/schema/auth/tenant/shared-service change. `ListingCtaCard` reused without modification. Round 2 delta is one class token (`flex` -> `grid`).

## Blast radius
`ProductStrip` (homepage `/`, `/en` only; single caller updated, typecheck confirms). `/products`, `ListingCtaCard`, `useScrollButtons` untouched.

## Verify commands + result
| Command | Result |
|---|---|
| `npm run typecheck` (reviewer re-run) | PASS (tsc --noEmit, exit 0) |
| `npm run lint` (reviewer re-run) | PASS — 0 errors, 1 pre-existing warning `src/components/mdx/index.tsx:25` (out of scope) |
| `npm run build` | BLOCKED (environment, native binding) — not run per instruction |

## F-1 re-check (round 1 MEDIUM)
`ProductStrip.tsx:68`: `<div className="grid w-[85%] shrink-0 snap-start md:w-[calc(50%-0.75rem)]">`.
- Width: grid container with no template -> one implicit `auto` column; the card is a block-level grid item with `justify-self: normal` (= stretch), so it fills the slot width (≈508px at 1440, ≈468px at 1024). The `auto` track is capped by available space, and the card's min-content (longest word + `p-7`) is far below the 85% mobile slot, so no overflow. **Resolved.**
- Height: the wrapper is a flex item of the strip row (`scrollStripClass` = `flex`, default `align-items: stretch`) -> definite stretched height; the implicit `auto` row stretches (`align-content: normal`) and the item `align-self: normal` stretches -> the card fills row height; `h-full` also resolves against the definite height. `min-h-[300px]` still applies. **OK.**

## Acceptance check
| # | Acceptance | Result |
|---|---|---|
| 1 | CTA at end of strip, content = /products CTA, no new strings | PASS — `{ ...listingCtas[locale].products, href: '/contact', icon: 'plus' }`; no new i18n keys |
| 2 | Dashed style, width = product card, height = row | PASS (code; see F-1 re-check) |
| 3 | Link `/contact` / `/en/contact` | PASS — `CardLink` uses next-intl `Link` (locale prefix automatic) |
| 4 | ←/→, keyboard, swipe, snap | PASS (code) — CTA wrapper is last child of `stripRef`, same `shrink-0 snap-start` + width classes; `scrollStrip` steps by `firstElementChild.offsetWidth` (a product card, same width) + gap; `canNext` derives from `scrollWidth` so the 3rd item enables → on desktop. `useScrollButtons.ts` unchanged |
| 5 | Section hidden when no products | PASS — `if (products.length === 0) return null;` (line 27) precedes render |
| 6 | Spec / design-spec consistency | PASS — SPECIFICATIONS.md R-03a (3.14.0 — CR-021) and design-spec line 125 match implementation (component, content, icon, `/contact`, width 85% / ½ from `md`, snap, hidden with section) |

## Findings
- F-1 (round 1, MEDIUM) — **RESOLVED**.
- F-2 (INFO, carried) — `listing-card-in` mount animation is redundant off-screen; no action.
- No new findings.

## Residual risk
- `npm run build` + prerender grep (vi/en HTML containing CTA title and `/contact` / `/en/contact`) not verified — run build in user terminal.
- No live browser check at 375 / 768 / 1024 / 1440 (layout reasoning from CSS spec only).

## Verdict
**PASS**
