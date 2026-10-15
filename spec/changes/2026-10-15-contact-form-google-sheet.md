---
id: contact-form-google-sheet
type: feature
status: in_progress
created: 2026-10-15
---

# Form liên hệ đổ dữ liệu vào Google Sheet (chốt OQ#4)

## Yêu cầu
Chốt OQ#4 ("Form liên hệ gửi về đâu"): mỗi lượt gửi form liên hệ (vi + en) được ghi thành **1 dòng trong Google Sheet**.
User chọn Google Sheet (2026-10-15).

Hiện trạng: `src/lib/api/forward.ts` đã POST JSON (`name, email, phone, company, need, message`) tới URL trong env
`CONTACT_FORM_TARGET`; env này chưa chốt giá trị (`.context/project-config.md` ghi ⚠️ OQ#4).
Hướng dự kiến: Google Apps Script Web App (gắn với Sheet) nhận POST → append dòng; URL Web App đặt vào `CONTACT_FORM_TARGET`.

## Bối cảnh / tái hiện (bug)
- Không áp dụng (feature).

## Acceptance (bắt buộc)
- [ ] Gửi form ở `/contact` và `/en/contact` → xuất hiện 1 dòng mới trong Sheet với đủ cột: thời gian, ngôn ngữ (vi/en), tên, email, SĐT, công ty, nhu cầu, nội dung.
- [ ] Sheet/Web App lỗi hoặc timeout → form báo lỗi cho người dùng như hiện tại, không mất trải nghiệm, không lộ URL Web App ra client.
- [ ] URL Web App chỉ nằm ở env server (`CONTACT_FORM_TARGET`) trên VPS, không commit; có cơ chế chống người lạ POST thẳng vào Web App (vd secret token).
- [ ] Mỗi liên hệ mới → 1 tin nhắn Telegram (tên, email, SĐT, công ty, nhu cầu, nội dung, ngôn ngữ); Telegram lỗi vẫn ghi Sheet bình thường.
- [ ] Có file Apps Script + hướng dẫn dựng (tạo Sheet, deploy Web App, đặt env) trong repo.
- [ ] Cập nhật doc: `docs/BRD.md` (tick OQ#4), `.context/project-config.md`, `docs/API_SPEC.md` nếu đổi payload.

## Ghi chú
- 2026-10-15: user xác nhận **đã có Sheet**.
- Lưu ý kỹ thuật: Apps Script `doPost` không đọc được header → token phải gửi trong body/query (cần sửa `forward.ts` + thêm env token);
  Web App trả 302 sang `script.googleusercontent.com` → kiểm tra `fetch` server xử lý redirect và vẫn coi là thành công.
- 2026-10-15: user muốn **báo qua Telegram** khi có liên hệ mới. Đề xuất: Apps Script gửi luôn sau khi ghi Sheet
  (`UrlFetchApp` → Bot API `sendMessage`), bot token + chat id để ở Thuộc tính tập lệnh, không qua VPS/repo.
  Báo Telegram lỗi KHÔNG được làm hỏng việc ghi Sheet / báo lỗi form.
- 2026-10-15: user chốt **dùng chính bot content (CR-030)**, gửi vào **đúng chat user đang dùng với bot đó**.
  Apps Script chỉ gọi `sendMessage` bằng token của bot (không đụng `getUpdates`/webhook → không xung đột với bot đang chạy);
  `TELEGRAM_CHAT_ID` = chat id của cuộc chat đó. Bot content do user tự dựng — không sửa code bot.
- ~~Câu hỏi mở (hỏi khi `/change`): (2) Agent viết sẵn script, user tự deploy — xác nhận?~~ 2026-10-15: user đã chốt — agent viết `tools/contact-sheet/` + hướng dẫn, user tự deploy Web App + tự đặt secret (`CONTACT_FORM_TARGET`, `CONTACT_FORM_TOKEN` ở GitHub repo Secrets → deploy.yml → compose). Token/bot/chat id ở Script Properties.
- Rủi ro: security (endpoint công khai, spam) → reviewer STRICT; giữ rate-limit + honeypot hiện có ở `/api/contact`.
- "Đăng ký nhận tin" ở trang Tin tức (gác từ CR-003) KHÔNG nằm trong change này.
- 2026-10-15 (`/change`): classify ADDITIVE · risk HIGH · spec 4.5.0 (R-13a) · scope v55 · plan 2 task `tasks/feature-contact-form-google-sheet/phase-1-task-01..02.md` — chờ user duyệt plan.
