# Review — bug-ai-news-write-db · phase-1-task-01 · round 2

Agent: reviewer · Ngày: 2026-10-15 · CR-034 (BUG, risk HIGH)

## Review level
**STRICT**

## Reason
Giữ mức round 1: workflow cron ghi DB prod không người duyệt, secret DB/revalidate, chung concurrency `deploy-nta-web`, CLI ghi dùng chung (`tools/db/content-cli.ts` — dùng bởi Content ops, runbook db.md, bot CR-030 tham chiếu).

## Blast radius (round 2 — phần sửa)
- `docs/runbook/ai-news.md` §2 + §5 (F1, F3).
- `.github/workflows/ai-news.yml:88` bước `target` (F2).
- `tools/db/content-cli.ts:167-182` `COMMAND_SCOPED_FLAGS` + `assertFlagsSupported()` chạy đầu `runCommand` (trước cả `revalidate`) → ảnh hưởng **mọi** lệnh CLI (F5); test mới `tools/db/content-cli.test.ts`.
- Phần còn lại của diff task không đổi so với round 1 (đã soát lại diff `ai-news.yml`, `content-cli.ts`, runbook).

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS (tsc --noEmit, exit 0) |
| `npm run lint` | PASS (0 error; 1 warning có sẵn `src/components/mdx/index.tsx:25`, ngoài task) |
| `npm test` | PASS 100/102, 0 fail, 2 skip. Suite mới `content-cli — cờ theo lệnh` 4/4 PASS. Suite cần DB (`publish-post (Postgres)`, `content-repo (Postgres)`, `saveImage`, `import seed`, parity loader db) **skip — TEST_DATABASE_URL chưa đặt**; reviewer không dựng được Postgres (quyền bash). Không xác minh độc lập phần DB — dựa evidence builder (journal). |
| `npm run build` | không chạy (đã biết FAIL native binding trên Windows; không thuộc phần sửa round 2). |
| aislop / oxlint / ocr | skip — không cấu hình/không cài trong repo. |

## Kiểm từng fix

**F1 — runbook §2 (đăng lại/thay bài): OK.**
- Nêu đúng: xoá/sinh lại file không đổi web; `publish-post` báo `exists` cả với bản xoá mềm, workflow vẫn xanh — khớp `publish-post.ts` (`getEntryByKey(..., {includeDeleted:true})`) và lưới I-5 `content-repo.ts:271-279`.
- `rollback` khôi phục bản xoá mềm: đúng — `rollbackEntry` đặt `deletedAt: null` + cảnh báo "được khôi phục" (`src/db/content-repo.ts:338-360`). Soft-delete ghi version mới (`content-repo.ts:329-332` qua `writeNextVersion`) nên luôn có `--to < current` để quay về.
- Lệnh nêu trong runbook tồn tại với đúng cờ: `history`, `show` (tìm cả bản xoá mềm, `content-cli.ts:62-72`); `rollback <key> --to <N> --expected-version <M> --confirm-prod` — `--to`/`--expected-version` là cờ bắt buộc (`content-cli.ts:96-101`, `parsePositiveInteger`), `--confirm-prod` bắt buộc trên DB prod (`content-cli.ts:189-192`). Runbook không dùng `--note` (tuỳ chọn; vẫn được phép cho rollback sau F5). `revalidate --collection post` hợp lệ.
- "CLI chưa có lệnh update/delete" đúng (danh sách lệnh `content-cli.ts:197-203`). "Không xoá-chèn lại được do khoá giữ bản xoá mềm (I-5)" đúng.

**F2 — `ai-news.yml:88`: OK.** `SLUG: ${{ steps.generate.outputs.slug || steps.check.outputs.slug }}`; khi `skip` thì `generate` không chạy → output rỗng → lấy `check`. Khi `written` lấy slug đã commit (`:72,78`). Không nội suy `${{ }}` vào `run:` (vẫn qua env).

**F3 — runbook §5: OK.** Có *Re-run failed jobs* (giữ output `digest` → đúng slug bất kể tuần), giới hạn "Run workflow mới chỉ tự lành trong cùng tuần ISO", và trường hợp `publish-db` *cancelled* do 1-pending/nhóm `deploy-nta-web` (kèm nhắc kiểm job bị thay chỗ). Bảng lỗi theo từng bước `publish-db` khớp các step thật trong workflow.

**F5 — `content-cli.ts` cờ theo lệnh: OK, không làm hỏng lệnh hiện có.**
- `--dry-run`, `--actor` → chỉ `publish-post`; `--note` → `rollback`, `publish-post`. Kiểm trước khi đòi `DATABASE_URL` và trước nhánh `revalidate` → từ chối (UsageError, exit 2) không chạm DB/HTTP.
- Grep mọi chỗ gọi CLI (`.github/`, `docs/`, `tools/`, `tasks/`, `package.json`):
  - `content-ops.yml:109` `revalidate --all` — không dùng cờ bị giới hạn.
  - `content-ops.yml:115` `upload … --alt-vi --alt-en --confirm-prod` — OK.
  - `ai-news.yml:143` `publish-post "$SLUG" --dry-run`; `:157` `publish-post … --actor workflow:ai-news --confirm-prod`; `:161` `revalidate --collection post` — OK.
  - `docs/runbook/db.md:259-270` (`list --collection/--locale/--deleted`, `show`, `history`, `rollback --to --expected-version [--note]`, `revalidate`) — OK; `--note` chỉ ở rollback.
  - `docs/runbook/ai-news.md`, `cutover-content-db.md`, `tasks/feature-content-database/*` — không có lệnh nào dùng `--note`/`--dry-run`/`--actor` ngoài lệnh được phép.
  → Không lệnh hiện có nào bị từ chối.
- Test `content-cli.test.ts` chạy CLI thật bằng tiến trình con, DATABASE_URL cổng đóng → phân biệt được exit 2 (chặn cờ) với exit 1 (lọt tới DB); có case dương `publish-post --dry-run --note --actor` qua được bước kiểm cờ. Test đúng contract, không false-confidence.

**F4** — cố ý không sửa (2 transaction riêng; chạy lại tự lành, runbook §5 dòng "Chèn bài" nêu rõ). Chấp nhận là residual risk.
**F6–F8** — INFO, ngoài phạm vi (F7 `docs/content-bot/10-server.md` thuộc task bot; F8 spec delta R-09c + Spec Publisher là việc primary sau PASS).

## Findings (round 2)

| # | Severity | file:line | Mô tả | Yêu cầu |
|---|---|---|---|---|
| N1 | INFO | `docs/runbook/ai-news.md` §5 | *Re-run failed jobs* chỉ làm được trong thời hạn GitHub cho phép re-run (30 ngày) và `publish-db` re-run checkout `main` hiện tại (không phải commit cũ) — vẫn đúng vì file bài còn trên main. Không cần sửa; có thể thêm 1 câu khi tiện. | — |
| N2 | INFO | `tools/db/content-cli.ts:167-171` | `COMMAND_SCOPED_FLAGS` không giới hạn `--to`/`--expected-version`/`--alt-*`/`--slug`/`--all` (vẫn bị lờ ở lệnh khác). Không gây ghi ngoài ý muốn (khác `--dry-run`), nên không chặn. | Tuỳ chọn, CR sau. |

Không có finding MEDIUM trở lên. Không thấy regression mới trong diff task.

## Residual risk
- Test DB (`publish-post (Postgres)`, `content-repo (Postgres)`) và `docker build nta-tools` chưa được reviewer chạy độc lập — dựa evidence builder.
- F4: lỗi DB giữa 2 locale để lại 1 locale tới lần chạy lại.
- Chưa chạy thật trên prod — cần `workflow_dispatch` smoke sau push (Verification plan của task) trước lượt cron 19/10/2026.

## Verdict
**PASS** — F1 (chặn) đã sửa đúng và khớp code thật (rollback khôi phục bản xoá mềm; cờ `--to`/`--expected-version`/`--confirm-prod` tồn tại); F2, F3, F5 sửa đúng; F5 không làm hỏng lệnh CLI nào đang dùng; typecheck/lint/test PASS (test DB skip, ghi rõ).
