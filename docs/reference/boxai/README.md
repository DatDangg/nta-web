# BoxAI — Tài liệu tham khảo (ảnh sản phẩm thực tế)

> **Mục đích:** lưu lại **thông tin ảnh** sản phẩm BoxAI dùng thật ở hiện trường (đền nội bộ),
> làm nguồn tham chiếu khi viết nội dung trang `solutions/boxai`.
>
> **Trạng thái:** CHỈ mới lưu ảnh + mô tả. **CHƯA** áp dụng vào code/section nào.
> Việc đưa ảnh vào `public/images/solutions/boxai/` + khai báo `screenshots:` trong
> `src/content/solutions/{vi,en}/boxai.mdx` sẽ làm trong **change request** riêng.

- **Chụp ngày:** 10/10/2026 (theo mốc thời gian trên ảnh)
- **Bối cảnh demo:** khu di tích đền nội bộ (đền thờ triều đình Nguyễn) — 9 camera, task theo khu vực
- **Nguồn:** khách hàng cung cấp (ảnh thực tế hệ thống đang chạy)

---

## 1. Danh mục ảnh

| # | File | Nội dung chính |
|---|---|---|
| 1 | `screenshots/01-dashboard-quan-tri.jpg` | Dashboard quản trị cảnh báo (Intelligent Safety Alarm Management Platform) — thống kê báo động + tường video 3×3 + danh sách cảnh báo thời gian thực |
| 2 | `screenshots/02-tasks-channels.jpg` | Màn "Tasks and channels" — cây nhóm/ task bên trái, tường video 3×3 có overlay AI (vùng, khung người, timer) |
| 3 | `screenshots/03-ai-box.jpg` | Phần cứng AI Box NVIDIA Jetson (Orin Nano Super) đang lắp đặt tại hiện trường |

---

## 2. Ảnh 1 — Dashboard quản trị cảnh báo

**Tên trên UI:** `Intelligent Safety Alarm Management Platform` (UI tiếng Anh, dữ liệu hiện trường là đền).

### Bố cục 3 cột

| Vùng | Nội dung quan sát được |
|---|---|
| **Header** | Đồng hồ hệ thống (ví dụ `2026/10/09 16:37:44`), tên nền tảng, nút: `Filter Alarms`, `Alarm Voice`, `Admin Management`, `Page Fullscreen` |
| **Cột trái — `Alarm Data Statistics`** | 3 thẻ biểu đồ: `Alarm Types` (2 items) — biểu đồ đường, trục "Count By Face ID" / "Touch Fence"; `Alarm Channels` (3 items) — biểu đồ cột; `Alarm Tasks` (3 items) — biểu đồ vòng (donut) |
| **Giữa — tường video 3×3** | 9 luồng camera, mỗi ô có timestamp + tên kênh ở góc, có badge đỏ `00-24:72` (đếm thời gian/thời lượng) |
| **Giữa dưới — `Status Statistics`** | 3 thẻ: `Task Status` = NORMAL **16**, `Channel Status` = NORMAL **16**, `Upload Status` = SUCCESS **1007** |
| **Cột phải — `Real-time Alarm`** | Danh sách sự kiện dạng card: timestamp (`2026-10-09 16:37:41`), ảnh sự kiện (ảnh này hiển thị `No Image Available`), tên kênh, số đếm `COUNT BY F…` (đếm theo face) |

### Tên kênh camera quan sát được trên tường video
`Kênh 1`, `Tam Quan Nội Sân`, `Đề Ngựa Mã`, `Cửa Cung Cấm`, `Tư Phủ Quan Hoàng`, `Tư Phủ Quan Hoàng 2`, `Bàn Trần Triều`, `Cống Đông 1`, `Cửa Cung Cấm 2`.

### Ý nghĩa sản phẩm suy ra được
- Hệ thống quản lý **task (kịch bản giám sát) × channel (camera)**, không chỉ xem live.
- Có **thống kê báo động** theo loại / theo kênh / theo task.
- Có **luồng cảnh báo thời gian thực** kèm ảnh chụp sự kiện + đếm đối tượng.
- Trạng thái hệ thống hiển thị rõ: task/channel `NORMAL`, upload `SUCCESS`.

---

## 3. Ảnh 2 — Màn "Tasks and channels"

### Cột trái (điều hướng task)
- Header: `Tasks and channels` + nút menu (thu gọn sidebar).
- Dropdown chế độ: `General Mode`.
- Ô tìm kiếm: `Search tasks or channel`.
- Cây nhóm 2 mục:
  - **`Group Stream`** → `Group1`, `Group2`
  - **`Task Stream`** → task theo **ID thiết bị** (`0374faf0f942f888f7c46bbaa6…`, `32a8c5c576e65e6900b0a4d0…`, `4e64dc566a57018edbf669…`) và task theo **tên khu vực**:
    `Bàn Trần Triều`, `Bảo Chây - Sân Đề Mã`, `Chuẩn Bị Lễ 1`, `Cung Ông Bến Trái`, `Cung Đại Bài - Mới`, `Cây Hương Đà Phái`, `Cây Hương Đà Trái`, `Cống Đông 1`, `Cửa Cung Cấm`, `Cửa Cung Cấm 2`, `Cửa Kho Đền`, `Tứ Phủ Quan Hoàng`, `Tứ Phủ Quan Hoàng 2`.

### Tường video 3×3 — overlay AI quan sát được
| Overlay | Ý nghĩa |
|---|---|
| **Vùng màu xanh lá** (polygon kẻ trên sàn) | **Vùng giám sát / vùng cấm** (ROI) |
| **Khung xanh dương + nhãn `访客: 0.645348 0.648998…`** | **Bounding box người** + nhãn lớp (`访客` = khách) + **điểm tin cậy** của mô hình |
| **Badge đỏ `00-24:72`** | Bộ đếm thời gian / số khung của phiên giám sát |

### Ý nghĩa sản phẩm suy ra được
- UI cho phép **gom nhiều camera thành group** và **gán task cho từng group/channel**.
- Overlay AI được **vẽ ngay trên luồng live** → demo trực quan cho "AI Box chạy tại chỗ, không cần gửi video về trung tâm".
- Task được đặt theo **ngữ cảnh nghi lễ** (chuẩn bị lễ, bảo chây sân đề) → bám use case giám sát khu di tích.

---

## 4. Ảnh 3 — Phần cứng AI Box (NVIDIA Jetson)

- **Thiết bị:** NVIDIA Jetson Orin Nano Super (dev kit) nằm trong hộp carton NVIDIA.
- **Kết nối quan sát được:** 1 cáp **Ethernet màu xanh** (LAN — nhận luồng camera từ switch), 1 cáp **HDMI/DisplayPort đen** (ra màn hình debug), cáp nguồn.
- **Bối cảnh lắp đặt:** trên bàn trắng cạnh tường có ổ cắm → **lắp đặt tại chỗ** (tầng đền), không phải demo lab.
- **Ý nghĩa:** xác nhận phần cứng thực tế đúng như mô tả sản phẩm hiện tại (`Orin Nano Super` cho cấu hình cơ bản).

---

## 5. Khoảng trống cần xử lý khi mở change request

> ⚠️ **Chưa làm gì cả** ở các mục dưới — để dành cho change request sau.

- [ ] Copy 3 ảnh từ `screenshots/` → `public/images/solutions/boxai/` (cân nhắc nén / `.webp` vì ảnh dashboard rất nặng ~190–270 KB mỗi ảnh).
- [ ] Khai báo `screenshots:` trong `src/content/solutions/vi/boxai.mdx` và `src/content/solutions/en/boxai.mdx` — kiểm tra schema `screenshots` mà trang `solutions/boxai` đang render.
- [ ] Xem lại claim trong `boxai.mdx` có khớp ảnh không (ảnh chụp ở **đền**, không phải KPI doanh nghiệp → có thể bổ sung ảnh "khu di tích" vào `useCases`).
- [ ] Ảnh 3 (phần cứng) có thể dùng cho section **"Kiến trúc ba tầng"** — cần ảnh sơ đồ nếu muốn minh hoạ kiến trúc.
- [ ] Việt hoá UI tiếng Anh trong ảnh (ảnh chụp nguyên bản từ hệ thống) — ghi chú khi copy ảnh lên web.
