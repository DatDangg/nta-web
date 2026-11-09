Agent: reviewer

# Review — feature-add-japanese-locale · phase-2-task-03 · round 1

- Task: `tasks/feature-add-japanese-locale/phase-2-task-03.md` (CR-044, R-20/R-20a)
- Scope reviewed: uncommitted working tree (29 modified + `src/lib/seo/breadcrumb.ts`, `src/lib/format/date.test.ts`). Untracked `.claude/launch.json`, `.context/review-reports/cr-041-screens/`, `.context/runs/*`, `spec/changes/2026-10-19-hero-wide-screen-backdrop.md` ignored (not part of task).

## Review level
**STRICT**

## Reason
API contract `/api/contact` (`locale` enum widened), shared SEO helpers (`seo.ts`, `jsonld.ts`, new `breadcrumb.ts`), sitemap, layout (every route), `isLocale` shared with `tools/db`.

## Blast radius
- Every route under `src/app/[locale]/**` (guards, metadata, breadcrumb JSON-LD), `layout.tsx` (og:locale, skip link), `ScrollTopButton`.
- `src/lib/content/slug.ts#isLocale` — used by pages, `contact-schema.ts`; module also imported by `tools/db/file-source.ts` (now pulls `src/i18n/routing.ts` via relative path).
- `/api/contact` → `forward.ts` → Apps Script `tools/contact-mail/Code.gs` (external deploy).
- `sitemap.xml` shape (per-locale URLs, x-default only when vi exists).

## Verify commands + result
| Command | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS (0 errors, 1 pre-existing warning `src/components/mdx/index.tsx:26` no-img-element) |
| `npm test` | 230 tests: 227 pass / 1 fail / 2 skip. Fail = `tools/db/content-rules.test.ts:29` (local `/uploads/*` images missing) — pre-existing, unrelated to diff |
| `npm run build` | not re-run by reviewer; primary reported PASS (with `SWC_NATIVE_BINDING_CACHE`) |
| Smoke | not re-run (reviewer does not start servers); primary evidence: /, /en, /ja + all ja routes 200 with correct `lang`, hreflang ja + x-default vi, wrong slug 404, `/ja/case-studies/oc-eo-learning` 301, Accept-Language ja → 307 /ja, sitemap 78 hreflang ja |

## Checks against the brief
- **Hardcoded vi/en branches**: grep `locale (===|!==) '(vi|en)'` over `src`, `tools/contact-mail` → only `LanguageToggle.tsx` (out of scope, P2-T04) and `format/date.ts:12` (intentional per-locale formatting, ja branch added). OK.
- **vi/en output unchanged**:
  - Breadcrumb: home name from `nav.home` = "Trang chủ"/"Home" (vi.json:27, en.json:27), home path `localeHref('vi')` = `/`, `localeHref('en')` = `/en`; item paths `localeHref(locale, '/about')` → `/about` / `/en/about` — identical to old literals. OK.
  - Titles: `productTitle`/`solutionTitle` vi/en strings identical to old ternaries. OK.
  - og:locale `OG_LOCALE` vi_VN/en_US; `inLanguage` vi-VN/en-US (test `seo.test.ts`). OK.
  - Skip link / back-to-top: new keys `common.skipToContent`/`backToTop` carry the exact old vi/en strings. OK.
  - `products.detailTitle` vi/en = old strings; `solutions/ai` fallback CTA label `common.cta.contact` = "Liên hệ tư vấn"/"Contact us" = old strings. OK.
  - Contact JSON-LD url `${SITE_URL}${localeHref(locale,'contact')}` → `/contact`, `/en/contact`; names unchanged. `availableLanguage` now `['vi','en','ja']` (intended). OK.
  - Dates: `date.test.ts` asserts vi "09 Th11, 2026", en "Nov 9, 2026" unchanged; ja `2026年11月9日`, timezone-safe. OK.
- **`isLocale` from routing**: `slug.ts` imports `../../i18n/routing` relatively (tools/db outside Next alias); `routing.ts` only uses `next-intl/routing#defineRouting` (pure). tools/db tests run green (except pre-existing uploads test). OK.
- **contact-schema**: non-string / unknown (`fr`, `EN`, `JA`, `jp`, 1, null, true) → `errors.locale`; `ja` accepted and preserved; missing/'' → vi. The route returns 400 with `errors` on `success:false` (unchanged path). OK.
- **Code.gs**: `SUPPORTED_LOCALES_ = ['vi','en','ja']`, `validatePayload_` uses it; mail body prints `Ngôn ngữ: ja` (test added). Still looser-or-equal to web validation (G5). OK — see MINOR #2 for deploy order.
- **Sitemap**: per-path locale set; static routes + registry products → all locales; posts/case studies/solutions → only locales returned by `getAll*(locale)` (which include en-fallback records for ja, so ja URLs that render are listed). x-default = vi URL when vi exists, omitted otherwise (valid: x-default is optional; a vi-missing path gets only its own reciprocal set). Fixes P2-T02 MINOR #3. OK.
- **Redirect R-08a.1**: `/ja/case-studies/oc-eo-learning` → `/ja/case-studies/heritage-site-ai-camera` 301 (`next.config.ts:29`). OK.
- **Metadata maps**: switched from `LocaleRecord` to `Record<Locale,…>` with ja entries → typecheck enforces completeness (fixes P2-T02 MINOR #4). ja copy reviewed: natural です/ます / noun-phrase titles (e.g. 「NTAについて」「導入事例」「お問い合わせ」「〜を支援します」「〜ご紹介します」). OK.
- **Messages parity**: 3 new keys added to vi/en/ja in same positions; parity test passes. OK.
- **not-found /ja**: uses `getTranslations('notFound')` (body localized via ja.json); metadata static by design (CR-026). OK.

## Responsive Checklist Gate
Diff touches UI only through text/aria strings (skip link, back-to-top aria-label, `detailTitle`, CTA label); no layout/CSS/component structure changes.
- Layout: N/A (no CSS/grid change)
- Typography/Spacing: N/A
- Media: N/A
- Touch/Interaction: N/A (ScrollTopButton size unchanged `size-12`)
- Viewport/A11y: OK — `aria-label` and skip-link now localized for ja (improvement)
Residual: ja string lengths in cards not visually verified (short strings; low risk; covered by P2-T04 visual pass).

## Skill gates
- aislop: skip — CLI not run; manual scan: no dead code, no swallowed errors, no `as any`, no TODO stubs. OK
- oxlint (anti-slop): skip — oxlint not configured (repo uses ESLint, PASS)
- ocr: skip, not installed/not run
- AI-readable: OK — new helper `createLocaleBreadcrumbJsonLd` removes ~15 duplicated inline ternaries; names self-descriptive; functions short; 0 chaos indicators
- ai-friendly-web: OK — sitemap still emitted, now without 404 URLs; robots/llms unchanged
- blitzstrike: N/A (no new attack surface; input validation tightened only by enum widening)

## Findings

### [CRITICAL]
None.

### [MAJOR]
None.

### [MINOR]
1. `src/app/[locale]/blog/[slug]/page.tsx:30` (and other `[slug]` pages via `createLocaleAlternates`, `src/lib/seo.ts:36-47`) — `<head>` hreflang still lists vi/en/ja for every detail page, while the sitemap now lists only locales where the record exists. For a post that exists in only some locales the head points to 404 alternates and disagrees with the sitemap. Pre-existing pattern (vi/en), low impact today because ja falls back to en. Suggest follow-up: pass the available locale list into `createLocaleAlternates` for detail pages (or reuse sitemap's existence logic). Not blocking.
2. `tools/contact-mail/Code.gs:30,115` — deploy-order risk: until the user re-pastes Code.gs into Apps Script, the live script rejects `locale: 'ja'` and ja contact submissions fail. Must be in release notes / P3 checklist ("paste Code.gs before deploying ja"). Not a code defect.
3. `src/lib/content/slug.ts:13` — `(routing.locales as readonly string[]).includes(value)` duplicates `hasLocale(routing.locales, value)` from next-intl (layout uses `hasLocale`). Equivalent behaviour; kept to avoid a next-intl root import in tools/db — acceptable, cosmetic only.
4. `docs/API_SPEC.md` still documents `locale: vi|en` — planned reconcile in P3-T02 (tracked, not a defect here).

## Verdict
✅ **PASS** — no CRITICAL/MAJOR. Typecheck/lint PASS, tests PASS except the pre-existing unrelated uploads test, build/smoke PASS per primary evidence. MINOR #2 must be carried into the deploy checklist.
