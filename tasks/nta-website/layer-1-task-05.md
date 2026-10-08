# Task 05: 404 — not-found page (Screen 13)

## Layer
1

## Type
build (initial)

## Goal
Dựng trang 404 đúng design Screen 13: NotFoundMessage + HomeLink + SearchHint, hoạt động cho
**cả 2 locale** và cho mọi slug-sai (`solutions/*/[slug]`, `case-studies/[slug]`, `blog/[slug]`),
giữ `status = 404` + `robots: noindex`.

## Classification / Risk
- Work item type: FEATURE (initial build)
- Feature change type: ADDITIVE (initial build)
- Scope: SINGLE_SURFACE (route catch-all 404)
- Root cause category: n/a
- Review level expected: NORMAL — trang tĩnh, không auth/API
- Blast radius: mọi URL sai (global 404 behavior)
- Doc impact: NO_DOC_IMPACT (khớp R-12 + design Screen 13)
- Decision impact: NO

## Scope (spec refs)
- **R-12:** NotFoundMessage + HomeLink + SearchHint
- **R-05/R-06/R-08/R-09:** slug sai → 404
- **R-21:** `robots: noindex` cho 404 · **R-24:** h1 duy nhất, focus vào main, problem + recovery copy
- Design: Screen 13 (§2)

## Dependencies
- task-02 Layer 1 (Header/Footer phải render trong 404), task-01 Layer 1 (Button),
  task-02 Layer 0 (locale routing)

## Description
1. `src/app/[locale]/not-found.tsx`: centered block giữa Header/Footer:
   h1 `display` "Không tìm thấy trang" / "Page not found" · message (problem + recovery) ·
   HomeLink Button primary "Về trang chủ"/"Go to home" · SearchHint `<nav aria-label="Gợi ý trang">`
   3–5 link phổ biến (Giải pháp, Case study, Blog, Liên hệ). Không reveal/animate.
2. Catch-all `src/app/[locale]/[...rest]/page.tsx`: gọi `notFound()` khi path không khớp route thật
   (App Router cần catch-all để render `not-found` ở depth tùy ý).
3. Metadata: `robots: noindex`, title "Không tìm thấy trang | NTA" / EN; không JSON-LD.
4. Messages key 404 (VI/EN).

## Acceptance Criteria
- [x] `/khong-ton-tai` và `/en/does-not-exist` render 404 với nội dung đúng locale, status 404
- [x] `/solutions/enterprise/sai-slug` → 404 (R-05), `/blog/sai` → 404 (R-09)
- [x] h1 duy nhất; message nêu rõ nguyên nhân + cách khắc phục; HomeLink + ≥3 gợi ý link
- [x] `robots: noindex` trong metadata; không JSON-LD
- [x] Header/Footer vẫn render; lang toggle từ 404 không 404 loop
- [x] Check commands pass

## Verification Summary
- Commands: `npm run lint` · `npm run typecheck` · `npm run build` — PASS (builder + reviewer round 1 & 2)
- Test: `test_command: null` → skip, chưa có test framework
- Manual evidence: builder verify 4 URL sai (2 locale + 2 slug) → HTTP 404
- Reviewer report: `.context/review-reports/feature-nta-website-layer-1-task-05-round-2-review.md` (round 1 FAIL → fix → round 2 **PASS**, STRICT)

## Retry / Error Memory
- Attempt: 1 (round 1 FAIL — MAJOR thiếu focus vào main → fix → round 2 PASS)
- Last failure type: MAJOR a11y (requirement tường minh chưa implement)
- Error memory entry: none (không phải lỗi tái diễn; đã ghi pattern vào task)
- Escalation: none — sau 3 attempt fail → `architecture_review_needed`

## DoD (Definition of Done)
- [x] Code written (chỉ trong scope)
- [x] Tests: skip — `test_command: null`, ghi lý do
- [x] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [x] Reviewer độc lập PASS
- [x] `.context/progress.json` updated
- [x] Error Memory / Doc Impact recorded
- [x] committed — 1 task = 1 commit (branch `main`, KHÔNG push)

## Files to Create/Modify
- `src/app/[locale]/not-found.tsx`
- `src/app/[locale]/layout.tsx` (main focus target: `tabIndex={-1}`)
- `src/app/[locale]/[...rest]/page.tsx`
- `src/components/shared/FocusMain.tsx`
- `src/components/shared/NotFoundMessage.tsx` (nếu tách) — không tách (primitive có sẵn đủ dùng)
- `src/i18n/messages/{vi,en}.json` (404 keys)

## Notes
- Khi Layer 2 thêm route mới → catch-all tự động lo (không sửa task này).
- Focus vào main khi render (design: "focus auto/chuyển vào main") — không animate.
- **Residual (defer được reviewer round 2 chấp thuận):** MINOR #2 — metadata nested `not-found.tsx`
  (`generateMetadata`) chưa verify runtime `<title>` (Next chỉ bảo đảm cho root `app/not-found`);
  `robots: noindex` vẫn đạt do Next auto-inject cho response 404. Theo dõi ở Layer 4 a11y/SEO sweep.
- **Doc Impact: NO_DOC_IMPACT** — khớp R-12 + design Screen 13; không đổi API contract/schema/current-state doc.
