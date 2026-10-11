# Kế hoạch chụp ảnh 4 trang giải pháp — Bước 1

> **Trạng thái 2026-10-11: đã thực thi Bước 1–4 cho cả 4 sản phẩm (HRM / LMS / CRM / DentGo).**
> Pipeline: `scripts/screenshots/` (xem `README.md`), ảnh ra: **`public/images/solutions/v2/<sản phẩm>/`**
> (26 ảnh + 24 crop; tên file **không** kèm hậu tố `-v2` vì đã nằm trong thư mục `v2/`),
> bảng đối chiếu: `docs/screenshots-mapping.md`.
> DentGo đã chụp được 5/5 — xem mục G1 (bẫy HTTP/HTTPS + app đã đổi API).
> Ảnh v2 **chưa nối vào `.mdx`** — web vẫn đang dùng ảnh cũ.

## A. Điều kiện kỹ thuật đã kiểm tra

| Hạng mục | Kết quả |
|---|---|
| Đăng nhập 3 sản phẩm | ✅ LMS (iSmartSchool, 3 trường, vào được trường Phương Nam) · ✅ CRM (2.627 khách thật) · ✅ DentGo (HTTP được; **HTTPS lỗi chứng chỉ** `ERR_CERT_COMMON_NAME_INVALID` → dùng `http://` hoặc Edge `--ignore-certificate-errors` khi capture) |
| Thư viện ảnh | Chỉ có `sharp` (đã dùng đo ảnh). Chưa có Playwright/Puppeteer → **capture.ts sẽ chạy qua CDP thuần** (Edge có sẵn trên máy + WebSocket built-in của Node 24, không cần thêm dependency, không đụng package.json) |
| Đóng khung | Script render wrapper HTML (khung macOS theo `design-tokens.md`) → screenshot lại wrapper. Mọi ảnh 4 sản phẩm đồng nhất |
| Dữ liệu giả | Chặn API bằng **CDP Fetch domain** (tương đương Playwright `page.route`) trước khi chụp, trên chính giao diện thật; fallback: thay text DOM bằng `page.evaluate` |
| An toàn | Thông tin đăng nhập đọc từ `.env.local` (đã tạo, đã nằm trong `.gitignore` dòng 1); **không** hardcode trong script, không commit, không in log |

## B. LMS — trang mới 4 tính năng (ảnh vào `public/images/solutions/v2/lms/`)

Màn hình thật đã khảo sát (route + API sẽ thay dữ liệu):

| STT | Tính năng (theo yêu cầu) | Màn hình | Route | API sẽ chặn (base `http://187.52.119.50:4001/v1`) |
|---|---|---|---|---|
| — | **Hero: tổng quan đa trường** | Tổng quan nhiều trường | `/workspace` | `workspace/scope`, `workspace/dashboard` |
| 1 | Quản trị đa trường & bảng điều khiển | Bảng điều khiển trường | `/dashboard` | `students/count`, `tasks/dashboard`, `classes`, `tenants/{id}/academic-years` |
| 2 | Hồ sơ học sinh – phụ huynh – nhân sự | Danh sách học sinh | `/people/students` | `students?page&limit`, `classes`, `grade-blocks`, `parents` |
| 3 | Đánh giá học sinh có trợ lý AI gợi ý nhận xét | Nhận xét thường xuyên (TT27 + AI) | `/assessment/tt27/regular?academicYearId=…&subjectId=…&classId=…` | `tt27/regular-comments?classId&subjectId&term`, `comment-templates?subjectName=`, `students?classId`, `subjects`, `grade-blocks`, `classes` |
| 4 | Thời khoá biểu kéo–thả · giáo án điện tử · học bạ số | (3 ảnh: TKB chế độ "Soạn / xếp lịch"; giáo án điện tử; học bạ số) | `/timetable` → `/curriculum/lesson-plans` → `/academic-records` | `timetables?academicYearId&campusId&date`, `lesson-plans`, `academic-records`, `academic-records/creation-deadline` |

**Crop riêng theo yêu cầu:** khung Trợ lý AI gợi ý nhận xét (từ màn TT27), màn hình đánh giá theo
Thông tư 27 (lưới CHEMẤU), màn hình học bạ số chu trình ký/phát hành (Ký GVCN → Tạo phiên bản mới →
Ký BGH → Xác thực → Word/PDF).

**Đặt tên file** (thư mục `v2/lms/`, không đụng ảnh cũ):

```
01-tong-quan.png            hero — /workspace (tổng quan đa trường)
02-quan-tri-bang-dieu-khien.png   tính năng 1 — /dashboard   (+ -crop: bảng thẻ số liệu)
03-ho-so-hoc-sinh.png       tính năng 2 — /people/students  (+ -crop: bảng hồ sơ + GVCN)
04-danh-gia-ai.png          tính năng 3 — /assessment/tt27/regular
04-danh-gia-ai-crop.png          crop khung Trợ lý AI gợi ý nhận xét
04-danh-gia-ai-tt27-crop.png     crop lưới nhận xét Thông tư 27
05-thoi-khoa-bieu.png       tính năng 4 — /timetable (Soạn / xếp lịch, kéo–thả)
06-giao-an-dien-tu.png      tính năng 4 — /curriculum/lesson-plans
07-hoc-ba-so.png            tính năng 4 — /academic-records
07-hoc-ba-so-crop.png            crop chu trình ký / phát hành học bạ
```

Đối chiếu ảnh cũ → mới (đưa vào `docs/screenshots-mapping.md` ở Bước 4):
01 đa trường→`01`, 02 dashboard→`02`, 03 học sinh→`03`, 04 TT27→`04`+2 crop, 05 TKB→`05`,
06 giáo án→`06`, 07 học bạ→`07`+crop.

## C. CRM (ảnh vào `public/images/solutions/v2/crm/`)

| Tính năng (crm.mdx) | Màn hình | Route | API sẽ chặn (base `https://cms.dragonhotpotvietnam.com/api`) |
|---|---|---|---|
| **Hero: Tổng quan vận hành hằng ngày** | "Hôm nay thế nào?" + đặt bàn sắp tới + sinh nhật tuần | `/` | `dashboard/summary`, `visits?status=RESERVED…` |
| Hồ sơ khách hàng 360° | Danh sách khách + chi tiết 360° | `/customers`, `/customers/{id}` | `customers?page&pageSize`, `customers/{id}`, `zalo/links/{id}`, `visits?customerId=`, `loyalty/tiers`, `branches` |
| Quản lý đặt bàn theo chi nhánh | Lịch + danh sách đặt bàn | `/reservations` | `visits?page&pageSize&status=RESERVED&from&to` (hiện **trống** → bắt buộc bơm dữ liệu giả) |
| Quản lý đơn hàng & đối soát doanh thu | Danh sách đơn | `/orders` | `orders?page&pageSize&sortBy=orderedAt` |

File: `01-tong-quan.png` (hero) · `02-khach-hang.png` · `03-chi-tiet-khach-hang.png` ·
`04-dat-ban.png` · `05-don-hang.png` (+ `-crop` cho mỗi ảnh).
Yêu cầu đặc biệt: CRM có **dữ liệu thật** (tên + SĐT khách thật) → chặn API thay toàn bộ;
tên chi nhánh "Dragon Hot Pot …" cũng đến từ `branches` → thay bằng tên giả (xem mục F).
**Logo** `/logo-256.png` nằm trong bundle app → `domPatch` không sửa được ảnh, phải dùng
`staticRules` trong `live.mjs` trả logo giả (sinh bởi `brand.mjs`).

## D. DentGo (ảnh vào `public/images/solutions/v2/dentgo/`)

| Tính năng (dentgo.mdx) | Màn hình | Route | API sẽ chặn (base `…/api/v1`) |
|---|---|---|---|
| **Hero: Tổng quan ca làm đa chi nhánh** | Dashboard "Chào BS…" | `/internal` | `dashboard/financial-summary?date`, `visits?date&allDoctors`, `appointments?date` |
| Hồ sơ khách hàng & hồ sơ RHM/EMR | Danh sách hồ sơ + Hồ sơ RHM chi tiết | `/internal/patients`, `/internal/patients/{id}/dental-record` | `patients?visitDate&page&pageSize`, `patients/{id}/visits`, `patients/{id}` |
| Lịch hẹn & chăm sóc khách | Lịch hẹn tháng | `/internal/schedule` | `appointments?fromDate&toDate`, `appointments/options` |
| Kho vật tư – thuốc gắn vào điều trị | Danh mục vật tư | `/internal/inventory/items` | `inventory/items` |

File: `01-tong-quan.png` (hero) · `02-ho-so-khach-hang.png` · `03-ho-so-rhm.png` ·
`04-lich-hen.png` · `05-kho-vat-tu.png` (+ `-crop` cho cả 5).
Lưu ý: tên user "Bác sĩ Demo 1" (từ `auth/me`) và "Nha khoa Demo 1" (từ `admin/branches`) → thay tên giả.
Bảng của DentGo rộng hơn khung 1328px nên app cuộn ngang: cột cuối ("Trạng thái" ở lịch hẹn,
"Nhà cung cấp/P.K" ở kho) bị cắt ở mép phải → giữ nguyên để đồng bộ khung với 3 sản phẩm kia.

## E. HRM — mock `scripts/screenshots/mock-hrm/` (ảnh vào `public/images/solutions/v2/hrm/`)

Màn dựng theo danh sách tính năng trong `src/content/solutions/vi/hrm.mdx`
(Hồ sơ nhân sự · Quy trình đề xuất · Tra cứu thông tin đội ngũ + các mục trong sections:
cơ cấu tổ chức, hợp đồng, phân quyền, nhập dữ liệu, thông báo, kết xuất báo cáo)
cộng danh sách tối thiểu của anh:

| STT | Màn mock | Nội dung | Ảnh |
|---|---|---|---|
| 1 | **Tổng quan nhân sự** | 4 thẻ số liệu + biểu đồ biến động nhân sự theo tháng + hoạt động gần đây | `01-tong-quan.png` (hero) + crop |
| 2 | **Hồ sơ nhân viên — danh sách** | Lọc phòng ban/chức danh/trạng thái, bảng 10–12 dòng | `02-ho-so-nhan-vien.png` + crop |
| 3 | **Hồ sơ nhân viên — chi tiết** | Thông tin cá nhân, hợp đồng, quá trình công tác | `03-chi-tiet-nhan-vien.png` + crop |
| 4 | **Chấm công** | Lưới tháng 10/2026, ký hiệu đi làm/nghỉ phép/đi muộn | `04-cham-cong.png` + crop |
| 5 | **Tính lương** | Bảng lương: lương CB, phụ cấp, khấu trừ, BHXH, thực nhận | `05-tinh-luong.png` + crop |
| 6 | **Nghỉ phép** | Danh sách đơn: chờ duyệt / đã duyệt / từ chối | `06-nghi-phep.png` + crop |
| 7 | **Cơ cấu tổ chức** | Sơ đồ phòng ban + người phụ trách + quy mô | `07-co-cau-to-chuc.png` + crop |
| 8 | **Quy trình đề xuất/phê duyệt** | Danh sách đề xuất + luồng trạng thái có dấu vết | `08-quy-trinh-de-xuat.png` + crop |
| 9 | **Tra cứu thông tin đội ngũ** | Danh bạ lọc nhanh theo phòng ban/chức vụ | `09-tra-cuu-doi-ngu.png` + crop |

Số liệu thực tế VN: BHXH 8% + BHYT 1,5% + BHTN 1% = **10,5%** phía người lao động
(21,5% phía công ty: 17,5+3+1); thuế TNCN lũy tiến 5→35%, giảm trừ bản thân 15,5 tr + phụ thuộc 6,2 tr/tháng;
lương đúng mặt bằng theo chức danh; **ngày công chuẩn tháng 10/2026 = 22 ngày** (không lễ);
lương thực nhận = thu nhận − khấu trừ, tổng hợp khớp từng dòng.

## F. Dữ liệu giả — đề xuất tên giả (mời anh xác nhận)

| Vị trí | Hiện tại | Đề xuất giả |
|---|---|---|
| CRM tên chuỗi/branch | "Dragon Hot Pot Cao Thắng", "… Trần Quang Khải" | Chuỗi **"Hồng Phúc Nướng & Lẩu"**, branch "CS Cao Thắng", "CS Trần Quang Khải" |
| LMS tên trường | "Trường Tiểu học Phương Nam / Hoàng Văn Thụ / Nguyễn Bỉnh Khiêm" (tên người thật) | **"Trường Tiểu học Minh Châu"**, "Trường Tiểu học Hoa Phượng", "Trường Tiểu học Bình Minh" |
| DentGo phòng khám | "Nha khoa Demo 1", "Chi Nhánh Hà Nội" | **"Nha khoa Minh Tâm"** (CS Hoàng Văn Thụ → đổi "CS Trần Duy Hưng", "CS Nguyễn Trãi") |
| HRM công ty | — (mock) | **"Công ty TNHH Giải pháp Minh Quang"** — VPHN + TP.HCM |

Quy tắc chung: họ tên VN đa dạng không lặp; SĐT che `0912 *** 456`; email `@example.com`;
CCCD/địa chỉ giả; ngày tháng quanh 10/2026; tiền format VNĐ (`24.500.000đ`); **không** chữ
"mock/demo/lorem" trong ảnh; bảng 8–12 dòng đầy đủ, không ô trống. Bộ fixture lưu
`scripts/screenshots/fixtures/<slug>.json`.

## G. Thứ tự thực hiện — **đã xong cả 4 bước (2026-10-11)**

1. ✅ Dựng `mock-hrm/` (9 màn, HTML/CSS tĩnh) + `fixtures/*.json` 4 sản phẩm.
2. ✅ Viết `capture.mjs` (tham số slug): login → chọn ngữ cảnh → chặn API trả fixture → chờ dữ liệu → chụp → đóng khung → crop. README cách chạy + cách mở mock.
3. ✅ Chụp 1 ảnh mẫu/sản phẩm gửi duyệt.
4. ✅ Chụp hàng loạt + viết `docs/screenshots-mapping.md` — HRM 9 · LMS 7 · CRM 5 · DentGo 5 (mỗi ảnh có `-crop` riêng).

Cấu hình crop nằm ở `shots.mjs` (`crop` = 1 vùng, `crops` = nhiều vùng có nhãn → `<tên>-<nhãn>-crop.png`;
vùng khai báo bằng CSS selector (`sel`) **hoặc** chuỗi hiển thị (`text`) — dùng `text` khi app đổi class
thường xuyên, ví dụ khối "Trợ lý AI gợi ý" của LMS). Chạy lại 1 ảnh: `capture.mjs lms --only=04`.

### G1. DentGo — 2 bẫy đã mắc (đừng vướng lại)

1. **Frontend chỉ phục vụ HTTP.** `http://demo1.76.13.214.188.sslip.io` → SPA 200;
   `https://…` cùng host → API Express trả `404 {"statusCode":404,…}`. Edge headless tự nâng
   HTTP→HTTPS nên luôn thấy 404 → phải thêm `--disable-features=HttpsUpgrades,HttpsFirstModeV2,
   HttpsFirstBalancedModeAutoEnable` (đã có trong `capture.mjs` + `inspect.mjs`) và để `DENTGO_URL`
   là `http://`. Đăng nhập ở `/login` (không phải `/internal/login`).
2. **App đã đổi API so với lúc lập kế hoạch.** Fixture + `rules` trong `live.mjs` đã viết lại theo
   shape đo lại ngày 2026-10-11: `/auth/me` (+ `effectiveModules/Features`), `/admin/branches` →
   `{branches}`, `/patients?visitDate` → `{patients,pagination}`, `/clinical/patients/{id}/dental-record`
   → `{record}`, `/inventory/items` → `{items}` (type `MATERIAL|MEDICATION`), thêm `/subscription/current`,
   `/zalo/conversations`, `/support/conversation/unread-count`, `/visits`. Rule có thể lọc theo query
   (`?date`, `?fromDate&toDate`) vì `rule.body(fixture, url)` nhận URL.
   → Khi app đổi: `capture.mjs <slug> --probe` ghi lại traffic thật, sửa `build-<slug>-fixture.mjs`, chạy lại.

### G2. Bốn lỗi ảnh đã phát hiện khi soi lại (đã sửa, để đừng tái diễn)

1. **`[object Object]` trong ảnh LMS.** `/students/count` thật trả **envelope** `{success, data: <số>}`;
   fixture trả `{count: 18}` nên app `String(data)` ra `[object Object]` — xuất hiện ở 3 chỗ
   (thẻ Học sinh, thẻ Người dùng, dòng "Học sinh đang theo học"). Sửa: `body: (F) => env(F.students.length)`.
   → **Luôn trả đúng envelope `{success, data, message, meta}`** cho API kiểu này.
2. **Logo thật lọt vào ảnh CRM.** `/logo-256.png` nằm trong bundle app, `domPatch` chỉ sửa text
   node nên không đổi được. Sửa: `staticRules` trong `live.mjs` chặn `/logo*` trả logo giả do
   `brand.mjs` sinh. Lưu ý: profile Edge giữ cache giữa các lần chạy → phải
   `Network.clearBrowserCache` trước khi chụp (đã thêm trong `capture.mjs`), nếu không logo cũ vẫn ra.
3. **Sidebar ngắn hơn nội dung — KHÔNG phải lỗi, đừng sửa.** LMS (`fixed`, `height:900px`) và CRM
   (`sticky`, `h-screen`) chỉ vẽ trong 1 viewport. Đã thử 2 cách: (a) ép sidebar về `position:static`
   → **phá layout**, LMS mất chiều cao trang và rớt về trang đăng nhập; (b) chèn lớp nền tô cột
   sidebar xuống hết trang → ảnh thành **một khối trắng trống to đùng, tệ hơn bản gốc**. Cả hai đã
   gỡ. Phần bên dưới sidebar là **nền trang** và nhìn y hệt app thật mở trong trình duyệt → giữ nguyên.
4. **DentGo mất nội dung dưới 1 viewport.** Cả app ghim bằng `position: fixed` + cuộn nội bộ →
   `document.scrollHeight` chỉ = 900px, chụp full-page mất sạch phần dưới. Sửa: bật `unlockHeight`
   (riêng DentGo) để bỏ `height:100vh` / `overflow` và bỏ `position:fixed` trước khi chụp.
   → Khi chụp lại: **wrapper phải có `?t=<timestamp>`**, vì URL `.tmp/app-*.png` không đổi nên Edge
   trả ảnh cached → khung ra ngắn hơn trang thật (đã mắc lúc này, nhớ sửa).

### G3. Một điểm KHÔNG sửa được (để anh biết khi duyệt ảnh)

CRM hiển thị ngày theo kiểu Mỹ (`10/14/2026, 5:30:00 PM`) dù giao diện đang ở chế độ **VI**.
Đã thử bấm nút ngôn ngữ — không đổi; app không lưu locale ở localStorage. Đây là hành vi thật của
app demo nên **giữ nguyên**, không bịa ra định dạng khác (sửa ảnh thành `14/10/2026` sẽ không
còn trung thực với sản phẩm).

## H. Câu hỏi cần anh chốt

1. Tên giả ở mục F (CRM/LMS/DentGo/HRM) — dùng như đề xuất hay đổi?
2. HRM: 9 màn như bảng E có quá nhiều không (mỗi màn 2 ảnh = 18 ảnh)? Muốn cắt bớt màn nào?
3. Crop "vùng quan trọng nhất" mỗi tính năng: chụp trực tiếp vùng DOM (chiều cao crop tối đa 620px) có ổn không?
4. Tên ảnh v2 đặt trong thư mục `solutions/v2/<sản phẩm>/` (không dùng hậu tố `-v2`) — ổn chứ?

> **Đã áp dụng tạm theo đề xuất ở mục F, chưa có xác nhận chính thức:** CRM "Hồng Phúc Nướng & Lẩu",
> LMS "Trường Tiểu học Minh Châu", DentGo "Nha khoa Minh Tâm", HRM mock.
> Crop áp dụng cho **mọi ảnh** của cả 4 sản phẩm (cao tối đa 620px). Muốn đổi thì sửa
> `build-<slug>-fixture.mjs` (tên giả) hoặc `shots.mjs` (vùng crop) rồi chạy lại `capture.mjs <slug>`.

## I. Kiểm tra ảnh trước khi chốt

Script soi **chữ thật hiển thị** trên từng màn (thay vì mắt thủ công): `audit-text.mjs`
(có trong `.tmp/`). Bắt: `[object Object]`, `undefined`/`NaN`, lỗi encoding, UI tiếng Anh lọt,
và tên/brand/URL/email thật của khách hàng demo. Kết quả 2026-10-11: **0 vấn đề trên 26 màn**.