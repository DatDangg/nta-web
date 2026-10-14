# feature-content-database · phase-4-task-01 — Parity toàn site + cutover production

- **CR:** CR-031 · spec R-16, R-16b, R-16c, R-27 (4.2.0) · 5 acceptance của change doc
- **Classification / Risk:** MODIFY (cutover prod) · HIGH — migrate + import thẳng DB prod (không staging, user chấp nhận)
  - Expected review level: **STRICT**
  - Blast radius: toàn bộ website production; VPS dùng chung.
  - Doc impact: runbook (bằng chứng cutover).

## Scope
1. **Parity local toàn site:** bản đọc file (commit trước task 5) vs bản đọc DB; crawl mọi URL sitemap vi+en + URL redirect/404 đã biết;
   so status code + HTML chuẩn hoá (bỏ build-id/hash); lệch → sửa ở task gốc. Screenshot 375/1280: trang chủ, 1 listing, 1 chi tiết mỗi loại.
2. **Cutover (human checkpoint — user duyệt deploy production):** (migration 0000 đã chạy từ task 2) backup → (user xác nhận) import seed
   1 lần (chỉ chèn) → parity DB prod ↔ file → bật `CONTENT_SOURCE=db` + `depends_on nta-db` → deploy → smoke.
3. Smoke prod: mọi URL sitemap 200, 301/404 như cũ, `/api/health` OK; end-to-end "sửa DB → revalidate → web đổi, không build" trên 1 bản ghi rồi **rollback** (kiểm lịch sử).
4. Backup hằng ngày chạy được trên VPS + restore thử vào DB tạm trên VPS.
5. Kế hoạch lùi: lỗi sau deploy → đặt lại `CONTENT_SOURCE=file` + deploy lại (DB giữ nguyên, không xoá).

## Thao tác của USER
- Duyệt deploy production; xác nhận chạy import lên DB prod; secret đã đặt (task 2).

## Acceptance
- Đủ 5 acceptance của change doc, có bằng chứng.
