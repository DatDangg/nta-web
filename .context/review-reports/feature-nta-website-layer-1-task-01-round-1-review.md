Agent: reviewer

# Review — feature nta-website · phase 1 · task layer-1-task-01 · round 1

- Work item: `feature/nta-website` — Layer 1 / Task 01 (design tokens + `Button`/`Section`/`Badge` primitives)
- Task file: `tasks/nta-website/layer-1-task-01.md`
- Report path: `.context/review-reports/feature-nta-website-layer-1-task-01-round-1-review.md`
- Ngày: 2026-10-08

## Review level

`NORMAL`

## Reason

Styling foundation (theme tokens + primitives), không đụng auth/tenant/schema/API/data. Tuy nhiên đây là
`SHARED_FOUNDATION`: token + `Button`/`Section`/`Badge` được mọi screen tiêu thụ, ảnh hưởng trực tiếp R-23/R-24
(breakpoint, a11y contrast/touch/focus). Vì vậy không hạ xuống `FAST`, giữ `NORMAL` theo đúng dự kiến của task.

## Blast radius

- `src/app/globals.css` (CSS variables + focus ring global + reduced-motion) → mọi route.
- `tailwind.config.ts` (colors/fontSize/radius/zIndex/motion/container) → mọi component/utility.
- `src/components/ui/{Button,Section,Badge}.tsx` → mọi screen (Header/CTA/Card/Form/Filter/Pagination… về sau).
- Không đụng API, DB (`db_tool: none`), i18n runtime, content.

## Phạm vi đã kiểm

- `git status --short` / `git diff HEAD` / file untracked: **không chạy được** — shell bị permission deny
  (Tool Loop Guard: dừng shell, không retry). Đã đọc trực tiếp toàn bộ file trong scope:
  `src/app/globals.css`, `tailwind.config.ts`, `src/components/ui/Button.tsx`, `Section.tsx`, `Badge.tsx`,
  `src/app/layout.tsx`; đối chiếu `skills/nextjs/design-tokens.md` §1–§12,
  `.context/design-spec.md` §1.3/§1.5/§1.6/§1.9, `docs/DESIGN.md`, `.context/project-config.md` (ui rules), `package.json`.

## Verify commands + result

| Command (từ project-config) | Result |
|---|---|
| `npm run lint` | **Blocked** — shell permission denied (không chạy được) |
| `npm run typecheck` | **Blocked** — shell permission denied |
| `npm run build` | **Blocked** — shell permission denied |
| `test_command: null` | skip, chưa cấu hình test framework |

Verification Summary trong task ghi `lint/typecheck/build PASS` nhưng **reviewer không kiểm chứng được** (shell deny).
→ Ghi vào Residual risk, không tự động coi là FAIL.

## Responsive Checklist Gate

Áp dụng (diff đụng UI). Không có môi trường browser → xác minh bằng CSS math/đọc class. Breakpoints chuẩn `375 / 768 / 1280`.

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout — không horizontal scroll | OK | `Section.tsx:26` dùng `w-full max-w-container px-4 sm:px-6 lg:px-8` (max-width, không width cố định); `Button`/`Badge` inline-flex, không đặt width px |
| Mobile-first (`min-width`) | OK | `sm:/md:/lg:/xl:`; `tailwind.config.ts:6-12` dùng min-width 640→1536 |
| Grid `auto-fit`/`minmax` | N/A | primitives này không dùng grid |
| Container không fixed px | OK | `maxWidth.container: '1280px'` là `max-width` (Section.tsx:26) |
| Typography rem/fluid | OK | `globals.css:32-39` clamp/rem; Tailwind `fontSize` trỏ var; không px |
| Heading fluid `clamp()` | OK | `--text-hero/display/h2/h3/body-lg` clamp (globals.css:32-36) |
| Media (ảnh/video) | N/A | chưa có media trong primitives |
| Touch target ≥44px | OK | `Button.tsx:19-21` `min-h-11`(44px)/`min-h-12`(48px), `min-w-11`(44px); `Badge` không interactive nên không áp dụng |
| Nav/table mobile | N/A | chưa có nav/table |
| Viewport (không `100vh`) | OK | không dùng `vh`/`h-screen` |
| `prefers-reduced-motion` | OK | `globals.css:74-83` global reduce |
| Không che lỗi bằng `overflow:hidden` | OK | không có `overflow-hidden` ẩn nội dung |

Kết luận gate: **OK** (không có mục FAIL). Phần "render thực tế 3 width" chưa xác minh được (không browser) → Residual risk.

## Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| `aislop scan` | **Blocked** | shell permission denied, không chạy được CLI |
| `oxlint` (anti-slop) | **skip, oxlint not configured** | repo không có oxlint config (khớp ghi chú task) |
| `ocr` (open-code-review) | **skip, không kiểm chứng được** | shell denied (không xác nhận được cài đặt) |
| AI-readable (chaos indicators) | **OK** | 3 file 14/31/38 dòng, mỗi file 1 trách nhiệm, tên self-descriptive, không magic number (dùng token), không comment WHAT; function render ≤50 dòng. Không đạt ngưỡng ≥3 indicators |
| ai-friendly-web | **N/A** | task nội bộ (foundation), không phải mặt public/deploy |
| blitzstrike (pentest) | **N/A** | NORMAL, không phải task auth/API public/input |

## Findings

### [MAJOR] `Button` variant `secondary` không có hover feedback (hover = no-op)

- File: `src/components/ui/Button.tsx:13`
- `secondary: 'bg-background-alt text-text-primary hover:bg-surface-sunken'`
- Trong `globals.css:12,14` (và tokens §1): `--color-background-alt: #f5f5f7` **trùng** `--color-surface-sunken: #f5f5f7`.
  Vì nền và nền-hover là **cùng một màu**, hover của variant `secondary` không tạo thay đổi thị giác nào.
- Vi phạm Description task ("primary/secondary/ghost/outline … hover") và design §1.5 / tokens §6 ("hover feedback thật").
- Đề xuất fix: dùng token hover khác cho secondary, ví dụ `hover:bg-border` (#D2D2D7) hoặc thêm token `--color-background-alt-hover`; không dùng `surface-sunken` cho hover khi nền là `background-alt`.

### [MAJOR] Focus ring vô hình khi `Button primary` nằm trên nền `primary` (Section variant `accent`)

- File: `src/components/ui/Button.tsx:34` + `src/components/ui/Section.tsx:12` + `src/app/globals.css:69-72`
- `Section accent` = `bg-primary`; `Button primary` = `bg-primary`; focus ring = `outline-focus` (#0071E3),
  `outline-offset: 2px`. Khoảng offset 2px lộ nền cha (#0071E3) rồi tới viền #0071E3 → **xanh trên xanh, không thấy ring**.
- Vi phạm AC task "focus ring thấy rõ trên mọi nền" và tokens §12: *"trên nền primary dùng ring trắng trong + viền ngoài primary"* (implementation bỏ qua nhánh này).
- Đề xuất fix: thêm cơ chế ring 2 lớp cho context nền primary (ví dụ `ring-2 ring-white` + `outline-2 outline-focus` hoặc class `focus-visible` riêng cho variant primary, hoặc dùng `outline-offset` kết hợp box-shadow trắng bên trong).

### [MINOR] Thiếu shadow tokens so với design-tokens §5/§12

- File: `src/app/globals.css` (không có `--shadow-xs/sm/md/lg`) + `tailwind.config.ts` (không extend `boxShadow`).
- tokens §5 định nghĩa 4 mức shadow tint `rgb(29 29 31 / …)` và §12 wiring. Task description liệt kê token màu/type/spacing/radius/focus/z-index (không nhắc shadow) nên chưa chặn task này, nhưng khi làm `Card` (hover `--shadow-sm`) sẽ rơi vào default shadow **pure-black** của Tailwind → lệch design lock.
- Đề xuất: bổ sung `--shadow-*` + map `boxShadow` trong task Card gần nhất (hoặc ngay task này nếu muốn đủ token).

### [MINOR] `active:scale-[0.98]` không được animate

- File: `src/components/ui/Button.tsx:34` — chỉ có `transition-colors`, không transition `transform`.
- Kết quả: scale khi `:active` nhảy tức thời, không đúng tokens §6 ("`:active` scale(0.98) 150ms").
- Đề xuất: `transition-[background-color,color,transform]` hoặc thêm `transition-transform`.

### [MINOR] Contrast `ghost` trên nền `background-alt` dưới AA

- File: `src/components/ui/Button.tsx:14` — `text-primary` (#0071E3) trên nền `background-alt` (#F5F5F7) ≈ **4.31:1** (< 4.5:1 AA cho text thường).
- Trên nền trắng vẫn OK (4.70:1). Đây là edge khi ghost nằm trong `Section variant="alt"`.
- Đề xuất: nếu ghost xuất hiện trên nền alt, dùng `--color-primary-active` (#0066CC) hoặc thêm quy tắc context nền.

### [MINOR] Font Inter chưa được load

- `globals.css:29` dùng `var(--font-inter, Inter)` nhưng **không có** `next/font` / `--font-inter` ở `src/`
  (đã grep `next/font|font-inter|Inter|font-sans` → no matches; `layout.tsx` chỉ import globals.css).
- Kết quả: fallback `Inter` (không cài) → rơi về system font; chưa đúng tokens §2 ("Load Inter bằng next/font/google").
- Cần xác nhận: nếu việc load font thuộc task layout/app-shell thì ghi nhận là deferred; nếu thuộc "type tokens" task này thì là gap.

### [MINOR] Một số token khai trong `:root` nhưng chưa map ra Tailwind

- `--color-overlay`, `--color-skeleton`, `--bg-gradient-soft` có trong `globals.css:20-21,28` nhưng không có trong
  `tailwind.config.ts` colors → component sau phải dùng arbitrary value. Không chặn task, nên map khi cần.

## Đánh giá tích cực (đã đạt)

- Color hex khớp tokens §1 (primary `#0071e3`, hover `#0077ed`, active `#0066cc`, alt `#f5f5f7`, ink `#1d1d1f`, error/success/warning + `*-ink`); theme lock light (`color-scheme: light`).
- Type scale clamp/rem + weight/space/radius/z-index khớp tokens §2–§4, §7.
- Breakpoint Tailwind 640/768/1024/1280/1536 đúng R-23 và `project-config.ui`.
- `Button` đủ 4 variant × 3 size, pill (`rounded-full`), `type="button"` mặc định, touch target ≥44px.
- `Section` 3 variant nền + container 1280px + `py-12 md:py-16 xl:py-24`, mobile-first.
- `Badge` kèm chữ (không truyền info chỉ bằng màu).
- `prefers-reduced-motion` global có.
- File ≤300 dòng / function ≤50 dòng; không shadcn; không hardcode giá trị lệch token (trừ các điểm trên).

## Residual risk

- Không chạy được `lint/typecheck/build` (shell deny) → claim PASS của builder chưa được kiểm chứng độc lập.
- Chưa render thực tế ở 375/768/1280 (không browser) → phần visual/keyboard focus chưa xác minh runtime.
- `aislop`/`ocr` không chạy được (shell deny).

## Verdict

❌ **FAIL** — 0 CRITICAL · 2 MAJOR · 5 MINOR

Lý do: còn 2 MAJOR (secondary hover no-op; focus ring vô hình trên nền primary) vi phạm trực tiếp acceptance criteria
của task và R-24. Sửa 2 MAJOR (tối thiểu) rồi rerun round-2.
