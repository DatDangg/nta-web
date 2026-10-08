# Task 06: Case Study `/case-studies` + `[slug]` (Screens 8–9)

## Layer
2

## Type
build (initial)

## Goal
Render danh sách case study (FilterBar client-side + grid + pagination + empty state) và trang chi tiết
(MetaBar → Challenge → Solution → Result → Gallery → Related), ≥2 case, slug sai → 404.

## Classification / Risk
- Work item type: FEATURE (initial build)
- Feature change type: ADDITIVE (initial build)
- Scope: SINGLE_SURFACE (list + dynamic route — filter/pagination là client state)
- Root cause category: n/a
- Review level expected: NORMAL — data tĩnh, không API; nâng STRICT nếu phát hiện client fetch ẩn
- Blast radius: `/case-studies/*` (2 locale)
- Doc impact: NO_DOC_IMPACT (khớp design Screens 8–9 + R-08)
- Decision impact: NO

## Scope (spec refs)
- **R-08:** list (filter theo mảng, pagination) + chi tiết (meta bar, Challenge→Solution→Result,
  gallery, related); ≥2 case (Óc Eo, phòng khám…); empty state list `[cần xác nhận]` → design §1.4 chốt
- **R-23:** responsive (filter scroll-snap mobile; grid 1→2→3 cột; meta bar stack→wrap; result 2×2→4)
- **R-24:** FilterBar `role="group"` + `aria-pressed`, announce `role="status"`,
  Pagination `aria-current`, MetaBar `<dl>`
- **R-25 BR-004:** không công bố khách hàng chưa được phép → anonymize
- Design: Screens 8 & 9

## Dependencies
- Layer 1: task-02 (shell), task-03 (cards/PageHeader/Breadcrumb), task-04 (FilterBar/Pagination/EmptyState);
  Layer 0 task-04 (≥2 case content)

## Description
1. `src/app/[locale]/case-studies/page.tsx` (Screen 8): PageHeader + Breadcrumb ·
   FilterBar (pills Tất cả/Doanh nghiệp/AI/App AI, client-side, `?filter=` deep link) ·
   grid `CaseStudyCard` · Pagination (`?page=`, pageSize 9) · EmptyState khi filter rỗng
   ("Chưa có case study trong mảng này." + "Xóa bộ lọc").
2. `src/app/[locale]/case-studies/[slug]/page.tsx` (Screen 9):
   - `generateStaticParams` từ content; slug sai → `notFound()`
   - MetaBar `<dl>` (Khách hàng · Lĩnh vực · Năm — KHÔNG middle-dot liền mạch) ·
     ChallengeBlock → SolutionBlock → ResultBlock (số liệu thật, số lớn `display`, 3–4 chỉ số,
     **không count-up**) · ImageGallery (trống → ẩn) · RelatedStudies 3 card (trống → ẩn) · CTABanner alt
   - metadata per case; JSON-LD Article `CreativeWork` (baseline)
3. Filter + pagination là client component nhận list đã render từ server (không fetch API).
4. Copy VI/EN; messages key `caseStudies.*`.

## Acceptance Criteria
- [ ] List: filter đổi client-side không reload, `aria-pressed` + announce số kết quả; `?filter=` giữ khi đổi `?page=`
- [ ] Empty filter → message + nút "Xóa bộ lọc" hoạt động
- [ ] ≥2 case build tĩnh 2 locale; chi tiết đủ MetaBar/Challenge/Solution/Result/Related
- [ ] Slug sai → 404; BR-004: không tên khách chưa xin phép; số liệu không bịa
- [ ] MetaBar `<dl>` semantic; pagination `aria-current`; responsive khớp bảng Screen 8/9
- [ ] Check commands pass

## Verification Summary
- Commands: `npm run lint` · `npm run typecheck` · `npm run build`
- Test: `test_command: null` → skip, ghi lý do
- Manual evidence: filter+pagination deep-link round-trip; 2 case × 2 locale; slug sai → 404;
  filter rỗng → EmptyState
- Reviewer report: `.context/review-reports/feature-nta-website-layer-2-task-06-round-1-review.md`

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
- `src/app/[locale]/case-studies/page.tsx`
- `src/app/[locale]/case-studies/[slug]/page.tsx`
- `src/components/case-studies/MetaBar.tsx`, `ChallengeBlock.tsx`, `SolutionBlock.tsx`,
  `ResultBlock.tsx`, `ImageGallery.tsx`, `RelatedStudies.tsx`, `CaseStudyFilter.tsx` (client)
- `src/i18n/messages/{vi,en}.json` (`caseStudies.*`)

## Notes
- Gallery lightbox **không bắt buộc v1** (design Screen 9) — nếu làm thì focus trap + Esc; skip = ghi lý do.
- Pagination list page: pageSize 9; nếu ≤9 case → ẩn pagination (empty/minimal policy).
