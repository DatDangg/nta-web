# Spec Update — 2026-10-13 fridayai-solution

**spec_version:** 3.6.0 → 3.7.0 (MINOR)
**Trigger:** feature-update
**Requirements:**
- SỬA **R-06**: danh sách slug giải pháp AI thêm `fridayai`.
- THÊM **R-06e**: nội dung trang FridayAI (AI API Gateway, sản phẩm NTA) — một endpoint cho Claude/GPT/Gemini,
  tương thích OpenAI SDK, trả theo mức dùng/gói, thanh toán VN; không ghi cứng giá/khuyến mãi; CTA hero + CTA cuối
  dẫn sang `https://fridayaix.com/` (tab mới); ảnh chụp website + logo SVG; danh mục lọc `gateway` ở `/solutions/ai`.
**Ảnh hưởng:** `/solutions/ai` (thẻ mới + bộ lọc mới), `/solutions/ai/fridayai` + `/en/...` (trang mới),
mega menu Header (mục mới nhóm AI), sitemap; `ShowcaseCTA` (link ngoài) dùng chung cho mọi trang showcase.
**Nguồn:** `spec/changes/archive/2026-10-13-fridayai-solution.md` (CR-011).
