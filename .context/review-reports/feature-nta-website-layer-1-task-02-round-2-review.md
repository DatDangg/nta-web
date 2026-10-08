Agent: reviewer

# Review — `layer-1-task-02` App shell (Header + Footer + drawer + i18n) — Round 2

- **Task:** `tasks/nta-website/layer-1-task-02.md`
- **Round:** 2 (sau fix M1–M4)
- **Date:** 2026-10-08
- **Diff under review:** `src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx`, `src/i18n/messages/{vi,en}.json`,
  `src/components/layout/{Header,Footer,MobileNav,LanguageToggle}.tsx`, `src/i18n/navigation.ts`, `tailwind.config.ts`,
  `src/app/globals.css`, task file. (Đối chiếu round 1: `feature-nta-website-layer-1-task-02-round-1-review.md`.)
- **Chuẩn đối chiếu:** design-spec §1.1/§1.2/§1.6 · R-11/R-20/R-24 · BR-001.

---

## Review level

**STRICT**

### Reason
App shell = shared navigation/chrome dùng bởi **mọi route** (`[locale]/**`) + behavior i18n deep-link (VI↔EN) +
a11y landmarks/focus-trap. Đây là risk đỏ theo reviewer rules (shared component/navigation, i18n, shell toàn site)
→ STRICT. Round 1 đã FAIL 4 MAJOR; round 2 verify lại toàn bộ + regression.

---

## Blast radius
- **Routes:** mọi route `[locale]/**` (header/footer/main wrap, skip-link, sticky behavior).
- **i18n:** `vi.json`/`en.json`, toggle VI↔EN giữ path, deep-link `/en/...`.
- **A11y:** landmark `header/nav/main/footer`, skip-link, focus management dropdown + drawer.
- **Visual/theme:** token `--color-background` (đổi sang kênh RGB) → ảnh hưởng mọi utility `bg-background*`.
- **Component:** `Button.buttonStyles` giờ dùng ở `Link` (Header/Footer/MobileNav CTA).

---

## Verify commands + result

| Command | Result |
|---|---|
| `npm run lint` | ❌ **Blocked** — `shell` bị permission deny (không chạy được lệnh nào). |
| `npm run typecheck` | ❌ **Blocked** — permission deny. |
| `npm run build` | ❌ **Blocked** — permission deny. |
| `test_command` | skip — `test_command: null` (project-config:36). |
| build artifact `.next/static/css/*` | ❌ Không tìm thấy (`glob` hidden `.next/static/css/*.css` → rỗng) → không kiểm chứng được evidence M1 của builder. |

> Không kiểm chứng độc lập được compile/type/build (shell deny). Các fix round 2 **đã được verify bằng đọc code
> tĩnh** vì root cause là CSS/JSX deterministic (xem mục "Round 2 — xác minh fix"). Runtime browser: không có
> browser tool → ghi Residual risk.

---

## Round 2 — xác minh fix M1–M4

### M1 — `bg-background/85` drop → **ĐÃ FIX ✅ (verify tĩnh)**
- `tailwind.config.ts:18`: `background: 'rgb(var(--color-background) / <alpha-value>)'` ✅
- `src/app/globals.css:11`: `--color-background: 255 255 255;` (kênh RGB space-separated, không hex) ✅
- `src/components/layout/Header.tsx:47`: `${scrolled ? 'bg-background/85 backdrop-blur-md' : 'bg-background'}`.
- Kết luận: cấu hình thoả điều kiện Tailwind sinh alpha modifier (`<alpha-value>` placeholder + token kênh RGB) →
  `bg-background/85` emit `background-color: rgb(var(--color-background) / 0.85)`. `bg-background` (không alpha)
  emit `rgb(var(--color-background) / 1)`. `backdrop-blur-md` là utility chuẩn + được liệt kê trong
  `transition-[background-color,backdrop-filter]`. **Root cause round 1 đã được xử lý đúng.**
- Không tự verify được artifact `.next/static/css/e07a59b0494a37bf.css` (thư mục `.next` không hiện diện)
  → xem Residual risk. Nhưng fix đúng ở tầng config/token.

### M2 — nested `<a><button>` → **ĐÃ FIX ✅**
- `grep '<Button'` trong `src/` → **0** usage (chỉ còn định nghĩa type/`variantStyles`/`sizeStyles` trong `Button.tsx`).
- `grep` nested interactive (`<a>…<button>` / `<button>…<a>`) trong `src/components/layout` → **0 match**.
- CTA giờ là 1 element focusable: `Header.tsx:60`, `Footer.tsx:24`, `MobileNav.tsx:45` đều dùng
  `<Link className={buttonStyles('primary','sm')}>` → render `<a>` với style button, không lồng button. ✅
- `Button.tsx:18` export `buttonStyles` — style button giữ nguyên (`rounded-full`, `min-h-11`, variant/size). ✅

### M3 — double `<main>` → **ĐÃ FIX ✅**
- `grep '<main'` trong `src/` → **duy nhất 1**: `src/app/[locale]/layout.tsx:33` `<main id="main">{children}</main>`.
- `src/app/[locale]/page.tsx:6-9` chỉ còn `<h1>{t('home')}</h1>` (không còn `<main>`). ✅
- `src/app/layout.tsx:4` chỉ `return children;` (không tạo landmark). ✅
- Skip-link `#main` (layout.tsx:29) trỏ đúng landmark duy nhất. ✅

### M4 — thiếu key `nav.home` → **ĐÃ FIX ✅**
- `vi.json:14` `"home": "Trang chủ"`; `en.json:14` `"home": "Home"`. ✅
- `page.tsx:4` `getTranslations('nav')` + `page.tsx:8` `t('home')` → resolve đúng key. ✅
- Key sets nav/footer VI/EN **đối xứng** (cùng 14 key nav, cùng 9 key footer; thêm `home` + `homeLabel`) ✅.

---

## Regression check (diff round 2)

| Hạng mục | Kết quả | Bằng chứng |
|---|---|---|
| Active route locale-agnostic | OK | `Header.tsx:41-44` `usePathname()` (next-intl strip locale) + `routeIsActive` prefix match; `aria-current="page"` (L58). |
| Dropdown `aria-expanded`/Esc | OK (1 quirk MINOR) | `Header.tsx:52` `aria-expanded`/`aria-haspopup`, Esc đóng + trả focus (L31-35), ArrowDown focus item đầu (L52). |
| Drawer focus trap/Esc/return | OK | `MobileNav.tsx:20-35` wrap Tab/Shift-Tab, Esc trả focus trigger, `inert` khi đóng (L41), `aria-controls` (L38). |
| Footer 4→2→1 + CTA BR-001 | OK | `Footer.tsx:19` `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`; CTA `Footer.tsx:24` (mọi trang). |
| Lang toggle giữ path | OK | `LanguageToggle.tsx:10` `pathname.replace(/^\/en(?=\/|$)/,'')` + `href={localizedPath}` locale vi/en (L14,16). |
| Skip-link + landmarks | OK | layout.tsx:29-34 (header/nav/main/footer đủ). |
| MINOR m1 `duration-250` | ĐÃ FIX | Không còn `duration-250` (grep 0); dùng `duration-base` (`MobileNav.tsx:40,41`). |
| MINOR m2 hardcode z-index | ĐÃ FIX | Không còn `z-[40]/z-[50]/z-[60]` (grep 0); dùng `z-header` (Header.tsx:47), `z-drawer` (MobileNav.tsx:39), `z-modal` (layout.tsx:29). |
| MINOR m5 logo touch target | ĐÃ FIX | `Header.tsx:49` `flex min-h-11 items-center px-2` → ≥44px. |
| MINOR m7 import trùng (Header) | ĐÃ FIX | `Header.tsx:5` gộp `import { Link, usePathname }`. |

---

## Responsive Checklist Gate (MANDATORY — diff đụng UI)

Đánh giá bằng CSS math (không có browser). Widths: **375 / 768 / 1280** (`ui.responsive_breakpoints`).

- **Layout / horizontal scroll: OK.** Container `max-w-[1280px] px-4 sm:px-6 lg:px-8`; nav desktop `hidden … lg:flex`,
  drawer `w-[min(22rem,88vw)]` (≤88% viewport, không tràn ở 375); Footer `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
  (1 cột @375, 2 cột @768, 4 cột @1280). Mobile-first (base rồi `sm:`/`md:`/`lg:`, min-width). Grid cột theo bp —
  chấp nhận cho chrome cố định 4 nhóm.
- **Typography / Spacing: OK.** Dùng thang `text-*` map `rem` (globals.css `--text-*`), spacing Tailwind; không
  thấy font-size `px` lẻ. Heading shell `text-xl`/`text-base` (chrome, không hero) — không FAIL.
- **Media: N/A.** Shell không có ảnh/video/embed.
- **Touch / Interaction: OK (logo đã fix; 1 observation non-blocking).** Logo `min-h-11` ✓; nav link `min-h-11` ✓;
  hamburger `size-11` + close `min-h-11 min-w-11` + lang `min-h-11 min-w-11` + social icon `size-11` ✓ (≥44px).
  Nav mobile có hamburger, không tràn ✓. Không có table. *(Observation: link text trong list Footer chỉ ~20px cao
  — dưới 44px; xem MINOR #8, non-blocking, đã được round 1 chấp nhận.)*
- **Viewport / A11y: OK.** Không dùng `100vh` (drawer `fixed inset-0`/`inset-y-0`); `prefers-reduced-motion`
  tôn trọng toàn cục (globals.css:79-88); không che lỗi bằng `overflow:hidden`.

Không có mục nào FAIL (không có mục nào ≥ ngưỡng fail). Phần runtime browser chưa xác minh → Residual risk.

---

## Skill gates

| Gate | Result | Evidence |
|---|---|---|
| `aislop scan --changes` | **skip** — `shell` permission deny, không chạy được CLI. | — |
| `oxlint` (anti-slop) | **skip, oxlint not configured** — glob `.oxlintrc*`/`oxlint*` → 0; repo dùng eslint (`package.json:9`). | — |
| `ocr` (open-code-review) | **skip, ocr not installed / shell deny** — không chặn PASS. | — |
| AI-readable codebase | **OK** — 1 indicator: `Header` function 51 dòng (>50). z-index đã token hoá (hết indicator #2). Chưa đủ ≥3. | Header.tsx:14-64 |
| ai-friendly-web | **N/A** — task app-shell nội bộ, chưa deploy; `llms.txt/robots.txt/sitemap.xml` thuộc R-21/Layer SEO. | design-spec §1.8 |
| blitzstrike | **skip** — không có môi trường/tool pentest; task không phải auth/API public/input. | — |

---

## Findings

> Không còn **[CRITICAL]** / **[MAJOR]**. Các mục dưới là MINOR (non-blocking), phần lớn là carry-over từ round 1.

### [MINOR] m1 — Icon không theo 1 family (Phosphor) *(carry-over round 1)*
- `Footer.tsx:21` tự vẽ `<path>` SVG Facebook; `MobileNav.tsx:38,42` dùng glyph `☰`/`×`. Vi phạm design-tokens §10
  "KHÔNG tự vẽ path icon", `@phosphor-icons/react` chưa cài.
- Fix: cài/dùng Phosphor (1 family), thay glyph bằng icon component. **Non-blocking.**

### [MINOR] m2 — `Header` function 51 dòng (> `max_function_lines` 50)
- `Header.tsx:14-64` (51 dòng). Fix: tách `SolutionsDropdown`/nav thành sub-component. **Non-blocking.**

### [MINOR] m3 — a11y label chưa bản địa hoá hết
- `LanguageToggle.tsx:13` vẫn hardcode `aria-label="Language"` (EN) trên site mặc định VI. (Header `homeLabel`
  đã bản địa hoá ✓.) Fix: đưa "Language"/"Ngôn ngữ" vào messages VI/EN. **Non-blocking.**

### [MINOR] m4 — Import trùng module ở `LanguageToggle`
- `LanguageToggle.tsx:4-5` import `usePathname` và `Link` từ cùng `@/i18n/navigation` bằng 2 câu lệnh (Header đã gộp).
  Fix: gộp 1 dòng. **Non-blocking.**

### [MINOR] m5 — Social link `rel="noreferrer"` thiếu `target="_blank"` *(carry-over round 1)*
- `Footer.tsx:21`. `rel` vô nghĩa nếu không mở tab mới. Fix: thêm `target="_blank"` (giữ `rel`) hoặc bỏ `rel`.
  **Non-blocking.**

### [MINOR] m6 — `aria-current="true"` thay vì `"page"` cho lang toggle
- `LanguageToggle.tsx:14,16` dùng `aria-current="true"`. `"page"` là token ngữ nghĩa phù hợp hơn cho link điều hướng
  ngôn ngữ. **Non-blocking.**

### [MINOR] m7 — Dropdown: click có thể đóng menu vừa mở bởi focus/hover
- `Header.tsx:52` kết hợp `onFocus={() => setSolutionsOpen(true)}` + `onClick={() => setSolutionsOpen(!solutionsOpen)}`.
  Khi focus/hover đã set `true`, cú click kế tiếp (sau khi state flush) đảo về `false` → click Enter/chuột đóng menu
  ngay. Keyboard vẫn dùng được (focus mở menu, Tab vào item), hover vẫn mở. Fix gợi ý: `onClick` chỉ mở khi đóng
  hoặc bỏ toggle click, giữ hover/focus. **Non-blocking** (đã tồn tại từ round 1).

### [MINOR] m8 — Link text ở Footer < 44px hit-area trên mobile
- `Footer.tsx:20` link `text-sm text-text-secondary` không `min-h-11` (~20px cao). Design §1.6 yêu cầu touch target
  ≥44px cho nav. Fix: thêm `min-h-11 inline-flex items-center` cho link list. **Non-blocking** (round 1 đã chấp nhận;
  ghi nhận để xử lý ở task polish).

### [MINOR / NGOÀI SCOPE] `hover:border-strong` trong `Button.tsx` nghi vấn không sinh CSS
- `src/components/ui/Button.tsx:13` — color key là `border-strong` → class hợp lệ là `border-border-strong`;
  `hover:border-strong` cần key `strong` (không tồn tại) nên có thể bị Tailwind bỏ (secondary variant hover border).
  Thuộc **task-01**, không nằm trong diff task-02 và không ảnh hưởng CTA primary của shell → **đề xuất task riêng**,
  không tính FAIL cho task này.

### [MINOR / NGOÀI SCOPE] `src/app/layout.tsx` chỉ `return children;` (không `<html>/<body>`)
- `src/app/layout.tsx:4` (Layer 0 scaffold, không trong diff task-02). Root layout của Next.js App Router thường
  phải chứa `<html>/<body>`; ở đây `[locale]/layout.tsx` (L26-27) cung cấp. Có thể là cảnh báo/không hợp lệ ở build.
- Thuộc scaffold Layer 0 ngoài scope task-02 → **Residual risk**, đề xuất verify khi shell cho phép; không tính FAIL.

---

## Điểm đã kiểm & đạt (không finding)
- M1–M4 round 1 **đã fix đúng** (verify tĩnh): alpha token + kênh RGB; CTA dùng `buttonStyles` trên `Link` (0 nested
  interactive); đúng 1 `<main id="main">`; `nav.home` + `homeLabel` có ở VI/EN, key sets đối xứng.
- MINOR round 1 đã fix: m1 `duration-base`, m2 z-token, m5 logo ≥44px, m7 gộp import Header.
- Landmarks + skip-link đúng; dropdown `aria-expanded`/Esc/ArrowDown; drawer focus trap/Esc/return + `inert`.
- Footer 4→2→1 + CTA BR-001; lang toggle giữ path VI↔EN; active route locale-agnostic.
- Không em-dash trong `src/`; file ≤300 dòng; không shadcn; `Footer` server component, `LanguageToggle` client leaf.

---

## Residual risk / Blocked
- **Blocked:** `npm run lint|typecheck|build` — shell permission deny; không xác minh độc lập compile/type/build.
  Claim PASS của builder chưa kiểm chứng được (nhưng fix được verify tĩnh).
- **Chưa xác minh artifact:** `.next/static/css/e07a59b0494a37bf.css` không tìm thấy → evidence M1 của builder
  không kiểm chứng trực tiếp; bù lại verify ở config + token.
- **Chưa xác minh runtime (không browser tool):** sticky/backdrop-blur sau scroll, focus trap/dropdown ở
  375/768/1280; đánh giá bằng đọc code + CSS math.
- **Ngoài scope (đề xuất task riêng):** `hover:border-strong` (Button.tsx), `src/app/layout.tsx` html/body.

---

## Verdict

✅ **PASS** — 0 CRITICAL · 0 MAJOR · 8 MINOR.

4 MAJOR của round 1 (M1 bg opacity drop · M2 nested `<a><button>` · M3 double `<main>` · M4 missing `nav.home`)
đã được fix và verify độc lập bằng đọc code tĩnh; không phát hiện regression mới. Các MINOR còn lại non-blocking.
*(Lưu ý: shell bị deny → verify command compile/type/build vẫn là Residual risk, kế thừa từ round 1.)*
