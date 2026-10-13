# BACKLOG — Yêu cầu & bug hậu-build (auto-intake)

> Khi build xong hết layer lần đầu (`mode: maintenance`), **mọi yêu cầu/bug user gửi qua chat
> được agent TỰ ĐỘNG ghi vào đây + tạo change doc** — user KHÔNG cần tạo file tay.
> User chỉ cần gõ `/change` (hoặc `/change <slug>`) → agent xử lý → cập nhật tracking.

## Bảng tracking

| ID | Tiêu đề | Loại | Trạng thái | Change file | Tạo | Xong |
|----|---------|------|-----------|-------------|-----|------|
| CR-001 | Thay ảnh placeholder thẻ giải pháp bằng ảnh giao diện thật | MODIFY + ADDITIVE | blocked (chờ user duyệt danh sách ảnh) | `2026-10-12-solution-card-real-images.md` | 2026-10-12 | |
| CR-002 | Case study nha khoa dạng showcase + nút mở DentGo | feature | done (spec 3.2.1 · scope v23) | `archive/2026-10-13-dental-case-study-showcase.md` | 2026-10-13 | 2026-10-13 |
| CR-003 | Thiết kế lại UI trang Tin tức theo mockup (hero, lọc danh mục, tìm kiếm, khối nổi bật, đăng ký nhận tin) | MODIFY + ADDITIVE | done (spec 3.2.0 · scope v22) | `archive/2026-10-13-blog-listing-redesign.md` | 2026-10-13 | 2026-10-13 |
| CR-004 | Tách khung case study (Óc Eo) thành template detail chung cho Giải pháp / Sản phẩm (data MDX, SSG, thêm block Lưới tính năng + FAQ) | MODIFY + ADDITIVE | done (spec 3.5.1 · scope v30; phần ảnh tách sang CR-007) | `archive/2026-10-13-shared-detail-showcase-template.md` | 2026-10-13 | 2026-10-13 |
| CR-005 | Thêm domain `ntasolution.vn` (+www) truy cập cùng site, GIỮ `ntavietnam.tech` là canonical | ADDITIVE (infra/nginx) | done (spec 3.5.0 · scope v27→v31) | `archive/2026-10-13-add-domain-ntasolution.md` | 2026-10-13 | 2026-10-13 |
| CR-006 | Bỏ khối "Chi tiết ứng dụng" ở trang /products | REMOVE | done (reconcile, scope v29) | `archive/2026-10-13-products-remove-app-details.md` | 2026-10-13 | 2026-10-13 |
| CR-007 | Ảnh chụp staging CRM/DentGo/LMS (dữ liệu giả) + dựng thêm màn HRM cho trang chi tiết giải pháp (tách từ CR-004) | ADDITIVE | pending (chờ link + tài khoản staging, chốt màn HRM) | `2026-10-13-solution-detail-screenshots.md` | 2026-10-13 | |
| CR-008 | Thiết kế lại UI trang Liên hệ theo mockup + cập nhật SĐT/email/địa chỉ thật (Kim Hoàn, ngõ 19 Duy Tân) | MODIFY + ADDITIVE | in_progress (spec 3.6.0 · task 01/03 done) | `2026-10-13-contact-page-redesign.md` | 2026-10-13 | |
| CR-009 | Dải chữ chạy trang chủ: bỏ chữ đậm + thêm icon từng mục (theo ảnh mẫu) | MODIFY (UI) | done (no spec delta) | `archive/2026-10-13-home-marquee-icons.md` | 2026-10-13 | 2026-10-13 |

## Quy tắc tracking

- **Trạng thái:** `pending` (chưa xử lý) · `in_progress` (đang xử lý) · `done` (xong, change file đã archive) · `blocked` (kẹt, cần user).
- **Agent intake (tự động, khi user chat yêu cầu/bug trong maintenance mode):**
  1. Tạo change doc `spec/changes/YYYY-MM-DD-<slug>.md` (copy `_TEMPLATE.md`, điền yêu cầu + acceptance từ lời user — thiếu thông tin thì hỏi ngắn 1 lần, KHÔNG bịa).
  2. Thêm 1 dòng vào bảng trên với trạng thái `pending`.
  3. Báo user: "✅ Đã ghi vào backlog: <tiêu đề> — gõ `/change` (hoặc `/change <slug>`) để xử lý." **KHÔNG code ngay.**
- **Agent xử lý change (`/change`):** khi change được xử lý xong (status `done` + chuyển `archive/`) → cập nhật hàng tương ứng: `in_progress` (khi bắt đầu) → `done` + ngày xong. `blocked` khi cần user quyết định.
- **Duy nhất 1 nguồn:** mỗi dòng = 1 change doc ở `spec/changes/`. Không xoá dòng đã `done` (giữ lịch sử), chỉ cập nhật trạng thái.
- **`/change --list`:** liệt kê các dòng chưa `done` từ bảng này (kèm slug để chạy `/change <slug>`).
