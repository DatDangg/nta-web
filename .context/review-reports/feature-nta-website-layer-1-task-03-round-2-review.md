Agent: reviewer

# Review — feature/nta-website · layer-1-task-03 (PageHeader/Breadcrumb/CTABanner + card family) — Round 2

- **Round:** 2 (review lại SAU fix round 1)
- **Date:** 2026-10-08
- **Task:** `tasks/nta-website/layer-1-task-03.md`
- **Round 1 report:** `.context/review-reports/feature-nta-website-layer-1-task-03-round-1-review.md` (FAIL — 2 MAJOR + 4 MINOR)
- **Diff under review:** `src/components/shared/{PageHeader,Breadcrumb,CTABanner}.tsx`,
  `src/components/cards/{SolutionCard,ProductCard,AppCard,CaseStudyCard,PostCard}.tsx`,
  `src/components/cards/cardStyles.ts`, `src/components/ui/Button.tsx` (thêm variant `inverse`), `tasks/nta-website/layer-1-task-03.md`.
  Không lấy được `git status/diff` (shell denied) → diff xác nhận bằng Glob + Read.

## Review level

`STRICT`

## Reason

- Shared component library (`src/components/shared/*`, `src/components/cards/*`, `src/components/ui/Button.tsx`) được mọi trang
  Layer 2 compose → risk đỏ "shared component/API client" (reviewer rules bắt buộc STRICT).
- Đụng **shared API surface** (`Button` variant) + **a11y/navigation contract** (focus target/card, breadcrumb semantic, contrast).
- Có **logic ẩn** cần kiểm: thứ tự Tailwind utility (`block` vs `grid`), class override button, slot `ReactNode` interactive.

## Blast radius

- Mọi route Layer 2 dùng card/shared: home, `/about`, `/solutions/*`, `/products`, `/case-studies`, `/blog` (+detail), `/contact`.
- `Button` (shared): thêm variant `inverse` — additive, không sửa variant cũ (xác nhận `inverse` chỉ dùng ở `CTABanner`).
- Rủi ro lan: a11y (nested interactive, contrast), SEO/BreadcrumbList, perf ảnh (`sizes`), visual CTA banner.

## Verify commands + result

| Command | Result |
|---|---|
| `git status --short` / `git diff HEAD` | **Blocked** — shell permission denied (dừng ngay, không retry). Diff xác nhận qua Glob + Read file. |
| `npm run lint` | **Blocked** — shell permission denied; builder khai PASS, reviewer không tái lập được. |
| `npm run typecheck` | **Blocked** — shell permission denied. |
| `npm run build` | **Blocked** — shell permission denied. |
| test | `skip, test_command: null` (project-config) — v1 chưa có test framework. |

> Không tự chạy app/manual repro. Kết luận contrast/class-order dựa trên token đã đọc + Tailwind v3.4.18
> (`tailwind.config.ts`, `globals.css`) và đánh dấu residual risk vì không verify được bằng build.

## Kiểm chứng fix round 1 (trọng tâm)

### MAJOR1 — AppCard nested `<a>` → **ĐÃ FIX (OK)**
- `src/components/cards/AppCard.tsx:17-29`: `<Link>` (title/content) bọc ảnh + `div` (h3/p/ul); `downloadLinks` render
  **ngoài** `<Link>` trong `<div className="mt-6">` (sibling). Grep `<Link|<a |<button|onClick` trong `cards/` chỉ có
  **đúng 1** `<Link`/file → không còn interactive lồng nhau.
- Content link + download links là 2 focus target độc lập, đúng amendment R-24 (task line 29) + Screen 7 có DownloadLinks.
  Slot typed `ReactNode | null`, default `null`, null-safe → OK.

### MAJOR2 — CTABanner primary button override → **ĐÃ FIX (OK)**
- `Button.tsx:3,16`: thêm variant `inverse: 'bg-surface text-text-primary hover:bg-surface-sunken'` (1 background utility,
  không chồng class). `CTABanner.tsx:23` dùng `buttonStyles(primary ? 'inverse' : 'primary', 'md')` + chỉ append
  `shrink-0 whitespace-nowrap` → **không** còn xung đột `bg-*`.
- `bg-surface` = `#ffffff`, `text-text-primary` = `#1d1d1f` → contrast **16.83:1** (≥4.5 AA) ✅. `hover:bg-surface-sunken`
  `#f5f5f7` + `#1d1d1f` → 15.6:1 ✅.
- Variant `inverse` **không phá variant khác**: là key mới trong `variantStyles`; grep toàn repo chỉ thấy dùng ở `CTABanner`.

### MINOR round 1 — đã fix
- **PostCard 16:9:** `cardStyles.ts:3` thêm `cardImageWideClass = 'aspect-[16/9] ...'`; `PostCard.tsx:19` dùng class này. OK.
- **`sizes`:** `cardStyles.ts:4` `cardImageSizes`; dùng ở `SolutionCard:17`, `ProductCard:15`, `AppCard:18` (inline sizes),
  `CaseStudyCard:19`, `PostCard:19`. OK.
- **Breadcrumb:** `Breadcrumb.tsx:15` `[{home}, ...items.slice(-2)]` giữ "Trang chủ"; separator `›` (line 24). OK.
- **Fallback surface-sunken:** `SolutionCard:17`, `ProductCard:15`, `AppCard:18`, `CaseStudyCard:19` render
  `<div aria-hidden="true" className={cardImageClass} />` (có `bg-surface-sunken` + aspect-ratio) khi thiếu ảnh. OK.

## Regression check

- **Props typed / không `any`:** 8 component props typed theo `src/content/types.ts`; grep `as any|: any|@ts-ignore` = 0.
- **Alt bắt buộc:** `imageAlt: string` (required) trên mọi card; fallback `aria-hidden` khi thiếu ảnh.
- **Grid 1→2→3:** `cardGridClass` = `grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3` (R-23). OK.
- **Hover lift + reduced-motion:** `cardLinkClass` `motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-sm`
  + `motion-safe:transition-*`; global `prefers-reduced-motion` trong `globals.css:79-88`. OK.
- **Breadcrumb semantic/locale:** `<nav aria-label="Breadcrumb">` + `<ol>`/`<li>`, `aria-current="page"`, `Link` locale-aware. OK.
- **File ≤300 / function ≤50:** file dài nhất 36 dòng; function ≤12 dòng. OK.
- **i18n keys tồn tại:** `nav.home`, `common.cta.contact`, `common.cta.learnMore` có trong `src/i18n/messages/vi.json`. OK.

## Responsive Checklist Gate (diff đụng UI)

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout (no h-scroll, mobile-first, grid auto) | **OK** | `cardGridClass` `grid-cols-1 → md:grid-cols-2 → lg:grid-cols-3`; container `max-w-container px-4 sm:px-6 lg:px-8`; media query `min-width`; breadcrumb `flex-wrap`. |
| Typography/Spacing (rem/clamp, không px) | **OK** | `text-display/h2/h3/body-lg/sm` map token clamp/rem (`globals.css`); spacing scale Tailwind. |
| Media (aspect-ratio, srcset/sizes) | **OK (đã fix)** | `cardImageClass` 16:10, `cardImageWideClass` 16:9, `bg-surface-sunken`, `object-cover`; **`sizes`** trên cả 5 card (R-22). |
| Touch/Interaction (≥44px, nav/table) | **OK** | Breadcrumb link `min-h-11` (44px); CTA button `min-h-11`; card link bọc khối. Không có nav/table trong scope. |
| Viewport/A11y (không 100vh, reduced-motion) | **OK** | Không `100vh`; `motion-safe:*` + global `prefers-reduced-motion`. |
| Breakpoints 375 / 768 / 1280 (CSS math) | **OK** | 375 → 1 cột; 768 → `md:grid-cols-2`; 1280 → `lg:grid-cols-3`. |

**Responsive gate: OK** (mục Media round 1 FAIL đã được khắc phục).

## Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| aislop | **skip, not configured** | Không có config/CLI aislop trong repo (glob = 0); shell denied. |
| anti-slop (oxlint) | **skip, oxlint not configured** | Không có `.oxlintrc*`/oxlint trong repo (glob = 0); chỉ eslint. |
| open-code-review (ocr) | **skip, ocr not installed** | Không có config/CLI `ocr` (glob = 0). |
| AI-readable | **OK** | Tên self-descriptive (`cardImageWideClass`, `cardImageSizes`, `BreadcrumbItem`); file ≤36 dòng, function ≤12; không comment WHAT; không magic number (aspect/transition dùng token). Không đổi luồng chính → không cần README/ARCHITECTURE. 0 chaos indicator. |
| ai-friendly-web | **N/A** | Task nội bộ (component library), chưa deploy web public. |
| blitzstrike | **skip, not installed** | Không phải task auth/API public/input. |

## Findings

### [MINOR] CTABanner button text màu tối lệch design-spec "chữ primary"
`src/components/shared/CTABanner.tsx:23` + `src/components/ui/Button.tsx:16` — design-spec Screen 1 quy định
"1 CTA (button trắng, **chữ `primary`**)" (`.context/design-spec.md:118`), nhưng variant `inverse` render nền trắng +
`text-text-primary` (`#1d1d1f`). Contrast tốt hơn (16.83:1 vs 4.70:1 của blue-on-white) nhưng **lệch intent đã duyệt**.
**Fix đề xuất:** nếu chấp nhận dark text → cập nhật design-spec Screen 1 cho khớp; nếu giữ intent → dùng `text-primary`
(white bg + blue text, 4.70:1 vẫn đạt AA).

### [MINOR] `Button` thêm variant `inverse` ngoài danh sách design-spec §1.9
`src/components/ui/Button.tsx:3` — design-spec §1.9 liệt kê `Button (primary/secondary/ghost/outline, sm/md/lg, pill)`
(`.context/design-spec.md:96`); variant thứ 5 `inverse` là API mới. Additive, không regression, nhưng task khai
`NO_DOC_IMPACT` trong khi contract component đã mở rộng.
**Fix đề xuất:** bổ sung `inverse` vào design-spec §1.9 (hoặc ghi lý do rõ trong task Doc Impact).

### [MINOR] AppCard dùng tỉ lệ ảnh 16:10 trong khi Screen 7 xl+ quy định 4:5
`src/components/cards/AppCard.tsx:18` — dùng `cardImageClass` (`aspect-[16/10]`), nhưng design-spec Screen 7
xl+ ghi "ảnh 4:5" (`.context/design-spec.md:340`). Lệch tỉ lệ khung screenshot ở desktop.
**Fix đề xuất:** thêm class ratio riêng cho AppCard (vd `aspect-[4/5]` ở `xl:`) hoặc xác nhận 16:10 là chủ đích.

### [MINOR] AppCard chồng `display` utility (`block` + `grid`) — phụ thuộc thứ tự Tailwind
`src/components/cards/AppCard.tsx:17` — `cardLinkClass` chứa `block`, AppCard append thêm `grid` → 2 utility cùng
property `display`. Với Tailwind v3.4.18, `.grid` được emit sau `.block` nên grid thắng (layout đúng), nhưng đây là
**phụ thuộc ngầm vào thứ tự plugin**, dễ vỡ nếu đổi class.
**Fix đề xuất:** tách class link không kèm `display`, hoặc truyền display qua prop để tránh trùng utility.

## Điểm đã kiểm & đạt

- MAJOR1 (nested `<a>`) và MAJOR2 (CTABanner override/contrast) **đã khắc phục đúng**; 4 MINOR round 1 đã fix.
- Mọi card 1 `<Link>` bọc khối; AppCard tách download links ra ngoài; focus ring `focus-visible:outline-*` thấy.
- `next/image` có `sizes` toàn bộ; aspect-ratio ảnh (CLS) + fallback `surface-sunken`.
- Alt là prop bắt buộc; không `any`; không em-dash/eyebrow/kicker; không TODO/FIXME.
- i18n keys dùng tồn tại; breadcrumb giữ "Trang chủ" + `›`; locale-aware `Link`/`Intl`.

## Verdict

✅ **PASS**

- CRITICAL: **0**
- MAJOR: **0**
- MINOR: **4**

Verdict PASS vì 2 MAJOR round 1 đã được fix đúng (AppCard không còn nested interactive; CTABanner dùng variant `inverse`
riêng, không chồng background class, contrast 16.83:1) và Responsive Gate mục Media đã OK. 4 MINOR còn lại là
deviation nhỏ về design-spec/contract, không chặn merge.

## Residual risk

- Không tái lập được `npm run lint/typecheck/build` (shell permission denied) → chưa xác nhận bằng build rằng
  `.grid` thắng `.block` trong CSS production của AppCard và class `inverse` được emit; cần xác nhận khi môi trường cho phép.
- Chưa có visual QA 375/768/1280 cho card/CTA thật (Layer 1 chưa compose content thực).
- aislop/oxlint/ocr không chạy được (chưa cấu hình / shell denied).
