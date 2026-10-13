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

## Quyết định (2026-10-13, /change)
- **Màn HRM:** user giao agent tự chọn → chốt 4 màn: `10-tuyen-dung` (pipeline ứng viên) · `11-hop-dong-lao-dong` (sắp hết hạn/gia hạn) ·
  `12-danh-gia-kpi` · `13-bao-cao-bien-dong`. Bỏ "đào tạo" (ít khác biệt, tránh dàn trải).
- **Staging:** agent KHÔNG nhập mật khẩu. Agent mở link trong browser pane → **user tự đăng nhập** → agent thay dữ liệu bằng DOM phía client + chụp (read-only, không thao tác ghi).
- Link đang dùng trong MDX (chờ user xác nhận là staging): CRM `https://cms.dragonhotpotvietnam.com/` · DentGo `http://demo1.76.13.214.188.sslip.io:8080/` · LMS `http://187.52.119.50:3002/`.
