# feature-content-database · phase-1-task-02 — Container `nta-db` + backup tự động + backup trước migrate + runbook restore

- **CR:** CR-031 · spec R-16b, R-16c, R-27 (4.2.0)
- **Classification / Risk:** ADDITIVE (infra) · HIGH
  - Expected review level: **STRICT** (infra VPS dùng chung, secret, data loss)
  - Blast radius: `docker-compose.yml`, `.github/workflows/deploy.yml`, mới `deploy/db/**`, `docs/runbook/db.md`.
    VPS dùng chung (ismartschool, crm-dhp, tmfoods) → **chỉ thêm container/volume mới**, không đụng container/cron/nginx khác.
  - Doc impact: `docs/runbook/db.md` (mới), `docs/runbook/deploy-vps.md` (mục DB).
  - Decision impact: cách chạy migrate trong deploy + sidecar backup → decisions.md.

## Scope
1. `docker-compose.yml`: service `nta-db` (`postgres:16-alpine`, pin minor), named volume `nta-db-data`, **không `ports:`** (chỉ mạng compose),
   healthcheck `pg_isready`, `POSTGRES_PASSWORD` bắt buộc (`${POSTGRES_PASSWORD:?}`), `restart: unless-stopped`, giới hạn RAM hợp lý.
   `nta-web` nhận `DATABASE_URL` + `REVALIDATE_SECRET` từ env; **chưa** `depends_on nta-db` (thêm ở task 8 khi bật `CONTENT_SOURCE=db`).
1b. Volume ảnh upload `nta-web-uploads` (bind mount host, đề xuất `/opt/nta-web-data/uploads`) mount vào `nta-web` tại `UPLOAD_DIR`
   (vd `/app/uploads`, user `nextjs` ghi được) — R-16d; chưa có code dùng tới ở task này.
2. Backup tự động bằng **container sidecar** `nta-db-backup` (không cài cron lên host): `pg_dump -Fc` hằng ngày, giữ ≥14 bản,
   ghi ra bind mount host (đề xuất `/opt/nta-web-data/db-backups` — user xác nhận), log thành công/thất bại.
   Cùng lượt backup: nén thư mục upload (`tar.gz`, cùng chính sách giữ 14 bản) — R-16b.
3. Service một-lần `nta-migrate` (profile `tools`) chạy migration Drizzle (drizzle-kit hoặc migrator của drizzle-orm — chọn cách đơn giản, ghi decisions.md).
4. `deploy.yml`: `up -d nta-db` → chờ healthy → **backup pre-migrate** (`pre-migrate-<sha>.dump`; fail → deploy fail)
   → **gate destructive**: script quét migration chưa apply (DROP / ALTER … TYPE / SET NOT NULL / ADD CONSTRAINT UNIQUE|FOREIGN / DROP TYPE / UPDATE|DELETE hàng loạt);
   có mà thiếu dòng `-- HIGH_RISK_MIGRATION: approved <ngày> by user` → fail → migrate → build/up web. Secret qua GitHub Secrets/env runner, không echo.
5. `docs/runbook/db.md`: secret cần đặt, xem log backup, **restore** (vào DB tạm → kiểm tra → restore prod), migrate tay, xử lý deploy đỏ do gate.
6. **Diễn tập restore** local: dump → restore vào DB tạm → so số bản ghi. Ghi bằng chứng.

## Thao tác của USER (agent không tự làm)
- Thêm GitHub Secrets (repo DatDangg/nta-web) hoặc env runner: `POSTGRES_PASSWORD`, `REVALIDATE_SECRET` (agent đưa hướng dẫn; user đặt giá trị).
- Xác nhận thư mục backup + thư mục upload trên VPS + dung lượng đĩa trống.

## Acceptance
- `docker compose config` hợp lệ; DB không lộ port; web hiện tại vẫn chạy bình thường.
- Sidecar tạo dump + xoay vòng; backup pre-migrate chặn deploy khi lỗi; gate destructive có test (SQL destructive → fail, additive → pass, có marker duyệt → pass).
- Diễn tập restore PASS.

## Builder report
- **Agent:** builder · 2026-10-14 · attempt 1
- **Files mới:** `deploy/db/migration-gate.ts`, `deploy/db/migration-gate.test.ts`, `deploy/db/migrate.ts`, `deploy/db/backup.sh`,
  `deploy/db/backup-loop.sh`, `deploy/db/restore-check.sh`, `deploy/db/Dockerfile.backup`, `deploy/db/.gitattributes` (`*.sh` luôn LF),
  `docs/runbook/db.md`.
- **Files sửa:** `docker-compose.yml` (thêm `nta-db`, `nta-db-backup`, `nta-migrate`[profile tools], volume `nta-db-data`; `nta-web` thêm
  `DATABASE_URL`/`REVALIDATE_SECRET`/`UPLOAD_DIR` + mount uploads, chưa depends_on), `Dockerfile` (stage `migrator` trước `runner`, runner vẫn là stage cuối),
  `.github/workflows/deploy.yml` (config -q → DB healthy → backup pre-migrate → gate → migrate → build/up web → health), `package.json`
  (script `test` thêm glob `deploy/**/*.test.ts`; không đổi dependency/lock), `docs/runbook/deploy-vps.md` (§1, §2, §4, §5, §8), `.context/decisions.md`.
- **Verify (local Docker, project `-p nta-web-test`, volume `nta-web-test-db-data`, thư mục scratch — đã dọn sạch):**
  - `npm test` → PASS 32/32 (27 test gate mới: 13 case destructive → blocked, additive/comment/chuỗi → pass, FK + UNIQUE INDEX trên bảng tạo cùng file → pass,
    `drizzle/0000` thật → pass 0 finding, marker hợp lệ → pass, 5 marker sai định dạng → blocked, selectPendingMigrations ×3).
  - `npm run typecheck` PASS · `npm run lint` PASS (0 error, 1 warning `<img>` có sẵn).
  - `docker compose config --quiet`: thiếu `POSTGRES_PASSWORD`/`REVALIDATE_SECRET` → lỗi rõ; có env → OK; `--profile tools` → OK. Chỉ `nta-web` có `ports`.
  - `up -d --wait nta-db` → healthy; sidecar start log "backup hằng ngày lúc 20:00 UTC".
  - Backup pre-migrate → `pre-migrate-abc123def456.dump` exit 0; sai mật khẩu → `FAILED pg_dump lỗi` exit 1, không để lại file.
  - `nta-migrate check` (DB rỗng) → `0000 → OK`; `migrate` → apply; chạy lại check/migrate → "không có migration chờ", exit 0.
  - Gate trong container: thêm `0001` `DROP COLUMN` chờ apply → `BLOCKED` exit 1, cột vẫn còn; thêm marker → `APPROVED (HIGH_RISK_MIGRATION)` exit 0.
  - Backup daily ×3 với `BACKUP_KEEP=2` → rotate xoá bản cũ nhất cả `.dump` lẫn `uploads-*.tar.gz` (tar chứa file test); `BACKUP_MIN_FREE_MB` lớn → dòng WARNING, exit 0.
  - **Diễn tập restore:** insert 3 `content_entries` + 3 `content_versions` → `restore-check.sh` vào `nta_restore_check` → số bản ghi khớp (3/3/1);
    guard tên DB tạm = `nta_web` → từ chối exit 2. Xoá dữ liệu prod giả lập → lệnh restore prod §4b (`--clean --if-exists --single-transaction`) → về 3/3/1.
  - `sh -n` 3 script PASS; guard `BACKUP_HOUR_UTC=25` / label lạ → exit 2.
  - Build: `docker compose build nta-web` PASS (Generating static pages 61/61). Chạy `nta-web` (port test 3105): `/api/health` ok, user `nextjs` ghi được `/app/uploads`,
    `DATABASE_URL` có; **dừng `nta-db` → web vẫn health ok** (chưa phụ thuộc DB).
  - Dọn: `down -v --remove-orphans` + xoá 3 image test + thư mục scratch; không đụng container ismartschool local.
- **Quyết định:** xem `.context/decisions.md` (2026-10-14 CR-031 P1-T02).
- **Residual risk:**
  - Chưa chạy trên VPS thật: quyền thư mục host, `docker compose --wait` của Compose v5.5 trên VPS (local cùng v5.5.1 PASS), dung lượng đĩa chưa biết (chỉ có cảnh báo log).
  - Không backup off-site (user chấp nhận) — mất đĩa VPS là mất cả backup.
  - Gate dựa regex trên SQL do drizzle-kit sinh; SQL viết tay phức tạp (DO $$ … $$, function) có thể lọt/khớp nhầm → reviewer migration vẫn cần đọc file.
  - Lịch backup tính theo đồng hồ container (UTC); container restart giữa chừng chỉ dời lần chạy, không chạy bù.
  - Push chỉ sau khi secret đã đặt (đã xác nhận) — deploy đầu sẽ tạo volume + chạy 0000 trên DB rỗng.

### Fix round 1 (review STRICT round 1 FAIL — `.context/review-reports/feature-content-database-phase-1-task-02-round-1-review.md`)
- **MAJOR-1:** `deploy.yml` đặt tên `pre-migrate-${GITHUB_SHA::12}-${GITHUB_RUN_ID}-${GITHUB_RUN_ATTEMPT}`; `backup.sh` thêm `refuse_existing`
  (trùng tên → FAILED exit 1 trước khi dump) + `publish_file` (`mv -n` rồi kiểm lại file tạm → không ghi đè cả khi race). Xoay vòng giữ nguyên pattern `pre-migrate-*.dump`.
- **MINOR-2:** `migration-gate.ts` bỏ comment/chuỗi bằng một regex alternation quét một lượt (`'…'` có `''`, `$tag$…$tag$`, `--`, `/* */`). Test `DEFAULT '--x'` + `DROP TABLE` sau đó → bị chặn.
- **MINOR-3:** rule fail-closed: `DO`, `CREATE [OR REPLACE] FUNCTION|PROCEDURE`, `COPY`, `CALL`, `WITH …`, statement có `$$`, `INSERT … SELECT`. +6 test.
- **MINOR-4:** `restore-check.sh` chỉ nhận DB tạm tiền tố `nta_restore_`, từ chối `nta_web|postgres|template0|template1`.
- **MINOR-5/6:** `deploy-vps.md` §5–§7 ghi rõ export secret (hoặc `--env-file` ngoài repo, 600) trước `docker compose`, lệnh chỉ đọc dùng `docker ps/logs`;
  §5 thêm cảnh báo rollback về commit trước P1-T02 + `--remove-orphans` gỡ `nta-db`/`nta-db-backup` (volume còn, backup dừng) và cách xử lý. `db.md` §2, §3, §4a, §6 cập nhật.
- Xoá `.context/runs/feature-content-database-phase-1-task-02.builder.md` (subagent không ghi journal).
- **Verify:** `npm test` PASS 39/39 · typecheck PASS · lint PASS (0 error, 1 warning có sẵn) · `docker compose config --quiet` (+ `--profile tools`) PASS với env giả.
  Docker local `-p nta-web-test`: backup `pre-migrate-0123456789ab-17000001-1` OK; chạy lần 2 cùng tên → `FAILED … đã tồn tại — không ghi đè` exit 1, md5 file cũ không đổi;
  attempt 2 → file mới; `BACKUP_KEEP=2` → rotate xoá đúng 2 bản cũ nhất; busybox `mv -n` giữ file đích cũ (race). Guard restore: postgres/template0/nta_web/foo/`nta_restore_` → từ chối exit 2,
  `nta_restore_ok` → chạy. Đã `down -v` + xoá image test + thư mục scratch.

## Close-out
- Status: **done** · Acceptance criteria: PASS (local; chạy thật trên VPS ở lần deploy này)
- Verify: npm test PASS 39/39 · typecheck PASS · lint PASS (1 warning có sẵn) · docker compose config PASS (env giả) · docker local: migrate + gate + backup + xoay vòng + restore drill PASS · docker compose build nta-web 61/61
- Reviewer verdict: STRICT round 1 FAIL (MAJOR-1 ghi đè dump pre-migrate) → fix → round 2 **PASS** — .context/review-reports/feature-content-database-phase-1-task-02-round-2-review.md
- Follow-up (MINOR-7, tuỳ chọn): tokenizer gate xử lý identifier ngoặc kép.
- Migration: none mới (0000 đã có từ P1-T01; lần deploy này sẽ apply 0000 lên DB prod rỗng sau backup pre-migrate).
- Doc impact: docs/runbook/db.md (mới), docs/runbook/deploy-vps.md, .context/decisions.md.
