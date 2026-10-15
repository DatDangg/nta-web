---
id: ops-backup-rotation
type: bug
status: in_progress
created: 2026-10-14
---

# Backup của workflow Content ops đẩy mất backup trước-deploy

## Yêu cầu
Backup do workflow **Content ops (VPS)** tạo (`pre-migrate-ops-*`) đang dùng chung vòng giữ 14 bản với backup trước-deploy (`pre-migrate-<sha>-*`),
nên mỗi lần chạy ops xoá bớt 1 bản trước-deploy cũ. Tách 2 loại thành 2 vòng giữ riêng.

## Bối cảnh / tái hiện (bug)
- Màn/route/role: VPS, sidecar `nta-db-backup`, thư mục `/opt/nta-web-data/db-backups`.
- Bước tái hiện: chạy Content ops lệnh `backup` / `import-seed` / `upload-smoke` nhiều lần (14/10/2026 cutover CR-031).
- Expected: giữ đủ 14 bản `pre-migrate-<sha>-*` của deploy, backup ops có vòng giữ riêng.
- Actual: log `rotate: xoá pre-migrate-8794f2917d86-…dump`, `rotate: xoá pre-migrate-e202ffca7b34-…dump` khi chạy ops.

## Acceptance (bắt buộc)
- [ ] Backup ops có prefix/nhãn riêng (vd `ops-<lệnh>-<UTC>-<run>`) được `backup.sh` chấp nhận, vòng giữ riêng.
- [ ] Rotate của deploy chỉ tính `pre-migrate-<sha>-*`; không xoá backup ops và ngược lại.
- [ ] Runbook `docs/runbook/db.md` + `docs/runbook/cutover-content-db.md` cập nhật tên file.

## Ghi chú
Phát hiện khi cutover CR-031 P4-T01 (B8). Liên quan `deploy/db/backup.sh` (rotate theo glob `pre-migrate-*`), `.github/workflows/content-ops.yml`.
