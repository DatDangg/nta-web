# feature-solution-detail-screenshots · phase-1-task-02 — CRM / DentGo / LMS: chụp thêm màn staging (dữ liệu giả)

- **CR:** CR-007 (`spec/changes/2026-10-13-solution-detail-screenshots.md`)
- **Classification / Risk:** ADDITIVE · MEDIUM (chạm hệ thống thật qua mạng — chỉ GET/đọc; dữ liệu khách thật KHÔNG được lọt vào ảnh)

## Quyết định user (2026-10-13)
- Cho phép chạy `scripts/screenshots/capture.mjs` (tự đăng nhập bằng `.env.local`). KHÔNG đọc/in/ghi mật khẩu.
- Màn do agent chọn:
  | App | Route | File |
  |---|---|---|
  | CRM | `/complaints` | `06-khieu-nai` |
  | CRM | `/settings/zalo-push` | `07-thong-bao-zalo` |
  | DentGo | ~~`/internal/queue`~~ → `/internal/reports/finance` | ~~`06-hang-cho`~~ → `06-bao-cao-tai-chinh` |
  | DentGo | `/internal/customer-care/reminders` | `07-nhac-lich-cskh` |
  | LMS | ~~`/attendance`~~ → `/consolidated-reporting/comparison` | ~~`08-diem-danh`~~ → `08-so-sanh-lien-truong` |
  | LMS | `/consolidated-reporting/dashboard` | `09-bao-cao-lien-truong` |

## Scope
1. `--probe` từng app để lấy shape API của màn mới → bổ sung `build-<app>-fixture.mjs` → regen `fixtures/<app>.json`.
2. Thêm shot vào `shots.mjs` → `capture.mjs <app> --only=<NN>`. Không chụp lại ảnh 01–07 cũ.
3. Rà từng ảnh mới: không còn dữ liệu thật (tên/SĐT/email/địa chỉ/mã/số tiền/tên tổ chức), kể cả header, avatar, ô tìm kiếm, thông báo, góc màn hình. Màn nào không chặn sạch được → `domPatch`, vẫn không sạch → bỏ màn đó và ghi lý do.
4. Thêm ảnh vào **`showcase.photos`** (block ảnh trượt mà `ShowcaseLayout` → `ShowcasePhotos` render) của `src/content/solutions/{vi,en}/{crm,dentgo,lms}.mdx`, theo mẫu `hrm.mdx` (`variant: screen`, caption "Dữ liệu minh hoạ" / "Illustrative data"); giữ thêm mục trong `screenshots:` (chỉ `SolutionCard` đọc). Bổ sung HRM 10–13 (task-01) vào `showcase.photos` của `hrm.mdx`. Alt ghi "dữ liệu minh hoạ" / "illustrative data" (BR-004).
   _(Sửa sau review round 1 — F1: bản đầu ghi `screenshots:`, key này không render trên trang chi tiết.)_

## Ràng buộc an toàn
- Chỉ GET. Không click nút lưu/gửi/xoá; chặn mọi request non-GET tới API (fail request) trong lúc chụp.
- Không ghi bản ghi nào lên hệ thống.

## Acceptance
- 6 ảnh (+crop nếu hợp lý) đồng bộ khung v2; dữ liệu 100% giả; alt ghi minh hoạ (VI+EN).
- typecheck / lint / build PASS.

## Verification summary
**Builder · 2026-10-13**

### Kết quả theo màn
| App | File | Kết quả |
|---|---|---|
| CRM | `06-khieu-nai` (+crop bảng) | ✅ chụp — fixture `complaints` (GET `/api/feedback`) |
| CRM | `07-thong-bao-zalo` (+crop thẻ kết nối OA) | ✅ chụp — fixture `zaloStatus/Followers/Deliveries/EventTemplates` |
| DentGo | `06-hang-cho` | ❌ **bỏ** — bản DentGo đang chạy không có route `/internal/queue` (app trả trang 404; bundle không khai báo route này) |
| DentGo | `06-bao-cao-tai-chinh` (+crop bảng) — **màn thay thế** | ✅ chụp — route `reports/finance` có trong bảng route của bundle; fixture `cashTransactions` (GET `/reports/cash-transactions`), `cashbook` (ô lọc, vouchers rỗng); `/admin/settings`, `/files/brand-logo` trả rỗng (không tải cấu hình/logo phòng khám thật). Chụp rộng 2060 để đủ 12 cột |
| DentGo | `07-nhac-lich-cskh` (+crop thẻ quy tắc) | ✅ chụp — fixture `reminderRules/Templates/Deliveries`, `zaloQrLogin` (CONNECTED → ẩn banner QR) |
| LMS | `08-diem-danh` | ❌ **bỏ** — bản LMS đang chạy không có route `/attendance` (Next.js 404) |
| LMS | `08-so-sanh-lien-truong` (+crop kết quả đối chiếu) — **màn thay thế** | ✅ chụp — route có page chunk `app/consolidated-reporting/comparison` (HTTP 200); fixture `consolidatedComparison` (object thô `{run, metrics, schools, rows, consolidated}`) |
| LMS | `09-bao-cao-lien-truong` (+crop bảng chỉ tiêu) | ✅ chụp — fixture `consolidatedDashboard/Runs` (API trả object thô, không envelope) |

Ratio (rộng/cao ảnh chính): crm/06 1.396 · crm/07 0.717 · dentgo/06 1.548 · dentgo/07 1.291 · lms/08 1.396 · lms/09 0.721.
Kết quả cuối: **6 màn** (4 theo kế hoạch + 2 thay thế), 2 màn kế hoạch bị bỏ vì route không tồn tại. Fallback (`treatment-progress`, `knowledge-map`) không cần dùng.
Không chụp lại ảnh 01–07 cũ (`--only`); fixture regen chỉ **thêm** key (diff 3 file json không xoá dòng dữ liệu cũ nào, `uid()` DentGo sinh sau object cũ nên id cũ giữ nguyên).

### An toàn chỉ-đọc
- `live.mjs` → `prepareLive` thêm **khoá ghi**: sau đăng nhập (+ chọn trường LMS) `guard.lock()`; mọi non-GET/HEAD/OPTIONS ra ngoài máy bị `Fetch.failRequest` (trừ refresh token). Probe cũng đi qua khoá này.
- Request đã chặn trong các lượt chạy: Sentry `POST /api/<id>/envelope/`, `POST /socket.io/` (LMS). Không có request ghi nghiệp vụ nào tới API; không bấm nút lưu/gửi/xoá.
- Mọi API GET của 6 màn mới đều được fulfill bằng fixture (`--debug` không còn `[⚠ không chặn]` ngoài `permissions/me` CRM, `tenants/<id>` LMS — không hiển thị dữ liệu khách; tên trường do domPatch thay như ảnh cũ).

### Rà dữ liệu thật
- Đã mở từng ảnh chính + crop: header, sidebar (brand CRM → "Hồng Phúc Nướng & Lẩu", user "Trần Quốc Khánh / owner@example.com"; LMS "Phạm Quang Vinh"; DentGo "BS. Trần Minh Khoa"), avatar, chuông thông báo, góc màn, tiêu đề cửa sổ — không còn dữ liệu thật.
- Giá trị mẫu Zalo "Nguyễn Văn An"/"DH4895439" là hằng số mẫu trong bundle app (không phải khách). Thêm domPatch `Dragon Hot Pot Quận 1 → Hồng Phúc – Cao Thắng` vì rule brand tổng quát ăn mất phần còn lại của khối JSON.
- Log probe (`.tmp/probe-*.log`, chỉ cấu trúc) và ảnh xem trước (`--preview` → `.tmp/preview/`, đã xoá) nằm trong `.tmp/` gitignored.

### Round 2 — sửa theo review round 1 (`.context/review-reports/feature-solution-detail-screenshots-phase-1-task-02-round-1-review.md`)
- **F1 (HIGH):** thêm `showcase.photos` (eyebrow/title/prevLabel/nextLabel/caption/`variant: screen`) VI+EN, đặt trước `faq` như `hrm.mdx`:
  - CRM: `02-khach-hang` · `06-khieu-nai` · `07-thong-bao-zalo`
  - DentGo: `02-ho-so-khach-hang` · `06-bao-cao-tai-chinh` · `07-nhac-lich-cskh`
  - LMS: `09-bao-cao-lien-truong` · `08-so-sanh-lien-truong` · `03-ho-so-hoc-sinh` (03 thêm để carousel đủ 3; ảnh 03 chỉ dùng ở `features` top-level — trang chi tiết enterprise không render khối này)
  - HRM: nối `10-tuyen-dung` · `11-hop-dong-lao-dong` · `12-danh-gia-kpi` · `13-bao-cao-bien-dong` vào cuối `photos.items` (alt lấy từ `screenshots:` của task-01).
  - Không trùng ảnh hero (`01-tong-quan`). `ShowcaseTechnology` (dùng `photos.items` làm tile) **không** render trên crm/dentgo/lms vì 3 trang không có `showcase.technology` → thứ tự item chỉ ảnh hưởng carousel; HRM giữ nguyên 8 item đầu nên tile HRM không đổi.
  - Schema `CaseStudyShowcase['photos']` (`src/content/types.ts`): items `{src, alt}` — khớp.
- **F2:** `TOKEN_REFRESH` so trên `new URL(url).pathname`, neo cuối đường dẫn (`/auth/refresh` trong query không còn được miễn chặn).
- **F3 (residual):** `Fetch` của page session không thấy frame WebSocket sau upgrade và request từ service worker — chỉ xem, không bấm, nên rủi ro thấp; ghi vào README.
- **F4:** fixture báo cáo tài chính DentGo dùng SĐT giả rõ ràng (`0900 000 1xx`, `024 0000 018x`) và địa chỉ chỉ cấp quận; chụp lại `dentgo/06` (+crop), kích thước không đổi (ratio 1.548).
- **F5:** domPatch `^s*OAs*$ → TK` (neo cả text node, không đụng "Zalo OA"); chụp lại `crm/06` (+crop) — avatar giờ là "TK". `crm/07` không hiện chân sidebar (ảnh cắt 1800px) nên không chụp lại. Ảnh CRM 01–05 cũ vẫn có "OA" (không chụp lại theo phạm vi).
- Đã mở lại 4 PNG chụp lại: sạch.

### Thay đổi pipeline
- `live.mjs`: khoá ghi; probe đọc body ở `loadingFinished` + shape lồng 3 tầng; LMS chọn trường chờ danh sách + thử lại 3 lần (trước đây lỗi ngắt quãng); rule mới CRM/DentGo/LMS.
- `capture.mjs`: cờ `--preview`; log số request ghi bị chặn; `trimTransparentBottom` bỏ dải trong suốt dưới đáy ảnh khi shot chụp rộng mà trang ngắn (ảnh cũ không chụp lại nên không đổi). `shots.mjs`: 4 shot mới + ghi chú 2 màn bỏ. README cập nhật.

### Verify
- `npm run typecheck` → PASS
- `npm run lint` → PASS (0 error, 1 warning có sẵn `src/components/mdx/index.tsx` no-img-element)
- `node --check` 6 script → PASS
- `npm run build` → chưa chạy (sandbox lỗi swc) — primary chạy.

### Residual risk
- LMS chọn trường vẫn phụ thuộc server staging (đã gặp danh sách trường rỗng ngắt quãng); không chọn được thì script DỪNG, không chụp ảnh sai.
- Màn thay thế DentGo 06 / LMS 08 do coordinator chỉ định (không phải user trực tiếp) — user nên xem lại khi duyệt.
