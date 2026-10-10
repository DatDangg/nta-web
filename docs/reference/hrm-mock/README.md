# HRM — Tài liệu tham khảo cho trang giải pháp HRM

> ⚠️ **KHÁC VỚI CÁC THƯ MỤC KHÁC — ĐỌC TRƯỚC.**
>
> Các thư mục cùng loại (`crm-dragon-hotpot`, `lms-ismartschool`, `dentgo-smile`, `boxai`) chứa
> **ảnh chụp từ sản phẩm đã chạy thật**. Thư mục này thì **không**: NTA **chưa có dự án HRM nào**,
> nên toàn bộ nội dung và ảnh dưới đây là **mô phỏng (mockup) do tự dựng**, không phản ánh
> sản phẩm đang vận hành.
>
> - **URL:** không có
> - **Ngày dựng:** 10/10/2026 · SVG vector · giao diện tiếng Việt
> - **Mục đích:** chỗ dựng tạm để trang `/solutions/enterprise/hrm` không bị trống trong lúc
>   chờ sản phẩm thật. **Phải thay toàn bộ bằng ảnh chụp thật khi có hệ thống.**

## 1. Vì sao phải ghi rõ là mockup

`boxai.mdx` có nguyên tắc: *"nội dung suy ra từ giao diện vận hành, không phải tài liệu kỹ thuật"*.
Nguyên tắc đó giữ cho 4 trang kia không nói quá sức về năng lực sản phẩm.

Trang HRM **chưa đạt được nguyên tắc đó**. Vì vậy toàn bộ mô tả trong `hrm.mdx` là **nội dung
dự kiến**, viết theo mô hình HRM phổ biến, **chưa được đối chiếu với bất kỳ hệ thống nào**:

- Không có tên khách hàng, số liệu, năm triển khai, chứng nhận hay case study nào.
- Trường `highlights` (dạng số liệu) **cố tình để trống** — bắt buộc phải có con số thật mới dùng được.
- 4 câu FAQ trả lời ở dạng trung tính, không cam kết gì.

**Khi có sản phẩm thật: viết lại `hrm.mdx` từ đầu theo ảnh chụp thật, đừng chỉ thay ảnh.**

## 2. Bản đồ chức năng (mô phỏng)

| Nhóm | Mục |
|---|---|
| **Danh bạ** | Danh sách nhân sự · Hồ sơ chi tiết |
| **Quy trình** | Đề xuất & phê duyệt |
| **Tổ chức** | Cơ cấu phòng ban |
| **Tra cứu** | Lọc theo phòng ban / loại hợp đồng |

Sidebar trong ảnh có thêm *Chấm công · Báo cáo · Cài đặt* để giao diện trông như sản phẩm thật —
nhưng **những mục đó không có màn hình tương ứng** và không được mô tả trong `hrm.mdx`.
Nếu sau này làm tiếp, đó là các màn hình còn thiếu.

## 3. Năm ảnh và màn hình tương ứng

| # | Màn hình | File | Nội dung trong ảnh |
|---|---|---|---|
| 1 | Danh sách nhân sự | `screenshots/01-employee-directory.png` | Search + bộ lọc, bảng 5 dòng (mã NV · phòng ban · chức vụ · trạng thái · hợp đồng), phân trang |
| 2 | Hồ sơ nhân sự | `screenshots/02-employee-profile.png` | Hồ sơ Nguyễn Minh Anh, 4 tab, 10 trường thông tin, dòng thời gian công tác |
| 3 | Quy trình đề xuất | `screenshots/03-request-workflow.png` | 4 bước Đã gửi → Lãnh đạo duyệt → HR xử lý → Hoàn tất, danh sách 3 đơn chờ |
| 4 | Cơ cấu tổ chức | `screenshots/04-org-structure.png` | Công ty (248) → 4 khối, thanh headcount theo loại hợp đồng |
| 5 | Tra cứu đội ngũ | `screenshots/05-people-lookup.png` | Bộ lọc phòng ban / loại hợp đồng, lưới 6 thẻ nhân viên |

## 4. Cách ảnh được dựng

- Vẽ tay bằng **SVG** (1200×750) rồi xuất ra **PNG 2400×1500** (2×, để hiển thị sắc nét trên màn hình retina).
  Bản SVG không được commit — `screenshots/` chỉ giữ PNG, giống 4 thư mục cùng loại.
- Có **dữ liệu mô phỏng đầy đủ** (§5) thay cho các thanh placeholder — không dùng gạch xám.
- Giao diện **tiếng Việt**, khớp ảnh chụp thật của CRM / LMS / DentGo trong repo.
  (Trang `/en` dùng chung ảnh này — chấp nhận được vì cùng lý do các trang kia cũng vậy.)
- Dùng đúng design token của web: `--color-primary #0071e3`, `--color-text-primary #1d1d1f`,
  `--color-border #d2d2d7`, `--color-surface-sunken #f5f5f7`.
- Ảnh có dấu tiếng Việt đầy đủ — đã kiểm font render đúng dấu (không rơi dấu, không mất ký tự).

---

## 5. Bộ dữ liệu mô phỏng đã dùng trong ảnh

> Toàn bộ tên, mã, ngày trong ảnh là **dữ liệu bịa** — không phải người thật, không có PII.
> Dùng **thống nhất xuyên suốt 5 ảnh** để các màn hình khớp nhau như đang vận hành thật
> (cùng cách `dentgo-smile/README.md` §7 làm với bệnh nhân).

### Quy mô công ty

**248 nhân viên**, chia 4 khối (khớp ảnh 04):

| Khối | Số người |
|---|---|
| Kinh doanh | 96 |
| Kỹ thuật | 61 |
| Marketing | 48 |
| Hành chính & Tài vụ | 43 |

Theo loại hợp đồng (cũng khớp ảnh 04): HĐ chính chẻ **186** · Thử việc **44** · Thực tập **18**.

### Nhân sự (dùng ở ảnh 01, 02, 03, 05)

| Mã NV | Họ tên | Phòng ban | Chức vụ | Hợp đồng đến | Ngày vào | Trạng thái |
|---|---|---|---|---|---|---|
| NV-0012 | Nguyễn Minh Anh | Kinh doanh | Trưởng phòng | 01/03/2027 | 15/01/2020 | Đang làm |
| NV-0031 | Trần Thị Hồng Nhung | Kinh doanh | Nhân viên | 01/09/2027 | 02/09/2024 | Đang làm |
| NV-0045 | Lê Quốc Bảo | Kỹ thuật | Kỹ sư triển khai | 01/01/2027 | 10/01/2021 | Đang làm |
| NV-0058 | Phạm Thị Mai Anh | Hành chính & Tài vụ | Kế toán trưởng | 01/06/2027 | 05/06/2019 | Đang làm |
| NV-0072 | Võ Đức Thắng | Kỹ thuật | Nhân viên | 01/12/2026 | 01/12/2025 | Thử việc |
| NV-0088 | Đỗ Thu Trang | Marketing | Chuyên viên | 01/04/2027 | 08/04/2023 | Đang làm |
| NV-0093 | Hoàng Văn Kiên | Kinh doanh | Nhân viên | 01/11/2027 | 15/10/2024 | Nghỉ phép |
| NV-0104 | Bùi Thị Lan Anh | Hành chính & Tài vụ | Chuyên viên | 01/02/2027 | 20/01/2022 | Đang làm |

Mốc thời gian trong ảnh: **10/10/2026**. Ảnh 01 lọc `Kinh doanh` + `HĐ chính chẻ` → **1-5 / 248**.

### Hồ sơ mở ở ảnh 02 — NV-0012

Nguyễn Minh Anh · Nam · sinh 12/04/1988 · 0912 345 678 · minhanh.nguyen@ntavietnam.tech ·
Kinh doanh / Trưởng phòng · HĐ không xác định đến 01/03/2027 · vào 15/01/2020 ·
Lịch sử: Trưởng phòng (01/2021) → Nhân viên kinh doanh (03/2020).

### Đề xuất (ảnh 03)

| Người gửi | Loại đề xuất | Ngày | Trạng thái |
|---|---|---|---|
| Nguyễn Minh Anh | Đơn xin nghỉ phép | 12/10/2026 | Chờ HR duyệt |
| Lê Quốc Bảo | Đề xuất vị trí | 11/10/2026 | Chờ HR duyệt |
| Võ Đức Thắng | Gia hạn hợp đồng | 10/10/2026 | Bản nháp |

### Tra cứu (ảnh 05)

Bộ lọc đang bật: **Kinh doanh** + **Kỹ thuật** + **HĐ chính chẻ** → **103 nhân viên** khớp.

---

## 6. Đối chiếu với schema trang

`src/content/solutions/{vi,en}/hrm.mdx` khai:

| Khối | Trạng thái |
|---|---|
| `description` | Viết lại dài hơn (dùng làm cả hero lẫn meta description) |
| `features` / `benefits` | Giữ nguyên 3 + 2 như ban đầu |
| `screenshots` | 5 ảnh (mới) |
| `sections` | 4 mục (mới) |
| `useCases` | Mở rộng 2 → 5 (mới) |
| `faq` | 4 câu (mới) |
| `renderExtendedContent` | `true` — cờ opt-in mới |

Cờ `renderExtendedContent` được thêm vào `Solution` để nhóm `enterprise` render
`sections` / `useCases` / `faq` **cho từng giải pháp bật cờ**, thay vì áp cho cả nhóm —
nếu không, CRM / LMS / DentGo (đã có sẵn `useCases` trong MDX) sẽ đổi giao diện ngoài ý muốn.
Nhóm `ai` luôn render các khối này và không dùng cờ.

## 7. Việc còn lại khi có sản phẩm thật

1. Chụp màn hình thật → `docs/reference/hrm-<tên-sản-phẩm>/screenshots/NN-*.png`.
2. Ẩn danh PII (tên, SĐT, email, CCCD) — xem cách làm ở `crm-dragon-hotpot/README.md` §6.
3. **Viết lại `hrm.mdx` (vi + en) từ ảnh thật**, thay toàn bộ `sections` / `useCases` / `faq` hiện tại.
4. Bật `highlights` nếu có số liệu thật.
5. Xoá thư mục `hrm-mock/` khi ảnh thật đã thay thế.

> **Muốn chỉnh nội dung ảnh?** 5 ảnh được xuất từ SVG vẽ tay (bản SVG không commit).
> Sửa lại phần mô tả dữ liệu ở §5 cho khớp mong muốn, rồi vẽ lại và xuất PNG.