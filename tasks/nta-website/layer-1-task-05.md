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
- [ ] `/khong-ton-tai` và `/en/does-not-exist` render 404 với nội dung đúng locale, status 404
- [ ] `/solutions/enterprise/sai-slug` → 404 (R-05), `/blog/sai` → 404 (R-09)
- [ ] h1 duy nhất; message nêu rõ nguyên nhân + cách khắc phục; HomeLink + ≥3 gợi ý link
- [ ] `robots: noindex` trong metadata; không JSON-LD
- [ ] Header/Footer vẫn render; lang toggle từ 404 không 404 loop
- [ ] Check commands pass

## Verification Summary
- Commands: `npm run lint` · `npm run typecheck` · `npm run build`
- Test: `test_command: null` → skip, ghi lý do
- Manual evidence: `npm run dev` → truy cập 4 URL sai (2 locale + 2 slug), curl `-I` thấy 404
- Reviewer report: `.context/review-reports/feature-nta-website-layer-1-task-05-round-1-review.md`

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
- `src/app/[locale]/not-found.tsx`
- `src/app/[locale]/[...rest]/page.tsx`
- `src/components/shared/NotFoundMessage.tsx` (nếu tách)
- `src/i18n/messages/{vi,en}.json` (404 keys)

## Notes
- Khi Layer 2 thêm route mới → catch-all tự động lo (không sửa task này).
- Focus vào main khi render (design: "focus auto/chuyển vào main") — không animate.
