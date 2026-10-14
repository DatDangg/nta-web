# Agent: reviewer — feature-content-database · phase-5-task-01 (doc reconcile) · round 1

- **CR:** CR-031 · spec 4.2.0 · Task: `tasks/feature-content-database/phase-5-task-01.md` (chỉ docs)
- **Review level:** NORMAL
- **Reason:** diff chỉ gồm doc as-built + task file, không đổi `src/**/*.ts(x)`, `tools/`, infra, schema. Không có risk đỏ (auth/DB/migration/API code) vì contract chỉ được *mô tả*, không bị đổi.
- **Blast radius:** người vận hành/agent đọc doc (`docs/ERD.md`, `docs/DESIGN.md`, `docs/API_SPEC.md`, `docs/PERMISSION.md`, runbook `cutover-content-db`/`db`/`deploy-vps`/`ai-news`, `docs/screenshots-mapping.md`, `src/content/README.md`, `docs/generated/inventory.md`), kế hoạch task (`tasks/feature-content-database/README.md`, `phase-5-task-02.md` mới). Không ảnh hưởng runtime. Bỏ qua theo yêu cầu: `docs/content-bot/`, `.context/progress.json`, `.context/runs/*`.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS (`tsc --noEmit`, không lỗi) |
| `npm run lint` | PASS — 0 error, 1 warning `no-img-element` có sẵn (`src/components/mdx/index.tsx:25`, ngoài diff) |
| `npm test` | 95 tests: 93 pass, 0 fail, 2 skip (cần `TEST_DATABASE_URL`) — khớp evidence Builder |

## Skill gates
| Gate | Kết quả |
|---|---|
| aislop | N/A — không đổi TS/JS |
| oxlint (anti-slop) | N/A — không đổi TS/JS; repo chưa cấu hình oxlint |
| ocr | skip, ocr not installed / không có code |
| AI-readable | OK — doc mới có pointer `file` cụ thể cho mọi khẳng định, tách mục rõ (Nguồn / Luồng đọc / Cache / Render / Ảnh / Vận hành) |
| ai-friendly-web / Responsive | N/A — không đổi UI |
| blitzstrike | N/A — NORMAL, không có code |

## Đối chiếu doc as-built ↔ code
| Khẳng định trong doc | Kết quả | Bằng chứng |
|---|---|---|
| `POST /api/revalidate`: header `x-revalidate-secret`, trim 2 phía, so constant-time | OK | `src/lib/api/revalidate.ts:8`, `:29-33`, `:72-80` |
| Body đúng 1 trong 2 dạng, key thừa/trộn → 400 `invalid_body`; collection ngoài whitelist → `unknown_collection`; JSON hỏng → `invalid_json`; slug regex | OK | `revalidate.ts:11`, `:40-50`, `:83-87` |
| Thứ tự kiểm rate-limit → secret server (503 `unavailable`) → secret request (401) → body | OK | `revalidate.ts:69-87` |
| Tag `content` / `content:<c>` / `+content:<c>:<slug>`; 200 `{status, revalidated}`; mọi status `no-store` | OK | `revalidate.ts:23-25`, `:53-58`, `:92` |
| 30 req / 60 s / IP, in-memory | OK | `src/lib/api/rate-limit.ts:4-5`, `:39` |
| Method khác → 405 (route chỉ export `POST` / `GET`) | OK | `src/app/api/revalidate/route.ts:9`, `src/app/uploads/[...path]/route.ts:6` (Next tự trả 405) |
| `GET /uploads`: 1 segment `^[0-9a-f]{64}\.(jpg\|png\|webp)$`, realpath trong root, file thường; 200 immutable + nosniff; 404 text/plain no-store nosniff | OK | `src/lib/uploads/image-file.ts:22`, `serve-upload.ts:11-16`, `:22-29`, `:31-48` |
| `saveImage` ≤ 5 MB, cạnh ≤ 8192 px | OK | `image-file.ts:8`, `:10` |
| `images.localPatterns` `/images/**`, `/uploads/**`; `htmlLimitedBots: /.*/` | OK | `next.config.ts:9`, `:19` |
| ERD: 2 bảng, UNIQUE(collection,slug,locale), CHECK locale/version, index một phần WHERE `deleted_at IS NULL`, `content_versions` UNIQUE(entry_id,version), CHECK op 4 giá trị, cột `sort_order`/`actor` | OK | `src/db/schema.ts:50-79`, `:84-106` |
| ERD: 15 collection | OK | `schema.ts:19-36` (khớp đủ 15, gồm `ui_messages`, `company_info`, `asset`) |
| Store `getEntries`/`getEntry` + lỗi DB ném `[content-store] Không đọc được nội dung …`; đọc lọc `deleted_at IS NULL` | OK | `src/lib/content/store.ts:19`, `:23`, `:32`; `src/db/content-read.ts:40`, `:53` |
| Gộp sâu `mergeOverFile` + warn/throw `[content-shape]` | OK | `src/lib/content/shape.ts:80-84`, `src/lib/content/ui-data.ts:21` |
| `sitemap.ts` `force-dynamic` | OK | `src/app/sitemap.ts:10` |
| Backup ops tên `pre-migrate-ops-<lệnh>-<UTC>-<run>.dump`; rotate glob `pre-migrate-*.dump` giữ 14 (cơ sở cảnh báo CR-033) | OK | `.github/workflows/content-ops.yml:85`; `deploy/db/backup.sh:14`, `:41-45`, `:98` |
| Không bịa endpoint: bỏ `/api/posts`, `/api/case-studies` (không tồn tại) | OK | route thật chỉ có `api/contact`, `api/health`, `api/revalidate`, `uploads/[...path]` (inventory mới) |

## Luật AGENTS.md
- **Không hạ cấp intent docs:** `git status` không có `docs/BRD.md`, `docs/PRD.md`, `docs/USER_FLOW.md`, `SPECIFICATIONS.md`, `docs/specs/*` → OK. Task ghi rõ BRD/design doc 2026-10-08 vẫn nói "SSG/không DB" là intent/lịch sử, để residual — đúng luật.
- **As-built không còn nói "không có DB" sai:** ERD bỏ "Type: none / v1 không cần DB"; API_SPEC bỏ câu "SSG từ file"; PERMISSION bỏ "render tĩnh" → OK.
- **Bí mật:** runbook chỉ có placeholder (`<POSTGRES_PASSWORD>`, `<REVALIDATE_SECRET>`), đường dẫn VPS chuẩn đã có từ trước, hash rút gọn của ảnh công khai `og-default.png`; không IP, mật khẩu, token → OK.
- **`phase-5-task-02.md`:** điều kiện đủ cả 2 (ổn định ≥ 1 ngày từ 14/10 16:38 UTC + user đồng ý, `:8-10`); GIỮ messages JSON + `COMPANY_CONTACT` theo P3-T04 (`:15-16`); MODIFY · HIGH · STRICT (`:4-5`); có Retry/Escalation → OK (xem MINOR-1 về scope file).
- **CR-030 change doc:** mục append ở `spec/changes/2026-10-14-telegram-content-bot.md:35` nằm cuối file, tiêu đề ghi rõ nguồn CR-031 P5-T01; các mục cũ (`:8-31`) còn nguyên cấu trúc. File untracked nên không có diff để chứng minh 100% nội dung cũ không bị sửa → Residual risk R2.

## Findings
- **[MINOR-1]** `tasks/feature-content-database/phase-5-task-02.md:13-14` — scope bỏ nhánh `file` mới liệt kê `load-mdx.ts`, `registry.ts`, `src/i18n/request.ts`, `company-contact.ts`, `source.ts`; nhưng `CONTENT_SOURCE` còn được tham chiếu ở `src/lib/content/ui-data.ts`, `src/lib/content/slug.ts`, `src/lib/contact/company-info.ts`, `tools/db/content-loaders.test.ts`. Acceptance (`:22`) đòi "không còn tham chiếu trong `src/`" nên builder sẽ phát hiện, nhưng đề xuất bổ sung các file này vào Scope + Blast radius (lưu ý `company-info.ts` phải sửa, không xoá, vì GIỮ `COMPANY_CONTACT`).
- **[MINOR-2]** `docs/generated/inventory.md` (toàn mục Files) — đường dẫn dùng `\` (sinh trên Windows) trong khi tiêu đề nhóm dùng `/` (`### src/app`); dòng `Git:` = `cf533c6` (HEAD hiện tại là `581b001`). Không sai nội dung, nhưng lần chạy kế trên Linux/CI sẽ ra diff toàn file. Đề xuất: không cần chặn task này; mở task nhỏ cho `scripts/generate-inventory.mjs` chuẩn hoá dấu phân cách (`split(path.sep).join('/')`) rồi sinh lại — tốt hơn chạy lại "kiểu POSIX" bằng tay vì máy dev là Windows. SHA lệch 1 commit chấp nhận được (sinh trước commit backlog).
- **[MINOR-3]** `tasks/feature-content-database/README.md:462` (dòng cũ, không nằm trong hunk) — "Production không đổi nguồn nội dung cho tới task 8" đã lỗi thời (cutover = task 10, đã xong 14/10). Đề xuất sửa thành "đã cutover ở task 10 (14/10/2026)" khi close-out.
- **[MINOR-4]** `docs/API_SPEC.md:75` — câu cuối "khi code được dựng" là văn mẫu cũ; nay code đã có. Tuỳ chọn sửa thành "Code là source of truth".

Không có CRITICAL/MAJOR.

## Residual risk
- R1: Các số đo/sự kiện vận hành (cutover 16:38 UTC, 136/136, sitemap 52/52, TTFB ~34–35 ms) lấy từ task P4-T01/decisions — reviewer không kiểm chứng lại trên prod (ngoài quyền).
- R2: `spec/changes/2026-10-14-telegram-content-bot.md` untracked → không có baseline git để chứng minh phần cũ không bị sửa; chỉ xác nhận cấu trúc + mục append ở cuối.
- R3: `docs/runbook/ai-news.md` ghi nhận gap AI news ↔ DB (đã có backlog CR-034 ở commit `581b001`) — đúng hướng, chưa phải fix.
- R4: B10 P4-T01 chưa xong — doc ghi "còn B10", cần cập nhật khi đạt.

## Verdict
✅ **PASS** — doc as-built khớp code (contract revalidate/uploads, schema, collection, cache, backup rotate), không bịa endpoint/mã lỗi/giới hạn, không đụng intent docs, không lộ secret; verify typecheck/lint/test PASS. 4 MINOR không chặn, đề xuất xử lý khi close-out hoặc task riêng.
