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
- [ ] List 2 locale: grid đúng bp, `<time>` hiển thị theo locale, pagination hoạt động
- [ ] Chi tiết: MDX render đúng (heading, list, ảnh, link), prose ≤720px desktop
- [ ] ShareBar: 3 nút có `aria-label`, copy-link toast `role="status"`
- [ ] Slug sai → 404; 0 bài → empty state copy đúng design
- [ ] Không `dangerouslySetInnerHTML` với input không qua pipeline MDX an toàn
- [ ] Metadata/JSON-LD per post + hreflang; check commands pass

## Verification Summary
- Commands: `npm run lint` · `npm run typecheck` · `npm run build`
- Test: `test_command: null` → skip, ghi lý do
- Manual evidence: ≥3 bài × 2 locale render đủ; copy-link toast; slug sai → 404; list rỗng → empty
- Reviewer report: `.context/review-reports/feature-nta-website-layer-2-task-07-round-1-review.md`

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
- `src/app/[locale]/blog/page.tsx`
- `src/app/[locale]/blog/[slug]/page.tsx`
- `src/components/blog/ArticleHeader.tsx`, `ShareBar.tsx`, `RelatedPosts.tsx`
- MDX components mapping (`src/components/mdx/index.tsx` — prose override token)
- `src/i18n/messages/{vi,en}.json` (`blog.*`)

## Notes
- OQ#5 đã chốt: blog static MDX v1, không CMS — không xây editor.
- R-15 API động (`GET /api/posts`) **không làm** ở v1 (spec cho phép static) — ghi `no doc impact`.
