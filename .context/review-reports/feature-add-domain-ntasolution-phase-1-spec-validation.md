# Spec validation (phase close) — feature `add-domain-ntasolution` (CR-005) · phase-1

Agent: spec-validator

- **Change:** `spec/changes/2026-10-13-add-domain-ntasolution.md` (CR-005, ADDITIVE infra/nginx)
- **Spec delta:** `spec/updates/2026-10-13-add-domain-ntasolution.md` · `spec/CHANGELOG.md:31` · `spec/test-scope/current.json`
- **Task:** `tasks/change-add-domain-ntasolution/phase-1-task-01.md` + `phase-1-task-02.md` (§Evidence)
- **Review nguồn:** `feature-add-domain-ntasolution-phase-1-task-01-round-1-review.md` (PASS NORMAL) ·
  `feature-add-domain-ntasolution-phase-1-task-02-round-1-review.md` (PASS STRICT) ·
  `feature-add-domain-ntasolution-spec-validation.md` (pre-plan, inline PASS)
- **Ngày / round:** 2026-10-13 · **phase-1 · round 1** · Mode: **phase review** (cross-check requirement ↔ task ↔ implementation)
- **Không sửa source** — report này chỉ ghi nhận.

## Verdict

✅ **PASS (có điều kiện)** — 0 ❌, 0 conflict HIGH. Toàn bộ 8 acceptance + R-27/R-19/R-21 đều có bằng chứng,
không phát hiện yêu cầu nào MISSING trong implementation.

- **1 gap MEDIUM bắt buộc xử lý trong commit close-out (G1 — test-scope handoff của R-27 đã bị ghi đè)**,
  + 4 mục LOW/PARTIAL tracking (G2–G5). Không mục nào cần sửa code hay đổi requirement.
- Nếu primary coi G1 là blocker (không có test-scope cho R-27 ⇒ template TEST không kiểm được domain phụ)
  → xử lý y như khuyến nghị §4.1 rồi coi CR-005 là `done`.

> ⚠️ **Điều chỉnh tiền đề (đĩa là sự thật):** prompt mô tả "CR-004 còn in_progress, scope v26 ở HEAD" —
> trên đĩa nay **CR-004 đã `done`** (`spec/changes/BACKLOG.md:14`, `.context/progress.json:669`) và các bản publish
> của CR-004 **đã commit lên HEAD**: `910cead` (T05) → `070d53c` (CR-006) → `d0dfed7` (close-out CR-004) —
> `.git/logs/HEAD:75-77`. Hệ quả: `SPECIFICATIONS.md` = **3.5.1** và `spec/test-scope/current.json` = **3.5.1 / scope v30**,
> không còn 3.5.0/v27. Đây là concurrency hợp lệ, **không phải lỗi của CR-005**, nhưng tạo ra G1.

## 1. Ma trận coverage (requirement | source | status | note)

| # | Requirement | Source | Status | Note / bằng chứng |
|---|---|---|---|---|
| AC1 | vhost mới proxy app (cùng nội dung) | `spec/changes/2026-10-13-add-domain-ntasolution.md:28` | ✅ | `deploy/nginx/ntasolution.vn.conf:40-61` (apex→`127.0.0.1:3005`, 7 header proxy khớp baseline); evidence apply task-02 `:74` (200 `/`, `/en`) |
| AC2 | `www` → 301 apex | change `:29` | ✅ | `ntasolution.vn.conf:24-38`; runbook bước (3) `docs/runbook/deploy-vps.md:66-70`; evidence task-02 `:72-73` |
| AC3 | HTTPS apex+www; `http://` → 301 | change `:30` | ✅ | `deploy-vps.md:65` (`--redirect`); evidence cert `CN=ntasolution.vn`, SAN apex+www, exp **2027-01-11** (task-02 `:69,78`) |
| AC4 | `https://ntasolution.vn/` + `/en` = 200 + `/api/health` ok | change `:31` | ✅ | task-02 `:74-75`; reviewer task-02 (AC#4) `:51` |
| AC5 | canonical vẫn `ntavietnam.tech`, không đổi `NEXT_PUBLIC_SITE_URL` | change `:32` | ✅ **(verified độc lập ở repo)** | `src/lib/seo.ts:4` (`?? 'https://ntavietnam.tech'`) · `src/app/sitemap.ts:7,24-25` · `src/app/robots.ts:5` · `public/llms.txt:6-14` · `.github/workflows/deploy.yml:18`. **Grep `ntasolution` trong `src/**`, `.github/**`, `public/**` = 0 match** |
| AC6 | `ntavietnam.tech` không đổi hành vi | change `:33` | ✅ (evidence ngoài) | task-02 `:70,77-78` (200, http→301, md5 vhost `8557842926f082a76a80431f121324f4` + cert exp 2027-01-07 không đổi) — không tái lập độc lập được (xem §5) |
| AC7 | Không sửa `deploy.yml`/`seo.ts`/`llms.txt`/sitemap/robots | change `:34` | ✅ (phần `git show ec09807` = Blocked) | như AC5 (grep độc lập = 0). `ec09807` **tồn tại**, message khớp scope: `.git/logs/HEAD:74` |
| AC8 | Cập nhật runbook + `project-config` (domain phụ) | change `:35` | ✅ | `deploy-vps.md:15,55-95,131-132`; `.context/project-config.md:70` (`domain_secondary`) |
| R-27 (mở rộng) | domain phụ phục vụ cùng site, www→301 apex, HTTPS, không redirect chéo | `SPECIFICATIONS.md:304-307` (+ note `:26`) | ✅ | Spec mô tả **khớp as-built** (vhost riêng, 3005, cert apex+www, no cross-redirect, canonical nguyên). Không drift |
| R-19 | HTTPS only + http→301 | `SPECIFICATIONS.md:258-260` | ✅ | Cả 2 hostname enforce HTTPS (`deploy-vps.md:65` + vhost `:21`); không conflict với R-27 |
| R-21 | SEO: 1 canonical, sitemap/robots | `SPECIFICATIONS.md:266-267` | ✅ | Vẫn 1 canonical tuyệt đối `ntavietnam.tech` (`seo.ts:4`); domain phụ là entry point thứ hai; 0 meta-refresh (task-02 `:76`) |
| R-13/R-14 | API base URL/prod | `SPECIFICATIONS.md:228,235` | ✅ | `ntavietnam.tech/api` giữ nguyên; `/api/health` qua domain phụ cùng app (task-02 `:75`) |
| — | Intent docs có cần đổi? | `BRIEF.md:15,43` · `docs/BRD.md:53,167` | ✅ **NO CHANGE** | Cả 2 vẫn ghi "domain chính thức `ntavietnam.tech`" — **đúng** vì domain chính/canonical không đổi ⇒ theo rule intent-docs, **không** cần CR/duyệt (đúng như task-01 `:94`) |
| — | Spec delta + CHANGELOG | `spec/updates/2026-10-13-add-domain-ntasolution.md` · `spec/CHANGELOG.md:31` | ✅ | MINOR 3.4.0→3.5.0 hợp lý (thêm nghĩa vụ deploy, không đổi ngữ nghĩa canonical); thứ tự bảng đã đúng (3.3.0→3.4.0→3.5.0→3.5.1) — F2 của task-01 đã fix |
| — | Bàn giao test-scope | `spec/test-scope/current.json:2-10,35-39` | ⚠️ **GAP (G1)** | File hiện = `3.5.1` / `scopeVersion 30` / `workItem: feature-shared-detail-showcase-template` / `specRefs: [R-08c, R-08c.1]` — **không còn R-27/ntasolution**. Phần sinh scope v27 của CR-005 (`spec/updates/…:6,39`) đã bị CR-004 (v28–v30) ghi đè ⇒ acceptance "redirect matrix + canonical 2 hostname" không tới được template TEST |
| — | Tracking BACKLOG + progress | `spec/changes/BACKLOG.md:15` · `.context/progress.json:774-821` | ⚠️ **PARTIAL (G2, G3)** | Trạng thái `in_progress` khớp "đang close-out" ✅, nhưng note + field version/commit chưa reconcile |

## 2. Gap / conflict (kèm file:dòng)

### ⚠️ G1 (MEDIUM) — Test-scope handoff của CR-005 (R-27) đã bị CR-004 ghi đè, không được bàn giao
- **File:** `spec/test-scope/current.json:2-3,6,8-10` (`specVersion 3.5.1`, `scopeVersion 30`,
  `workItem: feature-shared-detail-showcase-template`, `specRefs: ["R-08c","R-08c.1"]`)
  ↔ `spec/updates/2026-10-13-add-domain-ntasolution.md:6,39` (CR-005 sinh scope **27**, "cần test được cả 2 hostname")
  ↔ `.context/progress.json:785-790` (ghi `specPublished.scopeVersion: 27`).
- **Vấn đề:** scope v27 không có archive (`spec/test-scope/` chỉ có `README.md` + `current.json`) → nội dung đã mất khỏi
  bản "current"; template AUTOTEST đọc `current.json` (v30) **không thấy** requirement R-27/domain phụ ⇒
  regression/acceptance của CR-005 (redirect matrix 3 hostname + canonical giữ nguyên) **không được kiểm** ở vòng test kế tiếp.
- **Đánh giá:** không phải lỗi implementation (R-27 vẫn nằm trong `SPECIFICATIONS.md:304-307`) — đây là gap **bàn giao**
  do concurrency CR-004/CR-005. Không có bản ghi tường minh nào nói "R-27 được test ở scope khác".
- **Khuyến nghị:** trong close-out CR-005, **publish lại scope** theo đúng `concurrency_note` của chính file
  (đọc `current.json` hiện tại rồi +1) → v31 với `workItem: feature-add-domain-ntasolution`,
  `specRefs: ["R-19","R-21","R-27"]`, `acceptance` = matrix (`http/https` × apex/www → 301/200, `/api/health`,
  `rel=canonical` = `ntavietnam.tech` trên cả 2 hostname), `impact.regression` = `ntavietnam.tech` 200 + cert/hành vi không đổi,
  `risk: medium`, + ghi `spec/updates/` (bổ sung) và 1 dòng `spec/CHANGELOG.md` (reconcile, không bump version).
  Nếu chọn **không** re-publish → phải ghi rõ lý do trong change file (`#close-out`) để template TEST biết R-27 chưa được cover.

### ⚠️ G2 (LOW) — BACKLOG CR-005 note đã stale + change file chưa flip `done`/archive
- **File:** `spec/changes/BACKLOG.md:15` — note còn "⏸ chờ user duyệt plan & SSH" trong khi: user **đã duyệt** plan + SSH
  (`.context/progress.json:813`), task-01 đã commit `ec09807`, task-02 **đã apply + verify PASS** (`phase-1-task-02.md:65-82`).
- **File:** `spec/changes/2026-10-13-add-domain-ntasolution.md:4` = `status: in_progress` (dù §Close-out `:60-68` đã viết)
  → theo workflow phải là `done` + chuyển `spec/changes/archive/`.
- **Đánh giá:** đúng tiến trình close-out (đang chạy), nhưng note sai trạng thái thật → nếu commit luôn sẽ để lại tracking lệch.

### ⚠️ G3 (LOW) — progress.json: version/scope/commit của CR-005 lệch đĩa
- **File:** `.context/progress.json:778` (`"specVersion": "3.5.0"`) vs `SPECIFICATIONS.md:2` = **3.5.1** (CR-004 sau đó);
  `:820` (`scopeVersion: 27`) vs `spec/test-scope/current.json:3` = **30**;
  `:818` (`"codeCommits": []`) vs `.git/logs/HEAD:74` (`ec09807` tồn tại).
- **Đánh giá:** các giá trị này là **lịch sử tại thời điểm CR-005 publish** — chấp nhận được, nhưng entry đọc như thể là
  trạng thái hiện tại ⇒ dễ gây nhầm khi reconcile. (Lưu ý thêm: `codeCommits: []` cũng trống ở các feature `done` khác — lỗi schema pre-existing, ngoài scope.)

### ⚠️ G4 (LOW) — Traceability commit `ec09807` chưa có artifact liệt kê file (F10 của reviewer task-02 chưa xử lý)
- **File:** `.context/runs/change-add-domain-ntasolution-phase-1-task-01.md:15,62` ("15 file, explicit list") vs
  review task-01 F4 (liệt kê **14** path, `.context/review-reports/…task-01-round-1-review.md:83-97`);
  không có `git show --name-only` ở đâu; shell bị deny ⇒ validator **không kiểm chứng được** (xem §5).
- **Khuyến nghị:** dán `git show ec09807 --name-only` (fenced block) vào journal/`§Commit` của task; ghi SHA vào task + progress.

### ⚠️ G5 (LOW, docs/evidence-only) — Evidence task-02 vẫn là summary, chưa có raw output (F5 của reviewer xử lý một nửa)
- **File:** `tasks/change-add-domain-ntasolution/phase-1-task-02.md:65-82` (summary, không có raw `nginx -t`/certbot/`curl -sI`);
  lệnh `sed` đã được ghi **đúng raw** ở `.context/runs/…-task-01.md:67` ✅ nhưng chưa đưa vào task file.
- **Ghi nhận:** F1/F2/F3/F4/F7/F8/F9 của reviewer task-02 **đã fix** (change file tick 8/8 `:28-35`; ngày cert `:55-56` = 2027-01-11;
  evidence ismartschool `:80`; evidence crm-dhp `:81`; `sed -i.bak` `docs/runbook/deploy-vps.md:68`; comment vhost trỏ §3b `:15-19`;
  rollback `certbot delete` `docs/runbook/deploy-vps.md:93-95`). F6 **cố ý bỏ một phần** — xem §3.
- **Còn:** task-02 `:110` vẫn "Reviewer verdict: pending", `:111` "Spec Validator verdict: pending",
  DoD `:131-133` chưa tick → close-out phải reconcile (kèm F5: paste raw evidence).

## 3. Conflict đã kiểm — KHÔNG phát hiện

| Điểm kiểm | Kết luận |
|---|---|
| R-27 ↔ R-19 (HTTPS only) | Không conflict — domain phụ enforce HTTPS + http→301 (`deploy-vps.md:65`, evidence task-02 `:71-73`) |
| R-27 ↔ R-21 (canonical/sitemap/robots) | Không conflict — 1 canonical duy nhất (`src/lib/seo.ts:4`), sitemap/robots dùng `BASE_URL` (`src/app/sitemap.ts:24-25`, `src/app/robots.ts:5`) nên domain phụ phục vụ URL canonical của domain chính; 0 meta-refresh + 18 ref đều là SEO tag (task-02 `:60,76`) |
| R-27 ↔ R-13/R-14 (API base) | Không conflict — API base vẫn `ntavietnam.tech/api`; route qua domain phụ dùng cùng app |
| R-27 ↔ intent docs | Không conflict — official/canonical domain không đổi ⇒ **no intent change** (đúng rule "intent docs không tự sửa") |
| Spec text ↔ as-built | Khớp từng vế: vhost riêng → 3005, cert apex+www, www→301 apex, http→301 https, không redirect chéo, canonical nguyên |
| Bản vhost repo ↔ VPS | Khác **có chủ đích** (certbot thêm block 443 + block 80 managed) — đã ghi ở `ntasolution.vn.conf:22` + `deploy-vps.md:88-89`; repo vẫn **không** có `listen 443`/`ssl_certificate` (`ntasolution.vn.conf:22-23,38-39`) ⇒ không copy ngược ✅ |
| `ntavietnam.tech.conf` comment (`:6` thiếu `--redirect`) — F6 | **Chấp nhận như residual**: change file `:57-58` tuyên bố vhost `ntavietnam.tech` ngoài phạm vi ⇒ **đúng khi không sửa**; giữ làm follow-up docs nhỏ (không tính defect) |
| `dhp-cms.genieplatform.cloud` = 000 | Không phải regression: DNS → `187.124.226.230` ≠ VPS (task-02 `:79,81`); lý luận hợp lệ (reviewer task-02 check #7) |

## 4. Khuyến nghị (thứ tự thực hiện trong close-out)

1. **[BẮT BUỘC] G1 — publish lại test-scope v31** kèm `R-19/R-21/R-27` + acceptance redirect matrix/canonical
   (đọc `current.json` hiện tại rồi +1, theo `concurrency_note` của chính file:42); thêm dòng `spec/CHANGELOG.md`
   + ghi bổ sung vào `spec/updates/2026-10-13-add-domain-ntasolution.md` (reconcile, không bump version).
2. **G2** — `spec/changes/BACKLOG.md:15` → `done (spec 3.5.0→3.5.1 · scope v27→v31)` + ngày xong; change file `:4` → `status: done` + archive `spec/changes/archive/`.
3. **G3** — `.context/progress.json`: `phase-1` + `phase-1-task-02` → `done` (verdict/round/report), thêm note
   "specVersion 3.5.0 tại thời điểm publish — đĩa nay 3.5.1 (CR-004)"; điền `codeCommits: ["ec09807", "<close-out sha>"]`;
   giữ nguyên entry CR-004/CR-006/CR-007.
4. **G4/G5** — dán `git show ec09807 --name-only` + raw evidence (`nginx -t`, certbot, `curl -sI`) vào journal/task-02;
   tick DoD `:131-133`, điền `:110-111` (Reviewer PASS STRICT round 1 / Spec Validator verdict report này).
5. **Commit:** explicit file list như reviewer đã yêu cầu (`…task-02-round-1-review.md:118-123`) — **cấm `git add .`**;
   `git diff --cached --name-only` phải KHÔNG có `src/**`, `tsconfig.json`, change file CR-004/CR-006.
   `SPECIFICATIONS.md` **không cần sửa** (R-27 đã có; version 3.5.1 là của CR-004 — KHÔNG hạ về 3.5.0).
6. Follow-up docs nhỏ (không chặn): `deploy/nginx/ntavietnam.tech.conf:6` thêm `--redirect` (cần CR/duyệt vì file thuộc vhost domain chính);
   `certbot renew --dry-run` cho lineage `ntasolution.vn` (F9/residual).

## 5. Residual risk / Blocked

1. **Blocked — shell:** mọi lệnh shell bị `permission denied` (đã thử 1 lần `git status`/`git log`, **không retry** theo Tool Loop Guard)
   ⇒ không chạy được `git status`/`git show`/`curl`/`nginx -t`/parse JSON. Bù bằng Grep/Read:
   `.git/logs/HEAD` (chứng minh `ec09807` tồn tại), đọc trực tiếp file để xác nhận contract canonical.
2. **Chưa verify được độc lập (tin theo evidence primary):** redirect matrix, cert SAN/expiry, md5 vhost `ntavietnam.tech`,
   `nginx -t` 4 mốc, trạng thái container/site khác trên VPS. Evidence chi tiết + nhất quán nội bộ ⇒ không đủ cơ sở FAIL,
   nhưng đây là residual (không phải "đã verify độc lập").
3. **JSON validity:** `spec/test-scope/current.json` đọc trực tiếp → cấu trúc hợp lệ (đủ `{}`), nhưng **chưa parse bằng tool**
   (shell deny) → residual nhỏ. Nội dung đã khớp `specVersion 3.5.1` với `SPECIFICATIONS.md:2` ✅ (khớp version, khác workItem như G1).
4. **File boundary commit chưa kiểm được** (shell deny) → phụ thuộc F4/G4 explicit file list ở close-out.

## 6. Kết luận

- Implementation của CR-005 **đầy đủ và khớp spec**: 8/8 acceptance có bằng chứng, R-27 mở rộng mô tả đúng as-built,
  không conflict R-19/R-21/R-13, canonical contract **không bị đổi** (grep độc lập `ntasolution` trong `src/**`, `.github/**`, `public/**` = 0),
  intent docs **không cần đổi**.
- Chỉ còn **gap bàn giao/tracking** (G1 MEDIUM + G2–G5 LOW) — tất cả nằm trong close-out commit, không cần code mới, không cần vòng review mới.
- **→ Cho phép close-out** với điều kiện G1 (publish lại test-scope kèm R-27) + G2/G3 (flip status, reconcile progress)
  được xử lý **trước** commit, và commit dùng explicit file list.
