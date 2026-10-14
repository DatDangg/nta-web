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
- Không còn doc as-built nói "không có DB"; spec-validator phase PASS; close-out: test-scope v51+ (v49 CR-034, v50 CR-026/032), archive change doc, BACKLOG done.

## Thực thi (15/10/2026)
- **Scope 0 tách sang `phase-5-task-02.md`** (MODIFY · HIGH · STRICT; điều kiện: prod `db` ổn định ≥ 1 ngày từ 14/10 16:38 UTC + user đồng ý;
  GIỮ messages JSON + `COMPANY_CONTACT` theo quyết định P3-T04). Task này **chỉ docs**, không đổi `src/`/`tools/`/infra.

## Verification summary
Doc đổi (as-built, pointer code):
- `docs/ERD.md` — PostgreSQL 16 + Drizzle; source of truth `src/db/schema.ts`, `drizzle/0000…`, `0001…`, `src/db/content-rules.ts`/`content-repo.ts`;
  2 bảng `content_entries`/`content_versions` (cột, UNIQUE/CHECK/index một phần), version/xoá mềm/rollback, 15 collection ↔ khoá slug ↔ seed, invariant I-1..I-8,
  form liên hệ vẫn không lưu DB; bỏ "Type: none / v1 không cần DB".
- `docs/DESIGN.md` — mục mới "Kiến trúc nội dung & render": cờ `CONTENT_SOURCE` (prod = `db` qua GitHub Variable), luồng đọc DB (`store.ts` + `unstable_cache`,
  lỗi DB → ném), cache tag + `/api/revalidate`, render (build không prerender trang nội dung, /en ISR on-demand, vi render theo request trên data cache vì
  `as-needed` + Next 15.5, `htmlLimitedBots`), gộp sâu messages/company-info + cảnh báo `[content-shape]`, ảnh upload, Deploy/Content ops/backup.
- `docs/API_SPEC.md` — bảng route thật; `POST /api/revalidate` (header, 2 dạng body, 200/400/401/429/503, no-store, 30 req/60 s/IP) + `GET /uploads/<sha256>.<ext>`
  (cache immutable, nosniff, 404 text/plain no-store, 405); bỏ `/api/posts`, `/api/case-studies` (không tồn tại) + câu "SSG từ file".
- `docs/PERMISSION.md` — route nội dung/uploads công khai, revalidate dùng shared secret.
- `docs/runbook/cutover-content-db.md` — banner "ĐÃ CUTOVER 14/10/2026" (B1–B9, còn B10, P5-T02, CR-033).
- `docs/runbook/db.md` — trạng thái DB = nguồn sự thật; file backup `pre-migrate-ops-*` + cảnh báo CR-033 (rotate chung glob `pre-migrate-*`);
  §4c backup/restore ảnh `uploads-*.tar.gz` + `chown 1001:1001`, restore cùng mốc với dump, asset xoá mềm vẫn 200 qua URL hash.
- `docs/runbook/deploy-vps.md` — env `CONTENT_SOURCE` (Variable, prod `db`), `DATABASE_URL`/`UPLOAD_DIR`, owner 1001, trỏ §4c + cutover.
- `docs/runbook/ai-news.md` — cảnh báo: workflow AI news vẫn chỉ ghi file `src/content/blog` → bài mới không tự hiện khi prod = `db`; tạm chạy Content ops `import-seed` + `revalidate-all`.
- `docs/screenshots-mapping.md` — `ratio` CRM nằm ở bản ghi DB (seed gốc mdx).
- `src/content/README.md` — seed import ban đầu, nguồn sự thật = DB (trừ messages/company-info dự phòng), import/parity, bảng cờ.
- `docs/generated/inventory.md` — chạy lại `node scripts/generate-inventory.mjs` (231 file `src`, gồm `src/app/api/revalidate`, `src/app/uploads/[...path]`).
- `spec/changes/2026-10-14-telegram-content-bot.md` (CR-030, untracked) — append mục "Yêu cầu cập nhật từ CR-031" cho `docs/content-bot/` 02/08/09/10
  (file → collection/bảng, write-path, revalidate, saveImage, CLI, gộp messages). **Không** sửa `docs/content-bot/`.
- Không sửa intent docs (BRD, specs/2026-10-08 design doc, business rules SPECIFICATIONS).

Grep chứng minh (`grep -rniE "không (có|cần) DB|v1 không DB|db_tool: none|Type:\*\* none"` trên ERD/DESIGN/API_SPEC/PERMISSION/runbook/src/content README):
chỉ còn câu đúng — "`next build` không cần DB" (ERD:21, DESIGN:262), "Không có DB staging" (ERD:92, db.md:173), "dry-run không cần DB" (db.md:235, README:15).

Verify: `npm run typecheck` PASS · `npm run lint` PASS (0 error, 1 warning `no-img-element` có từ trước) · `npm test` PASS (95 test: 93 pass, 2 skip cần `TEST_DATABASE_URL`, 0 fail).

## Residual risk
- Review NORMAL PASS round 1 — MINOR 1 (scope P5-T02 thêm file còn tham chiếu cờ), 3 (README "task 8" cũ), 4 (API_SPEC câu mẫu cũ) sửa inline; MINOR 2 (inventory dấu  trên Windows) chấp nhận. AI news gap → backlog CR-034.
- **Gap hành vi (cần CR riêng):** AI news weekly (CR-019, R-09c) commit bài vào `src/content/blog` nhưng prod đọc DB → bài thứ 2 tới không hiện trên site nếu không
  chạy tay Content ops `import-seed` + `revalidate-all`. Đã ghi cảnh báo ở `docs/runbook/ai-news.md`; chưa ghi backlog (việc của primary).
- `docs/specs/2026-10-08-nta-website-design.md` + `docs/BRD.md` vẫn nói "SSG / không DB" — là intent/lịch sử, không sửa theo luật.
- `docs/generated/inventory.md` sinh trên Windows → đường dẫn dùng `\`; chạy lại trên Linux sẽ ra diff toàn file (chỉ khác dấu phân cách).
- `docs/runbook/ai-news.md`, `docs/reference/*` còn nhắc `src/content/...` như nơi sửa nội dung (reference/* là ghi chú lịch sử, không sửa).
- B10 P4-T01 (backup daily + diễn tập restore) chưa xong — docs ghi "còn B10"; cần cập nhật khi B10 đạt.
