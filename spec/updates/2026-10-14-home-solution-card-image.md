# Spec update — 2026-10-14 · change `home-solution-card-image`

- **Spec version**: 3.11.0 (**KHÔNG bump** — không đổi requirement/behavior contract; R-02a vẫn thoả: thẻ có "ảnh minh hoạ fade vào nền")
- **Scope version**: v39 → **v40** (`feature-update`)
- **Trigger**: `feature-update` (change-request CR-017, post-build MODIFY UI, follow-up CR-016)
- **Change file**: `spec/changes/2026-10-14-home-solution-card-image.md` (archive khi close-out)
- **Task**: `tasks/feature-home-solution-card-image/phase-1-task-01.md`
- **Review**: `.context/review-reports/feature-home-solution-card-image-phase-1-task-01-round-1-review.md` — round 1 **PASS**

## Thay đổi

Thẻ **Giải pháp trang chủ** (`/` + `/en`, 3 thẻ DN · AI · Ứng dụng AI) theo ảnh mẫu
`spec/changes/assets/2026-10-14-home-solution-card-image/4.webp` — thuần trình bày:

- **Ảnh minh hoạ to**: lớp ảnh `absolute inset-y-0 right-0` rộng **60%** thẻ, **full chiều cao**, `next/image fill` +
  `object-cover object-[40%_50%]`, tràn sát mép phải/trên/dưới, bo theo góc thẻ (`overflow-hidden rounded-lg`).
  Dùng ảnh hiện có `public/images/illustrations/home-{enterprise,ai,apps}.png` (user chốt).
- **Fade sang trái**: mask chỉ còn 1 `linear-gradient(to right, transparent, #000 50%)`; bỏ fade trên-xuống,
  bỏ `maskComposite`, bỏ mọi `opacity-30` (trước đây ở `lg`/mobile ảnh gần như không thấy).
- **Cột chữ nền trắng**: lớp nền `bg-gradient-to-r from-surface from-40% to-transparent` (to 75% / lg 90%) mọi breakpoint,
  `aria-hidden`, nằm trên ảnh dưới chữ; cột chữ `md:max-w-[56%] xl:max-w-[56%]`; thẻ `min-h-[18rem]`.
- `sizes` cập nhật theo khung mới. Nội dung (tiêu đề, mô tả, 3 bullet, link) giữ nguyên như CR-016.

**Code:** `src/components/home/SolutionGridHome.tsx` (chỉ file này; `HomeImage.tsx`, `src/content/home.ts`, ảnh, i18n không đổi).

## Impact

- **Direct**: `/` và `/en` — khối Giải pháp (3 thẻ).
- **Dependents**: không (component chỉ dùng ở trang chủ; `SolutionCard` dùng chung không sửa).
- **Regression**: link 3 thẻ → `/solutions/enterprise`, `/solutions/ai`, `/products` (EN `/en/...`); header khối Giải pháp,
  các khối Sản phẩm / Case study / Hero / CTA không đổi.

## Acceptance / verify

- 3 thẻ: ảnh full chiều cao nửa phải, fade mượt sang trái, không fade trên, không `opacity-30`; chữ đọc rõ 1280/1440;
  375/768 ảnh vẫn hiện + chữ đọc được + không tràn ngang.
- Verify: `npm run typecheck` PASS · `npm run lint` PASS (0 error; 1 warning có sẵn `src/components/mdx/index.tsx`)
  · `npm run build` PASS 59/59 · visual `next start` 1440 + 375 PASS.

## Residual

- 1024/768 chỉ đo DOM (`scrollWidth < innerWidth`), chưa screenshot.
- NIT chấp nhận: bỏ fallback `onError` của `HomeImage` (ảnh tĩnh local, rủi ro thấp).
