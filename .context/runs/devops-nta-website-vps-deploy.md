# Run Journal — devops/nta-website · step 6 (VPS deploy)

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: devops/nta-website
phaseTask: step-6-vps-deploy
step: devops
agent: null
status: done                        # domain live (HTTPS + canonical đúng); còn R-22/R-23 đo sau + CONTACT_FORM_TARGET
attempt: 0
interrupted: false
updatedAt: 2026-10-09T16:10:00+07:00
filesTouched: [.github/workflows/deploy.yml, docker-compose.yml, src/lib/seo.ts, public/llms.txt, docs/API_SPEC.md, docs/runbook/deploy-vps.md, .context/project-config.md, .context/design-spec.md, .context/brainstorm-log.md, .context/runs/devops-nta-website-vps-deploy.md]
filesNew: []
evidence:
  reportPath: null
  verify: "Self-hosted runner cài tại /opt/actions-runner-nta-web (v2.338.0, RUNNER_ALLOW_RUNASASROOT=1, label nta-web, service active). Deploy chuẩn hoá: runner workspace /opt/actions-runner-nta-web/_work/nta-web/nta-web. 09/10/2026 domain ntavietnam.tech live: DNS A → 187.52.119.50; nginx vhost ntavietnam.tech + certbot Let\'s Encrypt (ECDSA, hạn 2027-01-07, auto-renew); http→https 301; gỡ vhost preview IP. Container rebuild từ HEAD 4d8120d (git archive) với NEXT_PUBLIC_SITE_URL=https://ntavietnam.tech → healthy, 127.0.0.1:3005→8080. Verify ngoài: / /api/health /llms.txt /robots.txt /sitemap.xml /en /solutions/ai = 200; canonical=https://ntavietnam.tech; robots sitemap=https://ntavietnam.tech/sitemap.xml; llms.txt 9 ref domain mới / 0 ref cũ."
understand: "Bước 6 DevOps — deploy NTA website lên VPS (KHÔNG dùng GCP Cloud Run như config cũ). Config chốt: deploy_platform other(GCP) → docker-vps; method (A) self-hosted GitHub Actions runner cho repo DatDangg/nta-web; nginx + certbot; port nội bộ 3005; CONTACT_FORM_TARGET tạm để trống (chưa có info)."
next: "Còn lại: (1) Đo R-22 (Lighthouse) + R-23 (viewport) trên domain public. (2) CONTACT_FORM_TARGET khi user có info. (3) Gap: SPECIFICATIONS/BRIEF/BRD còn ghi domain cũ — xử lý qua /change nếu cần. Lưu ý: remote GitHub vẫn ở 28527cb (chưa push); build domain vừa rồi chạy thủ công từ HEAD local."
loopSignal: none
approvals:
  - {gate: vps_deploy_plan, at: 2026-10-09T00:00:00+07:00, ok: true}   # user chốt A(actions)+nginx+certbot+port 3005
  - {gate: vps_container_deployed, at: 2026-10-09T02:25:00+07:00, ok: true}   # container lên port 3005, health OK
  - {gate: self_hosted_runner_live, at: 2026-10-09T02:35:00+07:00, ok: true}   # runner active, CI/CD deploy Succeeded
  - {gate: domain_switch_landing, at: 2026-10-09T02:40:00+07:00, ok: true}   # user đổi domain đích → landing.ntasolution.vn
  - {gate: domain_switch_ntavietnam, at: 2026-10-09T03:30:00+07:00, ok: true}   # user đổi domain đích → ntavietnam.tech (thay hoàn toàn, https apex, không www)
  - {gate: prod_domain_live, at: 2026-10-09T16:10:00+07:00, ok: true}   # user duyệt "tự ssh làm" → bật nginx + certbot + rebuild canonical trên VPS
blockedReason: null
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
- 2026-10-09 (SSH, user duyệt "tự ssh làm") domain **live**: scp vhost → `/etc/nginx/sites-available/ntavietnam.tech`, symlink, `certbot --nginx -d ntavietnam.tech` (HTTPS+redirect), gỡ `/etc/nginx/sites-enabled/nta-web-preview.conf`. Rebuild image **thủ công** từ HEAD local (`git archive` → `/opt/nta-web-deploy`, `docker compose -p nta-web up -d --build` với `NEXT_PUBLIC_SITE_URL=https://ntavietnam.tech`; temp dir đã xoá). Verify ngoài: 7 route 200, canonical/robots/sitemap/llms.txt = `ntavietnam.tech`, 0 ref cũ. ⚠️ Chưa push → remote GitHub vẫn `28527cb`; CI lần tới sẽ build lại từ workspace.
