---
id: header-solutions-megamenu
type: feature
status: done
created: 2026-10-13
---

# Header: đổi dropdown "Giải pháp" thành mega menu 2 cột theo mockup

## Yêu cầu
User (chat 13/10/2026, kèm ảnh mẫu `assets/2026-10-13-header-solutions-megamenu/mockup.png`): sửa dropdown
"Giải pháp" ở header desktop thành như ảnh. Hiện tại là list 2 link đơn giản (`components/layout/Header.tsx`).

Mockup:
- Panel trắng bo góc, đổ bóng, mở dưới mục "Giải pháp" (mục có gạch chân primary khi mở).
- **Cột trái**: 2 nhóm — "Giải pháp doanh nghiệp" (icon toà nhà, phụ đề "Tối ưu vận hành, nâng cao hiệu suất")
  và "Giải pháp AI" (icon chip AI, phụ đề "Khai thác sức mạnh AI tạo ra giá trị"); mỗi dòng có mũi tên `>`,
  dòng đang chọn nền primary nhạt.
- **Cột phải** (ngăn cách bằng đường kẻ dọc): tiêu đề + mô tả của nhóm đang chọn, rồi danh sách mục con
  (icon trong ô vuông nền primary nhạt + tên + mô tả ngắn).
- User chốt (chat 13/10/2026): **chỉ lấy dạng/bố cục theo mockup**; danh sách mục con ở cột phải lấy từ
  **dữ liệu thực tế** — các giải pháp trong `src/content/solutions/<locale>/*.mdx` theo `category`
  (enterprise: CRM, HRM, LMS, DentGo · ai: BoxAI, Talvra, Flycam), link tới trang chi tiết `/solutions/<category>/<slug>`.
  3 mục trong ảnh (Quản trị doanh nghiệp, Giám sát…, Báo cáo…) chỉ là nội dung minh hoạ, KHÔNG dùng.

## Acceptance
- [x] Desktop: dropdown "Giải pháp" hiển thị mega menu 2 cột đúng bố cục mockup (vi + en).
- [x] Cột phải liệt kê đúng các giải pháp thật của nhóm (từ content), mỗi mục link tới trang chi tiết.
- [x] Hover/focus nhóm ở cột trái → cột phải đổi nội dung theo nhóm; click nhóm → trang listing nhóm đó.
- [x] Giữ hành vi hiện có: mở bằng hover/click, đóng khi click ngoài / Esc / đổi trang, ArrowDown vào menu, aria đúng.
- [x] Mobile nav (`MobileNav.tsx`) không vỡ.
- [x] typecheck / lint / build PASS.

## Đã chốt
- Mục con cột phải = giải pháp thật theo category (đọc từ content, tự cập nhật khi thêm/bớt mdx), cả vi + en.
- Mô tả ngắn mục con: rút gọn từ `description` của mdx (hoặc thêm field ngắn nếu description quá dài) — quyết khi build.

## Ghi chú
- Dự kiến class: MODIFY (UI header) + có thể ADDITIVE (nội dung/i18n mục con).
- Kết quả: MODIFY (UI), no spec delta (R-11 không đổi) — giống CR-009. Task `tasks/feature-header-solutions-megamenu/phase-1-task-01.md`.
