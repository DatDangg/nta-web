# bug-ai-news-write-db · phase-1-task-01 — Workflow AI news ghi bài mới vào DB (insert-only) + revalidate

- **CR:** CR-034 · change doc `spec/changes/2026-10-15-ai-news-write-db.md` · liên quan CR-019 (R-09c), CR-031 (R-16), CR-033 (backup rotation)
- **Hạn:** trước lượt cron kế tiếp của `.github/workflows/ai-news.yml` (thứ 2 19/10/2026 08:00 giờ VN = 01:00 UTC)
- **Classification / Risk:** BUG (ops/CI ghi DB prod) · **HIGH**
  - Expected review level: **STRICT** — ghi DB prod tự động không người duyệt, secret DB/revalidate đi vào workflow mới, chung concurrency với deploy, shared write-path `src/db/content-repo.ts`.
  - Blast radius: `.github/workflows/ai-news.yml` (thêm job), `tools/db/content-cli.ts` (lệnh mới), `Dockerfile` target `content-tools` (thêm `public/` nếu chọn), `docker-compose.yml` (không đổi nếu đủ), runbook. Không đổi schema/migration, không đổi web runtime.
  - Doc impact: `docs/runbook/ai-news.md`, `docs/DESIGN.md` § Vận hành, `tools/ai-news/README.md`, `SPECIFICATIONS.md` R-09c (spec delta), `docs/runbook/cutover-content-db.md` nếu nhắc cách tạm.
  - Migration gate: không áp dụng (không đổi schema).

## Root cause (đã chứng minh bằng đọc code, chưa repro prod — lượt chạy kế là 19/10)
1. Workflow chỉ ghi file + deploy: `.github/workflows/ai-news.yml:55-58` sinh `src/content/blog/{vi,en}/<slug>.mdx`, `:66-77` commit/push file, `:79-89` dispatch `deploy.yml`. Không bước nào chạm DB.
2. Deploy không import nội dung: `.github/workflows/deploy.yml:48-84` = DB healthy → backup → migrate → build/up web → health. Không có import/revalidate.
3. Prod đọc DB: `deploy.yml:28` `CONTENT_SOURCE: ${{ vars.CONTENT_SOURCE || 'file' }}` (variable prod = `db` từ 14/10/2026) → `src/lib/content/source.ts:16-17` → loader đọc `src/lib/content/store.ts:23-39` (`content_entries`, `unstable_cache` tag `content:post`). Image web không prerender trang nội dung (DESIGN § Chiến lược render) → file MDX mới trong image **không** được web dùng.
4. Đường đưa file vào DB duy nhất hiện có là thao tác tay: Content ops `import-seed` (`.github/workflows/content-ops.yml:60,99-101`, cần confirm `IMPORT-SEED-PROD`) + `revalidate-all` (`:107-109`). Runbook ghi rõ cách tạm (`docs/runbook/ai-news.md:7-10`).
5. Không có lệnh CLI "tạo bản ghi": `tools/db/content-cli.ts:147-165` chỉ có `list/show/history/rollback/upload/revalidate`. Write-path chuẩn `createEntry` có sẵn (`src/db/content-repo.ts:248-276`: validate + version 1 + `content_versions` op `create` + actor; khoá `(collection, slug, locale)` UNIQUE kể cả xoá mềm → báo lỗi I-5 thay vì ghi đè).
6. Phụ: dedupe tuần dựa trên file (`tools/ai-news/generate.py:77-78,348`) — đúng cho file nhưng nếu push xong mà bước DB lỗi, chạy lại sẽ `skip` → bước DB không bao giờ chạy lại nếu gắn điều kiện `status == 'written'`.

## Phương án

### A (khuyến nghị) — job `publish-db` trong `ai-news.yml`, insert-only qua `nta-tools`
- **CLI:** thêm lệnh `tools/db/content-cli.ts publish-post <slug> [--dry-run] --confirm-prod` (tên chốt khi build):
  đọc `src/content/blog/{vi,en}/<slug>.mdx` bằng **cùng parser** web/seed dùng (`src/lib/content/mdx-files.ts` / `tools/db/file-source.ts`, không parse lại),
  với mỗi locale: đã có bản ghi `post/<locale>/<slug>` (kể cả xoá mềm) → `exists`, **không ghi**; chưa có → `createEntry` với
  actor `workflow:ai-news`, note `ai-news <slug> run <GITHUB_RUN_ID>`. In `inserted|exists` theo locale; lỗi validate → exit ≠ 0.
  `--dry-run` = chỉ báo `missing|exists` (không ghi) để quyết định có backup không. Lệnh ghi trên DB prod cần `--confirm-prod` (giống `rollback/upload`).
- **Image `content-tools`:** `createEntry` kiểm ảnh trong `public/` (`content-repo.ts:145,196`) mà `Dockerfile:32-36` không COPY `public` →
  thêm `COPY public ./public` (hoặc mount read-only `$PWD/public` khi `docker compose run`) để cover `/images/blog/ai-weekly-cover.svg` validate được.
- **Workflow:** job mới `publish-db` (`needs: digest`, chạy trên **host** runner `[self-hosted, nta-web]`, không container — job `digest` chạy trong container không có docker),
  `concurrency: deploy-nta-web` (cấp job, chung nhóm deploy/Content ops), `if: needs.digest.result == 'success'` và slug có output (cả `written` **và** `skip` → chạy lại cùng tuần tự lành nếu lần trước DB lỗi; idempotent):
  checkout `main` (đã có commit bài) → `docker compose config --quiet` → nta-db healthy → `build nta-tools` → `publish-post --dry-run`
  → có locale `missing` thì backup (`docker exec nta-db-backup /scripts/backup.sh "pre-migrate-ops-ai-news-<UTC>-<run>"`, lỗi → dừng) → `publish-post --confirm-prod`
  → `content-cli.ts revalidate --collection post` → smoke `curl` `/blog/<slug>` + `/en/blog/<slug>` 200 qua `127.0.0.1:${HOST_PORT}`.
  Secret `POSTGRES_PASSWORD`, `REVALIDATE_SECRET` chỉ ở `env` job này (không vào job `digest` có LLM/thu thập dữ liệu ngoài).
- **Giữ commit file seed** (`src/content/blog/*`): lịch sử bài trong git, dedupe tuần (`generate.py check`) vẫn chạy, `parity`/đường lùi `file` còn đúng tới khi P5-T02. Không phụ thuộc chế độ file: web không đọc file; P5-T02 giữ `src/content/*` làm seed cho tools (`phase-5-task-02.md` § Scope "GIỮ").
- **Dispatch deploy:** bỏ bước dispatch `deploy.yml` (DB mode không cần build lại image để hiện bài; tránh 2 job cùng nhóm concurrency đè pending). *(Chờ user chốt — câu hỏi Q2.)*
- Ưu: actor/version rõ (`workflow:ai-news`, `content_versions` op create), insert-only theo write-path chuẩn có validate, tự lành khi chạy lại, không đụng deploy.yml, không phụ thuộc cờ `CONTENT_SOURCE`.
- Nhược: thêm 1 lệnh CLI + 1 job; workflow tự động có secret DB.

### B (dự phòng) — bước sau health trong `deploy.yml`: `import-seed` giới hạn collection `post`
- Thêm cờ `--collection post` vào `tools/db/import-seed.ts`, deploy.yml chạy sau health + `revalidate --collection post`.
- Ưu: tận dụng backup pre-migrate + concurrency sẵn có của deploy. Nhược: mọi deploy đều ghi DB; actor = `seed` (`tools/db/seed-db.ts:8,44,58`) không rõ nguồn; bỏ qua `validateRecord`;
  vẫn cần dispatch deploy chain; sau khi bot CR-030 ghi DB trực tiếp thì import file mỗi deploy là hành vi khó đoán. → Không khuyến nghị.

## Scope (theo phương án A — chốt sau khi user duyệt)
1. `tools/db/content-cli.ts`: lệnh `publish-post` (+ `--dry-run`, `--confirm-prod`, actor `workflow:ai-news` có thể ghi đè bằng `--actor`), dùng `createEntry`; test (`tools/db/*.test.ts`, DB test khi có `TEST_DATABASE_URL`): insert lần đầu → version 1 + version row actor đúng; chạy lại → `exists`, 0 ghi; bản ghi đã sửa (version 2) → không đổi; bản xoá mềm → `exists`, không khôi phục; file thiếu 1 locale → lỗi, không ghi nửa vời (validate cả 2 trước khi ghi).
2. `Dockerfile` target `content-tools`: `COPY public ./public` (hoặc mount ro trong workflow — chọn 1, ghi lý do).
3. `.github/workflows/ai-news.yml`: job `digest` xuất `outputs.slug/status`; job `publish-db` như trên; bỏ/giữ dispatch theo Q2; `permissions` tối thiểu.
4. Doc: `docs/runbook/ai-news.md` (luồng mới, xử lý đỏ từng bước, chạy lại, bỏ ghi chú cách tạm), `tools/ai-news/README.md`, `docs/DESIGN.md` § Vận hành, `docs/runbook/cutover-content-db.md` nếu nhắc cách tạm.
5. Spec delta R-09c (đăng = file seed + insert DB + revalidate) → Spec Publisher sau PASS.
- **KHÔNG**: đổi schema, đổi `import-seed`/`deploy.yml`/`content-ops.yml` (ngoài phạm vi), sửa CR-033 (rotation) ở task này, đụng `docs/content-bot/`.

## Acceptance
- [ ] Sau workflow chạy: `post/vi/<slug>` + `post/en/<slug>` có trong `content_entries` (version 1, `updated_by=workflow:ai-news`) + `content_versions` (op `create`, actor `workflow:ai-news`, note có run id).
- [ ] Không ghi đè bản ghi đã có (kể cả đã sửa/xoá mềm); chạy lại cùng tuần → 0 ghi, workflow xanh.
- [ ] `/blog`, `/en/blog`, trang chi tiết, sitemap hiện bài mới không cần thao tác tay (revalidate tự chạy).
- [ ] Backup trước khi ghi; lỗi backup/insert/revalidate → workflow đỏ, không ghi nửa vời.
- [ ] `docs/runbook/ai-news.md` cập nhật.

## Verification plan
- `npm test` (unit + test DB khi có `TEST_DATABASE_URL`), `npm run typecheck`, `npm run lint`, `npm run build` (lệnh từ `.context/project-config.md`).
- Local DB (docker compose dev): seed → chạy `publish-post` 2 lần (inserted → exists) → `history` thấy actor/note → sửa bản ghi qua CLI rồi chạy lại (không đổi).
- `docker compose --profile tools build nta-tools` + `run --rm --no-deps nta-tools tools/db/content-cli.ts publish-post <slug> --dry-run` (env giả) — chứng minh image đủ `public/`.
- `actionlint`/đọc lại YAML: điều kiện `if`, `needs`, outputs, concurrency, secret chỉ ở job `publish-db`.
- Prod (sau push, cần user cho phép): `workflow_dispatch` ai-news cho tuần hiện tại (w42 — nếu chưa có bài tuần này thì sinh mới; nếu đã có → `skip` + `publish-db` chạy `exists`/insert) → kiểm `/blog` 200 có bài + `history`.

## Rủi ro / Residual
- **Secret:** `POSTGRES_PASSWORD`/`REVALIDATE_SECRET` vào workflow chạy theo cron không người duyệt → chỉ ở job `publish-db` (không ở job có LLM + dữ liệu ngoài), chặn ref ≠ `main` như Content ops, không echo, không `docker compose config` không `-q`.
- **Concurrency:** GitHub chỉ giữ 1 pending/nhóm — job `publish-db` pending có thể huỷ 1 deploy pending khác (và ngược lại) → bỏ dispatch deploy (Q2) + `publish-db` tự lành khi chạy lại.
- **Backup rotation (CR-033):** backup `pre-migrate-ops-*` mỗi tuần đẩy mất 1 backup trước-deploy cho tới khi CR-033 xong → chỉ backup khi `--dry-run` báo `missing`; đặt tên theo quy ước sau này của CR-033 nếu xong trước.
- **Nội dung LLM vào DB không duyệt:** đã được user chấp nhận ở CR-019 (R-09c); guard + build gate giữ nguyên.
- **Đường lùi `file`:** giữ commit file → `CONTENT_SOURCE=file` vẫn thấy bài (sau deploy).

## Retry / Escalation
3 attempt fail → `architecture_review_needed`, dừng chờ review. Interrupted ≠ failed attempt.

## Verification summary
_(chưa làm — chờ user duyệt plan)_
