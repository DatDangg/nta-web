# DentGo Smile — Nguồn nội dung cho trang giải pháp phần mềm nha khoa

> Nội dung suy ra từ **giao diện vận hành của hệ thống đang chạy thật** (không phải tài liệu kỹ thuật).
> Dùng làm nguồn để viết trang giải pháp (vi + en).

## 1. Metadata

- **Nguồn ảnh:** ảnh chụp từ **hệ thống demo đang chạy thật**.
- **URL hệ thống:** http://demo1.76.13.214.188.sslip.io/ (`/internal`)
- **Tên sản phẩm:** DentGo Smile — *Hệ điều hành Quản trị Nha khoa Đa chi nhánh*.
- **Chụp ngày:** 10/10/2026 · **viewport:** ~1735×1123 · **theme:** sáng (light) · **ngôn ngữ:** tiếng Việt.
- **Tài khoản demo:** `admin@demo1` / `123456` — vai trò *Quản trị hệ thống*, phạm vi *Tất cả chi nhánh*.
- **Dữ liệu trong ảnh:** tên, số điện thoại, CCCD, thẻ BHYT và các thông tin bệnh nhân khác đã được thay bằng dữ liệu mô phỏng trên trình duyệt; không phải dữ liệu người thật và không ghi vào database demo.
- **Con số quan sát trong ảnh (mốc provenance, không dùng làm số liệu marketing):** 248 hồ sơ; 6 bệnh nhân mẫu hiển thị.
- **Ảnh tiếng Việt**; trang `/en` dùng chung ảnh này (chấp nhận được).

> **Ghi chú khi xuất bản:** thông tin bệnh nhân trong ảnh là dữ liệu mô phỏng; thương hiệu DentGo Smile và tên sản phẩm là thật, được phép giữ nguyên để minh hoạ hệ thống đang vận hành. URL hệ thống demo và thông tin đăng nhập (`admin@demo1` / `123456`) chỉ dùng nội bộ, tuyệt đối không đưa lên trang public.

## 2. Positioning — sản phẩm này là gì

Một **hệ điều hành cho phòng khám nha khoa đa chi nhánh** — gộp nghiệp vụ lâm sàng, vận hành và tài chính–kho vào cùng một lõi, thay vì phần mềm bệnh án một nơi, kế toán một nơi, kho một nơi. Khác với HIS/EMR thuần tuý hay CRM bán hàng, điểm cốt lõi là **sự liên thông**: một ca điều trị tự động kéo theo chi phí vật tư, tiền của bác sĩ và doanh thu của chi nhánh.

## 3. Vấn đề khách hàng gặp

- Phòng khám thường dùng phần mềm tách rời: hồ sơ bệnh án một nơi, kế toán một nơi, kho vật tư một nơi — nhập liệu trùng và không đối soát được vật tư theo từng ca điều trị.
- Lễ tân gọi nhắc lịch nhưng không biết bệnh nhân còn nợ bao nhiêu, nên khó thu đủ và dễ bỏ sót công nợ.
- Quản lý nhiều chi nhánh, nhiều bác sĩ mà không nhìn ra doanh thu và tiền lương theo từng người, từng cơ sở.
- Kê khai thuế, xuất hoá đơn điện tử và đối chiếu mã thuốc BHYT phải làm thủ công, tốn thời gian và dễ sai.
- Chăm sóc khách thiếu kênh: nhắc lịch, nhắc tái khám gần như làm tay qua điện thoại.

Đây là phần mở đầu cho khối nội dung "Vấn đề & giải pháp" của trang.

## 4. Giải pháp — năng lực chính

| Năng lực | Mô tả | Ảnh minh hoạ |
|---|---|---|
| **Tổng quan ca làm đa chi nhánh** | Bảng điều khiển theo ngày cho biết ca làm đang thế nào — lượt khám, ca đang mở, tiền dịch vụ phát sinh, lịch hẹn, đã đến, đã thu — với bộ lọc chi nhánh để số liệu luôn theo đúng cơ sở đang chọn. | `screenshots/01-tong-quan.png` |
| **Hồ sơ khách hàng & hồ sơ RHM/EMR** | Tiếp nhận bệnh nhân theo ngày với trạng thái lịch hẹn nhìn thấy ngay; mở ra là hồ sơ lâm sàng gom thông tin cá nhân, tiền sử bệnh, kế hoạch điều trị, đơn thuốc, film ảnh, thanh toán và công nợ trong cùng một trang. | `screenshots/02-ho-so-khach-hang.png`, `screenshots/03-ho-so-rhm.png` |
| **Lịch hẹn & chăm sóc khách** | Quản lý lịch hẹn theo ngày, nhân viên và trạng thái, hiển thị số nợ ngay trong lịch để biết ai còn tồn đọng trước khi gọi nhắc; kèm kênh chăm sóc khách hàng. | `screenshots/04-lich-hen.png` |
| **Kho vật tư – thuốc gắn vào điều trị** | Quản lý thuốc và dụng cụ nha khoa với giá nhập/xuất và mã thuốc quốc gia, cảnh báo thuốc chưa khớp mã quốc gia — phục vụ đối soát BHYT, và nối thẳng vào chi phí của từng ca điều trị. | `screenshots/05-kho-vat-tu.png` |

## 5. Tích hợp & bám văn bản pháp quy

Hệ thống kết nối với các hệ thống phòng khám đang dùng và bám các nghiệp vụ có yêu cầu pháp lý:

| Hệ thống / nghiệp vụ | Vai trò |
|---|---|
| **Zalo OA** | Hộp thư ngay trên hệ thống + nhắc lịch tự động. |
| **SMS** | Gửi tin nhắn hàng loạt theo mẫu. |
| **Labo ngoài** | Quản lý nhà cung cấp Labo, phiếu đặt và bảng kê công nợ. |
| **Hoá đơn điện tử / thuế** | Xuất hoá đơn, kê khai thuế và báo cáo thuế. |
| **BHYT / mã thuốc quốc gia** | Thẻ BHYT trên hồ sơ, đối soát mã thuốc quốc gia. |

## 6. Use case theo quy mô/ngành

- **Phòng khám nha khoa đa chi nhánh:** cần một hệ thống dùng chung cho nhiều cơ sở, tách số liệu theo từng chi nhánh.
- **Phòng khám muốn liên thông lâm sàng với tài chính và kho:** để một ca điều trị tự động cập nhật vật tư, tiền bác sĩ và doanh thu.
- **Phòng khám quản lý công nợ bệnh nhân:** cần thấy số nợ ngay trên hồ sơ và trong lịch hẹn để thu đủ khi khách quay lại.
- **Phòng khám có nghiệp vụ BHYT / kê khai thuế:** cần quản lý mã thuốc quốc gia, hoá đơn điện tử và báo cáo thuế trong cùng hệ thống.
- **Phòng khám muốn chủ động chăm sóc khách:** dùng nhắc lịch qua Zalo OA/SMS thay cho gọi điện thủ công.

## 7. Câu hỏi thường gặp

**Đây là phần mềm bệnh án hay phần mềm kế toán?**
Là cả hai trong một: hồ sơ lâm sàng, vận hành phòng khám và tài chính–kho cùng nằm trong một hệ thống liên thông.

**Hệ thống có dùng được cho nhiều chi nhánh không?**
Có. Có bộ lọc chi nhánh và số liệu tách theo từng cơ sở, phù hợp phòng khám nhiều chi nhánh.

**Có biết bệnh nhân còn nợ bao nhiêu không?**
Có. Công nợ hiển thị ngay trên hồ sơ và cả trong lịch hẹn, nên lễ tân thấy được trước khi gọi nhắc.

**Có hỗ trợ chăm sóc khách qua Zalo và SMS không?**
Có. Nhắc lịch qua Zalo OA và gửi SMS theo mẫu; bảng kê Labo, hoá đơn điện tử và mã thuốc quốc gia cũng nằm trong hệ thống.

## 8. Bảng mapping sang schema `.mdx`

### Mapping khối → field

| Khối trong README | Field trong `Solution` (`src/content/types.ts`) | Ghi chú |
|---|---|---|
| H1 — tên tài liệu nội bộ | `title` | Có thể chọn title trung tính **“Quản trị phòng khám nha khoa”** theo giọng thương hiệu NTA; nếu muốn nhắc tên khách hàng hoặc sản phẩm trong nội dung hay breadcrumb thì được phép. H1 hiện tại có thể giữ làm tên tài liệu. |
| §2 Positioning | `description` | 1–2 câu dùng cho hero + meta description |
| §3 Vấn đề khách hàng gặp | `sections[0].intro` | mở đầu khối nội dung đầu tiên |
| §4 Năng lực chính | `features[]` — mỗi năng lực 1 phần tử dạng `"<Tiêu đề> — <mô tả>"` | 4 phần tử |
| §4 (chi tiết từng năng lực) | `sections[0].items[]` | có thể tách thành bullet |
| §4 Ảnh minh hoạ | `screenshots[]` | theo thứ tự ở bảng dưới |
| §5 Tích hợp / pháp quy | `sections[1].title` + `sections[1].items[]` | Zalo OA, SMS, Labo, hoá đơn/thuế, BHYT |
| §6 Use case | `useCases[]` | 5 phần tử |
| §7 FAQ | `faq[]` | mảng `{ question, answer }`, 4 phần tử |
| Kết quả/giá trị (từ §2, §4) | `benefits[]` | 2–3 outcome ngắn |
| Số liệu | `highlights[]` | **để trống** — con số trong ảnh là mốc provenance, chờ user xác nhận số hiển thị công khai |
| Cờ render | `renderExtendedContent: true` | để nhóm enterprise render `sections` / `useCases` / `faq` |

### Danh sách ảnh & thứ tự đề xuất

| # | File trong `screenshots/` | Dùng cho |
|---|---|---|
| 1 | `01-tong-quan.png` | §4 — Tổng quan ca làm đa chi nhánh |
| 2 | `02-ho-so-khach-hang.png` | §4 — Danh sách bệnh nhân theo ngày |
| 3 | `03-ho-so-rhm.png` | §4 — Hồ sơ RHM/EMR liên thông điều trị–kho–tài chính |
| 4 | `04-lich-hen.png` | §4 — Lịch hẹn & chăm sóc khách |
| 5 | `05-kho-vat-tu.png` | §4 — Kho vật tư – thuốc gắn vào điều trị |
