# Review Report — change `solution-detail-redesign` · Phase 1 · Task 01 · Round 1

Agent: reviewer

- **Commit review:** `1a7f40a` — `feat(solution-detail-t1): Container primitive + sua 4 loi bo cuc chung`
- **Spec nguồn:** `.context/design-spec-solution-detail.md` §1 (L1–L4), §3.1, §4.2/§4.3, §5.5
- **Change request:** `spec/changes/2026-10-11-solution-detail-redesign.md` (T1 + §4 acceptance)
- **Run journal builder:** `.context/runs/t1-layout-fixes.md`
- **Review level:** `STRICT`

## Reason (vì sao STRICT)

- Diff đụng **shared component dùng cho MỌI trang**: `Section`, `HomeImage`, `Header`, `Footer`, `PageHeader`, `CTABanner`, `SolutionCard`, `ProductCard`, `TeamGrid`, `PartnerLogos`, `Hero`, `CaseStudyHighlight` + primitive mới `Container` (nền tảng bề rộng của toàn site).
- 4 trang enterprise **đang live trên prod**; sai layout ở tầng template = regression diện rộng.
- `Container`/`Section` là contract mới mà T2–T5 sẽ dựa vào (schema/width primitive) → phải chốt đúng ngay từ T1.
- Không thuộc nhóm risk đỏ data/DB/auth, nhưng thuộc nhóm "shared component dùng nhiều client" → STRICT hợp lý, không hạ xuống NORMAL.

## Blast radius

| Component/primitive | Phạm vi ảnh hưởng |
|---|---|
| `Container` (mới) → `Section` | **Mọi `<Section>` toàn site** (~mọi trang: home, about, products, solutions/*, blog, case-studies, contact) |
| `Header` (line 48) | Mọi trang/route (2 locale) |
| `Footer` | Mọi trang/route |
| `PageHeader` | Mọi trang có page header |
| `CTABanner` | **7 file page** (home, about, products, solutions/enterprise, solutions/ai, case-studies/[slug], blog/[slug]) = 14 route locale |
| `HomeImage` (7 call site) | Home (Hero, CaseStudyHighlight), about (TeamGrid, PartnerLogos), cards (Solution/Product), solutions (ScreenshotSection) → gián tiếp nhiều trang |
| `page.tsx` enterprise detail | 8 route SSG (vi/en × crm/hrm/lms/dentgo) |

## Verify commands + result

| Lệnh (từ `.context/project-config.md`) | Kết quả |
|---|---|
| `npm.cmd run lint` | **Blocked — `permission.rejected: Permission denied: shell`** (không chạy được từ subagent reviewer; đã dừng, không retry theo Tool Loop Guard) |
| `npm.cmd run typecheck` | **Blocked — permission denied** (như trên) |
| `npm.cmd run build` | **Blocked — permission denied** (không thử lại) → **không có artifact `.next/static/css/*.css`** trong workspace (glob `.next/static/css/*.css` + hidden = 0 file) ⇒ **không thể tự verify F (build output) và thứ tự CSS** |
| `aislop scan --changes --json` | skip — không có `aislop` trong `package.json`; shell cũng bị deny |
| `npx oxlint` | **skip, oxlint not configured** — repo chỉ có `eslint ^8.57.1` + `eslint-config-next` (`package.json:9,25,26`) |
| `ocr` | skip — không xác minh được cài đặt (shell bị deny) |
| grep `max-w-\[1280px\]` trong `src/` | ✅ **0 kết quả** (13 match toàn bộ nằm ở `docs/`, `tasks/`, `spec/`, `.context/`, `skills/` — ngoài `src/`) |
| `git status --short` | sạch, **trừ `package-lock.json` (M, 11 deletions, chưa commit)** |
| `git diff 1a7f40a~1 1a7f40a` | đã đọc toàn bộ 17 file (đúng như `--stat`) |

> Lint/typecheck/build của builder (lint 0 errors · typecheck PASS · build PASS · 8/8 SSG) **reviewer không tự reproduce được** → ghi vào Residual risk, không tính là evidence độc lập.

---

## A. 4 lỗi bố cục — đối chiếu code

### L1 — grid 2 cột, cột phải rỗng → ✅ ĐẠT (phần điều kiện)

`page.tsx:64` `const hasRelated = relatedSolutions.length > 0;` · `page.tsx:83-87` chỉ render cột related khi `hasRelated`. `page.tsx:72-74` `grid-cols-1 lg:grid-cols-[minmax(0,1fr)_18.75rem]` chỉ khi `hasRelated`, ngược lại `grid grid-cols-1 gap-10`. Không còn cột phải rỗng, nội dung không bị bóp `1fr`, căn giữa qua `Container` → đúng tinh thần spec §1 L1. **Nhưng xem MAJOR-1 (hệ quả của chính wrapper `Container` này).**

### L2 — Section bị bóp 720px / nền `background-alt` tràn full-width → ❌ KHÔNG ĐẠT

- `xl:max-w-[720px]` quanh các `Section` đã bị bỏ ở trang enterprise ✅.
- **Nhưng** các `Section` giờ vẫn nằm **bên trong `<Container>` cấp trang** (`page.tsx:72-88` → `<div className="min-w-0">` → `FeatureList`/`BenefitList`/`SolutionSections`/`UseCases`/`FaqList`/`ScreenshotSection`). `Container` = `max-w-container` (1280) + `px-4 sm:px-6 lg:px-8` (`Container.tsx:27`).
- **Hệ quả 1 (nền không full-width):** dải `bg-background-alt` chỉ rộng bằng content-box của Container ≈ 1216px tại viewport ≥1280 (1440 → hai bên thừa ~112px trắng mỗi bên), trong khi mọi section khác trên site (vd `CaseStudyHighlight.tsx:19` — `<section>` là con trực tiếp của page) tràn **100% viewport**. Vi phạm AC "Nền section `background-alt` tràn full-width ở cả 4 trang" và spec §1 L2: *"`Section` luôn là đơn vị ở cấp trang… chỉ nội dung bên trong mới giới hạn độ rộng"*.
- **Hệ quả 2 (double padding):** nội dung text trên trang enterprise bị thụt **2 lớp** padding (Container cấp trang 32px + Container bên trong `Section` 32px = 64px tại lg) so với 32px của các trang khác ⇒ nội dung 4 trang enterprise lệch trục dọc với header/footer của chính nó.
- Comment tại `page.tsx:71` (*"để các `<Section>` bên trong tự tràn full-width"*) **sai sự thật**: `Container` áp `max-w-container` + `px-*`, `Section` không thể tràn full-width khi nằm trong nó.
- Không có browser + build bị chặn → xác minh bằng CSS math (viewport − max-w − padding), phần render thật ghi ở Residual risk. Kết luận vẫn độc lập với browser: class `max-w-container`/`px-*` chắc chắn giới hạn width của con.

### L3 — `max-w-[1280px]` → ✅ ĐẠT (theo AC), ⚠ chưa trọn intent

- grep trong `src/` = **0** ✅ (AC đạt).
- `Header.tsx:48` đổi sang `max-w-container` **viết tay** (không dùng `<Container>`); `CTABanner.tsx:18` vẫn là `<div className="mx-auto flex w-full max-w-container …">` viết tay. Spec L3 nói *"mọi khối dùng `<Container>`, xoá mọi `max-w-[1280px]` / `max-w-container` viết tay"* → còn 2 chỗ viết tay ⇒ chưa đạt mục tiêu "một nguồn sự thật" (xem MINOR-3). `sm:px-2` lệch đã bỏ nhưng lại tạo double padding (MAJOR-2).

### L4 — `HomeImage` hardcode width/height → ✅ ĐẠT (có điều kiện)

- `HomeImage.tsx:45,50` không còn `1200`/`720` hardcode; props `width?`/`height?` được truyền xuyên xuống `next/image`. Không còn magic number trong component ✅.
- **Nguồn tỉ lệ:** call site tự truyền (đúng hướng spec §3.1 — "không đo lại trong code").
- Ràng buộc spec §1 L4 (không `object-cover`, không `aspect-*` cứng cho ảnh v2) **chưa áp**: hiện call site vẫn dùng `object-cover`/`aspect-*`. Điều này **đúng phạm vi T1** (spec §3.1 ghi rõ "Chốt ở T2"), nên không tính finding.
- `onError` → `failed` → `<div role="img" aria-label>` vẫn nguyên (`HomeImage.tsx:35-39`) ✅. `priority` không mất: `Hero.tsx` vẫn truyền `priority` ✅.

---

## B. HOMEIMAGE — audit toàn bộ call site (rủi ro số 1)

`grep -rn "HomeImage" src/` → **7 call site** (ngoài file định nghĩa). **7/7 đều truyền `width` + `height`** ✅ — không có call site nào quên.

| # | Call site | width×height | Khung CSS tại chỗ | Khớp tỉ lệ? |
|---|---|---|---|---|
| 1 | `Hero.tsx:28-31` | 1600×1200 (1.333) | `aspect-[4/3]` + `object-cover` | ✅ khớp |
| 2 | `CaseStudyHighlight.tsx:24` | 1600×1000 (1.6) | `aspect-[16/10]` + `object-cover` | ✅ khớp |
| 3 | `cards/SolutionCard.tsx:19` | `CARD_IMAGE_RATIO` 1600×1000 (1.6) | `cardImageClass` = `aspect-[16/10]` + `object-cover` | ✅ khớp |
| 4 | `cards/ProductCard.tsx:17` | `CARD_IMAGE_RATIO` 1600×1000 (1.6) | `cardImageClass` = `aspect-[16/10]` + `object-cover` | ✅ khớp |
| 5 | `about/TeamGrid.tsx:10` | 800×600 (1.333) | `aspect-[4/3]` + `object-cover` | ✅ khớp |
| 6 | `about/PartnerLogos.tsx:28` | 160×48 (3.33) | `h-12 w-auto object-contain` (không aspect cứng) | ✅ không méo (`object-contain`) — tỉ lệ hint chỉ ảnh hưởng chiều rộng hộp trước khi ảnh load |
| 7 | `solutions/ScreenshotSection.tsx:14` | 2600×1900 (1.368) | `h-auto w-full` (không crop) | ✅ render đúng tỉ lệ file (h-auto); hint 1.368 gần ảnh 2880×2100 nhưng lệch ảnh cao (2880×3524 ≈ 0.82) → chỉ ảnh hưởng CLS trước load (MINOR-5) |

- **Không call site nào truyền sai tỉ lệ so với khung CSS của nó** → không có méo/CLS do mismatch khung.
- `priority`: chỉ `Hero.tsx` (đúng spec §3.1: chỉ ảnh hero) ✅; không bị mất.
- Fallback `onError`/`failed`: còn nguyên ✅.
- **Rủi ro API:** `width?`/`height?` là optional (`HomeImage.tsx:9,13`) trong khi `next/image` **bắt buộc** width/height. Call site mới quên truyền sẽ **compile OK nhưng crash runtime** (`Image … missing required width`) — xem MINOR-2.

---

## C. CONTAINER — tính đúng đắn

| Mục | Kết quả |
|---|---|
| `size` mapping | `default` → `''` (dùng `max-w-container` = 1280 từ `tailwind.config.ts:38`) ✅; `prose` → `max-w-[720px]` ✅; `narrow` → `max-w-[520px]` ✅ — đúng spec §1 L2 |
| `as` prop | ✅ `as?: ElementType`, mặc định `div`; hoạt động (`<Tag className=…>`) |
| Class base | `mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8` — khớp 100% class cũ của `Section`/`PageHeader`/`Footer` ✅ (không gây regression lớp padding cho các nơi chuyển sang) |
| ⚠ Xung đột class | `sizeClass.prose/narrow` phát sinh **class `max-width` thứ hai** cùng element (`max-w-container` + `max-w-[720px]`) → giá trị thắng phụ thuộc **thứ tự trong CSS output của Tailwind**, không phụ thuộc thứ tự trong attribute. Chưa verify được (build bị chặn) ⇒ `prose`/`narrow` có thể thành no-op. Xem MINOR-1 |
| Lạm dụng `prose`/`narrow` | ❌ Chưa dùng ở đâu (0 call site) → **ngược lại đang thiếu**: `FaqList` (`FaqList.tsx:9`), `SolutionSections` (`SolutionSections.tsx:15`) là chữ thuần, **cần** `prose` nhưng đang để `default` (xem MAJOR-3). `FeatureList`/`BenefitList`/`UseCases` là grid → không dùng `prose` toàn section |
| `Section` tương thích ngược | ✅ `size` optional, default `'default'`; class render y hệt trước T1 ⇒ call site cũ không vỡ |

---

## D. REGRESSION — các trang khác dùng chung component

| File | Kết quả |
|---|---|
| `Header.tsx:48` | ✅ giữ nguyên `h-16 … lg:h-[72px]`, `flex items-center justify-between`, `px-4 sm:px-6 lg:px-8`; chỉ đổi hằng số width → không regression. (Còn viết tay `max-w-container` — MINOR-3) |
| `Footer.tsx:19,28` | ✅ `<footer className="bg-background-alt">` + `<Container className="py-12 md:py-16">`; thẻ đóng `</Container>` khớp; padding = `px-4 py-12 sm:px-6 md:py-16 lg:px-8` y hệt trước → không regression |
| `Hero.tsx:15,34` | ✅ `<div>` → `<Container className="grid …">`; thẻ đóng khớp; `md:grid-cols-[1.1fr_0.9fr]`, `gap-10 xl:gap-16` giữ nguyên. **Band nền `bg-background` của `<section>` vẫn full-width** (Container là con của section) ✅ |
| `CaseStudyHighlight.tsx:20,32` | ✅ đúng pattern chuẩn: `<section className="bg-background-alt …">` → `<Container>`; đóng thẻ khớp; nền tràn full-width ✅ |
| `PageHeader.tsx:16,23` | ✅ `header` giữ `py-12 md:py-16` + `text-center` khi centered; `Container` cấp lại `max-w-container px-4 sm:px-6 lg:px-8` ⇒ y hệt bản cũ; inner `mx-auto max-w-3xl` giữ nguyên |
| `CTABanner.tsx:17-18` | ❌ **Double padding** — xem MAJOR-2 |
| `Section.tsx` prop `size` | ✅ optional, default `default`; `variantStyles` không đổi; call site cũ (16 chỗ dùng `<Section`) không bị phá |
| Trang dùng `Section` gián tiếp | ⚠ Nội dung chữ ở 1280 rộng hơn trước (trước bị 720) → xem MAJOR-3 |
| Ngoài scope | ⚠ `case-studies/[slug]/page.tsx:61` + `solutions/ai/[slug]/page.tsx:57` vẫn còn `xl:max-w-[720px]` bọc `Section` (cùng lớp lỗi L2) — xem MINOR-4 |

---

## E. RESIDUAL #2 — chữ kéo dài 1280px (đánh giá hướng sửa, KHÔNG sửa code)

**Đánh giá hướng user đề ra: ĐÚNG và khớp spec** — spec §1 L2 chính là ví dụ:

```tsx
<FeatureList />      {/* <Section> full-width + <Container max-w-[720px]> bên trong */}
```

và §4.3 (`Feature` không ảnh → `Container size="prose"`), §5.5 (FAQ → `Container size="prose"`).
Vấn đề hiện tại (số đo ước lượng theo CSS math tại viewport 1280, content-box ≈ 1216px, 1ch ≈ 8px):

| Component | Cấu trúc | Measure hiện tại | Trước T1 | Khuyến nghị |
|---|---|---|---|---|
| `FaqList.tsx:9-19` | 1 cột, `<p>` không `max-w` | **~145ch** ❌ | ~82ch (trong 720) | `Section` full-width + `Container size="prose"` (đúng spec §5.5) — ưu tiên #1 |
| `SolutionSections.tsx:15` | 1 cột, `intro` đã có `max-w-prose` nhưng `items` grid 2 cột | ~145ch cho tiêu đề/khối; item ~70ch | ~82ch | `Container size="prose"` cho section chữ thuần (giữ grid 2 cột bên trong 720 → mỗi cột ~340px ≈ 42ch, hơi hẹp: nếu thấy hẹp thì dùng `default` + `max-w-[65ch]` cho `li`) |
| `FeatureList.tsx:5` | grid `sm:grid-cols-2` | mỗi cột ~**70-75ch** | ~82ch (1 cột trong 720) | **KHÔNG** dùng `prose` (720 → mỗi cột chỉ ~340px). Giữ `default`, thêm `max-w-[65ch]` cho từng `li` |
| `BenefitList.tsx:5` | grid `sm:grid-cols-2`, `text-body-lg` | ~70-75ch | như trên | như `FeatureList` |
| `UseCases.tsx:7` | grid 3 cột (`lg:grid-cols-3`) | ~48ch ✅ | ~48-60ch | **Giữ nguyên** — đã trong ngưỡng |
| `ScreenshotSection.tsx:9` | có ảnh | — | — | giữ `default` 1280 ✅ (đúng "section có ảnh → default") |

**Canh đối chiếu grid 2 cột cần lưu ý:**
1. Nếu chỉ cap `li` mà **không** cap container, 2 cột sẽ **lệch chiều cao/độ dài dòng** giữa các item → dùng cùng một `max-w-[65ch]` cho mọi `li` (không cap lẻ) để hai cột đối xứng.
2. `max-w-[65ch]` chỉ chặn được khi **cột ≥ 65ch**; ở 1280 cột ≈ 70-75ch nên hiệu lực ~đúng, nhưng ở viewport 1440 cột ≈ 78-83ch → cap vẫn cần.
3. `prose` + grid 2 cột = **mỗi cột ~340px** → quá hẹp cho câu dài của CRM/HRM (`.mdx` có chuỗi 150-200 ký tự) ⇒ quy tắc "text-only → prose" chỉ nên áp cho **section 1 cột**; grid 2 cột theo hướng user ("mỗi cột ~65ch") là đúng, **không** áp `prose` cả section.
4. **Chặn kỹ thuật:** phải sửa MINOR-1 trước, nếu không `size="prose"` có thể là no-op.

---

## F. BUILD OUTPUT — ❌ KHÔNG VERIFY ĐƯỢC (Blocked)

- Không có `.next/` (glob `.next/static/css/*.css` + hidden = 0 file) và shell bị deny ⇒ **không xác minh được**: 8/8 route SSG, HTML thật có còn class 720px, grid 2 cột rỗng, thứ tự CSS của `max-w-*`.
- Về mặt code/JSX: 8 route được sinh từ `generateStaticParams()` (`page.tsx:29-31`) → không có thay đổi nào mở rộng/thu hẹp tập route; không thấy khả năng vỡ SSG từ diff này (chỉ đổi class + thêm wrapper).
- Claim của builder ("8/8 SSG", "grid2col=False", "nền tràn full-width") **không được reviewer reproduce**; riêng claim "nền tràn full-width" **mâu thuẫn với cấu trúc JSX** đã đọc (MAJOR-1).

---

## Responsive Checklist Gate (diff đụng UI → MANDATORY)

Đánh giá chỉ trên thay đổi trong commit `1a7f40a`. Breakpoints: `375 / 768 / 1280` (config: `640/768/1024/1280/1536`). Không có browser → xác minh bằng CSS math; phần không xác minh ghi ở Residual risk.

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Không horizontal scroll (document ≤ clientWidth) | OK (CSS math) | `Container` chỉ dùng `max-w-*` (không width cố định) + `w-full` (`Container.tsx:27`); grid 2 cột dùng `minmax(0,1fr)` (`page.tsx:73`); grid con `grid-cols-1` ở mobile |
| Mobile-first (`min-width` media query) | OK | Chỉ dùng `sm:`/`md:`/`lg:`/`xl:` (min-width); không có `max-width` query trong diff |
| Grid dùng `auto-fit`/`minmax`, không cột cố định | OK | `minmax(0,1fr)_18.75rem` (`page.tsx:73`), `md:grid-cols-2`/`lg:grid-cols-3`; cột fixed 18.75rem chỉ bật ở `lg:` và chỉ khi có data |
| Container không fixed `px` | OK | `max-w-container` = 1280px, `px-4 sm:px-6 lg:px-8` (rem-based Tailwind) — không `width: 1280px` |
| Font-size dùng `rem` | OK | Diff không thêm font-size; token `--text-*` + Tailwind |
| Heading fluid (`clamp()`) | N/A | Diff không đụng typography heading |
| Spacing theo scale | OK | `gap-10 xl:gap-16`, `py-12 md:py-16 xl:py-24` (scale Tailwind, không magic px) |
| Ảnh `max-width:100%;height:auto` + `aspect-ratio` | OK | `TeamGrid` `aspect-[4/3]` + `object-cover`; `PartnerLogos` `max-w-full object-contain`; `ScreenshotSection` `h-auto w-full` |
| Ảnh quan trọng có `srcset`/`sizes` | OK | Mọi call site đều truyền `sizes`; `next/image` tự sinh `srcset` |
| Video/embed `aspect-ratio` | N/A | Không có video/embed trong diff |
| Touch target ≥ 44×44px | OK | Không đổi: `buttonStyles` (`min-h-11/12`), header link `min-h-11`, RelatedSolutions link `min-h-11` |
| Nav có hamburger/dropdown mobile | OK | `Header` không đổi cấu trúc nav (chỉ đổi class width) |
| Table có scroll wrapper/card layout | N/A | Không có table trong diff |
| Không dùng `100vh` đơn thuần | OK | grep diff: không có `vh`/`dvh` |
| `prefers-reduced-motion` | N/A | Diff không thêm motion; rule global nằm ngoài diff |
| Không che lỗi bằng `overflow:hidden` | OK | Chỉ `TeamGrid` `overflow-hidden` (khung portrait có chủ đích, giữ nguyên) |
| **Layout — nền section full-width** | **FAIL** | `page.tsx:72-88` bọc `Section` trong `Container` (`max-w-container` + `px-*`) → `bg-background-alt` không tràn full-width, không đạt AC. Xem MAJOR-1 |

**Gate kết luận:** có mục FAIL ⇒ verdict `FAIL` (trùng MAJOR-1).

---

## Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| `aislop scan` | **skip** — không cài (`package.json` không có `aislop`) và shell bị deny | `package.json:9,25,26` |
| anti-slop / `oxlint` | **skip, oxlint not configured** | Repo dùng `eslint .` (`package.json:9`) + `eslint-config-next` |
| `ocr` (open-code-review) | **skip** — không xác minh được cài đặt (shell deny); không chặn PASS theo luật | — |
| AI-readable gate | **OK** — 2/6 indicator (dưới ngưỡng 3) | (1) `page.tsx:71` comment **mô tả sai sự thật** ("Section bên trong tự tràn full-width"); (2) `ScreenshotSection.tsx:14` + `Hero.tsx:29` numeric literal 2600×1900 / 1600×1200 tại call site (không dùng hằng, dù đã có `CARD_IMAGE_RATIO`). Không có: hàm >50 dòng, file >300 dòng, tên mơ hồ, indirection >3, comment WHAT, README/ARCHITECTURE lệch |
| ai-friendly-web | **N/A** | Task layout nội bộ, không thêm route/public surface mới; không đụng `robots.txt`/`sitemap`/`llms.txt` |
| blitzstrike | **N/A** | Không có attack surface mới (thuần class CSS/layout; không input/auth/API) |

---

## Findings

### [MAJOR-1] L2 chưa đạt: `Section` vẫn bị bọc trong `Container` cấp trang → nền `background-alt` không tràn full-width + double padding

- **File:** `src/app/[locale]/solutions/enterprise/[slug]/page.tsx:72-88` (đặc biệt `:72-74`, `:75`, `:76-81`) + hệ quả lên `FeatureList`/`BenefitList`/`SolutionSections`/`UseCases`/`FaqList`/`ScreenshotSection`.
- **Vấn đề:** các `<Section>` (mỗi cái tự có `<section>` + `bg-*` full-width + `<Container>` bên trong) bị đặt trong 1 `Container` (1280 + px). Kết quả: (a) dải nền `bg-background-alt` chỉ rộng ~1216px thay vì full viewport → thừa gutter trắng 2 bên, khác biệt rõ với mọi trang khác trên site (vd `CaseStudyHighlight.tsx:19`); (b) nội dung bị thụt 2 lớp padding (64px thay vì 32px tại lg) → lệch trục với header/footer của chính trang.
- **Vi phạm:** AC "Nền section `background-alt` tràn full-width ở cả 4 trang"; spec §1 L2 ("`Section` luôn là đơn vị ở cấp trang"); comment `page.tsx:71` sai sự thật.
- **Đề xuất sửa:** khi **không** có related, **không** bọc trong `Container` — trả các component `Section` về cấp page:
  ```tsx
  {hasRelated ? (
    <div className="mx-auto grid w-full max-w-container grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_18.75rem] lg:px-8 xl:gap-16">
      <div className="min-w-0">{/* sections */}</div>
      <div className="pb-12 lg:py-12"><RelatedSolutions … /></div>
    </div>
  ) : (
    <>{/* sections trực tiếp, KHÔNG bọc Container */}</>
  )}
  ```
  (nhánh `hasRelated` hiện chưa có data ở cả 4 trang → không cần tối ưu vội, nhưng ghi chú lại vì cùng vấn đề nền sẽ tái xuất khi có data). Xoá/sửa comment `:71` cho đúng.

### [MAJOR-2] `CTABanner` double padding — regression trên shared component (7 trang)

- **File:** `src/components/shared/CTABanner.tsx:17-18`
- **Vấn đề:** `<section className="px-4 py-12 md:py-16 …">` **+** `<div className="mx-auto … px-4 sm:px-6 … lg:px-8">` ⇒ nội dung thụt **32px (mobile) / 48px (lg)**; các section khác cùng trang chỉ 16px / 32px (`Section` → `Container`). Trước T1 nội dung thụt 16px / 24px (`sm:px-2`). Tức là commit này **làm lệch tăng thêm** và lệch cả ở mobile (trước đó mobile khớp 16px).
- **Phạm vi:** `about`, `page` (home), `products`, `case-studies/[slug]`, `blog/[slug]`, `solutions/enterprise`, `solutions/ai` = 14 route locale (grep `<CTABanner` = 7 file).
- **Đề xuất sửa:** bỏ `px-4` ở `<section>`, để `Container` lo padding — tốt nhất dùng luôn primitive cho đúng spec L3:
  ```tsx
  <section className={`py-12 md:py-16 ${primary ? 'bg-primary text-text-inverse' : 'bg-background-alt text-text-primary'}`}>
    <Container className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
  ```

### [MAJOR-3] Text-only sections ở 1280 → độ dài dòng vượt 65-75ch (residual #2, spec §1 L2 chưa áp)

- **File:** `src/components/solutions/FaqList.tsx:9-19` (~145ch), `SolutionSections.tsx:15-17` (~145ch), `FeatureList.tsx:5-7` / `BenefitList.tsx:5-7` (mỗi cột ~70-75ch, biên), `UseCases.tsx:7` (OK ~48ch).
- **Vấn đề:** bỏ wrapper 720 làm measure chữ tăng ~1.8×; spec §1 L2 (ví dụ code), §4.3, §5.5 và chỉ đạo user đều yêu cầu `prose` cho khối chữ thuần. Chưa được áp (0 call site `size="prose"`).
- **Đề xuất:** xem bảng ở mục E — ưu tiên `FaqList` + `SolutionSections` → `Container size="prose"`; `FeatureList`/`BenefitList` giữ `default` + `max-w-[65ch]` cho từng `li` (không áp `prose` cho grid 2 cột). **Phải sửa MINOR-1 trước** để `prose` chắc chắn hoạt động.

### [MINOR-1] `Container` sinh 2 class `max-width` xung đột → `size="prose"|"narrow"` có thể là no-op

- **File:** `src/components/ui/Container.tsx:22-23,27`
- **Vấn đề:** base luôn có `max-w-container`, rồi thêm `max-w-[720px]`/`max-w-[520px]` cùng element. Giá trị thắng do **thứ tự khai báo trong CSS output** của Tailwind quyết định, không do thứ tự class → không deterministic, phá mục tiêu "nguồn sự thật duy nhất".
- **Đề xuất sửa (deterministic, mỗi render chỉ 1 class max-w):**
  ```ts
  const sizeClass = { default: 'max-w-container', prose: 'max-w-[720px]', narrow: 'max-w-[520px]' } as const;
  const classes = ['mx-auto','w-full','px-4','sm:px-6','lg:px-8', sizeClass[size], className].filter(Boolean).join(' ');
  ```
- **Cần verify:** render HTML/CSS thật sau khi sửa (bước build hiện bị chặn).

### [MINOR-2] `HomeImage` `width`/`height` optional trong khi `next/image` bắt buộc

- **File:** `src/components/shared/HomeImage.tsx:9,13,45,50`
- **Vấn đề:** call site mới quên truyền → TypeScript không báo, nhưng runtime `next/image` throw "missing required width/height" (hoặc CLS nếu dần chuyển sang `fill`). Hiện 7/7 call site đều truyền OK (không phải defect đang hoạt động).
- **Đề xuất:** giữ `width: number; height: number` **required** đến khi T2 refactor sang `maxH/maxW`/`fill` (đúng tinh thần "reviewer kiểm tra" trong journal); nếu vẫn để optional thì thêm default hợp lý + cảnh báo runtime.

### [MINOR-3] `Header`/`CTABanner` vẫn viết tay `max-w-container` (chưa dùng `Container`)

- **File:** `src/components/layout/Header.tsx:48`, `src/components/shared/CTABanner.tsx:18`
- **Vấn đề:** spec L3 yêu cầu "mọi khối dùng `<Container>`, xoá mọi `max-w-container` viết tay" → 2 chỗ còn lại tái lập đúng tình trạng hai nguồn độc lập mà L3 muốn xoá.
- **Đề xuất:** `Header` dùng `<Container className="flex h-16 items-center justify-between lg:h-[72px]">`; `CTABanner` xem MAJOR-2.

### [MINOR-4] Lỗi L2 cùng loại còn nguyên ở 2 trang khác

- **File:** `src/app/[locale]/case-studies/[slug]/page.tsx:61`, `src/app/[locale]/solutions/ai/[slug]/page.tsx:57` (`xl:max-w-[720px]` bọc `Section`).
- **Vấn đề:** spec §1 nói fix ở tầng template "áp cho MỌI trang"; T1 chỉ sửa enterprise + bỏ AC riêng cho case-study/AI ở §0 (ngoài scope redesign). Không vi phạm AC của T1 nhưng là gap nhất quán.
- **Đề xuất:** task riêng (hoặc mở rộng T1) — ưu tiên sau khi chốt cách xử lý MAJOR-1 để dùng đúng một pattern.

### [MINOR-5] `ScreenshotSection` hint tỉ lệ 2600×1900 không đại diện ảnh cao

- **File:** `src/components/solutions/ScreenshotSection.tsx:14`
- **Vấn đề:** `h-auto w-full` → không méo (render đúng tỉ lệ file), nhưng hint 1.368 lệch ảnh cao (2880×3524 ≈ 0.82 → lệch ~66%) ⇒ chỗ giữ layout trước khi ảnh load bị sai → CLS nhẹ. Nên là việc của T4 (đã có `docs/screenshots-mapping.md`).
- **Đề xuất:** khi T4 gắn ảnh v2, truyền `width/height` theo tỉ lệ đo trong mapping (hoặc dùng cơ chế §3.1).

### [MINOR-6] Vệ sinh diff

- `src/components/ui/Container.tsx:32` và `src/components/shared/HomeImage.tsx:53` **thiếu newline cuối file** (`\ No newline at end of file` trong diff).
- `package-lock.json` đang **dirty** (11 deletions, chưa commit) trong working tree — không thuộc commit T1, cần xác nhận nguồn gốc trước khi commit kế tiếp (tránh lẫn vào diff T2).
- `src/components/ui/Section.tsx:8` khai lại union `'default' | 'prose' | 'narrow'` thay vì export type từ `Container` → dễ lệch khi thêm size mới. Đề xuất `export type ContainerSize` trong `Container.tsx` và import.

**CRITICAL:** không có.

---

## Residual risk / Blocked

1. **Blocked:** `npm.cmd run lint|typecheck|build` bị `permission.rejected` từ subagent reviewer → không reproduce được evidence của builder và **không verify được F (build output), thứ tự CSS `max-w-*`, và trạng thái 8 route SSG**. Không retry theo Tool Loop Guard.
2. Không có browser ⇒ mọi kết luận layout là **CSS math** trên class thật; chưa xác nhận bằng render thật (screenshot 375/1440 theo §5.3 change request vẫn cần trước khi user duyệt).
3. Chưa verify: hành vi thắng/thua của `max-w-container` vs `max-w-[720px]` (MINOR-1) — cần 1 lần build + đọc CSS output.
4. Chưa verify: `prefers-reduced-motion` global (ngoài diff, không đọc lần này) — diff không thêm motion nên rủi ro thấp.

## Verdict: ❌ FAIL

- Có **3 MAJOR** thuộc nhóm "shared component dùng nhiều client" (MAJOR-1 nền section không full-width + double padding trên 8 route enterprise; MAJOR-2 double padding `CTABanner` trên 14 route locale; MAJOR-3 readability text-only sections) + mục **FAIL** trong Responsive Checklist Gate (cùng MAJOR-1).
- Các phần đạt: L1, L3 (grep `max-w-[1280px]` = 0), L4 (bỏ hardcode; **7/7 call site `HomeImage` truyền đủ `width`/`height`, không méo, `priority` + fallback còn nguyên**), `Section`/`Footer`/`Header`/`PageHeader`/`Hero`/`CaseStudyHighlight` không regression, `Container` mapping `size` đúng spec.
- **Đường ra để PASS:** sửa MAJOR-1 (bỏ wrapper `Container` khi `!hasRelated` + sửa comment) · MAJOR-2 (bỏ `px-4` ở `<section>` của `CTABanner`, dùng `Container`) · MAJOR-3 (áp `prose` cho `FaqList`/`SolutionSections`; `max-w-[65ch]` cho cột `FeatureList`/`BenefitList`) · MINOR-1 (đưa `max-w-container` vào `sizeClass.default`) — sau đó rerun reviewer round 2 kèm HTML/CSS build thật.
