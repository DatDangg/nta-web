# Task 04: Deploy config Cloud Run (generate files — KHÔNG deploy khi chưa approve)

## Layer
4

## Type
build (initial)

## Goal
Sinh cấu hình deploy Google Cloud Run `asia-southeast1` (scale-to-zero, max-instances 3):
Dockerfile standalone + `.dockerignore` + GitHub Actions deploy workflow (generate, không push)
+ runbook deploy/rollback + env vars — **KHÔNG thực thi deploy** (cần user approve riêng ở checkpoint).

## Classification / Risk
- Work item type: FEATURE (initial build)
- Feature change type: ADDITIVE (initial build)
- Scope: CROSS_CUTTING (infra files)
- Root cause category: n/a
- Review level expected: NORMAL — file config, không secret commit; reviewer check không deploy tự động
- Blast radius: CI/CD files (chưa active — không remote), Docker build path
- Doc impact: NO_DOC_IMPACT (khớp R-27 + project-config `deploy_platform: other = gcp-cloud-run`)
- Decision impact: NO

## Scope (spec refs)
- **R-27:** Cloud Run `asia-southeast1`, scale-to-zero, max-instances 3, availability ≥99.5%,
  domain `ntasolution.vn` (gắn sau DNS), CI/CD GitHub Actions, free tier GCP
- **R-14:** health check `/api/health` (Cloud Run startup/health)
- **R-19:** HTTPS only (Cloud Run Managed SSL/load balancer — ghi trong runbook),
  secret server env (Secret Manager / runtime env — `CONTACT_FORM_TARGET`)
- `.context/project-config.md`: `ci_cd: github-actions`, `auto_push_after_pass: false`,
  deploy cần user approve (AGENTS Non-negotiables)

## Dependencies
- Layer 0 task-05 (CI workflow skeleton), Layer 3 task-01 (`/api/health` endpoint),
  Layer 4 task-01–03 (site hoàn chỉnh mới deploy có nghĩa)

## Description
1. `Dockerfile`: Node LTS slim, `npm ci`, `next build` với `output: 'standalone'`,
   non-root user, `PORT=8080` (Cloud Run), healthcheck `/api/health`.
   (Cần thêm `output: 'standalone'` vào `next.config.ts` — sửa nhỏ, ghi trong scope.)
2. `.dockerignore`: `node_modules`, `.next`, `.git`, `.env*`.
3. `.github/workflows/deploy.yml` (**generate, không push, không chạy**): build image →
   push GCR/Artifact Registry → deploy Cloud Run `--region asia-southeast1
   --max-instances 3 --min-instances 0 --allow-unauthenticated`; env vars qua runtime
   (`CONTACT_FORM_TARGET` từ Secret Manager). Trigger = tag/release hoặc manual `workflow_dispatch`.
   ⚠️ Chưa có remote + `forbidden_branch: main` push cấm → workflow ở trạng thái draft.
4. `docs/runbook/deploy-cloud-run.md`: điều kiện prerequisite (GCP project, billing free tier,
   artifacts repo, secrets), lệnh deploy tay, env vars, verify (`curl /api/health`), rollback
   (redeploy image trước — không DB nên rollback = redeploy), domain/DNS + Managed SSL note,
   HTTPS redirect (R-19).
5. `next.config.ts`: `output: 'standalone'` (nếu task này chưa có từ trước).

## Acceptance Criteria
- [ ] `Dockerfile` + `.dockerignore` build được local (`docker build` — nếu môi trường có Docker;
      không có → ghi `Blocked` + review tĩnh, không claim pass)
- [ ] Deploy workflow YAML hợp lệ, **KHÔNG** trigger push tự động; không secret hardcode trong YAML
- [ ] Runbook đủ: prerequisite, deploy, env vars, health verify (`/api/health`), rollback, domain/SSL
- [ ] `next.config.ts` `output: 'standalone'` + `npm run build` vẫn PASS
- [ ] KHÔNG deploy/push nào được thực thi trong task (verify `git status`/`git log` local)
- [ ] Check commands pass

## Verification Summary
- Commands: `npm run lint` · `npm run typecheck` · `npm run build` (+ `docker build` nếu có Docker)
- Test: `test_command: null` → skip, ghi lý do
- Manual evidence: YAML eyeball/actionlint; runbook review
- Reviewer report: `.context/review-reports/feature-nta-website-layer-4-task-04-round-1-review.md`

## Retry / Error Memory
- Attempt: 0
- Last failure type: n/a
- Error memory entry: none
- Escalation: none — sau 3 attempt fail → `architecture_review_needed`

## DoD (Definition of Done)
- [ ] Code/files written (chỉ trong scope — generate config, KHÔNG deploy)
- [ ] Tests: skip — `test_command: null`, ghi lý do
- [ ] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [ ] Reviewer độc lập PASS
- [ ] `.context/progress.json` updated
- [ ] Error Memory / Doc Impact recorded
- [ ] committed — 1 task = 1 commit (branch `main`; **KHÔNG push, KHÔNG deploy**)

## Files to Create/Modify
- `Dockerfile`, `.dockerignore`
- `.github/workflows/deploy.yml` (draft, không active)
- `docs/runbook/deploy-cloud-run.md`
- `next.config.ts` (`output: 'standalone'`)

## Notes
- ⏸ **Human checkpoint:** deploy thật (staging → prod) chạy ở bước `/start` 6 (`.agent/devops.md`)
  với **user approve production deploy** — task này chỉ dựng file.
- `staging_db`/`prod_db` = null (db_tool: none) → bỏ qua migration gate (project-config).
- HTTPS: Cloud Run Managed SSL / LB — ghi vào runbook, không code redirect app-level nếu
  platform xử lý (ghi quyết định).
