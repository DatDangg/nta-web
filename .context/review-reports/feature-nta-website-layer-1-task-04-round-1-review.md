# Review — feature nta-website · layer-1-task-04 · round-1

Agent: reviewer

- Task: `tasks/nta-website/layer-1-task-04.md` (Interactive components — Reveal, FilterBar, Pagination, Skeleton, EmptyState)
- Work item: FEATURE (initial build) · ADDITIVE · Scope: SHARED_FOUNDATION
- Date: 2026-10-08

## Review level

`STRICT`

## Reason

- Task kỳ vọng `NORMAL` (UI thuần, không API/persistence), **nhưng** diff tạo **shared components dùng xuyên trang**
  (Reveal/FilterBar/Pagination là client leaf sẽ được Layer 2 dùng ở nhiều màn `/case-studies`, `/blog`),
  và có **a11y contract tường minh** (R-24: `aria-pressed`, `role="status"` announce, `aria-current="page"`,
  `aria-live`, touch ≥44px, reduced-motion). Theo rule "shared component" + "a11y contract" → nâng `STRICT`.
- Không có auth/RBAC/tenant/schema/migration/payment → không có risk đỏ data/security.

## Blast radius

- `src/components/ui/Reveal.tsx`, `FilterBar.tsx`, `Pagination.tsx`, `Skeleton.tsx`, `EmptyState.tsx` (mới).
- `src/i18n/messages/{vi,en}.json` (thêm namespace `interactive`).
- `tasks/nta-website/layer-1-task-04.md` (checklist/verification).
- Ảnh hưởng gián tiếp: mọi trang dùng filter/pagination/reveal/skeleton/empty (Layer 2 case-studies + blog,
  và mọi trang có section reveal). `Pagination` phụ thuộc `@/i18n/navigation` + `useSearchParams` (Next 15).
- Không đụng API contract, schema, token file, `tailwind.config.ts`, `globals.css`.

## Verify commands + result

- `npm run lint` → **Blocked** — shell bị permission deny (`Permission denied: shell`). Không retry theo Tool Loop Guard.
- `npm run typecheck` → **Blocked** (cùng lý do).
- `npm run build` → **Blocked** (cùng lý do).
- `npm run test` → `skip, test_command: null` (repo chưa cấu hình test framework; khớp task file).
- Không thể kiểm chứng độc lập claim "lint/typecheck/build PASS" của builder → ghi vào **Residual risk**.
- Không chạy app/manual repro (ngoài quyền verify).

## Responsive Checklist Gate

Diff đụng UI → gate bắt buộc. Xác minh bằng CSS math + đọc class (không có môi trường browser).

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout: no horizontal scroll | **FAIL** | `Pagination.tsx:26-31`: `flex w-full ... gap-2`, **không** `flex-wrap`/`overflow-x-auto`; render toàn bộ page number (`Array.from({length: totalPages})`). Button prev/next `px-4` + page `min-w-11` (44px). Tại 375px (container `px-4` → ~343px usable): EN `Previous`+`Next` ≈184px + 4 page ≈176px + gaps 24px ≈ **384px > 343px → tràn ngang** (khoảng ≥4 trang đã overflow). Xem MAJOR #2. |
| Layout: mobile-first (min-width) | OK | Tailwind mặc định `min-width`; không có `max-width` query ngược. |
| Layout: grid auto-fit/minmax, container không fixed px | OK / N/A | Diff không tạo grid; container để caller (`max-w-container` từ Section). |
| Typography/Spacing: rem, clamp, scale | OK | `text-sm` = `--text-sm: 0.875rem`; không hardcode font px trong diff. |
| Media: aspect-ratio, max-width, srcset | OK / N/A | `Skeleton.tsx` dùng `aspect-video`/`aspect-square`/`aspect-[3/4]` (CLS); không có `<img>`/video trong diff. |
| Touch/Interaction: target ≥44px, nav mobile, table scroll | OK | Pills `min-h-11` (=44px) `FilterBar.tsx:27`; pagination `min-h-11 min-w-11` (=44px) `Pagination.tsx:27,29,31`. Nav hamburger & table N/A (không thuộc diff). |
| Viewport/A11y: no `100vh`, reduced-motion, no overflow:hidden masking | OK | Không `100vh`; reduced-motion gate ở `Reveal.tsx:18-22` + global `globals.css:79-88`; không dùng `overflow:hidden` để che lỗi. |

→ **Responsive gate: FAIL** (Pagination overflow). Theo rule, bất kỳ mục FAIL → verdict FAIL.

## Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| `aislop scan --changes --json` | **skip / Blocked** | shell bị deny → không chạy được. |
| `npx oxlint` (anti-slop) | **skip, oxlint not configured** | `package.json` chỉ có `eslint`; không có oxlint config. |
| `ocr review` (open-code-review) | **skip, ocr not installed/Blocked** | shell bị deny; không xác minh được. |
| AI-readable gate | **OK (1 indicator)** | File 14–53 dòng, function ngắn, tên self-descriptive. 1 indicator nhẹ: magic number `threshold: 0.12` (`Reveal.tsx:30`) chưa đặt tên hằng. <3 → không FAIL. |
| ai-friendly-web | **N/A** | Task nội bộ (foundation components), không phải web public deploy. |
| blitzstrike (pentest) | **skip** | Không có attack surface (UI thuần), shell deny. |

## Findings

### [MAJOR] Reveal gây nhấp nháy nội dung: hiện sẵn → ẩn → animate lại

- File: `src/components/ui/Reveal.tsx:13` (`useState(true)`) + `:24` (`setRevealed(false)` trong `useEffect`).
- Vấn đề: SSR render `revealed = true` → nội dung **đã hiển thị** ở frame đầu. `useEffect` chạy **sau paint** →
  `setRevealed(false)` làm nội dung biến mất, rồi IntersectionObserver mới set `true` để fade in.
  Kết quả: nội dung above-the-fold **flash visible → invisible → fade in** (nhấp nháy) mỗi lần load.
  Đi ngược mục tiêu "reveal 1 lần mượt" của task/design §1.5.
- Fix đề xuất: đặt trạng thái ẩn **trước paint** — dùng `useLayoutEffect` cho nhánh set hidden, hoặc
  render hidden mặc định + guard no-JS/SEO (vd. thêm class `.reveal` với `opacity:0` chỉ khi JS enabled),
  hoặc gate bằng CSS class thay vì flip state sau paint. Giữ nguyên nhánh reduced-motion hiện ngay.

### [MAJOR] Pagination tràn ngang trên mobile khi có ≥4 trang

- File: `src/components/ui/Pagination.tsx:26-31`.
- Vấn đề: `nav` không `flex-wrap`, không `overflow-x-auto`, và render **tất cả** page number không window/ellipsis.
  Với `min-w-11` (44px) + prev/next `px-4`, tại 375px nội dung vượt viewport → document `scrollWidth > clientWidth`
  (horizontal scroll). Design Screen 8/10 yêu cầu "pagination full-width" ở base nhưng không có wrap/scroll guard.
- Fix đề xuất: thêm `flex-wrap` (hoặc bọc scroll container `overflow-x-auto`), và/hoặc window page numbers
  (ellipsis) khi `totalPages` lớn; cân nhắc rút gọn prev/next về icon + `aria-label` để tiết kiệm chiều rộng mobile.

### [MINOR] `useSearchParams` cần Suspense boundary khi tích hợp vào page tĩnh (Next 15)

- File: `src/components/ui/Pagination.tsx:4,16`.
- Vấn đề: Next 15 App Router yêu cầu `useSearchParams()` trong client component phải nằm trong `<Suspense>` nếu page
  được static render, nếu không build sẽ báo lỗi "useSearchParams() should be wrapped in a suspense boundary".
  Hiện component chưa được gắn vào page nên build chưa lộ; Layer 2 tích hợp `/case-studies`, `/blog` sẽ gặp.
- Fix đề xuất: ghi chú vào task/Notes cho Layer 2, hoặc bọc `<Suspense>` tại nơi dùng Pagination.

### [MINOR] FilterBar lệch hành vi desktop + copy aria-label so với design

- File: `src/components/ui/FilterBar.tsx:20` (luôn `snap-x snap-mandatory overflow-x-auto`) và `:16,20` (`aria-label`).
- Vấn đề: design Screen 8 ghi `md ≥768: filter wrap` nhưng component luôn cuộn ngang kể cả desktop.
  Ngoài ra design a11y ghi `aria-label="Lọc theo mảng"`, implementation dùng `t('filter.label')` = "Lọc nội dung"
  (generic, chấp nhận được nhưng lệch copy).
- Fix đề xuất: thêm `md:flex-wrap md:overflow-visible` (bỏ snap ở desktop), hoặc xác nhận chủ đích giữ scroll ngang;
  cân nhắc copy label khớp design.

### [MINOR] Pagination render toàn bộ page number (scalability)

- File: `src/components/ui/Pagination.tsx:28`.
- Vấn đề: `Array.from({length: totalPages})` render hết; khi số trang lớn vừa tràn layout (xem MAJOR #2) vừa nhiều DOM.
- Fix đề xuất: window hóa (first/last + ellipsis) như trên.

### [MINOR] `Reveal` dùng `key={index}` cho children

- File: `src/components/ui/Reveal.tsx:40`.
- Vấn đề: index key; chấp nhận cho children tĩnh nhưng nếu caller render danh sách có reorder/removal sẽ sai reconcile.
- Fix đề xuất: yêu cầu caller truyền list đã có key, hoặc document giới hạn chỉ dùng cho children tĩnh.

## Ghi nhận tích cực (không tính FAIL)

- `Reveal`: `'use client'` đúng, `once` qua `observer.disconnect()`, chỉ `transform/opacity`, reduced-motion bypass
  observer + hiện ngay; chọn IntersectionObserver thuần (không thêm dependency) đã ghi lý do vào Notes — khớp task.
- `Skeleton`/`EmptyState`: server component (không `'use client'`), `surface-sunken` + aspect-ratio, `aria-hidden`,
  `aria-live="polite"` + optional action — đúng design §1.4.
- `FilterBar`: `role="group"`, `aria-pressed` đúng, native button keyboard, `role="status"` announce, touch 44px,
  filter client-side qua callback (không reload).
- `Pagination`: `<nav aria-label>`, `aria-current="page"`, giữ `?filter=` khi set `?page=` round-trip.
- i18n `vi/en` đủ key `interactive.filter.options.*`, `pagination.*`, `empty.*`; plural ICU hợp lệ.

## Residual risk

- Không kiểm chứng được `lint/typecheck/build` (shell deny) → claim PASS của builder **chưa được verify độc lập**.
- Chưa chạy app/browser: kích thước pagination suy ra bằng CSS math, chưa đo `scrollWidth` thực tế.
- Components chưa được tích hợp vào page (đúng phạm vi Layer 1) → các lỗi tích hợp (Suspense, URL sync filter)
  sẽ chỉ lộ ở Layer 2.

## Verdict

❌ **FAIL**

- CRITICAL: **0** · MAJOR: **2** · MINOR: **4**
- Blocker: MAJOR #1 (Reveal flicker) và MAJOR #2 (Pagination overflow → Responsive gate FAIL).
- Không commit / không sửa source theo yêu cầu; report scoped only.
