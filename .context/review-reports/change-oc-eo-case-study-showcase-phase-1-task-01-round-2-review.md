Agent: reviewer

# Review — change/oc-eo-case-study-showcase — Phase 1 / Task 01 — Round 2

## Review level: NORMAL

## Reason
Round 2 chỉ sửa trong phạm vi round 1: 7 file showcase (1 file mới `VmsMock.tsx`), `page.tsx` (dời biến xuống sau nhánh showcase), `types.ts` (thêm 3 field optional `photos.caption?`, `vision.quoteSource?`, `note?`), 2 file MDX vi/en (thêm nội dung). Không đụng API/auth/DB/schema/hạ tầng. Field mới đều optional → không phá dữ liệu case nha khoa. Giữ mức NORMAL như round 1, kèm soi lại CSS build artifact (rủi ro đã gặp ở MAJOR-1).

## Blast radius
- `src/components/case-studies/showcase/*` — chỉ được dùng bởi nhánh `layout === 'showcase'` (hiện chỉ có `oc-eo-learning` vi/en).
- `src/app/[locale]/case-studies/[slug]/page.tsx` — nhánh default (case nha khoa) chỉ đổi thứ tự khai báo `labels`/`cta` và dùng lại `breadcrumbJsonLd`. JSON-LD đầu ra giữ nguyên.
- `src/content/types.ts` — `CaseStudyShowcase` thêm 3 field optional.
- `src/content/case-studies/{vi,en}/oc-eo-learning.mdx` — caption, alt "Minh hoạ —", `quoteSource`, `note`.
- Bỏ qua: `src/app/[locale]/layout.tsx` (stub Inter chỉ dùng để build trong sandbox, không thuộc change). Change "site-wide motion" (CountUp, split-line) chưa commit của user đã bị **loại** khỏi snapshot này. Primary chỉ stage đúng các file trong `round2-scope.diff`, gồm cả file mới `VmsMock.tsx`.

## Verify commands + result
| Command | Result |
|---|---|
| `npx tsc --noEmit` (reviewer chạy lại) | **PASS** (exit 0) |
| `npx eslint src/components/case-studies/showcase src/app/[locale]/case-studies/[slug]/page.tsx src/content/types.ts` (reviewer chạy lại) | **PASS** (0 error, 0 warning) |
| `npm run build` (primary) | PASS. Có artifact `.next/` |
| CSS build `.next/static/css/468344c3ffebb088.css` | Có `.bg-\[rgb\(0_158_135\/0\.4\)\]{background-color:rgb(0 158 135/.4)}`, `.border-\[rgb\(33_217_173\/0\.8\)\]{border-color:rgb(33 217 173/.8)}`, `.focus-visible\:outline-focus:focus-visible{outline-color:var(--color-focus)}`. **0 match** cho `border-border/`, `bg-primary/`, `border-accent/`. Giá trị rgb khớp token `--color-primary:#009e87` và `--color-accent:#21d9ad`. |
| grep `/NN` trong `src/components/case-studies/showcase/*` | Chỉ còn `text-white/90`, `via-white/10`, `to-white/60`, `bg-white/90`, `bg-white/5`, `text-white/60`. Tất cả là màu `white` built-in của Tailwind, modifier `/NN` vẫn sinh CSS. **Không còn** modifier trên màu theme dạng `var()`. |
| Render HTML `.next/server/app/{vi,en}/case-studies/oc-eo-learning.html` (đã bỏ `<script>`) | Caption carousel render dưới `</ul>` ở cả vi và en. Alt 5 ảnh carousel bắt đầu bằng "Minh hoạ —" / "Illustration —". `note` render thành `<p>` sau thẻ số liệu. `quoteSource` render thành `<figcaption>` ("Định hướng của NTA cho phương án" / "NTA's vision for the proposal"). Mỗi trang có đúng 1 `<h1>`. CTA hero là anchor `#giai-phap` / `#solution`. Link `/contact` vi, `/en/contact` en. |
| vi/en frontmatter key parity (python) | **PASS**: 112/112 key, cùng thứ tự (109 + 3 key mới). |
| Screenshot `/tmp/r2-vi-1440.png`, `/tmp/r2-vi-390.png` (reviewer xem) | Có 3 đường nối node→VMS. Caption carousel và note hiển thị. Thẻ quote có attribution. Mobile không vỡ layout. |
| Playwright (primary) | HTTP 200 ở vi 1440/390, en 1440, case nha khoa, `/case-studies`. Không scroll ngang. Connector `rgba(0,158,135,0.4)`. 0 console error. |
| `semgrep`, `aislop scan --changes` | **skip, not installed** (`which` không tìm thấy). Không tự bịa score. Diff không thêm input người dùng, fetch hay `dangerouslySetInnerHTML` mới. |

## Verdict: ✅ PASS (có điều kiện close-out)

## Summary
Cả 2 MAJOR về code đã sửa đúng và được xác minh trên build artifact thật: CSS opacity (MAJOR-1) và nhãn minh hoạ BR-004 (MAJOR-2). MAJOR-3 đã được xử lý về mặt quyết định trong change doc. Tuy nhiên spec delta (R-08b, Screen 9, file `spec/updates/…`) **chưa tồn tại**, task file lại đánh dấu như đã làm. Phần này chuyển thành điều kiện bắt buộc cho close-out. MAJOR-4 được chấp nhận ở dạng ghi nhận. Không có CRITICAL hoặc MAJOR mới. Còn vài MINOR, không chặn PASS.

## Findings

### ✅ Good
- `ShowcaseTechnology.tsx:47` `bg-[rgb(0_158_135/0.4)]` và `VmsMock.tsx:26` `border-[rgb(33_217_173/0.8)]` đều sinh CSS, giá trị khớp token. `ShowcaseOverview.tsx:12,27` và `ShowcaseVision.tsx:24` dùng `border-border` (không modifier). Comment ở `VmsMock.tsx:7-9` ghi lại bài học.
- Tách `VmsMock.tsx` (45 dòng) ra khỏi file cũ: `ShowcaseTechnology` còn khoảng 35 dòng/hàm, không còn import thừa (`Image` đã chuyển đi cùng).
- `ShowcasePhotos.tsx`: `useId` + `useRef` đều gọi trước early return nên thứ tự hook đúng. Có `aria-labelledby` cho `section` và track `ul`. Track có `focus-visible:outline`. `ARROW_CLASS` đưa lên module scope. Caption chỉ render khi có dữ liệu.
- `ShowcaseHero.tsx`: href anchor dùng `<a>`, href khác dùng `Link` next-intl (giữ tiền tố locale). Đã bỏ `rel="noopener"` thừa.
- `page.tsx`: không còn tính `labels`/`getTranslations('solutions.ai')` cho nhánh showcase. Nhánh default dùng lại `breadcrumbJsonLd`, đầu ra không đổi.
- `types.ts`: field mới optional, có doc comment kèm ghi chú BR-004.
- Copy BR-004 trung thực: caption "Ảnh minh hoạ dựng từ phối cảnh phương án — sẽ thay bằng ảnh chụp thực tế khu di tích". `note` "Đây là phương án đề xuất, không phải kết quả triển khai đã xác nhận…" (vi/en tương ứng). Attribution "Định hướng của NTA cho phương án" cho thấy đây là quan điểm của NTA, không phải lời khách hàng/cơ quan.
- Contrast: caption và note dùng `text-text-secondary` `#6e6e73` trên nền trắng, khoảng 5.1:1, đạt ≥4.5:1.

### Trạng thái các finding round 1
| # | Mức | Trạng thái | Bằng chứng |
|---|---|---|---|
| MAJOR-1 | Opacity `/NN` trên màu `var()` | ✅ **Resolved** | CSS artifact có 2 class arbitrary thay thế. 0 match cho 4 class cũ. Không còn `/NN` trên màu theme trong `showcase/*`. Screenshot thấy connector. |
| MAJOR-2 | BR-004: carousel crop AI như ảnh thật | ✅ **Resolved** | Caption render ở HTML vi/en. 5/5 alt có tiền tố "Minh hoạ —"/"Illustration —". Còn thiếu ghi nguồn/bản quyền ảnh trong change doc (task file mục 7 có ghi "ảnh user", chấp nhận được). |
| MAJOR-3 | Lệch R-08/Screen 9 chưa ghi nhận | ⚠️ **Resolved về quyết định, còn điều kiện close-out** | Change doc ghi đủ các quyết định chính: bỏ MetaBar, Challenge/Solution/Result dạng văn xuôi và `gallery`; giữ `gallery` làm fallback; exemption craft-floor (eyebrow, gradient h1, backdrop-blur) chỉ trong biến thể; video ẩn khi chưa có href. `note` mới khôi phục disclaimer mà round 1 nêu thiếu. **Nhưng** `SPECIFICATIONS.md` chưa có R-08b, `.context/design-spec.md` chưa có biến thể showcase, file `spec/updates/2026-10-12-oc-eo-case-study-showcase.md` được tham chiếu nhưng **không tồn tại**. Xem MINOR-13. |
| MAJOR-4 | Commit `1e90308` gộp file ngoài scope | ✅ **Accepted (ghi nhận)** | Change doc liệt kê đủ file ngoài scope, không rewrite history đã push. Chấp nhận vì rewrite history đã push rủi ro hơn lợi ích. Round này stage theo danh sách path tường minh, đúng hướng fix. Phải đảm bảo commit round 2 **không** kéo theo diff motion (CountUp/split-line) hay stub `layout.tsx`. |
| MINOR-5 | Hàm `ShowcaseTechnology` 67 dòng | ✅ Resolved | Tách `VmsMock`. |
| MINOR-6 | CTA hero `<a>` thô | ✅ Resolved | `Link` next-intl cho href không phải anchor. |
| MINOR-7 | `labels`/`cta` tính thừa, breadcrumb dựng 2 lần | ✅ Resolved | |
| MINOR-8 | Screen reader đọc label 2 lần | ✅ Resolved | `dd` label có `aria-hidden`. Cấu trúc `dt`(sr-only) + `dd` value còn hợp lệ. |
| MINOR-9 | Blockquote không attribution | ✅ Resolved | `quoteSource` → `figcaption`. |
| MINOR-10 | Ảnh crop độ phân giải thấp | ❌ Unresolved | Chưa đổi ảnh (`stupa.jpg` 480×300, `ruins-corner.jpg` 440×300). Chấp nhận là placeholder đến khi có ảnh thực địa, đúng như caption đã nói. |
| MINOR-11 | Carousel a11y | ◐ Partially resolved | Đã sửa `aria-labelledby` cho section/track và focus ring. Nút prev/next vẫn chưa disable ở 2 đầu (non-blocking). |
| MINOR-12 | `gallery` thành data chết | ✅ Resolved | Change doc ghi "giữ làm fallback cho layout default". |

### ❌ Issues mới (không chặn PASS)
- **[MINOR-13] Tài liệu change/task chưa đồng bộ với round 2.** Phải sửa khi close-out:
  - `tasks/…/phase-1-task-01.md` DoD đánh `[x] Doc impact recorded (R-08b, Screen 9)` nhưng R-08b/Screen 9 chưa được viết. Change doc tham chiếu `spec/updates/2026-10-12-oc-eo-case-study-showcase.md`, file này không tồn tại.
  - Change doc mục "Quyết định có chủ ý" ghi disclaimer "thể hiện qua eyebrow + cột Kết quả kỳ vọng…". Nay đã có `note` riêng, cần cập nhật. Cần thêm 2 field mới `photos.caption` / `vision.quoteSource` vào mô tả biến thể.
  - Lệch "h1 = tên dự án" (Screen 9) → h1 là slogan "Bảo tồn di sản bằng công nghệ AI", tên dự án nằm ở `subtitle <p>`. Change doc chỉ ghi "h1 2 màu", **chưa ghi rõ là lệch có chủ ý**. Cần thêm vào R-08b/Screen 9 variant.
  - Task file ghi "8 file mới", thực tế 9 (`VmsMock.tsx`). Status `pending … 2 MAJOR code còn mở` và bảng finding đã cũ.
  - Task file yêu cầu thêm entry `.context/error-memory.md` cho lỗi `/NN` + `var()` (lặp lần 2). Grep chưa thấy entry nào.
- **[MINOR-14]** `ShowcaseLayout.tsx:19-23`: `note` dùng margin âm (`-mt-4 md:-mt-6`) để kéo sát vào `pb-10/md:pb-12` của `ShowcaseOverview`, tức là coupling ngầm với padding của component khác. Nên chuyển `note` vào trong `ShowcaseOverview` (prop) để tự quản spacing. Ngoài ra disclaimer dùng `text-xs` (12px), hơi chìm so với tầm quan trọng BR-004. Nên dùng `text-sm`. Không chặn.

### 💡 Suggestions
- Task riêng (ngoài scope): đổi token màu sang `rgb(var(--…) / <alpha-value>)` để chặn tận gốc lỗi `/NN` lần thứ 3.
- Khi có ảnh thực địa: thay 5 ảnh crop, bỏ `caption` và tiền tố "Minh hoạ —" trong alt.

## Craft-floor / Surgical diff
- Mọi dòng trong diff đều trace được về MAJOR-1/2/3 hoặc MINOR-5..11 của round 1. Không có drive-by refactor ngoài scope. Riêng `ARROW_CLASS` đưa lên module scope gắn với MINOR-11 nên chấp nhận được.
- Exemption craft-floor (eyebrow, gradient text, backdrop-blur) đã có trong change doc, giới hạn trong biến thể showcase.
- Không orphan import (`Image` đã bỏ khỏi `ShowcaseTechnology`, eslint 0 warning).

## Verdict Reasoning
Không có CRITICAL. 4 MAJOR của round 1: MAJOR-1 và MAJOR-2 đã resolved và có bằng chứng từ build artifact và HTML render. MAJOR-4 được chấp nhận ở dạng ghi nhận. MAJOR-3 resolved về quyết định. Phần còn thiếu là viết spec delta (R-08b, Screen 9 variant), primary đã cam kết làm khi close-out, nên hạ thành MINOR-13 kèm điều kiện. Không còn MAJOR mở nào, nên theo Decision Flow là **PASS**.

**Điều kiện close-out bắt buộc (trước hoặc cùng commit):**
1. Viết R-08b vào `SPECIFICATIONS.md` (bump 3.1.0) và biến thể showcase vào `design-spec.md` Screen 9. Phải ghi rõ: h1 = slogan, không MetaBar, không gallery, `note` / `caption` / `quoteSource`, exemption craft-floor. Tạo file `spec/updates/…` đúng như tham chiếu, hoặc bỏ tham chiếu.
2. Cập nhật change doc và task file (status, acceptance, 9 file, bảng finding round 2). Thêm entry error-memory.
3. Chỉ stage các path trong `round2-scope.diff` (gồm `VmsMock.tsx`, trừ `layout.tsx`), không kèm diff motion.

Nếu close-out không làm (1), MAJOR-3 coi như **chưa resolved** và verdict mặc định trở về FAIL.
