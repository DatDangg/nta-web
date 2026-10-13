# Review — feature `add-domain-ntasolution` · phase-1-task-01 · round 1

Agent: reviewer

- **Task:** `tasks/change-add-domain-ntasolution/phase-1-task-01.md` (CR-005, ADDITIVE — infra/nginx repo-side)
- **Change:** `spec/changes/2026-10-13-add-domain-ntasolution.md` · **Delta:** `spec/updates/2026-10-13-add-domain-ntasolution.md`
- **Ngày:** 2026-10-13 · **Report:** `.context/review-reports/feature-add-domain-ntasolution-phase-1-task-01-round-1-review.md`
- **Review level:** `NORMAL` (task kỳ vọng NORMAL — reviewer xác nhận)

## Reason (vì sao NORMAL, không STRICT/FAST)

- **Không có risk đỏ nào trong scope task này:** 0 dòng code app, không auth/RBAC, không tenant/school isolation,
  không DB/schema/migration (`db_tool: none`), không API contract/DTO/response shape, không payment,
  không cron/webhook, không xử lý file/upload/session. Diff thuần **config infra (nginx vhost mới) + docs + spec metadata**.
- **Không chọn FAST** vì: file mới `deploy/nginx/ntasolution.vn.conf` sẽ được `nginx -t`/`reload` trên **VPS shared**
  (ismartschool, crm-dhp, tmfoods) ở task-02, và có file dùng chung với change khác
  (`spec/test-scope/current.json`, `.context/progress.json`, `spec/changes/BACKLOG.md`) → cần review kỹ hunk/concurrency,
  không hẹp tới mức FAST.
- **Không chọn STRICT** vì task-01 **không apply gì lên VPS** (human checkpoint SSH ở task-02) và không đụng
  code app/canonical contract.

## Blast radius

| Phạm vi | Chi tiết |
|---|---|
| File mới | `deploy/nginx/ntasolution.vn.conf` (vhost — nguồn copy cho `/etc/nginx/sites-available/` ở task-02) |
| Docs/config | `docs/runbook/deploy-vps.md` (§3b + bảng hạ tầng + §7), `.context/project-config.md` (`domain_secondary`) |
| Spec | `SPECIFICATIONS.md` (3.4.0→3.5.0, R-27 mở rộng), `spec/updates/…`, `spec/CHANGELOG.md`, `spec/test-scope/current.json` (v27) |
| Tracking | `.context/progress.json` (entry add-domain-ntasolution), `spec/changes/BACKLOG.md` (CR-005) |
| Xuôi dòng (task-02, chưa chạy) | nginx VPS shared 187.52.119.50 → reload ảnh hưởng **mọi site** trên VPS nếu vhost sai; cert lineage mới `/etc/letsencrypt/live/ntasolution.vn/` |
| Song song (ngoài scope) | CR-004 `shared-detail-showcase-template` đang in_progress + dirty `src/**` — interleave ở 4 file dùng chung |
| **KHÔNG** bị ảnh hưởng (repo-side) | `src/**`, `next.config.ts`, `NEXT_PUBLIC_SITE_URL`, `src/lib/seo.ts`, `public/llms.txt`, sitemap/robots, `.github/workflows/deploy.yml`, `docker-compose.yml`, vhost `ntavietnam.tech.conf`, DB (none), UI (không đụng) |

## Verify commands + result

| # | Command / check | Result | Bằng chứng |
|---|---|---|---|
| 1 | `npm run typecheck` (`web_typecheck_command`) | `skip — Blocked` (không tự chạy lại được; shell bị permission deny) | Primary báo PASS trong journal `.context/runs/change-add-domain-ntasolution-phase-1-task-01.md` (History 2026-10-13). Reviewer **không** tự reproduce → residual |
| 2 | `npm run lint` (`web_lint_command`) | `skip — Blocked` (như trên) | Primary: 0 errors, 1 warning **pre-existing** `src/components/mdx/index.tsx:25` (`no-img-element`) — file ngoài scope, không do task này |
| 3 | `npm run build` (`build_command`) | `skip — Blocked` (như trên) | Primary: PASS 57/57 trên distDir cách ly `.next-verify` (build đầu fail `Cannot find module vendor-chunks` do dev server chiếm `.next`; đã chứng minh HEAD cũng fail; `git diff next.config.ts` = 0). Reviewer không re-run |
| 4 | Static: `grep` non-comment `ntavietnam.tech` trong vhost → kỳ vọng `0` | **PASS** (kiểm bằng Read/Grep, không dùng shell) | `deploy/nginx/ntasolution.vn.conf` (57 dòng, đọc toàn bộ): `ntavietnam.tech` chỉ xuất hiện ở **line 3, 4** — cả hai là dòng comment (`#`). Non-comment ref = **0** ✅ |
| 5 | Static parity header proxy vs `deploy/nginx/ntavietnam.tech.conf` | **PASS** | 7 directive khớp 1:1: `proxy_pass http://127.0.0.1:3005`, `proxy_http_version 1.1`, `Host $host`, `X-Real-IP $remote_addr`, `X-Forwarded-For $proxy_add_x_forwarded_for`, `X-Forwarded-Proto $scheme`, `Upgrade $http_upgrade`, `Connection "upgrade"`, `proxy_read_timeout 60s` |
| 6 | Static: `nginx -t` | `skip — không có nginx trên máy dev` (đã ghi residual trong task file + runbook §3b) — bắt buộc chạy ở task-02 | Không áp dụng được ở task-01 |
| 7 | `git status` / `git diff --name-only` (acceptance: commit không chứa file app code/CR-004) | `Blocked` | Shell bị permission deny → không xác minh được ở tầng git. Bù lại đã đọc nội dung từng file in-scope; **commit chưa tồn tại** (close-out chờ PASS) nên đây là ràng buộc tiến về trước, xem F4 |
| 8 | `spec/test-scope/current.json` parse + field | **PASS** (đọc trực tiếp) | `specVersion: "3.5.0"`, `scopeVersion: 27`, `trigger: "feature-update"`, `workItem: feature-add-domain-ntasolution`, `specRefs: [R-27, R-19, R-21]`, `risk: medium`, JSON hợp lệ (cấu trúc đọc liền mạch, đủ `}`) |

## Findings

### [MINOR] F1 — Runbook §3b: certbot không nêu `--redirect` ⇒ curl matrix của chính runbook có thể fail
- **File:** `docs/runbook/deploy-vps.md:65` (lệnh `certbot --nginx -d ntasolution.vn -d www.ntasolution.vn`),
  liên quan `deploy/nginx/ntasolution.vn.conf:7` (comment khẳng định "certbot --nginx tự thêm block 443 + redirect")
  và curl kỳ vọng `docs/runbook/deploy-vps.md:72-73` (`http://ntasolution.vn/` → **301**, `http://www...` → **301**).
- **Vấn đề:** nếu `certbot --nginx` chạy non-interactive (không TTY, script/CI) mà **không** có `--redirect`,
  certbot có thể chỉ cấp cert + thêm block 443, **không** thêm `http→https 301`. Khi đó block 80 apex trong repo
  (`proxy_pass` trực tiếp, `ntasolution.vn.conf:46-56`) sẽ trả **200 qua HTTP** ⇒ acceptance change file
  "#3 `http://` → 301 `https://`" + curl matrix §3b fail, dù "trông như đã xong".
- **Fix đề xuất:** thêm cờ `--redirect` vào lệnh §3b (và §3 cho `ntavietnam.tech`):
  `certbot --nginx --redirect -d ntasolution.vn -d www.ntasolution.vn`; hoặc ghi chú rõ
  "khi certbot hỏi redirect HTTP→HTTPS thì chọn **Redirect**". Không chặn task-01 vì verify ở task-02 sẽ phát hiện.

### [MINOR] F2 — `spec/CHANGELOG.md` không theo thứ tự version
- **File:** `spec/CHANGELOG.md:29` (3.4.0) · `:30` (3.3.0) · `:31` (3.5.0).
- **Vấn đề:** dòng 3.5.0 của CR-005 được **append cuối bảng**, nằm sau 3.3.0 và 3.4.0 → bảng đọc sai trình tự
  version (3.4.0 đứng trước 3.3.0 là do CR-004 chèn giữa chừng — **ngoài scope**, nhưng CR-005 làm tình trạng
  này kéo dài thêm).
- **Fix đề xuất:** đưa dòng 3.5.0 lên sau dòng 3.4.0 (hoặc sắp xếp lại cả bảng theo version) trong lúc close-out CR-005.

### [MINOR] F3 — `spec/test-scope/current.json` v27 ghi đè scope v26 (CR-004 đang in_progress)
- **File:** `spec/test-scope/current.json:3` (`scopeVersion: 27`), `:44` (`concurrency_note`), `.context/progress.json:756`.
- **Vấn đề:** publish scope của CR-005 thay thế nội dung v26 (CR-004) ⇒ template TEST đọc `current.json` **sẽ chỉ
  thấy acceptance của CR-005**, mất coverage CR-004 (đang build dở) cho tới khi CR-004 publish lại.
- **Đánh giá:** rủi ro quy trình, **đã được ghi nhận tường minh** trong `concurrency_note` (v26 còn ở git HEAD `344bf48`,
  "đọc current.json tại thời điểm đó rồi tăng tiếp, ĐỪNG hardcode 27") → không phải lỗi ẩn.
- **Fix đề xuất:** close-out CR-004 publish lại scope (v28+, đọc file tại thời điểm đó) **trước khi** chạy template test;
  nếu chấp nhận test CR-005-only có chủ đích thì ghi chú lại trong `spec/changes/BACKLOG.md`.

### [MINOR] F4 — Commit hygiene: 4 file dùng chung bị interleave 2 change (BẮT BUỘC explicit file list + tách hunk)
- **File:** `spec/changes/BACKLOG.md` (dòng 14 CR-004 + dòng 15 CR-005), `.context/progress.json`
  (entry `add-domain-ntasolution` tại line 740-772 + entry CR-004 phía trên, `scopeVersion` CR-004 = 26 tại line 738),
  `spec/CHANGELOG.md` (dòng 3.5.0 vs các dòng CR-004), `spec/test-scope/current.json` (bị ghi đè toàn bộ bởi CR-005).
  Thêm nữa repo đang dirty bởi CR-004 ở `src/**` (products/, showcase components, sitemap.ts, tsconfig.json, content mdx).
- **Yêu cầu cho close-out CR-005:**
  1. `git add <explicit list>` — CHỈ:
     `deploy/nginx/ntasolution.vn.conf` (MỚI),
     `docs/runbook/deploy-vps.md`,
     `.context/project-config.md`,
     `SPECIFICATIONS.md`,
     `spec/updates/2026-10-13-add-domain-ntasolution.md` (MỚI),
     `spec/CHANGELOG.md`,
     `spec/test-scope/current.json`,
     `spec/changes/2026-10-13-add-domain-ntasolution.md`,
     `spec/changes/BACKLOG.md`,
     `.context/progress.json`,
     `tasks/change-add-domain-ntasolution/phase-1-task-01.md`,
     `.context/runs/change-add-domain-ntasolution-phase-1-task-01.md`,
     `.context/review-reports/feature-add-domain-ntasolution-phase-1-task-01-round-1-review.md`,
     `.context/review-reports/feature-add-domain-ntasolution-spec-validation.md`.
  2. Với file chung: dùng `git add -p` hoặc stage-theo-hunk — BACKLOG chỉ hunk CR-005 (line 15, giữ nguyên line 14 CR-004);
     `progress.json` chỉ entry `add-domain-ntasolution` (giữ entry CR-004 + `scopeVersion: 26` của CR-004);
     `CHANGELOG.md` chỉ dòng 3.5.0 (+ F2 nếu sửa thứ tự). `spec/test-scope/current.json` là **file ghi đè toàn bộ** →
     commit nội dung v27 là chủ đích (không phải tai nạn), ghi rõ trong commit body.
  3. **CẤM** `git add .` / `git add -A`; sau `git add` phải `git diff --cached --name-only` và tự kiểm **không** có
     file `src/**`, `spec/changes/2026-10-13-shared-detail-showcase-template.md`, `tsconfig.json`, `sitemap.ts`.

### [MINOR] F5 — Task file chưa được close-out cập nhật (không phải defect nguồn)
- **File:** `tasks/change-add-domain-ntasolution/phase-1-task-01.md:50-58` (acceptance vẫn `- [ ]`), `:77-82`
  (`Feature Verification` = "pending"), `:71-75` (Attempt 0).
- **Xử lý:** sau PASS review, close-out phải tick acceptance repo-side + điền verify summary + reviewer verdict.
  Bảng `spec/test-scope/current.json` và `progress.json` (task-01 `pending` → `done`) cũng phải cập nhật TRƯỚC commit.

### [MINOR] F6 — (quan sát, không cần fix) Block 80 apex proxy trực tiếp chứ không 301 https trong repo
- **File:** `deploy/nginx/ntasolution.vn.conf:37-56`, comment `:18`.
- **Nội dung:** trước khi certbot chạy, `http://ntasolution.vn` trả nội dung app qua HTTP (200) ⇒ R-19 ("HTTPS only,
  http→301") chỉ đạt sau bước certbot. Đây là **cùng pattern với baseline** `ntavietnam.tech.conf:12-33` và đã được
  ghi rõ trong comment/runbook ⇒ nhất quán, không phải defect. Liệt kê để minh bạch thứ tự phụ thuộc.

## Đối chiếu Acceptance (từng dòng, mức repo-side)

| Acceptance (task-01) | Kết quả | Bằng chứng |
|---|---|---|
| Vhost tồn tại, 2 server block: apex proxy 3005 + www `return 301 https://ntasolution.vn$request_uri` | **OK** | `deploy/nginx/ntasolution.vn.conf:21-34` (www, `:32` 301) · `:37-57` (apex, `:47` proxy 3005) |
| Cả 2 block giữ `location /.well-known/acme-challenge/` | **OK** | `:27-29` (www) · `:42-44` (apex), đều `root /var/www/html;` = baseline |
| `grep` vhost: **không** directive nào trỏ `ntavietnam.tech` (chỉ comment) → count = 0 | **OK** | Non-comment ref = 0 (2 hit đều ở line 3-4 là comment); xem Verify #4 |
| `runbook §3b`: cp → `ln -sf` → certbot 2 domain → `nginx -t && reload` + curl matrix + "KHÔNG copy ngược vhost từ VPS về repo" | **OK** | `deploy-vps.md:62-66` (chuỗi lệnh, có `nginx -t` trước certbot) · `:72-79` (curl matrix: apex/http 301, www/http 301, www/https 301 apex, apex `/` 200, `/en` 200, canonical, regression `ntavietnam.tech` 200) · `:84-85` (ghi rõ không copy ngược) · thêm `:15` (bảng hạ tầng "Domain phụ") · `:124-125` (§7: 2 symptom — trang nginx mặc định + lỗi cert SNI) |
| KHÔNG `listen 443` trong vhost repo (certbot thêm ở VPS) | **OK** | Chỉ có `listen 80` / `listen [::]:80` (`:22-23`, `:38-39`); chữ "443" chỉ xuất hiện trong comment `:15`, `:18` |
| `project-config` có `domain_secondary`; `domain`/`NEXT_PUBLIC_SITE_URL`/`internal_port` không đổi | **OK** | `.context/project-config.md:70` (`domain_secondary: ntasolution.vn`) · `:69` `domain: ntavietnam.tech` (nguyên) · `:71` `internal_port: 3005` (nguyên) · runbook `:4`/`:94` `NEXT_PUBLIC_SITE_URL` = `https://ntavietnam.tech` (không đổi) |
| `SPECIFICATIONS.md` `spec_version: 3.5.0` + R-27 mô tả domain phụ; updates + CHANGELOG + test-scope (3.5.0 / v27 / JSON valid) | **OK** | `SPECIFICATIONS.md:2` (3.5.0) · `:26` (Overview note domain phụ) · `:299-302` (R-27 mở rộng) · `spec/updates/…:3,6,10-19` · `spec/CHANGELOG.md:31` (dòng 3.5.0, scope v27) · `spec/test-scope/current.json:2-7` |
| `git diff --name-only` commit này KHÔNG chứa file app code / CR-004 / workflow / seo | **Chưa kiểm chứng được** | Không có shell (`Blocked`) + commit chưa tồn tại → chuyển thành ràng buộc F4 cho close-out |
| Verify commands PASS (không hồi quy) | **Chưa kiểm chứng được (Blocked)** | Primary báo PASS (typecheck/lint/build) trong journal; reviewer không re-run được |

## Không đụng (grep/read xác nhận repo-side)

- `git status`/`git diff` không chạy được (permission deny) ⇒ **không xác minh được ở tầng git** (ghi residual).
  Bù lại: change doc `:34`, task `:46-47`, delta `:17` ràng buộc rõ; runbook `:4` vẫn ghi "chỉ THÊM container/nginx mới";
  `NEXT_PUBLIC_SITE_URL` vẫn `https://ntavietnam.tech` (runbook `:4`, `:94`); vhost `ntavietnam.tech.conf` vẫn nguyên
  cấu trúc 1 block 80 + block 443 comment (đọc file, không có dấu hiệu sửa cho domain phụ).

## Skill gates

| Gate | Kết quả | Bằng chứng / lý do |
|---|---|---|
| `aislop` (`aislop scan --changes --json`) | `skip` | Diff **0 dòng code app** (chỉ nginx config + markdown/spec JSON) và shell bị permission deny → không chạy được |
| `anti-slop` (`npx oxlint`) | `N/A` | Diff không đụng file TS/JS (`deploy/nginx/*.conf`, `docs/*.md`, `*.json`, `SPECIFICATIONS.md`) |
| `open-code-review` (`ocr`) | `skip` | Không có code change để review + shell blocked → không chạy được (chưa xác nhận `ocr` có cài hay không) |
| `ai-readable-codebase` (AI-chaos indicators ≥3 → FAIL) | **OK** (0 indicator) | `ntasolution.vn.conf` 57 dòng, 2 block tên rõ; comment giải thích **WHY/ops** (thứ tự cài, certbot chèn gì, không copy ngược) không phải narrative WHAT; không indirection >3 bước, không magic number; doc kèm code đã reconcile (`docs/runbook/deploy-vps.md` §3b). `README`/`ARCHITECTURE` không mô tả domain ⇒ không cần update |
| `ai-friendly-web` (public-facing) | **OK** | Domain phụ phục vụ **cùng app** ⇒ `llms.txt`/`robots.txt`/`sitemap.xml` sẵn có được phục vụ trên cả 2 hostname; canonical/sitemap vẫn `ntavietnam.tech` (1 canonical, đúng cho entry point thứ hai). Không file nào bị xoá/chặn AI crawler |
| `blitzstrike` (live pentest) | `N/A` | Không có môi trường live được phép trong task này (apply VPS = task-02) và không có endpoint/input mới |
| `security` (`codex-security`) | `N/A` | Không auth/secret/session/upload/endpoint mới; không hardcode secret (vhost chỉ dùng biến nginx) |
| Migration gate | `N/A` | `db_tool: none` / `migration_required: false` → bỏ qua toàn bộ migration safety rules |
| Responsive Checklist Gate | `N/A` | Diff **không đụng UI** (không route/component/CSS) → gate không áp dụng |

## Residual risk / Blocked

1. **Blocked — shell:** mọi command shell bị `permission denied` ⇒ reviewer **không tự reproduce** typecheck/lint/build,
   `npm`/`git diff`/`grep -c`, không chạy được `nginx -t`. Không retry theo Tool Loop Guard.
2. **Verify commands chưa kiểm chứng độc lập:** chỉ có evidence do primary ghi trong journal. Với task **0 dòng code app**,
   rủi ro hồi quy app gần như bằng 0 → không đủ cơ sở để FAIL, nhưng đây là residual (không phải "đã verify độc lập").
3. **`nginx -t` thật** chưa chạy (máy dev không có nginx) → bắt buộc ở task-02 trước `reload` (runbook `:64`, `:86`)
   trên VPS **shared** ⇒ nếu sai syntax sẽ ảnh hưởng site khác; risk chấp nhận được vì có gate `nginx -t`.
4. **Điểm mù git-level:** không xác minh được "commit không chứa file CR-004/app code" — bù bằng F4 explicit file list.
5. **Phụ thuộc ngoài:** DNS apex A → `187.52.119.50` + www CNAME → apex đã trỏ sẵn (theo change file `:17-20`);
   reviewer không kiểm được DNS (không có shell/network).

## Verdict

✅ **PASS**

- Không có finding **CRITICAL/MAJOR**. 6 finding **MINOR** (F1 certbot `--redirect`, F2 thứ tự CHANGELOG,
  F3 scope v27 ghi đè v26, F4 commit hygiene, F5 close-out task file, F6 quan sát không cần fix).
- Gate bắt buộc: **Responsive = N/A** (không đụng UI), AI-readable = OK, ai-friendly-web = OK,
  aislop/oxlint/ocr = skip/N-A có lý do hợp lệ (0 code + shell blocked) → **không** chặn PASS.
- Điều kiện kèm theo cho close-out (không cần vòng review mới nếu không sửa source):
  1. Commit CR-005 **CHỈ** stage file trong F4 (cấm `git add .`), kiểm `git diff --cached --name-only` không có `src/**`,
     `tsconfig.json`, `spec/changes/2026-10-13-shared-detail-showcase-template.md`.
  2. Nên áp F1 (`--redirect`) và F2 (thứ tự CHANGELOG) trước khi commit — sửa docs-only, không cần review lại.
  3. `progress.json` + task file cập nhật `done`/acceptance tick **trước** commit (F5); giữ entry CR-004 + `scopeVersion: 26`.
  4. Task-02 (apply VPS) vẫn **blocked** chờ user duyệt SSH; F1 phải được xử lý trước/như một phần của task-02 để
     acceptance `http→301` đạt.

---

## Phụ lục — Trả lời 7 điểm check bắt buộc của primary

1. **Vhost:** ✅ 2 block đúng (www `return 301` line 32; apex proxy `127.0.0.1:3005` line 47); 7 header proxy khớp **1:1**
   `ntavietnam.tech.conf`; cả 2 block có `/.well-known/acme-challenge/`; non-comment ref `ntavietnam.tech` = **0**;
   **không** `listen 443`. (Lưu ý: repo file cố ý **không** có block www cho `ntavietnam.tech` — không liên quan task này.)
2. **Không đụng file cấm:** `Blocked` ở tầng git; về nội dung, ràng buộc được ghi rõ ở change doc `:34`,
   task `:46-47`, delta `:17`; `NEXT_PUBLIC_SITE_URL` vẫn `ntavietnam.tech` (runbook `:4`,`:94`); vhost `ntavietnam.tech.conf`
   không có dấu hiệu bị sửa. Cần primary xác nhận lần cuối bằng `git status` khi close-out (F4).
3. **Runbook §3b:** ✅ đủ chuỗi (cp `:62` → `ln -sf` `:63` → `nginx -t` `:64` → certbot 2 domain `:65` → `nginx -t && reload` `:66`
   → curl matrix `:72-79`) + ghi rõ "không copy ngược vhost từ VPS về repo" `:84-85`. Thiếu sót duy nhất: `--redirect` (F1).
4. **project-config:** ✅ có `domain_secondary: ntasolution.vn` (`:70`); `domain` (`:69`), `internal_port` (`:71`),
   `NEXT_PUBLIC_SITE_URL` không đổi (git diff `Blocked`, nhưng nội dung hiện tại đúng).
5. **Spec:** ✅ `SPECIFICATIONS.md:2` = 3.5.0; R-27 `:299-302` mô tả domain phụ; Overview note `:26`;
   `CHANGELOG.md:31` có dòng 3.5.0; `spec/updates/…` đầy đủ; `current.json` v27 JSON hợp lệ.
6. **Acceptance từng dòng:** xem bảng "Đối chiếu Acceptance" — 7/9 **OK** ở mức repo-side;
   2 dòng (`git diff --name-only`, verify commands) `Blocked` do shell deny + commit chưa tồn tại (→ F4/F5).
7. **Commit hygiene:** đã cảnh báo tường minh trong **F4** (explicit file list đầy đủ 14 path + tách hunk cho
   `BACKLOG.md`/`progress.json`/`CHANGELOG.md`, `test-scope/current.json` là ghi đè toàn bộ có chủ đích, cấm `git add .`).
