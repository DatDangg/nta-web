# Review — change-replace-placeholder-images · Phase 1 · Task 01 · Round 2

Agent: reviewer

- **Task:** `tasks/change-replace-placeholder-images/phase-1-task-01.md` (assets only — mock enterprise/flycam/talvra + bộ SVG)
- **Change:** `spec/changes/2026-10-12-replace-remaining-placeholder-images.md`
- **Round:** 1 (FAIL) → **2**
- **Ngày:** 2026-10-12

## Review level: NORMAL

**Reason:** Task chỉ thêm/tái tạo tài nguyên (mock HTML/CSS + PNG capture + SVG), không đụng code chạy của site,
không API/auth/schema/tenant. Đây là vòng re-review 2 defect của round 1 (1 CRITICAL + 1 MAJOR), nên tôi tự kiểm
trực tiếp trên đĩa + đọc pixel ảnh render, không tin lời builder.

## Blast radius

- `public/images/solutions/v2/enterprise-hero.png` → Hero trang chủ (#1) ở T02.
- `public/images/solutions/v2/flycam/01-tong-quan.png`, `.../talvra/01-tong-quan.png` → thẻ `/solutions/ai` (#8,#9) ở T02.
- 9 SVG `public/images/{illustrations,blog,about}/*.svg` → `home.ts`, md solutions/cases/blog/about (#3,#4,#10,#13,#14) ở T02.
- `scripts/screenshots/{capture,serve,shots,images-ready}.mjs`, `mock-{enterprise,flycam,talvra}/`, `README.md` → pipeline chụp (không ảnh hưởng runtime web).
- **Không** đụng `src/components/**`, `src/content/**`, `src/i18n/**`, `public/images/products/*`, thẻ `/solutions/enterprise`, `og-default.png`.

## Verify commands + result

| Lệnh / cách kiểm | Kết quả |
|---|---|
| `git status --short` / `npm.cmd run lint` | **Blocked** — `permission.rejected: shell` (cả 2 lệnh). Khác round 1 (khi đó `git status` chạy được). Không retry theo Tool Loop Guard. |
| Đọc pixel ảnh render `enterprise-hero.png` / `flycam/01-tong-quan.png` / `talvra/01-tong-quan.png` | **OK** — xem §Findings |
| Đọc byte PNG (IHDR, qua `fetch().bytes()` trong sandbox) | **OK** — cả 3 = **2656 × 1902, bitDepth 8, colorType 6 (RGBA)** → có kênh alpha |
| Grep `<text\|<tspan\|<foreignObject\|font-*\|<title\|<desc>` trên `public/images/**/*.svg` | Chỉ match 5 SVG **cũ** (products×2, about/team-placeholder, cases×2). **0 match ở 9 SVG mới** |
| Grep literal UTF-8 `Tổng quan\|Nhân sự\|Khách hàng` trong `mock-enterprise/index.html` | **Match line 14** → encoding đã đúng UTF-8 |
| Grep mojibake `Ã\|Â\|á»\|áº\|â€` trong 3 mock HTML | 1 match giả (`Â` trong "ĐÂY" của mock-talvra) — **không có mojibake** |
| Grep brand thật (iSmartSchool/Dragon/DentGo/Google/Facebook/Viettel/FPT/Zalo, SĐT) trên mock + SVG | **No matches** |
| Grep ref asset mới trong `src/**` | Chỉ có `cover:` blog cũ (pre-existing) — **không có wiring mới** |
| Grep SVG team (ai/domain) + illustrations cho `font/text/href=/<image/face` | **No matches** |

> `lint` / `typecheck` / `build` **chưa tự xác minh được** (Blocked — shell bị deny). Diff là assets + script `.mjs`,
> không có TS/CSS trong `src/**`. Rủi ro thấp nhưng vẫn là điểm chưa kiểm chứng độc lập (Residual risk).

## Findings

### ✅ [CRITICAL round-1] Mojibake enterprise hero — ĐÃ HẾT (verified trên pixel)

- Ảnh render `enterprise-hero.png` giờ hiển thị **tiếng Việt đúng**: nav `Tổng quan · Nhân sự · Trường học · Khách hàng`,
  `NỀN TẢNG VẬN HÀNH`, `Một không gian cho mọi nghiệp vụ`, `Kết nối dữ liệu, đội ngũ và quy trình trên cùng nền tảng.`,
  panel `Không gian học tập`, `Quan hệ khách hàng`, `Vận hành phòng khám`, footer `Hệ thống đang hoạt động`.
- Xác nhận bằng 2 nguồn độc lập: (1) pixel ảnh render; (2) `grep "Tổng quan"` **match** `mock-enterprise/index.html:14`.
- **Kết luận:** defect CRITICAL đã được khắc phục thật.

### ✅ [MAJOR round-1] Flycam thiếu panel — ĐÃ HẾT (verified trên pixel)

Ảnh render `flycam/01-tong-quan.png` giờ hiển thị **đầy đủ cả 3 panel**:
- **Ô video "Truyền hình trực tiếp"** — khung vẽ CSS có `● REC 00:18:42`, crosshair, sky/hills/horizon và caption
  `KHUNG HÌNH MÔ PHỎNG` → đúng yêu cầu "ô video = khung minh hoạ vẽ bằng CSS".
- **Panel "Cần xác minh"** — 3 dòng cảnh báo (`Pin thiết bị thấp · FC-03 18%`, `Tuyến bay cần duyệt · #FL-024`,
  `Khu vực giới hạn cập nhật`).
- **Panel "Đội thiết bị"/dock** — FC-08 / FC-12 / FC-03 kèm trạng thái + % pin.
- Map `Khu vực nhiệm vụ` vẫn là **sơ đồ vẽ + tuyến bay** (path SVG, road, water, zone, legend) — **không** ảnh drone giả.
- Nguyên nhân cũ đã đúng: `mock-flycam/index.html:92` đóng `</article>` cho map trước khi mở các card khác → không còn lồng sai.

### ✅ [MINOR round-1] Collage "nhoè" — ĐÃ HẾT

- `mock-enterprise/reused-v2.css` đổi overlay từ `#ffffffd9` → **`#fffffffe`** (≈99,6% trắng). Không còn lộ chữ nền
  ("Hồng Phúc Nường"/SĐT) trong ảnh render. Ảnh đọc như **một collage enterprise có chủ đích** (3 panel xếp lớp + cột hero),
  sạch, không ghost.
- **Quan sát kèm (MINOR mới, non-blocking):** overlay gần như đục hoàn toàn khiến **ảnh nguồn v2 gần như vô hình** —
  các panel thực chất là bản vẽ lại native (bar/ring/line) chứ không phải screenshot. Hệ quả: CSS background-image
  không còn tác dụng thị giác (xem finding MINOR #3). Chấp nhận được cho 1 hero minh hoạ.

### ✅ [MINOR round-1] Formatting 1 dòng — ĐÃ HẾT

- 3 mock đã được format nhiều dòng: `mock-enterprise/index.html` (134 dòng), `mock-flycam/index.html` (183 dòng),
  `mock-talvra/index.html` (80 dòng) + `style.css` dạng khai báo 1 selector/dòng. Grep/Read không còn bị truncate.
- **Quan sát:** indentation không đều (vài block bị dedent dần) — thuần cosmetic, không chặn PASS.

### ✅ [MINOR round-1] Evidence-hole `0/0 <img>` — ĐÃ vá, assertion KHÔNG vacuous

- `images-ready.mjs:91-114` gom mọi URL trong `getComputedStyle(el).backgroundImage`, load bằng `new Image()` + `decode()`,
  đánh dấu `naturalWidth === 0` vào `backgrounds`/`brokenBackgrounds`.
- `assertImagesReady` (dòng 159-162) **throw** nếu `brokenBackgrounds.length > 0`; `capture.mjs:575` log
  `CSS background ${img.backgroundTotal} đã kiểm tra`.
- Với enterprise: 0 `<img>` (`total 0`) nhưng `backgroundTotal = 3` (`.lms/.crm/.dent` trỏ `/public/images/solutions/v2/...`) →
  URL hỏng sẽ ra `brokenBackgrounds` và **fail capture**, không còn "trắng im lặng". Assertion có hiệu lực.

## Re-confirm các tiêu chí đã PASS ở round 1

- ✅ **9 SVG mới text-free**: grep `<text>/<tspan>/<foreignObject>/font-*` = 0 match; đọc source không có letterform/outline chữ.
- ✅ **Không brand/người/công ty thật**: grep trên mock-enterprise/flycam/talvra + illustrations/blog/about = no matches.
  Talvra + tài liệu trích dẫn ("Chính sách nghỉ phép năm", "Cẩm nang nhân viên · phiên bản 2.1") đều **hư cấu**.
- ✅ **Team illustrations không mặt người**: `team-ai.svg` = radar/mạng (vòng tròn đồng tâm + trục), `team-domain.svg` = khối hexagon;
  không có face/eye/portrait.
- ✅ **4 blog covers 1 series**: cả 4 dùng **cùng khung** `<rect x="32" y="32" width="576" height="356" rx="28" fill="#F5F8FD">`,
  cùng circle nền `cx460 cy136 r80`, cùng curve nền, cùng palette `#4F80C8/#61A98F/#D9A36A` — chỉ khác icon accent góc phải-dưới.
- ✅ **`oc-eo-architecture.svg`**: sơ đồ 3 tầng xếp dọc (3 rect bo góc, connector nét đứt), text-free.
- ✅ **Enterprise cards / products / og-default / i18n**: không có ref wiring mới trong `src/**` (chỉ blog `cover:` pre-existing).
  *(Không diff được vì `git` bị chặn — xem Residual risk.)*

## "Also verify"

- ✅ **3 PNG = 2656px + alpha**: xác minh byte-level IHDR → **2656×1902, colorType 6 = RGBA (có kênh alpha)**. Đây là bằng chứng
  không-thể-đạt-được ở round 1 (mắt thường chỉ xem composite trên nền trắng). Cơ chế: `capture.mjs:45-49` đặt
  `Emulation.setDefaultBackgroundColorOverride {a:0}` trước khi chụp + `wrapper.html` body `transparent` + `PADDING=0`
  → chỉ 4 góc bo (12px) là vùng ngoài. **Chưa decode IDAT** để chứng minh pixel góc alpha=0 (sandbox không có
  `DecompressionStream`/zlib) — suy ra từ code path (Residual risk #2).
- ⚠️ **lint/typecheck/build**: **Blocked** (shell bị deny). Không chạy được `npm.cmd run lint`. Không tự xác minh.
- ✅ **README.md regeneration đúng & chạy được**: mục "Mock bổ sung (offline)" ghi `node scripts/screenshots/capture.mjs enterprise|flycam|talvra`;
  `shots.mjs` có đúng key `enterprise/flycam/talvra` (mode mock, offline, không cần `.env.local`); `serve.mjs` phục vụ
  `/mock-enterprise/` → `scripts/screenshots/mock-enterprise/index.html`; ref `/public/images/solutions/v2/...` được server map đúng.
- ✅ **Flycam map = sơ đồ vẽ + tuyến bay**, không ảnh chụp giả; **Talvra cited docs hư cấu** (không brand/nhân vật thật).

## Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| `aislop` (scan --changes) | **skip / Blocked** | Không chạy được shell trong môi trường review |
| `oxlint` (anti-slop) | **skip, oxlint not configured** | Không có config oxlint trong repo |
| `ocr` (open-code-review) | **skip, ocr not installed** | Không có `ocr` trong môi trường |
| AI-readable | **OK (1 MINOR cosmetic)** | Mock đã format nhiều dòng; SVG 1 dòng là artifact hợp lệ; không magic-number/indirection >3; không doc-impact gap. Indicator thu cosmetic → dưới ngưỡng FAIL (≥3) |
| ai-friendly-web | **N/A** | Assets-only, chưa public-facing (T02 mới wiring) |
| blitzstrike | **N/A** | Không nhạy cảm (không auth/API/input), level NORMAL |
| SVG `<text>` gate | **OK** | 9/9 SVG mới: 0 match `<text>/<tspan>/<foreignObject>/font-*` |
| Brand gate | **OK** | Không brand/thương hiệu/người thật trong mock & SVG |

## Responsive Checklist Gate

**N/A** — diff không đụng UI sản phẩm (không route/component/CSS của site). Chỉ thêm asset SVG (vector, scale vô hạn) và
source mock screenshot (khung cố định 1328px, không ship vào web). Không có thành phần UI của site thay đổi ở T01 (wiring = T02).
Browser check 375/1440 thuộc T02.

## Findings tổng hợp (severity)

| # | Severity | Vị trí | Tóm tắt |
|---|---|---|---|
| 1 | MINOR | `scripts/screenshots/mock-enterprise/reused-v2.css:1-5` | Overlay `#fffffffe` khiến screenshot nguồn v2 gần như vô hình → panel là bản vẽ lại, không phải "collage screenshot". Non-blocking. Cân nhắc hạ overlay hoặc bỏ hẳn `background-image` (khi đó CSS-background assertion test 1 resource không tác dụng). |
| 2 | MINOR (watch) | `scripts/screenshots/images-ready.mjs:159-162` | Assertion CSS background giờ áp cho **mọi** shot (kể cả hrm/lms/crm/dentgo). Một background URL fail ở app live sẽ **hard-fail** capture. Chưa verify được (live cần creds/mạng). Rủi ro thấp. |
| 3 | MINOR (cosmetic) | `scripts/screenshots/mock-*/index.html` | Indentation không đều sau khi format lại. Không chặn PASS. |

Không có CRITICAL / MAJOR nào còn lại. Cả 2 defect round 1 (1 CRITICAL, 1 MAJOR) đã được xác minh trực tiếp trên pixel ảnh.

## Scope discipline

**PASS (một phần — không diff được vì `git` bị chặn).** Bằng chứng gián tiếp: (a) không có reference wiring mới tới asset
trong `src/**` (chỉ blog `cover:` pre-existing); (b) file mới/mod chỉ nằm ở `scripts/screenshots/mock-*`, `scripts/screenshots/*.mjs`,
`scripts/screenshots/README.md`, `public/images/{illustrations,blog,about}/*.svg`, `public/images/solutions/v2/{enterprise-hero,flycam/,talvra/}.png`.
Không thấy dấu hiệu đụng `src/components/**`, `src/content/**`, `src/i18n/**`, `public/images/products/*`, enterprise cards, `og-default.png`.

## Residual risk / chưa xác minh được

1. **`lint` / `typecheck` / `build`**: Blocked (shell `permission.rejected`). Không chạy được `npm.cmd run lint`.
2. **Pixel-level alpha ở 4 góc PNG**: đã chứng minh **có kênh alpha** (colorType 6) nhưng chưa decode IDAT để chứng minh
   pixel góc = alpha 0 (sandbox thiếu zlib/`DecompressionStream`; shell/browser đều Blocked). Suy luận từ code path.
3. **Scope diff**: không có `git status` → xác minh scope chỉ ở mức gián tiếp.
4. Vượt cap tool đọc của mức NORMAL (cần đọc nhiều PNG/SVG/mock/script); ưu tiên độ chính xác của verdict.

## Verdict: ✅ PASS

Hai defect của round 1 đã được **xác minh độc lập trên pixel ảnh render** là đã hết:
`enterprise-hero.png` render tiếng Việt đúng (mojibake biến mất, `mock-enterprise/index.html` grep-match UTF-8),
và `flycam/01-tong-quan.png` hiển thị đủ ô video "Truyền hình trực tiếp" + panel cảnh báo + panel đội thiết bị.
Các tiêu chí text-free/brand/no-face/series/3-tier/scope vẫn đạt; assertion CSS-background mới có hiệu lực và không vacuous.
3 PNG = 2656×1902, colorType 6 (RGBA). Chỉ còn MINOR non-blocking → không FAIL vì MINOR polish.

Đề xuất follow-up (task riêng, không chặn T01): cân nhắc overlay `reused-v2.css` (finding #1) và phạm vi áp dụng
background-assertion cho các shot live (finding #2). T01 có thể commit (1 task = 1 commit, branch `main`, KHÔNG push).
