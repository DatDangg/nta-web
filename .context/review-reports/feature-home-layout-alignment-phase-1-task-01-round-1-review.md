# Review — feature-home-layout-alignment · phase-1-task-01 · round 1

Agent: reviewer · 2026-10-19 · CR-040 · spec R-01b (4.8.0) · design-spec "Khung chung (CR-040, R-01b)"

## Review level
**NORMAL**

## Reason
UI-only, không đụng auth/API/schema/data. `Header.tsx` là component dùng chung mọi trang nhưng thay đổi chỉ 1 class bố cục
(`-ml-2` trên link logo), không đổi logic/state/điều hướng → không thuộc risk đỏ "shared component" về hành vi. `Container`,
token `max-w-container`, hero không bị đổi. Builder đã chạy typecheck/lint/build (docker) + đo DOM.

## Blast radius
- `src/components/home/SolutionGridHome.tsx` — chỉ trang chủ (vi + en).
- `src/components/home/ProductStrip.tsx` — chỉ trang chủ.
- `src/components/layout/Header.tsx` — mọi trang, chỉ vị trí link logo dịch trái 8px (vùng bấm giữ `px-2 min-h-11`).
- `docs/DESIGN.md` — as-built doc.
- Không đổi: `src/components/ui/Container.tsx`, `tailwind.config.ts`, Hero, HomeProductCard, HomeScrollArrows.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS (tsc --noEmit, 0 lỗi) — chạy lại bởi reviewer |
| `npm run lint` | PASS (0 error, 1 warning có sẵn `src/components/mdx/index.tsx:26`, ngoài scope) — chạy lại bởi reviewer |
| `npm run build` / docker builder | Không chạy lại (lỗi môi trường swc local; builder đã PASS bằng `docker build --target builder`, theo Evidence) |
| grep `max-w-[1400px]` / `max-w-[1040px]` trong `src/` | 0 kết quả |

## Kiểm theo checklist
- **Đúng scope:** diff khớp đúng 4 mục Scope của task; không có thay đổi ngoài phạm vi. Import `Container` đúng path. PASS.
- **Container:** `Container` default không có `insetClassName`/`prose` → render 1 `div` với đúng class cũ
  `mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8` → ProductStrip lớp ngoài tương đương 100%, chỉ bỏ lớp `max-w-[1040px]`. PASS.
- **R-03a carousel:** `ref={stripRef}`, `onKeyDown={handleStripKeyDown}`, `role="region"`, `tabIndex`, `aria-label`, `scrollStripClass`,
  nhánh `cardCount <= 3` (`lg:hidden` cho nút ←/→), thẻ CTA cuối dải — giữ nguyên, chỉ đổi thụt lề. Snap class không đổi. PASS.
- **Ảnh 3-up:** thẻ ≈ 389px ở ≥1280 (Evidence đo 389.3) → `sizes` lg `400px` hợp lý. PASS.
- **R-02a thẻ giải pháp 1280–1920:** trước đây ở viewport 1280 khung 1400 không chặn → nội dung 1216, thẻ 389px; nay mọi viewport ≥1280 thẻ
  cũng 389px = trạng thái đã ship ở 1280 → tiêu đề `xl:whitespace-nowrap` và vùng ảnh `xl:w-[80%]` (≈311px, `sizes` 360px đủ) không gặp
  bề rộng mới. Dưới 1280 không đổi. PASS.
- **Header logo:** `-ml-2` + giữ `px-2 min-h-11` → vùng bấm 44px cao, rộng không đổi; ở 375 link bắt đầu x=8, chữ logo x=16 = mép nội dung
  các section (Evidence). Không dính mép, không gây tràn ngang (margin âm vẫn trong padding 16px). `aria-label` giữ nguyên. PASS.
- **A11y:** không đổi landmark/heading/aria; `aria-labelledby` section giữ. PASS.
- **Tràn ngang mobile:** Evidence `scrollWidth === clientWidth` ở 375/768/1024/1280/1440/1920 vi + en; code không thêm phần tử rộng cố định. PASS.
- **Doc as-built:** dòng thêm vào `docs/DESIGN.md` mô tả đúng code hiện tại (Container 1280, bỏ 1400/1040, logo `-ml-2`).
  Câu "mọi section trang chủ (… case study, CTA, footer)" khớp số đo Evidence. Hero chưa nêu — đúng vì hero là task 02. Không sửa intent doc. PASS.

## Findings
| # | Mức | File:line | Mô tả |
|---|---|---|---|
| F1 | Low (không chặn) | `src/components/home/HomeProductCard.tsx:25` (+ `ProductStrip.tsx` nhánh >3 thẻ) | Nhánh carousel (>3 thẻ, không truyền `imageSizes`) giờ thẻ lg+ rộng `50% − 0.75rem` của 1216 ≈ 596px (trước 50% của 1040 ≈ 508px) nhưng `sizes` mặc định vẫn `(min-width: 1024px) 508px` → gợi ý `sizes` thấp hơn thực tế ~15%; DPR 2 có thể chọn ảnh 1080w thay vì 1200w (hơi mềm). Thẻ poster 6:7 cũng cao hơn (~695px). Hiện prod chỉ có 2 sản phẩm (R-03/R-07) → chạy nhánh 3-up, nhánh carousel chưa dùng. Đề xuất (task sau hoặc follow-up): cập nhật mặc định thành `(min-width: 1280px) 600px, (min-width: 1024px) 48vw, …`. Đã nằm trong Residual risk của builder (chưa đo nhánh carousel). |
| F2 | Info | `tasks/feature-home-layout-alignment/phase-1-task-01.md:4` | `Status` vẫn ghi "pending (chờ user duyệt plan) · attempt 0" trong khi Evidence là attempt 1 — primary cập nhật lúc close-out. |

Không có finding Critical/High/Medium.

## Verdict
**PASS**
