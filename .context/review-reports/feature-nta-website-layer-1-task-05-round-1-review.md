Agent: reviewer

# Review — feature nta-website · layer-1-task-05 (404 not-found / Screen 13) · round 1

## Review level
**STRICT**

## Reason
Task dự kiến `NORMAL` (trang tĩnh, không auth/API/DB), nhưng thực tế **risk đỏ**:
`src/app/[locale]/[...rest]/page.tsx` là **catch-all thay đổi cách resolve route toàn site** (navigation surface) —
ảnh hưởng mọi URL sai **và** mọi route sẽ thêm ở Layer 2+; cộng thêm ràng buộc SEO (`robots: noindex`) +
a11y (`focus vào main`) cần xác minh hành vi. Theo rule reviewer (red-risk: shared/navigation) → **STRICT**.
(Không có auth/tenant/payment/data-loss → không cần admin-heavy checks.)

## Blast radius
- `src/app/[locale]/[...rest]/page.tsx` — catch-all mọi URL dưới locale; thay đổi route resolution toàn site.
- `src/app/[locale]/not-found.tsx` — UI 404 cho mọi URL sai, cả 2 locale.
- `src/i18n/messages/{vi,en}.json` — thêm namespace `notFound`.
- Phụ thuộc/hưởng: `src/app/[locale]/layout.tsx` (Header/Footer/`<main id="main">`), `src/i18n/navigation.ts`,
  `src/components/layout/LanguageToggle.tsx`.
- Không đụng DB/API/auth/token/session/payment.

## Verify commands + result
| Command | Result | Evidence |
|---|---|---|
| `npm run lint` | ✅ PASS | eslint chạy, không lỗi (rc 0) |
| `npm run typecheck` | ✅ PASS | `tsc --noEmit`, rc 0 |
| `npm run build` | ✅ PASS | Next 15.5.27; routes: `○ /_not-found`, `● /[locale]` (/vi,/en), `ƒ /[locale]/[...rest]` (dynamic), middleware built |
| test_command | skip | `test_command: null` (project chưa có test framework — đúng task DoD) |

- **HTTP 404 status**: KHÔNG tự reproduce bằng app (reviewer không self-run app/manual repro). Cơ chế
  `notFound()` gọi trước khi streaming + build output (route `ƒ [locale]/[...rest]` server-render) khớp semantics
  Next tạo status 404. Builder journal ghi "manual HTTP 404 PASS (4 URL)" → coi là **evidence hỗ trợ**, ghi vào Residual risk.

## Acceptance Criteria — đối chiếu
| AC | Kết quả | Evidence |
|---|---|---|
| `/khong-ton-tai`, `/en/does-not-exist` → 404 đúng locale | ✅ | `messages` có `notFound` cho vi+en; `[locale]/not-found.tsx:15-16` dùng `getTranslations`; catch-all gọi `notFound()` |
| `/solutions/enterprise/sai-slug` → 404 (R-05), `/blog/sai` → 404 (R-09) | ✅ (structural) | Hiện chưa có route `solutions/*`/`blog/*` → catch-all bắt hết → 404. Khi Layer 2 thêm route thật, route cụ thể ưu tiên hơn catch-all |
| h1 duy nhất; message problem+recovery; HomeLink + ≥3 link | ✅ | `not-found.tsx:26` 1 `<h1>`; `:27` message problem+recovery; `:28-30` HomeLink; `:32-41` 4 link (`suggestions`) |
| `robots: noindex`; không JSON-LD | ✅ | `not-found.tsx:10` `robots:{index:false,follow:false}`; không có JSON-LD. Next cũng auto-inject `noindex` cho response 404 |
| Header/Footer render; lang toggle không 404-loop | ✅ | Header/Footer nằm ở `[locale]/layout.tsx` — not-found render trong layout này; `LanguageToggle` dùng `usePathname` next-intl (path không prefix), link đổi locale → URL sai ở locale mới → 404 (không redirect/loop) |
| Check commands pass | ✅ | lint/typecheck/build PASS (xem trên) |
| **Focus vào main (design Screen 13 A11y + task Scope/Notes)** | ❌ | **Không implement** → finding MAJOR #1 |

## Responsive Checklist Gate (diff đụng UI → áp dụng)
Breakpoints profile: `[640, 768, 1024, 1280, 1536]`. Không có browser → xác minh bằng CSS math; phần chưa xác minh ghi ở Residual risk.

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout — không horizontal scroll | OK | `section` `max-w-[560px] mx-auto px-4 sm:px-6`; text wrap; grid 1→2 cột. 375px: 1 cột, không tràn |
| Layout — mobile-first (`min-width`) | OK | Base 1 cột, nâng cấp bằng `sm:` (`grid-cols-1 sm:grid-cols-2`) |
| Layout — grid không cột cố định cứng | OK (note) | Dùng `grid-cols-2` tại breakpoint (intentional, không `auto-fit`) — chấp nhận; **nhưng lệch design ≥768 (xem MINOR #3)** |
| Typography — rem/token | OK | `text-display`, `text-base`, `leading-7` (token Tailwind) |
| Typography — heading fluid | OK (note) | `text-display` là token; chưa xác minh token có `clamp()` (ngoài file diff) |
| Media — ảnh/video | N/A | Trang 404 không có media |
| Touch — target ≥44px | OK | Link `min-h-11` (44px); Button `lg` `min-h-12` (48px) |
| Touch — nav mobile không tràn | N/A/OK | Danh sách link stack dọc ở mobile |
| Viewport — không dùng `100vh` trần | OK (note) | Dùng `min-h-[50dvh]` (đúng khuyến nghị dvh); **không có fallback `vh`** → MINOR #4 |
| `prefers-reduced-motion` | OK | Trang "không reveal/animate" (đúng design); không motion để gate |
| Không che lỗi bằng `overflow:hidden` | OK | Không dùng `overflow:hidden` |

**Kết luận gate: không mục nào FAIL** → gate responsive không chặn PASS.

## Skill gates
| Gate | Kết quả | Bằng chứng |
|---|---|---|
| `aislop` | ✅ OK | `npx aislop scan --changes --json` → score **100** (Healthy), 0 issue mọi engine |
| `oxlint` (anti-slop) | skip | Không có oxlint config/dependency (`package.json` lint = eslint; devDeps không oxlint) → `skip, oxlint not configured` |
| `ocr` (open-code-review) | skip | Không cài trong repo (`skip, ocr not installed`) — optional, không chặn |
| AI-readable | ✅ OK | 1 soft indicator (tên `UnknownLocaleRoute` misleading — MINOR #5); < 3 → không FAIL |
| ai-friendly-web | N/A | Task không phải deploy; diff không tạo surface crawler mới. `public/robots.txt`, `llms.txt`, `sitemap.xml` chưa có — thuộc DevOps Phase 6 |
| blitzstrike | skip | Không cài/không phải task auth/API/input nhạy cảm |

## Findings

### [MAJOR] #1 — Không implement "focus auto/chuyển vào main" (design Screen 13 A11y + task Scope/Notes)
- Vị trí: `src/app/[locale]/not-found.tsx` (không có focus management) + `src/app/[locale]/layout.tsx:34`
  (`<main id="main">` không có `tabIndex={-1}`).
- Căn cứ: `.context/design-spec.md:563` — Screen 13 A11y ghi rõ "**focus auto/chuyển vào main**";
  task file `layer-1-task-05.md:27` Scope liệt kê "**R-24: h1 duy nhất, focus vào main**, problem + recovery copy";
  `layer-1-task-05.md:81` Notes: "Focus vào main khi render".
- Impact: khi điều hướng client-side tới URL sai, focus giữ nguyên ở phần tử cũ → screen-reader/keyboard user
  không được thông báo nội dung 404 (đúng loại lỗi SPA a11y mà design muốn xử lý). Skip-link `#main` có sẵn
  nhưng là thao tác thủ công, không thay thế auto-focus.
- **Đây là requirement tường minh trong Scope/Design, không phải polish** → MAJOR → chặn PASS.
- Cách fix đề xuất: thêm 1 client component nhỏ (vd `FocusMain`) render trong `not-found.tsx`, `useEffect` gọi
  `.focus()` lên `#main`; đảm bảo `src/app/[locale]/layout.tsx:34` có `tabIndex={-1}` trên `<main id="main">`
  (hoặc đặt `tabIndex={-1}` + focus vào `<section>` của not-found để bó hẹp trong file task). Không animate,
  tôn trọng reduced-motion.
- **Nếu nhóm chủ động defer** sang Layer 4 a11y sweep: phải cập nhật Scope/AC task-05 + ghi nhận trong design/plan
  (record quyết định); khi đó có thể hạ xuống MINOR. Hiện tại, nguyên trạng = chưa đạt.

### [MINOR] #2 — Metadata của nested `not-found.tsx` có thể không được áp dụng
- Vị trí: `src/app/[locale]/not-found.tsx:6-12` (`generateMetadata`).
- Căn cứ: Next.js docs chỉ bảo đảm `metadata`/`generateMetadata` cho **root** `app/not-found.js` (và `global-not-found.js`),
  không nêu nested `[locale]/not-found.tsx`. Rủi ro `<title>` không áp dụng.
- Giảm nhẹ: Next tự inject `<meta name="robots" content="noindex">` cho response 404 → **AC "robots: noindex" vẫn đạt**;
  chỉ `<title>` có nguy cơ thiếu.
- Fix/verify: kiểm tra `<title>` trong HTML 404 thực tế; nếu thiếu → đặt metadata ở `[locale]/layout.tsx` hoặc dùng
  pattern `global-not-found`.

### [MINOR] #3 — Breakpoint lệch design Screen 13 (640 thay vì 768)
- Vị trí: `src/app/[locale]/not-found.tsx:32` `grid-cols-1 sm:grid-cols-2` (=640px), `:28` `w-full sm:w-auto` (=640px).
- Design `.context/design-spec.md:558-559`: base stack, **≥768** link list 2 cột; CTA full-width ở base.
- Impact: thấp (2 cột xuất hiện sớm hơn 128px). Fix: dùng `md:` (768) thay `sm:` nếu muốn khớp design.

### [MINOR] #4 — `min-h-[50dvh]` không có fallback `vh`
- Vị trí: `src/app/[locale]/not-found.tsx:25`.
- Impact: rất thấp (browser cũ bỏ qua → chiều cao auto, không tràn). Fix (tuỳ chọn): bổ sung fallback `vh`.

### [MINOR] #5 — Tên symbol misleading ở catch-all
- Vị trí: `src/app/[locale]/[...rest]/page.tsx:3` — `UnknownLocaleRoute(): never`.
- Đây là catch-all 404 chung, không phải "locale validation" → tên gây hiểu sai (AI-chaos indicator).
- Fix: đổi tên, vd `CatchAllNotFound()` / `UnknownRoute()`. `: never` hợp lệ (`notFound()` throw) nhưng có thể bỏ để suy luận.

### Ghi chú (không tính defect)
- 4 link gợi ý trỏ `/solutions/enterprise`, `/case-studies`, `/blog`, `/contact`; các route này chưa tồn tại tới Layer 2
  → click từ 404 sẽ 404 tiếp. Nhất quán với Header hiện tại; ngoài scope task-05.
- Catch-all hiện **không che route hợp lệ**: build chỉ có `/[locale]` + `/[locale]/[...rest]`; Next ưu tiên static > dynamic > catch-all
  → route Layer 2 sẽ tự thắng. Đúng như Notes task.

## Residual risk
- Chưa tự reproduce HTTP 404 status (không được self-run app) — dựa vào build + semantics + builder evidence.
- Chưa verify runtime `<title>`/`robots` của nested not-found (#2) và chưa browser-check layout thật (chỉ CSS math).
- `text-display` token có fluid/`clamp()` chưa kiểm (ngoài diff).
- Kiểm còn lại đọc tại cap STRICT (25 read tools) → dừng đúng policy.

## Verdict
### ❌ FAIL
Không có CRITICAL, không lỗi functional/security; tất cả check commands PASS và hầu hết AC đạt.
**Một blocker MAJOR duy nhất:** requirement tường minh "focus vào main" (design Screen 13 A11y + task Scope/Notes)
chưa được implement.

### Verify lại ở round sau
1. `src/app/[locale]/not-found.tsx` (và/hoặc `src/app/[locale]/layout.tsx:34`) có focus management vào `#main` — chứng minh
   bằng test/assert `document.activeElement === #main` khi render 404, hoặc evidence rõ ràng trên 404 HTML/client nav.
2. **Hoặc** có quyết định defer chính thức: cập nhật Scope/AC task-05 + design/plan ghi rõ cover ở Layer 4 a11y sweep
   (khi đó hạ xuống MINOR).
3. (Khuyến nghị) xử lý MINOR #3 (dùng `md:` cho 768) và #5 (đổi tên catch-all).
4. Chạy lại `npm run lint`, `npm run typecheck`, `npm run build`.
