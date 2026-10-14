Agent: reviewer

# Review — feature-content-database · phase-1-task-02 · round 1 (CR-031)

- **Review level:** STRICT
- **Reason:** DB/migration gate, backup/restore (data-loss risk), secret, CI deploy trên VPS dùng chung (ismartschool/crm-dhp/tmfoods).
- **Blast radius:** `docker-compose.yml` (thêm nta-db, nta-db-backup, nta-migrate; nta-web thêm env + bind mount uploads),
  `Dockerfile` (stage `migrator`, runner vẫn là stage cuối), `.github/workflows/deploy.yml` (mọi deploy prod),
  `deploy/db/**` (mới), `package.json` (script test), `docs/runbook/db.md` (mới), `docs/runbook/deploy-vps.md`, `.context/decisions.md`.
  Không đụng `src/`. Mọi `docker compose` (kể cả `ps/logs/exec`) giờ cần `POSTGRES_PASSWORD` + `REVALIDATE_SECRET` trong env.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm test` | PASS 32/32 (4 suites, gồm 27 test gate) |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — 0 error, 1 warning `<img>` có sẵn (`src/components/mdx/index.tsx:25`, ngoài scope) |
| `docker compose config --quiet` (env giả) | **skip** — ngoài allowlist bash của reviewer → residual risk (Builder báo PASS) |
| `git diff` / `git diff --stat` | đã đọc toàn bộ diff |

Ghi chú quy trình: lệnh bash đầu tiên của reviewer có kèm `sed`/`ls` (read-only, ngoài allowlist) để đọc agent def + liệt kê `deploy/db`; sau đó chỉ dùng Read/Grep/Glob + lệnh được allow.

## Skill gates
- aislop: skip — không chạy (tránh tải package qua npx; chưa xác nhận đã cài).
- oxlint (anti-slop): skip, oxlint not configured (không có `.oxlintrc*`).
- ocr (open-code-review): skip, ocr not installed/không xác nhận.
- AI-readable: OK — file nhỏ (gate 108 dòng, migrate.ts 87), hàm < 50 dòng, tên rõ, comment giải thích WHY; runbook cập nhật. 0 indicator.
- ai-friendly-web: N/A (infra, không đổi trang public).
- blitzstrike: N/A.
- Responsive Checklist Gate: N/A (diff không đụng UI).

## Kiểm theo trọng điểm
1. **Security** — OK: secret chỉ qua `env` workflow → compose interpolation; `config --quiet` không in; không echo; không ghi vào image
   (không build-arg secret; `Dockerfile.backup` chỉ COPY script); `migrate.ts` không in `DATABASE_URL`; `DATABASE_URL` ghép đúng
   `postgres://nta:<pw>@nta-db:5432/nta_web` (runbook ràng buộc pw chữ+số). `nta-db` không `ports:`. Sidecar root để ghi thư mục root 700.
   Script: quote đúng, `set -eu` (busybox sh; không dùng pipefail — không có pipeline nào quyết định kết quả), `rm -f` chỉ trên file tạm tự đặt
   và output `ls -1t "$BACKUP_DIR"/<pattern cố định>`; label được whitelist ký tự.
2. **deploy.yml** — OK thứ tự: config → DB healthy (`--wait`) → backup pre-migrate (exit≠0 → dừng) → build migrator → gate `check` (exit 1 → dừng)
   → `migrate` (gate chạy lại trước apply) → build web → `up -d --remove-orphans` → health. Không có push/reset/seed/`db push`.
   Lần đầu (volume mới): `to_regclass` null → mọi migration pending → 0000 qua gate → apply. `--remove-orphans` chỉ trong project `nta-web`;
   tên container/volume đều tiền tố `nta-`. Web chưa `depends_on` nta-db.
3. **Gate** — logic pending khớp drizzle migrator (`created_at < folderMillis`); phủ DROP/TRUNCATE/UPDATE/DELETE/ALTER TYPE/ALTER COLUMN TYPE/
   SET NOT NULL/ADD UNIQUE|FK|PK/RENAME/CREATE UNIQUE INDEX; 0000 không bị chặn nhầm (có test đọc file thật); marker phải đứng đầu dòng,
   ngày ISO + `by <người>`. Gap fail-open cho SQL viết tay — xem MINOR-2/3.
4. **Backup** — OK: `pg_dump -Fc` → file tạm → `pg_restore --list` → mv; giữ 14 mỗi loại; cảnh báo dung lượng không fail; lịch 20:00 UTC;
   tar uploads (ro mount). restore-check từ chối `nta_web`. Vấn đề ghi đè pre-migrate — MAJOR-1.
5. **Runbook** — đủ mục (secret, log, restore DB tạm → prod, migrate tay, gate đỏ, sự cố). Lệnh đúng. Thiếu ghi chú secret ở deploy-vps §5–§7 — MINOR-5.
6. **Build** — `migrator` FROM deps (có tsx/pg/drizzle-orm do `npm ci` cài cả devDeps), runner vẫn stage cuối, compose nta-web không đặt target. OK.
7. **Scope** — trong phạm vi task 02; không lấn task 8 (depends_on/CONTENT_SOURCE). OK.

## Findings

### [MAJOR-1] Backup pre-migrate bị GHI ĐÈ khi re-run cùng commit → mất điểm khôi phục thật
- `.github/workflows/deploy.yml:44` (`pre-migrate-${GITHUB_SHA::12}`) + `deploy/db/backup.sh:59,66` (`mv` ghi đè không kiểm tồn tại).
- Kịch bản: run 1 backup → migrate (kể cả migration HIGH_RISK đã duyệt, mất dữ liệu cột) OK → build web hoặc health FAIL → "Re-run jobs"
  (cùng SHA) → backup lần 2 ghi đè `pre-migrate-<sha>.dump` bằng trạng thái **sau** migrate. Bản dump duy nhất trước thao tác phá hoại biến mất;
  daily dump có thể cũ tới 24h. Đây đúng là bản mà runbook deploy-vps §5 / db.md §4 dặn dùng để khôi phục.
- Fix đề xuất: tên file gồm cả run attempt/thời điểm, vd `pre-migrate-${GITHUB_SHA::12}-${GITHUB_RUN_ID}-${GITHUB_RUN_ATTEMPT}`
  (label whitelist đã cho phép), và/hoặc `backup.sh` fail/thêm hậu tố UTC khi `$BACKUP_DIR/$DUMP_NAME` đã tồn tại. Thêm 1 dòng runbook.

### [MINOR-2] Gate fail-open với `--` nằm trong literal chuỗi
- `deploy/db/migration-gate.ts:47-52`: bỏ comment `--…` TRƯỚC khi bỏ chuỗi. `DEFAULT '--x';` cắt mất dấu `'` đóng → regex chuỗi ghép `'` lẻ với
  `'` kế tiếp ở dòng sau, nuốt luôn các statement giữa (vd `DROP TABLE c;`) → không bị bắt.
- Fix: tokenizer 1 lượt (duyệt ký tự, theo dõi trạng thái trong chuỗi/comment) hoặc 1 regex alternation `'(?:[^']|'')*'|--[^\n]*|/\*[\s\S]*?\*/`
  thay thế theo match; thêm test case.

### [MINOR-3] Gate không bắt statement phá hoại nằm trong `DO $$…$$` / CTE `WITH … DELETE|UPDATE` / backfill `INSERT … SELECT`
- `deploy/db/migration-gate.ts:31-44`: rule neo `^`, nên `DO $$ BEGIN DELETE …`, `WITH x AS (…) DELETE …` lọt; AGENTS.md liệt kê "bulk transform/backfill"
  nhưng `INSERT … SELECT` không bị gắn cờ. drizzle-kit 0.31 không sinh các dạng này (0000 không có `DO $$`) nên rủi ro chỉ với migration viết tay.
- Fix: fail-closed — statement bắt đầu bằng `DO`/`WITH`/`CREATE [OR REPLACE] FUNCTION|PROCEDURE`/`COPY`/`CALL`, hoặc chứa `$$`, hoặc `INSERT … SELECT`
  → finding "cần duyệt tay". Ghi vào runbook §6.

### [MINOR-4] `restore-check.sh` chỉ chặn `nta_web`, vẫn cho `dropdb` DB hệ thống
- `deploy/db/restore-check.sh:10-16`: tham số 2 = `postgres` / `template1` qua guard → `dropdb --if-exists postgres` (user `nta` là superuser).
- Fix: thêm `postgres|template0|template1` vào nhánh từ chối (hoặc bắt buộc tiền tố `nta_restore_`).

### [MINOR-5] Runbook deploy-vps §5–§7 chưa nói phải export secret
- `docs/runbook/deploy-vps.md:120,129,136`: `docker compose up -d --build` / `ps` / `logs` giờ lỗi "POSTGRES_PASSWORD is required" nếu chưa export
  (compose nội suy cả file). Chỉ §2 và db.md §1 có ghi. Fix: thêm 1 dòng chú ý ở §5 + §7 (trỏ db.md §1), hoặc dùng `docker logs nta-web` cho lệnh chỉ đọc.

### [MINOR-6] (ghi chú) Deploy commit cũ/revert bỏ service DB → `--remove-orphans` xoá container nta-db + nta-db-backup
- `.github/workflows/deploy.yml:59`. Volume `nta-db-data` vẫn còn (không mất dữ liệu) nhưng backup daily dừng. Đề xuất ghi 1 dòng vào deploy-vps §5 Rollback.

## Residual risk
- `docker compose config --quiet` chưa tự chạy (ngoài quyền) — dựa vào evidence Builder + đọc tay compose (cú pháp hợp lệ theo đọc).
- Chưa chạy trên VPS thật: quyền thư mục host, Compose `--wait` trên VPS, dung lượng đĩa.
- Không backup off-site; không có staging DB (user chấp nhận, bù bằng pre-migrate backup + gate + additive).
- Gate regex là lưới an toàn, không thay được việc đọc từng file migration khi review.

## Verdict
❌ **FAIL** — 1 MAJOR (MAJOR-1: backup pre-migrate bị ghi đè khi re-run, mất điểm khôi phục). Sửa MAJOR-1 là đủ để PASS round 2;
MINOR-2..6 khuyến nghị sửa cùng lượt (rẻ, cùng file), không bắt buộc.
