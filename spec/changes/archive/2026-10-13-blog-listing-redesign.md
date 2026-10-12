---
id: blog-listing-redesign
type: feature
status: done
created: 2026-10-13
---

# Thiết kế lại UI trang Tin tức (`/blog`, `/en/blog`) theo mockup

## Yêu cầu
User (2026-10-13): "sửa lại UI trang tin tức như này" — kèm 2 ảnh tham chiếu:
- Mockup: `spec/changes/assets/2026-10-13-blog-listing-redesign/mockup-blog-listing.png`
- Ảnh nền hero (sóng xanh ngọc nhạt): `spec/changes/assets/2026-10-13-blog-listing-redesign/hero-background.png`

Bố cục theo mockup (từ trên xuống):
1. **Hero**: nền là ảnh `hero-background.png`; breadcrumb dạng pill (Trang chủ › Tin tức); tiêu đề 2 dòng
   "Tin tức & Cập nhật / về **AI và ứng dụng thực tiễn**" (phần sau màu primary); mô tả ngắn; minh hoạ 3D
   (tờ báo/tài liệu + bóng kính) bên phải.
2. **Thanh lọc**: chip danh mục (Tất cả · AI & Công nghệ · Ứng dụng thực tiễn · Câu chuyện khách hàng ·
   Hoạt động NTA · Xu hướng · Hướng dẫn), chip active nền primary; ô **tìm kiếm bài viết** bên phải.
3. **Khối nổi bật (3 cột)**: bài lớn bên trái (ảnh + badge danh mục + ngày + thời gian đọc + tiêu đề + excerpt
   + "Đọc thêm →"); cột giữa 2 bài nhỏ (ảnh ngang + badge + ngày + phút đọc + tiêu đề + "Đọc thêm →");
   cột phải: thẻ xanh đậm "NỔI BẬT — Cập nhật mới nhất từ NTA" + nút "Xem tất cả bài viết", và thẻ
   **"Đăng ký nhận tin"** (input email + nút gửi).
4. **"Bài viết mới nhất"**: lưới thẻ (4 cột desktop), mỗi thẻ ảnh + badge danh mục.

## Hiện trạng (để agent đối chiếu)
- `src/app/[locale]/blog/page.tsx`: `PageHeader variant="centered"` + lưới `PostCard` 3 cột, phân trang 9 bài (`BlogFilter`, chỉ có `?page`, chưa lọc/tìm).
- Chỉ có **4 bài** (vi/en): `digital-workflows`, `first-steps`, `learning-content`, `responsible-ai`;
  category hiện tại tự do ("Giải pháp số", "Công nghệ", "Giáo dục", "Trí tuệ nhân tạo"); cover là SVG.
- Chưa có component/endpoint newsletter nào trong `src/`.

## Acceptance
- [x] `/blog` + `/en/blog` render đúng bố cục mockup ở desktop 1440; tablet 768 + mobile 390 xếp cột hợp lý, không tràn ngang.
- [x] Hero dùng nền sóng `hero-waves.jpg` — cùng ảnh `hero-background.png` đã tối ưu (38KB, next/image) — xem Task 02.
- [x] Chip danh mục lọc được bài; ô tìm kiếm lọc theo tiêu đề/excerpt; trạng thái lọc phản ánh trên URL (`?category=`, `?q=`) — giữ được phân trang.
- [x] Thẻ bài hiển thị badge danh mục, ngày (định dạng `12 Th10, 2026` / `Oct 12, 2026`) và thời gian đọc.
- [x] i18n đủ vi/en cho mọi chuỗi mới (`messages/*`).
- [x] ~~Thẻ "Đăng ký nhận tin"~~ — ngoài phạm vi (quyết định 1).
- [x] Không bịa nội dung (BR-004): KHÔNG thêm bài/ảnh giả như trong mockup nếu user chưa cung cấp — dùng 4 bài hiện có, layout chịu được ít bài (featured có thể thiếu bài nhỏ / mục "mới nhất" rỗng thì ẩn).
- [x] Trang chi tiết `/blog/[slug]` không bị ảnh hưởng.
- [x] typecheck + lint + build PASS; reviewer PASS.

## Quyết định của user (2026-10-13, trả lời khi chạy `/change`)
1. **Đăng ký nhận tin** → ẨN, làm sau (chưa có backend). Cột phải chỉ còn thẻ NỔI BẬT.
2. **Danh mục** → dùng đủ 7 chip theo mockup; map: responsible-ai → AI & Công nghệ, digital-workflows → Ứng dụng thực tiễn,
   learning-content → Hướng dẫn, first-steps → Hoạt động NTA. Chip không có bài vẫn hiện, bấm vào → trạng thái "chưa có bài viết".
3. **Minh hoạ hero** → agent tự dựng SVG/CSS theo style mockup, dùng design tokens; ảnh bìa giữ SVG hiện có.
4. **Thời gian đọc** → tự tính từ số chữ (~200 từ/phút, tối thiểu 1 phút).
5. **Nút "Xem tất cả bài viết"** → cuộn xuống mục "Bài viết mới nhất" (reset bộ lọc).
6. **Định dạng ngày** → đổi util chung cho CẢ list + chi tiết: VI `12 Th10, 2026` / EN `Oct 12, 2026` (giữ luật 1 nguồn của R-09; trang chi tiết chỉ đổi chuỗi ngày, không đổi bố cục).

> Acceptance điều chỉnh theo quyết định 1: bỏ thẻ "Đăng ký nhận tin" khỏi phạm vi change này.

## Câu hỏi mở (đã trả lời — xem mục Quyết định ở trên)
1. **Đăng ký nhận tin**: nối backend thật (gửi về đâu — email/Google Sheet/dịch vụ nào?) hay chỉ làm UI tạm / ẩn đi?
2. **Danh mục**: dùng đúng 7 chip theo mockup và gán lại category cho 4 bài hiện có? (đề xuất map: responsible-ai → AI & Công nghệ, digital-workflows → Ứng dụng thực tiễn, learning-content → Hướng dẫn, first-steps → ? )
3. **Minh hoạ 3D bên phải hero + ảnh bìa bài**: user cung cấp file, hay agent tự dựng minh hoạ (SVG/CSS) theo style mockup?
4. **Thời gian đọc**: tự tính từ số chữ trong bài (đề xuất) hay khai báo trong frontmatter?
5. **Thẻ "NỔI BẬT"**: nút "Xem tất cả bài viết" dẫn đi đâu (cuộn xuống "Bài viết mới nhất")?

## Ghi chú
- Phân loại dự kiến: **MODIFY** (UI listing) + **ADDITIVE** (lọc danh mục, tìm kiếm, thời gian đọc, newsletter) → cần spec delta cho trang Blog.
- Đụng shared component có thể: `PageHeader`, `PostCard` (dùng ở nơi khác? — kiểm tra blast radius trước khi sửa; ưu tiên tạo component mới trong `src/components/blog/`).
- ~~Tokens màu/typography lấy từ design tokens hiện có, không hardcode màu mockup.~~ → bám pattern `src/components/listing/*` (hex/rgb arbitrary), ghi `.context/decisions.md` 2026-10-13 — cần user xác nhận.

## Kết quả (2026-10-13)
- Classification: MODIFY + ADDITIVE · spec 3.1.0 → **3.2.0** (R-09a mới + clarify ngày R-09) · test-scope **v22**
- Tasks: `tasks/feature-blog-listing-redesign/phase-1-task-0{1,2,3}.md` — 3 commit (106acc3, a90eecd, close-out Task 03)
- Review: T01 STRICT PASS r1 · T02 NORMAL PASS r1 · T03 NORMAL FAIL r1 (race debounce) → PASS r2 · phase spec-validation PASS
- Follow-up đề xuất (ngoài phạm vi): thẻ "Đăng ký nhận tin" khi có backend; `ease-out-expo` không sinh CSS (toàn repo);
  `Pagination` push vs replace; nút home Breadcrumb pill 32px < 44px; focus ring chip active khó thấy (global `*:focus-visible`);
  unit test `lib/blog/filter.ts` khi có test framework.
