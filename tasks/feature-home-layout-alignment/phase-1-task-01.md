# feature-home-layout-alignment · phase-1-task-01 — Khung chung trang chủ (Container 1280)

- **CR:** CR-040 · change doc `spec/changes/2026-10-19-home-layout-alignment.md` · spec **R-01b** (4.8.0), giữ R-02a/R-03a/R-03b
- **Status:** pending (chờ user duyệt plan) · attempt 0
- **Classification / Risk:** MODIFY (UI-only) · **LOW–MEDIUM**
  - Expected review level: **NORMAL** (Header là component dùng chung mọi trang, nhưng chỉ dịch mép logo; không đổi token/Container).
  - Blast radius: `SolutionGridHome.tsx`, `ProductStrip.tsx` (chỉ trang chủ), `Header.tsx` (mọi trang, 1 class). **Không** đổi
    `src/components/ui/Container.tsx`, `tailwind.config.ts` (`max-w-container` giữ 1280).
  - Doc impact: `docs/DESIGN.md` current-state trang chủ (ghi "mọi section dùng Container") — as-built. `.context/design-spec.md` đã cập nhật ở bước spec delta.
  - Migration gate: không áp dụng.
- **Deps:** không. Task 02 (hero) độc lập, làm sau.

## Hiện trạng đo (đọc code, CSS px, không tính thanh cuộn dọc)
Container: `mx-auto max-w-container(1280) px-4 sm:px-6 lg:px-8` → mép nội dung = (W − 1280)/2 + 32 khi W ≥ 1280.

| Section | Nguồn | 1440 trái–phải | 1920 trái–phải | Lệch so với khung |
|---|---|---|---|---|
| Header (nav, nút) | `Header.tsx:84` Container | 112–1328 | 352–1568 | 0 |
| Header logo (chữ) | `Header.tsx:85` link `px-2` | 120 | 360 | +8 trái |
| Giải pháp | `SolutionGridHome.tsx:36` `max-w-[1400px]` | 52–1388 | 292–1628 | −60 / +60 |
| Sản phẩm tiêu biểu | `ProductStrip.tsx:51-52` 1280 + lồng `max-w-[1040px] mx-auto` | 200–1240 | 440–1480 | +88 / −88 |
| Case study, CTA, Footer | Container | 112–1328 | 352–1568 | 0 |

- Giải pháp: dưới 1280 trùng khung (1400 không chặn) → sau sửa, ≥ 1280 hiển thị đúng như hiện tại ở 1280.
- Sản phẩm: lệch khi W > 1104 (lúc bề rộng nội dung > 1040). Sau sửa thẻ 3-up rộng (1216 − 48)/3 ≈ 389px (trước ≈ 331px).

## Scope
1. `SolutionGridHome.tsx`: thay `<div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">` bằng `<Container>` (import `@/components/ui/Container`).
   Giữ nguyên grid/thẻ. Kiểm thẻ ở 1280–1920: tiêu đề `xl:whitespace-nowrap` (dòng 78) không tràn/không bị ảnh đè (bề rộng thẻ giờ = thẻ ở viewport 1280 hiện tại).
2. `ProductStrip.tsx`: thay 2 div (`max-w-container` tự viết + `max-w-[1040px]`) bằng 1 `<Container>`; cập nhật
   `productImageSizesThreeUp` nhánh lg `340px` → `400px` (thẻ ≈ 389px). Giữ nguyên logic 3-up/carousel, nút ←/→, `lg:hidden`.
3. `Header.tsx:85`: thêm `-ml-2` cho link logo (giữ `px-2` + `min-h-11` để vùng bấm không đổi) → mép chữ logo = mép nội dung.
   Kiểm < lg (MobileNav) logo không dính mép màn hình (padding container 16px vẫn còn 8px tối thiểu — nếu xấu thì chỉ áp `lg:-ml-2`).
4. `docs/DESIGN.md` §trang chủ: ghi as-built "mọi section trang chủ dùng `Container` 1280 (R-01b)".

## Verify
- `npm run typecheck`, `npm run lint`, `npm run build` (hoặc `docker build --target builder` theo project-config nếu build local lỗi môi trường).
- DOM đo mép (dev server hoặc `tools/linux-build.sh serve`) ở 1280/1440/1920, vi + en: `getBoundingClientRect().left/right` của
  logo, `h1` hero, `#home-solutions-title`, thẻ giải pháp đầu/cuối, `#home-products-title`, thẻ sản phẩm đầu/cuối, `#home-cases-title`,
  thẻ case đầu, khối chữ CTA, cột footer đầu → chênh ≤ 2px. Lưu số đo vào phần Evidence.
- Ảnh chụp 375/768/1024 vi + en: không đổi so với trước, không tràn ngang (`document.documentElement.scrollWidth === clientWidth`).
- Test hiện có trang chủ (nếu có) vẫn PASS.

## Retry / Escalation
- Max 3 attempt; FAIL lần 3 → `architecture_review_needed`. Cancel giữa chừng ≠ attempt.

## Evidence
_(builder điền)_
