# Form Liên hệ → Google Sheet + Telegram (CR-037, spec R-13a)

Web (`/vi/lien-he`, `/en/contact`) gửi liên hệ tới một **Apps Script Web App** gắn với Google Sheet của anh.
Script xác thực token bí mật, ghi 1 dòng vào Sheet rồi báo tin Telegram qua bot content (CR-030).
Mã script: [`Code.gs`](./Code.gs) · test ngoài Google: [`code.test.ts`](./code.test.ts) (chạy trong `npm test`).

Hợp đồng: web `POST` JSON `{token, submittedAt, locale, name, email, phone, company, need, message}` →
script trả `{"status":"ok"}` khi đã ghi Sheet, hoặc `{"status":"error","code":"unauthorized|bad_request|server_error"}`.

> **Không commit URL `/exec` hay bất kỳ token nào vào repo.** Chỉ đặt ở Script Properties và GitHub Secrets.

## a. Dán script vào Sheet

1. Mở Google Sheet sẽ chứa liên hệ.
2. **Tiện ích mở rộng → Apps Script**.
3. Xoá nội dung `Code.gs` mặc định, dán toàn bộ [`Code.gs`](./Code.gs) → **Lưu**.

## b. Thuộc tính tập lệnh (Script Properties)

**Cài đặt dự án** (biểu tượng bánh răng) → **Thuộc tính tập lệnh** → thêm:

| Thuộc tính | Bắt buộc | Giá trị |
|---|---|---|
| `SECRET_TOKEN` | có | chuỗi ngẫu nhiên ≥ 32 ký tự. Sinh bằng `openssl rand -hex 32` |
| `TELEGRAM_BOT_TOKEN` | không | token bot content CR-030 (bỏ trống → không báo Telegram, vẫn ghi Sheet) |
| `TELEGRAM_CHAT_ID` | không | chat id cuộc chat anh đang dùng với bot content |
| `SHEET_NAME` | không | tên tab cần ghi; bỏ trống → tab đầu tiên |

Lấy `TELEGRAM_CHAT_ID`: dùng đúng chat id bot content đã cấu hình (biến môi trường / `.env` của bot, hoặc log/DB của bot).
**Không** gọi `getUpdates` khi bot đang chạy polling — sẽ tranh update với bot đang chạy.

## c. Triển khai Ứng dụng web

1. **Triển khai → Tùy chọn triển khai mới** → loại **Ứng dụng web**.
2. *Thực thi với tư cách*: **Tôi** · *Người có quyền truy cập*: **Bất kỳ ai**.
3. **Triển khai** → cấp quyền (Sheet + gửi request ra ngoài) → copy URL kết thúc bằng `/exec`.

## d. Kiểm thử nhanh

```bash
curl -L -X POST "<URL /exec>" -H "Content-Type: application/json" \
  -d '{"token":"<SECRET_TOKEN>","submittedAt":"2026-10-15T08:00:00.000Z","locale":"vi","name":"Test","email":"test@example.com","phone":null,"company":null,"need":"crm","message":"Thử kết nối"}'
```

- Kỳ vọng: `{"status":"ok"}` + 1 dòng mới trong Sheet + 1 tin Telegram.
- Đổi `token` sai → `{"status":"error","code":"unauthorized"}`, **không** có dòng mới.
- Cần `-L` vì Apps Script trả 302 sang `script.googleusercontent.com`.
- Xoá dòng thử trong Sheet sau khi kiểm.

## e. Đặt secret cho web

Trên GitHub repo → **Settings → Secrets and variables → Actions** → thêm:

- `CONTACT_FORM_TARGET` = URL `/exec` ở bước c.
- `CONTACT_FORM_TOKEN` = **đúng** giá trị `SECRET_TOKEN` ở bước b.

`deploy.yml` đọc 2 secret này đưa vào compose (task-02 / `docs/runbook/deploy-vps.md` §4) → chạy lại workflow **Deploy**.
Web chờ script tối đa 10 s. Script cũng chờ khoá ghi tối đa 10 s → lúc nhiều người gửi cùng lúc, script có thể
ghi xong sau khi web đã báo lỗi; người dùng gửi lại sẽ tạo **dòng trùng**. Thấy 2 dòng giống hệt nhau cách vài giây → xoá bớt 1.

## f. Sửa script / xoay token

- Sửa `Code.gs`: **Triển khai → Quản lý triển khai** → bút chì → *Phiên bản*: **Phiên bản mới** → Triển khai. URL `/exec` giữ nguyên.
  (Tạo triển khai mới sẽ ra URL mới → phải đổi `CONTACT_FORM_TARGET`.)
- Xoay token: đổi `SECRET_TOKEN` (Script Properties) **và** secret GitHub `CONTACT_FORM_TOKEN` cùng lúc → chạy lại Deploy.
  Trong khoảng giữa 2 bước, form trả lỗi (không mất dữ liệu đã ghi).

## g. Bảo mật

- Sheet chứa dữ liệu cá nhân (tên, email, SĐT) → chỉ chia sẻ nội bộ, không bật "Bất kỳ ai có đường liên kết".
- Không commit URL `/exec`, `SECRET_TOKEN`, token bot vào repo / issue / chat công khai. Lộ → xoay ngay (bước f).
- Script ghi nhật ký lỗi chỉ bằng mã cố định (không in token, không in dữ liệu liên hệ). Mọi ô dữ liệu người dùng (cột 2–8)
  được thêm tiền tố `'` → Sheet lưu dạng văn bản: không chạy công thức (`= + - @`), không đổi SĐT `0901…` thành số,
  không đổi `1/2`, `2026-10-15`, `TRUE` thành ngày/boolean. Dấu `'` không hiển thị trong ô.
