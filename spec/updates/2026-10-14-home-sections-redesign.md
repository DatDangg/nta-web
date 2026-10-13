# Spec Update — 2026-10-14 home-sections-redesign
**spec_version:** 3.10.0 → 3.11.0 (MINOR)
**Trigger:** feature-update (CR-016, MODIFY + ADDITIVE UI)
**Requirements:** THÊM (Module 1 — Trang chủ `/`):
- **R-02a** — khối Giải pháp theo mockup: header dùng chung (eyebrow `SOLUTIONS ——`, tiêu đề 2 dòng dòng 2 màu brand, mô tả bên phải);
  3 thẻ ngang DN / AI / Ứng dụng AI (icon vuông, tiêu đề, mô tả, 3 bullet có icon, link "Tìm hiểu … →" → `/solutions/enterprise`,
  `/solutions/ai`, `/products`), ảnh minh hoạ fade vào nền.
- **R-03a** — khối Sản phẩm tiêu biểu: header eyebrow + tiêu đề + mô tả + nút ←/→; card dọc dài (poster trên, panel trắng: icon app,
  tên + mô tả 1 dòng, nút tròn màu theo app, chip tính năng) → `/products/<slug>`; nút ←/→ cuộn 1 thẻ, disabled khi đã ở mép (sai số 8px).
- **R-03b** — khối Câu chuyện khách hàng: tối đa 3 thẻ, thứ tự giống `/case-studies` (năm giảm dần, rồi slug — `compareCaseStudies` dùng chung),
  ảnh cover, chip ngành + icon, tiêu đề, mô tả clamp 2 dòng, "Xem chi tiết →" → `/case-studies/<slug>`; nút ←/→ + "Xem tất cả case study →"
  → `/case-studies`. Thay khối 1 `featuredCase` cũ (bỏ field `featuredCase` trong `src/content/home.ts`).
R-02, R-03 giữ nguyên ràng buộc gốc.
**Thay đổi code:** `src/components/home/{HomeSectionHeader,HomeProductCard,HomeCaseStudyCard,CaseStudyCarousel,HomeScrollArrows}.tsx` (mới),
`src/components/home/useScrollButtons.ts` (mới), `src/components/home/{SolutionGridHome,ProductStrip,CaseStudyHighlight}.tsx`,
`src/content/home.ts`, `src/app/[locale]/page.tsx`, `src/lib/content/case-studies.ts` (+`compareCaseStudies`),
`src/app/[locale]/case-studies/page.tsx` (dùng comparator chung), `src/i18n/messages/{vi,en}.json` — commit `e1ae847`, `0cbde8d` + task-03.
**Ảnh hưởng:** `/`, `/en` (3 khối); `/case-studies`, `/en/case-studies` (thứ tự danh sách qua comparator dùng chung — hành vi không đổi).
Không đổi API/schema/route.
**Nguồn:** `spec/changes/archive/2026-10-14-home-sections-redesign.md`.
