# Task 04: Interactive components — Reveal, FilterBar, Pagination, Skeleton, EmptyState

## Layer
1

## Type
build (initial)

## Goal
Dựng nhóm component tương tác/phụ trợ: motion `Reveal` (fade/slide, reduced-motion gate),
`FilterBar`, `Pagination`, `Skeleton`, `EmptyState` — dùng cho case-studies/blog (Layer 2)
và states policy (design §1.4) trên mọi trang.

## Classification / Risk
- Work item type: FEATURE (initial build)
- Feature change type: ADDITIVE (initial build)
- Scope: SHARED_FOUNDATION (client-leaf components)
- Root cause category: n/a
- Review level expected: NORMAL — UI thuần, không API/data persistence
- Blast radius: mọi trang có filter/pagination/section reveal
- Doc impact: NO_DOC_IMPACT (khớp design §1.4 states + §1.5 motion + Screen 8/10)
- Decision impact: NO

## Scope (spec refs)
- **R-23:** responsive filter/pagination
- **R-24:** `aria-pressed` pills, `role="status"` announce kết quả, `aria-current="page"`,
  touch ≥44px, reduced-motion
- **R-08:** filter theo mảng + pagination `?page=` (deep linking) · **R-09:** pagination blog
- Design: §1.4 (states: loading skeleton / empty), §1.5 (motion policy 400ms/stagger 60ms/once)

## Dependencies
- task-01 Layer 1 (tokens), task-03 Layer 1 (cards — pagination render list card)

## Description
1. `Reveal` (client-leaf `'use client'`): fade + slide 16px, 400ms, stagger 60ms, `once`,
   chỉ `transform/opacity`; **`prefers-reduced-motion` → hiện ngay không animate**.
   (Library motion: chọn `motion/react` nếu cài — mỗi dependency thêm phải có lý do; hoặc
   IntersectionObserver thuần. Ghi quyết định vào Notes.)
2. `FilterBar`: horizontal pills single-select (Tất cả/Doanh nghiệp/AI/App AI), `role="group"`,
   `aria-pressed`, ≥44px, scroll-snap mobile, filter **client-side** không reload.
3. `Pagination`: `<nav aria-label>`, `aria-current="page"`, đổi URL `?page=` (giữ `?filter=`),
   full-width mobile / centered desktop.
4. `Skeleton`: khối nền `surface-sunken` đúng aspect-ratio (CLS < 0.1) — dùng khi có async/loading.
5. `EmptyState`: message + optional action (vd "Xóa bộ lọc"), `aria-live="polite"`;
   theo design §1.4 section phụ rỗng → **ẩn section** (EmptyState chỉ cho filter/list chính).

## Acceptance Criteria
- [ ] `Reveal`: animate 1 lần/section,尊重 reduced-motion, không dùng layout-triggering property
- [ ] `FilterBar`: đổi filter cập nhật `role="status"` announce; keyboard chọn được từng pill
- [ ] `Pagination`: deep link `?page=2&filter=ai` round-trip đúng; `aria-current` đúng
- [ ] `Skeleton` giữ nguyên aspect → không layout shift khi thay bằng nội dung thật
- [ ] `EmptyState` có message + action; section phụ rỗng được ẩn (không để trống)
- [ ] Client components leaf nhỏ; phần còn lại server
- [ ] Check commands pass

## Verification Summary
- Commands: `npm run lint` · `npm run typecheck` · `npm run build`
- Test: `test_command: null` → skip, ghi lý do
- Manual evidence: giả lập list rỗng → EmptyState + nút xóa lọc; đổi `?page` URL giữ filter;
  bật reduced-motion (OS) → không animate
- Reviewer report: `.context/review-reports/feature-nta-website-layer-1-task-04-round-1-review.md`

## Retry / Error Memory
- Attempt: 0
- Last failure type: n/a
- Error memory entry: none
- Escalation: none — sau 3 attempt fail → `architecture_review_needed`

## DoD (Definition of Done)
- [ ] Code written (chỉ trong scope)
- [ ] Tests: skip — `test_command: null`, ghi lý do
- [ ] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [ ] Reviewer độc lập PASS
- [ ] `.context/progress.json` updated
- [ ] Error Memory / Doc Impact recorded
- [ ] committed — 1 task = 1 commit (branch `main`, KHÔNG push)

## Files to Create/Modify
- `src/components/ui/Reveal.tsx`, `FilterBar.tsx`, `Pagination.tsx`, `Skeleton.tsx`, `EmptyState.tsx`
- `src/i18n/messages/{vi,en}.json` (label filter/pagination/empty key)
- `package.json` (chỉ nếu chọn `motion` — ghi lý do)

## Notes
- FilterBar/Pagination là client component — nhận props data đã serializable từ server page.
- Motion: không parallax/marquee/scroll-hijack (design §1.5 cấm).
