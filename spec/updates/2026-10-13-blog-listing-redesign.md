# Spec Update — 2026-10-13 blog-listing-redesign

**spec_version:** 3.1.0 → 3.2.0 (MINOR)
**Trigger:** feature-update
**Change:** `spec/changes/2026-10-13-blog-listing-redesign.md` (CR-003)

## Requirements
- **THÊM R-09a** — trang danh sách `/blog` bố cục newsroom: hero (nền ảnh + breadcrumb pill + tiêu đề 2 dòng + minh hoạ SVG),
  thanh lọc 7 chip danh mục + ô tìm kiếm (URL `?category=&q=&page=`), khối nổi bật (1 lớn + ≤2 nhỏ + thẻ NỔI BẬT),
  lưới "Bài viết mới nhất" 4 cột desktop, phân trang 12/trang; danh mục = key cố định + nhãn i18n; thời gian đọc tự tính.
- **SỬA R-09 (clarify ngày)** — format VI đổi `08/10/2026` → `08 Th10, 2026` (tháng không pad 0) cho CẢ list + detail (vẫn 1 util chung).
  EN giữ `Oct 12, 2026`.
- **Ngoài phạm vi:** "Đăng ký nhận tin" (chưa có backend).

## Ảnh hưởng
- Module 7 (Blog): `/blog`, `/en/blog` (toàn bộ bố cục); `/blog/[slug]` — chỉ đổi chuỗi ngày + nhãn badge danh mục
  (do gán lại category 4 bài), không đổi bố cục.
- Content: 4 bài × 2 locale đổi `category` sang key mới (responsible-ai → ai-tech, digital-workflows → practical,
  learning-content → guides, first-steps → nta-news).
- Test luồng: lọc chip, tìm kiếm có dấu/không dấu, URL deep-link `?category=&q=`, phân trang, empty state lọc,
  nút "Xem tất cả bài viết", responsive 1440/768/390, i18n vi/en.

## Round 2 (sau spec-validation round 1 FAIL — 3 MAJOR)
- Bổ sung R-09a §Chi tiết hành vi: page size 12, ngữ nghĩa URL, chuẩn hoá tìm kiếm, cách tính thời gian đọc, trạng thái rỗng, responsive, a11y, kiểu `category`, blast radius.
- Chốt ví dụ ngày VI `08 Th10, 2026` / `15 Th3, 2026`.
