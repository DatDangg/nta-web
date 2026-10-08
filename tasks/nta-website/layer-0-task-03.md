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
- [x] Types đủ entity theo `docs/ERD.md` khái niệm; ContactSubmission ghi chú thuộc API layer (xem L3)
- [x] Loader hỗ trợ `vi` và `en`; validate field bắt buộc và báo rõ file content lỗi
- [x] Slug helpers trả list tĩnh 4 enterprise + 3 ai (R-05/R-06)
- [x] `npm run build` build sạch với fixture content tối thiểu
- [x] Không import server-only code vào client component (đã kiểm tra khi review — PASS)
- [x] Check commands pass

## Verification Summary
- Commands: `npm install` PASS; `npm run lint` PASS; `npm run typecheck` PASS; `npm run build` PASS
- Test: `test_command: null` → skip, ghi lý do
- Manual evidence: `npm run build` generated VI and EN locale routes; direct loader smoke was not separately run because no test/runtime TypeScript harness is configured. Loader uses `server-only` and no client module imports it.
- Reviewer report: `.context/review-reports/feature-nta-website-layer-0-task-03-round-1-review.md`

## Retry / Error Memory
- Attempt: 0
- Last failure type: n/a
- Error memory entry: none
- Escalation: none — sau 3 attempt fail → `architecture_review_needed`

## DoD (Definition of Done)
- [x] Code written (chỉ trong scope)
- [x] Tests: skip — `test_command: null`, v1 chưa cấu hình test framework
- [x] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [x] Reviewer độc lập PASS (STRICT)
- [x] `.context/progress.json` updated
- [x] Error Memory / Doc Impact recorded: không có lỗi phát sinh; NO_DOC_IMPACT (không đổi API/schema/behavior đã document)
- [x] committed — 1 task = 1 commit (branch `main`, KHÔNG push)

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
- MDX: dùng `gray-matter` cho frontmatter và `next-mdx-remote/rsc` cho App Router server render; file được đọc tĩnh phía server, không cần next.config MDX plugin/compile-time imports.
- Checks: `npm install` PASS; `npm run lint` PASS; `npm run typecheck` PASS; `npm run build` PASS. `test_command: null` → skip vì dự án chưa cấu hình test framework. Oxlint skip vì repository chưa có Oxlint config.
- Doc Impact: NO_DOC_IMPACT. Reviewer, progress reconciliation và commit do primary xử lý.
