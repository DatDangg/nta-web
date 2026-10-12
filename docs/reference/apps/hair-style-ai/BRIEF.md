# Bot brief — App Kiểu tóc AI (`hair-style-ai`)

Chụp màn hình + lấy thông tin app để làm trang chi tiết trên web. Chỉ ghi vào thư mục này, không sửa code, không commit.

**Đầu vào** (người giao việc điền, trống thì bot tự tìm trên store):
- Link store: _(trống)_
- Source / APK: _(trống)_

## Quy tắc

- App mới lên → lượt tải, rating, review… chưa có thì ghi `chưa có`. **Không bịa.**
- Câu chữ bot tự viết thì thêm `(draft)` ở cuối.
- Không mua gói, không chụp thông tin cá nhân thật.
- **Ảnh mặt demo chỉ dùng ảnh do AI tạo** (người không có thật). Không dùng ảnh người thật lấy trên mạng.

## Chụp ảnh → `screens/`

PNG dọc, rộng ≥ 1080px, cùng 1 máy, giao diện tiếng Việt, không khung, không chèn chữ.

1. `01-welcome.png`: màn chào
2. `02-chon-anh.png`: chọn / chụp ảnh mặt
3. `03-phan-tich.png`: phân tích khuôn mặt
4. `04-kieu-toc.png`: danh sách kiểu tóc
5. `05-ket-qua.png`: kết quả thử tóc
6. `06-cham-diem.png`: chấm điểm / gợi ý
7. `07-premium.png`: gói trả phí (nếu có)

Thêm **2 cặp trước/sau**: `before-01.jpg` + `after-01.jpg`, `before-02.jpg` + `after-02.jpg` (ảnh kết quả lưu từ app).

App không có màn nào thì bỏ qua.

## Thông tin → `info.md`

Điền theo mẫu, mỗi mục 1–3 dòng, cả tiếng Việt + tiếng Anh:

```md
# Kiểu tóc AI

## Cơ bản
- Tên trên store:
- Nền tảng + link tải:
- Giá: (miễn phí / gói nào, bao nhiêu)
- Link Privacy / Terms:

## Mô tả ngắn (1–2 câu)

## Cách dùng (3 bước)

## Tính năng (4–5 cái, mỗi cái: tên + 1 câu + ảnh minh hoạ)

## Riêng app tóc
- Bao nhiêu kiểu tóc, có nam / nữ không:
- Đổi màu tóc được không:
- Ảnh mặt xử lý trên máy hay gửi lên server, có lưu không: (không rõ thì ghi "chưa rõ")

## FAQ (3–4 câu)

## Còn thiếu / cần người trả lời
```
