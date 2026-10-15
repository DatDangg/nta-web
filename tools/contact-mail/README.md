# Form Liên hệ → email tới admin (CR-039, spec R-13a 4.7.0)

Web (`/vi/lien-he`, `/en/contact`) gửi liên hệ tới một **Apps Script Web App**. Script xác thực token bí mật rồi gửi
**đúng 1 email** (plain text) tới địa chỉ ở Script Property `ADMIN_EMAIL`. Không ghi Google Sheet, không báo Telegram.
Mã script: [`Code.gs`](./Code.gs) · test ngoài Google: [`code.test.ts`](./code.test.ts) (chạy trong `npm test`).

Hợp đồng (không đổi so với CR-037): web `POST` JSON `{token, submittedAt, locale, name, email, phone, company, need, message}` →
script trả `{"status":"ok"}` khi đã gửi mail, hoặc `{"status":"error","code":"unauthorized|bad_request|server_error"}`.

Email nhận được:
- **Tiêu đề:** `[NTA] Liên hệ mới — <tên khách>` (bỏ ký tự xuống dòng/điều khiển, tên dài cắt còn 100 ký tự).
- **Trả lời (Reply)** đi thẳng tới email khách (`replyTo`).
- **Nội dung:** thời gian (giờ VN), ngôn ngữ, tên, email, SĐT, công ty, nhu cầu (nhãn), nội dung. Trường trống ghi `-`.

> **Không commit URL `/exec`, token hay địa chỉ email admin riêng tư vào repo.** Chỉ đặt ở Script Properties và GitHub Secrets.

## a. Dán script

**Cách 1 — dùng lại dự án Apps Script cũ (khuyến nghị, giữ nguyên URL `/exec`):**
1. Mở Google Sheet cũ → **Tiện ích mở rộng → Apps Script** (hoặc mở dự án từ [script.google.com](https://script.google.com)).
2. Xoá toàn bộ nội dung `Code.gs` cũ, dán toàn bộ [`Code.gs`](./Code.gs) mới → **Lưu**.

**Cách 2 — tạo dự án độc lập:** [script.google.com](https://script.google.com) → **Dự án mới** → dán [`Code.gs`](./Code.gs) → **Lưu**.
Cách này ra URL `/exec` mới → phải làm thêm bước d (triển khai lần đầu) và đổi secret web.

Sheet cũ (dữ liệu CR-037) **giữ nguyên** — script mới không ghi thêm. Lưu hay xoá Sheet do anh quyết.

## b. Thuộc tính tập lệnh (Script Properties)

**Cài đặt dự án** (biểu tượng bánh răng) → **Thuộc tính tập lệnh**:

| Thuộc tính | Bắt buộc | Giá trị |
|---|---|---|
| `SECRET_TOKEN` | có | **giữ nguyên** giá trị cũ (khớp secret GitHub `CONTACT_FORM_TOKEN`). Dự án mới: chuỗi ngẫu nhiên ≥ 32 ký tự, sinh bằng `openssl rand -hex 32` |
| `ADMIN_EMAIL` | có | địa chỉ nhận liên hệ. Giai đoạn test đặt mail của anh, chạy ổn thì đổi sang mail admin. Nhiều người nhận → cách nhau dấu phẩy (`a@x.com,b@y.com`) |

**Xoá** các thuộc tính cũ không còn dùng: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `SHEET_NAME` (xoá để khỏi giữ bí mật thừa).

Thiếu `ADMIN_EMAIL` → script trả `server_error` → form trên web báo lỗi.

## c. Cấp quyền gửi mail (bắt buộc, làm 1 lần)

1. Trong editor, chọn hàm **`testSendMail`** ở thanh công cụ → **Chạy**.
2. Google hỏi quyền (có mục **"Gửi email thay bạn"**) → chọn tài khoản → **Cho phép**.
3. Kiểm hộp thư `ADMIN_EMAIL`: có mail `[NTA] Liên hệ mới — Thử cấu hình`.

Bỏ bước này thì Web App (*Thực thi: Tôi*) chưa có quyền gửi mail → Google trả trang HTML lỗi quyền → web báo 500.

## d. Cập nhật triển khai

- **Dùng lại dự án cũ:** **Triển khai → Quản lý triển khai** → bút chì → *Phiên bản*: **Phiên bản mới** → **Triển khai**.
  URL `/exec` giữ nguyên → **không** đổi secret GitHub, **không** cần chạy lại Deploy web.
- **Dự án mới (lần đầu):** **Triển khai → Tùy chọn triển khai mới** → loại **Ứng dụng web** · *Thực thi với tư cách*: **Tôi** ·
  *Người có quyền truy cập*: **Bất kỳ ai** → **Triển khai** → copy URL kết thúc bằng `/exec`. Sau đó trên GitHub repo →
  **Settings → Secrets and variables → Actions**: `CONTACT_FORM_TARGET` = URL `/exec` mới, `CONTACT_FORM_TOKEN` = đúng `SECRET_TOKEN`
  → chạy lại workflow **Deploy** (`docs/runbook/deploy-vps.md` §4).

## e. Kiểm thử nhanh

```bash
curl -L -X POST "<URL /exec>" -H "Content-Type: application/json" \
  -d '{"token":"<SECRET_TOKEN>","submittedAt":"2026-10-15T08:00:00.000Z","locale":"vi","name":"Test","email":"test@example.com","phone":null,"company":null,"need":"crm","message":"Thử kết nối"}'
```

- Kỳ vọng: `{"status":"ok"}` + **1 mail** tới `ADMIN_EMAIL`; bấm Trả lời → địa chỉ người nhận là `test@example.com`.
- Đổi `token` sai → `{"status":"error","code":"unauthorized"}`, **không** có mail.
- Cần `-L` vì Apps Script trả 302 sang `script.googleusercontent.com`.
- Sau đó gửi thử form thật ở `/vi/lien-he` và `/en/contact`.

## f. Đổi người nhận

Chỉ sửa Script Property `ADMIN_EMAIL` → có hiệu lực ngay ở lượt gửi kế tiếp (script đọc lại mỗi request).
Không sửa code, không tạo phiên bản triển khai mới, không deploy lại web.

## g. Hạn mức và rủi ro

- **Hạn mức gửi mail của Google:** tài khoản Gmail thường ~100 người nhận/ngày, Google Workspace ~1500/ngày
  (xem Apps Script → **Quotas**; mỗi địa chỉ trong `ADMIN_EMAIL` tính 1 người nhận). Vượt → script trả `server_error` → web báo lỗi.
- **Không còn bản lưu dự phòng:** mail là bản duy nhất. Mail bị xoá/lọc nhầm là mất liên hệ đó.
- **Mail trùng (hiếm):** web chờ script tối đa 10 s. Script gửi xong muộn hơn → web báo lỗi, khách gửi lại → admin nhận 2 mail giống nhau.
- **Spam:** mail gửi từ tài khoản Google triển khai script; lần đầu có thể vào thư mục Spam → đánh dấu "Không phải spam".
- Lỗi xem ở Apps Script → **Executions**: chỉ có mã cố định `contact-mail: admin_email_missing` / `contact-mail: send_failed`.

## h. Sửa script / xoay token / bảo mật

- Sửa `Code.gs`: làm lại bước d (phiên bản mới, URL giữ nguyên). Tạo triển khai mới sẽ ra URL mới → phải đổi `CONTACT_FORM_TARGET`.
- Xoay token: đổi `SECRET_TOKEN` (Script Properties) **và** secret GitHub `CONTACT_FORM_TOKEN` cùng lúc → chạy lại Deploy.
  Trong khoảng giữa 2 bước, form báo lỗi.
- Không commit URL `/exec`, `SECRET_TOKEN`, địa chỉ admin riêng tư vào repo / issue / chat công khai. Lộ token → xoay ngay.
- Script ghi nhật ký lỗi chỉ bằng mã cố định (không in token, địa chỉ admin, dữ liệu liên hệ). Nội dung mail là plain text
  (thẻ HTML khách nhập hiện nguyên văn, không chạy); email khách phải đúng dạng `x@y` không khoảng trắng, tên trong tiêu đề
  bị bỏ ký tự xuống dòng → không chèn được header mail.
