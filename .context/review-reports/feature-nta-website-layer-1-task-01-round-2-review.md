Agent: reviewer

# Review — feature nta-website · phase 1 · task layer-1-task-01 · round 2

- Work item: `feature/nta-website` — Layer 1 / Task 01 (design tokens + `Button`/`Section`/`Badge` primitives)
- Task file: `tasks/nta-website/layer-1-task-01.md`
- Round 1 report: `.context/review-reports/feature-nta-website-layer-1-task-01-round-1-review.md` (FAIL: 2 MAJOR + 5 MINOR)
- Report path: `.context/review-reports/feature-nta-website-layer-1-task-01-round-2-review.md`
- Ngày: 2026-10-08

## Review level

`NORMAL`

## Reason

Styling foundation (theme tokens + primitives), không đụng auth/tenant/schema/API/DB (`db_tool: none`).
Không có risk đỏ mới. Vẫn là `SHARED_FOUNDATION` (mọi screen tiêu thụ token + Button/Section/Badge) nên
giữ `NORMAL` theo task, không hạ `FAST`.

## Blast radius

- `src/app/globals.css` (CSS vars + shadow tokens + focus ring global + reduced-motion) → mọi route.
- `tailwind.config.ts` (colors/boxShadow/fontSize/radius/zIndex/motion) → mọi component/utility.
- `src/components/ui/{Button,Section,Badge}.tsx` → mọi screen dùng về sau.
- Không đụng API, DB, i18n runtime, content.

## Verify commands + result

| Command (từ project-config) | Result |
|---|---|
| `npm run lint` | **PASS** — `eslint .` không lỗi |
| `npm run typecheck` | **PASS** — `tsc --noEmit` không lỗi |
| `npm run build` | **PASS** — `next build` compiled 826ms, prerender 5/5 (vi/en) |
| `test_command: null` | skip, chưa cấu hình test framework |

Ghi chú: `git status`/`git diff` bị permission denied (không lấy được diff trực tiếp) → đã đọc toàn bộ file
trong scope tại working tree. `lint/typecheck/build` chạy được và PASS độc lập.

## Responsive Checklist Gate

Áp dụng (diff đụng UI). Không có browser → xác minh bằng CSS math/đọc class; breakpoints `375 / 768 / 1280`.

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout — không horizontal scroll | OK | `Section.tsx:26` `w-full max-w-container px-4 sm:px-6 lg:px-8` (max-width, không width cố định); Button/Badge inline-flex |
| Mobile-first (`min-width`) | OK | `sm:/md:/lg:/xl:`; `tailwind.config.ts:6-12` min-width 640→1536 |
| Grid `auto-fit`/`minmax` | N/A | primitives không dùng grid |
| Container không fixed px | OK | `maxWidth.container: '1280px'` là `max-width` |
| Typography rem/fluid | OK | `globals.css:32-39` clamp/rem; Tailwind `fontSize` trỏ var; không px |
| Heading fluid `clamp()` | OK | `--text-hero/display/h2/h3/body-lg` clamp |
| Media (ảnh/video) | N/A | chưa có media trong primitives |
| Touch target ≥44px | OK | `Button.tsx:18-22` `min-h-11`(44px)/`min-h-12`(48px), `min-w-11`(44px); Badge không interactive |
| Nav/table mobile | N/A | chưa có nav/table |
| Viewport (không `100vh`) | OK | không dùng `vh`/`h-screen` |
| `prefers-reduced-motion` | OK | `globals.css:78-87` global reduce |
| Không che lỗi bằng `overflow:hidden` | OK | không có `overflow-hidden` ẩn nội dung |

Kết luận gate: **OK** (không mục FAIL). Render runtime 3 width chưa xác minh (không browser) → Residual risk.

## Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| `aislop scan` | **Blocked** | shell `permission denied` (không nằm allowlist command) |
| `oxlint` (anti-slop) | **skip, oxlint not configured** | Glob `**/{.oxlintrc*,.oxlintrc.json,oxlint.json}` → no files; chưa cấu hình |
| `ocr` (open-code-review) | **Blocked / not verifiable** | shell denied, không xác nhận được cài đặt |
| AI-readable (chaos indicators) | **OK** | globals.css 87 dòng, tailwind.config.ts 79, Button.tsx 38, Section.tsx 31, Badge.tsx 14; mỗi file 1 trách nhiệm; function render ≤50 dòng; không magic number (dùng token); tên self-descriptive. Không đạt ngưỡng ≥3 indicators |
| ai-friendly-web | **N/A** | task nội bộ (foundation), không phải mặt public/deploy |
| blitzstrike (pentest) | **N/A** | NORMAL, không phải task auth/API public/input |

## Findings

### [MAJOR] Ghost contrast bị regress (đổi sang màu nhạt hơn) — fail AA trên nền trắng

- File: `src/components/ui/Button.tsx:14`
- `ghost: 'bg-transparent text-primary-hover hover:bg-background-alt'` → text `--color-primary-hover` = `#0077ED`.
- Tính lại WCAG (sRGB relative luminance):
  - `#0077ED` trên `#FFFFFF` = **4.32:1** (< 4.5:1 AA) — nền trắng là context mặc định của ghost.
  - `#0077ED` trên `#F5F5F7` = **3.97:1** (< 4.5:1).
- So round 1: ghost cũ là `text-primary` (`#0071E3`) = **4.70:1 trên trắng (PASS)**, chỉ fail edge trên nền alt (4.31:1).
  Round-2 fix dùng shade nhạt hơn (`primary-hover` là màu hover CTA, không phải màu text trên nền sáng) →
  **làm xấu thêm**: giờ fail ngay trên nền trắng.
- Vi phạm Acceptance Criteria "`Button` … contrast ≥4.5:1" và R-24 (WCAG 2.1 AA).
- Đề xuất fix: dùng `text-primary` (`#0071E3`, 4.70:1 trên trắng) hoặc tốt nhất `text-primary-active`
  (`#0066CC`, 5.5:1 trên trắng / 5.1:1 trên alt). Không dùng `primary-hover` làm màu text trên nền sáng.

### [MAJOR] Focus ring vẫn vô hình cho các variant không phải `primary` khi đặt trên nền accent (#0071E3)

- File: `src/components/ui/Button.tsx:34` + `Section.tsx:12` + `globals.css:73-76`
- Nhánh đặc biệt chỉ áp cho `variant === 'primary'`. Các variant `secondary`/`ghost`/`outline` rơi vào
  `focus-visible:outline-focus` với `--color-focus` = `#0071E3`.
- Trong `<Section variant="accent">` (nền `bg-primary` = `#0071E3`), outline `#0071E3` với `outline-offset: 2px`
  nằm trên nền cùng màu → ring hoà lẫn nền, không thấy. Ghost/outline trong suốt nên càng chắc chắn vô hình.
- AC task: "focus ring thấy rõ trên **mọi nền**" (không giới hạn variant). Fix round-2 chỉ phủ variant `primary`
  → chưa đóng hết MAJOR2 cho tổ hợp variant khác.
- Đề xuất fix: thêm treatment tương phản 2 lớp cho mọi variant khi nằm trên nền primary (ví dụ
  `ring-2 ring-white ring-offset-2 ring-offset-primary`, hoặc prop/`data-*`/context để chọn ring sáng),
  không chỉ dựa vào `variant === 'primary'`.

### [MINOR] `hover:border-strong` trên `secondary` là no-op (không có border width)

- File: `src/components/ui/Button.tsx:13` — `hover:border-strong` chỉ set `border-color`, nhưng variant
  `secondary` không có class `border` (border-width 0) → không có border nào hiện ra. Dọn class hoặc thêm
  `border` nếu muốn viền hover thật.

### [MINOR] `--bg-gradient-soft` map vào `colors` nên `bg-gradient-soft` không có tác dụng

- File: `tailwind.config.ts:36` — `'gradient-soft': 'var(--bg-gradient-soft)'` sinh
  `background-color: linear-gradient(...)` (không hợp lệ cho `background-color`) → utility im lặng không vẽ gì.
- Đề xuất: chuyển sang `extend.backgroundImage` (`'gradient-soft': 'var(--bg-gradient-soft)'`) để dùng được.

### [MINOR] `outline` variant text `#0071E3` trên nền `background-alt` = 4.31:1 (< 4.5:1)

- File: `src/components/ui/Button.tsx:15` — edge khi `Button variant="outline"` nằm trong `Section variant="alt"`.
  Cùng nhóm với finding round-1 (ghost-on-alt), chưa regress. Xử lý cùng đợt (dùng `primary-active` cho text
  trên nền sáng, hoặc quy tắc context nền alt).

### [MINOR — non-blocking, defer documented] Inter chưa load (`--font-inter` chưa set)

- `globals.css:29` `var(--font-inter, Inter)` nhưng chưa có `next/font` trong `src/`. Fallback chạy về system
  stack (SF Pro/Segoe/Roboto) — vẫn render ổn.
- Task đã ghi rõ defer sang app-shell integration ("Inter is not loaded; `--font-inter` remains an optional Next
  Font hook … font loading deferred to app-shell integration"). Chấp nhận được, không chặn task này; cần hoàn tất
  ở task app-shell (layout).

## Đánh giá tích cực (đã fix / đạt)

- **MAJOR1 fixed:** secondary `hover:bg-border` (#D2D2D7) khác hẳn nền `background-alt` (#F5F5F7) → hover feedback thật.
- Focus ring dual-contrast cho `primary` hoạt động: trên nền trắng ring `primary` tương phản; trên nền `primary`
  outline trắng tương phản → MAJOR2 đã fix cho variant `primary`.
- Shadow tokens `--shadow-xs/sm/md/lg` (`globals.css:56-59`) + map `boxShadow` (`tailwind.config.ts:56-61`) khớp tokens §5.
- `active:scale-[0.98]` nay được animate: `transition-[background-color,border-color,color,transform] duration-fast ease-out-expo` (`Button.tsx:34`).
- `overlay`/`skeleton` đã map ra Tailwind (`tailwind.config.ts:34-35`).
- Token màu/type/radius/z-index khớp `skills/nextjs/design-tokens.md` §1–§7; theme lock light.
- Button 4 variant × 3 size, pill, `type="button"` mặc định, touch ≥44px; Section 3 variant + container 1280px + padding theo bp; Badge kèm chữ (không chỉ màu).
- `prefers-reduced-motion` global có; file ≤300 dòng / function ≤50 dòng.

## Residual risk

- `git diff HEAD` không lấy được (permission denied) → đánh giá dựa trên working tree.
- `aislop`/`ocr` không chạy được (permission denied) → chưa có lớp bắt slop/bug tự động bổ sung ngoài lint/typecheck/build.
- Chưa render runtime 3 width + keyboard focus thực tế (không browser).
- Finding `[MAJOR] ghost contrast` và `[MAJOR] focus ring non-primary trên accent` cần sửa rồi rerun round-3.

## Verdict

❌ **FAIL** — 0 CRITICAL · 2 MAJOR · 4 MINOR

Lý do: MAJOR1 (secondary hover) đã fixed, nhưng còn 2 MAJOR thực:
(1) fix "ghost contrast" lại regress — ghost `#0077ED` chỉ 4.32:1 trên nền trắng (round-1 cũ là 4.70:1), fail AC "contrast ≥4.5:1" / R-24;
(2) focus ring vẫn vô hình với `secondary`/`ghost`/`outline` khi đặt trên nền accent `#0071E3`, vi phạm AC "focus ring thấy rõ trên mọi nền".
Sửa 2 MAJOR (tối thiểu) rồi rerun reviewer round-3.
