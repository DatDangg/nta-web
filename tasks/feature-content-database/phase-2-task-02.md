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

## Builder report (2026-10-14)

**Files**
- Mới: src/db/content-rules.ts (quy tắc dùng chung), src/db/content-repo.ts (createEntry/updateEntry/softDeleteEntry/rollbackEntry/listVersions/getEntry/getEntryByKey/listEntries + ContentConflictError/ContentValidationError/ContentNotFoundError), tools/db/content-cli.ts (list/show/history/rollback, guard --confirm-prod cho lệnh ghi), tools/db/content-rules.test.ts (luôn chạy), tools/db/content-repo.test.ts (cần TEST_DATABASE_URL), drizzle/0001_aromatic_rattler.sql + drizzle/meta/0001_snapshot.json (sinh bằng npm run db:generate).
- Sửa: src/db/schema.ts (content_versions.sort_order), src/db/schema.test.ts, drizzle/meta/_journal.json, deploy/db/migration-gate.test.ts (test file 0001 thật), deploy/db/migrate-on-restore.sh (trap INT/TERM/HUP), tools/db/seed-db.ts (ghi sort_order vào version 1), tools/db/seed-db.test.ts (MINOR-5: đếm version bằng =, kèm so sort_order), tools/db/parity-check.ts (dùng content-rules: + required fields, I-6 icon, I-3 hai chiều), tools/db/file-source.test.ts (kỳ vọng thêm lỗi required field), package.json (db:cli; lock không đổi), docs/runbook/db.md (§1b CONTACT_FORM_TARGET, §8 read -rs thay URL trên dòng lệnh, §9 CLI), .context/decisions.md.

**Migration 0001:** `ALTER TABLE "content_versions" ADD COLUMN "sort_order" integer;` — additive, nullable, không default. Gate: findings [], blocked false, không marker.

**Verify (Postgres 16.15 Docker tạm nta-p2t02-db 127.0.0.1:55433 — đã xoá container/network/volume/image)**
- db:migrate (0000+0001) OK; chạy lại → no-op (drizzle.__drizzle_migrations = 2); content_versions.sort_order nullable, không default.
- import seed: chèn 136; parity PASS; 136/136 version có sort_order khớp entry.
- update solution/vi/crm qua repo → parity FAIL đúng (lệch data.title); CLI history v1 create/v2 update; rollback với --expected-version sai → conflict exit 1; rollback --to 1 --expected-version 2 → v3 rollback; parity PASS lại. Prod guard: DATABASE_URL nta-db/nta_web → từ chối exit 2. Lệnh sai/tham số sai → exit 2.
- migrate-on-restore.sh: dump DB chỉ có 0000 (1 entry/1 version) → restore nta_restore_p2t02 → gate 0001 OK → apply → drizzle 2, dữ liệu giữ nguyên → PASS, DB tạm đã xoá.
- npm test: không TEST_DATABASE_URL 54 pass / 0 fail / skip (DB tests); có TEST_DATABASE_URL 62 pass / 0 fail (content-repo 7 case: version tăng, rollback snapshot kể cả sort_order, conflict + 2 ghi đồng thời đúng 1 thành công, xoá mềm ẩn khỏi đọc còn lịch sử + rollback khôi phục, validate thiếu field/I-2/I-7 public + upload/I-8, I-3/I-1/I-5, lỗi giữa transaction không để entry đổi thiếu version).
- npm run typecheck PASS; npm run lint PASS (1 warning img có sẵn).
- **docker build --target builder: FAIL — CHƯA xác minh nguyên nhân** (hết step budget builder): next build biên dịch xong, lỗi ở bước prerender "An error occurred in the Server Components render" (message bị ẩn ở production). Diff này không đổi web/loader (chỉ src/db/*, tools/db/*, deploy, docs); lần chạy đầu lỗi do test trong src/db import tools/ (tools bị .dockerignore loại) → đã chuyển test sang tools/db, typecheck PASS, nhưng build vẫn lỗi prerender. Cần primary/reviewer chạy lại build trên HEAD sạch (git stash) để xác định lỗi có sẵn/môi trường (vd mạng tới Google Fonts) hay do diff.

**Rủi ro / ghi chú**
- Build Docker chưa PASS (trên) → không được push cho tới khi xác định.
- REQUIRED_FIELDS nhân bản danh sách trong loader (không được đổi loader ở task này) — có test đọc mã loader để bắt lệch; P3 nên cho loader import REQUIRED_FIELDS.
- tools/ trong .dockerignore → CLI chưa chạy được trên VPS (như P2-T01, xử lý ở P4-T01).
- Version cũ trước 0001 có sort_order NULL (prod chưa có dữ liệu nên không ảnh hưởng).
- Trap tín hiệu của migrate-on-restore.sh chỉ kiểm cú pháp (sh -n), chưa thử Ctrl-C thật.

## Close-out
- Status: **done** · Acceptance criteria: PASS (Postgres local/test; không ghi DB prod)
- Verify: npm test 54 pass + 1 skip (có TEST_DATABASE_URL: 62 pass) · typecheck PASS · lint PASS (1 warning có sẵn) · migrate 0000+0001 x2 PASS · import + parity + CLI rollback PASS · migrate-on-restore áp 0001 PASS · docker compose build nta-web (như CI) PASS 61/61. docker build --target builder FAIL ngẫu nhiên cả trên clean HEAD e202ffc → lỗi prerender flaky có sẵn của môi trường local, không do diff (reviewer xác nhận không route web nào import src/db).
- Reviewer verdict: STRICT **PASS** round 1 — .context/review-reports/feature-content-database-phase-2-task-02-round-1-review.md
- MINOR đã sửa: runbook §8 đường dẫn test. Follow-up: tách phần đọc content-repo.ts (404 dòng > 300); khoá/kiểm I-3 chéo bản ghi khi chạy đồng thời + đổi group registry; map lỗi UNIQUE → ContentValidationError I-5; chuẩn hoá path ảnh dạng backslash.
- Migration: drizzle/0001_aromatic_rattler.sql — ALTER TABLE content_versions ADD COLUMN sort_order integer (additive, nullable, không default); deploy sẽ backup pre-migrate rồi apply lên DB prod (bảng rỗng).
- Doc impact: docs/runbook/db.md (§1b, §8, §9 CLI), decisions.md.
