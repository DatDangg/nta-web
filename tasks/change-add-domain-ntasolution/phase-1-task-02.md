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
- [ ] `https://ntasolution.vn/` = 200 + `https://ntasolution.vn/en` = 200 (nội dung site, không phải trang nginx mặc định)
- [ ] `http://ntasolution.vn/` → 301 `https://ntasolution.vn/`; `http://www.ntasolution.vn/` → 301 `https://ntasolution.vn/`
- [ ] `https://www.ntasolution.vn/` → 301 `https://ntasolution.vn/` (apex)
- [ ] Cert Let's Encrypt hợp lệ cho **apex + www** (`curl -sI https://ntasolution.vn` không lỗi;
      `openssl s_client -servername www.ntasolution.vn` trả cert phủ cả 2 name — hết `SEC_E_WRONG_PRINCIPAL`)
- [ ] `curl -fsS https://ntasolution.vn/api/health` → `{"status":"ok"...}`
- [ ] HTML từ domain phụ có `rel="canonical"` = `https://ntavietnam.tech/...` và **KHÔNG** redirect sang domain chính
- [ ] `https://ntavietnam.tech/` vẫn 200 + HTTPS + cert còn hạn (hành vi không đổi)
- [ ] `grep -c "ntavietnam.tech" ` trên HTML domain phụ chỉ xuất hiện ở canonical/SEO (không có redirect)
- [ ] App/container khác trên VPS không bị ảnh hưởng (`nginx -t` OK, `systemctl status nginx` active, 3 site khác vẫn 200 nếu verify được)
- [ ] `docs/runbook/deploy-vps.md` khớp thực tế đã apply (hoặc ghi rõ không lệch)

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
- Acceptance criteria: pending (điền sau apply)
- Verify commands + result: pending
- Reviewer verdict: pending
- Spec Validator verdict (phase close): pending — pre-plan inline PASS

## Doc / Decision Impact
- Doc impact result: pending — dự kiến `docs/runbook/deploy-vps.md` chỉ cập nhật nếu lệch thực tế
- Decision log: none

## Commit / Tracking
- Commit: pending — **explicit file list**, KHÔNG gộp file CR-004 / app code
- (Nếu VPS apply không kèm thay đổi repo nào ngoài evidence → ghi evidence vào task file + journal, commit cùng close-out)

## DoD (Definition of Done)
- [ ] Vhost + cert đã apply và verify ngoài PASS (đủ 9 acceptance)
- [ ] Evidence (nginx -t, certbot, redirect matrix, canonical) lưu trong task file
- [ ] Regression `ntavietnam.tech` PASS + site khác trên VPS không ảnh hưởng
- [ ] Reviewer độc lập PASS (STRICT)
- [ ] `.context/progress.json` updated + Doc Impact reconciled
- [ ] Commit close-out (explicit file list) sau PASS

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
