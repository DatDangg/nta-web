Agent: reviewer

# Review — feature nta-website · phase 1 · task layer-1-task-01 · round 3

- Work item: `feature/nta-website` — Layer 1 / Task 01 (design tokens + `Button`/`Section`/`Badge` primitives)
- Task file: `tasks/nta-website/layer-1-task-01.md`
- Round 2 report: `.context/review-reports/feature-nta-website-layer-1-task-01-round-2-review.md` (FAIL: 2 MAJOR)
- Report path: `.context/review-reports/feature-nta-website-layer-1-task-01-round-3-review.md`
- Ngày: 2026-10-08
- Fix attempt reviewed: 2

## Review level

`NORMAL`

## Reason

Styling foundation (theme tokens + presentational primitives), không đụng auth/RBAC/tenant/schema/DB
(`db_tool: none`), không có risk đỏ mới. Đây là `SHARED_FOUNDATION` (Button/Section/Badge + tokens tiêu thụ
bởi mọi screen) nên không hạ `FAST`, nhưng đây là primitive presentational, không phải shared service/hook có
state hay API client → giữ `NORMAL`, đồng nhất với task file ("Review level expected: NORMAL") và round 1/2.

## Blast radius

- `src/app/globals.css` — CSS vars (`--color-primary-active`, `--color-focus`, `--color-surface`), focus-visible
  global, reduced-motion → mọi route/focusable.
- `tailwind.config.ts` — `colors`, `backgroundImage.gradient-soft` → mọi utility/component.
- `src/components/ui/Button.tsx` — 4 variant × 3 size, hover/active, focus → mọi CTA.
- `Section.tsx` / `Badge.tsx` — không đổi trong fix attempt 2, kiểm regression.
- Không đụng API, DB, i18n runtime, content.

## Verify commands + result

| Command (từ project-config) | Result |
|---|---|
| `npm run lint` | **Blocked** — shell `permission denied` trong session review này (không nằm allowlist). Round 2 đã PASS; fix attempt 2 chỉ đổi string màu + move config, xác minh tĩnh bên dưới. |
| `npm run typecheck` | **Blocked** — shell denied (cùng lý do). Static: type `ButtonVariant`/`Record` lookups không đổi, không thêm import/biến thừa. |
| `npm run build` | **Blocked** — shell denied (cùng lý do). |
| `test_command: null` | skip, chưa cấu hình test framework |
| `git diff HEAD` / `git status` | **Blocked** — shell `permission denied`. Đánh giá dựa trên đọc trực tiếp working tree (Button.tsx 38 dòng, globals.css 88, tailwind.config.ts 79). |

Ghi chú: không thể tự verify bằng command trong session này → ghi `Blocked`, không fail workflow. Các thay đổi
của fix attempt 2 là hằng số màu (2 dòng), move `gradient-soft` sang `backgroundImage` (1 dòng), và thay focus
rule global (globals.css) — đã đọc trực tiếp và kiểm bằng CSS math; xem Residual risk.

## Trọng tâm round 3 — kết quả

### 1) Ghost/outline text contrast (tự tính lại WCAG 2.1 sRGB)

Công thức relative luminance `L = 0.2126R + 0.7152G + 0.0722B`, `contrast = (L1+0.05)/(L2+0.05)`.

| Cặp (từ code) | Ratio | AA text (≥4.5) |
|---|---|---|
| `#0066CC` (`--color-primary-active`) trên `#FFFFFF` | **5.57:1** | ✅ |
| `#0066CC` trên `#F5F5F7` (`--color-background-alt`) | **5.11:1** | ✅ |
| `#FFFFFF` trên `#0071E3` (primary) | **4.70:1** | ✅ |
| `#FFFFFF` trên `#0066CC` (primary `:active`) | **5.57:1** | ✅ |

- `Button.tsx:14` `ghost: 'bg-transparent text-primary-active …'` → #0066CC. `Button.tsx:15` `outline: … text-primary-active …` → #0066CC.
- Hover ghost/outline (`hover:bg-background-alt`) → text #0066CC trên #F5F5F7 = 5.11:1 ✅.
- **MAJOR1 (round 2) đã đóng:** ghost không còn dùng `primary-hover` #0077ED (4.32:1); dùng `primary-active`
  #0066CC đạt AA trên cả nền trắng và nền alt như builder báo. Số liệu builder trùng khớp tính toán độc lập.

### 2) Focus-visible cho TẤT CẢ variant

- `globals.css:73-77`: `*:focus-visible { outline: 2px solid var(--color-surface); outline-offset: 2px; box-shadow: 0 0 0 4px var(--color-focus); }`
- Đây là **selector toàn cục**, không nhánh `if (variant === 'primary')`. Grep toàn `src`: **không còn**
  class `focus-visible:*`/`ring-*`/`outline-*` nào trong `Button.tsx` (chỉ `outline` là tên variant) → mọi
  variant (primary/secondary/ghost/outline) nhận cùng treatment. MAJOR2 (round 2) đã đóng.
- Kiểm hiển thị trên các nền (ngưỡng non-text WCAG 1.4.11 ≥ 3:1):

| Nền | Ring nhìn thấy | Ratio | Kết luận |
|---|---|---|---|
| `#FFFFFF` (default Section) | vòng ngoài `#0071E3` (4px) | 4.70:1 | ✅ thấy rõ (outline trắng chìm, ring xanh nổi) |
| `#F5F5F7` (alt Section) | vòng ngoài `#0071E3` | 4.31:1 | ✅ thấy rõ |
| `#0071E3` (`Section accent`) | viền trắng 2px | 4.70:1 | ✅ thấy rõ (ring xanh chìm, viền trắng nổi) |

Kết luận: focus ring hiển thị trên **mọi nền thuộc thiết kế** và cho **mọi variant** — thỏa AC
"focus ring thấy rõ trên mọi nền".

### 3) Regression

- Token khớp `skills/nextjs/design-tokens.md` §1: `#0071E3/#0077ED/#0066CC`, bg/surface/text/border/ink/shadows/
  radius/z-index/type/clamp — không lệch.
- `Button` 4 variant × 3 size, pill `rounded-full`, `min-h-11/min-h-12`, `min-w-11`, hover + `active:scale-[0.98]`,
  `transition-[background-color,border-color,color,transform] duration-fast ease-out-expo`, `type="button"` mặc định ✅.
- `secondary: 'border border-transparent … hover:border-strong hover:bg-border'` → nay có `border` thật nên
  `hover:border-strong` không còn no-op; `hover:bg-border` (#D2D2D7) khác nền → hover feedback thật ✅.
- `gradient-soft` đã chuyển sang `extend.backgroundImage` (`tailwind.config.ts:37`) → `background-image: var(--bg-gradient-soft)` hợp lệ ✅ (không còn sinh `background-color: linear-gradient(...)`).
- `Section` 3 variant + `py-12 md:py-16 xl:py-24` + container `max-w-container px-4 sm:px-6 lg:px-8` ✅.
- `Badge` kèm chữ (không chỉ màu) ✅.
- `prefers-reduced-motion` global (`globals.css:79-88`) ✅.
- File ≤300 dòng (38/88/79/31/14) · function ≤50 dòng ✅.

## Responsive Checklist Gate

Áp dụng (diff đụng UI). Không có browser → xác minh bằng CSS math/đọc class; breakpoints `375 / 768 / 1280`.

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout — không horizontal scroll | OK | `Section.tsx:26` `w-full max-w-container px-4 sm:px-6 lg:px-8`; Button/Badge `inline-flex`, không width cố định |
| Mobile-first (`min-width`) | OK | `tailwind.config.ts:6-12` screens 640→1536 (`min-width`); class base + `sm:/md:/lg:/xl:` |
| Grid `auto-fit`/`minmax` | N/A | primitives không dùng grid |
| Container không fixed px | OK | `maxWidth.container: '1280px'` là `max-width`, không `width` |
| Typography rem/fluid | OK | `globals.css:32-39` clamp/rem; Tailwind `fontSize` trỏ var; không px |
| Heading fluid `clamp()` | OK | `--text-hero/display/h2/h3/body-lg` clamp |
| Media (ảnh/video) | N/A | primitives chưa có media |
| Touch target ≥44px | OK | `Button.tsx:19-21` `min-h-11`(44px) sm/md, `min-h-12`(48px) lg, `min-w-11`(44px); Badge không interactive |
| Nav/table mobile | N/A | chưa có nav/table trong scope |
| Viewport (không `100vh`) | OK | không có `vh`/`h-screen` |
| `prefers-reduced-motion` | OK | `globals.css:79-88` global reduce |
| Không che lỗi bằng `overflow:hidden` | OK | không có `overflow-hidden` ẩn nội dung |

Kết luận gate: **OK** (không mục FAIL). Render runtime 3 width chưa xác minh (không browser + shell denied) → Residual risk.

## Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| `aislop scan` | **Blocked** | shell `permission denied` (không nằm allowlist command) — không chặn PASS |
| `oxlint` (anti-slop) | **skip, oxlint not configured** | Glob `**/{.oxlintrc*,.oxlintrc.json,oxlint.json,.eslintrc*}` → no files; package.json không có oxlint |
| `ocr` (open-code-review) | **skip/Blocked, ocr not verifiable** | shell denied → không xác nhận được cài đặt; không chặn PASS |
| AI-readable (chaos indicators) | **OK** | globals.css 88 / tailwind.config.ts 79 / Button 38 / Section 31 / Badge 14 dòng; mỗi file 1 trách nhiệm; function ≤50 dòng; tên self-descriptive; dùng token thay magic number. Không đạt ≥3 indicators |
| ai-friendly-web | **N/A** | task nội bộ (foundation), không phải mặt public/deploy |
| blitzstrike (pentest) | **N/A** | NORMAL, không phải task auth/API public/input |

## Findings

### [MINOR — defer documented] Ghost/outline text trên nền `Section accent` (#0071E3) không đạt contrast

- File: `src/components/ui/Button.tsx:14-15` — `text-primary-active` (#0066CC) trên nền `#0071E3` = **1.19:1** (< 4.5:1).
- Đây là tổ hợp composition không điển hình: `Section accent` dùng cho CTA banner với nội dung inverse/trắng
  (design-spec Screen 1 §5: "button trắng, chữ primary"), không phải ghost/outline trong suốt. Không phải regression
  của fix attempt 2 (trước đó ghost `#0071E3` trên nền `#0071E3` càng tệ hơn), và round 2 cũng chỉ xếp cùng nhóm
  (outline-on-alt) là MINOR.
- Đề xuất (task tương lai `CTABanner`/integration): thêm variant `inverse`/context cho `Section accent`
  (button nền trắng chữ `primary`), hoặc chặn ghost/outline khi nằm trên nền accent. Không chặn task 01.

### [MINOR — defer documented] `outline` border `#D2D2D7` trên trắng chỉ ~1.5:1 (< 3:1 non-text)

- File: `src/components/ui/Button.tsx:15` + token `--color-border`. Ranh giới outline button trên nền trắng
  dưới 3:1 (WCAG 1.4.11). Token `border` là design-token đã duyệt (#D2D2D7 cho divider/card), text button vẫn
  đạt AA. Ghi nhận để cân nhắc khi làm nhóm control tương tác; không chặn task 01.

### [MINOR — non-blocking, defer documented] Inter chưa load (`--font-inter` chưa set)

- `globals.css:29` `var(--font-inter, Inter)` nhưng chưa có `next/font` trong `src/`. Fallback về system stack
  (SF Pro/Segoe/Roboto) vẫn render ổn. Task ghi rõ defer sang app-shell integration. Chấp nhận, cần hoàn tất ở
  task app-shell (layout).

## Đánh giá tích cực (đã fix / đạt)

- **MAJOR1 fixed:** ghost/outline dùng `text-primary-active` #0066CC → 5.57:1 trên trắng, 5.11:1 trên alt (≥4.5).
- **MAJOR2 fixed:** focus-visible là rule global `*:focus-visible` (viền trắng 2px + ring `--color-focus` 4px),
  áp mọi variant, thấy rõ trên trắng/alt/accent (#0071E3).
- **MINOR round 2 fixed:** `secondary` có `border` thật (hover:border-strong hoạt động); `gradient-soft` chuyển
  sang `backgroundImage` hợp lệ.
- Không phát hiện CRITICAL/MAJOR mới. File/function trong ngưỡng; reduced-motion giữ; token khớp.

## Residual risk

- Shell `permission denied` toàn session → `lint`/`typecheck`/`build`/`git diff`/`aislop`/`ocr` **không tự chạy
  lại được**. Xác minh dựa trên static read + CSS math; round 2 đã PASS 3 command và diff fix attempt 2 là
  hằng số màu + move config (rủi ro biên dịch thấp).
- Chưa render runtime 3 width + keyboard focus thực tế (không browser) → chưa xác minh pixel-perfect của
  focus ring (thứ tự vẽ outline/box-shadow) và contrast đo bằng máy.
- 3 MINOR defer documented ở trên không chặn task 01; cần xử lý ở task `CTABanner`/app-shell.

## Verdict

✅ **PASS** — 0 CRITICAL · 0 MAJOR · 3 MINOR (defer documented)

Lý do: hai MAJOR của round 2 đã được đóng bằng chứng kiểm chứng tĩnh:
(1) ghost/outline `#0066CC` đạt AA (5.57:1 trên trắng, 5.11:1 trên alt) — tính lại độc lập khớp builder;
(2) focus-visible là rule toàn cục áp mọi variant và thấy rõ trên cả 3 nền gồm `Section accent` #0071E3.
Không có CRITICAL/MAJOR mới; các MINOR còn lại là edge/defer không chặn. PASS có ghi residual risk
(shell denied: lint/typecheck/build chưa chạy lại được trong session này).
