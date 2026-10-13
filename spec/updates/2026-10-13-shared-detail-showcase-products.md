# Spec update 3.5.1 — R-08c.1 trang chi tiết sản phẩm app (CR-004 layer 3)

- Loại: PATCH (field optional, tương thích ngược). Spec 3.5.0 → 3.5.1, scope v27 → v28.
- `/products/[slug]` cho `music-app`, `hair-style-ai` dùng `ShowcaseLayout`; data trong MDX vi/en.
- Field mới: `technology.screen.device: phone`, `photos.variant: phone`, `photos.aspect`, icon nút sơ đồ `photo/ai/music/share`; `Product.brandName`, `Product.showcase`.
- Nguồn nội dung: ghi chú sản phẩm user gửi qua chat 13/10/2026 (Kiểu tóc AI: bản Android v1; Nhạc AI: bản thử nghiệm nội bộ iOS/Android).
- Không dùng: màn Premium app nhạc (rating 4.8 + "80% người dùng chọn" chưa kiểm chứng), màn welcome app tóc (ảnh minh hoạ chưa xác nhận giấy phép), ảnh simulator có thanh debugger.
