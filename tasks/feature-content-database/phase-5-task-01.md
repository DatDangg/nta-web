# feature-content-database · phase-5-task-01 — Doc reconcile

- **CR:** CR-031 · spec 4.2.0
- **Classification / Risk:** MODIFY (docs) · LOW
  - Expected review level: **NORMAL**
  - Blast radius: chỉ docs.

## Scope
0. **Code (sau cutover ổn định ≥ 1 ngày, user đồng ý):** bỏ cờ `CONTENT_SOURCE` + đường đọc file ở web → web chỉ đọc DB (R-16).
   Classification task này thành MODIFY · HIGH · STRICT nếu làm chung; có thể tách `phase-5-task-02` khi thực thi.

## Docs (as-built, kèm evidence code)
- `docs/ERD.md`: PostgreSQL/Drizzle, pointer `src/db/schema.ts` + `drizzle/`, 2 bảng + danh sách collection; bỏ "v1 không DB".
- `docs/DESIGN.md`: luồng đọc DB + cache tag + revalidate; chiến lược render; build không cần DB.
- `docs/API_SPEC.md`: `POST /api/revalidate` + `GET /uploads/...`.
- Runbook: thư mục upload, backup/restore ảnh.
- `docs/runbook/db.md` + `deploy-vps.md`: hoàn thiện sau cutover.
- `docs/content-bot/08-data-model.md`, `09-web-to-data-map.md`, `02-schemas.md`, `10-server.md`: ánh xạ file → collection/bảng.
  `docs/content-bot/` hiện **untracked, thuộc CR-030** → nếu CR-030 chưa commit thư mục này thì ghi yêu cầu cập nhật vào change doc CR-030, không commit thay.
- `src/content/README.md` (nếu chưa có ở task 5).
- `node scripts/generate-inventory.mjs` nếu ảnh hưởng.
- Intent docs (BRD/PRD) **không** tự sửa.

## Acceptance
- Không còn doc as-built nói "không có DB"; spec-validator phase PASS; close-out: test-scope v49, archive change doc, BACKLOG done.
