# 10 — Server chứa website & chỗ đặt bot

> Tài liệu cho **người cài đặt bot**, KHÔNG nạp vào prompt Claude (model không cần IP/SSH).
> Không ghi secret vào đây. Nguồn: `.context/project-config.md`, `docs/runbook/deploy-vps.md`,
> `docker-compose.yml`, `Dockerfile`, `.github/workflows/*.yml`, `deploy/nginx/*.conf`, `docs/runbook/db.md` (cập nhật 15/10/2026, sau cutover DB).

## 1. Hạ tầng hiện tại

| Mục | Giá trị |
|---|---|
| VPS | `187.52.119.50` — Ubuntu 24.04, Docker 29.7 + Compose v5.5 |
| Truy cập | SSH `root@187.52.119.50:22`, key auth (key trên máy dev) |
| ⚠️ Server dùng chung | Đang chạy app khác: **ismartschool, crm-dhp, tmfoods** → chỉ THÊM container/vhost mới, không sửa/xoá của app khác, luôn `nginx -t` trước khi reload |
| Repo | GitHub `DatDangg/nta-web`, nhánh `main` |
| Domain chính (canonical) | `https://ntavietnam.tech` — DNS A → VPS, Let's Encrypt (hạn 07/01/2027, certbot tự gia hạn) |
| Domain phụ | `https://ntasolution.vn` (+ `www` → 301 apex) — cùng app, canonical vẫn `ntavietnam.tech` |
| Reverse proxy | nginx trên host (80/443) → `127.0.0.1:3005`. Vhost mẫu: `deploy/nginx/ntavietnam.tech.conf`, `ntasolution.vn.conf` |
| App | Container `nta-web` (image `nta-web:latest`), Next.js standalone, `node server.js` cổng 8080 trong container, user `nextjs` (uid 1001), `restart: unless-stopped` |
| Port | host `127.0.0.1:3005` → container `8080` (chỉ nội bộ, không mở ra ngoài) |
| Health check | `GET /api/health` → `{"status":"ok",...}` |
| Database | PostgreSQL 16 — container `nta-db` (DB `nta_web`, **không publish port**, chỉ truy cập trong mạng compose). Prod đọc nội dung từ DB (`CONTENT_SOURCE=db`) |
| Ảnh upload | Volume `/opt/nta-web-data/uploads` → `/app/uploads`, phục vụ ở `/uploads/<hash>.<ext>` |
| Backup DB | Sidecar `nta-db-backup` — hằng ngày 03:00 VN, file ở `/opt/nta-web-data/db-backups` |
| CLI nội dung | Service một-lần `nta-tools` (compose profile `tools`) — chạy `tools/db/content-cli.ts` trong mạng compose |

## 2. CI/CD

| Workflow | Trigger | Việc |
|---|---|---|
| `ci.yml` | push / PR | typecheck + lint + build |
| `deploy.yml` — "Deploy (VPS)" | **push `main`** hoặc chạy tay | Trên self-hosted runner label `nta-web`: `docker compose build` → `docker compose up -d --remove-orphans` → health check `127.0.0.1:3005/api/health` (12 lần × 3s) |
| `ai-news.yml` — "AI News Weekly" | cron thứ 7 08:00 giờ VN (CR-036) + chạy tay | Sinh bài `ai-weekly-*` → commit file seed main → job `publish-db` chèn bài vào DB (insert-only) → revalidate → smoke (KHÔNG dispatch `deploy.yml`, CR-034) |

- Runner workspace (= thư mục deploy thực tế): `/opt/actions-runner-nta-web/_work/nta-web/nta-web`.
- Build image mất vài phút; site cập nhật sau khi container mới healthy.
- Bot **không** đi qua CI/CD: ghi DB + revalidate là web đổi ngay. Chỉ thay đổi code (redirect, enum, giao diện) mới cần push main → deploy.
- `ai-news.yml` cũng ghi bài vào DB (`publish-post`) — bot đừng sửa bài `ai-weekly-*` (xem `05` §5).

## 3. Biến môi trường

| Biến | Dùng cho | Nơi đặt |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | app (build-time) | `https://ntavietnam.tech` |
| `CONTACT_FORM_TARGET` | app | GitHub Actions secret |
| `POSTGRES_PASSWORD` | app, `nta-tools` (bot cần) | GitHub Actions secret — VPS **không** lưu sẵn (`docs/runbook/db.md` §1a) |
| `REVALIDATE_SECRET` | `POST /api/revalidate` (bot cần) | GitHub Actions secret — như trên |
| `HOST_PORT` | app | `3005` |

## 4. Backup & hoàn tác nội dung

- **Hoàn tác 1 bản ghi:** `history` → `rollback --to <v>` (`05` §7) → revalidate. Không cần deploy.
- **Backup trước khi bot xoá / ghi nhiều bản ghi:** `docker exec nta-db-backup /scripts/backup.sh ops-bot-<YYYYmmddTHHMMSSZ>`
  (vòng `ops-*`, tách khỏi backup trước-deploy). Không cần secret.
- **Restore cả DB** (sự cố lớn): `docs/runbook/db.md` §4 — việc của dev, không giao bot.
- Rollback code website: `git revert <sha>` → push `main` → `deploy.yml` (`docs/runbook/deploy-vps.md`).

## 5. Cài bot (bot do người dùng tự dựng — repo này chỉ cung cấp CLI + tài liệu)

```
Telegram ──HTTPS (long polling, không mở port)──► bot (process/container trên VPS)
                                                    │ API model (HTTPS ra ngoài)
                                                    │ list / show / history (đọc)
                                                    └─[Duyệt]─► create / update / delete / rollback / upload
                                                                 └─► docker compose run nta-tools ─► nta-db
                                                                 └─► revalidate ─► nta-web:8080/api/revalidate
```

Lệnh nền — chạy từ thư mục deploy `/opt/actions-runner-nta-web/_work/nta-web/nta-web` (nơi có `docker-compose.yml`):

```sh
docker compose --env-file /etc/nta-content-bot/compose.env run --rm --no-deps -T nta-tools tools/db/content-cli.ts <lệnh> …
```

| Hạng mục | Cách làm |
|---|---|
| Image `nta-tools` | Build lần đầu và **build lại sau mỗi deploy có đổi `tools/db` hoặc `src/db`**: `docker compose --env-file … --profile tools build nta-tools`. Cần bản có lệnh `create/update/delete` (CR-030) |
| Secret compose | `/etc/nta-content-bot/compose.env` quyền 600, owner user chạy bot: `POSTGRES_PASSWORD=…`, `REVALIDATE_SECRET=…` (trùng GitHub secret; thiếu thì compose báo `… is required`). Không đặt trong workspace runner (bị ghi đè) |
| Secret bot | `TELEGRAM_BOT_TOKEN`, API key model, `ALLOWED_TELEGRAM_IDS` — file env riêng của bot, quyền 600 |
| Quyền | User chạy bot cần quyền `docker` (≈ root trên VPS) → bot chỉ gọi đúng các lệnh ở `07` §Guardrail 2, argv dạng mảng, không shell tuỳ ý |
| Ảnh Telegram | Tải về `/tmp/nta-bot/<file>`, chạy `upload` kèm mount `-v /tmp/nta-bot/<file>:/tmp/in/<file>:ro` và truyền `/tmp/in/<file>` (container không thấy file host nếu không mount) |
| Chạy tuần tự | 1 lệnh ghi mỗi lần (tránh conflict version). Server dùng chung với ismartschool, crm-dhp, tmfoods → giới hạn RAM bot |
| Log | Lệnh + đề xuất + người duyệt + version mới; không log token / mật khẩu |
