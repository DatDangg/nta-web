# Task 01: Trang chủ — 3 ảnh minh hoạ mới cho 3 thẻ giải pháp + thẻ cao đều / text thẳng hàng

> Nguồn: change `spec/changes/2026-10-12-home-solution-card-images.md`

## Phase
1

## Type
modification (post-build MODIFY — asset + layout UI)

## Goal

Khối "3 mảng giải pháp" trang chủ (`SolutionGridHome`) hiển thị 3 ảnh minh hoạ mới do user gửi, gán
đúng thứ tự thẻ 1/2/3; cả 3 thẻ dùng **cùng một layout**, **cao đều nhau**, **tiêu đề / mô tả / CTA
"Tìm hiểu thêm" thẳng hàng**.

## Classification / Risk
- Work item: FEATURE · Change type: **MODIFY** (post-build)
- Scope: `src/content/home.ts` (vi + en) + `src/components/cards/SolutionCard.tsx` + 3 asset mới `public/images/illustrations/home-{enterprise,ai,apps}.jpg`
- Review level: **NORMAL** (asset + class Tailwind căn chỉnh; 1 khối UI; không API/auth/schema/tenant)
- Blast radius: `/` + `/en` (khối giải pháp). `SolutionCard` **dùng chung** với `/solutions/enterprise` (4 thẻ) + `/solutions/ai` (3 thẻ) → 2 trang này render nhánh `shot=true`, card nằm trong `<li>`→`<Reveal>`→`.reveal-item` **không** ràng buộc chiều cao ⇒ `h-full`/`flex-1`/`mt-auto` no-op ⇒ bố cục không đổi (kiểm bằng HTML build).
- Doc impact: **none** (`docs/DESIGN.md` chỉ mô tả thứ tự khối, không mô tả ảnh từng thẻ)
- Decision impact: none (user đã chốt ảnh + thứ tự)

## Root cause / bối cảnh (đã khảo sát)

| Hạng mục | Sự thật |
|---|---|
| Render | `src/components/home/SolutionGridHome.tsx` → `SolutionCard` cho `home.solutionCards` |
| Thẻ 1 (cũ) | `shot: true` → khung `CardShotImage` `aspect-[16/10]` dính mép trên, Link `p-0 overflow-hidden` |
| Thẻ 2/3 (cũ) | không `shot` → Link `p-4` + `HomeImage` `cardImageClass` (`aspect-[16/10] rounded-lg object-cover`) |
| Hệ quả | 3 thẻ render khác nhau; Link không `h-full`; CTA không thẳng hàng |
| Grid | `Reveal` bọc mỗi con trong `div.reveal-item` (grid item, stretch mặc định) → `h-full` trên Link ăn được |
| Card item height | `globals.css`: `.reveal-item` không set `height`/`display` → kế thừa grid stretch |

## Description

1. **`src/content/home.ts`** (cả `vi` + `en`):
   - `solutionCards[0].image` → `/images/illustrations/home-enterprise.jpg`; **bỏ `shot: true`**.
   - `solutionCards[1].image` → `/images/illustrations/home-ai.jpg`.
   - `solutionCards[2].image` → `/images/illustrations/home-apps.jpg`.
   - `alt` VI/EN viết lại mô tả đúng nội dung ảnh, đúng ngôn ngữ.
2. **`src/components/cards/SolutionCard.tsx`** (nhánh layout thường):
   - Link thẻ thêm `h-full flex flex-col`; thân `<div>` bọc body thêm `flex flex-1 flex-col`; CTA `mt-auto`.
   - **KHÔNG đổi** `cardLinkClass` / `cardImageClass` / `cardShotFrameClass` trong `cardStyles.ts`
     (dùng chung `AppCard` / `CaseStudyCard` / `ProductCard` / `PostCard`).
3. **KHÔNG đổi**: `SolutionGridHome.tsx` (grid đã stretch), `.mdx` solutions, OG/JSON-LD/sitemap
   (`home.solutionCards[].image` không phục vụ OG).

## Acceptance Criteria
- [x] `home.ts` (vi + en): 3 `image` trỏ đúng `home-enterprise.jpg` / `home-ai.jpg` / `home-apps.jpg` theo đúng thứ tự
- [x] Không còn `shot: true` ở `home.solutionCards` (2 locale) → 3 thẻ cùng layout
- [x] 3 thẻ cao đều + tiêu đề/mô tả/CTA thẳng hàng (Link `h-full flex flex-col`, body `flex flex-1 flex-col`, CTA `mt-auto`)
- [x] HTML build `/` + `/en`: 0 tham chiếu `lms/01-tong-quan.png` / `ai-analysis.svg` / `ai-apps.svg` ở thẻ trang chủ
- [x] `/solutions/enterprise` + `/solutions/ai` (+ EN): ảnh / alt / khung thẻ không đổi
- [x] `npm run lint` · `npm run typecheck` · `npm run build` PASS
- [x] Reviewer độc lập PASS (NORMAL)
- [x] `spec/test-scope/current.json` scopeVersion +1 (publish v17; sau đó change brand-logo-lockup publish v18 — xem residual)

## Verification Plan
- Commands (`.context/project-config.md`): `npm run lint` · `npm run typecheck` · `npm run build`
  (`test_command: null` → skip, no test configured)
- HTML build `.next/server/app/{vi,en}.html`: 3 `src` ảnh mới ở thẻ trang chủ; 0 ref ảnh cũ
- HTML build `/solutions/enterprise` + `/solutions/ai`: khung `aspect-[16/10]` + ảnh `cardImage` + alt nguyên trạng

## Feature Verification
- Acceptance: PASS · Verify: PASS · Reviewer: PASS NORMAL (round-1) — report `.context/review-reports/change-home-solution-card-images-phase-1-task-01-round-1-review.md`
- `npm run lint` = 0 errors (1 warning pre-existing `src/components/mdx/index.tsx`, ngoài scope)
- `npm run typecheck` = PASS
- `npm run build` = PASS
- HTML build VI+EN (`.next/server/app/{vi,en}.html`): `home-enterprise.jpg`=1, `home-ai.jpg`=1, `home-apps.jpg`=1; `01-tong-quan.png`=0, `ai-analysis.svg`=0, `ai-apps.svg`=0
- `/solutions/enterprise` + `/solutions/ai` HTML: khung card `aspect-[16/10]` + ảnh `cardImage` + alt nguyên trạng (không regression)
- Reviewer findings: 0 CRITICAL/MAJOR; 4 MINOR non-blocking (F1 2 SVG cũ orphan → dọn riêng; F2 `shot?` không nơi set; F3 `object-cover` cắt ~5.4%/mép do ảnh ~1.428 vs khung 1.6; F4 `pt-4` trong box 44px)
- Doc impact: none

## Retry / Escalation
- Attempt: 0 · Escalation: sau 3 attempt fail → `architecture_review_needed`

## DoD
- [x] Code written trong scope · [x] Check commands pass · [x] Reviewer PASS
- [x] `.context/progress.json` updated · [x] Doc impact recorded (none)
- [x] `spec/test-scope/current.json` sinh (scope v17; sau đó brand-logo-lockup publish v18)
- [x] committed — 1 task = 1 commit (branch `main`, **KHÔNG push**)

## Files to Modify
- `src/content/home.ts`
- `src/components/cards/SolutionCard.tsx`

## Files to Add
- `public/images/illustrations/home-enterprise.jpg`
- `public/images/illustrations/home-ai.jpg`
- `public/images/illustrations/home-apps.jpg`
