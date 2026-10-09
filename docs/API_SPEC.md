# API Specification — Overview & Pointers

> ⚠️ **Không nhúng code/schema tay ở đây** — sẽ lệch với code thật.
> File này là **overview + pointer** tới source of truth.

## Source of truth (theo thứ tự ưu tiên)

1. **Code thật** — route/controller/validation trong `source_roots` (xem `.context/project-config.md`).
2. **Shared contract types** — `src/shared/types/api.ts` (client & server cùng import).
3. **Generated inventory** — `docs/generated/` (tạo bằng `check_commands.docs_inventory`; chỉ chạy lại, không sửa tay).
4. **OpenAPI/Swagger** (nếu có) — file do tooling sinh, không sửa tay.

> Nếu overview này khác code → **code thắng**. Cập nhật overview hoặc chạy lại inventory.

## Base URL

```
Development: http://localhost:3000/api
Production:  https://ntavietnam.tech/api
```

## Phạm vi API (NTA Website v1)

Website v1 là **content-driven, không có đăng nhập người dùng**. API tối giản:

| Method | Endpoint | Mục đích | Auth |
|--------|----------|----------|------|
| POST | `/api/contact` | Nhận form liên hệ (tên, email, SĐT, nội dung) | công khai + rate-limit |
| GET | `/api/health` | Health check / uptime | công khai |
| GET | `/api/posts` | Danh sách bài blog (nếu cần động; v1 có thể là static) | công khai |
| GET | `/api/case-studies` | Danh sách case study (nếu cần động) | công khai |

> Hầu hết nội dung (trang tĩnh, giải pháp, sản phẩm, case study) render **SSG/SSR** từ file nội dung
> trong repo — không cần API riêng. Chỉ form liên hệ + health là bắt buộc.

## Authentication

Không có auth người dùng ở v1. Chi tiết hardening form/rate-limit: `skills/security/`.

### POST /api/contact — request

```jsonc
{
  "name": "string (bắt buộc, 2–100 ký tự)",
  "email": "string (bắt buộc, định dạng email)",
  "phone": "string (tuỳ chọn, 9–15 số)",
  "message": "string (bắt buộc, 10–2000 ký tự)",
  "honeypot": "" // trường ẩn chống spam — phải rỗng
}
```

### POST /api/contact — response

```jsonc
// 200 OK
{ "status": "ok" }
// 400 — lỗi validate
{ "status": "error", "errors": { "email": "Email không hợp lệ" } }
// 429 — quá nhiều request
{ "status": "error", "message": "Vui lòng thử lại sau." }
```

### GET /api/health — response

```jsonc
{ "status": "ok", "timestamp": "2026-10-07T15:00:00.000Z" }
```

> Chi tiết route/validation thật ở `src/app/api/**` khi code được dựng — **code là source of truth**.
