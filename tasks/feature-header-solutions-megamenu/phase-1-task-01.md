# Task 01: Header — dropdown "Giải pháp" thành mega menu 2 cột (dữ liệu giải pháp thật)

> Nguồn: CR-010 · Spec: R-11 (không đổi requirement) · Ref: `refs/mockup-megamenu.png`

## Phase
1 — UI (layout)

## Type
modification (Header) + addition (1 hàm dựng dữ liệu menu, 1 component menu)

## Scope
- `src/lib/content/solutions-menu.ts` (MỚI): `getSolutionsMenu(locale)` — 2 nhóm `enterprise` / `ai`:
  tên nhóm = `listingPages[locale][group].title`, tagline = `lead + accent`, mô tả = `description`;
  mục con = giải pháp mdx theo thứ tự `enterpriseSlugs` / `aiSlugs` (title từ mdx, mô tả ngắn + icon từ
  `listingItems[locale][slug]`), link `/solutions/<category>/<slug>`. Không thêm chuỗi i18n mới.
- `src/components/layout/SolutionsMegaMenu.tsx` (MỚI, client): panel 2 cột theo mockup — cột trái 2 nhóm
  (icon building/cpu, tên, tagline, `>`; nhóm đang chọn nền primary nhạt), đường kẻ dọc, cột phải tiêu đề +
  mô tả nhóm + danh sách mục con (icon ô vuông nền primary nhạt + tên + mô tả ngắn).
  Hover/focus nhóm → đổi cột phải; click nhóm → trang listing nhóm.
- `src/components/layout/Header.tsx`: nhận prop `solutionsMenu`, thay `<ul>` 2 link bằng `SolutionsMegaMenu`;
  giữ nguyên logic mở/đóng (hover, click, click ngoài, Esc, đổi trang, ArrowDown, header không ẩn khi mở).
- `src/app/[locale]/layout.tsx`: `<Header solutionsMenu={await getSolutionsMenu(locale)} />`.
- KHÔNG đụng `MobileNav.tsx`, i18n messages, `listing/icons.tsx` (đang có thay đổi dở của CR-008).

## Classification / Risk
- Change type: **MODIFY** (UI header, không đổi requirement/route) → no spec bump (giống CR-009)
- Review level: **NORMAL** · Blast radius: header mọi trang (desktop ≥ lg)
- Doc impact: none

## Acceptance Criteria
- [x] Desktop: mega menu 2 cột đúng bố cục mockup (vi + en)
- [x] Cột phải = giải pháp thật của nhóm (enterprise: CRM, HRM, LMS, DentGo · ai: BoxAI, Flycam, Talvra), link chi tiết đúng
- [x] Hover/focus nhóm đổi cột phải; click nhóm → `/solutions/enterprise|ai`
- [x] Giữ hành vi mở/đóng + a11y cũ; mobile nav không đổi
- [x] typecheck + lint + build PASS

## Feature Verification
- Acceptance: **PASS** · Reviewer: **PASS NORMAL (round 1)** — 0 CRITICAL/MAJOR
- Verify: `bash tools/linux-build.sh verify` = typecheck PASS · lint PASS (1 warning cũ `<img>` ở mdx) · build PASS
- Smoke `next start`: `/`, `/en`, `/solutions/enterprise`, `/en/solutions/ai/boxai` = 200
- Visual: dựng panel với CSS build thật trên HTML trang chủ, chụp 1440/1280/1024 — panel 768px nằm gọn trong viewport (phải ≤ 1004px ở 1024)
- Ghi chú: menu chỉ render khi mở → ArrowDown focus nhóm đầu qua `requestAnimationFrame`.
- Doc impact: none

## Review
| Round | Verdict | Report |
|---|---|---|
| 1 | **PASS NORMAL** | `.context/review-reports/feature-header-solutions-megamenu-phase-1-task-01-round-1-review.md` |
