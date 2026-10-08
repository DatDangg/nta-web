# Review — feature/nta-website · layer 2 · task 07 (round 1)

Agent: reviewer

## Review level

**STRICT**

## Reason

- Task expected `NORMAL`, và trigger đỏ nêu riêng (MDX render qua `dangerouslySetInnerHTML` **không sanitize**)
  **KHÔNG** xảy ra: MDX render bằng `next-mdx-remote/rsc` (`src/lib/content/render-mdx.tsx:1,3,7`), chỉ có
  `dangerouslySetInnerHTML` cho JSON-LD và đã harden (`JSON.stringify(...).replace(/</g,'\\u003c')`,
  `src/app/[locale]/blog/[slug]/page.tsx:57`).
- Tuy nhiên escalate lên STRICT vì diff đụng **shared pipeline / shared component / shared resource**:
  - `src/lib/content/render-mdx.tsx` (shared MDX renderer — giờ nhận `components`; mọi consumer MDX dùng chung).
  - `src/components/mdx/index.tsx` (shared MDX element mapping — whitelist render toàn bộ MDX).
  - `src/i18n/messages/{vi,en}.json` (`blog.*` — catalog i18n dùng chung 2 locale).
  - Đây là **task cuối Layer 2** → ảnh hưởng điều kiện đóng layer/phase.
  Các mục này nằm trong danh sách risk đỏ "shared service/hook/component/... navigation" của reviewer rules.

## Blast radius

- `src/lib/content/render-mdx.tsx` — shared MDX renderer: đổi signature (thêm `components?` optional) → mọi
  trang render MDX bị ảnh hưởng (hiện tại blog detail; tương lai case-studies/solutions nếu dùng MDX).
- `src/components/mdx/index.tsx` (mới) — whitelist element MDX (h1→h2, img, a, list...). Lỗi ở đây ảnh hưởng
  mọi bài MDX.
- `src/i18n/messages/{vi,en}.json` — `blog.*` (additive; xác nhận không xoá/đổi key cũ trong `blog`).
- `src/app/[locale]/blog/page.tsx`, `src/app/[locale]/blog/[slug]/page.tsx` + `src/components/blog/*` — route
  public 2 locale (VI không prefix, EN `/en/...`).
- SEO surface: canonical/hreflang/OG/JSON-LD cho `/blog` và `/blog/[slug]` 2 locale.
- Không đụng DB/API/auth/tenant/payment. `db_tool: none` → bỏ qua migration gate.

## Verify commands + result

| Command | Kết quả |
|---|---|
| `npm run lint` | **PASS (1 warning, 0 error)**. `@next/next/no-img-element` warning tại `src/components/mdx/index.tsx:4`. |
| `npm run typecheck` | **PASS** (`tsc --noEmit`, không output). |
| `npm run build` | **PASS**. 43 static pages. Blog routes `● (SSG)`: `/[locale]/blog` → `/vi/blog`, `/en/blog`; `/[locale]/blog/[slug]` → `/vi/blog/{first-steps,learning-content,responsible-ai,...}` (4 locale VI + 4 EN). Có **1 build warning**: `metadataBase property in metadata export is not set ... using "http://localhost:3000"`. |
| `test_command` | `null` (project-config) → **skip, no test framework**. |
| `npx aislop scan --changes --json` | **Điểm 91/100 (Healthy, ≥ 80) nhưng exit code 1** do 2 error `ai-slop/hallucinated-import` (xem Gate). |
| `ocr --version` | `command not found` → **skip, ocr not installed**. |
| `oxlint` | Không có oxlint trong `package.json` / không có config → **skip, oxlint not configured**. |

Static HTML evidence:
- `.next/server/app/vi/blog.html` + `.next/server/app/en/blog.html` chứa tham chiếu slug bài viết
  (`blog/first-steps|learning-content|responsible-ai`) → list **có trong static HTML**, không client-only
  (khác MAJOR task-06). `blog/page.tsx` là server component, `PostCard` không `'use client'` → render server-side.
- canonical/hreflang đúng trong HTML: VI `https://ntasolution.vn/blog` (canonical + hreflang vi + x-default),
  EN `https://ntasolution.vn/en/blog` (canonical + hreflang en). Không double `/en`.

## Responsive Checklist Gate

Áp dụng (project có `ui:` + diff đụng UI). Không có môi trường browser → xác minh bằng CSS math + class Tailwind.

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout — no horizontal scroll | **OK** | Container `mx-auto max-w-container px-4 sm:px-6 lg:px-8`; grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (`blog/page.tsx:40-41`). 375→1 cột, 768→2 cột, 1280→3 cột; ảnh `w-full`; không width cố định gây tràn. |
| Layout — mobile-first (min-width) | **OK** | Dùng variant `sm:`/`lg:` (min-width), không `max-*`. |
| Layout — grid auto-fit/minmax vs cột cố định | **OK (có ghi chú)** | Dùng cột cố định theo breakpoint (không `auto-fit`). Design Screen 10 chỉ định đúng 1/2/3 cột → chấp nhận; không overflow. |
| Typography — rem, heading fluid, spacing scale | **OK** | Dùng token Tailwind (`text-sm`, `text-display`, `text-h2`) rem-based; không `px` cho font-size. |
| Media — ảnh max-width/aspect/srcset | **PARTIAL** | `PostCard` dùng `next/image` + `sizes`/`width`/`height` (`PostCard.tsx:19`) ✅. MDX `ArticleImage` (`mdx/index.tsx:4`) dùng `<img class="w-full h-auto">` nhưng **không `width/height`/`aspect-ratio`** → nguy cơ CLS; không `srcset` (xem Findings MINOR-4). |
| Touch — ≥44×44px | **OK** | Share links/buttons `min-h-11` (=44px, `ShareBar.tsx:19-21`); Pagination `min-h-11 min-w-11` (`Pagination.tsx:36-43`). |
| Touch — nav mobile | **N/A** | Nav/hamburger thuộc shell Layer 1, ngoài diff. |
| Viewport/A11y — không `100vh`, reduced-motion, không che lỗi | **OK** | Diff không dùng `100vh`; share/pagination không overflow-hidden. Motion thuộc shell, ngoài diff. |

→ Không có mục responsive nào FAIL. (Điểm Media PARTIAL là MINOR, không đủ FAIL gate.)

## Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| aislop (`--changes`) | **OK (có note)** | Score **91 ≥ 80**. 9 warning style/policy + 2 error `hallucinated-import` ở `render-mdx.tsx` (`server-only`, `mdx`). Đây là **false positive**: cả hai resolve (transitive của `next`/`next-mdx-remote`) — `npm run build`/`typecheck` PASS. Không chặn PASS. |
| oxlint (anti-slop) | **skip, oxlint not configured** | Không có dependency/config oxlint. Không có error mới cần chặn. |
| ocr (open-code-review) | **skip, ocr not installed** | `ocr --version` → exit 127. Optional, không chặn PASS. |
| AI-readable | **OK** | Không có indicator ≥3: tên file/hàm self-descriptive, hàm ngắn (mdx mapping 1 dòng/component, `render-mdx.tsx` 8 dòng, `Pagination` <50 dòng), `PAGE_SIZE` là named const (không magic number), không comment WHAT. |
| AI-friendly web (llms.txt/robots/sitemap) | **N/A (ngoài scope task này)** | Thuộc Layer 4 task-01 (SEO — sitemap/robots/llms.txt). Task-07 chỉ 2 route blog. Không tính FAIL cho task này; theo dõi ở Layer 4. |
| blitzstrike pentest | **N/A** | Public content, không auth/API input; không môi trường pentest. |

## Findings

### [MAJOR-1] Pagination không hoạt động — `?page=` bị bỏ qua, list render toàn bộ bài viết

- **File:** `src/app/[locale]/blog/page.tsx:12,29-30,42,44`
- **Bằng chứng:** Component **không nhận `searchParams`**; `const totalPages = Math.ceil(posts.length / PAGE_SIZE)`
  nhưng render `posts.map(...)` **không slice theo trang**; `<Pagination currentPage={1} totalPages={totalPages} />`
  **hardcode `currentPage={1}`**. Với >9 bài: `?page=2` không đổi nội dung, mọi bài nằm ở trang 1, nút phân trang
  vô tác dụng. (`PostCard` chỉ hiển thị tất cả.) Với nội dung hiện tại 4 bài/locale → `totalPages=1` nên pagination
  bị ẩn (thỏa "hidden ≤9") nhưng logic phân trang không được cài.
- **Vi phạm:** Acceptance Criteria "pagination hoạt động (`?page=`, pageSize 9)" + R-09 (pagination/lazy-load) +
  design Screen 10 "Pagination (pageSize 9)".
- **Fix đề xuất:** Nhận `searchParams: Promise<{ page?: string }>`; parse page (mặc định 1, clamp 1..totalPages);
  `const paged = posts.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)`; truyền `currentPage={page}` vào `Pagination`;
  (tuỳ chọn) `notFound()` khi page ngoài khoảng. Cập nhật test/manual khi có >9 bài.

### [MAJOR-2] ShareBar — hydration mismatch + share URL sai trong static HTML (SSG)

- **File:** `src/components/blog/ShareBar.tsx:9-10`
- **Bằng chứng:** `const pageUrl = typeof window === 'undefined' ? '' : window.location.href;` chạy **trong render**.
  SSG prerender (`window` undefined) → HTML tĩnh chứa `...facebook.com/sharer/sharer.php?u=` và
  `...linkedin.com/...?url=` **rỗng**; client hydrate dùng URL thật → **React hydration mismatch** (React 19 báo
  lỗi/attribute mismatch), và link share trong HTML prerender/no-JS bị hỏng.
- **Fix đề xuất:** Không đọc `window` khi render. Khởi tạo state `url=''`, set trong `useEffect(() =>
  setUrl(window.location.href), [])`, hoặc tính href trong `useEffect`; hoặc truyền URL bài viết từ server
  (canonical) xuống component.

### [MAJOR-3] Thiếu `metadataBase` → OG image của blog detail resolve về `http://localhost:3000`

- **File:** `src/app/[locale]/blog/[slug]/page.tsx:30` (`openGraph: { images: [post.cover] }`); root cause:
  **không file nào trong `src/` set `metadataBase`** (grep `metadataBase` trong `src` → no matches).
- **Bằng chứng:** `npm run build` warning: `metadataBase property in metadata export is not set ... using
  "http://localhost:3000"`. Vi phạm design §1.8 (`metadataBase = https://ntasolution.vn`) + R-21 (OpenGraph ảnh
  OG 1200×630). OG image blog detail sẽ trỏ localhost ở production.
- **Fix đề xuất:** Set `metadataBase: new URL('https://ntasolution.vn')` trong metadata của layout gốc/locale
  layout. Lưu ý: đây là gap **xuyên suốt** (không do file diff trực tiếp gây), nhưng task-07 là nơi thêm
  `openGraph.images` làm lộ warning → nên fix ở layout (hoặc chuyển owner sang Layer 4 task-01 SEO audit).

### [MINOR-4] MDX `<img>` — lint warning, thiếu kích thước/optimize

- **File:** `src/components/mdx/index.tsx:4` (`ArticleImage`).
- **Bằng chứng:** `npm run lint` warning `@next/next/no-img-element`; ảnh không có `width/height`/`aspect-ratio`
  → nguy cơ CLS, không tối ưu LCP/bandwidth (R-22). **Không blocking** (warning, build PASS).
- **Đánh giá:** mapping MDX cần nhận ảnh arbitrary nên `<img>` đôi khi hợp lý, nhưng nên `loading="lazy"` +
  `aspect-ratio`/`width/height` hoặc dùng `next/image`. Nếu cố ý dùng `<img>`, thêm disable comment có lý do +
  note trong Docs.

### [MINOR-5] `aria-label` đặt trên `<div>` không có role (a11y no-op)

- **File:** `src/components/blog/ShareBar.tsx:18`
- **Bằng chứng:** `<div ... aria-label={t('share')}>` — `aria-label` trên phần tử generic không được expose.
- **Fix:** `role="group"` trên div, hoặc bọc bằng `<section aria-labelledby>`/`<nav>`.

### [MINOR-6] Breakpoint grid list dùng `sm` (640) thay vì `md` (768)

- **File:** `src/app/[locale]/blog/page.tsx:41` (`sm:grid-cols-2`).
- **Bằng chứng:** Design Screen 10 quy định base 1 cột, `md ≥768` 2 cột, `lg ≥1024` 3 cột. Code cho 2 cột từ
  640px → 640–767px hiển thị 2 cột (lệch design). Không gây tràn/vỡ.
- **Fix:** đổi thành `md:grid-cols-2 lg:grid-cols-3` để khớp responsive table. (`RelatedPosts.tsx:11` cũng dùng
  `sm:grid-cols-2` — design Screen 11 không chốt md cho related nên có thể giữ.)

### [MINOR-7] Param `locale` không dùng trong `RelatedPosts`

- **File:** `src/components/blog/RelatedPosts.tsx:5`
- **Bằng chứng:** aislop `eslint/no-unused-vars` — `locale` destructured nhưng không dùng (`PostCard` tự
  `useLocale()` bên trong). `npm run lint` của Next không báo (khác cấu hình) nhưng đây là dead param.
- **Fix:** bỏ prop `locale` khỏi `RelatedPosts` (và call site `[slug]/page.tsx:55`).

### [MINOR-8] Metadata list hardcode + description ngắn hơn spec

- **File:** `src/app/[locale]/blog/page.tsx:19-20`
- **Bằng chứng:** title/description hardcode theo `locale` thay vì dùng `t()`; description ~60 ký tự, design §1.8
  yêu cầu 150–160 ký tự. Không sai chức năng nhưng lệch chuẩn SEO/i18n.

### Ghi nhận ngoài scope (không tính FAIL cho task này)

- **`PostCard` `<time>` dùng `dateStyle:'medium'`** (`src/components/card/PostCard.tsx:20`, Layer 1): với VI có
  thể ra "8 thg 10, 2026" thay vì `08/10/2026` như review focus mong đợi. `ArticleHeader` (trong task này) đã
  format đúng (`ArticleHeader.tsx:8`). Đề xuất task riêng để đồng bộ format ngày list.
- Không thấy tài liệu hoá "Gap 6" trong repo; canonical/hreflang en dùng đúng 1 prefix `/en` → **không double
  `/en`** (từ HTML build).

## Kết luận về Acceptance Criteria

| AC | Kết quả |
|---|---|
| List 2 locale: grid bp, `<time>` locale, pagination hoạt động | **FAIL** — grid OK, `<time>` detail OK (list do PostCard layer-1), **pagination không cài (MAJOR-1)** |
| Detail: MDX render (heading/list/ảnh/link), prose ≤720px | **PASS** — `next-mdx-remote/rsc`, h1→h2, `max-w-[720px]`; lint warning `<img>` (MINOR-4) |
| ShareBar: 3 nút `aria-label` + copy toast `role="status"` | **PARTIAL** — đủ 3 nút + aria-label + `role="status"`; nhưng hydration/URL sai (MAJOR-2) |
| Slug sai → 404; 0 bài → empty state copy đúng design | **PASS (code-level)** — `notFound()`; EmptyState `blog.empty` + link home (`page.tsx:35-38`) |
| Không `dangerouslySetInnerHTML` với MDX không an toàn | **PASS** — MDX qua RSC; chỉ JSON-LD (đã escape `<`) |
| Metadata/JSON-LD per post + hreflang; check commands pass | **PARTIAL** — JSON-LD Article (headline/datePublished=ngày thật/author có điều kiện/image=cover, không bịa), hreflang 2 chiều OK; **MAJOR-3 metadataBase**. lint/typecheck/build PASS |

## Verdict

**❌ FAIL**

Lý do: còn MAJOR (pagination không hoạt động — AC bắt buộc; ShareBar hydration/URL sai; thiếu metadataBase làm
OG blog trỏ localhost). CRITICAL: không có. Bug task: N/A (đây là feature task).

## Residual risk / Blocked

- Đã đạt cap tool đọc (STRICT = 25) → không kiểm tra thêm file layout gốc (xác nhận `<main>`/`metadataBase`
  trực tiếp) và không đối chiếu số lượng content blog (suy từ output build: 4 bài/locale).
- Không có môi trường browser → Responsive Gate xác minh bằng CSS math, chưa xác minh pixel thật.
- Không đọc được tách biệt phần "visible HTML" vs "RSC flight payload" trong file HTML 1 dòng; kết luận
  server-rendered dựa trên code (server component + SSG ●) + grep slug khớp trong HTML.
- `robots.txt`/`sitemap.xml`/`llms.txt` chưa xác minh (thuộc Layer 4 task-01) — ngoài scope task này.
- aislop 2 error `hallucinated-import` là false positive (build/typecheck resolve) — cần cân nhắc cập nhật
  `.aislop/config.yml` `imports.provided`.

## Đề xuất cho builder (FAIL loop)

1. Cài pagination thật (`searchParams` + slice + `currentPage`).
2. Sửa ShareBar tránh đọc `window` khi render (useEffect hoặc URL từ server).
3. Set `metadataBase` (layout) để OG blog resolve `https://ntasolution.vn`.
4. (MINOR, cùng lượt) bỏ param `locale` unused `RelatedPosts`; thêm `role="group"` cho ShareBar;
   cân nhắc `md:grid-cols-2` cho list; xử lý `<img>` MDX (lazy + aspect-ratio hoặc next/image).
