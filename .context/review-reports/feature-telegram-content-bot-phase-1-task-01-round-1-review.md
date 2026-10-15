Agent: reviewer

# Review — CR-030 feature-telegram-content-bot phase-1-task-01 round-1

- Scope: `git diff -- tools/db` → `tools/db/content-cli.ts`, `tools/db/content-cli.test.ts` (chưa commit, nhánh main). Bỏ qua docs/content-bot, spec/changes theo yêu cầu.
- Task file `tasks/feature-telegram-content-bot/*.md`: chưa có trên đĩa → review theo brief của primary (mục tiêu + checklist).

## Review level
STRICT

## Reason
Write-path vào DB prod (bot Telegram gọi `db:cli create/update/delete --confirm-prod` trên VPS) → risk đỏ: data loss / ghi DB prod, guard prod, audit actor.

## Blast radius
- `tools/db/content-cli.ts` (CLI bảo trì, dùng bởi người vận hành + workflow ai-news `publish-post` + bot CR-030 sắp tới).
- Đổi chung: `COMMAND_SCOPED_FLAGS` (actor/note mở rộng), `isWriteCommand`, `printWriteResult` (rollback dùng lại, output giữ nguyên format `[rollback] OK — ...`).
- Không đổi `src/db/content-repo.ts`, không SQL mới, không schema/migration, không đổi API web.

## Verify commands + result
- `npm run typecheck` → PASS (tsc --noEmit, 0 lỗi)
- `npm run lint` → PASS (0 error, 1 warning có sẵn ở `src/components/mdx/index.tsx:25`, ngoài scope)
- `npm test` → PASS (113 tests, 111 pass, 0 fail, 2 skipped do thiếu TEST_DATABASE_URL — có sẵn)

## Checklist theo brief
| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Guard `--confirm-prod` phủ đủ lệnh ghi | OK | `content-cli.ts:284-289`: `isWriteCommand` gồm rollback/create/update/delete/upload + publish-post khi không dry-run; chạy TRƯỚC `getDb()` |
| Cờ scope đúng, dry-run không lọt sang lệnh ghi | OK | `COMMAND_SCOPED_FLAGS` `dry-run: ["publish-post"]`; `file` chỉ create/update; `confirm-public-url-change` chỉ delete; test `content-cli.test.ts` dòng 16-40 |
| stdin đọc đúng | OK | `readStdin()` đọc hết `process.stdin` (async iterator) → utf8; test truyền `input` qua spawnSync, JSON hỏng / key lạ / data không object đều exit 2 |
| Hình dạng `--file` | OK | key lạ → UsageError (kể cả `__proto__` vì `Object.keys` trên kết quả JSON.parse); `data` phải plain object; `body` string/null; `sortOrder` integer/null |
| update thiếu body/sortOrder = giữ nguyên | OK | CLI truyền `undefined`; `content-repo.ts:296-297` `=== undefined ? current.* : input.*` |
| Chỉ dùng createEntry/updateEntry/softDeleteEntry | OK | không có SQL mới trong diff |
| Map exit code | OK | UsageError/parseArgs → 2; Conflict/Validation/NotFound → 1; lỗi khác → 1 (handler cuối) |
| update/delete bản ghi xoá mềm bị từ chối | OK | `resolveLiveEntry` (`content-cli.ts:86-90`) + repo tự chặn trong transaction (`content-repo.ts:293`, `:329`) → không TOCTOU |
| Không lộ secret trong log | OK | không in DATABASE_URL/REVALIDATE_SECRET; lỗi chỉ in path `--file` + message JSON.parse/repo |
| Thứ tự kiểm trước DB | OK | create: target + payload kiểm trước khi gọi repo; update: expected-version + payload trước `resolveLiveEntry`; delete: expected-version trước DB |

## Responsive Checklist Gate
N/A — diff không đụng UI.

## Skill gates
- aislop: skip — không chạy trong phiên này (CLI không có sẵn trong repo); đọc tay: không có dead code / swallowed error / `as any`; 2 cast `as string | null | undefined` ở `content-cli.ts:132` đã được kiểm kiểu ngay phía trên → chấp nhận.
- oxlint (anti-slop): skip, oxlint not configured.
- ocr (open-code-review): skip, ocr not installed.
- AI-readable: OK — tên rõ (`readPayload`, `resolveLiveEntry`, `writeOptions`), hàm < 50 dòng; file 333 dòng (>300) nhưng file đã ~240 dòng trước task, phần thêm cô đặc, chưa đủ 3 indicators. Header file có cập nhật usage cho 3 lệnh mới.
- ai-friendly-web: N/A (CLI nội bộ).
- blitzstrike: N/A (không có endpoint mới).

## Findings
- [MINOR] Thiếu test hồi quy cho guard prod với lệnh mới — `tools/db/content-cli.test.ts`. Logic đúng khi đọc code nhưng đây là gate quan trọng nhất của write-path bot. Đề xuất thêm 1 test: `DATABASE_URL=postgres://x@nta-db:5432/nta_web` cho `create`/`update`/`delete` không `--confirm-prod` → exit 2 + match `/lệnh ghi cần cờ --confirm-prod/` (runCli cần nhận env override). Nên thêm trước khi bot chạy prod.
- [MINOR] `--expected-version` / `--to` không nằm trong `COMMAND_SCOPED_FLAGS` → `create ... --expected-version 5` hoặc `update ... --to 3` bị lờ đi lặng lẽ (`content-cli.ts:260-266`). Không gây ghi sai, nhưng trái tinh thần "từ chối thay vì lờ". Đề xuất: `"expected-version": ["rollback","update","delete"]`, `to: ["rollback"]`.
- [MINOR] `--actor ""` được chấp nhận → audit `updated_by`/`content_versions.actor` rỗng (`content-cli.ts:136`; repo không kiểm actor). Đề xuất từ chối actor rỗng/toàn khoảng trắng (UsageError).
- [MINOR] Conflict (optimistic lock) và lỗi validate cùng exit 1 → bot phải parse stderr để phân biệt "reload rồi thử lại" với "dữ liệu sai". Không phải lỗi so với brief; ghi nhận để chốt contract với bot (vd exit 3 cho ContentConflictError) nếu phase sau cần.

## Residual risk
- Không có TEST_DATABASE_URL → đường ghi thật create/update/delete qua CLI chưa được chạy end-to-end (repo functions đã có test riêng khi có DB). Test CLI chỉ chứng minh qua bước kiểm cờ (exit 1 do lỗi kết nối).

## Verdict
✅ PASS (không CRITICAL/MAJOR; 4 MINOR đề xuất xử lý, ưu tiên MINOR #1 trước khi bot chạy prod)
