# Spec Update — 2026-10-20 hero-left-background

**spec_version:** 4.10.0 → 4.11.0 (MINOR)
**Trigger:** feature-update (CR-043, MODIFY, UI-only, risk low–medium; thay hành vi hero desktop CR-040/042)
**Requirements:** SỬA **R-01b** — hero desktop (`lg+`) dùng ảnh nền mới `public/images/home/hero-bg.webp` (1916×821) phủ **full-bleed** (cover);
nửa trái thấy thành phố/cửa kính/cây phía sau chữ với lớp phủ trắng nhẹ (thay phủ trắng gần đặc bên trái + stage 1440 của CR-040/042).
Panel kính vẫn động, căn lại khớp ảnh mới. Khung ảnh tối đa 2048px: viewport > 2048 ảnh căn giữa (không phóng to), hai cạnh mờ dần sang trắng (không blur).
Mobile/tablet (< 1024) dùng cùng ảnh, crop vào robot.
Không đổi: khung chữ `Container` 1280, R-01/R-02a/R-03a/R-03b, LCP ảnh hero priority (R-22).
**Ảnh hưởng:** `/` và `/en` — hero desktop (1100/1440/1920/2560) và hero mobile (375/768).
**Hiệu lực:** khi phase 1 task 01 PASS.
