# Task 01: `/products` — thêm 3 ảnh onboarding vào gallery Hair-style AI

> Nguồn: change `spec/changes/2026-10-12-hairstyle-ai-gallery-screenshots.md`

## Phase
1

## Type
modification (post-build MODIFY — content/asset)

## Goal

Gallery (carousel) của sản phẩm `hair-style-ai` trên `/products` hiển thị **4 ảnh** theo đúng thứ tự
chỉ báo dots của app: **Welcome → Try On → Analysis → Rating**. Ảnh Welcome giữ nguyên; thêm 3 ảnh mới.

## Classification / Risk
- Work item: FEATURE · Change type: **MODIFY** (post-build)
- Scope: `src/content/products/vi/hair-style-ai.mdx` + `src/content/products/en/hair-style-ai.mdx` (2 file, mỗi file +3 dòng) + 3 asset mới trong `public/images/products/`
- Review level: **NORMAL** (nội dung/asset; 1 trang; không shared component/API/auth/schema/tenant; carousel vốn đã hỗ trợ nhiều ảnh)
- Blast radius: `/products` + `/en/products` — carousel `hair-style-ai`. `home.ts` card riêng (`image` cố định, KHÔNG đổi)
- Doc impact: **none** (`docs/DESIGN.md` screen "Sản phẩm App" chỉ liệt kê component, không liệt kê số ảnh)
- Decision impact: none (user đã chốt thứ tự 4 ảnh)

## Root cause / bối cảnh (đã khảo sát)

| Hạng mục | Sự thật |
|---|---|
| Render gallery | `src/components/products/ScreenshotCarousel.tsx` — nhận `screenshots: string[]`, map slide + dots (dots/prev-next/multi-slide đã hỗ trợ sẵn) |
| Nơi render | `src/app/[locale]/products/page.tsx:60` — `AppCard` → `ScreenshotCarousel screenshots={product.screenshots}` |
| Nguồn dữ liệu | `src/content/products/{vi,en}/hair-style-ai.mdx` → `screenshots` (trước: **1 ảnh**) |
| Card home | `src/content/home.ts:18,30` `image: '/images/products/hair-style-ai.jpg'` (ảnh Welcome) — **KHÔNG đổi** |
| Khung ảnh | `cardPosterImageClass` = `aspect-[9/16]` khớp tỉ lệ 941×1672 ⇒ không crop |
| Alt | `products.screenshotAlt` — 1 chuỗi chung interpolate `{title}` cho mọi ảnh |

## Description

1. **`.../vi/hair-style-ai.mdx`** + **`.../en/hair-style-ai.mdx`** — `screenshots` thêm 3 dòng:
   `hair-style-ai-try-on.jpg` → `hair-style-ai-analysis.jpg` → `hair-style-ai-rating.jpg`
   sau dòng Welcome hiện có.
2. **Alt text — giữ nguyên** `products.screenshotAlt` (chuỗi chung + `{title}`, a11y đạt): đổi sang
   alt riêng từng ảnh sẽ phải đổi schema `screenshots: string[]` → `{src,alt}[]` (breaking, ngoài scope).
   **Không mở rộng scope.**
3. **KHÔNG đổi**: `home.ts` (card home vẫn ảnh Welcome), `ScreenshotCarousel.tsx`, `products/page.tsx`,
   i18n messages. **KHÔNG đụng** change khác (`brand-logo-wordmark-removal`, `solution-card-real-images`).

## Acceptance Criteria
- [x] `hair-style-ai.mdx` (vi + en) có 4 screenshot theo đúng thứ tự Welcome → Try On → Analysis → Rating
- [x] `/products` + `/en/products`: carousel render 4 ảnh + 4 dots + nút prev/next
- [x] Home card `hair-style-ai` vẫn dùng ảnh Welcome (`home.ts` không đổi)
- [x] 4 file ảnh tồn tại trong `public/images/products/`; `next/image` không báo `onError`
- [x] `npm run lint` · `npm run typecheck` · `npm run build` PASS
- [x] Reviewer độc lập PASS
- [x] `spec/test-scope/current.json` sinh mới (scopeVersion +1)

## Verification Plan
- Commands (`.context/project-config.md`): `npm run lint` · `npm run typecheck` · `npm run build`
  (`test_command: null` → skip, no test configured)
- `git diff` xác nhận chỉ 2 `.mdx` đổi + 3 asset mới trong scope
- HTML build `/products` + `/en/products`: mỗi trang có đủ 4 `src="/images/products/hair-style-ai*.jpg"`
  cho carousel hair-style-ai + 4 dots; home card vẫn `hair-style-ai.jpg`

## Feature Verification
- Acceptance: PASS · Verify: PASS · Reviewer: PASS NORMAL (round-1) — report `.context/review-reports/change-hairstyle-ai-gallery-screenshots-phase-1-task-01-round-1-review.md`
- `npm run lint` = 0 errors (1 warning pre-existing `src/components/mdx/index.tsx`, ngoài scope)
- `npm run typecheck` = PASS
- `npm run build` = PASS
- HTML build VI+EN: 4 ảnh hair-style-ai + 4 dots; `home.ts`/carousel/`page.tsx` không đổi
- Reviewer findings: 0 CRITICAL/MAJOR; 1 MINOR info (`next/image` ratio 900×1600 vs ảnh thật 941×1672 — pre-existing, ngoài diff)
- Doc impact: none

## Retry / Escalation
- Attempt: 0 · Escalation: sau 3 attempt fail → `architecture_review_needed`

## DoD
- [x] Code written trong scope · [x] Check commands pass · [x] Reviewer PASS
- [x] `.context/progress.json` updated · [x] Doc impact recorded (none)
- [x] `spec/test-scope/current.json` sinh (scopeVersion +1)
- [x] committed — 1 task = 1 commit (branch `main`, **KHÔNG push**)

## Files to Modify
- `src/content/products/vi/hair-style-ai.mdx`
- `src/content/products/en/hair-style-ai.mdx`

## Files to Add
- `public/images/products/hair-style-ai-try-on.jpg`
- `public/images/products/hair-style-ai-analysis.jpg`
- `public/images/products/hair-style-ai-rating.jpg`
