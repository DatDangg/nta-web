---
id: dental-case-study-showcase
type: feature
status: pending-review              # code đã làm trong session Cowork 2026-10-13 — chạy /change để reviewer soát + close-out
created: 2026-10-13
---

# Case study nha khoa: trang chi tiết dạng showcase (như Óc Eo) + nút mở chi tiết DentGo

## Yêu cầu
User: "cái case study Digitizing workflows at a dental clinic ấy, thêm mô tả, hình ảnh các thứ như của bên case
study óc eo, vào có phần mở ra detail DentGo Solution (/solutions/enterprise/dentgo) như óc eo mở ra box AI".

## Đã làm (chưa commit)
- `dental-clinic-operations.mdx` (vi + en): `layout: showcase` + `showcase` đầy đủ (hero, 3 thẻ số liệu, 3 cột
  Thách thức / Giải pháp / Thay đổi mang lại, khối Giải pháp DentGo, carousel ảnh giao diện, Hướng tới tương lai,
  thẻ CTA) + `cover` cho thẻ danh sách.
- Khối công nghệ: nút **"Xem chi tiết giải pháp DentGo" → `/solutions/enterprise/dentgo`** (tương đương nút → BoxAI của Óc Eo).
- Nút hero "Khám phá giải pháp / Explore the solution" cũng mở thẳng `/solutions/enterprise/dentgo` (user yêu cầu 2026-10-13, không cuộn xuống khối Giải pháp).
- Ảnh hero mới `public/images/cases/dental/hero.jpg` (1590×989) ghép từ ảnh chụp DentGo v2 (dashboard, lịch hẹn, sơ đồ răng) — alt ghi "Minh hoạ … (dữ liệu demo)".
- Mở rộng type showcase (tương thích ngược, Óc Eo không đổi):
  - `technology.screen` (ảnh chụp phần mềm thật) → render `ScreenMock` thay `VmsMock`; `alerts` thành optional.
  - `technology.nodes` nhận `string | { label, icon }` (icon mới: calendar / records / inventory).
  - `photos.variant: 'screen'` (viền + căn trên cho ảnh chụp màn hình); `hero.image.width/height` optional.
  - `ShowcaseIcon` thêm `modules`.

## Acceptance
- [x] `/case-studies/dental-clinic-operations` (+ `/en`) render bố cục showcase; desktop 1440 + mobile 390 không tràn ngang.
- [x] Nút trong khối Giải pháp dẫn tới `/(en/)solutions/enterprise/dentgo`.
- [x] Óc Eo vẫn render như cũ (VmsMock + 3 nút camera/flycam/VMS mặc định).
- [x] BR-004: không bịa số liệu — số liệu dạng mô tả (khu vực, 1 lịch hẹn, 4 phân hệ); `note` + caption nói rõ ảnh dùng dữ liệu demo, chưa có chỉ số xác nhận; quote ghi nguồn "Định hướng … của NTA".
- [x] `tsc --noEmit` + `eslint` (showcase + types) PASS.
- [ ] Reviewer PASS · spec delta R-08b (field mới của showcase) · progress/commit.

## Cần user xác nhận nội dung
- Các ý ở cột Thách thức / Thay đổi mang lại được suy ra từ mô tả cũ + trang DentGo, chưa có xác nhận từ khách hàng.
