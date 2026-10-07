# PERMISSION.md — Roles & Guard Order

> ⚠️ Phải **sync với code thật** (model `Role` + seed + middleware guard). Nếu lệch → code thắng.
> Cách sync: đọc seed/quyền trong code + chạy `check_commands.docs_inventory`, rồi cập nhật file này.

## Roles

| Role | Mô tả | Nguồn (code) |
|------|-------|--------------|
| `VISITOR` | Khách công khai — xem nội dung + gửi form liên hệ | không có auth (public) |
| `ADMIN` | Quản trị nội dung (blog/case study) — **chưa có ở v1** | _(phase sau)_ |

> NTA Website v1 **không có đăng nhập người dùng**. Toàn bộ nội dung công khai.

## Guard order (thứ tự middleware trên route)

> Thứ tự quan trọng: auth → role → ownership → rate-limit → handler.

Với website tĩnh + 1 endpoint công khai:

1. **`rateLimit`** — chỉ áp cho `POST /api/contact` (chống spam/flood).
2. **`validate(schema)`** — validate body form (name/email/phone/message) trước business logic.
3. **`honeypot`** — trường ẩn phải rỗng; nếu có giá trị → coi là bot, trả 200 giả (không gửi).
4. **handler** — forward email/lưu tạm, trả `{ status: "ok" }`.

Các route còn lại (trang nội dung) không cần guard — render tĩnh/SSR công khai.

## Route ↔ permission matrix

| Route | Method | Ai được truy cập | Guard |
|-------|--------|------------------|-------|
| `/` và mọi trang nội dung | GET | Tất cả (public) | — |
| `/api/health` | GET | Tất cả (public) | — |
| `/api/contact` | POST | Tất cả (public) | rateLimit + validate + honeypot |
| `/api/posts`, `/api/case-studies` | GET | Tất cả (public) | — |

## Ghi chú bảo mật

- Không lộ secret ra client: biến `NEXT_PUBLIC_*` chỉ dùng cho giá trị công khai.
- Secret (token mail/API) để ở Secret Manager / env server — xem `.devops/templates/gcp-cloud-run.md` mục 4.
- Chi tiết hardening: `skills/security/` (nếu bật).
