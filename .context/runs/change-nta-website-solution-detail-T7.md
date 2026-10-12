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

## step: T7-A/B — status=awaiting ✅ DONE → commit `61cb49e` trên nhánh `redesign/solution-detail`
- A: 4 tiêu đề EN LMS theo bảng user chốt + ghi bảng vào spec §11.2 (đóng MINOR).
- B: crop lại `crm/01-tong-quan-crop.png` → 2059×618 ratio **3.332** (thẻ chào + dải 4 thẻ chỉ số).
  Alt VI/EN viết lại · `ratio` trong `crm.mdx` VI/EN · `docs/screenshots-mapping.md` thêm bảng
  "ảnh crop dùng trên web" + sửa mục "Chưa nối vào web".
- Verify: build 51/51 exit 0 · `verify-t7.mjs` 12/12 · soi 375: crop cao ~110px, nhãn đọc được.
- **Nhánh mới `redesign/solution-detail`** (tạo từ `main`, chưa push). `main` vẫn giữ T1–T6.

## Change mới — `spec/changes/2026-10-12-solution-card-real-images.md` — status=awaiting ⏸ CHECKPOINT USER
- Khảo sát ĐỦ đã ghi trong change file §2 (component · ảnh · nơi dùng · field mdx · ảnh hưởng lan).
- **CHƯA code gì.** Chờ user duyệt danh sách + chốt 3 câu hỏi (placeholder AI/trang chủ · chữ VI
  trong SVG · ảnh HRM vuông trong khung 16/10).

## Quy tắc môi trường (đã mắc 2 lần — bắt buộc tuân thủ)
**kill mọi node process → xóa `.next` → build → copy `static`+`public` vào `.next/standalone` → start.**
Không build khi dev/prod server còn sống (Windows file lock → build treo hoặc cache corrupt → 500).
