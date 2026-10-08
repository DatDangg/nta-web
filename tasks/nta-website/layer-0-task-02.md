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
2. `src/i18n/routing.ts`: `locales: ['vi','en']`, `defaultLocale: 'vi'`, `localePrefix: 'as-needed'`
   (`/` = VI, `/en/...` = EN — đúng design). *(Deviation so với bản nháp `'never'`: `'never'` không sinh
   prefix `/en` → dùng `'as-needed'`; xem Notes.)*
3. `src/middleware.ts`: next-intl middleware (detect → redirect `/en` ↔ `/`).
4. `src/i18n/request.ts` + `src/app/[locale]/layout.tsx`: provider `NextIntlClientProvider`,
   `generateStaticParams` cho 2 locale, `html lang` theo locale (vi/en), import messages.
5. `src/i18n/messages/vi.json` + `en.json`: skeleton key namespace (common/nav/footer/cta) —
   nav/footer đầy đủ sẽ hoàn thiện ở Layer 1 task-02; CTA labels canonical theo tokens §11.
6. Placeholder `src/app/[locale]/page.tsx` để build pass (thay bằng trang chủ ở Layer 2 task-01).
7. Helper hreflang/alternates (`src/lib/seo.ts` tối giản) — dùng lại ở Layer 4.

## Acceptance Criteria
- [x] `/` render VI, `/en` render EN; refresh/redirect không loop (dev smoke: `/`=Trang chủ 200, `/en`=Home 200)
- [x] `generateStaticParams` sinh `vi` + `en`; `npm run build` build 2 locale tĩnh (build output `/vi` + `/en`)
- [x] `messages/vi.json` + `en.json` tồn tại, đủ namespace cơ bản (common/nav/footer/cta); không có key thiếu bản dịch
- [x] `hreflang` alternates (`vi`, `en`, `x-default: vi`) sinh đúng qua helper `createLocaleAlternates` — *(helper hoàn thành; việc gọi vào page metadata defer Layer 2/4 theo thiết kế)*
- [x] Route group cũ (`src/app/page.tsx` trực tiếp) không còn trùng với `[locale]` group (đã xóa `src/app/page.tsx`)
- [x] Check commands pass

## Verification Summary
- Commands: `npm install` PASS · `npm run lint` PASS · `npm run typecheck` PASS · `npm run build` PASS (SSG `/vi` + `/en`)
- Test: `test_command: null` → skip (v1 chưa có test framework)
- Manual evidence: dev smoke `/` = `Trang chủ` (200), `/en` = `Home` (200), không redirect loop
- Reviewer report: `.context/review-reports/feature-nta-website-layer-0-task-02-round-1-review.md` — Verdict **PASS** (STRICT, 0 CRITICAL/MAJOR)

## Retry / Error Memory
- Attempt: 0
- Last failure type: n/a
- Error memory entry: none
- Escalation: none — sau 3 attempt fail → `architecture_review_needed`

## DoD (Definition of Done)
- [x] Code written (chỉ trong scope)
- [x] Tests: skip — `test_command: null`, ghi lý do
- [x] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [x] Reviewer độc lập PASS (STRICT)
- [x] `.context/progress.json` updated
- [x] Error Memory / Doc Impact recorded (`NO_DOC_IMPACT`)
- [x] committed — 1 task = 1 commit (branch `main`, KHÔNG push)

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
- **Deviation:** dùng `localePrefix: 'as-needed'` thay vì `'never'`, vì `'never'` không sinh `/en`; R-20 và AC yêu cầu VI tại `/` và EN tại `/en`. `next-intl` v4.14.9; cấu hình Next plugin trỏ tới `src/i18n/request.ts`, routing định nghĩa locale/default/prefix, request config nạp messages tương ứng. Build SSG xuất `/vi` + `/en`; middleware rewrite mặc định `/` cho VI.
- **Verify:** `npm install`, lint, typecheck, build và dev smoke check `/` (VI) + `/en` (EN) PASS. Test suite skip do `test_command: null` và chưa có test framework. `npm audit --audit-level=high` FAIL vì dependency tree hiện hữu có 9 high/3 moderate; remediation force sẽ nâng breaking Next/Tailwind nên không sửa ngoài scope. oxlint reported only pre-existing `next-env.d.ts` triple-slash warning.

## Notes (close-out)
- **Doc Impact: NO_DOC_IMPACT** (i18n đã mô tả trong SPECIFICATIONS.md R-20 + design §Architecture).
- **Primary surgical fix** trước review: (1) `package.json` — builder tạo lặp key `next-intl` 2 lần → dedup còn 1;
  (2) `.gitignore` — thêm `*.tsbuildinfo` (loại `tsconfig.tsbuildinfo` khỏi git).
- **Residual risk / follow-up (không block PASS):**
  1. Reviewer Finding MINOR: `src/lib/seo.ts` fallback base URL `https://ntasolution.vn` hardcode → nên dùng chung
     hằng với `metadataBase` khi dựng metadata (Layer 2/4).
  2. `npm audit` 9 high/3 moderate (ngoài `check_commands`) — follow-up ngoài Layer 0.
  3. Helper hreflang chưa được page nào gọi (defer Layer 2/4 theo thiết kế).
  4. eslint 8 EOL (kế thừa từ task-01).
- ⚠️ Protocol: builder subagent tự ghi journal + task file (vi phạm "subagent KHÔNG ghi") — Primary reconcile.
