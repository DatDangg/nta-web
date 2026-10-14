# feature-content-database · phase-3-task-01 — Data-access đọc DB có cache tag; loader MDX đọc DB

- **CR:** CR-031 · spec R-16 (4.2.0)
- **Classification / Risk:** MODIFY (kiến trúc nguồn dữ liệu) · HIGH
  - Expected review level: **STRICT** (shared loaders, mọi trang chi tiết)
  - Blast radius: `src/lib/content/{load-mdx,posts,solutions,products,case-studies,about}.ts` + module đọc mới; mọi trang blog/giải pháp/sản phẩm/case/about.
  - Doc impact: DESIGN (phase 5).

## Scope
1. `src/lib/content/store.ts` (server-only): `getEntries(collection, locale)`, `getEntry(collection, slug, locale)` — lọc `deleted_at IS NULL`,
   bọc `unstable_cache` với tag `content`, `content:<collection>`, `content:<collection>:<slug>`.
2. Cờ `CONTENT_SOURCE=file|db` (mặc định `file`, server-only): `file` = hành vi hiện tại y nguyên; `db` = đọc DB.
   Giữ **nguyên chữ ký hàm export** (`getAllPosts`, `getPostBySlug`, `getAllSolutions`…) → trang không phải sửa; đổi nguồn file → DB.
   Validate + sort giữ như cũ. `render-mdx.tsx` render `body` MDX từ DB.
3. Đường đọc file chỉ còn sau cờ; bỏ hẳn ở phase 5. Thêm `src/content/README.md`: "seed, không phải nguồn sự thật (sau cutover)".
4. DB lỗi: trang đã cache vẫn phục vụ (R-16); trang chưa cache báo lỗi rõ (error boundary/500), không âm thầm trả rỗng (tránh cache trang trống).
   Kiểm: tắt Postgres local sau khi đã mở trang → trang đã cache vẫn 200, trang chưa cache lỗi rõ.

## Acceptance
- Local DB đã import: các trang chi tiết + listing render giống trước (so HTML trang mẫu; parity toàn site ở task 8). typecheck/lint/build PASS.

## Builder report
**Agent: builder** · 2026-10-14 · chưa commit (chờ reviewer STRICT)

### Files
- Mới: `src/lib/content/source.ts` (+ `source.test.ts`) — cờ `CONTENT_SOURCE`; `src/db/content-read.ts` — query thuần bản ghi còn sống;
  `src/lib/content/store.ts` (server-only) — `getEntries`/`getEntry` + `unstable_cache` + tag; `src/content/README.md`;
  `tools/db/content-loaders.test.ts`; `tools/db/test-stubs/{register,server-only,next-cache}.ts`.
- Sửa: `src/lib/content/load-mdx.ts` (`loadMdxCollection`, `describeMdxRecord`, `assertCollectionFields`), `mdx-files.ts` (`MDX_COLLECTION_DIRECTORIES`, `ABOUT_SLUG`),
  loader `posts|solutions|products|case-studies|about.ts` (chữ ký export giữ nguyên), `src/db/content-rules.ts` (comment), `tools/db/file-source.ts` (re-export hằng dùng chung),
  `tools/db/content-rules.test.ts` (test "loader không hardcode required fields"), `.context/decisions.md`.
- Không đụng: registry TS/listings/home/overview/messages/company-info (P3-T02/T04), `render-mdx.tsx` (nhận `post.body` — chế độ db là body từ DB), `.context/runs`.

### Quyết định (chi tiết ở decisions.md "CR-031 P3-T01")
- Cờ lạ → **ném lỗi** (không fallback). Chế độ `file` = gọi `loadMdxDirectory` cũ, cùng thứ tự/dữ liệu/nhãn lỗi.
- Chế độ `db`: `{...data, body}` → cùng toPost/assertCollectionFields/sort; thứ tự mặc định theo tên file `<slug>.mdx`; không dựa thứ tự key jsonb.
- Lỗi DB → `[content-store] Không đọc được nội dung <collection>/<locale> từ DB` (cause gốc, không lộ DATABASE_URL), không trả rỗng.

### Verify
| Lệnh | Kết quả |
|---|---|
| `npm test` (không TEST_DATABASE_URL) | 63 pass, 0 fail, 1 skip + suite parity loader skip |
| `TEST_DATABASE_URL=postgres://…@127.0.0.1:55433/nta_test npm test` (Postgres 16.15 Docker tạm) | **74 pass, 0 fail** — gồm "mọi loader vi/en: db deep-equal file" (getAll*/get*BySlug/getMdxDocument/getAboutData), xoá mềm biến mất khỏi store + loader |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS (0 error; 1 warning `<img>` có sẵn ở `src/components/mdx/index.tsx`) |
| `docker build --target builder -t nta-web-buildcheck:tmp .` | PASS (build không DB, chế độ file) — image đã xoá |

**So HTML file ↔ db** (container từ image builder trên network riêng; `file`: `next start` của bản build có sẵn; `db`: `CONTENT_SOURCE=db DATABASE_URL=… npm run build && next start`,
DB đã `drizzle-kit migrate` + `db:import-seed`): 22 URL (blog first-steps, solution enterprise crm, solution ai boxai, product music-app, case heritage-site-ai-camera, about,
+ listing blog/products/case-studies/solutions enterprise|ai; vi + en) → **status 200/200, markup SSR giống hệt** sau khi thay BUILD_ID và tách `<script>`.
Payload RSC flight trong `<script>` khác thứ tự/đánh số dòng (thứ tự async hoàn tất khác nhau giữa 2 lần build), không khác nội dung markup.

**Tắt DB** (`docker stop` Postgres): bản build db — trang đã prerender/đã có data cache vẫn 200 (`/blog/first-steps`, `/en/about`, `/solutions/ai/boxai`, `/products/music-app`).
Trang chưa cache: container cùng bản build nhưng xoá `.next/cache/fetch-cache` → trang prerender vẫn 200; `/blog/<slug-mới>` → **500**, log
`Error: [content-store] Không đọc được nội dung post/vi từ DB … cause ENOTFOUND`. Bật DB lại → cùng URL trả 404 bình thường (lỗi không bị cache).
Cách kiểm lại: như trên (docker network + postgres:16.15-alpine + image `--target builder`), không dùng `docker compose build`. Đã dọn container/network/image tạm.

### Rủi ro / ghi chú
- Route vẫn SSG: build chế độ `db` cần DB lúc build; build không DB ở chế độ db là việc P3-T02.
- Trên Linux, thứ tự readdir chế độ `file` có thể khác thứ tự tên file của chế độ `db` cho trang dùng thứ tự mặc định (`/products`, sitemap); thực tế so HTML trong container Linux giống nhau.
- Test loader dùng stub `next/cache` → không kiểm cache/tag trong test đơn vị (đã kiểm bằng bản build thật).
- Ngoài scope (có sẵn, chế độ file cũng bị): `/en/case-studies/<slug-không-tồn-tại>` trả 500 "Page changed from static to dynamic … reason: headers" thay vì 404.

## Close-out
- Status: **done** · Acceptance: PASS (local; prod vẫn CONTENT_SOURCE mặc định file)
- Verify: npm test 63 pass + 1 skip (có TEST_DATABASE_URL: 74 pass) · typecheck PASS · lint PASS (1 warning có sẵn) · docker build --target builder PASS (không DB) · HTML 22 URL (vi+en) file = db · tắt DB: trang cached 200, uncached 500 lỗi rõ, bật lại → không cache lỗi
- Reviewer verdict: STRICT **PASS** — .context/review-reports/feature-content-database-phase-3-task-01-round-1-review.md
- MINOR đã sửa: README + source.ts ghi rõ cờ phải giống nhau ở build/runtime tới P3-T02, không bật db trước P3-T03.
- Follow-up: theo dõi kích thước mục cache collection (giới hạn ~2MB của Next); revalidate qua tag ở P3-T03. Lỗi /en/case-studies/<slug-sai> 500 là CR-026 có sẵn.
- Migration: none. Doc impact: src/content/README.md, decisions.md; DESIGN ở phase 5.
