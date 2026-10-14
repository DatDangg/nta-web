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
| `nta-migrate` | một-lần (profile `tools`): gate destructive + migrate Drizzle | CI: `docker compose run --rm nta-migrate check\|migrate`; tay: §5 |
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

### 1a. Trên VPS KHÔNG có sẵn secret — đó là bình thường

Secret chỉ nằm ở GitHub Secrets (ghi được, **không đọc lại được**); CI truyền vào lúc deploy, VPS không lưu file `.env`.
Vì compose nội suy cả file, **mọi** lệnh `docker compose ...` (kể cả `ps`, `logs`, `exec`, `run`) gõ tay trên VPS sẽ lỗi
`POSTGRES_PASSWORD is required` — không phải sự cố. Thao tác hằng ngày dùng thẳng `docker` (container đã có sẵn env do CI cấp):

| Việc | Lệnh (không cần secret) |
|---|---|
| Trạng thái | `docker ps --filter name=nta` → `nta-db` phải `(healthy)` |
| Log | `docker logs --tail 100 nta-db` · `docker logs --tail 50 nta-db-backup` · `docker logs --tail 100 nta-web` |
| Truy vấn DB | `docker exec nta-db psql -U nta -d nta_web -c 'select count(*) from content_entries'` (socket trong container, không cần mật khẩu) |
| Backup ngay | `docker exec nta-db-backup /scripts/backup.sh daily` |
| Diễn tập restore | `docker exec nta-db-backup /scripts/restore-check.sh /backups/<file>.dump` (§4a) |
| Thử migration trên bản restore | `sh deploy/db/migrate-on-restore.sh` (§5b) |

### 1b. Thao tác bắt buộc phải dùng compose (hiếm — vd dựng lại service khi runner chết)

Tạo file env **tạm, ngoài repo, quyền 600** từ giá trị anh tự giữ (password manager), dùng xong xoá ngay.
Không ghi vào workspace runner, không `export` trong shell dùng chung, không dán giá trị vào lệnh (lộ history).

```sh
umask 077
ENVF="$(mktemp /root/nta-compose-env.XXXXXX)"        # ngoài repo, mode 600
read -rs PW && printf 'POSTGRES_PASSWORD=%s\n' "$PW" >> "$ENVF"
read -rs RS && printf 'REVALIDATE_SECRET=%s\n' "$RS" >> "$ENVF"; unset PW RS
docker compose --env-file "$ENVF" ps                   # ... lệnh compose cần chạy
shred -u "$ENVF" 2>/dev/null || rm -f "$ENVF"          # xoá ngay khi xong
```

Giá trị trong file phải **trùng** secret GitHub hiện tại (nhất là `POSTGRES_PASSWORD` — xem trên), sai thì backup/web lỗi xác thực.

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
docker ps --filter name=nta                              # nta-db phải (healthy)
```

File: `daily-<UTC>.dump` (pg_dump -Fc), `uploads-<UTC>.tar.gz`, `pre-migrate-<sha12>-<run_id>-<attempt>.dump`. Mỗi loại giữ 14 bản mới nhất.
Chạy backup ngay (không chờ lịch): `docker exec nta-db-backup /scripts/backup.sh daily`.

**Bỏ lỡ lịch backup:** sidecar ngủ tới 20:00 UTC; nếu container bị restart/recreate (deploy, reboot) quanh giờ đó thì có thể **không có**
`daily-*` của ngày hôm đó. Sau deploy/reboot gần 20:00 UTC: kiểm `tail backup.log` (phải có dòng `OK db → daily-<hôm nay>`),
thiếu thì chạy tay lệnh trên.

**Cảnh báo dung lượng:** mỗi lần backup, nếu dung lượng trống của thư mục backup < 2048 MB (`BACKUP_MIN_FREE_MB`)
→ ghi dòng `WARNING dung lượng trống ...` (không fail). Thấy cảnh báo: `df -h /opt/nta-web-data`, xoá bớt
`pre-migrate-*.dump` cũ hoặc giải phóng đĩa — KHÔNG xoá file của app khác trên VPS.

## 4. Restore

### 4a. Diễn tập / kiểm tra bản dump (vào DB TẠM — không đụng prod)

```sh
docker exec nta-db-backup /scripts/restore-check.sh /backups/<file>.dump
# → restore vào DB nta_restore_check (tên DB tạm bắt buộc tiền tố `nta_restore_`), in số bản ghi của DB tạm và nta_web để so
docker exec -it nta-db psql -U nta -d nta_restore_check     # soi thêm nếu cần
docker exec nta-db dropdb -U nta nta_restore_check          # xoá DB tạm khi xong
```

`restore-check.sh` chỉ nhận tên DB tạm bắt đầu `nta_restore_` (từ chối `nta_web`, `postgres`, `template0/1` và tên khác) vì nó `dropdb` DB đích trước khi restore.

### 4b. Restore prod (sau khi 4a cho kết quả đúng)

```sh
# 0. KHÔNG chạy trong khung 19:50–20:30 UTC (giờ backup hằng ngày của sidecar); sau cutover (task 8) dừng web trước: docker stop nta-web
# 1. backup trạng thái hiện tại trước khi ghi đè (để còn đường lui)
docker exec nta-db-backup /scripts/backup.sh pre-migrate-before-restore-$(date -u +%Y%m%d%H%M)
# 2. restore trong 1 transaction — lỗi thì rollback toàn bộ (chạy trong sidecar: có sẵn env kết nối + /backups)
docker exec nta-db-backup sh -c \
  'pg_restore --clean --if-exists --no-owner --single-transaction --exit-on-error -d nta_web /backups/<file>.dump'
# 3. kiểm tra (+ docker start nta-web nếu đã dừng ở bước 0)
docker exec nta-db psql -U nta -d nta_web -c 'select count(*) from content_entries'
```

Restore ảnh upload: `tar -xzf /opt/nta-web-data/db-backups/uploads-<UTC>.tar.gz -C /opt/nta-web-data/uploads && chown -R 1001:1001 /opt/nta-web-data/uploads`.

Đã diễn tập 14/10/2026 (local Docker, postgres 16.15): 3 `content_entries` + 3 `content_versions` → dump → restore DB tạm khớp số bản ghi;
xoá dữ liệu rồi chạy lệnh 4b → khôi phục đủ 3/3/1 (`__drizzle_migrations`).

## 5. Migrate tay

Bình thường migrate chạy trong CI deploy (§2). Chạy tay (runner chết) phải dùng compose → cần file env tạm `$ENVF` theo §1b:

```sh
docker exec nta-db-backup /scripts/backup.sh pre-migrate-manual-$(date -u +%Y%m%d%H%M)   # bắt buộc, không cần secret
docker compose --env-file "$ENVF" --profile tools build nta-migrate
docker compose --env-file "$ENVF" run --rm --no-deps nta-migrate check      # chỉ gate, in migration chờ + finding
docker compose --env-file "$ENVF" run --rm --no-deps nta-migrate migrate    # gate rồi apply
docker exec nta-db psql -U nta -d nta_web -c 'select id, created_at from drizzle.__drizzle_migrations order by id'
```

## 5b. Chạy thử migration trên bản restore (thay "verify staging" — R-16c)

Không có DB staging → trước khi push migration **HIGH_RISK** (hoặc migration bất kỳ muốn chắc chắn), chạy thử trên bản sao dữ liệu prod.
Trên VPS, đứng trong thư mục đã checkout **đúng commit sẽ deploy** (có `Dockerfile`, `drizzle/`), không cần secret:

```sh
sh deploy/db/migrate-on-restore.sh                                        # .dump mới nhất trong /backups → DB tạm nta_restore_migtest
sh deploy/db/migrate-on-restore.sh pre-migrate-<...>.dump nta_restore_x   # chọn dump / tên DB tạm
```

Script: restore dump vào DB tạm (chỉ nhận tên tiền tố `nta_restore_`, qua `restore-check.sh`) → build image `migrator` từ commit hiện tại
→ chạy gate + migrate với `DATABASE_URL` trỏ **DB tạm** (mật khẩu đọc từ env container `nta-db`, không in ra, không qua dòng lệnh)
→ in số migration/bản ghi sau migrate → **luôn xoá DB tạm** khi thoát (kể cả lỗi). Không đụng `nta_web`.
Chỉ push khi dòng cuối là `== KẾT QUẢ: PASS`; `FAIL` (gate chặn hoặc migrate lỗi) → sửa migration / duyệt theo §6 rồi chạy lại.
Đã thử local 14/10/2026 (postgres 16.15): dump có dữ liệu (136 entries/136 versions/1 migration) → "không có migration chờ", PASS;
dump DB rỗng → apply 0000, PASS; tên DB không có tiền tố `nta_restore_` → từ chối; image migrator không có → FAIL và vẫn xoá DB tạm.

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
3. Chấp nhận → chạy thử trên bản restore (§5b) phải PASS → user duyệt rồi thêm **một dòng riêng** ở đầu file (ngày ISO):
   ```sql
   -- HIGH_RISK_MIGRATION: approved 2026-10-20 by <tên người duyệt>
   ```
   commit + push lại. Backup pre-migrate vẫn chạy trước migrate. Gate log `APPROVED (HIGH_RISK_MIGRATION)` kèm finding.
4. Không sửa file migration đã apply ở prod.

## 7. Sự cố thường gặp

- **`nta-db` không healthy:** `docker logs --tail 100 nta-db`; RAM giới hạn 512 MB (`mem_limit`).
- **Backup FAILED `password authentication failed`:** secret `POSTGRES_PASSWORD` khác mật khẩu đã khởi tạo trong volume (xem §1).
- **Backup FAILED `Permission denied` ở /backups:** kiểm `ls -ld /opt/nta-web-data/db-backups` (root 700; sidecar chạy root).
- **Web không ghi được ảnh:** `chown -R 1001:1001 /opt/nta-web-data/uploads`.
- **Không bao giờ** `docker volume rm nta-db-data`, `docker compose down -v` — mất toàn bộ DB.

## 8. Import nội dung 1 lần (seed từ file) + parity

`tools/db/import-seed.ts` (`npm run db:import-seed`) đọc nội dung file bằng chính loader web (MDX + `listings.ts`, `home.ts`,
`solutions/overview.ts`, `slug.ts`, `i18n/messages/{vi,en}.json`, `company-info.ts`) → mỗi bản ghi chèn `content_entries` version 1
+ `content_versions` (`op=create`, `actor=seed`) trong 1 transaction, `ON CONFLICT DO NOTHING`. **Chỉ INSERT** — không UPDATE/DELETE/TRUNCATE:
chạy lại = 0 bản ghi mới, bản ghi đã sửa qua bot/CLI không bị ghi đè. Trước khi ghi kiểm ràng buộc I-1..I-6 trên file; vi phạm → không import.

```sh
npm run db:import-seed -- --dry-run      # chỉ in số bản ghi theo collection/locale, không cần DB
DATABASE_URL=... npm run db:import-seed  # in "chèn N, bỏ qua M"
DATABASE_URL=... npm run db:parity       # deep-equal DB ↔ file (vi+en) + I-1..I-6; exit 1 nếu lệch/thiếu/thừa, in field lệch đầu tiên
```

- DB prod (host `nta-db`, database `nta_web`, hoặc host không phải loopback) → import **từ chối** nếu thiếu cờ `--confirm-prod`.
  Cờ này chỉ dùng ở cutover (P4-T01) sau khi user duyệt; trước đó luôn backup (`docker exec nta-db-backup /scripts/backup.sh pre-migrate-before-import-<UTC>`).
- Số bản ghi 14/10/2026: 68 mỗi locale, tổng 136 (post 5, solution 9, product 2, case_study 2, about 1, listing_page 4, listing_item 13,
  listing_cta 4, listing_labels 1, home 1, solution_overview 2, slug_registry 11, ui_messages 12, company_info 1 — × vi/en).
- Test có DB: `TEST_DATABASE_URL=postgres://...@127.0.0.1:<port>/<db_test> npm test` (không đặt → test cần DB được skip).
