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

Website **không có đăng nhập người dùng**. Route thật (`src/app/api/**`, `src/app/uploads/**`):

| Method | Endpoint | Mục đích | Auth |
|--------|----------|----------|------|
| POST | `/api/contact` | Nhận form liên hệ (tên, email, SĐT, nội dung) → forward Apps Script Web App `CONTACT_FORM_TARGET` → gửi 1 email tới Script Property `ADMIN_EMAIL` (CR-039; không Sheet/Telegram, không lưu DB web) | công khai + rate-limit |
| GET | `/api/health` | Health check / uptime | công khai |
| POST | `/api/revalidate` | Làm mới data cache nội dung DB theo tag (CR-031) | header `x-revalidate-secret` + rate-limit |
| GET | `/uploads/<sha256>.<ext>` | Phục vụ ảnh upload từ volume (CR-031) | công khai |

> Không có API đọc nội dung (posts/case studies…): trang nội dung render phía server, đọc PostgreSQL qua data cache có tag
> (prod `CONTENT_SOURCE=db` từ 14/10/2026) — kiến trúc ở `docs/DESIGN.md` § Kiến trúc nội dung & render.

## Authentication

Không có auth người dùng. `/api/revalidate` dùng shared secret `REVALIDATE_SECRET` (máy-với-máy). Chi tiết hardening form/rate-limit: `skills/security/`.

### POST /api/contact — request

```jsonc
{
  "name": "string (bắt buộc, 2–100 ký tự)",
  "email": "string (bắt buộc, định dạng email)",
  "phone": "string (tuỳ chọn, 9–15 số)",
  "company": "string (tuỳ chọn, ≤150 ký tự) — Tên doanh nghiệp/Tổ chức",
  "need": "crm|dentgo|lms|hrm|boxai|custom-ai|flycam|custom-software|other (tuỳ chọn) — Nhu cầu",
  "message": "string (bắt buộc, 10–2000 ký tự)",
  "honeypot": "", // trường ẩn chống spam — phải rỗng
  "locale": "vi|en (tuỳ chọn) — ngôn ngữ trang gửi; thiếu/'' → vi; giá trị khác → 400 errors.locale (CR-037)"
}
```

`company` / `need` thêm ở spec 3.6.0 (CR-008), được chuyển tiếp nguyên trạng sang `CONTACT_FORM_TARGET`.
`locale` (CR-037): `src/lib/contact/useContactForm.ts` gửi theo `useLocale()` cho cả `/contact`, `/en/contact` và form CTA;
validate ở `src/lib/api/contact-schema.ts`.
Form trang `/contact` bắt buộc thêm `phone` + `need` và giới hạn `message` ≤500 ở client; API giữ tuỳ chọn để form CTA
rút gọn (name/email/message) ở trang chi tiết giải pháp vẫn hợp lệ. Danh sách key `need`: `src/lib/contact/company-info.ts`.

### POST /api/contact — response

```jsonc
// 200 OK
{ "status": "ok" }
// 400 — lỗi validate
{ "status": "error", "errors": { "email": "Email không hợp lệ" } }
// 429 — quá nhiều request
{ "status": "error", "message": "Vui lòng thử lại sau." }
// 500 — chưa cấu hình / Web App lỗi / timeout (message chung, không lộ URL/token)
{ "status": "error", "message": "Không thể gửi yêu cầu lúc này." }
```

Thứ tự guard (R-18, `src/app/api/contact/route.ts`): rate-limit → JSON → validate → honeypot có giá trị thì trả 200 giả,
**không** forward → forward → lỗi forward = 500.

### Forward tới Apps Script (R-13a, CR-037 → CR-039)

Code: `src/lib/api/forward.ts` (`forwardContactForm`); script nhận: `tools/contact-mail/Code.gs` + `README.md`.
Script hợp lệ token + payload → gửi **đúng 1 email** plain text (`MailApp`) tới Script Property `ADMIN_EMAIL`
(`replyTo` = email khách, tiêu đề `[NTA] Liên hệ mới — <tên>`); không ghi Sheet, không Telegram (CR-039).

- **Env (server-only, runtime):** `CONTACT_FORM_TARGET` = URL Web App `…/exec`, `CONTACT_FORM_TOKEN` = token khớp
  Script Property `SECRET_TOKEN`. Thiếu một trong hai, hoặc tồn tại `NEXT_PUBLIC_CONTACT_FORM_TARGET` /
  `NEXT_PUBLIC_CONTACT_FORM_TOKEN` → không gọi mạng, route trả 500.
- **Request:** `POST <CONTACT_FORM_TARGET>`, `Content-Type: application/json`, `redirect: 'follow'`, timeout 10 000 ms:

```jsonc
{ "token": "<CONTACT_FORM_TOKEN>", "submittedAt": "2026-10-15T08:00:00.000Z", "locale": "vi",
  "name": "...", "email": "...", "phone": "..." | null, "company": "..." | null, "need": "crm" | null, "message": "..." }
```

- **Thành công chỉ khi** HTTP ok **và** body JSON là `{ "status": "ok" }` (= script đã gửi mail; thiếu `ADMIN_EMAIL` / gửi lỗi /
  hết hạn mức → `{"status":"error","code":"server_error"}`) (Web App trả 302 → `script.googleusercontent.com`,
  fetch Node theo redirect bằng GET). `{"status":"error","code":…}`, trang HTML của Google, HTTP lỗi, lỗi mạng, timeout
  → ném lỗi message chung (không chứa URL/token) → 500.
- **Residual risk (trùng mail hiếm gặp):** timeout web 10 s → script gửi mail xong muộn hơn thì web báo lỗi; khách gửi lại
  → admin nhận 2 mail cùng nội dung. Chấp nhận (`docs/runbook/deploy-vps.md` § sự cố form liên hệ).

### GET /api/health — response

```jsonc
{ "status": "ok", "timestamp": "2026-10-07T15:00:00.000Z" }
```


### POST /api/revalidate — làm mới data cache nội dung DB (CR-031 P3-T03, spec R-15a)

Code: `src/app/api/revalidate/route.ts` → `src/lib/api/revalidate.ts` (`handleRevalidateRequest`); tag: `src/lib/content/cache-tags.ts`.
Người gọi: bot CR-030, `npm run db:cli -- revalidate …`, workflow Content ops `revalidate-all`. Chỉ `POST` (method khác → 405). Middleware next-intl không chạy cho `/api/*`.

- **Header:** `x-revalidate-secret: <REVALIDATE_SECRET>` (so constant-time sau khi trim 2 phía).
- **Body (JSON, đúng 1 trong 2 dạng; key thừa / trộn dạng → 400):**

```jsonc
{ "all": true }                                   // → tag "content"
{ "collection": "post" }                           // → tag "content:post"
{ "collection": "post", "slug": "ten-bai-viet" }   // → tag "content:post" + "content:post:ten-bai-viet"
// collection ∈ CONTENT_COLLECTIONS (src/db/schema.ts); slug khớp /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/
```

- **Response** (mọi status đều `Cache-Control: no-store`), thứ tự kiểm: rate-limit → secret server → secret request → body:

| Status | Body | Khi nào |
|---|---|---|
| 200 | `{ "status": "ok", "revalidated": ["content:post", "content:post:x"] }` | thành công |
| 400 | `{ "status": "error", "message": "invalid_json" \| "invalid_body" \| "unknown_collection" }` | body không phải JSON / sai dạng / collection ngoài whitelist |
| 401 | `{ "status": "error", "message": "unauthorized" }` | thiếu/sai header secret |
| 429 | `{ "status": "error", "message": "too_many_requests" }` | > 30 request / 60 s / IP (`src/lib/api/rate-limit.ts`, in-memory) |
| 503 | `{ "status": "error", "message": "unavailable" }` | server chưa đặt `REVALIDATE_SECRET` (log lỗi phía server) |

### GET /uploads/&lt;sha256&gt;.&lt;ext&gt; — ảnh upload (CR-031 P3-T05, R-16d)

Code: `src/app/uploads/[...path]/route.ts` → `src/lib/uploads/serve-upload.ts`; đọc `UPLOAD_DIR` (prod `/app/uploads` ← `/opt/nta-web-data/uploads`).
Không có API upload HTTP — ảnh được lưu bằng `saveImage` (`src/lib/uploads/save-image.ts`, CLI `db:cli -- upload`, bot CR-030).

- Đường dẫn hợp lệ: đúng 1 segment khớp `^[0-9a-f]{64}\.(jpg|png|webp)$`, file thường nằm ngay trong `realpath(UPLOAD_DIR)`.
- **200:** body ảnh, `Content-Type` theo đuôi, `Cache-Control: public, max-age=31536000, immutable` (tên = hash nội dung), `X-Content-Type-Options: nosniff`.
- **404:** tên sai mẫu (`..`, `%2e%2e`, `%2F`, `\`, chữ hoa, đuôi lạ), không tồn tại, symlink ra ngoài, không phải file thường —
  `text/plain`, `Cache-Control: no-store`, `nosniff`. Method khác GET → 405.
- Xoá mềm bản ghi `asset` không xoá file → URL vẫn 200. `next/image` tối ưu được (`images.localPatterns` gồm `/uploads/**` — `next.config.ts`).

> Chi tiết route/validation thật ở `src/app/api/**`, `src/app/uploads/**`, `src/lib/api/**`, `src/lib/uploads/**` — **code là source of truth**.
