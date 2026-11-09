Agent: reviewer

# Review — feature-add-japanese-locale · phase-2-task-02 · round 1

- **Task:** `tasks/feature-add-japanese-locale/phase-2-task-02.md` (CR-044, R-20a.2/.3)
- **Diff reviewed:** uncommitted working tree — `src/i18n/{routing,request}.ts`, `src/content/{types,home,listings,solutions/overview}.ts`, `src/lib/content/{store,registry,load-mdx}.ts`, new `src/lib/content/locale-fallback.ts` (+ `.test.ts`), `src/lib/contact/company-contact.ts`, `src/app/sitemap.ts`, 7 page metadata maps → `LocaleRecord`, `tools/db/file-source.ts`, new `tools/db/locale-fallback.test.ts`.
- **Ignored (not part of task):** `.claude/launch.json`, `.context/review-reports/cr-041-screens/`, `spec/changes/2026-10-19-hero-wide-screen-backdrop.md`, `.context/progress.json`, `.context/runs/*`.

## Review level
**STRICT**

## Reason
Shared routing/i18n config, shared content store + data-cache path used by every page, navigation/locale detection, sitemap/hreflang (SEO surface). All are red-risk items in AGENTS.md § Reviewer rules.

## Blast radius
- `src/i18n/routing.ts` → `src/middleware.ts` (`createMiddleware(routing)`, localeDetection default ON), `src/lib/seo.ts` `createLocaleAlternates` (hreflang on every vi/en page), `src/app/sitemap.ts`, `src/i18n/request.ts`.
- `Locale` type (now derived from `routing.locales`) → every `Record<Locale, …>` consumer; content object maps moved to `LocaleRecord<T>`.
- Content read path: `getLocalizedEntries` (db) used by `load-mdx.ts`, `registry.ts` readKeyed/readSingleton, `company-contact.ts`; file mode `loadMdxDirectoryWithFallback` + `pickLocale`.
- Data cache: vi/en keys unchanged (`['content-entries', collection, locale]`), tags unchanged (`content:<collection>`); ja adds new key `…,'ja'` + reuses the en key.
- Seed tooling `tools/db/file-source.ts` (types only: `Locale` → `SeedLocale`).

## Verify commands + result (run by reviewer)
| Command | Result |
|---|---|
| `npm run typecheck` | PASS (`tsc --noEmit`, 0 errors) |
| `npm run lint` | PASS — 0 errors, 1 pre-existing warning `src/components/mdx/index.tsx:26` (no-img-element) |
| `npm test` | 225 tests: 222 pass, 2 skip (TEST_DATABASE_URL unset), **1 fail pre-existing** `tools/db/content-rules.test.ts` (9 `/uploads/*` images missing from `public/uploads`) — unrelated to this diff |
| `SWC_NATIVE_BINDING_CACHE=… npm run build` | PASS (all `[locale]` routes generated, sitemap dynamic, middleware 46.3 kB) |

## Acceptance check
| Criterion | Result | Evidence |
|---|---|---|
| routing `['vi','en','ja']`, default vi, `as-needed` | OK | `routing.ts:6`; test `request: routing nhận ja` |
| `Locale` derived from `routing.locales` | OK | `types.ts:4` (type-only import, no runtime cycle) |
| Fallback en per **record**, not per field, in ONE place | OK | `locale-fallback.ts:29-43` `mergeByKey` substitutes whole ja item by key; used by `store.ts:getLocalizedEntries` (db) and `load-mdx.ts:loadMdxDirectoryWithFallback` (file, keyed by file name); `pickLocale` for TS objects. Test asserts `items[0]` deep-equals the ja record (no en fields merged). |
| vi/en output unchanged (content) | OK | `needsContentFallback` only true for `ja` → vi/en call `read(locale)` once / `loadMdxDirectory` directly / `record[locale]` (always defined for vi/en). Cache keys + tags for vi/en untouched. db unit test asserts `reads == [locale]`, no warning. |
| ordering | OK | db: `compareStoredEntries` = same comparator `readLiveEntries` already applies; MDX then re-sorted by file name as before. file: sorted by fileName, test deep-equals ja vs en lists. |
| no 500 when ja wholly missing | OK | db stub test (`ja` empty → all en); file mode `ENOENT` on `ja/` dir → `[]` only for the ja read (en read still throws on real errors). |
| wrong slug → null/404 | OK | file test `get*BySlug('ja','khong-ton-tai') === null` for 4 collections; db test. |
| warning throttle 1×/process/collection | OK | message is fixed per `collection/locale` → `warnOncePerProcess` dedups (`ui-data.ts:13-17`). |
| request.ts ja + no DB rows → ja.json, no en, no per-request spam | OK | `request.ts` keeps `getEntries('ui_messages', locale)` (no en fallback); `buildUiMessages([], ja.json)` returns ja.json; the single "missing N key" warning has a stable message → once/process. |
| `company_info` ja missing → en | OK | `company-contact.ts:18` via `getLocalizedEntries`. |
| `slug_registry` | OK | `registry.ts:54` already reads `vi` (locale-independent). |
| `isLocale` (slug.ts) / page guards still vi/en | Out of scope (P2-T03) | as briefed |

## Findings

### RELEASE GATE (process, not a code defect) — must be honoured before close-out
- **[RELEASE-BLOCKER] Do NOT push this commit to `origin/main` until P2-T03 PASS.** `.github/workflows/deploy.yml` deploys on every push to `main`, and `.context/project-config.md:21` has `auto_push_after_pass: true`, so the normal close-out would deploy this task alone to production. With `ja` in `routing.locales` but page guards still `notFound()` for ja:
  1. `src/middleware.ts` = `createMiddleware(routing)` with next-intl's default `localeDetection: true` → a first-time visitor whose browser sends `Accept-Language: ja` (no `NEXT_LOCALE` cookie) hitting `/` (or any vi URL) is redirected to `/ja/...` → **404**. This changes vi output for real users and breaks the acceptance "vi/en output không đổi".
  2. Every vi/en page emits `hreflang="ja"` (`src/lib/seo.ts:29` loops `routing.locales`) and `sitemap.xml` lists `/ja/...` URLs + ja alternates → all 404 → crawlers index/ report errors.
  The code itself is correct and spec-aligned (R-20a.5 requires ja alternates; R-20a is "effective when phase 1–3 PASS"), so no code change is requested. Required action for the primary: **commit locally only (skip auto-push)** and push together with P2-T03 (page guards + `isLocale` opened), or explicitly get user approval. If this gate cannot be honoured, treat as MAJOR and FAIL.

### [CRITICAL]
None.

### [MAJOR]
None (code).

### [MINOR]
1. `tools/db/locale-fallback.test.ts:67-71` — "vi/en không đổi" only asserts `vi != en`; it does not prove vi/en output is unchanged by the new path. Suggest asserting `getAllSolutions('vi')` deep-equals `loadMdxDirectory(MDX_COLLECTION_DIRECTORIES.solution, 'vi')` and `registry.getListingPages('en')` `===` `listingPages.en`. (db-side is covered by the `reads == [locale]` unit test, so risk is low.)
2. `tools/db/locale-fallback.test.ts:89-95` — throttling is asserted with a custom `warn` over a single call (`<= 1`), not that repeated requests stay at one log. Low risk since `warnOncePerProcess` is pre-existing and the message is stable; optionally add a test calling `getLocalizedEntries`-style flow twice with `warnOncePerProcess` spy.
3. `src/app/sitemap.ts:17-24` — paths are unioned over all locales, so a ja-only record (e.g. future AI-news ja post, which `mergeByKey` keeps) would emit vi/en URLs that 404. Same pre-existing pattern as vi-only/en-only content; flag for P2-T03/P3 (generate per-locale existence or filter alternates).
4. Page metadata maps (`about/page.tsx:16`, `case-studies/page.tsx:16`, `contact/page.tsx:15`, `page.tsx:23`, `products/page.tsx:17`, `solutions/ai/page.tsx:18`, `solutions/enterprise/page.tsx:16`) are now `LocaleRecord<…>` without ja entries. Safe today only because guards narrow `locale` to vi/en; when P2-T03 removes the guards, `map[locale]` becomes `T | undefined` for ja — P2-T03 must switch to `pickLocale` (or add ja copy) and typecheck will enforce it. Note for P2-T03, not a defect here.
5. `locale-fallback.ts:10-12` hardcodes `'ja'` while `types.ts:8` hardcodes `Exclude<Locale,'ja'>` — two sources of "which locale may be missing". Acceptable (YAGNI) but a future 4th locale must update both.

## Skill gates
- aislop: skip — not run (CLI not invoked in this round); manual scan: no dead code, no swallowed errors (ENOENT-only catch rethrows others), no `as any`, no TODO stubs. OK.
- oxlint (anti-slop): skip — repo uses ESLint (`npm run lint` PASS); no oxlint config observed.
- ocr (open-code-review): skip, not run.
- AI-readable: OK — `locale-fallback.ts` 61 lines, functions < 20 lines, descriptive names, comments explain WHY (R-20a.2); 0 indicators.
- ai-friendly-web: OK for code (sitemap/robots still served); production exposure covered by RELEASE-BLOCKER above.
- blitzstrike: N/A (no auth/input/API change).
- Responsive Checklist Gate: N/A — no UI/CSS/component change (page diffs are type-only on metadata maps).

## Security
No new input surface. `ja` only accepted via `hasLocale(routing.locales, …)` / next-intl; `readMdxFiles(directory, locale)` receives a typed `Locale` (no user-controlled path). DB reads keep parameterised drizzle queries and `readOrThrow` (no DATABASE_URL in messages).

## Residual risk
- db mode verified via stubbed reader + type system only (no TEST_DATABASE_URL); the cached `getEntries` wiring is unchanged code.
- Locale-detection redirect behaviour reasoned from next-intl defaults (`localeDetection` not set in `routing.ts`), not executed in a browser.

## Verdict
**PASS (code)** — conditional on the RELEASE GATE: commit allowed, **no push/deploy of this commit before P2-T03 PASS** (or explicit user approval). No CRITICAL/MAJOR code findings; 5 MINOR (non-blocking, items 3–4 are inputs for P2-T03).
