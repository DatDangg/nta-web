Agent: reviewer

# Review: feature-blog-listing-redesign — phase-1-task-01 (round 1)

## Review level: STRICT

## Reason
Diff đổi **shared type** `Post` (`category: string` → union `BlogCategory`, thêm `readingMinutes`) và **shared util**
`formatPostDate` (dùng ở list + detail + RelatedPosts). Theo bảng risk của reviewer: shared service/component/type → STRICT.

## Blast radius
- `src/content/types.ts` → `Post`, `MdxDocument.frontmatter` (Omit<Post,'body'>, giờ có thêm `readingMinutes`).
- Consumer của `Post` / `getAllPosts` / `getPostBySlug`:
  - `src/app/[locale]/blog/page.tsx` + `src/components/blog/BlogFilter.tsx` ('use client', nhận `Post[]`) → `PostCard`.
  - `src/app/[locale]/blog/[slug]/page.tsx`: related filter `candidate.category === post.category` (so key với key — 4 bài 4 key khác nhau
    → vẫn 0 bài liên quan, giống hiện trạng), JSON-LD `createArticleJsonLd` chỉ dùng title/url/date ISO → không đổi.
  - `src/app/sitemap.ts`: chỉ dùng `slug` → không đổi.
  - `src/components/blog/RelatedPosts.tsx` (server) → `PostCard`.
  - `getMdxDocument` (`src/lib/content/posts.ts:34`): không có consumer nào trong repo (`git grep` chỉ thấy định nghĩa) → frontmatter thêm `readingMinutes` vô hại.
- `formatPostDate`: chỉ `ArticleHeader.tsx:10` và `PostCard.tsx:21`.
- `t('categories.*')` trong `PostCard` (dùng cả trong client `BlogFilter`): layout truyền **toàn bộ** messages vào `NextIntlClientProvider`
  (`src/app/[locale]/layout.tsx:54,68`) → namespace `blog.categories` có ở client.
- Không còn chỗ nào trong `src/` hard-code chuỗi category cũ hay ngày `dd/mm/yyyy`.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` (tsc --noEmit, trên device) | PASS, exit 0, không lỗi |
| `npm run lint` (eslint ., trên device) | PASS, exit 0 — 0 error, 1 warning có sẵn `src/components/mdx/index.tsx:25` (no-img-element, ngoài scope) |
| `npm run build` | không chạy trên device (node_modules Windows, VM không mạng). Dựa evidence builder: `next build` PASS ở sandbox cloud (stub next/font chỉ ở sandbox, không commit) + HTML build có VI `08 Th10, 2026`/`15 Th3, 2026`, EN `Oct 8, 2026`, badge nhãn i18n. → Residual risk thấp. |
| `node --experimental-strip-types` import bản copy `date.ts` (TZ=Pacific/Kiritimati và TZ=America/Los_Angeles) | `2026-10-08`→`08 Th10, 2026`/`Oct 8, 2026`; `2026-03-15`→`15 Th3, 2026`/`Mar 15, 2026`; `2026-01-01`→`01 Th1, 2026`/`Jan 1, 2026`; `2026-12-31`→`31 Th12, 2026`/`Dec 31, 2026`; cả 2 TZ ra giống nhau → không lệch timezone |
| Script node: parity key `vi.json`/`en.json` | 0 key lệch (vi-only `[]`, en-only `[]`) |
| Script node: đếm token body 8 bài | 72–143 token → `ceil(n/200)` = 1 phút cho cả 4 bài × 2 locale (khớp AC) |

## Acceptance criteria
- [x] `formatPostDate('2026-10-08','vi')`=`08 Th10, 2026`; `('2026-03-15','vi')`=`15 Th3, 2026`; EN `Oct 8, 2026` — verify bằng node.
- [x] Key lạ → `toPost` throw `Invalid content file src/content/blog/<locale>/<slug>.mdx: unknown category "..."` (`posts.ts:18-20`); chạy trong `getAllPosts` → `generateStaticParams`/sitemap → build fail.
- [x] `readingMinutes` = `max(1, ceil(tokens/200))` (`posts.ts:11-14`), tokens tách theo `\s+` của body MDX — đúng spec R-09a §Thời gian đọc; 4 bài = 1.
- [x] Map: responsible-ai→`ai-tech`, digital-workflows→`practical`, learning-content→`guides`, first-steps→`nta-news` (vi+en, 8 file).
- [x] Badge list (`PostCard.tsx:21`) + detail (`ArticleHeader.tsx:15`) = `t('categories.<key>')`; vi/en parity OK; nhãn khớp spec (VI mockup, EN theo R-09a).
- [x] typecheck + lint PASS (device); build PASS (evidence builder).

## Responsive Checklist Gate
Diff UI chỉ đổi **nội dung text** trong `Badge` (nhãn i18n) và chuỗi ngày; không đổi class/layout/CSS.
- Layout: OK — hàng badge+ngày ở `PostCard` là `flex flex-wrap ... justify-between gap-3`; nhãn dài nhất "Câu chuyện khách hàng"/"Practical applications" + ngày `08 Th10, 2026` sẽ xuống dòng thay vì tràn ở 375px (CSS math: flex-wrap). `ArticleHeader` badge nằm riêng 1 dòng trong `max-w-[720px]`.
- Typography/Spacing: N/A (không đổi). Media: N/A. Touch/Interaction: N/A (badge không tương tác). Viewport/A11y: N/A; `<time dateTime={post.date}>` giữ ISO.
- Residual risk: chưa xem bằng browser thật ở 375/768/1280 (không có môi trường) — rủi ro thấp vì layout không đổi.

## Skill gates
- Surgical diff (karpathy): OK — mọi dòng trace về Task 01 (type, loader, util, 8 frontmatter, i18n, 2 badge). Không refactor lân cận. `categories.all` + `readingTime` + `BLOG_CATEGORIES` (thứ tự chip) là phần chuẩn bị cho Task 02–03 đã ghi trong scope Task 01 → không coi là orphan.
- Ponytail/over-engineer: OK — không thêm dependency/test framework; util nhỏ.
- aislop: skip, `aislop` không cài trên device/không mạng.
- oxlint (anti-slop): skip, oxlint not configured (không có `.oxlintrc*`, không có binary).
- ocr (open-code-review): skip, ocr not installed.
- semgrep: skip, không cài; soát tay: không có input người dùng, không `dangerouslySetInnerHTML` mới, không secret.
- AI-readable: OK — 0/≥3 indicators (tên rõ, hàm ≤10 dòng, `WORDS_PER_MINUTE` đặt tên thay magic number, comment nêu WHY).
- ai-friendly-web: OK — `public/llms.txt`, `src/app/robots.ts`, `src/app/sitemap.ts` tồn tại; diff không đổi sitemap/robots.
- blitzstrike: N/A (không phải auth/API/input).
- UI craft-floor (impeccable): N/A — không đổi visual ngoài text nhãn.

## Verdict: ✅ PASS

## Summary
Thay đổi đúng spec R-09 (format ngày VI mới, tính theo phần ISO, không lệch TZ) và R-09a §Kiểu dữ liệu/§Thời gian đọc/§Blast radius;
mọi consumer của `Post`/`formatPostDate`/`post.category` đã kiểm và không vỡ. Chỉ còn vài điểm MINOR không chặn.

## Findings

### ✅ Good
- `formatPostDate` đọc trực tiếp `YYYY-MM-DD` + EN dùng `Date.UTC` + `timeZone:'UTC'` → loại bỏ lỗi lệch ngày theo TZ server/browser (kiểm 2 TZ cực).
- Validate category bằng type guard ngay tại loader, thông báo lỗi có đường dẫn file.
- `PostFile = Omit<Post,'readingMinutes'>` tách rõ dữ liệu frontmatter vs dữ liệu tính toán.

### Issues
- **[MINOR]** `src/lib/blog/categories.ts:4` + `src/content/types.ts:216` — danh sách 6 key khai báo 2 lần; `satisfies readonly BlogCategory[]` không bắt thiếu phần tử (thêm key vào union mà quên mảng → `isBlogCategory` từ chối, build fail "unknown category" khó hiểu).
  Fix đề xuất: khai báo mảng là nguồn duy nhất và derive `type BlogCategory = (typeof BLOG_CATEGORIES)[number]` (để mảng ở `src/content/` hoặc import type ngược), hoặc thêm kiểm tra exhaustive.
- **[MINOR]** `src/lib/format/date.ts:11-13` / `src/lib/content/posts.ts:17` — không validate định dạng `date`. Chuỗi sai (vd `2026-10`) giờ ra im lặng `NaN Th...`/`Invalid Date` thay vì throw như `Intl.format(new Date('bad'))` trước đây; `date:` không quote trong YAML → gray-matter trả `Date` object → `.slice` TypeError khi render (dạng lỗi này có sẵn từ trước ở `localeCompare`).
  Fix đề xuất: trong `toPost` assert `typeof file.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(file.date)` và throw kèm filePath (fail lúc build, giống key category).
- **[MINOR]** `src/lib/content/posts.ts:26` — filePath trong lỗi dựng từ `file.slug` chứ không phải tên file thật; nếu thiếu `slug` sẽ ra `undefined.mdx`, nếu slug ≠ tên file thì sai đường dẫn. Pattern có sẵn từ trước (ngoài scope) — đề xuất task riêng: `loadMdxDirectory` trả kèm `fileName`.
- **[MINOR]** `src/lib/content/posts.ts:11` — `estimateReadingMinutes` được `export` nhưng chỉ dùng nội bộ; có thể bỏ `export` (hoặc giữ nếu Task 02 cần) — nit.

### 💡 Suggestions (optional)
- Task 03 nhớ reconcile ví dụ ngày trong design-spec Screen 11 (đã ghi ở Doc impact của task).

## Verdict Reasoning
0 CRITICAL, 0 MAJOR, 4 MINOR. typecheck + lint PASS (tự chạy trên device), build PASS theo evidence builder, AC đều đạt và đã kiểm độc lập
(format ngày qua node ở 2 timezone, parity i18n, reading time, consumer của shared type/util). → PASS.
