---
id: home-sections-redesign
type: feature
status: in_progress
created: 2026-10-14
---

# Trang chủ: thiết kế lại 3 khối Giải pháp · Sản phẩm · Câu chuyện khách hàng theo mockup

## Yêu cầu
Sửa UI trang chủ (`src/app/[locale]/page.tsx`) cho 3 section theo 3 ảnh mẫu trong
`spec/changes/assets/2026-10-14-home-sections-redesign/`:

1. **Giải pháp** (`SolutionGridHome`) — theo ảnh `2.webp` (nửa trên):
   - Eyebrow `SOLUTIONS ——`, tiêu đề 2 dòng "Giải pháp phù hợp với / **nhu cầu của bạn**" (dòng 2 màu teal),
     đoạn mô tả bên phải.
   - 3 thẻ ngang (Giải pháp doanh nghiệp · Giải pháp AI · Ứng dụng AI): icon vuông bo góc + tiêu đề + mô tả,
     3 gạch đầu dòng có icon, link teal "Tìm hiểu … →" ở đáy; ảnh minh hoạ nằm phía phải thẻ, tan vào nền.
2. **Sản phẩm tiêu biểu** (`ProductStrip`) — bố cục header theo ảnh `2.webp` (nửa dưới) nhưng
   **thẻ dùng kiểu card dài/cao của ảnh `1.webp`**:
   - Eyebrow `PRODUCTS ——`, tiêu đề "Sản phẩm **tiêu biểu**", mô tả bên phải, 2 nút mũi tên ←/→ (carousel).
   - Card dọc: ảnh poster lớn chiếm phần trên (tỉ lệ dọc như ảnh 1), dưới là panel trắng: icon app,
     tên + mô tả 1 dòng, nút tròn mũi tên màu theo app, hàng chip tính năng (màu nhạt theo app).
3. **Câu chuyện khách hàng** (`CaseStudyHighlight`) — theo ảnh `3.webp`:
   - Eyebrow `CASE STUDY ——`, tiêu đề "Câu chuyện **khách hàng**", mô tả 2 dòng; bên phải 2 nút ←/→ +
     nút viền "Xem tất cả case study →".
   - Hàng 3 thẻ: ảnh trên, chip ngành có icon, tiêu đề, mô tả 2 dòng, "Xem chi tiết →" + nút tròn mũi tên.

## Acceptance (bắt buộc)
- [ ] 3 section trên trang chủ khớp bố cục/thứ bậc chữ/màu của mockup tương ứng (VI + EN đều có chữ, không hardcode).
- [ ] Thẻ sản phẩm là card dọc dài kiểu ảnh 1; nút ←/→ cuộn được danh sách sản phẩm (nhiều hơn số thẻ hiển thị).
- [ ] Case study hiển thị tối đa 3 thẻ + nút ←/→ + link "Xem tất cả case study" → `/case-studies`; mỗi thẻ link đúng trang chi tiết.
- [ ] Link "Tìm hiểu …" của từng thẻ giải pháp trỏ đúng route giải pháp hiện có.
- [ ] Responsive: mobile 1 cột / carousel vuốt, không tràn ngang; giữ a11y (alt ảnh, aria-label nút mũi tên, focus visible).
- [ ] Dùng ảnh/nội dung thật đã có trong repo; thiếu ảnh poster dọc cho sản phẩm → báo lại, không bịa.
- [ ] build / typecheck / lint PASS.

## Ghi chú
- Component liên quan: `src/components/home/SolutionGridHome.tsx`, `ProductStrip.tsx`, `CaseStudyHighlight.tsx`;
  dữ liệu `src/content/listings.ts`; chuỗi `src/i18n/messages/{vi,en}.json`.
- Hiện trang chủ chỉ có 1 `featuredCase` → cần đổi sang danh sách case study (lấy từ dữ liệu case study có sẵn).
- Câu chữ trong mockup (vd "Tối ưu vận hành", tên app) là tham khảo bố cục — nội dung lấy từ data thật của NTA.

---

## Xử lý (agent change-request — 2026-10-14)

- **Classification:** MODIFY (UI) + ADDITIVE (khối case study 1 → 3 thẻ + link "Xem tất cả"; chuỗi i18n mới) · **Risk: MEDIUM**
  (3 section trang chủ, VI+EN; component dùng chung `SolutionCard`/`ProductCard`/`CaseStudyCard` KHÔNG sửa — dựng card riêng cho trang chủ).
- **Phase plan:** `tasks/feature-home-sections-redesign/phase-1-task-0{1,2,3}.md` — CHỜ user duyệt.

### Spec delta (đề xuất — áp vào `SPECIFICATIONS.md` + spec-publisher bump **3.11.0** lúc close-out)
- **R-02a (Module 1):** khối Giải pháp trang chủ theo mockup CR-016 — eyebrow + tiêu đề 2 dòng (dòng 2 màu brand) + mô tả
  bên phải; 3 thẻ ngang (DN / AI / Ứng dụng AI): icon vuông, tiêu đề, mô tả, 3 gạch đầu dòng có icon, link "Tìm hiểu …"
  → `/solutions/enterprise`, `/solutions/ai`, `/products`; ảnh minh hoạ bên phải thẻ fade vào nền.
- **R-03a:** khối Sản phẩm tiêu biểu: header eyebrow + tiêu đề + mô tả + nút ←/→; card dọc (poster lớn trên, panel trắng dưới:
  icon app, tên + mô tả 1 dòng, nút tròn mũi tên màu theo app, chip tính năng) → `/products/<slug>`; nút ←/→ disabled khi
  không cuộn được (hiện chỉ 2 sản phẩm).
- **R-03b:** khối Câu chuyện khách hàng: tối đa 3 thẻ (ảnh `cover`, chip ngành `sector` + icon, tiêu đề, mô tả clamp 2 dòng,
  "Xem chi tiết →" + nút tròn) → `/case-studies/<slug>`; nút ←/→ + nút viền "Xem tất cả case study →" → `/case-studies`.
  Thay cho khối 1 `featuredCase` cũ (bỏ field `featuredCase` trong `src/content/home.ts`).
