# Review — change/oc-eo-case-study-showcase — Phase 1 / Task 01 — Round 1

Agent: reviewer

## Review level: NORMAL

## Reason
Change MODIFY, chỉ UI + content (1 route chi tiết `/case-studies/oc-eo-learning` + `/en`, card ảnh ở `/case-studies`, 1 khối ở `/`). Có đụng type dùng chung (`CaseStudy`) và component dùng chung (`CaseStudyCard`, `page.tsx` chi tiết) nhưng chỉ thêm field optional + nhánh mới. Không đụng API/auth/DB/schema/hạ tầng → không thuộc danh sách STRICT. Có rủi ro "Tailwind không sinh CSS âm thầm" (đã gặp ở change hero) → soi CSS build artifact thật.

## Blast radius
- `src/content/types.ts` — `CaseStudy.cover?/layout?/showcase?` (optional → không phá dữ liệu cũ).
- `src/app/[locale]/case-studies/[slug]/page.tsx` — nhánh `layout==='showcase' && showcase` → `ShowcaseLayout`; nhánh default (case nha khoa) giữ nguyên.
- `src/components/cards/CaseStudyCard.tsx` — dùng ở `case-studies/page.tsx`, `CaseStudyFilter`, `RelatedStudies`: `cover ?? gallery[0]`.
- `src/components/case-studies/showcase/*` (8 file mới), `src/content/case-studies/{vi,en}/oc-eo-learning.mdx`, `src/content/home.ts` (`featuredCase.image/alt`), `public/images/cases/oc-eo/*.jpg` (6 ảnh).
- **Trạng thái git thực tế khác brief:** change đã được **commit** ở `1e90308` ("feat(case-studies): them showcase…"), không còn là uncommitted. Working tree hiện có thêm diff của session khác (site-wide motion) trên `ShowcaseHero.tsx` (split-line, `data-motion-off`) và `ShowcaseOverview.tsx` (`CountUp`) — ngoài scope task này.

## Verify commands + result
| Command | Result |
|---|---|
| `git log` / `git show 1e90308 --stat` | Commit chứa cả file ngoài scope (xem MAJOR-4). |
| `git status --short` | Dirty ngoài scope: layout/not-found/page, globals.css, Header/MobileNav, CTABanner, PageHeader, Reveal, `src/components/motion/`, `src/lib/motion/`, `template.tsx`… (session motion) + 2 file showcase. |
| CSS build artifact `.next-build/static/css/app/layout.css` (có chứa class showcase như `via-[#0b6b58]/90` → build sau change) | Arbitrary values đều sinh CSS: `[mask-image:…]`, `size-[18px]`, `[scrollbar-width:none]`, `[&::-webkit-scrollbar]:hidden`, `lg:w-[calc((100%-3rem)/4)]`, `w-[78%]`, `saturate-[1.1]`, `divide-border`, `bg-[radial-gradient(…)]`, grid `minmax(0,11fr) minmax(0,13fr)` / `5fr 5fr 2fr`, `outline-focus`, `duration-slow`. **KHÔNG sinh:** `border-border/70`, `border-border/60`, `bg-primary/40`, `border-accent/80` (xem MAJOR-1). |
| vi/en frontmatter key parity (python) | **PASS** — 109/109 key, cùng thứ tự. |
| `tsc --noEmit`, eslint changed files, render 1440/390 | Builder báo PASS — reviewer không chạy lại. |
| `semgrep`, `aislop scan --changes` | **skip, not installed** trong shell reviewer (không bịa score). Không có input người dùng/API mới; `dangerouslySetInnerHTML` JSON-LD dùng lại pattern cũ có escape `<`. |

## Verdict: ❌ FAIL

## Summary
Code showcase gọn, type-safe, i18n đầy đủ, không regress layout default/case nha khoa, a11y nền tốt. Nhưng có 4 MAJOR: 4 class opacity-modifier trên màu CSS-var không sinh CSS (lặp lại lỗi đã gặp ở round 2 hero), carousel "Hình ảnh khu di tích" dùng ảnh crop AI mà không ghi là minh hoạ (BR-004), lệch R-08/Screen 9 chưa ghi nhận spec/task, và commit `1e90308` gộp nhiều file ngoài scope.

## Findings

### ✅ Good
- `types.ts:151-194` — field mới đều optional, có doc comment; `ShowcaseIcon` union → `Record<ShowcaseIcon, ReactNode>` trong `icons.tsx:4` exhaustive.
- `page.tsx:59` — guard kép `layout==='showcase' && study.showcase` → thiếu block thì fallback default, không crash. JSON-LD (BreadcrumbList + Article) giữ nguyên cả 2 nhánh; `RelatedStudies` vẫn render ở showcase.
- `CaseStudyCard.tsx:16` — `cover ? {src} : gallery[0]`: case nha khoa (không có `cover`) không đổi; 3 consumer không phải sửa.
- BR-004: eyebrow "Phương án đề xuất · 2026", cột "Kết quả kỳ vọng", stat "tham chiếu (tùy khảo sát và phê duyệt)", VMS mock `aria-hidden` + caption "Giao diện VMS minh hoạ — dữ liệu cảnh báo là giả lập" (`ShowcaseTechnology.tsx:54,84`; en tương ứng). Hero alt ghi rõ "Minh hoạ".
- `ShowcasePhotos.tsx` — hooks đúng thứ tự (`useRef` trước early return L13-14); nút `aria-label` + `size-11` (44px) + `focus-visible:outline`; reduced-motion: `behavior: 'auto'` + global `scroll-behavior: auto !important` (`globals.css:271-279`); track `tabIndex=0` cuộn được bằng bàn phím, có global `*:focus-visible`.
- Heading: 1 `h1` (hero) → các `h2`; ảnh trang trí `alt=""`/`aria-hidden`; `next/image` hero width/height khớp file thật 1590×989, `priority`.
- vi/en parity đầy đủ; anchor `#giai-phap` / `#solution` khớp `technology.id` từng locale; link nội bộ dùng `Link` của next-intl (Technology, CTA).
- Home `featuredCase` vi+en đổi ảnh + alt mô tả đúng là minh hoạ.

### ❌ Issues

- **[MAJOR-1] Tailwind opacity modifier trên màu `var(--color-*)` không sinh CSS** — theme màu khai báo `'var(--color-…)'` (không `<alpha-value>`) nên `/NN` bị JIT bỏ qua; xác nhận bằng CSS build (0 match):
  - `ShowcaseTechnology.tsx:48` `bg-primary/40` → 3 đường nối node→VMS **vô hình** (sơ đồ mất connector).
  - `ShowcaseTechnology.tsx:66` `border-accent/80` → vòng tròn trên bản đồ dùng màu border mặc định preflight thay vì teal.
  - `ShowcaseOverview.tsx:13,28` `border-border/70`, `ShowcaseVision.tsx:24` `border-border/60` → rơi về border-color mặc định (gần giống, nhưng không đúng ý).
  - *Fix:* như round-2 hero: `bg-primary opacity-40` cho line; `border-accent` (+ `opacity-80` nếu cần) hoặc arbitrary `border-[rgb(33_217_173/0.8)]`; `border-border`. Hoặc (task riêng) đổi token sang `rgb(var(--…)/<alpha-value>)`.

- **[MAJOR-2] BR-004 / trung thực ảnh — carousel trình bày ảnh crop từ hình AI như ảnh chụp khu di tích** — `oc-eo-learning.mdx` (vi/en) `photos`: tiêu đề "Không gian di sản Óc Eo – Ba Thê" / eyebrow "Hình ảnh khu di tích" / "Site gallery"; alt mô tả như ảnh thật ("Toàn cảnh các nền móng gạch cổ…", "…núi Ba Thê phía sau khu di tích"). 5 ảnh đều crop từ `hero.jpg` (AI illustration) — không có caption/nhãn "minh hoạ". `ShowcaseVision`/`ShowcaseCTA` cũng dùng các crop này (trang trí, chấp nhận được).
  - *Fix:* thêm caption dưới carousel kiểu "Hình minh hoạ — sẽ thay bằng ảnh thực địa" (vi/en) + alt bắt đầu bằng "Minh hoạ…"/"Illustration of…"; hoặc ẩn carousel đến khi có ảnh thật. Ghi nguồn/bản quyền ảnh trong change doc.

- **[MAJOR-3] Lệch R-08 / design-spec Screen 9 chưa được ghi nhận** — `.context/design-spec.md:399-431` + `SPECIFICATIONS.md:105-106` yêu cầu: PageHeader h1 = tên dự án, **MetaBar `<dl>` (Khách hàng · Lĩnh vực · Năm)**, Challenge→Solution→Result, ImageGallery, Related, CTABanner(alt). Biến thể showcase: không MetaBar (client/sector/year không còn hiển thị), h1 là slogan "Bảo tồn di sản bằng công nghệ AI" (tên dự án chỉ ở `subtitle` <p>), 3 sơ đồ SVG `gallery` (kiến trúc 3 tầng / Edge / luồng xác minh — nội dung R-08a) không còn hiển thị, câu disclaimer "Đây là phương án đề xuất, không phải kết quả triển khai đã xác nhận" trong `result` không render, CTABanner thay bằng thẻ. Thêm: eyebrow trên heading + gradient text + `backdrop-blur-sm` (`ShowcaseHero.tsx:23,26`, `ShowcaseVision.tsx:24`) thuộc danh sách "Refuse" của craft-floor — chấp nhận được vì user yêu cầu khớp mockup, nhưng phải ghi exemption. Không có `spec/changes/*oc-eo*`, không có `tasks/change-oc-eo-case-study-showcase/`.
  - *Fix:* tạo change doc + task file; cập nhật Screen 9 thêm biến thể `layout: showcase` (hero/stats/pillars/technology/photos/vision/CTA, ghi rõ MetaBar & gallery bỏ có chủ ý hoặc bổ sung lại meta dạng `<dl>` trong hero) + exemption craft-floor; cân nhắc giữ 1 dòng disclaimer "phương án đề xuất" gần khối Kết quả kỳ vọng.

- **[MAJOR-4] Commit hygiene — `1e90308` gộp file ngoài scope** — ngoài file showcase, commit chứa: `src/components/home/Hero.tsx`, `HeroVisual.tsx` (240 dòng), `src/app/globals.css` (xoá `.hero-bleed-right`), `next.config.ts` (`distDir: '.next-build'` — đã phải revert ở `fee6e54` vì vỡ Docker standalone), `tsconfig.json`, `next-env.d.ts`, `src/components/layout/Footer.tsx` (đổi URL LinkedIn), `home.ts` (`heroPanels.performance.label` + `home-*.jpg→png`), `public/images/illustrations/home-*.{jpg,png}`, `.gitignore`, 2 file `.context/runs`/`tasks` của change khác. Commit message không phản ánh hết.
  - *Fix:* không rewrite history đã push; ghi rõ danh sách file ngoài scope + owner trong change doc (MAJOR-3), lần sau commit theo explicit path list.

- **[MINOR-5]** `ShowcaseTechnology.tsx:23-89` — hàm 67 dòng > `max_function_lines: 50` (`project-config.md:121`). Tách `VmsMock` + `NodeDiagram`.
- **[MINOR-6]** `ShowcaseHero.tsx:31` — CTA chính dùng `<a>` thô: href không bắt đầu bằng `#` sẽ **không** có tiền tố `/en` (khác `Link` next-intl); `rel="noopener"` cho link nội bộ vô nghĩa. Hiện chỉ dùng anchor nên latent. Dùng `Link` khi không phải anchor.
- **[MINOR-7]** `page.tsx:51-56,69` — `labels` + `await getTranslations('solutions.ai')` tính trước nhánh showcase (thừa); `breadcrumbJsonLd` tạo biến nhưng nhánh default L69 vẫn dựng lại y hệt → dùng lại biến.
- **[MINOR-8]** `ShowcaseOverview.tsx:18-20` — `dt sr-only` = label và `dd` thứ 2 cũng = label → screen reader đọc label 2 lần. Bỏ `dd` label (hiển thị `dt` thật) hoặc `aria-hidden` dd label.
- **[MINOR-9]** `ShowcaseVision.tsx:28` — `blockquote` không attribution, trông như trích lời khách hàng/cơ quan; Screen 9 yêu cầu attribution "Tên, Chức danh, Tổ chức". Ghi "— NTA" hoặc bỏ dạng trích dẫn (BR-004).
- **[MINOR-10]** Ảnh crop độ phân giải thấp: `stupa.jpg` 480×300, `ruins-corner.jpg` 440×300 hiển thị `78vw` mobile (~300 CSS px → cần ~600 px @2x) và `stupa.jpg` làm nền Vision `42vw` (~600 px @1440) → mờ; `shelter.jpg` 1100×360 / `site-aerial.jpg` 1340×449 bị cắt mạnh vào khung 4:3.
- **[MINOR-11]** `ShowcasePhotos.tsx:26,42-46` — `section aria-label` lặp `h2` (nên `aria-labelledby`); track `ul tabIndex=0` không có tên truy cập; nút prev/next không disable ở 2 đầu; nút ẩn < `sm` (mobile chỉ swipe — chấp nhận).
- **[MINOR-12]** `gallery` (3 SVG) của Óc Eo giờ chỉ còn là data chết cho showcase (card dùng `cover`). Giữ làm fallback được, nhưng nên ghi trong change doc (liên quan MAJOR-3).
- **[NOTE, ngoài scope]** Working tree (session motion) thêm `CountUp` vào `ShowcaseOverview.tsx:19` — Screen 9 ghi "result numbers static (KHÔNG count-up)"; và giá trị "~433 ha"/"~200 camera" là chuỗi có ký tự. Reviewer của change motion cần kiểm.

### 💡 Suggestions
- Thêm `.next-build/` đã có trong `.gitignore` (từ commit này) — OK; nên tách thay đổi `.gitignore` ra commit hygiene riêng.

## Responsive Checklist Gate
| Mục | Kết quả |
|---|---|
| Không horizontal scroll | OK — builder verify 390/1440; carousel `-mx-* px-*` khớp padding Container; Vision ảnh `hidden lg:block` trong `overflow-hidden`. |
| Mobile-first / grid fr không px cố định | OK — `lg:grid-cols-[minmax(0,…fr)]`, `sm:grid-cols-3`, `md:grid-cols-3`. |
| Typography clamp/rem | OK — `text-[clamp(…)]` sinh CSS. Chữ VMS 8–10px nhưng `aria-hidden` trang trí. |
| Media aspect + sizes | OK (hero intrinsic, carousel `aspect-[4/3]` + `sizes`); xem MINOR-10 về độ phân giải. |
| Touch ≥44px | OK — arrows `size-11`, video `min-h-11`, CTA `buttonStyles lg`. |
| Reduced motion | OK — smooth scroll tắt; hover scale dùng transition (global rule rút về 0.01ms). |
| Không `100vh` | OK. |

## Verdict Reasoning
Không có CRITICAL, nhưng có **4 MAJOR** (≥3) → **FAIL** theo Decision Flow. Fix kỹ thuật nhỏ (MAJOR-1 đổi 4 class; MAJOR-2 thêm nhãn minh hoạ vi/en); MAJOR-3/4 là ghi nhận spec/task + change doc. Sau khi sửa, round 2 cần soi lại CSS build artifact cho các class thay thế.
