# Run Journal — devops/nta-website · step 6 (VPS deploy)

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: devops/nta-website
phaseTask: step-6-vps-deploy
step: devops
agent: null
status: blocked                     # CI/CD VPS xong + preview qua IP; chờ DNS (HTTPS/certbot) + form target
attempt: 0
interrupted: false
updatedAt: 2026-10-09T03:30:00+07:00
filesTouched: [.github/workflows/deploy.yml, docker-compose.yml, src/lib/seo.ts, public/llms.txt, docs/API_SPEC.md, docs/runbook/deploy-vps.md, .context/project-config.md, .context/design-spec.md, .context/brainstorm-log.md, .context/runs/devops-nta-website-vps-deploy.md]
filesNew: []
evidence:
  reportPath: null
  verify: "Self-hosted runner cài tại /opt/actions-runner-nta-web (v2.338.0, RUNNER_ALLOW_RUNASASROOT=1, label nta-web, service active). Pushed b2d883c + ec1420d → job 'deploy' Succeeded. Deploy chuẩn hoá: runner workspace /opt/actions-runner-nta-web/_work/nta-web/nta-web (bỏ /opt/nta-web). Container nta-web running+healthy, 127.0.0.1:3005->8080, health {status:ok}. Routes 200. DNS vẫn chặn."
understand: "Bước 6 DevOps — deploy NTA website lên VPS (KHÔNG dùng GCP Cloud Run như config cũ). Config chốt: deploy_platform other(GCP) → docker-vps; method (A) self-hosted GitHub Actions runner cho repo DatDangg/nta-web; nginx + certbot; port nội bộ 3005; CONTACT_FORM_TARGET tạm để trống (chưa có info)."
next: "Còn lại: (1) Cấu hình DNS A record cho `ntavietnam.tech` → 187.52.119.50 (script dựng: deploy nginx vhost + certbot HTTPS). (2) Đo R-22 + R-23 sau khi public. (3) CONTACT_FORM_TARGET khi user có info. (4) Gap: SPECIFICATIONS/BRIEF/BRD còn ghi domain cũ — xử lý qua /change nếu cần."
loopSignal: none
approvals:
  - {gate: vps_deploy_plan, at: 2026-10-09T00:00:00+07:00, ok: true}   # user chốt A(actions)+nginx+certbot+port 3005
  - {gate: vps_container_deployed, at: 2026-10-09T02:25:00+07:00, ok: true}   # container lên port 3005, health OK
  - {gate: self_hosted_runner_live, at: 2026-10-09T02:35:00+07:00, ok: true}   # runner active, CI/CD deploy Succeeded
  - {gate: domain_switch_landing, at: 2026-10-09T02:40:00+07:00, ok: true}   # user đổi domain đích → landing.ntasolution.vn
  - {gate: domain_switch_ntavietnam, at: 2026-10-09T03:30:00+07:00, ok: true}   # user đổi domain đích → ntavietnam.tech (thay hoàn toàn, https apex, không www)
blockedReason: "DNS A record (PA Vietnam) — cần cho HTTPS/public"
```

## Notes / WIP reasoning

- ⚠️ **Config cũ sai thực tế**: `deploy_platform: other` (= gcp-cloud-run) + `deploy.yml`/runbook Cloud Run đã generate ở layer-4-task-04 → sẽ thay bằng hướng VPS.
- Server là **shared** (ismartschool prod+staging, crm-dhp, tmfoods) → chỉ **THÊM** container/nginx mới, KHÔNG đụng app khác.
- Dockerfile Next standalone hiện tại tái dùng được; compose map `3005:8080`.
- `CONTACT_FORM_TARGET` = OQ#4 vẫn treo (user chưa có info) → deploy được nhưng form chưa gửi thật; gắn secret sau.
- Deploy production cần user approve rõ (rule devops: never auto-deploy prod).

## History

- 2026-10-09 chốt hướng deploy qua Q&A: (1) domain `ntasolution.vn` — cần user set DNS; (2) form target tạm để; (3) method A self-hosted runner; (4)(5) nginx+certbot, port 3005 OK. status=blocked chờ DNS.
- 2026-10-09 DNS: user thêm A record ở panel PA Vietnam + báo "Lưu thành công" nhưng zone authoritative KHÔNG nhận (SOA serial 2026100803 không đổi, NSEC bitmap apex không có A). → lỗi phía PA. User chọn gác domain lại.
- 2026-10-09 sinh files deploy VPS + commit `4c34b9b` push. Clone /opt/nta-web trên VPS → `docker compose up -d --build` OK. Container healthy, health check + routes 200, canonical đúng. status=blocked chờ DNS (HTTPS) + runner token.
- 2026-10-09 cài self-hosted runner (`/opt/actions-runner-nta-web`, v2.338.0, label `nta-web`, RUNNER_ALLOW_RUNASROOT=1), service active. Push test `b2d883c` → job Succeeded. Chuẩn hoá deploy từ runner workspace, bỏ `/opt/nta-web`; push `ec1420d` → container tạo lại từ workspace, healthy, health OK. CI/CD end-to-end OK.
- 2026-10-09 thêm nginx vhost **tạm** `/etc/nginx/sites-available/nta-web-preview.conf` (server_name 187.52.119.50 → proxy 127.0.0.1:3005) để preview qua IP. Verify ngoài: http://187.52.119.50/ = 200, title NTA, /api/health ok. ⚠️ XOÁ file này khi domain live (đã có `deploy/nginx/ntasolution.vn.conf` trong repo cho bản thật).
- 2026-10-09 đổi domain đích `landing.ntasolution.vn` → **`ntavietnam.tech`** (thay hoàn toàn, canonical `https://ntavietnam.tech`, apex không www). Rename nginx vhost → `deploy/nginx/ntavietnam.tech.conf`; cập nhật deploy.yml/compose/seo fallback/runbook/project-config/brainstorm-log + `public/llms.txt` (đang stale `ntasolution.vn`) + `docs/API_SPEC.md` + `.context/design-spec.md`. Chưa đổi SPECIFICATIONS/BRIEF/BRD (gap).
