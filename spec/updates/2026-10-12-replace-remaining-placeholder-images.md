# Spec Update — 2026-10-12 replace-remaining-placeholder-images

**spec_version:** 3.0.0 → 3.0.0 (**KHÔNG bump — không đổi requirement/behavior contract**)
**Trigger:** feature-update (change-request, class MODIFY render + REMOVE)
**Change:** `spec/changes/2026-10-12-replace-remaining-placeholder-images.md` (risk MEDIUM)
**Tasks:** T01 assets · T02 wiring · T03 /contact remove · T04 /products — **done hết**, review PASS (T01 NORMAL, T02 STRICT, T03 NORMAL, T04 NORMAL)
**Change file:** đã archive → `spec/changes/archive/2026-10-12-replace-remaining-placeholder-images.md`

## Requirements

- **KHÔNG thêm/sửa/xoá requirement nào.** `SPECIFICATIONS.md` giữ nguyên 27 req R-01…R-27.
  - Thay ảnh placeholder = thay **asset/nội dung hiển thị**, không đổi ngữ nghĩa R-03/R-05/R-07/R-09/R-20.
  - T03 bỏ `MapEmbed` + dòng "(placeholder)" ở `/contact` = dọn nội dung, không đổi requirement R-18 (form liên hệ vẫn nguyên).
- **Lý do KHÔNG bump:** theo `docs/SPEC_VERSIONING.md` — không requirement nào thêm/sửa/xoá/đổi ngữ nghĩa;
  chỉ thay ảnh hiển thị + dọn chỗ trống, không đổi contract/hành vi.

## Thay đổi

### T01 — assets (không đụng `src/**`)
- 3 PNG mock mới cùng phong cách ảnh v2: `solutions/v2/enterprise-hero.png`,
  `solutions/v2/flycam/01-tong-quan.png`, `solutions/v2/talvra/01-tong-quan.png` (2656×1902, RGBA).
- 9 SVG **không chữ**: `illustrations/{ai-analysis,ai-apps,oc-eo-architecture}.svg`,
  `blog/{first-steps,learning-content,digital-workflows,responsible-ai}-cover.svg`,
  `about/{team-ai,team-domain}.svg`.
- Pipeline tái tạo: `scripts/screenshots/mock-{enterprise,flycam,talvra}/` + `capture/serve/shots/images-ready.mjs`.

### T02 — wiring vào site
- Hero: `solutions/enterprise.svg` → `enterprise-hero.png`; `aspect-[4/3] object-cover` → `object-contain`
  + `width/height` khớp tỉ lệ ảnh (2656×1902) — không cắt 2 bên.
- `home.ts`: 2 thẻ trang chủ (Giải pháp AI / Ứng dụng AI) + featuredCase Óc Eo → SVG/ảnh mới; alt VI/EN.
- 3 solution AI (`boxai`/`flycam`/`custom-ai`): thêm `cardImage: {src, alt, ratio}` (**không** đổi field `image`/OG).
- 2 case study: gallery dental = 3 ảnh DentGo v2; gallery Óc Eo = 3 SVG (thêm `oc-eo-edge-detail` + `oc-eo-operations-detail`).
- About: 2 ảnh đội ngũ → `team-ai.svg`/`team-domain.svg`; **xoá** `about/team-placeholder.svg`.
- i18n: `home.heroImageAlt` (vi+en).

### T03 — `/contact` (REMOVE)
- Bỏ `MapEmbed` (iframe Google Map cả nước) + 2 dòng/g/key "(placeholder)" (footer + `contact.placeholders`).
- `docs/DESIGN.md`: reconcile screen "Liên hệ" (bỏ MapEmbed, layout form).

### T04 — `/products` + 2 thẻ sản phẩm (ảnh user cung cấp)
- Ảnh user: `public/images/products/hair-style-ai.jpg` (941×1672) + `ai-music-app.png` (941×1671) — **poster dọc 9:16**.
- **⚠ Thay spec gốc (user chốt):** spec muốn khung 16/10 cắt đáy; poster có chữ ở đáy nên cắt sẽ **mất chữ**
  (vi phạm acceptance). User chọn **khung theo tỉ lệ poster 9/16**.
- Thêm `cardPosterImageClass` (`aspect-[9/16]`); `ProductCard` (home) + `ScreenshotCarousel` (`/products`) dùng khung mới;
  `cardImageClass` (16/10 dùng chung) **không sửa**. `home.ts` 2 thẻ (vi+en) + 4 `.mdx` `screenshots`;
  i18n `products.screenshotAlt` → prefix "Giao diện minh hoạ — "/"Illustrative interface — "; xoá 2 SVG preview cũ.

## Test scope (v13)

- **Trang bị đổi ảnh:** `/` (+`/en`), `/solutions/ai` (+detail AI), `/case-studies` (+dental + oc-eo-learning),
  `/blog`, `/about`, `/contact` — VI + EN.
- **Regression cần giữ:** 4 trang enterprise (card `cardImage` khác nhánh), trang products (chờ T04),
  footer mọi trang (T03 sửa text), OG image solutions không đổi.
- Verify: `npm.cmd run lint` / `typecheck` / `build` PASS; HTML build xác nhận ảnh render + `grep` src = 0 ref placeholder cũ.
- `check-left-align`: **skip** — repo không có script này (không có `verify-*.mjs`).

## Phân tích

- **Không còn blocker.** T04 dùng ảnh user (`hair-style-ai.jpg`, `ai-music-app.png`) — khung 9/16 theo user chốt (thay spec 16/10) để giữ chữ.
- Dead asset placeholder cũ (`solutions/{ai,apps,enterprise}.svg`, `cases/*-overview.svg`) còn ship nhưng **không còn reference**;
  dọn ở task riêng (MINOR).
- Residual: chưa verify bằng mắt (no browser viewport emulation); ratio ảnh đo bằng System.Drawing (boxai 1.954, flycam/talvra 1.396; poster 941/1672≈9/16).
