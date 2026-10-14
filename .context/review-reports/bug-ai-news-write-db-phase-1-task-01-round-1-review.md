# Review — bug-ai-news-write-db · phase-1-task-01 · round 1

Agent: reviewer · Ngày: 2026-10-15 · CR-034 (BUG, risk HIGH)

## Review level
**STRICT**

## Reason
Ghi DB prod tự động từ CI theo cron (không người duyệt); secret `POSTGRES_PASSWORD`/`REVALIDATE_SECRET` vào workflow mới; chung concurrency `deploy-nta-web`;
shared write-path `src/db/content-repo.ts`; shared parser `src/lib/content/mdx-files.ts` (web + seed + tools); Dockerfile.

## Blast radius
- `.github/workflows/ai-news.yml`: job `digest` thêm output `publish_slug` + bước `target`, bỏ dispatch deploy, bỏ `actions: write`; job mới `publish-db` (host runner, DB prod).
- `src/db/content-repo.ts`: thêm `findNewEntryProblems` (chỉ đọc, gọi lại `validateRecord`); `createEntry` không đổi.
- `src/lib/content/mdx-files.ts`: tách `parseMdxSource` — `readMdxFiles` cho kết quả y hệt (`{fileName, frontmatter: data, body: content.trim()}`).
- `tools/db/content-cli.ts` (lệnh `publish-post`, cờ `--dry-run`/`--actor`), `tools/db/publish-post.ts` (mới), `tools/db/file-source.ts` (export `toJsonObject`).
- `Dockerfile` target `content-tools`: `COPY public ./public` — chỉ stage `content-tools`; stage `runner` (web) và `migrator` không đổi; `public` vốn đã trong build context (không bị `.dockerignore`).
- Doc: `docs/runbook/ai-news.md`, `docs/DESIGN.md` § Nguồn nội dung + § Vận hành, `tools/ai-news/README.md`.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS (tsc --noEmit, 0 lỗi) |
| `npm run lint` | PASS (0 error, 1 warning có sẵn `src/components/mdx/index.tsx:25` không thuộc task) |
| `npm test` | PASS 96/98, 0 fail, 2 skip (suite DB). Suite `publish-post (Postgres)`, `content-repo (Postgres)`, `saveImage`, `import seed` **skip — TEST_DATABASE_URL chưa đặt**; reviewer không dựng được Postgres tạm (quyền bash reviewer không cho chạy docker / đặt env). Builder ghi đã chạy có DB (120/121, journal `.context/runs/bug-ai-news-write-db-phase-1-task-01.md:35`) — **không xác minh độc lập**. |
| `npm run build` | không chạy lại (đã biết FAIL native binding trên Windows); dựa evidence builder `docker build --target builder` + build `nta-tools` PASS — không xác minh độc lập. |
| actionlint | không có công cụ; đọc tay YAML (xem dưới). |

## Kiểm theo checklist

**Acceptance (code):**
- vi+en vào DB qua `createEntry` (version 1, `updated_by`=actor, `content_versions` op `create` + actor + note có run id) — `tools/db/publish-post.ts:79-95`, test `publish-post.test.ts:120-132`. OK.
- Không ghi đè bản đã sửa / xoá mềm: kiểm `getEntryByKey(..., {includeDeleted:true})` → `exists` (`publish-post.ts:69-71`), thêm lưới an toàn I-5 trong `createEntry` (`content-repo.ts:271-279`). Test `:134-156`. OK.
- Chạy lại cùng tuần: `exists` → không backup, không ghi (`ai-news.yml:148-156` gắn `missing == 'true'`). OK.
- Tự lành khi digest `skip`: bước `target` chạy khi `skip` hoặc `written` (`ai-news.yml:83-88`); revalidate luôn chạy. OK.
- Validate cả 2 locale trước khi ghi: đọc cả 2 file trước (`publish-post.ts:63`), gom problems cả 2 locale (`:67-75`) trước vòng ghi. Test `:100-109`. OK.

**Workflow:**
- `if`/`needs`/outputs: `publish-db` cần `needs.digest.result == 'success'` + slug khác rỗng + `refs/heads/main` (`:105`). Digest đỏ (generate/build/push) → các bước sau bị implicit `success()` bỏ qua → job failure → publish-db không chạy. OK.
- Secret chỉ ở env job `publish-db` (`:114-118`); job `digest` (LLM + dữ liệu ngoài) không có. `permissions: contents: read` ở job. Không echo secret; `docker compose config --quiet`. OK.
- Injection: slug đi qua `env` (không nội suy `${{ }}` vào `run:`), slug do `generate.py` tính từ tuần ISO (`generate.py:347-366`, không từ LLM), CLI chặn regex `^[a-z0-9]+(?:-[a-z0-9]+)*$` (`publish-post.ts:16,60`) trước smoke. OK.
- Concurrency `deploy-nta-web` / `cancel-in-progress: false` khớp `deploy.yml:12-14`, `content-ops.yml:30-32`. OK.
- Compose: env `HOST_PORT`/`POSTGRES_PASSWORD`/`REVALIDATE_SECRET` giống `content-ops.yml:37-40`; `--profile tools build nta-tools`, `run --rm --no-deps nta-tools` giống content-ops; project = thư mục workspace runner, giống deploy/content-ops. Revalidate dùng `REVALIDATE_URL=http://nta-web:8080/api/revalidate` của service (`docker-compose.yml:133`). OK.
- Backup: `docker exec nta-db-backup /scripts/backup.sh "pre-migrate-ops-…"` y hệt `content-ops.yml:85`. OK.
- Smoke: `127.0.0.1:${HOST_PORT}` + `/blog/<slug>` (vi, `localePrefix: 'as-needed'`) + `/en/blog/<slug>`; trang blog `generateStaticParams() => []` → render theo yêu cầu (không 404 vì thiếu prerender). OK.

**Refactor:** `parseMdxSource` giữ nguyên `matter()` + `content.trim()`; `findNewEntryProblems` chỉ gọi `validateRecord` trong transaction, không insert; `createEntry` không đổi dòng nào. OK.

**Dockerfile:** chỉ stage `content-tools`; image web không phình. OK.

## Findings

| # | Severity | file:line | Mô tả | Yêu cầu |
|---|---|---|---|---|
| F1 | **MEDIUM** (chặn) | `docs/runbook/ai-news.md:44` | Thủ tục "Muốn đăng lại tuần hiện tại: xoá 2 file `ai-weekly-YYYY-wNN.mdx` … rồi chạy tay" **sai sau CR-034**: DB đã có `post/{vi,en}/<slug>` → `publish-post` báo `exists`, không ghi; workflow **xanh** nhưng web vẫn hiện bài cũ (xoá file cũng không xoá bản ghi DB). Người vận hành tưởng đã đăng lại. Doc as-built chưa reconcile. | Sửa đoạn này: nêu rõ DB mode — sinh lại file không đổi bài trên web; muốn thay nội dung → sửa bản ghi DB (CLI/bot, có version) hoặc xoá mềm + quy trình riêng; hoặc ghi "không hỗ trợ đăng lại tự động". |
| F2 | LOW | `.github/workflows/ai-news.yml:87` | Bước `target` lấy `steps.check.outputs.slug` cả khi `written`. Chạy tay sát nửa đêm CN→T2 (giờ VN): `check` tính tuần N, `generate` (sau thu thập dài) tính tuần N+1 → commit file N+1 nhưng `publish-db` nhận slug N → `ContentNotFoundError` đỏ, bài N+1 không vào DB. | Đề xuất `SLUG: ${{ steps.generate.outputs.slug \|\| steps.check.outputs.slug }}`. |
| F3 | LOW | `docs/runbook/ai-news.md:59-60` | "Sửa nguyên nhân rồi chạy tay lại workflow" chỉ tự lành **trong cùng tuần ISO** (qua tuần sau `check` ra slug mới → bài tuần cũ không bao giờ vào DB). Chưa nêu cách chuẩn **"Re-run failed jobs"** (giữ output digest, chạy lại `publish-db` cho đúng slug bất kể tuần) và trường hợp job `publish-db` bị **cancelled** do concurrency (GitHub chỉ giữ 1 pending/nhóm — deploy push mới có thể thay chỗ). | Bổ sung 2 ý trên vào § 5. |
| F4 | LOW | `tools/db/publish-post.ts:79-95` | 2 locale ghi bằng 2 transaction `createEntry` riêng → lỗi DB giữa chừng để lại 1 locale (vi có, en thiếu). Đã có validate trước + runbook nói chạy lại tự lành, nên chấp nhận được; ghi nhận residual so với acceptance "không ghi nửa vời". | Tuỳ chọn: bọc cả cặp trong 1 transaction (createEntry nhận tx) — không bắt buộc round này. |
| F5 | LOW | `tools/db/content-cli.ts:48-49,174` | `--dry-run`/`--actor` khai báo global trong `parseArgs(strict)` → `rollback … --dry-run --confirm-prod` được chấp nhận và **vẫn ghi** (cờ bị lờ đi). | Đề xuất: từ chối `--dry-run`/`--actor` ngoài `publish-post` (UsageError). |
| F6 | INFO | `.github/workflows/ai-news.yml:164-166` | `curl -f` coi 3xx là thành công; bản xoá mềm có chủ đích → smoke 404 đỏ mỗi lần chạy lại trong tuần. Chấp nhận được (in mã HTTP). | — |
| F7 | INFO | `docs/content-bot/10-server.md:29,33` | Vẫn ghi ai-news "dispatch deploy.yml" — ngoài phạm vi task (thư mục chưa commit, task khác), cần reconcile khi làm CR-030/bot. | Primary ghi nhận cho task content-bot. |
| F8 | INFO | — | Spec delta R-09c (`SPECIFICATIONS.md`) + Spec Publisher chưa làm — việc của primary sau PASS theo task § Scope 5. | — |

## Residual risk
- Test DB (`publish-post (Postgres)`) và `docker build` chưa được reviewer chạy độc lập — dựa evidence builder.
- Chưa chạy thật trên prod (lượt cron 19/10/2026); cần smoke `workflow_dispatch` sau push theo Verification plan.
- Concurrency 1-pending/nhóm: `publish-db` pending có thể thay chỗ 1 deploy pending (và ngược lại) — đã ghi ở task § Rủi ro, chưa có trong runbook (F3).

## Verdict
**FAIL** — code/workflow đạt acceptance và an toàn (secret, injection, concurrency, compose, backup đúng), nhưng doc as-built còn thủ tục sai cho prod (F1, MEDIUM).
Sửa F1 (bắt buộc); khuyến nghị sửa kèm F2 + F3 (rẻ, cùng file). F4/F5 tuỳ chọn. Round 2 chỉ cần soát lại diff doc + `ai-news.yml:87` nếu đổi.
