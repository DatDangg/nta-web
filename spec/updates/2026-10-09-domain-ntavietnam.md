# Spec Update — 2026-10-09 domain-ntavietnam

**spec_version:** 1.1.0 → 2.0.0 (**MAJOR — đổi ngữ nghĩa requirement**)
**Trigger:** feature-update
**Change:** `spec/changes/archive/2026-10-09-domain-ntavietnam.md` (MODIFY, risk LOW)

## Requirements

- **SỬA R-27 (domain đích):** domain sản phẩm đổi từ `ntasolution.vn` → **`ntavietnam.tech`**
  (canonical `https://ntavietnam.tech`, HTTPS, **apex** không `www`, thay hoàn toàn — không chạy song song).
  Domain đã live 2026-10-09 (DNS A → `187.52.119.50`, nginx vhost + certbot Let's Encrypt hạn 2027-01-07,
  http→https 301).
- **SỬA Overview domain** (`SPECIFICATIONS.md:23`) — cùng domain mới.
- **SỬA API prod Base URL** (`SPECIFICATIONS.md:146`) — `https://ntasolution.vn/api` → `https://ntavietnam.tech/api`.
  Khớp `docs/API_SPEC.md:19` (đã đúng ở commit `4d8120d`).
- KHÔNG thêm/xoá requirement; KHÔNG đổi R-01…R-26.

**Lý do bump MAJOR (không phải PATCH/MINOR):** domain là **canonical contract** (canonical tag, sitemap,
`llms.txt`, `robots.txt`, API base URL) mà consumer/test phụ thuộc. Đổi giá trị domain = **đổi ngữ nghĩa
requirement R-27** + contract quan sát được → theo `docs/SPEC_VERSIONING.md`: "MAJOR — đổi ngữ nghĩa requirement".
(Không phải "làm rõ wording" như PATCH, không phải "thêm requirement" như MINOR.)

## Ảnh hưởng

- **Module:** toàn site (SEO/canonical/i18n/API base) — nhưng **0 dòng code thay đổi trong change này**
  (code/config đã đổi + deploy ở commit `4d8120d`, `00f2560`).
- **Intent docs reconcile:** `SPECIFICATIONS.md`, `BRIEF.md`, `docs/BRD.md`, `docs/specs/2026-10-08-nta-website-design.md`.
- **As-built doc:** `docs/API_SPEC.md:19` — xác nhận đã đúng (`https://ntavietnam.tech/api`).
- **Test:** retest canonical/sitemap/robots/llms.txt + API base URL + redirect http→https theo domain mới
  trên toàn route (đặc biệt `/`, `/en`, `/api/health`).

## Ghi nhận ngoài phạm vi (không xử lý ở change này)

- ⚠️ `BRIEF.md`/`docs/BRD.md`/`SPECIFICATIONS.md R-27` vẫn ghi "Deploy Google Cloud Run" trong khi thực tế
  đã chuyển sang **docker-vps** (`.context/project-config.md:51,58`) — drift **ngoài phạm vi domain**,
  cần change riêng để reconcile (không hạ cấp/đổi ở đây).

**Test scope:** `spec/test-scope/current.json` → `trigger: feature-update`, `scopeVersion` 5 → 6, `risk: low`.
