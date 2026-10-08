# Review — feature/nta-website · layer-4-task-01 (round 1)

**Agent: reviewer**

- **Task:** `tasks/nta-website/layer-4-task-01.md` — SEO (sitemap/robots/JSON-LD/metadata audit + llms.txt)
- **Spec refs:** R-21, R-20, R-12; `.context/design-spec.md` §1.8
- **Review level:** `STRICT`
- **Reason:** Diff đụng metadata/hreflang/OG/JSON-LD **trên toàn bộ route** (shared metadata contract
  cho mọi page + search/LLM crawler), có **JSON-LD structured data**, và tái triển khai một helper SEO
  dùng chung (`src/lib/seo.ts`) — thuộc nhóm "shared contract dùng nhiều client". Không có auth/data
  mutation (nên không cần blitzstrike), nhưng mức ảnh hưởng rộng khiến STRICT hợp lý hơn NORMAL.
- **Round:** 1 (không có report layer-4 trước đó).
- **Verdict:** ❌ **FAIL** (2 findings MAJOR)

---

## Blast radius

- Toàn bộ route public (`/`, `/about`, `/products`, `/case-studies[/slug]`, `/blog[/slug]`,
  `/solutions/{enterprise,ai}[/slug]`, `/contact`) × 2 locale (`vi`, `en`): title/description/hreflang/OG.
- Crawler-facing endpoints: `/sitemap.xml`, `/robots.txt`, `/llms.txt`.
- JSON-LD: Organization/WebSite (layout mọi trang), BreadcrumbList (trang con), Article (blog detail +
  case-study detail), ContactPage (`/contact`).
- Shared code: `src/lib/seo.ts` (helper cũ) vs `src/lib/seo/jsonld.ts` (mới), `src/app/sitemap.ts`,
  `src/app/robots.ts`, `src/app/[locale]/layout.tsx`.

## Verify commands + result

- Shell bị deny trong session reviewer (`Permission denied: shell`) → **KHÔNG re-run được**
  `npm run lint` / `npm run typecheck` / `npm run build`. Ghi theo luật Tool Loop Guard: **Blocked**,
  không retry.
- Bằng chứng primary (được cung cấp, reviewer **không tự xác minh lại**): lint 0 error/1 warning
  pre-existing (`src/components/mdx/index.tsx` `<img>`), typecheck PASS, build PASS 43 static HTML;
  audit 43 HTML: title>60 = 0, desc>160 = 0, sitemap 42 URL không 404, JSON-LD parse error = 0,
  hreflang 3/trang public, 404 noindex.
- Reviewer đã tự kiểm bằng Read/Grep/Glob:
  - `src/app/sitemap.ts`: `ROUTES` 8 mục + blog 4 slug + case-studies 2 slug + solutions 7 slug = 21 path
    × 2 locale = 42 URL; slug parity vi/en đủ (`src/content/**` glob) → phủ đủ route, không `/api/*`. ✅
  - `src/app/robots.ts`: `{ userAgent: '*', allow: '/' }` + `sitemap` → không rule chặn
    GPTBot/ClaudeBot/CCBot. ✅
  - `public/llms.txt`: non-empty, có domain + 8 link chính. ✅
  - Mọi `page.tsx` đều export title + description + `alternates.languages {vi,en,x-default}` (grep:
    13 match `alternates:` phủ 11 route + sitemap). ✅
  - `src/app/[locale]/not-found.tsx`: `robots: { index: false, follow: false }`. ✅
  - **Không xác minh được:** kích thước thật `public/images/og-default.png` (1200×630) — binary, không
    đọc bằng Read; tin theo đo đạc primary (residual risk).

## Responsive Checklist Gate

**N/A** — diff chỉ thêm metadata export, `<script type="application/ld+json">` và component
`JsonLd.tsx` (render thẻ script, không có markup/style/route UI). Không đụng layout/CSS/breakpoint
→ bỏ qua gate theo điều kiện áp dụng.

## Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| aislop | `skip, aislop not installed/configured` | Không có dependency/config trong `package.json`; shell deny nên không chạy được CLI |
| anti-slop / oxlint | `skip, oxlint not configured` | Glob `.oxlintrc*`/`oxlint*` = none; `package.json` không có oxlint |
| ocr (open-code-review) | `skip, ocr not installed` | Không có CLI/config; shell deny |
| AI-readable | **OK** (1 indicator, <3) | Indicator: magic string `https://ntasolution.vn` lặp ≥6 file (xem MINOR-4). Không comment WHAT, hàm <50 dòng, không indirection sâu |
| ai-friendly-web | **OK** | llms.txt ✅ + robots cho phép AI ✅ + sitemap ✅ (skill gate: thiếu llms.txt/chặn AI mới FAIL). `llms-full.txt` thiếu = khuyến nghị, ngoài scope AC |
| blitzstrike | `N/A` | Không có auth/API public/input surface trong diff |

---

## Findings

### [MAJOR-1] Blog detail OG bị hỏng: `og:image` = **SVG** và override mất `og:type`/`og:site_name`/`og:locale`

- **File:** `src/app/[locale]/blog/[slug]/page.tsx:33`
  ```ts
  openGraph: { images: [post.cover] },
  ```
  với `post.cover` = `/images/blog/*-cover.svg` (xem `src/content/blog/vi/first-steps.mdx:7`).
- **Vấn đề 1 — định dạng ảnh:** `post.cover` là **SVG**. Facebook/LinkedIn/Twitter (og:image/twitter:image)
  chỉ hỗ trợ raster (PNG/JPEG/WEBP/GIF) — SVG không render → **8 trang blog detail mất ảnh social preview**.
  Vi phạm `.context/design-spec.md` §1.8: OG "ảnh OG 1200×630" (SVG không phải 1200×630).
- **Vấn đề 2 — shallow merge của Next.js:** Next **không deep-merge** metadata; `openGraph` ở page
  **thay thế toàn bộ** `openGraph` của layout (xác nhận doc Next `generateMetadata` §Merging +
  vercel/next.js#46434, #46899). Vì page chỉ khai `images`, các tag kế thừa từ layout bị **mất**:
  `og:type`, `og:site_name`, `og:locale` (vi_VN/en_US). Chỉ `og:title`/`og:description` được Next
  auto-fill lại. → blog detail không còn `og:locale` dù design §1.8 yêu cầu.
- **Fix đề xuất:** giữ ảnh OG raster 1200×630. Chọn 1 trong:
  1. Bỏ override `openGraph` ở blog detail để dùng OG mặc định (PNG) của layout; hoặc
  2. Thêm cover raster 1200×630 cho blog (`post.ogImage` mới) và **spread lại** các field bị mất:
     ```ts
     openGraph: { type: 'website', siteName: 'NTA',
       locale: locale === 'en' ? 'en_US' : 'vi_VN',
       images: [{ url: post.ogImage, width: 1200, height: 630 }] }
     ```
  Áp dụng cùng cách cho `image` trong Article JSON-LD nếu muốn dùng raster.

### [MAJOR-2] Bỏ qua helper SEO dùng chung + hardcode domain (regression G7/N3/MINOR-10)

- **File:** `src/lib/seo.ts:4,6` — `createLocaleAlternates()` và `BASE_URL`
  (`process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ntasolution.vn'`) **không được dùng ở đâu** (grep
  `createLocaleAlternates` chỉ match chính định nghĩa).
- Diff **tự viết lại** logic alternates + hardcode `https://ntasolution.vn` rải rác:
  `src/app/[locale]/page.tsx:31-37`, `about:34`, `contact:22-26`, `products:26`, `blog:15,24`,
  `blog/[slug]:16,32`, `case-studies:21`, `case-studies/[slug]:30`, `solutions/{enterprise,ai}/page.tsx`,
  `solutions/{enterprise,ai}/[slug]/page.tsx`, `src/lib/seo/jsonld.ts:1` (`SITE_URL`),
  `src/app/sitemap.ts:7` (`BASE_URL`), `src/app/robots.ts:4`, `src/app/[locale]/layout.tsx:13`.
- **Vấn đề:** vi phạm task scope "R-20 … (đối chiếu audit với Layer 0 task-02 helper)" và **regression**
  quyết định đã chốt trước đó — layer-0 task-06 G7/N3 + layer-2 task-07 MINOR-10 yêu cầu gom `origin`
  về 1 nguồn, ưu tiên `NEXT_PUBLIC_SITE_URL`. Nay domain nằm ở ≥6 file (formally 14 chỗ) → đổi domain
  phải sửa 6+ file, dễ lệch `metadataBase`/canonical/hreflang/sitemap.
- **Fix đề xuất:** dùng `createLocaleAlternates(path)` (hoặc `BASE_URL` từ `src/lib/seo.ts`) cho mọi
  route; `jsonld.ts`/`sitemap.ts`/`robots.ts` import cùng `BASE_URL` thay vì hằng riêng. Nếu cố ý cố
  định `metadataBase = https://ntasolution.vn` (theo AC/design), vẫn nên derive từ 1 hằng duy nhất.

### [MINOR-1] Thiếu `<link rel="canonical">` không nhất quán

- Có canonical: `blog/page.tsx:24`, `blog/[slug]:32`, `contact:26`.
- **Thiếu:** `page.tsx` (home), `about`, `products`, `case-studies`, `case-studies/[slug]`,
  `solutions/enterprise`, `solutions/enterprise/[slug]`, `solutions/ai`, `solutions/ai/[slug]`.
- Next **không** tự sinh canonical. Skill ai-friendly-web mục 5 liệt kê canonical trong meta bắt buộc.
  Không vi phạm AC trực tiếp (AC không nêu canonical) → MINOR; nên bổ sung qua helper chung.

### [MINOR-2] JSON-LD case-study detail dùng `Article` + `additionalType: CreativeWork`, `inLanguage` sai dạng

- **File:** `src/app/[locale]/case-studies/[slug]/page.tsx:44-48`
  ```ts
  '@type': 'Article', additionalType: 'https://schema.org/CreativeWork',
  ..., inLanguage: locale,   // 'vi'/'en' thay vì 'vi-VN'/'en-US'
  ```
- Task item 5 chỉ định `Article` cho **blog detail**; case-study không nằm trong list (Organization/
  WebSite/BreadcrumbList/Article/ContactPage). Schema vẫn parse hợp lệ nhưng `additionalType` trỏ về
  type cha (`CreativeWork`) là vô nghĩa và `inLanguage` sai dạng BCP-47. Mức: MINOR (không phá AC
  "JSON-LD hợp lệ"). Đề xuất: case-study dùng `@type: 'Article'` không `additionalType` (hoặc
  `CreativeWork`), `inLanguage: 'vi-VN'/'en-US'`; hoặc bỏ nếu không cần.

### [MINOR-3] `Organization.logo` trỏ OG banner thay vì logo

- `src/lib/seo/jsonld.ts:6`: `logo: ${SITE_URL}/images/og-default.png` (ảnh 1200×630 dạng banner).
  Schema.org `logo` kỳ vọng logo vuông/wordmark. MINOR.

### [MINOR-4] Magic string domain + import trùng module

- `https://ntasolution.vn` hardcode ≥6 file (đã nêu MAJOR-2) — 1 AI-chaos indicator.
- Import trùng cùng module: `contact/page.tsx:10,12` và `blog/[slug]/page.tsx:12,14` đều import 2 named
  export từ `@/lib/seo/jsonld` bằng 2 câu `import` riêng. Gộp 1 dòng. MINOR (style/DRY).

### [MINOR-5] Hreflang home lệch dạng URL (trailing slash)

- `page.tsx:33,35`: `vi`/`x-default` = `https://ntasolution.vn/` (có `/`), nhưng `sitemap.ts:22` sinh
  `https://ntasolution.vn` (không `/`) và `en` = `/en` (không `/`). Không thống nhất dạng URL home giữa
  hreflang và sitemap → MINOR.

### [MINOR-6] `title.template` ở home là dead config

- `page.tsx:29`: `title: { default, template: '%s | NTA' }`. Template ở **page** không áp cho route
  sibling (`/about`, …) — chỉ layout mới lan xuống; layout đã bỏ template (fix double-suffix). Nên bỏ
  `template` ở home cho khỏi gây hiểu nhầm. Không gây lỗi title (mọi route đều tự khai title đầy đủ).

### Ghi chú audit (không tính FAIL)

- **Residual đã biết (task công bố):** desc detail page (blog/case/solution slug) lấy từ content <150 ký
  tự; sitemap không `lastModified`. Chấp nhận — không FAIL.
- `Service`/`ItemList` JSON-LD (task item 5 "đã baseline ở Layer 2") **không tồn tại** trong `src/`
  (grep = none). Design §1.8 không yêu cầu → ghi nhận, không chặn.
- `llms-full.txt` vắng (skill khuyến nghị) — ngoài scope AC task-01 (chỉ yêu cầu `llms.txt`).
- 404 ngoài locale (layout `hasLocale` → `notFound()` khi không có `src/app/not-found.tsx` root) rơi về
  404 mặc định của Next; HTTP status 404 nên crawler không index. Không chặn.

## Verdict

❌ **FAIL** — còn 2 finding **MAJOR** (MAJOR-1 OG blog detail hỏng định dạng + mất tag OG do shallow
merge; MAJOR-2 bỏ helper chung/hardcode domain = regression). Phải fix MAJOR-1 & MAJOR-2 rồi review lại.

**Residual risk / chưa xác minh:**
- Không re-run được lint/typecheck/build (shell deny) → độ đúng của `title ≤60`/`desc ≤160`/build/43 HTML
  dựa hoàn toàn vào báo cáo primary.
- Kích thước `og-default.png` chưa xác minh trực tiếp.
