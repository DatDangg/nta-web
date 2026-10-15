Agent: reviewer

# Review — bug-ops-backup-rotation · phase-1-task-01 · round 1 (CR-033)

- **Review level:** STRICT
- **Reason:** `rotate` xoá file backup (data loss / destructive), script chạy trên VPS prod (sidecar `nta-db-backup`), dùng chung bởi deploy + 2 workflow ops + lệnh tay runbook.
- **Blast radius:**
  - `deploy/db/backup.sh` → sidecar daily (`deploy/db/backup-loop.sh:21`), deploy (`.github/workflows/deploy.yml:56`), Content ops (`content-ops.yml:85`), AI news publish-db (`ai-news.yml:151`), lệnh tay runbook (`docs/runbook/db.md:138,170,250,274`).
  - Image `deploy/db/Dockerfile.backup` (`postgres:16.15-alpine` → `/bin/sh` = busybox ash) COPY script → chỉ có hiệu lực sau khi deploy rebuild.
  - Thư mục host `/opt/nta-web-data/db-backups` (mount `/backups`).
  - Không đụng `src/`, DB schema, migration, API.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `git diff -- deploy/db/backup.sh .github/workflows/content-ops.yml .github/workflows/ai-news.yml docs/runbook/` | đã đọc toàn bộ |
| `git diff --check -- <các file trên>` | exit 0, không lỗi whitespace (chỉ cảnh báo autocrlf working copy, không ảnh hưởng blob LF) |
| Grep `\r$` trong `deploy/db/backup.sh` | 0 — script LF, an toàn cho busybox sh |
| `sh -n` / `dash -n` / harness rotate | **skip — reviewer bị deny bash** (`permission.bash "*": deny`, chỉ allow verify/git read). Dựa vào evidence Builder (13/13 PASS trên sh + dash, HEAD 7/13 tái hiện T1/T4) + trace tĩnh dưới đây |
| `npm run typecheck` / `lint` / `test` | không chạy lại (diff không đụng TS); Builder ghi PASS |
| `npm run build` | Builder ghi FAIL môi trường (native binding SWC trên Windows), không do diff. **Primary phải build lại** bằng `bash tools/linux-build.sh verify` hoặc `docker build --target builder` trước auto-push |

## Trace tĩnh (STRICT)
1. **Hai vòng độc lập**
   - Nhãn `ops-*` hoặc legacy `pre-migrate-ops-*` → `rotate '' 'ops-*.dump' 'pre-migrate-ops-*.dump'` (`backup.sh:113`).
   - Nhãn `pre-migrate-*` khác → `rotate '/pre-migrate-ops-[^/]*$' 'pre-migrate-*.dump'` (`:114`). Regex neo `/…[^/]*$` chỉ khớp basename → không phụ thuộc `BACKUP_DIR`; bản `pre-migrate-<sha12>` (hex) không bao giờ bắt đầu bằng `ops-` → không bị loại nhầm.
   - Thứ tự `case`: nhánh `ops-*|pre-migrate-ops-*` đứng trước `*` → đúng.
2. **Không xoá nhầm daily/uploads:** glob `ops-*.dump`, `pre-migrate-*.dump` không khớp `daily-*`, `uploads-*`, `.tmp-*` (glob không khớp dotfile; tiền tố neo đầu). Nhánh daily giữ nguyên glob cũ (`:99,:106`).
3. **POSIX/busybox:** `for pattern in "$@"` lấy danh sách một lần trước vòng lặp → `set -- "$@" …` trong thân vòng an toàn; `shift "$n"` bỏ đúng các pattern gốc. `ls -1t` nhiều operand sắp chung theo mtime (busybox + GNU). `grep -v -e`, `tail -n +N`, `read -r`, `{ …; }` trong pipeline đều có trong busybox. Dòng tiếp nối `\` + `| tail` hợp lệ.
4. **Glob không khớp:** để nguyên literal → `ls` báo lỗi vào `2>/dev/null`, vẫn liệt kê operand còn lại. Exit ≠ 0 của `ls`/`grep -v` (khi rỗng) nằm giữa pipeline → không kích `set -e`; phần tử cuối là `while` → exit 0. `"$@"` không bao giờ rỗng.
5. **Whitelist / path traversal:** nhãn phải khớp `daily|pre-migrate-*|ops-*` VÀ không chứa ký tự ngoài `[A-Za-z0-9._-]` (`:22-28`) → không có `/`, không traversal; `ops-a/b` → exit 2 (T6 Builder).
6. **Caller khác:** `deploy.yml:56` (`pre-migrate-<sha12>-…`), `backup-loop.sh:21` (`daily`), runbook tay `pre-migrate-before-*`/`pre-migrate-manual-*` → vẫn hợp lệ, thuộc vòng deploy. `restore-check.sh` nhận tên tuỳ ý; `migrate-on-restore.sh` dùng `*.dump` → khớp `ops-*.dump`.
7. **Thứ tự deploy:** `deploy.yml:50-52` build + `up -d nta-db-backup` trước bước backup `:56`. Deploy chạy mỗi push `main` (không lọc paths). `content-ops` (cấp workflow) và `ai-news` job publish-db (`ai-news.yml:110-112`) dùng chung concurrency `deploy-nta-web` → xếp hàng sau deploy, nên sidecar đã được rebuild trước khi dùng nhãn `ops-*`. Nếu deploy fail trước bước build → sidecar cũ trả `usage` exit 2 → workflow dừng ở *Backup DB*, chưa ghi DB (fail an toàn, đã ghi ở `db.md:108-109`).
8. **Docs khớp code:** `db.md:98-109` (bảng 3 vòng), `:118`; `cutover-content-db.md:22,38`; `ai-news.md:80`; comment `content-ops.yml:8`; header `backup.sh:3-9`. Grep `pre-migrate-ops` ngoài `.context/tasks/spec/changes` chỉ còn ở 4 file này, đều với nghĩa legacy. Log `OK db → ops-backup-…dump` khớp `backup.sh:96`.

## Bug repro closure
- Repro Verification status **PASS**: harness tự động (pg_dump/pg_restore giả, `BACKUP_KEEP=2`, mtime cố định, chạy cả `sh` + `dash`); HEAD tái hiện bug (T1: backup ops xoá `pre-migrate-aaaa…`; T4: deploy xoá legacy ops), sau fix 13/13 PASS. Trace tĩnh của reviewer khớp kết quả từng case.
- Xác nhận trên VPS (sau deploy) là bước user, đã ghi trong Verification plan.

## Responsive Checklist Gate
N/A — diff không đụng UI.

## Skill gates
- aislop: N/A — không có code TS/JS (shell + YAML + md).
- oxlint (anti-slop): N/A — không đụng TS/JS.
- ocr (open-code-review): skip, ocr không thuộc phạm vi diff shell; không chặn PASS.
- AI-readable: OK — hàm `rotate` 14 dòng, chữ ký có comment ví dụ; comment giải thích WHY (legacy, CR-033); 0 indicator.
- ai-friendly-web: N/A — không public-facing.
- blitzstrike: N/A — không phải auth/API public.
- Surgical diff (karpathy): OK — mọi dòng trace về CR-033; không đổi `deploy.yml`, `backup-loop.sh`, `restore-check.sh`, `migrate-on-restore.sh`, `docker-compose.yml`, `Dockerfile.backup`.

## Findings
- [CRITICAL] — không có.
- [MAJOR] — không có.
- [MINOR] `deploy/db/backup.sh:22-28` — nhãn id rỗng (`ops-` → `ops-.dump`) và nhãn `pre-migrate-ops` (không có `-` cuối → rơi vào vòng deploy) vẫn được chấp nhận. Hành vi tương tự HEAD (`pre-migrate-` cũng lọt), không caller nào sinh nhãn như vậy. Đề xuất (tuỳ chọn, task sau): yêu cầu ≥1 ký tự sau tiền tố. Không chặn PASS.
- [MINOR] `deploy/db/backup.sh:47-49` — `exclude`, `n`, `pattern` là biến toàn cục (sh không có `local` POSIX); hiện không trùng tên biến khác trong script. Không cần sửa.

## Residual risk
- Reviewer không tự chạy lại `sh -n`/harness do permission deny; dựa trên evidence Builder + trace tĩnh. Môi trường Builder là Git Bash sh + dash, không phải busybox ash thật → khác biệt nhỏ còn lại chỉ xác nhận được trên VPS (bước user: Content ops `backup` → không có dòng `rotate: xoá pre-migrate-<sha>…`).
- `npm run build` chưa PASS trên máy local (lỗi môi trường) — gate auto-push của primary cần build Linux PASS trước khi push.
- Legacy `pre-migrate-ops-*` chỉ rơi khi có backup ops mới; nếu không chạy ops nữa chúng nằm lại vĩnh viễn (đã được user chấp nhận, ~180 KB/file).

## Verdict
✅ PASS
