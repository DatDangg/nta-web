# ERD — Overview & Pointers

> ⚠️ **Không nhúng schema tay ở đây** — sẽ lệch với migration thật.
> File này là **overview + pointer** tới source of truth.

## Source of truth

1. **Migration files** — versioned, đã commit: `drizzle/0000_empty_supernaut.sql` (2 bảng), `drizzle/0001_aromatic_rattler.sql`
   (`content_versions.sort_order`), journal `drizzle/meta/_journal.json`. Sinh bằng `npm run db:generate`; áp bằng deploy (`nta-migrate`)
   hoặc `npm run db:migrate` (local). **Cấm** `drizzle-kit push`.
2. **Schema file** — `src/db/schema.ts` (Drizzle, PostgreSQL).
3. **Quy tắc tầng app** — `src/db/content-rules.ts` (whitelist, required fields, invariant) + write-path `src/db/content-repo.ts`.
4. **Generated inventory** — `docs/generated/` (chạy lại `node scripts/generate-inventory.mjs`, không sửa tay).

> Nếu overview này khác migration/schema → **migration/schema thắng**.

## Database

**Type:** PostgreSQL 16 (container `nta-db`, image `postgres:16.15-alpine`, DB `nta_web`) — từ CR-031 (spec R-16)
**ORM:** Drizzle (`drizzle-orm` + `drizzle-kit`) — `.context/project-config.md` → `db_tool: drizzle`, `migration_required: true`
**Kết nối:** `src/db/client.ts` (lazy — import không mở kết nối, `getDb()` mới cần `DATABASE_URL`) → `next build` không cần DB.
**Vận hành:** `docs/runbook/db.md` (backup/restore/migrate), cutover `docs/runbook/cutover-content-db.md` (prod đọc DB từ 14/10/2026).

Mô hình **document store**: mỗi bản ghi nội dung (1 file MDX hoặc 1 object TS trước đây) = 1 hàng; frontmatter/object giữ nguyên
trong `data` (jsonb). Không tách bảng con (showcase, gallery, milestones…) — ràng buộc field nằm ở tầng app (`.context/decisions.md` CR-031 P1-T01).

**Không lưu DB:** form liên hệ (`POST /api/contact`) vẫn chỉ forward sang `CONTACT_FORM_TARGET`, không có bảng submission.
Đích là Google Apps Script Web App (R-13a) → từ CR-039 mỗi lượt gửi = 1 email tới Script Property `ADMIN_EMAIL`
(`tools/contact-mail/Code.gs`), không ghi Google Sheet, không Telegram; web không giữ bản sao (`src/lib/api/forward.ts`).

## Bảng

| Bảng | Mục đích | Cột chính | Ràng buộc DB |
|---|---|---|---|
| `content_entries` (`src/db/schema.ts` `contentEntries`) | 1 hàng = 1 bản ghi nội dung hiện tại | `collection`, `slug`, `locale`, `data` jsonb, `body` (MDX), `sort_order`, `version`, `deleted_at`, `created_at`, `updated_at`, `updated_by` | UNIQUE(`collection`,`slug`,`locale`) — kể cả hàng xoá mềm; CHECK `locale IN ('vi','en')`; CHECK `version >= 1`; index một phần (`collection`,`locale`) WHERE `deleted_at IS NULL` |
| `content_versions` (`contentVersions`) | Lịch sử append-only, mỗi lần ghi 1 hàng (cùng transaction với entry) | `entry_id` → `content_entries.id`, `version`, `op`, `data`, `body`, `sort_order` (0001, hàng cũ NULL), `actor` (`seed` / `cli:<user>` / `bot:<telegram-id>`), `note`, `created_at` | FK `entry_id`; UNIQUE(`entry_id`,`version`); CHECK `op IN ('create','update','delete','rollback')` |

Quan hệ: `content_entries` 1 — n `content_versions`.

- **Version:** `version` tăng 1 mỗi lần ghi; ghi ở tầng app (`src/db/content-repo.ts`: `SELECT … FOR UPDATE` → kiểm `expectedVersion`
  → validate → UPDATE entry → INSERT version), không trigger DB. Lệch `expectedVersion` → `ContentConflictError`, không ghi.
- **Xoá mềm:** `deleted_at` ≠ NULL → ẩn khỏi mọi đọc của web (`src/db/content-read.ts` lọc `deleted_at IS NULL`); hàng + lịch sử còn để rollback.
- **Rollback:** ghi snapshot `data/body/sort_order` của version cũ thành version mới `op=rollback` (không sửa/xoá lịch sử); bản ghi đang xoá mềm được khôi phục.
- **Khoá không đổi tại chỗ:** đổi slug = tạo bản ghi mới + xoá mềm bản cũ.

## Collection (`CONTENT_COLLECTIONS`, `src/db/schema.ts`)

Whitelist chỉ kiểm ở tầng app (`isContentCollection`) — **không** CHECK ở DB để mở rộng không cần migration.

| Collection | Khoá `slug` | Nguồn seed (file) |
|---|---|---|
| `post`, `solution`, `product`, `case_study` | slug = tên file MDX (URL công khai) | `src/content/{blog,solutions,products,case-studies}/{vi,en}/*.mdx` |
| `about` | `about` | `src/content/about/{vi,en}/*.mdx` |
| `listing_page`, `listing_cta` | `products` / `caseStudies` / `enterprise` / `ai` | `src/content/listings.ts` |
| `listing_item` | slug item | `src/content/listings.ts` |
| `listing_labels` | `labels` | `src/content/listings.ts` |
| `home` | `home` | `src/content/home.ts` |
| `solution_overview` | `enterprise` / `ai` | `src/content/solutions/overview.ts` |
| `slug_registry` | slug; `data = {group: enterprise\|ai\|product}`, `sort_order` = vị trí trong nhóm (ghi giống nhau cho vi + en) | `src/lib/content/slug.ts` |
| `ui_messages` | namespace cấp 1 của next-intl | `src/i18n/messages/{vi,en}.json` |
| `company_info` | `contact` | `COMPANY_CONTACT` — `src/lib/contact/company-info.ts` |
| `asset` | sha256 ảnh; `locale` cố định `vi`; `data = {path, sha256, mime, bytes, width, height, alt, originalName?}` | không seed — tạo bằng `saveImage` (`src/lib/uploads/save-image.ts`) |

Số bản ghi seed 14/10/2026: 68 mỗi locale, tổng 136 (chi tiết `docs/runbook/db.md` §8). Prod import 136/136, parity PASS (P4-T01 B4).

## Invariant (tầng app — `src/db/content-rules.ts`, `src/db/content-repo.ts`, parity `tools/db/parity-check.ts`)

| # | Ràng buộc | Thực thi |
|---|---|---|
| I-1 | Mỗi slug có đủ cặp vi + en | write-path: **cảnh báo**, không chặn (bot tạo vi rồi en); parity: FAIL; bỏ qua cho `asset` |
| I-2 | slug `a-z0-9-`; frontmatter `slug` = khoá (post/solution/product/case_study) | chặn |
| I-3 / I-4 | solution/product phải có trong `slug_registry` đúng nhóm (`category` solution = nhóm registry) và ngược lại | chặn khi nội dung thiếu/sai nhóm registry hoặc xoá registry lúc nội dung còn sống; cảnh báo khi registry chưa có nội dung |
| I-5 | Khoá (`collection`,`slug`,`locale`) duy nhất kể cả hàng xoá mềm | UNIQUE DB + báo lỗi rõ ở write-path |
| I-6 | Enum hợp lệ: collection, locale, category blog/solution/case study, nhóm registry, icon showcase; `company_info` (`tel:`/`mailto:`/Google Maps https) | chặn |
| I-7 / I-8 | Ảnh tham chiếu tồn tại (`/uploads/*` = asset còn sống; còn lại trong `public/`); xoá bản ghi URL công khai cần cờ xác nhận + redirect 301 | chặn / chặn nếu thiếu cờ |

Định nghĩa đầy đủ + required fields theo collection (`REQUIRED_FIELDS`): `src/db/content-rules.ts`; quyết định: `.context/decisions.md` (CR-031 P2-T01, P2-T02, P3-T04, P3-T05).

## Entity nội dung (mức nghiệp vụ)

| Entity | Collection | Quan hệ chính |
|--------|-----------|---------------|
| Solution | `solution` (+ `slug_registry`, `solution_overview`) | thuộc 1 category (enterprise/ai); liên quan CaseStudy |
| Product | `product` (+ `slug_registry`) | has many screenshot (trong `data`) |
| CaseStudy | `case_study` | thuộc 1 category; gallery + related trong `data` |
| Post | `post` | category blog |
| Asset (ảnh upload) | `asset` | file `/uploads/<sha256>.<ext>` trên volume; bản ghi khác tham chiếu qua `data.path` |
| ContactSubmission | — (không lưu DB web; không Sheet — mỗi lượt gửi = 1 email tới `ADMIN_EMAIL`) | transient, forward qua `CONTACT_FORM_TARGET` (Apps Script gửi mail, CR-039) |

## Migration gate

- Migration versioned + committed; không sửa migration đã apply.
- Deploy chạy gate destructive (`deploy/db/migration-gate.ts`) trước migrate; thao tác phá hoại cần marker `-- HIGH_RISK_MIGRATION: approved …`
  (`docs/runbook/db.md` §6). Không có DB staging → chạy thử migration trên bản restore (`db.md` §5b).
