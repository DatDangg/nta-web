# Review — feature nta-website · layer-1-task-04 · round-3

Agent: reviewer

- Task: `tasks/nta-website/layer-1-task-04.md` (Interactive components — Reveal, FilterBar, Pagination, Skeleton, EmptyState)
- Work item: FEATURE (initial build) · ADDITIVE · Scope: SHARED_FOUNDATION
- Round: 3 (round-1 + round-2 FAIL; fix attempt 2 theo user approve) · Date: 2026-10-08

## Review level

`STRICT`

## Reason

Giữ lý do như round-1/round-2 (vẫn đúng): diff tạo **shared components dùng xuyên trang**
(Reveal/FilterBar/Pagination client-leaf sẽ dùng ở `/case-studies`, `/blog` + mọi section reveal) và có
**a11y contract tường minh** (R-23/R-24: `aria-pressed`, `role="status"`, `aria-current="page"`,
`aria-live`, touch ≥44px, reduced-motion). Không auth/RBAC/tenant/schema/payment → không risk đỏ data/security.

## Blast radius

- `src/components/ui/{Reveal,FilterBar,Pagination,Skeleton,EmptyState}.tsx`
- `src/app/globals.css` (CSS gate `.reveal`/`.reveal-item` + reduced-motion)
- `src/app/[locale]/layout.tsx` (inline script `document.documentElement.classList.add('js')`)
- `src/i18n/messages/{vi,en}.json` (namespace `interactive`, key đổi `filter.label` → `filter.groupLabel`)
- `tasks/nta-website/layer-1-task-04.md` (checklist/verification/notes)
- Gián tiếp: mọi trang dùng filter/pagination/reveal/skeleton/empty (Layer 2 case-studies + blog).
  `Pagination` phụ thuộc `@/i18n/navigation` + `useSearchParams` (Next 15).
- Không đụng API contract, schema, tokens, `tailwind.config.ts`.

## Verify commands + result

- `npm run lint` → **Blocked** — shell bị permission deny (`Permission denied: shell`). Không retry (Tool Loop Guard).
- `npm run typecheck` → **Blocked** (cùng lý do).
- `npm run build` → **Blocked** (cùng lý do).
- `npm run test` → `skip, test_command: null` (khớp `project-config.md`).
- Không kiểm chứng độc lập được `lint/typecheck/build` → ghi Residual risk. Đã đọc trực tiếp toàn bộ file diff +
  cross-check i18n/CSS/layout để review logic.

## Trạng thái 2 MAJOR round-2

| # | Round-2 finding | Kết quả round-3 |
|---|---|---|
| MAJOR#1 | Reveal SSR flash visible→hidden→fade | **ĐÃ ĐÓNG** — chuyển sang CSS gate + inline script đặt ở **phần tử đầu tiên của `<body>`**; không còn `useLayoutEffect`/`useState(true)`. Phân tích bên dưới. |
| MAJOR#2 | FilterBar hardcode aria-label tiếng Việt | **ĐÃ ĐÓNG** — `t('filter.groupLabel')`, key có đủ cả vi/en, không còn hardcode VI, `filter.label` dead key đã xoá. |

## Trạng thái MINOR round-2

| # | Round-2 MINOR | Kết quả |
|---|---|---|
| MINOR#3 | `useSearchParams` cần Suspense (Next 15) cho Layer 2 | **ĐÓNG** — `tasks/nta-website/layer-1-task-04.md:85` có note "Layer 2: bọc `Pagination` trong `<Suspense>`…". |
| MINOR#4/`key={index}` | `Reveal` index key | **ĐÓNG** — `layer-1-task-04.md:86` document giới hạn "chỉ truyền children tĩnh, không dùng cho list reorder". |
| MINOR | Warning `useLayoutEffect` SSR | **ĐÓNG** — `useLayoutEffect` đã bị bỏ hoàn toàn (grep `src` = 0 match; `Reveal.tsx:3` chỉ import `useEffect`). |
| MINOR | Dead i18n key `interactive.filter.label` | **ĐÓNG** — grep `filter.label` toàn repo = 0; `vi.json:39-43`/`en.json:39-43` chỉ còn `groupLabel`. |

## Phân tích MAJOR#1 (Reveal SSR flash) — đóng trọn?

- Trạng thái mới: `Reveal.tsx:13` `useState(false)` → SSR render `class="reveal"` **không** `revealed`
  (`Reveal.tsx:36`). CSS `globals.css:83-86` `html.js .reveal:not(.revealed) .reveal-item { opacity:0; transform:translateY(16px) }`.
- **Không còn flash visible→hidden:** inline script `[locale]/layout.tsx:28` là **node đầu tiên trong `<body>`**.
  Đây là script inline đồng bộ (parser-blocking), không `async`/`defer` → trình duyệt **dừng parse, thực thi script
  thêm class `js` lên `<html>` TRƯỚC khi parse `main`/các phần tử `.reveal` phía sau**. Vì `.reveal` chưa tồn tại
  ở thời điểm script chạy, frame paint đầu tiên đã có `html.js` → item render ra đã hidden ngay từ đầu, không có
  pha "visible rồi ẩn". (Đây là pattern `no-js`→`js` tiêu chuẩn, tương đương cách `next-themes` set class trên
  `documentElement` trước hydration.)
- **Trước paint chưa?** Có — script parser-blocking ở đầu `<body>`, nội dung `.reveal` (trong `main`) được parse
  và render **sau** script; kể cả khi page content stream ở chunk sau, `js` đã được set từ shell.
- **No-JS/SEO fallback giữ nguyên:** không JS → script không chạy → không có `js` → rule `html.js …` không áp dụng
  → `.reveal-item` mặc định `opacity:1`; nội dung vẫn nằm trong DOM/HTML server (opacity:0 vẫn không cần thiết vì
  gate không kích hoạt) → crawler/no-JS đọc bình thường. ✅
- **Reduced-motion hiện ngay:** `globals.css:88-93` override cùng selector về `opacity:1; transform:none` (đặt sau
  → thắng theo thứ tự nguồn); cộng `globals.css:95-104` set `transition-duration:0.01ms !important`. Effect
  `Reveal.tsx:19-22` bypass observer + `setRevealed(true)` → không animate, hiện ngay, không flash. ✅
- **Hydration mismatch:** SSR render `revealed=false`, client initial render cũng `false` → khớp. Script chỉ thêm
  class `js` lên `<html>` ngoài DOM React (`className` không được React render ở server lẫn client) → React không
  quản/không diff attr này (pattern chuẩn, không sinh mismatch). ✅
- **Client-side nav:** component mount `revealed=false` + `html.js` đã có → hidden ngay ở first client render →
  không flash. ✅
- **Magic number `threshold: 0.12`** (`Reveal.tsx:29`): vẫn tồn tại chưa đặt tên — xem AI-readable gate / MINOR.

→ **MAJOR#1 đóng trọn.**

## Phân tích MAJOR#2 (FilterBar aria-label VI hardcode) — đóng trọn?

- `FilterBar.tsx:20` `aria-label={t('filter.groupLabel')}` với `useTranslations('interactive')` (`:16`).
- `vi.json:40` `"groupLabel": "Lọc theo mảng"`; `en.json:40` `"groupLabel": "Filter by category"` → **đủ cả 2 locale**.
- grep `filter.label` trong `src` = **0 match** → không còn hardcode VI và dead key đã bị xoá (namespace `interactive.filter`
  giờ chỉ còn `groupLabel` + `options` + `resultCount`).
- EN route `/en/...` → screen reader đọc tiếng Anh. ✅ **MAJOR#2 đóng trọn.**

## Responsive Checklist Gate

Diff đụng UI → gate bắt buộc. Xác minh bằng CSS math + đọc class (không có môi trường browser).

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout: no horizontal scroll | **OK** | `Pagination.tsx:35` `flex w-full flex-wrap items-center justify-center gap-1 sm:gap-2` → wrap, không vượt viewport (round-2 đã fix, không đổi). `FilterBar.tsx:20` base `overflow-x-auto` là scroll container chủ đích (design Screen 8 "filter scroll-snap ngang 1 dòng"), pills `shrink-0`; `md:flex-wrap md:snap-none md:overflow-visible` chuyển wrap ở desktop. `.reveal-item` dùng `translateY(16px)` (trục Y) → không sinh overflow ngang. |
| Layout: mobile-first (min-width) | **OK** | Tailwind mặc định `min-width`; chỉ có `md:` (min-width) override, không có `max-width` query ngược. |
| Layout: grid auto-fit/minmax, container không fixed px | **N/A** | Diff không tạo grid; container để caller. |
| Typography/Spacing: rem, clamp, scale | **OK** | `text-sm` (`--text-sm: 0.875rem`); không hardcode font px trong diff; CSS mới chỉ dùng `400ms`/`16px` cho motion (không phải font). |
| Media: aspect-ratio, max-width, srcset | **OK / N/A** | `Skeleton.tsx:6-13` `aspect-video`/`aspect-square`/`aspect-[3/4]` (CLS < 0.1); không có `<img>`/video trong diff. |
| Touch/Interaction: target ≥44px, nav mobile, table scroll | **OK** | Pills `min-h-11` (=44px) `FilterBar.tsx:27`; pagination prev/next/page `min-h-11 min-w-11` (=44px) `Pagination.tsx:36,40,43`. Nav hamburger & table N/A (ngoài diff). |
| Viewport/A11y: no `100vh`, reduced-motion, no `overflow:hidden` masking | **OK** | Không `100vh`; reduced-motion gate `globals.css:88-104` (ẩn ngay + kill animation/transition); không dùng `overflow:hidden` che lỗi. |

→ **Responsive gate: PASS.** (Không có mục FAIL.)

## Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| `aislop scan --changes --json` | **skip/Blocked** | Shell bị deny; glob `**/{oxlint,aislop}*` = empty (không có binary/config). Không chạy được. |
| `npx oxlint` (anti-slop) | **skip, oxlint not configured** | `package.json` chỉ có `eslint`; không có oxlint config. |
| `ocr review` (open-code-review) | **skip, ocr not installed / Blocked** | Không có `node_modules/.bin/ocr`; shell deny. |
| AI-readable gate | **OK (1 indicator)** | File 14–48 dòng, function ≤ ~37 dòng, tên self-descriptive, không indirection >3 bước. 1 indicator nhẹ: magic number `threshold: 0.12` (`Reveal.tsx:29`) chưa đặt tên hằng. <3 → không FAIL. |
| ai-friendly-web | **N/A** | Task nội bộ (foundation components), chưa public deploy. |
| blitzstrike (pentest) | **skip** | Không có attack surface (UI thuần) + shell deny. |

## Findings

### [MINOR] `js` gate không có graceful fallback nếu hydration/bundle lỗi

- File: `src/components/ui/Reveal.tsx:36` + `src/app/globals.css:83-86`.
- Vấn đề: nếu inline script chạy (đã thêm `js`) nhưng React bundle load lỗi/không hydrate, `.reveal` không bao giờ
  nhận `revealed` → `.reveal-item` kẹt `opacity:0` vĩnh viễn (nội dung ẩn dù JS "đã bật"). No-JS hoàn toàn thì OK
  (không có `js`), nhưng "JS bật, bundle fail" là edge. Đây là tradeoff đã biết của pattern CSS-gate mà round-1
  gợi ý, không phải regression mới.
- Fix đề xuất (không bắt buộc cho task này): thêm safety timeout/`<noscript>`-style fallback, hoặc CSS
  `@media` dựa trên animation để tự hiện sau vài giây. Cân nhắc ở Layer 2 khi Reveal thực sự dùng trên page.

### [MINOR] Meta `threshold: 0.12` và stagger `60ms` là magic number

- File: `src/components/ui/Reveal.tsx:29` (`threshold: 0.12`), `:41` (`index * 60`).
- Vấn đề: chưa đặt tên hằng. `60ms` khớp design §1.5 (stagger 60ms) nên chấp nhận; `0.12` không trace được vào
  design/spec → 1 AI-chaos indicator.
- Fix đề xuất: `const REVEAL_THRESHOLD = 0.12;` (và `STAGGER_MS = 60` nếu muốn nhất quán). Không chặn PASS (<3 indicator).

### [MINOR] Reveal ẩn nội dung sau JS → có thể đẩy LCP above-the-fold

- File: `src/app/globals.css:83-86`.
- Vấn đề: phần tử bọc bởi `Reveal` bị `opacity:0` tới khi observer chạy sau hydration → nếu caller bọc hero/LCP
  element, LCP bị trễ tới sau hydration. Chưa xảy ra ở Layer 1 (component chưa gắn page).
- Fix đề xuất: ghi chú Layer 2 "không bọc hero/LCP element trong `Reveal`" (task đã có tinh thần "section reveal").
  Không chặn PASS.

### [MINOR][nit] `role="status"` + `aria-live="polite"` trùng ngữ nghĩa

- File: `src/components/ui/FilterBar.tsx:33`.
- Vấn đề: `role="status"` đã ngầm định `aria-live="polite"`; khai cả hai là thừa (không sai, không hại).
- Fix đề xuất: bỏ `aria-live="polite"` cho gọn. Không chặn PASS.

## Ghi nhận tích cực (không tính FAIL)

- MAJOR#1 round-1/round-2 đóng trọn bằng CSS gate + script đầu `<body>`; no-JS/SEO fallback và reduced-motion
  được giữ đúng; không còn `useLayoutEffect` → hết warning SSR dev.
- MAJOR#2 round-2 đóng trọn: i18n 2 locale đủ key, không hardcode VI, dead key `filter.label` đã xoá.
- MINOR round-2 (Suspense note, `key={index}` doc) đã cập nhật vào task Notes.
- `Pagination`: window hóa `getVisiblePages` + ellipsis `aria-hidden` + prev/next `min-w-11` + `aria-current="page"`
  + giữ `?filter=` round-trip — đúng R-08/R-09/R-24.
- `Skeleton`/`EmptyState` vẫn server component, `aspect-ratio` + `aria-hidden` / `aria-live="polite"` + optional
  action — đúng design §1.4.

## Residual risk

- **Không kiểm chứng độc lập** `lint/typecheck/build` (shell permission deny) → claim PASS của builder chưa verify.
- **Chưa chạy browser** → đánh giá "no flash" bằng phân tích parser-blocking + CSS math, chưa đo paint thực tế /
  network throttle. Đề xuất Layer 2 xác nhận bằng DevTools khi Reveal gắn vào page thật.
- Edge "`js` có nhưng bundle fail" (MINOR ở trên) chỉ lộ trong điều kiện mạng lỗi.
- Components chưa tích hợp page (đúng phạm vi Layer 1) → lỗi tích hợp (Suspense, URL sync filter) sẽ lộ ở Layer 2.
- `aislop`/`ocr`/`oxlint` không chạy được → các gate này không đóng góp tín hiệu.

## Verdict

✅ **PASS**

- CRITICAL: **0** · MAJOR: **0** · MINOR: **4** (không blocker)
- **MAJOR#1 đóng trọn** (Reveal không còn flash initial SSR: CSS gate + inline script đầu `<body>`; no-JS/SEO +
  reduced-motion giữ đúng; không hydration mismatch).
- **MAJOR#2 đóng trọn** (FilterBar aria-label qua i18n, key có ở vi+en, dead key đã xoá).
- Responsive gate: **PASS** (không mục FAIL).
- Không sửa source; report scoped only.
