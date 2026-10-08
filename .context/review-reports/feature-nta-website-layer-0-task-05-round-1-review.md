# Review — feature/nta-website · layer-0-task-05 · round 1

Agent: reviewer

- **Review level:** NORMAL
- **Task:** `tasks/nta-website/layer-0-task-05.md` — Git/CI files + env example (generate, KHÔNG push)
- **Diff base:** `dd392df` (chưa commit): `M .env.local.example`, `M .gitignore`, `M README.md`,
  `M tasks/nta-website/layer-0-task-05.md`, `?? .github/workflows/ci.yml`
- **Report path:** `.context/review-reports/feature-nta-website-layer-0-task-05-round-1-review.md`

## Reason (risk level)

`NORMAL` — scope hẹp (YAML CI + env convention + docs), không đụng runtime code, auth/RBAC,
DB/schema/migration, API contract hay client bundle. Không đủ điều kiện `FAST` vì diff đụng
shared convention toàn repo (`.gitignore`, CI workflow) và **R-19 secret handling** (env example);
không cần `STRICT` vì chưa có remote, workflow chưa active và **không có bước deploy/secret** nào.

## Blast radius

- `.github/workflows/ci.yml` — workflow verify (chưa active vì repo chưa có remote).
- `.env.local.example` — template env (không phải `.env.local` thật).
- `.gitignore` — quy tắc ignore toàn repo (ảnh hưởng mọi track sau này).
- `README.md` — docs Development/CI.
- Không ảnh hưởng: runtime app code, API, client bundle, DB.

## Verify commands + result

| Command | Result |
|---|---|
| `npm run lint` | ✅ PASS (exit 0, `eslint .` no output) |
| `npm run typecheck` | ✅ PASS (exit 0, `tsc --noEmit`) |
| `npm run build` | ✅ PASS (Next.js 15.5.27; 5 static pages; middleware 46.3 kB) |
| `git status --short` | ✅ 4 modified + `?? .github/`; **không thấy `.env.local`** |
| `git diff HEAD` (các file scope) | ✅ đã đọc diff thực tế |
| `npx aislop scan --changes --json` | ✅ score **100 / Healthy**, 0 findings |
| `ocr --version` | ⏭️ `ocr: command not found` → skip, ocr not installed |
| `git remote -v` / `git ls-files` / `ls` | ⛔ bị reviewer bash allowlist deny → không chạy được (xem Residual risk) |

## Acceptance Criteria coverage

| AC | Kết quả | Bằng chứng |
|---|---|---|
| `.github/workflows/ci.yml` tồn tại, chạy đúng 3 lệnh verify; YAML hợp lệ | ✅ | `ci.yml:23-28` lint/typecheck/build; YAML static-valid |
| `CONTACT_FORM_TARGET` có trong env example; `.env.local` không bị commit | ✅ | `.env.local.example:75`; `.gitignore:1`; `.env.local` không tồn tại trên đĩa & không xuất hiện trong `git status` |
| `.gitignore` cover `.next/`, `node_modules/`, `.env.local` | ✅ | `.gitignore:1-8` |
| Không có lệnh push/deploy nào | ✅ | workflow chỉ có checkout/setup-node/npm ci/lint/typecheck/build; không step deploy, không secret; chỉ 1 file workflow |
| Check commands pass local | ✅ | lint/typecheck/build PASS (mục trên) |

## Detailed findings (theo trọng tâm)

1. **CI workflow** (`.github/workflows/ci.yml`)
   - Trigger `push` + `pull_request` (line 3-5) ✅
   - `actions/checkout@v4` → `actions/setup-node@v4` (`node-version: lts/*`, `cache: npm`) → `npm ci`
     → `npm run lint` → `npm run typecheck` → `npm run build` ✅
   - `permissions: contents: read` ✅ (least privilege)
   - **Không** step deploy/push/secret/env ✅
   - YAML: cấu trúc hợp lệ qua review tĩnh (indent đúng, list `steps` đúng, `on`/`permissions`/`jobs` hợp lệ).
     Không parse được bằng `node -e`/`python3 -c` vì 2 lệnh này không nằm trong allowlist của reviewer.

2. **`.env.local.example`**
   - `CONTACT_FORM_TARGET=` (line 75) có mặt, giá trị rỗng, kèm comment OQ#4 ✅
   - Không chứa secret thật — các token (`GIT_TOKEN`, `VERCEL_TOKEN`, `RAILWAY_TOKEN`,
     `OTEL_EXPORTER_OTLP_TOKEN`) đều là placeholder rỗng ✅
   - Mẫu sẵn có được **append**, không ghi đè/mất mục nào ✅
   - Không có biến `NEXT_PUBLIC_*` nào → không rò secret ra client (R-19) ✅

3. **`.gitignore`** — có `.env.local` (1), `node_modules/` (2), `.next/` (6), `*.tsbuildinfo` (7),
   `logs/` (8), `*.log` (9) ✅ → đủ cover yêu cầu.

4. **README.md** — có mục Development với `npm ci` / `npm run lint` / `npm run typecheck` / `npm run build`
   và ghi chú `CI status: pending remote` ✅ (line 39-48).

5. **R-19** — `.env.local` bị ignore (`.gitignore:1`), không có file `.env.local` trên đĩa, không tracked;
   env example chỉ placeholder rỗng; không leak sang client ✅

6. **Không push/deploy** — chỉ 1 workflow duy nhất (`.github/workflows/ci.yml`), không có workflow deploy;
   project-config `auto_push_after_pass: false`, `forbidden_branch: main`; reviewer không chạy push/commit ✅

## Findings (phân loại)

### [MINOR] README heading structure — `.` `README.md:37-50`
Mục mới `## Development` (H2) được chèn ngay sau `## Getting Started` (H2) và **trước** `### New project`
(H3, vốn là subsection của Getting Started). Về mặt cấu trúc, khối "New project" bị đặt dưới một H2 khác
gây lệch phân cấp tài liệu.
- Fix đề xuất: đổi `## Development` thành `### Development` để nằm trong `## Getting Started`, hoặc dời
  đoạn Development xuống sau `### New project`. Không chặn PASS.

### [MINOR] Thiếu `timeout-minutes` / `concurrency` cho job CI — `.github/workflows/ci.yml:11`
Job `verify` không có `timeout-minutes` (job treo sẽ tốn slot runner) và không có `concurrency`
(đẩy liên tiếp sẽ chạy chồng). Không bắt buộc theo AC; chỉ là hardening CI.
- Fix đề xuất: thêm `timeout-minutes: 15` cho job, và nếu muốn:
  `concurrency: { group: ci-${{ github.ref }}, cancel-in-progress: true }`. Không chặn PASS.

## Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| aislop (`aislop scan --changes --json`) | ✅ OK | score 100, label Healthy, 0 issues, 0 findings |
| anti-slop / oxlint | ⏭️ skip, oxlint not configured | không có `.oxlintrc*`; diff không đụng TS/JS |
| open-code-review (`ocr`) | ⏭️ skip, ocr not installed | `ocr: command not found` |
| AI-readable codebase | ✅ OK | README cập nhật cho luồng chính (Development/CI); 0 AI-chaos indicator |
| AI-friendly web | N/A | task scaffolding CI/env nội bộ, không phải trang web public |
| Security pentest (blitzstrike) | N/A | NORMAL, không phải task nhạy cảm STRICT |

## Responsive Checklist Gate

N/A — diff đang review **không đụng UI** (chỉ CI YAML / env example / .gitignore / README). Bỏ qua gate
theo điều kiện áp dụng.

## Residual risk

- **YAML parser**: không chạy được `node -e`/`python3 -c` (ngoài allowlist reviewer). Chỉ verify tĩnh;
  cấu trúc đơn giản nên tự tin hợp lệ, nhưng chưa có parse động xác nhận.
- **`package-lock.json`**: không liệt kê trực tiếp được (`git ls-files` bị deny). `git status --short`
  cho thấy nó **không** ở trạng thái untracked/modified → suy ra đã được track từ task scaffold trước
  (nếu thiếu, `npm ci` và `setup-node cache: npm` trong CI sẽ fail). Đề xuất xác nhận nhanh khi close-out.
- **Remote**: `git remote -v` bị deny. Dựa vào project-config (`auto_push_after_pass: false`, chưa có remote)
  và journal; workflow không có bước deploy/push nên rủi ro thấp.
- **`.env.local` tracked hay không**: xác nhận gián tiếp (không tồn tại trên đĩa, khớp ignore, `git status`
  không hiện). Không có dấu hiệu bị track.

## Verdict

✅ **PASS** — 0 CRITICAL, 0 MAJOR, 2 MINOR (không chặn). Acceptance criteria của task đều đạt;
3 verify commands PASS; không có bước push/deploy; R-19 giữ đúng.
