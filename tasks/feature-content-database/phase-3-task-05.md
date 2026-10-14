# feature-content-database · phase-3-task-05 — Lưu trữ ảnh upload (volume + /uploads + next/image, không build lại)

- **CR:** CR-031 · spec R-16d, R-16b (4.2.0, quyết định #10)
- **Classification / Risk:** ADDITIVE · HIGH
  - Expected review level: **STRICT** (upload/file access, path traversal, DoS dung lượng)
  - Blast radius: mới `src/lib/uploads/*`, route `src/app/uploads/[...path]/route.ts` (hoặc cách serve khác đã chứng minh), `next.config.ts` (`images.localPatterns`),
    middleware next-intl (không chặn `/uploads`), collection `asset` (whitelist app), CLI `content-cli upload`.
  - Doc impact: API_SPEC, runbook (phase 5). Decision impact: cách serve ảnh → decisions.md.

## Scope
1. **Chọn cách serve đơn giản nhất chứng minh được** (Next standalone chỉ phục vụ file có trong `public/` lúc build → không dựa vào public runtime):
   đề xuất route handler `GET /uploads/[...path]` đọc từ `UPLOAD_DIR` (chuẩn hoá path, chặn `..`/symlink ra ngoài, chỉ đuôi jpg/png/webp, `Content-Type` đúng,
   `Cache-Control: public, max-age=31536000, immutable` vì tên theo hash, `X-Content-Type-Options: nosniff`). Phương án nginx `location /uploads` chỉ dùng nếu đơn giản hơn và
   không đụng vhost dự án khác. Chứng minh `next/image` (`localPatterns` `/uploads/**`) tối ưu được ảnh này ở bản build standalone mà không build lại.
2. `saveImage({bytes, originalName?, alt?, actor})`: kiểm magic bytes JPEG/PNG/WebP (từ chối SVG/khác), ≤ 5 MB, giới hạn kích thước ảnh (đọc header, không thêm lib nặng),
   tên file = sha256 nội dung + đuôi chuẩn, ghi atomic (tmp → rename), trùng hash → dùng lại; ghi metadata `asset` (path, mime, bytes, width, height, alt vi/en, sha256)
   qua content-repo (có version, R-16a). Không xoá file vật lý khi xoá mềm asset.
3. CLI `content-cli upload <file>` (dev/runbook; bot CR-030 gọi cùng hàm).
4. Test: path traversal (`../`, `%2e%2e`), mime giả (đuôi .png nội dung khác), quá dung lượng, SVG bị từ chối, trùng hash, serve 404 file không tồn tại.

## Thao tác của USER
- Thư mục upload trên VPS (đề xuất `/opt/nta-web-data/uploads`) + dung lượng — đã gộp vào yêu cầu P1-T02.

## Acceptance
- Local bản build standalone + volume: upload → `/uploads/<hash>.webp` 200 + `next/image` hiển thị, không build lại; còn sau restart container; test bảo mật PASS.

## Thiết kế (builder, 14/10/2026) — chi tiết: `.context/decisions.md` mục CR-031 P3-T05
- Serve: route handler `src/app/uploads/[...path]/route.ts` → `src/lib/uploads/serve-upload.ts` đọc `UPLOAD_DIR`. Whitelist tên
  `^[0-9a-f]{64}\.(jpg|png|webp)$` (1 segment) + realpath trong thư mục gốc + file thường; header `Content-Type`, `Cache-Control: public, max-age=31536000, immutable`,
  `X-Content-Type-Options: nosniff`; 404 (`no-store`) khi không tồn tại / UPLOAD_DIR thiếu / tên sai. Chỉ GET (POST → 405). Không dùng nginx (đỡ sửa vhost VPS).
- `next.config.ts`: `images.localPatterns` `/images/**` + `/uploads/**`.
- `src/lib/uploads/image-file.ts`: `inspectImage` (magic bytes + kích thước từ header, ≤ 5 MB, ≤ 8192 px/cạnh), `storeImageFile` (sha256 + đuôi chuẩn, tmp → rename, trùng hash giữ file).
- `src/lib/uploads/save-image.ts`: `saveImage(db, {bytes, originalName?, alt?, actor, uploadDir?})` → asset `created|reused|restored` qua `createEntry`/`rollbackEntry` (có version).
- `src/db/content-rules.ts`: `ASSET_LOCALE = "vi"` + `assetProblems` trong `checkRecord`; `src/db/content-repo.ts`: bỏ cảnh báo I-1 cho asset.
- CLI: `npm run db:cli -- upload <file> [--alt-vi ..] [--alt-en ..] [--confirm-prod]` (DB prod cần `--confirm-prod`, không in secret).
- Migration: **không** (collection `asset` đã có trong whitelist + bảng P1-T01). Infra: **không đổi** — `UPLOAD_DIR=/app/uploads` + bind mount + backup tar uploads đã có từ P1-T02 (xác nhận `docker-compose.yml`, `deploy/db/backup.sh`).

## Verification summary
- `npm run typecheck` PASS · `npm run lint` PASS (1 warning `<img>` có sẵn ở `src/components/mdx/index.tsx`, không thuộc task) · `npm run build` PASS (`ƒ /uploads/[...path]`).
- `npm test` (TEST_DATABASE_URL = Postgres docker tạm `nta-p3t05-pg`, đã xoá): 112 tests, 111 pass, 0 fail, 1 skip (symlink trên Windows — kiểm thay bằng docker bên dưới).
  Test mới: `src/lib/uploads/uploads.test.ts` (magic bytes, SVG, nội dung giả, quá dung lượng/kích thước, trùng hash, header, 404 traversal `../` `%2e%2e` `%2F` `\`, tên lạ, UPLOAD_DIR thiếu, symlink),
  `tools/db/save-image.test.ts` (luật asset checkRecord, created/reused/restored, version, xoá mềm giữ file, sửa path lệch bị chặn, SVG không ghi gì, thiếu UPLOAD_DIR).
- Standalone (`next build` → `.next/standalone/server.js`, UPLOAD_DIR thư mục tạm): upload bằng CLI SAU build → `/uploads/<hash>.webp` 200 (đúng byte, header đúng),
  `/_next/image?url=/uploads/<hash>.webp&w=640` 200 `image/webp`; ảnh `/images/brand/logo-lockup.png` vẫn tối ưu 200; `/_next/image` url ngoài pattern → 400;
  traversal (`--path-as-is` `%2e%2e/…`, `..%2F..%2F`) → 404; POST → 405; CLI upload lại → `reused`; CLI file SVG đuôi .png → `[cli] FAIL — ảnh bị từ chối`. Restart server → vẫn 200.
- Docker (image runner, user `nextjs` uid 1001, volume chown 1001:1001 giả lập `/opt/nta-web-data/uploads`): nextjs ghi tmp→rename được; trước ghi 404 → sau ghi 200 +
  next/image 200 webp không build lại; symlink `<hash>.png → /app/server.js` → 404; `docker restart` + tạo lại container → vẫn 200. Volume root-owned → nextjs ghi `EACCES`
  (khớp runbook: phải `chown 1001:1001`). Container/volume/image tạm đã xoá; không đụng `ismartschool-postgres`.

## Residual risk
- Review round 1 STRICT PASS — F1 (serve chặn file > MAX_UPLOAD_BYTES trước khi nạp RAM) + F2 (trùng hash: file cũ lệch số byte → ghi lại) sửa inline; F3 kiểm WebP chưa chặt (start code VP8/VP8L, độ dài RIFF — rủi ro thấp nhờ nosniff), F4 thiếu test buffer cắt cụt/segment JPEG giả, F5 alt mới bị bỏ qua khi trùng hash, F6 CLI đọc hết file trước khi kiểm 5 MB — chấp nhận. Asset xoá mềm vẫn truy cập qua URL hash → ghi runbook phase 5.
- Đường có dấu chấm không có route (vd `/package.json`, `/khong-co.txt`) trả **500** thay vì 404 — có sẵn trước task (lỗi "static to dynamic" của trang not-found, cùng họ CR-032), không lộ file; ngoài scope.
- 2 lần saveImage đồng thời cùng ảnh mới: lần sau lỗi I-5 trùng khoá (không hỏng dữ liệu) — người gọi thử lại sẽ nhận `reused`.
- Bot/CLI chạy ở VPS phải ghi được thư mục upload (uid 1001) — CLI hiện chạy bằng tsx ngoài image (tools/ bị .dockerignore loại); cách chạy prod chốt ở CR-030/runbook phase 5.
- File mồ côi (ghi file xong nhưng DB lỗi) không tự dọn — vô hại, tên theo hash.

## Doc impact
- `docs/API_SPEC.md` (thêm `GET /uploads/<sha256>.<ext>`) + runbook (`db:cli -- upload`, quyền thư mục) → dời **phase 5** (P5-T01 doc reconcile). Decision: `.context/decisions.md` đã ghi.
