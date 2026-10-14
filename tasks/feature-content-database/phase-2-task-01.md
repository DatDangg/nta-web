# feature-content-database · phase-2-task-01 — Import seed vi+en (chỉ chèn, idempotent) + parity check

- **CR:** CR-031 · spec R-16, R-16c (4.2.0)
- **Classification / Risk:** ADDITIVE (data import) · HIGH (bulk insert vào DB prod ở phase 4)
  - Expected review level: **STRICT** (bulk data, toàn vẹn nội dung)
  - Blast radius: mới `tools/db/import-seed.ts`, `tools/db/parity.ts`; không sửa web.
  - Doc impact: runbook db (mục import 1 lần).

## Scope
1. Import đọc **bằng chính loader file hiện tại** (`src/lib/content/*`, `src/content/*.ts`) — không parse lại → dữ liệu khớp đúng cái web đang render.
   Mapping theo `docs/content-bot/08-data-model.md` §2: Post/Solution/Product/CaseStudy/About (data = frontmatter, body = MDX source),
   `listingPages/listingItems/listingCtas/listingLabels`, `home`, `solutionOverview`, `slug_registry` (sort_order = thứ tự `slug.ts`),
   **`ui_messages`** (`src/i18n/messages/{vi,en}.json` — 1 bản ghi/locale/namespace cấp 1) và **`company_info`** (`company-info.ts`, vi + en) — quyết định #9.
   Bổ sung các collection mới (`ui_messages`, `company_info`, `asset`) vào whitelist app ở `src/db/schema.ts` (không cần migration vì collection không CHECK).
   Cần tách phần đọc file thành module dùng lại được (vì task 5/6 đổi loader sang DB) — vd `tools/db/file-source.ts`.
2. Mỗi bản ghi: chèn `content_entries` (version 1) + `content_versions` (op `create`, actor `seed`) trong transaction;
   `ON CONFLICT DO NOTHING` — **không ghi đè, không xoá, không TRUNCATE**. Chạy lại = 0 bản ghi mới. Có `--dry-run`.
3. `tools/db/parity.ts`: deep-equal từng bản ghi DB ↔ file (vi + en), in diff, exit ≠0 nếu lệch. Dùng lại ở task 8.
4. Kiểm I-1..I-6 (`08-data-model.md` §4) sau import.

## Acceptance
- Local: import vào DB rỗng → parity PASS mọi collection/locale; chạy lại → 0 chèn, parity vẫn PASS.
- Script không có lệnh xoá/ghi đè (reviewer kiểm).

## Bổ sung từ spec-validator hết phase 1 (2026-10-15, report `.context/review-reports/feature-content-database-phase-1-spec-validation.md`)
5. **MAJOR-1 runbook secret (sửa TRƯỚC khi có import prod):** `docs/runbook/db.md` + `docs/runbook/deploy-vps.md` ghi rõ: secret chỉ nằm ở GitHub Secrets
   (không đọc lại được) → trên VPS `docker compose ps/exec/run` lỗi thiếu biến là bình thường. Kiểm tra không cần secret: `docker ps --filter name=nta`,
   `docker logs`, `docker exec nta-db psql -U nta -d nta_web ...`, `docker exec nta-db-backup /scripts/backup.sh ...` / `restore-check.sh` (dùng env có sẵn trong container).
   Thao tác bắt buộc compose (hiếm) → hướng dẫn tạo file env tạm ngoài repo quyền 600 từ giá trị user tự giữ, xoá sau khi xong. Viết lại các lệnh runbook theo hướng này và thử local.
6. **MAJOR-2 "thay verify staging" (R-16c):** script/lệnh chạy thử migration trên bản restore: restore backup mới nhất vào `nta_restore_<x>` → chạy gate + migrate
   với `DATABASE_URL` trỏ DB tạm (không đụng `nta_web`) → in kết quả → xoá DB tạm. Ghi vào `db.md` mục HIGH_RISK + test local.
7. Ghi chú (không làm ở task này): MINOR-1 `content_versions` thiếu `sort_order` → P2-T02; MINOR-3 backup bỏ lỡ khi restart quanh giờ chạy → ghi runbook (kiểm `backup.log`, chạy tay).

## Giới hạn lần chạy này (user 2026-10-15)
- Import + parity chỉ chạy trên Postgres local/test. **KHÔNG import vào DB prod** (task phase-4-task-01 cần user xác nhận riêng). `CONTENT_SOURCE` chưa tồn tại/mặc định file.

## Builder report (2026-10-14)

**Files**
- Mới: `tools/db/file-source.ts` (nguồn file → bản ghi), `tools/db/parity-check.ts` (so khớp thuần + I-1..I-6), `tools/db/seed-db.ts` (INSERT/SELECT + chặn prod),
  `tools/db/import-seed.ts`, `tools/db/parity.ts` (CLI), `tools/db/file-source.test.ts` (luôn chạy), `tools/db/seed-db.test.ts` (chỉ khi có `TEST_DATABASE_URL`),
  `src/lib/content/mdx-files.ts` (phần đọc MDX tách khỏi `load-mdx.ts`, không `server-only`), `deploy/db/migrate-on-restore.sh` (MAJOR-2).
- Sửa: `src/lib/content/load-mdx.ts` (giữ `import 'server-only'`, re-export — loader web không đổi), `src/db/schema.ts` (+`ui_messages`, `company_info`, `asset`),
  `src/db/schema.test.ts`, `package.json` (`db:import-seed`, `db:parity`, test glob `tools/**/*.test.ts`; lock không đổi), `docs/runbook/db.md` (§1a/1b không cần secret,
  §3 bỏ lỡ lịch backup, §4/§5 lệnh `docker exec`/`--env-file` tạm, §5b chạy thử migration trên bản restore, §8 import + parity), `docs/runbook/deploy-vps.md`, `.context/decisions.md`.

**Số bản ghi (mỗi locale vi = en):** post 5 · solution 9 · product 2 · case_study 2 · about 1 · listing_page 4 · listing_item 13 · listing_cta 4 · listing_labels 1 ·
home 1 · solution_overview 2 · slug_registry 11 · ui_messages 12 · company_info 1 → 68/locale, **tổng 136**.

**Verify (local, Postgres 16.15 Docker tạm `nta-seedtest-db` 127.0.0.1:55432, DB `nta_seed_test` — đã xoá container/network/volume/image sau):**
- `npm run db:migrate` OK → `db:import-seed -- --dry-run` (136, không ghi) → `db:import-seed` **chèn 136, bỏ qua 0** → `db:parity` **PASS** (exit 0)
  → import lần 2 **chèn 0, bỏ qua 136** → parity vẫn **PASS**. DB: 136 `content_entries`, 136 `content_versions` (actor `seed`, op `create`).
- Parity bắt lệch: sửa tay `solution/en/crm` data.title trên DB test → `lệch data.title: file=... db="X"`, FAIL exit 1; trả lại → PASS.
- Chặn prod: `DATABASE_URL=postgres://nta:x@nta-db:5432/nta_web npm run db:import-seed` → từ chối, exit 2 (không dùng `--confirm-prod`).
- `migrate-on-restore.sh` (sidecar backup test + image migrator build local): dump có dữ liệu → "không có migration chờ", PASS (136/136/1); dump DB rỗng → apply 0000, PASS;
  tên DB không `nta_restore_` → từ chối; image không có → FAIL exit 125 và vẫn xoá DB tạm. Cuối cùng chỉ còn `nta_seed_test`/`postgres`/template.
- Runbook §1b: `docker compose config` không có biến → lỗi "is required" (đúng như mô tả); với `--env-file` tạm (mode 600) → OK.
- `npm test`: 45 pass, 1 skip (test DB, không có `TEST_DATABASE_URL`); với `TEST_DATABASE_URL` → 46 pass, 0 fail.
- `npm run typecheck` PASS · `npm run lint` PASS (1 warning `<img>` có sẵn ở `src/components/mdx/index.tsx`) ·
  build: `docker build --target builder` (next build trong node:22-slim) PASS, 61/61 static pages.
- KHÔNG kết nối/import DB prod. Không commit.

**Rủi ro / ghi chú cho task sau**
- jsonb không giữ thứ tự key trong `data` → P3 không được dựa vào `Object.keys` của data (đã ghi decisions.md).
- `tools/` nằm trong `.dockerignore` → P4-T01 cần cách chạy import/parity trên VPS (vd image riêng hoặc thêm `tools/db` vào stage migrator).
- `slug_registry`/`company_info` ghi giống nhau cho vi và en (nguồn không theo locale).
- I-6 chỉ kiểm enum có danh sách runtime (collection, locale, blog category, solution category); icon/theme là type TS → chưa kiểm.
- `migrate-on-restore.sh` trên Windows/Git Bash cần `MSYS_NO_PATHCONV=1` và `MIGRATE_IMAGE` build sẵn (đường dẫn repo dạng `/d/...`); trên VPS Linux chạy trực tiếp.

## Close-out
- Status: **done** · Acceptance criteria: PASS (Postgres local; KHÔNG import prod — để phase-4-task-01)
- Verify: npm test 45 pass + 1 skip (DB test cần TEST_DATABASE_URL; builder chạy có DB: 46 pass) · typecheck PASS · lint PASS (1 warning có sẵn) · import 136 (68/locale) x2 idempotent + parity PASS · migrate-on-restore PASS · docker build --target builder 61/61
- Reviewer verdict: STRICT **PASS** round 1 — .context/review-reports/feature-content-database-phase-2-task-01-round-1-review.md
- Follow-up (MINOR, làm trước/at phase-4-task-01): (1) migrate-on-restore.sh trap INT/TERM/HUP; (2) env tạm runbook thêm CONTACT_FORM_TARGET; (3) parity I-3 hai chiều + I-6 enum icon/theme; (4) runbook §8 không đặt mật khẩu trên dòng lệnh; (5) seed-db.test kiểm version bằng =. Thêm: tools/ nằm trong .dockerignore → P4 cần cách chạy import/parity trên VPS; jsonb không giữ thứ tự key → phase 3 không dựa Object.keys.
- Migration: none. Doc impact: docs/runbook/db.md, deploy-vps.md, decisions.md.
