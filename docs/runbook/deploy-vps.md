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
| Domain | `ntasolution.vn` (+ `www`) — ⏳ DNS A record chưa publish (PA Vietnam) |
| Deploy | GitHub Actions self-hosted runner (label `nta-web`) |

## 1. Deploy thủ công (lần đầu / khi chưa có runner)

```sh
ssh root@187.52.119.50
git clone https://github.com/DatDangg/nta-web.git /opt/nta-web
cd /opt/nta-web
NEXT_PUBLIC_SITE_URL=https://ntasolution.vn docker compose up -d --build
curl -fsS http://127.0.0.1:3005/api/health    # {"status":"ok",...}
```

## 2. Deploy tự động (self-hosted runner)

Đăng ký runner cho repo `DatDangg/nta-web` (GitHub → repo → Settings → Actions → Runners → New self-hosted runner),
gắn label `nta-web`, chạy dạng service. Workflow `.github/workflows/deploy.yml`:
push `main` (hoặc chạy tay) → `docker compose build` → `up -d` → health check `127.0.0.1:3005/api/health`.

Secret repo cần thêm: `CONTACT_FORM_TARGET` (đích forward form — hiện chưa có, có thể để trống tạm).

## 3. Reverse proxy + HTTPS (sau khi DNS trỏ đúng)

```sh
# trên VPS
cp /opt/nta-web/deploy/nginx/ntasolution.vn.conf /etc/nginx/sites-available/ntasolution.vn
ln -sf /etc/nginx/sites-available/ntasolution.vn /etc/nginx/sites-enabled/
certbot --nginx -d ntasolution.vn -d www.ntasolution.vn   # cấp cert Let's Encrypt
nginx -t && systemctl reload nginx
curl -fsS https://ntasolution.vn/api/health
```

⚠️ certbot chỉ chạy được khi `ntasolution.vn` đã trỏ về `187.52.119.50` (hiện PA Vietnam chưa publish bản ghi A).

## 4. Biến môi trường

| Biến | Loại | Ghi chú |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | build-time | `https://ntasolution.vn` — canonical/SEO (inline lúc build) |
| `CONTACT_FORM_TARGET` | server-only (secret) | đích forward form — **OQ#4 chưa chốt**, tạm để trống |
| `HOST_PORT` | runtime | mặc định `3005` |

## 5. Rollback

```sh
cd /opt/nta-web
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
- AI-readiness: `curl -fsS https://ntasolution.vn/llms.txt`, `/robots.txt`, `/sitemap.xml`

## 7. Troubleshooting

- **Container không start:** `docker compose logs nta-web`; kiểm tra PORT/HOSTNAME.
- **nginx 502:** app chưa healthy hoặc sai port; kiểm tra `curl 127.0.0.1:3005`.
- **certbot fail:** DNS chưa trỏ đúng; `dig +short ntasolution.vn`.
- **Form không gửi:** `CONTACT_FORM_TARGET` chưa set (OQ#4).
