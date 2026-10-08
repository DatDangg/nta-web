# Review Report — feature/nta-website · layer-4-task-03 · round-1

Agent: reviewer

- **Work item:** `feature/nta-website`
- **Task:** `tasks/nta-website/layer-4-task-03.md` — Accessibility sweep WCAG 2.1 AA (R-24) + responsive spot-check (R-23)
- **Round:** 1
- **Reviewer model:** opencode-go/deepseek-v4.1-flash
- **Date:** 2026-10-10

## Review level

**STRICT**

### Reason
- Diff đụng **shared components**: `src/components/cards/*` (5 card dùng khắp site), `LanguageToggle`,
  `MobileNav` (navigation), `useContactForm` (shared hook xử lý submit/error), 4 list route.
- Thay đổi **cross-cutting mọi route** ở tầng semantic/a11y (heading hierarchy, accessible name) + i18n logic.
- Trigger STRICT theo rule: `shared service/hook/component/navigation`. Không có auth/schema/data risk.

## Blast radius
- **Routes:** tất cả route render card list (`/blog`, `/case-studies`, `/solutions/ai`, `/solutions/enterprise`),
  `/contact` (grid + form error states), mọi trang có `Footer` (LanguageToggle), mọi trang mobile (MobileNav, 404).
- **Components:** `PostCard`, `CaseStudyCard`, `SolutionCard`, `ProductCard`, `AppCard`, `LanguageToggle`,
  `MobileNav`, `ContactForm`.
- **Logic:** `useContactForm` (400/429/5xx) — ảnh hưởng trực tiếp UI error của form liên hệ (client).
- **i18n:** `en` locale contact errors (regression builder trong task này).
- **Data/API:** không đổi contract server (`/api/contact` route + schema không sửa).

## Verify commands + result

| Command | Result | Evidence |
|---|---|---|
| `npm run lint` | ✅ PASS | 0 error, 1 warning `<img>` trong `src/components/mdx/index.tsx:25` (pre-existing, accepted L2/task-02) |
| `npm run typecheck` | ✅ PASS | `tsc --noEmit` sạch |
| `npm run build` | ✅ PASS | Next.js 15.5.27, 49 static pages, gồm `/robots.txt` + `/sitemap.xml` |
| `test_command` | ⏭️ skip, no test framework | `test_command: null` (.context/project-config.md) |
| `npx aislop scan --changes --json` | ✅ PASS | score **97** (Healthy), 0 error, 7 warning |
| `npx oxlint` | ✅ PASS (no new) | 0 error, 2 warning — cả 2 pre-existing, không nằm trên dòng diff |
| `ocr` (open-code-review) | ⏭️ skip | `ocr: command not found` |
| Lighthouse a11y (11 route) | ⚠️ unverified independently | Reviewer không có browser tool; chỉ kiểm chứng bằng source + CSS math (xem bên dưới) |

## Responsive Checklist Gate

Gate áp dụng (project có UI + diff đụng UI). 3 widths từ profile: **375 / 768 / 1280**.
Không có môi trường browser → xác minh bằng CSS math + source; phần chưa render ghi vào Residual risk.

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout — không horizontal scroll | **OK (residual)** | `MobileNav` wrapper `fixed inset-0 ... overflow-hidden` (`MobileNav.tsx:39`) clip panel `translate-x-full` khi đóng → đóng góp overflow 404. Không thêm element tràn mới. Không render được 375/768/1280 (xem residual). |
| Layout — mobile-first (min-width) | **OK** | Tailwind dùng `base → md → lg` (min-width) nhất quán; diff không thêm `max-width` media query. |
| Layout — grid auto-fit/minmax, không cột cứng | **N/A (không đổi)** | Grid thay đổi là `contact/page.tsx` dùng explicit column placement theo design (form 60% / info+map 40%), không phải grid cột cứng mới. |
| Contact grid @375 (base) | **OK** | `grid-cols-1`; DOM order: `ContactForm → aside(info) → div(map)` = form→info→map full-width (design S12 base). |
| Contact grid @768 (md) | **OK** | `md:grid-cols-2`: form = col1/row1, aside = col2/row1, map-div `md:col-span-2` → row2 full-width. Khớp "form \| info + map full-width". |
| Contact grid @1280 (lg) | **OK** | `lg:grid-cols-[3fr_2fr]`; form auto col1/row1 (60%); aside `lg:col-start-2 lg:row-start-1` (40% row1); map `lg:col-start-2 lg:row-start-2` (40% row2). Khớp "form 60% \| (info+map) 40%". `lg:col-span-1` override `md:col-span-2` đúng thứ tự breakpoint. |
| Typography/Spacing | **N/A** | Diff không đổi font-size/spacing; không thêm px. |
| Media (img/video) | **N/A** | Diff không đụng ảnh/iframe. |
| Touch target ≥44×44 | **OK** | `MobileNav` trigger `size-11` (44px), panel close `min-h-11 min-w-11`, `LanguageToggle` link `min-h-11 min-w-11` (không đổi). |
| Nav mobile (hamburger, không tràn) | **OK** | Hamburger + drawer `lg:hidden`; focus trap + Esc + trả focus nguyên vẹn; `overflow-hidden` không phá drawer khi mở (panel `inset-y-0 right-0` trong bounds). |
| Table scroll/card mobile | **N/A** | Diff không có table. |
| `100vh` trên mobile | **N/A** | Không đổi. |
| `prefers-reduced-motion` | **OK** | Reveal/hover giữ `motion-safe:`; diff không thêm animation. |
| Không che lỗi bằng `overflow:hidden` | **OK** | `overflow-hidden` dùng để clip panel offscreen (kỹ thuật chuẩn), không giấu layout bug. Tuy nhiên panel thiếu `overflow-y-auto` → xem MINOR-2. |

**Kết luận gate:** không có mục FAIL.

## Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| `frontend-checklist` | **OK** | Semantics: h1→h2→h3 đúng; landmark `header/nav/main/footer` giữ; ảnh có alt; icon/CTA aria ổn. |
| `impeccable` (craft-floor) | **OK** | Token dùng đúng (`--color-primary-active` #0066cc), không thêm màu/one-off; focus ring không đổi. |
| `responsive-web` | **OK (residual)** | CSS math contact grid 3 bp OK; không render được 375/768/1280. |
| `aislop` | **OK** | score 97 ≥ 80; 7 warning (không có error). 2 ai-slop indicator đều **pre-existing**: `LanguageToggle.tsx:4-5` duplicate import (diff chỉ đổi dòng 14/16), `solutions/enterprise/page.tsx:8` unused import (diff đổi dòng ~40). |
| `anti-slop` (oxlint) | **OK** | `npx oxlint`: 0 error; 2 warning pre-existing (`next-env.d.ts` triple-slash; `solutions/enterprise/page.tsx:8` unused var) — không trên dòng diff. |
| `open-code-review` (ocr) | **skip** | `ocr` chưa cài → không chặn PASS. |
| AI-readable | **OK** | Comment mới trong `useContactForm.ts:15-16` giải thích WHY (server VI-only) không phải WHAT; `readServerErrors` ~20 dòng <50; tên rõ; không magic number mới. <3 indicators. |
| ai-friendly-web | **N/A (ngoài diff)** | Diff a11y/responsive không đụng SEO/AI-crawl; build có `/robots.txt` + `/sitemap.xml`. `llms.txt` không thuộc scope task này. |
| blitzstrike | **N/A** | Không phải STRICT security/attack-surface (không đổi auth/API/input server). |

## Findings

### [MINOR] 1 — `readServerErrors` chấp nhận `form`/`honeypot` nhưng không được tiêu thụ
`src/lib/contact/useContactForm.ts:13,24-32` — type `ContactApiErrors` + switch gồm `form`/`honeypot`, nhưng vòng 400 (`:113-114`) chỉ duyệt `fields` (name/email/phone/message). `form`/`honeypot` presence rơi vào nhánh generic `messages.sendError` (`:117`) — đúng hành vi m-L3-4 nhưng nhánh code là dư thừa/nửa vời.
**Fix đề xuất:** đơn giản hóa — chỉ giữ `ContactField` trong `readServerErrors`; hoặc nếu muốn phân biệt `form`/`honeypot` → map sang `messages.sendError` tường minh + comment 1 dòng. Không blocking.

### [MINOR] 2 — Drawer panel thiếu `overflow-y-auto`, có thể bị clip trên viewport thấp
`src/components/layout/MobileNav.tsx:41` — panel `absolute inset-y-0 ... flex flex-col` không có `overflow-y-auto`; wrapper mới thêm `overflow-hidden` (`:39`). Trên viewport thấp (landscape phone / ~320×568) nội dung menu ước tính ≥ ~600px có thể vượt chiều cao và **không scroll được** → item dưới (Contact CTA) không reachable. Đây là hạn chế có sẵn (panel trước cũng không scroll, content tràn dưới fold), `overflow-hidden` củng cố thêm.
**Fix đề xuất:** thêm `overflow-y-auto` cho panel (giữ `overflow-hidden` wrapper cho clip offscreen). Theo dõi ở task responsive riêng — không blocking PASS vì chưa xác minh bằng render.

### [MINOR] 3 — Text "Learn more" của SolutionCard bị `aria-hidden` (WCAG 2.5.3 biên)
`src/components/cards/SolutionCard.tsx:22` — span "Learn more →" visible nhưng `aria-hidden="true"` → accessible name của link không chứa nhãn visible này. Lighthouse/axe không flag (axe loại text aria-hidden), nhưng về mặt chặt 2.5.3 có thể xem xét.
**Fix đề xuất:** bỏ `aria-hidden` và để accessible name gồm cả "Learn more", hoặc chấp nhận phần này là trang trí (link đã có title). Ưu tiên thấp.

### [MINOR] 4 — Warning lint/slop pre-existing trên file đụng diff (ngoài scope)
- `LanguageToggle.tsx:4-5` duplicate import `@/i18n/navigation` (aislop/oxlint) — không do diff tạo (diff chỉ đổi className dòng 14/16).
- `src/app/[locale]/solutions/enterprise/page.tsx:8` import `solutionOverview` không dùng (aislop/oxlint) — không do diff tạo (diff đổi dòng ~40).
**Fix đề xuất:** dọn trong task cleanup/vector riêng; không tính FAIL cho task này (ngoài dòng diff).

## Kiểm chứng các điểm trọng tâm (độc lập)

1. **i18n regression / m-L3-4** — ✅ KHÔNG còn rò rỉ VI ra locale `en`.
   - 400: `readServerErrors` chỉ đọc *key* server trả; text luôn `messages[field]` (`useContactForm.ts:114`) — localized.
   - 429 (`:105-108`) → `messages.rateLimit`; 5xx/network (`:121-125`) → `messages.sendError`; không surface `payload.message` server (VI-hardcoded ở `route.ts:6,8`). 
   - `errors.form` (invalid JSON, `route.ts:55`) và `errors.honeypot` → `fieldErrors` rỗng → summary `messages.sendError` (generic, localized) → m-L3-4 giữ đúng.
   - Đối chiếu `en.json:158-161` có `errors.name/email/phone/message` + `rateLimit/sendError/summary` localized; `vi.json` tương ứng. Không còn key dùng server string.
2. **Heading hierarchy** — ✅ h1→h2→h3, không skip.
   - 4 list page thêm `<h2 className="sr-only">` + `aria-labelledby` (đúng vị trí, sau `PageHeader` h1, trước card h3).
   - Sweep `src` toàn bộ: `PageHeader`/`ArticleHeader`/`Hero`/`not-found` = h1; các section = h2; card = h3; `AppCard` = h2 (đặt sau h1 trang `/products`). Footer h2 sau content h3 = **giảm cấp** (axe cho phép). Không phát hiện skip.
3. **m-L3-3 responsive contact** — ✅ khớp design S12 (`.context/design-spec.md:521-524`) ở cả 3 mốc (chi tiết bảng gate).
4. **Contrast** — ✅ `--color-primary-active: #0066cc` (`globals.css:9`) tồn tại; `text-primary-active` resolve qua Tailwind theme. Math: #0066cc trên `bg-background-alt` #f5f5f7 ≈ **5.11:1** (≥4.5). Footer thực tế `bg-background-alt` (`Footer.tsx:17`) chứa `LanguageToggle` → đúng nền. `text-primary` #0071e3 trên cùng nền ≈ 4.31:1 (đúng lý do fix).
5. **Label in Name** — ✅ bỏ `aria-label` khỏi 5 card link → accessible name lấy từ nội dung visible (image alt + title + description/category). Không link nào rỗng tên (mọi card đều có `<h3>`/`<h2>` title text).
6. **404 overflow** — ✅ `overflow-hidden` trên wrapper `fixed inset-0` clip panel `translate-x-full`; khi mở panel `translate-x-0` nằm trong bounds, focus trap (`a, button`) + Esc + `inert` khi đóng không bị ảnh hưởng.

## Residual risk

- **Không render 375/768/1280** (không có browser emulation trong reviewer) → responsive xác minh bằng CSS math; horizontal-overflow thực tế chưa đo lại độc lập (primary đo ~638px, dưới md).
- **Lighthouse 1.0/0-failure chưa tái lập độc lập** — bù bằng kiểm source + contrast math (5.11:1) + accessible-name/heading review.
- **`text-primary` #0071e3 (4.31:1) còn ở link khác không thuộc diff** (vd Footer `hover:text-primary` trên `bg-background-alt`) — hover state borderline; ngoài scope diff, đề xuất vector riêng nếu muốn siết R-24.
- `llms.txt` chưa xác minh — ngoài scope task a11y/responsive.

## Verdict

✅ **PASS**

- Không có CRITICAL/MAJOR. 4 MINOR đều non-blocking (2 out-of-diff/pre-existing, 2 cải tiến nhỏ).
- Verify commands (`lint`/`typecheck`/`build`) PASS độc lập; `aislop` 97, `oxlint` 0 error; `ocr` skip.
- Responsive Checklist Gate: không mục nào FAIL; mục không xác minh được ghi residual.
- Không phải bug task → không áp dụng điều kiện bug-repro.
