# Review — change-products-carousel-image-size · phase-1 · task-01 · round-1

**Agent: reviewer**

- Ngày: 2026-10-12
- Task: `tasks/change-products-carousel-image-size/phase-1-task-01.md`
- Change file: `spec/changes/2026-10-12-products-carousel-image-size.md`
- Scope diff: `src/components/products/ScreenshotCarousel.tsx` (2 dòng)

## Review level

**NORMAL**

**Reason:**
- Scope rất hẹp: 1 file, 2 dòng, thuần Tailwind class + prop `sizes` của `next/image`.
- Đã grep xác nhận `ScreenshotCarousel` chỉ import ở `src/app/[locale]/products/page.tsx` (1 caller nội bộ, không shared component, không API/auth/schema/tenant/DB).
- Không thuộc danh sách risk đỏ (không đụng auth/RBAC, tenant, migration, API contract, payment, cron, upload/session).
- Không cần `STRICT`. `FAST` không chọn vì diff đụng UI (bắt buộc chạy Responsive Checklist Gate đầy đủ) và vì verify commands của reviewer bị chặn → không đủ điều kiện "scope rất hẹp + builder đã test PASS có kiểm chứng".

Model check: reviewer `opencode-go/deepseek-v4.1-flash` ≠ builder `openai/gpt-6-luna` (khác họ provider) — đúng soft-rule `.context/project-config.md`.

## Blast radius

- `ScreenshotCarousel` chỉ dùng ở `/products` + `/en/products` → blast radius đúng như task mô tả.
- Ảnh hưởng phụ (gián tiếp, có kiểm soát): `AppCard` (vị trí truyền `media`), `cardPosterImageClass` / `CARD_POSTER_IMAGE_RATIO` (không đổi), `ProductCard` (home — dùng cùng khung 9/16 nhưng **không** đụng file này).
- Không đụng `next/image` loader/config, không đụng `products/page.tsx` grid, không đụng `cardStyles.ts` (`cardImageSizes` vẫn giữ cho 4 card khác: SolutionCard/ProductCard/PostCard/CaseStudyCard — grep xác nhận 10 chỗ dùng, tất cả ngoài diff).

## Verify commands + result

| Command (profile) | Result |
|---|---|
| `npm run typecheck` (= `tsc --noEmit`) | **Blocked** — shell permission denied |
| `npm run lint` (= `eslint .`) | **Blocked** — shell permission denied |
| `npm run build` (= `next build`) | **Blocked** — shell permission denied |
| `git diff src/components/products/ScreenshotCarousel.tsx` | **Blocked** — shell permission denied (dùng static read thay thế) |
| `git status --short` | **Blocked** — shell permission denied |

**Chi tiết:** lần gọi `shell` đầu tiên bị `permission.rejected: Permission denied: shell`. Theo Tool Loop Guard → dừng ngay, không retry, không đổi biến thể. Reviewer chuyển sang static analysis theo chỉ dẫn user.

**Static analysis đã thực hiện thay thế (đủ để kết luận cho diff 2 dòng):**
- `Read` file end-state: `ScreenshotCarousel.tsx:63` = `"w-full shrink-0 snap-start"`; `:67` `sizes="(min-width: 1024px) 256px, (min-width: 768px) 45vw, 100vw"` → khớp đúng mô tả change.
- `Grep "md:w-1/2|lg:w-1/3"` trong `src/` → **0 match** → class 3-up đã bị xoá hoàn toàn, không còn sót ở chỗ khác.
- `Grep "ScreenshotCarousel"` → chỉ 1 import + 1 JSX ở `products/page.tsx` → blast radius đúng.
- `Grep "cardImageSizes"` → 10 chỗ dùng ở 4 card khác; hằng số này KHÔNG bị đụng.
- `Read` `AppCard.tsx` / `products/page.tsx` / `cardStyles.ts` → bố cục card 2 cột và khung 9/16 **không đổi**.
- `Read` `package.json` → 3 check command thật tồn tại (`eslint .`, `tsc --noEmit`, `next build`).
- `Read` `tailwind.config.ts` (grep) → `maxWidth.container: '1280px'` → dùng cho CSS math bên dưới.
- `Glob .next/server/app/**/products.html` → **no files found** → không có artifact build để kiểm chứng bằng HTML (khác với các change trước có build output).
- `Glob .context/runs/*carousel*.md` → **no files found** → không có Run Journal cho change này.

**Hệ quả:** acceptance `lint · typecheck · build PASS` và `git status` scope check **chưa được kiểm chứng bằng máy**. Đây là Residual risk (LOW, xem cuối report) — **primary PHẢI chạy lại `npm.cmd run lint` / `npm.cmd run typecheck` / `npm.cmd run build` + `git status --short` trước khi commit**. Nếu build fail thì verdict này vô hiệu.

## CSS math — kiểm chứng `sizes` "khớp layout 1-up"

Chuỗi co giãn (đã đọc source, không đoán):

| Tầng | File:line | Class |
|---|---|---|
| Page grid | `products/page.tsx:49` | `max-w-container` (1280px) + `px-4 sm:px-6 lg:px-8`, `gap-6`, `lg:grid-cols-2` |
| Card | `AppCard.tsx:17-18` | `p-5 md:p-8`, `grid gap-6 md:grid-cols-2` |
| Slide | `ScreenshotCarousel.tsx:63` | `w-full` (100% cột media) |

Bề rộng cột media thực (ảnh hiển thị):

| Viewport | Cột media thực | `sizes` mới | Δ |
|---|---|---|---|
| 375 | ≈ 303px (`375−32−40`) | `100vw` = 375px | +24% (over, an toàn) |
| 768 | ≈ 316px (`(768−48−64−24)/2`) | `45vw` = 345px | +9% |
| 1023 | ≈ 443px | `45vw` = 460px | +4% |
| 1024 | ≈ 190px | `256px` | +35% |
| 1279 | ≈ 254px | `256px` | +0.8% |
| ≥1280 (container cap 1280) | 254px (`(1280−64−24)/2 → −64 → −24)/2`) | `256px` | +0.8% ✔ |

Kết luận: `sizes` **luôn ≥ bề rộng thực** ở mọi mốc breakpoint → `next/image` không bao giờ chọn candidate nhỏ hơn khung → **không mờ**, đúng mục tiêu "khớp layout 1-up". Sai số chỉ theo hướng overfetch nhẹ (bandwidth), chấp nhận được. `256px` khớp chính xác cột media tại viewport ≥1280 (254px làm tròn lên) — đúng như task/spec-validation §5 ghi.

## Responsive Checklist Gate

Áp dụng: project có UI (`ui:` trong `project-config.md`) **và** diff đụng UI (Tailwind class + `sizes` ảnh). Breakpoints nguồn: `[640,768,1024,1280,1536]`; test theo 375/768/1280.

Không có môi trường browser → xác minh bằng CSS math + đọc source (đã ghi trong Residual risk).

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout — không horizontal scroll | **OK** | Slide `w-full` nằm trong `flex overflow-x-auto snap-x` (carousel tự cuộn nội bộ, có chủ đích). 1 slide/1 ảnh → content = 100% → không overflow. Diff không tạo/xoá overflow nào ở document level. |
| Layout — mobile-first | **OK** | Slide dùng class base `w-full` + `snap-start` (base-first), biến thể `md:/lg:` cũ đã **bị gỡ** → base áp cho mọi width. |
| Layout — grid `auto-fit`/`minmax` | **N/A** (ngoài scope) | Diff không đụng grid. `lg:grid-cols-2` (page) + `md:grid-cols-2` (AppCard) là cột cố định **có sẵn**, không phải do diff này → ghi ngoài scope, đề xuất task riêng nếu muốn siết. |
| Layout — container không fixed px | **N/A** (ngoài scope) | `max-w-container: 1280px` có sẵn từ trước, diff không đụng. |
| Typography/Spacing — font `rem`, heading `clamp()`, spacing scale | **N/A** | Diff không đổi font-size/spacing. Tailwind dùng rem/scale built-in. |
| Media — `max-width:100%` + `aspect-ratio` | **OK** | `cardPosterImageClass` = `aspect-[9/16] w-full object-cover` (`cardStyles.ts:11`), `next/image` nhận `width=900 height=1600` (`CARD_POSTER_IMAGE_RATIO`) → không CLS; khung 9/16 khớp poster 941×1672 → `object-cover` không cắt đáng kể. |
| Media — `srcset`/`sizes` quan trọng | **OK** | Diff chính là cập nhật `sizes`; `next/image` tự sinh `srcset` từ config AVIF/WebP (layer-4-task-02). Giá trị `sizes` đã verify bằng CSS math ở mục trên. |
| Media — video/embed `aspect-ratio` | **N/A** | Diff không có video/embed. |
| Touch/Interaction — target ≥44×44px | **OK** | Diff không đụng; dots/arrow giữ `min-h-11 min-w-11` (=44px) — `ScreenshotCarousel.tsx:74,75,84`. |
| Touch/Interaction — nav mobile không tràn | **OK** | Carousel: swipe native (`snap-x snap-mandatory`) là cách điều hướng chính trên mobile; arrow chỉ render khi `screenshots.length > 1` (hiện mỗi product có 1 ảnh → không render). |
| Touch/Interaction — table scroll/card | **N/A** | Không có table trong diff. |
| Viewport — không `100vh` đơn thuần | **OK** | Diff không dùng viewport unit đơn thuần. |
| Viewport — `prefers-reduced-motion` | **OK** | `scrollToIndex` dùng `matchMedia('(prefers-reduced-motion: reduce)') → 'instant'` (`:36`); container giữ `motion-reduce:snap-none motion-reduce:scroll-auto` (`:61`). Diff không gỡ. |
| Viewport — không che lỗi bằng `overflow:hidden` | **OK** | Diff không thêm `overflow:hidden`. |

**Không có mục nào FAIL** → gate không kéo verdict xuống.

## Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| `aislop scan --changes` | **Blocked** | Shell permission denied → không chạy được. Kiểm tra thủ công trên diff: **không** thêm narrative comment, dead code, swallowed error, fallback ẩn, `as any`, todo stub. Diff = 2 thay đổi giá trị string, 0 dòng code logic. Rủi ro slop ≈ 0. |
| anti-slop / `oxlint` | **skip, oxlint not configured** | `package.json` devDeps không có `oxlint` (chỉ eslint 8 + eslint-config-next). |
| open-code-review (`ocr`) | **skip, cannot verify install** | Không có shell để kiểm tra `ocr`; task NORMAL không nhạy cảm và diff 2 dòng class → không bắt buộc, không chặn PASS. |
| AI-readable gate | **OK** | 0 tên mơ hồ mới, 0 hàm mới, 0 indirection mới, 0 comment WHAT. Chỉ 1 indicator yếu: magic number `256px` không kèm comment (xem MINOR-1). Tổng < 3 → không FAIL. Không đổi luồng chính → không cần cập nhật README/ARCHITECTURE. |
| AI-friendly web | **N/A** | Diff không thêm route/public surface; `llms.txt`/`robots.txt`/`sitemap.xml` đã có từ layer-4-task-01 (theo `progress.json`), diff không đụng. |
| Blitzstrike pentest | **skip** | Không áp dụng: NORMAL, không có attack surface mới (không input/auth/API/upload). |
| Impeccable / frontend-checklist / security skill | **OK (soi tĩnh)** | Không đổi visual craft ngoài ý muốn, không đổi semantics/a11y, không có bề mặt bảo mật. |

## Requirements / Acceptance coverage

| Acceptance (task + change file) | Verdict | Bằng chứng |
|---|---|---|
| Slide 1 ảnh/slide (`w-full`), hết `md:w-1/2 lg:w-1/3` | **PASS** | `ScreenshotCarousel.tsx:63` + grep toàn `src/` = 0 match. |
| Ảnh poster to lên rõ rệt (≈3×), không crop | **PASS** | Slide 1/3 cột media → 1/1 (×3). Khung `aspect-[9/16]` khớp poster 941×1672 → `object-cover` không cắt. |
| Bố cục card 2 cột giữ nguyên | **PASS** | `AppCard.tsx:18` vẫn `md:grid-cols-2`; `products/page.tsx:49` vẫn `lg:grid-cols-2` (đã read, không đổi). |
| `sizes` khớp 1-up | **PASS** | CSS math ở trên: never-underestimate, khớp 254px tại ≥1280. |
| Dots/arrow/scroll-snap/a11y giữ nguyên | **PASS** | Read `:59-92`: `role="region"`, `aria-roledescription`, `aria-label`, `aria-current`, `tabIndex={0}`, `min-h-11 min-w-11`, reduced-motion — không dòng nào đổi ngoài `:63` và `:67`. |
| `/products` + `/en/products` render, không méo/overflow | **Partial** | Static OK (cùng 1 component, cùng grid; `w-full` trong `overflow-x-auto` không sinh overflow trang). Chưa render bằng browser → Residual risk. |
| lint · typecheck · build PASS | **Unverified** | Shell denied → primary phải chạy lại. |
| Không đụng file ngoài scope (Header.tsx dirty giữ nguyên) | **Unverified (LOW)** | Không chạy được `git status`/`git diff --stat`. Nội dung scope đã đọc đúng end-state; không có bằng chứng file khác bị sửa trong phạm vi đọc được. |

Surgical diff (karpathy-guidelines): 2 dòng, trace 1-1 về `Description` mục 1 & 2 của task; **không** drive-by refactor, **không** over-engineer, không đụng `cardImageSizes`/`cardStyles.ts`. → **OK**.

File ≤300 dòng / hàm ≤50 dòng: `ScreenshotCarousel.tsx` = 95 dòng; hàm dài nhất `updateActiveIndex` = 11 dòng. → **OK**. `sizes` không hardcode domain/secret; không có bề mặt security.

## Findings

### MINOR-1 — `256px` là magic number không kèm giải thích
`src/components/products/ScreenshotCarousel.tsx:67`
Giá trị `256px` chỉ đúng vì `max-w-container: 1280px` (`tailwind.config.ts:48`) ⇒ cột media = 254px. Nếu tương lai đổi `max-w-container` hoặc `AppCard` padding, chuỗi `sizes` sẽ âm thầm lệch (và lệch theo hướng *có thể* gây mờ nếu cột media > 256px).
**Fix đề xuất (non-blocking):** tách hằng số có tên + comment, ví dụ trong `cardStyles.ts`:
```ts
// Cột media của carousel 1-up trên /products: cột ≈ 254px khi container cap 1280px.
export const carouselPosterImageSizes = '(min-width: 1024px) 256px, (min-width: 768px) 45vw, 100vw';
```
Không chặn PASS (giá trị hiện tại đúng).

### MINOR-2 — Evidence verify chưa có artifact
- `tasks/change-products-carousel-image-size/phase-1-task-01.md`: toàn bộ checkbox Acceptance còn `[ ]`, `## Feature Verification` vẫn là `(điền sau khi builder/reviewer chạy)`, `DoD` chưa tick.
- Không có Run Journal `.context/runs/*carousel*.md` và không có `.next/server/app/**/products.html` để đối chiếu HTML như Verification Plan đề ra.
**Fix đề xuất:** primary điền `Feature Verification` + tick Acceptance sau khi chạy thật 3 verify command, và (nếu build lại) grep `.next/server/app/**/products.html` xác nhận `md:w-1/2`/`lg:w-1/3` vắng mặt. Non-blocking với verdict nhưng **bắt buộc trước commit**.

### MINOR-3 — `sizes` nhánh <768 overfetch
`(min-width: 768px) 45vw, 100vw` trong khi cột media thực ≈ `100vw − 72px` (px-4 + p-5) ở mobile và `45vw − ~30px` ở md.
Ảnh hưởng: tải ảnh lớn hơn cần ~10–25% ở mobile — **an toàn** (không blur), chỉ tốn bandwidth.
**Fix đề xuất (tùy chọn):** `(min-width: 768px) calc(45vw - 32px), calc(100vw - 72px)`. Không bắt buộc.

### Minh bạch hoá (không phải finding)
- Khi sản phẩm tương lai có >1 screenshot: người dùng sẽ phải swipe/arrow nhiều hơn (1-up). Đúng theo quyết định user đã chốt, đã ghi ở change file §2 — không phải regression.
- `gap-3` trên carousel 1-up hiện là vô hại (1 slide), giữ nguyên là hợp lý.

**Không có finding CRITICAL / MAJOR.**

## Verdict

**✅ PASS** (điều kiện: primary chạy `npm.cmd run lint` · `npm.cmd run typecheck` · `npm.cmd run build` + `git status --short` trước khi commit; nếu build fail thì verdict vô hiệu và task phải quay lại builder).

Lý do PASS: diff 2 dòng đúng 100% mô tả change; acceptance về layout/1-up/`sizes`/card 2 cột/a11y đều đạt và được kiểm chứng tĩnh (read + grep + CSS math); không có CRITICAL/MAJOR; Responsive Checklist Gate không có mục FAIL; surgical diff sạch; không có bề mặt security/auth/schema.

## Residual risk / Blocked

1. **Blocked — verify commands:** `shell` permission denied (không retry theo Tool Loop Guard). `lint`/`typecheck`/`build`/`git status`/`git diff` **chưa chạy được**; toàn bộ kết luận dựa trên static analysis. → **primary phải chạy và ghi evidence.**
2. **Chưa render browser** ở 375/768/1280 → phần "không méo/overflow" chỉ mới verify bằng CSS math (`w-full` trong `overflow-x-auto`; `aspect-[9/16]` khớp tỉ lệ ảnh).
3. **Không xác nhận được danh sách file dirty** (Header.tsx dirty sẵn ngoài scope): không kiểm chứng được diff không "dính" file ngoài scope, và không xác nhận Header.tsx còn nguyên trạng thái dirty. → primary dùng `git status --short` + `git diff --name-only` xác nhận chỉ `ScreenshotCarousel.tsx` thuộc change này; **KHÔNG** stage/revert `Header.tsx`.
4. **Doc impact "none"** chưa đối chiếu trực tiếp `docs/DESIGN.md` (ngoài cap đọc tool) — dựa trên khai báo của task + change file. Rủi ro thấp.
5. `aislop`/`ocr` không chạy được (shell denied / chưa xác minh cài đặt) — không chặn PASS.
