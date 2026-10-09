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
| Domain | **`landing.ntasolution.vn`** — ⏳ DNS chưa publish (PA Vietnam) |
| Deploy | GitHub Actions self-hosted runner (label `nta-web`), deploy từ runner workspace |
| Deploy dir (thực tế) | `/opt/actions-runner-nta-web/_work/nta-web/nta-web` (workspace của runner) |
| Preview tạm | `http://187.52.119.50/` (nginx vhost tạm theo IP — xoá khi domain live) |

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
NEXT_PUBLIC_SITE_URL=https://landing.ntasolution.vn docker compose up -d --build
curl -fsS http://127.0.0.1:3005/api/health    # {"status":"ok",...}
# LƯU Ý: cùng project name "nta-web" + container_name "nta-web" → sẽ thay container đang chạy.
```

## 3. Reverse proxy + HTTPS (sau khi DNS trỏ đúng)

```sh
# trên VPS (đứng trong repo, vd workspace runner hoặc bản clone thủ công)
cp deploy/nginx/landing.ntasolution.vn.conf /etc/nginx/sites-available/landing.ntasolution.vn
ln -sf /etc/nginx/sites-available/landing.ntasolution.vn /etc/nginx/sites-enabled/
certbot --nginx -d landing.ntasolution.vn       # cấp cert Let's Encrypt
nginx -t && systemctl reload nginx
curl -fsS https://landing.ntasolution.vn/api/health

# Xoá vhost preview tạm theo IP:
rm -f /etc/nginx/sites-enabled/nta-web-preview.conf && systemctl reload nginx
```

⚠️ certbot chỉ chạy được khi `landing.ntasolution.vn` đã trỏ về `187.52.119.50` (hiện PA Vietnam chưa publish bản ghi A).

## 4. Biến môi trường

| Biến | Loại | Ghi chú |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | build-time | `https://landing.ntasolution.vn` — canonical/SEO (inline lúc build) |
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
- AI-readiness: `curl -fsS https://landing.ntasolution.vn/llms.txt`, `/robots.txt`, `/sitemap.xml`

## 7. Troubleshooting

- **Container không start:** `docker compose logs nta-web`; kiểm tra PORT/HOSTNAME.
- **nginx 502:** app chưa healthy hoặc sai port; kiểm tra `curl 127.0.0.1:3005`.
- **certbot fail:** DNS chưa trỏ đúng; `dig +short landing.ntasolution.vn`.
- **Form không gửi:** `CONTACT_FORM_TARGET` chưa set (OQ#4).
