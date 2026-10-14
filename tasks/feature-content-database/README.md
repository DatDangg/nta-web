# feature-content-database — CR-031 phase/task plan

Change doc: `spec/changes/2026-10-14-content-database.md` · Spec delta 4.1.0 → 4.2.0 (R-15a, R-16, R-16a/b/c, R-27).
Classification: **ADDITIVE + MODIFY (kiến trúc)** · Risk: **HIGH** · Review level task code/infra: **STRICT**.

| # | Task | Phụ thuộc | Cần user? |
|---|---|---|---|
| 1 | `phase-1-task-01` Schema bảng nội dung + lịch sử, Drizzle setup, migration 0000 | — | không |
| 2 | `phase-1-task-02` Container `nta-db` + backup tự động + backup trước migrate + gate destructive + runbook restore | 1 | **có** — đặt secret, xác nhận thư mục backup trên VPS |
| 3 | `phase-2-task-01` Import seed vi+en (chỉ chèn, idempotent) + parity check DB ↔ file | 1 | không (chạy prod ở task 8) |
| 4 | `phase-2-task-02` Write-path có version + rollback + CLI bảo trì | 1 | không |
| 5 | `phase-3-task-01` Data-access đọc DB có cache tag; loader MDX đọc DB | 3 | không |
| 6 | `phase-3-task-02` Registry TS (slug/listings/home/overview) → DB; render không cần DB lúc build | 5 | không |
| 7 | `phase-3-task-03` `POST /api/revalidate` có secret | 5 | không |
| 8 | `phase-4-task-01` Parity toàn site + cutover prod (backup → migrate → import → deploy → smoke) | 2,3,4,6,7 | **có** — duyệt deploy prod + xác nhận chạy import |
| 9 | `phase-5-task-01` Doc reconcile (ERD, DESIGN, API_SPEC, runbook, content-bot, src/content README) | 8 | không |

Thứ tự: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9. Hết mỗi phase → `spec-validator` + human checkpoint.
Phần thao tác VPS của task 2 (secret) chờ user nhưng không chặn task 3–7 (dev dùng Postgres Docker local).
Production **không đổi nguồn nội dung** cho tới task 8 (cờ `CONTENT_SOURCE` mặc định `file` — xem mục Lưu ý push).

### Lưu ý push (vì `auto_push_after_pass: true` → push main = CI deploy) — sau spec-validator round 1 (M1)
- **Cờ `CONTENT_SOURCE=file|db` (mặc định `file`)**: task 5–7 thêm đường đọc DB sau cờ → mọi commit push an toàn,
  prod vẫn đọc file cho tới task 8 bật `db`. Phase 5 bỏ cờ + đường đọc file (web ngừng đọc `src/content`).
- Task 2: đổi `docker-compose.yml`/`deploy.yml` → **chỉ push sau khi user đã đặt secret** `POSTGRES_PASSWORD`, `REVALIDATE_SECRET`
  (thiếu → deploy đỏ). `nta-web` **chưa** `depends_on nta-db` cho tới task 8. Migrate 0000 (chỉ CREATE trên DB rỗng) chạy tự động
  trong deploy từ task 2 — không cần checkpoint riêng; checkpoint cutover (task 8) là import + bật `db`.
- Test runner: chốt ở task 1 (`npm test`, không thêm framework nặng) → ghi `test_command` vào project-config.
