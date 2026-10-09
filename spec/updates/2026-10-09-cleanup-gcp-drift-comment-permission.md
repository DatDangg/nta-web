# Spec Update — 2026-10-09 cleanup-gcp-drift-comment-permission

**spec_version:** 3.0.0 → 3.0.0 (**KHÔNG bump — không đổi requirement/behavior**)
**Trigger:** feature-update
**Change:** `spec/changes/archive/2026-10-09-cleanup-gcp-drift-comment-permission.md` (MODIFY, risk LOW)

## Requirements

- **KHÔNG thêm/sửa/xoá requirement nào.** Chỉ reconcile comment trong code + 1 doc pointer còn sót nền tảng cũ.
- **Ảnh hưởng wording (không đổi ngữ nghĩa):**
  - Comment `src/app/api/contact/route.ts:37` trong `getClientIp()` (module rate-limit, R-18):
    "Cloud Run/GFE appends the trusted client IP rightmost" → "**nginx (VPS)** appends the real client IP rightmost via X-Forwarded-For".
  - `docs/PERMISSION.md:40`: bỏ "Secret Manager" + pointer `.devops/templates/gcp-cloud-run.md`;
    trỏ env (`.env.local` / GitHub Actions secrets) + `docs/runbook/deploy-vps.md` + `.context/project-config.md` §Secrets.

**Lý do KHÔNG bump `spec_version`:** không thay đổi requirement/scope/behavior — chỉ sửa comment (không ảnh hưởng logic
`getClientIp` — rightmost + validate IP giữ nguyên) và 1 doc note (pointer secrets). Theo `docs/SPEC_VERSIONING.md`,
PATCH chỉ dành cho "làm rõ requirement"; ở đây requirement R-18/R-27 đã đúng từ change `deploy-platform-docker-vps`
(3.0.0). Vẫn ghi `spec/updates/` + CHANGELOG + test-scope để test loop nắm vùng vừa đụng.

## Ảnh hưởng

- **Module:** rate-limit/contact API (chỉ comment) + permission doc (pointer). **0 dòng code logic.**
- **Premise xác nhận:** `deploy/nginx/ntavietnam.tech.conf` dùng
  `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;` → reverse proxy duy nhất → IP rightmost = client thật;
  logic rate-limit hiện tại (rightmost + `isValidIpAddress`) vẫn đúng, không hồi quy.
- **Ngoài phạm vi (giữ nguyên):** domain `ntavietnam.tech`; `.devops/templates/*` (bộ template khung);
  các bản ghi lịch sử (`.context/review-reports/**`, `.context/runs/**` cũ, `tasks/**` cũ, `spec/updates/**` cũ);
  change `2026-10-09-change-UI.md` để **pending nguyên**.

## Ghi nhận

- Drift còn sót sau change `deploy-platform-docker-vps` (spec-validator độc lập ghi nhận MINOR-2 + MINOR-1).
- Đây là change MODIFY hậu-build cuối dọn nốt drift GCP (comment + pointer). Code/config + runbook VPS đã đúng.
- Verify: `npm run lint` (0 errors; 1 warning pre-existing `<img>` mdx ngoài scope) · `npm run typecheck` PASS ·
  `npm run build` PASS · grep drift trong 2 file = 0.

**Test scope:** `spec/test-scope/current.json` → `trigger: feature-update`, `scopeVersion` 7 → 8, `risk: low`.
