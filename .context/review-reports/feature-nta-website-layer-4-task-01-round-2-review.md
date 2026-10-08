# Review — feature/nta-website · layer-4-task-01 (round 2)

**Agent: reviewer**

- **Task:** `tasks/nta-website/layer-4-task-01.md` — SEO (sitemap/robots/JSON-LD/metadata audit + llms.txt)
- **Spec refs:** R-21, R-20, R-12, R-17 (robots không chặn AI); `.context/design-spec.md` §1.8
- **Review level:** `STRICT`
- **Reason:** Vẫn là diff đụng **metadata/hreflang/OG/JSON-LD trên toàn bộ route** (shared metadata
  contract cho mọi page + crawler-facing endpoints). Đây là round xác minh fix cho 2 MAJOR của round 1,
  cần đảm bảo không regression trên 12 route × 2 locale. Không có auth/DB/data mutation (blitzstrike N/A).
- **Round:** 2 (round 1: ❌ FAIL, 2 MAJOR).
- **Verdict:** ✅ **PASS**

---

## Blast radius

- Toàn bộ route public: `/`, `/about`, `/products`, `/case-studies[/slug]`, `/blog[/slug]`,
  `/solutions/{enterprise,ai}[/slug]`, `/contact` × 2 locale (`vi`, `en`): title/description/hreflang/OG/canonical.
- Crawler-facing: `/sitemap.xml`, `/robots.txt`, `/llms.txt`.
- JSON-LD: Organization/WebSite (layout), BreadcrumbList (trang con), Article (blog detail +
  case-study detail), ContactPage (`/contact`).
- Shared code: `src/lib/seo.ts` (nguồn domain + helper), `src/lib/seo/jsonld.ts`, `src/app/sitemap.ts`,
  `src/app/robots.ts`, `src/app/[locale]/layout.tsx`.

## Verify commands + result

- `npm run typecheck` / `npm run lint` / `npm run build`: **Blocked — `Permission denied: shell`**
  (thử 1 lệnh tổng hợp + 1 lệnh `file`, cả hai bị deny). Theo Tool Loop Guard: **không retry**.
  → Độ đúng của typecheck/lint/build + audit 43 HTML dựa vào báo cáo primary (không tự xác minh lại).
- Reviewer tự xác minh bằng **Read/Grep** (bằng chứng bên dưới):
  - **MAJOR-1 CLOSED** — `src/app/[locale]/blog/[slug]/page.tsx:26-30`: `generateMetadata` **không còn**
    key `openGraph` → thừa hưởng OG mặc định của layout (`layout.tsx:16-19`: `type: 'website'`,
    `siteName: 'NTA'`, `locale vi_VN/en_US`, `images: /images/og-default.png` raster 1200×630).
    `grep openGraph src/` = **1 match duy nhất** ở `layout.tsx:16` → không page nào override làm mất tag.
    Article JSON-LD `image` (dòng 41) = `/images/og-default.png` (raster, không còn SVG `post.cover`).
  - **MAJOR-2 CLOSED** — `grep ntasolution.vn src/` = **đúng 1** match: định nghĩa `BASE_URL`
    (`src/lib/seo.ts:4`, `process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ntasolution.vn'`).
    `src/lib/seo.ts` export `BASE_URL` + `localizedPath(locale, pathname)` + `createLocaleAlternates(pathname)`.
    Import `BASE_URL` ở: `jsonld.ts:1`, `sitemap.ts:6`, `robots.ts:2`, `layout.tsx:9`.
    `createLocaleAlternates`/`localizedPath` dùng ở **12/12 route có metadata** (grep `alternates:` = 12 match).
  - **Path prefix đúng** (không sai dấu `/` hay locale): helper `localizedSegments` strip
    `/^\/+|\/+$/`; detail page dùng `/case-studies/${slug}` (`case-studies/[slug]:27`),
    `/solutions/enterprise/${solution.slug}` (enterprise `[slug]:36`), `/solutions/ai/${slug}` (ai `[slug]:27`)
    → `localizedPath(locale, 'case-studies/x')` = `…/case-studies/x` (vi) / `…/en/case-studies/x` (en).
    Static page dùng không slash: `'about'`, `'products'`, `'blog'`, `'contact'`, `'solutions/enterprise'`,
    `'solutions/ai'`, `'case-studies'`; home dùng `''`.
  - **Regression title/desc**: 12/12 route khai `title` + `description` (home/page:30-31, about:33-34,
    products:26-27, blog:21-22, case-studies:22, contact:23-24, blog[slug]:27-28, case-studies[slug]:29-30,
    enterprise[slug]:39-40, ai[slug]:29-30, enterprise index:25, ai index:27). ✅
  - **Regression canonical**: 12/12 route có `canonical` (MINOR-1 round 1 đã đóng). ✅
  - **Regression hreflang**: `createLocaleAlternates` sinh `vi`/`en`/`x-default`(= vi) cho mọi route. ✅
  - **MINOR-5 home trailing slash**: home `createLocaleAlternates('')` → vi = `BASE_URL` (không `/`),
    en = `BASE_URL/en`, x-default = `BASE_URL`; khớp `sitemap.ts:22-23`. ✅
  - **MINOR-6**: home `page.tsx:29-33` không còn `title.template` (chỉ `title`/`description` string). ✅
  - **MINOR-2 case-study JSON-LD** (`case-studies/[slug]:45-49`): `@type: 'Article'`, **không còn**
    `additionalType`; `inLanguage: 'vi-VN'/'en-US'`. ✅
  - **MINOR-4** import trùng: `contact:10` và `blog/[slug]:13` nay import nhiều named export
    (`createBreadcrumbJsonLd, createContactPageJsonLd`) bằng **1 câu** `import`. ✅
  - **Sitemap** (`sitemap.ts`): `ROUTES` 8 mục + content slug; không `/api/*`; dùng `BASE_URL`; dạng URL
    home không `/` khớp hreflang. ✅
  - **Robots** (`robots.ts:5`): `{ userAgent: '*', allow: '/' }` + `sitemap` → không chặn AI crawler. ✅
  - **llms.txt** (`public/llms.txt`): non-empty, có domain + 9 link (Home/Enterprise/AI/Products/Case/About/
    Blog/Contact/English). ✅ Tồn tại `public/images/og-default.png`. ✅ (không đọc được kích thước binary
    do shell deny → residual.)
  - **404 noindex**: `src/app/[locale]/not-found.tsx:11` `robots: { index: false, follow: false }`. ✅
  - **Catch-all** `src/app/[locale]/[...rest]/page.tsx` → `notFound()`. ✅

## Responsive Checklist Gate

**N/A** — thay đổi round 2 chỉ gồm metadata export (`generateMetadata`/`buildMetadata`) + helper
`src/lib/seo.ts`; không đụng markup/CSS/layout/breakpoint. Điều kiện áp dụng (diff đụng UI) không thoả.

## Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| aislop | `skip, aislop not installed/configured` | Không có dependency/config trong `package.json`; shell deny nên không chạy CLI |
| anti-slop / oxlint | `skip, oxlint not configured` | Glob `.oxlintrc*`/`oxlint*` = none; `package.json` không có oxlint |
| ocr (open-code-review) | `skip, ocr not installed` | Không có CLI/config; shell deny |
| AI-readable | **OK** (indicator <3) | Magic-string domain nay chỉ còn 1 nơi (`seo.ts:4`); helper tên rõ nghĩa; file `seo.ts` 26 dòng; hàm <50 dòng; không comment WHAT; không indirection >3 bước |
| ai-friendly-web | **OK** | `llms.txt` ✅ + `robots` allow-all (không chặn GPTBot/ClaudeBot/CCBot) ✅ + `sitemap` ✅. `llms-full.txt` thiếu = khuyến nghị, ngoài AC |
| blitzstrike | `N/A` | Không có auth/API public/input surface trong diff |

## Findings

### 2 MAJOR round 1 — ĐÃ ĐÓNG

- **[MAJOR-1] CLOSED** — Blog detail bỏ `openGraph` override; thừa hưởng OG raster mặc định layout
  (`og:type`/`og:site_name`/`og:locale` không còn mất), Article JSON-LD `image` = raster. Bằng chứng:
  `blog/[slug]/page.tsx:26-30`, `layout.tsx:16-19`, grep `openGraph` = 1 match.
- **[MAJOR-2] CLOSED** — Domain gom về 1 nguồn `src/lib/seo.ts` (`BASE_URL`); mọi page dùng
  `createLocaleAlternates`/`localizedPath`; `jsonld.ts`/`sitemap.ts`/`robots.ts`/`layout.tsx` import
  `BASE_URL`. Bằng chứng: grep `ntasolution.vn` = 1 match (`seo.ts:4`).

### MINOR round 1 đã đóng: MINOR-1 (canonical), MINOR-2 (case-study JSON-LD), MINOR-4 (import trùng), MINOR-5 (trailing slash), MINOR-6 (`title.template`).

### Còn tồn (không chặn PASS)

- **[MINOR-3 — known/accepted]** `src/lib/seo/jsonld.ts:6`: `Organization.logo` = `og-default.png`
  (banner 1200×630) thay vì logo vuông/wordmark. Đã biết; cần asset logo vuông (đề xuất task riêng).
- **[MINOR — mới, không phải regression]** `src/app/[locale]/blog/[slug]/page.tsx:41`: Article JSON-LD
  `image` = `/images/og-default.png` là **URL tương đối**. Schema.org/Google khuyến nghị URL tuyệt đối.
  Đề xuất: dùng `localizedPath(locale, 'images/og-default.png')` hoặc `${BASE_URL}/images/og-default.png`.
  Mức MINOR (JSON-LD vẫn parse hợp lệ, không phá AC).
- **[Residual đã biết — task công bố, không FAIL]** desc detail page (blog/case/solution slug) lấy từ
  content có thể <150 ký tự; `sitemap` không `lastModified`.

## Verdict

✅ **PASS** — cả 2 MAJOR round 1 đã đóng thực sự (xác minh bằng đọc file + grep, không chỉ tin báo cáo);
5/6 MINOR round 1 đã fix, chỉ còn MINOR-3 (đã biết) + 1 MINOR mới không chặn. Không phát hiện regression
title/desc/hreflang/OG/canonical trên 12 route × 2 locale. Không còn CRITICAL/MAJOR.

**Residual risk / chưa xác minh:**
- Không re-run được `npm run typecheck`/`lint`/`build` (shell deny) → độ đúng type/build và audit
  43 HTML dựa hoàn toàn vào báo cáo primary.
- Chưa xác minh trực tiếp kích thước `public/images/og-default.png` (binary, shell deny).
- Chưa xác minh runtime render thật của `og:image`/hreflang (chỉ đọc code tĩnh).
