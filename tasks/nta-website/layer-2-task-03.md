# Task 03: Giải pháp Doanh nghiệp `/solutions/enterprise` + 4 slug (Screens 3–4)

## Layer
2

## Type
build (initial)

## Goal
Render overview `/solutions/enterprise` (4 card) + 4 trang con `crm|hrm|lms|dentgo`
(content 2 cột main + sidebar, FeatureList → BenefitList → Screenshot → Related), slug sai → 404.

## Classification / Risk
- Work item type: FEATURE (initial build)
- Feature change type: ADDITIVE (initial build)
- Scope: SINGLE_SURFACE (1 overview + 4 dynamic routes)
- Root cause category: n/a
- Review level expected: NORMAL — SSG tĩnh, slug list hard từ content
- Blast radius: `/solutions/enterprise/*` (2 locale × 5 trang)
- Doc impact: NO_DOC_IMPACT (khớp design Screens 3–4 + R-05)
- Decision impact: NO

## Scope (spec refs)
- **R-05:** overview + 4 slug (`crm|hrm|lms|dentgo`); mỗi trang: mô tả tính năng + lợi ích + CTA;
  slug sai → 404
- **R-23:** responsive (2×2 grid lg; main + sidebar sticky ≥lg; `max-w-[720px]` xl)
- **R-24:** Breadcrumb `aria-label`, sidebar `<aside>`, `generateStaticParams`
- **R-21/R-20:** metadata/JSON-LD BreadcrumbList + Service (baseline; audit Layer 4)
- Design: Screens 3 & 4

## Dependencies
- Layer 1: task-02 (shell), task-03 (cards/PageHeader/Breadcrumb), task-04 (Reveal);
  Layer 0 task-03 (slug helpers) + task-04 (content 4 slug)

## Description
1. `src/app/[locale]/solutions/enterprise/page.tsx` (Screen 3): PageHeader + Breadcrumb
   (Trang chủ › Giải pháp Doanh nghiệp) · SolutionIntro `body-lg max-w-[65ch]` ·
   SolutionGrid 4 `SolutionCard` (`<ul>/<li>`, 1 focus/card, 2×2 ở lg) · CTABanner alt.
2. `src/app/[locale]/solutions/enterprise/[slug]/page.tsx` (Screen 4):
   - `generateStaticParams` = 4 slug × 2 locale; slug không hợp lệ → `notFound()` (404 task L1-05)
   - Layout: PageHeader + Breadcrumb · main (FeatureList list+icon KHÔNG table dày → BenefitList
     2×2 nền alt → ScreenshotSection) · aside RelatedSolutions (sticky `top-24` ≥lg, trống → ẩn)
   - **CTAForm compact: KHÔNG ở task này** — Layer 3 task-03 tích hợp (để tách form khỏi UI task)
   - metadata riêng/slug ("Giải pháp CRM | NTA" / "CRM Solution | NTA")
3. Feature/Benefit copy từ content task-04 (VI/EN); messages key `solutions.*`.
4. Empty: không case liên quan → ẩn RelatedSolutions.

## Acceptance Criteria
- [x] `/solutions/enterprise` render 4 card đúng link; grid 1→2→2×2 theo bp
- [x] 4 slug build tĩnh cả 2 locale (`generateStaticParams` đủ); slug sai → `notFound()` (404 L1-05)
- [x] Sidebar sticky ≥lg; main `max-w-[720px]` ở xl; Breadcrumb semantic
- [x] CTABanner alt có ở cuối (CTA đã chốt — không CTAForm ở task này)
- [x] Metadata/alternates khác nhau từng slug; check commands pass

## Verification Summary
- Commands: `npm run lint` · `npm run typecheck` · `npm run build` — PASS (primary re-run sau reviewer r2; 17 static pages; `/vi|/en/solutions/enterprise` + 8 detail route SSG)
- Test: `test_command: null` → skip, chưa có test framework
- Manual evidence: reviewer dùng code + CSS math; slug sai 404 dựa code `notFound()` (chưa exercise HTTP thủ công)
- Reviewer report: `.context/review-reports/feature-nta-website-layer-2-task-03-round-2-review.md` (r1 PASS + 5 MINOR → fix #2/#3/#4 + refine brand metadata → **r2 PASS**, NORMAL)

## Retry / Error Memory
- Attempt: 1 (r1 PASS nhưng 5 MINOR → fix DENTGO casing / breadcrumb wording / related category guard + brand-map metadata → r2 PASS)
- Last failure type: MINOR correct (brand casing slug.toUpperCase → "DENTGO")
- Error memory entry: none
- Escalation: none — sau 3 attempt fail → `architecture_review_needed`

## DoD (Definition of Done)
- [x] Code written (chỉ trong scope)
- [x] Tests: skip — `test_command: null`, ghi lý do
- [x] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [x] Reviewer độc lập PASS (r2 NORMAL)
- [x] `.context/progress.json` updated
- [x] Error Memory / Doc Impact recorded (NO_DOC_IMPACT)
- [x] committed — 1 task = 1 commit (branch `main`, KHÔNG push)

## Files to Create/Modify
- `src/app/[locale]/solutions/enterprise/page.tsx`
- `src/app/[locale]/solutions/enterprise/[slug]/page.tsx`
- `src/components/solutions/FeatureList.tsx`, `BenefitList.tsx`, `ScreenshotSection.tsx`,
  `RelatedSolutions.tsx`
- `src/i18n/messages/{vi,en}.json` (`solutions.enterprise.*`)

## Notes
- CTAForm compact sẽ được chèn vào cuối detail ở Layer 3 task-03 — đừng hardcode placeholder form ở đây.
- BR-003: nội dung đúng mảng doanh nghiệp (CRM/HRM/LMS/DentGo), không trộn sản phẩm ngoài danh mục.
