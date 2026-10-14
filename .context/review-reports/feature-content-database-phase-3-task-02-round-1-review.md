# Agent: reviewer — feature-content-database · phase-3-task-02 · round 1

- **CR:** CR-031 · R-16, R-27 (spec 4.2.0, cập nhật P3-T02 hướng C) · Task: `tasks/feature-content-database/phase-3-task-02.md`
- **Review level:** STRICT
- **Reason:** shared registry (slug/listing/home/overview) dùng bởi mega menu, trang chủ, 4 listing, mọi `[slug]`, sitemap; đổi chiến lược render SSG → on-demand/động cho toàn bộ `[locale]` — có hiệu lực ngay trên prod (chế độ `file`) khi push.
- **Blast radius:** `src/lib/content/registry.ts` (mới) → `src/app/[locale]/{layout,page,products,products/[slug],case-studies,case-studies/[slug],solutions/ai,solutions/ai/[slug],solutions/enterprise,solutions/enterprise/[slug],blog/[slug]}`, `src/app/sitemap.ts`, `src/components/home/CaseStudyHighlight.tsx`, `src/lib/content/{products,solutions,solution-listing,solutions-menu,slug}.ts` (mega menu Header), `src/content/listings.ts` (`detailTiles` thành hàm thuần). Ngoài scope đã loại trừ: `docs/content-bot/`, `spec/changes/2026-10-14-telegram-content-bot.md`, `.context/progress.json`, `.context/runs/*`.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm test` (không TEST_DATABASE_URL) | 64 tests: 63 pass, 0 fail, 1 skip (import/parity cần DB) |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — 0 error, 1 warning `<img>` có sẵn `src/components/mdx/index.tsx:25` (ngoài diff) |
| `npm run build` (cần `SWC_NATIVE_BINDING_CACHE=…`) | Không tự chạy — lệnh có tiền tố env không khớp allowlist của reviewer. Dựa evidence Builder (build PASS cả `file` và `db` không DATABASE_URL) → Residual risk |
| Parity registry db ↔ file (`TEST_DATABASE_URL`), crawl 79 URL, so HTML, TTFB, tắt DB | Không tự chạy (cần Postgres/server) — dựa evidence Builder (74 pass; status/Location/sitemap giống baseline) → Residual risk |
| `docker build --target builder` | Chưa ai chạy (Builder ghi rõ) → Residual risk, cần trước push |

## Kiểm theo trọng điểm
1. **Chế độ `file` giữ hành vi — OK.** Mọi getter `registry.ts` ở mode `file` trả đúng hằng TS cũ (`listingPages[locale]`, `FILE_REGISTRY` = `slug.ts`, `getFileHomeContent`). `detailTiles(meta)` giữ logic, chỉ đổi đầu vào. Thứ tự slug giữ (test file-mode deep-equal `["crm","hrm","lms","dentgo"]`). `getSolutionBySlug`/`getProductBySlug` vẫn chặn slug ngoài registry → `notFound` → 404; AI `[slug]` vẫn chặn slug sai nhóm (`isRegisteredSlug('ai', …)`); enterprise `[slug]` chặn bằng `solution.category` như cũ. Locale lạ: `generateStaticParams` layout = `[]` nhưng `hasLocale` vẫn 404. Redirect 301 ở `next.config.ts` không đổi. Không route nào đặt `dynamicParams = false` (grep) → `[]` + on-demand hợp lệ. Sitemap: cùng ROUTES + slug, chỉ thêm `force-dynamic`.
2. **Chế độ `db` — OK.** Build không chạm DB (không trang nội dung nào prerender; `getDb()` lazy). Lỗi DB: `store.ts` ném `[content-store]` (test `rejects` cho `getRegistrySlugs`/`getHomeContent`) → unstable_cache không lưu reject, trang không cache rỗng. `sort_order`: `content-read.ts` sắp sort_order (null cuối) rồi slug; `readKeyed` dựng Record theo thứ tự đó; `slug_registry` seed sort_order theo index trong nhóm → lọc theo group giữ thứ tự. Singleton thiếu → lỗi `[content-registry] Thiếu bản ghi …` rõ ràng.
3. **Call site cũ — OK.** Grep `src/`: không còn import `listingItems/listingPages/listingCtas/listingLabels/detailTiles` từ `@/content/listings`, `getHomeContent` từ `@/content/home`, `*Slugs`/`is*Slug`/`get*StaticParams` từ `slug.ts` ngoài `registry.ts`; chỉ còn import `type` (`ListingItemMeta`, `HomeContent`, `HomeSolutionCard`) và `isLocale`/`ratioToSize` (hàm thuần). Mọi getter async được `await`/gom `Promise.all`.
4. **Scope — OK.** Không có revalidate API (P3-T03), không đụng next-intl messages / company-info (P3-T04). `getSolutionOverview` chưa có call site nhưng nằm trong Scope #1 của task + được test parity → chấp nhận.

## Đánh giá 2 rủi ro được hỏi
- **Streaming metadata trên trang vi động — DEFECT (MAJOR, xem F1).** Next 15.5 chỉ chặn streaming cho UA khớp `HTML_LIMITED_BOT_UA_RE` (`node_modules/next/dist/shared/lib/router/utils/html-bots.js:15`): danh sách có Bingbot, facebookexternalhit, Twitterbot, WhatsApp… nhưng **không có** `coccocbot` (Cốc Cốc), `Zalo` (preview link Zalo), `TelegramBot` (preview Telegram — chính kênh CR-030), và Googlebot nhận bản streaming. Với các UA này `<title>`, `canonical`, `hreflang`, `og:*` có thể nằm trong `<body>` HTML gốc, chỉ được React hoist lên `<head>` khi chạy JS. Google bỏ qua `rel=canonical` ngoài `<head>` trong HTML thô; crawler không chạy JS thì mất metadata. Evidence Builder: db-mode 3/7 trang vi khác vị trí metadata; file-mode 7/7 giống — tức vị trí phụ thuộc thời điểm resolve metadata, không xác định (IO chậm / tải cao trên prod file-mode cũng có thể rơi vào body).
- **TTFB chế độ file p90 ~52 ms — KHÔNG phải defect theo spec.** R-16 (sửa P3-T02) đặt ngưỡng "TTFB local khi data cache hit ≤ 50 ms" theo median đo; file-mode median 34.6–45.2 ms đạt. Nhưng đây là hồi quy thật trên prod hiện tại (SSG 13–14 ms → động, đọc lại MDX mỗi request, CPU tăng) kéo dài tới phase 5 → MINOR F4 kèm đề xuất.

## Skill gates
- aislop: skip — không chạy (tránh tải gói qua npx trong phiên review); không chặn.
- oxlint (anti-slop): skip, oxlint not configured (không có `.oxlintrc*`).
- ocr (open-code-review): skip, ocr not installed.
- AI-readable: OK — `registry.ts` 80 dòng, hàm < 10 dòng, tên tự mô tả, comment nêu lý do; indirection trang → registry → store → content-read = 3 bước; decisions.md ghi chiến lược. 1 indicator nhẹ (hằng slug `'labels'`/`'home'` lặp, F3) < 3.
- ai-friendly-web: OK — sitemap giữ đủ 52 URL (evidence Builder), robots/llms không đổi; metadata cho crawler xem F1.
- blitzstrike: N/A (không endpoint/input mới).
- Responsive Checklist Gate: N/A — diff không đổi markup/CSS (chỉ nguồn dữ liệu props; HTML file-mode giống baseline).

## Findings
- **[CRITICAL]** không có.
- **[MAJOR] F1 — Metadata SEO (title/canonical/hreflang/og) có thể nằm ngoài `<head>` trên mọi trang vi render động** — gây ra bởi `src/app/[locale]/layout.tsx:43-45` (+ các `generateStaticParams` → `[]`, `src/app/sitemap.ts:7`) kết hợp cấu hình mặc định `next.config.ts` (không có `htmlLimitedBots`).
  Kịch bản: `coccocbot`/`Zalo`/`TelegramBot` (hoặc Googlebot ở lượt crawl HTML thô) GET `/solutions/ai/boxai` → HTML trả `<link rel="canonical">`, `hreflang`, `og:image` trong `<body>` → canonical bị bỏ qua, preview link không có ảnh/tiêu đề.
  Đề xuất: thêm vào `next.config.ts` `htmlLimitedBots: /.*/` (tắt streaming metadata hoàn toàn — metadata dùng cùng dữ liệu đã cache với page nên chi phí TTFB nhỏ) hoặc tối thiểu regex mở rộng `/Googlebot|coccocbot|Zalo|TelegramBot|bingbot|facebookexternalhit|.../i`. Re-verify: so HTML 7 trang mẫu ở **cả 2 chế độ** = baseline (metadata trong `<head>`), đo lại TTFB `/` và `/solutions/ai/boxai`.
- **[MINOR] F2 — Lookup registry tuần tự lặp** — `src/lib/content/solutions.ts:11` gọi `isRegisteredSlug('enterprise')` rồi `isRegisteredSlug('ai')` tuần tự; `src/app/[locale]/solutions/ai/[slug]/page.tsx:22,39` gọi thêm `isRegisteredSlug('ai')` trước `getSolutionBySlug` ở cả metadata lẫn page → ~6 lượt `unstable_cache` tuần tự/request ở db-mode (mỗi lượt là 1 lần đọc incremental cache, không có React `cache()` dedupe). Đề xuất: `getSolutionBySlug` dùng `Promise.all` cho 2 nhóm (hoặc 1 hàm `getRegistryGroup(slug)`), và/hoặc bọc getter registry bằng `React.cache`.
- **[MINOR] F3 — Đọc keyed không kiểm key bắt buộc + hằng slug lặp** — `src/lib/content/registry.ts:50,60,75` ép kiểu `as ListingPages/ListingCtas/SolutionOverview` không kiểm key (`enterprise|ai|products|caseStudies`): DB thiếu 1 bản ghi → `TypeError: Cannot read properties of undefined` ở trang thay vì lỗi `[content-registry]` rõ (trái tinh thần "thiếu bản ghi báo lỗi rõ"). `registry.ts:65,70` hardcode `'labels'`/`'home'` trùng `LISTING_LABELS_SLUG`/`HOME_SLUG` của `tools/db/file-source.ts` (drift risk; `tools/` bị dockerignore nên cần chuyển hằng vào `src/`, vd `src/db/content-rules.ts`). Đề xuất: helper `readKeyedRequired(collection, locale, requiredKeys)` ném `[content-registry] Thiếu …`; dùng chung hằng slug singleton.
- **[MINOR] F4 — Hồi quy TTFB/CPU trên prod chế độ `file`** — trang vi đổi SSG → render mỗi request, đọc lại MDX từ đĩa (không data cache) tới phase 5. Đạt ngưỡng R-16 (median ≤ 50 ms) nhưng p90 ~52 ms sát ngưỡng. Đề xuất (tuỳ chọn, rẻ): memo theo process cho đường đọc file (nội dung bất biến trong image) — hoặc chấp nhận và ghi rõ trong decisions.md + theo dõi TTFB prod sau deploy.
- **[MINOR] F5 — Chưa có bằng chứng `docker build --target builder`** cho thay đổi chính là hành vi build. Project-config yêu cầu dạng bằng chứng này; chạy trước khi push.

## Residual risk
- Reviewer không tự chạy build/crawl/so HTML/TTFB/parity DB/Docker (ngoài quyền) — dựa evidence Builder.
- `/en/<slug sai>` → 500 có sẵn (CR-026), ngoài scope.
- `/en` ISR on-demand: 404 của slug chưa có có thể vào route cache → slug mới thêm ở DB cần revalidatePath ở P3-T03 (ghi nhận cho P3-T03).
- Không bật `CONTENT_SOURCE=db` trước P3-T03 (data cache không revalidate) — đã ghi ở task.

## Verdict
❌ **FAIL** — 1 MAJOR (F1: streaming metadata làm canonical/hreflang/og có thể ra ngoài `<head>` cho crawler/preview quan trọng ở thị trường VN; fix 1 dòng `htmlLimitedBots` + re-verify HTML). F2–F5 MINOR, khuyến nghị sửa F3 cùng vòng; F5 bắt buộc có bằng chứng trước push.
