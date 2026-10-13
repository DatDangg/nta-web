# Review — feature-home-sections-redesign · phase-1-task-03 · round 1

Agent: reviewer
Date: 2026-10-14
Task: `tasks/feature-home-sections-redesign/phase-1-task-03.md` (CR-016, R-03b)

## Review level
NORMAL

## Reason
UI trang chủ, không đụng auth/API/schema/DB. Có hook `useScrollButtons` + `HomeScrollArrows` dùng chung giữa 2 section
(Product + Case study) — chỉ nội bộ `src/components/home/`, không phải shared toàn app → NORMAL đủ.

## Blast radius
`/`, `/en` (khối Sản phẩm tiêu biểu + Câu chuyện khách hàng). `CaseStudyCard.tsx` (dùng ở `/case-studies`, RelatedStudies) không đổi.
`home.caseStudyTitle` bị bỏ — grep `src` không còn tham chiếu (key `caseStudyTitle` còn lại thuộc namespace khác, dòng 128 json).

## Verify commands + result
- `npm run typecheck` → PASS (reviewer tự chạy)
- `npm run lint` → PASS, 0 error, 1 warning cũ `src/components/mdx/index.tsx:25` no-img-element (ngoài scope)
- `npm run build` → PASS 59/59 (evidence primary, terminal user; reviewer không chạy được do env native binding)
- DOM 1280/375 (evidence primary, `next start`): 3 thẻ 384×481, link `/case-studies/<slug>` + `/case-studies`, nút disabled đúng; 375 không tràn ngang.
- `grep featuredCase src` → 0 kết quả.
- aislop / oxlint / ocr: skip (không cấu hình / không cài).

## Findings

### F1 — MAJOR — Thứ tự thẻ không theo trang `/case-studies` và không xác định (vi phạm task §3)
- `src/components/home/CaseStudyHighlight.tsx:27-29` lấy `studies.slice(0, 3)` trực tiếp từ `getAllCaseStudies(locale)`.
- `getAllCaseStudies` (`src/lib/content/case-studies.ts:4-7`) → `loadMdxDirectory` (`src/lib/content/load-mdx.ts:10`) trả theo thứ tự
  `readdir`, KHÔNG sort. Trang `/case-studies` sort riêng: `src/app/[locale]/case-studies/page.tsx:32`
  `right.year - left.year || left.slug.localeCompare(right.slug)`.
- Hệ quả hiện tại (NTFS, readdir theo alphabet): trang chủ = `ai-box-bao-ha`, `dental-clinic-operations`, `oc-eo-learning`;
  `/case-studies` = `ai-box-bao-ha`, `oc-eo-learning`, `dental-clinic-operations` → lệch thẻ 2/3. Trên Linux (ext4) thứ tự `readdir`
  không đảm bảo → output trang chủ phụ thuộc filesystem khi deploy; khi có >3 case, `slice(0,3)` chọn 3 case tuỳ ý.
- Task §3 ghi rõ "thứ tự như trang `/case-studies`". Evidence DOM của primary chỉ kiểm số thẻ/link, không kiểm thứ tự.
- Đề xuất fix: sort cùng comparator với `/case-studies` trước `slice` (tốt nhất tách comparator dùng chung, vd export từ
  `src/lib/content/case-studies.ts`, để 2 nơi không lệch lại). Lưu ý `/case-studies` sort in-place mảng trả về — nếu tách hàm,
  dùng bản copy để không mutate.

### F2 — MINOR (không chặn) — Alt khi fallback `gallery[0]`
`CaseStudyHighlight.tsx:20` dùng ảnh `gallery[0].src` nhưng alt luôn là `caseStudies.imageAlt` chung; `gallery[0].alt` mô tả đúng ảnh hơn.
Hiện cả 3 case đều có `cover` nên không ảnh hưởng. Có thể để nguyên (task cho phép alt i18n).

### Nit §4 từ task 02 — kiểm
- (a) Ngưỡng 8px: `useScrollButtons.ts:10,26-27` đúng spec (`scrollLeft <= 8` → canPrev false; `scrollLeft >= max-8` → canNext false), dùng chung cho 2 section. OK.
- (b) Focus ring: `scrollStripClass` `-mx-2 px-2 pt-2` chừa 8px ≥ ring 6px (offset 4 + width 2), `scroll-px-2` giữ snap thẻ đầu. `pb-4` đủ đáy. OK.
- (c) `page.tsx:83-89` `flatMap` bỏ qua slug thiếu `listingItems`. OK.

### Khác — OK
- Mockup `3.webp`: eyebrow, tiêu đề 2 phần (accent), mô tả dưới, ←/→ + "Xem tất cả case study →", thẻ ảnh 16:9 + chip ngành + icon,
  clamp 2 dòng, "Xem chi tiết →" + nút tròn trang trí `aria-hidden`. Khớp.
- Cả thẻ là 1 `Link`, không lồng interactive. Region có `aria-label`, `tabIndex=0`, phím ←/→. Section `aria-labelledby` khớp `headingId`.
- Surgical: ProductStrip chỉ thay bằng hook/nút dùng chung, behavior giữ nguyên (trừ ngưỡng theo nit a). Không drive-by.
- File/hàm trong giới hạn kích thước; không magic number thiếu tên (`SCROLL_EDGE_TOLERANCE`, `MAX_HOME_CASE_STUDIES`).
- Responsive gate: class 85% / `calc(50%-0.75rem)` / `calc((100%-3rem)/3)` + evidence 375/1280; 768 chưa có evidence DOM
  (rủi ro thấp, cùng pattern ProductStrip đã review task 02).

## Verdict
**FAIL** — 1 MAJOR (F1: thứ tự case study không theo `/case-studies`, phụ thuộc `readdir`). Fix nhỏ (sort trước slice), không cần đổi kiến trúc.
