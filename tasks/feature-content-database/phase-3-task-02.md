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
