# Run Journal — feature/nta-website · screenshots-pipeline (ngoài luồng change-request)

> Primary ghi file này; subagent KHÔNG ghi. Việc này không nằm trong task/layer nào —
> sinh ảnh minh hoạ cho 4 trang giải pháp (xem `scripts/screenshots/PLAN-STEP1.md`).

```yaml
workItem: feature/nta-website
phaseTask: screenshots-pipeline
step: done
agent: primary
status: awaiting            # chờ user: quyết định commit + có mở change-request nối ảnh v2 vào .mdx
attempt: 2
interrupted: false
updatedAt: 2026-10-11T10:30:00+07:00
filesNew:
  - scripts/screenshots/README.md
  - scripts/screenshots/capture.mjs
  - scripts/screenshots/cdp.mjs
  - scripts/screenshots/live.mjs
  - scripts/screenshots/shots.mjs
  - scripts/screenshots/serve.mjs
  - scripts/screenshots/inspect.mjs
  - scripts/screenshots/wrapper.html
  - scripts/screenshots/mock-hrm/{index.html,app.js}
  - scripts/screenshots/fixtures/{hrm,lms,crm,dentgo}.json   # đã sửa lại theo shape API thật
  - public/images/solutions/hrm/*-v2.png (+ crop)
  - public/images/solutions/lms/v2/*.png
  - public/images/solutions/crm/*-v2.png
  - public/images/solutions/dentgo/*-v2.png (+ -crop)
  - docs/screenshots-mapping.md
filesTouched:
  - scripts/screenshots/{PLAN-STEP1.md,design-tokens.md,build-*-fixture.mjs,mock-hrm/app.css,measure-frame.mjs}
  - .gitignore                       # + scripts/screenshots/.tmp/
evidence:
  reportPath: docs/screenshots-mapping.md
  verdict: "HRM 9/9 · LMS 7/7 · CRM 5/5 · DentGo 5/5 chụp được, 0 console error (--debug); crop đủ cả 4 sản phẩm"
next: >
  (1) Ảnh v2 CHƯA nối vào web (`.mdx` vẫn trỏ ảnh cũ) → nếu muốn hiển thị: mở change request riêng
      theo /change (đụng nội dung đã publish).
  (2) Quyết định commit: scripts/screenshots + ảnh v2 + docs/screenshots-mapping.md (chưa commit).
loopSignal: none
approvals:
  - { gate: scope, at: 2026-10-11T00:00:00+07:00, ok: "user chọn Full: mock 9 màn + capture + chụp hết" }
```

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
