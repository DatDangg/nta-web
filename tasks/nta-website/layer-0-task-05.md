# Task 05: Git/CI files + env example (generate, KHÔNG push)

## Layer
0

## Type
build (initial)

## Goal
Sinh file CI/CD + env scaffolding: GitHub Actions workflow verify (lint/typecheck/build),
`.env` example chứa `CONTACT_FORM_TARGET`, bổ sung `.gitignore` — **chỉ generate, không push,
không bật deploy** (chưa có remote, `auto_push_after_pass: false`).

## Classification / Risk
- Work item type: FEATURE (initial build)
- Feature change type: ADDITIVE (initial build)
- Scope: CROSS_CUTTING (CI + env convention)
- Root cause category: n/a
- Review level expected: NORMAL — YAML/env, không auth runtime
- Blast radius: `.github/workflows/*` (chưa active vì không remote), env conventions
- Doc impact: NO_DOC_IMPACT (CI/CD đã chốt trong project-config `ci_cd: github-actions`)
- Decision impact: NO

## Scope (spec refs)
- **R-19:** secret không lộ ra client — env server-side, `NEXT_PUBLIC_*` chỉ giá trị công khai
- **R-27:** CI/CD GitHub Actions (deploy Cloud Run chạy ở Layer 4 — task này chỉ dựng verify CI)
- `.context/project-config.md`: `ci_cd: github-actions`, `auto_push_after_pass: false`,
  check_commands, `secrets.required: [CONTACT_FORM_TARGET]`
- Design Open Question #6: package scripts phải khớp `check_commands` (đã có ở task-01)

## Dependencies
- task-01 (CI gọi đúng script `lint`/`typecheck`/`build` — independent với task-02/03/04)

## Description
1. `.github/workflows/ci.yml` (generate trước khi có remote — **KHÔNG `git push`**):
   triggers `push`/`pull_request` → checkout → setup-node (node LTS, cache npm) →
   `npm ci` → `npm run lint` → `npm run typecheck` → `npm run build`.
   Tự skip/ghép step khi script chưa tồn tại (theo Non-negotiables: thiếu command → không fail oan).
2. Env example: bổ sung `CONTACT_FORM_TARGET` (mục OQ#4 — interface giữ sẵn, giá trị → `.env.local`
   khi user chốt). File `.env.local.example` template **đã tồn tại** → reconcile (append/nối đúng mục),
   không xóa mẫu sẵn có. Không commit `.env.local`.
3. `.gitignore`: đảm bảo `node_modules/`, `.next/`, `.env.local`, logs bị ignore.
4. Ghi chú ngắn trong `README.md` (mục Development: install/lint/typecheck/build + CI status pending remote).

## Acceptance Criteria
- [ ] `.github/workflows/ci.yml` tồn tại, chạy đúng 3 lệnh verify; YAML hợp lệ
- [ ] `CONTACT_FORM_TARGET` có mặt trong env example; `.env.local` KHÔNG bị commit
- [ ] `.gitignore` cover `.next/`, `node_modules/`, `.env.local`
- [ ] KHÔNG có lệnh push/deploy nào được chạy (verify: `git log` chỉ có commit local, không remote)
- [ ] Check commands pass local

## Verification Summary
- Commands: `npm run lint` · `npm run typecheck` · `npm run build` (+ `git status` xác nhận không push)
- Test: `test_command: null` → skip, ghi lý do
- Manual evidence: YAML lint cơ bản (`actionlint` nếu có, không có → eyeball + ghi chú)
- Reviewer report: `.context/review-reports/feature-nta-website-layer-0-task-05-round-1-review.md`

## Retry / Error Memory
- Attempt: 0
- Last failure type: n/a
- Error memory entry: none
- Escalation: none — sau 3 attempt fail → `architecture_review_needed`

## DoD (Definition of Done)
- [ ] Code/files written (chỉ trong scope)
- [ ] Tests: skip — `test_command: null`, ghi lý do
- [ ] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [ ] Reviewer độc lập PASS
- [ ] `.context/progress.json` updated
- [ ] Error Memory / Doc Impact recorded
- [ ] committed — 1 task = 1 commit (branch `main`; **KHÔNG push** — `forbidden_branch: main`, không remote)

## Files to Create/Modify
- `.github/workflows/ci.yml` (mới)
- `.env.local.example` (append `CONTACT_FORM_TARGET`) — file template sẵn có, không ghi đè mất
- `.gitignore` (append nếu thiếu)
- `README.md` (mục Development/verify commands)

## Notes
- ⚠️ OQ#4: `CONTACT_FORM_TARGET` chưa chốt đích gửi (email/Sheet/CRM) — env var giữ sẵn, giá trị
  do user điền sau; interface forward chốt ở Layer 3 task-01.
- Deploy workflow Cloud Run **KHÔNG** ở task này — Layer 4 task-04 dựng file; mọi deploy cần
  user approve riêng.
