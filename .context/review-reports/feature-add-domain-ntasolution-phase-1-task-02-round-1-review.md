# Review — feature `add-domain-ntasolution` · phase-1-task-02 · round 1

Agent: reviewer

- **Task:** `tasks/change-add-domain-ntasolution/phase-1-task-02.md` (CR-005, ADDITIVE — apply VPS: nginx vhost + certbot `ntasolution.vn` + verify ngoài + reconcile runbook §3b)
- **Change:** `spec/changes/2026-10-13-add-domain-ntasolution.md` · task-01 (đã PASS): `tasks/change-add-domain-ntasolution/phase-1-task-01.md`
- **Journal:** `.context/runs/change-add-domain-ntasolution-phase-1-task-01.md` (toàn timeline: pre-check → blocked SSH → unblock → apply → finding/sed → verify matrix)
- **Ngày:** 2026-10-13 · **Report:** `.context/review-reports/feature-add-domain-ntasolution-phase-1-task-02-round-1-review.md`
- **Review level:** `STRICT`

## Reason (vì sao STRICT)

- Đụng **nginx + TLS trên VPS shared** (`187.52.119.50`: tmfoods, ismartschool, crm-dhp): sai cấu hình ⇒ `nginx -t`/`reload` có thể ảnh hưởng **mọi** site trên box, và `certbot --nginx` sửa file vhost + tạo cert lineage mới.
- Thay đổi **behavior phục vụ HTTP/HTTPS đa hostname** (redirect matrix, canonical/SEO entry-point thứ hai) ⇒ đúng nhóm risk đỏ “hạ tầng/redirect/security TLS”.
- Không thể FAST/NORMAL vì outcome chỉ tồn tại **ngoài repo** (state trên VPS), cần đối chiếu bằng chứng ngoài + regression site khác.

## Blast radius

| Phạm vi | Chi tiết |
|---|---|
| VPS (ngoài repo) | `/etc/nginx/sites-available/ntasolution.vn` + symlink `sites-enabled` (block 80 mới + 2 block 80 managed do certbot tạo) · cert lineage `/etc/letsencrypt/live/ntasolution.vn/` |
| nginx toàn box | `nginx -t` + `systemctl reload nginx` ⇒ ảnh hưởng TM **mọi** site: `ntavietnam.tech`, tmfoods, ismartschool, crm-dhp |
| Repo (task-02) | `docs/runbook/deploy-vps.md` §3b (thêm bước (3) sed) · task file này · `.context/progress.json` · review report |
| SEO/canonical | **KHÔNG** — `src/lib/seo.ts` (`BASE_URL` = `https://ntavietnam.tech`), `public/llms.txt`, robots/sitemap, `.github/workflows/deploy.yml` (`NEXT_PUBLIC_SITE_URL`), vhost `ntavietnam.tech.conf` không đổi |
| Cross-change | Repo còn dirty/commit bởi session khác (CR-004/CR-006) ⇒ commit close-out task-02 phải **explicit file list** |
| UI / DB | Không đụng UI, `db_tool: none` |

## Verify commands + result

> Shell bị **`permission denied`** trong session reviewer → **không chạy được `git`/`curl`/`npm`**. Theo Tool Loop Guard: **không retry**, chuyển sang kiểm chứng tĩnh (Grep/Read, kể cả đọc trực tiếp `.git/logs/HEAD`, `.git/COMMIT_EDITMSG`). Không SSH (theo yêu cầu primary).

| # | Command / check | Result | Bằng chứng |
|---|---|---|---|
| 1 | `git log --oneline` / `git show ec09807 --stat` | **Blocked** (shell deny) → bù bằng đọc `.git/logs/HEAD` | `.git/logs/HEAD:74` = `344bf48 → ec09807cffe46963054583e32457435832cfcd1a · commit: feat(feature-add-domain-ntasolution): phase-1-task-01 repo-side vhost domain phụ + runbook + spec 3.5.0 (CR-005)` ⇒ **commit ec09807 tồn tại**, message đúng scope infra/docs. **File list không kiểm được** (object nén; shell deny) → xem F10 |
| 2 | `curl -sI` matrix (apex/www http+https, `/en`, `/api/health`, canonical, `ntavietnam.tech`) | **Blocked** (shell deny) — không re-verify độc lập; dùng evidence của primary (chi tiết, có status + Location + md5) | `tasks/change-add-domain-ntasolution/phase-1-task-02.md:65-80` + journal `:65` |
| 3 | `npm run typecheck` / `lint` / `build` | **skip, no code diff** (0 dòng code app trong task-02; primary đã PASS ở task-01) | task-02 `:91-92`, `:107`; journal `:61` |
| 4 | `nginx -t` (dev) | `N/A` — máy dev không có nginx; **bắt buộc trên VPS**; evidence: `nginx -t` OK ở **4 mốc** (baseline → sau vhost → sau certbot → sau sed) | task-02 `:68`; journal `:65` |
| 5 | Static — repo vhost **không** chứa `listen 443` / `ssl_certificate` | **PASS** | `deploy/nginx/ntasolution.vn.conf:22-23,38-39` chỉ `listen 80`; `443` chỉ xuất hiện trong **comment** (`:7,:16`); không có directive `ssl_certificate` (Read toàn file 57 dòng) ⇒ **không copy ngược bản VPS (post-certbot) về repo** ✅ |
| 6 | Static — acceptance #7: không sửa `seo.ts`/`llms.txt`/robots/sitemap/`deploy.yml` | **PASS (nội dung)** | `grep "ntasolution"` trên `*.ts,tsx,js,mjs,json,yml,yaml,txt,xml` → **0 match** trong `src/**`, `public/**`, `.github/**` (chỉ match `add-domain-ntasolution` = slug trong `.context/progress.json`). `src/lib/seo.ts:4` = `?? 'https://ntavietnam.tech'`; `deploy.yml:18` = `NEXT_PUBLIC_SITE_URL: https://ntavietnam.tech`; `public/llms.txt:6-14` toàn `ntavietnam.tech`. Per-commit chứng minh được thì Blocked (F10) |
| 7 | Static — vhost `ntavietnam.tech.conf` không đổi cấu trúc | **PASS** | Read 55 dòng: 1 block 80 proxy + block 443 comment; không có dấu hiệu sửa cho domain phụ |
| 8 | Static — `.context/project-config.md` có `domain_secondary`, `domain`/`internal_port` nguyên | **PASS** | `:69` `domain: ntavietnam.tech` · `:70` `domain_secondary: ntasolution.vn` · `:71` `internal_port: 3005` |
| 9 | Static — runbook §3b khớp thao tác thật (có bước sed) | **PASS** | `docs/runbook/deploy-vps.md:60-70`: `cp` `:62` → `ln -sf` `:63` → `nginx -t` `:64` → `certbot --nginx --redirect -d apex -d www` `:65` → **bước (3) sed** `:66-68` → `nginx -t && reload` `:69`; curl matrix `:75-82`; ghi chú không copy ngược `:87-88` |

## Acceptance change file (8 dòng) ↔ evidence

| # | Acceptance (`spec/changes/2026-10-13-add-domain-ntasolution.md:28-35`) | Kết quả | Bằng chứng |
|---|---|---|---|
| 1 | vhost mới cho `ntasolution.vn` proxy tới app (cùng nội dung) | **OK** | vhost apply + `https apex /` 200 (task-02 `:74`) + canonical grep là HTML app (không phải nginx default) `:76` |
| 2 | `www` → 301 apex | **OK** | `https://www` 301 apex `:73`; `http://www` 301 apex `:72` (sau sed) |
| 3 | HTTPS apex+www (certbot); `http://` → 301 `https://` | **OK** | certbot SUCCESS + cert 2027-01-11 SAN 2 name `:69,:78`; `http://apex` 301 `:71` |
| 4 | `https://ntasolution.vn/` + `/en` = 200 | **OK** | `:74` |
| 5 | canonical vẫn `https://ntavietnam.tech`, **không** đổi `NEXT_PUBLIC_SITE_URL` | **OK** | canonical apex+www = `ntavietnam.tech`, 0 meta-refresh `:76`; 18 ref đều SEO tag (task-02 `:60`); repo `seo.ts`/deploy.yml/llms.txt không đổi (Verify #6) |
| 6 | `ntavietnam.tech` không đổi hành vi | **OK** | 200 + http→301 `:77`; cert `2027-01-07` `:78`; **md5 vhost `8557842926f082a76a80431f121324f4` không đổi** (baseline = sau apply) `:70` |
| 7 | KHÔNG sửa `deploy.yml`/`seo.ts`/`llms.txt`/sitemap/robots | **OK (nội dung)** | Verify #6; per-commit = Blocked (F10) |
| 8 | Cập nhật `docs/runbook/deploy-vps.md` + `.context/project-config.md` (domain phụ) | **OK** | runbook §3b `:55-91` (+bảng hạ tầng `:15`, §7 `:126-128`); project-config `:70` |

**Check #7 (dhp-cms):** kết luận của task là **đúng logic** — `dhp-cms.genieplatform.cloud` phân giải **187.124.226.230 ≠ 187.52.119.50** ⇒ request **không bao giờ tới** nginx của VPS này ⇒ `000` **không thể** là regression của một vhost được thêm trên `187.52.119.50`. Xác nhận lý luận hợp lệ. (Xem F4: `crm-dhp` — site **trên** box theo runbook `:4` — không có evidence riêng.)

## Findings

### [CRITICAL] — không có

### [MAJOR] — không có

### [MINOR] F1 — Change file: acceptance vẫn `- [ ]` (chưa tick) dù 8/8 đã đạt
- **File:** `spec/changes/2026-10-13-add-domain-ntasolution.md:28-35` (status `in_progress` ở `:4`).
- **Vấn đề:** evidence + task-02 acceptance đã đủ chứng minh 8 dòng acceptance; change doc vẫn để nguyên `- [ ]` ⇒ nếu phase close quên tick/archive thì tracking lệch.
- **Fix:** tick 8 acceptance + đổi `status` (hoặc archive `spec/changes/archive/`) ở close-out phase.

### [MINOR] F2 — Task-02 acceptance `:56` tự mâu thuẫn ngày hết hạn cert
- **File:** `tasks/change-add-domain-ntasolution/phase-1-task-02.md:56` — “hết hạn **07/01/2027** (NotAfter **2027-01-11**)”.
- **Vấn đề:** `07/01/2027` là mốc của **ntavietnam.tech** (issue 09/10/2026 + 90d; evidence `:78`), cert `ntasolution.vn` = **2027-01-11** (issue 13/10/2026; `:69`, `:78`). Một dòng nêu 2 ngày khác nhau ⇒ evidence đọc sai nếu người sau chỉ xem dòng acceptance.
- **Fix:** sửa thành “hết hạn **11/01/2027** (`NotAfter 2027-01-11`)” và ghi rõ “(khác cert `ntavietnam.tech` = 07/01/2027)”.

### [MINOR] F3 — Acceptance `:62` khẳng định “ismartschool containers chạy bình thường” nhưng **không có evidence**
- **File:** `tasks/change-add-domain-ntasolution/phase-1-task-02.md:62` (claim) vs `:65-80` (Evidence block: DNS, nginx -t ×4, certbot, matrix, canonical, md5, tmfoods, dhp-cms, container `nta-web`) — **không có dòng nào về ismartschool**.
- **Vấn đề:** dòng acceptance được tick `[x]` nhưng không có artifact chứng minh; reviewer không SSH nên không kiểm chéo được ⇒ evidence gap (đúng theo check #5 “site khác”).
- **Fix:** thêm 1 dòng evidence (`docker ps --format` các container `ismartschool*` = Up/healthy) hoặc hạ claim xuống “không có dấu hiệu ảnh hưởng — suy ra từ `nginx -t` OK + nginx active + 2 site khác 200”.

### [MINOR] F4 — Site **trên box** `crm-dhp` không được evidence; hostname đã kiểm (`dhp-cms`) lại **off-box**
- **File:** `docs/runbook/deploy-vps.md:4` (VPS shared chạy ismartschool, **crm-dhp**, tmfoods) vs `phase-1-task-02.md:62,79` (chỉ kiểm `dhp-cms.genieplatform.cloud` = DNS `187.124.226.230`).
- **Vấn đề:** kết luận “`dhp-cms` không phải regression” **đúng** (off-box), nhưng nó **không** phục vụ làm evidence cho site `crm-dhp` thực sự nằm trên `187.52.119.50`. Hiện chỉ có tmfoods (200) + `nginx -t` OK + nginx active làm chứng cứ gián tiếp.
- **Fix:** thêm 1 dòng evidence cho `crm-dhp` (hostname thật/`docker ps`) hoặc ghi rõ trong Evidence: “site thứ 3 trên box chỉ suy luận gián tiếp qua `nginx -t` OK + reload OK + nginx active”.

### [MINOR] F5 — Evidence thiếu **raw output**; câu lệnh `sed` thực tế không nằm trong journal
- **File:** `tasks/change-add-domain-ntasolution/phase-1-task-02.md:65-80` (summary, không có raw block `nginx -t`/certbot/curl -I); `.context/runs/…-task-01.md:65` mô tả sed bằng lời (“**sed sửa www block 80** về `return 301 https://ntasolution.vn$request_uri`”) nhưng **không** ghi câu lệnh + output.
- **Vấn đề:** với STRICT, finding + fix (đổi behavior `http://www`) là thay đổi cấu hình lớn nhất của task này nhưng nguồn duy nhất chứng minh chuỗi thao tác là **runbook** (được viết/ghi lại cùng lúc) ⇒ không thể phản nghiệm độc lập (reviewer không shell/SSH).
- **Fix:** paste raw (dạng fenced block) `sed` đã dùng + `nginx -t`/`curl -sI | head -1` sau fix vào mục Evidence.

### [MINOR] F6 — Runbook §3 (`ntavietnam.tech`) vẫn thiếu `--redirect` — F1 của task-01 chỉ fix §3b/§7
- **File:** `docs/runbook/deploy-vps.md:45` (`certbot --nginx -d ntavietnam.tech`) và comment cùng nội dung ở `deploy/nginx/ntavietnam.tech.conf:6`.
- **Vấn đề:** review task-01 (F1) đề xuất “thêm `--redirect` vào §3b **và §3**”; close-out chỉ fix §3b/§7/vhost comment/task file ⇒ nếu re-provision VPS mới theo §3 **non-interactive**, `http://ntavietnam.tech` sẽ không tự 301 (app chỉ đạt `https` khi chọn “Redirect” ở prompt). Hiện trạng prod không sai (đang live + 301 theo project-config `:69`), nhưng runbook còn lỗ hổng tái lập.
- **Fix:** `certbot --nginx --redirect -d ntavietnam.tech` ở `:45` (+ `ntavietnam.tech.conf:6`) — docs-only, fix ở close-out.

### [MINOR] F7 — Runbook bước (3) `sed -i` không có backup trên file nginx của **VPS shared**
- **File:** `docs/runbook/deploy-vps.md:68`.
- **Đánh giá kỹ thuật:** regex **đúng và an toàn cho format certbot** — range `/if ($host = www.ntasolution.vn)/,/^[[:space:]]*}/` bao đúng khối `if` + `} # managed by Certbot`; `$` giữa pattern là literal (BRE); `#` làm delimiter nên `https://` không xung đột; chạy lần 2 **idempotent** (pattern `return 301 https://$host$request_uri;` không còn ⇒ no-op). Không có nguy cơ “phá file” mà chỉ có nguy cơ **no-op im lặng** nếu certbot đổi format.
- **Vấn đề còn lại:** `sed -i` **không backup** → nếu no-op, `nginx -t` vẫn OK và **không ai biết** (chỉ curl `:76` mới lộ 2-hop); đồng thời không có đường lùi nhanh trên box shared.
- **Fix:** thêm `cp <file> <file>.bak-$(date +%F)` trước `sed` (hoặc `sed -i.bak`) + 1 dòng “nếu `sed` không khớp gì thì mở file kiểm format certbot, ĐỪNG bỏ qua curl matrix”.

### [MINOR] F8 — Comment vhost repo mô tả certbot chưa khớp thực tế (thiếu cảnh báo cần sed)
- **File:** `deploy/nginx/ntasolution.vn.conf:15-18` (“`certbot --nginx` … tự thêm `listen 443 ssl` + `ssl_certificate` vào từng block”; “http://www → 301 https apex”).
- **Vấn đề:** thực tế certbot **bỏ `listen 80`** khỏi 2 block gốc và **tạo 2 block 80 managed** với `return 301 https://$host$request_uri` ⇒ `http://www` thành **2 hop** cho tới khi chạy sed (đúng như runbook §3b bước (3), nhưng comment vhost không trỏ tới bước này). Người đọc chỉ vhost sẽ hiểu sai hành vi sau certbot.
- **Fix:** thêm 1 dòng comment trỏ `docs/runbook/deploy-vps.md §3b bước (3)`. File này **ngoài scope sửa của task-02** (task-02 chỉ reconcile runbook) ⇒ đề xuất gộp vào close-out hoặc task riêng, **không tính FAIL**.

### [MINOR] F9 — Rollback để lại cert lineage ⇒ `certbot renew` sẽ fail (log/alert nhiễu)
- **File:** `tasks/change-add-domain-ntasolution/phase-1-task-02.md:122-123,144-145`.
- **Vấn đề:** `rm sites-enabled/ntasolution.vn && reload` là **đủ** để tắt domain phụ (domain chính không đổi) — OK. Nhưng lineage `ntasolution.vn` còn trong `/etc/letsencrypt/renewal/` sẽ khiến `certbot renew` (cron) **fail cho lineage đó** (nginx authenticator không tìm thấy server block) → email/log lỗi định kỳ.
- **Fix:** ghi rõ trong runbook/mục rollback: nếu không có ý định bật lại → chạy luôn `certbot delete --cert-name ntasolution.vn` (hiện đang là tuỳ chọn “khi muốn dọn”).

### [MINOR] F10 — Traceability commit: không có artifact liệt kê file của `ec09807`; `progress.json` không ghi SHA
- **File:** `.context/runs/change-add-domain-ntasolution-phase-1-task-01.md:15,62` (“15 file, explicit list”) vs review task-01 F4 (liệt kê **14** path) vs `.context/progress.json:802` (`"codeCommits": []`).
- **Vấn đề:** (a) số 15 vs 14 chênh 1 (nhiều khả năng là `phase-1-task-02.md` — nhưng **không kiểm chứng được**: shell deny + không có artifact nào ghi file list); (b) `progress.json` không ghi commit SHA task-01. Không có bằng chứng **sai**, nhưng check #6 (commit hygiene) của primary là **unverifiable** bằng chứng cứ hiện có.
- **Fix:** khi close-out, ghi 1 dòng vào journal/task: “`ec09807` = <N> file: <list>” (hoặc dán `git show --name-only`) và điền `codeCommits`/commit SHA nếu schema cho phép.

## Điều kiện kèm theo cho close-out task-02 (không cần vòng review mới nếu chỉ sửa docs/evidence)

1. **Commit explicit file list** — chỉ stage: `docs/runbook/deploy-vps.md`, `tasks/change-add-domain-ntasolution/phase-1-task-02.md`,
   `.context/progress.json`, `.context/runs/change-add-domain-ntasolution-phase-1-task-01.md`,
   `.context/review-reports/feature-add-domain-ntasolution-phase-1-task-02-round-1-review.md`
   (+ file sửa theo F1/F6/F7/F8 nếu chọn fix cùng lúc: `spec/changes/2026-10-13-add-domain-ntasolution.md`, `deploy/nginx/ntasolution.vn.conf`).
   **CẤM** `git add .`: repo còn thay đổi của session khác (`src/**`, `tsconfig.json`, `spec/changes/2026-10-13-shared-detail-showcase-template.md`, change CR-006).
   Bắt buộc `git diff --cached --name-only` và tự kiểm không có `src/**`.
2. `progress.json`: `phase-1-task-02` → `done` + ghi review verdict/round (TRƯỚC commit); **giữ nguyên** entry CR-004 (`scopeVersion: 26`) và các entry khác.
3. Tick progress file task-02 (DoD `:129-131`) + xử lý F2/F3/F4/F5 (evidence + ngày cert) — docs/evidence-only.
4. **KHÔNG** copy bản vhost trên VPS (post-certbot) về repo (đã đúng: Verify #5 PASS) — giữ nguyên như vậy.

## Skill gates

| Gate | Kết quả | Bằng chứng / lý do |
|---|---|---|
| `aislop` (`aislop scan --changes --json`) | `skip` | Diff task-02 = 0 dòng code app (nginx config trên VPS + markdown/task/progress). Shell bị **permission deny** ⇒ không chạy được tool |
| `anti-slop` (`npx oxlint`) | `N/A` | Diff không đụng file TS/JS (`*.md`, `*.json`, `.conf`, task files) |
| `open-code-review` (`ocr`) | `skip` | Không có code diff để review + shell deny (không xác nhận được `ocr` đã cài) |
| `ai-readable-codebase` | **OK** (0 indicator) | Runbook §3b là shell có comment **WHY/ops** từng bước + nhãn (1)(2)(3); vhost 57 dòng, tên rõ (`www → apex`, `apex → proxy`); không magic number vô nghĩa; doc đi kèm code (runbook §3b + §7 troubleshooting). Không hàm >50 dòng / indirection >3 bước. (Lưu ý F8: comment vhost lệch nhẹ so với thực tế — không tính AI-chaos indicator) |
| `ai-friendly-web` | **OK** | Domain phụ phục vụ **cùng app** ⇒ `llms.txt`/`robots.txt`/`sitemap.xml` vẫn được phục vụ; canonical/sitemap giữ `ntavietnam.tech` (`public/llms.txt:6-14`, `deploy.yml:18`); không xoá/chặn AI crawler |
| `blitzstrike` (live pentest) | `N/A` | Không có endpoint/input mới; môi trường live không được phép trong session reviewer (cấm SSH, shell deny) |
| `security` | `OK` (không có bề mặt mới) | Không auth/secret/session/upload mới; vhost dùng biến nginx, không hardcode secret; header proxy copy **1:1** baseline (giữ `X-Forwarded-For` cho rate-limit `/api/contact` — task-01 review đã xác nhận parity); TLS do certbot quản lý, lineage riêng cho `ntasolution.vn`, **không** đụng cert `ntavietnam.tech` (`deploy-vps.md:90`) |
| Migration gate | `N/A` | `db_tool: none` / `migration_required: false` |
| Responsive Checklist Gate | `N/A` | Diff/phase **không đụng UI** (không route/component/CSS; chỉ nginx conf + docs) → gate không áp dụng. Test 375/768/1280 không áp dụng: domain phụ phục vụ **cùng app** đã được verify responsive ở layer trước |

## Residual risk / Blocked

1. **Blocked — shell:** toàn bộ `git`/`curl`/`npm` bị `permission denied` ⇒ reviewer **không** re-verify redirect matrix/canonical/cert ngoài, **không** kiểm được file list commit `ec09807` (check #6). Không retry theo Tool Loop Guard.
2. **Evidence ngoài không tái lập độc lập:** mọi kết quả HTTP/TLS/md5 đến từ primary (task file + journal). Giảm thiểu bằng: thông tin rất chi tiết (status + Location + md5 vhost + SAN + NotAfter), nhất quán nội bộ, và **regression `ntavietnam.tech` có mốc md5 so sánh được**.
3. **`nginx -t` trên VPS:** tin theo evidence (4 mốc OK); reviewer không SSH. Rủi ro shared-VPS đã được gate bằng `nginx -t` trước mỗi reload.
4. **DNS:** `dig` không chạy được (shell deny) → tin theo evidence; lý luận `dhp-cms` off-box là logic hợp lệ (check #7).
5. **Cert renewal:** chưa kiểm `certbot renew --dry-run` cho lineage mới (không có evidence) → residual; xem F9.

## Verdict

✅ **PASS**

- **0 CRITICAL / 0 MAJOR**; 10 **MINOR** (F1 tick change-file acceptance; F2 ngày cert mâu thuẫn; F3 thiếu evidence ismartschool; F4 `crm-dhp` không có evidence; F5 thiếu raw output/sed; F6 §3 thiếu `--redirect`; F7 `sed -i` không backup; F8 comment vhost lệch thực tế; F9 rollback để lại lineage; F10 traceability commit).
- Gate bắt buộc: **Responsive = N/A** (không đụng UI); AI-readable **OK**; ai-friendly-web **OK**; security **OK**; `aislop`/`ocr` = `skip` (shell deny + 0 code diff), `oxlint` = `N/A` → **không** chặn PASS.
- Xác nhận các điểm primary yêu cầu: vhost repo **không** có `listen 443`/`ssl_certificate` (không copy ngược bản VPS) ✅ · runbook §3b **khớp** thao tác thật **kể cả bước sed** ✅ · canonical/SEO **không** đổi (repo: `seo.ts`, `llms.txt`, `deploy.yml`, vhost cũ — 0 ref `ntasolution`) ✅ · `dhp-cms 000` **không phải regression** (DNS → IP khác, ngoài box) ✅ (*có điều kiện*: chưa evidence cho `crm-dhp` — F4).
- Điều kiện kèm theo: mục “Điều kiện kèm theo cho close-out task-02” (explicit file list, cấm `git add .`, cập nhật `progress.json` TRƯỚC commit, các fix docs/evidence F1–F5, F6–F8 ở close-out).
