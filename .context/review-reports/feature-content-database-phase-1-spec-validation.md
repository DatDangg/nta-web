# Spec Validation — CR-031 feature/content-database — HẾT PHASE 1

Agent: spec-validator · Mode: **Phase review** · Ngày: 2026-10-14 · Round: 1
Phạm vi: P1-T01 (`8084015`) + P1-T02 (`8794f29`). Import / loader / revalidate / asset / cutover thuộc phase sau → không tính gap.
Nguồn đối chiếu: `SPECIFICATIONS.md:380-417` (R-16, R-16a–d), `SPECIFICATIONS.md:466-474` (R-27), `.context/project-config.md:41-61,81-97,148`,
task files `tasks/feature-content-database/phase-1-task-0{1,2}.md`, review reports P1-T01 r1 (PASS), P1-T02 r1 (FAIL) → r2 (PASS),
code: `src/db/schema.ts`, `drizzle/0000_empty_supernaut.sql`, `docker-compose.yml`, `Dockerfile`, `.github/workflows/deploy.yml`, `deploy/db/*`,
`docs/runbook/db.md`, `docs/runbook/deploy-vps.md`, `.env.example`, `package.json`. Bằng chứng VPS: do user báo sau deploy `8794f29`.

## Verdict: ✅ PASS (⚠️ GAPS FOUND — 0 BLOCKER, 2 MAJOR, 4 MINOR)

Phase 1 build đúng và đủ phần hạ tầng DB/backup/gate theo spec delta. Không có gap chặn việc bắt đầu phase 2.
Điều kiện kèm theo:
- **MAJOR-1** phải sửa (P2-T01 docs) **trước khi chạy import seed lên prod**: runbook restore phải dùng được trên VPS khi không có secret trong shell.
- **MAJOR-2** phải có **trước migration HIGH_RISK đầu tiên** (CR-031 hiện chỉ có migration additive nên chưa kích hoạt).
- Diễn tập restore **trên VPS** cần làm trước import (xem mục "Chưa chứng minh trên VPS").

## Ma trận coverage

| # | Requirement (phần phase 1) | Nguồn spec | Implementation | Status | Ghi chú |
|---|---|---|---|---|---|
| 1 | Bảng nội dung `content_entries` (collection/slug/locale, data jsonb, body, thứ tự, version, xoá mềm, updated_by) | R-16, R-16a | `src/db/schema.ts:46-77`, `drizzle/0000…sql:1-17` | ✅ | UNIQUE(collection,slug,locale), CHECK locale vi/en, index live `deleted_at IS NULL` |
| 2 | Bảng lịch sử: version tăng dần, snapshot đầy đủ, op create\|update\|delete, actor, thời điểm | R-16a | `schema.ts:80-103`, SQL `:19-31` | ⚠️ PARTIAL | đủ version/op(+rollback)/actor/created_at/UNIQUE(entry_id,version); **thiếu `sort_order` trong snapshot** (MINOR-1). Ghi cùng transaction = tầng app → P2-T02 (không tính) |
| 3 | Xoá mềm có lịch sử; rollback = ghi snapshot cũ thành version mới | R-16a | `deleted_at` + op `rollback`; FK `ON DELETE no action` (SQL `:33`) | ✅ (schema) | logic ở P2-T02 |
| 4 | Lịch sử bất biến | R-16a | append-only ở tầng app (`schema.ts:79`) | ✅ (thiết kế) | DB không chặn UPDATE/DELETE trên `content_versions` (MINOR-4, tuỳ chọn) |
| 5 | Drizzle versioned + committed | R-16c, config `:41-42,56-57` | `drizzle.config.ts`, `drizzle/0000` + `meta/_journal.json` + snapshot; scripts `db:generate`, `db:migrate` (`package.json:11-12`) | ✅ | |
| 6 | Giai đoạn đầu chỉ additive | R-16c | 0000 chỉ CREATE TABLE / FK trên bảng vừa tạo / CREATE INDEX; gate chạy 0000 → 0 finding (test) | ✅ | |
| 7 | Op destructive gắn `HIGH_RISK_MIGRATION`, chỉ chạy khi user duyệt rõ; CI chặn nếu thiếu marker | R-16c, config `:61,93-96` | `deploy/db/migration-gate.ts` (rules `:31-49`, marker `:9-10`), `migrate.ts:34-57`, `deploy.yml:50-54`; 39 test PASS | ✅ | fail-closed DO/FUNCTION/COPY/CALL/WITH/$$/INSERT…SELECT; chỉ quét migration chưa apply |
| 8 | Cấm `drizzle-kit push`, reset DB, seed ghi đè | R-16c | không có script push/reset/seed trong `package.json`; runbook `db.md:117`, `:151` | ✅ | cấm bằng quy ước + runbook (không chặn kỹ thuật — chấp nhận được) |
| 9 | Thay "verify staging" HIGH_RISK bằng restore backup mới nhất vào DB tạm + chạy thử migration | R-16c `:413`, config `:97` | `restore-check.sh` chỉ restore + đếm; **không có quy trình chạy migration lên DB tạm**; `db.md:136` chỉ nói "đã thử trên DB local" | ⚠️ PARTIAL | MAJOR-2 |
| 10 | Backup pre-migrate bắt buộc, lỗi → dừng deploy | R-16b, R-27 | `deploy.yml:43-45` (trước gate/migrate), `backup.sh:80-82` exit 1 khi dump lỗi/không đọc được; tên `<sha12>-<run_id>-<attempt>`, không ghi đè (`:54-65`) | ✅ | VPS: có `pre-migrate-8794f2917d86-38542920627-1.dump` 812B (DB rỗng trước 0000 — hợp lý) |
| 11 | Backup tự động hằng ngày DB + ảnh upload, giữ ≥14 bản | R-16b | sidecar `docker-compose.yml:68-90`, `backup-loop.sh` 20:00 UTC, `backup.sh:85-96` dump + tar uploads, rotate KEEP=14 | ✅ (code) | VPS: sidecar chạy; **chưa có bản daily đầu tiên** (xem dưới). Restart container không chạy bù (MINOR-3) |
| 12 | Runbook khôi phục đã chạy thử (restore DB tạm + kiểm số bản ghi) | R-16b | `db.md:73-104`, `restore-check.sh`; diễn tập local PASS 3/3/1 (`db.md:103-104`, task 02 builder report) | ⚠️ | runbook chạy thử **local** OK; trên VPS **cần secret trong shell** để chạy (MAJOR-1); chưa drill trên VPS |
| 13 | Volume ảnh upload bền, ngoài image, nằm trong backup | R-16d (phần storage), R-27 `:472` | bind mount host `/opt/nta-web-data/uploads` → `/app/uploads` (`compose:37-39`), sidecar đọc ro (`:89`) | ✅ | VPS: `/app/uploads` writable. Tên khác spec (`nta-web-uploads` volume) → MINOR-2 (doc drift) |
| 14 | `nta-db` PostgreSQL, volume riêng, **không** publish port, chỉ mạng compose | R-27 `:471`, config `:59` | `compose:48-64` không có `ports`, volume tên cố định `nta-db-data` (`:109-111`), mem 512m, healthcheck | ✅ | VPS: `docker port nta-db` rỗng, healthy |
| 15 | Thứ tự deploy backup → migrate → app; app không cần DB lúc build | R-27 `:472` | `deploy.yml:37-60`; `client.ts` lazy (decisions); `nta-web` chưa `depends_on nta-db` | ✅ | VPS: CI xanh, nta-web healthy, `/api/health` ok |
| 16 | Secret server-only `POSTGRES_PASSWORD`/`DATABASE_URL`/`REVALIDATE_SECRET`, không commit, không `NEXT_PUBLIC_*` | R-27 `:473`, R-19, config `:148` | `deploy.yml:23-25` từ GitHub Secrets, `compose` `:?required`; `.env.example` giá trị giả; không biến `NEXT_PUBLIC_` nào chứa secret | ✅ | |
| 17 | project-config mục Database khớp as-built | config `:55-61,93-97` | `db_tool: drizzle`, `migration_required: true`, `prod_db: nta-db`, `db_backup` → runbook `db.md` tồn tại | ✅ | |

## Gaps

### MAJOR-1 — Runbook restore/compose không chạy được trên VPS khi không có secret trong shell [PARTIAL R-16b]
- `docs/runbook/db.md:39-44` yêu cầu `read -rs POSTGRES_PASSWORD` trước mọi `docker compose …`, nhưng secret **chỉ nằm ở GitHub Actions Secrets (write-only, không đọc lại được)**;
  runbook không nói operator lấy giá trị ở đâu / lưu ở đâu (password manager, file root 600 ngoài repo cho `--env-file`).
- Các lệnh vận hành chính đều đi qua compose nên sẽ lỗi `POSTGRES_PASSWORD is required` (đúng như user gặp với `docker compose ps`):
  `db.md:63` (ps), `:67` (backup tay), `:78` (restore-check), `:90-98` (restore prod 4b), `:109-113` (migrate tay).
- `deploy-vps.md` §5–§7 đã ghi cảnh báo + gợi ý `docker ps`/`docker logs` cho lệnh chỉ đọc, nhưng `db.md` §3–§5 không nhắc lại tại chỗ, và **không có đường thay thế cho restore** khi thiếu secret
  (vd `docker exec nta-db-backup /scripts/restore-check.sh …` / `docker exec nta-db-backup /scripts/backup.sh daily` dùng env sẵn trong container; với 4b phải `stop` sidecar nên cần cách khác, vd `docker exec` trước khi stop hoặc `--env-file`).
- Tác động: lúc sự cố mất dữ liệu (sau import) có thể không restore được ngay. → Sửa ở **P2-T01 (docs)**, trước khi import seed lên prod.

### MAJOR-2 — Thiếu quy trình "restore backup mới nhất vào DB tạm + chạy thử migration" thay cho verify staging [PARTIAL R-16c]
- Spec `SPECIFICATIONS.md:413` + `project-config.md:97` bắt buộc bước này cho migration HIGH_RISK. `docs/runbook/db.md:135-142` (§6 xử lý gate đỏ) chỉ ghi "đã thử trên DB local có dữ liệu chưa"; `restore-check.sh` chỉ restore + đếm.
- `nta-migrate` cứng `DATABASE_URL …/nta_web` (`docker-compose.yml:105`); runbook không chỉ cách trỏ sang `nta_restore_*` (vd `docker compose run --rm -e DATABASE_URL=…/nta_restore_check nta-migrate migrate`) và không yêu cầu ghi kết quả vào báo cáo HIGH_RISK.
- Chưa kích hoạt trong CR-031 (toàn additive) → không chặn phase 2; phải có trước migration HIGH_RISK đầu tiên. Gộp vào P2-T01 docs.

### MINOR-1 — Snapshot lịch sử thiếu `sort_order` [PARTIAL R-16a "snapshot dữ liệu đầy đủ"]
- `content_entries.sort_order` (`src/db/schema.ts:57`) là trường đổi được nhưng `content_versions` (`schema.ts:80-103`) không có cột tương ứng → rollback (P2-T02) không khôi phục được thứ tự.
- Xử lý ở P2-T02: thêm cột `sort_order` vào `content_versions` (migration additive) **hoặc** quy ước snapshot = `{data, body, sortOrder}`; ghi vào decisions.

### MINOR-2 — Drift tên lưu trữ ảnh: spec ghi volume `nta-web-uploads`, as-built là bind mount `/opt/nta-web-data/uploads`
- `SPECIFICATIONS.md:472` vs `docker-compose.yml:39,89`, `docs/runbook/db.md:17-22`. Hành vi đáp ứng R-16d (bền, ngoài image, trong backup). Reconcile câu chữ R-27 (as-built) khi spec-publish lần tới.

### MINOR-3 — Backup hằng ngày không chạy bù khi sidecar restart; lỗi chỉ ghi log
- `deploy/db/backup-loop.sh:16-21`: tính lại giờ sau mỗi restart; deploy/restart quanh 20:00 UTC có thể bỏ lỡ 1 ngày. Không có cảnh báo chủ động khi `FAILED`.
  Đã ghi residual risk ở task 02. Đề xuất (tuỳ chọn): kiểm "daily mới nhất > 26h" trong health/monitoring.

### MINOR-4 — Tính bất biến của `content_versions` chỉ ở tầng app (tuỳ chọn)
- Không có trigger/REVOKE chặn UPDATE/DELETE. Chấp nhận được với 1 writer (P2-T02); ghi nhận để quyết định.

## Chưa chứng minh trên VPS (residual)

| Mục | Trạng thái | Cách chứng minh |
|---|---|---|
| Migration 0000 đã apply trên prod | suy ra từ CI xanh (bước Migrate exit 0), user chưa báo trực tiếp | `docker exec nta-db psql -U nta -d nta_web -c 'select id, created_at from drizzle.__drizzle_migrations'` + `\dt` |
| Backup daily đầu tiên (`daily-*.dump` + `uploads-*.tar.gz`) | chưa tới giờ (20:00 UTC = 03:00 VN 15/10) | sáng 15/10: `ls -lht /opt/nta-web-data/db-backups`, `tail backup.log` có 2 dòng `OK` |
| Xoay vòng 14 bản trên VPS | chỉ test local (KEEP=2) | quan sát sau ≥15 ngày, hoặc tin test local |
| **Diễn tập restore trên VPS** (R-16b "đã chạy thử") | chỉ local (`db.md:103-104`); VPS chưa | `docker exec nta-db-backup /scripts/restore-check.sh /backups/<pre-migrate hoặc daily>.dump` → so số bản ghi → `docker exec nta-db dropdb -U nta nta_restore_check`. Nên làm sau import để số bản ghi có ý nghĩa |
| Quyền `/opt/nta-web-data/db-backups` (root 700) | không báo | `ls -ld /opt/nta-web-data/db-backups /opt/nta-web-data/uploads` |
| Dung lượng | 39G trống / 193G (80% dùng) — đủ, ngưỡng cảnh báo 2 GB | theo dõi `WARNING` trong `backup.log` |
| Gate chặn destructive trên VPS | chỉ test local + unit test 39/39 | chưa cần; kích hoạt khi có migration mới |

## Đánh giá riêng: `docker compose ps` lỗi thiếu biến trên VPS
Runbook **đã nêu** nguyên nhân và cách xử lý một phần (`deploy-vps.md` §5 cảnh báo + `--env-file`, §6–§7 dùng `docker ps`/`docker logs`; `db.md:39-44` export secret),
nhưng **chưa đủ**: thiếu nơi lưu/lấy secret và thiếu đường chạy không cần secret cho backup tay / restore-check / restore prod; `db.md` §3 vẫn dùng `docker compose ps` không kèm lưu ý. → MAJOR-1, sửa ở P2-T01 như user dự kiến.

## Verdict reasoning
- Không có ❌ MISSING; không có conflict HIGH giữa spec ↔ config ↔ code.
- 2 MAJOR đều là tài liệu/vận hành, có điều kiện kích hoạt rõ (import seed, migration HIGH_RISK) và đã có task đích (P2-T01, P2-T02) → không chặn chuyển phase.
- Phase 1 → **PASS**, kèm follow-up bắt buộc MAJOR-1/MAJOR-2/MINOR-1 trong phase 2.
