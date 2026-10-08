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
- **R-24:** 1 focus target/card (link bọc cả khối, không nested link), alt ảnh; AppCard có download CTA riêng nên title/content link và download links là các focus target độc lập, không lồng nhau
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
- [x] 6 component tạo xong, props typed theo content types (không `any`)
- [x] Card link bọc khối — không nested `<a>`; AppCard tách title/content link khỏi download CTA; focus ring thấy
- [x] Grid responsive helper pattern: 1 cột base → 2 cột md → 3 cột lg (khớp R-23)
- [x] Hover lift + arrow shift có trong scope tokens; reduced-motion → không animate
- [x] Alt ảnh bắt buộc (prop) — không có alt rỗng cho ảnh nội dung
- [x] Breadcrumb hoạt động cả 2 locale, đúng cấu trúc semantic
- [x] File mỗi component ≤300 dòng; check commands pass

## Verification Summary
- Commands (fix attempt 1): `npm run lint` PASS · `npm run typecheck` PASS · `npm run build` PASS
- Reviewer fixes: AppCard link riêng cho nội dung, slot downloadLinks render ngoài link (không nested anchor); CTABanner primary dùng `inverse` button variant độc lập, nền surface trắng + text tối. Production CSS chứa `.bg-surface`, `.text-text-primary`, `.hover\\:bg-surface-sunken:hover`; text `#1d1d1f` trên trắng `#ffffff` contrast **16.83:1** (WCAG AA ≥4.5:1).
- Minor fixes: PostCard cover ratio 16:9; thêm `sizes` cho toàn bộ next/image card; breadcrumb giữ Trang chủ + separator `›`; thiếu ảnh render `surface-sunken` fallback.
- Test: `test_command: null` → skip, ghi lý do
- Manual evidence: route render content mẫu chưa có trong Layer 1; kiểm tra static markup/component và production build thành công, Next.js build prerendered `/vi` + `/en`. Component tự chọn locale cho breadcrumb, dates và CTA; responsive classes cover 375/768/1280. Cần visual QA khi task page compose content thực.
- Reviewer report: `.context/review-reports/feature-nta-website-layer-1-task-03-round-2-review.md` — Verdict **PASS** (STRICT, 0 CRITICAL/MAJOR, 4 MINOR non-blocking; round 1 FAIL → fix)

## Retry / Error Memory
- Attempt: 1
- Last failure type: reviewer STRICT round 1 — 2 MAJOR (nested interactive AppCard; CTABanner contrast/style override)
- Error memory entry: root causes xác định trong report reviewer; fixed: AppCard interactive slot sibling ngoài title/content link; CTABanner dùng variant style không chồng background utilities.
- Retry Attempt: 1
- Escalation: none — sau 3 attempt fail → `architecture_review_needed`

## DoD (Definition of Done)
- [x] Code written (chỉ trong scope)
- [x] Tests: skip — `test_command: null`, không có test framework được cấu hình
- [x] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [x] Reviewer độc lập PASS
- [x] `.context/progress.json` updated
- [x] Error Memory / Doc Impact recorded: không có lỗi; NO_DOC_IMPACT
- [x] committed — 1 task = 1 commit (branch `main`, KHÔNG push)

## Files to Create/Modify
- `src/components/shared/PageHeader.tsx`, `Breadcrumb.tsx`, `CTABanner.tsx`
- `src/components/cards/SolutionCard.tsx`, `ProductCard.tsx`, `AppCard.tsx`,
  `CaseStudyCard.tsx`, `PostCard.tsx`
- `src/i18n/messages/{vi,en}.json` (label CTA/breadcrumb key)

## Notes
- Anti-slop (design §1.3): KHÔNG 3 card icon+heading+text y hệt — card phải có ảnh thật;
  không eyebrow/kicker; không em-dash trong chuỗi UI.
- Card chưa cần elevation thật → ưu tiên spacing/divider (design rule) — chỉ `shadow` khi hover.
- Implemented shared card grid utility `cardGridClass` for 1/2/3-column responsive composition. Reuses existing canonical CTA and home breadcrumb labels, so locale message files needed no changes.
- AppCard có nhiều CTA theo Screen 7 nên không ép một focus target trên toàn card: title/content là link tới detail, DownloadLinks là CTA link độc lập; cả hai cùng cấp và không lồng interactive elements.
- Doc Impact: `NO_DOC_IMPACT`; component library implements the approved design spec without changing documented contracts, schema, or behavior.
