# Spec Update — 2026-10-09 deploy-platform-docker-vps

**spec_version:** 2.0.0 → 3.0.0 (**MAJOR — đổi ngữ nghĩa requirement**)
**Trigger:** feature-update
**Change:** `spec/changes/archive/2026-10-09-deploy-platform-docker-vps.md` (MODIFY, risk LOW)

## Requirements

- **SỬA R-27 (nền tảng deploy):** Google Cloud Run `asia-southeast1` (scale-to-zero, max-instances 3, free tier GCP)
  → **docker-vps** — VPS `187.52.119.50` (shared; chỉ thêm container mới), Docker + nginx + certbot,
  container `nta-web` tại `127.0.0.1:3005` (host→container 8080), CI/CD GitHub Actions **self-hosted runner** (label `nta-web`).
  Availability: giữ **target ≥ 99.5%** nhưng bỏ gắn nhãn "Cloud Run SLA" → "đo uptime thực tế". Domain `ntavietnam.tech` **giữ nguyên**.
- **SỬA R-14 (wording):** `GET /api/health` — `{status:"ok",timestamp}` "cho Cloud Run" → "cho health check / uptime (docker-vps)".
- **SỬA R-26 Constraints (Budget):** "ưu tiên free tier GCP" → "VPS shared chi phí thấp".
- **SỬA Scope line** (`SPECIFICATIONS.md:31`): "deploy Cloud Run" → "deploy docker-vps (Docker + nginx trên VPS)".
- **SỬA Tech Stack Deploy line** (`SPECIFICATIONS.md:43`) + gỡ note drift cũ (`:220`) — nay đã reconcile.
- KHÔNG thêm/xoá requirement; KHÔNG đổi R-01…R-26 khác; KHÔNG đổi domain/behavior/code.

**Lý do bump MAJOR (không phải PATCH/MINOR):** nền tảng deploy là **ngữ nghĩa requirement** R-27 (serverless GCP
→ self-hosted VPS thay đổi mô hình vận hành: scale-to-zero/billing/probe/HTTPS termination), theo
`docs/SPEC_VERSIONING.md`: "MAJOR — xoá requirement / **đổi ngữ nghĩa requirement**". Không phải chỉ "làm rõ wording"
(PATCH) và không phải "thêm requirement" (MINOR).

## Ảnh hưởng

- **Module:** deployment / CI-CD / health check — nhưng **0 dòng code thay đổi trong change này**
  (code/config + runbook đã đổi + deploy thực tế ở commit `4c34b9b`, `28527cb`, `4d8120d`).
- **Intent docs reconcile:** `SPECIFICATIONS.md` (`:31`, `:43`, `:153`, `:205`, `:217-221`), `BRIEF.md` (`:43`, `:48`),
  `docs/BRD.md` (`:53`, `:126`, `:127`, `:156`, `:157`), `docs/API_SPEC.md` (`:29`),
  `docs/specs/2026-10-08-nta-website-design.md` (`:12`, `:28`, `:77`, `:115`), `.context/compressed-summary.md`.
- **Ngoài phạm vi (giữ nguyên):** domain `ntavietnam.tech`; `.devops/templates/*` (bộ template đa nền tảng của khung);
  các bản ghi lịch sử (`.context/review-reports/**`, `.context/runs/**` cũ, `tasks/**` cũ, `spec/updates/**` cũ).
- **Test:** retest health check + uptime trên docker-vps (`GET /api/health` qua `http://127.0.0.1:3005` / domain);
  xác nhận docs không còn mô tả Cloud Run là nền tảng deploy.

## Ghi nhận

- Drift phát sinh khi chuyển GCP Cloud Run → VPS ở bước 6 (`docs/runbook/deploy-vps.md`). Runbook
  `docs/runbook/deploy-cloud-run.md` đã xoá.
- Residual KHÔNG thuộc change này: comment trong code rate-limit còn ghi tên platform cũ (code ngoài phạm vi docs).

**Test scope:** `spec/test-scope/current.json` → `trigger: feature-update`, `scopeVersion` 6 → 7, `risk: low`.
