# Review — feature/nta-website · layer-4-task-04 (round 1)

**Agent: reviewer**

- **Task:** `tasks/nta-website/layer-4-task-04.md` — Deploy config Google Cloud Run (generate files, KHÔNG deploy/push)
- **Work item:** `feature/nta-website`
- **Date:** 2026-10-09
- **Round:** 1

## Review level

**NORMAL**

## Reason

- Task file khai `Review level expected: NORMAL`; scope là config/infra files (Dockerfile, .dockerignore, deploy.yml draft, runbook, 1 dòng `next.config.ts`).
- Không đụng `src/**`, không auth/RBAC/tenant, không schema/migration (`db_tool: none`), không API contract/DTO, không shared runtime code, không payment, không cron/webhook logic.
- Có yếu tố security nhẹ (OIDC/WIF + Secret Manager + workflow permissions) nhưng **không** có secret thật, không token/password/session code, không xử lý input người dùng → chưa tới ngưỡng STRICT bắt buộc. Đã kiểm thủ công riêng các mục security-relevant (WIF, least-privilege, no hardcoded secret).

## Blast radius

- `next.config.ts` (`output: 'standalone'`) → ảnh hưởng **mọi** `next build` (thêm artifact `.next/standalone`); có thể đổi output layout build (không đổi hành vi runtime app hiện tại).
- `Dockerfile` + `.dockerignore` → mới, chỉ dùng khi build image (chưa active).
- `.github/workflows/deploy.yml` → file draft trong `.github/workflows/`; chưa có remote nên chưa được GitHub đăng ký/chạy.
- `docs/runbook/deploy-cloud-run.md` → doc mới, không ảnh hưởng runtime.
- **Không** đụng `ci.yml`, không đụng `src/**`, không đụng env/secret thật.

## Verify commands + result

| Command | Result |
|---|---|
| `npm run lint` (`web_lint_command`) | ⛔ **Blocked** — tool `shell` bị permission deny trong session reviewer; không chạy được. Primary evidence: 0 error (1 warning MDX `<img>` pre-existing). |
| `npm run typecheck` (`web_typecheck_command`) | ⛔ **Blocked** — shell denied. Primary evidence: PASS. |
| `npm run build` (`build_command`) | ⛔ **Blocked** — shell denied. Primary evidence: PASS; `.next/standalone/server.js` produced. |
| `docker --version` / `docker build` | ⛔ **Blocked** — shell denied + môi trường không có Docker (AC cho phép ghi `Blocked` + review tĩnh). |
| `test` (`test_command: null`) | skip — `test_command: null` (ghi lý do theo task). |
| `git status` / `git log` (verify không deploy/push) | ⛔ **Blocked** — shell denied. Kiểm tĩnh: không thấy dấu hiệu deploy/secret; journal ghi task-04 chưa commit. |

> Static review (Read/Grep/Glob) đã thực hiện đầy đủ trên toàn bộ file trong diff + file phụ thuộc (`src/app/api/health/route.ts`, `src/app/api/contact/route.ts`, `src/lib/api/forward.ts`, `src/lib/seo.ts`, `.github/workflows/ci.yml`, `.env.local.example`, `.gitignore`, `package.json`).

## Acceptance Criteria — kết quả

| # | AC | Kết quả | Bằng chứng |
|---|---|---|---|
| 1 | `Dockerfile` + `.dockerignore` build local | ⛔ Blocked (no docker) — hợp lệ theo AC | static review bên dưới |
| 2 | Deploy workflow YAML hợp lệ, KHÔNG auto push, không secret hardcode | ✅ OK | `deploy.yml:5-6` chỉ `workflow_dispatch`; dùng `${{ vars.GCP_* }}` + `--set-secrets`; không có credential literal |
| 3 | Runbook đủ prerequisite/deploy/env/health/rollback/domain-SSL | ✅ OK | `docs/runbook/deploy-cloud-run.md:5-72` có đủ 8 mục |
| 4 | `next.config.ts` `output: 'standalone'` + build vẫn PASS | ✅ static OK / build chưa verify độc lập | `next.config.ts:6`; next-intl plugin + `images` giữ nguyên (`:4`, `:7`) |
| 5 | KHÔNG deploy/push nào thực thi | ⛔ Blocked (shell denied) | không có commit task-04 trên đĩa (journal), không có dấu hiệu deploy tĩnh |
| 6 | Check commands pass | ⛔ Blocked | shell denied |

## Responsive Checklist Gate

**N/A** — diff không đụng UI (không route/component/CSS; chỉ config deploy). Không áp dụng gate responsive.

## Skill gates

| Gate | Kết quả | Bằng chứng / lý do |
|---|---|---|
| `aislop` scan | **Blocked** | CLI cần shell — shell bị permission deny; không chạy/không có config `aislop*` trong repo. |
| `oxlint` (anti-slop) | **skip, oxlint not configured** | Glob `**/.oxlintrc*` = none (repo dùng ESLint `.eslintrc.json`). Diff TS chỉ 1 dòng `next.config.ts` → không có oxlint config để chạy. |
| `ocr` (open-code-review) | **Blocked** | Cần shell — shell denied; không xác định được `ocr` đã cài hay chưa. |
| AI-readable codebase | **OK** | Diff nhỏ, tên self-descriptive (`Dockerfile`, `deploy.yml`, runbook); không hàm >50 dòng, không indirection, không magic number, comment giải thích WHY (`deploy.yml:1-2`, `runbook:43`). Không có AI-chaos indicator. |
| ai-friendly-web | **N/A** | Task không thay đổi artifact web public (không sửa `public/llms.txt`, `src/app/robots.ts`, `src/app/sitemap.ts`). Các file này đã tồn tại từ layer trước → ngoài scope. |
| blitzstrike (pentest) | **N/A** | Không phải STRICT; không có môi trường live để pentest. |

## Findings

### [MINOR] `deploy.yml:36` / runbook — `docker build` không cố định `--platform linux/amd64`
- **Vấn đề:** Cloud Run chỉ chạy image `linux/amd64`. CI runner `ubuntu-latest` mặc định amd64 nên OK, nhưng mục "Build và push local" trong runbook (`:23`) và CI đều không pin platform. Build từ máy ARM (Apple Silicon) sẽ tạo image arm64 → `gcloud run deploy` fail.
- **Fix đề xuất:** thêm `--platform linux/amd64` vào `docker build` trong `deploy.yml` và runbook (hoặc ghi chú rõ yêu cầu amd64).

### [MINOR] `Dockerfile` / `deploy.yml` — `NEXT_PUBLIC_SITE_URL` là biến build-time, không truyền build-arg
- **Vấn đề:** `src/lib/seo.ts:4` đọc `process.env.NEXT_PUBLIC_SITE_URL`, nhưng `NEXT_PUBLIC_*` được **inline lúc build**; Docker build/deploy.yml không truyền build-arg nào. Hiện **không gây lỗi** vì fallback `https://ntasolution.vn` trùng domain prod, nhưng sẽ sai nếu dùng cho staging/domain khác.
- **Fix đề xuất:** ghi chú trong runbook rằng đổi domain cần rebuild image với `--build-arg NEXT_PUBLIC_SITE_URL=...` (hoặc thêm biến build-arg tùy chọn vào Dockerfile).

### [MINOR] `deploy.yml:50` / `runbook:40` — secret ghim `:latest`
- **Vấn đề:** `--set-secrets CONTACT_FORM_TARGET=CONTACT_FORM_TARGET:latest` dùng version `latest` (không pin) — chấp nhận cho draft, nhưng version mới của secret sẽ tự áp ở revision sau.
- **Fix đề xuất:** cân nhắc ghim version cụ thể khi vận hành thật.

### Ghi nhận (không phải defect)
- **`Dockerfile` không có instruction `HEALTHCHECK`:** hợp lý — Cloud Run dùng HTTP startup/liveness probe (không dùng Docker HEALTHCHECK), và runbook `:43` đã ghi rõ quyết định này. Endpoint `/api/health` được verify qua workflow + runbook.
- **`CONTACT_FORM_TARGET` đọc runtime** (`src/lib/api/forward.ts:6`) → dùng `--set-secrets` runtime env là đúng R-19; secret server-only, khớp `secrets.required` trong project-config và `.env.local.example:76`.
- **WIF an toàn:** `permissions` chỉ `contents: read` + `id-token: write` (`:8-10`); `google-github-actions/auth@v2` dùng OIDC, không service-account key dài hạn; `${{ vars.* }}` không phải secret; không credential hardcode. `.env*` bị loại khỏi Docker context và `.gitignore` cover `.env.local`.
- **`.dockerignore` chính xác:** loại `node_modules`, `.next`, `.git`, `.env*`, `docs`, `.context`, `tasks`; KHÔNG loại `public/` hay `package-lock.json`. Nội dung site build-time nằm ở `src/content/**` (không bị loại).
- **`ci.yml` không đổi:** `ci.yml:3-8` vẫn `push`/`pull_request` + `contents: read`; deploy tách file riêng, không auto-trigger.

## Residual risk / Blocked

1. **Không verify được độc lập** lint/typecheck/build/standalone-run và `docker build` do tool `shell` bị permission deny (Blocked). Kết luận dựa trên static review + primary evidence — chưa tự chứng minh.
2. **Không verify được `git log`/`git status`** để xác nhận "không deploy/push". Tĩnh: không có commit task-04 (journal `status=awaiting`), không có dấu hiệu deploy.
3. `docker build` chưa từng chạy (không có Docker) → layout copy standalone (`COPY .next/standalone ./`, `static`, `public`) đúng theo tài liệu Next.js nhưng **chưa thực nghiệm**.
4. `aislop`/`ocr` chưa chạy được (shell deny) → chưa quét AI-slop/bug bằng CLI.

## Verdict

✅ **PASS**

- Không có finding CRITICAL/MAJOR.
- File đúng scope, không đụng `src/**`/`ci.yml`, không secret hardcode, deploy workflow chỉ `workflow_dispatch` (không auto deploy/push) → khớp AC "KHÔNG trigger push tự động" và `forbidden_branch: main` / `auto_push_after_pass: false`.
- 3 MINOR là cải tiến vận hành (không chặn), kèm 4 residual risk nêu trên. Builder nên xử lý MINOR-1 (platform) khi thao tác deploy thật ở `/start` bước 6.
