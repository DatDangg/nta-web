# Review — CR-004 layer 3 / task 05 (product detail pages) — round 1

- Reviewer: independent (read-only), 2026-10-13
- Scope: `git diff --ignore-cr-at-eol -- src` + new `src/app/[locale]/products/[slug]/page.tsx` + `public/images/products/v2/**`
- Build/typecheck/lint: not re-run (reported PASS via `bash tools/linux-build.sh verify`)

## Verdict: PASS_WITH_CONDITIONS

No CRITICAL or MAJOR defects found. Conditions: confirm the content claims listed under C-1 / C-2 against the source info notes (or remove them) before publishing.

## Checks

### 1. Correctness / regressions
- `ScreenMock.tsx`: the phone branch is an early return. The monitor path is unchanged, so DentGo and other existing screens are unaffected.
- `ShowcasePhotos.tsx`: the non-phone `<li>` uses the same class tokens as before (`relative shrink-0 snap-start overflow-hidden aspect-[4/3] w-[78%] rounded-xl sm:w-[46%] lg:w-[calc((100%-3rem)/4)]` plus the screen border/bg). The `<Image>` class and `sizes` are the same for non-phone (there is an extra trailing space, which is harmless). No regression for the `photo` and `screen` variants.
- `ShowcaseTechnology.tsx`: adds 4 icons, and the `ShowcaseNodeIcon` union is extended to match. The `Record<ShowcaseNodeIcon, ReactNode>` stays exhaustive.
- `types.ts`: `Product.brandName?`, `Product.showcase?`, `screen.device?` and `photos.variant 'phone'` are all optional or additive. Existing MDX stays valid.
- `slug.ts`: the `productSlugs` readonly tuple works with its consumers (`flatMap` in products/page.tsx, `for..of` into `Set<string>` in sitemap). The `isProductSlug` guard in `getProductBySlug` short-circuits unknown slugs.
- Listing card `href: /products/<slug>`: `ListingCard` sends non-`#` hrefs through the i18n `Link`, so the locale prefix is correct. No remaining internal `/products#<slug>` links found in `src/`.

### 2. SEO
- The metadata pattern (canonical `localizedPath`, `createLocaleAlternates`, `notFound` on bad locale or slug) mirrors `solutions/enterprise/[slug]/page.tsx`. OK.
- Unknown slug: `getProductBySlug` returns null → `notFound()` in both `generateMetadata` and the page → 404. OK.
- Breadcrumb JSON-LD: Home › Products › name, with locale-aware paths. OK. It uses `brandName ?? title` for the last item, which matches the visible crumb. (The enterprise page uses `solution.title` in JSON-LD and brandName in the visible crumb, so products is the more consistent of the two.)
- Sitemap: `products/<slug>` is added once and expanded to vi/en with hreflang + x-default. OK.

### 3. Content / BR-004
- All 14 referenced v2 images exist. PIL dimensions match the frontmatter: hero 1600x1000; hair screens 720x1280; music screens 720x1561. The legacy `screenshots` (941x1671/1672) are unchanged.
- The vi/en `showcase` structure has identical shape for both products. The only non-text difference is `technology.id` (`cach-dung` / `how-it-works`), a localized anchor, which is acceptable.
- Every illustrative image has a caption (hero, technology, photos). Hair captions state the models are AI-generated. Music captions state "internal test build" and, in EN, "Vietnamese interface".
- Facts checked against the source notes, all consistent: Hairstyle AI 76 styles / 26 colours / 6 face shapes; GEM 20 free, 5/style, 10 for a 5-pack, 5/colour, check-in 3-3-5-3-3-8-10; selfie deletion ≤24h. Music: prompt ≤1,000 chars; VIP weekly 179,000đ/500 credits; yearly 2,599,000đ/9,000 credits (~217,000đ/month); length 2:30–~3:00.
- No ratings, user counts or download numbers. No quote block.

### 4. A11y
- Every `src` entry (hero, screen, photos) has a non-empty `alt` in both locales. The phone `ScreenMock` keeps the `alt`, and the image is not aria-hidden.

## Findings

| # | Severity | File:line | Finding |
|---|----------|-----------|---------|
| C-1 | MINOR (condition) | src/content/products/{vi,en}/music-app.mdx — faq item 2 (~L127 vi / ~L127 en) | "Thường từ 1 đến 3 phút" / "Usually 1 to 3 minutes" generation time is not in the source facts provided to the reviewer. This is a possibly unsourced number (BR-004). Confirm it or remove it. Also confirm the stat "3 cách bắt đầu" and "Vietnamese vocals supported". |
| C-2 | MINOR (condition) | src/content/products/{vi,en}/hair-style-ai.mdx — pillars/benefits, vision, details, faq | Several claims go beyond the facts given to the reviewer: "không quảng cáo / no ads", "no account (guest account)", "third-party AI service", "result deleted on download", "history only on phone", "never used to train AI", "16+", "free daily wheel spin", "Android v1". They may be in the user's notes. Verify each against the source, especially the privacy and legal statements. |
| M-1 | MINOR | src/content/products/{vi,en}/music-app.mdx (photos) + src/components/case-studies/showcase/ShowcasePhotos.tsx:24 | Music screenshots are 720x1561 (~9:19.5), but the phone card is `aspect-[9/16]` with `object-cover object-top`, so the bottom ~18% of each music screenshot is cropped in the strip (nav bar / buttons may be hidden). Hair (720x1280 = 9:16) fits exactly. Consider `aspect-[9/19.5]` or a per-gallery aspect, or accept it. |
| M-2 | MINOR | src/app/[locale]/products/[slug]/page.tsx:23 | Title is `${brandName} \| NTA` in both locales ("Hairstyle AI \| NTA"). Enterprise pages use a localized pattern ("Giải pháp X \| NTA" / "X Solution \| NTA"). Consider "Ứng dụng X \| NTA" / "X App \| NTA" so the Vietnamese title carries a Vietnamese keyword. |
| M-3 | MINOR | src/app/[locale]/products/[slug]/page.tsx:43,47 | `base` is computed, but the Home crumb path is recomputed inline (`locale === 'en' ? '/en' : '/'`). This is cosmetic duplication and matches the existing pages. No action needed. |

## Notes
- New files are untracked: `src/app/[locale]/products/[slug]/page.tsx` and `public/images/products/v2/**` (14 jpg). The commit must stage them explicitly and must not pick up the CRLF-only or CR-005 changes.
