# Runbook — Cutover nội dung sang PostgreSQL (CR-031 P4-T01 phần B)

> **Trạng thái: ĐÃ CUTOVER 14/10/2026.** Variable `CONTENT_SOURCE=db` + Deploy `490f8e1` lúc 16:38 UTC. Đạt B1–B9
> (import 136/136 + parity PASS, upload-smoke 2 lần, sitemap 52/52 200, DB dừng ngắn trang cache vẫn 200, log 0 dòng `[content-store]`/`[content-shape]`) —
> bằng chứng `tasks/feature-content-database/phase-4-task-01.md`. B10 PASS 15/10 (`daily-20261014T200000Z.dump` restore vào DB tạm khớp 137/137, migrate-on-restore PASS).
> Sửa/rollback nội dung trên prod qua bot dời sang CR-030. Runbook giữ lại cho: lùi về `file` (§4), chạy lại parity/revalidate/backup qua Content ops (§0), dựng lại môi trường.
> Bỏ hẳn cờ: `tasks/feature-content-database/phase-5-task-02.md` (chờ ổn định ≥ 1 ngày + user đồng ý). Backup ops dùng chung vòng giữ với backup trước-deploy → CR-033 (`db.md` §3).

> Chuyển web từ đọc file (`src/content`, messages, company-info) sang đọc DB `nta-db`. **Thẳng DB prod, không staging** (user chấp nhận).
> Mọi bước chạy bằng **GitHub Actions** (self-hosted runner trên VPS) — không cần SSH, secret không lộ. Vận hành DB chung: `docs/runbook/db.md`.

## 0. Công cụ

| Thứ | Ở đâu | Dùng cho |
|---|---|---|
| Workflow **Content ops (VPS)** | `.github/workflows/content-ops.yml` → Actions → *Run workflow* | `parity` · `backup` · `import-seed` · `revalidate-all` · `upload-smoke` |
| Workflow **Deploy (VPS)** | `.github/workflows/deploy.yml` (push main hoặc *Run workflow*) | áp cờ `CONTENT_SOURCE` |
| GitHub **Variable** `CONTENT_SOURCE` | Settings → Secrets and variables → Actions → tab **Variables** | `file` (mặc định khi chưa đặt) / `db` — biến **runtime**, không phải secret |
| Service một-lần `nta-tools` | `docker-compose.yml` (profile `tools`), Dockerfile target `content-tools` | chạy `tools/db/*` trong mạng compose (DB không publish port), uid 1001 |

- `content-ops` dùng chung nhóm `concurrency` với deploy → không bao giờ chạy song song. Chỉ `docker compose run --rm --no-deps` → không tạo lại `nta-web`/`nta-db`.
- Lệnh ghi bắt buộc ô **confirm**: `import-seed` → `IMPORT-SEED-PROD`, `upload-smoke` → `UPLOAD-PROD`; tự **backup trước** (`pre-migrate-ops-<lệnh>-<UTC>-<run>.dump`), backup lỗi → dừng.
- `CONTENT_SOURCE` đọc lúc request: `next build` không prerender trang nội dung nào (chỉ `/_not-found`, icon, `robots.txt`) → build giống hệt ở 2 chế độ, đổi cờ không cần build lại.
- Concurrency: một run đang **chờ** trong nhóm `deploy-nta-web` có thể bị GitHub huỷ khi run khác xếp hàng sau (kể cả deploy do push) → bấm lại lệnh; tránh push main trong lúc cutover.
- `upload-smoke` cố ý để lại 1 asset (ảnh `og-default.png`, theo hash) trong DB + volume làm bằng chứng — vô hại, không cần dọn.
- Không chạy trong khung **19:50–20:30 UTC** (backup hằng ngày của sidecar, 02:50–03:30 giờ VN).

## 1. Trước cutover (đã có từ task trước — chỉ kiểm)
1. Secret `POSTGRES_PASSWORD`, `REVALIDATE_SECRET` đã đặt; run deploy gần nhất xanh; `nta-db` healthy.
2. Thư mục `/opt/nta-web-data/uploads` tồn tại, owner `1001:1001` (workflow `upload-smoke` tự kiểm, sai → dừng kèm lệnh sửa).
3. Biết trước: 5 URL `/en/<loại>/<slug sai>` + `/package.json` trả **500** (CR-032, có sẵn — baseline, không do cutover).

## 2. Các bước (thứ tự bắt buộc)

| # | Việc | Ai | Cách | Đạt khi |
|---|---|---|---|---|
| 1 | Kiểm migration + DB rỗng/đã có | user bấm | Content ops → `parity` | bước *Kiểm migration*: `applied=2 expected=2`. Parity lúc này **FAIL "thiếu"** là bình thường nếu chưa import |
| 2 | Backup | user bấm | Content ops → `backup` | log `OK pre-migrate-ops-backup-…dump` — **ghi tên file vào task** |
| 3 | **User xác nhận import** | user | trả lời "ok import" | — |
| 4 | Import seed (chỉ chèn, ON CONFLICT DO NOTHING) + parity | user bấm | Content ops → `import-seed`, confirm `IMPORT-SEED-PROD` | `chèn 136, bỏ qua 0` (chạy lại = `chèn 0`) rồi `[parity] PASS` |
| 5 | Upload ảnh mẫu (trước khi bật db) | user bấm | Content ops → `upload-smoke`, confirm `UPLOAD-PROD` | `[upload] OK (created…) /uploads/<hash>.png`; `/uploads` + `/_next/image` 200 |
| 6 | Bật DB | user | Variable `CONTENT_SOURCE` = `db` → Actions → Deploy (VPS) → *Run workflow* | bước *Validate CONTENT_SOURCE* in `db`; health OK (đổi env → compose tạo lại `nta-web`, cache rỗng) |
| 7 | Revalidate toàn bộ | user bấm | Content ops → `revalidate-all` | `[revalidate] OK — {"status":"ok","revalidated":["content"]}` |
| 8 | Ảnh còn sau tạo lại container | user bấm | Content ops → `upload-smoke` lần 2 | `reused, file đã có` + 2 dòng 200 (container mới từ bước 6) |
| 9 | Smoke | agent/user | §3 | đủ mục §3 |
| 10 | Backup hằng ngày + restore thử | user (SSH, đọc-only DB prod) | `db.md` §3 + §4a: `docker exec nta-db-backup /scripts/restore-check.sh /backups/<daily mới nhất>.dump` rồi `db.md` §5b `migrate-on-restore.sh` | có `daily-*.dump` sau 20:00 UTC; restore vào `nta_restore_*` khớp số bản ghi |

## 3. Smoke sau bật `db`
- Mọi URL `https://ntavietnam.tech/sitemap.xml` (vi + en, 52 URL lúc 14/10) → 200; 3 URL `oc-eo-learning` → 301 như cũ; slug sai tiếng Việt → 404; `/api/health` 200.
  (Baseline local P4-T01: 79 URL, status file = db, DOM + JSON-LD trùng — `tasks/feature-content-database/phase-4-task-01.md`.)
- DB dừng ngắn → trang đã cache vẫn 200 (R-16): (SSH) `docker stop nta-db` → curl `/`, `/en`, `/blog` = 200 → `docker start nta-db` (≤ 1 phút, ngoài khung backup; deploy/ops không chạy lúc đó).
- Log: `docker logs nta-web 2>&1 | grep -c -E '\[content-shape\]|\[content-store\]'` = **0**.
- Sửa → web đổi không build: `db:cli` chưa có lệnh sửa; dùng **rollback** (cũng là 1 lần ghi có version): chọn 1 bản ghi đã có ≥ 2 version, hoặc làm ở CR-030 (bot).
  Tối thiểu ở cutover: `revalidate-all` đổi được nội dung (bằng chứng local MINOR-3: tạo post mới → revalidate → 200 → xoá mềm → revalidate → 404).
- Slug mới (MINOR-3) trên prod: chỉ làm khi user muốn (cần ghi DB qua bot/CR-030); local đã chứng minh.
- TTFB: `curl -s -o /dev/null -w '%{time_starttransfer}\n' https://ntavietnam.tech/` và `/en` (5 lần, lấy median) — ghi vào task, so với ngưỡng 50 ms + độ trễ mạng.

## 4. Kế hoạch lùi
1. Variable `CONTENT_SOURCE` = `file` (hoặc xoá variable) → Deploy (VPS) → *Run workflow*. Không sửa code, **DB giữ nguyên** (không xoá, không restore).
2. **Hệ quả:** mọi thứ đã sửa trong DB sau cutover (qua bot/CLI/rollback, ảnh upload được nội dung trỏ tới) **biến mất khỏi web** — web quay về nội dung file trong image.
   Ảnh trên volume vẫn còn (`/uploads/...` vẫn 200) nhưng không trang file nào trỏ tới.
3. Bật lại sau khi sửa: đổi variable về `db` + deploy + `revalidate-all` (DB không mất gì).

## 5. Sự cố
- Bước *Kiểm migration* lệch số → chạy lại Deploy (VPS) để migrate, không import tay.
- `import-seed` báo vi phạm ràng buộc → không ghi gì; sửa nội dung file ở task gốc rồi chạy lại.
- `parity` FAIL sau import → **không bật db**; gửi log cho agent.
- `upload-smoke` FAIL owner → trên VPS: `chown 1001:1001 /opt/nta-web-data/uploads` (cần SSH, root).
- Sau bật `db` trang 500 + log `[content-store]` → lùi (§4) rồi điều tra.
