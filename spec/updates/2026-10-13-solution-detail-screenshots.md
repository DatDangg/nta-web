# Spec Update — 2026-10-13 solution-detail-screenshots
**spec_version:** 3.8.0 → 3.8.0 (không bump — reconcile)
**Trigger:** feature-update (CR-007, ADDITIVE nội dung/ảnh)
**Requirements:** KHÔNG đổi requirement. R-08c đã quy định sẵn: carousel ảnh là block của khung chung; ảnh thiếu → ảnh minh hoạ có alt/caption ghi "minh hoạ"; ảnh staging CRM/DentGo/LMS phải thay dữ liệu bên trong bằng dữ liệu giả (BR-004). CR-007 chỉ cấp data/ảnh cho các block đó.
**Thay đổi:**
- HRM `showcase.photos` (vi/en): +4 màn mockup `10-tuyen-dung`, `11-hop-dong-lao-dong`, `12-danh-gia-kpi`, `13-bao-cao-bien-dong` (caption "Giao diện minh hoạ" / "Illustrative interface").
- CRM / DentGo / LMS: thêm carousel `showcase.photos` (vi/en), caption "Dữ liệu minh hoạ" / "Illustrative data":
  CRM `02-khach-hang`, `06-khieu-nai`, `07-thong-bao-zalo` · DentGo `02-ho-so-khach-hang`, `06-bao-cao-tai-chinh`, `07-nhac-lich-cskh` · LMS `09-bao-cao-lien-truong`, `08-so-sanh-lien-truong`, `03-ho-so-hoc-sinh`.
  Ảnh chụp từ app thật, dữ liệu đã thay bằng dữ liệu giả phía client (không ghi lên staging).
- `scripts/screenshots`: khoá ghi (chặn request non-GET) — chỉ là tooling, không ảnh hưởng web.
**Ảnh hưởng:** `/solutions/enterprise/{hrm,crm,dentgo,lms}` (+ `/en`) — block carousel ảnh. Không đổi API/schema/route.
