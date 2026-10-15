---
id: telegram-content-bot
type: feature
status: done
completed: 2026-10-15
created: 2026-10-14
---

# Bot Telegram thêm / sửa / xoá nội dung website

## Yêu cầu
Bot Telegram (user tạo qua BotFather) chạy trên VPS: người quản trị nhắn lệnh → bot gọi Claude API sửa file
nội dung trong `src/content` → gửi tóm tắt thay đổi + link xem trước → nút [Duyệt] / [Sửa] / [Huỷ]
→ Duyệt thì commit + push `main` → CI deploy. Mô hình giống trang AI Operations Brain (CR-028): AI đề xuất, người duyệt.

Context cho bot đã export: `docs/content-bot/` (site map, schema, registry, luật nội dung, playbook, template, system prompt).

## Phạm vi chốt (15/10/2026) — repo này KHÔNG build bot
User tự dựng bot Telegram bên ngoài; bot chỉ **đọc bộ md** `docs/content-bot/` rồi chạy lệnh trên VPS. Việc trong repo:
1. **CLI ghi:** thêm `db:cli -- create|update|delete` (đọc JSON từ file, đi qua `content-repo.ts`: validate + version + xoá mềm,
   `--actor bot:<telegram-id>`, `--expected-version`, I-8 cần cờ xác nhận) — để bot ghi DB đúng luật, không ghi SQL thẳng.
2. **Cập nhật md** `docs/content-bot/*` cho khớp DB as-built (mục "Yêu cầu cập nhật từ CR-031" bên dưới) + quy trình bot:
   show → đề xuất JSON + diff → người duyệt → create/update/delete → revalidate.
Các câu hỏi whitelist / API key / duyệt bên dưới thuộc phía bot của user — ghi vào md làm cấu hình bot, không chặn repo.

## Câu hỏi còn mở (chưa trả lời — chặn việc build)
1. Duyệt trước khi lên web: có / không
2. Phạm vi bot được sửa: chỉ Giải pháp/Blog/Case study | toàn bộ nội dung
3. Ai được ra lệnh (whitelist Telegram user id)
4. Song ngữ: bot tự dịch EN | người dùng nhập cả hai
5. Claude API key: đã có | cần tạo

### Trả lời (15/10/2026)
1. Duyệt: **có** — bot gửi tóm tắt + diff trước/sau lên Telegram, [Duyệt] mới ghi DB (`content-repo.ts`) + `POST /api/revalidate`.
   Không còn commit/push main (prod đọc DB từ CR-031); schema không có draft → bản đề xuất bot tự giữ.
2. Phạm vi: **toàn bộ nội dung** (gồm `ui_messages`, `company_info`, asset/ảnh) — vẫn qua invariant I-1..I-8.
3. Whitelist Telegram user id: _chưa trả lời_
4. Song ngữ: **bot tự dịch EN** từ bản VI, hiện cả hai trong bản duyệt.
5. API key: "dùng api key khác" — _cần làm rõ: provider nào / key nào_

## Acceptance (dự kiến — chốt sau khi trả lời 5 câu)
- [ ] Chỉ user trong whitelist ra lệnh / bấm duyệt được
- [ ] Bot chỉ ghi file trong allowlist (`docs/content-bot/07-bot-system-prompt.md` §Guardrail)
- [ ] typecheck + lint + build PASS trước khi hiện nút [Duyệt]
- [ ] [Duyệt] → commit + push main, báo SHA; [Huỷ] → không đụng main
- [ ] Secret (Telegram token, Claude API key) chỉ nằm trong env trên VPS

## Ghi chú
Ảnh hưởng: service mới trên VPS (ngoài Next.js app), deploy key có quyền push main, preview build.
Tham chiếu: pipeline tự động có sẵn `.github/workflows/ai-news.yml` (guard + build + commit main) có thể tái dùng ý tưởng.

## Yêu cầu cập nhật từ CR-031 (ghi 14/10/2026 — CR-031 P5-T01, chưa sửa `docs/content-bot/` vì thư mục thuộc CR-030, untracked)
Prod đọc nội dung từ PostgreSQL từ 14/10/2026 (`CONTENT_SOURCE=db`). Khi làm CR-030, cập nhật `docs/content-bot/` cho khớp as-built:
- **`02-schemas.md`, `08-data-model.md`, `09-web-to-data-map.md`:** ánh xạ file → collection/bảng: bot ghi bảng `content_entries` (+ lịch sử `content_versions`),
  KHÔNG ghi file `src/content/*` (giờ chỉ là seed). Bảng collection ↔ khoá slug ↔ nguồn seed: `docs/ERD.md` § Collection (`CONTENT_COLLECTIONS` — `src/db/schema.ts`).
  Required fields: `REQUIRED_FIELDS` + invariant I-1..I-8 thực thi ở `src/db/content-rules.ts` / `src/db/content-repo.ts` (I-1 chỉ cảnh báo; I-8 cần cờ xác nhận + redirect 301).
- **Write-path bot dùng chung:** `src/db/content-repo.ts` (`expectedVersion` → conflict; xoá mềm; rollback = version mới; `actor` = `bot:<telegram-id>`; đổi slug = tạo mới + xoá mềm).
- **`10-server.md` — revalidate:** sau mỗi lần ghi gọi `POST /api/revalidate` header `x-revalidate-secret`, body `{collection, slug?}` hoặc `{all:true}`;
  sửa 1 bản ghi phải làm mới cả tag collection (route tự thêm). 200/400/401/429 (30/phút/IP)/503 — `docs/API_SPEC.md`.
- **Ảnh:** dùng `saveImage` (`src/lib/uploads/save-image.ts`) — JPEG/PNG/WebP ≤ 5 MB, cạnh ≤ 8192 px, tên sha256 → URL `/uploads/<hash>.<ext>` + bản ghi `asset`
  (locale `vi`, alt vi/en trong `data.alt`); nội dung trỏ tới ảnh phải là asset còn sống (I-7). Không có API upload HTTP.
- **CLI tham chiếu:** `npm run db:cli -- list|show|history|rollback|upload|revalidate` (`tools/db/content-cli.ts`, `docs/runbook/db.md` §9) — bot nên khớp hành vi.
- **Chữ giao diện + liên hệ:** `ui_messages/<locale>/<namespace>` (namespace cấp 1 của `src/i18n/messages/*.json`) và `company_info/<locale>/contact`;
  web gộp sâu DB đè lên file (key thiếu lấy file + cảnh báo `[content-shape]`; sai kiểu/rỗng → lỗi trang) — bot không được ghi chuỗi/mảng rỗng.
  `company_info`: `phone.href` `tel:`, `email.href` `mailto:`, `map.embedUrl` https Google Maps.

## Close-out (15/10/2026)
- **CLI:** `tools/db/content-cli.ts` thêm `create` / `update` / `delete` (JSON `--file`/stdin, `--actor`, `--expected-version`,
  `--confirm-public-url-change`, guard `--confirm-prod`). Reviewer STRICT round 1 PASS
  (`.context/review-reports/feature-telegram-content-bot-phase-1-task-01-round-1-review.md`), 3 MINOR đã sửa + test.
- **Docs bot:** `docs/content-bot/*` viết lại theo DB as-built (đã gồm mục "Yêu cầu cập nhật từ CR-031"); runbook `db.md` §9 thêm 3 lệnh.
- Verify: typecheck PASS · lint 0 lỗi · test 114/116 (2 skip — không có `TEST_DATABASE_URL`, đường ghi thật chưa chạy end-to-end).
- Spec publish: bỏ qua — chỉ thêm tooling CLI + tài liệu, không đổi behavior website.
- Còn lại phía user: dựng bot, đặt whitelist + API key, build lại image `nta-tools` trên VPS sau deploy (`10-server.md` §5).
