# Agent: reviewer — feature-content-database · phase-3-task-02 · round 2

- **CR:** CR-031 · R-16, R-27 · Task: `tasks/feature-content-database/phase-3-task-02.md` (Verification round 2)
- **Review level:** STRICT
- **Reason:** round 2 đổi config render toàn site (`next.config.ts` `htmlLimitedBots`), thêm memo process-level cho loader dùng chung (`load-mdx.ts`), đổi registry/solutions — vẫn là shared loader/navigation/SEO có hiệu lực prod.
- **Blast radius (round 2):** `next.config.ts` (mọi trang động), `src/lib/content/load-mdx.ts` (mọi loader MDX: posts/solutions/products/case-studies/about → mọi trang + sitemap + mega menu), `src/lib/content/{registry,solutions}.ts`, `src/app/[locale]/solutions/ai/[slug]/page.tsx`, `src/db/content-rules.ts`, `tools/db/{file-source,content-loaders.test}.ts`. Report round 1 giữ nguyên.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm test` | 64 tests: 63 pass, 0 fail, 1 skip (parity cần DB) |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — 0 error, 1 warning `<img>` có sẵn (`src/components/mdx/index.tsx:25`, ngoài diff) |
| `npm run build` | **Không chạy được trên môi trường reviewer** — `Failed to load native binding` khi nạp `next.config.ts` (lỗi môi trường SWC đã biết; lệnh kèm `SWC_NATIVE_BINDING_CACHE=` nằm ngoài allowlist). Dựa evidence Builder: build local + `docker build --target builder` PASS (task file dòng 55) → Residual risk |
| HTML/TTFB/parity DB | Không tự chạy (cần server/Postgres) — evidence Builder: metadata trước `</head>` cho UA node + Googlebot; TTFB median ~34 ms, p90 ≤ 46 ms cả 2 chế độ |

## Đóng finding round 1
| # | Trạng thái | Bằng chứng |
|---|---|---|
| F1 MAJOR streaming metadata | **Đóng** | `next.config.ts:9` `htmlLimitedBots: /.*/` → `app-page.js:232` `shouldServeStreamingMetadata(userAgent, nextConfig.htmlLimitedBots)` = false với mọi UA có giá trị → metadata blocking trong `<head>`. Builder kiểm HTML với UA thường + Googlebot. |
| F2 MINOR lookup tuần tự | **Đóng** | `solutions.ts:11` gom `isRegisteredSlug` ×2 + `getAllSolutions` trong `Promise.all`; trang AI `[slug]` gom `isRegisteredSlug`/`getSolutionBySlug`/`getDetailTiles` song song ở metadata và page. Hành vi 404 giữ: slug không thuộc nhóm `ai` hoặc `category !== 'ai'` → `notFound`. |
| F3 MINOR keyed thiếu key / hằng lặp | **Đóng** | `registry.ts:37-42` `readKeyedRequired` ném `[content-registry] Thiếu bản ghi …`; áp cho listing_page, listing_cta (cùng kiểu `Record<PageKey, …>` với listingPages trong `listings.ts:59,277` → dùng chung `LISTING_PAGE_KEYS` hợp lệ), solution_overview. `HOME_SLUG`/`LISTING_LABELS_SLUG` chuyển về `src/db/content-rules.ts`, `file-source.ts` re-export → 1 nguồn. |
| F4 MINOR TTFB file-mode | **Đóng** | memo `load-mdx.ts:28-42`; TTFB file `/` 34.2–34.3 ms (p90 40) vs round 1 34.6–45.2 (p90 ~52). |
| F5 MINOR Docker build | **Đóng** (theo evidence Builder) | task file dòng 55: `docker build --target builder` PASS, Generating static pages 8/8, đã `docker rmi`. |

## Kiểm memo MDX (`src/lib/content/load-mdx.ts:26-48`)
- **Chỉ file + production — OK.** Memo nằm trong `loadMdxFromFile`, chỉ gọi từ nhánh `getContentSource() === 'file'`; `NODE_ENV !== 'production'` → đọc thẳng đĩa (dev/test thấy sửa MDX ngay). `next build` cũng là production nhưng memo chỉ sống trong process build → vô hại.
- **Không rò sang db — OK.** Nhánh db dùng `getEntries` (data cache) như cũ; key memo `collection/locale` không chia sẻ với store. Cờ đổi giữa chừng không xảy ra (env đọc lúc chạy, đổi cần restart container → memo mới).
- **Lỗi không bị cache — OK.** `pending.catch(() => fileMemo.delete(key))` xoá promise bị reject; caller vẫn nhận reject qua `.then`; `.catch` gắn sẵn nên không có unhandled rejection. Không race: chỉ `set` khi key vắng, chỉ `delete` sau reject của chính promise đó (trong cửa sổ đó caller khác dùng lại promise reject cũ — chấp nhận được, đều nhận lỗi).
- **Không mutate dùng chung — OK (có điều kiện).** Trả bản sao mảng `[...records]` → `studies.sort(...)` (`case-studies/page.tsx:35`), `.sort` ở `posts.ts:27`, `CaseStudyHighlight.tsx:33` (sort trên `[...studies]`) không đụng mảng memo. Grep `src/` không thấy gán thuộc tính / `Object.assign` / `delete` / `push` trên record nội dung. Object record là tham chiếu chung (shallow copy) → xem MINOR N2.
- Map không giới hạn nhưng key hữu hạn (5 collection × 2 locale) → không leak.

## Kiểm `htmlLimitedBots: /.*/`
- Next 15.5 `app-page.js:233,248,481`: các nhánh khác dùng `isHtmlBot` chỉ có tác dụng khi `isRoutePPREnabled` (repo không bật PPR) → **không** đổi Suspense streaming/`shouldWaitOnAllReady`. Repo không có `loading.tsx` (glob `src/app/**/loading.tsx` rỗng) → không ảnh hưởng loading UI.
- Tác dụng phụ chấp nhận được: `<head>` chờ `generateMetadata` resolve trước khi flush (metadata dùng cùng dữ liệu đã cache với page; TTFB đo vẫn ≤ 50 ms). Trang `/en` ISR và trang static không đổi (HTML cache sẵn).
- Ngoại lệ: request **không có header User-Agent** vẫn nhận streaming (`app-page.js:232` `!userAgent ? true`) — xem MINOR N1.

## Regression mới
- Không thấy regression chức năng: 404/nhóm slug AI giữ; enterprise `[slug]` không đổi; listing/home/menu keys đầy đủ ở file-mode (file-mode không qua `readKeyedRequired`).
- Test round 2 (`tools/db/content-loaders.test.ts`) — các ca DB chỉ chạy khi có `TEST_DATABASE_URL`; reviewer không tự kiểm (Residual risk), Builder báo pass.

## Skill gates
- aislop: skip (không tải gói qua npx trong review). oxlint: skip, not configured. ocr: skip, not installed.
- AI-readable: OK — comment nêu lý do (memo, htmlLimitedBots), hàm ngắn; 1 indicator nhẹ (N3) < 3.
- ai-friendly-web: OK — metadata/canonical/hreflang/og trong `<head>` cho crawler (F1 đóng).
- blitzstrike: N/A. Responsive Checklist Gate: N/A (không đổi markup/CSS).

## Findings
- **[CRITICAL]** không có.
- **[MAJOR]** không có.
- **[MINOR] N1 — Request không có User-Agent vẫn nhận streaming metadata** (`node_modules/next/dist/build/templates/app-page.js:232`). Ảnh hưởng nhỏ (crawler thật luôn gửi UA). Không cần sửa; ghi nhận trong decisions.md nếu muốn.
- **[MINOR] N2 — Memo trả object record dùng chung (shallow copy)** — `src/lib/content/load-mdx.ts:41`. Hiện không có caller mutate (đã grep), nhưng code tương lai gán thuộc tính lên record sẽ rò giữa các request ở prod. Đề xuất: comment cảnh báo "record chỉ đọc" hoặc kiểu `readonly`/`Object.freeze` ở dev.
- **[MINOR] N3 — Comment lệch vị trí** — `src/db/content-rules.ts:28-33`: hằng `HOME_SLUG`/`LISTING_LABELS_SLUG` được chèn giữa comment "Collection có URL công khai theo slug…" và `PUBLIC_URL_COLLECTIONS` → comment I-2/I-8 nay đứng trên hằng singleton. Đề xuất: chuyển 2 hằng (kèm comment riêng) lên trên comment đó.

## Residual risk
- Reviewer không chạy được `npm run build` (lỗi native binding môi trường), không chạy Docker/Postgres/server → build, HTML parity, TTFB, parity DB dựa evidence Builder.
- Prod file-mode: trang vi ~34 ms (trước ~13.5 ms SSG), CPU tăng — theo dõi TTFB sau deploy.
- Không bật `CONTENT_SOURCE=db` trước P3-T03 (chưa revalidate).

## Verdict
✅ **PASS** — F1–F5 đã đóng; không CRITICAL/MAJOR. N1–N3 MINOR, không chặn (khuyến nghị sửa N3 ở commit này nếu tiện).
