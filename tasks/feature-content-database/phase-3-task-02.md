# feature-content-database · phase-3-task-02 — Registry TS → DB; render không cần DB lúc build

- **CR:** CR-031 · spec R-16, R-27 (4.2.0)
- **Classification / Risk:** MODIFY (kiến trúc render + shared registry) · HIGH
  - Expected review level: **STRICT** (navigation, sitemap, generateStaticParams, ≈55 file import content)
  - Blast radius: `src/lib/content/slug.ts`, `src/content/{listings,home}.ts`, `src/content/solutions/overview.ts`, `solutions-menu.ts`, `solution-listing.ts`,
    `generateStaticParams` các route, sitemap, mega menu Header, trang chủ, 4 trang listing.
  - Doc impact: DESIGN. Decision impact: chiến lược render → decisions.md.

## Scope
1. Registry sync (`enterpriseSlugs`, `aiSlugs`, `productSlugs`, `listingPages/Items/Ctas/Labels`, `getHomeContent`, `solutionOverview`, `detailTiles`)
   → getter async đọc DB (`slug_registry` + collection tương ứng, theo `sort_order`). Hàm thuần (`ratioToSize`, `isLocale`) giữ nguyên.
2. **Chiến lược render (chốt bằng spike, ghi decisions.md):** build image ở CI **không** truy cập DB.
   Đề xuất: route `[slug]` → `generateStaticParams` trả `[]` + `dynamicParams` (render lần đầu theo yêu cầu rồi cache, làm mới qua tag);
   trang không tham số (home, listing, about, sitemap) → render theo request + data cache tag. Slug mới trong DB có route ngay;
   slug không tồn tại → 404 như cũ. Giữ redirect 301 trong `next.config.ts`.
3. `next build` khi **không có** `DATABASE_URL` → PASS; runtime có DB → trang đúng.
4. Đo TTFB trang chủ trước/sau (local): cache hit không tệ hơn quá 20% (R-16). Cả 2 chế độ cờ `file`/`db` build + chạy được.

## Acceptance
- **Chế độ `file` (trước khi push — chiến lược render đổi SSG → on-demand ngay cả khi chưa cutover):** crawl sitemap vi+en cùng status code như trước,
  so HTML trang mẫu, TTFB không vượt ngưỡng R-16.
- Build không cần DB; mọi route vi+en cùng status code như trước (200/404/301); sitemap đủ URL như trước. typecheck/lint/build PASS.

## Verification summary (Builder, 2026-10-14)
- **Quyết định render:** hướng C (user chọn) — `[locale]/layout` + mọi `[slug]` `generateStaticParams` → `[]`, `sitemap.ts` `force-dynamic`. `/en/...` ISR on-demand (HIT);
  trang vi render mỗi request trên data cache (Next 15.5 không cache ISR on-demand cho URL bị middleware rewrite `as-needed`). Chi tiết + phương án loại: `.context/decisions.md`.
- Env máy local: `next build/start` cần `SWC_NATIVE_BINDING_CACHE=C:\Users\datda\.swc-native-cache` (lỗi quyền thư mục cache native @swc/core của next-intl — môi trường, không phải code).

| Lệnh / kiểm tra | Kết quả |
|---|---|
| `npm test` (không TEST_DATABASE_URL) | 64 tests: 63 pass, 0 fail, 1 skip |
| `TEST_DATABASE_URL=… npm test` (Postgres 16 Docker tạm `127.0.0.1:55433`) | **74 pass, 0 fail** — gồm parity loader + registry db deep-equal file (vi/en) |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — 0 error, 1 warning `<img>` có sẵn (`src/components/mdx/index.tsx:25`) |
| `npm run build` không DATABASE_URL, chế độ `file` | PASS |
| `npm run build` không DATABASE_URL, `CONTENT_SOURCE=db` | PASS (Generating static pages 8/8 — không trang nội dung nào prerender) |
| Crawl 79 URL (52 sitemap + 27 404/301/sai nhóm/locale lạ), chế độ file và db | status code + Location **giống baseline** (53×200, 3×301, 8×307, 10×404, 5×500 — 500 là `/en/<slug sai>` có sẵn CR-026); sitemap 52 URL giống |
| So HTML 7 trang mẫu (bỏ chunk hash + comment buildId) | file: 7/7 giống. db: 4/7 giống; 3 trang vi (`/solutions/ai`, `/blog/first-steps`, `/solutions/enterprise/crm`) khác **chỉ vị trí metadata** (streaming metadata của render động; nội dung/title/canonical có đủ) |
| TTFB median cache hit (baseline 13.4–14.0 ms) | db: `/` 25.4–31.1, `/solutions/ai/boxai` 23.7–25.9, `/en` 13.7–14.0 ms. file: `/` 34.6–45.2, `/solutions/ai/boxai` 34.7–41.3, `/en` 14.0–14.5 ms — đều ≤ 50 ms (R-16 mới) |
| Cache hit không truy vấn DB | 180 request (6 URL × 30) → `pg_stat_database.xact_commit` +2 (gồm 1 query đo); dừng container DB → `/`, `/solutions/ai/boxai`, `/en`, `/blog`, `/products`, `/about`, `/sitemap.xml` vẫn 200, slug lạ vẫn 404 |

## Verification — round 2 (sửa theo review round 1 FAIL: F1–F5)
- F1: `next.config.ts` `htmlLimitedBots: /.*/` → metadata trong `<head>` cho mọi UA (kiểm UA node + Googlebot: title/canonical/hreflang/og:image đều trước `</head>`).
- F2: `getSolutionBySlug` + trang AI `[slug]` gộp lookup registry bằng `Promise.all` (không tuần tự).
- F3: `readKeyedRequired` (registry.ts) kiểm key bắt buộc listing_page/listing_cta/solution_overview → `[content-registry] Thiếu bản ghi …`; `HOME_SLUG`/`LISTING_LABELS_SLUG` chuyển vào `src/db/content-rules.ts`, `tools/db/file-source.ts` re-export. Test thiếu key (DB).
- F4: memo đọc MDX theo process ở chế độ file khi `NODE_ENV=production` (src/lib/content/load-mdx.ts).

| Lệnh / kiểm tra | Kết quả |
|---|---|
| `npm test` | 64 tests: 63 pass, 0 fail, 1 skip |
| `TEST_DATABASE_URL=… npm test` (Postgres 16 Docker tạm) | **75 pass, 0 fail** (+ test registry thiếu key) |
| `npm run typecheck` / `npm run lint` | PASS / 0 error, 1 warning `<img>` có sẵn |
| `npm run build` không DATABASE_URL — file / `CONTENT_SOURCE=db` | PASS / PASS (8/8 static, không trang nội dung nào prerender) |
| `docker build --target builder -t nta-web-buildcheck:tmp .` (F5) | **PASS** — next build trong node:22-slim, Generating static pages 8/8; đã `docker rmi` |
| Crawl 79 URL — file và db | status code + Location giống baseline; sitemap 52 URL giống |
| So HTML 7 trang mẫu — file và db | **7/7 giống baseline ở cả 2 chế độ**, `<head>` giống hệt (chỉ bỏ comment buildId, chunk hash và marker Suspense rỗng `<!--$--><!--/$-->`) |
| TTFB median/p90 cache hit (baseline 13.4–14.0) | db: `/` 34.6–35.3/39–46, `/solutions/ai/boxai` 34.2–34.8/39–40, `/en` 13.2–13.4 ms. file: `/` 34.2–34.3/40, `/solutions/ai/boxai` 33.8–34.2/38–40, `/en` 13.7–13.8 ms — ≤ 50 ms |
| Cache hit không truy vấn DB (db) | 180 request → `xact_commit` +2 (gồm query đo); dừng DB → 7 trang đã cache 200, slug lạ 404 |

## Residual risk
- Trang vi (prod chế độ file) đổi từ SSG sang render mỗi request: TTFB ~34 ms (p90 ~40) so với ~13.5 ms trước — đạt R-16 mới (≤ 50 ms), CPU server tăng so với SSG; theo dõi TTFB prod sau deploy.
- `htmlLimitedBots: /.*/`: metadata chặn flush head trên mọi request trang động (đổi lấy SEO đúng như bản SSG).
- Memo file: bản production giữ nội dung MDX trong RAM tới khi process restart (đúng vì src/content nằm trong image); objects được chia sẻ giữa request — code hiện không mutate (đã grep), mảng trả là bản sao.
- Data cache không `revalidate` → sửa DB chưa lên web cho tới P3-T03. Không bật `CONTENT_SOURCE=db` trước P3-T03.
- `getSolutionOverview` chưa có call site trong src. 5 URL `/en/<slug sai>` trả 500 có sẵn (CR-026), không đổi.

## Doc impact
- DESIGN (`docs/DESIGN.md` current-state: chiến lược render + registry DB) — dời P5-T01 reconcile. Decision: `.context/decisions.md` (CR-031 P3-T02).
