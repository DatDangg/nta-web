---
id: home-layout-alignment
type: feature
status: in_progress
created: 2026-10-19
---

# Trang chủ: căn thẳng hàng các section + cân bố cục trên màn hình lớn

## Yêu cầu
User (2026-10-19, kèm 2 ảnh chụp trang chủ trên màn hình rất rộng ~1900px):
- "Màn hình quá to, nó trông lệch" — trên viewport lớn nội dung dồn giữa, nhỏ, còn ảnh hero bám mép phải → bố cục mất cân đối.
- "So theo hàng dọc thì đang thò ra thụt vào quá" — mép trái/phải của các section (Hero, Giải pháp, Sản phẩm tiêu biểu, Câu chuyện khách hàng, CTA, Footer) không thẳng hàng.

## Bối cảnh / tái hiện
- Màn/route: `/` (vi + en), desktop rộng (≥1440px, rõ nhất ~1900px).
- Actual (theo ảnh): mép trái text Hero ≈ x800, Giải pháp ≈ x785, Sản phẩm ≈ x822, Case study ≈ x800; header/footer lại khác; ảnh hero dính sát mép phải màn hình.
- Phân tích sơ bộ code (chưa phải root cause chốt):
  - `src/components/home/SolutionGridHome.tsx:36` dùng `max-w-[1400px]`.
  - `src/components/home/ProductStrip.tsx:51-52` dùng `max-w-container` + lồng thêm `max-w-[1040px]`.
  - `src/components/home/Hero.tsx:25` + `HeroVisual.tsx:143` (visual `absolute right-0`) — text và ảnh không chung một khung.
  - Các section khác (case study, CTA, footer, header) cần đối chiếu.

## Acceptance (bắt buộc)
- [ ] Mọi section trang chủ + header + footer dùng chung 1 khung nội dung (cùng max-width + padding ngang) → mép trái/phải thẳng hàng theo chiều dọc ở mọi breakpoint.
- [ ] Trên màn hình lớn (1440–1920px+) bố cục cân đối: hero text + visual nằm trong/khớp với khung chung, không bị lệch một bên; nội dung không quá nhỏ so với màn.
- [ ] Không vỡ layout mobile/tablet (375, 768, 1024) và không đổi nội dung/behavior.
- [ ] Kiểm tra cả vi và en.

## Ghi chú
- Chỉ đổi giao diện (layout/spacing), không đổi nội dung → MODIFY nhẹ, chủ yếu design tokens / container.
- Chưa chốt max-width khung chung (vd 1200 hay 1280px) — quyết khi xử lý `/change`, có thể hỏi user.

## Xử lý (change-request, 2026-10-19)
- **Classify:** MODIFY (UI-only) · risk low–medium · spec delta **R-01b** → 4.8.0 · test-scope v58.
- **Root cause đo được (đọc code):** khung chung `Container` = 1280 (token `max-w-container`) đã có; 2 section lệch khỏi nó —
  Giải pháp `max-w-[1400px]` (−60px mỗi bên ở ≥ 1400), Sản phẩm lồng `max-w-[1040px]` (+88px mỗi bên ở ≥ 1280); logo header +8px;
  ảnh hero neo `right-0` của section full-bleed nên ở 1920 kéo dài tới mép màn (panel tới x≈1878, khung nội dung kết thúc x1568).
  Tỉ lệ lệch trong ảnh user (−15/+22) = (−60/+88) × 0,25 → khớp.
- **Plan:** task 01 khung chung (Giải pháp + Sản phẩm → `Container`, logo header) · task 02 hero stage ≤ 1440 căn giữa, cao ≤ 662px.
- **Chờ user chốt:** khung 1280 (khuyến nghị) hay nâng token lên 1440 toàn site.
