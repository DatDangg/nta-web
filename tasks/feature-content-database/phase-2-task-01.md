# feature-content-database · phase-2-task-01 — Import seed vi+en (chỉ chèn, idempotent) + parity check

- **CR:** CR-031 · spec R-16, R-16c (4.2.0)
- **Classification / Risk:** ADDITIVE (data import) · HIGH (bulk insert vào DB prod ở phase 4)
  - Expected review level: **STRICT** (bulk data, toàn vẹn nội dung)
  - Blast radius: mới `tools/db/import-seed.ts`, `tools/db/parity.ts`; không sửa web.
  - Doc impact: runbook db (mục import 1 lần).

## Scope
1. Import đọc **bằng chính loader file hiện tại** (`src/lib/content/*`, `src/content/*.ts`) — không parse lại → dữ liệu khớp đúng cái web đang render.
   Mapping theo `docs/content-bot/08-data-model.md` §2: Post/Solution/Product/CaseStudy/About (data = frontmatter, body = MDX source),
   `listingPages/listingItems/listingCtas/listingLabels`, `home`, `solutionOverview`, `slug_registry` (sort_order = thứ tự `slug.ts`).
   Cần tách phần đọc file thành module dùng lại được (vì task 5/6 đổi loader sang DB) — vd `tools/db/file-source.ts`.
2. Mỗi bản ghi: chèn `content_entries` (version 1) + `content_versions` (op `create`, actor `seed`) trong transaction;
   `ON CONFLICT DO NOTHING` — **không ghi đè, không xoá, không TRUNCATE**. Chạy lại = 0 bản ghi mới. Có `--dry-run`.
3. `tools/db/parity.ts`: deep-equal từng bản ghi DB ↔ file (vi + en), in diff, exit ≠0 nếu lệch. Dùng lại ở task 8.
4. Kiểm I-1..I-6 (`08-data-model.md` §4) sau import.

## Acceptance
- Local: import vào DB rỗng → parity PASS mọi collection/locale; chạy lại → 0 chèn, parity vẫn PASS.
- Script không có lệnh xoá/ghi đè (reviewer kiểm).
