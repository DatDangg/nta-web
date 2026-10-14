---
id: content-database
type: feature
status: in_progress
created: 2026-10-14
---

# Thêm database lưu nội dung website (thay cho file MDX/TS)

## Yêu cầu
Hiện website không có DB (`db_tool: none`): nội dung là file MDX/TS trong `src/content`, mọi thay đổi phải
commit → build → deploy. User muốn **làm DB** để lưu nội dung, làm nền cho bot Telegram (CR-030) thêm/sửa/xoá nội dung.

## Ảnh hưởng dự kiến (cần phân tích khi xử lý)
- Kiến trúc: SSG đọc file → đọc từ DB (ISR/revalidate theo yêu cầu) — đụng mọi loader `src/lib/content/*.ts`.
- Hạ tầng: thêm container DB trên VPS dùng chung (ismartschool, crm-dhp, tmfoods), backup, secret kết nối.
- Migration gate bật (`db_tool != none`, `migration_required: true`): migration versioned, `staging_db` ≠ `prod_db`
  — hiện **chưa có môi trường staging**.
- Chuyển dữ liệu: import toàn bộ MDX/TS hiện có (vi + en) vào DB, giữ nguyên URL/slug.
- CR-030 đổi luồng: bot ghi DB + revalidate thay vì commit git → cần bảng version/lịch sử để duyệt & rollback.
- Docs: `docs/ERD.md`, `docs/DESIGN.md`, `docs/content-bot/*`, `.context/project-config.md`.

## Quyết định của user (2026-10-14)
1. Mục đích: **bot sửa nội dung lên web ngay** (ghi DB → revalidate, không build/deploy mỗi lần sửa). Không làm trang admin web, không lưu form liên hệ.
2. Loại DB: **PostgreSQL**, container riêng trên VPS hiện có.
3. Phạm vi: **toàn bộ nội dung** (blog, giải pháp, sản phẩm, case study, about, thẻ danh sách, trang chủ).
4. Admin web: không (chỉ bot Telegram).
5. Staging: **chỉ DB prod** — user chấp nhận bỏ yêu cầu `staging_db ≠ prod_db` của migration gate.
   Rủi ro: migration chạy thẳng lên prod. Bù lại khi build: backup (`pg_dump`) bắt buộc trước mỗi migration,
   migration chỉ additive ở giai đoạn đầu, op destructive vẫn gắn `HIGH_RISK_MIGRATION` + hỏi user trước khi chạy.

6. ORM/migration tool: **Drizzle** (drizzle-orm + drizzle-kit, migration SQL versioned).
7. File MDX/TS trong `src/content`: **giữ làm seed import ban đầu, web ngừng đọc** (ghi rõ không còn là nguồn sự thật).
8. Môi trường DB: **chỉ dùng DB prod, không quan tâm staging** (bỏ hẳn yêu cầu DB staging khỏi acceptance).

## Acceptance (chốt 2026-10-14)
- [ ] Mọi trang hiện có hiển thị y hệt sau khi chuyển nguồn sang DB (vi + en, cùng URL)
- [ ] Sửa nội dung trong DB → lên web không cần build lại
- [ ] Migration versioned + committed (Drizzle); dùng thẳng DB prod, không có DB staging
- [ ] Có backup DB tự động + cách khôi phục
- [ ] Có lịch sử phiên bản nội dung để rollback

## Ghi chú
Liên quan: CR-030 (bot Telegram) phụ thuộc quyết định này. Context hiện tại: `docs/content-bot/` (mô hình dữ liệu dạng file ở `08-data-model.md`, schema ở `02-schemas.md`).
