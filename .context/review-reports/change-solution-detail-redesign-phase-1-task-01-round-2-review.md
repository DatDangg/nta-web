# Review Report — change `solution-detail-redesign` · Phase 1 · Task 01 · Round 2

Agent: reviewer

- **Commit review (round 1):** `1a7f40a`
- **Commit fix (round 2):** `c7589dd` (không đọc được `git diff` — shell bị deny; review dựa trên **đọc trực tiếp file hiện tại**)
- **Spec nguồn:** `.context/design-spec-solution-detail.md` §1 (L1–L4), §3.1, §4.3, §5.5
- **Change request:** `spec/changes/2026-10-11-solution-detail-redesign.md` (T1 + §4 acceptance)
- **Round 1 report:** `.context/review-reports/change-solution-detail-redesign-phase-1-task-01-round-1-review.md` (verdict FAIL, 3 MAJOR)
- **Review level:** `STRICT`

## Reason (vì sao STRICT)

- Diff đụng **primitive/shared component dùng cho mọi trang**: `Container` (nguồn sự thật bề rộng toàn site), `Section`, `Header`, `CTABanner`, `HomeImage`, `PageHeader`, `Footer`, `Hero`, `CaseStudyHighlight`, các `solutions/*`.
- `Container`/`Section` là contract mà T2–T5 dựa vào → phải chốt đúng ở T1.
- 4 trang enterprise đang **live trên prod** → sai layout tầng template = regression diện rộng.
- Không thuộc risk đỏ data/DB/auth nhưng thuộc "shared component dùng nhiều client" → giữ STRICT (như round 1, không hạ cấp).

## Blast radius

| Component/primitive | Phạm vi ảnh hưởng |
|---|---|
| `Container` → `Section` | **Mọi `<Section>` toàn site** (home, about, products, solutions/*, blog, case-studies, contact) |
| `CTABanner` | 7 file page (home, about, products, solutions/enterprise, solutions/ai, case-studies/[slug], blog/[slug]) = 14 route locale |
| `Header` | Mọi route (2 locale) |
| `FaqList` / `SolutionSections` / `FeatureList` / `BenefitList` / `UseCases` | enterprise detail (có `renderExtendedContent`) + solutions/ai |
| `page.tsx` enterprise detail | 8 route SSG (vi/en × crm/hrm/lms/dentgo) |
| `HomeImage` call site | 7 call site → home/about/cards/solutions |

**Dữ liệu xác nhận (đọc file, không đoán):**
- `renderExtendedContent: true` cho **crm/hrm/dentgo/lms** (`src/content/solutions/{vi,en}/{crm,hrm,dentgo,lms}.mdx:7`) → `SolutionSections`/`FaqList`/`UseCases` **thực sự render** trên trang enterprise ⇒ các finding về chúng là đường live, không phải dead path.
- `relatedCases` **chỉ có** ở AI solutions (`boxai`, `flycam`, `custom-ai`); **không** enterprise nào có → `hasRelated` **luôn false** trên 8 route enterprise.

## Verify commands + result

| Kênh | Kết quả |
|---|---|
| `git --no-pager diff --stat 1a7f40a c7589dd` | ❌ **Blocked — `permission.rejected: Permission denied: shell`.** Dừng, không retry (Tool Loop Guard). Không đọc được diff → review bằng nội dung file hiện tại. |
| `npm run lint` / `typecheck` / `build` | ❌ **Blocked — permission denied** (shell). Không reproduce được evidence của builder. |
| Build artifact `.next/**/*.html` | ❌ **Không có** — glob `.next/**/*.html` (hidden) = **0 file** ⇒ không có HTML build để đọc. |
| Browser (dev server `http://localhost:3000`) | ❌ **Blocked — `[browser.disconnected] No desktop browser is connected`.** `tabs.open` không kết nối được → không đo được computed `max-width`/`scrollWidth`/số ký tự/dòng. Không retry. |
| Grep `max-w-\[1280px\]` trong `src/` | ⚠ Không chạy lại được (đã dùng hết cap tool đọc STRICT + shell deny). Round 1 = 0; fix không thêm class này ở các file đã đọc. Ghi Residual risk. |
| `aislop scan` | skip — không cài + shell deny |
| `oxlint` | skip, oxlint not configured |
| `ocr` | skip — không xác minh được cài đặt (shell deny) |

> ⚠️ **Cả 3 kênh verify dự kiến (shell/build/browser) đều bị block.** Do đó các kết luận dưới đây là **phân tích source-level (deterministic từ class/cấu trúc JSX)**, KHÔNG phải đo render thật. Mức tin cậy: **MEDIUM-HIGH cho việc "3 MAJOR đã sửa"**, **LOW cho kết luận "không còn regression khác"**.

---

## A. Xác nhận 3 MAJOR (round 1)

### ✅ MAJOR-1 — L2 `Container` đặt sai chỗ → ĐÃ SỬA (case reachable)

`src/app/[locale]/solutions/enterprise/[slug]/page.tsx:73`:
```tsx
<div className={hasRelated ? 'grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_18.75rem] xl:gap-16' : ''}>
```
- Khi **`!hasRelated`** (trạng thái thực tế của cả 4 trang): className = `''` → **`<div>` block thuần, KHÔNG `max-w`, KHÔNG `px-*`**. Các `<Section>` là con trực tiếp → nền `bg-background-alt` **tràn full-width**; nội dung **hết double padding** (chỉ còn Container bên trong mỗi `Section`). ⇒ **Khắc phục đúng nguyên nhân MAJOR-1** (deterministic từ cấu trúc: 1 block div không thể giới hạn bề rộng của con).
- Comment `page.tsx:70-72` **đã sửa đúng sự thật** ("KHÔNG bọc Container ở cấp này… Container thuộc về từng Section") ⇒ hết indicator "comment sai" của round 1.
- ⚠ Còn tồn dư ở nhánh `hasRelated` (xem MINOR-4) — nhánh này **hiện không reachable** (không enterprise nào có `relatedCases`).

### ✅ MAJOR-2 — `CTABanner` double padding → ĐÃ SỬA

`src/components/shared/CTABanner.tsx:20-21`:
```tsx
<section className={`py-12 md:py-16 ${primary ? 'bg-primary …' : 'bg-background-alt …'}`}>
  <Container className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
```
- `<section>` **không còn `px-*`**; padding ngang do `<Container>` (px-4 sm:px-6 lg:px-8).
- So với `Section` (`Section.tsx:26` + `Container`): **padding ngang giống hệt** (16/24/32px) ⇒ hết lệch double padding. ✅ (khác biệt duy nhất còn lại là **dọc**: `Section` có thêm `xl:py-24`, CTA chỉ `py-12 md:py-16` — có chủ đích cho banner, không phải lỗi padding ngang).
- Đã dùng `<Container>` primitive ⇒ đồng thời gỡ MINOR-3 (CTABanner viết tay).

### ✅ MAJOR-3 — độ dài dòng text-only → ĐÃ SỬA (một điểm nhỏ còn lại)

| Component | Sau fix | Đánh giá |
|---|---|---|
| `FaqList.tsx:11` | `Section size="prose"` (720) | ✅ chữ thuần 1 cột |
| `SolutionSections.tsx:16` | `Section size="prose"` (720) | ✅ phần text/headline ≤720; ⚠ item grid xem MINOR-2 |
| `FeatureList.tsx:7,11` | `Section` default + `li max-w-[65ch]` | ✅ grid 2 cột không bóp |
| `BenefitList.tsx:6,10` | `Section default` + `li max-w-[65ch]` | ✅ |
| `UseCases.tsx:7` | `Section default` (grid 3 cột) | ✅ giữ nguyên (đã trong ngưỡng) |

⇒ Cách xử lý khớp chỉ đạo user + khuyến nghị round 1 §E. Điểm chưa trọn: item grid trong `SolutionSections` (MINOR-2).

### ✅ MINOR-1 — `Container` 2 class `max-width` xung đột → ĐÃ SỬA

`Container.tsx:23-27,31`: `max-w-container` **đã nằm trong `sizeClass.default`**; mỗi render chỉ còn **1 class max-w** (`default`/`prose`/`narrow`). Hết xung đột thứ tự CSS ⇒ `prose`/`narrow` **deterministic** (đúng như đề xuất round 1). ✅ (giá trị computed chưa đo được — browser block).

### ✅ MINOR-3/4 — Header + wrapper 2 trang khác

- `Header.tsx:49`: dùng `<Container className="flex h-16 items-center justify-between lg:h-[72px]">` ✅ (bỏ `max-w-container` viết tay).
- `solutions/ai/[slug]/page.tsx:56-57`: `xl:max-w-[720px]` **đã bỏ**; giờ là `<div><div className="min-w-0">` (không giới hạn width) ⇒ `Section` full-width ✅ (còn markup thừa — MINOR-5).
- `case-studies/[slug]/page.tsx:62`: **CHƯA bỏ wrapper** — vẫn `mx-auto max-w-[720px]` (chỉ đổi `xl:max-w-[720px]` → `max-w-[720px]`). Xem MINOR-3.

---

## B. Regression checks

| Kiểm tra | Kết quả |
|---|---|
| `Header.tsx:49` cấu trúc thẻ | ✅ `<Container>` mở/đóng khớp (`:49`,`:63`); class nav/h-16 giữ nguyên |
| `CTABanner.tsx:20-28` | ✅ `<section>`→`<Container>`→`</Container>`→`</section>` khớp; không double padding |
| `Hero.tsx:14-36` | ✅ `<section>` nền full-width + `<Container>` con; `<HomeImage>` mở/đóng đúng; `priority` còn |
| `CaseStudyHighlight.tsx` (qua grep) | ✅ vẫn `aspect-[16/10] h-full w-full object-cover`, `width/height` = `CARD_IMAGE_RATIO` (không đổi) |
| `Section.tsx` tương thích ngược | ✅ `size` optional default `default`; `variantStyles` không đổi ⇒ 16 call site cũ không vỡ |
| `FaqList`/`FeatureList`/`BenefitList`/`UseCases`/`SolutionSections` | ✅ thẻ JSX đóng đúng; logic render không đổi (chỉ đổi `size`/class) |
| `HomeImage` 7/7 call site truyền `width`/`height`? | ✅ **7/7 có đủ**: TeamGrid 800×600 · PartnerLogos 160×48 · Hero 1600×1200 · CaseStudyHighlight `CARD_IMAGE_RATIO` · SolutionCard `CARD_IMAGE_RATIO` · ProductCard `CARD_IMAGE_RATIO` · ScreenshotSection 2600×1900 |
| `Footer`/`PageHeader` | ⚠ Không đọc lại trong round này (hết cap tool đọc) + không có diff. Round 1 xác nhận ổn; user notes fix chỉ đụng Header + 3 page. Ghi Residual risk. |
| `package-lock.json` dirty (round 1 MINOR-6) | ⚠ Không xác minh được (shell deny) — Residual risk |

---

## C. Responsive Checklist Gate (diff đụng UI → MANDATORY)

Breakpoints config: `640/768/1024/1280/1536`. Đánh giá **chỉ trên thay đổi round 2**. Browser bị disconnect ⇒ nhiều mục dùng **CSS math**; phần không đo được ghi ở Residual risk (không bỏ trống gate).

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| **Layout** — nền section full-width (FAIL của round 1) | ✅ **OK** | `page.tsx:73` không còn `Container` bao ngoài ở nhánh reachable (`!hasRelated`) |
| Layout — không horizontal scroll | ✅ OK (CSS math) | `Container` chỉ `max-w-*` + `w-full`; grid dùng `minmax(0,1fr)`; cột phải `18.75rem` chỉ bật ở `lg:` |
| Layout — mobile-first (`min-width`) | ✅ OK | Chỉ dùng `sm:`/`md:`/`lg:`/`xl:` |
| Layout — grid `auto-fit`/`minmax`, không cột cứng | ✅ OK | `minmax(0,1fr)_18.75rem`; `sm:grid-cols-2`; `lg:grid-cols-3` |
| Layout — container không fixed `px` | ✅ OK | `max-w-container` 1280 + `px-4 sm:px-6 lg:px-8` (rem) |
| Typography — font `rem`, heading fluid | ✅ OK / N/A | Diff không thêm font-size; không đụng heading |
| Media — ảnh `max-width:100%;height:auto` + aspect | ✅ OK | HomeImage call site giữ `object-cover`/`h-auto w-full`; không đổi trong round 2 |
| Media — `srcset`/`sizes` | ✅ OK | 7/7 call site truyền `sizes`; `next/image` sinh `srcset` |
| Media — video/embed aspect | N/A | Không có |
| Touch — ≥44×44px | ✅ OK | Không đổi; `buttonStyles` min-h-11/12 |
| Touch — nav mobile (hamburger) | ✅ OK | `Header` chỉ đổi wrapper, `MobileNav` nguyên |
| Table — scroll/card mobile | N/A | Không có table |
| Viewport — không `100vh` đơn thuần | ✅ OK | grep nội dung file: không có `vh`/`dvh` |
| `prefers-reduced-motion` | ✅ OK | Diff không thêm motion |
| Không che lỗi bằng `overflow:hidden` | ✅ OK | Chỉ `TeamGrid` (giữ nguyên) |
| **375 / 1440 render thật (không lệch/vỡ/overflow)** | ⚠ **KHÔNG XÁC MINH ĐƯỢC** | Browser disconnected → ghi Residual risk, không tính FAIL |

**Gate kết luận:** không có mục FAIL bằng bằng chứng source-level. Mục "render thật 375/1440" chưa xác minh (blocked, không phải FAIL) → ghi Residual risk.

---

## D. Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| `aislop scan` | **skip** — không cài (`package.json`) + shell deny | — |
| anti-slop / `oxlint` | **skip, oxlint not configured** | repo dùng eslint + `eslint-config-next` |
| `ocr` (open-code-review) | **skip** — không xác minh được (shell deny); không chặn PASS | — |
| AI-readable gate | **OK** (2/6 indicator, dưới ngưỡng 3) | (1) `SolutionSections.tsx:13` comment nói "Grid items 2 cột giữ **default**" nhưng code `:16` dùng `prose` (comment lệch code); (2) numeric literal `2600×1900` (`ScreenshotSection.tsx:14`) + `1600×1200` (`Hero.tsx:28,32`) tại call site — **pre-existing**, không do round 2 |
| ai-friendly-web | **N/A** | Task layout nội bộ, không thêm route/surface public |
| blitzstrike | **N/A** | Không attack surface mới (thuần class CSS/layout) |

---

## Findings

### [MINOR-1] Import `Container` không dùng trong trang enterprise (dead code do fix sinh ra)

- **File:** `src/app/[locale]/solutions/enterprise/[slug]/page.tsx:12`
- **Vấn đề:** `import { Container } from '@/components/ui/Container';` — fix round 2 thay `<Container>` cấp trang bằng `<div>` (`:73`) nhưng **để lại import**. Trong file không còn chỗ nào dùng `Container` (đã đọc toàn bộ 91 dòng). Round 1 `<Container>` còn được dùng ⇒ **import chết này do chính commit fix sinh ra**.
- **Tác động:** `tsconfig` không bật `noUnusedLocals`; `eslint-config-next` thường không bật `no-unused-vars` ⇒ **có thể không fail build/lint**, nhưng là dead code + dấu hiệu dọn dẹp chưa hết. Không xác minh được lint thật (shell deny).
- **Đề xuất:** xoá dòng import 12.

### [MINOR-2] `SolutionSections` dùng `prose` nhưng chứa grid items 2 cột → cột ~320px (~40ch), dưới target 65ch

- **File:** `src/components/solutions/SolutionSections.tsx:13,16,20-22`
- **Vấn đề:** `Section size="prose"` (720) bao trùm cả `items` grid `sm:grid-cols-2` ⇒ tại 720, mỗi cột còn ~320px (≈40ch), **dưới target 65–75ch** cho item dài (round 1 ghi `.mdx` CRM/HRM có chuỗi 150–200 ký tự). Đây đúng là ca user yêu cầu soi: *"prose nhưng thực ra là grid nhiều cột… bóp cột còn ~340px"*.
- **Lưu ý mức độ:** (a) **không phải regression** — trước T1 toàn trang đã ở 720 nên items grid cũng ~340px; (b) đúng theo chỉ đạo user ("SolutionSections → prose"); (c) round 1 §E cũng khuyến nghị prose cho section này. Vì vậy tôi để MINOR, **không tính FAIL**.
- **Thêm:** comment `:13` nói "Grid items 2 cột giữ **default**" nhưng code `:16` dùng `prose` cho cả section → **comment lệch code** (gỡ cả 2 nếu sửa).
- **Đề xuất (chọn 1):** giữ phần text prose cho headline/intro, nhưng render `items` **1 cột** (`grid-cols-1`) trong 720; HOẶC để section `default` + cap headline/intro bằng `max-w-[65ch]`, items grid 2 cột ngoài 1280. Cần **đo thật** (browser) để chốt.

### [MINOR-3] `case-studies/[slug]` CHƯA bỏ wrapper 720 → L2 nền không full-width còn ở `SolutionBlock`; mâu thuẫn với mô tả round 2

- **File:** `src/app/[locale]/case-studies/[slug]/page.tsx:62`
- **Vấn đề:** vẫn `<div className="mx-auto max-w-[720px]">` bọc `ChallengeBlock`/`SolutionBlock`/`ResultBlock`. `SolutionBlock.tsx:4` là `<section className="border-y … bg-background-alt px-6 py-8 …">` → **nền `bg-background-alt` bị bóp còn 720px** (đúng lớp lỗi L2 của round 1). Mô tả round 2 ("case-studies đã bỏ wrapper") **không chính xác** — chỉ đổi `xl:max-w-[720px]` → `max-w-[720px]`.
- **Lưu ý scope:** change request §0 xếp "case study" là **ngoài scope**; T1 AC chỉ hạng chế `xl:max-w-[720px]` ⇒ không tính FAIL cho T1. Đây là gap nhất quán (round 1 MINOR-4 chưa đóng).
- **Đề xuất:** task riêng sau khi chốt pattern MAJOR-1 (nếu cần), hoặc bỏ wrapper cho `SolutionBlock`.

### [MINOR-4] Nhánh `hasRelated` của trang enterprise: grid không có `max-w`/`px` → cột RelatedSolutions dính sát mép viewport khi có data

- **File:** `src/app/[locale]/solutions/enterprise/[slug]/page.tsx:73,82-86`
- **Vấn đề:** khi `hasRelated` (hiện **không reachable**: không enterprise nào có `relatedCases`), grid `lg:grid-cols-[minmax(0,1fr)_18.75rem]` **không có `max-w-container`/padding** → cột phải `RelatedSolutions` chạm mép viewport, không căn theo container. Round 1 đề xuất giữ `mx-auto … max-w-container … px-4` cho grid nhưng fix đã bỏ để giữ `Section` full-width ⇒ đánh đổi chưa được giải quyết dứt điểm.
- **Tác động hiện tại:** = 0 (dead path) → MINOR.
- **Đề xuất:** khi bổ sung `relatedCases` cho enterprise, tách `RelatedSolutions` ra khỏi vùng `Section` (hoặc dùng layout riêng) để vừa giữ nền full-width vừa căn đúng container; ghi chú vào task.

### [MINOR-5] `solutions/ai/[slug]` còn markup thừa (2 div lồng, `min-w-0` vô nghĩa)

- **File:** `src/app/[locale]/solutions/ai/[slug]/page.tsx:56-57`
- **Vấn đề:** `<div><div className="min-w-0">…` — `<div>` ngoài không class (no-op); `min-w-0` không có tác dụng khi cha không phải grid/flex. Dấu vết dọn dẹp lần 1.
- **Đề xuất:** gộp còn 1 fragment/`<>…</>` hoặc 1 div.

### [MINOR-6] Vệ sinh format trong các component vừa sửa

- **File:** `src/components/solutions/FaqList.tsx:8-10`, `SolutionSections.tsx:13-14`, `FeatureList.tsx:4-6`
- **Vấn đề:** comment và JSX bị thụt lề sai (comment ở cột 0 trong thân hàm; `return (`/`<div>` lệch cột). Nếu repo có Prettier/eslint formatting → có thể sinh lint diff. Đọc code khó hơn mong đợi của chuẩn AI-native.
- **Đề xuất:** format lại bằng công cụ của repo.

### [MINOR-7] `ContainerSize` không được export; `Section.tsx` khai lại union

- **File:** `src/components/ui/Container.tsx:3`, `src/components/ui/Section.tsx:8`
- **Vấn đề:** round 1 MINOR-6 **chưa xử lý** — `ContainerSize` vẫn không export; `Section.tsx:8` tự khai lại `'default'|'prose'|'narrow'` → dễ lệch khi thêm size mới.
- **Đề xuất:** `export type ContainerSize` trong `Container.tsx` và import vào `Section`.

**CRITICAL:** không có.
**MAJOR:** không có (3 MAJOR round 1 đã xử lý ở mức source: MAJOR-1 ✅ reachable, MAJOR-2 ✅, MAJOR-3 ✅ với tồn dư nhỏ ở MINOR-2).

---

## Residual risk / Blocked

1. **Blocked (không chặn verdict):** shell `permission.rejected` → không chạy được `git diff`, `lint`, `typecheck`, `build`; không reproduce được evidence của builder; **không xác minh `grep max-w-[1280px] = 0`**, `package-lock.json` dirty, và trạng thái 8 route SSG.
2. **Blocked:** browser **disconnected** → **không đo render thật** cho: `secW == viewport` (MAJOR-1), computed `max-width` của `prose`/`narrow` (MINOR-1), **số ký tự/dòng** `<p>`/`<li>` (MAJOR-3), overflow ngang 375/1440. Đây là các mục user yêu cầu verify bằng browser → **chưa thực hiện được**.
3. **Không có build artifact** (`.next` trống) → không đọc HTML build để xác minh class/padding thực tế.
4. **Chưa đọc lại** `Footer`, `PageHeader`, và toàn bộ call site `Section` (hết cap tool đọc STRICT) → regression chỉ suy luận từ "thay đổi nhỏ + tương thích ngược".
5. **MINOR-2 chưa định lượng:** chưa đo được số ký tự/dòng của `items` trong `SolutionSections` trên CRM (cần browser).

**Mức tin cậy verdict:** MEDIUM — *3 MAJOR đã sửa* xác nhận ở mức **source-level (deterministic từ cấu trúc/class)**, nhưng **không có** xác nhận render/build/lint độc lập.

## Verdict: ✅ PASS (confidence MEDIUM — verify render/build/lint bị block)

- **Không còn CRITICAL/MAJOR:** MAJOR-1 (nền full-width + hết double padding, nhánh reachable) ✅ · MAJOR-2 (`CTABanner` hết double padding, ngang bằng `Section`) ✅ · MAJOR-3 (`FaqList`/`SolutionSections` prose, `FeatureList`/`BenefitList` `max-w-[65ch]`, `UseCases` giữ) ✅. MINOR-1 (`Container` 1 class max-w) ✅ · MINOR-3 Header dùng `Container` ✅ · AI page bỏ wrapper ✅. `HomeImage` **7/7** call site đủ `width`/`height` ✅.
- **Tồn dư không đủ ngưỡng FAIL (MINOR):** import `Container` chết (`MINOR-1`); `SolutionSections` prose + items grid 2 cột ~40ch (`MINOR-2`); `case-studies` còn wrapper 720 (`MINOR-3`, ngoài scope); nhánh `hasRelated` chưa căn container (`MINOR-4`, dead path); markup thừa AI page (`MINOR-5`); format lệch (`MINOR-6`); `ContainerSize` chưa export (`MINOR-7`).
- **Khuyến nghị trước khi user duyệt screenshot (change §5.3):** (a) đo render thật bằng browser ở **375 / 1440** cho `/`, `/about`, `/vi|/en/solutions/enterprise/crm`, `/vi/case-studies/oc-eo-learning` để đóng Residual #2; (b) chạy `npm run lint|typecheck|build` để xác nhận AC "build PASS" + `grep max-w-[1280px] = 0`; (c) quyết định xử lý `MINOR-2` (items grid) và `MINOR-3` (case-studies).
