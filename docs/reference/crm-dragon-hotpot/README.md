# Dragon Hot Pot CRM — Nguồn nội dung cho trang giải pháp CRM

> Nội dung suy ra từ **giao diện vận hành của hệ thống đang chạy thật** (không phải tài liệu kỹ thuật).
> Dùng làm nguồn để viết trang `/solutions/enterprise/crm` (vi + en).

## 1. Metadata

- **Nguồn ảnh:** ảnh chụp từ **hệ thống CRM đang chạy thật**.
- **URL hệ thống:** https://cms.dragonhotpotvietnam.com/
- **Chụp ngày:** 10/10/2026 · **viewport:** 1600×1000 · **theme:** tối (dark) · **ngôn ngữ:** tiếng Việt.
- **Tài khoản demo:** không ghi trong tài liệu này.
- **Dữ liệu khách hàng:** ảnh hiển thị tên, số điện thoại và ngày sinh mẫu ở các màn khách hàng; chưa có bằng chứng độc lập xác nhận mọi dữ liệu này là giả. Riêng widget sinh nhật trong `01-tong-quan.png` hiển thị tên/ngày sinh demo. Brand Dragon Hotpot, tên chi nhánh/địa điểm (gồm Dragon Hot Pot Lê Duẩn, Nguyễn Huệ, Võ Văn Tân) và email quản trị `admin@ntacrm.vn` vẫn hiển thị nguyên, chưa được redact.
- **Con số tổng quan quan sát trong ảnh (đặt ở Metadata làm mốc provenance, không dùng làm số liệu marketing):** khách hàng **2.627 / 132 trang** · đơn hàng **7.435 / 372 trang**.
- **Ảnh tiếng Việt**; trang `/en` dùng chung ảnh này (chấp nhận được).

> ⚠️ **Ảnh CRM chưa được redact đủ để đưa lên public.** Chúng còn chứa brand/logo Dragon Hotpot, tên chi nhánh/địa điểm (Lê Duẩn, Nguyễn Huệ, Võ Văn Tân), email quản trị `admin@ntacrm.vn`, cùng tên/số điện thoại/mã khách và dữ liệu giao dịch hiển thị. Trước khi ảnh được đưa lên trang public trong change `.mdx` sau, redact brand/logo, mọi tên chi nhánh/địa điểm, email/tên quản trị viên, tên/điện thoại/ngày sinh/mã khách, cùng mọi thông tin giao dịch có thể nhận diện; xác nhận riêng toàn bộ dữ liệu còn lại là giả.

## 2. Positioning — sản phẩm này là gì

CRM vận hành cho **chuỗi nhà hàng / F&B nhiều chi nhánh**: nơi dữ liệu khách từ hệ thống bán hàng (POS) được gom về một chỗ để chăm sóc lại, thay vì để mất sau mỗi giao dịch. Khác với CRM bán hàng B2B phổ thông nhập liệu thủ công, hướng này **bám sát POS và kênh nhắn tin** — khách được đồng bộ tự động từ POS, rồi được đẩy ngược sang kênh chăm sóc để giữ chân và nhắc quay lại.

## 3. Vấn đề khách hàng gặp

- Mỗi chi nhánh bán rất nhiều giao dịch mỗi ngày, nhưng dữ liệu khách chỉ nằm trong POS — không có chỗ để nhận diện khách quay lại và chăm sóc tiếp.
- Không biết ai là khách thân thiết, ai sắp sinh nhật, ai lâu rồi chưa quay lại — nên chăm sóc khách hàng gần như bỏ ngỏ.
- Nhắc bàn, nhắc sinh nhật, khuyến mãi… làm thủ công qua tin nhắn, dễ sót và không đo được hiệu quả.
- Chuỗi nhiều chi nhánh khó nhìn doanh thu, đơn hàng và tình hình vận hành chung trong một màn hình.

Đây là phần mở đầu cho khối nội dung "Vấn đề & giải pháp" của trang.

## 4. Giải pháp — năng lực chính

| Năng lực | Mô tả | Ảnh minh hoạ |
|---|---|---|
| **Tổng quan vận hành hằng ngày** | Một màn hình chào theo buổi kèm các chỉ số của ngày (khách, đơn, doanh thu, khiếu nại đang mở) và hai tiện ích vận hành: đặt bàn sắp tới và sinh nhật trong tuần — để nhìn "hôm nay thế nào" trong một cái liếc. | `screenshots/01-tong-quan.png` |
| **Hồ sơ khách hàng 360°** | Danh sách khách kèm bộ lọc theo phân hạng thành viên và theo mức độ quan tâm trên kênh nhắn tin; mở một khách ra là hồ sơ tổng hợp: lượt đến, lần đến gần nhất, tổng chi tiêu, điểm tích luỹ, lịch sử đơn hàng và lịch sử chăm sóc. | `screenshots/02-khach-hang.png`, `screenshots/03-chi-tiet-khach-hang.png` |
| **Quản lý đặt bàn theo chi nhánh** | Lịch và danh sách đặt bàn theo khoảng thời gian và trạng thái, đi theo chu trình rõ ràng (đã đặt → nhận bàn → hoàn tất / không đến / huỷ), giúp lễ tân và quản lý nắm tình hình từng chi nhánh. | `screenshots/04-dat-ban.png` |
| **Quản lý đơn hàng & đối soát doanh thu** | Danh sách đơn theo từng chi nhánh và kênh bán, kèm vòng đời trạng thái đầy đủ từ lúc đặt đến lúc thanh toán hoặc huỷ, hỗ trợ đối soát và báo cáo doanh thu giữa các chi nhánh. | `screenshots/05-don-hang.png` |

## 5. Tích hợp & bám văn bản pháp quy

Điểm khác biệt của hệ thống là nằm sẵn trong chuỗi vận hành, kết nối với các hệ thống bên ngoài:

| Hệ thống | Vai trò trong CRM |
|---|---|
| **CụcCuk POS** | Nguồn dữ liệu đơn hàng và đồng bộ hồ sơ khách (mã/ID), hỗ trợ đối soát thanh toán. |
| **Zalo OA** | Liên kết tài khoản khách, đo mức độ quan tâm, đẩy thông báo marketing. |
| **Cục gọi** | Ghi nhận cuộc gọi chăm sóc khách hàng. |

## 6. Use case theo quy mô/ngành

- **Chuỗi nhà hàng 3–20 chi nhánh, lượng giao dịch lớn mỗi ngày:** cần gom dữ liệu khách từ POS về một nơi để chăm sóc lại thay vì để trôi sau mỗi hoá đơn.
- **Chuỗi F&B muốn giữ chân khách quen:** cần nhận diện khách thân thiết, theo dõi lần đến gần nhất và nhắc lại đúng lúc.
- **Chuỗi đang dùng Zalo OA để chăm sóc khách:** cần biết khách nào đã liên kết kênh nhắn tin và mức độ quan tâm để gửi đúng người.
- **Chuỗi cần quản lý đặt bàn tại nhà hàng:** muốn theo dõi lịch đặt theo chi nhánh và không bỏ sót khách.
- **Ban điều hành chuỗi:** cần một màn hình tổng quan để nắm doanh thu, đơn hàng và khiếu nại giữa các chi nhánh.

## 7. Câu hỏi thường gặp

**Dữ liệu khách hàng đến từ đâu?**
Hệ thống lấy dữ liệu từ POS của chuỗi và liên kết với kênh Zalo OA, thay vì yêu cầu nhập tay.

**Có cần nhập lại khách hàng từ đầu không?**
Không. Khách được đồng bộ từ hệ thống bán hàng, nên hồ sơ đã có sẵn lượt đến và lịch sử mua.

**Hệ thống có phù hợp với chuỗi nhiều chi nhánh không?**
Có. Đơn hàng và đặt bàn đều theo từng chi nhánh, phục vụ đối soát và báo cáo doanh thu giữa các chi nhánh.

**Có hỗ trợ chăm sóc khách qua kênh nhắn tin không?**
Có liên kết với Zalo OA để đo mức độ quan tâm và gửi thông báo; các kênh khác sẽ được cập nhật khi cần.

## 8. Bảng mapping sang schema `.mdx`

### Mapping khối → field

| Khối trong README | Field trong `Solution` (`src/content/types.ts`) | Ghi chú |
|---|---|---|
| H1 — tên tài liệu nội bộ | `title` | Không dùng nguyên H1 trên trang public; đề xuất title trung tính **“Quản trị khách hàng (CRM)”**, không chứa tên khách hàng. Giữ H1 hiện tại chỉ làm tên tài liệu nội bộ. |
| §2 Positioning | `description` | 1–2 câu dùng cho hero + meta description |
| §3 Vấn đề khách hàng gặp | `sections[0].intro` | mở đầu khối nội dung đầu tiên |
| §4 Năng lực chính | `features[]` — mỗi năng lực 1 phần tử dạng `"<Tiêu đề> — <mô tả>"` | 4 phần tử |
| §4 (chi tiết từng năng lực) | `sections[0].items[]` | có thể tách thành bullet |
| §4 Ảnh minh hoạ | `screenshots[]` | theo thứ tự ở bảng dưới |
| §5 Tích hợp / pháp quy | `sections[1].title` + `sections[1].items[]` | POS, Zalo OA, Cục gọi |
| §6 Use case | `useCases[]` | 5 phần tử |
| §7 FAQ | `faq[]` | mảng `{ question, answer }`, 4 phần tử |
| Kết quả/giá trị (từ §2, §4) | `benefits[]` | 2–3 outcome ngắn |
| Số liệu | `highlights[]` | **để trống** — con số trong ảnh là mốc provenance, chờ user xác nhận số hiển thị công khai |
| Cờ render | `renderExtendedContent: true` | để nhóm enterprise render `sections` / `useCases` / `faq` |

### Danh sách ảnh & thứ tự đề xuất

| # | File trong `screenshots/` | Dùng cho |
|---|---|---|
| 1 | `01-tong-quan.png` | §4 — Tổng quan vận hành hằng ngày |
| 2 | `02-khach-hang.png` | §4 — Danh sách khách hàng + bộ lọc |
| 3 | `03-chi-tiet-khach-hang.png` | §4 — Hồ sơ khách hàng 360° |
| 4 | `04-dat-ban.png` | §4 — Quản lý đặt bàn theo chi nhánh |
| 5 | `05-don-hang.png` | §4 — Quản lý đơn hàng & đối soát doanh thu |
