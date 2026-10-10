# iSmartSchool LMS — Nguồn nội dung cho trang giải pháp Quản trị trường học

> Nội dung suy ra từ **giao diện vận hành của hệ thống đang chạy thật** (không phải tài liệu kỹ thuật).
> Dùng làm nguồn để viết trang giải pháp giáo dục (vi + en).

## 1. Metadata

- **Nguồn ảnh:** ảnh chụp từ **hệ thống đang chạy thật**.
- **URL hệ thống:** http://187.52.119.50:3002/ (địa chỉ hệ thống thật; không đưa lên trang public).
- **Chụp ngày:** 10/10/2026 · **viewport:** 1600×1000 · **theme:** sáng (light) · **ngôn ngữ:** tiếng Việt.
- **Tài khoản demo:** `dieuhanh.lientruong` — Quản trị viên trường, phạm vi phân quyền **3 trường**.
- **Dữ liệu trong ảnh:** giao diện có tên người, tên trường và mã học sinh; chưa có bằng chứng độc lập xác nhận mọi dữ liệu là giả hoặc không chứa PII thực.
- **Con số quan sát trong ảnh demo (mốc provenance, không dùng làm số liệu marketing):** **91 học sinh** hiển thị ở `02-dashboard-tong-quan.png` và `03-hoc-sinh.png`; **3 trường** hiển thị ở `01-da-truong-tong-quan.png` và là phạm vi tài khoản demo. Không nêu phiên bản sản phẩm vì không quan sát thấy trong ảnh; bỏ số liệu 30 tài khoản phụ huynh vì chưa đối chiếu được với ảnh.
- **Ảnh tiếng Việt**; trang `/en` dùng chung ảnh này (chấp nhận được).

> ⚠️ **Ảnh LMS và URL hệ thống chưa được rà/ẩn danh đủ để đưa lên public.** URL IP hệ thống thật được ghi ở trên; ảnh còn hiển thị tên trường, tên học sinh/phụ huynh/giáo viên và tên tài khoản quản trị demo (ví dụ Nguyễn Thanh Hà). Trước khi đưa ảnh lên public trong change `.mdx` sau, không đưa URL hệ thống lên trang; redact URL/địa chỉ truy cập nếu xuất hiện, tên trường, tên và mã học sinh, tên phụ huynh/giáo viên/quản trị viên, cùng mọi email hoặc dữ liệu nhận diện khác; xác nhận toàn bộ dữ liệu là giả.

## 2. Positioning — sản phẩm này là gì

Một hệ thống quản trị trường học **đa trường (multi-tenant)**, bao phủ gần như toàn bộ vòng đời vận hành của một trường: chương trình & thời khoá biểu → giảng dạy → đánh giá học sinh → học bạ số → hành chính → báo cáo điều hành. Khác với "LMS online" chỉ làm bài tập/thi, đây là **một hệ thống trường học hoàn chỉnh** thay cho nhiều phần mềm rời rạc, và bám sát văn bản pháp quy của ngành giáo dục Việt Nam.

## 3. Vấn đề khách hàng gặp

- Trường dùng nhiều phần mềm rời cho điểm số, thời khoá biểu, học bạ và hành chính — nhập liệu trùng và dữ liệu lệch nhau giữa các hệ thống.
- Học bạ phải làm theo quy định với nhiều mốc thời hạn và chu trình ký/phát hành, dễ sai sót và khó truy vết ai đã xem hay sửa.
- Giáo viên phải nhận xét từng học sinh theo quy định đánh giá, việc soạn nhận xét lặp lại tốn rất nhiều thời gian.
- Trường có nhiều điểm trường / nhiều cơ sở khó tổng hợp số liệu và báo cáo điều hành.
- Dữ liệu phải đẩy lên hệ thống ngành, nhưng làm thủ công nên dễ chậm và thiếu đồng bộ.

Đây là phần mở đầu cho khối nội dung "Vấn đề & giải pháp" của trang.

## 4. Giải pháp — năng lực chính

| Năng lực | Mô tả | Ảnh minh hoạ |
|---|---|---|
| **Quản trị đa trường & bảng điều khiển** | Một tài khoản quản trị nhiều trường: xem chỉ số tổng hợp cấp liên trường rồi bấm vào từng trường, và bảng điều khiển của mỗi trường với chỉ số học sinh, người dùng hoạt động, lớp học và tiến độ công việc. | `screenshots/01-da-truong-tong-quan.png`, `screenshots/02-dashboard-tong-quan.png` |
| **Hồ sơ học sinh – phụ huynh – nhân sự** | Danh sách học sinh lọc theo khối/lớp/trạng thái, hồ sơ gắn với phụ huynh và giáo viên chủ nhiệm; quản lý biến động học sinh và nhân sự trong cùng hệ thống. | `screenshots/03-hoc-sinh.png` |
| **Đánh giá học sinh theo quy định, có AI hỗ trợ** | Nghiệp vụ đánh giá đi theo đúng các bước (nhận xét thường xuyên, đánh giá định kỳ, năng lực & phẩm chất, tổng hợp & chốt); trợ lý AI gợi ý câu nhận xét ngay trong màn hình để giáo viên soạn nhanh mà vẫn đúng chuẩn. | `screenshots/04-danh-gia-tt27.png` |
| **Điều hành giảng dạy: thời khoá biểu · giáo án · học bạ số** | Xếp thời khoá biểu bằng kéo–thả và xuất Excel/PDF; giáo án điện tử đi theo vòng đời soạn–duyệt gắn với bài học; học bạ số với mốc tạo lập, chu trình ký và phát hành, kèm nhật ký truy cập. | `screenshots/05-thoi-khoa-bieu.png`, `screenshots/06-giao-an-dien-tu.png`, `screenshots/07-hoc-ba-so.png` |

## 5. Tích hợp & bám văn bản pháp quy

Khác với phần mềm quản trị trường thông thường, các quy định của ngành được đưa thẳng vào màn hình nghiệp vụ thay vì để thành tuỳ chọn phụ:

| Văn bản / kết nối | Áp dụng ở đâu trong sản phẩm |
|---|---|
| **Thông tư 27/2018** | Màn hình **Đánh giá học sinh** — nhận xét thường xuyên, đánh giá định kỳ, năng lực & phẩm chất, tổng hợp & chốt. |
| **Thông tư 70/2025 (Đ7.4)** | Màn hình **Học bạ số** — hạn tạo lập, ký giáo viên chủ nhiệm/ban giám hiệu, phát hành, xác thực. |
| **Liên thông CSDL ngành** | Mục quản trị riêng — đẩy dữ liệu trường lên cơ sở dữ liệu ngành. |
| **AI nghiệp vụ** | Trợ lý hỏi đáp quy định, gợi ý nhận xét, tóm tắt biên bản, soạn thông báo, cảnh báo sớm — kèm nhật ký sử dụng AI. |

## 6. Use case theo quy mô/ngành

- **Trường tiểu học đơn lẻ muốn số hoá toàn bộ vận hành:** gom điểm số, thời khoá biểu, học bạ và hành chính về một hệ thống.
- **Đơn vị quản lý nhiều trường / nhiều điểm trường:** cần một tài khoản xem tổng hợp liên trường rồi đi vào từng cơ sở.
- **Trường cần tuân thủ nghiêm quy định về đánh giá và học bạ:** muốn mốc thời hạn, chu trình ký và phát hành nằm sẵn trong hệ thống.
- **Trường muốn giảm thời gian soạn nhận xét cho giáo viên:** dùng trợ lý gợi ý nhận xét ngay trong màn hình đánh giá.
- **Ban giám hiệu cần báo cáo điều hành nhanh:** dùng bảng điều khiển và báo cáo thay cho việc gom số liệu thủ công.

## 7. Câu hỏi thường gặp

**Hệ thống này khác gì một LMS học trực tuyến?**
Đây là hệ thống quản trị trường học đầy đủ (chương trình, thời khoá biểu, đánh giá, học bạ, hành chính, báo cáo), không chỉ là nơi làm bài tập hay thi online.

**Có dùng được cho nhiều trường trên cùng một tài khoản không?**
Có. Hệ thống là đa trường: một tài khoản quản trị có thể quản lý nhiều trường và xem tổng hợp liên trường.

**Việc đánh giá và học bạ có bám quy định không?**
Có. Đánh giá học sinh và học bạ số được thiết kế theo đúng các thông tư của ngành giáo dục.

**Trợ lý AI làm được gì?**
AI gợi ý nhận xét học sinh ngay trong màn hình đánh giá, hỗ trợ soạn thông báo, tóm tắt biên bản và cảnh báo sớm; có nhật ký để tra lại lịch sử sử dụng.

## 8. Bảng mapping sang schema `.mdx`

### Mapping khối → field

| Khối trong README | Field trong `Solution` (`src/content/types.ts`) | Ghi chú |
|---|---|---|
| H1 — tên tài liệu nội bộ | `title` | Không dùng nguyên H1 trên trang public; đề xuất title trung tính **“Quản trị trường học”**, không chứa tên khách hàng/sản phẩm. Giữ H1 hiện tại chỉ làm tên tài liệu nội bộ. |
| §2 Positioning | `description` | 1–2 câu dùng cho hero + meta description |
| §3 Vấn đề khách hàng gặp | `sections[0].intro` | mở đầu khối nội dung đầu tiên |
| §4 Năng lực chính | `features[]` — mỗi năng lực 1 phần tử dạng `"<Tiêu đề> — <mô tả>"` | 4 phần tử |
| §4 (chi tiết từng năng lực) | `sections[0].items[]` | có thể tách thành bullet |
| §4 Ảnh minh hoạ | `screenshots[]` | theo thứ tự ở bảng dưới |
| §5 Tích hợp / pháp quy | `sections[1].title` + `sections[1].items[]` | TT27, TT70 Đ7.4, liên thông CSDL ngành, AI nghiệp vụ |
| §6 Use case | `useCases[]` | 5 phần tử |
| §7 FAQ | `faq[]` | mảng `{ question, answer }`, 4 phần tử |
| Kết quả/giá trị (từ §2, §4) | `benefits[]` | 2–3 outcome ngắn |
| Số liệu | `highlights[]` | **để trống** — con số trong ảnh là mốc provenance, chờ user xác nhận số hiển thị công khai |
| Cờ render | `renderExtendedContent: true` | để nhóm enterprise render `sections` / `useCases` / `faq` |

### Danh sách ảnh & thứ tự đề xuất

| # | File trong `screenshots/` | Dùng cho |
|---|---|---|
| 1 | `01-da-truong-tong-quan.png` | §4 — Quản trị đa trường (tổng quan liên trường) |
| 2 | `02-dashboard-tong-quan.png` | §4 — Bảng điều khiển một trường |
| 3 | `03-hoc-sinh.png` | §4 — Hồ sơ học sinh – phụ huynh – nhân sự |
| 4 | `04-danh-gia-tt27.png` | §4 — Đánh giá học sinh (kèm AI gợi ý nhận xét) |
| 5 | `05-thoi-khoa-bieu.png` | §4 — Thời khoá biểu |
| 6 | `06-giao-an-dien-tu.png` | §4 — Giáo án điện tử |
| 7 | `07-hoc-ba-so.png` | §4 — Học bạ số |
