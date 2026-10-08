Agent: reviewer

# Review — feature fix-layer1-dead-links · phase-1 · task-01 · round 2 (INDEPENDENT)

> **Independent review round 2.** Round 1 (`...-round-1-review.md`) là **inline self-review** do chính
> agent `change-request` (session đã implement) tự chạy — không đủ tính độc lập. Report này chạy lại
> **độc lập** bởi subagent `reviewer` (model khác họ builder: `opencode-go/deepseek-v4.1-flash`) để đóng
> gate STRICT thật. Commit được review: `bb1900e` (HEAD, branch `main`).

## Review level / Reason

- **Review level:** **STRICT**
- **Reason:** scope **CROSS-CUTTING** — chạm **shared shell/navigation** dùng chung trên mọi trang
  (`MobileNav`, `Footer`) + **shared cards** (`ProductCard`/`AppCard`, dùng ở home strip + `/products`).
  Đây là risk đỏ "shared component/navigation" theo `AGENTS.md` §Reviewer rules → bắt buộc STRICT.

## Blast radius

- **Mọi trang (vi + en):** `Footer` + `MobileNav` drawer (mobile shell).
- **Home product strip (Layer 2) + `/products`:** `ProductCard` / `AppCard` (`href` target).
- **Plan docs:** `tasks/nta-website/layer-2-task-01.md`, `tasks/nta-website/layer-0-task-04.md` (text R-03).
- **Không đụng:** route/API/schema/i18n messages/intent docs. `Header` desktop không nằm trong diff.

## Diff thực tế đã review

`git show bb1900e --stat` → 15 files, trong đó **đúng 4 file source + 2 file plan** nằm trong scope:
`AppCard.tsx`, `ProductCard.tsx`, `Footer.tsx`, `MobileNav.tsx`, `layer-2-task-01.md`, `layer-0-task-04.md`.
Phần còn lại (`progress.json`, `spec/*`, reports) là artifact close-out — không phải source.

- `ProductCard.tsx:14` / `AppCard.tsx:17`: `href={`/products/${product.slug}`}` → `href="/products"` ✅
- `MobileNav.tsx:10,43`: bỏ entry `['solutions','/solutions']`; label nhóm render bằng `<p className="flex min-h-11 items-center">{t('solutions')}</p>` (non-link) + 2 sub-link `/solutions/enterprise`, `/solutions/ai` ✅
- `Footer.tsx:25`: bỏ `<Link href="/privacy">`; giữ `<p>{t('copyright')}</p>` ✅

## Verify commands + result (tự chạy độc lập)

| Command | Result |
|---|---|
| `npm run lint` | ✅ PASS (exit 0, `eslint .` clean) |
| `npm run typecheck` | ✅ PASS (exit 0, `tsc --noEmit`) |
| `npm run build` | ✅ PASS (Next.js 15.5.27; `○ /_not-found`, `● /[locale]` (/vi,/en), `ƒ /[locale]/[...rest]`) |

- `test: null` → **skip, no test framework configured**.
- Grep độc lập (`src/`): **không còn** `href="/products/${`, `href="/solutions"` (parent) hay `/privacy`.
  Match duy nhất còn lại của `/solutions` là `Header.tsx:52` → `routeIsActive('/solutions')` (prefix match cho
  active state, **không phải link** — đúng thiết kế).
- i18n key `nav.solutions` vẫn tồn tại (vi: "Giải pháp" / en: "Solutions") → label MobileNav render được.

## Requirements coverage

| AC | Trạng thái | Bằng chứng |
|---|---|---|
| ProductCard/AppCard không còn href `/products/[slug]` | ✅ | `href="/products"` tại `ProductCard.tsx:14`, `AppCard.tsx:17`; grep sạch |
| MobileNav không còn link `/solutions`; đủ 2 sub-link | ✅ | `MobileNav.tsx:43` label `<p>` + 2 `Link` enterprise/ai |
| Footer không còn `/privacy`; copyright giữ | ✅ | `Footer.tsx:25`; grep `/privacy` trong `src/` = 0 |
| Plan docs khớp R-03 = "≥2" | ✅ | `layer-2-task-01.md:26` "≥2", `:43` "≥2 ProductCard"; `layer-0-task-04.md:43` "tiêu biểu ≥2", `:91` note ratify |
| Không đụng LOW Gap 5–10 / conflict C-A | ✅ | diff chỉ 6 file in-scope; không có file khác |
| Check commands pass | ✅ | 3/3 PASS (bảng trên) |
| Reviewer độc lập PASS (STRICT) | ✅ | report này |

## Regression check (theo yêu cầu)

- **Header desktop solutions dropdown:** không nằm trong diff; vẫn là `<button>` + 2 sub-link enterprise/ai
  (`Header.tsx:52-56`), không có parent link → **OK**.
- **Footer 4-col / copyright / social:** grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` giữ nguyên
  (`Footer.tsx:19`); 3 section cột + section liên hệ (social anchor + language toggle) giữ; copyright
  `<p>` giữ (`:25`) → **OK**.
- **Mobile drawer focus-trap / tab order:** `focusables()` query `'a, button'` (`MobileNav.tsx:22`); label
  `solutions` là `<p>` nên **không vào tab order** (đúng — non-interactive); trap vẫn bắt đầu/kết thúc đúng.
  Thứ tự mobile khớp desktop (solutions group → products → caseStudies → news → about → contact) → **OK**.
- **Design §1.1** (mobile mirror desktop, desktop chỉ dropdown enterprise/AI) + **§1.2** ("link Chính sách
  *nếu có*") → 2 fix khớp design ratified → **OK**.

## Responsive Checklist Gate (diff đụng UI → bắt buộc)

Phạm vi: chỉ đánh giá các thay đổi UI trong diff (4 file source). Không có môi trường browser → xác minh
bằng CSS math trên class đã đổi.

- **Layout:** OK — mobile-first (`lg:hidden` base, drawer `w-[min(22rem,88vw)]`); không thêm cột/`px`
  container cố định; thay `<div>`/`<p>` không đổi chiều rộng → không tạo horizontal scroll.
- **Typography/Spacing:** OK — label dùng `min-h-11` (2.75rem) + size kế thừa; không thêm font-size `px`.
- **Media:** N/A — diff không đụng ảnh/video.
- **Touch/Interaction:** OK — hamburger trigger `size-11` (44px), sub-link `min-h-11` (44px) giữ; label
  non-interactive không phải touch target (đúng); bỏ parent Link dead → không giảm touch target hợp lệ.
- **Viewport/A11y:** OK — không dùng `100vh`; không thêm `overflow:hidden`; bỏ dead link parent cải thiện a11y
  (không còn link trỏ route không tồn tại). **Chưa browser-test** → ghi ở Residual risk.

**Không có mục responsive nào FAIL.**

## Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| `aislop` | skip, aislop not installed | `node_modules/.bin/aislop` không tồn tại; không có dep trong `package.json` |
| `oxlint` (anti-slop) | skip, oxlint not configured | không có `.oxlintrc*`; không có `oxlint` dep |
| `ocr` (open-code-review) | skip, ocr not installed | `node_modules/.bin/ocr` không tồn tại |
| AI-readable | **OK** | diff chỉ đổi attribute/JSX 1 dòng; không tên mơ hồ, không hàm >50 dòng, không indirection, không magic number, không comment WHAT; doc impact đã record (plan reconcile) |
| ai-friendly-web | **N/A** (defer DevOps) | không có `llms.txt`/`robots.txt`/`sitemap`, **nhưng** đây là task bug-fix layer-1, chưa deploy (Phase 6 DevOps chưa chạy) — không phải public-release gate. Ghi Residual risk |
| blitzstrike | N/A | task UI tĩnh, không auth/API public/input → không thuộc diện STRICT nhạy cảm |

## Findings

| # | Severity | Nội dung | Cách xử lý |
|---|---|---|---|
| F-01 | **MINOR** (non-blocking) | `src/i18n/messages/{vi,en}.json:36` — key `footer.privacy` giờ **unused** (dead i18n key) sau khi bỏ link Footer. | Dọn ở Layer 4 (sweep i18n) nếu muốn; giữ lại cũng vô hại. Không chặn PASS. |
| F-02 | **MINOR** (non-blocking) | Route `/products` chưa tồn tại ở build hiện tại (Layer 2 task-05 sẽ tạo) → card link `/products` tạm qua catch-all 404 tới khi Layer 2 build. | Hợp lệ theo R-07 (route có trong spec/plan); theo dõi khi Layer 2 hoàn tất. Không chặn PASS. |
| F-03 | **MINOR** (non-blocking) | Round-1 report + commit trailer ghi "Review: STRICT PASS" nhưng thực chất là **inline self-review**. | Đã khắc phục: report này là independent round-2. Không còn blocker. |

Không có **CRITICAL** / **MAJOR**.

## Verdict

**✅ PASS** (STRICT, independent round 2)

- 4/4 fix đúng scope, trace được về yêu cầu; surgical diff (6 file in-scope, không drive-by refactor).
- 3/3 verify commands PASS độc lập; grep xác nhận không còn dead link `/products/${`, `/solutions` parent, `/privacy`.
- 0 CRITICAL / 0 MAJOR; 3 MINOR non-blocking (F-01/F-02/F-03).

## Residual risk / follow-up

1. Chưa browser-test responsive (375/768/1280) — xác minh bằng CSS math + build; không có môi trường browser.
2. ai-friendly-web assets (`llms.txt`/`robots.txt`/`sitemap`/JSON-LD) chưa có — phải xử lý ở Phase 6 DevOps /
   Layer 4 (metadata), không thuộc scope task này.
3. Dọn i18n key `footer.privacy` (F-01) và `/products` cần được build (F-02).
