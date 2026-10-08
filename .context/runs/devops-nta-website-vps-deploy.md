# Run Journal — devops/nta-website · step 6 (VPS deploy)

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: devops/nta-website
phaseTask: step-6-vps-deploy
step: devops
agent: null
status: blocked                     # container đã deploy OK; chờ DNS (HTTPS/certbot) + runner token
attempt: 0
interrupted: false
updatedAt: 2026-10-09T02:25:00+07:00
filesTouched: [Dockerfile, .github/workflows/deploy.yml, .context/project-config.md, .context/brainstorm-log.md]
filesNew: [docker-compose.yml, deploy/nginx/ntasolution.vn.conf, docs/runbook/deploy-vps.md, .context/runs/devops-nta-website-vps-deploy.md]
evidence:
  reportPath: null
  verify: "Commit 4c34b9b pushed. Deploy trên VPS /opt/nta-web (git clone public) → docker compose up -d --build OK. Container nta-web healthy, bind 127.0.0.1:3005->8080. Verify: / /en /about /contact /blog /solutions/ai /robots.txt /sitemap.xml /api/health /llms.txt = 200; /nonexistent = 404; title VI đúng; canonical = https://ntasolution.vn (build-arg NEXT_PUBLIC_SITE_URL OK). Health JSON {status:ok}. DNS ntasolution.vn vẫn chưa publish (PA Vietnam) — SOA serial 2026100803 không đổi dù panel báo lưu thành công."
understand: "Bước 6 DevOps — deploy NTA website lên VPS (KHÔNG dùng GCP Cloud Run như config cũ). Config chốt: deploy_platform other(GCP) → docker-vps; method (A) self-hosted GitHub Actions runner cho repo DatDangg/nta-web; nginx + certbot; port nội bộ 3005; CONTACT_FORM_TARGET tạm để trống (chưa có info)."
next: "Còn lại: (1) Đăng ký self-hosted runner cho DatDangg/nta-web (label nta-web) — CẦN user cấp registration token hoặc chạy command trên VPS. (2) DNS: PA Vietnam chưa publish A record → chờ/liên hệ PA hoặc chuyển Cloudflare → certbot HTTPS. (3) Đo R-22 (Lighthouse Perf/LCP/CLS) + R-23 (viewport 375/768/1280). (4) CONTACT_FORM_TARGET khi user có info."
loopSignal: none
approvals:
  - {gate: vps_deploy_plan, at: 2026-10-09T00:00:00+07:00, ok: true}   # user chốt A(actions)+nginx+certbot+port 3005
  - {gate: vps_container_deployed, at: 2026-10-09T02:25:00+07:00, ok: true}   # container lên port 3005, health OK
blockedReason: "DNS A record (PA Vietnam) + self-hosted runner registration token"
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
