---
id: hero-wide-screen-backdrop
type: feature
status: done
completed: 2026-10-19
created: 2026-10-19
---

# Hero trang chủ: bỏ dải trắng hai bên trên màn rất rộng (follow-up CR-040)

## Yêu cầu
User (2026-10-19, kèm 2 ảnh chụp sau CR-040, bản en): "ừ thì đã hết thò ra thụt vào, nhưng trông trắng trắng".
Sau CR-040, ảnh hero nằm trong stage tối đa 1440px căn giữa. Màn rộng hơn 1440 → ngoài stage là nền trắng trơn, nên hero trông như một ô ảnh nhỏ giữa vùng trắng:
- Ảnh 1 (~1900px): mép phải ảnh kết thúc ~x1660, bên phải và bên trái chữ là trắng.
- Ảnh 2 (màn rất rộng / zoom nhỏ): hero thu thành dải ảnh hẹp ở giữa, hai bên trắng toàn bộ, mép phải ảnh gần như cắt cứng; trong khi dải chữ chạy (marquee) ngay dưới vẫn tràn full màn → càng lộ.

## Bối cảnh / tái hiện
- Màn/route: `/` và `/en`, desktop ≥ 1441px (rõ nhất ≥ 1920, càng rộng càng nặng).
- Expected: hero lấp đầy bề ngang màn hình (không còn mảng trắng lớn hai bên), chữ vẫn thẳng mép khung 1280 như CR-040, ảnh/panel không bị kéo giãn méo hoặc phóng quá to.
- Actual: ngoài stage 1440 là `bg-white`; fade mép phải stage chỉ `w-24` (`src/components/home/HeroVisual.tsx`) nên ở màn rất rộng thấy như cắt cứng.

## Acceptance (bắt buộc)
- [x] Ở 1920, 2560 và rộng hơn: không còn mảng trắng trơn lớn hai bên hero; hero liền mạch với màn hình (đồng bộ cảm giác full-bleed như dải marquee bên dưới).
- [x] Không có đường cắt cứng ở cạnh stage ảnh.
- [x] Mép trái chữ hero vẫn thẳng với khung 1280 (giữ kết quả CR-040), chữ vẫn dễ đọc.
- [x] Ảnh hero/panel kính không bị méo; không tải ảnh nặng hơn hiện tại đáng kể.
- [x] ≤ 1440 và mobile/tablet giữ nguyên như hiện tại; kiểm tra vi + en.

## Ghi chú
- Hướng đề xuất (chờ chốt khi `/change`):
  - **A (khuyến nghị):** nền "khí quyển" full-bleed phía sau stage — bản sao chính ảnh hero phóng to + blur mạnh + phủ trắng nhẹ (hoặc gradient lấy tông xanh/trắng của ảnh), stage ảnh nét giữ ≤ 1440 và hoà mép hai bên bằng fade rộng (mask) thay vì `w-24`. Hero lấp kín màn mà ảnh chính không phóng to.
  - **B:** cho ảnh hero full-bleed trở lại (cover toàn bề ngang, crop trên/dưới), panel bám theo khung ảnh — đơn giản nhưng ở màn rất rộng ảnh bị crop nhiều và panel phóng to.
- Liên quan: R-01b (CR-040), `src/components/home/HeroVisual.tsx`, `src/components/home/Hero.tsx`.

## Quyết định (2026-10-19)
- User chốt **hướng A** ("a đi") và duyệt luôn plan → auto proceed.
- Classification: **MODIFY** (UI-only, chỉ `lg+` và rõ nhất > 1440), risk **LOW–MEDIUM** (thẩm mỹ + tải ảnh hero).
- Spec delta: R-01b cập nhật (4.8.0 → 4.9.0), scope v59. Task: `tasks/feature-hero-wide-screen-backdrop/phase-1-task-01.md`.

## Kết quả (2026-10-19)
- Done: task 01 (cd37ff0) reviewer NORMAL PASS round 1, spec-validator PASS (`.context/review-reports/feature-hero-wide-screen-backdrop-spec-validation.md`). Spec 4.9.0 / scope v59.
- Ảnh kiểm: `.context/review-reports/cr-041-screens/` (local, không commit).
