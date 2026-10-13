# Task 02 (additive): Apply trên VPS — vhost + certbot `ntasolution.vn` + verify ngoài

> Nguồn: change `spec/changes/2026-10-13-add-domain-ntasolution.md` (CR-005, acceptance 1–7 + 8)
> · phụ thuộc task-01 (vhost + runbook đã có trong repo) · spec `SPECIFICATIONS.md` R-27 (3.5.0).

## Type
feature (ADDITIVE) — hạ tầng VPS (nginx + certbot). **0 dòng code app.**

## Classification / Risk
- Work item type: FEATURE (post-build ADDITIVE)
- Feature change type: ADDITIVE
- Scope: CROSS_CUTTING (hạ tầng **shared** VPS — nhưng chỉ **THÊM** vhost mới, không sửa vhost/app khác)
- Root cause category: CONFIG_ENV
- Review level expected: **STRICT** — đụng nginx + TLS trên VPS shared (ismartschool, crm-dhp, tmfoods);
  sai cấu hình có thể ảnh hưởng site khác. Verify = redirect matrix + canonical + regression `ntavietnam.tech`.
- Blast radius: nginx trên `187.52.119.50` (thêm 1 file `sites-available` + 1 symlink `sites-enabled` + 1 cert lineage);
  KHÔNG đụng container/app/vhost khác, KHÔNG đổi `NEXT_PUBLIC_SITE_URL` ⇒ không rebuild.
- Doc impact: YES — cập nhật `docs/runbook/deploy-vps.md` nếu thực tế lệch (vd đường dẫn vhost/cert khác) + ghi evidence verify
- Decision impact: NO

## Phase
4 (Integration/infra — deploy thật)

## Goal
Đưa domain phụ `ntasolution.vn` (+ `www`) hoạt động thật trên VPS: proxy tới **cùng app** `127.0.0.1:3005`,
HTTPS hợp lệ cho apex+www, `www` → 301 apex, `http` → 301 `https`, canonical vẫn `ntavietnam.tech`,
`ntavietnam.tech` **không đổi hành vi**.

## Dependencies
- **task-01** (vhost `deploy/nginx/ntasolution.vn.conf` + runbook §3b phải đã có trong repo/commit).
- **⛔ Human checkpoint: user phải DUYỆT SSH** trước khi chạy bất kỳ lệnh nào trên VPS
  (change file §Ghi chú: "chờ user duyệt SSH trước khi chạy").

## Description
1. SSH `root@187.52.119.50`; lấy repo trên VPS (workspace runner hoặc bản clone) để có `deploy/nginx/ntasolution.vn.conf`.
2. Pre-check (read-only): `dig +short ntasolution.vn` + `dig +short www.ntasolution.vn` → `187.52.119.50`;
   `ls /etc/nginx/sites-enabled/` (xác nhận chưa có vhost nào cho domain này); `nginx -t` (baseline phải OK **trước** khi thêm).
3. Apply theo `docs/runbook/deploy-vps.md` §3b:
   ```sh
   cp deploy/nginx/ntasolution.vn.conf /etc/nginx/sites-available/ntasolution.vn
   ln -sf /etc/nginx/sites-available/ntasolution.vn /etc/nginx/sites-enabled/
   nginx -t                                    # PHẢI OK — fail thì dừng, không reload
   certbot --nginx --redirect -d ntasolution.vn -d www.ntasolution.vn
   nginx -t && systemctl reload nginx
   ```
4. Verify ngoài (từ máy dev) theo acceptance; lưu output làm evidence trong task file + journal.
5. Nếu lệch thực tế (path/khác biệt certbot) → reconcile `docs/runbook/deploy-vps.md` trong cùng task.
6. KHÔNG sửa vhost/cert của `ntavietnam.tech`; KHÔNG sửa `.github/workflows/deploy.yml`; KHÔNG rebuild container.

## Acceptance Criteria
- [x] `https://ntasolution.vn/` = 200 + `https://ntasolution.vn/en` = 200 (nội dung site, không phải trang nginx mặc định)
- [x] `http://ntasolution.vn/` → 301 `https://ntasolution.vn/`; `http://www.ntasolution.vn/` → 301 `https://ntasolution.vn/`
      (certbot ban đầu set `https://$host` cho www → đã sed về thẳng apex + reload)
- [x] `https://www.ntasolution.vn/` → 301 `https://ntasolution.vn/` (apex)
- [x] Cert Let's Encrypt hợp lệ cho **apex + www** (Subject `CN=ntasolution.vn`, SAN `ntasolution.vn` + `www.ntasolution.vn`,
      hết hạn **2027-01-11** — hết `SEC_E_WRONG_PRINCIPAL`; cert `ntavietnam.tech` riêng, hết hạn 2027-01-07, không đổi)
- [x] `curl -fsS https://ntasolution.vn/api/health` → `{"status":"ok","timestamp":"2026-10-13T09:05:33.609Z"}`
- [x] HTML domain phụ có `rel="canonical"` = `https://ntavietnam.tech` (apex + www) và **KHÔNG** redirect sang domain chính (200 trực tiếp; 0 meta-refresh)
- [x] `https://ntavietnam.tech/` vẫn 200 + HTTPS + cert còn hạn (NotAfter 2027-01-07; vhost md5 `8557842926f082a76a80431f121324f4` không đổi; http→301 https không đổi)
- [x] HTML domain phụ: 18 chỗ `ntavietnam.tech` đều là SEO tag (canonical/hreflang/og/twitter/JSON-LD) — không có redirect/meta-refresh
- [x] VPS không ảnh hưởng site khác: `nginx -t` OK, nginx active, container `nta-web` healthy,
      tmfoods.genieplatform.cloud 200; dhp-cms.genieplatform.cloud = 000 **do DNS trỏ 187.124.226.230 (IP khác — pre-existing, không phải regression của change này)**; ismartschool containers chạy bình thường
- [x] `docs/runbook/deploy-vps.md` — cập nhật lệch thực tế (certbot tách block 80 managed + cần sed www → apex) ở close-out

## Evidence (13/10/2026)
```text
DNS: ntasolution.vn → 187.52.119.50 · www.ntasolution.vn → CNAME apex → 187.52.119.50
nginx -t baseline: OK (2 warn tmfoods pre-existing) → sau vhost: OK → sau certbot: OK → sau sed: OK
certbot: Successfully received + deployed certificate (live/ntasolution.vn, expires 2027-01-11, SAN apex+www)
reload: RELOAD_OK · systemctl is-active nginx = active · md5 ntavietnam.tech = 8557842926f082a76a80431f121324f4 (GIỮ NGUYÊN)
http://ntasolution.vn/        301 → https://ntasolution.vn/
http://www.ntasolution.vn/    301 → https://ntasolution.vn/     (đã fix từ https://www sau khi certbot set $host)
https://www.ntasolution.vn/   301 → https://ntasolution.vn/
https://ntasolution.vn/       200 · https://ntasolution.vn/en 200
https://ntasolution.vn/api/health → {"status":"ok",...}
canonical: apex + www → rel="canonical" href="https://ntavietnam.tech" (0 meta-refresh)
https://ntavietnam.tech/ 200 · http://ntavietnam.tech/ 301 → https://ntavietnam.tech/
cert: CN=ntasolution.vn SAN[ntasolution.vn, www.ntasolution.vn] exp 2027-01-11; CN=ntavietnam.tech exp 2027-01-07 (không đổi)
site khác: tmfoods.genieplatform.cloud 200 · dhp-cms DNS→187.124.226.230 (ngoài VPS này, pre-existing) · container nta-web Up (healthy)
ismartschool: containers ismartschool-web (Up 3 days), ismartschool-staging-web/api/postgres/redis/minio (Up 30h), sysupgrade-postgres (Up 5w) — docker ps trước VÀ sau apply không đổi trạng thái
crm-dhp (site TRÊN box): vhost phản hồi — `curl -H 'Host: dhp-cms.genieplatform.cloud' http://127.0.0.1/` → 301 (từ trong VPS); public `dhp-cms.genieplatform.cloud` trỏ IP khác nên test từ ngoài không tới box này
```

## Verification Plan
- Commands (chạy từ máy dev — curl/PowerShell; `nginx -t` chạy **trên VPS**):
  ```sh
  curl -sI http://ntasolution.vn/; curl -sI http://www.ntasolution.vn/
  curl -sI https://www.ntasolution.vn/; curl -sI https://ntasolution.vn/; curl -sI https://ntasolution.vn/en
  curl -fsS https://ntasolution.vn/api/health
  curl -fsS https://ntasolution.vn/ | grep -o 'rel="canonical" href="[^"]*"'
  curl -sI https://ntavietnam.tech/            # regression: 200
  ```
- App-level regression trên code: `npm run typecheck` · `npm run lint` · `npm run build` (theo `.context/project-config.md`) —
  kỳ vọng PASS, **không file code nào đổi** trong task này (chỉ để chứng minh không hồi quy).
- Evidence bắt buộc lưu: output `nginx -t`, output certbot, redirect matrix (status + Location), canonical grep.
- Reviewer report path: `.context/review-reports/feature-add-domain-ntasolution-phase-1-task-02-round-1-review.md`
- Nếu môi trường không đủ quyền SSH → ghi `BLOCKED` (không tự bỏ qua), DỪNG chờ user.

## Retry / Error Memory
- Attempt: 0
- Last failure type: n/a
- Error memory entry: none
- Escalation: none → verify FAIL thì `.agent/error-analyzer.md`; **sau 3 attempt fail → `architecture_review_needed`, dừng**.
- ⚠️ Nếu `nginx -t` FAIL: **KHÔNG reload**, xoá symlink mới (`rm /etc/nginx/sites-enabled/ntasolution.vn`) để trả về trạng thái cũ, ghi evidence, báo user.

## Feature Verification (feature/update only)
- Acceptance criteria: 10/10 (13/10/2026) — xem mục Evidence
- Verify commands + result: curl matrix (máy dev) PASS toàn bộ + cert SAN/expiry check + nginx -t trên VPS PASS mỗi bước;
  app code không đổi (không rebuild) — `npm.cmd run typecheck/lint/build` đã PASS ở task-01, task-02 không đụng code
- Reviewer verdict: **PASS (STRICT, round 1)** — 0 CRITICAL/MAJOR, 10 MINOR (F1–F10 đã fix/ghi nhận lúc close-out)
  (`.context/review-reports/feature-add-domain-ntasolution-phase-1-task-02-round-1-review.md`)
- Spec Validator verdict (phase close): **PASS** — `.context/review-reports/feature-add-domain-ntasolution-phase-1-spec-validation.md`
  (gap test-scope v27 bị CR-004 ghi đè → publish lại v31 kèm giữ scope CR-004)

## Doc / Decision Impact
- Doc impact result: `docs/runbook/deploy-vps.md` §3b — thêm bước (3) sed sau certbot (thực tế certbot tách block 80
  managed với `$host` → cần sửa www về thẳng apex) — reconcile ở close-out
- Decision log: none

## Commit / Tracking
- Commit: pending — close-out commit **explicit file list** (task file + runbook + progress + journal), KHÔNG gộp file CR-004/app code
- Commit source of truth: changed files, timestamp, SHA, rollback point
- Task source of truth: acceptance/evidence/residual risk/doc impact (mục Evidence ở trên)
- Progress source of truth: `.context/progress.json`
- Rollback (nếu cần sau này): `rm /etc/nginx/sites-enabled/ntasolution.vn && nginx -t && systemctl reload nginx`
  (domain phụ tắt, domain chính không đổi); cert để lại vô hại hoặc `certbot delete --cert-name ntasolution.vn`

## DoD (Definition of Done)
- [x] Vhost + cert đã apply và verify ngoài PASS (đủ acceptance)
- [x] Evidence (nginx -t, certbot, redirect matrix, canonical) lưu trong task file
- [x] Regression `ntavietnam.tech` PASS + site khác trên VPS không ảnh hưởng (dhp-cms = DNS trỏ IP khác, pre-existing)
- [x] Reviewer độc lập PASS (STRICT, round 1)
- [x] `.context/progress.json` updated + Doc Impact reconciled (runbook §3b thêm bước sed + rollback cert)
- [ ] Commit close-out (explicit file list) sau PASS — thực hiện ngay sau bước này

## Files to Create/Modify
- `docs/runbook/deploy-vps.md` (chỉ khi thực tế lệch)
- task file này (evidence) + `.context/progress.json`
- Trên VPS (không thuộc repo): `/etc/nginx/sites-available/ntasolution.vn` (+ symlink) + cert `/etc/letsencrypt/live/ntasolution.vn/`

## Notes
- **Không** commit bản vhost đã bị certbot sửa ngược về repo.
- Rủi ro chính: `reload` nginx fail/hỏng cấu hình → ảnh hưởng **mọi** site trên VPS shared ⇒ `nginx -t` là gate cứng.
- Rủi ro SEO: nếu vô tình đổi `NEXT_PUBLIC_SITE_URL` hoặc để domain phụ tự canonical → duplicate content. Change này
  **không** đổi env/build và **không** thêm vhost redirect sang domain chính ⇒ canonical giữ `ntavietnam.tech`.
- Rủi ro cert: `certbot --nginx` chạy cho `www` cần `www` phân giải được (CNAME → apex) — pre-check bằng `dig`.
- Rollback: xoá symlink `sites-enabled/ntasolution.vn` + `systemctl reload nginx` (domain phụ tắt, domain chính không đổi);
  cert vô hại nếu để lại (`certbot delete --cert-name ntasolution.vn` khi muốn dọn).
