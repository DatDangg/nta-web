Agent: reviewer

# Review — feature nta-website · layer-1-task-05 (404 not-found / Screen 13) · round 2

> Round 2 sau khi builder fix theo MAJOR #1 (round 1) + MINOR #3/#4/#5. Đọc đối chiếu:
> `.context/review-reports/feature-nta-website-layer-1-task-05-round-1-review.md`.

## Review level
**STRICT** (giữ nguyên như round 1)

## Reason
`src/app/[locale]/[...rest]/page.tsx` là **catch-all** thay đổi cách resolve route toàn site (navigation
surface, ảnh hưởng mọi URL sai + mọi route sẽ thêm ở Layer 2+). Kèm ràng buộc SEO (`noindex`) và a11y
(`focus vào main`) cần xác minh → red-risk "shared/navigation" → STRICT. Fix round này **chạm shared
navigation surface + layout toàn site** (`layout.tsx` sửa `tabIndex` trên `<main>` áp cho mọi trang),
củng cố lý do giữ STRICT thay vì hạ NORMAL.

## Blast radius
- `src/app/[locale]/layout.tsx:34` — `<main id="main" tabIndex={-1}>` **áp cho TẤT CẢ trang** (không chỉ 404).
- `src/app/[locale]/not-found.tsx` — UI 404 mọi URL sai, cả 2 locale (đổi breakpoint + gắn `FocusMain`).
- `src/components/shared/FocusMain.tsx` — **mới**, client component chạy `useEffect` focus `#main`.
- `src/app/[locale]/[...rest]/page.tsx` — đổi tên symbol (không đổi hành vi).
- `src/i18n/messages/{vi,en}.json` — namespace `notFound` (không đổi round này).
- Hưởng gián tiếp: skip-link `#main` trong layout, Header/Footer.
- Không đụng DB/API/auth/token/session/payment.

## Verify commands + result
| Command | Result | Evidence |
|---|---|---|
| `npm run lint` | ✅ PASS | `eslint .` rc 0, không in lỗi |
| `npm run typecheck` | ✅ PASS | `tsc --noEmit` rc 0 |
| `npm run build` | ✅ PASS | Next 15.5.27; routes `○ /_not-found`, `● /[locale]` (/vi,/en), `ƒ /[locale]/[...rest]` (dynamic), middleware built |
| `test_command` | skip | `test_command: null` (project chưa có test framework — đúng task DoD) |
| `git diff` / `git status --short` | ⛔ Blocked | Shell bị `permission denied` cho lệnh có `git` (reviewer read-only) — **không retry** theo Tool Loop Guard. Xem Residual risk. |

## Xác minh MAJOR #1 (focus vào main) — round 1 blocker
| Hạng mục | Kết quả | Bằng chứng |
|---|---|---|
| Có focus management | ✅ | `src/components/shared/FocusMain.tsx:6-8` — `useEffect(() => document.getElementById('main')?.focus(), [])` |
| `#main` tồn tại & focusable | ✅ | `src/app/[locale]/layout.tsx:34` — `<main id="main" tabIndex={-1}>{children}</main>`; `tabIndex={-1}` cho phép focus lập trình |
| Được render trong 404 | ✅ | `src/app/[locale]/not-found.tsx:5` import, `:27` `<FocusMain />` trong `<section>` |
| SSR/hydration an toàn | ✅ (code-level) | `FocusMain` trả `null` ở cả server & client → không hydration mismatch; `useEffect` chỉ chạy client, không đụng SSR |
| Không regression toàn site | ✅ | `tabIndex={-1}` chỉ thêm khả năng focus lập trình, không đổi tab order/skip-link; route build vẫn đúng |

→ **MAJOR #1 closed.** Không có môi trường browser để assert `document.activeElement === #main` runtime → ghi Residual risk (không thể tự chạy app).

## MINOR round 1 — đối chiếu
| # | Nội dung | Trạng thái round 2 | Bằng chứng |
|---|---|---|---|
| #2 | Metadata nested `not-found.tsx` có thể không áp dụng | ⚠️ **Defer (chấp nhận)** | `not-found.tsx:7-13` vẫn có `generateMetadata`; AC `robots: noindex` vẫn đạt do Next auto-inject noindex cho 404. Chỉ `<title>` có nguy cơ thiếu → residual. **Chưa fix** nhưng MINOR + AC cốt lõi đạt |
| #3 | Breakpoint lệch design (640 → 768) | ✅ **Fixed** | CTA `:30` `w-full md:w-auto`; grid `:34` `grid-cols-1 md:grid-cols-2` — khớp design "≥768 link list 2 cột / CTA full-width base" |
| #4 | `min-h-[50dvh]` thiếu fallback `vh` | ✅ **Fixed** | `not-found.tsx:26` `min-h-[50vh] min-h-[50dvh]` (fallback vh trước dvh) |
| #5 | Tên symbol misleading ở catch-all | ✅ **Fixed** | `[...rest]/page.tsx:3` đổi `UnknownLocaleRoute` → `CatchAllNotFound` |

## Responsive Checklist Gate (diff đụng UI → áp dụng)
Breakpoints: `[640, 768, 1024, 1280, 1536]`. Không có browser → xác minh bằng CSS math; phần chưa xác minh ghi Residual risk.

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout — không horizontal scroll | OK | `section` `max-w-[560px] mx-auto px-4 … sm:px-6`; nội dung wrap; grid 1→2 cột. 375px: 1 cột, không tràn |
| Layout — mobile-first (`min-width`) | OK | Base 1 cột, nâng cấp bằng `md:` (`grid-cols-1 md:grid-cols-2`) |
| Layout — grid không cột cứng vô cớ | OK (note) | `md:grid-cols-2` cố định tải breakpoint là **intentional** theo design Screen 13 |
| Typography/Spacing — rem/token | OK | `text-display`, `text-base`, `leading-7`, `tracking-tight` (token Tailwind) |
| Typography — heading fluid | OK (note) | `text-display` token; `clamp()` của token ngoài file diff, chưa kiểm |
| Media — ảnh/video | N/A | Trang 404 không có media |
| Touch — target ≥44×44px | OK | Link gợi ý `min-h-11` (44px); HomeLink `Button lg` `min-h-12` (48px) |
| Touch — nav mobile không tràn | OK | Danh sách link stack dọc (1 cột) ở mobile |
| Viewport — không dùng `100vh` trần | OK | `not-found.tsx:26` `min-h-[50vh] min-h-[50dvh]` (có fallback) |
| `prefers-reduced-motion` | OK | Không reveal/animate (đúng design); không có motion để gate |
| Không che lỗi bằng `overflow:hidden` | OK | Không dùng `overflow:hidden` |

**Kết luận gate: không mục nào FAIL** → responsive gate không chặn PASS.

## Skill gates
| Gate | Kết quả | Bằng chứng |
|---|---|---|
| `aislop` | ✅ OK | `npx aislop scan --changes --json` → score **93** (Healthy) ≥ 80. 1 diagnostic security `security/dangerously-set-innerhtml` ở `layout.tsx:28` — **false positive**: chuỗi hằng tĩnh `document.documentElement.classList.add('js')`, không có input người dùng/không XSS; dòng này **có sẵn** từ scaffold, chỉ mới lộ ra vì `layout.tsx` giờ nằm trong changeset. Không phải defect mới. |
| `oxlint` (anti-slop) | skip | Không có `.oxlintrc*` và không có dependency oxlint (`package.json` lint = eslint) → `skip, oxlint not configured` |
| `ocr` (open-code-review) | skip | Không cài trong repo → `skip, ocr not installed` (optional, không chặn) |
| AI-readable | ✅ OK | File mới `FocusMain.tsx` 11 dòng, tên self-descriptive; `CatchAllNotFound` rõ nghĩa (đã fix #5). 0 AI-chaos indicator (< 3) |
| ai-friendly-web | N/A | Task không phải deploy; diff không tạo surface crawler mới. `robots.txt`/`llms.txt`/`sitemap.xml` thuộc DevOps Phase 6 |
| blitzstrike | skip | Không cài/không phải task auth/API/input nhạy cảm |

## Acceptance Criteria — đối chiếu (round 2)
| AC | Kết quả | Evidence |
|---|---|---|
| `/khong-ton-tai`, `/en/does-not-exist` → 404 đúng locale | ✅ (structural) | `messages` `notFound` vi+en; `not-found.tsx:16` `getTranslations('notFound')`; catch-all `notFound()` |
| `/solutions/enterprise/sai-slug` → 404 (R-05), `/blog/sai` → 404 (R-09) | ✅ (structural) | Chưa có route `solutions/*`/`blog/*` → catch-all bắt hết; Layer 2 thêm route thật sẽ ưu tiên hơn catch-all |
| h1 duy nhất; message problem+recovery; HomeLink + ≥3 link | ✅ | `not-found.tsx:28` 1 `<h1>`; `:29` message; `:30` HomeLink; `:33-43` 4 link |
| `robots: noindex`; không JSON-LD | ✅ | `not-found.tsx:11` `robots:{index:false,follow:false}`; không JSON-LD; Next auto-inject noindex cho 404 |
| Header/Footer render; lang toggle không 404 loop | ✅ | Header/Footer ở `layout.tsx`; LanguageToggle dùng path next-intl (không prefix) → URL sai ở locale mới → 404, không loop |
| **R-24 focus vào main** | ✅ | `FocusMain` + `tabIndex={-1}` (xem mục xác minh trên) |
| Check commands pass | ✅ | lint/typecheck/build PASS |

## Findings

### Không còn CRITICAL / MAJOR

### [MINOR] A — Nesting `generateMetadata` của `not-found.tsx` chưa xác minh runtime (defer round 1 #2)
- Vị trí: `src/app/[locale]/not-found.tsx:7-13`.
- Đánh giá: **chấp nhận defer**. AC `robots: noindex` vẫn đạt (Next tự inject noindex cho response 404);
  chỉ `<title>` có nguy cơ không áp dụng. MINOR, không chặn.
- Đề xuất: khi có browser/dev, kiểm `<title>` trong HTML 404; nếu thiếu → đặt metadata ở `[locale]/layout.tsx`
  hoặc dùng `global-not-found`.
- Process note: quyết định defer **chưa được ghi vào task file** (`layer-1-task-05.md` không có mục residual).
  AGENTS.md quy định task file là source of truth cho residual risk → nên bổ sung 1 dòng khi close-out.

### [MINOR] B — Thứ tự cascade fallback `min-h-[50vh] min-h-[50dvh]` chưa xác minh
- Vị trí: `src/app/[locale]/not-found.tsx:26`.
- Tailwind sinh CSS theo thứ tự nội bộ (không theo thứ tự class trong HTML); cần `50dvh` đứng sau `50vh`
  trong stylesheet để browser hỗ trợ dvh thắng. Không xác minh được (CSS build minified, không browser).
- Impact rất thấp (50vh vs 50dvh gần như tương đương desktop; khác biệt mobile URL-bar). Không chặn.

### [INFO] C — aislop security diagnostic (false positive, ngoài substance của task)
- Vị trí: `src/app/[locale]/layout.tsx:28` `dangerouslySetInnerHTML` với chuỗi hằng tĩnh.
- Không phải input người dùng → không XSS; dòng có sẵn từ scaffold. Score 93 ≥ 80 → gate OK. Không cần fix ở task này.

## Residual risk
- **Không chạy được `git diff`/`git status` (permission denied)** → không tự xác nhận toàn bộ changeset/không có file ngoài scope. Đã đối chiếu bằng Read các file builder khai (`FocusMain.tsx`, `layout.tsx`, `not-found.tsx`, `[...rest]/page.tsx`) + danh sách "Files to Create/Modify" trong task (`FocusMain.tsx` đã được thêm ở `layer-1-task-05.md:77`) + build output khớp. Rủi ro còn lại: file lạ ngoài scope (thấp).
- Chưa self-run app → **không tự verify HTTP 404 status** và **hành vi focus runtime** (`document.activeElement === #main`); đánh giá bằng code + build semantics + evidence builder (round 1). Không tự chạy app/manual repro theo rule.
- Chưa browser-check layout thật (chỉ CSS math) + chưa kiểm runtime `<title>` (#A) + thứ tự cascade vh/dvh (#B).
- `FocusMain` focus không dùng `preventScroll` — trên 404 dài có thể cuộn nhẹ; không phải defect.
- Giới hạn read tool: dùng trong cap STRICT (25); không vượt cap.

## Verdict
### ✅ PASS

**MAJOR #1 closed** (focus vào `#main` qua `FocusMain` + `tabIndex={-1}`, SSR/hydration an toàn).
MINOR #3, #4, #5 fixed. MINOR #2 defer hợp lý (AC cốt lõi vẫn đạt; title chỉ là residual).
Không có CRITICAL/MAJOR mới; không phát hiện regression. `npm run lint` / `typecheck` / `build` đều PASS;
aislop 93 ≥ 80. Responsive gate không mục nào FAIL.

### Dặn dò close-out (không chặn PASS)
1. Ghi residual risk MINOR #2 (nested metadata `<title>`) vào task file `layer-1-task-05.md` trước khi đóng.
2. (Tuỳ chọn) xác minh runtime `<title>`/`robots` + focus khi có browser ở Layer 4 a11y sweep.
