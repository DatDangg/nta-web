# scripts/screenshots — pipeline chụp ảnh trang giải pháp

Sinh ảnh minh hoạ cho `/solutions/{ai,enterprise}` trên website NTA: **HRM (mock)**, **LMS (iSmartSchool)**,
**CRM (Dragon Hotpot)**, **DentGo Smile**. Ảnh ra là **cửa sổ macOS** thống nhất: 1328px nội dung,
padding 56px, dsf 2 → **2880px** bề ngang (thông số đo từ ảnh cũ: `design-tokens.md`).

Kế hoạch gốc + danh sách màn hình: `PLAN-STEP1.md`. Bảng ảnh cũ → mới: `../../docs/screenshots-mapping.md`.

## Chạy

```bash
node scripts/screenshots/capture.mjs hrm              # HRM mock — offline, không cần creds
node scripts/screenshots/capture.mjs all              # cả 4 (3 app thật cần .env.local + mạng)
node scripts/screenshots/capture.mjs crm --only=03    # chụp lại 1 màn (theo tiền tố số thứ tự)
node scripts/screenshots/capture.mjs lms --probe      # chỉ ghi lại API thật, KHÔNG chụp
node scripts/screenshots/capture.mjs lms --debug      # in console error của app + request đã chặn
node scripts/screenshots/capture.mjs hrm --no-crops   # bỏ ảnh crop
```

### Mock bổ sung (offline)

Ba mock HTML/CSS dưới đây dùng cùng pipeline khung macOS, nền trong suốt và được lưu cùng repo:

```bash
node scripts/screenshots/capture.mjs enterprise  # collage giao diện LMS/CRM/DentGo v2
node scripts/screenshots/capture.mjs flycam       # dashboard điều hành bay, sơ đồ tuyến bay
node scripts/screenshots/capture.mjs talvra       # chat trợ lý AI tra cứu chính sách nội bộ
```

Mock source: `mock-enterprise/`, `mock-flycam/`, `mock-talvra/` (mỗi thư mục có `index.html` và
`style.css`). Mở xem qua `node scripts/screenshots/serve.mjs`, lần lượt tại
`/mock-enterprise/`, `/mock-flycam/`, `/mock-talvra/`. Enterprise tải ba ảnh giao diện v2 có sẵn
qua đường dẫn `/public/images/solutions/v2/`; không tạo lại hoặc sửa các ảnh nguồn đó.

## Ảnh ra đâu

Tất cả ảnh thế hệ 2 nằm ở **`public/images/solutions/v2/<sản phẩm>/`** — tách hẳn khỏi ảnh cũ
(thư mục `solutions/<sản phẩm>/` là ảnh cũ vẫn đang được web dùng). Vì đã ở trong `v2/`,
tên file **không** kèm hậu tố `-v2`. Đối chiếu ảnh cũ → mới: `docs/screenshots-mapping.md`.

## Xem mock bằng mắt

`node scripts/screenshots/serve.mjs` → <http://127.0.0.1:5599/mock-hrm/?screen=overview>

## Ảnh crop (vùng quan trọng nhất)

Khai báo trong `shots.mjs`, mỗi ảnh ra thêm file `-crop.png`:

```js
{ route: "/dashboard", name: "02-...", crop: "section.dashboard-grid" }              // → 02-...-crop.png
{ name: "04-...", crop: { text: "TRỢ LÝ NHẬN XÉT" },                                 // → 04-...-crop.png
  crops: [{ as: "tt27", sel: '[class*="col-span-8"]' }] }                           // → 04-...-tt27-crop.png
```

- Vùng khai báo bằng **CSS selector** (`sel`) hoặc **chuỗi hiển thị** (`text`).
  `text` bền hơn khi app đổi class (Tailwind/HashRouter), nhưng bỏ qua tiêu đề quá nhỏ và lấy hộp
  nhỏ nhất ≥ 300×60px.
- Class có dấu `:` hay `[]` (Tailwind responsive, arbitrary value) **không** dùng dạng `.lg:col-span-8` —
  dùng `[class*="col-span-8"]`.
- `crops` sinh nhiều vùng cho 1 ảnh (LMS màn 04 cần cả khung Trợ lý AI lẫn lưới TT27).
- Crop cao tối đa 620px, vùng rộng hơn khung 1328px sẽ bị cắt mép phải — nên crop theo khối bao ngoài
  bảng rộng (`div.internal-main-scale-canvas`) thay vì crop thẳng `<table>`.
- Chạy lại 1 màn: `node scripts/screenshots/capture.mjs <slug> --only=<số thứ tự>`; tắt crop: `--no-crops`.
- Muốn xem app để chọn selector: `node scripts/screenshots/inspect.mjs <url>`.

## Ba app demo đều "ghim khung" — xử lý trước khi chụp

| App | Tình trạng | Cách xử lý |
|---|---|---|
| DentGo | cả app `position: fixed` + cuộn nội bộ → chụp full-page chỉ lấy 1 viewport, **mất nội dung** | bật `unlockHeight` trong `live.mjs` → bỏ `height:100vh`, `overflow`, `position:fixed` |
| LMS | sidebar `position: fixed; height:900px`, ngắn hơn nội dung | `stretchSidebar: true` → `stretchSidebar()` trong `capture.mjs` |
| CRM | sidebar `position: sticky; h-screen`, ngắn hơn nội dung | `stretchSidebar: true` (như trên) |

Ảnh chụp là **full-page** (cao hơn viewport) nên sidebar ghim `100vh` bị "cụt", ảnh xấu. `stretchSidebar`
nới `min-height` của sidebar cho bằng chiều cao trang, **không đổi `position`**: khối menu `flex: 1`
tự giãn theo, chân sidebar (tài khoản + đăng xuất) vẫn sát đáy — đúng như lúc mở app trong trình duyệt.

⚠️ **Đừng đổi `position` của sidebar** và đừng nới chiều cao phần tử **bên trong** nó — thử rồi:
ép `static` làm LMS mất chiều cao trang và rớt về trang đăng nhật; nới `nav` con (khớp `[class*=sidebar]`)
làm sidebar vỡ layout, logo rơi vào giữa, mất menu.
⚠️ **Wrapper phải có `?t=<timestamp>`** — URL `.tmp/app-*.png` không đổi giữa các lần chạy nên Edge
trả ảnh cached, khung ra ngắn hơn trang thật.

Thông tin đăng nhập đọc từ `.env.local` (`<PRODUCT>_URL` / `_USERNAME` / `_PASSWORD`) — đã nằm trong
`.gitignore`, **không** hardcode trong script, **không** ghi ra log.

## Dữ liệu giả — nguyên tắc

Ảnh chụp phải **không lộ dữ liệu khách hàng thật**, nhưng vẫn là app thật:

| Cơ chế | Ở đâu | Việc gì |
|---|---|---|
| **Fixture** | `fixtures/*.json` (sinh bằng `build-*-fixture.mjs`) | payload giả, đúng shape API thật |
| **Chặn API** | `live.mjs` → `prepareLive` (CDP `Fetch` domain) | trả fixture cho mọi request API khớp rule; preflight `OPTIONS` để server thật trả lời; thêm header CORS |
| **Patch DOM** | `live.mjs` → `domPatch` (per product) | thay chữ cứng trong app (tên chuỗi, tên trường, email admin) bằng tên giả |
| **Crop/shape** | `snapshot` offset trong `capture.mjs` | crop đúng vùng DOM, cắt từ ảnh đã đóng khung |

> Chặn API **chỉ** áp cho URL API (`apiTest`), không áp cho request HTML (`/customers` không bị trả JSON).

## Files

| File | Trách nhiệm |
|---|---|
| `capture.mjs` | driver: mở Edge headless, chụp, đóng khung, crop, ghi `public/images/solutions/v2/<sản phẩm>/` |
| `brand.mjs` | sinh logo giả cho app có brand thật trong bundle (CRM) — xem `live.mjs` §`staticRules` |
| `cdp.mjs` | client CDP tối giản (WebSocket + `send/waitFor/evaluate`) — không dùng playwright/puppeteer |
| `serve.mjs` | static server (mock + fixture + ảnh tạm) |
| `wrapper.html` | khung cửa sổ macOS — **nguồn duy nhất** của thông số khung |
| `shots.mjs` | manifest: mỗi sản phẩm → danh sách màn hình, route, tên file, vùng crop |
| `live.mjs` | đăng nhập, chọn trường (LMS), chặn API, patch DOM, probe |
| `inspect.mjs` | soi 1 trang (URL/title/input/button/text) — dùng khi trang đăng nhập đổi |
| `mock-hrm/` | mock HRM 9 màn (`index.html` + `app.js` ăn `fixtures/hrm.json`) |
| `build-*-fixture.mjs` | sinh fixture 4 sản phẩm (nghiệp vụ VN: BHXH/thuế TNCN, TT27, giá VNĐ…) |
| `.tmp/` | profile Edge + ảnh tạm + `probe-*.log` (gitignored) |

## Khi app thật thay đổi (maintain)

1. `node scripts/screenshots/inspect.mjs <URL>` → xem trang đăng nhập/nav có đổi selector không.
2. `node scripts/screenshots/capture.mjs <slug> --probe` → ghi lại request/response thật vào
   `.tmp/probe-<slug>.log` để đối chiếu (log chỉ in **cấu trúc**, không in giá trị → không lộ dữ liệu).
3. Sai shape → sửa `build-<slug>-fixture.mjs` → `node scripts/screenshots/build-<slug>-fixture.mjs`.
4. Lỗi runtime của app → `--debug` để lấy console error kèm `file:line` của bundle; đọc thẳng bundle
   tại offset đó để biết field app cần (`fetch <asset>.js` → cắt chuỗi quanh cột lỗi).

## Ghi chú kỹ thuật đã trả giá để biết

- **LMS cần chọn trường** sau đăng nhập, nếu không API trả 403 (`--probe` sẽ thấy hàng loạt 403).
  Hook `afterLogin` trong `live.mjs` làm việc này.
- **Xoá storage theo origin trước khi đăng nhập** (`Storage.clearDataForOrigin`): profile Edge được giữ
  giữa các lần chạy, token cũ làm app tự đăng xuất (`/login?expired=1`).
- **Múi giờ cố định UTC** (`Emulation.setTimezoneOverride`) để giờ trong fixture hiển thị đúng như soạn.
- **Envelope API LMS**: `{success, data, message, meta}` — trả về **object**, không phải chuỗi
  (`JSON.stringify` hai lần sẽ làm payload thành string → app crash `.filter is not a function`).
- **CRM dùng `Authorization: Bearer` từ `localStorage.crm_token`**; statuses hợp lệ của visit là
  `RESERVED | SEATED | COMPLETED | NO_SHOW | CANCELLED` (status lạ → `PKe[status].map` crash).
- **DentGo**: frontend chỉ phục vụ trên **HTTP** (`http://demo1.76.13.214.188.sslip.io`); HTTPS cùng host
  trỏ vào API nên trả 404. Vì vậy `DENTGO_URL` dùng `http://` và Edge được khởi động kèm
  `--disable-features=HttpsUpgrades,HttpsFirstModeV2,HttpsFirstBalancedModeAutoEnable` (nếu không, headless
  tự nâng lên HTTPS → 404). Đăng nhập ở `/login` (không phải `/internal/login`).
