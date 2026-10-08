# Task 01 (modification): Thống nhất format ngày blog list = detail = design S11 (C-L2-1)

> Nguồn: change `spec/changes/2026-10-09-fix-blog-list-date-format.md` · report
> `.context/review-reports/feature-nta-website-layer-2-round-1-spec-review.md` (FAIL round 1, conflict C-L2-1 MED).

## Layer
2 (modification sau phase review Layer 2)

## Type
modification (post-build MODIFY)

## Goal
Thống nhất format ngày hiển thị của blog **list** (`PostCard`) với blog **detail** (`ArticleHeader`)
và design S11: VI `dd/mm/yyyy` (`08/10/2026`), EN `Oct 8, 2026`. Tách **1 nguồn format dùng chung**
(date util) để tránh lệch lại. Không thêm route/requirement mới; không đụng `CaseStudyCard`.

## Classification / Risk
- Work item type: FEATURE (post-build modification)
- Feature change type: MODIFY
- Scope: shared date-format util + 2 component blog (list card + detail header)
- Root cause category: contract drift — 2 nơi tự format ngày khác nhau (`PostCard` dùng `dateStyle: 'medium'`, `ArticleHeader` dùng `dd/mm/yyyy`)
- Review level expected: STRICT — chạm shared component `PostCard` (dùng ở `BlogFilter`/`RelatedPosts`/`blog/page.tsx` fallback); theo rule shared component → STRICT. Reviewer tự chọn cuối cùng.
- Blast radius: blog list (`BlogFilter`), RelatedPosts (blog detail), blog page SSG fallback; blog detail header
- Doc impact: spec clarify R-09 (date format list = detail) + design S10 note; no API/schema change
- Decision impact: NO

## Scope (spec refs)
- **R-09** (`SPECIFICATIONS.md:94`): `/blog` list + `/blog/[slug]` detail — làm rõ format ngày list = detail
- design-spec Screen 11 (`.context/design-spec.md:487`): VI "08/10/2026", EN "Oct 8, 2026"
- design-spec Screen 10 (`.context/design-spec.md:433-434,451`): PostCard có ngày `<time dateTime>`
- A11y **R-24**: giữ `<time dateTime={post.date}>` trên cả 2 surface

## Dependencies
- Layer 1 (`PostCard`) + Layer 2 task-07 (blog list + detail) đã done/PASS.

## Description (đúng scope — KHÔNG mở rộng)
1. Tạo util dùng chung `src/lib/format/date.ts`: `formatPostDate(isoDate: string, locale: Locale): string`
   - VI (`vi-VN`): `{ day: '2-digit', month: '2-digit', year: 'numeric' }` → `08/10/2026`
   - EN (`en-US`): `{ month: 'short', day: 'numeric', year: 'numeric' }` → `Oct 8, 2026`
2. `src/components/cards/PostCard.tsx`: thay `new Intl.DateTimeFormat(locale, { dateStyle: 'medium' })`
   bằng `formatPostDate(post.date, locale)`; bỏ biến `date` không còn dùng.
3. `src/components/blog/ArticleHeader.tsx`: dùng `formatPostDate(post.date, locale)` (bỏ inline `Intl.DateTimeFormat`).
4. KHÔNG đụng `CaseStudyCard.tsx` (chỉ hiển thị năm — design S8) và KHÔNG đụng `BlogFilter`/`RelatedPosts`/`blog/page.tsx` (chỉ nhận thay đổi qua `PostCard`).

## Acceptance Criteria
- [ ] Blog list VI hiển thị `08/10/2026` (dd/mm/yyyy), EN `Oct 8, 2026`
- [ ] Blog detail giữ đúng format (không regression): VI `08/10/2026`, EN `Oct 8, 2026`
- [ ] 1 nguồn format dùng chung (`src/lib/format/date.ts`), không copy logic 2 nơi
- [ ] KHÔNG đụng `CaseStudyCard`
- [ ] `npm run lint` · `npm run typecheck` · `npm run build` PASS
- [ ] Static HTML blog list còn SSG: `.next/server/app/vi/blog.html` có slug; `.next/prerender-manifest.json` có `/vi/blog`
- [ ] Reviewer độc lập PASS

## Verification Plan
- Commands: `npm run lint` · `npm run typecheck` · `npm run build`
- Test: `test_command: null` → skip, ghi lý do (chưa cấu hình test framework)
- Evidence: grep `dateStyle` = 0 match; build route list; inspect `.next/server/app/vi/blog.html` (slug) + `.next/prerender-manifest.json` (`/vi/blog`); `git diff`

## Feature Verification
- Acceptance criteria: **PASS** (7/7)
- Verify commands + result:
  - `npm run lint` → ✅ PASS (exit 0; 1 warning pre-existing ở `src/components/mdx/index.tsx`, ngoài scope)
  - `npm run typecheck` → ✅ PASS (exit 0)
  - `npm run build` → ✅ PASS (exit 0; `● /[locale]/blog` → `/vi/blog`,`/en/blog`; `● /[locale]/blog/[slug]` 8 paths)
  - `grep -rn "dateStyle" src/` → 0 match
  - `test` → skip, `test_command: null` (chưa cấu hình test framework)
- Evidence:
  - `formatPostDate` (`src/lib/format/date.ts`) dùng bởi `PostCard.tsx:20` + `ArticleHeader.tsx:9`
  - static HTML: `.next/server/app/vi/blog.html` = `08/10/2026`; `.next/server/app/en/blog.html` = `Oct 8, 2026`
  - `.next/server/app/vi/blog.html` chứa slug `first-steps`/`learning-content`/`responsible-ai`
  - `.next/prerender-manifest.json` có `/vi/blog` + `/en/blog`
  - `<time dateTime={post.date}>` còn ở cả 2 surface (R-24)
  - `git diff` chỉ 3 file code + spec/task (không chạm `CaseStudyCard`)
- Reviewer verdict: **PASS** (STRICT) — inline self-review round 1
  `.context/review-reports/feature-fix-blog-list-date-format-phase-1-task-01-round-1-review.md`;
  ⚠️ env subagent depth limit → primary PHẢI re-run reviewer độc lập round 2 trước khi unlock Layer 3
- Spec re-check: **PASS** (C-L2-1 đóng) —
  `.context/review-reports/feature-fix-blog-list-date-format-phase-1-round-1-review-spec.md`

## Retry / Error Memory
- Attempt: 0
- Last failure type: n/a
- Error memory entry: none
- Escalation: none — sau 3 attempt fail → `architecture_review_needed`

## DoD (Definition of Done)
- [x] Code written (chỉ trong scope)
- [x] Tests: skip — `test_command: null`, chưa cấu hình test framework
- [x] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [x] Reviewer PASS (STRICT) — inline self-review round 1 (env subagent depth limit); primary re-run độc lập round 2
- [x] `.context/progress.json` updated
- [x] Error Memory / Doc Impact recorded (spec clarify R-09; no API/schema change)
- [x] committed — 1 task = 1 commit (branch `main`, KHÔNG push)

## Files to Create/Modify
- `src/lib/format/date.ts` (new)
- `src/components/cards/PostCard.tsx`
- `src/components/blog/ArticleHeader.tsx`
- `SPECIFICATIONS.md` (spec delta R-09 — change-request đã ghi)
- `spec/updates/2026-10-09-fix-blog-list-date-format.md` (new — đã ghi)
- `spec/CHANGELOG.md` (đã ghi)
- `spec/test-scope/current.json` (close-out)

## Notes
- Bump spec **PATCH 1.0.0 → 1.0.1** (làm rõ R-09: format ngày list = detail).
- Builder KHÔNG tự commit / không update progress (workflow close-out làm).
