Agent: reviewer

# Review — feature-content-database · phase-1-task-02 · round 2 (CR-031)

- **Review level:** STRICT
- **Reason:** DB/migration gate, backup/restore (data-loss), secret, CI deploy VPS dùng chung. Round 2 sau FAIL round 1 (MAJOR-1 + MINOR-2..6).
- **Blast radius:** như round 1 — `docker-compose.yml`, `Dockerfile` (stage `migrator`), `.github/workflows/deploy.yml`, `deploy/db/**`,
  `package.json` (script test), `docs/runbook/db.md`, `docs/runbook/deploy-vps.md`, `.context/decisions.md`. Không đụng `src/`.
  Phần sửa round 2: `deploy.yml:44`, `backup.sh`, `migration-gate.ts` (+test), `restore-check.sh`, 2 runbook.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm test` | PASS 39/39 (thêm 7 test: `'--'` trong chuỗi, DO `$$`/`$tag$`, WITH…DELETE/UPDATE, INSERT…SELECT, CREATE FUNCTION) |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — 0 error, 1 warning `<img>` có sẵn (ngoài scope) |
| `docker compose config --quiet` | skip — ngoài allowlist reviewer → residual risk (Builder báo PASS cả `--profile tools`) |
| `git status --short`, `git diff` | đã đọc lại toàn bộ diff hiện tại |

## Skill gates
- aislop: skip (không chạy npx tải package) · oxlint: skip, not configured · ocr: skip, not installed
- AI-readable: OK (gate 118 dòng, hàm < 50 dòng, comment nêu WHY) · ai-friendly-web: N/A · blitzstrike: N/A · Responsive: N/A (không đụng UI)

## Xác nhận fix round 1
| Finding | Trạng thái | Bằng chứng |
|---|---|---|
| MAJOR-1 ghi đè pre-migrate | **Fixed** | `deploy.yml:44` label `pre-migrate-<sha12>-<run_id>-<run_attempt>` (khớp whitelist `[A-Za-z0-9._-]`); `backup.sh:63-65,78` `refuse_existing` FAILED trước khi dump; `backup.sh:55-61,82,91` `mv -n` + kiểm lại file tạm → không ghi đè kể cả race. Rotate vẫn đúng pattern `pre-migrate-*.dump` trong `$BACKUP_DIR`. |
| MINOR-2 `--` trong chuỗi | **Fixed** | `migration-gate.ts:54-62` một regex alternation quét trái→phải (chuỗi `''`, dollar-quote `$tag$…$tag$` với backreference, `--`, `/* */`); test dòng 40-46. |
| MINOR-3 DO/CTE/backfill | **Fixed** | `migration-gate.ts:44-48` rule fail-closed DO/FUNCTION/PROCEDURE/COPY/CALL, `WITH`, `$$`, `INSERT … SELECT`; dollar-quote được thay bằng `$$` nên rule vẫn thấy. 0000 vẫn pass (test dòng 100). |
| MINOR-4 restore-check guard | **Fixed** | `restore-check.sh:11-16` chặn `nta_web|postgres|template0|template1`, bắt buộc tiền tố `nta_restore_?*`, ký tự a-z0-9_. |
| MINOR-5 runbook export secret | **Fixed** | `deploy-vps.md` §5 cảnh báo + `--env-file` ngoài repo 600; §6-§7 dùng `docker ps/logs` cho lệnh chỉ đọc. |
| MINOR-6 `--remove-orphans` khi rollback | **Fixed (doc)** | `deploy-vps.md` §5 nêu rõ hậu quả + khuyến nghị `git revert` + cách khôi phục service. |

## Kiểm regression
- Gate: `.find` theo thứ tự — rule cũ đứng trước rule fail-closed nên nhãn finding cũ không đổi; `$1` (tham số) không khớp dollar-quote (tag phải bắt đầu chữ/_);
  dollar-quote không đóng → còn `$$` → fail-closed. `INSERT … VALUES ((SELECT …))` cũng bị gắn cờ — bảo thủ, chấp nhận được. Marker duyệt đọc trên SQL gốc, không bị strip ảnh hưởng.
- Backup: daily vẫn chạy (STAMP tới giây nên `refuse_existing` không chặn nhầm lịch daily); tar uploads lỗi sau khi DB dump đã publish → exit 1 nhưng dump DB còn nguyên. Pre-migrate thất bại → exit 1 → deploy dừng trước gate/migrate.
- Workflow: thứ tự backup → gate → migrate → web giữ nguyên; không có push/reset/seed; secret không echo.
- Runbook nhãn tay (`pre-migrate-before-restore-<UTC phút>`, `pre-migrate-manual-…`) vẫn hợp lệ; chạy 2 lần trong cùng phút → FAILED "đã tồn tại" (an toàn, chỉ cần chờ phút sau — runbook thông điệp đã gợi ý).

## Findings
- [CRITICAL] none · [MAJOR] none
- [MINOR-7] (không chặn) `deploy/db/migration-gate.ts:54` — tokenizer chưa xử lý identifier trong ngoặc kép (`"a--b"`, `"it's"`). Kịch bản lọt phải tự đặt tên cột chứa `--`/`'`; drizzle-kit sinh tên snake_case nên gần như không xảy ra, và phần lớn trường hợp vẫn bị rule `ALTER TABLE … DROP` bắt do statement bị gộp. Đề xuất (tuỳ chọn) thêm `"(?:[^"]|"")*"` vào `LEXICAL_TOKEN` (giữ nguyên token).

## Residual risk
- `docker compose config` chưa tự chạy (ngoài quyền) — dựa evidence Builder + đọc tay.
- Chưa chạy trên VPS thật (quyền thư mục host, `--wait`, dung lượng đĩa). Không backup off-site, không staging DB (user chấp nhận).
- Gate regex là lưới an toàn; review migration vẫn phải đọc từng file SQL.

## Verdict
✅ **PASS** — MAJOR-1 và MINOR-2..6 round 1 đã sửa có test/bằng chứng; không phát hiện regression; còn 1 MINOR tuỳ chọn.
