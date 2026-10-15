# Review — feature-ai-news-naming-images · phase-1-task-03 · round 2

Agent: reviewer

- **Review level:** STRICT
- **Reason:** runbook thao tác ghi DB prod (`update` thay toàn bộ `data`, `--confirm-prod`, rollback), xử lý secret.
- **Blast radius:** `post/{vi,en}/ai-weekly-2026-w42` (DB prod khi user chạy runbook §9), thẻ bài /blog, /en/blog, trang chủ, bài liên quan.
- **Scope round 2:** chỉ `docs/runbook/ai-news.md` §9 (+ Verification summary trong task file). Seed `src/content/blog/{vi,en}/ai-weekly-2026-w42.mdx` không đổi so với round 1 (vẫn đúng 3 dòng/locale — đã đạt).
- Bỏ qua theo chỉ định: `spec/changes/BACKLOG.md`, `spec/changes/2026-10-15-contact-form-email-only.md`.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `git diff --stat` / `git diff docs/runbook/ai-news.md` | chỉ thêm §9 (143 dòng); seed vẫn 6 dòng đổi (3/locale) |
| `bash -n` trên các khối §9 | không chạy được (permission reviewer chỉ allow verify/git read) — kiểm cú pháp bằng đọc tay; builder ghi `bash -n` PASS |
| npm test / typecheck / lint / build | không chạy lại — diff round 2 chỉ là doc; kết quả round 1 giữ nguyên (không fail mới) |

## Kiểm từng finding round 1
| Finding | Trạng thái | Bằng chứng |
|---|---|---|
| **M1** dán khối / stdin | **Đã xử lý** | §9 tách khối 0–7, ghi rõ "dán/chạy TỪNG KHỐI MỘT". Secret gom 1 dòng `read -rsp … ; echo; …; printf … > "$ENVF"; unset PW RS` → cả dòng được parse trước khi chạy, `read` lấy từ terminal, không nuốt code; có prompt. Mọi `cli` không đọc file (`show`, `history`, `revalidate`, `rollback`) + `git log`, `docker exec`, `build` có `</dev/null`. `cli update … --file - … < record.json` giữ redirect file (hàm `cli` kế thừa stdin của lời gọi) → `</dev/null` không phá lệnh đọc stdin. `merge` dùng `docker run -i … < show.json > record.json` — đúng. Khối 6 là 1 lệnh ghép `if…fi` → bash đọc trọn trước khi chạy. |
| **M2** backup không chặn update | **Đã xử lý** | `deploy/db/backup.sh` `set -eu`, `fail()` → `exit 1`, label sai → `exit 2`, trùng tên → FAILED exit 1 → `docker exec … && BACKUP_OK=1` phản ánh đúng. Khối 3 reset `BACKUP_OK=0` mỗi lần chạy. Khối 6: `[ "$BACKUP_OK" = 1 ] && is_num "$VI_N" && is_num "$EN_N" && [ -s vi.record.json ] && [ -s en.record.json ]` → mới ghi; `is_num` (`case ''|*[!0-9]*`) loại rỗng/không phải số; show lỗi → file rỗng → `sed` rỗng → chặn; JSON.parse lỗi / `deletedAt` → node throw, stdout rỗng → `-s` chặn. en chỉ ghi khi vi thành công (`&&`). |
| **L1** trap | **Đã xử lý, không xoá sai lúc** | `trap '…' EXIT HUP TERM` đặt ở shell tương tác: chỉ chạy khi shell thoát/HUP/TERM; hàm `cli`/`merge` chạy trong shell hiện tại (không kích EXIT); `$(…)` là subshell nên trap bị reset (bash), không xoá `$WORK` giữa chừng. Không bẫy INT → Ctrl-C không xoá. `ENVF` nằm trong `$WORK` → `rm -rf "$WORK"` dọn đủ. Dòng Dọn gỡ trap (`trap - EXIT HUP TERM`). Sau HUP handler chạy, shell mất tty → tự thoát, EXIT chạy lại vô hại (shred/rm file đã mất). |
| **L2** image cũ | **Đã xử lý** | Khối 2 in `docker image inspect -f {{.Created}}` + `git log -1`; tuỳ chọn `docker compose --env-file "$ENVF" --profile tools build nta-tools` khớp `content-ops.yml:89` / `ai-news.yml:177` (`--profile tools build nta-tools`); `--env-file` cần thiết vì `docker-compose.yml:38/39/134/136` dùng `${POSTGRES_PASSWORD:?}`/`${REVALIDATE_SECRET:?}` (biến CONTACT_FORM_* cho phép trống; `run --no-deps` không tạo lại nta-web). |

## Kiểm thêm (không tạo lỗi mới)
- Cú pháp sh (đọc tay): continuation `\` + dòng bắt đầu `&&` hợp lệ; JS trong `'…'` không chứa `'`, `${k}`/backtick không bị shell nội suy; `node -e '…' a b c` → `process.argv.slice(1)` = `[a,b,c]`; `sed` regex `^  "version": N,*$` chỉ bắt key top-level; `-T` → không CR trong output.
- Rollback `--to N --expected-version N+1 --note --confirm-prod` không cần stdin (`content-cli.ts:192-199, 270-272`) → `</dev/null` an toàn; không kèm `--actor` (đúng `COMMAND_SCOPED_FLAGS`).
- Curl kiểm web: port `127.0.0.1:${HOST_PORT:-3005}` khớp `docker-compose.yml:31`; hash ảnh vẫn xuất hiện kể cả khi qua `/_next/image?url=…`.
- Secret: không echo, không trên dòng lệnh/history, file mode 600 (umask 077) ngoài repo — y hệt `db.md` §1b.

## Findings

### L3 (Low, non-blocking) — Cổng khối 6 không phát hiện `record.json` cũ
Nếu sau `ContentConflictError` user chỉ chạy lại khối 4 rồi nhảy thẳng khối 6 (bỏ khối 5), `record.json` vẫn là data merge từ lần đọc trước nhưng `--expected-version` là số mới → ghi đè thay đổi đồng thời. Runbook đã ghi "chạy lại từ khối 4" (tức 4→5→6) nên rủi ro thấp. Gợi ý (tuỳ chọn): đầu khối 4 thêm `rm -f "$WORK"/*.record.json`, hoặc ghi rõ "khối 4 → 5 → 6".

## Verdict
**PASS** — M1, M2 xử lý đúng; L1, L2 đã bổ sung, không tạo lỗi mới về cú pháp sh, guard, trap, `</dev/null` hay lệnh build image. Seed giữ nguyên (đạt từ round 1). L3 không chặn. Acceptance bước DB prod (chạy runbook trên VPS + smoke) vẫn chờ user — task chỉ đóng hẳn khi user báo chạy OK. Reviewer không commit/push.
