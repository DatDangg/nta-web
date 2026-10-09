---
id: domain-ntavietnam
type: feature
status: done
created: 2026-10-09
completed: 2026-10-09
---

# Change Request — Đổi domain đích sang `ntavietnam.tech` (đồng bộ spec/intent docs)

## Yêu cầu

Chuyển domain sản phẩm từ `ntasolution.vn` (và subdomain cũ `landing.ntasolution.vn`) sang **`ntavietnam.tech`**.

Phạm vi change này = **đồng bộ spec + intent docs cho khớp domain mới** (phần code/config đã làm và deploy xong ở commit `4d8120d`, `00f2560` — coi là đã có, không làm lại).

Cần cập nhật (những chỗ còn ghi domain cũ):

- `SPECIFICATIONS.md` — dòng domain (mục "Domain: …"), Base URL API prod, và R-27 (domain).
- `BRIEF.md` — dòng domain đã chốt + mục Deploy.
- `docs/BRD.md` — dòng domain Cloud Run + Domain chính thức.
- `docs/API_SPEC.md` — Production base URL (đã sửa ở commit `4d8120d`, xác nhận lại).
- `docs/specs/2026-10-08-nta-website-design.md` — dòng domain (nếu agent thấy phù hợp).

## Bối cảnh

- Canonical chốt: **`https://ntavietnam.tech`** — HTTPS, **apex** (không `www`), thay hoàn toàn (không chạy song song).
- Domain **đã live** (2026-10-09): DNS A → `187.52.119.50`, nginx vhost + certbot Let's Encrypt (hạn 2027-01-07), http→https 301.
- Container prod đã rebuild với `NEXT_PUBLIC_SITE_URL=https://ntavietnam.tech`; verify ngoài: `/`, `/api/health`, `/llms.txt`, `/robots.txt`, `/sitemap.xml`, `/en`, `/solutions/ai` = 200; canonical/robots/sitemap/llms.txt đúng domain mới.
- Đây là gap "domain drift": spec/intent docs vẫn ghi `ntasolution.vn` sau lần đổi domain trước (commit `28527cb`, `4d8120d`).

## Acceptance (bắt buộc)

- [x] `SPECIFICATIONS.md` không còn `ntasolution.vn` (domain + Base URL API prod + R-27 khớp `ntavietnam.tech`).
- [x] `BRIEF.md` và `docs/BRD.md` không còn ghi domain đích `ntasolution.vn`.
- [x] `docs/API_SPEC.md` Production = `https://ntavietnam.tech/api` (đồng bộ với deploy thực tế).
- [x] Không đổi behavior/code app ngoài phần đã deploy; không đổi intent ngoài domain.
- [x] Spec Publisher: bump `spec_version` (1.1.0 → **2.0.0**) + `spec/updates/2026-10-09-domain-ntavietnam.md` + `spec/test-scope/current.json` (scopeVersion 5 → **6**).
- [x] Verify: `npm run lint` / `typecheck` / `build` PASS (không hồi quy).

## Resolution

- **Status:** done · **Classification:** MODIFY · **Risk:** LOW · **spec_version 2.0.0** · **scopeVersion 6**
- **Files đổi:** `SPECIFICATIONS.md`, `BRIEF.md`, `docs/BRD.md`, `docs/specs/2026-10-08-nta-website-design.md`,
  `.context/compressed-summary.md`, `spec/updates/2026-10-09-domain-ntavietnam.md`, `spec/CHANGELOG.md`,
  `spec/test-scope/current.json`; task `tasks/change-domain-ntavietnam/phase-1-task-01.md`.
  (`docs/API_SPEC.md` xác nhận đã đúng — không sửa.)
- **Verify:** lint/typecheck/build = PASS; grep domain cũ trong target docs = 0; spec-validator = PASS (inline).
- **Residual (ngoài scope):** deploy platform drift Cloud Run(docs) → docker-vps(thực tế) — cần change riêng.

## Ghi chú

- Classification dự kiến: **MODIFY** (đổi domain/canonical contract). Risk thấp (không auth/schema/data).
- Đây là hậu-build config/doc reconcile; KHÔNG phải feature UI.
- **Chỉ xử lý change file này** — `spec/changes/2026-10-09-change-UI.md` (motion UI) để **pending nguyên**, không gộp.
