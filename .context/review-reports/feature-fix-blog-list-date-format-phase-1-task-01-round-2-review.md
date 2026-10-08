# Review — feature fix-blog-list-date-format · phase-1-task-01 · round 2 (independent)

Agent: reviewer

> **Reviewer độc lập round 2** — xác nhận/thay thế inline self-review round 1
> (`...phase-1-task-01-round-1-review.md`) do env subagent depth limit. Đây là review độc lập
> do subagent `reviewer` thực hiện. Không sửa source.

## Scope
- Task: `tasks/feature-fix-blog-list-date-format/phase-1-task-01.md`
- Change (archived): `spec/changes/archive/2026-10-09-fix-blog-list-date-format.md` (C-L2-1 MED)
- Commit: `edb5c4f`
- Diff code: `src/lib/format/date.ts` (new), `src/components/cards/PostCard.tsx`,
  `src/components/blog/ArticleHeader.tsx` + `SPECIFICATIONS.md` / `spec/CHANGELOG.md` /
  `spec/test-scope/current.json` / `spec/updates/2026-10-09-fix-blog-list-date-format.md`

## Review level
**STRICT**

## Reason
Chạm **shared component** `PostCard` (dùng ở `BlogFilter`, `RelatedPosts`, `blog/page.tsx` SSG
fallback) + `ArticleHeader` (blog detail) → theo `AGENTS.md` Reviewer rules & `.agent/FEATURE_WORKFLOW.md`
§6: shared component → STRICT bắt buộc. Thêm nữa đụng luồng SSG blog (prerender) và a11y `<time>` (R-24).

## Blast radius
- **Blog list** `/blog` + `/en/blog` — `PostCard` trong `BlogFilter` + SSG fallback (`blog/page.tsx`).
- **Blog detail** `/blog/[slug]` — `RelatedPosts` (mount `PostCard`) + `ArticleHeader`.
- **SSG/prerender** — route `● /[locale]/blog`, `● /[locale]/blog/[slug]`.
- **Không chạm**: `CaseStudyCard` (year-only, design S8); `BlogFilter`/`RelatedPosts`/`blog/page.tsx`
  (chỉ nhận thay đổi gián tiếp qua `PostCard`).

## Verify commands + result
| Command | Result |
|---|---|
| `npm run lint` | ✅ PASS (exit 0; 1 warning pre-existing ở `src/components/mdx/index.tsx` — ngoài scope, không phải lỗi mới) |
| `npm run typecheck` | ✅ PASS (exit 0, `tsc --noEmit` no output) |
| `npm run build` | ✅ PASS (exit 0; `● /[locale]/blog` → `/vi/blog`,`/en/blog`; `● /[locale]/blog/[slug]` 8 paths; 43/43 static pages) |
| `test` | skip — `test_command: null` (chưa cấu hình test framework; `db_tool: none` → bỏ migration gate) |

> Ghi chú tooling: reviewer agent chỉ allow các verify command trong profile; compound/`echo` command bị
> deny nên phần static-HTML được kiểm bằng `Grep`/`Read` (read-only) thay vì shell — không ảnh hưởng kết luận.

## Bắt buộc verify — kết quả (từng mục)

### 1. `src/lib/format/date.ts` + không còn inline Intl cho post date
- ✅ Util `formatPostDate(isoDate, locale)` dùng `localeTag` {vi→`vi-VN`, en→`en-US`} +
  `dateOptions` {vi: `{day:'2-digit',month:'2-digit',year:'numeric'}`, en: `{month:'short',day:'numeric',year:'numeric'}`}.
  → VI `08/10/2026`, EN `Oct 8, 2026` (đúng design S11 `.context/design-spec.md:487`).
- ✅ `Grep "dateStyle|Intl\.DateTimeFormat" src/` → **2 match, cả 2 trong `src/lib/format/date.ts`**
  (chính util). `PostCard.tsx` / `ArticleHeader.tsx` **không còn** `dateStyle`/inline `Intl`.
- ✅ `git show edb5c4f -- src/` xác nhận `ArticleHeader` bỏ inline ternary `Intl.DateTimeFormat`,
  `PostCard` bỏ `new Intl.DateTimeFormat(locale, { dateStyle: 'medium' })` + biến `date` chết.

### 2. Static HTML list + detail (không regression)
- ✅ `.next/server/app/vi/blog.html` chứa `08/10/2026`.
- ✅ `.next/server/app/en/blog.html` chứa `Oct 8, 2026`.
- ✅ `.next/server/app/vi/blog.html` **không còn** `thg 10` (format cũ `dateStyle:'medium'` đã hết).
- ✅ Detail không regression: `.next/server/app/vi/blog/first-steps.html` chứa `08/10/2026` +
  `<time dateTime>`; `.next/server/app/en/blog/first-steps.html` chứa `Oct 8, 2026`.

### 3. SSG giữ
- ✅ `.next/prerender-manifest.json` có `/vi/blog` (line 220) + `/en/blog` (line 196), kèm 8 detail path
  (`/vi|/en/blog/first-steps|learning-content|responsible-ai|digital-workflows`).
- ✅ `.next/server/app/vi/blog.html` chứa slug bài (`first-steps`/`learning-content`/`responsible-ai`).
- ✅ `npm run build` output: blog list/detail đều là `● (SSG)` — không rớt prerender.

### 4. Không đụng ngoài scope + a11y
- ✅ `git show edb5c4f -- src/` chỉ 3 file: `date.ts` (new), `PostCard.tsx`, `ArticleHeader.tsx`.
  **`CaseStudyCard` không bị chạm** (year-only giữ nguyên).
- ✅ `<time dateTime={post.date}>` còn ở cả 2 surface: `PostCard.tsx:20` + `ArticleHeader.tsx:17` (R-24).

### 5. Verify commands
- Xem bảng trên. `test_command: null` → skip có lý do.

### 6. Spec delta
- ✅ `SPECIFICATIONS.md` frontmatter `spec_version: 1.0.0 → 1.0.1`, `updated_at: 2026-10-09`.
- ✅ `spec/CHANGELOG.md` line 9: `1.0.1 | 2026-10-09 | PATCH | Làm rõ R-09 ... | scope v3`.
- ✅ `spec/test-scope/current.json`: `specVersion: "1.0.1"`, `scopeVersion: 3`, `trigger: feature-update`,
  `risk: low`, `specRefs: ["R-09"]` — khớp commit trailer.
- ✅ `SPECIFICATIONS.md` diff thêm clarify R-09 (list date = detail, 1 nguồn util) — đúng "PATCH làm rõ",
  không đổi route/scope requirement.
- ✅ `spec/updates/2026-10-09-fix-blog-list-date-format.md` tồn tại, ghi version bump + ảnh hưởng.

## Responsive Checklist Gate
Diff đụng component UI (`PostCard`, `ArticleHeader`) nhưng **chỉ đổi nội dung text của `<time>`**
(VI `8 thg 10, 2026` → `08/10/2026` ngắn hơn; EN độ dài không đổi). **Không đổi CSS/layout/markup cấu trúc.**

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout (no h-scroll, mobile-first, grid) | N/A | Không đổi class/layout; container `<time>` nằm trong `flex flex-wrap` sẵn có (`PostCard.tsx:20`). Chuỗi VI **ngắn hơn** → không tạo overflow mới. |
| Typography/Spacing | N/A | Không đổi `font-size`/spacing; giữ `text-sm text-text-secondary`. |
| Media (img aspect-ratio/srcset) | N/A | Không đụng `<Image>`. |
| Touch/Interaction | N/A | `<time>` không interactive; touch target của card link không đổi. |
| Viewport/A11y | OK | `<time dateTime={post.date}>` giữ nguyên cả 2 surface (R-24); không dùng `100vh`; không `overflow:hidden` che lỗi. |

Không mục nào FAIL → gate không chặn PASS. Chưa có môi trường browser để render trực quan →
xem Residual risk (xác minh bằng static HTML + CSS math như trên).

## Skill gates
- **aislop**: `skip` — không có binary `aislop` trong `node_modules/.bin` (chưa cài); không chặn PASS.
- **oxlint (anti-slop)**: `skip, oxlint not configured` — không tìm thấy `.oxlintrc*`.
- **ocr (open-code-review)**: `skip, ocr not installed` — không có binary `ocr`.
- **AI-readable**: `OK` — `date.ts` 19 dòng, `formatPostDate` 1 dòng (<50), tên self-descriptive,
  data maps tách bạch, comment mô tả contract (không phải comment WHAT thừa). 0 AI-chaos indicator (ngưỡng FAIL = ≥3).
- **ai-friendly-web**: `N/A` — đây là task **modify format ngày** trên page public đã tồn tại, không thêm
  route/surface/crawler config. `llms.txt`/`robots.txt`/`sitemap.xml` là **hạng mục Phase DevOps (sau deploy,
  Phase 6 — chưa tới)** và là gap **pre-existing ngoài diff**. Ghi nhận đề xuất: DevOps phase phải bổ sung
  3 file này trước khi bàn giao (không tính FAIL cho task này).
- **blitzstrike (pentest)**: `skip` — không có binary/không môi trường pentest; task không phải auth/API input.

## Findings

### Blocking
Không có CRITICAL / MAJOR.

### Non-blocking / ghi nhận
1. **[MINOR]** `PostCard.tsx:15` — `useLocale() as Locale` cast `string → Locale` bỏ kiểm tra type/runtime.
   An toàn vì routing chỉ `vi`/`en` (`src/i18n/routing.ts`) và khớp convention sẵn có (`blog/page.tsx`).
   Đề xuất (ngoài scope task): helper `toLocale()`/type-guard dùng chung nếu muốn chặt hơn.
2. **[MINOR]** `date.ts:18` — `new Date(isoDate)` parse date-only ISO theo **UTC**; ở timezone âm (vd
   America) có thể lệch 1 ngày. Không phải regression (hành vi cũ tương đương) và server/site chạy VN (+07)
   → không ảnh hưởng thực tế. Ghi nhận residual, không chặn.
3. **[MINOR]** Hydration: `PostCard` (client) và `ArticleHeader` (server) cùng gọi `formatPostDate` với
   options numeric/short-month ổn định → Node/browser ICU đồng nhất cho vi-VN/en-US. Rủi ro mismatch thấp.

### Đối chiếu round-1 (independence)
Round-1 là inline self-review. Round-2 độc lập **xác nhận** kết luận round-1 và **không tìm thêm defect
blocking**. Kiểm tra độc lập bổ sung so với round-1: `thg 10` đã sạch khỏi list HTML; detail VI/EN vẫn đúng;
prerender-manifest đủ 8 detail path; spec_version/scopeVersion khớp commit trailer.

## Verdict
✅ **PASS**

Không còn CRITICAL/MAJOR; toàn bộ acceptance criteria của task (7/7) được xác minh độc lập:
format list = detail = design S11, 1 nguồn util dùng chung, `<time dateTime>` giữ, SSG giữ,
không chạm `CaseStudyCard`, lint/typecheck/build PASS, spec delta hợp lệ.

## Residual risk
- Không có môi trường browser → chưa render trực quan 375/768/1280; đánh giá qua static HTML + CSS math
  (diff không đổi layout nên rủi ro thấp).
- `ai-friendly-web` (llms.txt/robots.txt/sitemap.xml) là gap pre-existing → **phải** xử lý ở Phase DevOps
  (Phase 6), không phải blocker task này.
- Date-only ISO parse UTC → off-by-one tiềm ẩn ngoài TZ VN (thấp, không regression).
- Reviewer agent bash bị giới hạn theo allowlist verify command; phần còn lại xác minh bằng Grep/Read.
