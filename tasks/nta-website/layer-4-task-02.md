# Task 02: Performance — next/image audit + Lighthouse Performance ≥ 90

## Layer
4

## Type
build (initial)

## Goal
Audit và tối ưu hiệu năng toàn site: `next/image` đúng cách (priority/lazy/aspect),
font loading, bundle gọn — đạt mục tiêu LCP < 2.5s (4G) + Lighthouse Performance ≥ 90.

## Classification / Risk
- Work item type: FEATURE (initial build)
- Feature change type: MODIFY (tối ưu code đã có — không đổi UI behavior)
- Scope: CROSS_CUTTING (mọi trang dùng image/font/bundle)
- Root cause category: n/a
- Review level expected: NORMAL — perf tuning, kiểm tra không regress UI/a11y
- Blast radius: mọi route (render path), image components
- Doc impact: NO_DOC_IMPACT (khớp R-22)
- Decision impact: NO

## Scope (spec refs)
- **R-22:** LCP < 2.5s trên 4G; ảnh tối ưu (`next/image`), lazy-load, bundle gọn;
  Lighthouse Performance ≥ 90
- **R-23:** fluid sizing (không CLS) · **R-21:** SSR/SSG không bị perf phá
- Design §1.8: ảnh hero `priority`, còn lại `loading="lazy"`; skeleton giữ aspect (CLS < 0.1)

## Dependencies
- Layer 2 hoàn tất (đủ trang để audit), Layer 4 task-01 (metadata/OG image — cùng ảnh asset)

## Description
1. Audit `next/image` mọi trang: hero ảnh lớn `priority` + `sizes` đúng; ảnh nội dung
   `loading="lazy"` + `sizes`; không ảnh oversize render nhỏ (config `imageSizes`/`deviceSizes` hợp lý);
   placeholder `blurDataURL`/`surface-sunken` giữ aspect → CLS < 0.1.
2. Font: `next/font` (Inter/SF Pro stack theo tokens) — self-host, `display: swap`, subset latin +
   ** Vietnamese subset** (chữ tiếng Việt không vỡ).
3. Bundle: tree-shake client components (drawer/filter là leaf `'use client'`), không import
   server lib vào client, dynamic import nặng nếu có (carousel/phosphor icons — tree-shake SVG).
4. Config: `next.config` image domains/remotePatterns nếu có ảnh remote (default: local only).
5. Đo: `npm run build` (output size), Lighthouse mobile + desktop (throttling 4G) trên
   `/`, `/blog/[slug]`, `/solutions/enterprise/crm` — chụp evidence score ≥ 90.
6. Nếu < 90 → fix root cause (ảnh to, render-blocking, hydration) rồi đo lại — ghi evidence.

## Acceptance Criteria
- [ ] 0 ảnh dùng `<img>` thô cho ảnh content (chỉ `<img>` khi next/image không phù hợp + lý do)
- [ ] Hero `priority` đúng 1 ảnh/trang; ảnh dưới fold lazy; `sizes` khớp layout grid
- [ ] Font load không FOIT; tiếng Việt render đúng mọi trang
- [ ] Lighthouse Performance ≥ 90 (mobile, throttled) cho ≥3 trang mẫu — evidence score trong report
- [ ] LCP < 2.5s (Lighthouse LH metric) · CLS < 0.1
- [ ] Không regress: UI/interaction/a11y vẫn PASS sau tối ưu
- [ ] Check commands pass

## Verification Summary
- Commands: `npm run lint` · `npm run typecheck` · `npm run build`
- Test: `test_command: null` → Lighthouse evidence (screenshots/scores) + build output size
- Manual evidence: tab chính không bị jank khi scroll (reveal mượt trên mobile emulation)
- Reviewer report: `.context/review-reports/feature-nta-website-layer-4-task-02-round-1-review.md`

## Retry / Error Memory
- Attempt: 0
- Last failure type: n/a
- Error memory entry: none
- Escalation: none — sau 3 attempt fail → `architecture_review_needed`

## DoD (Definition of Done)
- [ ] Code written (chỉ trong scope — modify tối ưu, không đổi behavior)
- [ ] Tests: skip — `test_command: null`, ghi lý do
- [ ] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [ ] Reviewer độc lập PASS
- [ ] `.context/progress.json` updated
- [ ] Error Memory / Doc Impact recorded
- [ ] committed — 1 task = 1 commit (branch `main`, KHÔNG push)

## Files to Create/Modify
- `src/app/[locale]/**/page.tsx` (ảnh props — sửa nhỏ)
- `src/app/globals.css` / font setup (`src/app/[locale]/layout.tsx`)
- `next.config.ts` (image config nếu cần)
- `public/images/**` (compress/resize assets nếu to)

## Notes
- Lighthouse chạy local qua browser — nếu môi trường không có → ghi `Blocked` + lý do, không claim pass.
- Không thêm CDN/ISR (v1 SSG static — YAGNI); tối ưu trong phạm vi Next defaults trước.
