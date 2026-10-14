# feature-content-database · phase-1-task-01 — Schema bảng nội dung + lịch sử, Drizzle setup, migration đầu

- **CR:** CR-031 · spec R-16, R-16a, R-16c (4.2.0)
- **Classification / Risk:** ADDITIVE (hạ tầng dữ liệu) · HIGH
  - Expected review level: **STRICT** (DB/schema/migration)
  - Blast radius: file mới (`src/db/**`, `drizzle.config.ts`, `drizzle/**`), `package.json` (deps + script). Web chưa đọc DB.
  - Doc impact: ERD (gộp vào phase-5-task-01).
  - Decision impact: mô hình bảng (document store JSONB) → append `.context/decisions.md`.

## Thiết kế đề xuất (builder được chỉnh nếu có lý do — ghi decisions.md)
"Document store" gọn, khớp mô hình file hiện tại (`docs/content-bot/08-data-model.md`), không tách hàng chục bảng con:
- `content_entries`: `id` PK, `collection` (text **không CHECK ở DB** — validate whitelist ở tầng app, để mở rộng phạm vi sau không cần migration destructive; danh sách hiện tại `post|solution|product|case_study|about|listing_page|listing_item|listing_cta|listing_labels|home|solution_overview|slug_registry`),
  `slug` (text; singleton dùng key cố định vd `about`, `home`), `locale` (CHECK `vi|en`), `data` jsonb (frontmatter / object TS y nguyên),
  `body` text null (MDX source), `sort_order` int null (thay thứ tự mảng `slug.ts`), `version` int ≥1, `deleted_at` timestamptz null (xoá mềm),
  `created_at`, `updated_at`, `updated_by` text.
  UNIQUE (`collection`,`slug`,`locale`); index (`collection`,`locale`) WHERE `deleted_at IS NULL`.
- `content_versions`: `id` PK, `entry_id` FK → content_entries, `version`, `op` (`create|update|delete|rollback`), `data` jsonb, `body` text null,
  `actor` text (`seed`, `cli:<user>`, `bot:<telegram-id>`), `note` text null, `created_at`. UNIQUE (`entry_id`,`version`). Append-only.
- Version ghi ở tầng app trong transaction (phase-2-task-02), không trigger DB — trừ khi builder chứng minh trigger đơn giản hơn.

## Scope
1. Deps: `drizzle-orm`, `pg` (+ `@types/pg`), devDep `drizzle-kit`. Test runner: `node --test` (+ devDep `tsx` nếu cần chạy TS) — script `npm test`;
   cập nhật `test_command: npm test` trong `.context/project-config.md` (ghi lý do). Không thêm lib khác.
2. `src/db/schema.ts`; `src/db/client.ts` (Pool từ `DATABASE_URL`, lazy; **không** `import 'server-only'` ở đây vì script/test `tools/db` chạy bằng node/tsx — đặt `server-only` ở `src/lib/content/store.ts`; — import không mở kết nối; không log URL).
3. `drizzle.config.ts`; scripts `db:generate` (`drizzle-kit generate`), `db:migrate` (`drizzle-kit migrate`). **Không** thêm script `push`.
4. Sinh `drizzle/0000_*.sql` + meta; inspect SQL: chỉ CREATE (additive) — ghi vào task report.
5. `.env.example`: `DATABASE_URL`, `POSTGRES_PASSWORD`, `REVALIDATE_SECRET` (giá trị giả).
6. Local: Postgres Docker tạm → `npm run db:migrate` → bảng đúng → migrate lần 2 = no-op.

## Acceptance
- Migration versioned + committed; chỉ op additive; chạy 2 lần không lỗi.
- typecheck/lint/build PASS (build không cần `DATABASE_URL`). Không secret trong repo.

## Verify
Lệnh theo `.context/project-config.md` + migrate trên Postgres Docker local.

## Builder report
- **Agent:** builder · 2026-10-14 · attempt 1
- **Files mới:** `src/db/schema.ts`, `src/db/client.ts`, `src/db/schema.test.ts`, `src/db/client.test.ts`, `drizzle.config.ts`,
  `drizzle/0000_empty_supernaut.sql`, `drizzle/meta/0000_snapshot.json`, `drizzle/meta/_journal.json`, `.env.example`.
- **Files sửa:** `package.json` (deps `drizzle-orm`, `pg`; devDeps `drizzle-kit`, `@types/pg`, `tsx`; scripts `db:generate`, `db:migrate`, `test`),
  `package-lock.json` (chỉ thêm 101 package, 0 package cũ đổi version — sinh bằng npm 10.9.9 cho khớp `npm ci` của Docker node:22;
  npm 11 local từng bỏ `next-intl/node_modules/@swc/helpers` làm `npm ci` npm 10 fail), `.context/project-config.md` (`test_command`/`check_commands.test` = `npm test`),
  `.context/decisions.md` (append quyết định mô hình).
- **Migration `drizzle/0000_empty_supernaut.sql`** (sinh bằng `drizzle-kit generate`, không viết tay) — chỉ op additive trên DB rỗng:
  `CREATE TABLE content_entries` (PK serial, UNIQUE(collection,slug,locale), CHECK locale IN ('vi','en'), CHECK version >= 1);
  `CREATE TABLE content_versions` (PK serial, UNIQUE(entry_id,version), CHECK op IN (create,update,delete,rollback));
  `ALTER TABLE content_versions ADD CONSTRAINT ..._fk FOREIGN KEY (entry_id) REFERENCES content_entries(id)` (trên bảng vừa tạo, rỗng);
  `CREATE INDEX content_entries_collection_locale_live_idx (collection, locale) WHERE deleted_at IS NULL`.
  Không DROP / đổi type / SET NOT NULL trên data cũ / backfill → **không** HIGH_RISK_MIGRATION.
- **Verify:**
  - `npm test` → PASS 5/5 (whitelist collection, cột/constraint 2 bảng, FK, client import không throw khi thiếu env + getDb lazy).
  - `npm run typecheck` → PASS. `npm run lint` → PASS (0 error; 1 warning `<img>` có sẵn ở `src/components/mdx/index.tsx`).
  - Postgres 16 Docker tạm (`nta-db-test`, 127.0.0.1:55432): `npm run db:migrate` lần 1 → applied; lần 2 → exit 0, `drizzle.__drizzle_migrations` vẫn 1 hàng (no-op).
    `\d content_entries` / `\d content_versions` khớp thiết kế. Thử insert `locale='fr'` và `version=0` → bị CHECK chặn. Container đã dừng.
  - `npm run db:generate` lần 2 → "No schema changes" (schema ↔ migration đồng bộ).
  - `npm run build` local Windows → FAIL do môi trường: `@swc/core` (next-intl) không load native binding vì DACL thư mục cache
    `C:\Users\datda\AppData\Local\swc` (cùng loại lỗi đã biết từ CR-028, không liên quan diff).
  - `docker build --target builder .` → `npm ci` PASS (sau khi sinh lock bằng npm 10), compile + lint/type PASS, nhưng prerender lỗi ngẫu nhiên
    (digest ẩn, trang khác nhau mỗi lần: /vi/about, /en/contact, /vi/case-studies/dental-clinic-operations). **HEAD sạch (`git archive HEAD | docker build`) lỗi y hệt** → baseline môi trường, không do diff.
  - Bằng chứng build: `docker run` image `deps` (node:22-slim, `npm ci` từ lock mới) + working tree, **không** set `DATABASE_URL` → `npm run build` exit 0, `Generating static pages (61/61)`.
- **Residual risk:** prerender flaky trong `docker build` local (cả HEAD) chưa rõ root cause — ngoài scope; CI/VPS cần theo dõi khi push.
  Máy dev dùng npm 11 có thể sinh lại lock thiếu `next-intl/node_modules/@swc/helpers` → nên chạy `npm ci`/`npm install` bằng npm 10 hoặc kiểm `npm ci` trước khi commit lock.

## Close-out
- Status: **done** · Acceptance criteria: PASS
- Verify: npm test PASS 5/5 · typecheck PASS · lint PASS (1 warning có sẵn) · migrate x2 PASS (Postgres 16 Docker tạm) · build PASS 61/61 trong container node:22-slim không DATABASE_URL (Windows: lỗi môi trường swc DACL đã biết; docker build local prerender flaky cả trên HEAD)
- Reviewer verdict: STRICT **PASS** round 1 — `.context/review-reports/feature-content-database-phase-1-task-01-round-1-review.md`
- MINOR đã xử lý: `.gitignore` thêm `.env`, `.env*.local`, `!.env.example`. Follow-up: thông báo rõ khi thiếu DATABASE_URL lúc `db:migrate` + cách export → runbook (P1-T02/P5); test lazy-connect/partial-index chặt hơn + CHECK `content_versions.version >= 1` (tuỳ chọn) → cân nhắc ở P2-T02.
- Doc impact: decisions.md (đã ghi); ERD → P5-T01. Migration: `drizzle/0000_empty_supernaut.sql` additive (CREATE TABLE x2, FK trên bảng mới, CREATE INDEX).
