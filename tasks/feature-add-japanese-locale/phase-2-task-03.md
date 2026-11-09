# feature-add-japanese-locale · phase-2-task-03 — Pages/SEO/form: bỏ guard 'vi'|'en', chữ theo locale có ja, sitemap/hreflang/JSON-LD, ngày ja-JP, contact locale ja

- **CR:** CR-044 · change doc `spec/changes/2026-11-09-add-japanese-locale.md` · spec R-20a (4.12.0) · test-scope v62
- **Quyết định user (2026-11-09, không hỏi lại):** OQ-1 fallback **en** · OQ-2 dev dịch `ja.json` · OQ-3 AI news sinh cả ja · OQ-4 VI · EN · JA 3 nút liền.
- **Classification / Risk:** ADDITIVE · HIGH (mọi route `src/app/[locale]/**`, SEO dùng chung, API contract `/api/contact`)
  - Expected review level: **STRICT** (API contract/DTO, navigation, SEO shared)
  - Blast radius: `src/app/[locale]/**/page.tsx` (~20 guard: home, about, blog[/slug], case-studies[/slug], contact, products[/slug], solutions/ai[/slug], solutions/enterprise[/slug]), `layout.tsx` (skip-link, `<html lang>`), `ScrollTopButton.tsx`, `src/lib/seo/jsonld.ts`, metadata/alternates + sitemap, `src/lib/format/date.ts`, `src/lib/api/contact-schema.ts`, `tools/contact-mail/Code.gs`, redirect R-08a.1 có ja.
  - Doc impact: `docs/API_SPEC.md` (`locale` vi|en|ja) — reconcile ở P3-T02.
- **Deps:** P2-T02.

## Scope
1. Thay mọi `if (locale !== 'vi' && locale !== 'en') notFound()` bằng `hasLocale(routing.locales, locale)` (helper chung nếu lặp). Không hardcode danh sách.
2. Mọi nhánh `locale === 'vi' ? A : B` / `locale === 'en' ? …` (skip-link layout, ScrollTopButton, title `products/[slug]`, `solutions/enterprise/[slug]`, các page listing…) → chữ từ messages (ưu tiên) hoặc map đủ 3 locale. Grep lại sau khi sửa: không còn nhánh 2 ngôn ngữ.
3. SEO: alternates/hreflang vi/en/ja + `x-default` = vi; sitemap alternates ja; `og:locale` `ja_JP`; JSON-LD `availableLanguage` ['vi','en','ja'].
4. Ngày `ja-JP` → `2026年11月9日` (blog list/detail, case study).
5. `generateStaticParams` (nếu có) gồm ja; `not-found` ở /ja chữ ja.
6. Contact: schema `locale` `vi|en|ja` (sai → 400 `errors.locale`); `Code.gs` nhận ja + nhãn; ghi: user phải dán lại script lên Apps Script.
7. Test: contact-schema ja, date ja, jsonld/alternates có ja.

## Acceptance
- `/ja`, `/ja/about`, `/ja/solutions/enterprise[/slug]`, `/ja/solutions/ai[/slug]`, `/ja/products[/slug]`, `/ja/case-studies[/slug]`, `/ja/blog[/slug]`, `/ja/contact` → 200, `<html lang="ja">`; slug sai → 404; vi/en không đổi.
- sitemap.xml + `<head>` có hreflang ja, x-default vi.
- typecheck + lint + test + build PASS; smoke local `npm run build && npm start` curl các route (file mode; db mode nếu có DB dev).

## Retry / Escalation
Max 3 attempt; fail lần 3 → `architecture_review_needed` (không fix #4). Mỗi failed attempt append `.context/error-memory.md`.

## Verification summary
- Status: **done** (attempt 1, 2026-11-09)
- Acceptance criteria: PASS — smoke `next start` file mode: /ja, /ja/about, /ja/solutions/ai(+boxai), /ja/solutions/enterprise(+crm), /ja/products(+music-app), /ja/case-studies(+heritage-site-ai-camera), /ja/blog(+ai-weekly-2026-w42), /ja/contact → 200, `<html lang="ja">`, hreflang ja + x-default → URL vi; / lang vi, /en lang en; slug sai dưới /ja → 404; /ja/case-studies/oc-eo-learning → 301; Accept-Language ja → 307 /ja; sitemap 78 hreflang ja. DB mode chưa smoke (không có DB dev).
- Verify commands + result: `npm run typecheck` PASS · `npm run lint` PASS (1 warning cũ) · `npm test` 230: 227 pass / 1 fail có sẵn (tools/db/content-rules.test.ts thiếu /uploads local) / 2 skip · `SWC_NATIVE_BINDING_CACHE=... npm run build` PASS.
- Reviewer verdict: STRICT PASS round 1 — `.context/review-reports/feature-add-japanese-locale-phase-2-task-03-round-1-review.md` (4 MINOR: hreflang <head> trang [slug] vẫn liệt kê 3 locale (có sẵn, task riêng); Code.gs phải dán lại TRƯỚC deploy; isLocale tự viết giống hasLocale; API_SPEC ở P3-T02).
- Doc impact: `docs/API_SPEC.md` locale vi|en|ja → reconcile ở P3-T02 (theo plan).
- Residual risk: user phải dán lại `tools/contact-mail/Code.gs` lên Apps Script trước khi deploy ja; `src/db/content-repo.ts:175` pairLocale vi↔en (DB layer, soát ở P3); LanguageToggle chưa có JA (P2-T04).
