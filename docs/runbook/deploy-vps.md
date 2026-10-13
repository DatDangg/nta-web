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
`docker compose build` → `up -d` → health check `127.0.0.1:3005/api/health`.

Deploy diễn ra **tại workspace của runner** (giống pattern `ismartschool` trên server này).
Không cần clone cố định; container project name = `nta-web`.

## 2. Deploy thủ công (fallback khi runner chết)

```sh
ssh root@187.52.119.50
git clone https://github.com/DatDangg/nta-web.git /opt/nta-web-manual
cd /opt/nta-web-manual
NEXT_PUBLIC_SITE_URL=https://ntavietnam.tech docker compose up -d --build
curl -fsS http://127.0.0.1:3005/api/health    # {"status":"ok",...}
# LƯU Ý: cùng project name "nta-web" + container_name "nta-web" → sẽ thay container đang chạy.
```

## 3. Reverse proxy + HTTPS (sau khi DNS trỏ đúng)

```sh
# trên VPS (đứng trong repo, vd workspace runner hoặc bản clone thủ công)
cp deploy/nginx/ntavietnam.tech.conf /etc/nginx/sites-available/ntavietnam.tech
ln -sf /etc/nginx/sites-available/ntavietnam.tech /etc/nginx/sites-enabled/
certbot --nginx -d ntavietnam.tech       # cấp cert Let's Encrypt
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
nginx -t && systemctl reload nginx
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

## 4. Biến môi trường

| Biến | Loại | Ghi chú |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | build-time | `https://ntavietnam.tech` — canonical/SEO (inline lúc build) |
| `CONTACT_FORM_TARGET` | server-only (secret) | đích forward form — **OQ#4 chưa chốt**, tạm để trống |
| `HOST_PORT` | runtime | mặc định `3005` |

Secret repo (GitHub → Settings → Secrets and variables → Actions): `CONTACT_FORM_TARGET`.

## 5. Rollback

```sh
# trong workspace/thư mục deploy
git log --oneline -5            # chọn commit tốt trước đó
git checkout <commit>
docker compose up -d --build
curl -fsS http://127.0.0.1:3005/api/health
```

Không có DB/migration nên rollback chỉ là deploy lại image/code cũ.

## 6. Kiểm tra sau deploy

- `docker compose ps` → container `healthy`
- `curl -fsS http://127.0.0.1:3005/api/health` → `status: ok`
- Khi có domain: đo **R-22** (Lighthouse Perf/LCP/CLS) + **R-23** (viewport 375/768/1280)
- AI-readiness: `curl -fsS https://ntavietnam.tech/llms.txt`, `/robots.txt`, `/sitemap.xml`

## 7. Troubleshooting

- **Container không start:** `docker compose logs nta-web`; kiểm tra PORT/HOSTNAME.
- **nginx 502:** app chưa healthy hoặc sai port; kiểm tra `curl 127.0.0.1:3005`.
- **certbot fail:** DNS chưa trỏ đúng; `dig +short ntavietnam.tech` (domain phụ: `dig +short ntasolution.vn` + `dig +short www.ntasolution.vn`).
- **`ntasolution.vn` ra trang nginx mặc định:** chưa có vhost khớp `server_name` → rơi vào default server block; cài vhost theo §3b.
- **`ntasolution.vn` báo lỗi cert (SNI trả cert `ntavietnam.tech`):** chưa cấp cert riêng → chạy `certbot --nginx --redirect -d ntasolution.vn -d www.ntasolution.vn`.
- **Form không gửi:** `CONTACT_FORM_TARGET` chưa set (OQ#4).
