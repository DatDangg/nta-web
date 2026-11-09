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
- Acceptance criteria: _pending_
- Verify commands + result: _pending_ (`npm run typecheck`, `npm run lint`, `npm test`, `npm run build` — lấy từ `.context/project-config.md`)
- Reviewer verdict: _pending_
- Doc impact: _pending_
