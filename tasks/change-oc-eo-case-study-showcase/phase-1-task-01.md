# Task 01: Case study Óc Eo – Ba Thê — bố cục showcase + ảnh thẻ danh sách + ảnh khối trang chủ

> Nguồn: change `spec/changes/archive/2026-10-12-oc-eo-case-study-showcase.md`
> ⚠️ **Ghi bù:** code làm trước (session Cowork, không qua `/change`), task file viết sau theo yêu cầu user.

## Phase
1 (gộp Phase 1 types + Phase 3 UI — change nhỏ, chỉ content/UI, không API/DB)

## Type
modification (post-build MODIFY — UI + content)

## Goal
Trang `/case-studies/oc-eo-learning` (+ `/en`) giống mockup `refs/target-showcase-mockup.jpg`; thẻ Óc Eo ở
`/case-studies` và khối featured case ở `/` dùng ảnh minh hoạ `refs/source-hero.jpg`.

## Classification / Risk
- Work item: FEATURE · Change type: **MODIFY** (post-build)
- Scope: `src/content/types.ts` (`CaseStudy.cover?/layout?/showcase?` + `CaseStudyShowcase`, `ShowcaseIcon`),
  `src/app/[locale]/case-studies/[slug]/page.tsx` (nhánh showcase), `src/components/case-studies/showcase/*`
  (9 file mới, gồm `VmsMock.tsx` tách ở round 2), `src/components/cards/CaseStudyCard.tsx` (`cover ?? gallery[0]`),
  `src/content/case-studies/{vi,en}/oc-eo-learning.mdx`, `src/content/home.ts` (`featuredCase.image/alt`),
  `public/images/cases/oc-eo/*.jpg` (6 ảnh: hero + 5 crop).
- Review level: **NORMAL** (đụng type/component dùng chung nhưng chỉ thêm field optional + nhánh mới;
  không API/auth/schema/tenant)
- Blast radius: `/case-studies/oc-eo-learning` vi/en; `/case-studies` (CaseStudyCard dùng ở list, filter,
  RelatedStudies); `/` khối featured case. Case nha khoa không có `cover`/`layout` ⇒ không đổi.
- Doc impact: `SPECIFICATIONS.md` (+R-08b, 3.0.0 → 3.1.0), `.context/design-spec.md` Screen 9 (biến thể showcase),
  `.context/error-memory.md` (Error 7)
- Decision impact: bố cục chi tiết case study có 2 biến thể (`default` | `showcase`) chọn bằng frontmatter.

## Description
1. `types.ts` — thêm `cover?`, `layout?: 'default'|'showcase'`, `showcase?: CaseStudyShowcase`.
2. `page.tsx` — `layout==='showcase' && showcase` → `ShowcaseLayout` (breadcrumb trong hero, giữ JSON-LD,
   giữ `RelatedStudies`, thẻ CTA riêng thay `CTABanner`); còn lại giữ nhánh default.
3. `showcase/` — `ShowcaseHero`, `ShowcaseOverview`, `ShowcaseTechnology` (VMS mock HTML, `aria-hidden` +
   caption "minh hoạ / giả lập"), `ShowcasePhotos` (client, scroll-snap + 2 nút), `ShowcaseVision`,
   `ShowcaseCTA`, `ShowcaseLayout`, `icons`.
4. `oc-eo-learning.mdx` vi/en — `layout: showcase`, `cover`, block `showcase` (copy theo mockup, giữ ngôn ngữ
   "đề xuất / kỳ vọng / tham chiếu").
5. `CaseStudyCard` — `cover` ưu tiên hơn `gallery[0]`.
6. `home.ts` — `featuredCase.image` → `/images/cases/oc-eo/hero.jpg`, alt vi/en mới.
7. Ảnh — `hero.jpg` = ảnh user (1590×989, trùng pixel ảnh gửi ở yêu cầu 2/3); 5 ảnh carousel **crop từ
   hero.jpg** (placeholder, chưa có ảnh thực địa).

## Acceptance Criteria
- [x] Bố cục showcase khớp mockup (desktop 1440 + mobile 390, vi + en)
- [x] Case nha khoa không regress
- [x] Thẻ list + khối trang chủ dùng ảnh mới
- [x] vi/en key parity (109/109 — reviewer r1)
- [x] Không còn class Tailwind không sinh CSS (MAJOR-1)
- [x] Carousel/alt ghi rõ minh hoạ + dòng `note` đề xuất (MAJOR-2, BR-004)
- [x] reviewer PASS (round 2)

## Verification Plan
- Commands (`.context/project-config.md`): `npm run lint` · `npm run typecheck` · `npm run build`
- CSS build artifact: grep các class arbitrary/opacity mới có sinh CSS
- Render browser `/case-studies/oc-eo-learning`, `/en/...`, `/case-studies`, `/en` ở 1440 + 390; không scroll ngang

## Feature Verification
- Acceptance: **PASS** · Reviewer: **PASS NORMAL (round 2)** — round 1 FAIL (4 MAJOR)
- Round 2 verify (snapshot đúng scope commit = HEAD + file scope, KHÔNG gồm change motion):
  - `npm run typecheck` = PASS · `npm run lint` = 0 errors (1 warning pre-existing `src/components/mdx/index.tsx`)
  - `npm run build` = PASS (sandbox: `next/font` Inter stub chỉ trong bản build vì không có mạng Google Fonts — không commit)
  - CSS artifact: `.bg-[rgb(0_158_135/0.4)]`, `.border-[rgb(33_217_173/0.8)]` có; `bg-primary/40`, `border-accent/80`,
    `border-border/70` = 0
  - HTML build: caption minh hoạ + alt "Minh hoạ —"/"Illustration —" có ở vi/en
  - Playwright `next start`: oc-eo vi 1440/390, en 1440, dental, `/case-studies` → 200, scrollWidth = viewport,
    connector `rgba(0, 158, 135, 0.4)`, 0 console error
  - `test_command: null` → skip

## Retry / Escalation
- Attempt: **1** (round 1 FAIL → round 2 PASS) · không escalation
- Error memory: `.context/error-memory.md` Error 7 (opacity modifier trên màu `var()` — lặp lại lần 2)

## Review
| Round | Verdict | Report |
|---|---|---|
| 1 | FAIL (4 MAJOR, 8 MINOR) | `.context/review-reports/change-oc-eo-case-study-showcase-phase-1-task-01-round-1-review.md` |
| 2 | **PASS** (0 CRITICAL/MAJOR mở; MINOR-10/11/13/14 non-blocking) | `.context/review-reports/change-oc-eo-case-study-showcase-phase-1-task-01-round-2-review.md` |

Round 2 fix: tách `VmsMock.tsx`; class alpha → arbitrary `rgb(.../a)`; `border-border/NN` → `border-border`;
`photos.caption` + alt "Minh hoạ —" (vi/en); `note` đề xuất dưới thẻ số liệu; `vision.quoteSource`; CTA hero
không phải anchor → `Link` next-intl; `page.tsx` tính `labels`/`cta` sau nhánh showcase + dùng lại
`breadcrumbJsonLd`; carousel `aria-labelledby` + focus ring; `dd` label `aria-hidden`.

## Residual risk
- MINOR-10: 5 ảnh carousel là crop minh hoạ độ phân giải thấp → thay ảnh thực địa.
- MINOR-11: nút prev/next không disable ở 2 đầu.
- MINOR-14: `note` dùng margin âm bám padding của `ShowcaseOverview`; `text-xs`.
- Change `site-wide-motion` (chưa commit) có hunk trên `ShowcaseHero.tsx` (split-line) và `ShowcaseOverview.tsx`
  (`CountUp`) — **loại khỏi commit này** (stage bản HEAD + hunk scope); Screen 9 ghi "KHÔNG count-up" → change motion
  cần đối chiếu khi close-out.
- Commit `1e90308` (round 1) gộp file ngoài scope — ghi nhận, không rewrite history.

## DoD
- [x] Code written trong scope · [x] Check commands pass · [x] Reviewer PASS (r2)
- [x] `.context/progress.json` updated · [x] Doc impact (R-08b, Screen 9, error-memory)
- [x] `spec/test-scope/current.json` sinh (scope v21, spec 3.1.0)
- [x] close-out commit (branch `main`, KHÔNG push — `auto_push_after_pass: false`)

## Files to Modify
- `src/content/types.ts`, `src/app/[locale]/case-studies/[slug]/page.tsx`, `src/components/cards/CaseStudyCard.tsx`
- `src/components/case-studies/showcase/*`
- `src/content/case-studies/{vi,en}/oc-eo-learning.mdx`, `src/content/home.ts`
- `public/images/cases/oc-eo/*`
