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
