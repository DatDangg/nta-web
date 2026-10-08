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
- [x] 2 AppCard đủ: media (carousel), tên, mô tả, bullets, DownloadLinks-or-badge
- [x] Carousel: prev/next button có `aria-label`, dots `aria-current`, swipe + keyboard qua nút (arrows chỉ khi >1 ảnh)
- [x] Chưa có link tải → badge "Sắp ra mắt" (validate http(s), không link chết)
- [x] lg: 2 card song song; base: stack 1 cột; ảnh 4:5 ở xl
- [x] Metadata 2 locale + hreflang; check commands pass

## Verification Summary
- Commands: `npm run lint` · `npm run typecheck` · `npm run build` — PASS (primary re-run sau reviewer r2; 27 static pages; `/vi|/en/products` SSG)
- Test: `test_command: null` → skip, chưa có test framework
- Manual evidence: reviewer CSS math; carousel single-image (1 slide + dot, không arrow) do content 1 ảnh/sp
- Reviewer report: `.context/review-reports/feature-nta-website-layer-2-task-05-round-2-review.md` (r1 FAIL 2 MAJOR → r2 PASS, NORMAL)

## Retry / Error Memory
- Attempt: 1 (builder #1 interrupted incomplete → redo; r1 FAIL: MAJOR-1 ảnh trùng + MAJOR-2 carousel nhiều ảnh → fix AppCard media slot + MINOR → r2 PASS)
- Last failure type: MAJOR duplicate media (carousel nhét nhầm vào slot downloadLinks)
- Error memory entry: xem Error 3 (pattern media-slot/duplicate) — không thêm entry mới
- Escalation: none — sau 3 attempt fail → `architecture_review_needed`

## DoD (Definition of Done)
- [x] Code written (chỉ trong scope — gồm AppCard media slot, 1 consumer duy nhất)
- [x] Tests: skip — `test_command: null`, ghi lý do
- [x] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [x] Reviewer độc lập PASS (r2 NORMAL)
- [x] `.context/progress.json` updated
- [x] Error Memory / Doc Impact recorded (NO_DOC_IMPACT)
- [x] committed — 1 task = 1 commit (branch `main`, KHÔNG push)

## Files to Create/Modify
- `src/app/[locale]/products/page.tsx`
- `src/components/products/ScreenshotCarousel.tsx`, `DownloadLinks.tsx` (nếu tách)
- `src/i18n/messages/{vi,en}.json` (`products.*`)

## Notes
- Không autoplay carousel; reduced-motion → không auto-snap animation.
