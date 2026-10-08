# Task 05: Sản phẩm App `/products` (Screen 7)

## Layer
2

## Type
build (initial)

## Goal
Render trang Products với 2 AppCard lớn (Music app, Hair-style AI): screenshot carousel,
feature bullets, DownloadLinks (hoặc badge "Sắp ra mắt" khi chưa có link).

## Classification / Risk
- Work item type: FEATURE (initial build)
- Feature change type: ADDITIVE (initial build)
- Scope: SINGLE_SURFACE (1 route)
- Root cause category: n/a
- Review level expected: NORMAL — trang tĩnh, carousel client-leaf
- Blast radius: route `/products` (2 locale)
- Doc impact: NO_DOC_IMPACT (khớp design Screen 7 + R-07)
- Decision impact: NO

## Scope (spec refs)
- **R-07:** Music app & Hair-style AI — mô tả, ảnh/screenshot, kênh tải (nếu có); Priority Medium
- **R-23:** responsive (2 card song song ≥lg; carousel 1→2→3 ảnh + arrow; ảnh 4:5 xl)
- **R-24:** carousel `role="region"` + `aria-roledescription`, nút prev/next `aria-label`,
  dots = button `aria-current`, store badge alt
- **R-21/R-20:** metadata per page · Design: Screen 7

## Dependencies
- Layer 1: task-02 (shell), task-03 (PageHeader/Breadcrumb/AppCard/CTABanner), task-04 (Reveal);
  Layer 0 task-04 (product content)

## Description
1. `src/app/[locale]/products/page.tsx`: PageHeader + Breadcrumb · intro 1 dòng ·
   AppCard ×2 · CTABanner alt. Metadata ("Sản phẩm App | NTA" / "Apps | NTA").
2. `ScreenshotCarousel` (page-local hoặc tái sử từ L1 task-04 nếu đã có): snap + dots + arrow,
   keyboard qua nút, ảnh lazy (không `priority`).
3. Empty state (§1.4): `downloadLinks = null` → ẩn DownloadLinks + hiện Badge "Sắp ra mắt"/"Coming soon";
   ảnh lỗi → fallback `surface-sunken`.
4. JSON-LD `SoftwareApplication` chỉ khi có link thật (hiện null → bỏ, ghi chú).
5. Copy Screen 7 VI/EN; messages key `products.*`.

## Acceptance Criteria
- [ ] 2 AppCard đủ: screenshot, tên, mô tả, bullets, DownloadLinks-or-badge
- [ ] Carousel: prev/next button có `aria-label`, dots `aria-current`, swipe + keyboard hoạt động
- [ ] Chưa có link tải → badge "Sắp ra mắt" (không hiện link chết)
- [ ] lg: 2 card song song; base: stack 1 cột; ảnh 4:5 ở xl
- [ ] Metadata 2 locale + hreflang; check commands pass

## Verification Summary
- Commands: `npm run lint` · `npm run typecheck` · `npm run build`
- Test: `test_command: null` → skip, ghi lý do
- Manual evidence: dev `/products` + `/en/products` — carousel keyboard/swipe, badge empty state
- Reviewer report: `.context/review-reports/feature-nta-website-layer-2-task-05-round-1-review.md`

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
- `src/app/[locale]/products/page.tsx`
- `src/components/products/ScreenshotCarousel.tsx`, `DownloadLinks.tsx` (nếu tách)
- `src/i18n/messages/{vi,en}.json` (`products.*`)

## Notes
- Không autoplay carousel; reduced-motion → không auto-snap animation.
