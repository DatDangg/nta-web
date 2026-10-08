# Run Journal — devops/nta-website · step 6 (VPS deploy)

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: devops/nta-website
phaseTask: step-6-vps-deploy
step: devops
agent: null
status: blocked                     # chờ user set DNS A record cho ntasolution.vn
attempt: 0
interrupted: false
updatedAt: 2026-10-09T00:00:00+07:00
filesTouched: []
filesNew: [.context/runs/devops-nta-website-vps-deploy.md]
evidence:
  reportPath: null
  verify: "SSH root@187.52.119.50 OK (key auth). Server: Ubuntu 24.04, Docker 29.7 + Compose v5.5, 16G RAM, 50G free. Shared server: nginx vhost + certbot (*.genieplatform.cloud), container ports 3001-3004. Port 3005 FREE. Self-hosted GitHub Actions runner sẵn cho repo DatDangg/ismartschool-lms. DNS ntasolution.vn CHƯA resolve."
understand: "Bước 6 DevOps — deploy NTA website lên VPS (KHÔNG dùng GCP Cloud Run như config cũ). Config chốt: deploy_platform other(GCP) → docker-vps; method (A) self-hosted GitHub Actions runner cho repo DatDangg/nta-web; nginx + certbot; port nội bộ 3005; CONTACT_FORM_TARGET tạm để trống (chưa có info)."
next: "1) User set DNS A record: @ và www -> 187.52.119.50. 2) Verify dig. 3) /brainstorm deploy: cập nhật project-config (deploy_platform docker-vps + host/domain). 4) Sinh docker-compose.yml + nginx vhost ntasolution.vn + .github/workflows/deploy.yml (self-hosted runner) + runbook deploy-vps.md; dọn bản Cloud Run. 5) Đăng ký self-hosted runner cho DatDangg/nta-web. 6) Deploy -> test http://187.52.119.50:3005. 7) certbot HTTPS. 8) Đo R-22 (Lighthouse Perf/LCP/CLS) + R-23 (viewport 375/768/1280)."
loopSignal: none
approvals:
  - {gate: vps_deploy_plan, at: 2026-10-09T00:00:00+07:00, ok: true}   # user chốt A(actions)+nginx+certbot+port 3005
blockedReason: "Chờ user cấu hình DNS A record cho ntasolution.vn -> 187.52.119.50"
```

## Notes / WIP reasoning

- ⚠️ **Config cũ sai thực tế**: `deploy_platform: other` (= gcp-cloud-run) + `deploy.yml`/runbook Cloud Run đã generate ở layer-4-task-04 → sẽ thay bằng hướng VPS.
- Server là **shared** (ismartschool prod+staging, crm-dhp, tmfoods) → chỉ **THÊM** container/nginx mới, KHÔNG đụng app khác.
- Dockerfile Next standalone hiện tại tái dùng được; compose map `3005:8080`.
- `CONTACT_FORM_TARGET` = OQ#4 vẫn treo (user chưa có info) → deploy được nhưng form chưa gửi thật; gắn secret sau.
- Deploy production cần user approve rõ (rule devops: never auto-deploy prod).

## History

- 2026-10-09 chốt hướng deploy qua Q&A: (1) domain `ntasolution.vn` — cần user set DNS; (2) form target tạm để; (3) method A self-hosted runner; (4)(5) nginx+certbot, port 3005 OK. status=blocked chờ DNS.
