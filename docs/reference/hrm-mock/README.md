# HRM — Nguồn nội dung cho trang giải pháp Quản trị Nhân sự

> ⚠️ **MOCKUP — ĐỌC TRƯỚC KHI DÙNG NỘI DUNG NÀY.**
>
> NTA **chưa có dự án HRM nào chạy thật**. Toàn bộ nội dung và ảnh trong thư mục này là **mô phỏng tự dựng
> (mockup)**, không phản ánh một sản phẩm đang vận hành. Các thư mục cùng loại
> (`crm-dragon-hotpot`, `lms-ismartschool`, `dentgo-smile`, `boxai`) chứa ảnh chụp từ hệ thống chạy thật;
> thư mục này thì **không**.
>
> - Mục đích: chỗ dựng tạm để trang giải pháp HRM không bị trống trong lúc chờ sản phẩm thật.
> - **Phải thay toàn bộ bằng ảnh chụp thật khi có hệ thống** — khi đó viết lại trang từ đầu, không chỉ thay ảnh.
> - Mọi mô tả năng lực dưới đây là **nội dung dự kiến**, viết theo mô hình HRM phổ biến, chưa đối chiếu hệ thống nào.

## 1. Metadata

- **Nguồn ảnh:** mockup tự dựng — **không có URL hệ thống**.
- **Cách dựng:** vẽ tay bằng SVG 1200×750 rồi xuất PNG 2400×1500 (2×, để nét trên màn hình retina). Bản SVG không được commit; `screenshots/` chỉ giữ PNG.
- **Ngày dựng:** 10/10/2026 · **theme:** sáng · **ngôn ngữ:** tiếng Việt · **tài khoản demo:** không có.
- **Design token dùng trong ảnh:** `--color-primary #0071e3` · `--color-text-primary #1d1d1f` · `--color-border #d2d2d7` · `--color-surface-sunken #f5f5f7`.
- **Dữ liệu trong ảnh là dữ liệu bịa** (không phải người thật, không PII), dùng thống nhất xuyên suốt 5 ảnh:
  - Quy mô mô phỏng: **248 nhân viên / 4 khối** — Kinh doanh 96 · Kỹ thuật 61 · Marketing 48 · Hành chính & Tài vụ 43.
  - Theo loại hợp đồng: chính thức **186** · thử việc **44** · thực tập **18**.
  - Mốc thời gian trong ảnh: **10/10/2026**. Có 8 nhân sự mẫu (ví dụ NV-0012 Nguyễn Minh Anh, Trưởng phòng Kinh doanh).
- **Ảnh tiếng Việt**; trang `/en` dùng chung ảnh này (chấp nhận được, giống các trang giải pháp khác).
- **`highlights` (số liệu) để trống** — bắt buộc có con số thật mới dùng được.

> ⚠️ Đây là mockup nhưng ảnh hồ sơ vẫn có tên, điện thoại và email dùng domain `ntavietnam.tech`; ảnh tổ chức còn hiển thị tên “Công ty NTA”. Trước khi dùng ảnh trên trang public, xác nhận các thông tin liên hệ không thuộc người thật; redact email, tên/mã nhân viên và tên tổ chức nếu chưa được duyệt công khai.

## 2. Positioning — sản phẩm này là gì

Một hệ thống quản trị nhân sự gọn, đặt **hồ sơ nhân sự · luồng đề xuất–phê duyệt · cơ cấu tổ chức** vào cùng một chỗ, thay cho bảng tính rời rạc và trao đổi qua chat/email. Khác với các bộ HRM ôm đồm cả chấm công – tính lương – tuyển dụng, hướng này tập trung vào **danh bạ nhân sự và luồng phê duyệt nội bộ** — phần mà mọi phòng nhân sự đều cần nhưng hay bị làm thủ công nhất.

> Nội dung dự kiến (mockup) — xem cảnh báo đầu file.

## 3. Vấn đề khách hàng gặp

- Hồ sơ nhân viên nằm rải rác ở nhiều file Excel/Google Sheets của từng phòng ban, không có một nguồn chung để tra cứu.
- Đề xuất (nghỉ phép, ký/gia hạn hợp đồng…) gửi qua Zalo hoặc email, nên không ai biết đơn đang ở bước nào và **đang chờ ai duyệt**.
- Muốn trả lời câu hỏi đơn giản như "phòng này có bao nhiêu người, ai sắp hết hạn hợp đồng" lại phải nhờ HR lọc tay.
- Cơ cấu tổ chức và headcount theo khối không nhìn thấy được tổng thể, khó theo dõi biến động.

Đây là phần mở đầu cho khối nội dung "Vấn đề & giải pháp" của trang.

## 4. Giải pháp — năng lực chính

| Năng lực | Mô tả | Ảnh minh hoạ |
|---|---|---|
| **Danh bạ nhân sự tập trung** | Toàn bộ nhân sự trong một danh sách chung, tìm kiếm và lọc theo phòng ban / loại hợp đồng ngay trên màn hình, thay cho việc mở nhiều file rời. | `screenshots/01-employee-directory.png` |
| **Hồ sơ nhân sự** | Mỗi người có một hồ sơ riêng gom thông tin liên hệ, phòng ban – chức vụ, hợp đồng và dòng thời gian công tác, để tra cứu thay vì hỏi lại từng phòng. | `screenshots/02-employee-profile.png` |
| **Quy trình đề xuất & phê duyệt** | Đơn từ đi theo luồng trạng thái rõ ràng (Đã gửi → Lãnh đạo duyệt → HR xử lý → Hoàn tất), nhìn được đơn nào đang chờ ai xử lý. | `screenshots/03-request-workflow.png` |
| **Cơ cấu tổ chức & tra cứu đội ngũ** | Sơ đồ tổ chức theo khối kèm headcount theo loại hợp đồng, và chế độ tra cứu đội ngũ bằng bộ lọc để trả lời nhanh câu hỏi về quy mô từng nhóm. | `screenshots/04-org-structure.png`, `screenshots/05-people-lookup.png` |

## 5. Tích hợp & bám văn bản pháp quy

**Không áp dụng.** Đây là mockup chưa có sản phẩm chạy thật, nên chưa có hệ tích hợp bên thứ ba hay văn bản pháp quy nào được kiểm chứng để mô tả.

## 6. Use case theo quy mô/ngành

- **Doanh nghiệp 50–300 nhân sự, nhiều phòng ban:** cần một danh bạ chung thay cho bảng tính tản mát ở từng bộ phận.
- **Đơn vị đang chuẩn hoá luồng phê duyệt nội bộ:** muốn thay việc gửi đề xuất qua chat/email bằng luồng trạng thái có người chịu trách nhiệm rõ ràng.
- **Doanh nghiệp đang tăng trưởng nhanh:** cần theo dõi headcount và biến động nhân sự theo khối để ra quyết định tuyển dụng.
- **Khối hành chính – nhân sự mỏng:** muốn giảm thời gian trả lời các câu hỏi tra cứu lặp lại về nhân sự.
- **Đơn vị cần một cơ cấu tổ chức nhìn thấy được:** để nhân viên tự tra cứu phòng ban, chức vụ thay vì hỏi HR.

## 7. Câu hỏi thường gặp

**Hệ thống này đã chạy ở đâu chưa?**
Chưa. Nội dung và ảnh trong tài liệu này là bản mô phỏng dự kiến, chưa triển khai cho khách hàng nào.

**Hệ thống có sẵn sàng dùng ngay không?**
Không. Đây là định hướng nội dung cho trang giới thiệu, sẽ được thay bằng thông tin của sản phẩm thật khi có.

**Có thể xem trước giao diện không?**
Có ảnh minh hoạ mô phỏng cho từng năng lực ở mục 4; đây không phải ảnh chụp hệ thống đang chạy.

**Hệ thống có tích hợp sẵn với phần mềm khác không?**
Chưa xác định. Mọi thông tin về tích hợp sẽ được cập nhật khi có sản phẩm thật.

## 8. Bảng mapping sang schema `.mdx`

### Mapping khối → field

| Khối trong README | Field trong `Solution` (`src/content/types.ts`) | Ghi chú |
|---|---|---|
| H1 — tên tài liệu nội bộ | `title` | Đổi sang title trung tính **“Quản trị nhân sự”** khi tạo trang public; giữ H1 hiện tại chỉ làm tên tài liệu nội bộ. |
| §2 Positioning | `description` | 1–2 câu dùng cho hero + meta description |
| §3 Vấn đề khách hàng gặp | `sections[0].intro` | mở đầu khối nội dung đầu tiên |
| §4 Năng lực chính | `features[]` — mỗi năng lực 1 phần tử dạng `"<Tiêu đề> — <mô tả>"` | 4 phần tử |
| §4 (chi tiết từng năng lực) | `sections[0].items[]` | có thể tách thành bullet |
| §4 Ảnh minh hoạ | `screenshots[]` | theo thứ tự ở bảng dưới |
| §5 Tích hợp / pháp quy | `sections[1]` | **không dùng** với HRM (mockup) |
| §6 Use case | `useCases[]` | 5 phần tử |
| §7 FAQ | `faq[]` | mảng `{ question, answer }`, 4 phần tử |
| Kết quả/giá trị (từ §2, §4) | `benefits[]` | 2–3 outcome ngắn |
| Số liệu | `highlights[]` | **để trống** — chờ user xác nhận số liệu hiển thị công khai |
| Cờ render | `renderExtendedContent: true` | để nhóm enterprise render `sections` / `useCases` / `faq` |

### Danh sách ảnh & thứ tự đề xuất

| # | File trong `screenshots/` | Dùng cho |
|---|---|---|
| 1 | `01-employee-directory.png` | §4 — Danh bạ nhân sự tập trung |
| 2 | `02-employee-profile.png` | §4 — Hồ sơ nhân sự |
| 3 | `03-request-workflow.png` | §4 — Quy trình đề xuất & phê duyệt |
| 4 | `04-org-structure.png` | §4 — Cơ cấu tổ chức |
| 5 | `05-people-lookup.png` | §4 — Tra cứu đội ngũ |

> **Khi có sản phẩm thật:** chụp ảnh thật theo quy ước `screenshots/NN-*.png`, ẩn danh PII, rồi viết lại
> `sections` / `useCases` / `faq` của trang từ ảnh thật và bật `highlights` nếu có số liệu xác nhận.
