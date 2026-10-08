# Review — feature nta-website · layer-1-task-04 · round-2

Agent: reviewer

- Task: `tasks/nta-website/layer-1-task-04.md` (Interactive components — Reveal, FilterBar, Pagination, Skeleton, EmptyState)
- Work item: FEATURE (initial build) · ADDITIVE · Scope: SHARED_FOUNDATION
- Round: 2 (round-1 FAIL đã fix) · Date: 2026-10-08

## Review level

`STRICT`

## Reason

Giữ nguyên lý do round-1 và vẫn đúng: diff tạo **shared components dùng xuyên trang** (Reveal/FilterBar/Pagination
là client leaf sẽ được Layer 2 dùng ở `/case-studies`, `/blog` và mọi section reveal) + **a11y contract tường minh**
(R-23/R-24: `aria-pressed`, `role="status"`, `aria-current="page"`, `aria-live`, touch ≥44px, reduced-motion).
Không có auth/RBAC/tenant/schema/payment → không có risk đỏ data/security.

## Blast radius

- `src/components/ui/Reveal.tsx`, `FilterBar.tsx`, `Pagination.tsx`, `Skeleton.tsx`, `EmptyState.tsx`.
- `src/i18n/messages/{vi,en}.json` (namespace `interactive`).
- `tasks/nta-website/layer-1-task-04.md`.
- Gián tiếp: mọi trang dùng filter/pagination/reveal/skeleton/empty (Layer 2 case-studies + blog).
  `Pagination` phụ thuộc `@/i18n/navigation` + `useSearchParams` (Next 15).
- Không đụng API contract, schema, tokens, `tailwind.config.ts`, `globals.css`.

## Verify commands + result

- `npm run lint` → **Blocked** — shell bị permission deny (`Permission denied: shell`). Không retry theo Tool Loop Guard.
- `npm run typecheck` → **Blocked** (cùng lý do).
- `npm run build` → **Blocked** (cùng lý do).
- `npm run test` → `skip, test_command: null` (khớp `project-config.md`).
- Primary báo `lint/typecheck/build` PASS; **không kiểm chứng độc lập được** do shell deny → ghi vào Residual risk.

## Trạng thái finding round-1

| # | Round-1 finding | Kết quả |
|---|---|---|
| MAJOR#1 | Reveal flash visible→invisible→fade | **CHƯA xử lý hết** — `useLayoutEffect` chỉ ẩn *sau hydration*; SSR vẫn render `revealed=true` nên content được paint trước hydration rồi mới ẩn (xem Finding MAJOR#1). Client-side nav đã hết flash. |
| MAJOR#2 | Pagination tràn ngang 375px | **Đã fix** — `flex-wrap` + windowed `getVisiblePages` + ellipsis + prev/next icon `min-w-11`. Không còn overflow (xem Responsive gate). |
| MINOR#3 | `useSearchParams` cần Suspense (Next 15) | **Chưa ghi chú** cho Layer 2 (task Notes không có) — vẫn mở. |
| MINOR#4 | FilterBar lệch desktop + copy aria-label | Desktop behavior **đã fix** (`md:flex-wrap md:snap-none md:overflow-visible`), **nhưng** đổi aria-label sang hardcode VI → tạo regression mới (Finding MAJOR#2). |
| MINOR#5 | Pagination render toàn bộ page number | **Đã fix** — window hóa. |
| MINOR#6 | `key={index}` ở Reveal | **Chưa xử lý** — vẫn `key={index}` (`Reveal.tsx:40`). |

## Responsive Checklist Gate

Diff đụng UI → gate bắt buộc. Xác minh bằng CSS math + đọc class (không có môi trường browser).

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout: no horizontal scroll | **OK** | `Pagination.tsx:35` `flex w-full flex-wrap items-center justify-center gap-1 sm:gap-2` — wrap nên không vượt viewport. CSS math worst case 375px: prev44 + 5 page×44 + 2 ellipsis×~12 + next44 + 8 gap×4 ≈ 364px có thể wrap xuống 2 dòng, **không** sinh document scroll. Tại 320px (~288px usable) càng wrap, item đơn ≤44px → không tràn. `FilterBar.tsx:20` base `overflow-x-auto` là scroll container có chủ đích (design Screen 8 "filter scroll-snap ngang 1 dòng"), không phải document overflow; `shrink-0` pills. |
| Layout: mobile-first (min-width) | **OK** | Tailwind mặc định `min-width`; không có `max-width` query ngược. |
| Layout: grid auto-fit/minmax, container không fixed px | **N/A** | Diff không tạo grid; container để caller (`max-w-container` từ Section). |
| Typography/Spacing: rem, clamp, scale | **OK** | Dùng `text-sm` (`--text-sm: 0.875rem`); không hardcode font px trong diff. |
| Media: aspect-ratio, max-width, srcset | **OK / N/A** | `Skeleton.tsx:6-10` `aspect-video`/`aspect-square`/`aspect-[3/4]` (CLS); không có `<img>`/video trong diff. |
| Touch/Interaction: target ≥44px, nav mobile, table scroll | **OK** | Pills `min-h-11` (=44px) `FilterBar.tsx:27`; pagination prev/next/page `min-h-11 min-w-11` (=44px) `Pagination.tsx:36,40,43`. Nav hamburger & table N/A. |
| Viewport/A11y: no `100vh`, reduced-motion, no `overflow:hidden` masking | **OK** | Không `100vh`; reduced-motion gate `Reveal.tsx:18-22` + global `globals.css:79-88` (ILI `animation-duration`/`transition-duration` 0.01ms → `Skeleton.animate-pulse` bị vô hiệu khi reduced-motion); `FilterBar.overflow-x-auto` là scroll region chủ đích, không che lỗi. |

→ **Responsive gate: PASS** (round-1 overflow đã được fix).

## Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| `aislop scan --changes --json` | **skip/Blocked** | Shell bị deny; không thấy `node_modules/.bin/aislop` (glob empty). Không chạy được. |
| `npx oxlint` (anti-slop) | **skip, oxlint not configured** | `package.json` chỉ có `eslint`; không có oxlint config (glob empty), không có `node_modules/.bin/oxlint`. |
| `ocr review` (open-code-review) | **skip, ocr not installed** | Shell deny + không có `node_modules/.bin/ocr`. |
| AI-readable gate | **OK (1 indicator)** | File 14–53 dòng, function ngắn, tên self-descriptive. 1 indicator nhẹ: magic number `threshold: 0.12` (`Reveal.tsx:30`) chưa đặt tên hằng. <3 → không FAIL. |
| ai-friendly-web | **N/A** | Task nội bộ (foundation components), không phải web public deploy. |
| blitzstrike (pentest) | **skip** | Không có attack surface (UI thuần) + shell deny. |

## Findings

### [MAJOR] Reveal vẫn flash trên initial (SSR) load — `useLayoutEffect` chưa xử lý hết

- File: `src/components/ui/Reveal.tsx:13` (`useState(true)`) + `:15` (`useLayoutEffect`).
- Vấn đề: `revealed` khởi tạo `true` → **SSR HTML render nội dung đang hiển thị** (`opacity:1`). Browser paint
  HTML đó (FCP) **trước khi** JS bundle hydrate. `useLayoutEffect` chỉ chạy *sau hydration* → `setRevealed(false)`
  ẩn nội dung **sau khi nó đã được paint**. Vì `transition` được gắn vô điều kiện (`:44`), thay đổi `1 → 0`
  có thể animate (fade-out) rồi observer fade-in → above-the-fold vẫn có chuỗi
  **visible (SSR) → hidden → fade in** trên mỗi initial load (khác round-1 chỉ ở chỗ bỏ được *thêm một frame
  visible post-hydration*; client-side nav thì đã hết flash).
- Đánh giá: `useLayoutEffect` là option #1 reviewer round-1 gợi ý, nhưng **không đủ** vì server HTML đã được
  paint trước hydration. Đây là cùng defect MAJOR#1, chưa đóng trọn.
- Fix đề xuất (option #2 round-1): render **hidden mặc định** nhưng gate bằng JS-availability để giữ no-JS/SEO —
  vd. inline script ở root layout thêm class `js` lên `<html>`, CSS `.reveal { opacity:0; transform:translateY(16px) }`
  chỉ áp dụng khi `html.js`; nếu không có JS thì nội dung hiển thị bình thường. Tối thiểu: tắt `transition` cho
  lần ẩn đầu tiên để không fade-out.
- No-JS/SEO fallback hiện tại **OK** (SSR luôn visible) — cần giữ khi đổi sang CSS gate.

### [MAJOR] FilterBar hardcode aria-label tiếng Việt → regression i18n cho locale EN

- File: `src/components/ui/FilterBar.tsx:20` — `aria-label="Lọc theo mảng"`.
- Vấn đề: round-1 dùng `t('filter.label')` (localized). Fix đã đổi thành **chuỗi VI hardcode** để khớp design
  Screen 8. Hệ quả: trên route EN (`/en/...`) screen reader đọc **tiếng Việt** ("Lọc theo mảng") → vi phạm i18n
  + a11y contract (R-20 vi/en + R-24). Key cũ `interactive.filter.label` (`vi.json:40`/`en.json:40`) giờ **không
  còn được dùng** (dead key).
- Fix đề xuất: thêm key `interactive.filter.groupLabel` cho cả vi (`"Lọc theo mảng"`) và en
  (`"Filter by category"`), rồi dùng `aria-label={t('filter.groupLabel')}`. Xoá/khôi phục `filter.label` cho khỏi dead key.

### [MINOR] `useLayoutEffect` phát warning SSR (dev) trong Next/React

- File: `src/components/ui/Reveal.tsx:3,15`.
- Vấn đề: `useLayoutEffect` trong client component được SSR (App Router) → React dev log
  "useLayoutEffect does nothing on the server..." (đã kiểm chứng còn tồn tại React 19/Next 15). Dev-only, không
  phá build/hydrate (initial client render = server render = `true` nên không mismatch), nhưng gây noise + dễ
  bị hiểu nhầm. Fix: dùng `useIsomorphicLayoutEffect` (`typeof window !== 'undefined' ? useLayoutEffect : useEffect`),
  hoặc chuyển hẳn sang CSS gate như Finding MAJOR#1 (khuyến nghị, gộp luôn).

### [MINOR] `useSearchParams` chưa có ghi chú Suspense cho Layer 2 (round-1 MINOR#3)

- File: `src/components/ui/Pagination.tsx:24`.
- Vấn đề: Next 15 yêu cầu `useSearchParams()` trong client component phải nằm trong `<Suspense>` nếu page static
  render, nếu không build sẽ lỗi khi Layer 2 tích hợp `/case-studies`, `/blog`. Task Notes hiện **không** có ghi chú.
- Fix đề xuất: thêm note vào task Notes (hoặc doc Layer 2) rằng caller phải bọc `<Suspense>` quanh Pagination.

### [MINOR] `Reveal` vẫn dùng `key={index}` (round-1 MINOR#6)

- File: `src/components/ui/Reveal.tsx:40`.
- Vấn đề: index key; chấp nhận cho children tĩnh nhưng sai reconcile nếu caller render list có reorder/removal.
- Fix đề xuất: document giới hạn "chỉ dùng cho children tĩnh" hoặc yêu cầu caller truyền list đã có key.

### [MINOR] Dead i18n key `interactive.filter.label`

- File: `src/i18n/messages/vi.json:40`, `src/i18n/messages/en.json:40`.
- Vấn đề: sau khi hardcode aria-label, `filter.label` không còn được tham chiếu (grep xác nhận 0 usage).
- Fix đề xuất: hoặc dùng lại key này cho aria-label (có i18n), hoặc xoá khỏi cả 2 file.

## Ghi nhận tích cực (không tính FAIL)

- `Pagination` round-1 MAJOR#2 **đã fix đúng**: `flex-wrap` + `getVisiblePages` (first/last/current±1 + ellipsis
  `aria-hidden`) + prev/next icon `aria-label`; `aria-current="page"`; deep-link giữ `?filter=` qua
  `new URLSearchParams(searchParams.toString()).set('page', …)`.
- `FilterBar` desktop behavior round-1 MINOR#4 **đã fix** (`md:flex-wrap md:snap-none md:overflow-visible`).
- `Skeleton`/`EmptyState` vẫn là server component, aspect-ratio + `aria-hidden` / `aria-live` đúng design §1.4.
- `Reveal` client-nav: initial client render rồi `useLayoutEffect` ẩn trước paint → client-side navigation không flash.
- i18n `vi/en` đủ key `interactive.pagination.*`, `empty.*`; plural ICU hợp lệ.

## Residual risk

- **Không kiểm chứng độc lập** `lint/typecheck/build` (shell deny) → claim PASS của builder chưa verify.
- **Chưa chạy browser** → đánh giá Reveal flash và Pagination sizing bằng CSS math/suy luận, chưa đo
  `scrollWidth`/paint thực tế. Flash của Reveal cần xác nhận bằng network throttle trong browser.
- Components chưa tích hợp vào page (đúng phạm vi Layer 1) → lỗi tích hợp (Suspense, URL sync filter) sẽ lộ ở Layer 2.
- `aislop`/`ocr` không chạy được (shell deny + chưa cài) → các gate này không đóng góp tín hiệu.

## Verdict

❌ **FAIL**

- CRITICAL: **0** · MAJOR: **2** · MINOR: **4**
- Blocker:
  - **MAJOR#1** — Reveal vẫn flash trên initial SSR load (`useState(true)` + ẩn sau hydration); cần render hidden
    mặc định + gate JS (hoặc tương đương) để đóng trọn defect round-1.
  - **MAJOR#2** — FilterBar hardcode `aria-label="Lọc theo mảng"` → regression i18n/a11y cho locale EN; phải đưa qua i18n.
- Round-1 MAJOR#2 (Pagination overflow) đã PASS; Responsive gate PASS.
- Không sửa source; report scoped only.
