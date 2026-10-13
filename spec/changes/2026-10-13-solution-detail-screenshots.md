---
id: solution-detail-screenshots
type: feature
status: pending
created: 2026-10-13
---

# Ảnh chụp staging CRM / DentGo / LMS + dựng thêm màn HRM cho trang chi tiết giải pháp

## Yêu cầu
Tách từ CR-004 (`archive/2026-10-13-shared-detail-showcase-template.md`) theo yêu cầu user 13/10/2026, để đóng CR-004.
Bổ sung ảnh cho khung chi tiết dùng chung (block ảnh trượt / công nghệ) ở các trang giải pháp:

- **CRM, DentGo, LMS:** chụp thêm màn từ **staging** (user gửi link + tài khoản demo qua chat — KHÔNG ghi mật khẩu vào repo/change doc).
  - Cả 3 là staging, dữ liệu demo; ảnh dùng trên web vẫn phải **thay toàn bộ thông tin bên trong bằng dữ liệu giả trông như thật**
    (tên người, SĐT, email, địa chỉ, mã hồ sơ, số tiền, tên tổ chức…).
  - Chỉ thay chữ **trên trình duyệt trước khi chụp** (sửa DOM phía client), KHÔNG tạo/sửa/xoá bản ghi nào trên staging.
  - Dữ liệu giả: tên/SĐT/địa chỉ kiểu Việt Nam hợp lý, nhất quán giữa các màn của cùng hệ thống; không dùng tên người/doanh nghiệp có thật.
  - Rà từng ảnh trước khi đưa vào repo: không còn chữ gốc ở tiêu đề tab, avatar, ô tìm kiếm, thông báo, góc màn hình.
  - Đưa thêm ảnh phụ đã có vào block ảnh: CRM `02-khach-hang`, DentGo `02-ho-so-khach-hang`.
- **HRM:** tự dựng thêm màn (mockup, cùng phong cách 9 màn `public/images/solutions/v2/hrm/`) rồi chụp; ảnh ghi chú "minh hoạ".
  Đề xuất (chốt ở checkpoint plan): tuyển dụng (pipeline ứng viên) · hợp đồng lao động (sắp hết hạn / gia hạn) ·
  đánh giá hiệu suất (KPI) · đào tạo · báo cáo biến động nhân sự.
  - Thay email `@ntavietnam.tech` và tên "Công ty NTA" trong ảnh HRM hiện có/ảnh mới bằng tên tổ chức giả
    (cảnh báo trong `docs/reference/hrm-mock/README.md`).

## Bối cảnh / tái hiện (bug)
- Không áp dụng (feature).

## Acceptance (bắt buộc)
- [ ] CRM / DentGo / LMS có ảnh staging mới trong block ảnh, mọi dữ liệu hiển thị là dữ liệu giả; alt/caption ghi "dữ liệu minh hoạ" (BR-004).
- [ ] HRM có thêm các màn đã chốt, alt/caption ghi "minh hoạ"; không còn `@ntavietnam.tech` / "Công ty NTA" trong ảnh HRM.
- [ ] Không có bản ghi nào trên staging bị tạo/sửa/xoá.
- [ ] Data ảnh nằm trong frontmatter MDX (VI + EN); build/typecheck/lint PASS.

## Ghi chú
- Cần từ user khi bắt đầu: link + tài khoản demo CRM / DentGo / LMS (gửi lại qua chat), chốt danh sách màn HRM.
- Câu hỏi còn mở chuyển từ CR-004: demo DentGo/LMS đang `http://` — có bản HTTPS không; user duyệt câu chữ FAQ Talvra (4 câu mới) và câu FAQ thứ 5 của LMS.
- Tham chiếu: R-08c, BR-004.
