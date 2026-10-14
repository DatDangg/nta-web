---
id: ai-operations-brain-solution
type: feature
status: done
created: 2026-10-14
---

# Thêm trang Giải pháp AI: AI Operations Brain (AI Vận hành Doanh nghiệp)

## Yêu cầu
Thêm 1 trang giải pháp mới vào Module 4 (Giải pháp AI), song ngữ VI/EN, cùng khung với BoxAI / Flycam / FridayAI / Custom AI.
Nội dung nguồn: `spec/changes/assets/2026-10-14-ai-operations-brain-solution/source-content.md` (user gửi 2026-10-14).

- Slug: `ai-operations-brain` → `/solutions/ai/ai-operations-brain` (vi) và `/en/solutions/ai/ai-operations-brain` (en).
- Card ở trang tổng quan `/solutions/ai`: tiêu đề + mô tả ngắn + 3 tag theo bản nguồn.
- Trang chi tiết: map các section của bản nguồn vào block `showcase` (hero, stats, pillars, features, details, faq nếu hợp, cta) giống các trang AI hiện có.
- **Giữ** section KPI, ghi rõ là "Mục tiêu kỳ vọng khi triển khai" / "Target impact (when deployed)", không trình bày như kết quả đã đạt (user chốt 2026-10-14).
- **Bỏ** khối "LƯU Ý CHO NGƯỜI DUYỆT" (dòng 10–14 bản nguồn) — không được xuất hiện trên web.
- Giải pháp dạng năng lực (capability), không gắn tên khách hàng; `relatedCases: []`.

## Acceptance (bắt buộc)
- [ ] `/solutions/ai/ai-operations-brain` và bản `/en/...` render đủ nội dung, đúng ngôn ngữ, không lỗi build.
- [ ] Card mới xuất hiện ở trang tổng quan Giải pháp AI (và các nơi liệt kê giải pháp AI khác như megamenu/related nếu chúng lấy từ danh sách chung).
- [ ] KPI ghi rõ là mục tiêu; không còn khối ghi chú người duyệt; không có tên khách hàng/người cụ thể (vd "anh Tuấn Anh").
- [ ] Sitemap / metadata / hreflang có trang mới như các trang AI khác.
- [ ] typecheck + lint + build PASS.

## Ghi chú
- Ảnh: bản nguồn không kèm ảnh → dùng icon/ảnh minh hoạ trung tính (vd SVG như `custom-ai.svg`), không dùng ảnh khách hàng.
- Mẫu tham khảo: `src/content/solutions/vi/fridayai.mdx`, archive change FridayAI (2026-10-13).
- Slug phải thêm vào whitelist `aiSlugs` (`src/lib/content/slug.ts`).
