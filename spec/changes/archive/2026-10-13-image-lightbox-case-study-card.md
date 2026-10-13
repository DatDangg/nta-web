---
id: image-lightbox-case-study-card
type: feature
status: done
created: 2026-10-13
backlog: CR-013
classification: MODIFY + ADDITIVE (UI)
---

# Ảnh carousel bấm để phóng to (lightbox) + thiết kế lại thẻ case study (ảnh bị cắt)

## Yêu cầu
1. Các ảnh trong trang chi tiết (carousel ảnh `ShowcasePhotos` — ảnh camera Bảo Hà, ảnh giao diện CRM/DentGo/LMS/HRM…)
   hiện bấm vào **không phóng to** được → cần bấm để mở to xem (lightbox).
2. **Thiết kế lại thẻ case study**: ảnh trong thẻ bị ép theo khung nên bị cắt quá nhiều → ảnh phải hiện đủ/hợp lý hơn.

Lời user gốc: "mấy cái ảnh ấy, hiện tại ấn vào đang không mở to ra để xem được và thiết kế lại cái thẻ của case study,
ảnh bị ép dọc nên bị cắt quá".

## Bối cảnh / tái hiện
- Màn/route: trang chi tiết case study / giải pháp / sản phẩm (khối carousel ảnh `ShowcasePhotos`); thẻ case study ở `/case-studies`
- Expected: bấm ảnh → xem ảnh lớn; thẻ case study hiện ảnh không bị cắt mất nội dung chính
- Actual: bấm ảnh không có gì xảy ra; ảnh trong thẻ bị cắt

## Giả định (user gõ `/change` mà chưa trả lời 2 câu hỏi làm rõ → dùng mặc định, ghi rõ ở đây)
- **(a) Phạm vi lightbox:** MỌI ảnh trong carousel `src/components/case-studies/showcase/ShowcasePhotos.tsx`, mọi variant
  (`photo` / `screen` / `phone`). Vì `ShowcasePhotos` nằm trong `ShowcaseLayout` dùng chung → áp dụng cho
  `/case-studies/[slug]` (showcase), `/solutions/enterprise/[slug]`, `/solutions/ai/[slug]`, `/products/[slug]`.
  **Ngoài phạm vi:** ảnh hero, ảnh khối công nghệ (`ScreenMock`), gallery layout `default` (`ImageGallery`).
- **(b) "Thẻ case study":** thẻ ở trang danh sách **`/case-studies`**. Kiểm tra code cho thấy trang này **không** dùng
  `CaseStudyCard` mà dùng `ListingCard` (`src/components/listing/ListingCard.tsx`) với `media.kind: 'photo'`
  (`src/app/[locale]/case-studies/page.tsx:53`). Đây đúng là thẻ "ép dọc" user mô tả (xem phân tích dưới).
  `CaseStudyCard` (khối "Case study liên quan" ở cuối trang chi tiết) dùng khung 16/10 khớp ảnh cover → **không đổi**.

## Phân tích nguyên nhân thẻ bị cắt (evidence)
Ảnh cover thực tế (đo header file):

| Case study | Cover | Kích thước | Tỉ lệ |
|---|---|---|---|
| ai-box-bao-ha | `/images/cases/bao-ha/hero.jpg` | 1364×1021 | 1.336 (≈4:3) |
| dental-clinic-operations | `/images/cases/dental/hero.jpg` | 1590×989 | 1.608 (≈16:10) |
| oc-eo-learning | `/images/cases/oc-eo/hero.jpg` | 1590×989 | 1.608 (≈16:10) |

`ListingCard` biến thể `photo` ở breakpoint ≥ `sm`: khung ảnh `sm:absolute sm:inset-y-4 sm:right-4 sm:w-[44%] sm:aspect-auto`
→ cao theo chiều cao thẻ (min 350px), rộng 44% thẻ ⇒ **khung dọc**:
- `lg` (lưới 2 cột, thẻ ≈ 596px): khung ≈ 262×≈340px → tỉ lệ ≈ 0.77 ⇒ chỉ hiện ≈ 58% chiều ngang ảnh Bảo Hà,
  ≈ 48% ảnh Óc Eo/DentGo (mất camera + drone Óc Eo, mất logo/bảng lịch hẹn DentGo).
- `md` (thẻ ≈ 348px, cột chữ chỉ 56% nên thẻ cao hơn ≈ 420px): khung ≈ 153×≈390 → tỉ lệ ≈ 0.39 ⇒ chỉ còn ≈ 24–29% chiều ngang.
- `< sm`: khung 16/10 xếp dưới chữ → gần như đủ ảnh (không lỗi).

Ảnh cover đều là ảnh ngang có nội dung trải rộng → khung dọc + `object-cover object-center` cắt mất phần chính.

## Phương án thiết kế thẻ (đề xuất, chờ duyệt)
Biến thể `photo` của `ListingCard` đổi từ "ảnh cột dọc bên phải" → **ảnh banner ngang trên đầu thẻ**:
- Ảnh nằm trên cùng, trong lề thẻ (inset ~16px, bo góc ~20px, giữ shadow/ring hiện có), khung cố định **`aspect-[16/10]`**
  ở **mọi** breakpoint, `object-cover object-center`.
- Khối chữ (icon, status, tiêu đề, phụ đề, mô tả line-clamp-3, chip + nút mũi tên) nằm dưới ảnh, full width
  (bỏ `sm:max-w-[56%]` cho `photo`).
- Thẻ cao đều: các thẻ cùng hàng giữ `h-full` + `flex-col`, hàng chip/nút `mt-auto` (đã có) → đáy thẳng hàng;
  khung ảnh cùng tỉ lệ ⇒ phần ảnh cao bằng nhau.
- Kết quả cắt ảnh: Óc Eo / DentGo (1.608 vs 1.6) **gần như không cắt** (< 0.5%); Bảo Hà (4:3) cắt **≈ 16.5% chiều dọc**
  (≈ 8% trên — dải timestamp camera, ≈ 8% dưới — nền sân) — giữ nguyên toàn bộ chiều ngang, gian thờ + biển "10 năm" còn đủ.
- Chỉ đổi biến thể `photo` (chỉ `/case-studies` dùng); `phone` (/products) và `window` (/solutions/*) **không đổi**.
  Không đụng `cardImageClass` / `CaseStudyCard` / `SolutionCard`.

Phương án thay thế (không chọn): giữ bố cục ngang nhưng khung ảnh 16/10 ở cột phải → thừa khoảng trống dưới ảnh, ảnh nhỏ
(≈ 262×164) trên thẻ 2 cột; hoặc `object-contain` → viền trống 2 bên, các thẻ trông lệch nhau.

## Spec delta (nháp — áp dụng khi close-out qua spec-publisher)
- MINOR **3.8.0 → 3.9.0**. Thêm **R-08d (3.9.0)** dưới Module 6:
  - Carousel ảnh (`showcase.photos`, mọi variant) trong khung chi tiết dùng chung (R-08c): bấm ảnh mở **lightbox** —
    overlay modal hiện ảnh đủ (`object-contain`), alt/caption + bộ đếm "n / N", nút đóng, Esc, bấm nền để đóng,
    nút trước/sau + phím ←/→, focus vào lightbox khi mở và trả focus về ảnh đã bấm khi đóng, khoá cuộn trang,
    tôn trọng `prefers-reduced-motion`, dùng được cảm ứng (mobile). Không thêm thư viện.
  - Thẻ danh sách `/case-studies` (ListingCard `photo`): ảnh cover là banner ngang 16/10 trên đầu thẻ, chữ bên dưới,
    các thẻ cao đều.
- `.context/design-spec.md` Screen 9 đã ghi "gallery ảnh click mở lightbox" → chỉ ghi chú áp dụng cho carousel showcase.

## Acceptance (bắt buộc)
- [x] Bấm ảnh carousel → mở ảnh lớn (overlay), đóng bằng nút X / Esc / bấm nền, chuyển ảnh trước/sau, dùng được bàn phím + mobile
- [x] Thẻ case study thiết kế lại, ảnh không bị cắt mất phần chính; các thẻ vẫn cao đều nhau
- [x] Responsive mobile/desktop, không vỡ layout

## Tasks
- `tasks/feature-image-lightbox-case-study-card/phase-1-task-01.md` — Lightbox cho carousel `ShowcasePhotos`
- `tasks/feature-image-lightbox-case-study-card/phase-1-task-02.md` — Thiết kế lại thẻ `ListingCard` biến thể `photo` (/case-studies)

## Kết quả (close-out 2026-10-13)
- Task 01 lightbox `c3ca0e6` (review STRICT PASS) · Task 02 thẻ /case-studies `03f371b` (review NORMAL PASS)
- typecheck/lint/build PASS (build chạy ở terminal user) · spec 3.9.0 (R-08d) · test-scope v36
- Residual: chưa smoke test trình duyệt thật (Safari focus, vuốt mobile); finding MINOR ghi trong review reports
