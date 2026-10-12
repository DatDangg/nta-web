# Review — change `home-solution-card-images` · phase-1-task-01 · round-1

**Agent: reviewer**

- Work item: FEATURE · change type **MODIFY** (post-build) — `home-solution-card-images`
- Task: `tasks/change-home-solution-card-images/phase-1-task-01.md`
- Change file: `spec/changes/2026-10-12-home-solution-card-images.md`
- Spec update: `spec/updates/2026-10-12-home-solution-card-images.md`
- Ngày review: 2026-10-12

## Review level

**NORMAL**

### Reason
- Scope hẹp: 1 file data (`src/content/home.ts`) + 1 component UI (`SolutionCard.tsx`) + 3 asset ảnh; không đụng auth/RBAC, không tenant/school/org isolation, không DB/schema/migration (`db_tool: none`), không API contract/DTO, không payment, không cron/webhook, không import/export.
- `SolutionCard` là **component dùng chung** (`/solutions/enterprise`, `/solutions/ai`) nhưng **không đổi** `cardStyles.ts` / `AppCard` / `ProductCard` / `PostCard` / `CaseStudyCard` → không phải shared-service risk đỏ.
- Không có root cause chưa rõ (task MODIFY asset + class căn chỉnh, không phải bug fix).
- Không nâng lên `STRICT` vì không có item risk đỏ nào trong danh sách bắt buộc.

## Blast radius

| Khu vực | Ảnh hưởng |
|---|---|
| `/` + `/en` — khối "3 mảng giải pháp" (`SolutionGridHome` → `SolutionCard`) | Đổi 3 ảnh + bỏ `shot` thẻ 1 ⇒ 3 thẻ chuyển sang cùng nhánh layout thường |
| `/solutions/enterprise` (4 thẻ) + `/solutions/ai` (3 thẻ), VI + EN | Render **cùng component** `SolutionCard` với `shot=true` — vùng code thay đổi (`h-full flex flex-col`) có chạy qua nhánh này |
| `src/components/cards/cardStyles.ts` → `AppCard` / `ProductCard` / `PostCard` / `CaseStudyCard` | **Không** bị ảnh hưởng (file không đổi) |
| `SolutionGridHome.tsx` / `Reveal` / `globals.css` / `.mdx` solutions / OG/JSON-LD/sitemap | Không đổi |
| Assets | 3 file mới thêm; `illustrations/ai-analysis.svg` + `illustrations/ai-apps.svg` trở thành orphan |

## Verify commands + result

| Command / kiểm tra | Kết quả |
|---|---|
| `npm run lint` | **Blocked** — shell bị `permission.rejected`, không chạy lại được. Tin theo attestation của primary (0 errors, 1 warning pre-existing `src/components/mdx/index.tsx` ngoài scope). |
| `npm run typecheck` | **Blocked** (shell denied) — tự kiểm bằng đọc code: `shot?: boolean` là optional ⇒ bỏ `shot` khỏi data không vỡ type. |
| `npm run build` | **Blocked** (shell denied). |
| HTML build `.next/server/app/{vi,en}.html` | **Không xác minh được độc lập** — glob (cả `hidden`) không tìm thấy artifact `.next/server/app/*.html` trong worktree hiện tại. Đã kiểm chứng **bằng nguồn thay thế** (xem dưới). |
| `npm test` / `test_command` | `skip, test_command: null` (`project-config.md`) — repo chưa cấu hình test framework. |
| `node scripts/generate-inventory.mjs` (`docs_inventory`) | Không chạy (shell denied); không có doc inventory impact trong scope. |

**Kiểm chứng thay thế (bằng Grep/Read — độc lập, không tin lời builder):**
- `src/content/home.ts:12-14` (vi) + `:24-26` (en): 3 `image` = `home-enterprise.jpg` / `home-ai.jpg` / `home-apps.jpg` **đúng thứ tự** thẻ 1/2/3; `solutionCards` chỉ còn 5 field (không còn `shot`). ✓
- Grep `shot` toàn `src`: **0** occurrence trong `home.ts` ⇒ không còn `shot: true` ở cả 2 locale. ✓
- Grep `ai-analysis.svg|ai-apps.svg` toàn `src`: **0 match** ⇒ 0 tham chiếu ảnh cũ ở mọi trang (mạnh hơn yêu cầu "0 ở thẻ trang chủ"). ✓
- Grep `01-tong-quan.png`: còn match **chỉ** trong `.mdx` solutions/case-studies và `/dev/components` (ngoài scope trang chủ) ⇒ thẻ trang chủ 0 ref. ✓
- Grep `SolutionCard` toàn `src`: chỉ 3 call site — `SolutionGridHome.tsx:23`, `solutions/enterprise/page.tsx:47`, `solutions/ai/page.tsx:55` (đều `shot={solution.cardImage !== undefined}`). Không có component nào khác bị ảnh hưởng. ✓
- `cardStyles.ts` đọc trực tiếp: `cardLinkClass` / `cardImageClass` / `cardShotFrameClass` không chứa class home-specific; diff chỉ ở call site trong `SolutionCard.tsx`. ✓
- `Reveal.tsx:36-45`: container chính là `.reveal` + `className` truyền vào (ở home = `grid md:grid-cols-2 lg:grid-cols-3`), mỗi child bọc trong `div.reveal-item` ⇒ `.reveal-item` **là grid item** ở home (stretch) và **không** là grid item ở 2 trang solutions (nằm trong `<li>`). Khớp đúng luận điểm blast radius.
- `globals.css:94-96`: `.reveal-item` chỉ set `transition`, không set `height`/`display` ⇒ xác nhận phân tích `h-full` ở trên.
- Đọc trực tiếp 3 file ảnh: nội dung khớp 100% mô tả trong change file (điện thoại + 4 icon chart/nhân sự/cài đặt/lưới app · khối AI + sparkle/chat/tài liệu/code · cửa sổ app + dashboard biểu đồ + nhóm người). ✓

## Kiểm theo trọng tâm

1. **Mapping ảnh đúng thứ tự (vi + en)** — ✅ OK. `home.ts:12→24`, `13→25`, `14→26`; href tương ứng `/solutions/enterprise`, `/solutions/ai`, `/products` (EN có prefix `/en` được `SolutionGridHome.tsx:27` strip). Nội dung 3 ảnh đã đối chiếu bằng mắt.
2. **`alt` đúng ngôn ngữ / đúng ảnh / không mojibake** — ✅ OK. VI: "Minh hoạ điện thoại với biểu đồ tăng trưởng, hồ sơ nhân sự, cài đặt và lưới ứng dụng" / "…khối AI với các biểu tượng tạo sinh, hội thoại, tài liệu và mã nguồn" / "…cửa sổ ứng dụng với bảng điều khiển biểu đồ tăng trưởng và nhóm người dùng". EN tương ứng đủ 3 thẻ, mô tả đúng nội dung ảnh, tiếng Anh tự nhiên. UTF-8 đọc sạch, không `?`/`Ã`/replacement char.
3. **Bỏ `shot: true` có hỏng schema không** — ✅ OK. `HomeContent.solutionCards[].shot?: boolean` (`home.ts:4`) và `SolutionItem.shot?` (`SolutionGridHome.tsx:11`) đều **optional**; `SolutionCardProps.shot` default `false`. Bỏ field ở data ⇒ hợp lệ, `typecheck` không thể vỡ vì field optional và call site dùng `solution.shot ?? false`.
4. **`h-full flex flex-col` + `flex-1` + `mt-auto` có thật sự cho thẻ cao đều + CTA thẳng hàng, và có hồi quy 2 trang kia không** — ✅ OK (xác minh bằng cấu trúc DOM + CSS math, không có browser):
   - Home: grid item = `.reveal-item` → `align-items: stretch` cho **definite height** ⇒ `h-full` (height:100%) resolve thật ⇒ 3 `Link` cao bằng row height ⇒ thẻ cao đều; trong `Link` (flex column), ảnh giữ `aspect-[16/10]`, thân `flex-1` giãn, CTA `mt-auto` bị đẩy xuống đáy ⇒ tiêu đề cùng mốc trên, CTA cùng mốc dưới. **Đúng cơ chế mong muốn.**
   - `/solutions/enterprise` + `/solutions/ai`: grid item là `<li>`, `Link` nằm sau `<li>` → `div.reveal` → `div.reveal-item` (**không** phải grid item, không set height). `height: 100%` của một phần tử cha `height: auto` ⇒ resolve về `auto`; `flex-1` không có free space; `margin-top: auto` khi không có free space ⇒ computed `0`. Ngoài ra đổi `display` từ `block` sang `flex` không đổi bố cục (mọi con đều full-width, không margin ⇒ không có margin-collapse bị mất). ⇒ **không hồi quy**.
   - `flex` vs `block` trong `cardLinkClass`: Tailwind phát `.flex` sau `.block` trong cùng property group `display` ⇒ `flex` thắng; đồng thời nhánh `shot` cũng đã đi qua tổ hợp này nên không phải behavior mới chưa từng chạy.
   - Spacing CTA: `mt-auto pt-4` thay `mt-4` — khi **không** có free space (đúng trường hợp 2 trang solutions) `margin-top: auto` = 0 và `pt-4` giữ đúng 16px khoảng cách cũ ⇒ không hồi quy khoảng cách.
5. **Ảnh hưởng AppCard/ProductCard/CaseStudyCard** — ✅ OK. Chỉ `SolutionCard.tsx` + call site thay đổi; `cardStyles.ts` (nguồn class dùng chung) không đổi nội dung; grep xác nhận không component nào khác import `SolutionCard`.
6. **Regression a11y / i18n / overflow** — ✅ OK. `alt` mô tả thật (không rỗng, không "image"); CTA `min-h-11` = 44px (touch target đạt); `focus-visible` outline giữ nguyên trong `cardLinkClass`; `motion-safe:`/`prefers-reduced-motion` (Reveal + `globals.css:118-123`) không đổi; ảnh `w-full` + `aspect-[16/10]` (không thêm chiều rộng cứng) ⇒ không tạo horizontal scroll; EN link vẫn đúng qua strip `/en`.

## Responsive Checklist Gate

Diff **có đụng UI** (`SolutionCard.tsx`) + project có block `ui:` trong `project-config.md` → gate **áp dụng**.
Breakpoints từ `ui.responsive_breakpoints`: `[640, 768, 1024, 1280, 1536]`; test theo 3 mốc đại diện **375 / 768 / 1280** (mobile / md / lg) — kiểm bằng CSS math + cấu trúc DOM (không có browser, ghi rõ ở Residual risk).

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout — không horizontal scroll | **OK** | Ảnh `w-full` + `aspect-[16/10]`; grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` (Tailwind `min-width`, mobile-first); container `mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8` — không width cố định px. Ở 375 = 1 cột, 768 = 2 cột, 1280 = 3 cột. |
| Layout — cột dùng auto-fit/minmax | **N/A (pre-existing)** | Grid dùng `grid-cols-*` cố định theo breakpoint (không `auto-fit`), nhưng **không thuộc diff này** và không gây tràn/overflow. Ngoài scope change. |
| Layout — container không fixed px | **OK** | `max-w-container` + `w-full`. |
| Typography — rem (không px) | **OK** | `--text-h3: clamp(1.375rem, 1.25rem + 0.5vw, 1.5rem)` (`globals.css:47`) — rem + `clamp()` fluid. |
| Typography — heading fluid (`clamp()`) | **OK** | Như trên; class `text-h3` trên `h3` của `SolutionCard` không đổi. |
| Spacing theo scale | **OK** | `p-4` / `mt-2` / `pt-4` (scale Tailwind 4px); `mt-auto` không phải magic number. |
| Media — `max-width:100% / height:auto` + `aspect-ratio` | **OK** | `HomeImage` render `next/image` với `className="aspect-[16/10] w-full … object-cover"` (`cardImageClass`) ⇒ có aspect-ratio, không cần `max-width` do `w-full`. |
| Media — `srcset`/`sizes` | **OK** | `sizes={cardImageSizes}` = `(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw` — khớp đúng số cột 3/2/1. `next/image` sinh `srcset` theo `sizes`. |
| Media — video/embed aspect-ratio | **N/A** | Không có video/embed trong diff. |
| Touch — target ≥ 44×44px mobile | **OK** | Cả thẻ là `Link` (vùng chạm lớn); CTA `inline-flex min-h-11 items-center` = 44px. |
| Touch — nav hamburger trên mobile | **N/A** | Diff không đụng nav. |
| Touch — table scroll/card layout | **N/A** | Không có table trong diff. |
| Viewport — không `100vh` đơn thuần | **OK** | Diff không thêm `vh` nào. |
| A11y — `prefers-reduced-motion` | **OK** | `Reveal.tsx:18-22` + `globals.css:118-123` giữ nguyên; thẻ dùng `motion-safe:` cho transition/hover. |
| A11y — không che lỗi bằng `overflow:hidden` | **OK** | `overflow-hidden` chỉ có ở nhánh `shot` (khung ảnh, pre-existing) — không dùng để che tràn layout. |

**Không mục nào FAIL** → gate responsive không chặn PASS.

## Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| `aislop scan --changes --json` (score ≥ 80) | **skip** | Shell bị `permission.rejected` ⇒ không chạy được CLI; không có config aislop trong repo (glob `.aisloprc*`/`aislop*` = 0). Thay thế bằng đọc tay diff: 0 narrative comment mới, 0 `as any`, 0 dead code, 0 swallowed error, 0 TODO stub. |
| `npx oxlint` (anti-slop) | **skip, oxlint not configured** | Không tìm thấy `.oxlintrc*` / cấu hình oxlint trong repo. |
| `ocr` (open-code-review) | **skip, ocr not installed** | Không có config/CLI `ocr` trong repo; không cài. Không chặn PASS. |
| AI-readable gate (`ai-readable-codebase` §6) | **OK** | Đếm indicator: 0 tên mơ hồ mới; `SolutionCard` 63 dòng, không hàm > 50 dòng; độ sâu indirection không tăng; không magic number mới; không comment WHAT mới; không đổi luồng chính (chỉ thêm class căn chỉnh) ⇒ **0 indicator** (< 3). |
| ai-friendly-web | **N/A** | Task không public-facing mới (không thêm route/trang); `llms.txt`/`robots.txt`/`sitemap.xml` không nằm trong diff. |
| blitzstrike (pentest) | **skip** | Chỉ áp dụng cho STRICT task nhạy cảm auth/API public/input; task này không có attack surface mới. |

## Findings

### [MINOR] F1 — 2 asset SVG bị orphan sau khi thay ảnh
`public/images/illustrations/ai-analysis.svg`, `public/images/illustrations/ai-apps.svg` còn tồn tại nhưng **0 tham chiếu** trong toàn bộ `src/` (grep xác nhận) ⇒ dead asset.
- Ảnh hưởng: không gây lỗi runtime/typecheck/build; chỉ tăng weight repo.
- Đề xuất: xoá trong một task dọn dẹp, hoặc ghi nhận sang change pending `2026-10-12-solution-card-real-images.md` nếu còn ý định dùng. **Không** xử lý trong task này (ngoài scope — change file §2.1 chỉ nói thay `image`).

### [MINOR] F2 — Field `shot` trên data trang chủ giờ không nơi nào set `true`
`HomeContent.solutionCards[].shot?: boolean` (`src/content/home.ts:4`) và `SolutionItem.shot?` (`src/components/home/SolutionGridHome.tsx:11`) vẫn khai báo + `SolutionGridHome.tsx:28` vẫn truyền `shot={solution.shot ?? false}`, nhưng data không còn set.
- Không phải dead code (component `SolutionCard` còn hỗ trợ nhánh `shot` cho 2 trang solutions, và field là API data-driven hợp lệ).
- Đề xuất: giữ nguyên (tránh churn); nếu muốn sạch, ghi chú lý do giữ field trong change file. Chỉ là quan sát, **không** phải defect.

### [MINOR] F3 — `object-cover` cắt ~5–6% mỗi mép ảnh
Ảnh 557×390 / 555×390 / 554×390 ≈ tỉ lệ **1.428**, khung CSS `aspect-[16/10]` = **1.60** ⇒ `object-cover` phóng theo bề rộng và cắt tổng ~10.7% chiều cao (≈ 5.4% mỗi mép trên/dưới).
- Với 3 illustration phẳng có lề trắng rộng (đã xem ảnh), không mất chi tiết nhận diện; **chấp nhận được**.
- Đề xuất (tùy chọn, không bắt buộc): nếu user muốn thấy đủ 100% ảnh → đổi khung sang `aspect-[10/7]` cục bộ cho thẻ trang chủ, hoặc crop sẵn asset về 16:10. **Không** xếp MAJOR vì đúng chủ ý "ảnh illustration, không có chữ cần giữ" trong change file.

### [MINOR] F4 — `mt-auto pt-4` trên span CTA: nghi vấn lệch dọc rất nhỏ, cần mắt người xác nhận
`SolutionCard.tsx:40` — CTA `inline-flex min-h-11 items-center` + `pt-4`: padding-top nằm bên trong box 44px nên tâm chữ có thể lệch xuống vài px so với `items-center` thuần.
- Tính đối xứng giữa 3 thẻ **không** bị ảnh hưởng (cả 3 dùng cùng class ⇒ vẫn thẳng hàng với nhau), nên không phá AC.
- Đề xuất: xác nhận bằng mắt ở 375/768/1280; nếu lệch, chuyển sang `mt-auto` + `pt-4` trên wrapper thay vì trên span.

### Không có [CRITICAL] / [MAJOR]

## Verdict

**✅ PASS** (NORMAL, round-1)

- Không có CRITICAL/MAJOR. 4 finding MINOR: 3 là quan sát/nice-to-have, 1 (F1) đề xuất dọn ở task khác.
- Không phải bug task ⇒ không áp dụng điều kiện repro closure.
- Cả 7 Acceptance Criteria ở tầng **code/data/asset** đã được xác minh độc lập bằng Read/Grep (mapping ảnh, bỏ `shot`, class căn chỉnh, 0 ref ảnh cũ ở trang chủ, không hồi quy 2 trang solutions, không đổi OG/JSON-LD/sitemap, không đổi `cardStyles`).
- Responsive gate: không mục FAIL.

## Residual risk / Blocked

1. **Blocked — shell `permission.rejected`**: không chạy lại được `npm run lint` / `typecheck` / `build`. Các claim này chỉ còn là attestation của primary; đã bù bằng kiểm chứng nguồn (type-safety tự suy ra được, vì `shot` optional).
2. **Không xác minh được HTML build**: glob (kể cả `hidden: true`) cho `.next/server/app/*.html` trả **rỗng** ⇒ artifact build không hiện diện trong worktree tại thời điểm review. Claim "3 ảnh mới ×1, ảnh cũ ×0" được thay thế bằng grep nguồn (kết quả thậm chí mạnh hơn: 0 ref ảnh cũ **toàn repo src**), và claim "2 trang solutions không đổi" được thay bằng phân tích DOM/CSS (`<li>` → `.reveal` → `.reveal-item` không là grid item).
3. **Chưa render browser thật**: "3 thẻ cao đều / text thẳng hàng" chưa nhìn bằng mắt. Xác minh bằng CSS math (grid stretch ⇒ `.reveal-item` definite height ⇒ `h-full` resolve; `mt-auto` đẩy CTA xuống đáy) — kết luận khớp, nhưng vẫn là suy luận. Kèm 2 yếu tố chỉ thấy khi render: (a) F4 lệch dọc vài px, (b) nhãn "Giải pháp Doanh nghiệp" có thể wrap 2 dòng ở đúng mốc `lg` ⇒ mô tả thẻ 1 lệch 1 dòng so với 2 thẻ kia (ước lượng bề rộng ~338px > ~230px nên nhiều khả năng không xảy ra — cần render xác nhận).
4. **Không có `git diff`/`git status`** (shell denied) ⇒ không tự xác minh được "surgical diff" (rằng chỉ đúng 2 file code + 3 asset thay đổi). Đã kiểm gián tiếp: nội dung `cardStyles.ts`, `SolutionGridHome.tsx`, `Reveal.tsx`, `globals.css` đều **không** chứa dấu vết thay đổi phục vụ task này; grep `SolutionCard` xác nhận chỉ 3 call site.
5. **Process note**: số lượt tool đọc (Glob/Grep/Read) của vòng review này vượt cap tham chiếu NORMAL (15) do phải mở rộng kiểm chứng asset/orphan và CSS token; đã dừng ngay khi đủ bằng chứng, không lặp tool.

> Report scoped: reviewer **không** sửa source. Có thể commit task theo `AGENTS.md` § Commit-First Tracking (branch `main`, **KHÔNG push**), và ghi nhận F1 như việc dọn dẹp ở task/change riêng.
