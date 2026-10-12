Agent: reviewer

# Review — change `solution-detail-redesign` · Phase 1 · Task 06 · round 1

- **Repo / branch:** `D:\prj\nta-web` · `main` · change source: `spec/changes/archive/2026-10-11-solution-detail-redesign.md`
- **Scope review:** T6 (follow-up sau khi user duyệt) — diff **chưa commit** gồm 7 file:
  - A. crop F1: `src/content/solutions/{vi,en}/{crm,dentgo}.mdx` (+ 2 file ảnh `public/images/solutions/v2/{crm,dentgo}/01-tong-quan-crop.png`)
  - B. fix CTA link: `src/components/solutions/SolutionHero.tsx`, `src/app/[locale]/solutions/enterprise/[slug]/page.tsx`, `src/app/[locale]/dev/components/page.tsx`
- **Journal builder:** `.context/runs/change-nta-website-solution-detail-T6.md`

## Review level

**NORMAL** (giữ nguyên như chỉ định).

**Reason:** thay đổi là content data (mdx) + sửa href/component CTA; **không** đụng auth/RBAC, tenant, DB/schema/migration, API contract/DTO, payment, cron/webhook, file access.
Tuy nhiên `SolutionHero.tsx` là **shared component** (mọi trang enterprise × 2 locale + `/dev/components`) và đổi **cơ chế điều hướng** của CTA → đã kiểm sâu phần locale/link (đọc source `next-intl` trong `node_modules`) thay vì chỉ tin builder.

**Không nâng STRICT:** không tìm thấy rủi ro đỏ. Link locale/hash đã được chứng minh đúng bằng source (`isLocalizableHref`); ảnh crop giữ tỉ lệ tự nhiên, không bị cắt/fade oan.

## Blast radius

| Vùng | Ảnh hưởng |
|---|---|
| `SolutionHero` | 4 trang enterprise × 2 locale (`/vi|/en/solutions/enterprise/{crm,hrm,lms,dentgo}`) + `/dev/components` (dev-only). Đổi `<a>` → `Link` cho **cả** primary + secondary CTA; prop contract `primaryCta.href` = đường dẫn **tương đối** được ghi rõ trong doc comment. |
| `LmsCtaBlock` | chỉ layout LMS ×2 locale. Bỏ prop `locale` → không còn `localizedPath` trong render path. |
| 4 file `.mdx` (vi/en × crm/dentgo) | `features[0].image` + `imageAlt` + `ratio` (ảnh hiển thị ở section zig-zag, không phải hero). |
| Ngoài ảnh hưởng | `canonical`/metadata (T6 chỉ đổi comment ở `page.tsx:174`), schema/`types.ts`, DB, API, AI pages (không có call site nào truyền URL tuyệt đối vào `SolutionHero` — nếu có thì `Link` truyền thẳng, hành vi không đổi). |

## Verify commands + result

| Command | Result |
|---|---|
| `npm.cmd run lint` | **NOT RUN** — `shell` bị `permission.rejected` (permission denied) ngay lần gọi đầu. Theo Tool Loop Guard: dừng, không retry/đổi biến thể → chuyển sang đọc source + evidence. |
| `npm.cmd run typecheck` | **NOT RUN** — cùng lý do |
| `npm.cmd run build` | **NOT RUN** — cùng lý do |
| `node scripts/screenshots/.tmp/verify-t6.mjs` (HTTP `127.0.0.1:3000`) | **NOT RUN** — cùng lý do. Đã **đọc script** để kiểm phương pháp: 22 asserts (9/slug × 2 slug + 3 LMS VI + 1 LMS EN). |
| Ảnh soi mắt (`.tmp/*.png`) | **Không đọc được**: `glob scripts/screenshots/.tmp/*.png` → empty (thư mục ẩn, tool glob bỏ qua hidden) → ghi residual risk, không thử lại. |
| Ảnh crop gốc | ✅ **ĐÃ xem trực tiếp** `public/images/solutions/v2/crm/01-tong-quan-crop.png` (4 thẻ "KHÁCH HÔM NAY 128 · ĐƠN HÔM NAY 86 · DOANH THU HÔM NAY 44.854.864đ · KHIẾU NẠI ĐANG MỞ 2", 1 hàng — khớp ratio ~6.5) và `dentgo/01-tong-quan-crop.png` (6 thẻ, 2 hàng 3 cột — khớp ratio ~3.43). → 2 file tồn tại, nội dung khớp alt. |

**Kết luận verify:** các command cấu hình trong `.context/project-config.md` **không chạy được trong session reviewer này** (shell denied) → lint/typecheck/build/HTTP **chưa được reviewer xác nhận độc lập**. Đây là residual risk đã ghi rõ, không phải FAIL (đúng rule: permission deny → ghi nhận, chuyển hướng; không fail workflow vì lý do môi trường).

## Kiểm tra đặc biệt (1 → 7)

1. **Alt crop VI/EN — OK.** Chuỗi khác hẳn alt hero, mô tả đúng nội dung dải ảnh, **không có số liệu cứng**:
   - `vi/crm.mdx:17` "Dải bốn thẻ chỉ số trong ngày: khách đến, đơn hàng, doanh thu và khiếu nại đang mở" · `en/crm.mdx:17` "A strip of four metric cards for the day: arrivals, orders, revenue and open complaints" — khớp 100% nội dung ảnh đã soi.
   - `vi/dentgo.mdx:17` "Dải sáu thẻ chỉ số trong ngày: lượt khám, ca đang điều trị, tiền dịch vụ phát sinh, lịch hẹn, đã đến và tiền đã thu" (đủ 6 thẻ) · EN tương ứng.
   - Hero alt (`vi/crm.mdx:10`, `vi/dentgo.mdx:10`) là chuỗi khác → không lặp nguyên văn. (Trùng ý — xem MINOR-3.)
2. **`ratio` khớp số đo — OK.** `2111/322 = 6.556` ✓ và `2056/600 = 3.427` ✓ khớp value trong mdx; ảnh thật đã soi có đúng bố cục tương ứng. Cơ chế hiển thị đúng nhánh: `shotLayout()` (`features.ts:42`) coi `ratio ≥ 1.0` = nhánh ngang → `imageClass = 'h-auto w-auto max-w-full max-h-… mx-auto'`, `frameClass=''`, `fade=false` → **không cắt, không fade, không có `object-cover`/`aspect-*` cứng** ⇒ không méo; `h-auto` + tỉ lệ tự nhiên của file nên `width/height` prop `1440×1440` của `ShotImage` không gây distortion (chỉ là placeholder ratio).
3. **`Link` locale — OK (kiểm bằng source `next-intl`, không chỉ đọc kết quả).** `routing.ts`: `localePrefix: 'as-needed'`, `defaultLocale: 'vi'`. Với `'/contact'`: `isLocalizableHref('/contact') === true` → `applyPathnamePrefix` prefix theo locale → **VI: `/contact`**, **EN: `/en/contact`**; `prefixPathname('/en','/contact')` không sinh `/en/en/contact` ✓ **không double prefix**.
   **Regression đã loại:** secondary CTA `href='#features'` — `isLocalizableHref('#features') === false` (hash là *relative* href) → `Link` truyền nguyên `#features` → vẫn là anchor cuộn trong trang, **không** bị đổi thành `/en#features` (nếu sai thì CTA "Xem tính năng ›" sẽ nhảy về trang chủ EN). Đã kiểm trực tiếp trong `node_modules/next-intl/dist/esm/development/shared/utils.js:13` + `navigation/shared/createSharedNavigationFns.js:34` + `BaseLink.js`.
4. **`localizedPath` — OK.** Render path của 4 trang enterprise không còn dùng nó: `page.tsx` chỉ còn import + dùng cho `canonical` (`page.tsx:52`) và comment (`page.tsx:174`); `LmsCtaBlock` đã bỏ prop `locale`, render `Link href="/contact"` (`page.tsx:176-184`) → LMS EN = `/en/contact` ✓ (khớp assert 35 của `verify-t6.mjs`).
5. **`/dev/components` — MINOR (không vỡ trang, nhưng còn 1 link sai).** Trang vẫn render (SolutionHero + preview dùng `href='/contact'` và `#features`). **Nhưng** breadcrumb vẫn giữ tiền tố thủ công → xem **MINOR-1**. (Ngoài scope: CTA cuối `Button` không có `href` — nút chết, có trước T6; `FeatureZigZag` ở preview không có `id="features"` nên anchor `#features` trong preview không có đích — có trước T6, dev-only.)
6. **Comment stale — OK.** 4 mdx đều có comment mới đúng: `vi/crm.mdx:13`, `en/crm.mdx:13`, `vi/dentgo.mdx:13`, `en/dentgo.mdx:13` = "Ảnh đầy đủ đã dùng ở hero → feature này dùng CROP phóng to vùng thẻ chỉ số (không lặp ảnh)". **Không còn** câu nào kiểu "F1 không ảnh" trong 8 file mdx (grep `^\s*(#|alt:)` toàn bộ `src/content/solutions`). `SolutionHero` doc comment mới cho `primaryCta.href` khớp code; `LmsCtaBlock` doc comment đã cập nhật lý do.
7. **Regression 4 trang enterprise + trang AI — chưa xác nhận bằng build/HTTP** (shell denied). Bằng đọc source: cấu trúc hero/CTA không đổi ngoài phần điều hướng; 2 rủi ro regression đã kiểm hết (locale prefix `/contact`, hash `#features`); không có call site nào truyền URL tuyệt đối vào `SolutionHero`. Builder claim build 51/51 + 22/22 HTTP — **reviewer không tái lập được** (residual risk).

## Responsive Checklist Gate

Diff **có** đụng UI (route/component) → gate áp dụng. Không có môi trường browser (không tự chạy app/manual repro theo rule) → xác minh bằng **CSS math + đọc ảnh gốc**.

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Không horizontal scroll | **OK** | Diff không thêm width cố định; ảnh `max-w-full` + `mx-auto` (`features.ts:44`), CTA `w-full sm:w-auto` (`SolutionHero.tsx:82,87`). (Chưa đo `scrollWidth` bằng browser → residual.) |
| Mobile-first / media query | **OK** | chỉ dùng `sm:`/`lg:` với `max-h` (`SolutionHero.tsx:67`), không đổi thứ tự breakpoint |
| Grid không cột cứng | **N/A** | diff không đụng grid |
| Typography/Spacing (`rem`, `clamp`) | **N/A** | diff không đổi font/spacing class |
| Media: `max-width:100%` + giữ tỉ lệ | **OK** | nhánh ngang: `h-auto w-auto max-w-full` + `max-h-[420px] lg:max-h-[640px]`; **không** `object-cover`, **không** `aspect-*` cứng ⇒ ảnh không méo/cắt. Đo CSS: CRM crop @375 = `343/6.556 ≈ 52px` (khớp số builder), @lg cột ~608 → `≈93px`; DentGo @375 ≈ `100px`. |
| Media: `srcset/sizes` | **Partial (residual)** | Hero truyền `sizes="(max-width:1024px) 100vw, 1280px"` (`SolutionHero.tsx:111`); đường đi của **FeatureZigZag** (dùng default sizes) chưa đọc file → residual risk, không kết luận. |
| Touch target ≥ 44px | **OK** | CTA `buttonStyles('primary'|'outline','lg')` + `w-full` mobile (`SolutionHero.tsx:82-91`, `page.tsx:182`); breadcrumb `min-h-11` (`Breadcrumb.tsx:30`) |
| Nav mobile / table scroll | **N/A** | diff không đụng nav/table |
| Viewport (`100vh`/`dvh`), `prefers-reduced-motion`, không che lỗi bằng `overflow:hidden` | **N/A** | diff không đụng các phần này |
| (Craft) đọc được nội dung ảnh ở mobile | **MINOR** | Xem MINOR-2: nhãn thẻ trong crop ~4.7px (CRM) / ~5.7px (DentGo) ở 375px → không đọc được; số chính ~10-15px → đọc được. |

**Không có mục gate nào FAIL** (mục craft ghi MINOR, không thuộc điều kiện FAIL của gate).

## Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| `aislop scan` | **skip** | không chạy được — `shell` permission denied (không retry theo guard) |
| `oxlint` (anti-slop) | **skip** | không chạy được; chưa xác minh repo có oxlint config (residual risk) |
| `ocr` (open-code-review) | **skip** | không chạy được; chưa xác minh `ocr` đã cài → không dùng để chặn PASS |
| AI-readable codebase | **OK** | đọc source: hàm ngắn (<50 dòng), tên self-descriptive, comment giải thích **WHY** (không phải WHAT), không magic number mới ngoài `ratio` có tài liệu; 0–1 indicator «chaos» (< ngưỡng 3) |
| ai-friendly-web | **N/A** | diff không đụng robots/llms.txt/sitemap/JSON-LD (chưa kiểm sự tồn tại của các file — ngoài scope T6) |
| blitzstrike (pentest) | **N/A** | task không nhạy cảm (không auth/API public/parse input) |

## Findings

### [MINOR-1] Breadcrumb `/dev/components` còn tiền tố locale thủ công → link EN `/en/en/solutions`
- **File:line:** `src/app/[locale]/dev/components/page.tsx:425` và `:448` — `href={`${prefix}/solutions`}` (với `prefix = '/en'` ở `:413`).
- **Nguyên nhân:** `Breadcrumb.tsx:30` truyền **nguyên** `href` vào `Link` của next-intl. `isLocalizableHref('/en/solutions') === true` (bắt đầu bằng `/`, không có protocol) và locale `en ≠ defaultLocale('vi')` với `as-needed` ⇒ `prefixPathname('/en', '/en/solutions')` = **`/en/en/solutions`** (link hỏng/404 ở bản EN của preview).
- **Đây đúng lớp lỗi T6 vừa sửa cho `${prefix}/contact`** trong cùng file nhưng bị sót ở breadcrumb (nhất quán: `page.tsx:72` truyền `'/solutions/enterprise'` **không** tiền tố — đó mới là contract đúng).
- **Fix đề xuất:** `href="/solutions"` (bỏ `prefix`). Sau đó biến `prefix` ở `:413` có thể không còn dùng → xoá luôn.
- **Impact:** chỉ trang dev (production trả 404) → không chặn PASS, nhưng nên sửa cùng change vì cùng file/cùng lớp lỗi.

### [MINOR-2] Ảnh crop CRM ở 375px cao ~52px → nhãn thẻ không đọc được
- **File:** `src/content/solutions/vi/crm.mdx:16-18` (+ EN), hiển thị qua `ShotImage` nhánh ngang.
- **Bằng chứng đo:** content 375px = `375 − 2×16 (px-4) = 343px` → chiều cao = `343 / 6.556 ≈ 52px`. Từ ảnh gốc đã soi: nhãn "KHÁCH HÔM NAY" ≈9% chiều cao file → render ≈ **4.7px**; số chính ≈28% → ≈ **14.6px**. DentGo (600px cao): nhãn ≈5.7px, số ≈10px.
- **Đánh giá theo tiêu chí:** **không vi phạm gate nào** — ảnh giữ tỉ lệ/không méo, không gây scroll ngang, và a11y đã được bù bằng `alt` mô tả đầy đủ chỉ số (không phụ thuộc chữ trong ảnh). Đây là vấn đề **craft/legibility** ở mobile, mức thấp, và **user đã biết + đã duyệt** quyết định "crop phóng to".
- **Đề xuất (không bắt buộc):** ở `<640px` cho phép `max-w-[480px]` (dải ≈ 73px) hoặc ẩn dải crop và giữ hero full — hoặc giữ nguyên vì `alt` đã truyền tải nội dung. Cần user quyết, không tự ý đổi.

### [MINOR-3] Alt crop lặp ý alt hero; hero alt dùng thuật ngữ khác UI thật (ngoài scope diff)
- **File:line:** `vi/crm.mdx:17` vs `:10`; `en/crm.mdx:17` vs `:10`; `vi|en/dentgo.mdx:17` vs `:10`.
- Crop alt liệt kê lại **cùng 4 chỉ số** của hero alt ( "khách đến, đơn hàng, doanh thu…") → screen reader nghe gần như lặp. Mặt khác hero alt gọi thẻ đó là "số phiếu chờ xử lý"/"open tickets" trong khi UI (và crop alt) là "KHIẾU NẠI ĐANG MỞ"/"open complaints"; DentGo hero alt "ca đang mở" vs UI/crop "Đang điều trị" → **thuật ngữ không nhất quán giữa 2 alt trên cùng trang**.
- **Lưu ý:** alt **hero** (dòng 10) là code có **trước T6**, ngoài phạm vi diff → theo rule chỉ ghi nhận + đề xuất task riêng, **không tính FAIL** cho phase này. Không yêu cầu sửa trong T6.
- **Đề xuất:** thống nhất 1 thuật ngữ theo UI thật cho cả hero + crop alt (chọn "khiếu nại đang mở"/"Đang điều trị" — đúng như ảnh).

## Ghi nhận về evidence (không phải finding chặn PASS)

- `verify-t6.mjs` assert tốt phần "alt/đường dẫn xuất hiện trong HTML" + "hero dùng 1 lần" + "không còn domain tuyệt đối", **nhưng**:
  (a) không assert ảnh crop trả **HTTP 200** (chỉ tìm chuỗi src trong HTML ⇒ thiếu file vẫn PASS) — reviewer đã bù bằng cách mở trực tiếp 2 file PNG (tồn tại, nội dung khớp);
  (b) không assert CTA EN `/en/contact` cho **crm/dentgo** (chỉ có cho LMS) — reviewer đã bù bằng đọc source `next-intl` (kết luận `/en/contact`).
- Đề xuất (task riêng, không chặn): thêm 2 assert trên.

## Verdict

### ✅ PASS

- **Không còn CRITICAL/MAJOR** → đủ điều kiện PASS.
- Không phải bug task ⇒ không áp điều kiện "repro PASS bắt buộc".
- 3 MINOR đều không chặn; MINOR-1 nên sửa ngay trong change này (1 dòng, cùng file/cùng lớp lỗi), MINOR-2/3 cần user quyết trước khi đổi.
- Điều kiện khuyến nghị trước khi commit/close-out: builder tự chạy lại `npm.cmd run lint|typecheck|build` + `verify-t6.mjs` (reviewer không chạy được) và ghi kết quả vào task file; sửa MINOR-1.

## Residual risk (chưa xác minh được trong vòng review này)

1. `shell` permission denied ⇒ **lint / typecheck / build / HTTP verify-t6 (22/22) chưa được reviewer xác nhận** — chỉ tin báo cáo builder + đọc source.
2. Không đo được bằng browser (không tự chạy app/manual repro theo rule) ⇒ các kết luận responsive dựa trên **CSS math + ảnh gốc**, chưa có `scrollWidth/clientWidth` thực tế.
3. Kích thước pixel thật của 2 file crop **không đo được bằng công cụ** (shell denied); chỉ xác minh gián tiếp: ảnh tồn tại + nội dung/bố cục khớp + ratio mdx khớp phép chia kích thước builder khai.
4. Ảnh `.tmp/*.png` (bằng chứng soi mắt 375/1440) không đọc được (thư mục hidden, glob empty) → không kiểm lại được screenshot của builder.
5. Comment/annotation **cuối dòng** trong mdx và tài liệu ngoài `src/content` (vd `docs/screenshots-mapping.md`, task file) chưa quét hết → chưa loại trừ 100% "stale doc" ngoài diff.
6. `FeatureZigZag.tsx` (`sizes`/cách truyền `ratio` xuống `ShotImage`) chưa đọc trực tiếp — suy luận từ type `Feature.ratio` + các ảnh dọc 0.719 của HRM đã được duyệt ở T4.
7. **Disclosure quy trình:** vượt cap read-tool của mức NORMAL (15) — dùng ~24 lượt `Read/Grep/Glob` do phải đọc source `next-intl` để bác bỏ 1 nghi vấn regression và mở 2 file crop làm bằng chứng. Đã **hard-stop** sau đó; các mục chưa đọc liệt kê ở trên thay vì đọc tiếp.
