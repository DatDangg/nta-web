# Spec Update — 2026-10-12 hairstyle-ai-gallery-screenshots

**spec_version:** 3.0.0 → 3.0.0 (**KHÔNG bump — không đổi requirement/behavior contract**)
**Trigger:** feature-update (change-request, class MODIFY content/asset)
**Change:** `spec/changes/2026-10-12-hairstyle-ai-gallery-screenshots.md` (risk LOW)
**Tasks:** T01 thêm 3 ảnh onboarding vào gallery `hair-style-ai` (vi+en) — **done**, review PASS (NORMAL)
**Nguồn:** mô tả trực tiếp của user — _"thêm cái này vào trong cái ảnh chỗ hair style AI đi"_ (+3 ảnh đính kèm)

## Requirements

- **KHÔNG thêm/sửa/xoá requirement nào.** `SPECIFICATIONS.md` giữ nguyên 27 req R-01…R-27.
  - **R-07** (`SPECIFICATIONS.md:99`) — `/products`: "mô tả, ảnh/screenshot, kênh tải (nếu có)" —
    **không giới hạn số lượng** ảnh/screenshot ⇒ thêm 3 ảnh vẫn thoả R-07, không cần đổi ngữ nghĩa.
  - Design-spec Screen 7 (`design-spec.md:325-344`) vốn đã định nghĩa carousel trong card ⇒ UI hiện có
    đã hỗ trợ nhiều slide + dots, không đổi behavior.
- **Lý do KHÔNG bump:** theo `docs/SPEC_VERSIONING.md` — chỉ đổi **dữ liệu nội dung/asset** của một sản
  phẩm (mảng `screenshots` dài thêm), không requirement nào thêm/sửa/xoá/đổi ngữ nghĩa.

## Thay đổi

### T01 — `src/content/products/{vi,en}/hair-style-ai.mdx` (2 file, mỗi file +3 dòng)
- `screenshots` từ 1 → 4 ảnh, đúng thứ tự chỉ báo dots: **Welcome → Try On → Analysis → Rating**
  `/images/products/hair-style-ai.jpg` → `-try-on.jpg` → `-analysis.jpg` → `-rating.jpg`.
- **Asset mới** (copy sẵn, 941×1672): `hair-style-ai-try-on.jpg`, `hair-style-ai-analysis.jpg`,
  `hair-style-ai-rating.jpg` trong `public/images/products/`.
- **KHÔNG đổi:** `home.ts` (card home vẫn ảnh Welcome), `ScreenshotCarousel.tsx`, `products/page.tsx`,
  i18n `products.screenshotAlt` (giữ alt chung + `{title}` — đổi alt riêng từng ảnh sẽ phải đổi schema
  `screenshots: string[]` → `{src,alt}[]`, breaking, ngoài scope), `cardStyles`.

## Test scope (v16)

- **Trang bị đổi:** `/products` + `/en/products` — carousel sản phẩm `hair-style-ai`.
- **Blast radius:** `ScreenshotCarousel` chỉ dùng ở `/products`; card home `hair-style-ai` đọc `home.ts`
  (`image` riêng) — KHÔNG đổi ⇒ home card vẫn 1 ảnh Welcome.
- **Regression cần giữ:** card home `hair-style-ai` vẫn ảnh Welcome; carousel `music-app` không đổi;
  dots/prev-next hoạt động khi `length > 1`; khung `aspect-[9/16]` không crop (tỉ lệ ảnh 941×1672 khớp).
- Verify: `npm run lint` (0 errors, 1 warning pre-existing `src/components/mdx/index.tsx`) · `typecheck`
  PASS · `build` PASS. HTML build `/products` + `/en/products`: 4 ảnh hair-style-ai + 4 dots.
- test framework: **skip** — `test_command: null`.

## Phân tích

- **Không blocker.** Diff content-only (mảng dài thêm), 0 dòng logic/component. Rủi ro LOW.
- Residual: chưa render browser thật để xác nhận không có ảnh nào lỗi tải (verify qua HTML build + file tồn tại).
