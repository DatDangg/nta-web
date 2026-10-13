# phase-1-task-05 — Layer 3: trang chi tiết 2 sản phẩm app

- Change: CR-004 `spec/changes/2026-10-13-shared-detail-showcase-template.md`
- Classification / Risk: ADDITIVE (route mới + field optional) · risk low
- Spec: 3.5.1 (R-08c.1) · scope v28

## Việc đã làm
- Route `src/app/[locale]/products/[slug]/page.tsx` (SSG `music-app`, `hair-style-ai`; metadata/canonical/alternates/breadcrumb JSON-LD; slug lạ → 404).
- Data `showcase` vi/en trong `src/content/products/*/*.mdx` từ info user 13/10 (hero, 3 số liệu, Vấn đề/Giải pháp/Lợi ích, Cách dùng 3 bước, carousel 6 màn, quyền riêng tư / quyền sử dụng, 5 tính năng, giá & nền tảng, FAQ 4 câu, CTA liên hệ).
- Biến thể phone: `ScreenMock` (`device: phone`), `ShowcasePhotos` (`variant: phone` + `aspect`), icon `photo/ai/music/share`.
- `/products`: thẻ link sang trang chi tiết; chips cập nhật theo tính năng thật. Sitemap thêm 4 URL.
- Ảnh: `public/images/products/v2/{music-app,hair-style-ai}/` — 12 ảnh chụp màn hình (resize 720px) + 2 ảnh hero ghép từ ảnh user gửi.

## Không dùng (BR-004)
- Nhạc: màn Premium (rating 4.8, "80% người dùng chọn"), ảnh simulator có thanh "Open debugger".
- Tóc: `01-welcome` (ảnh minh hoạ khách cung cấp, chưa xác nhận giấy phép); `07-premium` không có.

## Verification
- `bash tools/linux-build.sh verify`: typecheck PASS · lint PASS (1 warning cũ) · build PASS.
- Smoke (serve): 4 URL chi tiết 200, `/products/nope` 404, canonical đúng, sitemap có 4 URL mới.
- Screenshot Playwright 1440/390: không tràn ngang; block đủ thứ tự.
- Review: round 1 PASS_WITH_CONDITIONS → round 2 PASS (`.context/review-reports/feature-shared-detail-showcase-template-phase-1-task-05-round-{1,2}-review.md`).

## Doc impact
- `SPECIFICATIONS.md` R-08c.1, `spec/CHANGELOG.md`, `spec/updates/2026-10-13-shared-detail-showcase-products.md`, `spec/test-scope/current.json`. Không đổi API/schema.

## Còn mở
- Link store (Google Play / App Store) khi có → `downloadUrl` + nút hero.
- Privacy/Terms Hairstyle AI đang DRAFT — chưa link trên web.
- Khối "Chi tiết ứng dụng" ở `/products` giờ trùng với trang chi tiết — chờ user quyết giữ hay bỏ.
