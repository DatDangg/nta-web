# Bảng đối chiếu ảnh giải pháp: bản cũ → bộ mới (v2)

> Sinh bởi `scripts/screenshots/capture.mjs` (xem `scripts/screenshots/README.md`).
> Ảnh mới: **1328px nội dung + khung macOS, 2880px @2x** — đồng nhất cả 4 sản phẩm.
> Ngày chụp: 2026-10-11. Dữ liệu trong ảnh là **dữ liệu giả** (fixtures), app là bản thật.

## Thư mục

| Thư mục | Nội dung | Web dùng? |
|---|---|---|
| `public/images/solutions/<sản phẩm>/` | ảnh **cũ** (khung ảnh tự do, HRM là mockup vẽ tay) | ✅ đang dùng |
| `public/images/solutions/v2/<sản phẩm>/` | ảnh **mới** (khung macOS đồng nhất, + bản `-crop`) | ❌ chưa nối |

Bộ v2 gồm **26 ảnh + 24 ảnh crop**. Tên file **không** kèm hậu tố `-v2` vì đã nằm trong thư mục `v2/`.

## HRM — `public/images/solutions/v2/hrm/`

Nguồn: mock `scripts/screenshots/mock-hrm` (9 màn) — bộ ảnh cũ là mockup vẽ tay, không theo khung macOS.

| Ảnh cũ (trang HRM đang dùng) | Ảnh mới | Màn hình |
|---|---|---|
| `hrm/01-employee-directory.png` | `v2/hrm/01-tong-quan.png` | Tổng quan nhân sự (KPI + biến động + tuyển dụng) |
| `hrm/02-employee-profile.png` | `v2/hrm/02-ho-so-nhan-vien.png` | Danh sách hồ sơ nhân sự |
| `hrm/03-request-workflow.png` | `v2/hrm/03-chi-tiet-nhan-vien.png` | Chi tiết hồ sơ (thông tin · hợp đồng · quá trình công tác) |
| `hrm/04-org-structure.png` | `v2/hrm/04-cham-cong.png` | Chấm công tháng (lưới ngày) |
| `hrm/05-people-lookup.png` | `v2/hrm/05-tinh-luong.png` | Bảng lương (BHXH/BHYT/BHTN + thuế TNCN lũy tiến) |
| — | `v2/hrm/06-nghi-phep.png` | Nghỉ phép (đơn chờ duyệt/đã duyệt/từ từ chối) |
| — | `v2/hrm/07-co-cau-to-chuc.png` | Cơ cấu tổ chức |
| — | `v2/hrm/08-quy-trinh-de-xuat.png` | Quy trình đề xuất & phê duyệt |
| — | `v2/hrm/09-tra-cuu-doi-ngu.png` | Tra cứu thông tin đội ngũ |

9 ảnh + 9 crop. Công ty trong ảnh: **Minh Quang HRM** (dữ liệu giả).

## LMS — `public/images/solutions/v2/lms/`

| Ảnh cũ | Ảnh mới | Màn hình |
|---|---|---|
| `lms/01-da-truong-tong-quan.png` | `v2/lms/01-tong-quan.png` | `/workspace` — tổng quan đa trường (3 trường) |
| `lms/02-dashboard-tong-quan.png` | `v2/lms/02-quan-tri-bang-dieu-khien.png` | `/dashboard` — bảng điều khiển trường |
| `lms/03-hoc-sinh.png` | `v2/lms/03-ho-so-hoc-sinh.png` | `/people/students` — hồ sơ học sinh |
| `lms/04-danh-gia-tt27.png` | `v2/lms/04-danh-gia-ai.png` | `/assessment/tt27/regular` — nhận xét TT27 + **trợ lý AI gợi ý** |
| `lms/05-thoi-khoa-bieu.png` | `v2/lms/05-thoi-khoa-bieu.png` | `/timetable` — xếp lịch kéo–thả toàn trường |
| `lms/06-giao-an-dien-tu.png` | `v2/lms/06-giao-an-dien-tu.png` | `/curriculum/lesson-plans` — giáo án điện tử |
| `lms/07-hoc-ba-so.png` | `v2/lms/07-hoc-ba-so.png` | `/academic-records` — học bạ số (chu trình ký/phát hành) |

Trường trong ảnh: **Trường Tiểu học Minh Châu** (thay tên trường thật).

5 crop: `02-…-crop` (thẻ số liệu) · `03-…-crop` (bảng hồ sơ + GVCN) · `04-danh-gia-ai-crop`
(khung Trợ lý AI gợi ý) · `04-danh-gia-ai-tt27-crop` (lưới nhận xét TT27) · `07-hoc-ba-so-crop`
(chu trình ký / phát hành). 3 ảnh `01`, `05`, `06` không crop.

> Lưu ý khi xem: thẻ "Người dùng" trên bảng điều khiển hiện **cùng số với thẻ "Học sinh"** — đây là
> lỗi của app demo (cả hai cùng đọc `/students/count`), không phải lỗi fixture.

## CRM — `public/images/solutions/v2/crm/`

| Ảnh cũ | Ảnh mới | Màn hình |
|---|---|---|
| `crm/01-tong-quan.png` | `v2/crm/01-tong-quan.png` | "Hôm nay thế nào?" — KPI + đặt bàn sắp tới + sinh nhật tuần |
| `crm/02-khach-hang.png` | `v2/crm/02-khach-hang.png` | Danh sách khách hàng |
| `crm/03-chi-tiet-khach-hang.png` | `v2/crm/03-chi-tiet-khach-hang.png` | Hồ sơ 360° (lịch sử đến quán · tích điểm · Zalo) |
| `crm/04-dat-ban.png` | `v2/crm/04-dat-ban.png` | Đặt bàn (lịch đặt theo trạng thái) |
| `crm/05-don-hang.png` | `v2/crm/05-don-hang.png` | Đơn hàng & đối soát |

Chuỗi trong ảnh: **Hồng Phúc Nướng & Lẩu**; admin **Trần Quốc Khánh / owner@example.com**.
Logo sidebar cũng được thay bằng logo giả (`HP`) vì logo thật nằm trong bundle app; "CukCuk"
(tên hệ POS của khách hàng thật) được đổi thành "POS". 5/5 ảnh có `-crop.png`.

> Lưu ý khi xem: app hiển thị ngày theo kiểu Mỹ (`10/14/2026, 5:30:00 PM`) dù giao diện ở chế độ VI
> — đây là hành vi thật của app demo, giữ nguyên (xem `scripts/screenshots/PLAN-STEP1.md` §G3).

## DentGo — `public/images/solutions/v2/dentgo/`

Nguồn: app demo DentGo Smile (`http://demo1.76.13.214.188.sslip.io`, màn nội bộ `/internal`).
Frontend chỉ phục vụ trên **HTTP (port 80)**; HTTPS trỏ vào API nên trả 404 — vì vậy Edge headless
phải tắt auto-HTTPS-upgrade (`HttpsUpgrades`), và `DENTGO_URL` trong `.env.local` dùng `http://`.

| Ảnh cũ | Ảnh mới | Màn hình |
|---|---|---|
| `dentgo/01-tong-quan.png` | `v2/dentgo/01-tong-quan.png` | Tổng quan ca làm — KPI ngày (lượt khám, đang điều trị, tiền dịch vụ, đã thu) |
| `dentgo/02-ho-so-khach-hang.png` | `v2/dentgo/02-ho-so-khach-hang.png` | Danh sách hồ sơ khách hàng theo ngày |
| `dentgo/03-ho-so-rhm.png` | `v2/dentgo/03-ho-so-rhm.png` | Hồ sơ bệnh án Răng Hàm Mặt (lý do khám · chẩn đoán · kế hoạch điều trị · sơ đồ răng) |
| `dentgo/04-lich-hen.png` | `v2/dentgo/04-lich-hen.png` | Lịch hẹn theo ngày (nhóm theo ngày, có cột công nợ) |
| `dentgo/05-kho-vat-tu.png` | `v2/dentgo/05-kho-vat-tu.png` | Danh mục vật tư, hàng hóa (thuốc + vật liệu, mã thuốc quốc gia) |

Phòng khám trong ảnh: **Nha khoa Minh Tâm** (2 chi nhánh, thay tên thật). 5/5 ảnh có `-crop.png`.

### Sửa lần 2 (2026-10-11, sau khi anh soi ảnh) — 3 lỗi đã hết

| Lỗi đã thấy | Nguyên nhân | Cách sửa |
|---|---|---|
| Nút tròn (chat) lơ lửng **đè lên bảng** | Nút mở hỗ trợ là `position: fixed`; `unlockHeight` ép mọi `fixed` → `static` → nút rơi vào giữa luồng | Thêm `hideFloatingWidgets`: ẩn nút tròn có `aria-label` chứa hỗ trợ/chat/zalo/support, chạy **sau cùng** trước lúc chụp |
| Bảng **cắt mất cột cuối** (Trạng thái · Nhà cung cấp · Thao tác) | Bảng app rộng hơn khung 1328px | Shot bảng chụp ở viewport `appWidth: 1700`, wrapper tự co về 1328 → khung vẫn đồng nhất mà không cắt cột. **Không** dùng `zoom`/`scale` (làm lệch vùng trắng mép phải) |
| Ảnh **dài lê thê** (`04-lich-hen` cao 5030px, sidebar trắng 2/3 ảnh) | Chụp full-page | Thêm `maxHeight` mỗi shot (1100–1500px), cắt đuôi dài; mặc định `VIEWPORT_H × 2` |

> Ghi chú: ảnh `01-tong-quan` có khoảng trắng dưới sidebar — đó là **đệm khung macOS** (56px) +
> nền trắng của app khi trang ngắn, giống hệt app thật mở trong trình duyệt.

## Kiểm tra chất lượng ảnh

Chạy `node scripts/screenshots/.tmp/audit-text.mjs` (script tạm trong `.tmp/`) để quét chữ thật hiển
thị trên từng màn — bắt `[object Object]`, `undefined`/`NaN`, lỗi encoding, UI tiếng Anh lọt,
và tên/brand/URL thật của khách hàng demo. Kết quả ngày 2026-10-11: **0 vấn đề trên 26 màn**.

## Chưa nối vào web

Bộ ảnh v2 mới chỉ **sinh file**, chưa sửa `.mdx` — trang web vẫn đang dùng ảnh cũ.
Việc thay `screenshots:` trong `src/content/solutions/{vi,en}/{hrm,lms,crm,dentgo}.mdx` sang
`/images/solutions/v2/...` là **change request riêng** (đụng nội dung đã publish + ảnh hiển thị trên web).