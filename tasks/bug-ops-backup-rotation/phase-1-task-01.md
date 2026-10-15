# bug-ops-backup-rotation · phase-1-task-01 — Backup Content ops / AI news dùng chung vòng giữ 14 bản với backup trước-deploy (CR-033)

- **Nguồn:** `spec/changes/2026-10-14-ops-backup-rotation.md` (CR-033, BACKLOG `spec/changes/BACKLOG.md`)
- **Trạng thái:** built — Builder xong attempt 1 (repro PASS), chờ Reviewer (STRICT). User đã duyệt fix plan 15/10/2026.

## Classification / Risk
- **Class:** BUG (ops / backup retention) · **Severity:** medium — mất điểm khôi phục trước-deploy (không mất dữ liệu sống, DB vẫn chạy; nhưng giảm số bản rollback được khi migrate hỏng).
- **Scope:** shell script sidecar `deploy/db/backup.sh` + 2 workflow gọi backup ops (`content-ops.yml`, `ai-news.yml`) + runbook. Không đụng `src/`, DB schema, migration.
- **Root cause category:** retention design — rotate theo glob tiền tố quá rộng (`pre-migrate-*`) gom 2 loại backup khác vòng đời vào 1 vòng.
- **Expected review level:** **STRICT** (risk đỏ: backup/data loss — rotate xoá file; workflow prod chạy trên VPS).
- **Blast radius:**
  - `deploy/db/backup.sh` — dùng bởi: sidecar daily (`deploy/db/backup-loop.sh:21`), deploy (`.github/workflows/deploy.yml:56`), Content ops (`content-ops.yml:85`), AI news publish-db (`ai-news.yml:151`), lệnh tay trong runbook (`db.md:132,164,244,268`).
  - Image sidecar build từ `deploy/db/Dockerfile.backup:4` (COPY backup.sh) → thay đổi chỉ có hiệu lực trên VPS sau khi deploy rebuild image `nta-db-backup`.
  - `deploy/db/migrate-on-restore.sh:26` lấy `ls -1t /backups/*.dump | head -1` → tiền tố mới `ops-*.dump` vẫn khớp `*.dump` (không vỡ).
  - `deploy/db/restore-check.sh` nhận tên file tuỳ ý → không vỡ.
- **Doc impact:** `docs/runbook/db.md` (§3 danh sách file + bỏ cảnh báo CR-033 + dòng "xoá bớt pre-migrate-*"), `docs/runbook/cutover-content-db.md` (:22, :38 tên file), `docs/runbook/ai-news.md` (:80 tên file), comment đầu `content-ops.yml:8`. `docs/DESIGN.md` không đổi (chỉ nói "backup pre-migrate" của deploy).
- **Spec delta:** không — requirement R-16b (backup trước migrate, giữ ≥14 bản) không đổi, fix làm cho nó được thoả đúng. Spec Publisher: KHÔNG bump `spec_version`, sinh `spec/test-scope/current.json` (`trigger: bug-fix`, `scopeVersion` +1).
- **Decision impact:** cần user chốt 3 điểm ở mục "Câu hỏi cho user".
- **Migration gate:** không áp dụng (không có migration DB).

## Triage
- Màn/route/role: VPS, container sidecar `nta-db-backup`, thư mục host `/opt/nta-web-data/db-backups` (mount `/backups`). Operator = user bấm workflow.
- Tái hiện: chạy Content ops `backup` / `import-seed` / `upload-smoke` (14/10/2026 cutover CR-031 B2/B4/B5/B8) khi đã có ≥14 file `pre-migrate-*.dump`.
- Expected: 14 bản `pre-migrate-<sha12>-<run_id>-<attempt>.dump` của deploy luôn còn đủ; backup ops có vòng giữ riêng.
- Actual: log `rotate: xoá pre-migrate-8794f2917d86-…dump`, `rotate: xoá pre-migrate-e202ffca7b34-…dump` ngay sau backup ops (`.context/runs/feature-content-database-phase-4-task-01.md:37` — "backup rotate xoá pre-migrate cũ").

## Root cause (đã chứng minh từ code — Iron Law)
1. `deploy/db/backup.sh:18-21` — whitelist label chỉ chấp nhận `daily|pre-migrate-*` → mọi backup không phải daily **buộc** phải mang tiền tố `pre-migrate-`.
2. Vì (1), các caller ops đặt nhãn dưới tiền tố đó:
   - `.github/workflows/content-ops.yml:85` → `pre-migrate-ops-${OPS_COMMAND}-<UTC>-${GITHUB_RUN_ID}`
   - `.github/workflows/ai-news.yml:151` → `pre-migrate-ops-ai-news-<UTC>-${GITHUB_RUN_ID}` (caller thứ 2, change doc chưa nêu)
   - deploy `.github/workflows/deploy.yml:56` → `pre-migrate-${GITHUB_SHA::12}-${GITHUB_RUN_ID}-${GITHUB_RUN_ATTEMPT}`
3. `deploy/db/backup.sh:74` mọi label non-daily → `DUMP_NAME="$LABEL.dump"`, rồi `:97-98` → `rotate 'pre-migrate-*.dump'`.
4. `deploy/db/backup.sh:41-46` `rotate` giữ `KEEP` (=`BACKUP_KEEP` 14, `docker-compose.yml:92`) file mới nhất theo mtime trong **toàn bộ** glob → glob `pre-migrate-*.dump` khớp cả `pre-migrate-ops-*` lẫn `pre-migrate-<sha>-*` (và nhãn tay `pre-migrate-before-*`, `pre-migrate-manual-*`).
   ⇒ Mỗi backup ops mới (mtime mới nhất) đẩy bản `pre-migrate-<sha>` cũ nhất ra ngoài 14 bản → bị `rm -f`. Ngược lại deploy cũng xoá được bản ops.
- Lịch sử: whitelist + glob được thiết kế khi chỉ có deploy gọi (CR-031 P1-T02, `.context/decisions.md:81,85`); P4-T01 thêm Content ops tái dùng tiền tố để lọt whitelist (reviewer P4-T01 R3 đã ghi residual: `.context/review-reports/feature-content-database-phase-4-task-01-round-1-review.md:106`).

## Fix plan (đề xuất — chờ duyệt)
**Tiền tố mới:** `ops-<nguồn>-<UTC>-<run_id>` → file `ops-<nguồn>-<UTC>-<run_id>.dump`; vòng giữ riêng `ops-*.dump`, cùng `KEEP` (14).

1. `deploy/db/backup.sh`
   - Whitelist `:18-21`: `daily|pre-migrate-*|ops-*`; usage `backup.sh daily|pre-migrate-<id>|ops-<id>`; cập nhật comment đầu file (:3-5).
   - Nhánh rotate `:97-98` tách 2 vòng:
     - `ops-*` → rotate vòng ops: `ops-*.dump` **+ legacy `pre-migrate-ops-*.dump`** (để 6–7 file cũ trên VPS tự rơi dần, không đứng ngoài mọi vòng).
     - `pre-migrate-*` → rotate vòng deploy: `pre-migrate-*.dump` **trừ** `pre-migrate-ops-*.dump`.
   - `rotate()` `:41-46` đổi chữ ký nhẹ: nhận danh sách glob + (tuỳ chọn) 1 pattern loại trừ, vd `ls -1t <globs> 2>/dev/null | grep -v '/pre-migrate-ops-' | tail -n +$((KEEP+1))`. POSIX sh/busybox, không thêm dependency. Daily/uploads gọi như cũ.
   - Không đổi: không ghi đè (`refuse_existing`, `publish_file`), ghi file tạm `.tmp-*` (không lọt glob), exit code, `KEEP`.
2. `.github/workflows/content-ops.yml:85` → `"ops-${OPS_COMMAND}-$(date -u +%Y%m%dT%H%M%SZ)-${GITHUB_RUN_ID}"`; comment `:8` → `ops-backup-<UTC>-<run>`.
3. `.github/workflows/ai-news.yml:151` → `"ops-ai-news-$(date -u +%Y%m%dT%H%M%SZ)-${GITHUB_RUN_ID}"` (comment `:148` giữ CR-033).
4. Runbook (doc impact, as-built):
   - `docs/runbook/db.md:98-102` — danh sách file: `ops-<nguồn>-<UTC>-<run>.dump` (Content ops / AI news); 3 vòng giữ: `daily`/`uploads`, `pre-migrate-*` (deploy + nhãn tay), `ops-*` (+ legacy `pre-migrate-ops-*`); xoá khối ⚠️ CR-033 pending; `:112` "xoá bớt `pre-migrate-*`/`ops-*` cũ".
   - `docs/runbook/cutover-content-db.md:22,38` → `ops-<lệnh>-<UTC>-<run>.dump`, log `OK db → ops-backup-…dump`.
   - `docs/runbook/ai-news.md:80` → `ops-ai-news-*` (bản cũ `pre-migrate-ops-ai-news-*`).
5. Không đổi `deploy.yml`, `backup-loop.sh`, `restore-check.sh`, `migrate-on-restore.sh`, `docker-compose.yml`.

## Verification plan
- `sh -n deploy/db/backup.sh` (+ `shellcheck` nếu có sẵn; không có → ghi skip).
- **Repro test (test-first)** chạy trong container `postgres:16-alpine`/busybox local (giống `tasks/feature-content-database/phase-1-task-02.md:54,80`), `BACKUP_KEEP=2`, BACKUP_DIR tạm, pg_dump vào DB tạm:
  - TRƯỚC fix (HEAD): tạo 2 `pre-migrate-aaaa…-1-1` + chạy `pre-migrate-ops-x-…` → thấy `rotate: xoá pre-migrate-aaaa…` (**FAIL = tái hiện bug**).
  - SAU fix: 2 deploy + 3 ops (`ops-*`) → 2 deploy còn nguyên, ops giữ 2 mới nhất; 3 deploy → chỉ xoá deploy cũ nhất, ops không bị đụng; legacy `pre-migrate-ops-*` bị tính vào vòng ops, KHÔNG vào vòng deploy; nhãn tay `pre-migrate-manual-*` vẫn được chấp nhận; label `foo` → exit 2; daily vẫn rotate `daily-*`/`uploads-*` như cũ; trùng tên → FAILED exit 1.
  - Ghi log/kết quả vào mục `Repro Verification` của task này.
- `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` (không đổi code TS, chạy để gate auto-push) — từ `.context/project-config.md`.
- YAML workflow: kiểm cú pháp (`node -e` parse bằng `yaml` nếu có trong deps, hoặc `actionlint` nếu có; không có → review bằng mắt + ghi skip).
- **Sau deploy (user, VPS):** deploy rebuild `nta-db-backup` → bấm Content ops `backup` → log `OK db → ops-backup-…dump`, KHÔNG có dòng `rotate: xoá pre-migrate-<sha>…`; `ls -1t /opt/nta-web-data/db-backups/pre-migrate-*.dump | grep -v pre-migrate-ops- | wc -l` không giảm.

## Repro Verification
> Builder 15/10/2026 — attempt 1. User đã duyệt: prefix `ops-<nguồn>-<UTC>-<run_id>`; nhãn tay giữ vòng deploy; legacy `pre-migrate-ops-*` gộp vòng ops.

**Cách test:** máy không có Docker daemon (`docker version` → không kết nối được `dockerDesktopLinuxEngine`), không có busybox/shellcheck.
Thay bằng harness shell trong scratch dir (ngoài repo): `pg_dump` giả (ghi file theo `-f`), `pg_restore` giả (exit 0),
`BACKUP_KEEP=2`, `BACKUP_MIN_FREE_MB=0`, mỗi case 1 `BACKUP_DIR` tạm, file cũ tạo bằng `touch -d` (mtime cố định) → rotate theo `ls -1t` thật.
Chạy cả `sh` (Git Bash) lẫn **`dash`** (POSIX nghiêm, gần busybox ash). HEAD lấy bằng `git show HEAD:deploy/db/backup.sh`.

| Case | Trước fix (HEAD) | Sau fix |
|---|---|---|
| T1 2 deploy + backup ops tên legacy `pre-migrate-ops-backup-…` → deploy còn đủ | **FAIL** `rotate: xoá pre-migrate-aaaaaaaaaaaa-1-1.dump` (tái hiện bug) | PASS |
| T2 2 deploy + 3 ops `ops-*` → nhãn `ops-*` nhận, deploy nguyên, ops giữ 2 mới nhất | FAIL `usage …` exit 2 | PASS ×3 |
| T3 3 deploy → chỉ xoá deploy cũ nhất, `ops-*` không bị đụng | PASS | PASS ×2 |
| T4 legacy `pre-migrate-ops-*`: deploy run không xoá; ops run làm rơi legacy cũ nhất, deploy nguyên | **FAIL** (deploy run xoá cả 2 legacy) | PASS ×2 |
| T5 `pre-migrate-manual-*` được nhận, thuộc vòng deploy | PASS | PASS |
| T6 nhãn `foo` / `ops-a/b` → exit 2 | PASS | PASS ×2 |
| T7 `daily` → giữ 2 `daily-*`, không đụng deploy/ops | PASS | PASS |
| T8 trùng tên `ops-dup-1` → FAILED exit 1, file cũ giữ nguyên | FAIL (exit 2 vì whitelist) | PASS |
| **Tổng** | pass 7 / fail 6 | **pass 13 / fail 0** (sh và dash) |

- Original repro: backup ops (`pre-migrate-ops-*`) khi vòng `pre-migrate-*` đã đầy.
- Expected: bản trước-deploy `pre-migrate-<sha>-*` không bị xoá bởi backup ops; mỗi loại giữ vòng riêng.
- Actual before fix: `rotate: xoá pre-migrate-aaaaaaaaaaaa-1-1.dump` sau backup ops (T1); deploy run xoá ngược backup ops (T4).
- Actual after fix: 2 vòng độc lập (T1–T4), whitelist/không ghi đè/daily như cũ (T5–T8).
- Evidence: harness 13/13 PASS trên `sh` + `dash`; HEAD 7/13 (T1, T4 tái hiện đúng bug).
- **Status: PASS** (mức script; xác nhận trên VPS sau deploy = bước user ở Verification plan).

**Verify khác:**
- `sh -n deploy/db/backup.sh` → OK; `dash -n` → OK. `shellcheck`: skip (không cài).
- YAML: `node -e` parse bằng `yaml` (có trong node_modules) — `content-ops.yml`, `ai-news.yml` → OK.
- `npm run typecheck` → PASS · `npm run lint` → PASS (0 error, 1 warning `no-img-element` có sẵn, không liên quan) · `npm test` → PASS (104 tests: 102 pass, 2 skip cần `TEST_DATABASE_URL`, 0 fail).
- `npm run build` → **FAIL môi trường**: `Failed to load next.config.ts … [Error: Failed to load native binding]`; `require('@next/swc-win32-x64-msvc')` trực tiếp load OK.
  Diff task không đụng TS/config/`package.json` → không do task. Cần build lại bằng `bash tools/linux-build.sh verify` hoặc `docker build --target builder` (project-config) trước khi auto-push.

**Đã đổi:** `deploy/db/backup.sh` (whitelist `ops-*`, `rotate <regex loại trừ|''> <glob>...`, nhánh rotate 2 vòng, comment/usage),
`.github/workflows/content-ops.yml` (:8, :85), `.github/workflows/ai-news.yml` (:151), `docs/runbook/db.md` (§3 bảng 3 vòng giữ, bỏ khối ⚠️ CR-033, ghi chú sidecar cũ exit 2, dòng dọn đĩa),
`docs/runbook/cutover-content-db.md` (:22, :38), `docs/runbook/ai-news.md` (:80).
**Không đổi:** `deploy.yml`, `backup-loop.sh`, `restore-check.sh`, `migrate-on-restore.sh`, `docker-compose.yml`, `Dockerfile.backup`.
**Ghi chú thiết kế:** nhãn `pre-migrate-ops-*` truyền tay (legacy) cũng đi vòng ops để file của nó không đứng ngoài mọi vòng.
Sidecar chưa build lại + workflow mới gửi `ops-*` → `usage` exit 2 → workflow dừng ở *Backup DB*, chưa ghi DB (fail an toàn); `deploy.yml:50` build lại `nta-db-backup` trước bước backup.

## Câu hỏi cho user (chốt trước khi gọi builder)
1. Tiền tố `ops-<nguồn>-…` (đề xuất) có OK? (change doc gợi ý `ops-<lệnh>-<UTC>-<run>`; AI news thành `ops-ai-news-…`.)
2. Nhãn tay trong runbook (`pre-migrate-before-restore-*`, `pre-migrate-manual-*`, `pre-migrate-before-import-*`, `pre-migrate-before-rollback-*`) — đề xuất **giữ trong vòng deploy** (là điểm khôi phục trước thao tác phá hoại, hiếm chạy). Hay muốn tách thêm vòng `manual-*`? (mặc định: giữ, không mở rộng scope.)
3. Legacy `pre-migrate-ops-*.dump` trên VPS — đề xuất **gộp vào vòng ops** để tự rơi dần (không xoá tay). Hay muốn để nguyên vĩnh viễn / user tự dọn?

## Retry / Escalation
- Attempt tối đa 3; fail lần 3 → `architecture_review_needed`, dừng chờ review.

## Residual risk (dự kiến)
- Fix chỉ có hiệu lực sau deploy rebuild image sidecar; trước đó chạy Content ops vẫn có thể xoá bản deploy cũ (runbook giữ cảnh báo tới khi deploy xong).
- Tổng số dump trên đĩa tăng tối đa +14 (vòng ops riêng); dump hiện ~180 KB → không đáng kể; vẫn có cảnh báo `BACKUP_MIN_FREE_MB`.
