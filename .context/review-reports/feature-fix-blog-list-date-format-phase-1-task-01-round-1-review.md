# Review — feature fix-blog-list-date-format · phase-1-task-01 · round 1

Agent: reviewer

> ⚠️ **Inline self-review** — env subagent depth limit (1) chặn spawn reviewer độc lập. Report này do
> change-request thực hiện tại chỗ, **KHÔNG** phải reviewer độc lập. Primary PHẢI chạy lại reviewer
> độc lập (round 2) trước khi unlock Layer 3 (xem Residual risk).

## Scope
- Task: `tasks/feature-fix-blog-list-date-format/phase-1-task-01.md`
- Change: `spec/changes/2026-10-09-fix-blog-list-date-format.md` (C-L2-1 MED)
- Diff: `src/lib/format/date.ts` (new), `src/components/cards/PostCard.tsx`, `src/components/blog/ArticleHeader.tsx`

## Review level
**STRICT** — chạm shared component `PostCard` (dùng ở `BlogFilter`, `RelatedPosts`, `blog/page.tsx` SSG fallback)
+ `ArticleHeader` blog detail. Theo `FEATURE_WORKFLOW.md` §6: shared component → STRICT bắt buộc.

## Reason
Shared surface blog; cần đảm bảo list = detail = design S11 và không regression SSG/a11y.

## Blast radius
- Blog list (`/blog` + `/en/blog`) — `PostCard` trong `BlogFilter` + SSG fallback.
- Blog detail (`/blog/[slug]`) — `RelatedPosts` (PostCard) + `ArticleHeader`.
- Không chạm: `CaseStudyCard` (năm-only), `BlogFilter`/`RelatedPosts`/`blog/page.tsx` (chỉ nhận qua PostCard).

## Verify commands + result
| Command | Result |
|---|---|
| `npm run lint` | ✅ PASS (exit 0; 1 warning pre-existing ở `src/components/mdx/index.tsx` — ngoài scope, không phải lỗi mới) |
| `npm run typecheck` | ✅ PASS (exit 0) |
| `npm run build` | ✅ PASS (exit 0; `● /[locale]/blog` SSG → `/vi/blog`, `/en/blog`; `● /[locale]/blog/[slug]` 8 paths) |
| `grep -rn "dateStyle" src/` | ✅ 0 match |
| `test` | skip — `test_command: null`, chưa cấu hình test framework |

## Findings

### Blocking
Không có.

### Non-blocking / ghi nhận
1. **`useLocale() as Locale` cast** (`PostCard.tsx:15`) — `useLocale()` trả `string`; cast bỏ đảm bảo runtime.
   An toàn vì routing chỉ có `vi`/`en` (`src/i18n/routing.ts`); khớp convention hiện có (`blog/page.tsx:30`
   `locale as Locale`). Residual thấp.
2. **Nguồn format duy nhất** — `formatPostDate` ở `src/lib/format/date.ts`; cả `PostCard` và `ArticleHeader`
   đều dùng. Đúng yêu cầu "1 nguồn format dùng chung", không copy logic.
3. **A11y giữ nguyên** — `<time dateTime={post.date}>` còn ở cả 2 surface (R-24).
4. **SSG giữ nguyên** — build output + `.next/server/app/vi/blog.html` (slug `first-steps`/`learning-content`/
   `responsible-ai`) + `.next/prerender-manifest.json` (`/vi/blog`, `/en/blog`) xác nhận không rớt prerender.
5. **Format thực tế trong static HTML** — VI: `08/10/2026`; EN: `Oct 8, 2026` (khớp design S11).
6. Không có dead code: biến `date` cũ ở `PostCard` đã bỏ; inline `Intl.DateTimeFormat` ở `ArticleHeader` đã bỏ.

### AI-chaos / slop check
- `date.ts`: 1 trách nhiệm, pure function, tên self-descriptive, 19 dòng. Không indirection thừa. ✅
- Không narrative comment, không swallowed error, không `any`, không dead code. ✅

## Verdict
**PASS** (code đúng acceptance; STRICT self-review) — ⚠️ independence chưa đạt, xem Residual risk.

## Residual risk
- **Không có reviewer độc lập** do env subagent depth limit → blind spot có thể chưa lộ. Primary PHẢI chạy
  reviewer độc lập round 2 (`feature-fix-blog-list-date-format-phase-1-task-01-round-2-review.md`) trước khi
  unlock Layer 3.
- Chưa browser-test trực quan (đánh giá qua static HTML build + đọc code).
- Locale ngoài vi/en sẽ làm `localeTag[locale]` undefined — không xảy ra với routing hiện tại.
