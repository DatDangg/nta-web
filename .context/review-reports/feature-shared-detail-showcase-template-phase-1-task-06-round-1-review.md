# Review — CR-004 phase-1-task-06 (close-out: remove dead old layout + loader-level showcase validation) — round 1

- Reviewer: independent (read-only), 2026-10-13
- Scope: staged deletions (17 files, -1481 lines) + unstaged `git diff --ignore-cr-at-eol -- src` (3 detail pages, types.ts, lib/content/{products,solutions}.ts)

## Verdict: PASS

## Checks
- **Deleted files have no remaining code references.** I grepped `src` for every deleted component name, `solutions/features` and `dev/components`. The only hits are comments, with no import or usage:
  - `src/app/globals.css:105` — comment on `.shot-fade-bottom` mentioning `ShotImage`
  - `src/components/cards/CardShotImage.tsx:9` — "Khác `ShotImage` (trang chi tiết)…"
  - `src/content/solutions/{vi,en}/lms.mdx:91` — YAML comment mentioning the `/dev/components` preview
- `src/components/solutions/` now holds only `CaseStudyLink`, `CaseStudyTeaser` and `RelatedSolutions`. `src/app/[locale]/dev/` is gone, so `/dev/components` → 404 (it falls to `[...rest]` / not-found).
- **globals.css:** every class selector is still used by live code. `.shot-fade-bottom` → `CardShotImage.tsx`. hero-*, split-*, marquee-*, listing-float, cta-bg-drift and motion-load-zoom → home, listing, motion and CTABanner components. Nothing is orphaned or broken.
- **Loader validation:** `getAllSolutions` and `getAllProducts` now include `'showcase'` in `assertRequiredFields` and return `WithShowcase<T>[]`. The runtime check backs up the type, so the narrowing is sound. Every content file has a `showcase:` block (14 solution MDX + 4 product MDX, vi + en), so the build cannot newly fail. `WithShowcase<Solution>` is assignable to `Solution`, so existing consumers (listings, sitemap, home, RelatedSolutions) still type-check.
- **Detail pages:** removing the `if (!x.showcase) throw` guards is safe now that the type is non-optional. `notFound()` paths are unchanged, and the doc comments were updated to say the loader reports the error at build time.
- `types.ts`: comments updated (the FeatureZigZag reference is gone). `showcase?` stays optional on the base interfaces, which keeps `CaseStudy` and raw MDX typing unchanged.

## Smoke
There is no running server or prerender output here, so I could not curl the 11 detail pages × vi/en or `/dev/components`. The static evidence supports the expected result: all 9 solution/product slugs are in `generateStaticParams` with `showcase` present, the 2 case studies are `layout: showcase`, and the dev route directory is deleted. The runtime 200/404 status depends on the builder's `bash tools/linux-build.sh verify` run.

## Findings
| # | Severity | File:line | Finding |
|---|----------|-----------|---------|
| 1 | MINOR | src/app/globals.css:105; src/components/cards/CardShotImage.tsx:9 | Stale comments still describe the deleted `ShotImage` (globals.css says "`ShotImage` đo scrollHeight… rồi mới thêm class này", but now only `CardShotImage` applies the class). Update the wording in a follow-up. Not blocking. |
| 2 | MINOR | src/content/solutions/{vi,en}/lms.mdx:91 | A YAML comment cites the deleted `/dev/components` preview as verification. It is harmless (not rendered) but now points at a route that no longer exists. |
| 3 | MINOR (info) | src/app/[locale]/case-studies/[slug]/page.tsx:55-75+ | The legacy non-showcase case-study branch (DetailHero …) is still reachable in code, but every case study is `layout: showcase`. This is out of task-06 scope (case studies were not part of the solutions cleanup). Consider removing it in a later CR if no non-showcase case study is planned. |

## Note
Commit only the 17 staged deletions plus the 6 unstaged src files for this task. Exclude the CRLF-only, CR-005 and CR-007 files.
