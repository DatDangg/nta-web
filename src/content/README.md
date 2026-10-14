# src/content — seed nội dung (CR-031)

File MDX/TS trong thư mục này là **seed import ban đầu** vào PostgreSQL (`npm run db:import-seed`, xem `tools/db/`).
**Sau cutover (CR-031 P4-T01) đây KHÔNG còn là nguồn sự thật** — nội dung sửa qua DB (bot/CLI `npm run db:cli`, có lịch sử phiên bản);
sửa file ở đây không làm đổi website.

## Cờ `CONTENT_SOURCE` (server-only)

> ⚠️ Cho tới khi P3-T02 đổi chiến lược render, các route vẫn prerender lúc build → cờ phải **giống nhau ở build và runtime**
> (đặt `db` chỉ ở runtime sẽ trộn trang prerender từ file với trang render động từ DB). Không bật `db` ở môi trường nào trước P3-T03 (revalidate).

| Giá trị | Loader MDX (`src/lib/content/{posts,solutions,products,case-studies,about}.ts`) |
|---|---|
| chưa đặt / rỗng / `file` (mặc định) | đọc file trong thư mục này — hành vi trước CR-031 |
| `db` | đọc bảng `content_entries` (bản ghi còn sống) qua `src/lib/content/store.ts`, có data cache tag `content`, `content:<collection>`, `content:<collection>:<slug>`; cần `DATABASE_URL` |
| giá trị khác | lỗi rõ `CONTENT_SOURCE không hợp lệ` (không fallback âm thầm) |

Registry TS (`listings.ts`, `home.ts`, `solutions/overview.ts`, mảng slug), chữ giao diện và thông tin công ty vẫn đọc từ file
cho tới CR-031 P3-T02/P3-T04. Phase 5 bỏ cờ và đường đọc file.
