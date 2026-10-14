Agent: reviewer

# Review — feature-content-database · phase-2-task-01 · round 1 (CR-031)

- **Review level:** STRICT
- **Reason:** bulk data import vào DB (sẽ chạy prod ở P4-T01), toàn vẹn nội dung, schema whitelist dùng chung, script shell thao tác DB (restore/drop DB tạm), runbook vận hành secret/DB.
- **Blast radius:** `src/lib/content/load-mdx.ts` → `mdx-files.ts` (mọi loader MDX web: blog/solutions/products/case-studies/about); `src/db/schema.ts` `CONTENT_COLLECTIONS` (whitelist app); mới `tools/db/*` (chỉ chạy tay, không vào image web — `tools/` trong `.dockerignore`); `deploy/db/migrate-on-restore.sh` (VPS, DB tạm `nta_restore_*`); `package.json` scripts/test glob; runbook `docs/runbook/db.md`, `deploy-vps.md`; `.context/decisions.md`.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm test` | PASS — 46 tests, 45 pass, 0 fail, 1 skip (`seed-db.test.ts` cần `TEST_DATABASE_URL`) |
| `npm run typecheck` | PASS (tsconfig include `**/*.ts` → gồm `tools/`) |
| `npm run lint` | PASS — 0 error, 1 warning `<img>` có sẵn ở `src/components/mdx/index.tsx:25` (ngoài diff) |
| Test DB thật (import 2 lần + parity) | Không tự chạy được (reviewer không chạy DB) → dựa evidence Builder (136 chèn / lần 2 chèn 0 / parity PASS / parity bắt lệch) — Residual risk |
| `npm run build` | không chạy (Builder báo `docker build --target builder` PASS 61/61) |

## Trọng điểm
1. **Web render không đổi — OK.** `mdx-files.ts:14-31` giữ nguyên logic cũ (path `src/content/<dir>/<locale>`, lọc `.mdx`, thứ tự `readdir`, `gray-matter`, `{...data, body: content.trim()}`); `assertRequiredFields` y nguyên. `load-mdx.ts` giữ `import 'server-only'` + re-export cùng tên. Không file nào trong `src/` import `tools/`; không có `CONTENT_SOURCE`.
2. **Import chỉ chèn — OK.** `seed-db.ts:33-61`: 1 transaction/bản ghi, `INSERT … ON CONFLICT (collection, slug, locale) DO NOTHING RETURNING id`, chỉ khi có id mới chèn `content_versions` (version 1, op `create`, actor `seed`) — cùng transaction. Không UPDATE/DELETE/TRUNCATE trong `tools/db/*`. Idempotent (skip khi đã có). Guard prod `isProductionDatabaseUrl` (`seed-db.ts:18-27`) fail-closed: URL không parse được / host `nta-db` / db `nta_web` / host không loopback → cần `--confirm-prod`; cờ lạ bị từ chối (`import-seed.ts:15-19`). Không log `DATABASE_URL`; lỗi chỉ in `error.message`.
3. **file-source — OK.** Đủ 14 collection seed × vi/en, dùng chính hằng/loader web; MDX slug = tên file (about → `about`), `data` = frontmatter, `body` = trim như loader; `sort_order`: slug_registry = index trong mảng `slug.ts` theo nhóm, collection object = thứ tự key, MDX = null. `toJsonObject` chặn giá trị không phải JSON thuần. Test xác nhận số lượng + thứ tự registry.
4. **Parity — OK.** `compareRecords` bắt thiếu/thừa/lệch; `isDeepStrictEqual` không phụ thuộc thứ tự key của object; `firstDifference` in đường dẫn field. `parity.ts` exit 1 khi có issue, 2 khi thiếu env, 1 khi exception. I-1..I-5 khớp `08-data-model.md §4`; I-6 một phần (xem MINOR-3).
5. **migrate-on-restore.sh — OK.** Kiểm tên DB tạm (chỉ `a-z0-9_`, tiền tố `nta_restore_`) trước khi tạo gì; `trap cleanup EXIT` đặt trước restore → lỗi ở restore/build/migrate vẫn `dropdb` DB tạm; mật khẩu lấy từ env container, truyền qua `-e DATABASE_URL` (không lộ trong `ps`), không echo; biến đều quote; `set -eu`. Không ghi `nta_web` (restore-check chỉ SELECT count trên `nta_web`).
6. **Runbook — OK.** Tên khớp `docker-compose.yml`: container `nta-db`/`nta-db-backup`/`nta-web`, user `nta`, db `nta_web`, mount `/backups`, `/scripts/*.sh`; `psql -U nta` qua socket trong image postgres chính thức (local trust). §1b: `umask 077` + `mktemp` (600) ngoài repo, `read -rs`, `shred -u || rm -f`. §4b bỏ `stop nta-db-backup` (cần sidecar chạy để `exec`) và thay bằng tránh khung 19:50–20:30 UTC — hợp lý.
7. **Test — có ý nghĩa:** test thuần cho mapping/thứ tự/compare/invariant/guard prod chạy luôn; test DB tự skip khi không có `TEST_DATABASE_URL` và từ chối URL prod.
8. **Scope — OK.** Không đổi dữ liệu loader trả về, không thêm `CONTENT_SOURCE`, không migration (whitelist collection không có CHECK).

## Skill gates
- aislop: skip — không chạy `npx` tải gói mới (cần quyền tải); code đọc tay không thấy narrative comment/dead code/swallowed error (catch duy nhất ở `seed-db.ts:22` trả `true` = fail-closed có chủ đích).
- oxlint (anti-slop): skip, oxlint not configured (lint dùng eslint — PASS).
- ocr: skip, ocr not installed.
- AI-readable: OK — file ≤180 dòng, hàm ≤50 dòng, tên rõ, quyết định ghi ở `decisions.md` + runbook §8; 0 indicator.
- ai-friendly-web: N/A (không public-facing).
- Responsive Checklist Gate: N/A (không đụng UI).
- blitzstrike: N/A.

## Findings
Không có CRITICAL/MAJOR.

- **[MINOR-1] `deploy/db/migrate-on-restore.sh:35`** — chỉ `trap cleanup EXIT`. Trên VPS `sh` thường là dash: Ctrl-C/SIGTERM giết script **không** chạy EXIT trap → DB tạm (bản sao dữ liệu prod) còn lại tới lần chạy sau (restore-check `dropdb` trước khi tạo). Đề xuất: `trap 'exit 130' INT TERM HUP` bên cạnh `trap cleanup EXIT`, hoặc ghi runbook §5b "lỡ huỷ giữa chừng → `docker exec nta-db dropdb -U nta nta_restore_migtest`".
- **[MINOR-2] `docs/runbook/db.md` §1b + `docs/runbook/deploy-vps.md:37,118`** — file env tạm chỉ có `POSTGRES_PASSWORD`/`REVALIDATE_SECRET`; `docker compose --env-file "$ENVF" up -d --build` sẽ recreate `nta-web` với `CONTACT_FORM_TARGET` rỗng trong khi CI truyền secret này (`.github/workflows/deploy.yml:22`). Hiện OQ#4 để trống nên chưa ảnh hưởng; đề xuất thêm dòng tuỳ chọn `CONTACT_FORM_TARGET=` vào `$ENVF` (pattern có sẵn từ trước, không do task này tạo).
- **[MINOR-3] `tools/db/parity-check.ts:69-89`** — I-6 chỉ kiểm collection/locale/blog category/solution category; enum icon/theme chưa kiểm (Builder đã khai báo). I-3 chỉ một chiều (file → registry); slug trong registry thiếu file không bị báo. Theo định nghĩa §4 vẫn đạt; đề xuất bổ sung ở P2-T02/P3 khi có validator schema.
- **[MINOR-4] `docs/runbook/db.md` §8** — ví dụ `DATABASE_URL=... npm run db:import-seed` đặt mật khẩu trên dòng lệnh (lộ shell history) nếu dùng ở VPS/P4. Đề xuất ghi chú P4-T01 dùng `read -rs` / env file tạm như §1b.
- **[MINOR-5] `tools/db/seed-db.test.ts:40`** — `>= records.length` cho số version seed là kiểm yếu (không bắt chèn version thừa); có thể so `=` khi DB test rỗng. Không chặn.

## Residual risk
- Không tự chạy import/parity trên Postgres thật và `migrate-on-restore.sh` (ngoài quyền reviewer) — dựa evidence Builder trong task file.
- `tools/` bị `.dockerignore` → P4-T01 cần cách chạy import/parity trên VPS (Builder đã ghi).
- Ghi chú quy trình: reviewer đã lỡ dùng 1 lệnh bash `sed` để đọc định nghĩa agent (ngoài allowlist bash); không ảnh hưởng source, các lần đọc sau dùng Read/Grep.

## Verdict
✅ **PASS** — không còn CRITICAL/MAJOR; 5 MINOR không chặn (đề xuất xử lý ở task sau hoặc khi tiện).
