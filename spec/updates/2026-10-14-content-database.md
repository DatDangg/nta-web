# Spec Update — 2026-10-14 content-database

**spec_version:** 4.1.0 → 4.2.0 (MINOR)
**Trigger:** feature-update (CR-031 — ADDITIVE + MODIFY kiến trúc)
**Trạng thái:** spec delta ghi ở bước planning; requirement **có hiệu lực khi cutover (phase 4) PASS**.
`spec/test-scope/current.json` sẽ sinh ở close-out (scopeVersion 49) — chưa sinh ở bước này.

**Requirements:**
- SỬA **R-16**: bỏ "v1 không có DB" → toàn bộ nội dung (blog, giải pháp, sản phẩm, case study, about, listings, trang chủ,
  danh mục slug) lưu PostgreSQL; web chỉ đọc DB; `src/content/**` là seed ban đầu, không còn nguồn sự thật; URL/slug và
  giao diện giữ y hệt; sửa DB + revalidate → lên web không build lại. Chữ giao diện `src/i18n/messages`, `company-info.ts`,
  ảnh `public/images` giữ trong repo (mặc định — chờ user xác nhận).
- THÊM **R-15a**: `POST /api/revalidate` bảo vệ bằng `REVALIDATE_SECRET` (constant-time), 401/400/200.
- THÊM **R-16a**: lịch sử phiên bản nội dung bất biến, ghi cùng transaction; xoá mềm; rollback = version mới từ snapshot cũ.
- THÊM **R-16b**: backup `pg_dump` hằng ngày (≥ 14 bản) + bắt buộc trước migration; runbook restore đã chạy thử.
- THÊM **R-16c**: Drizzle migration versioned, chỉ DB prod (không staging — user chấp nhận), additive giai đoạn đầu,
  destructive → `HIGH_RISK_MIGRATION` + user duyệt; cấm `push`/reset/seed ghi đè; import seed 1 lần chỉ-chèn.
- SỬA **R-15** (ghi chú): vẫn không có API đọc nội dung công khai.
- SỬA **R-27**: thêm container `nta-db` (không publish port), backup, thứ tự deploy backup → migrate → app; secret mới.
- SỬA Scope / Tech Stack: thêm PostgreSQL + Drizzle; không làm admin web.

**Cập nhật phạm vi (cùng 4.2.0, chưa phát hành test-scope — không bump thêm), quyết định user #9/#10:**
- SỬA **R-16**: thêm chữ giao diện `src/i18n/messages/{vi,en}.json` + `company-info.ts` vào DB; ảnh `public/images` giữ trong repo.
- THÊM **R-16d**: lưu trữ ảnh mới trên volume bền (backup cùng DB), URL `/uploads/...`, `next/image` không build lại, metadata + lịch sử
  trong DB, validate loại/dung lượng, chống path traversal. Bot nhận ảnh thuộc CR-030.
- SỬA **R-16b** (backup gồm thư mục upload), **R-27** (bind mount `/opt/nta-web-data/uploads`, trước ghi volume `nta-web-uploads`).

**Ảnh hưởng:** mọi loader `src/lib/content/*.ts` + registry TS (`slug.ts`, `listings.ts`, `home.ts`, `solutions/overview.ts`)
và các trang/route dùng chúng (≈55 file import); sitemap/hreflang; mega menu; `docker-compose.yml`, `deploy.yml`;
docs ERD/DESIGN/API_SPEC/runbook/content-bot. Test: toàn bộ trang vi+en (regression parity), endpoint revalidate,
backup/restore.
**Nguồn:** `spec/changes/2026-10-14-content-database.md` (CR-031).
