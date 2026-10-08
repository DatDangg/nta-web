# Review — feature/nta-website · layer 2 · task 07 (round 2)

Agent: reviewer

## Review level

**STRICT**

## Reason

- Task là **task cuối Layer 2** → ảnh hưởng điều kiện đóng layer/phase.
- Diff đụng **shared pipeline / shared component / shared resource** (risk đỏ):
  - `src/lib/content/render-mdx.tsx` — shared MDX renderer (mọi consumer MDX).
  - `src/components/mdx/index.tsx` — shared MDX element mapping (whitelist toàn bộ MDX).
  - `src/i18n/messages/{vi,en}.json` — catalog i18n dùng chung 2 locale.
  - `src/app/[locale]/layout.tsx` — `metadataBase` **áp cho mọi trang** (blast radius toàn site).
- Rework #2 thêm **client boundary mới** (`BlogFilter` + `Suspense`/`useSearchParams`) → đụng
  routing/navigation/prerender-manifest (SSG). Đúng nhóm "shared service/hook/component/... navigation".
- Vẫn không có trigger `dangerouslySetInnerHTML` với MDX không sanitize (MDX qua `next-mdx-remote/rsc`;
  chỉ JSON-LD đã escape `<`), nhưng các lý do trên đủ để STRICT.

## Blast radius

- `src/app/[locale]/layout.tsx` — `metadataBase` (mọi route mọi locale); OG/absolutize URL site-wide.
- `src/lib/content/render-mdx.tsx` + `src/components/mdx/index.tsx` — MDX pipeline dùng chung
  (blog hiện tại; case-studies/solutions nếu dùng MDX về sau).
- `src/app/[locale]/blog/page.tsx`, `src/app/[locale]/blog/[slug]/page.tsx`, `src/components/blog/*` —
  route public 2 locale (VI không prefix, EN `/en/...`), prerender-manifest/SSG.
- `src/i18n/messages/{vi,en}.json` — `blog.*` (additive; không xoá/đổi key cũ).
- SEO surface: canonical/hreflang/OG/JSON-LD cho `/blog` + `/blog/[slug]` 2 locale.
- Không đụng DB/API/auth/tenant/payment (`db_tool: none` → bỏ qua migration gate).

## Verify commands + result

| Command | Kết quả |
|---|---|
| `npm run lint` | **PASS** — `✖ 1 problem (0 errors, 1 warning)`. Warning `@next/next/no-img-element` tại `src/components/mdx/index.tsx:4` (MINOR-4, non-blocking). |
| `npm run typecheck` | **PASS** — `tsc --noEmit`, không output. |
| `npm run build` | **PASS** — Next.js 15.5.27, 43 static pages. `/[locale]/blog` và `/[locale]/blog/[slug]` đều `● (SSG)`. **Không còn warning `metadataBase`** (MAJOR-3 fixed). Chỉ còn 1 lint warning `<img>`. |
| `test_command` | `null` (project-config) → **skip, no test framework**. |
| `npx aislop scan --changes --json` | **Score 87/100 (Healthy, ≥80)** nhưng exit code 1 do 3 error (xem Gate) — 2 false positive + 1 out-of-diff. |
| `npx oxlint` | **skip, oxlint not configured** — `package.json` không có dep/config oxlint. |
| `ocr --version` | **skip, ocr not installed** (kế thừa round 1). |

### Static / SSG evidence (bắt buộc cho MAJOR-1)

- `.next/prerender-manifest.json` `routes` chứa **cả `/vi/blog` (line 364) và `/en/blog` (line 340)** →
  route list **vẫn SSG**, KHÔNG rớt khỏi prerender-manifest. (Cũng có `/vi|/en/blog/{first-steps,learning-content,responsible-ai,digital-workflows}`.)
- `.next/server/app/vi/blog.html` → **match `blog/first-steps`** (list có trong static HTML, server-rendered,
  không client-only).
- `.next/server/app/vi/blog/first-steps.html`:
  - Share link nonempty: `href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fntasolution.vn%2Fblog%2Ffirst-steps"`,
    LinkedIn tương tự → **MAJOR-2 fixed**.
  - `<meta property="og:image" content="https://ntasolution.vn/images/blog/first-steps-cover.svg"/>` →
    **MAJOR-3 fixed** (không localhost).
  - canonical `https://ntasolution.vn/blog/first-steps` + hreflang `vi/en/x-default` đúng, **không double `/en`**.

## Đối chiếu Acceptance Criteria (`tasks/nta-website/layer-2-task-07.md`)

| AC | Kết quả |
|---|---|
| List 2 locale: grid đúng bp, `<time>` locale, pagination hoạt động | **PASS** — grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` (`BlogFilter.tsx:26` + fallback `page.tsx:42`) khớp 1/2/3 cột; pagination đọc `?page=`, slice 9, clamp, `Pagination currentPage={page}` (`BlogFilter.tsx:16-33`). `<time>` list do `PostCard` (Layer 1, ngoài scope). |
| Chi tiết: MDX render (heading/list/ảnh/link), prose ≤720px | **PASS** — `next-mdx-remote/rsc`, h1→h2 (`mdx/index.tsx:8`), `max-w-[720px]` (`[slug]/page.tsx:48`). |
| ShareBar: 3 nút `aria-label` + copy toast `role="status"` | **PASS** — 3 control `min-h-11` + `aria-label`; `<span role="status">` (`ShareBar.tsx:21-25`). |
| Slug sai → 404; 0 bài → empty state copy đúng design | **PASS** — `notFound()` khi `!post`/locale sai; `EmptyState` `blog.empty` + link home (`page.tsx:36-39`). |
| Không `dangerouslySetInnerHTML` với input không qua pipeline MDX an toàn | **PASS** — MDX qua RSC; chỉ JSON-LD, đã `JSON.stringify(...).replace(/</g,'\\u003c')` (`[slug]/page.tsx:57`). |
| Metadata/JSON-LD per post + hreflang; check commands pass | **PASS** — metadata per post + canonical/hreflang; JSON-LD Article (headline/datePublished/author có điều kiện/image=cover); lint/typecheck/build PASS; **metadataBase fixed**. |

## Findings

### [MAJOR-1] ✅ FIXED — pagination `?page=` hoạt động, route list vẫn SSG

- **File:** `src/components/blog/BlogFilter.tsx:13-33`, `src/app/[locale]/blog/page.tsx:31-44`.
- **Bằng chứng:** `BlogFilter` (`'use client'`) đọc `useSearchParams().get('page')`, `PAGE_SIZE=9`,
  clamp `Math.min(requestedPage, Math.max(1, totalPages))`, `slice((page-1)*9, page*9)`, truyền
  `currentPage={page}`. Edge case xử lý đúng: thiếu param → `Number(null)=0` → page 1; `NaN`/`2.5` →
  `Number.isInteger` false → page 1; `999` → clamp về totalPages. `Pagination` cập nhật URL qua
  `router.push(\`${pathname}?${params}\`)` (`Pagination.tsx:28-32`).
- **Không regression SSG:** `.next/prerender-manifest.json` có `/vi/blog` + `/en/blog`; `vi/blog.html`
  chứa `blog/first-steps`. `Suspense` fallback server render trang 1 (pattern task-06) → route giữ `● (SSG)`.
- **Lưu ý:** với 4 bài/locale, `totalPages=1` → pagination ẩn; logic >9 chỉ kiểm bằng code inspection
  (không có browser/data >9) → ghi Residual risk.

### [MAJOR-2] ✅ FIXED — ShareBar không đọc `window` khi render; share URL nonempty trong SSG

- **File:** `src/components/blog/ShareBar.tsx:6-24`, `src/app/[locale]/blog/[slug]/page.tsx:53`.
- **Bằng chứng:** `pageUrl` truyền từ server (`${origin}${locale==='en'?'/en':''}/blog/${slug}`);
  không còn `typeof window`/`window.location.href` trong render. Static HTML chứa URL đầy đủ
  `https%3A%2F%2Fntasolution.vn%2Fblog%2Ffirst-steps` cho cả Facebook + LinkedIn → không hydration
  mismatch, link share no-JS đúng.

### [MAJOR-3] ✅ FIXED — `metadataBase` set, OG resolve `https://ntasolution.vn`, hết build warning

- **File:** `src/app/[locale]/layout.tsx:8-10`.
- **Bằng chứng:** `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ntasolution.vn')`.
  `npm run build` **không còn** warning `metadataBase ... using "http://localhost:3000"`. Static HTML
  detail: `og:image = https://ntasolution.vn/images/blog/first-steps-cover.svg`. `grep metadataBase src`
  → chỉ 1 vị trí (không conflict).

### [MINOR-4] MDX `<img>` — lint warning còn, thiếu `width/height`/`aspect-ratio`

- **File:** `src/components/mdx/index.tsx:4`.
- **Bằng chứng:** `npm run lint` warning `@next/next/no-img-element` vẫn còn. Đã thêm `loading="lazy"` +
  `w-full h-auto` (giảm CLS phần nào, `{...props}` passthrough cho phép MDX tự truyền `width/height`).
  Vẫn không có `aspect-ratio` mặc định → CLS nếu MDX không khai kích thước. **Non-blocking** (warning).
- **Fix gợi ý:** thêm disable comment có lý do + note, hoặc chuyển `next/image`.

### [MINOR-5] ✅ FIXED — `ShareBar` thêm `role="group"`; phát sinh advisory mới

- **File:** `src/components/blog/ShareBar.tsx:21,25`.
- `aria-label` trên `<div>` giờ có `role="group"` → được expose. aislop advisory mới
  `jsx-a11y/prefer-tag-over-role` cho `role="group"`/`role="status"` (warning style-policy).
  `role="status"` là **AC bắt buộc** → giữ; không chặn.

### [MINOR-6] ✅ FIXED — breakpoint grid list đổi `sm:` → `md:`

- **File:** `src/components/blog/BlogFilter.tsx:26` (+ fallback `page.tsx:42`): `md:grid-cols-2 lg:grid-cols-3`
  → khớp design (1 / ≥768 2 / ≥1024 3).

### [MINOR-7] ✅ FIXED — bỏ param `locale` không dùng trong `RelatedPosts`

- **File:** `src/components/blog/RelatedPosts.tsx:5` — chỉ còn `{ posts }`; call site `[slug]/page.tsx:55`
  không truyền `locale`.

### [MINOR-8] ~ PARTIAL — metadata list dùng `t()` (đã i18n), nhưng description hơi dài

- **File:** `src/app/[locale]/blog/page.tsx:19-22`.
- **Bằng chứng:** title `t('title')` → VI "Tin tức \| NTA", EN "Blog \| NTA" (đúng design);
  `description = t('metadataDescription')`. VI ≈172 ký tự, EN ≈190 ký tự → vượt nhẹ khoảng 150–160 của
  design §1.8 (bị SERP truncate). **Non-blocking.**

### [MINOR-9] (mới, do rework) — `BlogFilter` nhận cả `body` MDX → payload client phình

- **File:** `src/components/blog/BlogFilter.tsx:10` (prop `posts: Post[]`), `src/content/types.ts:40-48`
  (`Post.body: string` bắt buộc), `src/lib/content/posts.ts:5-9` (`getAllPosts` trả full `Post` gồm `body`),
  `src/app/[locale]/blog/page.tsx:43` (`posts` truyền thẳng vào client component).
- **Bằng chứng:** trước rework, `blog/page.tsx` là server component render trực tiếp → `body` ở lại server.
  Sau rework, toàn bộ `Post[]` (gồm `body` MDX của **mọi** bài) được serialize vào RSC payload gửi browser,
  dù list chỉ cần `slug/title/date/category/excerpt/cover` và `body` không hề render ở list.
- **Đánh giá:** nội dung blog là public nên không phải data leak; đây là **performance/payload** (đi ngược
  tinh thần "lazy-load"/R-09) và phình theo số bài. Quy mô hiện tại nhỏ (4 bài/locale) → **MINOR**, không
  chặn PASS. Tuy nhiên đây là hệ quả **mới** của rework nên cần ghi nhận.
- **Fix gợi ý:** truyền shape nhẹ (`posts.map(({ body, ...card }) => card)`) hoặc type `PostCardData`
  cho `BlogFilter`.

### [MINOR-10] (mới) — origin hardcode trùng + `PAGE_SIZE` literal lặp

- **File:** `src/app/[locale]/blog/page.tsx:13` và `src/app/[locale]/blog/[slug]/page.tsx:13` cùng
  `const origin = 'https://ntasolution.vn'` (aislop advisory `ai-slop/hardcoded-url`). Trong khi
  `metadataBase` dùng `NEXT_PUBLIC_SITE_URL` → canonical/OG có thể lệch nếu env khác domain.
  Nên tách 1 config chung (`NEXT_PUBLIC_SITE_URL`) để đồng bộ.
- **File:** `src/app/[locale]/blog/page.tsx:31` dùng literal `9` trong khi `BlogFilter.tsx:13` có
  `PAGE_SIZE = 9` → magic number lặp. Nên export/import chung hằng số.

### Ghi nhận ngoài scope (không tính FAIL)

- `PostCard` `<time dateStyle:'medium'` (Layer 1) — round 1 đã đề xuất task riêng; không đổi ở vòng này.
- `role="status"`/`role="group"` aislop advisory (xem MINOR-5) — by-design theo AC.
- `robots.txt`/`sitemap.xml`/`llms.txt` — thuộc Layer 4 task-01 (xem Gate).

## Responsive Checklist Gate

Áp dụng (project có `ui:` + diff đụng UI). Không có môi trường browser → xác minh bằng CSS math + class Tailwind.
Widths tham chiếu: **375 / 768 / 1280** (breakpoints config `[640,768,1024,1280,1536]`).

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout — no horizontal scroll | **OK** | Container `mx-auto max-w-container px-4 sm:px-6 lg:px-8` (`page.tsx:41`); grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` → 375:1 cột, 768:2 cột, 1280:3 cột. `w-full`, không width cố định gây tràn. |
| Layout — mobile-first (min-width) | **OK** | Chỉ dùng variant `sm:`/`md:`/`lg:` (min-width), không `max-*`. |
| Layout — grid auto-fit/minmax vs cột cố định | **OK (note)** | Cột cố định theo breakpoint (không `auto-fit`) nhưng design Screen 10 chốt đúng 1/2/3 cột → chấp nhận; không overflow. |
| Typography — rem, heading fluid, spacing scale | **OK** | Token Tailwind rem-based (`text-sm`, `text-display`, `text-h2`); không `px` font-size. |
| Media — max-width/height auto/aspect-ratio/srcset | **OK (MINOR-4)** | `PostCard` dùng `next/image` + `sizes/width/height` ✅. MDX `ArticleImage` có `w-full h-auto` (chống tràn) + `loading="lazy"`; không `aspect-ratio` mặc định nhưng `{...props}` cho phép MDX truyền `width/height`. Không overflow → không tính FAIL gate; phần tối ưu còn lại là MINOR-4. |
| Touch — ≥44×44px | **OK** | Share links/button `min-h-11` (44px); Pagination `min-h-11 min-w-11`. |
| Touch — nav mobile | **N/A** | Nav/hamburger thuộc shell Layer 1, ngoài diff. |
| Viewport/A11y — không `100vh`, reduced-motion, không che lỗi | **OK** | Diff không dùng `100vh`; share/pagination không `overflow-hidden`. Motion thuộc shell. |

→ **Không có mục responsive nào FAIL.**

## Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| aislop (`--changes`) | **OK (note)** | Score **87 ≥ 80** (Healthy). Exit 1 do 3 error: 2 `ai-slop/hallucinated-import` (`server-only`, `mdx` tại `render-mdx.tsx:1,4`) là **false positive** (build/typecheck resolve qua transitive `next`/`next-mdx-remote`); 1 `security/dangerously-set-innerhtml` tại `layout.tsx:32` là **out-of-diff** (script literal tĩnh `classList.add('js')`, không input người dùng). Không chặn PASS. |
| oxlint (anti-slop) | **skip, oxlint not configured** | `package.json` không có oxlint dep/config → không có error mới cần chặn. |
| ocr (open-code-review) | **skip, ocr not installed** | `ocr --version` exit 127 (kế thừa round 1). Optional, không chặn PASS. |
| AI-readable | **OK** | Không ≥3 indicator: tên self-descriptive (`BlogFilter`, `ArticleHeader`, `ShareBar`), hàm ngắn (<50), file ≤300 (`BlogFilter` 36 dòng, `render-mdx` 8 dòng, `mdx/index` 20 dòng), `PAGE_SIZE` named const. Trừ MINOR-10 (literal 9 lặp) — dưới ngưỡng FAIL. |
| AI-friendly web | **N/A (ngoài scope task này)** | `robots.txt`/`sitemap.xml`/`llms.txt` thuộc Layer 4 task-01 (SEO). Task-07 chỉ 2 route blog; không tính FAIL cho task này (đã đạt read-cap nên không kiểm tra lại file — xem Residual risk). |
| blitzstrike pentest | **N/A** | Public content, không auth/API input; không môi trường pentest. |

## Verdict

**✅ PASS**

- 3 MAJOR round 1 **đã fix thật** và **đã tự verify bằng artifact build** (manifest + static HTML), không
  tin lời builder.
- **Không có regression mới:** canonical/hreflang/JSON-LD, i18n 2 locale, single `<main>`
  (`layout.tsx:38`), no `dangerouslySetInnerHTML` MDX — đều giữ nguyên; list route vẫn `● SSG`.
- Chỉ còn **MINOR** (MINOR-4, MINOR-8 partial, MINOR-9/10 mới) — không CRITICAL/MAJOR → đủ điều kiện PASS.
- Bug task: **N/A** (đây là feature task).

## Residual risk / Blocked

- **Không có môi trường browser** → pagination `?page=2` và copy-link toast chưa click-through thật;
  xác minh bằng code logic + artifact SSG. Với 4 bài/locale, `totalPages=1` nên nhánh >9 chưa được chạy
  end-to-end.
- **Vượt read-cap STRICT (25)** thêm 2 tool để kiểm tra client payload (`posts.ts` + `types.ts`) → phát
  hiện MINOR-9. Các kiểm tra còn lại (file layout gốc, robots/sitemap/llms, kích thước HTML) **chưa thực hiện**.
- aislop 2 error `hallucinated-import` là false positive — cân nhắc cập nhật `.aislop/config.yml`
  `imports.provided` để tránh nhiễu.
- `metadataBase` dùng `NEXT_PUBLIC_SITE_URL` nhưng canonical/OG hardcode origin ở 2 page (MINOR-10) —
  nếu env production khác `ntasolution.vn` sẽ lệch; nên đồng bộ 1 nguồn.

## Đề xuất cho builder (không blocking)

1. (MINOR-9) Truyền shape nhẹ (bỏ `body`) vào `BlogFilter` để tránh ship toàn bộ MDX của mọi bài.
2. (MINOR-10) Gom `origin` + `PAGE_SIZE` về 1 config/hằng chung; ưu tiên `NEXT_PUBLIC_SITE_URL`.
3. (MINOR-4) Xử lý `<img>` MDX (aspect-ratio/width-height hoặc `next/image`).
4. (MINOR-8) Rút gọn `metadataDescription` VI/EN về ~150–160 ký tự.
