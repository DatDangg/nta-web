# Spec Update — 2026-10-13 shared-detail-showcase-template

**spec_version:** 3.2.1 → 3.3.0 (MINOR)
**Trigger:** feature-update
**Change:** `spec/changes/2026-10-13-shared-detail-showcase-template.md` (CR-004)

## Requirements
- **THÊM R-08c** — khung chi tiết dùng chung cho case study showcase, trang giải pháp enterprise/AI và trang sản phẩm `/products/[slug]`; block Lưới tính năng + FAQ optional; vision ẩn quote khi thiếu trích dẫn thật.

## Phạm vi thực hiện theo layer
- Layer 0 (đã làm): khung `ShowcaseLayout` + block `ShowcaseFeatures` / `ShowcaseFaq` (optional) + `vision.quote` optional. Óc Eo và nha khoa render không đổi (đã kiểm HTML build: không có block mới, quote vẫn có).
- Layer 1–4 (chưa làm): data MDX (solutions/products, VI+EN) · routes enterprise/AI/products dùng khung chung · ảnh (staging CRM/DentGo/LMS đã thay dữ liệu giả, HRM dựng màn, ảnh minh hoạ) · close-out.

## Ảnh hưởng
- `/case-studies/*`: không đổi ở layer 0 (regression đã kiểm).
- Layer 2 sẽ thay bố cục `/solutions/enterprise/[slug]` và `/solutions/ai/[slug]` (bỏ SolutionHero/FeatureZigZag/layout LMS riêng cho trang chi tiết) — xem plan trong change doc.
