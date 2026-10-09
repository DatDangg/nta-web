# Review Report — change-cleanup-gcp-drift-comment-permission phase-1-task-01 (round 2)

Agent: reviewer

> Round 2 — **reviewer độc lập** (round 1 là inline self-review của `change-request`; round 2 đóng MINOR-1 của round 1).
> Reviewer KHÔNG sửa source; chỉ ghi report scoped.

## Metadata
- **Task:** `tasks/change-cleanup-gcp-drift-comment-permission/phase-1-task-01.md`
- **Change:** `spec/changes/archive/2026-10-09-cleanup-gcp-drift-comment-permission.md` (MODIFY, risk LOW)
- **Commit review:** `ce21c58`
- **Review level:** STRICT
- **Reason:** comment nằm trong module rate-limit bảo mật (R-18) + pointer secrets (PERMISSION.md). Dù diff chỉ comment/doc, STRICT để xác nhận **0 logic change** và **premise proxy rightmost đúng**.

## Blast radius
- `src/app/api/contact/route.ts:37` — 1 dòng comment trong `getClientIp()` (module rate-limit). Không build/runtime.
- `docs/PERMISSION.md:40` — 1 dòng pointer secrets (as-built doc).
- Không đụng: `src/lib/api/rate-limit.ts`, `deploy/nginx/*`, `.devops/templates/*`, `spec/changes/2026-10-09-change-UI.md`.
- **Không có blast radius runtime.**

## Verify commands + result
- `git show ce21c58` → **Blocked** — shell bị permission deny (không retry theo Tool Loop Guard).
  Bù lại, xác minh trạng thái đĩa + artifact:
  - `src/app/api/contact/route.ts:37` = `// nginx (VPS) appends the real client IP rightmost via X-Forwarded-For; rate-limit state is in-memory per instance.` ✅
  - `docs/PERMISSION.md:40` = trỏ env (`.env.local` / GitHub Actions secrets) + `docs/runbook/deploy-vps.md` + `.context/project-config.md` §Secrets ✅
  - `spec/test-scope/current.json` `changed.files` đúng 6 file dự kiến; `specVersion 3.0.0`, `scopeVersion 8` ✅
- `grep -r "gcp-cloud-run|cloud run|asia-southeast1|secret manager|Cloud Run|GFE"` trên `docs/PERMISSION.md` + `src/app/api/contact/route.ts` → **PASS** (0 match).
- `npm run lint` / `npm run typecheck` / `npm run build` → **Blocked** (shell denied). Round-1 ghi PASS: lint 0 error (1 warning pre-existing `<img>` mdx ngoài scope) · typecheck PASS · build PASS. Không tự re-run được.
- `spec/CHANGELOG.md:14` → có dòng reconcile scope v8, **không bump spec_version** (vẫn 3.0.0) ✅

## Responsive Checklist Gate
**N/A** — diff không đụng UI (comment code + doc pointer). Không có route/component/CSS.

## Skill gates
- **aislop:** `skip` — không có config aislop trong repo + shell bị deny (không chạy được `aislop scan`).
- **anti-slop / oxlint:** `skip, oxlint not configured` (không tìm thấy `.oxlintrc.json`/`oxlint.json`/`oxlint.config.*`).
- **open-code-review (ocr):** `skip` — không xác minh được cài đặt (shell denied).
- **AI-readable gate:** **OK** — diff comment/doc, tên rõ nghĩa, không thêm indirection/magic number/comment WHAT mới ngoài mô tả premise; < 3 AI-chaos indicator.
- **ai-friendly-web:** **N/A** — task nội bộ (reconcile comment/doc), không thay đổi web public.
- **blitzstrike:** `skip` — optional, không môi trường pentest được phép.

## Findings

### Comment premise (nginx rightmost) — ĐÚNG
`deploy/nginx/ntavietnam.tech.conf:27` dùng `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`.
`$proxy_add_x_forwarded_for` = XFF vào (nếu có) **+ `$remote_addr` append rightmost**. Với topology hiện tại
(DNS A `ntavietnam.tech` → thẳng VPS `187.52.119.50`, **không CDN/LB**; project-config §Deploy), phần tử
**rightmost = `$remote_addr` = IP client thật**. `getClientIp()` lấy `.at(-1)` → đúng; và vì nginx luôn append
`$remote_addr` ở cuối nên **client tự gửi XFF giả cũng không spoof được** IP rate-limit (giá trị giả nằm bên trái).
→ Comment mới mô tả **đúng**.

- **[MINOR] (non-blocking)** `src/app/api/contact/route.ts:37` — comment đúng cho single-proxy edge hiện tại, nhưng nếu tương lai chèn CDN/LB trước nginx thì rightmost = IP proxy → mọi client chung 1 bucket rate-limit. Không cần sửa bây giờ (topology chưa đổi); đề xuất ghi note vào runbook khi đổi hạ tầng.

### Pointer secrets (PERMISSION.md:40) — ĐÚNG
- `.context/project-config.md` §Secrets: `source: env`, `required: [CONTACT_FORM_TARGET]` → khớp câu "Secret … để ở env server".
- `docs/runbook/deploy-vps.md:62` xác nhận "Secret repo (GitHub → Settings → Secrets and variables → Actions): `CONTACT_FORM_TARGET`" → khớp "GitHub Actions secrets khi CI".
- `.env.local` khi dev: khớp §Secrets (`giá trị → .env.local khi chốt`).
- `docs/runbook/deploy-vps.md` tồn tại; `.context/project-config.md` §Secrets tồn tại. → Pointer **đúng, không hồi quy**.

### CRITICAL
- 0

### MAJOR
- 0

### MINOR
1. `src/app/api/contact/route.ts:37` — comment đúng cho topology hiện tại; residual nếu thêm CDN/LB (xem trên). Non-blocking.
2. (từ round 1) Round-1 là inline self-review → round 2 này (độc lập) khắc phục. Đóng.

### Residual risk (không kiểm chứng được qua tool)
- `git show ce21c58` chưa chạy được (shell denied) → không tự diff commit vs parent. Xác minh thay thế: trạng thái đĩa khớp mô tả + round-1 `git diff` chỉ 2 dòng + `spec/test-scope.changed.files` khớp scope. Rủi ro: thấp.
- `npm run lint/typecheck/build` chưa re-run được (shell denied) — dựa evidence round 1.

## Verdict
✅ **PASS** (STRICT) — 0 CRITICAL/MAJOR. Change đúng scope comment-only + 1 doc pointer, **0 logic change**, comment premise + pointer secrets đều chính xác. `spec/changes/2026-10-09-change-UI.md` vẫn `status: pending` (nguyên vẹn).

**Residual:** cần re-run `git show ce21c58` + `npm run lint/typecheck` khi shell được cấp quyền (primary) để đóng 2 điểm Blocked.
