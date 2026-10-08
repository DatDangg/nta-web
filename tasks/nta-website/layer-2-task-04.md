# Task 04: Giải pháp AI `/solutions/ai` + 3 slug (Screens 5–6)

## Layer
2

## Type
build (initial)

## Goal
Render overview `/solutions/ai` (3 card + CaseStudyTeaser) + 3 trang con `boxai|flycam|custom-ai`
(FeatureList → UseCases → CaseStudyLink → CTA zone), slug sai → 404.

## Classification / Risk
- Work item type: FEATURE (initial build)
- Feature change type: ADDITIVE (initial build)
- Scope: SINGLE_SURFACE (1 overview + 3 dynamic routes)
- Root cause category: n/a
- Review level expected: NORMAL — SSG tĩnh
- Blast radius: `/solutions/ai/*` (2 locale × 4 trang)
- Doc impact: NO_DOC_IMPACT (khớp design Screens 5–6 + R-06)
- Decision impact: NO

## Scope (spec refs)
- **R-06:** overview + slug (`boxai|flycam|custom-ai`); mỗi trang có mô tả + case study liên quan (vd Óc Eo)
- **R-23:** responsive (md 2 cột, lg 3 cột; UseCases 2–3 cột; CaseStudyLink 2 cột)
- **R-24:** list semantic, số liệu có text mở rộng (không chỉ màu/số)
- **R-21/R-20:** metadata/JSON-LD (BreadcrumbList + ItemList/Service)
- Design: Screens 5 & 6

## Dependencies
- Layer 1: task-02 (shell), task-03 (cards/Breadcrumb), task-04 (Reveal);
  Layer 0 task-03 (slug helpers) + task-04 (content 3 slug + case study Óc Eo)

## Description
1. `src/app/[locale]/solutions/ai/page.tsx` (Screen 5): PageHeader + Breadcrumb · SolutionIntro ·
   SolutionGrid 3 `SolutionCard` (md: 2 cột + 1 full-width/2+1) · **CaseStudyTeaser**
   (split nhỏ, KHÔNG lặp grid family; trống → ẩn) · CTABanner alt.
2. `src/app/[locale]/solutions/ai/[slug]/page.tsx` (Screen 6):
   - `generateStaticParams` 3 slug × 2 locale; slug sai → `notFound()`
   - PageHeader + Breadcrumb · FeatureList · UseCases grid (`<ul>`) ·
     **CaseStudyLink** block link sang `/case-studies/{slug}` tương ứng (không có case → ẩn)
   - main `max-w-[720px]` xl; metadata riêng từng slug ("BoxAI | NTA")
   - CTA zone: CTABanner alt (CTAForm compact → Layer 3 task-03)
3. Copy theo design Screen 5/6 (VI/EN); messages key `solutions.ai.*`.

## Acceptance Criteria
- [x] Overview: 3 card + CaseStudyTeaser + CTABanner; không lặp layout family grid (2+1 keyed position)
- [x] 3 slug build tĩnh 2 locale (`getAiStaticParams`); slug sai → `notFound()` (404)
- [x] CaseStudyLink trỏ đúng route case study cùng locale; case null → ẩn block (content chưa khai relatedCases)
- [x] UseCases semantic list; số liệu kèm mô tả text (a11y) — N/A, content AI không có số liệu
- [x] Responsive khớp bảng Screen 5/6; metadata/alternates riêng slug (brand map)
- [x] Check commands pass

## Verification Summary
- Commands: `npm run lint` · `npm run typecheck` · `npm run build` — PASS (primary re-run sau reviewer r2; 25 static pages; AI overview + 6 detail route SSG)
- Test: `test_command: null` → skip, chưa có test framework
- Manual evidence: reviewer CSS math; order 2+1 xác minh code (sort theo `aiSlugs` + position)
- Reviewer report: `.context/review-reports/feature-nta-website-layer-2-task-04-round-2-review.md` (r1 FAIL 2 MAJOR → fix → **r2 PASS**, NORMAL)

## Retry / Error Memory
- Attempt: 1 (r1 FAIL: MAJOR-1 order readdir + 2+1 key theo slug; MAJOR-2 nested `<main>` → fix sort/position + `<div>` + MINOR-2/3 → r2 PASS)
- Last failure type: MAJOR a11y/semantics + non-deterministic layout
- Error memory entry: cân nhắc ghi "readdir không sort → order không tất định" (xem error-memory)
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
- `src/app/[locale]/solutions/ai/page.tsx`
- `src/app/[locale]/solutions/ai/[slug]/page.tsx`
- `src/components/solutions/UseCases.tsx`, `CaseStudyLink.tsx`, `CaseStudyTeaser.tsx`
- `src/i18n/messages/{vi,en}.json` (`solutions.ai.*`)

## Notes
- h1 pattern design: dùng "{Tên} cho doanh nghiệp" — **không em-dash** ( Screen 6 ghi rõ).
- Cross-link case study phải cùng locale (`/en/case-studies/...` khi đang EN).
