# Spec Update — 2026-10-13 shared-detail-showcase-template (block tình huống sử dụng & kết nối)

**spec_version:** 3.3.0 → 3.4.0 (MINOR)
**Trigger:** feature-update
**Change:** `spec/changes/2026-10-13-shared-detail-showcase-template.md` (CR-004, layer 2)

## Requirements
- **SỬA R-08c** — thêm block optional **tình huống sử dụng & kết nối** (nhóm = tiêu đề + đoạn dẫn tuỳ chọn + danh sách), nằm giữa lưới tính năng và FAQ.
  Lý do: khi chuyển CRM/DentGo/LMS sang khung chung, mục "tình huống sử dụng" và mục kết nối/pháp quy đang hiển thị trên trang cũ không có chỗ hiển thị (review layer 2: MAJOR).

## Ảnh hưởng
- `/solutions/enterprise/{crm,dentgo,lms}` (vi/en): chuyển sang khung chung; giữ URL, metadata, breadcrumb JSON-LD, form liên hệ cuối trang.
- `/solutions/enterprise/hrm`, `/solutions/ai/*`, `/case-studies/*`: không đổi (block mới không có data → ẩn).
