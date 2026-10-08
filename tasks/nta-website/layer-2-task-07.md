# Task 07: Blog `/blog` + `[slug]` (Screens 10–11, MDX render)

## Layer
2

## Type
build (initial)

## Goal
Render danh sách bài viết (PostCard grid + pagination + empty state) và trang chi tiết bài MDX
(ArticleHeader → prose body → ShareBar → RelatedPosts), slug sai → 404 — hoàn tất 9 nhóm trang (R-26).

## Classification / Risk
- Work item type: FEATURE (initial build)
- Feature change type: ADDITIVE (initial build)
- Scope: SINGLE_SURFACE (list + dynamic route + MDX render)
- Root cause category: n/a
- Review level expected: NORMAL — render content tĩnh; STRICT nếu render MDX qua `dangerouslySetInnerHTML` không sanitize
- Blast radius: `/blog/*` (2 locale), MDX pipeline dùng chung
- Doc impact: NO_DOC_IMPACT (khớp design Screens 10–11 + R-09)
- Decision impact: NO

## Scope (spec refs)
- **R-09:** list + chi tiết, pagination/lazy-load; empty state `[cần xác nhận]` → design Screen 10 chốt copy
- **R-16:** content MDX trong repo, SSG · **R-23:** responsive (1→2→3 cột list; body ≤720px)
- **R-24:** `<article>` + `<time>`, share buttons `aria-label`, prose heading từ h2, `<nav>` pagination
- **R-21/R-20:** metadata/JSON-LD Article (headline/datePublished/author/image), canonical theo locale
- Design: Screens 10 & 11

## Dependencies
- Layer 1: task-02 (shell), task-03 (PostCard/PageHeader/Breadcrumb), task-04 (Pagination/EmptyState);
  Layer 0 task-03 (MDX pipeline) + task-04 (≥3 bài content)

## Description
1. `src/app/[locale]/blog/page.tsx` (Screen 10): PageHeader + Breadcrumb · PostCard grid
   (1→2→3 cột) · Pagination `?page=` pageSize 9 · Empty (0 bài) → "Chưa có bài viết nào."
   + link về trang chủ. Metadata "Tin tức | NTA" / "Blog | NTA".
2. `src/app/[locale]/blog/[slug]/page.tsx` (Screen 11):
   - `generateStaticParams` từ content; slug sai → `notFound()`
   - ArticleHeader (h1 `display`, `<time dateTime>` format theo locale — VI `08/10/2026`,
     EN `Oct 8, 2026`, Badge danh mục, tác giả nếu có, Breadcrumb) ·
     ArticleBody `prose max-w-[720px]` (heading bắt đầu h2) · ShareBar (Facebook/LinkedIn/copy-link,
     copy → toast `role="status"` "Đã sao chép") · RelatedPosts 3 card (trống → ẩn) · CTABanner alt
   - Metadata per post + canonical locale; JSON-LD Article
3. MDX render **server-side** (RSC) — không client hydration toàn bài; sanitize/limit component scope
   của MDX (chỉ component whitelist).
4. RelatedPosts sort cùng category, loại bài hiện tại; messages key `blog.*`.

## Acceptance Criteria
- [x] List 2 locale: grid đúng bp, `<time>` hiển thị theo locale, pagination hoạt động — `BlogFilter` đọc `?page=`, slice 9, clamp; **route vẫn SSG** (`/vi/blog`+`/en/blog` trong prerender-manifest, `blog.html` có slug)
- [x] Chi tiết: MDX render đúng (heading, list, ảnh, link), prose ≤720px desktop — `next-mdx-remote/rsc`, h1→h2, `max-w-[720px]`
- [x] ShareBar: 3 nút có `aria-label`, copy-link toast `role="status"` — `role="group"` + `pageUrl` từ server
- [x] Slug sai → 404; 0 bài → empty state copy đúng design
- [x] Không `dangerouslySetInnerHTML` với input không qua pipeline MDX an toàn — chỉ JSON-LD đã escape `<`
- [x] Metadata/JSON-LD per post + hreflang; check commands pass — `metadataBase` fixed, OG resolve `https://ntasolution.vn`

## Verification Summary
- Commands: `npm run lint` (PASS, 1 warning `<img>`) · `npm run typecheck` (PASS) · `npm run build` (PASS, 43 static pages)
- Test: `test_command: null` → skip, no test framework
- Manual evidence: `/vi/blog`+`/en/blog` trong `.next/prerender-manifest.json`; `vi/blog.html` chứa 4 slug; ShareBar static href nonempty; `og:image` = `https://ntasolution.vn/...`; canonical/hreflang 2 locale
- Reviewer report: `.context/review-reports/feature-nta-website-layer-2-task-07-round-2-review.md` (round 1 FAIL → round 2 **PASS STRICT**)

## Retry / Error Memory
- Attempt: 1 (fix cycle; rework #2 chỉnh trong cùng cycle — không tính attempt mới)
- Last failure type: MAJOR (pagination không cài; ShareBar hydration; thiếu metadataBase) → r1 FAIL; fix lần 1 gây regression SSG (server `searchParams`) → r2 PASS STRICT
- Error memory entry: **Error 5** (server `searchParams` opt-out khỏi SSG — mặt trái của Error 4 task-06)
- Escalation: none — sau 3 attempt fail → `architecture_review_needed`

## Doc / Decision Impact
- NO_DOC_IMPACT — Screens 10–11, R-09/R-16/R-21/R-24; không đổi API contract/schema/behavior tài liệu hoá.
- Decision impact: NO.

## DoD (Definition of Done)
- [x] Code written (chỉ trong scope)
- [x] Tests: skip — `test_command: null`, ghi lý do
- [x] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [x] Reviewer độc lập PASS (round 2, STRICT)
- [x] `.context/progress.json` updated
- [x] Error Memory / Doc Impact recorded
- [x] committed — 1 task = 1 commit (branch `main`, KHÔNG push)

## Files to Create/Modify
- `src/app/[locale]/blog/page.tsx`
- `src/app/[locale]/blog/[slug]/page.tsx`
- `src/components/blog/ArticleHeader.tsx`, `ShareBar.tsx`, `RelatedPosts.tsx`
- MDX components mapping (`src/components/mdx/index.tsx` — prose override token)
- `src/i18n/messages/{vi,en}.json` (`blog.*`)

## Notes
- OQ#5 đã chốt: blog static MDX v1, không CMS — không xây editor.
- R-15 API động (`GET /api/posts`) **không làm** ở v1 (spec cho phép static) — ghi `no doc impact`.
