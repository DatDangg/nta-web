# Review report — change `replace-placeholder-images` · phase 1 · task 02 · round 1

Agent: reviewer

- **Task:** `tasks/change-replace-placeholder-images/phase-1-task-02.md` (Wiring — gắn asset T01 vào site)
- **Nguồn:** `spec/changes/2026-10-12-replace-remaining-placeholder-images.md` (§3 + §4)
- **Branch:** `main` (changes working-tree, chưa commit)
- **Review level:** `STRICT`
- **Reason:** task khai STRICT — chạm content model `Solution` dùng chung, shared card component `SolutionCard`/`cardStyles`, và i18n/alt render ra nhiều trang công khai VI/EN (home, `/solutions/ai`, `/case-studies`, `/about`). Blast radius rộng + alt/UX text là acceptance chính.

## Blast radius

| Vùng | File | Ảnh hưởng |
|---|---|---|
| Home hero | `src/components/home/Hero.tsx` | Ảnh lớn nhất trang, VI+EN |
| Home cards | `src/content/home.ts` | 2 thẻ AI + featuredCase Óc Eo (VI+EN) |
| `/solutions/ai` | `src/content/solutions/{vi,en}/{boxai,flycam,custom-ai}.mdx` | 3 thẻ dùng `cardImage` object |
| Shared card | `src/components/cards/SolutionCard.tsx`, `cardStyles.ts` | Tiêu thụ `cardImage.{src,alt,ratio}` |
| Case studies | `src/content/case-studies/{vi,en}/{dental-clinic-operations,oc-eo-learning}.mdx` | Gallery 3 ảnh/trang |
| About | `src/content/about/{vi,en}/about.mdx` | 2 ảnh đội ngũ |
| i18n | `src/i18n/messages/{vi,en}.json` | `home.heroImageAlt` |
| Assets | `public/images/illustrations/*`, `public/images/about/*` | SVG mới + xoá `team-placeholder.svg` |

## Verify commands + result

> **⚠️ BLOCKED:** mọi lệnh shell bị **permission denied** (`Permission denied: shell`). Theo Tool Loop Guard
> → **DỪNG**, không retry, không đổi biến thể. Reviewer **không thể** tự chạy lint/typecheck/build/git diff
> trong phiên này. Vì vậy không có `git diff` để đối chiếu chính xác dòng thay đổi; dưới đây là kiểm chứng
> tĩnh trên working tree bằng Grep/Read/Glob.

| Check | Command (profile) | Result |
|---|---|---|
| lint | `npm run lint` | **skip — shell denied** (Blocked; không chạy lại) |
| typecheck | `npm run typecheck` | **skip — shell denied** (Blocked) |
| build | `npm run build` | **skip — shell denied** (Blocked) |
| git diff / status | `git ...` | **skip — shell denied** (Blocked) |

### Kiểm chứng tĩnh đã thực hiện (thay thế một phần)

- **`cardImage` format (điểm builder từng làm sai):** đã đúng object `{src, alt, ratio}` ở **cả 6 file**:
  - `solutions/vi/boxai.mdx:4-7` + `en/boxai.mdx:4-7` → `src: /images/solutions/boxai/01-dashboard-quan-tri.jpg`,
    `alt` prefix đúng (`"Giao diện minh hoạ — …"` / `"Illustrative interface — …"`), `ratio: 1.954`.
  - `solutions/vi/flycam.mdx:4-7` + `en` → `v2/flycam/01-tong-quan.png`, `ratio: 1.396`.
  - `solutions/vi/custom-ai.mdx:4-7` + `en` → `v2/talvra/01-tong-quan.png`, `ratio: 1.396`.
  - Khớp format mẫu `crm.mdx:5-8`. ✅ (3 lỗi builder để lại — mojibake, format sai — đã hết.)
- **Mojibake / ngôn ngữ alt:** VI giữ đúng dấu (`minh hoạ`, `bảng điều khiển`, `trợ lý`, `tuần tra`…),
  EN 100% tiếng Anh. `home.ts` VI/EN alt tách đúng ngôn ngữ (VI: dòng 13–14,20; EN: 25–26,32). ✅
- **`solutions.image` (OG) không đổi:** vẫn `boxai.svg`/`flycam.svg`/`custom-ai.svg` (dòng 3) — đúng yêu cầu "không đụng field image". ✅
- **Hero:** `object-contain` + `width=2656 height=1902` (khớp ratio ảnh), **không còn** `aspect-[4/3] object-cover`
  → không crop 2 bên. `heroImageAlt` VI/EN đúng (`vi.json:60`, `en.json:60`). ✅
- **`SolutionCard` tiêu thụ đúng:** `cardImage?.src` (dòng 31), `cardImage!.alt` (33), `cardImage!.ratio` (34) — khớp object mới. ✅
- **Gallery:** dental VI/EN = **3 ảnh** (dentgo overview/hồ sơ/lịch hẹn), alt riêng, đúng ngôn ngữ;
  Óc Eo VI/EN = **3 ảnh** (`oc-eo-architecture`, `oc-eo-edge-detail`, `oc-eo-operations-detail`), alt riêng. ✅
- **About:** `image: /images/about/team-ai.svg` + `team-domain.svg` (dòng 11,14) VI/EN. ✅
- **Xoá `team-placeholder.svg`:** Glob `public/images/**/*.svg` **không** còn file này; chỉ còn `team-ai.svg`, `team-domain.svg`. ✅
- **Không còn ref placeholder cũ trong `src/content`:** Grep `.svg` → không có `solutions/enterprise.svg`,
  `solutions/ai.svg`, `solutions/apps.svg`, `cases/dental-clinic-operations-overview.svg`,
  `cases/oc-eo-learning-overview.svg`, `about/team-placeholder.svg`. ✅
- **Asset mới tồn tại:** `illustrations/{ai-analysis,ai-apps,oc-eo-architecture,oc-eo-edge-detail,oc-eo-operations-detail}.svg`,
  `about/{team-ai,team-domain}.svg`. ✅
- **SVG không chữ:** Grep `<(text|tspan|foreignObject)` trên `public/images/**/*.svg` → **0 match** trong toàn bộ
  asset mới (5 illustration + 2 about + 4 blog cover). 4 match còn lại là SVG placeholder **cũ / ngoài scope**
  (`cases/oc-eo-learning-overview.svg`, `cases/dental-clinic-operations-overview.svg`,
  `products/music-app-preview.svg`, `products/hair-style-ai-preview.svg`). ✅ (đúng acceptance "SVG không chữ")

## Responsive Checklist Gate

Ui config có (`responsive_breakpoints: [640,768,1024,1280,1536]`), diff **có đụng UI** (Hero.tsx + card media)
→ gate áp dụng. Không có browser → xác minh bằng CSS math, ghi residual cho phần chưa xác minh.

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout (no h-scroll, mobile-first, grid fluid) | **OK** | `Hero.tsx:15` grid `md:grid-cols-[1.1fr_0.9fr]` (mobile 1 cột mặc định); ảnh `w-full object-contain` (`:27`); `cardImageClass` `aspect-[16/10] w-full` (`cardStyles.ts:2`) không đổi; không thêm fixed `px` width. |
| Typography/Spacing | **N/A** | Diff không đổi font-size/spacing. |
| Media (`max-width:100%`, `aspect-ratio`, `srcset/sizes`) | **OK** | Ảnh render qua `next/image` với `width/height` + `sizes` (`Hero.tsx:28-32`); card dùng `cardImageSizes`; asset mới là SVG (vector, không cần `srcset` raster). `object-contain` chống crop. |
| Touch/Interaction (≥44px, nav, table) | **N/A** | Không đụng touch target/nav/table. |
| Viewport/A11y (`100dvh`, reduced-motion, không che lỗi) | **N/A / OK** | Không dùng `100vh`; alt VI/EN cập nhật đúng (cải thiện a11y), `prefers-reduced-motion` không bị ảnh hưởng. |

**Không có mục responsive nào FAIL.**

## Skill gates

| Gate | Kết quả | Bằng chứng / lý do |
|---|---|---|
| `aislop scan` | **skip — shell denied** | Không chạy được CLI (permission denied). |
| `oxlint` (anti-slop) | **skip — shell denied** | Không chạy được `npx oxlint`; chưa xác minh repo có oxlint config. |
| `ocr` (open-code-review) | **skip** | Không chạy được (shell denied) → không chặn PASS. |
| AI-readable gate | **OK** | File nhỏ (Hero 38 dòng), tên self-descriptive, không thêm indirection/magic number/comment WHAT; content-driven rõ. < 3 indicators. |
| ai-friendly-web | **N/A** | Diff chỉ thay ảnh, **không** đổi route/cấu trúc crawl; `llms.txt`/`robots.txt`/`sitemap.xml` ngoài scope task (không tự thêm). |
| blitzstrike | **N/A** | Không có attack surface (auth/API/input/upload); thuần content + asset. |

## Findings

### [MINOR] `src/components/home/Hero.tsx:5` — import không dùng
`import { CARD_IMAGE_RATIO } from '@/components/cards/cardStyles';` nhưng trong toàn bộ component không còn
tham chiếu (width/height dùng literal `2656/1902`). Dead import còn sót sau khi đổi sang `object-contain`.
→ Đề xuất: xoá dòng import 5. (Nếu lint/tsconfig bật `no-unused-vars`/`noUnusedLocals` sẽ là error; primary báo
lint PASS → có thể rule chưa bật — vẫn nên dọn.)

### [MINOR] `src/content/about/{vi,en}/about.mdx:11,14` — mapping ảnh đội ngũ có thể bị ngược
`"Đội ngũ tư vấn" → team-ai.svg`, `"Đội ngũ sản phẩm" → team-domain.svg`. Nếu 2 minh hoạ là trừu tượng (không chữ),
đây thuần cosmetic; nhưng ngữ nghĩa có vẻ hợp lý hơn khi đảo (consulting ≈ domain/business, product ≈ công nghệ/AI).
→ Đề xuất: xác nhận lại với owner/design; không phải blocker.

### [MINOR] Asset placeholder cũ còn sót trong `public/images/` (dead files)
`Glob` cho thấy còn `solutions/ai.svg`, `solutions/apps.svg`, `solutions/enterprise.svg`,
`cases/oc-eo-learning-overview.svg`, `cases/dental-clinic-operations-overview.svg` — **không còn reference** trong
`src/content`, nhưng vẫn ship. Acceptance chỉ yêu cầu "không còn reference" nên **không tính FAIL**;
→ Đề xuất dọn trong task riêng (dọn dead asset), tránh nhầm lẫn sau này.
(Lưu ý ngoài scope: `products/music-app-preview.svg` + `hair-style-ai-preview.svg` **vẫn còn `<text>`** và vẫn
được reference — thuộc task-03/ảnh user cung cấp.)

### [INFO] `image` của 3 solution AI vẫn trỏ placeholder SVG
Theo spec là "không đổi". `SolutionCard` dùng `image` làm fallback placeholder (`SolutionCard.tsx:27`). Xác nhận
`image` không được dùng làm OG image (comment `crm.mdx:4` nói "`image` không phục vụ OG") để tránh OG trỏ SVG placeholder.

## Residual risk / Blocked

1. **Blocked — verify commands:** shell bị deny → **không tự chạy lại** lint/typecheck/build; không có `git diff`
   nên không xác nhận tuyệt đối "chỉ những file trong scope bị đổi" và "`cardStyles.ts` không bị sửa" (đọc nội dung thấy
   nguyên vẹn, có comment change cũ, nhưng chưa diff-verified).
2. **Chưa xác minh build HTML** (`/solutions/ai` vi+en…) do tool cap → nhánh render `shot && shotSrc` của
   `SolutionCard` (page phải truyền `shot`) **chưa được kiểm chứng độc lập**. Code-level nhất quán
   (`cardImage` object + `SolutionCard` đọc `.src/.alt/.ratio`) nhưng wiring trang không đọc được.
3. **Ratio ảnh thật chưa đo:** `boxai 1.954`, `flycam/talvra 1.396` mới chỉ đối chiếu khai báo, **chưa đọc IHDR/pixel**
   của file ảnh để xác nhận khớp.
4. **Chưa xem nội dung SVG mới** (mặt người / "cùng bộ phong cách") — chỉ xác minh được `<text>/<tspan>/<foreignObject>` = 0.
5. **Ref `team-placeholder.svg` chỉ mới grep trong `src/content`** — chưa grep toàn `src`/test (tool cap).
6. **Blog wiring** không nằm trong danh sách diff mô tả; mdx blog vẫn trỏ `*-cover.svg` trùng tên → không xác minh
   được nội dung cover đã là series mới (thuộc T01).

## Verdict

**✅ PASS** — không phát hiện `CRITICAL`/`MAJOR` trong phạm vi kiểm chứng tĩnh; 3 lỗi builder để lại
(mojibake alt, alt EN tiếng Việt, sai format `cardImage` khiến `/solutions/ai` không render) **đã được sửa đúng**:
object `{src, alt, ratio}` ở cả 6 file, prefix alt đúng VI/EN, ratio khớp khai báo, không còn ref placeholder cũ,
`team-placeholder.svg` đã xoá và không còn reference, SVG mới không chữ, gallery ≥3 ảnh alt riêng, hero không crop.

**Điều kiện:** PASS này dựa trên kiểm chứng tĩnh vì **verify commands bị Blocked (shell denied)** — trước khi
commit cần đảm bảo `npm run lint` / `typecheck` / `build` thực sự PASS trên cây hiện tại (primary báo PASS; reviewer
không tự chạy lại được). 3 finding MINOR nêu trên nên xử lý/dọn (đặc biệt dead import `Hero.tsx:5`).

Không sửa source. Không commit.
