# feature-home-layout-alignment · phase-1-task-01 — Khung chung trang chủ (Container 1280)

- **CR:** CR-040 · change doc `spec/changes/2026-10-19-home-layout-alignment.md` · spec **R-01b** (4.8.0), giữ R-02a/R-03a/R-03b
- **Status:** done (2026-10-19) · attempt 1 · reviewer round 1 PASS (NORMAL) · F1 (Low, sizes nhánh carousel > 3 thẻ) chuyển sang task 02
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
_(builder, 2026-10-19, attempt 1)_

### Thay đổi
- `src/components/home/SolutionGridHome.tsx`: `div max-w-[1400px]` → `<Container>` (+ import, sửa docblock).
- `src/components/home/ProductStrip.tsx`: 2 div (1280 tự viết + lồng `max-w-[1040px]`) → 1 `<Container>`; `productImageSizesThreeUp` lg `340px` → `400px`. Logic 3-up/carousel/←→ giữ nguyên.
- `src/components/layout/Header.tsx:85`: link logo thêm `-ml-2` (giữ `px-2 min-h-11`). Áp mọi breakpoint: ở 375 chữ logo nằm ở x=16 = mép nội dung các section khác (chưa dính mép màn hình), không cần `lg:-ml-2`.
- `docs/DESIGN.md` §Screen Trang chủ: thêm dòng as-built "Khung chung (R-01b, CR-040)".

### Verify
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS (tsc --noEmit, 0 lỗi) |
| `npm run lint` | PASS (0 error, 1 warning có sẵn `src/components/mdx/index.tsx:26` no-img-element, ngoài scope) |
| `npm test` | 199 tests · 196 pass · **1 fail ngoài scope**: `tools/db/content-rules.test.ts` "ảnh tồn tại" — thiếu thư mục `public/uploads` ở máy local (ảnh upload nằm trên VPS). Không có test nào cho trang chủ/Header. |
| `npm run build` (local) | lỗi môi trường `Failed to load native binding` (@swc) → dùng Docker |
| `docker build --target builder -t nta-web-buildcheck:tmp .` | PASS (`✓ Compiled successfully`, `✓ Generating static pages (9/9)`) → `docker rmi` đã xoá |

### Đo mép DOM (next start trong image builder, CONTENT_SOURCE=file, Edge headless + `scripts/screenshots/cdp.mjs`, scrollbar ẩn)
`getBoundingClientRect()` left / right (px). vi `/` và en `/en` cho **số giống hệt nhau** ở mọi viewport.

| Khối | 1280 | 1440 | 1920 |
|---|---|---|---|
| Chữ logo header (img) | 32 / 174.5 | 112 / 254.5 | 352 / 494.5 |
| h1 hero | 32 / 567 | 112 / 647 | 352 / 887 |
| `#home-solutions-title` | 32 / 370.4 | 112 / 450.4 | 352 / 690.4 |
| Thẻ giải pháp đầu | 32 / 421.3 | 112 / 501.3 | 352 / 741.3 |
| Thẻ giải pháp cuối | 858.7 / **1248** | 938.7 / **1328** | 1178.7 / **1568** |
| `#home-products-title` | 32 / 411.5 | 112 / 491.5 | 352 / 731.5 |
| Thẻ sản phẩm đầu (3-up: 2 SP + CTA) | 32 / 421.3 | 112 / 501.3 | 352 / 741.3 |
| Thẻ sản phẩm cuối (CTA) | 858.7 / **1248** | 938.7 / **1328** | 1178.7 / **1568** |
| `#home-cases-title` | 32 / 597.3 | 112 / 677.3 | 352 / 917.3 |
| Thẻ case đầu | 32 / 421.3 | 112 / 501.3 | 352 / 741.3 |
| Khối chữ CTA band | 32 / 653.6 | 112 / 733.6 | 352 / 973.6 |
| Cột footer đầu | 32 / 312 | 112 / 392 | 352 / 632 |

→ Mép trái mọi khối = (W−1280)/2+32 (32/112/352), mép phải thẻ cuối = mép phải khung (1248/1328/1568). **Chênh 0px** (≤ 2px đạt).
Thẻ giải pháp/sản phẩm rộng 389.3px ở ≥ 1280 (bằng thẻ giải pháp ở viewport 1280 trước khi sửa → tiêu đề `xl:whitespace-nowrap` không gặp bề rộng mới).

Phụ: 1024 → mọi khối left 32, thẻ cuối right 992; 768 → left 24; 375 → left 16 (logo, h1, các tiêu đề, thẻ, CTA, footer đều 16).
Tràn ngang: `scrollWidth === clientWidth` ở 375 / 768 / 1024 / 1280 / 1440 / 1920, cả vi + en → **không tràn**.

### Residual risk
- Đo trên dữ liệu `CONTENT_SOURCE=file` (prod dùng `db`); số thẻ sản phẩm prod khác 3 → dải chạy nhánh carousel, mép trái/phải vẫn do `Container` nhưng chưa đo nhánh đó.
- Không chụp ảnh so sánh trực quan 375/768/1024 trước/sau (chỉ đo DOM + kiểm tràn); thay đổi ở < 1280 chỉ là logo lùi 8px trái.
- Thanh cuộn dọc bị ẩn khi đo (`--hide-scrollbars`); trên trình duyệt có scrollbar mọi khối dịch cùng một lượng nên vẫn thẳng hàng.
