# Bot brief — App Nhạc AI (`music-app`)

Chụp màn hình + lấy thông tin app để làm trang chi tiết trên web. Chỉ ghi vào thư mục này, không sửa code, không commit.

**Đầu vào** (người giao việc điền, trống thì bot tự tìm trên store):
- Link store: _(trống)_
- Source / APK: _(trống)_

## Quy tắc

- App mới lên → lượt tải, rating, review… chưa có thì ghi `chưa có`. **Không bịa.**
- Câu chữ bot tự viết thì thêm `(draft)` ở cuối.
- Không mua gói, không chụp thông tin cá nhân thật.

## Chụp ảnh → `screens/`

PNG dọc, rộng ≥ 1080px, cùng 1 máy, giao diện tiếng Việt, không khung, không chèn chữ. Màn phải có dữ liệu (tạo sẵn vài bài trước khi chụp).

1. `01-welcome.png`: màn chào
2. `02-trang-chu.png`: trang chủ
3. `03-tao-nhac.png`: màn nhập yêu cầu (điền sẵn prompt mẫu)
4. `04-trinh-phat.png`: kết quả / đang phát
5. `05-thu-vien.png`: thư viện / yêu thích
6. `06-premium.png`: gói trả phí (nếu có)

App không có màn nào thì bỏ qua.

## Thông tin → `info.md`

Điền theo mẫu, mỗi mục 1–3 dòng, cả tiếng Việt + tiếng Anh:

```md
# Nhạc AI

## Cơ bản
- Tên trên store:
- Nền tảng + link tải:
- Giá: (miễn phí / gói nào, bao nhiêu)
- Link Privacy / Terms:

## Mô tả ngắn (1–2 câu)

## Cách dùng (3 bước)

## Tính năng (4–5 cái, mỗi cái: tên + 1 câu + ảnh minh hoạ)

## Riêng app nhạc
- Nhập gì để tạo nhạc (prompt / thể loại / lời…):
- Bài dài bao lâu, có lời / giọng hát không:
- Tải xuống / chia sẻ được không:
- Bài tạo ra có dùng thương mại được không (trích điều khoản):

## FAQ (3–4 câu)

## Còn thiếu / cần người trả lời
```
