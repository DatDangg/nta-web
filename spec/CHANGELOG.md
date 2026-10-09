# Spec Changelog

> Mỗi lần đổi `SPECIFICATIONS.md` → thêm 1 dòng. Version scheme: `docs/SPEC_VERSIONING.md`.

| Version | Ngày | Loại | Thay đổi | Scope sinh |
|---|---|---|---|---|
| 1.0.0 | 2026-10-08 | initial | Reverse-engineer spec từ docs (chưa có code) — 27 req R-01…R-27 | initial-build |
| 1.0.0 | 2026-10-09 | reconcile | Fix Layer-1 dead links + plan drift (Gap 1–4): align code/plan về R-03/R-05/R-06/R-07/R-11 đã ratified — **không đổi requirement, không bump version** | scope v2 (`feature-update`) |
| 1.0.1 | 2026-10-09 | PATCH | Làm rõ R-09: format ngày blog **list** = detail (VI `08/10/2026`, EN `Oct 8, 2026`), 1 nguồn util dùng chung (fix C-L2-1) | scope v3 (`feature-update`) |
| 1.0.1 | 2026-10-10 | initial-build | Initial build hoàn tất — R-01…R-27 implemented qua Layers 0–4 (foundation, layout, content pages, API/form, SEO/perf/a11y/deploy config). **Không đổi requirement, không bump version**; R-22/R-23 PARTIAL (đo ở gate DevOps/prod) | scope v4 (`initial-build`) |
| 1.1.0 | 2026-10-09 | MINOR | Thêm R-06a–e (content Talvra/BoxAI/Flycam + render benefits/section) và R-08a (sửa case study Óc Eo → AI camera+flycam tại Óc Eo–Ba Thê, category ai) — change `ai-solution-content` | scope v5 (`feature-update`) |
| 2.0.0 | 2026-10-09 | MAJOR | Đổi domain đích → `ntavietnam.tech` (canonical/API base URL/R-27; apex HTTPS, thay hoàn toàn) — change `domain-ntavietnam`; 0 code change (đã deploy) | scope v6 (`feature-update`) |
| 3.0.0 | 2026-10-09 | MAJOR | Đổi nền tảng deploy Cloud Run → **docker-vps** (VPS `187.52.119.50`, Docker + nginx + certbot, `127.0.0.1:3005`, CI self-hosted runner) — R-27/R-14/R-26 wording + scope; change `deploy-platform-docker-vps`; 0 code change | scope v7 (`feature-update`) |
| 3.0.0 | 2026-10-09 | reconcile | Dọn drift GCP còn sót: comment rate-limit (`Cloud Run/GFE` → **nginx/VPS**) trong `src/app/api/contact/route.ts` + `docs/PERMISSION.md` secrets pointer (bỏ Secret Manager/`gcp-cloud-run.md`) — **không đổi requirement/behavior, không bump version** | scope v8 (`feature-update`) |
