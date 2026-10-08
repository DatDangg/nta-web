# Task 01: SEO — sitemap/robots/JSON-LD/metadata audit + llms.txt

## Layer
4

## Type
build (initial)

## Goal
Hoàn thiện SEO toàn site: audit metadata từng route (title/desc/hreflang/OG/Twitter),
`sitemap.xml` + `robots.txt`, JSON-LD (Organization/WebSite/BreadcrumbList/Article/ContactPage),
OG image, `llms.txt` — mục tiêu Lighthouse SEO ≥ 90.

## Classification / Risk
- Work item type: FEATURE (initial build)
- Feature change type: ADDITIVE (initial build)
- Scope: CROSS_CUTTING (metadata mọi route + static endpoints)
- Root cause category: n/a
- Review level expected: NORMAL — metadata/static files, không auth/data mutation
- Blast radius: mọi route (SEO layer), `public/*`
- Doc impact: NO_DOC_IMPACT (khớp R-21 + design §1.8)
- Decision impact: NO

## Scope (spec refs)
- **R-21:** SSR/SSG, meta + OpenGraph per page, `sitemap.xml`, `robots.txt`, JSON-LD Organization;
  Lighthouse SEO ≥ 90
- **R-20:** hreflang 2 chiều + localized meta (đối chiếu audit với Layer 0 task-02 helper)
- **R-17 (out scope):** không robots chặn AI sai — theo `skills/ai-friendly-web` gate:
  llms.txt + robots không chặn AI crawlers
- **R-12:** 404 `noindex` (audit) · Design §1.8 (SEO global rules)

## Dependencies
- Layer 2 hoàn tất (đủ 9 nhóm trang để liệt kê sitemap), Layer 0 task-02 (hreflang helper),
  Layer 3 task-01 (health/contact routes — exclude khỏi sitemap)

## Description
1. `src/app/sitemap.ts`: liệt kê mọi route × 2 locale (`vi` không prefix, `en` prefixed),
   `alternates.languages` per entry; exclude `/api/*`, 404.
2. `src/app/robots.ts` hoặc `public/robots.ts`: allow all + `Sitemap: https://ntasolution.vn/sitemap.xml`;
   **không chặn AI crawlers** (gate `skills/ai-friendly-web`).
3. `public/llms.txt`: overview site (theo skill ai-friendly-web — markdown, routes, domain).
4. Metadata audit từng page (`generateMetadata`/`metadata` export): title ≤60 `"%s | NTA"`,
   desc 150–160, `alternates.languages {vi,en,x-default:vi}`, OG (`locale vi_VN/en_US`,
   image 1200×630), Twitter card. `metadataBase = https://ntasolution.vn`.
5. JSON-LD: Organization + WebSite (root layout, 2 locale) · BreadcrumbList (trang con — helper
   tái dùng) · Article (blog detail) · ContactPage (contact) · Service/ItemList (đã baseline
   ở Layer 2 → audit còn thiếu thì bổ sung).
6. OG image asset `public/images/og-default.png` (1200×630, placeholder brand OQ#1).

## Acceptance Criteria
- [ ] `GET /sitemap.xml` trả URL đủ mọi route × 2 locale; không có `/api/*`
- [ ] `GET /robots.txt` allow all + trỏ sitemap; không rule chặn GPTBot/agents (ai-friendly-web gate PASS)
- [ ] `public/llms.txt` tồn tại, mô tả site + routes chính
- [ ] Mọi route có title/desc/hreflang/OG không duplicate; 404 `noindex`
- [ ] JSON-LD hợp lệ (validate qua JSON.parse/Schema.org validator) đúng 2 locale
- [ ] `metadataBase` = `https://ntasolution.vn`; check commands pass

## Verification Summary
- Commands: `npm run lint` · `npm run typecheck` · `npm run build`
- Test: `test_command: null` → curl `/sitemap.xml`, `/robots.txt`, `/llms.txt`; view-source
  kiểm tra meta 3 route mẫu × 2 locale
- Reviewer report: `.context/review-reports/feature-nta-website-layer-4-task-01-round-1-review.md`
- Gate: `skills/ai-friendly-web` (thiếu sitemap/robots/llms.txt → MAJOR → FAIL)

## Retry / Error Memory
- Attempt: 0
- Last failure type: n/a
- Error memory entry: none
- Escalation: none — sau 3 attempt fail → `architecture_review_needed`

## DoD (Definition of Done)
- [ ] Code written (chỉ trong scope)
- [ ] Tests: skip — `test_command: null`, ghi lý do
- [ ] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [ ] Reviewer độc lập PASS
- [ ] `.context/progress.json` updated
- [ ] Error Memory / Doc Impact recorded
- [ ] committed — 1 task = 1 commit (branch `main`, KHÔNG push)

## Files to Create/Modify
- `src/app/sitemap.ts`, `src/app/robots.ts` (hoặc `public/robots.txt`)
- `public/llms.txt`, `public/images/og-default.png`
- `src/lib/seo/jsonld.ts` (helpers Organization/Breadcrumb/Article/ContactPage)
- `src/app/[locale]/layout.tsx` + các `page.tsx` (audit metadata — sửa nhỏ, không đổi UI)

## Notes
- Đổi metadata page không đổi contract → `no doc impact` (docs/DESIGN.md là intent, không sửa).
