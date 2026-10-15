# Spec update — 2026-10-15 · change `contact-form-google-sheet`

- **Spec version**: 4.4.0 → **4.5.0** (MINOR — thêm requirement R-13a)
- **Scope version**: v54 → **v55** (`feature-update`)
- **Trigger**: `feature-update` (change-request CR-037, ADDITIVE, risk HIGH — review STRICT)
- **Change file**: `spec/changes/2026-10-15-contact-form-google-sheet.md`
- **Tasks**: `tasks/feature-contact-form-google-sheet/phase-1-task-01.md` (Apps Script + README), `phase-1-task-02.md` (web forward + env + doc reconcile)
- **Thời điểm phát hành**: bước planning — hiệu lực khi phase 1 PASS **và** user deploy Web App + đặt secret `CONTACT_FORM_TARGET` / `CONTACT_FORM_TOKEN`

## Thay đổi

**THÊM R-13a** — đích forward của R-13 (chốt Open Question #4, giải quyết Conflict C2):
- Đích = **Google Apps Script Web App** gắn với Google Sheet có sẵn của NTA. Script `tools/contact-sheet/Code.gs` + hướng dẫn
  `tools/contact-sheet/README.md` nằm trong repo; user tự dán vào Apps Script editor và deploy (Thực thi: Tôi · Truy cập: Bất kỳ ai).
- `POST /api/contact` body thêm field tuỳ chọn **`locale`** (`vi|en`): form `/contact`, `/en/contact` và form CTA rút gọn (trang chi tiết giải pháp)
  gửi theo locale trang; thiếu → `vi`; có mà sai → `400 errors.locale`.
- Server POST JSON tới `CONTACT_FORM_TARGET` gồm `token`, `submittedAt` (ISO 8601 lúc server nhận), `locale`, `name`, `email`, `phone`,
  `company`, `need`, `message`. `token` = env server-only mới **`CONTACT_FORM_TOKEN`** (đi trong body vì `doPost` không đọc header).
  Thiếu target/token hoặc có `NEXT_PUBLIC_*` cùng tên → coi như chưa cấu hình → `500`, không gọi ra ngoài. URL + token không về client, không log, không vào bundle.
- Web App trả `302` → `script.googleusercontent.com`: server theo redirect, chỉ thành công khi phản hồi cuối `2xx` **và** JSON `{status:"ok"}`;
  token sai / lỗi script / HTML lỗi / timeout → `500` như hiện tại.
- Apps Script: so token với Script Property `SECRET_TOKEN` (sai/thiếu → `{status:"error"}`, không ghi, không Telegram); hợp lệ → append 1 dòng
  (`LockService`) 8 cột: thời gian (giờ VN), ngôn ngữ, tên, email, SĐT, công ty, nhu cầu, nội dung; ô bắt đầu `= + - @` (và tab/CR) bị vô hiệu hoá công thức.
- Sau khi ghi Sheet: gửi 1 tin Telegram text thuần (không `parse_mode`) qua bot content CR-030 tới chat user (Script Properties
  `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`). Telegram lỗi/timeout **không** hỏng ghi Sheet và không đổi kết quả `{status:"ok"}`.
  Không gọi `getUpdates`/`setWebhook` (không xung đột bot đang chạy).
- Rate-limit + honeypot + guard order R-18 giữ nguyên; honeypot có giá trị → không forward.

**Ghi chú R-16**: "forward qua bên thứ ba, không lưu DB" giữ nguyên — bên thứ ba = Google Sheet qua Apps Script (R-13a).
**Open Questions #4** đã chốt; **Conflict C2** đã giải quyết ("lưu" = 1 dòng Google Sheet, web vẫn không lưu DB).

- Không đổi: schema DB, UI form, guard order, rate-limit threshold, bot content (code).

## Ảnh hưởng test
- Trực tiếp: `src/lib/api/contact-schema.ts` (`locale`), `src/lib/api/forward.ts` (env token, body, redirect, điều kiện `{status:"ok"}`, timeout 10 s,
  message lỗi không lộ URL/token), `src/lib/contact/useContactForm.ts` (gửi `locale`), `tools/contact-sheet/Code.gs` (token, validate, append, formula injection, Telegram cô lập lỗi).
- Phụ thuộc: form `/contact`, `/en/contact`, form CTA ở `/solutions/ai/[slug]` + `/solutions/enterprise/[slug]`; env wiring `.env.local.example`, `docker-compose.yml`, `.github/workflows/deploy.yml`.
- Regression: rate-limit, honeypot (200 giả, không forward), validate name/email/phone/company/need/message, thông báo lỗi/thành công trên form, `/api/health`.
- E2E thật (Sheet + Telegram) chỉ chạy sau khi user deploy Web App + đặt secret.
- Chi tiết: `spec/test-scope/current.json` (scope v55).
