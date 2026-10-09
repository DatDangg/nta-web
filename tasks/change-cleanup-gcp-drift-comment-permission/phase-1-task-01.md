# Task 01 (modification): Dọn drift GCP còn sót — comment rate-limit + PERMISSION.md secrets pointer

> Nguồn: change `spec/changes/2026-10-09-cleanup-gcp-drift-comment-permission.md` (acceptance 1–5) ·
> spec delta `spec/updates/2026-10-09-cleanup-gcp-drift-comment-permission.md` · R-18 + R-27 (`SPECIFICATIONS.md`).

## Phase
1 (post-build drift reconcile — 1 comment + 1 doc line, **0 behavior change**)

## Type
modification (post-build MODIFY — reconcile comment/pointer còn ghi nền tảng GCP/Cloud Run; **0 dòng code logic**)

## Goal
Dọn 2 chỗ drift GCP còn sót sau change `deploy-platform-docker-vps` (spec 3.0.0):
1. `src/app/api/contact/route.ts:37` — comment trong `getClientIp()` còn ghi "Cloud Run/GFE" → sửa thành **nginx (VPS)**
   (`deploy/nginx/ntavietnam.tech.conf` dùng `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`).
   Logic lấy IP rightmost + validate **giữ nguyên** (single proxy → rightmost = client thật).
2. `docs/PERMISSION.md:40` — bỏ "Secret Manager" + pointer `.devops/templates/gcp-cloud-run.md` → trỏ đúng thực tế:
   secrets qua env (`.env.local` / GitHub Actions secrets), deploy VPS → `docs/runbook/deploy-vps.md`, xem `.context/project-config.md` §Secrets.

## Classification / Risk
- Work item type: FEATURE (post-build MODIFY)
- Change type: MODIFY (drift reconcile — comment + doc pointer; không đổi requirement/behavior)
- Scope: `src/app/api/contact/route.ts` (1 dòng comment), `docs/PERMISSION.md` (1 dòng note);
  spec publish `spec/updates/` + `spec/CHANGELOG.md` + `spec/test-scope/current.json`
- Root cause category: n/a (không phải bug) — drift còn sót sau khi đổi nền tảng GCP → docker-vps
- Review level expected: **STRICT** — dù diff chỉ comment/doc, comment nằm trong module rate-limit (bảo mật)
  và pointer liên quan secrets; reviewer độc lập xác nhận **0 logic change** + premise nginx rightmost đúng
- Blast radius: chỉ comment (không build/runtime) + 1 doc note. **Không có blast radius runtime.**
- Doc impact: **yes** — reconcile `docs/PERMISSION.md` (as-built doc) + spec/updates + test-scope
- Decision impact: NO

## Scope (spec refs)
- **R-18** (`SPECIFICATIONS.md:173`): guard order `POST /api/contact` = `rateLimit` → `validate(schema)` → `honeypot`
  → handler; rate-limit dùng IP client (comment `getClientIp` phải mô tả đúng proxy).
- **R-27** (`SPECIFICATIONS.md:217`): deploy **docker-vps** (Docker + nginx + certbot) — nginx là reverse proxy.

## Description (đúng scope — KHÔNG mở rộng)
1. `src/app/api/contact/route.ts:37` — đổi comment:
   `// Cloud Run/GFE appends the trusted client IP rightmost; rate-limit state is in-memory per instance.`
   → `// nginx (VPS) appends the real client IP rightmost via X-Forwarded-For; rate-limit state is in-memory per instance.`
   **KHÔNG đổi dòng code logic nào** (`getClientIp` giữ nguyên hành vi).
2. `docs/PERMISSION.md:40` — bỏ "Secret Manager" + `.devops/templates/gcp-cloud-run.md`; trỏ env
   (`.env.local` / GitHub Actions secrets) + `docs/runbook/deploy-vps.md` + `.context/project-config.md` §Secrets.
3. Spec Publisher: **KHÔNG bump `spec_version`** (không đổi requirement/behavior — chỉ reconcile comment/pointer);
   vẫn ghi `spec/updates/2026-10-09-cleanup-gcp-drift-comment-permission.md` + `spec/CHANGELOG.md`
   + `spec/test-scope/current.json` (`scopeVersion` 7 → 8, trigger `feature-update`).
4. KHÔNG đổi domain/platform khác; KHÔNG đụng `.devops/templates/*`; KHÔNG đụng lịch sử
   (`.context/review-reports/**` cũ, `.context/runs/**` cũ, `tasks/**` cũ, `spec/updates/**` cũ); KHÔNG đụng `change-UI`.

## Acceptance Criteria
- [ ] `docs/PERMISSION.md` không còn `gcp-cloud-run.md` / "Secret Manager"; trỏ đúng deploy VPS + secrets qua env
- [ ] `src/app/api/contact/route.ts` comment mô tả đúng nginx/VPS (không còn "Cloud Run/GFE"); **không đổi logic code**
- [ ] `grep -ri "gcp-cloud-run\|cloud run\|asia-southeast1" docs/PERMISSION.md src/app/api/contact/route.ts` = 0
- [ ] `npm run lint` / `npm run typecheck` / `npm run build` PASS (không hồi quy)
- [ ] Spec Publisher: `spec/updates/` + `spec/CHANGELOG.md` + `spec/test-scope/current.json` (scopeVersion 8); **KHÔNG bump `spec_version`**

## Verification Plan
- `git diff -- src/app/api/contact/route.ts docs/PERMISSION.md` → chỉ 2 dòng comment/doc, không có dòng code logic
- `grep -rin "gcp-cloud-run\|cloud run\|asia-southeast1\|secret manager" docs/PERMISSION.md src/app/api/contact/route.ts` → 0
- `npm run lint` → 0 errors (1 warning pre-existing mdx `<img>`, ngoài scope)
- `npm run typecheck` → PASS
- `npm run build` → PASS
- `python3 -m json.tool spec/test-scope/current.json` → valid JSON

## Retry / Error Memory
- Comment + doc pointer, risk LOW → không dự kiến retry. Verify FAIL → dừng, ghi residual.

## Doc / Decision Impact
- Reconcile as-built: `docs/PERMISSION.md` (secrets pointer) + code comment `src/app/api/contact/route.ts`.
- No-code-logic change: `getClientIp` giữ nguyên hành vi; nginx rightmost premise khớp `deploy/nginx/ntavietnam.tech.conf`.

## Result (close-out)
- Edits: `src/app/api/contact/route.ts` (comment dòng 37), `docs/PERMISSION.md` (dòng 40). 0 dòng logic.
- Verify: lint = 0 errors (1 pre-existing warning ngoài scope) · typecheck = PASS · build = PASS · grep drift = 0.
- Spec publish: không bump spec_version (3.0.0); scopeVersion 7 → 8.
- Reviewer: STRICT (primary chạy độc lập).
