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
