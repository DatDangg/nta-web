---
id: remove-bao-ha-anonymize-oc-eo
type: feature
status: done
created: 2026-10-14
---

# Bỏ case study Đền Bảo Hà + ẩn địa danh case study Óc Eo

## Yêu cầu
1. **Trang giải pháp BoxAI** (`/solutions/boxai`): bỏ khối "Triển khai thực tế tại Đền Bảo Hà"
   (thẻ "NTA đã triển khai giải pháp tại Đền Bảo Hà (Lào Cai) với 3 AI Box phân tích 48 camera IP…").
   Hiện có ở `src/content/solutions/{vi,en}/boxai.mdx` (~dòng 66 và ~dòng 175) + tham chiếu case study `ai-box-bao-ha` (~dòng 74).
2. **Bỏ case study Đền Bảo Hà**: `src/content/case-studies/{vi,en}/ai-box-bao-ha.mdx`, entry trong `src/content/listings.ts`
   (~dòng 247, 262), mọi chỗ dẫn link tới case study này.
3. **Case study Óc Eo** (`oc-eo-learning`): bỏ địa danh "Óc Eo – Ba Thê" (và mọi chi tiết định danh), thay bằng
   cách gọi chung "một khu di tích ở Việt Nam" (en: "a heritage site in Vietnam") — gồm title, client, challenge,
   breadcrumb, subtitle, description, alt ảnh, quote, tiêu đề khối ảnh…

## Acceptance (bắt buộc)
- [x] Trang BoxAI (vi + en) không còn khối/nhắc tới Đền Bảo Hà.
- [x] Case study Bảo Hà không còn xuất hiện ở trang danh sách case study, trang chủ, trang giải pháp; không còn link gãy.
- [x] Case study Óc Eo (vi + en) không còn chữ "Óc Eo", "Ba Thê" hay địa danh cụ thể trên trang hiển thị; dùng "một khu di tích ở Việt Nam".
- [x] Build / typecheck / lint PASS.

## Quyết định (user chốt 2026-10-14)
- (a) Route `/case-studies/ai-box-bao-ha` → **404** (không redirect). User muốn **có trang 404** — repo ĐÃ có
  `src/app/[locale]/not-found.tsx` → user chốt **dùng trang 404 có sẵn**, không thiết kế lại (có thể làm sau).
- (b) **Đổi slug** `oc-eo-learning` → `heritage-site-ai-camera` (user OK); slug cũ redirect 301 sang slug mới để không gãy link đã chia sẻ.
- (c) Số liệu định danh (vd "433 ha", "khu di tích quốc gia đặc biệt") **giữ nguyên**, chỉ bỏ tên địa danh.
- Ảnh `/images/cases/bao-ha/*`: mặc định gỡ khỏi repo cùng case study.

- (d) Ảnh dashboard BoxAI (`01-dashboard-quan-tri.jpg`, `02-tasks-channels.jpg`) chụp tại Bảo Hà → **giữ nguyên**.
- (e) Bảng câu thay thế Óc Eo trong task-02 → **duyệt nguyên bảng**.
- (f) Tên file ảnh `oc-eo*` → **đổi sang `heritage-site`**; xoá `oc-eo-learning-overview.svg` mồ côi.
- (g) `docs/BRD.md` (intent doc) → **giữ nguyên**.

## Acceptance bổ sung
- [x] Truy cập `/vi|en/case-studies/ai-box-bao-ha` → trả 404 với trang 404 của site.
- [x] `/vi|en/case-studies/oc-eo-learning` → 301 sang slug mới; sitemap chỉ có slug mới.

## Ghi chú
- Comment code nhắc "Óc Eo" (page.tsx, ShowcaseTechnology.tsx, types.ts) là nội bộ, không hiển thị.

## Kết quả (2026-10-14)
- Commit: bc36b75 (task-01), b0d11d1 (task-02) · spec 4.0.0 (MAJOR) · test-scope v47.
- Lưu ý: `/en/case-studies/ai-box-bao-ha` hiện trả 500 do bug có từ trước (mọi slug en không tồn tại) → CR-026.
