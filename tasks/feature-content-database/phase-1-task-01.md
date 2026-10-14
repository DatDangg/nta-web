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
