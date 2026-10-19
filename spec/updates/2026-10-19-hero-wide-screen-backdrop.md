# Spec Update — 2026-10-19 hero-wide-screen-backdrop

**spec_version:** 4.8.0 → 4.9.0 (MINOR)
**Trigger:** feature-update (CR-041, MODIFY, UI-only, follow-up CR-040)
**Requirements:** SỬA **R-01b** — hero desktop khi viewport > 1440: nền full-bleed sau stage 1440 (bản sao ảnh hero cover + blur mạnh + phủ trắng nhẹ, decorative),
hai cạnh stage hoà vào nền bằng fade rộng (bỏ fade `w-24` mép phải), không còn dải trắng trơn / cạnh cắt cứng; lớp phủ trắng vùng chữ phủ cả nền mờ bên trái.
Không đổi: khung chữ `Container` 1280, chiều cao ≤ 662px, ≤ 1440, mobile/tablet (< 1024), R-01/R-02a/R-03a/R-03b.
**Ảnh hưởng:** `/` và `/en` ở > 1440 (kiểm 1440/1920/2560/3840); ≤ 1440 so ảnh không đổi.
**Hiệu lực:** khi phase 1 task 01 PASS.
