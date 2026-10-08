# Review — feature nta-website · layer-2-task-01 (Trang chủ `/` — Screen 1) · round 1

Agent: reviewer

## Review level
**NORMAL**

## Reason
Trang tĩnh SSG (`/` + `/en`), không auth/API/DB/tenant, không mutation dữ liệu, không payment/webhook/cron.
Blast radius gọn trong 1 route + 5 component page-specific + 2 message file. Không có risk đỏ buộc STRICT.
Tuy nhiên reviewer tự tăng mức kiểm tra ở 2 điểm vốn là shared/regression: (a) tái sử dụng Layer-1 card
components, (b) keyboard/responsive của strip và token Tailwind — nên đã đọc cả Layer-1 shared components
(`SolutionCard`, `ProductCard`, `cardStyles`, `CTABanner`, `Reveal`, `Button`, `Section`) để đối chiếu.

## Blast radius
- Route: `/` (vi) + `/en` (en) — SSG.
- Component mới: `src/components/home/{Hero,SolutionGridHome,ProductStrip,CaseStudyHighlight,HomeImage}.tsx`.
- Sửa: `src/app/[locale]/page.tsx`, `src/i18n/messages/{vi,en}.json`.
- Đọc/consume (không đổi): `src/content/home.ts`, `src/components/cards/*`, `src/components/shared/CTABanner.tsx`,
  `src/components/ui/*`, `tailwind.config.ts`, `src/app/globals.css`.
- Không đụng `.context/*` (state), không đụng API/schema/auth.

## Verify commands + result (reviewer tự chạy)
| Command | Result |
|---|---|
| `npm run lint` | ✅ PASS (`eslint .` sạch) |
| `npm run typecheck` | ✅ PASS (`tsc --noEmit` sạch) |
| `npm run build` | ✅ PASS — `● (SSG) /[locale]` prerender `/vi` + `/en`; `○ /_not-found`; `ƒ /[locale]/[...rest]` (dynamic — thuộc Layer 1, ngoài scope task này) |
| `test_command` | `skip` — `project-config.md:36` `test_command: null` (v1 chưa có test framework). Không có test nào để chạy. |
| Manual browser (375/768/1280) | `skip` — reviewer không self-run browser; xác minh bằng đọc code + CSS math, phần chưa chứng minh ghi ở **Residual risk**. |

## Acceptance Criteria — traceability
| # | AC | Kết quả | Bằng chứng |
|---|---|---|---|
| 1 | 5 section đúng thứ tự & 5 layout family khác nhau | ✅ OK | `page.tsx:56-63` Hero→SolutionGrid→ProductStrip→CaseStudy→CTABanner; family: 2-col hero / grid 3 card / h-scroll strip / split 1 lần / banner accent |
| 2 | Hero h1 duy nhất, 2 CTA canonical, responsive Screen 1 | ✅ OK (label + responsive) | `Hero.tsx:15` h1; `Hero.tsx:18-19` `cta('contact')`+`cta('viewSolutions')` = "Liên hệ tư vấn"/"Xem giải pháp" (`design-tokens.md:274-275`); `md:grid-cols-[1.1fr_0.9fr]`=55/45, `lg:px-8`, `xl:gap-16` |
| 3 | 3 SolutionCard điều hướng `/solutions/enterprise`, `/solutions/ai`, `/products` | ✅ OK href | `home.ts:12-14` (vi) / `:24-26` (en) + `SolutionGridHome.tsx:27` strip `/en` → Link tự prefix |
| 4 | ProductStrip keyboard-scroll; ảnh `priority` đúng 1 ảnh | ✅ OK | `ProductStrip.tsx:39-46` `role="region"`+`tabIndex=0`+`onKeyDown` arrow; `priority` chỉ ở `Hero.tsx:26` |
| 5 | Empty strip <1 → ẩn section; ảnh lỗi → fallback `surface-sunken` | ✅ OK | `ProductStrip.tsx:20` `length===0 → null`; `HomeImage.tsx:17-19` onError → div `bg-surface-sunken` |
| 6 | Metadata 2 locale + hreflang 2 chiều; JSON-LD defer Layer 4 | ✅ OK | `page.tsx:33-43` title/desc + `alternates.languages {vi, en, x-default}`; không có JSON-LD (đúng defer Layer 4 task-01) |
| 7 | Không page-level loading/error | ✅ OK | Glob `src/app/**/{loading,error}.tsx` → không có file nào |
| 8 | Anti-slop: không eyebrow/kicker, không scroll cue, không em-dash | ✅ OK | Đọc toàn bộ `vi.json`/`en.json`/`home.ts`/5 component: không eyebrow, không scroll cue, không `—` |
| 9 | Gap 6: EN hrefs pre-localized không tạo `/en/en/...` | ✅ OK | `SolutionGridHome.tsx:27`, `CaseStudyHighlight.tsx:26` strip `/^\/en(?=\/)/` trước khi truyền `@/i18n/navigation` `Link` (`routing.ts:6` `localePrefix: 'as-needed'`) |
| 10 | O1: CaseStudyHighlight định tính, không metric | ✅ OK | `CaseStudyHighlight.tsx:24-26` chỉ title/description/link; `home.ts:20,32` không có số liệu |

## Responsive Checklist Gate (MANDATORY — diff đụng UI)
Project có `ui:` block (`project-config.md:110-115`); breakpoints Tailwind 640/768/1024/1280/1536 — test ở 375/768/1280.
Không có môi trường browser → xác minh bằng CSS math + đọc code.

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout — không horizontal scroll; mobile-first (`min-width`); grid `auto-fit`/`minmax`; container không fixed `px` | **OK** (note) | Container `mx-auto w-full max-w-container` (`tailwind.config.ts:38` maxWidth 1280px = max-width, không fixed width); grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` là cột cố định **theo đúng bảng Screen 1** (design-spec:129-130) → intentional, không phải lỗi. Strip là scroll container riêng (`overflow-x-auto`) → không đẩy page scroll ngang. |
| Typography/Spacing — `rem`/`clamp()`, heading fluid, spacing scale | **OK** | `text-hero`=`clamp(3rem,…,6rem)` (`globals.css:32`), `text-body-lg`/`text-h2`/`text-h3` `clamp` (`:34-36`), section padding `py-12 md:py-16 xl:py-24` scale |
| Media — `max-width:100%;height:auto`, `aspect-ratio`, `srcset`/`sizes`, video `aspect-ratio` | **OK** | `next/image` + `w-full` + `aspect-[4/3]`/`[16/10]` + `sizes` (`Hero.tsx:25-28`, `SolutionGridHome.tsx:30`, `ProductStrip.tsx:50`, `CaseStudyHighlight.tsx:22`); video N/A |
| Touch/Interaction — target ≥44×44px; nav mobile không tràn; table có wrapper/card mobile | **OK** / table **N/A** | CTA `min-h-12` (48px) `Hero.tsx:18-19`; arrow strip `min-h-11 min-w-11` (44px) `ProductStrip.tsx:32-33`; link "Tìm hiểu thêm" `min-h-11`; card là target lớn; nav Layer-1 (ngoài diff); trang không có table |
| Viewport/A11y — không `100vh`; `prefers-reduced-motion`; không che lỗi bằng `overflow:hidden` | **OK** | Không dùng `100vh`; `Reveal.tsx:18-22` + `globals.css:88-103` tôn trọng `prefers-reduced-motion`; không có `overflow:hidden` che nội dung (chỉ `overflow-hidden` trên card case để bo góc) |

CSS math đã kiểm: strip basis `sm 66.666%-1rem` (~1.5 card) / `md 40%-1rem` (~2.5) / `lg 33.333%-1rem` (3) khớp
bảng Screen 1 (`design-spec:128-130`); base `min-w-[82%]` (~1.2 card) + swipe.

## Skill gates
| Gate | Kết quả | Bằng chứng / lý do |
|---|---|---|
| `aislop` (score ≥80) | **skip** | Không chạy được CLI: `npx --no-install aislop …` bị `Permission denied: shell` (shell chỉ cho phép npm scripts của repo). Diff đã soi thủ công không thấy narrative comment / dead code / swallowed error / hidden fallback (ngoài `HomeImage` fallback là chủ ý AC). |
| anti-slop / `oxlint` | **skip, oxlint not configured** | Repo không có `.oxlintrc*`; `npx oxlint` bị permission deny. Không có error mới cần chặn. |
| `ocr` (open-code-review) | **skip, ocr not installed** | `ocr` không có trong môi trường (command bị deny/không có). Không chặn PASS theo rule. |
| AI-readable (mục 6) | **OK** | Indices AI-chaos đếm được: tên self-descriptive; file ngắn (`ProductStrip.tsx` 60 dòng, `HomeImage.tsx` 33, `Hero.tsx` 34, `SolutionGridHome.tsx` 40, `CaseStudyHighlight.tsx` 33 — đều <300); function <50 dòng; KHÔNG có comment WHAT; không magic number đáng kể. **0/8 indicators → không FAIL.** (1 điểm trừ nhẹ: `SolutionGridHome` fork card style — đã tính ở MAJOR #1, không phải AI-chaos.) |
| ai-friendly-web (llms.txt/robots/sitemap) | **N/A (defer Layer 4)** | `sitemap.ts`/`robots.ts`/`llms.txt`/OG **được giao tường minh cho Layer 4 task-01** (`tasks/nta-website/layer-4-task-01.md:37-48`). Task này không phải deliverable của SEO static endpoints → không FAIL. **Bắt buộc re-check gate này ở Layer 4 task-01.** |
| blitzstrike (pentest) | **N/A** | NORMAL, không auth/API public/input; không có attack surface trong diff (không reverse-engineer/bịa số), nên bỏ qua pentest. |

## Findings

### [MAJOR] #1 — Trang chủ KHÔNG dùng shared Layer-1 `SolutionCard`/`ProductCard`; fork lại card markup + style lệch (regression risk)
- **file:line:** `src/components/home/SolutionGridHome.tsx:24-34` (inline `<Link>` thay `SolutionCard`) và
  `src/components/home/ProductStrip.tsx:48-54` (inline `<Link>` thay `ProductCard`). Cả hai file **không import**
  `@/components/cards/SolutionCard` / `ProductCard`.
- **Căn cứ:**
  - Task Description: `tasks/nta-website/layer-2-task-01.md:42` ("3 `SolutionCard`") và `:43` ("≥2 `ProductCard`").
  - Design Screen 1 Components: `.context/design-spec.md:120` ("SolutionCard×3, ProductCard strip") + `:113-116`.
  - Yêu cầu kiểm regression của phase: page phải dùng shared Layer-1 components, không tự tạo lại style lệch.
- **Ảnh hưởng (style drift thật, không chỉ lý thuyết):**
  - Solution card home có `bg-surface p-4` và **thiếu** `ease-out-expo` + arrow `→`; `SolutionCard` (`cards/SolutionCard.tsx:16-20`) không set `bg-surface` và có arrow. → cùng nhóm card nhưng nền/chi tiết khác giữa trang chủ và các trang listing dùng `SolutionCard`.
  - Product card home dùng `bg-background-alt p-4`, **thiếu** `line-clamp-2`; `ProductCard` (`cards/ProductCard.tsx:14-18`) không set bg và có `line-clamp-2`.
  - `cardGridClass` (`cards/cardStyles.ts:4`) không được tái dùng (grid viết lại inline).
- **Vì sao MAJOR (không phải MINOR):** vi phạm requirement tường minh trong task + danh sách component của design;
  tạo 2 implementation card song song trên cùng design system → drift về sau; là đúng điểm primary yêu cầu soi.
- **Cách fix đề xuất (chọn 1):**
  1. Mở rộng `SolutionCard`/`ProductCard` bằng prop `href?: string` (override) + `imageFallback?: boolean` rồi tái dùng
     tại home (giữ DRY + style khớp); hoặc
  2. Nếu chủ ý fork (vì `SolutionCard` build href `/solutions/{category}/{slug}` — không khớp category link của home),
     thì reuse `cardStyles` (`cardLinkClass`/`cardImageClass`/`cardGridClass`) và ghi quyết định + lý do vào task/close-out.
- **Verify lại round sau:** các file home phải import và render `SolutionCard`/`ProductCard` (hoặc reuse `cardStyles`),
  và card style (bg, hover lift, arrow, line-clamp, sizes) phải khớp shared card.

### [MINOR] #2 — `HomeImage` fallback `aria-hidden="true"` làm mất `alt` khi ảnh lỗi
- **file:line:** `src/components/home/HomeImage.tsx:17-19`
- Ảnh nội dung (hero, solution, product, case) có `alt` mô tả; khi load lỗi fallback bị `aria-hidden` → screen reader
  mất thông tin ảnh. Design yêu cầu fallback nền `surface-sunken` (OK) nhưng không nói bỏ alt.
- **Fix:** giữ text alternative (`role="img"` + `aria-label={alt}` hoặc render `<span className="sr-only">{alt}</span>`),
  hoặc ghi rõ chấp nhận coi fallback là trang trí.

### [MINOR] #3 — `ProductStrip` arrow key không `preventDefault()` → double-scroll
- **file:line:** `src/components/home/ProductStrip.tsx:40-43`
- `onKeyDown` gọi `scrollStrip()` nhưng không `preventDefault()`; container vốn native scroll bằng arrow →
  có thể vừa native scroll vừa smooth `scrollBy` (jank/lệch). 
- **Fix:** `event.preventDefault()` cho `ArrowLeft/ArrowRight` trước khi scroll.

### [MINOR] #4 — Class `bg-surface-sunken` bị lặp trong fallback
- **file:line:** `src/components/home/HomeImage.tsx:18` — `className` truyền vào đã chứa `bg-surface-sunken`
  (`Hero.tsx:25`, `SolutionGridHome.tsx:30`, `ProductStrip.tsx:50`, `CaseStudyHighlight.tsx:22`), fallback thêm lần nữa.
- Vô hại nhưng thừa; **fix:** bỏ `bg-surface-sunken` khỏi fallback hoặc khỏi className.

### [MINOR] #5 — `generateStaticParams` khai trùng ở page + layout
- **file:line:** `src/app/[locale]/page.tsx:24-26` trùng `src/app/[locale]/layout.tsx:8-10`.
- Vô hại (build PASS) nhưng dư thừa; **fix:** bỏ ở page (layout đã cover) nếu không có lý do riêng.

### [MINOR] #6 — Meta description VI ~161 ký tự (target 150–160)
- **file:line:** `src/app/[locale]/page.tsx:16` (EN `:20` ~152 ✅).
- Đếm tay nên có thể lệch ±2; nếu đúng 161 thì vượt nhẹ target SEO của design §1.8.
- **Fix:** rút ngắn 1–3 ký tự (vd "giúp tối ưu vận hành" → "tối ưu vận hành") — hoặc rà soát lại bằng tool ở Layer 4 task-01.
  *(Không chặn PASS; nằm trong ngưỡng nhiễu.)*

### Observation (không tính defect)
- Hero CTA outline trỏ `/solutions/enterprise` — không có index `/solutions` (`routing`/`SPECIFICATIONS` chỉ có 2 landing), nên đây là target hợp lý; design không chốt đích cụ thể.
- `Reveal` bọc mỗi child vào `.reveal-item` div (Layer-1, ngoài diff) — layout vẫn đúng ở các section home.

## Verdict
**❌ FAIL**

Lý do: còn **1 MAJOR (#1)** — trang chủ fork lại card markup thay vì dùng shared Layer-1 `SolutionCard`/`ProductCard`
như Task Description + design Screen 1 quy định, gây style drift + duplicate. Các AC còn lại PASS, verify commands PASS.
Có thể PASS nếu MAJOR #1 được xử lý (tái dùng shared card hoặc reuse `cardStyles` + ghi lý do fork), các MINOR nên sửa kèm.

## Residual risk (chưa chứng minh được)
- **Responsive/keyboard thực tế:** chưa self-run browser → các mốc 375/768/1280, swipe strip, hover card, focus-visible,
  focus trong strip chỉ xác minh bằng CSS math + đọc code; cần manual check ở round sau hoặc khi close-out.
- **Meta desc VI length:** đếm tay; chưa xác nhận bằng tool (shell/node bị deny trong phiên review).
- **Gate tự động (`aislop`/`oxlint`/`ocr`):** không chạy được do permission/không cài — không có bằng chứng tự động,
  chỉ soi thủ công.
- **Read-tool cap:** phiên này đọc vượt cap NORMAL để đối chiếu shared Layer-1 (regression check) + Tailwind tokens;
  không có vùng nào bị bỏ sót có chủ đích ngoài các gate CLI ở trên.
- **Ngoài scope:** `ƒ /[locale]/[...rest]` ở build là dynamic — thuộc Layer 1, không tính cho task này.

## Cách verify lại round sau
1. `npm run lint && npm run typecheck && npm run build` → PASS, `/vi` + `/en` vẫn `● (SSG)`.
2. Grep `src/components/home/` → phải thấy import `SolutionCard`/`ProductCard` (hoặc `cardStyles`) và không còn markup card fork.
3. So class card home vs `cards/cardStyles.ts` + `SolutionCard`/`ProductCard`: khớp bg/hover/arrow/line-clamp/sizes.
4. (Nếu sửa MINOR) kiểm `HomeImage` giữ alt khi lỗi, `preventDefault` trong strip, không lặp `bg-surface-sunken`.
5. Manual dev `/` + `/en` ở 375/768/1280: tab vào strip + arrow điều khiển, hover card, ảnh lỗi fallback.
