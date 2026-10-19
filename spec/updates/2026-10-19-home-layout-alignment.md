# Spec Update — 2026-10-19 home-layout-alignment

**spec_version:** 4.7.0 → 4.8.0 (MINOR)
**Trigger:** feature-update (CR-040, MODIFY, UI-only)
**Requirements:** THÊM **R-01b** — trang chủ dùng chung 1 khung nội dung `Container` 1280 cho Header/Hero/Giải pháp/Sản phẩm/Case study/CTA/Footer
(mép trái/phải thẳng hàng, sai số ≤ 2px); hero desktop nằm trong stage ≤ 1440px căn giữa, cao ≤ 662px, fade mép phải khi viewport > 1440.
Không đổi nội dung/hành vi R-01, R-02a, R-03a, R-03b; mobile/tablet (< 1024) không đổi.
**Design spec:** `.context/design-spec.md` Screen 1 — thêm rule "Khung chung (CR-040)" + bảng responsive xl/2xl.
**Ảnh hưởng:** `/` và `/en` ở 1024–2560px; test đo mép (getBoundingClientRect) từng section ở 1280/1440/1920; ảnh chụp 375/768/1024.
**Hiệu lực:** khi phase 1 (task 01–02) PASS.
