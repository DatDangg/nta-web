Agent: reviewer

# Review — feature/nta-website · layer-1-task-03 (PageHeader/Breadcrumb/CTABanner + card family)

- **Round:** 1
- **Date:** 2026-10-08
- **Task:** `tasks/nta-website/layer-1-task-03.md`
- **Diff under review:** `M tasks/nta-website/layer-1-task-03.md`; untracked
  `src/components/shared/{PageHeader,Breadcrumb,CTABanner}.tsx`,
  `src/components/cards/{SolutionCard,ProductCard,AppCard,CaseStudyCard,PostCard}.tsx`, `src/components/cards/cardStyles.ts`

## Review level

`STRICT`

## Reason

- Đây là **shared component library** (`src/components/shared/*`, `src/components/cards/*`) được mọi trang nội dung
  Layer 2 compose → thuộc risk đỏ "shared component" (reviewer rules bắt buộc STRICT).
- Đụng **navigation/a11y contract** (Breadcrumb locale-aware, 1 focus target/card, không nested interactive).
- Có **logic ẩn**: Tailwind class-override order trong `CTABanner`, và slot `ReactNode` lồng trong anchor ở `AppCard`.

## Blast radius

- Mọi route Layer 2 dùng card/shared: home, `/about`, `/solutions/enterprise`, `/solutions/ai`, `/products`,
  `/case-studies`, `/blog` (+ detail pages), `/contact`.
- Rủi ro lan: a11y (nested `<a>`, contrast), SEO/BreadcrumbList (semantic), perf ảnh (R-22), visual CTA banner.

## Verify commands + result

| Command | Result |
|---|---|
| `git status --short` / `git diff HEAD` | **Blocked** — shell permission denied (dừng ngay, không retry). Diff xác nhận qua glob + Read file untracked. |
| `npm run lint` | **Blocked** — shell permission denied; builder khai PASS, reviewer không tái lập được. |
| `npm run typecheck` | **Blocked** — shell permission denied. |
| `npm run build` | **Blocked** — shell permission denied. |
| test | `skip, test_command: null` (project-config) — chấp nhận, chưa có test framework. |

> Không tự chạy app/manual repro. Các kết luận về CSS order/contrast dưới đây dựa trên Tailwind v3 ordering +
> token đã đọc; đánh dấu residual risk vì không verify được bằng build.

## Responsive Checklist Gate (diff đụng UI)

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout (no h-scroll, mobile-first, grid auto) | **OK** | `cardGridClass = grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3`; container `max-w-container px-4 sm:px-6 lg:px-8`; media query min-width. |
| Typography/Spacing (rem/clamp, không px) | **OK** | font-size dùng token `text-display/h2/h3/body-lg/sm` (clamp/rem trong `globals.css`); spacing theo scale Tailwind. |
| Media (aspect-ratio, srcset/sizes) | **FAIL** | Ảnh có `aspect-[16/10]` + `object-cover` + `bg-surface-sunken` (CLS OK) nhưng **thiếu `sizes`/srcset** → browser giả định 100vw, tải asset 960w trên mobile (R-22). Xem MINOR #4. |
| Touch/Interaction (≥44px, nav/table) | **OK** | Breadcrumb link `min-h-11` (44px); card link bọc cả khối; CTA button `min-h-11`. Không có nav/table trong scope. |
| Viewport/A11y (không 100vh, reduced-motion) | **OK** | Không dùng `100vh`; `motion-safe:*` trên card + global `prefers-reduced-motion` trong `globals.css`. |
| Breakpoints 375 / 768 / 1280 (CSS math) | **OK** | 375 → 1 cột; 768 → `md:grid-cols-2`; 1280 → `lg:grid-cols-3`. |

## Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| aislop | **skip, not configured / shell denied** | Không có config aislop trong repo; shell bị deny. |
| anti-slop (oxlint) | **skip, oxlint not configured** | Không có `.oxlintrc*`/oxlint trong `package.json` (chỉ eslint). |
| open-code-review (ocr) | **skip, ocr not installed** | Không có config/CLI `ocr`. |
| AI-readable | **OK** | Tên self-descriptive (`cardGridClass`, `cardImageClass`, `BreadcrumbItem`); file ≤32 dòng, function ≤12 dòng; không comment WHAT; không magic number (aspect/transition dùng token). Không đổi luồng chính → không cần README/ARCHITECTURE. 0 chaos indicator. |
| ai-friendly-web | **N/A** | Task nội bộ (component library), chưa deploy web public. |
| blitzstrike | **skip, not installed** | Không phải task auth/API public. |
| Responsive gate | xem bảng trên | 1 FAIL (media sizes). |

## Findings

### [MAJOR] AppCard: block-link lồng slot `downloadLinks` → nested `<a>` (vi phạm R-24)
`src/components/cards/AppCard.tsx:18,28` — `<Link>` bọc cả khối, nhưng bên trong render `{downloadLinks}`
(`ReactNode | null`). Theo design Screen 7, `DownloadLinks` chính là badge App Store/Google Play dạng **link**.
Khi Layer 2 truyền link vào slot → sinh `<a>` lồng trong `<a>`: HTML interactive lồng nhau, 2 focus stop trong
1 card, vi phạm yêu cầu "card link bọc khối — KHÔNG nested `<a>`; mỗi card 1 focus target".
**Fix đề xuất:** tách link ra khỏi vùng DownloadLinks (vd chỉ bọc ảnh + tiêu đề, render download links ngoài
`<Link>`; hoặc dùng "stretched-link" overlay với download links `relative z-10` ngoài anchor), hoặc đổi type slot
thành non-interactive (badge-only) và ghi rõ contract.

### [MAJOR] CTABanner primary variant: override class bị Tailwind order vô hiệu → button không trắng + nguy cơ fail contrast
`src/components/shared/CTABanner.tsx:23` — base `buttonStyles('secondary')` đã có `bg-background-alt` +
`hover:bg-border`; sau đó append `bg-background` + `hover:bg-background-alt`. Với Tailwind v3, utility cùng
property được emit theo thứ tự theme config (`background` < `background-alt` < `border`), nên override **thua**:
button primary render nền `#F5F5F7` (không phải trắng) và hover thành `#D2D2D7`. Text `#0071E3` trên `#F5F5F7`
≈ **4.33:1 < 4.5 (AA body)** → nguy cơ fail WCAG trên CTA dùng chung.
**Fix đề xuất:** tạo class riêng cho nút trắng (chỉ 1 utility background, vd `bg-surface text-primary hover:bg-surface-sunken`)
hoặc thêm variant `inverse` trong `Button` thay vì chồng class.
*(Chưa verify được bằng build — shell denied; đánh dấu residual risk.)*

### [MINOR] PostCard ảnh 16:10 lệch design 16:9
`src/components/cards/PostCard.tsx:19` — dùng chung `cardImageClass` (`aspect-[16/10]`), nhưng design Screen 10
quy định ảnh bìa blog 16:9. **Fix:** thêm `cardImageWideClass` (`aspect-[16/9]`) hoặc prop aspect cho PostCard.

### [MINOR] Card images thiếu `sizes` (R-22 perf)
`SolutionCard.tsx:19`, `ProductCard.tsx:17`, `AppCard.tsx:19`, `CaseStudyCard.tsx:21`, `PostCard.tsx:19` —
`next/image` không có `sizes` trong grid 1/2/3 cột → browser giả định 100vw, tải ảnh 960w trên mobile.
**Fix:** thêm `sizes` khớp layout (vd `(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw`).

### [MINOR] Breadcrumb `.slice(-3)` có thể âm thầm bỏ "Trang chủ" + separator khác design
`src/components/shared/Breadcrumb.tsx:15,24` — `[home, ...items].slice(-3)` giữ 3 phần tử **cuối**, nên khi caller
truyền ≥3 item thì crumb gốc "Trang chủ" bị bỏ (lệch cấu trúc "Trang chủ › Mảng › Trang"). Separator dùng `/`
trong khi design dùng `›`. **Fix:** cap trước khi ghép home (`[...items].slice(-2)`) và đổi separator.

### [MINOR] Card ẩn hoàn toàn khi thiếu ảnh, không dùng fallback `surface-sunken`
`SolutionCard.tsx:15`, `ProductCard.tsx:13`, `AppCard.tsx:15`, `CaseStudyCard.tsx:17` — `if (!image) return null`
khiến card + tiêu đề + link biến mất; task item 5 ghi "fallback ảnh `surface-sunken`". Hiện toàn bộ content có
ảnh nên chưa kích hoạt, nhưng với card là nội dung chính thì ẩn lặng lẽ có thể mất nội dung. **Fix:** render khối
fallback `bg-surface-sunken` với aspect-ratio, hoặc ghi rõ hành vi ẩn có chủ đích.

## Điểm đã kiểm & đạt

- 8 component props typed theo `src/content/types.ts` (`Solution`/`Product`/`CaseStudy`/`Post`), **không `any`**
  (grep `\bany\b` = 0). `AppCard` null-safe: `downloadLinks = null` + conditional render.
- Mỗi card 1 `<Link>` bọc khối; không nested anchor (trừ AppCard downloadLinks — MAJOR trên).
- Hover lift `motion-safe:hover:-translate-y-1` (= -4px) + `motion-safe:hover:shadow-sm`; reduced-motion không animate.
- Alt là prop **bắt buộc** trên mọi card; aspect-ratio ảnh có (CLS).
- Breadcrumb `<nav aria-label="Breadcrumb">` + `<ol>`, `aria-current="page"`, locale-aware `Link`; PageHeader
  variant centered/left; CTABanner 2 variant, 1 CTA (`common.cta.contact`), `whitespace-nowrap`.
- Anti-slop: mọi card có ảnh; không eyebrow/kicker; không em-dash (grep = 0); file ≤300/function ≤50.
- i18n keys dùng tồn tại (`nav.home`, `common.cta.contact/learnMore`) — không cần sửa messages.

## Verdict

❌ **FAIL**

- CRITICAL: **0**
- MAJOR: **2**
- MINOR: **4**

Verdict FAIL vì còn 2 MAJOR: (1) AppCard block-link lồng DownloadLinks → nested `<a>`/2 focus target vi phạm R-24;
(2) CTABanner primary button override bị vô hiệu bởi Tailwind order → không trắng + nguy cơ fail contrast AA.
Ngoài ra Responsive Gate mục Media = FAIL (thiếu `sizes`).

## Residual risk

- Không tái lập được `npm run lint/typecheck/build` (shell permission denied) → độ chính xác của finding CTABanner
  phụ thuộc suy luận Tailwind ordering, cần xác nhận bằng build/visual QA khi môi trường cho phép.
- Chưa có visual QA ở 375/768/1280 cho card/CTA thật (Layer 1 chưa compose content thực).
- aislop/oxlint/ocr không chạy được (chưa cấu hình / shell denied).
