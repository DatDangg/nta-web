# Agent: reviewer

**Task:** `tasks/feature-image-lightbox-case-study-card/phase-1-task-02.md` (CR-013) · round 1
**Diff:** `git diff src/components/listing/ListingCard.tsx` (uncommitted). `.context/project-config.md` ignored (not in CR scope).

## Review level
`NORMAL`

## Reason
`ListingCard` is a shared component (/products, /solutions/*, /case-studies), which normally points to STRICT. But the diff only changes presentation (CSS classes, render order) for the `media.kind === 'photo'` branch. There is no API, data, auth or state change. `kind: 'photo'` is only produced in `src/app/[locale]/case-studies/page.tsx:53`. The `phone`/`window` regression was checked line by line, so NORMAL is enough.

## Blast radius
- Directly affected: `/case-studies` (vi/en), the case study card grid (`ListingExplorer columns={2}`).
- Regression risk: `/products`, `/solutions/enterprise`, `/solutions/ai` (the `phone`/`window`/no-media branches), `ListingCtaCard` (the wide card at the end of the grid).

## phone / window / no-media / ListingCtaCard regression (before vs after)
| Item | Before | After | Result |
|---|---|---|---|
| `min-h-[350px]` on the card | always | `isPhoto ? '' : 'min-h-[350px]'` (L70) | Same for non-photo |
| Text block max-w | `phone→64% / photo→56% / else→50%` when there is media | `hasMedia && !isPhoto ? (phone→64% : 50%) : ''` (L76) | phone 64%, window 50%, no media '' — same |
| DOM order of non-photo media | after the text block | `{!isPhoto && item.media && <CardMedia/>}` after the text block (L104) | Same |
| `CardMedia` phone/window classes | — | not touched (L19-31, L42-59) | Same |
| `ListingCtaCard` | — | not touched (L110-132); `ListingExplorer` not touched | Same |

Only side effect: the class string gets a double space when `isPhoto` (`h-full  flex-col`). Harmless.

## Acceptance (photo branch) — checked against code
- Banner on top at every breakpoint: `CardMedia` is rendered before the text block (L75). The frame `relative mx-4 mt-4 aspect-[16/10] overflow-hidden rounded-[20px]` (L36) has no `sm:` override. OK
- Full-width text: `!isPhoto`, so no max-w (L76). OK
- Cards in the same row are the same height and the chip row is aligned at the bottom: the grid stretches + `h-full flex-col`. The image has a fixed 16/10 ratio and the same column width, so the image height is the same. The text block is `flex-1` and the chip row is `mt-auto` (L91). OK
- Dropping `min-h-[350px]` for photo: the banner (≥ ~190px at 343px width) + icon/title/description/chip (~260px+) is always above 350px, so there is no odd gap. OK
- Ratio vs actual images: DentGo/Óc Eo 1.608 vs 1.6, almost no crop. Bảo Hà 1.336 → crops ≈ 8.3% top/bottom. Matches the CR.
- `sizes="(min-width: 1280px) 600px, (min-width: 768px) 46vw, 92vw"` with `columns=2` (`grid-cols-1 md:grid-cols-2`, ListingExplorer.tsx:60), Container `px-4 sm:px-6 lg:px-8`: at 375 the image is ≈ 309px (92vw=345, a bit over); at 768 the card is ≈ 348, image ≈ 314 (46vw=353); at ≥1280 the image is ≈ 560 (600px). Slightly over, never under, so the image is not blurry. OK
- A11y: `alt` kept (`t('imageAlt')`); the link label `aria-label={item.linkLabel}` is unchanged; decorative elements keep `aria-hidden`. No regression.
- CTA card at the end of the grid: `ctaWide`/`ctaSpan` logic is not touched, and the CTA card does not depend on ListingCard's class changes. OK

## Verify commands + result
- `npm run typecheck` → PASS (tsc --noEmit, 0 error)
- `npm run lint` → PASS (0 error; 1 existing warning `src/components/mdx/index.tsx:25` no-img-element, outside scope)
- `npm run build` → not run by reviewer (sandbox native-binding error per builder; primary is running it in the user's terminal). **Must be PASS before commit.**

## Responsive Checklist Gate (375 / 768 / 1280 — checked with CSS math, no browser)
- Layout / no horizontal overflow: OK — the banner uses `mx-4` inside a card with `overflow-hidden`, so its width is relative to the card. No fixed px width. The grid is mobile-first `grid-cols-1 md:grid-cols-2` (not changed).
- Typography/Spacing: N/A — no font changes; spacing uses Tailwind scale.
- Media: OK — `aspect-[16/10]` + `size-full object-cover`, `next/image` with real width/height + `sizes` suited to the layout.
- Touch/Interaction: N/A — the whole card is one link (unchanged).
- Viewport/A11y: N/A — no `100vh` or new motion; the existing hover transform is unchanged.

## Skill gates
- aislop: skip — not run (small, presentation-only diff); manual check found no dead code or narrative comment beyond one line explaining "why" (L34, acceptable).
- oxlint (anti-slop): skip, oxlint not configured (lint uses eslint, PASS).
- ocr: skip, ocr not installed.
- AI-readable: OK — `isPhoto` is a clear name; 0 AI-chaos indicators.
- ai-friendly-web: N/A — internal layout change, does not touch robots/sitemap/llms.
- blitzstrike: N/A — not a STRICT security task.

## Findings
- [MINOR] `src/components/listing/ListingCard.tsx:75-76` — `isPhoto && item.media &&` is redundant because `isPhoto` already implies `item.media` exists. It is kept only for TS narrowing, which is acceptable. No change needed.
- [MINOR] `src/components/listing/ListingCard.tsx:70` — double space in className when `isPhoto`. Cosmetic, no effect.
- [MINOR] `src/components/listing/ListingCard.tsx:62` — JSDoc still says "ảnh bên phải" (image on the right); for the photo variant the image is now on top. Optionally update the comment.

## Residual risk
- Not checked visually in a browser at 375/640/768/1024/1440 (reviewer is not allowed to run the app). Conclusions on equal height/alignment are from CSS math.
- `npm run build` has not been confirmed PASS by the reviewer — primary must confirm it before commit.

## Verdict
PASS (no CRITICAL/MAJOR; commit only after `npm run build` PASS in the user's terminal)
