# Run Journal — T7 (follow-up duyệt #2) + change "thay ảnh placeholder ở thẻ giải pháp"

- Nguồn: user duyệt sau T6 (`553931a`), branch `main`, **CHƯA push, KHÔNG deploy, KHÔNG tạo nhánh** (user bỏ Vercel preview).
- Cuối buổi: chạy production server `0.0.0.0:3000` + báo danh sách đường dẫn cần xem.

## step: T7-A — EN feature titles LMS + spec §11.2 — status=running
- User chốt bảng tiêu đề EN (4 dòng) → ghi vào `.context/design-spec-solution-detail.md` §11.2 để đóng MINOR
  "EN titles không có nguồn trong spec".
- Sửa `src/content/solutions/en/lms.mdx` 4 `features[].title`.
- Verify: lint/typecheck/build + `verify-t5.mjs` + check text mới có trong HTML.

## step: T7-B — crop lại `crm/01-tong-quan-crop.png` — status=pending
- User: không chọn (a) full-bleed hay (b) giữ nguyên → crop lại từ ảnh gốc `crm/01-tong-quan.png` (2656×1902):
  vùng gồm **thẻ chào "Hôm nay thế nào?" + dải 4 thẻ chỉ số**, tỉ lệ **~3:1** (giống crop DentGo).
- Lưu đè file crop. Cập nhật: `docs/screenshots-mapping.md` (ratio) · `crm.mdx` VI/EN (`ratio`) ·
  alt (ảnh giờ có 2 lớp: thẻ chào + dải chỉ số → alt phải mô tả cả hai).
- Kiểm tra 375: nhãn phải đọc được.

## step: T7-C — change: ảnh placeholder ở thẻ giải pháp — status=pending
- Yêu cầu user (đã gửi trước): `/solutions/enterprise`, thẻ giải pháp trang chủ, `RelatedSolutions`, …
  — bản EN hiện **nhãn tiếng Việt**.
- Yêu cầu: dùng ảnh v2 `01-tong-quan` · ảnh **bám mép trên + fade đáy** · **không cắt 2 bên** ·
  thẻ không có ảnh thật thì **giữ placeholder** nhưng **nhãn đúng ngôn ngữ**.
- Bước bắt buộc: **khảo sát + liệt kê trước** (ghi vào journal) rồi mới code.

## Quy tắc môi trường (đã mắc 2 lần — bắt buộc tuân thủ)
**kill mọi node process → xóa `.next` → build → copy `static`+`public` vào `.next/standalone` → start.**
Không build khi dev/prod server còn sống (Windows file lock → build treo hoặc cache corrupt → 500).
