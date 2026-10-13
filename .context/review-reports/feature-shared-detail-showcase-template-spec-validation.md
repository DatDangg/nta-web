# Spec validation — CR-004 shared-detail-showcase-template (R-08c, R-08c.1)

- Validator: independent (read-only), 2026-10-13
- Change doc: `spec/changes/2026-10-13-shared-detail-showcase-template.md` (status still `pending`; to be archived on close-out)
- Spec: `SPECIFICATIONS.md` R-08c (3.3.0/3.4.0) + R-08c.1 (3.5.1)
- Scope adjustment: the image items (CRM/DentGo/LMS staging screenshots with fake data; extra HRM mock screens) moved to CR-007 `spec/changes/2026-10-13-solution-detail-screenshots.md`, as the user agreed on 13/10. They are excluded from this validation.

## Verdict: PASS

## Acceptance list

| # | Acceptance item | Result | Evidence |
|---|-----------------|--------|----------|
| 1 | Case-study and in-scope detail pages render through one layout component; only data differs | PASS | `ShowcaseLayout` is used by `case-studies/[slug]` (showcase branch), `solutions/enterprise/[slug]`, `solutions/ai/[slug]` and `products/[slug]`. Scope: 2 case studies + 4 enterprise + 3 AI + 2 products = 11 detail pages × vi/en. |
| 2 | Óc Eo + dental case studies unchanged (no regression) | PASS | Both case studies are `layout: showcase` in vi/en. The showcase component changes in tasks 05/06 are additive (phone branch / optional style), and the non-phone class strings are equivalent (task-05 review). |
| 3 | Feature grid + FAQ optional; hidden when data is missing | PASS | `ShowcaseLayout.tsx:38-40` renders features/details/faq only when present. |
| 4 | Data in MDX frontmatter (vi+en); no hard-coded content/brand/demo URL in page.tsx | PASS | No hard-coded URLs or content in the 3 detail pages. They only load data and build breadcrumb, JSON-LD and metadata. `showcase` is now enforced by the loaders (`getAllSolutions` / `getAllProducts`). |
| 5 | Existing LMS content (TT27, AI, audiences) preserved in features/FAQ | PASS | `lms.mdx` vi has 7 TT27 mentions. en uses "Circular 27/2020" / "Circular 70/2026" in features, FAQ and details (L71-95). |
| 6 | BR-004: no fabricated stats, illustrative images captioned | PASS | Product content was checked in task-05 rounds 1-2 (sourced from the user's notes; AI/test-build captions present). The Premium music screen (rating 4.8) and the hair welcome screen were excluded, as R-08c.1 requires. Solution pages were covered in earlier task reviews. |
| 7 | URLs kept; metadata, canonical/alternates, breadcrumb JSON-LD, sitemap correct | PASS | Existing routes are unchanged. The new `/products/[slug]` has canonical, `createLocaleAlternates` and breadcrumb JSON-LD, and the sitemap adds `products/<slug>` × vi/en with hreflang. |
| 8 | Still SSG; no DB/API for content | PASS | Loaders read MDX via fs/gray-matter. `generateStaticParams` is on every detail route. No fetch or DB in `src/lib/content`. |
| 9 | Unused old components deleted; build/typecheck/lint PASS | PASS (build per builder) | Task-06 deleted 15 old solution components, `features.ts` and the `/dev/components` preview, and no references remain. Build/typecheck/lint were reported PASS by `bash tools/linux-build.sh verify` (not re-run by the validator). |
| — | R-08c.1 product specifics (404 on unknown slug, listing → detail, phone/aspect/icons, hero CTA → #features while there is no store link) | PASS | Task-05 rounds 1-2 + CR-006 review. |
| — | Image items (staging screenshots with fake data, extra HRM screens) | MOVED → CR-007 | Not validated here. |

## Residual / follow-ups (non-blocking)
- To close out: set the change doc to `status: done` and move it to `spec/changes/archive/`. CR-007 already references the `archive/…` path. Update BACKLOG.md (done + date) and `.context/progress.json`.
- Consider whether the R-08c text in SPECIFICATIONS.md needs a note that the staging/HRM image requirement is now tracked by CR-007.
- MINOR stale comments mentioning `ShotImage` and `/dev/components` (see the task-06 review).
