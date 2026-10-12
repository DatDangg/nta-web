Agent: reviewer

# Review Report — change/brand-logo-wordmark-removal · phase-1-task-01 · round 1

- **Work item:** `tasks/change-brand-logo-wordmark-removal/phase-1-task-01.md`
- **Change:** `spec/changes/2026-10-12-brand-logo-wordmark-removal.md`
- **Diff scope:** `src/components/layout/BrandLogo.tsx` (1 file, +6 / −6)
- **Round:** 1 · **attempt (journal):** 0

## Review level

**STRICT**

### Reason

- `BrandLogo` là **shared presentational component** render ở **Header + Footer trên MỌI route** và **cả 2 locale (VI+EN)** → trúng trigger "shared component" của rubric (risk-based).
- Đụng tới **brand identity + accessible name (a11y) + SEO brand signal** — cần xác minh tường minh rằng bỏ chữ thị giác KHÔNG làm mất brand name cho screen reader/SEO.
- Đồng thời ghi nhận bản chất thay đổi là **subtractive, thuần trình bày**: không logic/state/contract/API/DB/auth/tenant → **không** có risk đỏ về logic. STRICT ở đây để tăng độ sâu kiểm chứng (a11y + asset + regression), **không** ngụ ý nhiều khả năng FAIL.

## Blast radius

- **UI render:** `BrandLogo` → `Header.tsx:51` + `Footer.tsx:21` (VI+EN, mọi route). Không có caller thứ 3 (đã verify bằng grep).
- **A11y/SEO:** accessible name của link home (`aria-label` = `homeLabel` = `"NTA, trang chủ"` / `"NTA, home"`) + JSON-LD `Organization.name`/`WebSite.name` = `"NTA"` (`src/lib/seo/jsonld.ts:5,12`).
- **Asset:** `logo-mark.png` (dùng tiếp), `logo-square.png` (JSON-LD), `logo-lockup.png` (unused).
- **Không lan:** API/DB/auth/tenant/route/data/cache/navigation. `Header.tsx`/`Footer.tsx`/`MobileNav.tsx` không bị sửa.

## Verify commands + result

| Command | Result |
|---|---|
| `git --no-pager diff -- src/components/layout/BrandLogo.tsx` | ✅ Ran by reviewer. Diff khớp mô tả: bỏ `<span …>NTA</span>`, bỏ `gap-2`, cập nhật docblock. |
| `npm run typecheck` (`npm run typecheck`) | ⛔ **Blocked (sandbox):** PowerShell chặn `npm.ps1` (`running scripts is disabled`). Builder báo exit 0 PASS — dùng làm evidence đối chiếu. |
| `npm.cmd run typecheck` / `node ./node_modules/typescript/bin/tsc --noEmit` | ⛔ **Blocked:** permission denied (shell). Không retry biến thể (Tool Loop Guard). |
| `npm run lint` | ⛔ **Blocked** (cùng lý do `npm.ps1`). Builder báo exit 0, 0 errors, 1 warning pre-existing `src/components/mdx/index.tsx:25 no-img-element` (ngoài scope). |
| `npm run build` | ⛔ Not run by reviewer (blocked + ghi chú `next dev` tranh chấp `.next`). Builder đã chứng minh PASS qua `distDir: '.next-build'` và chứng minh failure trên HEAD không liên quan diff. |
| Static: Grep `>NTA<` / `NTA</span>` / `wordmark` trong `src/` | ✅ 0 match text/DOM; chỉ còn trong comment của `BrandLogo.tsx`. |
| Static: Grep `BrandLogo` trong `src/` | ✅ Đúng 2 caller (`Header.tsx:51`, `Footer.tsx:21`). |
| Static: `src/i18n/messages/{vi,en}.json:15` | ✅ `homeLabel` = `"NTA, trang chủ"` / `"NTA, home"` còn nguyên. |
| Static: `src/lib/seo/jsonld.ts` | ✅ Vẫn `logo: …/logo-square.png` (dòng 6), không đổi. |
| Static: Grep `logo-lockup` trong repo | ✅ 0 reference trong `src/` (chỉ trong task/change docs). |

> **Blocked disclosure:** Reviewer KHÔNG tự chạy được typecheck/lint/build trong môi trường này. Kết luận PASS dựa trên (a) diff cực nhỏ, subtractive, và (b) phân tích tĩnh: xoá một node JSX tĩnh + một class string không thể sinh type error hay lint error mới. Đây là **Residual risk** nếu cần evidence máy móc độc lập.

## Acceptance criteria — kết quả

1. BrandLogo không còn text "NTA" trong DOM; chỉ còn `<Image src="/images/brand/logo-mark.png">` → ✅ OK (`BrandLogo.tsx:17–31`; grep 0 match).
2. Header + Footer (VI+EN) vẫn render mark, layout không vỡ (`inline-flex items-center`) → ✅ OK (caller nguyên vẹn; `w-auto` + intrinsic 480×397 giữ tỉ lệ).
3. Accessible name link home giữ `"NTA, trang chủ"`/`"NTA, home"` → ✅ OK (aria-label ở `<Link>` outer cả Header lẫn Footer; image `alt="" aria-hidden`).
4. Không đụng asset (`logo-square.png` JSON-LD; `logo-lockup.png` unused) → ✅ OK.
5. Build HTML không còn `>NTA<` trong vùng logo → ✅ theo evidence primary (`.next-build` VI `/vi`: `>NTA<` = 0, `logo-mark.png` = 9). Reviewer không tự build (blocked).
6. `lint`/`typecheck`/`build` PASS (`test_command: null` → skip) → ✅ theo evidence primary; reviewer blocked (như trên).

## Responsive Checklist Gate

Áp dụng (project có block `ui:`, diff đụng UI component). Breakpoints tham chiếu: 640/768/1024/1280/1536 (mobile base <640).

| Mục | KQ | Bằng chứng |
|---|---|---|
| **Layout** — không horizontal scroll, mobile-first, grid auto-fit, container không fixed px | **OK** | Diff chỉ *giảm* bề rộng (bỏ wordmark + `gap-2`) → không phát sinh overflow. Không có media query/grid/container mới trong diff. |
| **Typography/Spacing** — rem/clamp | **N/A** | Diff *bỏ* text (không thêm typography); `gap-2` bỏ không ảnh hưởng vì chỉ còn 1 child. |
| **Media** — `max-width:100%;height:auto` + aspect-ratio; srcset ảnh quan trọng | **OK** | `next/image` giữ `width=480 height=397` (`h-9 w-auto`) → aspect-ratio 480:397 không méo. Logo là decorative (`alt=""`), không cần `srcset`. |
| **Touch/Interaction** — target ≥44×44 mobile; nav hamburger; table | **OK** (kèm MINOR #1) | Header link có `min-h-11` (44px) → OK. Footer link (`Footer.tsx:21`) chỉ `inline-flex`, không padding: sau khi bỏ wordmark, bề rộng tappable ≈ 36px×480/397 ≈ **43.5px** (<44) và cao 36px (<44) — xem MINOR #1 (cao 36px vốn **pre-existing**, `Footer.tsx` không thuộc diff). Hamburger `MobileNav` không đổi. |
| **Viewport/A11y** — không `100vh` đơn thuần, `prefers-reduced-motion`, không che lỗi bằng `overflow:hidden` | **OK** | Diff không thêm `100vh`/motion/overflow. A11y name link home giữ nguyên qua `aria-label`. |

→ **Không có mục responsive FAIL do diff.** MINOR #1 là advisory (AA vẫn pass ở 24px).

## Skill gates

| Gate | KQ | Bằng chứng |
|---|---|---|
| `aislop scan --changes` | **skip** | CLI không cài/không có config trong repo; shell bị chặn → không chạy được. |
| `oxlint` (anti-slop) | **skip, oxlint not configured** | Không có `.oxlintrc.json`/`oxlint.json`/eslint-oxlint config (glob 0 match). |
| `ocr` (open-code-review) | **skip, ocr not installed** | Không có config `ocr`; shell bị chặn. |
| AI-readable gate | **OK** | 0 AI-chaos indicator: file 31 dòng (<300), function 13 dòng (<50), const có tên (`LOGO_MARK_*`), comment giải thích WHY (không WHAT), không indirection mới, không đổi luồng chính nên không cần update README/ARCHITECTURE. |
| ai-friendly-web | **OK** | Task public-facing; có `public/llms.txt`, `src/app/robots.ts`, `src/app/sitemap.ts`. |
| blitzstrike pentest | **N/A / skip** | Không phải task security-sensitive (không auth/API/input); shell bị chặn. |

## Findings

**[CRITICAL]** none.

**[MAJOR]** none.

**[MINOR]**

1. **Footer logo link — touch target dưới guideline 44px sau khi bỏ wordmark** — `Footer.tsx:21` (`<Link aria-label={nav('homeLabel')} className="mb-10 inline-flex" href="/">`).
   - Sau diff, bề rộng tappable ≈ `h-9`(36px) × tỉ lệ 480/397 ≈ **43.5px** (<44); cao **36px** (<44). Chiều cao vốn đã <44 **trước** diff (ảnh luôn `h-9`) nên phần "cao <44" là **pre-existing, ngoài scope** (`Footer.tsx` không thuộc diff); phần "rộng <44" là hệ quả phụ của việc bỏ wordmark.
   - **Non-blocking:** WCAG 2.5.8 (AA) yêu cầu 24×24 → vẫn PASS; 2.5.5 (AAA) 44×44 mới fail. Đây là link logo (không phải CTA chính).
   - **Đề xuất (task riêng, đừng mở scope task này):** thêm `min-h-11 px-2` (hoặc padding) cho `<Link>` logo ở Footer để đạt ≥44×44, đồng bộ với Header link.

2. **Doc stale `design-spec.md:22`** — `.context/design-spec.md:22` vẫn viết "logo (trái, text wordmark 'NTA' khi chưa có logo OQ#1)".
   - Đã stale từ commit `eb2a6f6` và nay **mâu thuẫn trực tiếp** với behavior mới (bỏ hẳn wordmark). Task ghi `Doc impact: none` — chấp nhận được vì `docs/DESIGN.md`/`API_SPEC.md`/`ERD.md` **không** mô tả logo thương hiệu (đã grep xác nhận: `docs/` 0 match `wordmark|logo-mark|logo-square|logo-lockup`), nhưng nên **reconcile `.context/design-spec.md:22` trong close-out** (task đã tự flag). Non-blocking.
   - **Đề xuất fix:** đổi dòng 22 thành "logo (trái, mark `logo-mark.png`)" — là file context (as-built behavior), reconcile hợp lệ.

**[OBSERVATION — không phải defect]**

- Brand name cho **người dùng thị giác** giờ chỉ còn glyph; brand name cho **screen reader / SEO** vẫn nguyên (`aria-label` link home + JSON-LD `Organization`/`WebSite` name = "NTA"). Đúng yêu cầu user ("xóa chữ NTA đi, để mỗi cái kia thôi").
- Không phát sinh dead code/import thừa: diff chỉ xoá node tĩnh + class string; `Image`/const vẫn dùng.

## Surgical diff (karpathy) / anti-over-engineer (ponytail)

✅ OK — mọi dòng trace về yêu cầu user; không drive-by refactor; không over-engineer.

## Verdict

**✅ PASS** (không có CRITICAL/MAJOR; 2 MINOR non-blocking đã liệt kê).

## Residual risk

- Verify máy móc độc lập (typecheck/lint/build) **chưa chạy được trong sandbox của reviewer** (PowerShell exec-policy + shell permission deny). Kết luận dựa trên static analysis + evidence primary. Nếu cần chứng minh máy móc bổ sung, chạy lại 3 lệnh trong môi trường có quyền.
- Build HTML evidence (`>NTA<` = 0) do primary cung cấp, reviewer không tự build lại.
- Touch-target MINOR #1: số đo tính theo CSS math (không có môi trường browser để đo thực tế).
