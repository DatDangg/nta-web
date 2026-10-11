# Run Journal — feature/nta-website · screenshots-pipeline (ngoài luồng change-request)

> Primary ghi file này; subagent KHÔNG ghi. Việc này không nằm trong task/layer nào —
> sinh ảnh minh hoạ cho 4 trang giải pháp (xem `scripts/screenshots/PLAN-STEP1.md`).

```yaml
workItem: feature/nta-website
phaseTask: screenshots-pipeline
step: done
agent: primary
status: awaiting            # chờ user: quyết định có mở change-request nối ảnh v2 vào .mdx
attempt: 3
interrupted: false
updatedAt: 2026-10-11T00:00:00+07:00
commit: a225bf9
filesNew:
  - scripts/screenshots/            # pipeline chụp (capture/live/shots/wrapper/brand/fixtures/mock-hrm)
  - public/images/solutions/v2/     # 26 ảnh + 24 crop
  - docs/screenshots-mapping.md
filesTouched:
  - scripts/screenshots/capture.mjs   # +hideFloatingWidgets, +fitPageWidth (đo bề rộng), +appWidth, +maxHeight, --dump
  - scripts/screenshots/shots.mjs     # dentgo: appWidth 1700, maxHeight theo shot, hideWidgets/fitTables
  - .gitignore                        # + scripts/screenshots/.tmp/
evidence:
  reportPath: docs/screenshots-mapping.md
  verdict: >
    DentGo 5/5 ảnh sạch sau khi sửa 3 lỗi. User duyệt: "ảnh ok rồi đấy".
    CRM/LMS/HRM giữ nguyên theo quyết định user (lệch tỉ lệ với DentGo, chấp nhận).
next: >
  (1) Ảnh v2 CHƯA nối vào web (`.mdx` vẫn trỏ ảnh cũ) → nếu muốn hiển thị: mở change request
      theo /change. Yêu cầu user: gắn vào heroImage + features[].image (LMS: showcase),
      alt VI/EN riêng từng ảnh theo mapping, HRM thêm caption "Giao diện minh hoạ",
      chỉ giữ screenshots[] cho ảnh chưa gắn. ⚠ Template HIỆN CHƯA có heroImage /
      features[].image / showcase → phải mở rộng schema trước (types.ts `features: string[]`).
  (2) Design layout mới chưa làm. User đã chốt hướng: hero text căn giữa + 2 CTA
      ("Đăng ký demo" / "Xem tính năng ›") + ảnh full-width; tính năng xen kẽ zigzag;
      LMS layout riêng 4 section (đa trường · hồ sơ · đánh giá+AI · thời khoá biểu/giáo án/học bạ số)
      + bento văn bản pháp quy (TT27/TT70) + section nền tối AI + 3 thẻ "Dành cho ai"
      + FAQ accordion + CTA full-width; bỏ section ảnh cuối trang và section lặp ý.
  (3) KHÔNG tự deploy prod. Sau Reviewer PASS: chụp 4 trang ở 375px + 1440px gửi user duyệt,
      user OK mới push + deploy (hard gate do user đặt).
loopSignal: none
approvals:
  - { gate: scope, at: 2026-10-11T00:00:00+07:00, ok: "user chọn Full: mock 9 màn + capture + chụp hết" }
  - { gate: content, at: 2026-10-11T00:00:00+07:00, ok: "user xác nhận dữ liệu trong ảnh là giả" }
  - { gate: fix-scope, at: 2026-10-11T00:00:00+07:00, ok: "user: sửa hết ảnh v2 DentGo, cái nào lỗi sửa cái đó" }
  - { gate: review-images, at: 2026-10-11T00:00:00+07:00, ok: "user duyệt ảnh DentGo sau khi sửa" }
  - { gate: re-shoot-other, at: 2026-10-11T00:00:00+07:00, ok: "user: giữ nguyên CRM/LMS/HRM, chỉ sửa DentGo" }
  - { gate: commit, at: 2026-10-11T00:00:00+07:00, ok: "user: commit v2 + scripts + mapping" }
```

## Lỗi ảnh DentGo — đã tìm gốc rễ và sửa (2026-10-11)

Ba lỗi user báo, tất cả từ các quyết định cũ trong `capture.mjs`:

| Lỗi | Nguyên nhân gốc | Sửa |
|---|---|---|
| Nút tròn (chat) lệch lạc, đè giữa bảng | Nút mở hỗ trợ là `position: fixed`; `unlockHeight` ép **mọi** `fixed` → `static` để mở khoá chiều cao → nút rơi vào giữa luồng | `hideFloatingWidgets()` — ẩn theo `aria-label` chứa hỗ trợ/chat/zalo/support + bo tròn + sát mép phải. Chạy **sau cùng** trước lúc chụp (ẩn sớm thì React render lại khôi phục) |
| Bảng bị cắt cột cuối (chọc UI) | Bảng app rộng 1510–1665px > khung 1328px | Shot đặt `appWidth: 1700`, wrapper tự co ảnh về 1328 (`cropFromFramed` nhân hệ số `1328/appW`) |
| Ảnh dài lê thê | Chụp full-page không giới hạn | `maxHeight` theo từng shot (1100–1500px), mặc định `VIEWPORT_H × 2` |

**Hai hướng đã thử và bỏ** (đừng tái diễn):
- `transform: scale()` trên host — tạo vùng trống lệch mép phải.
- `zoom` trên `<html>` — cũng lệch; thêm nữa `scrollWidth` là layout px chưa nhân zoom nên vòng lặp tính sai, phải đo bằng `getBoundingClientRect()`.

**Bẫy khi viết comment trong template string** `.mjs`: dùng backtick trong comment sẽ hỏng cú pháp — đã mắc 2 lần (`SyntaxError: Unexpected identifier`).

## Kết quả

| Sản phẩm | Ảnh | Ghi chú |
|---|---|---|
| HRM (mock, offline) | 9 ảnh + 9 crop | `mock-hrm/` ăn `fixtures/hrm.json`; khung macOS theo `design-tokens.md` |
| LMS (app thật) | 7 ảnh | cần `afterLogin` chọn trường; ≥30 endpoint chặn bằng fixture |
| CRM (app thật) | 5 ảnh | token `localStorage.crm_token`; patch tên chuỗi + email admin |
| DentGo (app thật) | 5 ảnh | frontend chỉ phục vụ HTTP (80), HTTPS cùng host là API 404 → tắt HttpsUpgrades + `DENTGO_URL` http; login `/login`; fixture + rule viết lại theo API mới (`/auth/me`, `/admin/branches`, `/appointments`, `/visits`, `/dashboard/financial-summary`, `/patients`, `/clinical/.../dental-record`, `/inventory/items`) |

## Lỗi đã gặp & cách sửa (để lần sau không lặp)

- Rule chặn khớp cả request HTML (`/customers`) → trang bị trả JSON → chỉ chặn URL API (`apiTest`).
- Thiếu header CORS khi tự trả response → browser chặn (preflight). Phải để `OPTIONS` đi qua server thật
  và thêm `access-control-*` vào response tự trả.
- `env()` trả **chuỗi** rồi bị stringify lần 2 → payload là string → app crash `.filter is not a function`.
- Profile Edge giữ token cũ → app tự logout (`/login?expired=1`) → xoá storage theo origin trước khi login.
- Fixture lệch shape/status so với API thật → app crash (CRM `PKe[status].map`, LMS `Uqe[status].map`).
  Cách tìm nhanh: `--debug` lấy `file:line` trong bundle → fetch asset `.js` → đọc quanh cột đó.
- Múi giờ máy (+07) làm lệch ngày giờ của fixture (ISO UTC) → cố định TZ = UTC khi chụp.
