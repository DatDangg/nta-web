# src/content — seed nội dung (CR-031)

File MDX/TS trong thư mục này là **seed import ban đầu** vào PostgreSQL. **Nguồn sự thật của nội dung là DB** (`content_entries`, xem `docs/ERD.md`):
prod đọc DB từ 14/10/2026 (`CONTENT_SOURCE=db`, cutover CR-031 P4-T01). Sửa file ở đây **không làm đổi website** — nội dung sửa qua bot (CR-030)
hoặc CLI `npm run db:cli` (có lịch sử phiên bản + rollback), rồi revalidate.

Ngoại lệ — giữ lâu dài làm **bản dự phòng + chuẩn cấu trúc** (không nằm trong thư mục này, không xoá kể cả khi bỏ cờ):
`src/i18n/messages/{vi,en}.json` và `COMPANY_CONTACT` (`src/lib/contact/company-info.ts`). Chế độ `db` gộp sâu bản ghi DB đè lên file:
key DB thiếu → lấy từ file + `console.warn` `[content-shape]` (`src/lib/content/shape.ts`). Thêm key mới vào file thì nhớ bổ sung vào DB.

## Import + parity (`tools/db/`, chi tiết `docs/runbook/db.md` §8)

| Lệnh | Việc |
|---|---|
| `npm run db:import-seed -- --dry-run` | đếm bản ghi theo collection/locale, không cần DB |
| `npm run db:import-seed` | chỉ `INSERT … ON CONFLICT DO NOTHING` (chạy lại = 0 bản ghi mới, không ghi đè bản đã sửa); DB prod cần `--confirm-prod` |
| `npm run db:parity` | so DB ↔ file (data/body/sort_order) + I-1..I-6 + required fields; exit 1 nếu lệch |

Trên VPS dùng workflow **Content ops** (`parity`, `import-seed`, …) — `docs/runbook/cutover-content-db.md`.
Sau cutover, parity **sẽ FAIL "lệch"** khi DB đã được sửa qua bot/CLI — đó là đúng (DB đi trước seed), không phải lỗi.

## Cờ `CONTENT_SOURCE` (server-only, `src/lib/content/source.ts`)

| Giá trị | Nguồn |
|---|---|
| `db` (**prod hiện tại**) | `content_entries` (bản ghi còn sống) qua `src/lib/content/store.ts`, data cache tag `content`, `content:<collection>`, `content:<collection>:<slug>`; cần `DATABASE_URL` |
| chưa đặt / rỗng / `file` (mặc định, đường lùi) | đọc file trong thư mục này + registry TS (`listings.ts`, `home.ts`, `solutions/overview.ts`, `src/lib/content/slug.ts`) + messages/company-info |
| giá trị khác | lỗi rõ `CONTENT_SOURCE không hợp lệ` (không fallback âm thầm) |

Cờ đọc lúc request; build không prerender trang nội dung nên đổi cờ không cần build lại. Bỏ cờ + đường đọc file ở web:
`tasks/feature-content-database/phase-5-task-02.md` (chưa làm) — sau đó thư mục này chỉ còn dùng cho seed/parity.
