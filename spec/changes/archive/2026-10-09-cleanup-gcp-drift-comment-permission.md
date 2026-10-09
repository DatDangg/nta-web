---
id: cleanup-gcp-drift-comment-permission
type: feature
status: done
created: 2026-10-09
completed: 2026-10-09
---

# Change Request — Dọn nốt drift GCP còn sót (PERMISSION.md pointer + comment rate-limit)

## Yêu cầu

Dọn 2 chỗ còn sót tham chiếu nền tảng cũ (GCP/Cloud Run) sau các change `domain-ntavietnam` + `deploy-platform-docker-vps`:

1. **`docs/PERMISSION.md:40`** — đang ghi:
   `- Secret (token mail/API) để ở Secret Manager / env server — xem .devops/templates/gcp-cloud-run.md mục 4.`
   → Sai nền tảng: thực tế secrets qua env server (`.env.local` / GitHub Actions secrets), deploy VPS. Trỏ lại `docs/runbook/deploy-vps.md` + `.context/project-config.md` §Secrets. **Bỏ tham chiếu Secret Manager + template `gcp-cloud-run.md`.**

2. **`src/app/api/contact/route.ts:37`** — comment trong `getClientIp()`:
   `// Cloud Run/GFE appends the trusted client IP rightmost; rate-limit state is in-memory per instance.`
   → Thực tế reverse proxy là **nginx** trên VPS (`deploy/nginx/ntavietnam.tech.conf` dùng `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`). Sửa comment mô tả đúng: nginx append IP client thật ở **cuối** (rightmost) → logic lấy rightmost + validate hiện tại vẫn đúng. **KHÔNG đổi dòng code / behavior**, chỉ sửa comment.

## Bối cảnh

- Sau change `deploy-platform-docker-vps` (spec 3.0.0), drift GCP còn sót 2 chỗ trên (spec-validator độc lập ghi nhận MINOR-2 + MINOR-1).
- Xác nhận nginx: `deploy/nginx/ntavietnam.tech.conf` set `X-Forwarded-For $proxy_add_x_forwarded_for` → rightmost = client thật (single proxy) → logic rate-limit rightmost vẫn đúng.

## Acceptance (bắt buộc)

- [ ] `docs/PERMISSION.md` không còn `gcp-cloud-run.md` / "Secret Manager"; trỏ đúng deploy VPS + secrets qua env.
- [ ] `src/app/api/contact/route.ts` comment mô tả đúng nginx/VPS (không còn "Cloud Run/GFE"); **không đổi logic code** (`getClientIp` giữ nguyên hành vi).
- [ ] `grep -ri "gcp-cloud-run\|cloud run\|asia-southeast1" docs/PERMISSION.md src/app/api/contact/route.ts` = 0.
- [ ] Verify `npm run lint` / `typecheck` / `build` PASS (không hồi quy).
- [ ] Spec Publisher: ghi `spec/updates/` + `spec/CHANGELOG.md` + `spec/test-scope/current.json`; **KHÔNG bump `spec_version`** (không đổi requirement/behavior — chỉ reconcile comment/pointer; nêu rõ lý do trong report).
- [ ] Reviewer độc lập (comment nằm trong module rate-limit bảo mật → cân nhắc STRICT).

## Ghi chú

- Classification: **MODIFY** (cleanup/drift reconcile), risk LOW.
- KHÔNG sửa domain/platform khác; KHÔNG đụng lịch sử.
- **Chỉ xử lý change file này** — `spec/changes/2026-10-09-change-UI.md` để **pending nguyên**.
