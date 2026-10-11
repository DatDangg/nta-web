# Thông số đo được (Bước 1) — khung ảnh & ngôn ngữ thiết kế

> Đo từ ảnh cũ `public/images/solutions/{crm,dentgo,lms}/` bằng
> `scripts/screenshots/measure-frame.mjs` (quét pixel bằng sharp), và đọc computed style
> trực tiếp trên LMS / DentGo / CRM đã đăng nhập.
> Đây là căn cứ để (1) đóng khung ảnh mới đồng nhất tuyệt đối và (2) dựng mock HRM cùng hệ sản phẩm.

## 1. Khung cửa sổ macOS (áp dụng cả 4 sản phẩm)

Ảnh cũ của CRM/LMS và DentGo là **cùng một thiết kế**, chỉ khác tỷ lệ pixel:
CRM/LMS window 1602px (ảnh 1736px), DentGo window 2002px (ảnh 2170px).
Các tỷ lệ đo được trùng khớp → quy về viewport mục tiêu **1440×900, deviceScaleFactor 2**:

| Thông số | Đo trên ảnh cũ | Quy ra @1440 (CSS px) |
|---|---|---|
| Nền ngoài | `#eef1f5` (cả 4 góc, cả 2 bộ) | `#eef1f5` |
| Padding quanh cửa sổ | 67/1736 = 3,86% bề ngang ảnh | **56px** đều 4 phía |
| Cửa sổ | 1602×? (cao theo nội dung) | **1328 × auto** |
| Bo góc | ~14/1602 = 0,87% | **12px** |
| Viền | `#e0e1e6`, 1px | **1px solid #e0e1e6** (không bóng đổ — quét 60px ra ngoài biên vẫn thấy đúng màu nền) |
| Cao thanh tiêu đề | 61/1602 = 3,81% | **51px** |
| Nền thanh tiêu đề | `#f5f5f7` | `#f5f5f7` |
| Đường kẻ dưới thanh tiêu đề | `#e3e3e7` | **1px solid #e3e3e7** |
| 3 chấm | đường kính 17/1602 = 1,06%; tâm chấm 1 cách mép trái 42px, dưới mép trên 33px; màu đo được: đỏ `#fd807a`, vàng `#fec13f`, xanh `#39cc4f` | **⌀14px**; tâm cách mép trái **35 / 60 / 85px**, cách mép trên **27px**; màu như trên |
| Tiêu đề | căn giữa, `#6e6e73`, chiều cao chữ ~43% thanh tiêu đề | **17px / 500**, `#6e6e73`, giữa thanh, font system (`-apple-system, "Segoe UI", Roboto…`) |
| Cách gõ tiêu đề | `<Tên> · <mô tả ngắn>` → "CRM · Quản trị khách hàng", "LMS · Quản lý trường học", "DentGo · Quản lý phòng khám" | "NTA HRM · Quản trị nhân sự" cho HRM |

**Kết xuất:** mỗi ảnh = screenshot full-page của trang HTML wrapper (1440×900, dsf 2) chứa
ảnh chụp màn hình 1328px rộng → ảnh đầu ra rộng **2880px** (2656px nội dung + 2 viền + 2 padding).

Ảnh cũ HRM (public/images/solutions/hrm/01…05) là mockup **không** theo khung này
(nền `#f4f7fd`, không có thanh tiêu đề macOS) → bộ HRM mới thay thế hoàn toàn về mặt hình ảnh.

## 2. Ngôn ngữ thiết kế ứng dụng (để dựng HRM cùng hệ sản phẩm)

### DentGo (tham chiếu chính — HRM mock theo bộ này)
- Font: **Inter** (`Inter, ui-sans-serif, system-ui…`); chữ chính `#0f1729`, tiêu đề `#020617`
- **Sidebar:** ~259–272px, nền trắng; nhóm menu dạng pill bo góc **16px**, chữ 14px/600; item
  *active* nền **`#1d4ed8`** chữ trắng, *inactive* chữ **`#475569`**; khoảng cách icon–chữ 12px
- **Nút primary:** nền `#134cc9`, bo **14px**, padding 8×16, chữ 14px/500, chữ `#f8fafc`
- **Thẻ số liệu (KPI):** nền trắng, viền 1px `#e2e8f0`, bo **12px**, bóng `0 1px 2px rgba(0,0,0,.05)`;
  số liệu **30px/700**; icon góc phải ô vuông **44×44 bo 16px** nền `#eff6ff` chữ `#1d4ed8`
- **Thanh trên:** cao 56px, nền `rgba(255,255,255,.7)`; bộ chọn chi nhánh + chuông + avatar tròn viền
- **Bảng:** header nền xám nhạt (`#f8fafc`), dòng phân cách `#e2e8f0`, chữ 14px
- Badge trạng thái dạng pill (vd "Bật") — mẫu màu sẽ lấy lại khi dựng
- Màn nhân sự/lương **đã có sẵn trong DentGo** để đối chiếu trực tiếp:
  `/internal/staff-compensation` (Danh sách nhân viên), `/internal/leave-calendar` (Lịch nghỉ),
  `/internal/payroll` (Bảng lương tháng) — HRM mock bám đúng bố cục này.

### LMS
- Font: **Be Vietnam Pro**; nền app `#f1f5f9`; chữ `#0f172a`; phụ `#475569`
- Sidebar **290px** nền trắng, viền phải 1px `#e2e8f0`; nhóm menu pill bo **10px**, 15px/600;
  item active nền `rgba(16,185,129,.12)` chữ `#047857`; item thường chữ `#475569` 14px
- Nút primary: **pill bo 999px**, nền `#059669`, chữ trắng 12px/700, padding 11×16
- Nút phụ: nền trắng, viền `#e2e8f0`, bo 8px, chữ 12px/600 `#334155`
- Thẻ số liệu: nền trắng, bo 12px, **viền trên 3px màu** (xanh dương `#0284c7` / xanh lá / vàng),
  bóng `rgba(15,23,42,.1) 0 1px 2px`, padding 18px
- Badge: pill bo 99px, chữ 10px (vd "Đã chuyển": nền `rgba(245,158,11,.14)`, chữ `#d97706`)
- Input: nền `#f8fafc`, viền `#cbd5e1`, bo 10px, cao ~44px, chữ 13px
- Avatar: tròn 38px, nền `#059669`, chữ trắng 16px/700

### CRM (theme tối)
- Dark theme: nền app `#17171a`, thẻ `#201f24`, sidebar `#1b1a1f`
- Sidebar: nhóm "VẬN HÀNH"; item active pill nền đỏ đậm; logo tròn + "Dragon Hotpot · Sichuan · Riverside"
- KPI số 28px trắng; badge "Hôm nay" đỏ; chú thích xám `#8e8e93`

### Quyết định đồng bộ HRM
HRM mock đi theo **bộ DentGo** (Inter, xanh `#1d4ed8`/`#134cc9`, card bo 12–16px, icon 44px bo 16px,
sidebar ~264px) vì (a) HRM thuộc nhóm giải pháp vận hành doanh nghiệp với DentGo,
(b) xanh dương primary `#0071e3` cũng là màu thương hiệu website NTA (`src/app/globals.css`).
LMS dừng ở vai trò tham chiếu kỹ thuật (sidebar 290px, pill 999px) — không trộn màu xanh bơ
vào HRM để tránh lệch hệ.
