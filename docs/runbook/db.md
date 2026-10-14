# Runbook — PostgreSQL nội dung (`nta-db`) trên VPS

> CR-031 (R-16b, R-16c, R-27). DB chạy trong compose project `nta-web` cùng web, **không publish port**.
> VPS dùng chung (ismartschool, crm-dhp, tmfoods): chỉ thao tác trên container/volume tiền tố `nta-`.
> Mọi lệnh dưới chạy **trên VPS**, đứng trong workspace runner:
> `cd /opt/actions-runner-nta-web/_work/nta-web/nta-web` (hoặc bản clone thủ công).

## 0. Thành phần

| Service | Vai trò | Ghi chú |
|---|---|---|
| `nta-db` | `postgres:16.15-alpine`, DB `nta_web`, user `nta` | volume `nta-db-data` (tên cố định), RAM ≤ 512 MB, healthcheck `pg_isready` |
| `nta-db-backup` | sidecar backup hằng ngày 20:00 UTC (03:00 VN) | chạy root; ghi `/opt/nta-web-data/db-backups`; giữ 14 bản mỗi loại |
| `nta-migrate` | một-lần (profile `tools`): gate destructive + migrate Drizzle | `docker compose run --rm nta-migrate check\|migrate` |
| `nta-web` | nhận `DATABASE_URL`, `REVALIDATE_SECRET`, `UPLOAD_DIR=/app/uploads` | mount `/opt/nta-web-data/uploads`; **chưa** phụ thuộc DB tới cutover (task 8) |

Thư mục host (override qua env `NTA_BACKUP_DIR`, `NTA_UPLOADS_DIR`):

| Đường dẫn | Owner / mode | Dùng cho |
|---|---|---|
| `/opt/nta-web-data/db-backups` | `root:root 700` | dump DB + tar ảnh + `backup.log` |
| `/opt/nta-web-data/uploads` | `1001:1001` (= user `nextjs` trong image) | ảnh upload (R-16d) |

Không có backup off-site (quyết định user 14/10/2026) — mất đĩa VPS là mất cả backup.

## 1. Secret cần đặt

GitHub → repo `DatDangg/nta-web` → Settings → Secrets and variables → Actions:

| Secret | Ghi chú |
|---|---|
| `POSTGRES_PASSWORD` | mật khẩu user `nta`. **Chỉ chữ + số** (ghép thẳng vào `DATABASE_URL`, không URL-encode) |
| `REVALIDATE_SECRET` | khoá cho `POST /api/revalidate` (P3-T03) |

Thiếu một trong hai → bước *Validate compose* của workflow đỏ, không deploy gì.
Đổi `POSTGRES_PASSWORD` sau khi DB đã khởi tạo **không** tự đổi mật khẩu trong DB (Postgres chỉ đọc biến này lần đầu):
phải chạy `ALTER USER nta PASSWORD '...'` trong `nta-db` trước, rồi mới cập nhật secret.

Chạy compose tay trên VPS cần export 2 biến này trước (không lưu vào file trong repo, không gõ lộ vào history dùng chung):

```sh
read -rs POSTGRES_PASSWORD && export POSTGRES_PASSWORD
read -rs REVALIDATE_SECRET && export REVALIDATE_SECRET
```

## 2. Luồng deploy (`.github/workflows/deploy.yml`)

1. `docker compose config --quiet` — kiểm secret.
2. Build `nta-db-backup`, `up -d --wait nta-db` (chờ healthy ≤120s), `up -d nta-db-backup`.
3. **Backup pre-migrate** `pre-migrate-<sha12>-<run_id>-<run_attempt>.dump` — lỗi → deploy dừng. Mỗi lần chạy (kể cả "Re-run jobs" cùng commit) ra file riêng; `backup.sh` không bao giờ ghi đè file đã có (trùng tên → FAILED).
4. **Gate destructive** (`nta-migrate check`) trên migration chưa apply — chặn → deploy dừng (xem §6).
5. **Migrate** (`nta-migrate migrate`, drizzle-orm migrator, bảng `drizzle.__drizzle_migrations`).
6. Build + `up -d --remove-orphans` web → health check như cũ.

Bước 2–5 lỗi thì web đang chạy giữ nguyên (chưa recreate).

## 3. Xem backup + log

```sh
ls -lht /opt/nta-web-data/db-backups | head -20
tail -n 50 /opt/nta-web-data/db-backups/backup.log     # dòng OK / FAILED / WARNING / rotate
docker logs --tail 50 nta-db-backup                      # log vòng lặp sidecar
docker compose ps nta-db nta-db-backup                   # nta-db phải (healthy)
```

File: `daily-<UTC>.dump` (pg_dump -Fc), `uploads-<UTC>.tar.gz`, `pre-migrate-<sha12>-<run_id>-<attempt>.dump`. Mỗi loại giữ 14 bản mới nhất.
Chạy backup ngay (không chờ lịch): `docker compose exec nta-db-backup /scripts/backup.sh daily`.

**Cảnh báo dung lượng:** mỗi lần backup, nếu dung lượng trống của thư mục backup < 2048 MB (`BACKUP_MIN_FREE_MB`)
→ ghi dòng `WARNING dung lượng trống ...` (không fail). Thấy cảnh báo: `df -h /opt/nta-web-data`, xoá bớt
`pre-migrate-*.dump` cũ hoặc giải phóng đĩa — KHÔNG xoá file của app khác trên VPS.

## 4. Restore

### 4a. Diễn tập / kiểm tra bản dump (vào DB TẠM — không đụng prod)

```sh
docker compose run --rm nta-db-backup /scripts/restore-check.sh /backups/<file>.dump
# → restore vào DB nta_restore_check (tên DB tạm bắt buộc tiền tố `nta_restore_`), in số bản ghi của DB tạm và nta_web để so
docker compose exec nta-db psql -U nta -d nta_restore_check     # soi thêm nếu cần
docker compose exec nta-db dropdb -U nta nta_restore_check       # xoá DB tạm khi xong
```

`restore-check.sh` chỉ nhận tên DB tạm bắt đầu `nta_restore_` (từ chối `nta_web`, `postgres`, `template0/1` và tên khác) vì nó `dropdb` DB đích trước khi restore.

### 4b. Restore prod (sau khi 4a cho kết quả đúng)

```sh
# 1. backup trạng thái hiện tại trước khi ghi đè (để còn đường lui)
docker compose run --rm --no-deps nta-db-backup /scripts/backup.sh pre-migrate-before-restore-$(date -u +%Y%m%d%H%M)
# 2. tạm dừng backup sidecar (tránh dump giữa chừng); sau cutover (task 8) dừng cả nta-web
docker compose stop nta-db-backup
# 3. restore trong 1 transaction — lỗi thì rollback toàn bộ
docker compose run --rm --no-deps nta-db-backup sh -c \
  'pg_restore --clean --if-exists --no-owner --single-transaction --exit-on-error -d nta_web /backups/<file>.dump'
# 4. kiểm tra + bật lại
docker compose exec nta-db psql -U nta -d nta_web -c 'select count(*) from content_entries'
docker compose up -d --no-deps nta-db-backup
```

Restore ảnh upload: `tar -xzf /opt/nta-web-data/db-backups/uploads-<UTC>.tar.gz -C /opt/nta-web-data/uploads && chown -R 1001:1001 /opt/nta-web-data/uploads`.

Đã diễn tập 14/10/2026 (local Docker, postgres 16.15): 3 `content_entries` + 3 `content_versions` → dump → restore DB tạm khớp số bản ghi;
xoá dữ liệu rồi chạy lệnh 4b → khôi phục đủ 3/3/1 (`__drizzle_migrations`).

## 5. Migrate tay

```sh
docker compose --profile tools build nta-migrate
docker compose run --rm --no-deps nta-db-backup /scripts/backup.sh pre-migrate-manual-$(date -u +%Y%m%d%H%M)   # bắt buộc
docker compose run --rm nta-migrate check      # chỉ gate, in migration chờ + finding
docker compose run --rm nta-migrate migrate    # gate rồi apply
docker compose exec nta-db psql -U nta -d nta_web -c 'select id, created_at from drizzle.__drizzle_migrations order by id'
```

Local dev dùng `npm run db:migrate` (drizzle-kit migrate) — cùng bảng `drizzle.__drizzle_migrations`.
**Cấm** `drizzle-kit push`, `db:push`, reset/seed trên DB prod.

## 6. Deploy đỏ do gate destructive

Log bước *Gate destructive migration* có dạng:

```
[gate] 0003_xxx.sql → BLOCKED
[gate]   #2 ALTER COLUMN ... TYPE: ALTER TABLE "content_entries" ALTER COLUMN ...
[gate] FAIL — migration phá hoại thiếu dòng duyệt ...
```

Gate quét migration **chưa apply** (so `drizzle/meta/_journal.json` với `drizzle.__drizzle_migrations`, cùng điều kiện drizzle migrator).
Chặn: `DROP …`, `TRUNCATE`, `UPDATE`, `DELETE`, `ALTER TYPE … RENAME/DROP`, và trên bảng **đã tồn tại**: `ALTER TABLE … DROP` (trừ `DROP DEFAULT`/`DROP NOT NULL`),
`ALTER COLUMN … TYPE`, `SET NOT NULL`, `ADD CONSTRAINT UNIQUE|FOREIGN KEY|PRIMARY KEY`, `RENAME`, `CREATE UNIQUE INDEX`.
Thao tác trên bảng được `CREATE TABLE` trong cùng file thì bỏ qua (bảng mới, chưa có dữ liệu). Comment, chuỗi `'...'` và nội dung dollar-quote không bị quét tìm từ khoá.
Luôn cần duyệt tay (fail-closed, gate không phân tích được bên trong): `DO …`, `CREATE [OR REPLACE] FUNCTION|PROCEDURE`, `COPY`, `CALL`, CTE `WITH …`, mọi statement có `$$`, backfill `INSERT … SELECT`.

Xử lý:
1. Đọc file SQL, đánh giá mất/biến đổi dữ liệu, cách rollback, đã thử trên DB local có dữ liệu chưa.
2. Không chấp nhận được → sửa migration (chỉ khi **chưa apply** ở đâu) hoặc tách thành bước additive.
3. Chấp nhận → user duyệt rồi thêm **một dòng riêng** ở đầu file (ngày ISO):
   ```sql
   -- HIGH_RISK_MIGRATION: approved 2026-10-20 by <tên người duyệt>
   ```
   commit + push lại. Backup pre-migrate vẫn chạy trước migrate. Gate log `APPROVED (HIGH_RISK_MIGRATION)` kèm finding.
4. Không sửa file migration đã apply ở prod.

## 7. Sự cố thường gặp

- **`nta-db` không healthy:** `docker compose logs --tail=100 nta-db`; RAM giới hạn 512 MB (`mem_limit`).
- **Backup FAILED `password authentication failed`:** secret `POSTGRES_PASSWORD` khác mật khẩu đã khởi tạo trong volume (xem §1).
- **Backup FAILED `Permission denied` ở /backups:** kiểm `ls -ld /opt/nta-web-data/db-backups` (root 700; sidecar chạy root).
- **Web không ghi được ảnh:** `chown -R 1001:1001 /opt/nta-web-data/uploads`.
- **Không bao giờ** `docker volume rm nta-db-data`, `docker compose down -v` — mất toàn bộ DB.
