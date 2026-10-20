---
id: hero-remove-blur-backdrop
type: feature
status: done
created: 2026-10-20
---

# Hero trang chủ: bỏ nền mờ full-bleed của CR-041, quay lại bố cục CR-040

## Yêu cầu
User (2026-10-20): "bỏ tiếp thay đổi mà blur đi" — bỏ nền mờ (blur) full-bleed sau stage 1440 + mask hai cạnh ảnh đã thêm ở CR-041.
Phân loại: REMOVE (gỡ hành vi CR-041), hero quay về đúng as-built CR-040.

## Bối cảnh
- Màn/route: `/` và `/en`, desktop > 1440 (≤ 1440 và mobile vốn không đổi ở CR-041).
- Code: `src/components/home/HeroVisual.tsx` — trả về bản CR-040 (`224f4b5`); chỉ commit `cd37ff0` (CR-041) sửa file này sau CR-040.

## Acceptance (bắt buộc)
- [x] > 1440: không còn nền mờ (`blur-2xl`) và mask hai cạnh; ngoài stage 1440 là nền trắng, mép phải stage fade trắng `w-24` như CR-040.
- [x] ≤ 1440 và mobile/tablet y như hiện tại.
- [x] Spec R-01b + `docs/DESIGN.md` as-built khớp code (bỏ mô tả CR-041).
- [x] typecheck + lint PASS.

## Ghi chú
- Revert bằng commit mới (không rewrite history).
- Phiên này user đã thử và bỏ hướng "ảnh mới full-bleed cover" + "ảnh mở rộng mirror/blur" — không làm.
