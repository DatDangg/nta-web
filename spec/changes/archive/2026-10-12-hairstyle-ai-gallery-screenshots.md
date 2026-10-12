---
id: hairstyle-ai-gallery-screenshots
type: feature
status: done
created: 2026-10-12
completed: 2026-10-12
---

# 2026-10-12 — Thêm 3 màn onboarding vào gallery sản phẩm Hair-style AI

## Yêu cầu

Nguyên văn user: _"thêm cái này vào trong cái ảnh chỗ hair style AI đi"_
(kèm 3 ảnh đính kèm — 3 màn onboarding của app HairStyle AI).

User **chốt** (qua câu hỏi làm rõ):

- Thêm **cả 3 ảnh** vào gallery sản phẩm `hair-style-ai`.
- Thứ tự theo **chỉ báo dots** trong ảnh: **Welcome → Try On → Analysis → Rating**.

## Bối cảnh / khảo sát (đã xác minh trên đĩa)

| Hạng mục | Sự thật |
|---|---|
| Render gallery | `src/components/products/ScreenshotCarousel.tsx` — nhận `screenshots: string[]`, map slide + dots, prev/next chỉ hiện khi `length > 1` |
| Nơi render | `src/app/[locale]/products/page.tsx:60` — `AppCard` → `ScreenshotCarousel screenshots={product.screenshots}` |
| Nguồn dữ liệu | `src/content/products/{vi,en}/hair-style-ai.mdx` → `screenshots` (hiện **1 ảnh**: `/images/products/hair-style-ai.jpg`) |
| Card ở home | `src/content/home.ts:18,30` dùng `image: '/images/products/hair-style-ai.jpg'` (ảnh Welcome) — **KHÔNG đổi** |
| Ảnh hiện có | `public/images/products/hair-style-ai.jpg` (941×1672) = màn "Welcome to HairStyle AI" |
| Ảnh mới (đã đặt sẵn) | `public/images/products/hair-style-ai-try-on.jpg` (màn "Hair Style Try On") · `hair-style-ai-analysis.jpg` (màn "Hair Analysis") · `hair-style-ai-rating.jpg` (màn "Help us grow / rating") — tất cả **941×1672** |
| Khung ảnh | `cardPosterImageClass` = `aspect-[9/16]` khớp tỉ lệ 941×1672 ⇒ `object-cover` không cắt (xem `src/components/cards/cardStyles.ts`) |
| Alt | `products.screenshotAlt` (`src/i18n/messages/{vi,en}.json`) — 1 chuỗi chung/interpolate `{title}` |

## Classification

- **Type:** MODIFY (post-build) — thêm ảnh screenshot cho 1 sản phẩm; không thêm/xoá requirement.
- **Risk:** LOW — nội dung/asset; không chạm API/DB/auth/contract/schema; carousel vốn đã hỗ trợ nhiều ảnh.
- **Spec delta:** R-07 (`SPECIFICATIONS.md:99`) chỉ nói `/products` có "ảnh/screenshot" (không giới hạn số lượng) ⇒ **không đổi requirement**. Design-spec Screen 7 vốn đã định nghĩa carousel trong card (`design-spec.md:325-344`). → vẫn sinh `spec/test-scope/current.json` (scopeVersion +1).

## Acceptance (bắt buộc)

- [ ] `hair-style-ai.mdx` (vi + en) có 4 screenshot theo đúng thứ tự: `hair-style-ai.jpg` → `hair-style-ai-try-on.jpg` → `hair-style-ai-analysis.jpg` → `hair-style-ai-rating.jpg`
- [ ] `/products` (+ `/en/products`): carousel `hair-style-ai` render 4 ảnh + 4 dots + nút prev/next
- [ ] Home card `hair-style-ai` vẫn dùng ảnh Welcome (`home.ts` không đổi)
- [ ] 4 file ảnh tồn tại trong `public/images/products/`; `next/image` không báo `onError`
- [ ] `npm run lint` · `npm run typecheck` · `npm run build` PASS
- [ ] Reviewer độc lập PASS
- [ ] `spec/test-scope/current.json` sinh mới

## Ghi chú

- **KHÔNG** đụng/không gộp change `brand-logo-wordmark-removal` (đang dở: `src/components/layout/BrandLogo.tsx` dirty, `test-scope` scope 15 chưa commit) và `2026-10-12-solution-card-real-images.md` (pending khác). Chỉ stage file thuộc change này.
- Commit-first 1 task = 1 commit trên branch hiện tại; **không push**.
