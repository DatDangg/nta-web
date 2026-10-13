# phase-1-task-01 — Bỏ khối "Chi tiết ứng dụng" ở /products

- Change: CR-006 `spec/changes/archive/2026-10-13-products-remove-app-details.md`
- Classification / Risk: REMOVE · risk low · spec 3.5.1 (reconcile, không bump) · scope v29

## Việc đã làm
- `src/app/[locale]/products/page.tsx`: bỏ section `product-details-title` (2 AppCard + ScreenshotCarousel) và import thừa.
- Xoá component chỉ khối này dùng: `AppCard.tsx`, `ScreenshotCarousel.tsx`, `productThemes.ts`; bỏ 3 key i18n carousel (vi/en); sửa comment `cardStyles.ts`.
- Giữ `DownloadLinks.tsx` (`hasDownloadUrl` còn dùng cho nhãn "Sắp ra mắt"; `DownloadLinks`/`ComingSoonBadge` để dành khi có link store).

## Verification
- `bash tools/linux-build.sh verify`: typecheck/lint/build PASS.
- Smoke: `/products` (vi) + `/en/products` 200, không còn khối chi tiết; thẻ link `/products/music-app`, `/products/hair-style-ai`.
- Review round 1 PASS (`.context/review-reports/feature-products-remove-app-details-phase-1-task-01-round-1-review.md`).

## Doc impact
- `spec/CHANGELOG.md` (reconcile), `spec/test-scope/current.json` v29. Không đổi API/schema.
