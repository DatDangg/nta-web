# feature-hero-wide-screen-backdrop · phase-1-task-01 — Hero > 1440: nền mờ full-bleed sau stage 1440

- **CR:** CR-041 (follow-up CR-040) · spec **R-01b** (4.9.0), giữ R-01, R-22 (LCP)
- **Status:** done (2026-10-19) · attempt 1 · reviewer round 1 PASS (NORMAL)
- **Classification / Risk:** MODIFY (UI-only) · **LOW–MEDIUM**
  - Expected review level: **NORMAL** (chỉ trang chủ, chỉ `lg+`, rõ nhất > 1440; rủi ro thẩm mỹ + tải ảnh).
  - Blast radius: `src/components/home/HeroVisual.tsx` (`HeroBackground`). `Hero.tsx`, `HeroMobileImage`, khung chữ 1280 **không đổi**.
  - Doc impact: `docs/DESIGN.md` dòng "Hero desktop (as-built, R-01b, CR-040)" → cập nhật as-built.
- **Hướng:** A — user chốt "a đi" + duyệt plan (auto proceed).

## Hiện trạng (CR-040)
- `HeroBackground`: lớp `absolute inset-0 -z-10 hidden lg:block` → stage `relative mx-auto h-full w-full max-w-[1440px] overflow-hidden`
  → khung ảnh `right-0 aspect-[1787/880] h-full` + fade trái 30% + fade phải `w-24` (`min-[1441px]:block`) + panel; lớp phủ trắng vùng chữ
  theo bề rộng stage; mờ đáy full-width ngoài stage. Ngoài stage = `bg-white` của section → > 1440 hai bên trắng trơn, mép phải ảnh gần như cắt cứng.

## Scope
1. Thêm lớp **nền mờ full-bleed** (đầu tiên trong lớp `absolute inset-0 -z-10`, phía SAU stage), chỉ hiện `min-[1441px]` (≤ 1440 không render/ẩn):
   bản sao `HERO_SRC` `fill object-cover` (có thể lệch object-position về phía robot), `blur` mạnh (vd `blur-2xl`/`blur-3xl` + `scale` nhẹ để mép blur
   không lộ viền trắng — wrapper `overflow-hidden`), phủ trắng nhẹ (vd `bg-white/40–60`) giữ tông sáng. `alt=""` + `aria-hidden`, **không priority**,
   `sizes` nhỏ (vd `640px`) → tải bản nhỏ.
2. Stage ảnh nét (≤ 1440) hoà hai cạnh vào nền: thay fade phải `w-24 from-white` bằng **mask/fade rộng hai cạnh** chỉ khi > 1440
   (vd `min-[1441px]:[mask-image:linear-gradient(to_right,transparent,black_X%,black_(100-X)%,transparent)]` trên stage hoặc khung ảnh, với X đủ rộng
   ~8–12% stage), fade sang **nền mờ** chứ không sang trắng. Lưu ý panel kính sát mép phải khung (panel phải tới ≈ 97.6% khung) không được bị mờ mất —
   nếu mask đặt trên stage làm panel mờ, đặt mask riêng cho lớp ảnh (wrapper ảnh) chứ không cho panel.
   Fade trái 30% (che mép trái khung ảnh sang trắng) cần xem lại để chuyển sang nền mờ ở > 1440 thay vì trắng trơn (≤ 1440 giữ nguyên).
3. Lớp phủ trắng vùng chữ bên trái: > 1440 phải phủ cả phần nền mờ bên trái ngoài stage (từ mép trái màn hình) để chữ dễ đọc, rồi trong suốt dần
   về phía ảnh như hiện tại. ≤ 1440 giữ nguyên gradient cũ.
4. Mờ đáy chuyển section (`h-24 from-white` full-width) giữ nguyên.
5. Không đổi: `Hero.tsx`, khung chữ `Container` 1280, chiều cao ≤ 662, `sizes`/`priority` ảnh nét, `HeroMobileImage`, vị trí panel.
6. Cập nhật comment JSDoc `HeroBackground` + `docs/DESIGN.md` dòng hero as-built.

## Verify
- typecheck / lint / test (cmd từ `.context/project-config.md`); build: `docker build --target builder -t nta-web-buildcheck:tmp .` rồi `docker rmi`.
- Trình duyệt thật (next start + Edge headless như CR-040, `scripts/screenshots/cdp.mjs`): chụp hero vi (+ en ít nhất 1920) ở **1440, 1920, 2560, 3840**
  → `.context/review-reports/cr-041-screens/`. Kiểm: không mảng trắng trơn hai bên, không cạnh cắt cứng, h1 left = mép Container (≤ 2px),
  `scrollWidth == clientWidth`, 1440 giống CR-040 (so ảnh/so DOM), ảnh nền mờ tải bản nhỏ (w ≤ 750), ảnh nét vẫn priority.
- 375/768/1024/1280: không đổi.

## Retry / Escalation
- Max 3 attempt; FAIL lần 3 → `architecture_review_needed`.

## Evidence
_(builder, 2026-10-19, attempt 1)_

### Thay đổi
- `src/components/home/HeroVisual.tsx` `HeroBackground` (chỉ file này trong src):
  - Thêm (đầu lớp `absolute inset-0 -z-10`, sau = dưới stage) khối nền mờ `absolute inset-0 hidden overflow-hidden min-[1441px]:block`:
    `<Image alt="" fill sizes="640px" src={HERO_SRC} className="scale-110 object-cover blur-2xl">` (không priority → `loading="lazy"`, không preload) + phủ `bg-white/50`. `aria-hidden` trên wrapper.
  - Thêm dải phủ trái ngoài stage `absolute inset-y-0 left-0 hidden w-[calc(50%-720px)] bg-gradient-to-r from-white/70 to-white/90 min-[1441px]:block`.
  - Ảnh nét: thêm `min-[1441px]:[mask-image:linear-gradient(to_right,transparent,black_30%,black_88%,transparent)]` (mask trên `<img>`, không trên khung → panel kính không bị mờ). Fade trái 30% trắng thêm `min-[1441px]:hidden`; **bỏ** dải fade phải `w-24` (mask thay thế).
  - Lớp phủ vùng chữ trong stage: thêm biến thể `min-[1441px]:` gradient mép trái `0.9` (thay `#fff`), các stop còn lại giữ nguyên → nối liền dải phủ ngoài stage (≤ 1440 giữ gradient cũ).
  - Mờ đáy, `sizes`/`priority` ảnh nét, panel, `HeroMobileImage`, `Hero.tsx` không đổi. JSDoc `HeroBackground` cập nhật.
- `docs/DESIGN.md` dòng "Hero desktop (as-built, R-01b, CR-040, CR-041)" cập nhật.
- CSS sinh thật (đọc `.next/static/css/*.css` trong image builder): `@media (min-width:1441px)` có `-webkit-mask-image` + `mask-image: linear-gradient(90deg,transparent,black 30%,black 88%,transparent)` (autoprefixer), gradient overlay `.9`, `w-[calc(50%-720px)]`, `from-white/70`, `to-white/90`, `blur-2xl` (40px), `scale-110`.
- Chỉnh thẩm mỹ trong vòng: lần chụp đầu dải phủ trái là `bg-white/90` đặc → ở 3840 bên trái gần như trắng trơn; đổi sang gradient `white/70 → 0.9` (thấy nhẹ texture thành phố mờ ở mép màn hình, sát stage vẫn 0.9 nên không lộ nối).

### Verify
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS (0 error, 1 warning có sẵn `src/components/mdx/index.tsx:26`, ngoài scope) |
| `npm test` | 199 · 196 pass · 1 fail **có sẵn, ngoài scope** (`tools/db/content-rules.test.ts` "ảnh tồn tại" — thiếu `public/uploads` local) |
| `docker build --target builder -t nta-web-buildcheck:tmp .` | PASS 2 lần (trước/sau chỉnh dải phủ trái): `✓ Compiled successfully`, `✓ Generating static pages (9/9)` → `docker rmi` đã xoá, container đã xoá |

### Đo DOM (next start trong image builder `npx next start`, `CONTENT_SOURCE=file`, Edge headless + `scripts/screenshots/cdp.mjs`, profile mới mỗi viewport, cache tắt, scrollbar ẩn, reduced-motion, Accept-Language vi cho `/`, en cho `/en`). Đơn vị px.

| W×H | h1 left | Container mép (kỳ vọng) | section cao | khung ảnh nét l–r | panel l–r | nền mờ hiển thị | request hero-banner | scrollW/clientW |
|---|---|---|---|---|---|---|---|---|
| 1024×768 | 32 | 32 | 540 | −72.6–1024 | 426.4–996.6 | không | `w=1200` (chỉ ảnh nét) | 1024/1024 |
| 1280×800 | 32 | 32 | 588.8 | 84.3–1280 | 628.4–1250.1 | không | `w=1920` (chỉ ảnh nét) | 1280/1280 |
| 1440×900 | 112 | 112 | 662 | 95.7–1440 | 707.3–1406.4 | không | `w=1920` (chỉ ảnh nét) | 1440/1440 |
| 1920×1080 | 352 | 352 | 662 | 335.7–1680 | 947.3–1646.4 | có (−96–2016, scale 1.1) | `w=1920` (+ `w=640` ở lần chạy 1) | 1920/1920 |
| 2560×1440 | 672 | 672 | 662 | 655.7–2000 | 1267.3–1966.4 | có | `w=1920` + `w=640` | 2560/2560 |
| 3840×2160 | **1312** | 1312 | 662 | 1295.7–2640 | 1907.3–2606.4 | có | `w=1920` | 3840/3840 |
| en 1920×1080 | 352 | 352 | 662 | 335.7–1680 | 947.3–1646.4 | có | `w=1920` + `w=640` | 1920/1920 |

- h1 left = mép Container: chênh **0px** mọi viewport. Ghi chú: kỳ vọng 3840 → 1232 trong brief là tính nhầm; Container 1280 + padding 32 → (3840−1280)/2 + 32 = **1312** (cùng công thức cho 1920→352, 2560→672). Khung ảnh > 1440 right = (W+1440)/2 đúng tuyệt đối.
- **1440 không đổi so với CR-040**: khung 95.7–1440, panel 707.3–1406.4, cao 662, h1 112 (y hệt); ảnh chụp 1440 giống bản cũ (fade trái trắng, không có nền mờ).
- **Tải ảnh nền mờ**: ≤ 1440 **không có request** ảnh mờ (img `loading="lazy"` trong khối `display:none` → Chromium không tải). > 1440: khi tải thì là `w=640` (≤ 750). Có lúc (2560 lần 1, 3840, 1920 lần 2) Chromium chọn lại candidate `w=1920` đã có trong memory cache từ ảnh nét (cùng URL) → **không phát sinh request thêm**. Ảnh nét: không `loading` (eager), có `<link rel="preload" as="image">` với `imageSizes` = `sizes` cũ; ảnh mờ không preload.
- Liên tục độ sáng tại mép stage (ảnh chụp, hàng y=200/400/600, ±6px quanh x=(W∓1440)/2): 2560 trái 253–254 phẳng, phải 222–223 / 231–232 / 190–194 (trôi đều, không bước nhảy); 1920 tương tự → không cạnh cắt cứng / đường nối.

### Screenshot (`.context/review-reports/cr-041-screens/`, header + hero)
`hero-vi-1024.png`, `hero-vi-1280.png`, `hero-vi-1440.png`, `hero-vi-1920.png`, `hero-vi-2560.png`, `hero-vi-3840.png`, `hero-en-1920.png`.
Đã tự xem: 1920/2560/3840 hai bên không còn dải trắng trơn — bên phải nền mờ teal/xanh nối tiếp ảnh, bên trái thành phố mờ rất nhạt dưới lớp phủ; ảnh nét hoà mềm hai cạnh, không mép dọc; panel "Giải pháp & ứng dụng" sát mép phải vẫn nét; chữ đen/teal trên nền gần trắng, dễ đọc; mờ đáy chuyển section vẫn còn. 1440/1280/1024 như cũ.

### Residual risk
- Thẩm mỹ bất đối xứng ở màn rất rộng (3840): bên phải teal rõ, bên trái gần trắng (do lớp phủ chữ) — chủ ý để chữ dễ đọc; cần mắt người duyệt.
- Nền mờ đôi khi dùng lại `w=1920` từ cache thay vì `w=640` (hành vi chọn srcset của Chromium) — không tốn request thêm; trình duyệt khác có thể tải `w=640` (~nhỏ).
- `blur-2xl` (40px) trên ảnh `fill` khổ lớn tốn GPU khi vẽ lần đầu ở màn > 1440 (tĩnh, không animation) — rủi ro hiệu năng thấp.
- Đo với `CONTENT_SOURCE=file` + reduced-motion (như CR-040); `motion-load-zoom` vẫn áp trên ảnh nét có mask — mask theo hộp ảnh nên zoom không làm lộ mép (stage `overflow-hidden` vẫn cắt).
- 375/768: không đo lại (nhánh < lg không đổi code: `HeroMobileImage` + `hidden lg:block` giữ nguyên).
