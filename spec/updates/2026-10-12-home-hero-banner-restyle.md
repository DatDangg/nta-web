# Spec update — 2026-10-12 · change `home-hero-banner-restyle`

- **Spec version**: 3.0.0 (**KHÔNG bump** — không đổi requirement/behavior contract; R-01/R-02 vẫn thoả)
- **Scope version**: v19 → **v20** (`feature-update`)
- **Trigger**: `feature-update` (post-build MODIFY UI)
- **Change file**: `spec/changes/archive/2026-10-12-home-hero-banner-restyle.md`
- **Task**: `tasks/change-home-hero-banner/phase-1-task-01.md`

## Thay đổi

Restyle **khối Hero trang chủ** (`/` + `/en`) theo ảnh mẫu user cung cấp (2 ảnh: ảnh 1 = ảnh nền,
ảnh 2 = goal):

- **Ảnh nền**: thay `enterprise-hero.png` bằng `public/images/home/hero-banner.jpg` (1787×880, robot AI
  + hologram). Bỏ khung `rounded-lg bg-surface-sunken`, ảnh **full-bleed mép phải** (`.hero-bleed-right`).
  Crop 2:1 → **6/5** (`aspect-[6/5]` + `object-cover object-[70%_50%]`, tập trung robot, bỏ city như ảnh mẫu)
  + lớp phủ gradient sáng dịu hologram baked-in.
- **Headline 2 màu**: `heroTitle` tách `heroTitleLead` (đen) + `heroTitleAccent` (teal `--color-primary`),
  2 block xuống dòng — "Giải pháp số hoá cho" / "doanh nghiệp Việt"; size
  `clamp(2.5rem,2rem+2.5vw,4.25rem)` (4 dòng split, không dùng `--text-hero`).
- **5 panel kính + wordmark NTA** overlay trên ảnh (`HeroVisual.tsx`, client): Trí tuệ nhân tạo ·
  AI + biểu đồ cột · Quản trị doanh nghiệp · Hiệu suất +86% · Ứng dụng di động + chữ "NTA" trên đế robot;
  nội dung theo locale qua `getHomeContent().heroPanels` (vi+en); CHỈ `lg+`, container `aria-hidden`.
- **CTA primary thêm mũi tên →**; **nền gradient** trắng→xanh nhạt; grid text 42.5% / ảnh 57.5%.

## Impact

- **Direct**: Hero trên `/` và `/en` (dùng duy nhất ở `src/app/[locale]/page.tsx`).
- **Dependents**: `src/i18n/messages/{vi,en}.json` (`heroTitle` → `heroTitleLead`+`heroTitleAccent`,
  0 ref còn lại); `src/content/home.ts` (+`heroPanels`); `.context/design-spec.md` (Screen 1 Hero + copy h1
  + bảng responsive md).
- **Regression**: CTA href `/contact` + `/solutions/enterprise` giữ nguyên; `priority` (LCP) giữ;
  `.hero-bleed-right` không đổi; mobile (<`lg`) panels ẩn, ảnh full cột dưới chữ.

## Acceptance / verify

- Hero dùng ảnh mới full-bleed, không khung; headline 2 màu; panels + wordmark đúng ảnh mẫu; CTA arrow.
- Verify: `npm.cmd run typecheck` PASS · `npm.cmd run lint` 0 errors (1 warning pre-existing
  `src/components/mdx/index.tsx`) · `npm.cmd run build` PASS 53/53 · `test_command: null` → skip.
- CSS build artifact: `object-position:70% 50%` + `.opacity-40` sinh đúng (fix round-2 MAJOR).
- Reviewer round 1 **PASS** (ảnh+bleed+alt) → round 2 **FAIL** (2 MAJOR class Tailwind silent + 1 MAJOR
  commit hygiene + 5 MINOR) → fix → round 3 **PASS** (0 CRITICAL/MAJOR; 4 MINOR non-blocking).

## Residual

- Chưa soi mắt desktop thật (browser screenshot bị block — window không visible); verify bằng CSS math
  + DOM-eval mobile + build artifact.
- `md` (768–1023): cột text hẹp → headline có thể wrap 4–6 dòng (không vỡ layout).
- Commit hygiene: `next.config.ts` (distDir `.next-build`), `tsconfig.json`, `next-env.d.ts`, `.next-build/`
  là của session khác → loại tuyệt đối khỏi commit change này; `.next-build/` chưa gitignored (task riêng).
