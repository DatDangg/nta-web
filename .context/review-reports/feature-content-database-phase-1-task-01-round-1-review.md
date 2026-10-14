# Review — feature-content-database · phase-1-task-01 · round 1

Agent: reviewer
Ngày: 2026-10-14 · CR-031 · spec R-16/R-16a/R-16c (4.2.0)

## Review level
**STRICT**

## Reason
Task đụng DB/schema/migration (risk đỏ theo AGENTS.md), thêm dependency runtime (`pg`, `drizzle-orm`) và đổi `package-lock.json` (ảnh hưởng `npm ci` trong Docker/CI), giới thiệu secret mới (`DATABASE_URL`, `POSTGRES_PASSWORD`, `REVALIDATE_SECRET`).

## Blast radius
- File mới: `src/db/schema.ts`, `src/db/client.ts`, `src/db/*.test.ts`, `drizzle.config.ts`, `drizzle/0000_empty_supernaut.sql`, `drizzle/meta/*`, `.env.example`.
- `package.json` (4 deps + 3 script), `package-lock.json` (thêm package), `.context/project-config.md` (`test_command`), `.context/decisions.md` (append).
- Web hiện chưa import `src/db/**` → không ảnh hưởng route/UI. DB: chỉ tạo bảng mới trên DB rỗng.
- Ngoài scope (bỏ qua theo yêu cầu): `spec/changes/2026-10-14-content-database.md`, `spec/changes/2026-10-14-telegram-content-bot.md`, `docs/content-bot/`.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm test` | PASS 5/5 (`node --import tsx --test "src/**/*.test.ts"`, ~0.36s) |
| `npm run typecheck` | PASS (0 lỗi) |
| `npm run lint` | PASS (0 error, 1 warning có sẵn `src/components/mdx/index.tsx:25` `<img>` — ngoài diff) |
| `npm run build` | **Không tự chạy lại.** Windows: lỗi môi trường swc DACL (đã biết, HEAD cũng lỗi). Docker/node ngoài allowlist của reviewer → không tái kiểm bằng container. Dựa vào evidence builder (node:22-slim, không `DATABASE_URL`, 61/61). Ghi Residual risk. |
| `git diff --patience --stat -- package-lock.json` | 1768+ / 2- . 2 dòng bị xoá chỉ là `"dev": true` → `"devOptional": true` cho `@types/node` và `undici-types` (do `@types/pg` kéo vào). **Không** package cũ nào đổi version/resolved/integrity. (Diff mặc định Myers hiện 7523+/5757- là nhiễu do thuật toán diff, không phải thay đổi thật.) |
| Lock vs npm 10 | `lockfileVersion: 3`; có entry `node_modules/next-intl/node_modules/@swc/helpers` (package-lock.json:7681) — khớp lý do builder sinh lock bằng npm 10. |
| Migration DB (Postgres Docker, migrate 2 lần) | Không tự chạy (reviewer không chạy DB). Dựa evidence builder + đối chiếu SQL ↔ schema bằng đọc file. |

## Đối chiếu thiết kế task
| Hạng mục | Kết quả | Bằng chứng |
|---|---|---|
| `content_entries` đủ cột (id, collection, slug, locale, data jsonb, body null, sort_order null, version, deleted_at, created_at, updated_at, updated_by) | OK | `src/db/schema.ts:46-64`, SQL `:1-13` |
| UNIQUE (collection, slug, locale) | OK | SQL `:14` |
| CHECK locale vi/en; CHECK version >= 1 | OK | SQL `:15-16` |
| `collection` KHÔNG CHECK ở DB, whitelist app | OK | SQL không có CHECK collection; `CONTENT_COLLECTIONS` 12 giá trị khớp task; test `schema.test.ts:45-47` khoá điều này |
| Index partial (collection, locale) WHERE deleted_at IS NULL | OK | SQL `:34` |
| `content_versions` + UNIQUE (entry_id, version) + CHECK op | OK | SQL `:19-31` |
| FK entry_id → content_entries | OK (ON DELETE no action — phù hợp xoá mềm + history append-only) | SQL `:33` |
| Version ghi ở tầng app, không trigger | OK | không có trigger; decisions.md ghi rõ |
| Migration chỉ additive, sinh bằng drizzle-kit | OK | chỉ CREATE TABLE / ADD CONSTRAINT trên bảng vừa tạo / CREATE INDEX; có `meta/_journal.json` + snapshot đúng format drizzle-kit (`version 7`) |
| Không có script `push` | OK | `package.json` chỉ `db:generate`, `db:migrate`; `drizzle.config.ts:3-4` ghi cấm push |
| Client lazy, không log secret, không `server-only` | OK | `client.ts:14-24` tạo Pool chỉ khi gọi `getDb()`; message lỗi không chứa giá trị env; không import `server-only` |
| `.env.example` không secret thật | OK | toàn giá trị `change-me` |
| Build không cần `DATABASE_URL` | OK theo code (không route nào import `src/db`, import client không throw — có test); build chưa tái kiểm (Residual risk) |
| Scope không lấn task khác | OK | không đụng `src/lib/content/**`, `src/app/**`, Dockerfile, CI |
| Migration gate AGENTS.md | OK | versioned, không destructive → không `HIGH_RISK_MIGRATION`; không db push/reset/seed |

## Skill gates
- aislop: `skip, aislop not installed` (`command not found`).
- oxlint (anti-slop): `skip, oxlint not configured` (không có `.oxlintrc*` ở root).
- ocr (open-code-review): `skip, ocr not installed`.
- AI-readable: OK — tên rõ, hàm ngắn, comment nêu WHY (lazy, không server-only, cấm push); 0 indicator.
- ai-friendly-web: N/A (không public-facing).
- blitzstrike: N/A (không có endpoint/input).
- Responsive Checklist Gate: N/A (diff không đụng UI).
- Security: không secret trong repo; SQL injection N/A (không có query động); `sql\`\`` trong schema chỉ dùng tham chiếu cột tĩnh.

## Findings
- **[CRITICAL]** không có.
- **[MAJOR]** không có.
- **[MINOR-1]** `.gitignore:1` chỉ ignore `.env.local`. Task giới thiệu `DATABASE_URL`/`POSTGRES_PASSWORD`; docker-compose (task sau) thường đọc `.env` → dev tạo `.env` thật dễ bị `git add` nhầm. Đề xuất (task này hoặc task docker-compose): thêm `.env` và `.env*.local` vào `.gitignore`, giữ `!.env.example`. Không chặn PASS vì hiện không có secret nào trong repo.
- **[MINOR-2]** `drizzle.config.ts:11` `url: process.env.DATABASE_URL ?? ""` — khi chạy `db:migrate` thiếu env sẽ ra lỗi kết nối khó hiểu thay vì báo thiếu biến; `drizzle-kit` cũng không tự nạp `.env.local`. Đề xuất ghi rõ trong README/runbook (phase-5 doc) cách export `DATABASE_URL` trước khi migrate, hoặc fail sớm khi lệnh là migrate. Không ảnh hưởng `generate`.
- **[MINOR-3]** `src/db/client.test.ts:16-29` — test "lazily without connecting" thực chất chỉ chứng minh singleton (Pool của `pg` vốn không kết nối khi khởi tạo); tên test hơi phóng đại. `schema.test.ts:48` chỉ kiểm số index =1, không kiểm điều kiện partial. Mức chấp nhận được vì SQL đã inspect và `db:generate` lần 2 "No schema changes"; có thể tăng độ chặt sau.
- **[MINOR-4]** (tuỳ chọn) `content_versions.version` không có CHECK `>= 1` như `content_entries.version`. Thiết kế task không yêu cầu; nếu muốn đối xứng thì thêm ở migration additive sau (bảng rỗng), không cần ngay.

## Residual risk
- `npm run build` chưa được reviewer tái kiểm (Windows swc DACL; Docker ngoài allowlist reviewer). Dựa evidence builder: node:22-slim + `npm ci` lock mới + không `DATABASE_URL` → 61/61. Prerender flaky trong `docker build` local có cả ở HEAD → baseline môi trường. CI/VPS cần theo dõi build đầu tiên sau push.
- Migrate 2 lần trên Postgres chưa reviewer tái kiểm (không chạy DB) — dựa evidence builder; SQL đã đối chiếu thủ công khớp thiết kế.
- Máy dev npm 11 có thể sinh lại lock thiếu `next-intl/node_modules/@swc/helpers` → nên kiểm `npm ci` (npm 10) trước khi commit lock về sau.

## Verdict
✅ **PASS** — không CRITICAL/MAJOR; 4 MINOR không chặn (MINOR-1 nên xử lý trước khi thêm docker-compose/`.env`).
