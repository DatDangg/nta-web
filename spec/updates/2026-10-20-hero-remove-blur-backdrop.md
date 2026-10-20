# Spec Update — 2026-10-20 hero-remove-blur-backdrop

**spec_version:** 4.9.0 → 4.10.0 (MINOR)
**Trigger:** feature-update (CR-042, REMOVE, UI-only, risk low; gỡ hành vi CR-041)
**Requirements:** SỬA **R-01b** — bỏ nền mờ full-bleed (bản sao ảnh hero blur + phủ trắng) và mask/fade rộng hai cạnh stage đã thêm ở CR-041 (4.9.0).
Hero desktop quay lại đúng hành vi CR-040 (4.8.0): khi viewport > 1440, ngoài stage 1440 là nền trắng, mép phải stage fade trắng `w-24`.
Không đổi: khung chữ `Container` 1280, chiều cao ≤ 662px, ≤ 1440, mobile/tablet (< 1024), R-01/R-02a/R-03a/R-03b.
**Ảnh hưởng:** `/` và `/en` ở > 1440 (kiểm 1920/2560/3840); ≤ 1440 + mobile so ảnh không đổi.
**Hiệu lực:** khi phase 1 task 01 PASS.
