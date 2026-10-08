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
- [x] `Reveal`: animate 1 lần/section, tôn trọng reduced-motion, không dùng layout-triggering property
- [x] `FilterBar`: đổi filter cập nhật `role="status"` announce; native buttons hỗ trợ keyboard
- [x] `Pagination`: deep link `?page=2&filter=ai` round-trip giữ query params; `aria-current` đúng
- [x] `Skeleton` giữ nguyên aspect ratio để tránh layout shift
- [x] `EmptyState` hỗ trợ message + optional action; section phụ được ẩn bằng caller khi rỗng
- [x] Client components chỉ ở Reveal/FilterBar/Pagination; Skeleton/EmptyState là server components
- [x] Check commands pass

## Verification Summary
- Commands (attempt 2): `npm run lint` PASS · `npm run typecheck` PASS · `npm run build` PASS
- Test: `skip, test_command: null` — repo chưa cấu hình test framework
- Manual evidence (contract/code review; browser chưa exercise vì các component chưa được tích hợp vào page): Reveal SSR giữ visible nếu JS tắt; khi script thêm `html.js`, CSS ẩn item trước paint; class `revealed` kết thúc transition; reduced-motion override hiển thị ngay; observer disconnects lần đầu. FilterBar dùng localized `groupLabel`.
- Oxlint: N/A — repo không có oxlint config.
- Reviewer reports: `.context/review-reports/feature-nta-website-layer-1-task-04-round-1-review.md`, `.context/review-reports/feature-nta-website-layer-1-task-04-round-2-review.md`

## Retry / Error Memory
- Attempt: 2
- Last failure type: reviewer findings — SSR reveal flash and hardcoded Vietnamese aria-label
- Error memory entry: `.context/error-memory.md` (review-round findings recorded)
- Escalation: user approved continuation after attempt 2; no third-failure escalation unless this attempt fails.

## DoD (Definition of Done)
- [x] Code written (chỉ trong scope)
- [x] Tests: skip — `test_command: null`, ghi lý do
- [x] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [ ] Reviewer độc lập PASS
- [ ] `.context/progress.json` updated
- [x] Error Memory / Doc Impact recorded — no error; NO_DOC_IMPACT (component-only, no API/schema/current-flow doc changes)
- [ ] committed — 1 task = 1 commit (branch `main`, KHÔNG push)

## Files to Create/Modify
- `src/components/ui/Reveal.tsx`, `FilterBar.tsx`, `Pagination.tsx`, `Skeleton.tsx`, `EmptyState.tsx`
- `src/i18n/messages/{vi,en}.json` (label filter/pagination/empty key)
- `package.json` (chỉ nếu chọn `motion` — ghi lý do)

## Notes
- FilterBar/Pagination là client component — nhận props data đã serializable từ server page.
- Layer 2: bọc `Pagination` trong `<Suspense>` khi dùng trên page static do `useSearchParams` (Next 15).
- Reveal dùng `key={index}`; chỉ truyền children tĩnh, không dùng cho danh sách có reorder/thay đổi phần tử.
- Motion: dùng IntersectionObserver thuần, không thêm dependency; reveal chỉ dùng opacity/transform, disconnect sau lần vào viewport đầu tiên; reduced-motion bypass observer. Chọn native API để giữ client leaf nhẹ, không phát sinh dependency chỉ cho hiệu ứng đơn giản.
- Không parallax/marquee/scroll-hijack (design §1.5 cấm). EmptyState chỉ dùng cho filter/list chính; caller ẩn section phụ khi không có dữ liệu.
