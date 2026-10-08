# Task 03: PageHeader, Breadcrumb, CTABanner + card family

## Layer
1

## Type
build (initial)

## Goal
Dựng bộ component nội dung dùng chung: `PageHeader`, `Breadcrumb`, `CTABanner` và card family
(`SolutionCard`, `ProductCard`, `CaseStudyCard`, `PostCard`, `AppCard`) — các page task ở Layer 2
chỉ compose, không viết lại card.

## Classification / Risk
- Work item type: FEATURE (initial build)
- Feature change type: ADDITIVE (initial build)
- Scope: SHARED_FOUNDATION (component library — dùng mọi trang)
- Root cause category: n/a
- Review level expected: NORMAL — UI component thuần props, không data fetch/auth
  (reviewer được quyền nâng STRICT nếu phát hiện logic ẩn)
- Blast radius: mọi trang nội dung (Layer 2)
- Doc impact: NO_DOC_IMPACT (khớp design §1.9 Component library)
- Decision impact: NO

## Scope (spec refs)
- Design §1.9 (component library), §1.3 (cấm lặp layout family, cấm card nếu không cần elevation)
- **R-02** (card style baseline: ảnh + heading + 1 dòng + link, hover lift),
  **R-05/R-06/R-07/R-08/R-09** (card dùng cho solutions/products/case-studies/blog)
- **R-24:** 1 focus target/card (link bọc cả khối, không nested link), alt ảnh
- **R-23:** grid card responsive 1→2→3 cột

## Dependencies
- task-01 Layer 1 (tokens/Button/Badge), task-03 Layer 0 (content types → typed props),
  task-04 Layer 0 (content data — chỉ để test render)

## Description
1. `PageHeader`: h1 (`display`/`--text-hero` theo screen) + 1 dòng dẫn + Breadcrumb; variants
   centered (about/home) / left (list pages).
2. `Breadcrumb`: `aria-label="Breadcrumb"`, semantic `<nav>`, tối đa 3 cấp
   (Trang chủ › Mảng › Trang), link locale-aware.
3. `CTABanner`: variant `primary` (nền primary, text inverse, button trắng) / `alt` (nền alt);
   1 CTA/intent (tokens §11), không wrap desktop.
4. Card family (props lấy từ content types):
   - `SolutionCard`: ảnh + h3 + 1 dòng + "Tìm hiểu thêm"; hover lift `-4px` + `shadow-sm`
   - `ProductCard`: screenshot + tên + 1 dòng (cho strip home) · `AppCard`: card lớn + bullets +
     DownloadLinks slot (Screen 7 — slot/null-safe)
   - `CaseStudyCard`: ảnh + Badge mảng + tên + 1 dòng kết quả + năm
   - `PostCard`: ảnh bìa + Badge danh mục + `<time>` + h3 + tóm tắt
5. Mỗi card: link bọc cả khối (1 focus target), `rounded-lg`, aspect-ratio ảnh (CLS < 0.1),
   fallback ảnh `surface-sunken`, hover respect reduced-motion.

## Acceptance Criteria
- [ ] 6 component tạo xong, props typed theo content types (không `any`)
- [ ] Card link bọc khối — không nested `<a>`; keyboard tab mỗi card 1 stop, focus ring thấy
- [ ] Grid responsive: 1 cột base → 2 cột md → 3 cột lg (khớp R-23)
- [ ] Hover lift + arrow shift có trong scope tokens; reduced-motion → không animate
- [ ] Alt ảnh bắt buộc (prop) — không có alt rỗng cho ảnh nội dung
- [ ] Breadcrumb hoạt động cả 2 locale, đúng cấu trúc semantic
- [ ] File mỗi component ≤300 dòng; check commands pass

## Verification Summary
- Commands: `npm run lint` · `npm run typecheck` · `npm run build`
- Test: `test_command: null` → skip, ghi lý do
- Manual evidence: render thử từng card với content mẫu (task-04) ở 2 locale + 3 breakpoint
- Reviewer report: `.context/review-reports/feature-nta-website-layer-1-task-03-round-1-review.md`

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
- `src/components/shared/PageHeader.tsx`, `Breadcrumb.tsx`, `CTABanner.tsx`
- `src/components/cards/SolutionCard.tsx`, `ProductCard.tsx`, `AppCard.tsx`,
  `CaseStudyCard.tsx`, `PostCard.tsx`
- `src/i18n/messages/{vi,en}.json` (label CTA/breadcrumb key)

## Notes
- Anti-slop (design §1.3): KHÔNG 3 card icon+heading+text y hệt — card phải có ảnh thật;
  không eyebrow/kicker; không em-dash trong chuỗi UI.
- Card chưa cần elevation thật → ưu tiên spacing/divider (design rule) — chỉ `shadow` khi hover.
