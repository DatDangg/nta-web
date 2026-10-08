Agent: reviewer

# Review — `layer-1-task-02` App shell (Header + Footer + drawer + i18n messages)

- **Task:** `tasks/nta-website/layer-1-task-02.md`
- **Round:** 1
- **Date:** 2026-10-08
- **Diff under review (uncommitted):** M `src/app/[locale]/layout.tsx`, `src/i18n/messages/{vi,en}.json`, task file;
  ?? `src/components/layout/{Header,Footer,MobileNav,LanguageToggle}.tsx`, `src/i18n/navigation.ts`

---

## Review level

**STRICT**

### Reason
App shell = shared navigation/chrome used by **every route** (blast radius toàn site): shared Header/Footer/layout,
i18n deep-link behavior (VI↔EN), a11y landmarks/focus trap. Đây là risk đỏ theo reviewer rules
(shared component/navigation, i18n behavior, a11y/shell ảnh hưởng toàn bộ client) → bắt buộc STRICT.

---

## Blast radius
- Routes: mọi route `[locale]/**` (header/footer/main wrap).
- i18n: VI/EN messages, language toggle giữ path, deep-link `/en/...`.
- A11y: landmarks, skip-link, focus management drawer/dropdown.
- Visual: sticky header behavior toàn site; the app's only existing route `/[locale]` (home).

---

## Verify commands + result
| Command | Result |
|---|---|
| `npm run lint` | ❌ **Blocked** — `shell` bị permission deny (không chạy được lệnh nào). |
| `npm run typecheck` | ❌ **Blocked** — permission deny. |
| `npm run build` | ❌ **Blocked** — permission deny. |
| `test_command` | skip — `test_command: null` (project-config). |

> Builder khai `npm run lint/typecheck/build` PASS trong task file (L60, L89) nhưng **reviewer không
> kiểm chứng độc lập được** vì shell bị deny → đây là **Residual risk** (xem cuối report). Có finding
> mâu thuẫn với claim "build PASS" (xem M4).

---

## Responsive Checklist Gate (MANDATORY — diff đụng UI)
Đánh giá bằng CSS math (không có browser). Breakpoints: **375 / 768 / 1280** (`ui.responsive_breakpoints`).

- **Layout / horizontal scroll: OK.** Base rồi `sm:`/`md:`/`lg:` (mobile-first, min-width) — Header desktop nav
  `hidden … lg:flex`, drawer `lg:hidden`; Footer `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`; container
  `max-w-[1280px] px-4 sm:px-6 lg:px-8`; drawer `w-[min(22rem,88vw)]` → không tràn ở 375/768/1280.
  Grid dùng cột cố định theo bp (không `auto-fit`) — chấp nhận được cho chrome 4 cột cố định.
- **Typography / Spacing: OK.** Dùng `text-*` (rem), khoảng cách theo scale Tailwind; không thấy `px` lẻ cho
  font-size. Heading trong shell dùng size cố định (`text-xl`, `text-base`) — chrome, không phải hero → không FAIL.
- **Media: N/A.** Shell không có ảnh/video/embed.
- **Touch / Interaction: FAIL (một phần).** nav link `min-h-11`, hamburger/close/lang `size-11`/`min-h-11 min-w-11`
  ✓ (≥44px). Nhưng **logo link** (Header.tsx:50, `text-xl`, không padding/min-height) có hit-area ~28px cao
  < 44px → FAIL touch-target cho nav item này (R-24). Nav mobile có hamburger, không tràn ✓. Không có table.
- **Viewport / A11y: OK.** Không dùng `100vh` (drawer `fixed inset-0`/`inset-y-0`); `prefers-reduced-motion`
  được tôn trọng toàn cục (globals.css:79-88); không che lỗi bằng `overflow:hidden`.

*Phần chưa xác minh runtime (browser) → ghi vào Residual risk.*

---

## Skill gates
| Gate | Result | Evidence |
|---|---|---|
| `aislop scan --changes` | **skip** — shell permission denied (không chạy được CLI). | — |
| `oxlint` (anti-slop) | **skip, oxlint not configured** — repo dùng eslint, không có config oxlint. | package.json |
| `ocr` (open-code-review) | **skip, ocr not installed / không chạy được** (shell deny) — không chặn PASS. | — |
| AI-readable codebase | **OK (có cảnh báo)** — 2 indicator: `Header` 52 dòng (>50), z-index hardcode thay token. Chưa đủ ≥3. | Header.tsx:15-66; z-[40]/z-[50]/z-[60] |
| ai-friendly-web | **N/A** — task app-shell nội bộ build, chưa deploy; `llms.txt/robots.txt/sitemap.xml` thuộc R-21/Layer SEO. | design-spec §1.8 |
| blitzstrike | **skip** — không có môi trường/tool pentest; task không phải auth/API public/input. | — |

---

## Findings

### [MAJOR] M1 — `bg-background/85` bị Tailwind **drop hoàn toàn** → sticky header mất nền khi scroll, `backdrop-blur` không đúng spec
- File: `src/components/layout/Header.tsx:48` — `${scrolled ? 'bg-background/85 backdrop-blur-md' : 'bg-background'}`.
- Root cause: màu theme khai dạng raw CSS var hex (`tailwind.config.ts:18 background: 'var(--color-background)'`,
  `globals.css:11 #ffffff`). Tailwind v3 **không** áp opacity modifier lên `var()` không parse được:
  `pluginUtils.js:147-163` → `withAlphaValue('var(--color-background)', '0.85', undefined)`; `withAlphaVariable.js:26-31`
  `parseColor` trả `null` → trả `defaultValue = undefined` → utility `bg-background/85` **không sinh CSS** (bị bỏ).
- Impact: khi scroll, header **không có `background-color`** (thay vì trắng 85% mờ) → content chạy dưới bị blur nhưng
  không có lớp tint trắng → sai AC "backdrop-blur sau scroll", nguy cơ tương phản/đọc kém khi cuộn.
- Fix đề xuất: dùng alpha được: (a) đổi token sang kênh màu `--color-background: 255 255 255` +
  `rgb(var(--color-background) / <alpha-value>)`; hoặc (b) `bg-white/85`; hoặc (c) arbitrary
  `bg-[rgba(255,255,255,0.85)]`.

### [MAJOR] M2 — Nested interactive element `<a><button>` cho mọi CTA
- Files: `Header.tsx:61`, `Footer.tsx:24`, `MobileNav.tsx:45` — `<Link href="/contact"><Button…>…</Button></Link>`.
  `Link` = `<a>`, `Button.tsx:32` render `<button>` → `<a><button>`.
- Impact: HTML không hợp lệ (interactive content lồng trong `<a>`), 2 focus/activation target cho 1 CTA,
  gây double-activation/khó điều hướng screen reader; trong drawer còn thành 2 stop trong focus trap
  (`MobileNav.tsx:22` query `'a, button'`).
- Fix: cho `Link` nhận style button (export `buttonStyles({variant,size})` từ Button rồi áp vào Link),
  hoặc tạo `ButtonLink` polymorphic — không lồng button trong anchor; không cần shadcn.

### [MAJOR] M3 — Hai landmark `<main>` (nested) trên cùng trang
- `src/app/[locale]/layout.tsx:33` bọc `{children}` trong `<main id="main">`; `src/app/[locale]/page.tsx:7`
  vẫn render `<main>` riêng → 2 `main` landmark.
- Impact: vi phạm R-24/AC1 "landmark", screen reader announce 2 vùng main; skip-link `#main` chỉ trỏ đúng 1 trong 2.
- Fix: bỏ `<main>` ở `page.tsx` (layout sở hữu landmark), page chỉ render nội dung. (page.tsx ngoài diff nhưng do
  thay đổi layout trong diff tạo ra xung đột landmark; cần reconcile trong task này.)

### [MAJOR] M4 — Key i18n `nav.home` thiếu → trang chủ render fallback, mâu thuẫn AC "không key thiếu dịch" và claim build PASS
- `src/app/[locale]/page.tsx:8` dùng `getTranslations('nav')` rồi `t('home')`; nhưng `nav` trong
  `vi.json:12-24` và `en.json:12-24` **không có key `home`**.
- Impact: route `/` (và `/en`) render fallback key-path / log missing-message (next-intl) thay vì tiêu đề;
  vi phạm AC L56; nghi vấn `npm run build` PASS của builder (SSG cả 2 locale) — không thể tin claim.
- Fix: thêm `nav.home` (hoặc đúng namespace) VI/EN, hoặc cập nhật page sang namespace dùng key tồn tại.
  Nếu đây là gap scaffold Layer 0 (ngoài diff) thì vẫn phải xử lý/tách bug-task trước khi AC message hoàn tất.

### [MINOR] m1 — `duration-250` không phải class hợp lệ → drawer/scrim chạy 150ms thay vì 250ms
- `MobileNav.tsx:40,41`. Config chỉ có `transitionDuration: { fast, base, slow }` (`tailwind.config.ts:69`) → `duration-250`
  bị bỏ; `transition-transform`/`transition-opacity` mặc định 150ms. Sai spec motion 250ms (§1.1).
- Fix: `duration-base` (250ms) hoặc thêm token `250`.

### [MINOR] m2 — Hardcode z-index thay token
- `z-[40]` (Header.tsx:48), `z-[50]` (MobileNav.tsx:39), `z-[60]` (layout.tsx:29) — token có sẵn `z-header/z-drawer/z-modal`.
- Fix: dùng `z-header`, `z-drawer`, `z-modal`.

### [MINOR] m3 — Icon không theo 1 family (Phosphor)
- Footer.tsx:21 tự vẽ `<path>` SVG Facebook → vi phạm design-tokens §10 "KHÔNG tự vẽ path icon"; `@phosphor-icons/react`
  chưa được cài. MobileNav.tsx:38,42 dùng glyph `☰`/`×` làm icon.
- Fix: cài/dùng Phosphor (hoặc nguồn icon 1 family), bỏ path tự vẽ; thay glyph bằng icon component.

### [MINOR] m4 — `Header` function 52 dòng (> max_function_lines 50)
- `Header.tsx:15-66`. Fix: tách dropdown/nav thành sub-component hoặc `SolutionsDropdown`.

### [MINOR] m5 — Touch target logo < 44px
- `Header.tsx:50` (logo link không min-height/padding). Fix: thêm `min-h-11` (và padding ngang) cho link logo.

### [MINOR] m6 — a11y label chưa bản địa hoá
- `LanguageToggle.tsx:13` `aria-label="Language"`; `Header.tsx:50` `aria-label="NTA, home"` — hardcode EN trên site
  mặc định VI. Fix: đưa vào messages VI/EN.

### [MINOR] m7 — Import trùng module
- `Header.tsx:5-6` import `Link` và `usePathname` từ cùng `@/i18n/navigation` bằng 2 câu lệnh. Fix: gộp 1 dòng.

### [MINOR] m8 — Social link thiếu `target` nhưng có `rel="noreferrer"`; chỉ 1 social icon
- `Footer.tsx:21`. `rel="noreferrer"` vô nghĩa nếu không mở tab mới; task nói "social icons" (Phosphor 1 family).
  Fix: thêm `target="_blank"` (giữ `rel`) hoặc bỏ `rel`; bổ sung icon cùng family nếu cần.

---

## Điểm đã kiểm & đạt (không finding)
- Landmarks `header/nav/main/footer` + skip-link `#main` (layout.tsx:29-34); layout **không** tự sinh `<h1>` ✓.
- Dropdown desktop: `aria-expanded`/`aria-haspopup`, Esc đóng + trả focus (Header.tsx:30-40), ArrowDown mở & focus
  item đầu (L53) ✓.
- Active route locale-agnostic (`usePathname` của next-intl trả path đã strip locale; Header.tsx:42-45) → đúng cả
  VI/EN; underline 2px (`after:h-0.5`) ✓.
- Drawer focus trap logic (MobileNav.tsx:20-35): Esc đóng + trả focus trigger, wrap Tab/Shift-Tab, `inert` khi đóng ✓.
- Sticky header ở luồng (không nhảy layout), height 64/72 (`h-16 lg:h-[72px]`) ✓.
- Footer 4→2→1 cột, CTA BR-001, legal, VI|EN (Footer.tsx:19-26) ✓.
- Lang toggle giữ path VI↔EN (LanguageToggle.tsx:10-16) ✓.
- Messages VI/EN **đối xứng key** (cùng bộ) ✓; **không có em-dash** trong `src/` (grep) ✓.
- File ≤300 dòng ✓; không shadcn ✓; `Footer` là server component, `LanguageToggle` client leaf ✓.

---

## Residual risk / Blocked
- **Blocked:** không chạy được `npm run lint|typecheck|build` (shell permission deny) → không xác minh độc lập
  compile/type/build; claim PASS của builder chưa được kiểm chứng.
- **Chưa xác minh runtime:** hành vi sticky/backdrop-blur thực tế sau scroll, focus trap trên browser thật,
  hành vi dropdown hover/keyboard ở 375/768/1280 (không có browser tool) — đánh giá bằng đọc code + CSS math.
- **Nghi vấn cần verify:** M4 (`nav.home`) có thể làm `npm run build` fail/log lỗi — cần chạy build khi shell cho phép.

---

## Verdict

❌ **FAIL** — 0 CRITICAL · 4 MAJOR · 8 MINOR.

Các MAJOR phải sửa trước khi PASS:
1. **M1** `bg-background/85` bị drop → backdrop-blur/tint sai spec.
2. **M2** `<a><button>` nested interactive ở mọi CTA.
3. **M3** hai landmark `<main>` (layout + page).
4. **M4** thiếu key `nav.home`, mâu thuẫn AC message + claim build PASS.

*(Responsive Checklist Gate có 1 mục FAIL: touch-target logo < 44px → cũng thuộc điều kiện FAIL.)*
