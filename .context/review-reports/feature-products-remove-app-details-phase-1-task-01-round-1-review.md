# Review — CR-006 remove "Chi tiết ứng dụng / App details" block on /products — round 1

- Reviewer: independent (read-only), 2026-10-13
- Scope: unstaged `git diff --ignore-cr-at-eol -- src` (products/page.tsx, cardStyles.ts, vi/en.json) + staged deletions (AppCard.tsx, ScreenshotCarousel.tsx, productThemes.ts)

## Verdict: PASS

## Checks
- `src/app/[locale]/products/page.tsx`: the whole `<section aria-labelledby="product-details-title">` block is removed. The imports `AppCard`, `ScreenshotCarousel`, `Reveal`, `DownloadLinks` and `ComingSoonBadge` are removed. Only `hasDownloadUrl` is kept, and it is still used at L60. Every remaining import is used (checked each one by grep). The page still renders, in order: breadcrumb JSON-LD → `ListingHero` (with `GlassVisual` + `ListingExplorer`) → `CTABanner`.
- `detailTitle` (L46) is still used, in the card `linkLabel` (L62). It is not dead.
- Cards link to `/products/${product.slug}` (L52) through the i18n `Link` in `ListingCard`.
- Grep across `src` for `AppCard|ScreenshotCarousel|productThemes|previousScreenshot|nextScreenshot|carouselRoleDescription|product-details-title` → 0 hits. The deleted files and keys have no remaining references.
- vi.json and en.json both parse as valid JSON, and the same 3 keys are removed from each (parity kept).
- `cardStyles.ts`: comment-only edit that drops the AppCard mentions. It matches the code.

## Smoke
- There is no running server and no `.next` prerender output in the repo, so I could not curl /products vi/en here. The static evidence above covers it: no `product-details-title` in src, and the card hrefs are correct. The 200 status and runtime render depend on the builder's `bash tools/linux-build.sh verify` run.

## Findings
| # | Severity | File:line | Finding |
|---|----------|-----------|---------|
| 1 | MINOR (optional) | src/components/products/DownloadLinks.tsx:9,21 | `DownloadLinks` and `ComingSoonBadge` are now exported but unused anywhere in src (only `hasDownloadUrl` is imported). The i18n key `products.download` (vi/en) is also no longer referenced. These are harmless dead code. Remove them in a follow-up, or keep them for when a real `downloadUrl` exists. Not blocking. |

## Note
Commit only these 7 paths (4 modified + 3 staged deletions). Do not include the CRLF-only or CR-005 files.
