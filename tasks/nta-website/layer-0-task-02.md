# Task 02: i18n plumbing — next-intl, locale routes, messages skeleton

## Layer
0

## Type
build (initial)

## Goal
Dựng đường ống song ngữ VI/EN: middleware detect locale, route group `[locale]`, provider next-intl,
messages skeleton VI/EN và hreflang helpers — để mọi page task sau chỉ việc thêm key + nội dung.

## Classification / Risk
- Work item type: FEATURE (initial build)
- Feature change type: ADDITIVE (initial build)
- Scope: SHARED_FOUNDATION (routing/middleware dùng cho mọi route)
- Root cause category: n/a
- Review level expected: NORMAL — middleware đổi routing toàn site, không auth/API/data
- Blast radius: middleware, root layout, mọi route `[locale]/*`
- Doc impact: NO_DOC_IMPACT (i18n đã mô tả trong SPECIFICATIONS.md R-20 + design §Architecture)
- Decision impact: NO

## Scope (spec refs)
- **R-20:** VI mặc định (`/` không prefix), EN ở `/en/...`, toggle `VI|EN`, hreflang 2 chiều + `x-default: vi`
- Design §1.7 (i18n & copy) + §Architecture (`src/i18n/`, `src/middleware.ts`)
- `SPECIFICATIONS.md` Tech Stack: i18n = `next-intl`

## Dependencies
- task-01 (cần scaffold Next.js + dependency `next-intl` cài được)

## Description
1. Cài `next-intl` (đ duy nhất cho i18n — có lý do trong spec).
2. `src/i18n/routing.ts`: `locales: ['vi','en']`, `defaultLocale: 'vi'`, `localePrefix: 'never'`
   (`/` = VI, `/en/...` = EN — đúng design).
3. `src/middleware.ts`: next-intl middleware (detect → redirect `/en` ↔ `/`).
4. `src/i18n/request.ts` + `src/app/[locale]/layout.tsx`: provider `NextIntlClientProvider`,
   `generateStaticParams` cho 2 locale, `html lang` theo locale (vi/en), import messages.
5. `src/i18n/messages/vi.json` + `en.json`: skeleton key namespace (common/nav/footer/cta) —
   nav/footer đầy đủ sẽ hoàn thiện ở Layer 1 task-02; CTA labels canonical theo tokens §11.
6. Placeholder `src/app/[locale]/page.tsx` để build pass (thay bằng trang chủ ở Layer 2 task-01).
7. Helper hreflang/alternates (`src/lib/seo.ts` tối giản) — dùng lại ở Layer 4.

## Acceptance Criteria
- [ ] `/` render VI, `/en` render EN; refresh/redirect không loop
- [ ] `generateStaticParams` sinh `vi` + `en`; `npm run build` build 2 locale tĩnh
- [ ] `messages/vi.json` + `en.json` tồn tại, đủ namespace cơ bản; không có key thiếu bản dịch
- [ ] `hreflang` alternates (`vi`, `en`, `x-default: vi`) render đúng qua helper
- [ ] Route group cũ (`src/app/page.tsx` trực tiếp) không còn trùng với `[locale]` group
- [ ] Check commands pass

## Verification Summary
- Commands: `npm install` · `npm run lint` · `npm run typecheck` · `npm run build`
- Test: `test_command: null` → skip, ghi lý do
- Manual evidence: `npm run dev` → `/` = VI, `/en` = EN, toggle không 404
- Reviewer report: `.context/review-reports/feature-nta-website-layer-0-task-02-round-1-review.md`

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
- [ ] Error Memory / Doc Impact recorded (`no doc impact` nếu không đổi contract)
- [ ] committed — 1 task = 1 commit (branch `main`, KHÔNG push)

## Files to Create/Modify
- `src/i18n/routing.ts`, `src/i18n/request.ts`, `src/i18n/messages/vi.json`, `src/i18n/messages/en.json`
- `src/middleware.ts`
- `src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx` (placeholder)
- `src/lib/seo.ts` (hreflang helper)
- `package.json` (thêm `next-intl`)
- `src/app/layout.tsx`, `src/app/page.tsx` (xóa/gộp khi chuyển sang `[locale]` group)

## Notes
- ⚠️ `[cần xác nhận]` (OQ design §4.5): R-01 Loading/Error hero dưới SSG — design §1.4 đề xuất
  **không có page-level loading/error**; task này chỉ dựng plumbing, không quyết state.
- Middleware chỉ lo locale — KHÔNG thêm logic auth/guard (R-17: v1 không auth).
- Nếu next-intl cần `i18n/request.ts` async config → giữ minimal, không prefetch thừa.
