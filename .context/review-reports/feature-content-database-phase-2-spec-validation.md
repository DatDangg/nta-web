# Spec Validation — CR-031 feature/content-database — HẾT PHASE 2

Agent: spec-validator · Mode: **Phase review** · Ngày: 2026-10-14 · Round: 1
Phạm vi: P2-T01 (`e202ffc`) + P2-T02 (`7e6fdb3`). Đọc DB / cache / revalidate / upload ảnh / cutover thuộc phase 3–4 → không tính là gap (chỉ nêu điều kiện cho phase 3).
Nguồn đối chiếu: `SPECIFICATIONS.md:382-413` (R-16, R-16a, R-16c, R-16d), `:472` (R-27), `docs/content-bot/08-data-model.md:74-81` (I-1..I-8),
`spec/changes/2026-10-14-content-database.md:42-47` (Acceptance), task files `tasks/feature-content-database/phase-2-task-0{1,2}.md`,
review reports P2-T01 r1 / P2-T02 r1 (đều STRICT PASS), report phase 1 `feature-content-database-phase-1-spec-validation.md`,
code: `tools/db/{file-source,import-seed,seed-db,parity-check,content-cli}.ts`, `src/db/{content-repo,content-rules,schema}.ts`,
`drizzle/0001_aromatic_rattler.sql`, `deploy/db/migrate-on-restore.sh`, `docs/runbook/db.md`, `.context/decisions.md`, `.dockerignore`.
Validator không chạy lại test/build (chỉ đọc); số liệu verify lấy từ Builder/Reviewer.

## Verdict: ✅ PASS (⚠️ GAPS FOUND — 0 BLOCKER, 0 MAJOR, 4 MINOR)

Phase 2 build đúng và đủ phần spec delta thuộc phase 2: import seed chỉ-chèn có version, parity, write-path có lịch sử cùng transaction,
rollback = version mới, CLI bảo trì, migration 0001 additive, quy trình chạy thử migration trên bản restore. Các gap phase 1 đã gộp vào phase 2 đều đóng.
Không có gap chặn việc bắt đầu phase 3.

## Ma trận coverage

| # | Requirement (phần phase 2) | Nguồn spec | Implementation | Status | Ghi chú |
|---|---|---|---|---|---|
| 1 | Seed gồm toàn bộ nội dung: MDX (post/solution/product/case_study/about), listing, home, solution_overview, registry slug | R-16 `:383-385` | `tools/db/file-source.ts:26-41,103-155` đọc bằng chính loader/hằng web dùng | ✅ | 14 collection, 68 bản ghi/locale, 136 tổng (task 01 Builder report) |
| 2 | Có cả `ui_messages` (vi/en json) + `company_info` | R-16 `:388-389` (quyết định #9) | `file-source.ts:13-14,66,140-142` | ✅ | company_info ghi giống nhau cho vi/en (decisions.md) |
| 3 | Ảnh `public/images` giữ trong repo, không chuyển | R-16 `:390` | import không đụng ảnh; I-7 kiểm file trong `public/` (`content-repo.ts:144-147`) | ✅ | |
| 4 | Mỗi tạo/sửa/xoá ghi 1 dòng lịch sử **cùng transaction** (version tăng, snapshot đầy đủ, op, actor, thời điểm) | R-16a `:396-398` | `content-repo.ts:226-240` (UPDATE rồi INSERT version trong `db.transaction`), `:246-274` create; seed `seed-db.ts:30-66` (1 tx/bản ghi, entry v1 + version create) | ✅ | snapshot gồm data/body/sort_order (`:205-216`); test "lỗi giữa transaction không để entry đổi thiếu version" PASS (task 02) |
| 5 | Chống ghi đè đồng thời | R-16a (ngầm), task 02 scope | `SELECT … FOR UPDATE` + `expectedVersion` → `ContentConflictError` (`content-repo.ts:198-203`) | ✅ | test 2 ghi đồng thời đúng 1 thành công |
| 6 | Xoá là xoá mềm có lịch sử | R-16a `:398` | `softDeleteEntry` set `deleted_at`, op `delete` (`content-repo.ts:313-322`); đọc mặc định bỏ hàng xoá (`:356-403`) | ✅ | |
| 7 | Rollback = ghi snapshot version cũ thành version mới; không sửa/xoá lịch sử | R-16a `:398-399` | `rollbackEntry` op `rollback`, validate lại snapshot, khôi phục xoá mềm (`content-repo.ts:326-349`) | ✅ | không có code UPDATE/DELETE `content_versions` nào |
| 8 | Lịch sử bất biến | R-16a `:397` | chỉ tầng app (không trigger/REVOKE) | ⚠️ | MINOR-4 phase 1 vẫn mở — chấp nhận được (1 writer), xem MINOR-4 dưới |
| 9 | Import seed 1 lần, **chỉ chèn**, không ghi đè/xoá | R-16c `:412` | `seed-db.ts:46-50` `ON CONFLICT DO NOTHING` theo UNIQUE(collection,slug,locale) (gồm cả hàng đã xoá mềm → không hồi sinh); chỉ INSERT/SELECT (`:1-2`) | ✅ | chạy lại = 0 bản ghi mới (task 01) |
| 10 | Import chạy sau backup + user xác nhận; chặn prod | R-16c `:412` | `import-seed.ts:40-43` + `isProductionDatabaseUrl` (`seed-db.ts:18-27`, fail-closed khi URL lỗi); `--dry-run` không kết nối DB | ⚠️ | xác nhận = cờ `--confirm-prod` (code); **backup trước import chỉ ở runbook** `db.md:217` → MINOR-3 |
| 11 | Import kiểm toàn vẹn trước khi ghi + parity DB↔file | R-16 "hiển thị y hệt", I-1..I-7 | `import-seed.ts:21-27` (checkInvariants), `parity-check.ts:14,45-46` deep-equal không phụ thuộc thứ tự key + body + sort_order | ✅ | |
| 12 | Thay "verify staging" HIGH_RISK bằng restore backup mới nhất vào DB tạm + chạy thử migration | R-16c `:413` | `deploy/db/migrate-on-restore.sh` (chỉ DB `nta_restore_*` `:19-23`, dump mới nhất `:25-27`, gate+migrate trỏ DB tạm `:51-58`, luôn xoá DB tạm `:32-39`); runbook `db.md:146-161` | ✅ | đóng **MAJOR-2 phase 1**; chỉ diễn tập local |
| 13 | Giai đoạn đầu chỉ migration additive | R-16c `:409` | `drizzle/0001_aromatic_rattler.sql` = `ADD COLUMN sort_order integer` nullable, không default; gate 0 finding (`migration-gate.test.ts`) | ✅ | |
| 14 | Cấm push/reset/seed ghi đè | R-16c `:411` | không thêm script push/reset; runbook `db.md:164` | ✅ | |
| 15 | Collection `asset` có version như R-16a (phần schema/whitelist) | R-16d `:402` | whitelist thêm `asset` (task 01, không migration); write-path dùng chung → có version | ✅ (nền) | hàm lưu ảnh/serve `/uploads` = P3-T05, không tính |
| 16 | I-1 đủ cặp vi/en | 08 §4 `:74` | parity chặn (file); write-path **cảnh báo** khi tạo (`content-repo.ts:171-184`) | ✅ | không cảnh báo khi xoá 1 locale → MINOR-1 |
| 17 | I-2 slug frontmatter = khoá | `:75` | `content-rules.ts:117-122` | ✅ | |
| 18 | I-3 / I-4 registry ↔ solution/product | `:76-77` | `content-rules.ts:130-147`, `content-repo.ts:153-168` (hai chiều), xoá registry khi nội dung còn sống bị chặn (`:303-306`) | ⚠️ | đổi `group` registry không kiểm bản ghi đích cũ; không khoá chéo khi ghi đồng thời → MINOR-2 |
| 19 | I-5 slug duy nhất | `:78` | UNIQUE DB + báo rõ trước insert (`content-repo.ts:258-266`) | ✅ | |
| 20 | I-6 enum | `:79` | `content-rules.ts:93-126` (collection, locale, category blog/solution/case study, group, icon showcase) | ✅ | |
| 21 | I-7 ảnh tồn tại | `:80` | `content-repo.ts:128-150` (`public/` hoặc asset `/uploads` còn sống; chặn `..`) | ✅ | quy ước `/uploads` ↔ `data.path` ở decisions.md:110 — P3-T05 phải theo |
| 22 | I-8 xoá/đổi slug public → 301 | `:81` | update không đổi khoá; xoá public cần `confirmPublicUrlChange` + cảnh báo 301 (`content-repo.ts:276,296-302`) | ✅ | redirect vẫn cần deploy (đúng spec) |
| 23 | Validate required fields như loader | task 02 scope | `content-rules.ts:20-26,64-75` dùng `assertRequiredFields` | ✅ | danh sách lặp với loader (có test đọc mã loader) — điều kiện P3 |
| 24 | CLI list/show/history/rollback; ghi prod cần xác nhận | task 02 scope | `tools/db/content-cli.ts:63-112`, guard `:97-100`, actor `cli:<user>` | ✅ | không chạy được trên VPS (`.dockerignore:20` loại `tools`) — P4-T01 |
| 25 | Change doc Acceptance "Có lịch sử phiên bản nội dung để rollback" | change doc `:47` | #4–#7 + #24 | ✅ (tầng ghi) | checkbox chỉ đánh khi cutover (web đọc DB) xong |

## Đóng gap phase 1 (gộp vào phase 2)

| Gap phase 1 | Trạng thái | Bằng chứng |
|---|---|---|
| MAJOR-1 runbook cần secret trên VPS | ✅ đóng | `db.md:39-52` (§1a bảng lệnh `docker exec` không cần secret: psql, backup, restore-check, migrate-on-restore), `:54-70` (§1b env tạm 600, có `CONTACT_FORM_TARGET`), restore prod 4b qua `docker exec nta-db-backup` `:116-126` |
| MAJOR-2 thiếu migrate thử trên bản restore | ✅ đóng | `deploy/db/migrate-on-restore.sh`, `db.md:146-161`; trap INT/TERM/HUP (`:36-39`) |
| MINOR-1 snapshot thiếu `sort_order` | ✅ đóng | migration 0001 + `schema.ts` `contentVersions.sortOrder`; `insertVersion` ghi `sortOrder` (`content-repo.ts:212`), seed ghi v1 (`seed-db.ts:57`) |
| MINOR-2 drift tên lưu trữ ảnh R-27 | ✅ đóng | `SPECIFICATIONS.md:472` ghi bind mount `/opt/nta-web-data/uploads` |
| MINOR-3 backup daily không chạy bù | ⏳ mở (residual, ngoài phase 2) | không đổi `backup-loop.sh` |
| MINOR-4 bất biến lịch sử chỉ tầng app | ⏳ mở (chấp nhận) | xem MINOR-4 dưới |
| 5 MINOR reviewer P2-T01 | ✅ đóng ở P2-T02 | trap tín hiệu, `CONTACT_FORM_TARGET`, parity I-3 hai chiều + I-6 icon, `read -rs` thay URL trên dòng lệnh (`db.md:209-210`), seed test so `=` |

## Gaps

### MINOR-1 — Xoá mềm bản ghi cấu trúc/không có URL không có chặn hay cảnh báo [PARTIAL I-1, R-16 "hiển thị y hệt"]
- `src/db/content-repo.ts:293-311` (`deleteValidation`): chỉ kiểm I-8 cho 4 collection public + I-3 registry. Xoá `home/*/home`, `company_info`, `listing_labels`,
  `about`, 1 namespace `ui_messages` hoặc 1 locale của cặp vi/en đi qua không cảnh báo → web phase 3 đọc DB sẽ lỗi render / thiếu chữ / 404 một ngôn ngữ.
- Không phải invariant ghi rõ trong 08 §4 (I-1 chỉ có cảnh báo khi tạo). Đề xuất: P3 (khi loader DB định nghĩa bản ghi bắt buộc) hoặc trước khi bot CR-030 có lệnh xoá —
  chặn xoá singleton bắt buộc + cảnh báo I-1 khi xoá 1 locale.

### MINOR-2 — I-3 chéo bản ghi: đổi `group` registry và ghi đồng thời [PARTIAL I-3/I-4]
- `content-repo.ts:160-166`: update `slug_registry` đổi nhóm (vd `enterprise` → `product`) chỉ kiểm bản ghi đích **mới**; solution cũ còn sống với registry không còn khớp không bị báo.
- Validate đọc bản ghi khác không khoá (`findLiveEntry` không `FOR UPDATE`) → 2 ghi đồng thời trên registry + nội dung có thể cùng qua. Reviewer P2-T02 đã ghi follow-up.
- Rủi ro thấp với 1 writer (CLI); cần xử lý trước khi bot CR-030 cho sửa registry. Parity vẫn bắt được sau sự việc.

### MINOR-3 — "Import sau backup" chỉ được đảm bảo bằng runbook, không bằng code [PARTIAL R-16c `:412`]
- `tools/db/import-seed.ts:40-43` chỉ đòi `--confirm-prod`; bước backup trước import nằm ở `docs/runbook/db.md:217`. Tương tự CLI rollback (`db.md:240-241`).
- Chấp nhận được (operator có checklist), nhưng P4-T01 phải đưa "backup `pre-migrate-before-import-<UTC>` + user duyệt" thành bước bắt buộc có ghi lại tên file dump trong task.

### MINOR-4 — Bất biến `content_versions` chỉ ở tầng app (mang từ phase 1)
- Không có trigger/REVOKE chặn UPDATE/DELETE; mọi đường ghi hiện có (`seed-db.ts`, `content-repo.ts`) chỉ INSERT. Chấp nhận với 1 writer;
  nên quyết định (ghi decisions.md) trước khi bot CR-030 có quyền DB riêng.

## Điều kiện phase 3 cần biết (không tính gap)
1. **`tools/` bị loại khỏi Docker context** (`.dockerignore:20`): import/parity/CLI không có trong image → P4-T01 cần cách chạy trên VPS (image riêng hoặc chạy từ workspace runner qua mạng compose). Code web không được import từ `tools/`.
2. **jsonb không giữ thứ tự key** (`decisions.md:98-99`): loader DB không được dựa vào thứ tự `Object.keys(data)` (đặc biệt `home`, `ui_messages` lồng nhau, `company_info`); thứ tự cấp collection dùng `sort_order`. Parity deep-equal không phụ thuộc thứ tự key → **không** bắt được lệch hiển thị do thứ tự → P3 cần so sánh render (snapshot HTML) chứ không chỉ parity dữ liệu.
3. **Quy ước I-7 asset**: `/uploads/*` hợp lệ khi có bản ghi `asset` còn sống với `data.path` = đường dẫn (`decisions.md:110`, `content-repo.ts:135-143`). P3-T05 (lưu ảnh) phải ghi đúng `data.path`, hoặc cập nhật cả quy ước + `imageProblems`. Bản ghi asset hiện không tự kiểm file trên volume.
4. **REQUIRED_FIELDS lặp với loader** (`content-rules.ts:18-26`): P3 nên cho loader DB import `REQUIRED_FIELDS`/`checkRecord` từ `src/db/content-rules.ts` để còn một nguồn.
5. **`content-repo.ts` 404 dòng** chứa cả đọc lẫn ghi; P3 tách phần đọc (reviewer follow-up) — loader web không được kéo `node:fs` từ đường ghi vào bundle client.
6. **company_info không theo locale** nhưng lưu 2 bản vi/en giống nhau → sửa qua bot phải sửa cả 2 (hoặc P3 chỉ đọc 1 locale) — cần chốt trước CR-030.
7. Version seed cũ trước 0001 có `sort_order` NULL — prod chưa có dữ liệu nên không ảnh hưởng; nếu P4 import sau khi đã apply 0001 thì đủ.

## Chưa chứng minh (residual)

| Mục | Trạng thái | Cách chứng minh |
|---|---|---|
| `migrate-on-restore.sh` chạy trên VPS | chỉ diễn tập local (`db.md:160-161`) | chạy 1 lần trên VPS với dump pre-migrate gần nhất trước P4-T01 |
| Trap Ctrl-C / mất SSH thật | chỉ `sh -n` | Ctrl-C giữa chừng trên local → kiểm `nta_restore_migtest` đã bị xoá |
| Migration 0001 đã apply trên prod | chưa có xác nhận trực tiếp (deploy apply lên bảng rỗng theo user) | `docker exec nta-db psql -U nta -d nta_web -c 'select count(*) from drizzle.__drizzle_migrations'` = 2 + `\d content_versions` có `sort_order` |
| Import seed + parity trên DB prod | chưa (đúng kế hoạch — P4-T01) | — |
| Concurrency/rollback/validate | test có `TEST_DATABASE_URL` 62 PASS (Builder), validator không chạy lại | — |
| `docker build --target builder` flaky prerender | nguyên nhân chưa xác định; `docker compose build nta-web` (như CI) PASS 61/61; reviewer xác nhận không route web nào import `src/db` | nên điều tra trước P3 (P3 bắt đầu cho web import `src/db`, lỗi prerender khi đó sẽ khó phân biệt) |
| Diễn tập restore trên VPS (phase 1 residual) | vẫn chưa | nên làm ngay sau import P4 để số bản ghi có ý nghĩa |

## Verdict reasoning
- Không có ❌ MISSING; không có conflict HIGH giữa spec ↔ decisions ↔ code. Mọi requirement R-16a/R-16c thuộc phase 2 có implementation + test.
- 4 MINOR đều có điều kiện kích hoạt muộn (bot CR-030 ghi DB, cutover P4) và không ảnh hưởng prod hiện tại (prod chưa có dữ liệu nội dung).
- 2 MAJOR + 2 MINOR phase 1 dự kiến xử lý trong phase 2 đã đóng.
- Phase 2 → **PASS**.
