# Content Bot — Bộ context nội dung nta-web

Bộ tài liệu này là **context nạp cho bot Telegram** (gọi API model) để bot thêm / sửa / xoá nội dung
website nta-web mà không cần đọc codebase. Cập nhật **2026-10-15**: prod đọc nội dung từ **PostgreSQL** (CR-031);
bot ghi qua `db:cli` (create / update / delete / rollback / upload / revalidate — CR-030).

> Bot luôn coi **DB là sự thật**: đọc bản ghi hiện tại bằng `db:cli show` / `list` mỗi lần làm việc.
> File `src/content/**` chỉ là seed cũ — sửa file KHÔNG đổi web.

| File | Nội dung | Khi nào bot cần |
|---|---|---|
| [00-overview.md](00-overview.md) | Mục tiêu (website + bot), stack, danh sách tài liệu nguồn | Đọc đầu tiên |
| [01-site-map.md](01-site-map.md) | URL ↔ collection/bản ghi | Luôn nạp |
| [02-schemas.md](02-schemas.md) | Field từng loại nội dung (= `data` của bản ghi) + enum hợp lệ | Luôn nạp |
| [03-registries.md](03-registries.md) | Bản ghi phải ghi kèm khi thêm/xoá/đổi slug | Khi thêm / xoá / đổi slug |
| [04-content-rules.md](04-content-rules.md) | Luật nội dung (BR-004, song ngữ, ảnh/alt, cú pháp MDX an toàn) | Luôn nạp |
| [05-playbook.md](05-playbook.md) | Lệnh CLI + quy trình thêm/sửa/xoá/hoàn tác | Luôn nạp |
| [06-templates.md](06-templates.md) | Khung tối thiểu cho từng loại (chuyển sang JSON `data`) | Khi tạo mới |
| [07-bot-system-prompt.md](07-bot-system-prompt.md) | System prompt + định dạng output + guardrail cho bot | Nạp làm system prompt |
| [08-data-model.md](08-data-model.md) | Bảng, collection, khoá, version, ràng buộc I-1..I-8 | Luôn nạp |
| [09-web-to-data-map.md](09-web-to-data-map.md) | Khối nhìn thấy trên web → bản ghi + field | Khi lệnh mô tả theo giao diện |
| [10-server.md](10-server.md) | VPS, Docker, DB, secret, backup, cách chạy CLI cho bot | Cho người cài bot — **không** nạp vào prompt |

## Gợi ý nạp context (tiết kiệm token)

1. System prompt = `07` + `04` + `02` + `08` + `09` (cố định → bật prompt caching).
2. Mỗi lệnh: kèm `01`, `05`, và **output `show` các bản ghi đang bị sửa** (cả vi + en).
3. Thêm mới / xoá / đổi slug: kèm thêm `03`, `06` và `show` các bản ghi registry liên quan.
4. Thêm mới: kèm `show` 1 bản ghi **cùng loại** làm mẫu (vd `solution/vi/crm`).

## Đồng bộ tài liệu

Khi đổi schema (`src/content/types.ts`, `src/db/content-rules.ts`), collection (`src/db/schema.ts`) hoặc CLI
(`tools/db/content-cli.ts`) → cập nhật bộ tài liệu này trong cùng change request.
