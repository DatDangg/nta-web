# Review — CR-004 layer 3 / task 05 (product detail pages) — round 2

- Reviewer: independent (read-only), 2026-10-13
- Base: round-1 report (PASS_WITH_CONDITIONS)

## Verdict: PASS

## Re-check of round-1 findings

| # | Round 1 | Status | Evidence |
|---|---------|--------|----------|
| C-1 | Music claims possibly unsourced (generation time 1–3 min, 3 input types, Vietnamese vocals) | Closed | The coordinator confirmed these are in the user's music source notes. |
| C-2 | Hair claims beyond the provided facts (no ads, guest account, third-party AI, deletion on download, history on phone, no training, 16+, wheel spin, Android v1) | Closed | The coordinator confirmed these are in the user's hair source notes. |
| M-1 | Music screenshots cropped by the 9/16 phone card | Fixed | `ShowcasePhotos.tsx`: the phone `<li>` drops the `aspect-[9/16]` class and uses `style={{ aspectRatio: photos.aspect ?? '9/16' }}` only when `isPhone`. `types.ts` adds an optional `photos.aspect?: string`. music-app vi/en set `aspect: "720/1561"`, which matches the real 720x1561 files. Hair uses the 9/16 default (720x1280), which fits exactly. Non-phone variants get `style={undefined}` and their class string is unchanged, so case-study and solution galleries are unaffected. |
| M-2 | Title not localized | Fixed | `products/[slug]/page.tsx`: the title is `Ứng dụng ${name} \| NTA` (vi) or `${name} App \| NTA` (en), with `name = brandName ?? title`. |
| M-3 | Duplicate Home-path expression | No action needed (cosmetic, matches existing pages) | — |

## New findings
None. vi/en showcase parity is preserved: `aspect` is set in both music locales and in neither hair locale.

## Note
The commit must stage the untracked new page and the `public/images/products/v2/**` images explicitly, and must not include the CRLF-only or CR-005 files.
