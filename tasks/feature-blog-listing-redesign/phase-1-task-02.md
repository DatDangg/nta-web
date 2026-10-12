# Task 02: Hero trang Tin tức — ListingHero dùng chung + minh hoạ "tờ báo kính" SVG/CSS

> Nguồn: CR-003 · Spec: R-09a §1, §Tiêu đề, §Design · Ref: `refs/mockup-blog-listing.png`, `refs/hero-background.png`

## Phase
1 — UI

## Type
modification (thay `PageHeader` bằng `ListingHero` có sẵn) + addition (1 component minh hoạ)

## Điều chỉnh so với plan đã duyệt (ghi lý do)
- Plan ghi tạo `BlogHero` + convert `hero-background.png` → webp. Khi đọc code thấy commit `78548bd` đã có
  `src/components/listing/ListingHero.tsx` (breadcrumb pill, tiêu đề + tagline nhấn, mô tả, visual bên phải) và nền
  `public/images/shared/hero-waves.jpg` là **cùng ảnh** với `hero-background.png` user gửi (JPEG nén lại, 1983×793, 38KB; reviewer đo sai khác TB 0.72/255).
  ⇒ Tái dùng, không tạo component hero mới, không thêm asset (ponytail / không trùng lặp). `PageHeader` không đổi.
- `ListingHero` render dòng 1 là `h1`, dòng 2 là tagline `<p>` ⇒ spec R-09a §Tiêu đề cập nhật theo (đồng bộ các trang danh sách khác).

## Classification / Risk
- Change type: **MODIFY** (UI `/blog`) · Scope: `src/app/[locale]/blog/page.tsx` (PageHeader → ListingHero, danh sách
  nằm chung nền sóng), `src/components/blog/BlogNewsVisual.tsx` (mới, `aria-hidden`, chỉ hiện `lg+` qua ListingHero),
  `src/i18n/messages/{vi,en}.json` (`blog.heroTitle/heroLead/heroAccent/heroDescription`), `SPECIFICATIONS.md` (wording §Tiêu đề/§Design).
- Review level: **NORMAL** (không sửa component dùng chung; chỉ thêm 1 consumer của `ListingHero`)
- Blast radius: `/blog`, `/en/blog`. About/contact (PageHeader) + 4 trang danh sách dùng ListingHero không đổi.
- Lưu ý error-memory Error 7: không dùng opacity modifier trên màu `var()`.

## Acceptance Criteria
- [x] h1 "Tin tức & Cập nhật" + tagline "về **AI và ứng dụng thực tiễn**" (nhấn teal); breadcrumb pill
- [x] Nền sóng (ảnh đã tối ưu, dùng chung); minh hoạ chỉ hiện `lg+`, `aria-hidden`
- [x] Khớp mockup 1440; 768/390 không tràn ngang; 0 console error
- [x] vi/en đủ chuỗi; typecheck + lint + build PASS

## Feature Verification
- Acceptance: **PASS** · Reviewer: **PASS NORMAL (round 1)** — 0 CRITICAL/MAJOR, 5 MINOR
- Verify: `npm run typecheck` = PASS · eslint blog = 0 lỗi · `npm run build` = PASS (sandbox, stub next/font Inter — không commit)
- Playwright `next start`: `/vi/blog` 1440/1280/1024/390/375, `/en/blog` 1024/768 → scrollWidth = viewport, 0 console error; 1 `h1`; class CSS mới có trong build

## Residual risk / follow-up (MINOR)
- `delay()` + `GLASS` lặp lại so với `listing/GlassVisual.tsx` (tech debt nhỏ).
- Màu hex hardcode theo pattern `listing/*` (thay cho rule "design tokens") — ghi `.context/decisions.md`, cần user xác nhận ở checkpoint.
- `blog.intro` không còn dùng — dọn ở Task 03.
- Lệch có chủ đích so với mockup: tagline nhỏ hơn dòng 1, breadcrumb hiện icon nhà thay chữ "Trang chủ" (pattern pill chung).
- Ngoài scope: nút home của Breadcrumb pill 32px < 44px touch target (có từ trước) — đề xuất task riêng.

## Review
| Round | Verdict | Report |
|---|---|---|
| 1 | **PASS NORMAL** (5 MINOR) | `.context/review-reports/feature-blog-listing-redesign-phase-1-task-02-round-1-review.md` |
