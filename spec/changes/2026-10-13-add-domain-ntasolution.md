---
id: add-domain-ntasolution
type: feature
status: in_progress
created: 2026-10-13
---

# Thêm domain `ntasolution.vn` song song (giữ nguyên `ntavietnam.tech`)

## Yêu cầu
- Thêm **`http://ntasolution.vn`** (kèm `www`) làm domain phụ, truy cập **cùng nội dung** site.
- **KHÔNG thay domain hiện tại**: `ntavietnam.tech` vẫn là domain chính/canonical
  (`NEXT_PUBLIC_SITE_URL=https://ntavietnam.tech`, seo/robots/sitemap/llms.txt không đổi).
- User xác nhận: *"vào cái nào cũng được"* → cả 2 domain đều mở ra site, **không redirect** sang domain kia.

## Bối cảnh / kiểm tra hiện trạng (13/10/2026)
- **DNS đã trỏ sẵn:**
  - `ntasolution.vn` A → `187.52.119.50`
  - `www.ntasolution.vn` CNAME → `ntasolution.vn`
  - (`ntavietnam.tech` A → `187.52.119.50` — cùng VPS)
- **Hiện tại chưa hoạt động:**
  - `http://ntasolution.vn/` và `http://www.ntasolution.vn/` → trang mặc định nginx (200, 615B index.html) — rơi vào default server block.
  - `https://ntasolution.vn/` → lỗi cert (`SEC_E_WRONG_PRINCIPAL` — SNI trả cert của `ntavietnam.tech`, chưa có cert cho domain mới).
- Vhost hiện có: `deploy/nginx/ntavietnam.tech.conf` (proxy → `127.0.0.1:3005`).
- Model deploy: docker-vps — VPS `187.52.119.50` (shared, có nginx + certbot), container `nta-web`.

## Acceptance (bắt buộc)
- [ ] nginx vhost mới cho `ntasolution.vn` proxy tới app (cùng app, cùng nội dung)
- [ ] `www.ntasolution.vn` → 301 về apex `ntasolution.vn` (tránh 3 canonical)
- [ ] HTTPS hoạt động cho apex + www (certbot Let's Encrypt); `http://` → 301 `https://`
- [ ] `https://ntasolution.vn/` và `https://ntasolution.vn/en` trả nội dung site (200)
- [ ] Canonical/trang trả về vẫn `https://ntavietnam.tech` — **không** đổi `NEXT_PUBLIC_SITE_URL`
- [ ] `https://ntavietnam.tech/` không đổi hành vi (200, HTTPS, cert còn hạn)
- [ ] KHÔNG sửa `.github/workflows/deploy.yml`, `src/lib/seo.ts`, `public/llms.txt`, sitemap, robots
- [ ] Cập nhật `docs/runbook/deploy-vps.md` + `.context/project-config.md` (ghi domain phụ)

## Ghi chú
- Triển khai cần **SSH lên VPS** (cùng flow đã làm với `ntavietnam.tech` 09/10/2026: copy vhost → certbot --nginx → reload) — chờ user duyệt SSH trước khi chạy.
- SEO: 1 canonical (`ntavietnam.tech`) để tránh duplicate content; domain mới chỉ là "lối vào" thứ hai.
- Rủi ro thấp (infra/config, không đụng code app) — nhưng đổi nginx VPS shared → cần `nginx -t` trước khi reload.

## Plan (agent `change-request`, 2026-10-13)

- **Classification:** ADDITIVE (infra/nginx) · Risk **LOW–MEDIUM** (nginx VPS shared; app code không đổi).
- **Spec delta:** **CÓ bump** `spec_version` 3.4.0 → **3.5.0 (MINOR)** — mở rộng **R-27** (thêm domain phụ đang
  phục vụ). Canonical/SEO contract **không đổi** ⇒ không MAJOR. Ghi `spec/updates/2026-10-13-add-domain-ntasolution.md`
  + `spec/CHANGELOG.md` + `spec/test-scope/current.json` (**scopeVersion 27**).
- **Spec Validator (pre-plan):** PASS (inline — `.context/review-reports/feature-add-domain-ntasolution-spec-validation.md`).
- **Tasks:**
  1. `tasks/change-add-domain-ntasolution/phase-1-task-01.md` — repo-side: `deploy/nginx/ntasolution.vn.conf` +
     `docs/runbook/deploy-vps.md` §3b + `.context/project-config.md` (`domain_secondary`) + spec 3.5.0.
  2. `tasks/change-add-domain-ntasolution/phase-1-task-02.md` — apply VPS (SSH) theo runbook §3b + verify ngoài
     (redirect matrix / canonical / regression `ntavietnam.tech`). **⛔ Chặn bởi duyệt SSH của user.**
- **⏸ Human checkpoint:** DỪNG chờ user duyệt **plan** + cấp phép **SSH** lên VPS trước khi chạy task-02.
- **Commit hygiene:** commit của change này phải dùng **explicit file list** — KHÔNG gộp file của CR-004
  (`shared-detail-showcase-template`, đang in_progress) hay app code.
- **Ngoài phạm vi (giữ nguyên):** `NEXT_PUBLIC_SITE_URL`, `src/lib/seo.ts`, `public/llms.txt`, sitemap, robots,
  `.github/workflows/deploy.yml`, `docker-compose.yml`, vhost/cert của `ntavietnam.tech`.
