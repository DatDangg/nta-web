# Run Journal — builder/nta-website · layer-4-task-04

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: builder/nta-website
phaseTask: layer-4-task-04
step: done
agent: null
status: done                          # task-04 close-out hoàn tất (progress + task DoD + commit 04f3d7a) → Layer 4 xong
attempt: 0
interrupted: false
updatedAt: 2026-10-10T02:30:00+07:00
filesTouched: [next.config.ts]
filesNew: [Dockerfile, .dockerignore, .github/workflows/deploy.yml, docs/runbook/deploy-cloud-run.md]
evidence:
  reportPath: .context/review-reports/feature-nta-website-layer-4-task-04-round-1-review.md
  round: 1
  verdict: PASS
  verify: "lint 0 err (1 warning MDX <img> pre-existing) + typecheck PASS + build PASS (standalone). .next/standalone/server.js chạy được: PORT=3211 node server.js → /api/health 200 {status:ok}, / 200. YAML deploy.yml+ci.yml parse OK; ci.yml unchanged. docker build Blocked (môi trường không có docker). Reviewer r1 NORMAL PASS (0 CRITICAL/MAJOR, 3 MINOR non-blocking)."
understand: "layer-4-task-04 = Deploy config Cloud Run (asia-southeast1, scale-to-zero, max-instances 3) — GENERATE files, KHÔNG deploy/push: Dockerfile + .dockerignore + .github/workflows/deploy.yml (draft) + docs/runbook/deploy-cloud-run.md + next.config.ts output:standalone (R-27/R-14/R-19)"
next: "DONE — close-out task-04 (progress + task DoD + commit 04f3d7a). Layer 4 hoàn tất (task-01..04) → BƯỚC KẾ: spec-validator phase review Layer 4 → human checkpoint unlock Layer 5"
loopSignal: none
approvals:
  - {gate: layer0_done, at: 2026-10-08T20:10:00+07:00, ok: true}
  - {gate: layer1_done, at: 2026-10-09T07:00:00+07:00, ok: true}
  - {gate: layer2_done, at: 2026-10-09T18:05:00+07:00, ok: true}
  - {gate: layer3_done_unlock_layer4, at: 2026-10-09T22:05:00+07:00, ok: true}
batchQueue: []
```

## Notes / WIP reasoning

- Task-03 done + committed `7e9a0ef`. Đây là task cuối Layer 4 (task-01..04).
- Context: `.github/workflows/ci.yml` đã có (layer-0 task-05) — deploy workflow phải là file riêng, KHÔNG sửa ci.yml, KHÔNG auto-trigger push/deploy.
- `forbidden_branch: main` push cấm, `auto_push_after_pass: false` → deploy.yml để trạng thái draft/manual (`workflow_dispatch`), không secret hardcode, secret qua Secret Manager/runtime env (`CONTACT_FORM_TARGET`).
- `db_tool: none`, `staging_db`/`prod_db` null → bỏ migration gate.
- ⏸ Deploy thật chạy ở `/start` bước 6 (devops) với user approve — task này chỉ sinh file.
- Usage gate: tool `usage()` chưa đăng ký → không đánh giá được.

### Primary điều chỉnh sau builder (trong scope, trước review)
- **Dockerfile:** builder đặt `ENV NODE_ENV=production` ở stage `base` (ảnh hưởng cả builder) + `npm ci --include=dev`. Rủi ro: NODE_ENV=production khi `npm ci`/`next build`. Primary refactor sang multi-stage chuẩn: `base` (không NODE_ENV, có NEXT_TELEMETRY_DISABLED) → `deps` (`npm ci`) → `builder` (copy node_modules + source → `next build`) → `runner` (mới set `NODE_ENV=production PORT=8080 HOSTNAME=0.0.0.0`, non-root, copy standalone/static/public, `CMD node server.js`).
- **deploy.yml trigger:** builder để `workflow_dispatch` + `push: tags v*`. AC task ghi "KHÔNG trigger push tự động" → primary bỏ trigger `push`, chỉ giữ `workflow_dispatch` (thêm comment). Vẫn đúng mô tả task ("tag/release **hoặc** manual").

## History

- 2026-10-10T02:00:00+07:00 ▶ write-ahead builder layer-4-task-04 — status=running (cancel sẽ redo builder).
- 2026-10-10T02:10:00+07:00 builder subagent completed (Dockerfile/.dockerignore/deploy.yml/runbook/next.config); docker build Blocked (no docker). Primary điều chỉnh Dockerfile multi-stage + trigger manual-only.
- 2026-10-10T02:15:00+07:00 primary verify: lint/typecheck/build PASS; `.next/standalone/server.js` chạy → `/api/health` 200, `/` 200; YAML valid; ci.yml unchanged. status=awaiting → reviewer.
- 2026-10-10T02:22:00+07:00 reviewer r1 **NORMAL PASS** (0 CRITICAL/MAJOR, 3 MINOR non-blocking). Report `.context/review-reports/feature-nta-website-layer-4-task-04-round-1-review.md`.
- 2026-10-10T02:30:00+07:00 close-out DONE — progress.json + task DoD + commit `04f3d7a`. status=done → **Layer 4 hoàn tất** → phase review.
