---
id: deploy-platform-docker-vps
type: feature
status: done
created: 2026-10-09
---

# Change Request — Reconcile deploy-platform drift: docs Cloud Run → docker-vps

## Yêu cầu

Đồng bộ **intent docs** cho khớp nền tảng deploy thực tế.

Thực tế (đã chốt ở brainstorm bước 6, `.context/project-config.md:51-59`): **docker-vps** — VPS `187.52.119.50` (shared), Docker + nginx + certbot, container `nta-web` ở `127.0.0.1:3005`, CI/CD GitHub Actions self-hosted runner (label `nta-web`).

Nhưng nhiều intent doc vẫn ghi **Google Cloud Run `asia-southeast1` scale-to-zero / free tier GCP**. Cần reconcile về docker-vps.

Chỗ cần sửa (domain đã xử lý ở change `domain-ntavietnam` — change này **chỉ platform**, không đụng lại domain):

- `SPECIFICATIONS.md`: `:31` (scope), `:43` (Deploy), `:153` (R-14 wording "cho Cloud Run"), `:205` (assumption GCP), `:217-218` (R-27), cân nhắc gỡ note drift `:220`.
- `BRIEF.md`: `:43` (Deploy), `:48` (trỏ template `.devops/templates/gcp-cloud-run.md`).
- `docs/BRD.md`: `:53` (Deploy), `:126` (Scalability), `:127` (Availability), `:156` (Technical), `:157` (Budget).
- `docs/API_SPEC.md`: `:29` (mô tả `/api/health` "cho Cloud Run").
- `docs/specs/2026-10-08-nta-website-design.md`: `:12`, `:28`, `:77`, `:115`.
- `.context/compressed-summary.md`: domain/platform snapshot (context cache).

## Bối cảnh

- Drift phát sinh khi chuyển deploy GCP Cloud Run → VPS ở bước 6 (`docs/runbook/deploy-vps.md`, commit `4c34b9b`, `28527cb`, `4d8120d`): code/config + runbook đã đổi, nhưng intent docs chưa reconcile.
- `docs/runbook/deploy-cloud-run.md` đã bị xoá; hiện chỉ còn `docs/runbook/deploy-vps.md`.
- Ghi nhận trước đó tại `SPECIFICATIONS.md:220` (note drift trong change `domain-ntavietnam`).

## Acceptance (bắt buộc)

- [ ] Không còn mô tả **deploy platform = Google Cloud Run / `asia-southeast1` scale-to-zero / free tier GCP** trong intent docs ở trên (BRIEF, BRD, SPECIFICATIONS, API_SPEC, design doc, compressed-summary).
- [ ] Deploy được mô tả đúng: **docker-vps** `187.52.119.50`, Docker + nginx + certbot, port nội bộ 3005, CI GitHub Actions self-hosted runner.
- [ ] R-27 + R-14 (wording) khớp platform mới; bỏ/đổi note drift `:220` (đã xử lý).
- [ ] Không đổi behavior/code; không đổi domain (`ntavietnam.tech` giữ nguyên).
- [ ] Spec Publisher: bump `spec_version` (nêu rõ MAJOR/MINOR + lý do) + `spec/updates/` + `spec/CHANGELOG.md` + `spec/test-scope/current.json`.
- [ ] Verify: `npm run lint` / `typecheck` / `build` PASS (không hồi quy).

## Ghi chú

- Classification dự kiến: **MODIFY** (đổi ngữ nghĩa requirement deploy R-27/R-14). Risk LOW (không auth/schema/data/API behavior).
- KHÔNG sửa `.context/review-reports/**`, `.context/runs/**`, `tasks/**`, `spec/updates/**` cũ (bản ghi lịch sử — point-in-time).
- Các file template `.devops/templates/*.md` là bộ template đa nền tảng của khung — giữ nguyên (không phải doc của project).
- **Chỉ xử lý change file này** — `spec/changes/2026-10-09-change-UI.md` để **pending nguyên**.
