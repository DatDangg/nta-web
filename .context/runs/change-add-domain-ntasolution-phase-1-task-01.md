# Run Journal — change/add-domain-ntasolution · phase-1-task-01

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**
> Đọc file này **ĐẦU TIÊN** khi mở session mới (xem `AGENTS.md` § Session Handoff).

```yaml
workItem: change/add-domain-ntasolution     # cửa vào /change add-domain-ntasolution
phaseTask: phase-1-task-01
step: done                                  # ready|change_request|checkpoint|builder|reviewer|vps_apply|closeout|done
agent: change-request
status: done
attempt: 0                                  # CHỈ tăng khi FAIL thật; KHÔNG tăng khi interrupted
interrupted: false
updatedAt: 2026-10-13T00:00:00+07:00
commitTask01: ec09807                       # task-01 repo-side đã commit (15 file, explicit list)
commitCloseout: (xem git log — commit close-out cùng message CR-005)
blockReason: null                            # ĐÃ BỎ BLOCK — key trong C:\Users\datda\Downloads\ssh_server.zip hoạt động (user chọn cách thêm key; sau đó user cung cấp zip key cũ = key đã có trên VPS)
filesTouched:                               # change này là infra/nginx + docs — không đụng app code
  - .context/project-config.md              # domain_secondary
  - SPECIFICATIONS.md                       # 3.4.0 → 3.5.0 (R-27 mở rộng)
  - docs/runbook/deploy-vps.md              # Domain phụ + §3b + troubleshooting
  - spec/CHANGELOG.md
  - spec/test-scope/current.json            # 3.5.0 / scope v26 → v27 (CR-004 publish lại phải đọc lúc đó)
  - .context/progress.json                  # thêm entry add-domain-ntasolution; GIỮ entry CR-004
  - spec/changes/BACKLOG.md                 # CR-005 → in_progress (hunk CR-004 còn nguyên)
  - spec/changes/2026-10-13-add-domain-ntasolution.md   # status: in_progress + Plan
filesNew:
  - deploy/nginx/ntasolution.vn.conf        # vhost 2 block (www 301 apex; apex proxy 3005) — đã verify UTF-8 sạch
  - spec/updates/2026-10-13-add-domain-ntasolution.md
  - tasks/change-add-domain-ntasolution/phase-1-task-01.md   # repo-side (pending)
  - tasks/change-add-domain-ntasolution/phase-1-task-02.md   # apply VPS (blocked by SSH)
  - .context/review-reports/feature-add-domain-ntasolution-spec-validation.md   # spec-validator PASS (inline)
  - .context/runs/change-add-domain-ntasolution-phase-1-task-01.md
evidence:
  reportPath: .context/review-reports/feature-add-domain-ntasolution-phase-1-task-02-round-1-review.md
  round: 1
  verdict: PASS                             # task-01 NORMAL r1 PASS · task-02 STRICT r1 PASS · spec phase-close PASS
next: "DONE — CR-005 đã close-out: change file status done + archive, BACKLOG done, test-scope v31, commit close-out (explicit list). Việc còn lại: không (CR-007/CR-001 chờ user)."
loopSignal: none
approvals:
  - {gate: phase_plan, at: 2026-10-13, ok: true}   # user: "Duyệt plan + cho phép SSH"
  - {gate: ssh, at: 2026-10-13, ok: true}          # user duyệt SSH VPS 187.52.119.50
batchQueue: []                              # chỉ xử lý CR-005 (add-domain-ntasolution) trong lượt này
```

## Notes / WIP reasoning

- **Phạm vi CR-005:** thêm domain phụ `ntasolution.vn` (+www) truy cập cùng site, GIỮ `ntavietnam.tech` là canonical.
  Infra-only: nginx vhost mới + certbot + doc update — KHÔNG sửa `.github/workflows/deploy.yml`,
  `src/lib/seo.ts`, `public/llms.txt`, sitemap, robots, KHÔNG đổi `NEXT_PUBLIC_SITE_URL`.
- **Concurrency:** repo đang dirty bởi CR-004 (`shared-detail-showcase-template`, in_progress — layer 2b task-04):
  `src/content/solutions/**`, `src/app/[locale]/solutions/**`, `ShowcaseDetails.tsx`, `src/content/types.ts`,
  `spec/changes/2026-10-13-shared-detail-showcase-template.md`, `spec/changes/BACKLOG.md`,
  `.context/progress.json`, `spec/test-scope/current.json`.
  → Commit của CR-005 phải **explicit file list** (docs/runbook + .context/project-config + change doc + BACKLOG + progress),
  KHÔNG được gộp file của CR-004.
- **Human checkpoint:** change file ghi rõ "chờ user duyệt SSH trước khi chạy" → sau khi có phase plan phải DỪNG xin duyệt.
- DNS đã trỏ sẵn (apex + www → 187.52.119.50); hiện rơi default server block, chưa có cert.

## History

- 2026-10-13 journal created — write-ahead trước khi gọi subagent `change-request` (cancel sẽ redo bước này).
- 2026-10-13 change-request trả về (báo cáo đầy đủ dù chạm max steps): classification ADDITIVE, spec bump MINOR 3.4.0→3.5.0 / scope v26→v27, 2 task + vhost + docs đã tạo (chưa commit), spec-validation PASS inline. Subagent KHÔNG chạy verify lint/typecheck/build — task-01 chưa thực thi. Primary verify trên đĩa: git status khớp report, vhost UTF-8 sạch, 2 task file tồn tại.
- 2026-10-13 ⏸ HUMAN CHECKPOINT pass — user chọn "Duyệt plan + cho phép SSH" (approvals: phase_plan ok). Primary chạy verify task-01: `npm.cmd run typecheck` PASS · `npm.cmd run lint` 0 errors (1 warning pre-existing mdx `<img>`) · `npm.cmd run build` PASS 57/57 — build đầu fail `Cannot find module vendor-chunks` do dev server (PID 18852/10864) chiếm `.next` (HEAD cũng fail) → build cách ly distDir `.next-verify` PASS rồi revert `next.config.ts` (git diff = 0) + xoá `.next-verify`. Static: grep vhost ref ntavietnam.tech (non-comment) = 0 · runbook §3b + project-config domain_secondary + SPEC 3.5.0 + scope v27 = có. · concurrency: session khác commit 344bf48 (CR-004 T04) giữa chừng + để dirty products/**/tsconfig.json — commit CR-005 phải explicit list, kiểm từng file chung (progress.json/BACKLOG.md/CHANGELOG.md/test-scope) trước khi stage. ▶ START reviewer round 1.
- 2026-10-13 ✅ DONE reviewer round 1 = PASS NORMAL (0 CRITICAL/MAJOR, 6 MINOR; report `feature-add-domain-ntasolution-phase-1-task-01-round-1-review.md`; reviewer shell bị deny → kiểm chứng tĩnh). Primary fix close-out: F1 certbot `--redirect` (runbook §3b + §7 + vhost comment + 2 task file), F2 CHANGELOG đổi thứ tự 3.3.0/3.4.0. Điền task-01 (acceptance 8/8, verify, DoD) + progress.json (task-01 done) → commit **ec09807** (15 file explicit list; BACKLOG kèm hunk CR-004-in_progress của session khác — ghi trong commit body; không lẫn src/**/tsconfig/CR-004 change file). ▶ START task-02 apply VPS (user đã duyệt SSH).
- 2026-10-13 ⛔ task-02 SSH pre-check = BLOCKED: `ssh -o BatchMode=yes root@187.52.119.50` → `Permission denied (publickey,password)`. Chẩn đoán (không retry): key `~/.ssh/id_ed25519` có (cipher `none`, không passphrase), known_hosts có IP (đã từng kết nối), pubkey `AAAAC3NzaC1lZDI1NTE5AAAAINrdBPkK...` → server không chấp nhận key này; password auth server mở nhưng shell tool không nhập pass được (0 plink/sshpass). DỪNG chờ user chọn cách kết nối (task-02 rule: môi trường thiếu quyền SSH → BLOCKED, không tự bỏ qua).
- 2026-10-13 ✅ Unblock: user đưa `C:\Users\datda\Downloads\ssh_server.zip` (keypair `id_ed25519_github_trungpqfwork_tech` cipher none + known_hosts chứa host key VPS) → test `ssh -i` = **CONNECT_OK** (srv1497672). Key dùng trực tiếp bằng `-i`, không ghi đè key máy.
- 2026-10-13 ▶ task-02 apply: **pre-check** DNS apex/www → 187.52.119.50 ✓; sites-enabled chưa có vhost ntasolution.vn ✓; `nginx -t` baseline OK (2 warn tmfoods pre-existing); certbot account acme-v02 có sẵn; container nta-web healthy; md5 vhost ntavietnam.tech = `8557842926f082a76a80431f121324f4` (baseline). **scp** vhost → sites-available + symlink → `nginx -t` OK. **certbot --nginx -n --redirect -d apex -d www** = SUCCESS (cert expires 2027-01-11, SAN cả 2 name, deploy vào vhost). `nginx -t && reload` OK, nginx active, md5 ntavietnam.tech không đổi. **Finding**: certbot restructure — gỡ `listen 80` khỏi 2 block gốc, tạo 2 block 80 managed với `return301 https://$host$request_uri` → `http://www` thành 301 `https://www` (2 hop, lệch acceptance) → **sed sửa www block 80** về `return 301 https://ntasolution.vn$request_uri` + `nginx -t` + reload OK. **Verify matrix** (máy dev): http apex/www → 301 `https://ntasolution.vn/` ✓ · https www → 301 apex ✓ · https apex `/` + `/en` → 200 ✓ · health `{"status":"ok"}` ✓ · canonical apex+www = `https://ntavietnam.tech` (18 ref ntavietnam trong HTML đều là SEO tag, 0 meta-refresh) ✓ · ntavietnam.tech 200 + http→https + cert expires 07/01/2027 không đổi ✓ · cert SAN = ntasolution.vn + www ✓ · tmfoods.genieplatform.cloud 200 ✓ · dhp-cms.genieplatform.cloud = 000 **do DNS trỏ 187.124.226.230 (IP khác, pre-existing, không phải regression)** · container nta-web healthy, nginx active ✓. ▶ START reviewer STRICT round 1 task-02.
- 2026-10-13 ✅ DONE reviewer task-02 round 1 = **PASS STRICT** (0 CRITICAL/MAJOR, 10 MINOR; report `feature-add-domain-ntasolution-phase-1-task-02-round-1-review.md`; reviewer shell bị deny → kiểm chứng tĩnh, xác nhận dhp-cms off-box). Fix close-out F1–F10. Sed thực tế đã chạy trên VPS (evidence cho F5):
  `sed -i '/if ($host = www.ntasolution.vn)/,/^[[:space:]]*}/ s#return 301 https://$host$request_uri;#return 301 https://ntasolution.vn$request_uri;#' /etc/nginx/sites-available/ntasolution.vn` rồi `nginx -t && systemctl reload nginx` → RELOAD_OK.
- 2026-10-13 ▶ START close-out task-02: fix findings → spec-validator phase close → progress (task-02 done, TRƯỚC commit) → change file status done + BACKLOG → commit explicit file list → archive.
- 2026-10-13 ✅ spec-validator phase close = **PASS** (`.context/review-reports/feature-add-domain-ntasolution-phase-1-spec-validation.md`; 0 conflict HIGH; G1 MEDIUM: test-scope v27 bị CR-004 close-out ghi đè → publish **v31** kèm giữ scope CR-004). Reconcile đĩa giữa chừng: HEAD có thêm `910cead`/`070d53c`/`d0dfed7` (CR-004 T05/T06 + CR-006 của session khác); SPECIFICATIONS.md = **3.5.1** (CR-004 bump sau 3.5.0 của mình — KHÔNG hạ về); entry CR-005 trong progress + BACKLOG còn nguyên do commit ec09807. Fix close-out F1–F10: tick acceptance change file, sửa ngày cert, thêm evidence ismartschool/crm-dhp, runbook `--redirect` (§3) + `sed -i.bak` + rollback `certbot delete`, comment vhost trỏ §3b, ghi sed command vào journal, file-list ec09807 vào task-01, progress (task-02 done + phaseClose + scope 31 + codeCommits), BACKLOG CR-005 → done, change file → status done + `git mv` archive. JSON progress/test-scope valid. → commit close-out explicit list (loại `tsconfig.json` của session khác).
