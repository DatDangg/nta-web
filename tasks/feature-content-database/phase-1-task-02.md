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
2. Backup tự động bằng **container sidecar** `nta-db-backup` (không cài cron lên host): `pg_dump -Fc` hằng ngày, giữ ≥14 bản,
   ghi ra bind mount host (đề xuất `/opt/nta-web-data/db-backups` — user xác nhận), log thành công/thất bại.
3. Service một-lần `nta-migrate` (profile `tools`) chạy migration Drizzle (drizzle-kit hoặc migrator của drizzle-orm — chọn cách đơn giản, ghi decisions.md).
4. `deploy.yml`: `up -d nta-db` → chờ healthy → **backup pre-migrate** (`pre-migrate-<sha>.dump`; fail → deploy fail)
   → **gate destructive**: script quét migration chưa apply (DROP / ALTER … TYPE / SET NOT NULL / ADD CONSTRAINT UNIQUE|FOREIGN / DROP TYPE / UPDATE|DELETE hàng loạt);
   có mà thiếu dòng `-- HIGH_RISK_MIGRATION: approved <ngày> by user` → fail → migrate → build/up web. Secret qua GitHub Secrets/env runner, không echo.
5. `docs/runbook/db.md`: secret cần đặt, xem log backup, **restore** (vào DB tạm → kiểm tra → restore prod), migrate tay, xử lý deploy đỏ do gate.
6. **Diễn tập restore** local: dump → restore vào DB tạm → so số bản ghi. Ghi bằng chứng.

## Thao tác của USER (agent không tự làm)
- Thêm GitHub Secrets (repo DatDangg/nta-web) hoặc env runner: `POSTGRES_PASSWORD`, `REVALIDATE_SECRET` (agent đưa hướng dẫn; user đặt giá trị).
- Xác nhận thư mục backup trên VPS + dung lượng đĩa trống.

## Acceptance
- `docker compose config` hợp lệ; DB không lộ port; web hiện tại vẫn chạy bình thường.
- Sidecar tạo dump + xoay vòng; backup pre-migrate chặn deploy khi lỗi; gate destructive có test (SQL destructive → fail, additive → pass, có marker duyệt → pass).
- Diễn tập restore PASS.
