# ERD — Overview & Pointers

> ⚠️ **Không nhúng schema tay ở đây** — sẽ lệch với migration thật.
> File này là **overview + pointer** tới source of truth.

## Source of truth

1. **Migration files** — versioned, đã commit (tool: `.context/project-config.md` → `db_tool`).
2. **Schema file** — vd `prisma/schema.prisma` / `drizzle/schema.ts` / model files trong `source_roots`.
3. **Generated inventory** — `docs/generated/` (chạy lại, không sửa tay).

> Nếu overview này khác migration/schema → **migration/schema thắng**.

## Database

**Type:** none (v1 — website content-driven)
**ORM:** none
**Ghi chú:** `.context/project-config.md` → `db_tool: none`, `migration_required: false`.

> NTA Website v1 **không cần DB**: nội dung (trang, giải pháp, sản phẩm, case study, blog) nằm ở
> file nội dung trong repo (MDX / JSON / TS) và render SSG/SSR. Form liên hệ forward qua email/API
> bên thứ ba (xem Open Questions trong BRD) — chưa cần lưu DB.

## Entity overview

| Entity | Mục đích | Quan hệ chính |
|--------|----------|---------------|
| Solution | Giải pháp (doanh nghiệp: CRM/HRM/LMS/DentGo; AI: BoxAI/Flycam/Custom) | thuộc 1 Category; has many CaseStudy (liên quan) |
| Product | App AI (Music, Hair-style) | has many Screenshot |
| CaseStudy | Dự án tiêu biểu (Óc Eo, phòng khám…) | thuộc 1 Solution/Category; has many Image |
| Post | Bài blog/tin tức | has many Tag |
| ContactSubmission | Dữ liệu form liên hệ (transient, forward) | — |

> v1: các entity này nằm dưới dạng **file nội dung tĩnh** (không phải bảng DB).
> Khi bổ sung CMS/DB ở phase sau, chuyển sang schema thật và cập nhật file này.

## Nếu thêm DB ở phase sau

- Khai `db_tool` (`prisma` | `drizzle` | `other`) + `migration_required: true` trong `.context/project-config.md`.
- Migration phải versioned + committed; tuân thủ migration gate (xem `project-config.md` → mục DB/migration).
- `staging_db` phải khác `prod_db`.
