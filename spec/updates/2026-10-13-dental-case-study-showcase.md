# Spec Update — 2026-10-13 dental-case-study-showcase

**spec_version:** 3.2.0 → 3.2.1 (PATCH)
**Trigger:** feature-update
**Change:** `spec/changes/archive/2026-10-13-dental-case-study-showcase.md` (CR-002)

## Requirements
- **SỬA R-08b (thêm R-08b.1)** — field optional cho biến thể showcase, tương thích ngược:
  `technology.screen`, `technology.nodes` dạng `{ label, icon }`, `photos.variant: screen`, `hero.image.width/height` optional,
  icon `modules`, `hero.primaryCta.href` nhận route nội bộ.
- Áp dụng `dental-clinic-operations` (vi/en): nút hero + nút khối Giải pháp → `/solutions/enterprise/dentgo`.

## Ảnh hưởng
- `/case-studies/dental-clinic-operations` (+ `/en`): toàn bố cục showcase.
- `/case-studies/oc-eo-learning`: regression — không đổi.
- Thẻ case study ở danh sách: ảnh `cover` mới của case nha khoa.
