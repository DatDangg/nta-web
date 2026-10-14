# Backlog nội dung — NTA Website

> Ghi nhận 2026-10-11 sau khi duyệt ảnh T1. **KHÔNG làm bây giờ** — chờ user chốt thứ tự.
> Mỗi mục nên thành 1 change request riêng khi được xử lý.

## 1. Placeholder còn sót trên web

| # | Vị trí | Hiện trạng | Cần làm |
|---|---|---|---|
| 1.1 | Footer · cột "Liên hệ" | `Hotline: Đang cập nhật` · `Email: Đang cập nhật` | Thay bằng thông tin thật của NTA (hotline, email, địa chỉ) |
| 1.2 | Trang `/contact` | Các ô hotline/email/địa chỉ/giờ làm việc còn placeholder | Bổ sung số liệu thật |
| 1.3 | Trang `/contact` | Ô bản đồ trống | Nhúng Google Maps (chi nhánh thật) hoặc ẩn hẳn nếu chưa có địa chỉ |
| 1.4 | Trang chủ · hero | Ảnh minh hoạ là SVG placeholder (`/images/solutions/enterprise.svg`) | Thay bằng ảnh thật hoặc ảnh sản phẩm đã chụp |
| 1.5 | Trang `/about` | Ảnh đội ngũ / đối tác là placeholder | Cung cấp ảnh thật hoặc giữ placeholder có chú thích "minh hoạ" |
| 1.6 | Case study · "Hình ảnh dự án" | Ảnh placeholder "Quản lý tài liệu dạng tệp" | Cung cấp ảnh dự án thật (nếu được phép) hoặc bỏ gallery |

## 2. Nội dung trùng lặp

| # | Vị trí | Vấn đề |
|---|---|---|
| 2.1 | Case study (`heritage-site-ai-camera`) | Đoạn mô tả ở đầu trang (`PageHeader.description`) **trùng nguyên văn** với đoạn "Kết quả" (`ResultBlock`). Đọc lại như thể lặp 2 lần. → Rút gọn 1 trong 2, hoặc viết "Kết quả" là số liệu cụ thể hơn (tiến độ, mốc bàn giao) thay vì lặp lại mô tả. |

## 3. Dư lặp trong footer

| # | Vị trí | Vấn đề |
|---|---|---|
| 3.1 | Footer | Dải CTA "Trao đổi cùng đội ngũ NTA…" có nút **"Liên hệ tư vấn"**, ngay dưới đó lại có nút **"Liên hệ tư vấn"** ở dải copyright. Hai nút trùng label, cách nhau ~1 dòng. → Bỏ một trong hai, hoặc đổi nút thứ hai thành link pháp lý / kênh khác. |

## 4. Lỗi kỹ thuật nhỏ đã ghi nhận

| # | Vấn đề | Trạng thái |
|---|---|---|
| 4.1 | `favicon.ico` trả **404** — repo không có `src/app/favicon.ico` lẫn `public/favicon.ico` | **Chưa sửa.** Ghi log console mỗi lần tải trang. Cần tạo icon NTA (nếu có logo) hoặc icon tối giản. |
| 4.2 | Ảnh v2 trong `public/images/solutions/v2/` chưa gắn vào web | `.mdx` vẫn trỏ ảnh cũ. Sẽ xử lý ở T4/T5 của change `solution-detail-redesign`. |

---

## Ghi chú quy trình

- Mục 1.1–1.3, 1.6 cần **user cung cấp dữ liệu thật** → không tự bịa số điện thoại/email/địa chỉ.
- Mục 1.4, 1.5 có thể dùng ảnh trong `public/images/solutions/v2/` hoặc chụp mới.
- Mục 2, 3 là sửa **copy/nội dung** → intent docs, cần user duyệt chữ.
- Mục 4.1 là bug kỹ thuật thuần → có thể gộp vào task kỹ thuật tới.

> Mỗi khi xử lý 1 mục: mở change request riêng theo `/change`, không trộn vào task đang chạy.