# feature-content-database · phase-4-task-01 — Parity toàn site + cutover production

- **CR:** CR-031 · spec R-16, R-16b, R-16c, R-27 (4.2.0) · 5 acceptance của change doc
- **Classification / Risk:** MODIFY (cutover prod) · HIGH — migrate + import thẳng DB prod (không staging, user chấp nhận)
  - Expected review level: **STRICT**
  - Blast radius: toàn bộ website production; VPS dùng chung.
  - Doc impact: runbook (bằng chứng cutover).

## Scope
1. **Parity local toàn site:** bản đọc file (commit trước task 5) vs bản đọc DB; crawl mọi URL sitemap vi+en + URL redirect/404 đã biết;
   so status code + HTML chuẩn hoá (bỏ build-id/hash) — gồm cả chữ giao diện (messages) + thông tin công ty; lệch → sửa ở task gốc. Screenshot 375/1280: trang chủ, 1 listing, 1 chi tiết mỗi loại.
2. **Cutover (human checkpoint — user duyệt deploy production):** (migration 0000 đã chạy từ task 2) backup → (user xác nhận) import seed
   1 lần (chỉ chèn) → parity DB prod ↔ file → bật `CONTENT_SOURCE=db` + `depends_on nta-db` → deploy → smoke.
3. Smoke prod (thêm): upload 1 ảnh qua hàm lưu (CLI) → hiện qua `/uploads/...` + `next/image` không build lại; ảnh còn sau restart container.
   Smoke prod: mọi URL sitemap 200, 301/404 như cũ, `/api/health` OK; end-to-end "sửa DB → revalidate → web đổi, không build" trên 1 bản ghi rồi **rollback** (kiểm lịch sử).
4. Backup hằng ngày chạy được trên VPS + restore thử vào DB tạm trên VPS.
5. Kế hoạch lùi: lỗi sau deploy → đặt lại `CONTENT_SOURCE=file` + deploy lại (DB giữ nguyên, không xoá).

## Thao tác của USER
- Duyệt deploy production; xác nhận chạy import lên DB prod; secret đã đặt (task 2).

## Acceptance
- Đủ 5 acceptance của change doc, có bằng chứng.

> MINOR-5: "bản đọc file (commit trước task 5)" ở Scope 1 đã lỗi thời (sau P3-T02 bản file cũng render động). Parity phần A so CÙNG 1 build HEAD, 2 server chỉ khác biến runtime CONTENT_SOURCE (đúng cách prod đổi cờ); so với baseline SSG đã làm ở P3-T02/P3-T04.

## Phần A — chuẩn bị (ĐÃ LÀM, không đụng production) · 14/10/2026 · builder

### Thay đổi
- docker-compose.yml: nta-web thêm `CONTENT_SOURCE: ${CONTENT_SOURCE:-file}` + `depends_on nta-db (service_healthy)`; service mới `nta-tools` (profile tools, target content-tools, user 1001, REVALIDATE_URL=http://nta-web:8080/api/revalidate, mount upload).
  depends_on an toàn ở chế độ file: deploy.yml đã `up --wait nta-db` (fail → dừng) trước khi up web; Docker tự khởi động lại sau reboot không xét depends_on.
- deploy.yml: `CONTENT_SOURCE: ${{ vars.CONTENT_SOURCE || 'file' }}` (GitHub Variable) + bước Validate CONTENT_SOURCE (chỉ file|db).
- content-ops.yml (mới): workflow_dispatch, runner [self-hosted, nta-web], whitelist parity|backup|import-seed|revalidate-all|upload-smoke; lệnh ghi cần confirm (IMPORT-SEED-PROD / UPLOAD-PROD) + tự backup trước; kiểm migration applied = số drizzle/*.sql; kiểm thư mục upload tồn tại + owner 1001:1001; input qua env; chung concurrency với deploy; chỉ `run --rm --no-deps`.
- Dockerfile: target content-tools (deps + tsconfig + src + tools/db, user nextjs 1001 có passwd). .dockerignore: `!tools/db`.
- docs/runbook/cutover-content-db.md (mới); docs/runbook/db.md (§0 bảng service, §8 chỉ dẫn VPS).

### Verification summary (Postgres 16.15 Docker tạm nta-p4-pg 127.0.0.1:55440 + network nta-p4-net — đã xoá)
- `npm run build` không đặt CONTENT_SOURCE PASS; prerender-manifest chỉ có /_not-found, /apple-icon.png, /icon.png, /robots.txt → cờ KHÔNG ảnh hưởng build, thuần runtime.
- `docker build --target content-tools` PASS, uid=1001(nextjs). Lỗi gặp + sửa: uid 1001 không có passwd → upload lỗi `uv_os_get_passwd ENOENT` (os.userInfo) → thêm user.
- Image nta-tools trong network (host nta-p4-pg = coi như prod): parity PASS 136/136; import-seed thiếu --confirm-prod → từ chối exit 2; có cờ → chèn 0, bỏ qua 136; upload vào volume owner 1001 → created, file 1001:1001; lần 2 → reused; thiếu cờ → từ chối; volume root-owned → EACCES; revalidate --all → 200; sai secret → 401.
- Parity toàn site (cùng build standalone; A không đặt cờ, B =db): 79 URL (sitemap 52 = vi 26 + en 26, + 27 redirect/404/khác). Status 200×56, 301×3, 307×3, 404×11, 500×6 (CR-032 + /package.json, giống nhau). LỆCH 0: status + Location + DOM ngoài script trùng byte + JSON-LD 52 trang deep-equal. Chỉ khác RSC flight (thứ tự key jsonb/số chunk).
- MINOR-3: tạo post p4-smoke-post (createEntry) → trước revalidate 404 → revalidate post → 200 + có trong /blog + sitemap → softDelete (I-8 confirm) → revalidate → 404, mất khỏi listing/sitemap; lịch sử v1 create / v2 delete. Không build lại.
- MINOR-6: fetch-cache lớn nhất content:solution 128 KB (vi) / 109 KB (en); product 18 KB; ui_messages 16 KB; case_study 16 KB; post 10 KB → ≤ 6,3 % giới hạn 2 MB.
- Ảnh upload qua web db: /uploads/<hash>.png 200, /_next/image 200.
- Screenshot db (Edge headless): .tmp/p4-screens/db-{vi-home,vi-blog-listing,vi-post,vi-solution,vi-product,vi-case-study,en-home}-{375,1280}.png (gitignored). Hạn chế: Edge headless Windows không thu viewport < ~500 px → ảnh 375 bị cắt, không dùng đánh giá responsive (DOM 2 chế độ trùng byte nên layout = file).
- YAML parse 3 file OK; `docker compose config --quiet` OK (giá trị giả); không có actionlint.
- typecheck PASS · lint PASS (1 warning cũ mdx no-img-element) · npm test có TEST_DATABASE_URL: 112 tests, 111 pass, 0 fail, 1 skip.

### Residual risk (phần A)
- Review phần A STRICT PASS round 1 — F2 (smoke DB dừng), F3 (concurrency), F4 (asset smoke cố ý), F5 (thứ tự B1/B2 + migrate-on-restore), F6 (content-ops chỉ chạy main) sửa inline; F7 (health không kiểm nguồn) chấp nhận; F1 (smoke sửa→rollback trên prod không có lệnh sửa): chốt 14/10 phương án (a) — bằng chứng local + revalidate-all trên prod; thử sửa/rollback trên prod làm ở CR-030.
- content-ops.yml chưa chạy thật trên runner — lần đầu chạy `parity` (chỉ đọc).
- Backup ops dùng nhãn pre-migrate-ops-*, chung vòng giữ 14 bản pre-migrate-* với deploy.
- `!tools/db` vào context build → cache layer builder web invalid khi tools/db đổi.
- db:cli chưa có lệnh "sửa"; smoke "sửa → revalidate → rollback" trên prod cần bản ghi ≥ 2 version hoặc bot CR-030.

## Phần B — cutover production (CHỜ USER) — docs/runbook/cutover-content-db.md §2
- [ ] B0 (agent) Reviewer STRICT phần A PASS → commit + push (deploy với CONTENT_SOURCE mặc định file — prod không đổi nguồn)
- [ ] B1 (user bấm) Content ops → parity (applied=2 expected=2; parity FAIL "thiếu" nếu DB rỗng là bình thường)
- [ ] B2 (user bấm) Content ops → backup — ghi tên file: ……
- [ ] B3 (USER XÁC NHẬN import lên DB prod)
- [ ] B4 (user bấm) Content ops → import-seed, confirm IMPORT-SEED-PROD → chèn 136 + parity PASS
- [ ] B5 (user bấm) Content ops → upload-smoke, confirm UPLOAD-PROD → created + 2 × 200
- [ ] B6 (USER DUYỆT deploy prod) Variable CONTENT_SOURCE=db → Deploy (VPS) → Run workflow → health OK
- [ ] B7 (user bấm) Content ops → revalidate-all
- [ ] B8 (user bấm) Content ops → upload-smoke lần 2 → reused + 200 (ảnh còn sau tạo lại container)
- [ ] B9 (agent) smoke §3: sitemap 200, 301/404 như cũ (500 CR-032 baseline), /api/health, log [content-shape]/[content-store] = 0, TTFB vi/en
- [ ] B10 (user, SSH đọc-only) có daily-*.dump + restore-check.sh vào DB tạm + migrate-on-restore.sh
- Lùi: Variable CONTENT_SOURCE=file + Deploy; DB giữ nguyên; mọi sửa trong DB biến mất khỏi web khi lùi.
