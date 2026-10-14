Agent: reviewer

# Review — feature-content-database · phase-2-task-02 · round 1 (CR-031)

- **Review level:** STRICT
- **Reason:** đụng DB/schema/migration (0001), write-path ghi dữ liệu prod + lịch sử version, rollback, CLI có lệnh ghi trên prod, quy tắc dùng chung với parity.
- **Blast radius:** bảng `content_versions` (thêm cột nullable), `src/db/content-repo.ts` + `src/db/content-rules.ts` (mới, nền cho bot CR-030), `tools/db/parity-check.ts` (đổi sang content-rules), `tools/db/seed-db.ts` (ghi sort_order), CLI mới `tools/db/content-cli.ts`, `deploy/db/migrate-on-restore.sh` (trap), runbook. Web/loader: KHÔNG đổi — không file nào trong `src/app`/`src/lib`/`src/components` import `src/db/*` (Grep `db/content-(repo|rules)|src/db` trong `src/` chỉ khớp comment trong chính 2 file mới).

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm test` (không TEST_DATABASE_URL) | PASS — 55 tests, 54 pass, 0 fail, 1 skipped (suite `content-repo (Postgres)` skip có lý do rõ; `import seed…` skip rõ) |
| `npm run typecheck` | PASS (tsc --noEmit, 0 lỗi) |
| `npm run lint` | PASS — 0 error, 1 warning có sẵn (`src/components/mdx/index.tsx:25` no-img-element, ngoài diff) |
| `npm run build` (local Windows) | FAIL môi trường: `Failed to load next.config.ts … Failed to load native binding` (SWC native binding không tải được trên máy này) — không liên quan diff; xem Residual risk |
| DB tests (TEST_DATABASE_URL) | không chạy được trong quyền reviewer (không dựng Postgres) — dựa vào Builder report 62/62 + đọc test |

## Trọng điểm
1. **Migration 0001** — `drizzle/0001_aromatic_rattler.sql` = đúng 1 câu `ALTER TABLE "content_versions" ADD COLUMN "sort_order" integer;` (nullable, không default → không rewrite bảng). `0001_snapshot.json` so với 0000: chỉ đổi id/prevId (prevId = id 0000) + cột `sort_order` notNull false — nhất quán, đúng dạng drizzle-kit sinh. `_journal.json` idx 1, tag khớp tên file. `deploy/db/migration-gate.test.ts` đọc file thật → findings [], blocked false, approved false (không marker) — PASS. `schema.test.ts` kiểm notNull/hasDefault false. OK.
2. **content-repo** — mỗi hàm ghi bọc `db.transaction`; `lockEntry` dùng `.for("update")` rồi so `expectedVersion` → `ContentConflictError`; validate trước khi ghi (`throwIfInvalid`); `writeNextVersion` UPDATE (version+1) rồi INSERT `content_versions` (op/actor/note/data/body/sort_order lấy từ hàng vừa RETURNING) cùng tx; test "lỗi giữa transaction" chứng minh rollback. Không có UPDATE/DELETE trên `content_versions`. Rollback = snapshot → version mới op `rollback`, khôi phục xoá mềm (`deletedAt: null`) + warning. Truy vấn đều qua query builder; JSONB `->>'path' = ${imagePath}` là tham số `sql` template (không injection). Không log URL/secret. Không `server-only`, và không route web nào import → không vào client bundle.
3. **I-1..I-8** — `checkRecord` (whitelist, locale, slug pattern, I-2, required fields qua `assertRequiredFields` của loader, I-6 category/group/icon), I-3/I-4 hai chiều (`registryProblem`, `registryTargetCollection`), I-5 báo rõ khi trùng khoá (kể cả bản xoá mềm), I-7 public/ hoặc asset `/uploads` còn sống + chặn `..`, I-8 cờ `confirmPublicUrlChange` + warning 301; `updateEntry` không nhận slug/collection/locale (khoá bất biến) và I-2 chặn đổi `data.slug` ở collection public. Parity dùng cùng `checkRecord` → không lệch; test `REQUIRED_FIELDS khớp loader` đọc mã loader để bắt lệch.
4. **CLI** — `rollback` trên URL prod (`isProductionDatabaseUrl`, dùng lại từ seed-db) bị từ chối exit 2 nếu thiếu `--confirm-prod`; list/show/history chỉ đọc. Không in DATABASE_URL; lỗi lạ chỉ in `error.message`. Tham số sai → exit 2; conflict/validation/not-found → exit 1.
5. **Test** — content-rules test luôn chạy (gồm quét toàn bộ nội dung file hiện tại không báo nhầm + ảnh tồn tại); content-repo test skip rõ khi thiếu TEST_DATABASE_URL, từ chối URL prod, tự tạo/xoá DB riêng; các case có ý nghĩa (version tăng, rollback snapshot kể cả sort_order, 2 ghi đồng thời đúng 1 thành công, xoá mềm ẩn khỏi đọc còn lịch sử, validate không ghi gì, lỗi giữa tx). seed-db test siết `>=` → `=` + so sort_order.
6. **Runbook/script** — §8/§9 dùng `read -rs` thay URL trên dòng lệnh, `unset` sau dùng. `migrate-on-restore.sh` (`#!/bin/sh`, `set -eu`): `trap cleanup EXIT` + `trap 'exit 130|143|129' INT|TERM|HUP` → tín hiệu chuyển thành exit nên EXIT trap chạy, DB tạm được xoá. Đúng.
7. **Scope / build** — không đổi web/loader. File mới trong `src/db` chỉ được `tsc` (next build type-check) đọc; không route/layout nào import nên không vào trace/prerender. Thay đổi `schema.ts` chỉ thêm cột, web chưa đọc DB. → Diff **không thể** gây lỗi prerender "Server Components render"; khớp kết luận change-request (HEAD sạch e202ffc cũng FAIL ngẫu nhiên, `docker compose build nta-web` trên working tree PASS 61/61).

## Skill gates
- aislop: skip — `aislop: command not found` (chưa cài).
- oxlint (anti-slop): skip, oxlint not configured (repo dùng eslint; eslint PASS 0 error).
- ocr (open-code-review): skip, ocr not installed.
- AI-readable: OK — 1 indicator (file `src/db/content-repo.ts` 404 dòng > 300); tên rõ, hàm ≤50 dòng, comment nêu WHY, decisions/runbook cập nhật. < 3 indicators.
- ai-friendly-web: N/A (không public-facing).
- blitzstrike: N/A (không có endpoint/API public; CLI nội bộ).
- Responsive Checklist Gate: N/A (diff không đụng UI).

## Findings
Không có CRITICAL / MAJOR.

- **[MINOR-1]** `docs/runbook/db.md` (§8, dòng "Test có DB") ghi `src/db/content-repo.test.ts` — file thật ở `tools/db/content-repo.test.ts`. Sửa đường dẫn trong runbook.
- **[MINOR-2]** `src/db/content-repo.ts` 404 dòng (> 300 theo quy ước). Đề xuất tách phần đọc (`getEntry`, `getEntryByKey`, `listEntries`, `listVersions`, dòng 351–403) sang `src/db/content-read.ts` ở task sau.
- **[MINOR-3]** `src/db/content-repo.ts:153-167` + `:303-306` — kiểm I-3 chéo bản ghi đọc hàng khác KHÔNG khoá (READ COMMITTED): `createEntry(solution)` và `softDeleteEntry(slug_registry)` chạy đồng thời có thể cùng qua kiểm → solution sống không có registry. Thêm: `updateEntry` đổi `group` của registry enterprise→product chỉ kiểm target mới, không phát hiện solution cũ mất registry. Rủi ro thấp (1 bot/CLI), parity vẫn bắt sau. Đề xuất: `FOR UPDATE`/`FOR SHARE` hàng registry/nội dung liên quan, và chặn đổi `group` khi target cũ còn sống.
- **[MINOR-4]** `src/db/content-repo.ts:259-270` — 2 `createEntry` đồng thời cùng khoá: cả hai qua SELECT tồn tại, cái sau ném lỗi UNIQUE thô của pg (không phải `ContentValidationError` I-5). Dữ liệu vẫn đúng (tx huỷ); chỉ thông điệp kém. Đề xuất bắt mã lỗi `23505` → `ContentValidationError`.
- **[MINOR-5]** `src/db/content-repo.ts:133` — chặn traversal chỉ tách theo `/`; đường dẫn có `\..\` (Windows) lọt qua `path.join` — chỉ là oracle tồn tại file, prod chạy Linux nên không ảnh hưởng. Đề xuất kiểm `path.resolve(...)` nằm trong `publicDir`.

## Residual risk
- DB tests (7 case content-repo + seed-db) không được reviewer tự chạy (không có quyền dựng Postgres) — dựa vào Builder report + đọc test.
- `npm run build` local lỗi native binding SWC (môi trường Windows); build Docker builder-stage flaky có sẵn trên HEAD sạch; `docker compose build nta-web` PASS theo change-request (reviewer không chạy docker — ngoài quyền).
- Trap tín hiệu migrate-on-restore.sh chỉ xác minh bằng đọc mã.
- semgrep / aislop / ocr không có trong môi trường.

## Verdict
✅ PASS (0 CRITICAL, 0 MAJOR, 5 MINOR — không chặn; MINOR-1 nên sửa trước commit vì chỉ là 1 dòng doc).
