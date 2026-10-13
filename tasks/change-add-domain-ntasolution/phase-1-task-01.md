# Task 01 (additive): Repo-side — vhost `ntasolution.vn` + runbook + config domain phụ

> Nguồn: change `spec/changes/2026-10-13-add-domain-ntasolution.md` (CR-005, acceptance 1–3 + 8)
> · spec delta `spec/updates/2026-10-13-add-domain-ntasolution.md` · **R-27 (mở rộng)** / R-19 / R-21.

## Type
feature (ADDITIVE) — infra/nginx config + docs. **0 dòng code app.**

## Classification / Risk
- Work item type: FEATURE (post-build ADDITIVE)
- Feature change type: ADDITIVE (thêm domain phụ; không đổi canonical contract)
- Scope: SINGLE_SURFACE (hạ tầng nginx/certbot của 1 site) — không shared code app
- Root cause category: n/a (không phải bug) — CONFIG_ENV (hạ tầng chưa có vhost/cert cho domain mới)
- Review level expected: **NORMAL** (config/docs, có curl verify ngoài; không auth/schema/data/API-contract code)
- Blast radius: `deploy/nginx/ntasolution.vn.conf` (file mới), `docs/runbook/deploy-vps.md`,
  `.context/project-config.md`, `SPECIFICATIONS.md` (R-27 + version). **Không** đụng code app /
  `NEXT_PUBLIC_SITE_URL` / seo / sitemap / robots / llms.txt / `.github/workflows/deploy.yml`, không đụng vhost `ntavietnam.tech`.
- Doc impact: YES — `docs/runbook/deploy-vps.md` (§3b) + `.context/project-config.md` (domain phụ) + `SPECIFICATIONS.md` (R-27)
- Decision impact: NO (canonical/SEO contract giữ nguyên — không đổi kiến trúc, ownership, API contract)

## Phase
4 (Integration/infra — deploy config; task này chỉ **chuẩn bị repo**, chưa apply lên VPS)

## Goal
Chuẩn bị **trong repo** mọi thứ để thêm domain phụ `ntasolution.vn` (+ `www`) phục vụ cùng nội dung:
vhost nginx mới + bước certbot + ghi nhận domain phụ vào config/spec — **KHÔNG** SSH, **KHÔNG** apply.

## Dependencies
- Không (task đầu). **Apply lên VPS = task-02 (cần user duyệt SSH).**

## Description (đúng scope — KHÔNG mở rộng)
1. Tạo `deploy/nginx/ntasolution.vn.conf`:
   - block 80 `server_name ntasolution.vn` → `proxy_pass http://127.0.0.1:3005` + cùng bộ header proxy như
     `ntavietnam.tech.conf` (Host/X-Real-IP/X-Forwarded-For/X-Forwarded-Proto/Upgrade/Connection/read_timeout);
   - block 80 `server_name www.ntasolution.vn` → `location / { return 301 https://ntasolution.vn$request_uri; }`
     (giữ `/.well-known/acme-challenge/` cho certbot);
   - header comment: nêu rõ domain phụ/canonical giữ nguyên + certbot chèn block 443 ở VPS.
2. `docs/runbook/deploy-vps.md`: bảng hạ tầng thêm dòng "Domain phụ"; thêm **§3b** (copy vhost → `nginx -t` →
   `certbot --nginx --redirect -d ntasolution.vn -d www.ntasolution.vn` → `nginx -t && reload` + lệnh curl kiểm tra
   redirect matrix/canonical/`ntavietnam.tech` không đổi); §7 troubleshooting thêm 2 symptom (trang nginx mặc định,
   lỗi cert SNI).
3. `.context/project-config.md`: thêm `domain_secondary: ntasolution.vn` (kèm ghi chú canonical không đổi).
4. `SPECIFICATIONS.md`: mở rộng **R-27** (domain phụ ntasolution.vn + www→301 apex, HTTPS, không redirect giữa 2 domain)
   + note Overview; bump `spec_version` 3.4.0 → **3.5.0** (MINOR) — kèm `spec/updates/`, `spec/CHANGELOG.md`,
   `spec/test-scope/current.json` (scopeVersion **27**).
5. KHÔNG sửa `.github/workflows/deploy.yml`, `src/lib/seo.ts`, `public/llms.txt`, sitemap, robots,
   `docker-compose.yml`, `NEXT_PUBLIC_SITE_URL`; KHÔNG rebuild app.

## Acceptance Criteria
- [x] `deploy/nginx/ntasolution.vn.conf` tồn tại, có 2 server block: apex proxy 3005 + www `return 301 https://ntasolution.vn$request_uri`
- [x] Cả 2 block giữ `location /.well-known/acme-challenge/` (certbot http-01 chạy được cho cả apex lẫn www)
- [x] `grep` vhost: **không có directive nào** trỏ/redirect sang `ntavietnam.tech` (chỉ được xuất hiện trong comment giải thích) —
      kiểm bằng `grep -vE '^\s*#' deploy/nginx/ntasolution.vn.conf | grep -c "ntavietnam.tech"` → `0`
- [x] `docs/runbook/deploy-vps.md` §3b có đủ chuỗi lệnh copy → `nginx -t` → certbot 2 domain → reload + curl verify
      (đã thêm `--redirect` tại close-out theo review F1)
- [x] `.context/project-config.md` có `domain_secondary`; `domain`/`NEXT_PUBLIC_SITE_URL`/`internal_port` **không đổi**
- [x] `SPECIFICATIONS.md` `spec_version: 3.5.0` + R-27 mô tả domain phụ; `spec/updates/2026-10-13-add-domain-ntasolution.md` + `spec/CHANGELOG.md` + `spec/test-scope/current.json` (specVersion 3.5.0, scopeVersion 27, JSON valid)
- [x] `git diff --name-only` của commit này KHÔNG chứa file app code / CR-004 / workflow / seo (kiểm lúc stage — explicit file list, cấm `git add .`)
- [x] Verify commands PASS (không hồi quy) — xem Verification Plan

## Verification Plan
- Commands (`.context/project-config.md` — repo build trên Windows):
  `npm.cmd run typecheck` · `npm.cmd run lint` · `npm.cmd run build`
  → **kết quả 13/10/2026 (primary chạy):** typecheck PASS · lint 0 errors (1 warning pre-existing
  `src/components/mdx/index.tsx:25` no-img-element, ngoài scope) · build PASS **57/57**.
  (build lần 1 fail `Cannot find module './chunks/vendor-chunks/next.js'` do dev server đang chạy chiếm `.next`
  — đã chứng minh HEAD cũng fail; build lại với `distDir` cách ly `.next-verify` PASS rồi revert `next.config.ts`,
  `git diff next.config.ts` = 0, xoá `.next-verify`)
- Static: `grep -rn "ntasolution" deploy/nginx/ docs/runbook/deploy-vps.md .context/project-config.md` → có mặt
  đúng chỗ; ref `ntavietnam.tech` trong vhost (loại comment) → 0. ✓
- Nginx syntax: không chạy được trên máy dev (không có nginx) → `nginx -t` **bắt buộc trên VPS tại task-02**.
  Chưa syntax-check thật (residual → task-02).
- Reviewer report path: `.context/review-reports/feature-add-domain-ntasolution-phase-1-task-01-round-1-review.md`
  → **PASS NORMAL, round 1** (0 CRITICAL/MAJOR, 6 MINOR; F1 certbot `--redirect` + F2 thứ tự CHANGELOG
  đã fix lúc close-out; F3/F4/F5 = ghi nhận cho commit hygiene + progress; F6 = quan sát, cùng pattern baseline)

## Retry / Error Memory
- Attempt: 1 (build lần 1 fail do môi trường `.next` bị dev server chiếm — không phải lỗi diff; đã verify
  HEAD cũng fail, không tính FAIL task; cách ly distDir → PASS). Error memory: không thêm entry (không phải lỗi code).
- Escalation: none (verify FAIL thật → `.agent/error-analyzer.md`, tối đa 3 attempt)

## Feature Verification (feature/update only)
- Acceptance criteria: repo-side 8/8 tick (phần apply VPS + curl matrix ngoài chuyển sang task-02)
- Verify commands + result: `npm.cmd run typecheck` PASS · `npm.cmd run lint` 0 errors (1 warning pre-existing) ·
  `npm.cmd run build` PASS 57/57 (cách ly distDir, xem Verification Plan) — 13/10/2026
- Reviewer verdict: **PASS (NORMAL, round 1)** — 0 CRITICAL/MAJOR, 6 MINOR
  (`.context/review-reports/feature-add-domain-ntasolution-phase-1-task-01-round-1-review.md`; F1/F2 fix close-out)
- Spec Validator verdict (phase close): pre-plan inline PASS
  (`.context/review-reports/feature-add-domain-ntasolution-spec-validation.md`) — phase close chạy lại sau task-02

## Doc / Decision Impact
- Doc impact result: `docs/runbook/deploy-vps.md` (§3b + bảng hạ tầng + troubleshooting),
  `.context/project-config.md` (`domain_secondary`), `SPECIFICATIONS.md` (R-27 + 3.5.0)
- Intent docs: **no change** — domain chính thức vẫn `ntavietnam.tech` (`BRIEF.md:15`, `docs/BRD.md:167` vẫn đúng)
- Decision log: none

## Commit / Tracking
- Commit: **`ec09807`** (đã commit 13/10/2026) — explicit file list (15 file, verify qua `git show ec09807 --name-only`):
  `.context/progress.json` · `.context/project-config.md` ·
  `.context/review-reports/feature-add-domain-ntasolution-phase-1-task-01-round-1-review.md` ·
  `.context/review-reports/feature-add-domain-ntasolution-spec-validation.md` ·
  `.context/runs/change-add-domain-ntasolution-phase-1-task-01.md` · `SPECIFICATIONS.md` ·
  `deploy/nginx/ntasolution.vn.conf` · `docs/runbook/deploy-vps.md` · `spec/CHANGELOG.md` ·
  `spec/changes/2026-10-13-add-domain-ntasolution.md` · `spec/changes/BACKLOG.md` ·
  `spec/test-scope/current.json` · `spec/updates/2026-10-13-add-domain-ntasolution.md` ·
  `tasks/change-add-domain-ntasolution/phase-1-task-01.md` · `tasks/change-add-domain-ntasolution/phase-1-task-02.md`
  — không chứa `src/**`, `tsconfig.json`, workflow, hay change file của CR-004/CR-006/CR-007
- Commit source of truth: changed files, timestamp, SHA, rollback point
- Task source of truth: acceptance/evidence/residual risk/doc impact
- Progress source of truth: `.context/progress.json`

## DoD (Definition of Done)
- [x] Files created/modified đúng scope
- [x] Check commands PASS (theo `.context/project-config.md`) — typecheck/lint/build PASS
- [x] Reviewer độc lập PASS (NORMAL, round 1)
- [x] `.context/progress.json` updated (TRƯỚC commit)
- [x] Error Memory updated for every failed attempt, or `n/a` recorded (n/a — fail build là môi trường)
- [x] Doc Impact reconciled (runbook §3b + project-config + SPEC R-27)
- [x] Commit created sau PASS close-out (1 task = 1 commit) — explicit file list

## Files to Create/Modify
- `deploy/nginx/ntasolution.vn.conf` (MỚI)
- `docs/runbook/deploy-vps.md`
- `.context/project-config.md`
- `SPECIFICATIONS.md`, `spec/updates/2026-10-13-add-domain-ntasolution.md`, `spec/CHANGELOG.md`, `spec/test-scope/current.json`

## Notes
- **Chưa apply gì lên VPS ở task này.** `nginx -t` thật + certbot + reload thuộc task-02 (human checkpoint SSH).
- Vhost repo là bản **khởi tạo** (block 80). Trên VPS, `certbot --nginx` chèn block 443 vào cả 2 block ⇒
  bản trên VPS khác repo có chủ đích; **KHÔNG** copy ngược về repo (ghi trong runbook §3b).
- Vì sao 2 server block thay vì 1 block + `if ($host = ...)`: certbot quản lý cert theo block có `server_name` khớp;
  2 block cho phép cert phủ apex+www và giữ 301 www→apex ở cả 80 lẫn 443 rõ ràng hơn.
- Rate-limit `/api/contact` phụ thuộc `X-Forwarded-For` → vhost mới copy **cùng bộ header** với vhost hiện có.
- App không có redirect theo host (đã kiểm `next.config.ts` + `src/**`) ⇒ 2 domain phục vụ cùng nội dung như yêu cầu.
- Residual (task-01): chưa `nginx -t` thật (máy dev không có nginx) — chuyển tiếp sang task-02.
