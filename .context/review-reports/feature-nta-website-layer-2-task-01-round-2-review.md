# Review — feature nta-website · layer-2-task-01 (Trang chủ `/` — Screen 1) · round 2

Agent: reviewer

## Review level
**STRICT**

## Reason
Round-1 fix **chạm shared component** `src/components/cards/SolutionCard.tsx` + `ProductCard.tsx` (Layer 1, dùng lại ở
các trang listing Layer 3) → blast radius vượt ngoài route `/`. Đồng thời fix tái cấu trúc card markup home
(`SolutionGridHome`/`ProductStrip`) nên cần soi regression + dependency. Đây là risk đỏ "shared component /
navigation / component dùng nhiều màn" → STRICT theo Reviewer rules.

## Blast radius
- Route: `/` (vi) + `/en` (en) — SSG.
- Sửa shared (Layer 1): `src/components/cards/SolutionCard.tsx`, `src/components/cards/ProductCard.tsx` (thêm props `href?`, `imageSrc?`, `className?` + import mới).
- Sửa page-specific: `src/components/home/{SolutionGridHome,ProductStrip,HomeImage}.tsx`.
- Sửa route: `src/app/[locale]/page.tsx`.
- Consume gián tiếp (mọi page tương lai dùng `SolutionCard`/`ProductCard`): Layer 3 `/solutions/*`, `/products`.
- Không đụng API/schema/auth/tenant/db.

## Verify commands + result (reviewer tự chạy)
| Command | Result |
|---|---|
| `npm run lint` | ✅ PASS (`eslint .` — exit 0, không output) |
| `npm run typecheck` | ✅ PASS (`tsc --noEmit` — exit 0, không output) |
| `npm run build` | ✅ PASS — `● (SSG) /[locale]` prerender `/vi` + `/en`; `○ /_not-found`; `ƒ /[locale]/[...rest]` (Layer 1, ngoài scope) |
| `test_command` | `skip` — `project-config.md:36` `test_command: null` (v1 chưa có test framework) |
| `git status --short` / `git diff` | **Blocked** — shell `git` bị `permission.rejected` (`Permission denied: shell`). Theo Tool Loop Guard: không retry; thay bằng đọc file + `grep` (`grep HomeImage`, `grep SolutionCard|ProductCard`) để xác định diff/usage. |
| Manual browser (375/768/1280) | `skip` — reviewer không self-run browser; xác minh bằng CSS math + đọc code (ghi Residual risk). |

## Round 1 — closure check
| Round-1 finding | Trạng thái | Bằng chứng |
|---|---|---|
| **MAJOR #1** home fork card markup | ✅ **ĐÓNG (phần reuse)** | `SolutionGridHome.tsx:1` import `SolutionCard`; `ProductStrip.tsx:5` import `ProductCard`; render tại `:21`/`:57`; không còn inline `<Link>` card fork. Xem MAJOR mới ở Findings cho vấn đề phát sinh. |
| MINOR #2 HomeImage alt khi lỗi | ✅ fixed | `HomeImage.tsx:18` fallback `role="img" aria-label={alt}` |
| MINOR #3 `preventDefault` | ✅ fixed | `ProductStrip.tsx:19,23` `event.preventDefault()` cho ArrowRight/Left |
| MINOR #4 class dup `bg-surface-sunken` | ✅ fixed (có hack) | `HomeImage.tsx:18` `.replace(' bg-surface-sunken','')` rồi append lại → hết trùng, nhưng fragile (xem MINOR #2 mới) |
| MINOR #5 `generateStaticParams` trùng | ✅ fixed | `page.tsx` không còn `generateStaticParams` (chỉ `generateMetadata` + `HomePage`) |
| MINOR #6 meta desc VI ~161 | ✅ fixed | `page.tsx:15` đã bỏ "giúp"; đếm ~153 ký tự (150–160) |
| R-03 ≥2 ProductCard | ✅ | `home.ts:16-19` 2 sản phẩm; `ProductStrip.tsx:56` map |
| CaseStudyHighlight định tính (O1) | ✅ | `CaseStudyHighlight.tsx:24-26` chỉ title/description/link, không metric |
| Gap 6 strip `/en` | ✅ | `SolutionGridHome.tsx:25`, `CaseStudyHighlight.tsx:26` strip `/^\/en(?=\/)/`; `ProductCard` href `/products` qua `@/i18n/navigation` tự prefix → không `/en/en` |
| i18n VI/EN | ✅ | keys `home.*` + `previousProducts`/`nextProducts` có đủ 2 locale (`vi.json:60-69`, `en.json:60-69`) |

## Regression shared cards (trọng tâm STRICT)
- **Usage:** `grep SolutionCard|ProductCard src` → chỉ 2 call-site, cả hai ở `src/components/home/`.
  Không còn page Layer-1 nào khác render 2 card này → **không có call-site cũ nào vỡ**.
- **Props:** `href?`, `imageSrc?`, `className?` là **optional** → backward-compatible.
  `imageAlt` vẫn required như trước (typecheck PASS xác nhận mọi call-site hiện có truyền đủ).
- **Kết luận regression:** PASS về mặt API/type/runtime cho các consumer hiện có.
- ⚠️ **Nhưng** fix tạo **coupling mới** shared→page (xem MAJOR #1 dưới) → là defect kiến trúc, không phải regression type.

## Responsive Checklist Gate (MANDATORY — diff đụng UI)
Project có `ui:` block (`project-config.md:110-115`), breakpoints Tailwind 640/768/1024/1280/1536 → test 375/768/1280.
Không có browser → xác minh bằng CSS math + đọc code.

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout — không horizontal scroll; mobile-first (`min-width`); grid `auto-fit`/`minmax`; container không fixed `px` | **OK** | container `max-w-container` (max-width 1280, không fixed width); grid home `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` — cột cố định **theo đúng bảng Screen 1** (`design-spec.md:127-130`) → intentional; strip là scroll container riêng `overflow-x-auto` `ProductStrip.tsx:50` → không đẩy page scroll ngang |
| Typography/Spacing — `rem`/`clamp()`, heading fluid, spacing scale | **OK (không đổi)** | `text-hero`/`text-h2`/`text-h3` clamp (`globals.css`), padding `py-12 md:py-16 xl:py-24` |
| Media — `max-width:100%;height:auto`, `aspect-ratio`, `srcset`/`sizes`, video `aspect-ratio` | **OK** | `HomeImage` → `next/image` + `w-full`; `cardImageClass` `aspect-[16/10]` + `cardImageSizes` (`cardStyles.ts:2,4`); video N/A |
| Touch/Interaction — target ≥44×44px; nav mobile không tràn; table wrapper/card mobile | **OK** / table **N/A** | arrow `min-h-11 min-w-11`=44px (`ProductStrip.tsx:43-44`); CTA `min-h-12`; card là target lớn; trang không table |
| Viewport/A11y — không `100vh`; `prefers-reduced-motion`; không che lỗi bằng `overflow:hidden` | **OK** | không `100vh`; `Reveal`/`globals.css` tôn trọng reduced-motion; fallback ảnh có `role="img"`+`aria-label` |
| CSS math strip | **OK** | base `min-w-[82%]`~1.2 card / sm `66.666%-1rem`~1.5 / md `40%-1rem`~2.5 / lg `33.333%-1rem`=3 → khớp `design-spec.md:127-130` |

Không mục nào FAIL. **N/A:** video/embed, table.

## Skill gates
| Gate | Kết quả | Bằng chứng / lý do |
|---|---|---|
| `aislop` (score ≥80) | **skip** | CLI không chạy được (`npx` bị permission deny). Soi thủ công: không narrative comment / dead code / swallowed error; `onError` fallback là chủ ý AC. |
| anti-slop / `oxlint` | **skip, oxlint not configured** | Không có `.oxlintrc*`; `npx` bị deny. |
| `ocr` (open-code-review) | **skip, ocr not installed** | `ocr` không có trong môi trường → không chặn PASS theo rule. |
| AI-readable (mục 6) | **OK** | File ngắn (`SolutionGridHome` 33, `ProductStrip` 70 <300), function <50 dòng, không comment WHAT. Indicators đếm ≤2: magic `0.8` (`ProductStrip.tsx:34`) + `HomeImage` dedupe hack. **Không đạt ngưỡng ≥3 → không FAIL.** |
| ai-friendly-web (llms.txt/robots/sitemap) | **N/A (defer Layer 4)** | `tasks/nta-website/layer-4-task-01.md` giữ SEO static endpoints. Re-check ở Layer 4. |
| blitzstrike (pentest) | **N/A** | Không auth/API public/input; không attack surface trong diff. |

## Findings

### [MAJOR] #1 — Dependency inversion: shared Layer-1 card import module page-specific Layer-2 `home/HomeImage`
- **file:line:** `src/components/cards/SolutionCard.tsx:5` → `import { HomeImage } from '@/components/home/HomeImage';`
  `src/components/cards/ProductCard.tsx:4` → tương tự. Target: `src/components/home/HomeImage.tsx` (file **mới của Layer-2 task-01**).
- **Căn cứ:**
  - `HomeImage` được tạo trong task Layer-2 (`round-1 review:17` liệt kê nó là component mới của home); Layer-1 task-03
    tạo `cards/*` **trước** khi file này tồn tại → import này là **mới phát sinh từ fix round 2**.
  - Kiến trúc layer đã chốt: Layer 1 = shared (`cards`, `ui`, `shared`), Layer 2 = page (`home`). Dependency hợp lệ là
    **page → shared**, không phải **shared → page**.
- **Ảnh hưởng (thật, không lý thuyết):**
  - Mọi page Layer 3 dùng `SolutionCard`/`ProductCard` (`/solutions/*`, `/products`) sẽ transitively kéo module `home`.
  - Refactor/đổi tên/xoá `src/components/home/` (rất có thể xảy ra khi hoàn thiện trang chủ) sẽ **làm vỡ build** ở shared cards.
  - Đổi `HomeImage` vì nhu cầu riêng của trang chủ sẽ vô tình đổi hành vi ảnh ở mọi listing page.
- **Vì sao MAJOR:** đúng loại risk mà STRICT yêu cầu bắt; fix đã mở rộng blast radius ra ngoài `/` bằng coupling sai hướng,
  trong khi bản thân yêu cầu task chỉ là "tái dùng shared card".
- **Fix đề xuất (chọn 1):**
  1. Chuyển `HomeImage` → `src/components/ui/MediaImage.tsx` (hoặc `src/components/shared/`) rồi cập nhật import ở
     `home/{Hero,CaseStudyHighlight}.tsx` + `cards/{SolutionCard,ProductCard}.tsx`; hoặc
  2. Giữ `next/image` + fallback inline trong card (giống `CaseStudyCard.tsx:19`, `AppCard.tsx:18`) để shared card
     không phụ thuộc `home`.

### [MINOR] #2 — `HomeImage` dedupe class bằng string-replace fragile
- **file:line:** `src/components/home/HomeImage.tsx:18` — `className.replace(' bg-surface-sunken', '')` rồi append lại.
- Chỉ đúng khi class có đúng substring `" bg-surface-sunken"` (space đầu). Dễ hỏng khi className đổi (vd đứng đầu chuỗi,
  hoặc có class khác). **Fix:** tách `cardImageFallbackClass` (chỉ `aspect-* w-full rounded-lg bg-surface-sunken`) hoặc
  dùng `clsx`/biến thể có chủ đích thay vì replace chuỗi.

### [MINOR] #3 — `SolutionGridHome` tạo `Solution` giả (adapter nội tuyến gây nhiễu)
- **file:line:** `src/components/home/SolutionGridHome.tsx:26` — `solution={{ ...solution, slug: solution.href.split('/').at(-1) ?? solution.href, category: 'enterprise', features: [], benefits: [] }}`
- `category: 'enterprise'` **hardcode cho cả 3** item (card 2/3 thực chất là AI/Apps) và `features/benefits: []` là dữ liệu
  bịa để thoả type; `slug` cũng không dùng (href đã override). Đọc code dễ hiểu sai "mọi giải pháp là enterprise".
- **Fix:** cho `SolutionCard` prop presentational (`title`/`description`/`image`/`href`) hoặc bổ sung `category` vào
  `SolutionItem` và map đúng — tránh object giả.

### [MINOR] #4 — `cardGridClass` vẫn không được tái dùng
- **file:line:** `src/components/cards/cardStyles.ts:5` (định nghĩa) vs `SolutionGridHome.tsx:19` (grid viết inline y hệt).
- Không phải lỗi chức năng (giá trị trùng khớp) nhưng còn duplicate nhỏ sót lại từ round 1.
  **Fix:** dùng `cardGridClass` (kèm `mt-8`) hoặc xoá hằng số nếu không dùng.

### Observation (không tính defect)
- Non-ASCII arrow `←`/`→` trong `ProductStrip.tsx:43-44` có `aria-label` riêng → a11y OK.
- `sizes` của card (`cardImageSizes`, 33vw ở ≥1024) hơi lệch khi strip ở md hiển thị 2.5 card, nhưng chỉ ảnh hưởng
  mức tải ảnh nhẹ, không phải lỗi.

## Verdict
**❌ FAIL**

**Blocker duy nhất:** MAJOR #1 — shared `cards/SolutionCard` + `ProductCard` import `@/components/home/HomeImage`
(Layer-1 → Layer-2), đảo chiều dependency và mở rộng blast radius ra ngoài route `/`. Yêu cầu gốc (MAJOR round 1
"tái dùng shared card") **đã đóng đúng**, regression API **PASS** (props optional, không còn call-site khác), và
`lint`/`typecheck`/`build` (SSG `/vi` + `/en`) đều PASS; các MINOR round 1 đã fixed. Chỉ cần xử lý dependency
inversion (move `HomeImage` ra `ui/`/`shared/` hoặc inline fallback trong card) là có thể PASS.

## Residual risk (chưa chứng minh được)
- **git status/diff:** Blocked do permission (`git` shell bị deny) → chưa đối chiếu diff gốc; đã bù bằng Read + grep.
- **Responsive/keyboard thực tế:** chưa self-run browser → mốc 375/768/1280, swipe strip, hover/focus card chỉ xác minh
  bằng CSS math + đọc code; cần manual check khi close-out.
- **Gate CLI (`aislop`/`oxlint`/`ocr`):** không chạy được do permission/không cài → chỉ soi thủ công.

## Cách verify lại round sau
1. `npm run lint && npm run typecheck && npm run build` → PASS, `/vi` + `/en` vẫn `● (SSG)`.
2. `grep -n "components/home" src/components/cards/` → **không còn match** (sau khi move `HomeImage`/inline fallback).
3. `grep -rn "SolutionCard\|ProductCard" src` → home vẫn reuse shared card; không call-site cũ vỡ.
4. (Nếu sửa MINOR) `HomeImage` không còn `replace(' bg-surface-sunken')`; `SolutionGridHome` không tạo `Solution` giả.
