# Task 01 (modification): Reconcile intent docs deploy-platform Cloud Run → docker-vps

> Nguồn: change `spec/changes/archive/2026-10-09-deploy-platform-docker-vps.md` (acceptance 1–6) ·
> spec delta `spec/updates/2026-10-09-deploy-platform-docker-vps.md` · R-27 (+ R-14/R-26) (`SPECIFICATIONS.md`).

## Phase
1 (post-build doc/spec reconcile — docs-only, không có code change)

## Type
modification (post-build MODIFY — đổi ngữ nghĩa requirement deploy; **0 dòng code app**)

## Goal
Đồng bộ spec canonical + intent docs còn ghi **Google Cloud Run `asia-southeast1` scale-to-zero / free tier GCP**
sang nền tảng deploy thực tế **docker-vps** — VPS `187.52.119.50` (shared), Docker + nginx + certbot,
container `nta-web` tại `127.0.0.1:3005`, CI GitHub Actions self-hosted runner (label `nta-web`).
Phần code/config + runbook (`docs/runbook/deploy-vps.md`) đã thực hiện + deploy ở commit `4c34b9b` / `28527cb` / `4d8120d`
— coi là evidence, không làm lại. Domain `ntavietnam.tech` **giữ nguyên** (đã xử lý ở change `domain-ntavietnam`).

## Classification / Risk
- Work item type: FEATURE (post-build MODIFY)
- Change type: MODIFY (đổi ngữ nghĩa requirement R-27; R-14/R-26 wording)
- Scope: `SPECIFICATIONS.md`, `BRIEF.md`, `docs/BRD.md`, `docs/API_SPEC.md`,
  `docs/specs/2026-10-08-nta-website-design.md`, `.context/compressed-summary.md`;
  spec publish `spec/updates/` + `spec/CHANGELOG.md` + `spec/test-scope/current.json`
- Root cause category: n/a (không phải bug) — gap "deploy-platform drift": intent docs stale sau khi chuyển
  GCP Cloud Run → VPS ở bước 6
- Review level expected: **NORMAL** — doc-only, không auth/schema/data/API-contract thực thi; verify = grep + spec-validator
- Blast radius: intent docs (SPECIFICATIONS/BRIEF/BRD/API_SPEC/design spec) + context cache + test-scope. Không đụng code app.
- Doc impact: **yes** — reconcile as-built/intent docs (deploy platform)
- Decision impact: NO

## Scope (spec refs)
- **R-27** (`SPECIFICATIONS.md`): nền tảng deploy → docker-vps (`187.52.119.50`, Docker+nginx+certbot, `127.0.0.1:3005`, CI self-hosted runner); availability target ≥ 99.5% (đo uptime).
- **R-14**: `GET /api/health` wording → health check/uptime (docker-vps).
- **R-26** (Constraints/Budget): "free tier GCP" → "VPS shared chi phí thấp".

## Description (đúng scope — KHÔNG mở rộng)
1. `SPECIFICATIONS.md`: Scope (`:31`), Tech Stack Deploy (`:43`), R-14 (`:153`), R-26 Constraints (`:205`),
   R-27 (`:217-218`), gỡ note drift cũ (`:220`); bump `spec_version`.
2. `BRIEF.md`: mục Deploy (`:43`), Deploy doc (`:48` → `docs/runbook/deploy-vps.md`).
3. `docs/BRD.md`: Scope Deploy (`:53`), Scalability (`:126`), Availability (`:127`), Constraints Technical (`:156`), Budget (`:157`).
4. `docs/API_SPEC.md`: mô tả `/api/health` (`:29`).
5. `docs/specs/2026-10-08-nta-website-design.md`: Overview (`:12`), Approach table (`:28`), Health (`:77`), Deploy decision (`:115`).
6. `.context/compressed-summary.md`: version + platform snapshot.
7. Spec Publisher: bump `spec_version` 2.0.0 → 3.0.0 (MAJOR) + `spec/updates/2026-10-09-deploy-platform-docker-vps.md`
   + `spec/CHANGELOG.md` + `spec/test-scope/current.json` (`scopeVersion` 6 → 7).
8. KHÔNG đổi behavior/code app; KHÔNG đổi domain; KHÔNG sửa `.devops/templates/*`; KHÔNG đụng lịch sử
   (`.context/review-reports/**`, `.context/runs/**` cũ, `tasks/**` cũ, `spec/updates/**` cũ); KHÔNG đụng change-UI.

## Acceptance Criteria
- [ ] Không còn mô tả Cloud Run / `asia-southeast1` scale-to-zero / free tier GCP trong intent docs đã sửa (grep = 0)
- [ ] Deploy mô tả đúng docker-vps: VPS `187.52.119.50`, Docker + nginx + certbot, port nội bộ 3005, CI self-hosted runner
- [ ] R-27 + R-14 khớp platform mới; note drift cũ ở `SPECIFICATIONS.md:220` đã gỡ
- [ ] Không đổi code/behavior; domain `ntavietnam.tech` giữ nguyên
- [ ] `spec_version` 3.0.0 + `spec/updates/` + `spec/CHANGELOG.md` + `spec/test-scope/current.json` (scopeVersion 7)
- [ ] `npm run lint` / `npm run typecheck` / `npm run build` PASS (verify code hiện có — docs-only, không bắt buộc chạy lại)

## Verification Plan
- `grep -rn "Cloud Run\|asia-southeast1\|free tier\|gcp-cloud-run" SPECIFICATIONS.md BRIEF.md docs/BRD.md docs/API_SPEC.md docs/specs/2026-10-08-nta-website-design.md .context/compressed-summary.md` → 0
- `python3 -m json.tool spec/test-scope/current.json` → valid JSON
- spec-validator cross-check delta vs docs → PASS

## Retry / Error Memory
- Doc-only, risk LOW → không dự kiến retry. Verify FAIL → dừng, ghi residual (`error-memory` nếu lặp).

## Doc / Decision Impact
- Reconcile: `SPECIFICATIONS.md`, `BRIEF.md`, `docs/BRD.md`, `docs/API_SPEC.md`, `docs/specs/2026-10-08-nta-website-design.md`, `.context/compressed-summary.md`.
- No-code change: code/config + runbook VPS đã đúng từ commit `4c34b9b`/`28527cb`/`4d8120d`.
