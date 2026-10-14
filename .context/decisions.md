# Architecture Decisions Log

## Format

```markdown
### Decision {N}: {Title}
- **Date:** YYYY-MM-DD
- **Context:** {Why this decision was needed}
- **Decision:** {What was decided}
- **Alternatives Considered:** {Other options}
- **Rationale:** {Why this option was chosen}
- **Consequences:** {Trade-offs, follow-up needed}
```

## Decisions

### Decision 1: Layer 0 content contract remediation
- **Date:** 2026-10-08
- **Context:** Phase review Layer 0 found mismatches in product count, solution media/related cases, and case-study result metrics.
- **Decision:** Ratified: R-03 requires at least 2 featured products (the 2 real apps), with the section hidden when empty; Solution supports optional `image`, `screenshots`, and `relatedCases`; R-06 related case studies are optional; CaseStudy supports optional `metrics` and no numbers are fabricated.
- **Alternatives Considered:** Add synthetic content or retain the 3–4 product target.
- **Rationale:** Keep the contract aligned with real content and avoid inventing products or outcomes.
- **Consequences:** Consumers must gracefully omit empty optional sections/metrics.

### Decision 2: Static list content in v1
- **Date:** 2026-10-08
- **Context:** R-15 did not have an implementation owner and Layer 0 already uses repository content files.
- **Decision:** V1 does not implement `GET /api/posts` or `GET /api/case-studies`; pages consume static repository content.
- **Alternatives Considered:** Add dynamic list endpoints in v1.
- **Rationale:** Consistent with the no-database, content-file v1 architecture.
- **Consequences:** Dynamic APIs remain out of v1 scope.

### Decision 3: Outstanding content and verification residuals
- **Date:** 2026-10-08
- **Context:** Review noted missing partner logos and prior reviewer shell permission denials.
- **Decision:** Keep `about.partners: []`; OQ#1 awaits real partner confirmation. Record G10/N2 as a residual: prior independent review commands were denied by shell permissions; remediation verification is run directly in this task.
- **Alternatives Considered:** Add placeholder partner identities/logos or claim independent verification had passed.
- **Rationale:** Do not fabricate partners or overstate evidence.
- **Consequences:** PartnerLogos remains hidden until confirmed data exists; shell-deny history remains documented.

### Decision 4: Contact form rate-limit threshold + forward target handling (Layer 3 task-01)
- **Date:** 2026-10-09
- **Context:** Task-01 đánh dấu `[cần xác nhận]` cho ngưỡng rate-limit `POST /api/contact`; OQ#4 (`CONTACT_FORM_TARGET`) chưa có giá trị.
- **Decision:** User chốt **rate-limit = 5 request / 10 phút / IP** (in-memory sliding window). `CONTACT_FORM_TARGET` đọc từ env server-only; verify local bằng **mock endpoint**, giá trị thật user điền `.env.local` sau.
- **Alternatives Considered:** 3 req/10 min (chặt hơn) hoặc 10 req/10 min (lỏng hơn).
- **Rationale:** Cân bằng chống spam với không chặn nhầm người dùng thật; giữ interface forward không đổi khi thay đích.
- **Consequences:** Rate-limit in-memory là per-instance (không chính xác khi scale ngang) — ghi residual; cấm `NEXT_PUBLIC_CONTACT_FORM_TARGET` (R-19).

## 2026-10-13 — blog-listing-redesign: trang /blog bám pattern `src/components/listing/*`
- Hero `/blog` tái dùng `ListingHero` + nền `hero-waves.jpg` (cùng ảnh user gửi) thay vì tạo hero riêng.
- Màu minh hoạ/thanh lọc dùng hex/rgb arbitrary giống `listing/*` (teal `#0b9f8a`, `#2dd4bf`, `#5eead4`) thay vì chỉ token —
  nhất quán với 4 trang danh sách hiện có; tránh opacity modifier trên màu `var()` (error-memory Error 7). Cần user xác nhận.


## 2026-10-14 — CR-031 P1-T01: mô hình bảng nội dung PostgreSQL (document store JSONB)
- **Quyết định:** 2 bảng — `content_entries` (1 hàng = 1 bản ghi nội dung theo `collection`+`slug`+`locale`, frontmatter/object TS
  giữ nguyên trong `data` jsonb, MDX ở `body`, thứ tự ở `sort_order`, xoá mềm `deleted_at`, `version` ≥1) và `content_versions`
  (append-only, UNIQUE(`entry_id`,`version`), `op` CHECK create|update|delete|rollback). Version ghi ở tầng app trong transaction
  (P2-T02), không dùng trigger DB.
- **Không tách hàng chục bảng con** (showcase, gallery, milestones…): khớp 1-1 với mô hình file hiện tại, import/parity đơn giản,
  đổi field nội dung không cần migration. Đánh đổi: ràng buộc field nằm ở tầng app (loader/validator), không ở DB.
- **`collection` không CHECK ở DB:** whitelist `CONTENT_COLLECTIONS` + `isContentCollection()` export từ `src/db/schema.ts`,
  validate ở tầng app → mở rộng phạm vi (i18n/company-info…) không cần migration đổi constraint. `locale` vẫn CHECK `vi|en`.
- **`server-only` đặt ở `src/lib/content/store.ts`**, không ở `src/db/client.ts`, vì script `tools/db` và test chạy bằng node/tsx
  ngoài Next. `client.ts` lazy: import không mở kết nối, thiếu `DATABASE_URL` chỉ lỗi khi gọi `getDb()` → `next build` không cần DB.
- **Test runner:** `node --import tsx --test "src/**/*.test.ts"` (node:test built-in; tsx để chạy TS + import không đuôi như phần
  còn lại của repo). Không thêm Jest/Vitest.

## 2026-10-14 — CR-031 P1-T02: chạy migrate trong deploy + backup sidecar
- **Migrate:** service một-lần `nta-migrate` (compose profile `tools`) build từ stage Dockerfile `migrator` = stage `deps`
  (node_modules đầy đủ, dùng chung build cache với web → không tốn thêm lớp node_modules) + `drizzle/` + `deploy/db/*.ts`,
  chạy `node --import tsx deploy/db/migrate.ts check|migrate`. Dùng **drizzle-orm migrator** (lập trình) thay `drizzle-kit migrate`
  vì cần cùng một kết nối để tính migration chờ (so `meta/_journal.json` với `drizzle.__drizzle_migrations`, đúng điều kiện
  `created_at < folderMillis` của migrator) rồi gate trước khi apply. Cùng bảng tracking với `npm run db:migrate` (local).
- **Gate destructive** (`deploy/db/migration-gate.ts`, test `deploy/db/migration-gate.test.ts` trong `npm test`): quét SQL (bỏ comment +
  chuỗi), chặn DROP/TRUNCATE/UPDATE/DELETE/ALTER TYPE RENAME|DROP; với bảng đã tồn tại thêm ALTER TABLE DROP (trừ DROP DEFAULT/NOT NULL),
  ALTER COLUMN TYPE, SET NOT NULL, ADD UNIQUE/FOREIGN KEY/PRIMARY KEY, RENAME, CREATE UNIQUE INDEX. Bảng CREATE trong cùng file được bỏ qua
  (0000 có FK trên bảng vừa tạo). Mở khoá: dòng `-- HIGH_RISK_MIGRATION: approved YYYY-MM-DD by <user>`.
- **Backup:** sidecar `nta-db-backup` (image `postgres:16.15-alpine` + script, chạy root vì thư mục host root 700), vòng lặp sleep tới
  20:00 UTC thay cho cron host (VPS dùng chung). Script copy vào image, không bind mount từ workspace runner (checkout có thể thay thư mục).
  Giữ 14 bản mỗi loại (`daily-*.dump`, `uploads-*.tar.gz`, `pre-migrate-*.dump`); ghi file tạm rồi mv; kiểm `pg_restore --list`.
  Cảnh báo (không fail) khi trống < 2048 MB. Không backup off-site (user chốt).
- **Volume DB tên cố định** `nta-db-data` (không phụ thuộc compose project name) → deploy tay từ thư mục khác không tạo DB rỗng mới.
- `nta-web` **chưa** `depends_on nta-db` (thêm ở cutover) — đã thử dừng `nta-db`, web vẫn health OK.
- **Fix round 1 (review STRICT):** tên backup pre-migrate `pre-migrate-<sha12>-<run_id>-<run_attempt>` + `backup.sh` không bao giờ ghi đè
  (trùng tên → FAILED) — re-run cùng commit không làm mất bản trước migrate. Gate quét lexical một lượt (chuỗi/'' escape/dollar-quote/comment)
  và fail-closed với `DO`, `CREATE FUNCTION|PROCEDURE`, `COPY`, `CALL`, `WITH …`, `$$`, `INSERT … SELECT` (luôn cần marker duyệt).

## 2026-10-14 — CR-031 P2-T01: import seed + parity (quy ước bản ghi)
- **Nguồn đọc:** `tools/db/file-source.ts` dùng chính hằng/loader web: MDX qua `src/lib/content/mdx-files.ts` (tách từ `load-mdx.ts`, không
  `server-only` để chạy bằng tsx; `load-mdx.ts` giữ guard + re-export → web render y nguyên), `listings.ts`, `getHomeContent`, `solutionOverview`,
  mảng `slug.ts`, `i18n/messages/{vi,en}.json`, `COMPANY_CONTACT`. Giá trị phải là JSON thuần (Date/undefined → lỗi ngay ở nguồn).
- **Khoá bản ghi:** MDX → slug = tên file (I-2 kiểm `frontmatter.slug` khớp), `data` = frontmatter, `body` = MDX đã trim (như loader);
  `about` → `about`; `listing_page`/`listing_cta` → key trang (`products|caseStudies|enterprise|ai`); `listing_item` → slug; `listing_labels` → `labels`;
  `home` → `home`; `solution_overview` → `enterprise|ai`; `ui_messages` → namespace cấp 1; `company_info` → `contact`.
- **`slug_registry`:** 1 hàng/slug, `data = {group: enterprise|ai|product}`, `sort_order` = vị trí trong mảng của nhóm. Registry và `company_info`
  không theo ngôn ngữ nhưng `locale` NOT NULL → ghi **cùng dữ liệu cho vi và en** (company-info.ts không có bản dịch; tách field theo locale khi cần ở P3-T04).
- **`sort_order`** của collection dạng object (`listing_*`, `solution_overview`, `ui_messages`) = thứ tự key trong file; MDX = null (web sắp theo date/year).
  Lưu ý cho P3: jsonb **không giữ thứ tự key** bên trong `data` — code đọc DB không được dựa vào thứ tự `Object.keys` của data.
- **Import chỉ INSERT … ON CONFLICT DO NOTHING** (1 transaction/bản ghi gồm entry v1 + version `create`/`seed`), không UPDATE/DELETE/TRUNCATE.
  Chặn DB prod (host `nta-db`, db `nta_web`, host không loopback) trừ cờ `--confirm-prod` (chỉ P4-T01).
- **Parity** so `data`/`body`/`sort_order` của hàng còn sống (deleted_at IS NULL) thuộc collection seed — thiếu/thừa/lệch đều FAIL — và chạy I-1..I-6 trên
  dữ liệu DB. I-6 chỉ kiểm enum có danh sách runtime (collection, locale, blog category, solution category); enum icon/theme chỉ là type TS → chưa kiểm.
- **Chạy thử migration trên bản restore** (`deploy/db/migrate-on-restore.sh`, MAJOR-2): build image `migrator` của commit hiện tại, chạy với
  `DATABASE_URL` trỏ `nta_restore_*`, mật khẩu đọc từ env container `nta-db` → không cần secret GitHub trên VPS (MAJOR-1).

## 2026-10-14 — CR-031 P2-T02: write-path có version + rollback + CLI
- **Quy tắc dùng chung:** src/db/content-rules.ts (thuần) — whitelist collection/locale, required fields (REQUIRED_FIELDS, kiểm qua assertRequiredFields; test đọc mã loader để bắt lệch), I-2 (slug a-z0-9-, frontmatter slug = khoá với post/solution/product/case_study), I-3/I-4 (registryProblem, hai chiều), I-6 (category blog/solution/case study, nhóm registry, icon showcase + icon nút công nghệ — danh sách runtime dựng từ Record<Union, true> nên không lệch type TS; không có enum theme trong types.ts), I-7 trích đường dẫn ảnh. tools/db/parity-check.ts và src/db/content-repo.ts cùng gọi các hàm này.
- **I-1:** tạo/sửa 1 locale khi locale kia chưa có → CHO PHÉP + trả warning (bot tạo vi rồi en tuần tự); parity vẫn báo thiếu cặp.
- **I-7:** /uploads/* phải là bản ghi asset còn sống có data.path = đường dẫn (P3-T05 theo quy ước này hoặc cập nhật); ảnh khác phải là file trong public/; đường dẫn có .. bị chặn; bản ghi asset không tự kiểm.
- **I-8:** xoá mềm bản ghi có URL công khai (post/solution/product/case_study) bị từ chối nếu thiếu confirmPublicUrlChange; có cờ → ghi + warning cần redirect 301 trong next.config.ts + deploy. updateEntry KHÔNG đổi khoá (collection/slug/locale); đổi slug = tạo bản ghi mới + xoá mềm bản cũ (content_versions không lưu slug nên đổi khoá tại chỗ làm lịch sử khó đọc/rollback sai).
- **Rollback:** ghi snapshot data/body/sort_order của version cũ thành version mới op rollback; toVersion phải < version hiện tại; snapshot validate lại như update. Entry đang xoá mềm → rollback KHÔI PHỤC (deleted_at NULL) + warning — kết quả rollback luôn là bản ghi còn sống.
- **Transaction:** SELECT FOR UPDATE → expectedVersion (lệch → ContentConflictError) → validate (ContentValidationError, không ghi) → UPDATE entry → INSERT content_versions; lỗi bất kỳ huỷ cả hai. Sửa bản ghi đã xoá mềm bị từ chối (rollback trước).
- **Migration 0001:** ALTER TABLE content_versions ADD COLUMN sort_order integer (nullable, không default) — gate OK không cần marker. Hàng version cũ để NULL; seed import ghi sort_order cho version 1 (prod chưa import).
- **Test DB của write-path** tạo database riêng nta_repo_test_* rồi xoá (không đụng DB seed-db.test). Test có import tools/db nằm trong tools/db vì tools/ bị .dockerignore loại.

## 2026-10-14 — CR-031 P3-T01: cờ CONTENT_SOURCE + store đọc DB cho loader MDX
- **Cờ `CONTENT_SOURCE=file|db`** (src/lib/content/source.ts), đọc env lúc gọi (runtime, không đóng băng lúc build). Chưa đặt/rỗng → `file`.
  **Giá trị lạ → ném lỗi** (không fallback file + log): sau cutover, fallback âm thầm sẽ phục vụ nội dung file cũ trong khi người sửa đang sửa DB;
  lỗi to lộ ra ngay ở smoke test cutover. Chế độ `file` gọi đúng `loadMdxDirectory` cũ (cùng thứ tự readdir, cùng dữ liệu, cùng nhãn lỗi `src/content/...`).
- **Store** (src/lib/content/store.ts, server-only): `getEntries(collection, locale)`, `getEntry(collection, slug, locale)` bọc `unstable_cache`
  (key gồm collection/locale/slug; tag `content`, `content:<collection>`, và `content:<collection>:<slug>` cho getEntry). Danh sách chỉ mang tag collection
  (lúc đọc chưa biết slug) → P3-T03 revalidate khi sửa 1 bản ghi phải bắn cả `content:<collection>`. Phần query thuần ở src/db/content-read.ts (lọc deleted_at IS NULL,
  sort sort_order rồi slug theo code point — không phụ thuộc collation Postgres).
- **Loader MDX chế độ db:** `{...data, body}` rồi đi qua CÙNG hàm validate/map/sort như file (toPost, assertCollectionFields, sort date; compareCaseStudies ở caller).
  Thứ tự mặc định = sort theo tên file `<slug>.mdx` (khớp readdir NTFS/thứ tự chữ). Không dùng thứ tự key jsonb. `getXBySlug` vẫn tìm trong danh sách (cùng code path file);
  `getEntry` có sẵn cho task sau. Required fields: loader dùng `REQUIRED_FIELDS` (src/db/content-rules.ts) qua `assertCollectionFields` — nguồn duy nhất.
  `MDX_COLLECTION_DIRECTORIES`/`ABOUT_SLUG` chuyển về src/lib/content/mdx-files.ts, tools/db/file-source.ts re-export.
- **DB lỗi:** store bọc lỗi thành `[content-store] Không đọc được nội dung <collection>/<locale>[/<slug>] từ DB` (cause giữ lỗi gốc, không chứa DATABASE_URL) và NÉM.
  unstable_cache không lưu kết quả reject → trang đã cache (full route cache / data cache) vẫn 200, trang chưa cache 500, DB lên lại tự phục hồi.
- **Lazy:** src/db/client.ts không kết nối lúc import; loader chỉ gọi `getDb()` khi `CONTENT_SOURCE=db` → `next build` chế độ file không cần DB.
  Lưu ý cho P3-T02: hiện các route vẫn SSG — build chế độ `db` cần DB lúc build (trang prerender bằng dữ liệu DB lúc build).
- **Test loader ngoài Next:** tools/db/test-stubs/register.ts dùng `module.registerHooks` trỏ `server-only`/`next/cache` sang stub (unstable_cache = gọi thẳng) →
  test kiểm dữ liệu + lỗi, không kiểm cache Next (cache kiểm bằng bản build thật trong container).
