# 00 — Tổng quan: mục tiêu · stack · tài liệu

## 1. Mục tiêu

### Website nta-web
Website giới thiệu năng lực công ty NTA (B2B, content-driven, **không có đăng nhập**; nội dung lưu PostgreSQL từ 14/10/2026) — 3 mảng:
**Giải pháp doanh nghiệp** (CRM, HRM, LMS, DentGo), **Giải pháp AI** (BoxAI, Flycam, Custom AI, FridayAI,
AI Operations Brain), **Ứng dụng AI** (AI Music Maker, Hair-style AI) + Case study, Tin tức, Giới thiệu, Liên hệ.
Đối tượng: doanh nghiệp tư nhân và cơ quan nhà nước. Song ngữ vi (mặc định) / en. Nguồn: `BRIEF.md`.

### Content bot (CR-030 — bot do người dùng tự dựng, repo cung cấp CLI + tài liệu)
Cho người quản trị **thêm / sửa / xoá nội dung qua Telegram** mà không cần dev:
nhắn lệnh → bot (API model) đề xuất thay đổi bản ghi + diff → người duyệt bấm [Duyệt] → `db:cli` ghi DB → revalidate → web đổi ngay.
Mục tiêu đo được:
- Sửa nội dung thường (chữ, FAQ, thêm bài blog) không cần dev, lên web vài giây sau khi duyệt.
- **0 thay đổi lên production chưa qua người duyệt**; mọi lần ghi qua validate của write-path (I-1..I-8).
- Bot chỉ gọi `db:cli`; không đụng code/cấu hình (redirect, `<title>`, enum = việc dev).

### Mục tiêu của bộ tài liệu này
Cung cấp đủ context để (1) model trong bot sửa đúng bản ghi, đúng field, đúng luật mà không đọc toàn bộ codebase;
(2) người cài bot biết hạ tầng và rào chắn cần dựng.

## 2. Stack

| Tầng | Công nghệ |
|---|---|
| Framework | Next.js 15 (App Router, SSG) · React 19 · TypeScript 5.9 |
| i18n | `next-intl` 4 — `vi` không prefix, `en` prefix `/en` |
| Nội dung | PostgreSQL 16 (`content_entries` + lịch sử `content_versions`, Drizzle) — `data` jsonb = frontmatter MDX / object TS cũ, `body` = MDX (render bằng `next-mdx-remote` 6). File `src/content/**` chỉ là seed |
| Ghi nội dung | `db:cli` (`tools/db/content-cli.ts`) qua `src/db/content-repo.ts`: validate + version + xoá mềm + rollback; `POST /api/revalidate` làm mới cache |
| Giao diện | Tailwind CSS 3 · component tự viết (không UI kit) |
| Chất lượng | ESLint · `tsc --noEmit` · `node --test` · write-path kiểm required fields + I-1..I-8 khi ghi DB |
| Runtime | Node 22 · Docker (Next standalone, cổng 8080) |
| Hạ tầng | VPS Ubuntu 24.04 dùng chung · nginx + Let's Encrypt · domain `ntavietnam.tech` (+ `ntasolution.vn`) |
| CI/CD | GitHub Actions: `ci.yml` (lint/typecheck/build) · `deploy.yml` (self-hosted runner, push `main` → deploy) · `ai-news.yml` (bản tin AI tự động thứ 7) |
| Bot | Telegram Bot API (long polling) · API model do người dùng chọn · gọi `db:cli` qua `docker compose run nta-tools` — chi tiết `10-server.md` |

## 3. Tài liệu

### Trong bộ này (`docs/content-bot/`)
| File | Nội dung |
|---|---|
| `01-site-map.md` | URL ↔ collection/bản ghi |
| `02-schemas.md` | Field từng loại nội dung + enum |
| `03-registries.md` | Bản ghi phải ghi kèm khi thêm/xoá/đổi slug |
| `04-content-rules.md` | Luật nội dung (BR-004, song ngữ, ảnh, MDX an toàn) |
| `05-playbook.md` | Lệnh CLI + quy trình thêm/sửa/xoá/hoàn tác |
| `06-templates.md` | Khung tối thiểu (→ JSON `data`) |
| `07-bot-system-prompt.md` | System prompt, format output, guardrail |
| `08-data-model.md` | Bảng, collection, version, ràng buộc I-1..I-8 |
| `09-web-to-data-map.md` | Khối trên web → bản ghi + field |
| `10-server.md` | Server, DB, secret, backup, cách chạy CLI cho bot |

### Nguồn gốc trong repo (sự thật nằm ở đây — tài liệu bot lệch thì theo repo)
| Tài liệu | Vai trò |
|---|---|
| `BRIEF.md` | Mô tả dự án, đối tượng, phạm vi |
| `SPECIFICATIONS.md` | Yêu cầu R-xx, business rules BR-001…BR-004 |
| `docs/specs/2026-10-08-nta-website-design.md` | Design doc ban đầu |
| `docs/DESIGN.md` · `docs/API_SPEC.md` · `docs/ERD.md` | Kiến trúc · API (`/api/contact`, `/api/health`, `/api/revalidate`) · ERD (bảng, collection, invariant) |
| `docs/screenshots-mapping.md` | Ảnh + alt + tỉ lệ đã đo cho trang giải pháp |
| `docs/runbook/deploy-vps.md` · `docs/runbook/db.md` · `docs/runbook/ai-news.md` | Deploy · DB (backup/restore/CLI §9) · bản tin AI tự động |
| `src/content/types.ts` · `src/db/schema.ts` · `src/db/content-rules.ts` · `src/db/content-repo.ts` | Schema · collection · luật validate · write-path |
| `.context/project-config.md` | Cấu hình dự án: verify commands, deploy, branch |
| `spec/changes/BACKLOG.md` · `spec/changes/archive/2026-10-14-telegram-content-bot.md` | Tracking CR-030 |
