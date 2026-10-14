# feature-content-database · phase-3-task-04 — Chữ giao diện (next-intl messages) + thông tin công ty đọc từ DB

- **CR:** CR-031 · spec R-16 (4.2.0, quyết định #9)
- **Classification / Risk:** MODIFY (i18n + shared) · HIGH
  - Expected review level: **STRICT** (shared i18n cho mọi trang, footer/liên hệ, navigation)
  - Blast radius: `src/i18n/request.ts`, `src/lib/contact/company-info.ts` + ~6 file dùng, mọi trang (messages).
  - Doc impact: DESIGN, content-bot 08/09 (phase 5).

## Scope
1. `getRequestConfig`: `CONTENT_SOURCE=db` → messages lấy từ collection `ui_messages` (gộp namespace) qua `store.ts` có cache tag
   `content:ui_messages`; `file` → import JSON như hiện tại (fallback). Validate: bản DB phải đủ key như file seed (thiếu key → lỗi rõ, không render chuỗi rỗng).
2. `company-info.ts` → getter async đọc collection `company_info` theo locale (chế độ `file` giữ hằng hiện tại); cập nhật nơi dùng.
3. Revalidate (P3-T03) nhận `ui_messages`, `company_info` trong whitelist.
4. Kiểm: chế độ `file` HTML y nguyên; chế độ `db` sửa 1 chuỗi messages + 1 trường company-info → revalidate → web đổi không build.

## Acceptance
- 2 chế độ cờ đều build + chạy; parity HTML chế độ `db` = `file`. typecheck/lint/test/build PASS.
