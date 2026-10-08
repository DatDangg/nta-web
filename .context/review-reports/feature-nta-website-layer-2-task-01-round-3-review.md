# Review — feature nta-website · layer-2-task-01 (Trang chủ `/` — Screen 1) · round 3

Agent: reviewer

## Review level
**STRICT**

## Reason
Fix attempt 2 chạm **shared Layer-1** (`src/components/cards/SolutionCard.tsx`, `ProductCard.tsx`) và **di chuyển
component sang `src/components/shared/`** (`HomeImage`). Đây là risk đỏ "shared component/component dùng nhiều màn"
→ STRICT theo Reviewer rules. Đồng thời phải xác nhận dependency direction Layer-1 → Layer-1 (không còn shared→page)
và kiểm regression consumer của `SolutionCard`/`ProductCard` (Layer 3 sẽ dùng).

## Blast radius
- Route: `/` (vi) + `/en` (en) — SSG.
- Shared Layer-1: `src/components/cards/{SolutionCard,ProductCard}.tsx` (import), `src/components/shared/HomeImage.tsx` (moved, sửa nội dung).
- Page-specific Layer-2: `src/components/home/{Hero,SolutionGridHome,ProductStrip,CaseStudyHighlight}.tsx` (import cập nhật).
- Xoá file cũ: `src/components/home/HomeImage.tsx`.
- Consumer gián tiếp: mọi page tương lai dùng `SolutionCard`/`ProductCard` (Layer 3 `/solutions/*`, `/products`).
- Không đụng API/schema/auth/tenant/db. (git status/diff không đọc được — xem Residual risk.)

## Verify commands + result
| Command | Result |
|---|---|
| `npm run lint` | **Blocked** — shell trả `permission.rejected: Permission denied: shell`. Theo Tool Loop Guard: DỪNG, không retry/đổi biến thể. |
| `npm run typecheck` | **Blocked** — như trên. |
| `npm run build` | **Blocked** — như trên. Không có SSG evidence mới cho `/vi` + `/en` ở round này. |
| `test_command` | `skip` — `project-config.md:36` `test_command: null` (v1 chưa có test framework). |
| Static verify (thay thế) | Read + Grep đã chạy: xem "Round closure" + "Regression" bên dưới. |

⚠️ Không thể claim build PASS từ round này. Round 2 đã PASS `lint`/`typecheck`/`build` (`/vi`+`/en` SSG) **trước**
fix attempt 2; thay đổi round này thuần move file + sửa import → static evidence đủ để kết luận code đúng hướng,
nhưng **builder/primary PHẢI chạy lại `npm run lint && npm run typecheck && npm run build` trước khi commit**
(DoD "Check commands pass" chưa được reviewer xác nhận trong phiên này).

## Round closure check (MAJOR round 1 + round 2)
| Finding cũ | Trạng thái | Bằng chứng (file:line) |
|---|---|---|
| **MAJOR round 1 #1** — home fork card markup, không dùng shared card | ✅ **ĐÓNG** | `SolutionGridHome.tsx:1` import `SolutionCard`; render `:21-27`. `ProductStrip.tsx:5` import `ProductCard`; render `:57-63`. Không còn inline `<Link>` card fork. |
| **MAJOR round 2 #1** — dependency inversion: `cards/*` import `@/components/home/HomeImage` | ✅ **ĐÓNG** | `grep "components/home" src/components/cards/` → **No matches**. `SolutionCard.tsx:5` + `ProductCard.tsx:4` nay import `@/components/shared/HomeImage` (Layer-1 → Layer-1). File cũ `src/components/home/HomeImage.tsx` **đã xoá** (glob → no files). |
| MINOR round 2 #2 — `HomeImage` dedupe bằng string `.replace(' bg-surface-sunken')` | ✅ fixed | `shared/HomeImage.tsx:18` chỉ `className={className}`, không còn `.replace(...)`. |
| MINOR round 1 #2 alt khi lỗi | ✅ giữ | `shared/HomeImage.tsx:18` fallback `role="img" aria-label={alt}` (không mất alt). |
| MINOR round 1 #3 `preventDefault` strip | ✅ giữ | `ProductStrip.tsx:19,23`. |
| MINOR round 1 #4 class dup `bg-surface-sunken` | ✅ hết | fallback dùng thẳng `className` một lần, không append thêm. |
| MINOR round 2 #3 synthetic `Solution` object | ⚠️ **còn treo** | `SolutionGridHome.tsx:26` — xem Findings MINOR. |
| MINOR round 2 #4 `cardGridClass` không tái dùng | ⚠️ **còn treo** | `SolutionGridHome.tsx:19` viết grid inline vs `cardStyles.ts:5` — xem Findings MINOR. |

## Regression — shared `cards/` + `shared/HomeImage` (trọng tâm STRICT)
- **Dependency direction:** `cards/*` → `shared/HomeImage` (Layer-1 → Layer-1) ✅. `home/*` → `shared/HomeImage` + `home/*` → `cards/*` (Layer-2 → Layer-1) ✅. Không còn cạnh ngược shared→page.
- **Call-site:** `grep "SolutionCard|ProductCard"` → chỉ 2 consumer, đều ở `src/components/home/` (`SolutionGridHome`, `ProductStrip`). Không có call-site cũ nào vỡ.
- **Import HomeImage:** cả 4 consumer (`Hero.tsx:5`, `CaseStudyHighlight.tsx:4`, `SolutionCard.tsx:5`, `ProductCard.tsx:4`) đều trỏ `@/components/shared/HomeImage`; không còn reference tới path cũ trong `src/`.
- **Props backward-compatible:** `href?`, `imageSrc?`, `className?` optional; `imageAlt` vẫn required — mọi call-site hiện truyền đủ (đọc trực tiếp). Không có breaking change API.
- **Kết luận regression:** PASS (API/type/coupling). Lưu ý naming — xem MINOR.

## AC traceability (còn lại)
| AC | Kết quả | Bằng chứng |
|---|---|---|
| 5 section đúng thứ tự / 5 layout family | ✅ | `page.tsx:53-57` Hero→SolutionGrid→ProductStrip→CaseStudy→CTABanner |
| Hero h1 duy nhất + 2 CTA canonical | ✅ | `Hero.tsx:15` h1; `:18-19` `cta('contact')`+`cta('viewSolutions')` = "Liên hệ tư vấn"/"Xem giải pháp" (`vi.json:5-6`) |
| 3 SolutionCard điều hướng đúng | ✅ | `home.ts:12-14` → `/solutions/enterprise`, `/solutions/ai`, `/products`; `SolutionGridHome.tsx:25` strip `/en` |
| ProductStrip keyboard-scroll + `priority` 1 ảnh | ✅ | `ProductStrip.tsx:17-26,51,53-54`; `priority` chỉ ở `Hero.tsx:26` |
| Empty strip ẩn + fallback ảnh lỗi | ✅ | `ProductStrip.tsx:31`; `shared/HomeImage.tsx:17-18` |
| Metadata 2 locale + hreflang | ✅ | `page.tsx:12-39` (`alternates.languages vi/en/x-default`); JSON-LD defer Layer 4 đúng |
| Không page-level loading/error | ✅ | glob `src/app/**/{loading,error}.tsx` → no files |
| Anti-slop copy (no eyebrow/scroll cue/em-dash) | ✅ | đọc `vi.json`/`en.json` `home.*` (`:59-70`) — không eyebrow/scroll cue/`—` |
| Gap 6 EN href không `/en/en` | ✅ | `SolutionGridHome.tsx:25` + `CaseStudyHighlight.tsx:26` strip `/^\/en(?=\/)/` |
| O1 CaseStudy định tính | ✅ | `CaseStudyHighlight.tsx:24-26`; `home.ts:20,32` không metric |
| R-03 ≥2 product | ✅ | `home.ts:16-19` (2 sản phẩm) + `ProductStrip.tsx:56` |

## Responsive Checklist Gate (MANDATORY — diff đụng UI)
Breakpoints Tailwind 640/768/1024/1280/1536 (`project-config.md:112`) → test 375/768/1280. Không có browser →
xác minh bằng CSS math + đọc code. Fix attempt 2 **không đổi layout** (chỉ move file + import), nên kết quả giữ nguyên
như round 2 với cùng bằng chứng code hiện tại.

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout — không horizontal scroll; mobile-first; grid `auto-fit`/`minmax`; container không fixed `px` | **OK** | container `max-w-container` (max-width, không fixed width); grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` khớp design Screen 1 (intentional); strip `overflow-x-auto` là scroll container riêng → không đẩy page scroll ngang |
| Typography/Spacing — `rem`/`clamp()`, heading fluid, spacing scale | **OK** | `text-hero`/`text-h2`/`text-h3` dùng `clamp`; padding `py-12 md:py-16 xl:py-24` |
| Media — `max-width:100%`, `aspect-ratio`, `srcset`/`sizes`, video `aspect-ratio` | **OK** | `HomeImage` → `next/image` + `w-full`; `cardImageClass` `aspect-[16/10]` + `cardImageSizes` (`cardStyles.ts:2,4`); video N/A |
| Touch/Interaction — target ≥44×44px; nav mobile không tràn; table wrapper/card mobile | **OK** / table **N/A** | arrow `min-h-11 min-w-11`=44px (`ProductStrip.tsx:43-44`); CTA `min-h-12`; card là target lớn; không có table |
| Viewport/A11y — không `100vh`; `prefers-reduced-motion`; không che lỗi bằng `overflow:hidden` | **OK** | không `100vh`; `Reveal`/globals tôn trọng reduced-motion; fallback ảnh có `role="img"`+`aria-label` |
| CSS math strip | **OK** | base `min-w-[82%]`~1.2 card / sm `66.666%-1rem`~1.5 / md `40%-1rem`~2.5 / lg `33.333%-1rem`=3 — khớp bảng Screen 1 |

Không mục nào FAIL. **N/A:** video/embed, table. Chưa self-run browser → xem Residual risk.

## Skill gates
| Gate | Kết quả | Bằng chứng / lý do |
|---|---|---|
| `aislop` (score ≥80) | **skip** | Shell bị `permission.rejected` → không chạy CLI. Soi thủ công: không narrative comment, không dead code, không swallowed error, không `as any`, không TODO stub; `onError` fallback là chủ ý AC (không phải hidden fallback che lỗi). |
| anti-slop / `oxlint` | **skip, oxlint not configured** | Không có `.oxlintrc*` (các round trước xác nhận); shell/`npx` không chạy được trong phiên này. |
| `ocr` (open-code-review) | **skip, ocr not installed** | Không có `ocr` trong môi trường → không chặn PASS theo rule. |
| AI-readable (mục 6) | **OK** | File ngắn (<300: HomeImage 33, SolutionCard 25, ProductCard 22, Hero 34, SolutionGridHome 33, ProductStrip 70, CaseStudyHighlight 33); function <50 dòng; không comment WHAT; không đổi luồng chính (không cần cập nhật README/ARCHITECTURE). Indicators ≤2: tên `HomeImage` trong `shared/` còn gợi ý home-specific + magic `0.8` (`ProductStrip.tsx:34`). **Không đạt ngưỡng ≥3 → không FAIL.** |
| ai-friendly-web (llms.txt/robots/sitemap) | **N/A (defer Layer 4)** | `tasks/nta-website/layer-4-task-01.md` giữ SEO static endpoints. Re-check ở Layer 4. |
| blitzstrike (pentest) | **N/A** | Không auth/API public/input; không attack surface trong diff. |

## Findings

### [MAJOR] — none
MAJOR round 1 (#1 fork card markup) và MAJOR round 2 (#1 dependency inversion) **đều đã đóng**, có bằng chứng grep/read.
Không phát sinh blocker mới. Không có CRITICAL.

### [MINOR] #1 — Tên `HomeImage` giờ generic nhưng mang tên home-specific khi nằm ở `shared/`
- **file:line:** `src/components/shared/HomeImage.tsx:14` (export/home), consumer tại `src/components/cards/SolutionCard.tsx:5`, `ProductCard.tsx:4`.
- `HomeImage` nay là media image dùng chung (cards Layer-1 + home Layer-2) nhưng tên "Home" khiến người/AI đọc hiểu nhầm
  là page-specific (đúng loại AI-chaos "tên mơ hồ"). Không phải lỗi chức năng.
- **Fix (khi tiện):** đổi tên `MediaImage`/`ContentImage` và cập nhật 4 import. Không chặn PASS.

### [MINOR] #2 — (carried round 2 #3) `SolutionGridHome` tạo `Solution` giả
- **file:line:** `src/components/home/SolutionGridHome.tsx:26` — spread `{ ...solution, slug:..., category: 'enterprise', features: [], benefits: [] }`.
- `category: 'enterprise'` hardcode cho cả 3 item; `features/benefits: []` là dữ liệu bịa để thoả type; `slug` không dùng (href đã override).
- **Đánh giá:** non-blocking — `href`/`imageSrc`/`imageAlt` override nên render đúng; chỉ là adapter nội tuyến gây nhiễu. **Fix:** prop presentational cho `SolutionCard` hoặc map đúng `category`.

### [MINOR] #3 — (carried round 2 #4) `cardGridClass` còn không được tái dùng
- **file:line:** `src/components/cards/cardStyles.ts:5` (định nghĩa) vs `SolutionGridHome.tsx:19` (grid inline y hệt).
- Giá trị trùng khớp nên không lỗi chức năng; chỉ duplicate nhỏ. **Đánh giá:** non-blocking. **Fix:** dùng `cardGridClass` (kèm `mt-8`) hoặc xoá hằng số nếu không dùng.

## Verdict
**✅ PASS**

Không còn CRITICAL/MAJOR: MAJOR round 1 (reuse shared card) và MAJOR round 2 (dependency inversion
`cards/*` → `home/HomeImage`) đều đã đóng bằng chứng kiểm chứng được (`grep "components/home" src/components/cards/`
→ no matches; file cũ đã xoá; 4 import trỏ `shared/HomeImage`; `SolutionCard`/`ProductCard` chỉ còn consumer ở home).
Regression shared PASS (props optional, không call-site cũ vỡ). Các MINOR còn treo đều non-blocking (đã đánh giá ở trên).

⚠️ **Điều kiện trước commit:** phiên này shell bị `permission.rejected` nên **reviewer không chạy được**
`npm run lint`/`typecheck`/`build`. Builder/primary **phải chạy lại 3 lệnh này (kỳ vọng `/vi` + `/en` vẫn `● (SSG)`)
trước khi commit** để thoả DoD "Check commands pass". Nếu build fail → quay lại builder.

## Residual risk (chưa chứng minh được)
- **Verify commands Blocked:** `lint`/`typecheck`/`build` không chạy được do shell permission (`permission.rejected`) →
  chưa có SSG evidence mới cho round này; phải re-run trước commit. (Static: import trỏ đúng path, không còn dangling ref.)
- **git status/diff:** không đọc được (shell denied) → chưa đối chiếu diff gốc; đã bù bằng Read + Grep trên `src/`.
- **Responsive/keyboard thực tế:** chưa self-run browser → mốc 375/768/1280, swipe strip, hover/focus card chỉ xác minh
  bằng CSS math + đọc code.
- **Gate CLI (`aislop`/`oxlint`/`ocr`):** không chạy được do permission/không cài → chỉ soi thủ công.
- **Read-tool cap:** phiên STRICT đã dùng hết cap đọc (25) trước khi kịp kiểm `.oxlintrc`/docs → phần này chỉ
  dựa trên kết luận các round trước ("oxlint not configured").

## Cách verify lại round sau (nếu cần)
1. `npm run lint && npm run typecheck && npm run build` → PASS, `/vi` + `/en` vẫn `● (SSG)`.
2. `grep -rn "components/home" src/components/cards/` → **không còn match**.
3. `grep -rn "HomeImage" src` → tất cả trỏ `@/components/shared/HomeImage`; `src/components/home/HomeImage.tsx` không tồn tại.
4. (Nếu sửa MINOR) `HomeImage` không còn `.replace(`; `SolutionGridHome` không tạo `Solution` giả; grid dùng `cardGridClass`.
