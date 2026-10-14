# feature-content-database · phase-2-task-02 — Write-path có version + rollback + CLI bảo trì

- **CR:** CR-031 · spec R-16a (4.2.0)
- **Classification / Risk:** ADDITIVE · HIGH (ghi dữ liệu prod; nền cho bot CR-030)
  - Expected review level: **STRICT**
  - Blast radius: mới `src/db/content-repo.ts`, `tools/db/content-cli.ts`. Không đổi web.
  - Doc impact: runbook db (CLI); `docs/content-bot/` ở phase 5.

## Scope
1. `createEntry / updateEntry / softDeleteEntry / rollbackEntry(entryId, toVersion) / listVersions` — mỗi hàm 1 transaction:
   `SELECT … FOR UPDATE`, kiểm `expectedVersion` (lệch → lỗi conflict), tăng version, ghi `content_versions`.
   Validate `data` bằng cùng required-fields/enum như loader (tái dùng `assertRequiredFields`), giữ I-1..I-6 — sai → không ghi.
   I-7: đường dẫn ảnh phải tồn tại trong `public/` (kiểm theo danh sách file của repo/image). I-8: xoá hoặc đổi slug bản ghi public
   → từ chối trừ khi có cờ xác nhận + ghi rõ cần redirect 301 (redirect vẫn nằm ở `next.config.ts`, cần deploy).
2. Rollback = ghi snapshot version cũ thành version mới (op `rollback`); không sửa/xoá lịch sử.
3. CLI `tools/db/content-cli.ts`: `list`, `show`, `history`, `rollback` — cho dev/runbook; bot CR-030 dùng lại repo. (Lệnh `revalidate` thêm ở task 7.)
4. Test (Postgres Docker local): version tăng đúng, conflict, rollback tạo version mới, xoá mềm ẩn khỏi đọc nhưng còn lịch sử, validate chặn dữ liệu thiếu field.

## Acceptance
- Mọi thay đổi để lại dòng lịch sử cùng transaction; rollback khôi phục đúng snapshot; test PASS.

## Bổ sung từ spec-validator hết phase 1
- MINOR-1: `content_versions` thiếu `sort_order` → thêm cột (migration additive, nullable) để rollback khôi phục đúng thứ tự.
