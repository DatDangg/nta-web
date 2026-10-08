# Task 03: Content schema, MDX pipeline & loaders

## Layer
0

## Type
build (initial)

## Goal
Xây "domain layer" không-DB của site: kiểu dữ liệu content (Solution/Product/CaseStudy/Post/About),
cấu trúc thư mục `src/content/`, pipeline MDX (frontmatter + body) và loader functions
(`getAll*` / `getBySlug(locale, slug)`) + `generateStaticParams` helpers cho các route slug.

## Classification / Risk
- Work item type: FEATURE (initial build)
- Feature change type: ADDITIVE (initial build)
- Scope: SHARED_FOUNDATION (types/loader dùng cho mọi trang nội dung)
- Root cause category: n/a
- Review level expected: NORMAL — domain types + file loading, không auth/API trực tiếp
- Blast radius: mọi page task ở Layer 2 (types + loader là contract nội bộ)
- Doc impact: NO_DOC_IMPACT (khớp `docs/ERD.md` entity khái niệm + R-16)
- Decision impact: YES nếu chọn khác hướng MDX đã chốt → ghi `.context/decisions.md`

## Scope (spec refs)
- **R-16:** v1 không DB — nội dung file trong repo (MDX/JSON/TS), render SSG/SSR
- **R-26:** ≥9 nhóm trang, nội dung mẫu hợp lý
- **R-15:** v1 static (không cần `GET /api/posts|/api/case-studies` động — spec cho phép static)
- **R-08/R-09:** slug routes cần `generateStaticParams` + 404 slug sai
- Design: §Architecture (`src/content/`), Data Flow #1 (content → import tĩnh → SSG)

## Dependencies
- task-01 (scaffold)

## Description
1. Types: `src/content/types.ts` — `Solution` (mảng enterprise/ai, slug, features, benefits),
   `Product`, `CaseStudy` (category, year, challenge/solution/result, gallery, related),
   `Post` (title, date, category, excerpt, cover), `AboutData` (mission/capabilities/team/milestones/partners).
2. Cấu trúc `src/content/`: `{solutions,products,case-studies,blog,about}/{vi,en}/` —
   content 2 bản VI/EN (design §1.7).
3. MDX pipeline: frontmatter (gray-matter hoặc equivalent) + render body.
   **Builder chọn cách đơn giản nhất còn hỗ trợ App Router** (`next-mdx-remote/rsc` static import
   hoặc `next/mdx`) — ghi quyết định vào Notes; KHÔNG thêm dependency thừa.
4. Loaders `src/lib/content/*.ts`: `getAllPosts(locale)`, `getPostBySlug(locale, slug)` (sort date,
   trả `null` khi không thấy → page tự `notFound()`), tương tự case-studies/solutions/products/about.
5. Slug validators + `generateStaticParams` helpers (slug hợp lệ = khóa trong types/content,
   slug sai → 404, khớp R-05/R-06).
6. Validate tối giản khi load (missing field → throw lúc **build**, không render undefined).

## Acceptance Criteria
- [ ] Types đủ 5 entity theo `docs/ERD.md` khái niệm (Solution, Product, CaseStudy, Post, ContactSubmission — ContactSubmission là API layer, ghi chú "xem L3")
- [ ] Loader hoạt động cho cả `vi` và `en`; fallback lỗi rõ ràng (throw ở build với message chỉ đúng file)
- [ ] Slug helpers trả list slug tĩnh cho 4 enterprise + 3 ai (R-05/R-06)
- [ ] `npm run build` build sạch với 1 fixture content mẫu tối thiểu
- [ ] Không import server-only code vào client component (kiểm tra khi review)
- [ ] Check commands pass

## Verification Summary
- Commands: `npm install` · `npm run lint` · `npm run typecheck` · `npm run build`
- Test: `test_command: null` → skip, ghi lý do
- Manual evidence: unit-style smoke bằng `node`/build log — loader trả data 2 locale
- Reviewer report: `.context/review-reports/feature-nta-website-layer-0-task-03-round-1-review.md`

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
- `src/content/types.ts` (hoặc `src/types/content.ts`)
- `src/lib/content/posts.ts`, `src/lib/content/case-studies.ts`, `src/lib/content/solutions.ts`,
  `src/lib/content/products.ts`, `src/lib/content/about.ts`, `src/lib/content/slug.ts`
- `src/content/**` (1 fixture minimal để build pass — nội dung đầy đủ ở task-04)
- `package.json` (dependency MDX tối thiểu, nếu chọn hướng cần)

## Notes
- ⚠️ OQ#5 (blog CMS) đã chốt v1 = static MDX → không xây admin/CMS.
- R-15 API động: **bỏ qua ở v1** (spec cho phép static) — ghi `no doc impact` khi close-out.
- Content loader là module server-only — đặt đúng tầng để client component chỉ nhận props đã serializable.
