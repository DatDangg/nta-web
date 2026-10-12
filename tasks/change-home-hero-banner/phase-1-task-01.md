# Task 01: Hero trang chủ — đổi ảnh minh hoạ + restyle full-bleed mép phải

> Nguồn: change `spec/changes/2026-10-12-home-hero-banner-restyle.md`

## Phase
1

## Type
modification (post-build MODIFY — visual UI)

## Goal

Hero trang chủ (`/`) dùng ảnh minh hoạ mới `public/images/home/hero-banner.jpg` (ảnh user cung cấp)
thay mockup dashboard `enterprise-hero.png`, và restyle cho giống ảnh mẫu
`tasks/change-home-hero-banner/refs/target-banner-2.jpg`: **bỏ khung bo góc + nền xám**, ảnh
**tràn ra mép phải section** (full-bleed), giữ nguyên chữ + 2 CTA bên trái.

## Classification / Risk
- Work item: FEATURE · Change type: **MODIFY** (post-build)
- Scope: `src/components/home/Hero.tsx`, `src/app/globals.css` (1 utility `.hero-bleed-right`),
  `src/i18n/messages/{vi,en}.json` (`home.heroImageAlt`), `.context/design-spec.md` (mục Hero), asset `public/images/home/hero-banner.jpg`
- Review level: **NORMAL** (1 section/task UI riêng, không shared/API/auth/schema/tenant)
- Blast radius: chỉ `/` + `/en` (grep xác nhận `Hero` chỉ dùng ở `src/app/[locale]/page.tsx:48`;
  `enterprise-hero.png` chỉ được Hero tham chiếu trong `src/`)
- Doc impact: `.context/design-spec.md` §Screen 1 mục Hero (quy tắc ảnh `rounded-lg` → full-bleed)
- Decision impact: none (user đã chốt hướng restyle giống ảnh 2)

## Root cause / Lý do

Hero hiện tại bọc ảnh trong `rounded-lg bg-surface-sunken object-contain` và giới hạn trong cột grid
→ ảnh nhỏ, có khung bo góc + nền xám, không giống ảnh mẫu (text trái, minh hoạ phải tràn mép).
Yêu cầu user: thay ảnh + restyle giống `target-banner-2.jpg`.

## Description

1. **`src/components/home/Hero.tsx`**
   - `src="/images/solutions/v2/enterprise-hero.png"` → `/images/home/hero-banner.jpg`; `width/height`
     2656×1902 → **1787×880** (tỉ lệ gốc ~2.03:1, tránh méo).
   - `className` ảnh: bỏ `rounded-lg bg-surface-sunken object-contain`, còn `h-auto w-full`.
   - `sizes` `(min-width: 768px) 45vw, 100vw` → `(min-width: 768px) 50vw, 100vw` (ảnh tràn rộng hơn).
   - `section` thêm `overflow-hidden` (chặn scroll ngang do margin bleed).
   - Wrapper ảnh (`Reveal`) thêm class `hero-bleed-right` (full-bleed mép phải từ `md`).
   - Giữ nguyên `h1` / subtext / 2 CTA (copy + href không đổi).
2. **`src/app/globals.css`** — thêm utility `.hero-bleed-right`: bù `margin-right` âm bằng
   `calc((min(100vw, 1280px) - 100vw) / 2 - <container padding>)` (1.5rem @ `md`, 2rem @ `lg`),
   kèm comment. `1280px` khớp `maxWidth.container` trong `tailwind.config.ts`.
3. **`src/i18n/messages/{vi,en}.json`** — `home.heroImageAlt` mô tả ảnh mới (robot AI vận hành hệ thống),
   bỏ chữ "giao diện minh hoạ / illustrative interface".
4. **`.context/design-spec.md`** §Screen 1 mục Hero — cập nhật quy tắc ảnh: full-bleed mép phải, bỏ `rounded-lg`.
5. **KHÔNG đụng** file dirty của session khác (`BrandLogo.tsx`, `src/content/home.ts`, `SolutionCard.tsx`, …).

## Acceptance Criteria
- [x] Hero dùng `hero-banner.jpg`, bỏ khung bo góc/nền xám, ảnh tràn mép phải ở desktop (giống ảnh mẫu)
- [x] Mobile: ảnh xếp dưới chữ, không tràn/lệch, không méo, không scroll ngang
- [x] `heroImageAlt` vi + en đúng nội dung ảnh mới
- [x] Không đổi copy/CTA/href/behavior khác
- [x] Verify: lint + typecheck + build PASS; responsive mobile/desktop không vỡ
- [x] reviewer PASS

## Verification Plan
- Commands (`.context/project-config.md`): `npm run lint` · `npm run typecheck` · `npm run build`
- `git diff` xác nhận chỉ file trong scope đổi; không đụng file dirty session khác
- HTML build `.next-build/server/app/vi.html` (và `en.html`): `hero-banner.jpg` xuất hiện, `enterprise-hero.png`
  = 0, `rounded-lg` cạnh ảnh hero = 0, `hero-bleed-right` = 1, `sizes` mới, alt mới
- CSS build: `.hero-bleed-right` + `calc((min(100vw,1280px) - 100vw)...` xuất hiện
- Browser (nếu chạy được): render `/` ở 1440 + 375 — không scroll ngang; ảnh chạm mép phải desktop

## Feature Verification
- Acceptance: PASS · Verify: PASS (primary/builder chạy thật) · Reviewer: PASS NORMAL (round-1)
- `npm run lint` = PASS · `npm run typecheck` = PASS · `npm run build` = PASS
- Chi tiết kết quả ghi ở §Report cuối task + `spec/test-scope/current.json`.

## Retry / Escalation
- Attempt: 0 · Escalation: sau 3 attempt fail → `architecture_review_needed`
- Env caveat: session con (subagent) có thể bị chặn spawn `reviewer` lồng → nếu vậy chạy review INLINE
  (ghi rõ), primary re-run độc lập.

## DoD
- [x] Code written trong scope · [x] Check commands pass · [x] Reviewer PASS
- [x] `.context/progress.json` updated · [x] Doc impact recorded (design-spec Hero)
- [x] `spec/test-scope/current.json` sinh (scopeVersion +1)
- [x] committed — 1 task = 1 commit (branch `main`, **KHÔNG push**)

## Files to Modify
- `src/components/home/Hero.tsx`
- `src/app/globals.css`
- `src/i18n/messages/vi.json`
- `src/i18n/messages/en.json`
- `.context/design-spec.md`
