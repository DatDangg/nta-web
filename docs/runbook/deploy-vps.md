# Deploy NTA Website lên VPS (Docker + nginx + certbot)

> Trạng thái: chuyển từ hướng GCP Cloud Run sang **VPS riêng** (docker-vps).
> VPS là **shared server** (đang chạy ismartschool, crm-dhp, tmfoods) → chỉ **THÊM** container/nginx mới, KHÔNG đụng app khác.

## Thông tin hạ tầng

| Mục | Giá trị |
|---|---|
| VPS | `187.52.119.50` (Ubuntu 24.04, Docker 29.7 + Compose v5.5) |
| SSH | `root@187.52.119.50` (key auth) |
| Port nội bộ | `127.0.0.1:3005` → container `8080` |
| Reverse proxy | nginx sẵn có (80/443) + certbot |
| Domain (canonical) | **`ntavietnam.tech`** — ✅ live 09/10/2026 (DNS A → `187.52.119.50`, HTTPS Let's Encrypt, http→https 301) |
| Domain phụ | **`ntasolution.vn`** (+ `www`) — cùng app/nội dung, canonical vẫn `ntavietnam.tech`; DNS apex A → `187.52.119.50`, `www` CNAME → apex (xem §3b) |
| Deploy | GitHub Actions self-hosted runner (label `nta-web`), deploy từ runner workspace |
| Deploy dir (thực tế) | `/opt/actions-runner-nta-web/_work/nta-web/nta-web` (workspace của runner) |
| Preview tạm | ~~`http://187.52.119.50/`~~ (vhost preview theo IP đã xoá khi domain live) |

## 1. Deploy tự động (chuẩn)

Push lên `main` (hoặc chạy tay workflow **Deploy (VPS)**) → self-hosted runner:
DB `nta-db` healthy → backup pre-migrate → gate destructive → migrate → `docker compose build` → `up -d` → health check `127.0.0.1:3005/api/health`
(chi tiết bước DB: [`db.md`](db.md) §2).

Deploy diễn ra **tại workspace của runner** (giống pattern `ismartschool` trên server này).
Không cần clone cố định; container project name = `nta-web`.

## 2. Deploy thủ công (fallback khi runner chết)

```sh
ssh root@187.52.119.50
git clone https://github.com/DatDangg/nta-web.git /opt/nta-web-manual
cd /opt/nta-web-manual
# secret chỉ ở GitHub Secrets → tạo file env tạm ngoài repo (mode 600) theo db.md §1b → $ENVF
# backup + migrate trước khi lên web: db.md §5
NEXT_PUBLIC_SITE_URL=https://ntavietnam.tech docker compose --env-file "$ENVF" up -d --build
shred -u "$ENVF" 2>/dev/null || rm -f "$ENVF"                # xoá file env tạm ngay khi xong
curl -fsS http://127.0.0.1:3005/api/health    # {"status":"ok",...}
# LƯU Ý: cùng project name "nta-web" + container_name "nta-web" → sẽ thay container đang chạy.
```

## 3. Reverse proxy + HTTPS (sau khi DNS trỏ đúng)

```sh
# trên VPS (đứng trong repo, vd workspace runner hoặc bản clone thủ công)
cp deploy/nginx/ntavietnam.tech.conf /etc/nginx/sites-available/ntavietnam.tech
ln -sf /etc/nginx/sites-available/ntavietnam.tech /etc/nginx/sites-enabled/
certbot --nginx --redirect -d ntavietnam.tech       # cấp cert Let's Encrypt
nginx -t && systemctl reload nginx
curl -fsS https://ntavietnam.tech/api/health

# Xoá vhost preview tạm theo IP:
rm -f /etc/nginx/sites-enabled/nta-web-preview.conf && systemctl reload nginx
```

⚠️ certbot chỉ chạy được khi `ntavietnam.tech` đã trỏ về `187.52.119.50` (kiểm tra `dig +short ntavietnam.tech`).

## 3b. Domain phụ `ntasolution.vn` (+ www) — cùng site, KHÔNG redirect sang domain chính

Domain phụ là **lối vào thứ hai** cho cùng app (cùng container, cùng `127.0.0.1:3005`).
Canonical/SEO **vẫn** `https://ntavietnam.tech` (`NEXT_PUBLIC_SITE_URL` giữ nguyên, không rebuild):

```sh
# trên VPS (đứng trong repo)
cp deploy/nginx/ntasolution.vn.conf /etc/nginx/sites-available/ntasolution.vn
ln -sf /etc/nginx/sites-available/ntasolution.vn /etc/nginx/sites-enabled/
nginx -t                                    # (1) phải OK trước khi cấp cert
certbot --nginx --redirect -d ntasolution.vn -d www.ntasolution.vn   # (2) 1 cert Let's Encrypt apex+www; --redirect = tự bật http→https 301 (non-interactive cũng đạt curl matrix dưới)
# (3) certbot TÁCH block 80 riêng (managed) với `return 301 https://$host$request_uri` →
#     http://www sẽ 301 https://www (2 hop). Sửa về thẳng apex (.bak = backup đề phòng):
sed -i.bak '/if ($host = www.ntasolution.vn)/,/^[[:space:]]*}/ s#return 301 https://$host$request_uri;#return 301 https://ntasolution.vn$request_uri;#' /etc/nginx/sites-available/ntasolution.vn
nginx -t && systemctl reload nginx
rm -f /etc/nginx/sites-available/ntasolution.vn.bak   # sau khi verify OK
```

Kiểm tra sau khi cấp cert:

```sh
curl -sI http://ntasolution.vn/          | head -1   # 301 → https://ntasolution.vn/
curl -sI http://www.ntasolution.vn/      | head -1   # 301 → https://ntasolution.vn/
curl -sI https://www.ntasolution.vn/     | head -1   # 301 → https://ntasolution.vn/ (apex)
curl -sI https://ntasolution.vn/         | head -1   # 200
curl -sI https://ntasolution.vn/en       | head -1   # 200
curl -fsS https://ntasolution.vn/api/health            # {"status":"ok",...}
curl -fsS https://ntasolution.vn/ | grep -o 'rel="canonical" href="[^"]*"'   # PHẢI là ntavietnam.tech
curl -sI https://ntavietnam.tech/        | head -1   # 200 — KHÔNG đổi hành vi
```

⚠️ Ghi chú:

- `certbot --nginx` sửa **file vhost của domain phụ**; file `deploy/nginx/ntasolution.vn.conf` trong repo
  là bản khởi tạo (block 80) — bản trên VPS sẽ có thêm block 443 do certbot sinh (không copy ngược về repo).
- `nginx -t` **bắt buộc** chạy trước `reload`/`certbot` (VPS là **shared** server: ismartschool, crm-dhp, tmfoods).
- Cert của `ntavietnam.tech` **không** bị đụng: certbot tạo lineage mới (`/etc/letsencrypt/live/ntasolution.vn/`).
- Chỉ thêm `server` block mới — KHÔNG sửa/xoá vhost của domain/app khác trên VPS.
- **Rollback domain phụ:** `rm /etc/nginx/sites-enabled/ntasolution.vn && nginx -t && systemctl reload nginx`
  (domain chính không đổi). Sau đó nếu không dùng nữa, xoá luôn cert tránh `certbot renew` lỗi mỗi 60 ngày:
  `certbot delete --cert-name ntasolution.vn`.

## 4. Biến môi trường

| Biến | Loại | Ghi chú |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | build-time | `https://ntavietnam.tech` — canonical/SEO (inline lúc build) |
| `CONTACT_FORM_TARGET` | server-only (secret) | URL Apps Script Web App `…/exec` nhận form → gửi email tới Script Property `ADMIN_EMAIL` (R-13a, CR-039, [`tools/contact-mail/README.md`](../../tools/contact-mail/README.md)). Trống → form trả 500 |
| `CONTACT_FORM_TOKEN` | server-only (secret) | token khớp Script Property `SECRET_TOKEN` của Web App (CR-037). **Không** đặt `NEXT_PUBLIC_`, không build arg. Trống → form trả 500 |
| `HOST_PORT` | runtime | mặc định `3005` |
| `POSTGRES_PASSWORD` | secret, **bắt buộc** | mật khẩu DB `nta-db` (chỉ chữ + số) → ghép `DATABASE_URL` |
| `REVALIDATE_SECRET` | secret, **bắt buộc** | `POST /api/revalidate` |
| `NTA_BACKUP_DIR` / `NTA_UPLOADS_DIR` | runtime | mặc định `/opt/nta-web-data/db-backups` / `/opt/nta-web-data/uploads` (owner `1001:1001`) |
| `CONTENT_SOURCE` | runtime, GitHub **Variable** (không phải secret) | `file` (mặc định khi chưa đặt) / `db`. **Prod = `db` từ 14/10/2026** — đổi variable + chạy lại Deploy, không build lại ([`cutover-content-db.md`](cutover-content-db.md)) |
| `DATABASE_URL` / `UPLOAD_DIR` | runtime (compose tự ghép) | `postgres://nta:<POSTGRES_PASSWORD>@nta-db:5432/nta_web` / `/app/uploads` |

Secret repo (GitHub → Settings → Secrets and variables → Actions): `CONTACT_FORM_TARGET`, `CONTACT_FORM_TOKEN`, `POSTGRES_PASSWORD`, `REVALIDATE_SECRET`.

## 5. Rollback

> ⚠️ Từ CR-031, **mọi** lệnh `docker compose` (kể cả `ps`/`logs`) cần `POSTGRES_PASSWORD` + `REVALIDATE_SECRET` (compose nội suy cả file).
> Secret chỉ ở GitHub Secrets, **không đọc lại được** → trên VPS gõ `docker compose ...` báo "... is required" là **bình thường**.
> Ưu tiên rollback qua CI (`git revert` + push). Kiểm tra/log dùng `docker ps` / `docker logs` / `docker exec` ([`db.md`](db.md) §1a);
> bắt buộc compose thì tạo file env tạm ngoài repo, quyền 600, xoá ngay sau khi xong ([`db.md`](db.md) §1b).

```sh
# trong workspace/thư mục deploy, $ENVF = file env tạm theo db.md §1b
git log --oneline -5            # chọn commit tốt trước đó
git checkout <commit>
docker compose --env-file "$ENVF" up -d --build
curl -fsS http://127.0.0.1:3005/api/health
```

Rollback code **không** rollback schema DB: migration mặc định chỉ additive (gate chặn thao tác phá hoại chưa duyệt) nên code cũ vẫn chạy với schema mới.
Cần khôi phục dữ liệu → restore từ `pre-migrate-<sha12>-<run_id>-<attempt>.dump` theo [`db.md`](db.md) §4.

**Rollback về commit TRƯỚC CR-031 P1-T02** (compose chưa có `nta-db`): `docker compose up -d --remove-orphans` (CI) sẽ **gỡ container
`nta-db` + `nta-db-backup`** như orphan. Volume `nta-db-data` và file backup vẫn còn (không mất dữ liệu) nhưng **backup hằng ngày dừng**.
Xử lý: rollback bằng `git revert` các commit gây lỗi (giữ service DB trong compose) thay vì checkout commit cũ; nếu đã lỡ gỡ → deploy lại
commit có service DB (`docker compose --env-file "$ENVF" up -d nta-db nta-db-backup`) rồi kiểm `docker ps --filter name=nta` + `backup.log` ([`db.md`](db.md) §3).

## 6. Kiểm tra sau deploy

Không cần secret: dùng thẳng `docker ps` / `docker logs <container>` / `docker exec` ([`db.md`](db.md) §1a).

- `docker ps --filter name=nta` → container `healthy`
- `curl -fsS http://127.0.0.1:3005/api/health` → `status: ok`
- Khi có domain: đo **R-22** (Lighthouse Perf/LCP/CLS) + **R-23** (viewport 375/768/1280)
- AI-readiness: `curl -fsS https://ntavietnam.tech/llms.txt`, `/robots.txt`, `/sitemap.xml`

## 7. Troubleshooting

- **Container không start:** `docker logs --tail 100 nta-web` (không cần secret); kiểm tra PORT/HOSTNAME.
- **nginx 502:** app chưa healthy hoặc sai port; kiểm tra `curl 127.0.0.1:3005`.
- **certbot fail:** DNS chưa trỏ đúng; `dig +short ntavietnam.tech` (domain phụ: `dig +short ntasolution.vn` + `dig +short www.ntasolution.vn`).
- **`ntasolution.vn` ra trang nginx mặc định:** chưa có vhost khớp `server_name` → rơi vào default server block; cài vhost theo §3b.
- **`ntasolution.vn` báo lỗi cert (SNI trả cert `ntavietnam.tech`):** chưa cấp cert riêng → chạy `certbot --nginx --redirect -d ntasolution.vn -d www.ntasolution.vn`.
- **Form không gửi (500 "Không thể gửi yêu cầu lúc này."):** thiếu secret `CONTACT_FORM_TARGET` / `CONTACT_FORM_TOKEN`
  (đặt xong phải chạy lại Deploy), token web ≠ Script Property `SECRET_TOKEN`, Web App deploy sai quyền (phải là "Bất kỳ ai") hoặc
  phiên bản cũ, chưa cấp quyền gửi mail (chạy `testSendMail` trong editor), thiếu Script Property `ADMIN_EMAIL`, hết hạn mức
  gửi mail của Google trong ngày, Apps Script chậm quá 10 s. Kiểm tra: Apps Script → Executions (mã `contact-mail: admin_email_missing` /
  `contact-mail: send_failed`); quy trình ở `tools/contact-mail/README.md`.
- **Admin nhận 2 mail trùng nội dung (hiếm):** web timeout 10 s trong khi script vẫn gửi mail muộn → khách bấm gửi lại.
  Đã chấp nhận (CR-039) — bỏ qua mail trùng.

## 8. Database (`nta-db`) — backup / restore / migrate

Xem [`docs/runbook/db.md`](db.md): secret (lệnh không cần secret / file env tạm), log backup, restore (DB tạm → prod), migrate tay,
chạy thử migration trên bản restore (§5b), xử lý deploy đỏ do gate destructive, cảnh báo dung lượng, import seed + parity (§8),
backup/restore ảnh upload (§4c). Prod đọc nội dung từ DB từ 14/10/2026 — lùi về file / Content ops: [`cutover-content-db.md`](cutover-content-db.md).
