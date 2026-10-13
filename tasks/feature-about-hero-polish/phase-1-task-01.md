# feature-about-hero-polish · phase-1-task-01 — /about hero: ảnh Kim Hoàn fade viền + fix lớp nền hero đè khối Sứ mệnh

- **CR:** CR-015 (`spec/changes/2026-10-13-about-hero-polish.md`) · polish UI của spec R-04a (không đổi requirement)
- **Classification / Risk:** MODIFY (UI) + BUG · LOW
  - Scope: CHỈ `src/components/about/AboutHero.tsx`. KHÔNG sửa `HeroWaves` (`src/components/listing/ListingHero.tsx`, dùng chung ListingHero/DetailHero).
  - Expected review level: **NORMAL** (1 component trang /about, không shared/API)
  - Blast radius: `/about`, `/en/about`
  - Doc impact: no doc impact (không đổi contract/schema/behavior tài liệu hoá; R-04a giữ nguyên) — test-scope v38 trigger bug-fix
  - Decision impact: không

## Root cause (BUG, đã xác định)
`src/components/about/AboutHero.tsx:28` — `<HeroWaves className="h-[720px]" />` là lớp `absolute` cao cố định 720px trong wrapper
`relative isolate bg-[#f7fbfb]` (dòng 27). Hero thực tế thấp hơn 720px → lớp nền tràn xuống dưới hero; wrapper là positioned (z-auto,
isolate tạo stacking context) nên được vẽ SAU `<Section>` không positioned của `AboutValues` → che đầu 3 thẻ Sứ mệnh/Tầm nhìn/Giá trị
cốt lõi + tạo vùng trắng thừa (fade `to-[#f7fbfb]`).

## Scope
1. Fix bug: `HeroWaves className="h-full"` (giống `DetailHero.tsx:46`) + `overflow-hidden` trên wrapper hero → lớp nền không bao giờ
   vượt khỏi hero.
2. Ảnh tòa Kim Hoàn (khối `motion-load relative aspect-[4/3] overflow-hidden rounded-[28px] shadow-…`): bỏ bo góc + shadow; viền ảnh
   mờ/tan dần vào nền như mockup (`spec/changes/assets/2026-10-13-about-page-redesign/mockup-about.webp`):
   - Desktop (lg+): ảnh bleed về mép phải viewport (vd margin-right âm = khoảng cách container→viewport, hoặc `lg:mr-[calc(50%-50vw)]`
     tuỳ cấu trúc Container), mép trái + dưới (+ trên nhẹ) fade bằng CSS `mask-image` gradient (kết hợp 2 gradient với
     `mask-composite: intersect` / `-webkit-mask-composite: source-in`, hoặc radial). Có thể thêm overlay gradient màu nền `#f7fbfb`.
   - Mobile: ảnh gọn trong container, fade nhẹ, KHÔNG tràn ngang (scrollWidth == clientWidth ở 375px).
   - Giữ `next/image fill priority`, alt i18n, cập nhật `sizes` nếu kích thước hiển thị đổi.
3. Không đổi text/i18n, không đổi AboutValues/AboutPeople, không đổi HeroWaves.

## Acceptance
- Ảnh tòa nhà viền mờ tan vào nền như mẫu (desktop); mobile ảnh gọn, không tràn ngang.
- Thẻ Sứ mệnh/Tầm nhìn/Giá trị cốt lõi hiện đủ viền + bo góc ở 375/768/1280px; không còn khoảng trắng thừa dưới hero.
- ListingHero/DetailHero không bị ảnh hưởng (HeroWaves không đổi).
- `npm run typecheck`, `npm run lint`, `npm run build` PASS.

## Retry / Escalation
Max 3 attempt; fail lần 3 → `architecture_review_needed`.

## Verification summary
(builder/reviewer điền)

### Builder — attempt 1 (2026-10-13)
- **Files:** `src/components/about/AboutHero.tsx` (duy nhất).
- **Thay đổi:**
  - Fix bug: wrapper hero `relative isolate` → thêm `overflow-hidden`; `HeroWaves className="h-[720px]"` → `"h-full"` (như DetailHero). Lớp nền không còn vượt khỏi hero → không đè AboutValues.
  - Ảnh Kim Hoàn: bỏ `rounded-[28px]`, shadow, `overflow-hidden`. Thêm mask fade = giao 2 linear-gradient (`--fade-x` × `--fade-y`, `mask-composite: intersect` / `-webkit-mask-composite: source-in`, inline style `fadeMask`).
    - Mobile/tablet: `aspect-[4/3]` trong container, fade nhẹ 4 cạnh (ngang 10%, trên 8%, dưới từ 78%).
    - lg+: `-mr-[max(2rem,calc((100vw-1280px)/2+2rem))]` → ảnh bleed tới mép phải viewport (Container 1280 + `lg:px-8`); phần dư scrollbar bị overflow-hidden cắt. Chiều cao cố định `lg:h-[480px] xl:h-[520px]` (thay aspect, tránh ảnh cao vọt ở màn rộng). Fade trái 30%, trên 12%, dưới từ 68%.
  - `sizes` → `(min-width: 1024px) 48vw, 100vw` (ảnh rộng hơn do bleed). Giữ `fill priority`, alt i18n. Không đụng HeroWaves/ListingHero/DetailHero/i18n.
- **Verify:**
  - `npm run typecheck` PASS
  - `npm run lint` PASS (0 error; 1 warning cũ `src/components/mdx/index.tsx:25` ngoài scope)
  - `npm run build` **BLOCKED (môi trường)**: `Failed to load next.config.ts … [Error: Failed to load native binding]` (@swc native binding, lỗi đã biết từ CR-014). `bash tools/linux-build.sh verify` → `rsync: command not found` (không chạy được trên Git Bash Windows).
  - Bổ sung: `npx tailwindcss` sinh đúng CSS cho mọi class arbitrary mới (`--fade-x/--fade-y`, `margin-right: calc(max(2rem, calc((100vw - 1280px) / 2 + 2rem)) * -1)`, `lg:h-[480px]`, `lg:aspect-auto`).
- **Residual risk:** chưa build/smoke trình duyệt — chưa kiểm mắt độ fade so mockup và scrollWidth==clientWidth ở 375/768/1280 (cần reviewer/Cowork chạy build + xem `/about`). Trình duyệt không hỗ trợ mask-composite → (Safari < 15.4 dùng `-webkit-mask-composite`) rủi ro thấp.
- **Primary verify (14/10/2026):** `npm run build` → PASS ở terminal user (`npm.cmd run build`, 59/59 static pages) — sandbox lỗi native binding @swc như CR-014.
- **Reviewer round 1:** PASS (NORMAL) — `.context/review-reports/feature-about-hero-polish-phase-1-task-01-round-1-review.md`; đo 375/768/1280/1440: không tràn ngang, đáy hero = đỉnh section kế, mép trên 3 thẻ đúng chính thẻ. 3 MINOR không chặn (đường nối nền `#f7fbfb`→trắng; margin âm theo 100vw dư ~7px bị overflow-hidden cắt; chưa kiểm Safari + route VI riêng).
