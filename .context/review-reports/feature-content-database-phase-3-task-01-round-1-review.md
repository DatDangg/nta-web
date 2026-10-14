# Agent: reviewer — feature-content-database · phase-3-task-01 · round 1

- **CR:** CR-031 · R-16 · Task: `tasks/feature-content-database/phase-3-task-01.md`
- **Review level:** STRICT
- **Reason:** shared loaders (mọi trang chi tiết + listing + sitemap + trang chủ), data cache key/tag, đọc DB, cờ env ảnh hưởng prod.
- **Blast radius:** `src/lib/content/{load-mdx,mdx-files,posts,solutions,products,case-studies,about}.ts` → `src/app/sitemap.ts`, `src/app/[locale]/{page,about,blog,blog/[slug],case-studies,case-studies/[slug],products,products/[slug],solutions/enterprise,solutions/enterprise/[slug],solutions/ai,solutions/ai/[slug]}`; module mới `src/lib/content/{source,store}.ts`, `src/db/content-read.ts`; `tools/db/file-source.ts` (import seed/parity dùng hằng chung). Không đụng registry/listings/home/overview/messages/company-info/render-mdx (đã đối chiếu diff).

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm test` (không TEST_DATABASE_URL) | 64 tests: 63 pass, 0 fail, 1 skip (+ suite parity loader / content-repo skip vì thiếu DB) |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — 0 error, 1 warning `<img>` có sẵn `src/components/mdx/index.tsx:25` (ngoài diff) |
| `npm run build` / build db-mode / so HTML / tắt DB | Không tự chạy (cần Docker/Postgres ngoài quyền) — dựa evidence Builder (22 URL file=db, cached 200 / uncached 500, `docker build --target builder` PASS) → Residual risk |
| Parity loader db ↔ file (`TEST_DATABASE_URL`) | Không tự chạy (không có Postgres) — Builder báo 74 pass → Residual risk |

## Kiểm theo trọng điểm
1. **Chế độ `file` y nguyên — OK.** `loadMdxCollection` ở mode file gọi đúng `loadMdxDirectory(MDX_COLLECTION_DIRECTORIES[c], locale)` (blog/solutions/products/case-studies/about = thư mục cũ). `describeMdxRecord` mode file sinh đúng nhãn cũ `src/content/<dir>/<locale>/<slug>.mdx` (about: `ABOUT_SLUG='about'` → `about/<locale>/about.mdx` như cũ). `REQUIRED_FIELDS` (`src/db/content-rules.ts:20-26`) trùng từng phần tử + thứ tự với danh sách hardcode cũ ở 5 loader (test cũ ở HEAD đã ép deep-equal) → message lỗi `missing a, b` giữ nguyên. Sort: posts vẫn `date.localeCompare` desc, case-studies vẫn `compareCaseStudies` ở caller, products/solutions vẫn thứ tự readdir. `mdx-files.ts` chỉ thêm hằng, không đổi logic đọc.
2. **CONTENT_SOURCE — OK.** Không có tiền tố `NEXT_PUBLIC_` → Next không inline ra client; `source.ts` chỉ được import từ `load-mdx.ts` (server-only). Prod chưa đặt → `file`. Đặt sai: lúc build → prerender ném → build/deploy fail (an toàn, không lên prod); chỉ ở runtime → trang SSG đã prerender vẫn phục vụ, chỉ trang render động (slug ngoài generateStaticParams) lỗi 500 — lỗi to, đúng chủ đích decisions.md. Không có Dockerfile/compose/CI nào đặt `CONTENT_SOURCE`.
3. **store.ts — OK.** `server-only`; keyParts `['content-entries', c, l]` vs `['content-entry', c, l, slug]` khác tiền tố → không va chạm giữa list/entry/collection/locale (slug theo I-2 không chứa dấu phẩy). Tag `content`, `content:<c>`, `content:<c>:<slug>` đúng spec. Lọc `deleted_at IS NULL` ở cả 2 query. Lỗi DB được bọc + ném (`readOrThrow`) → unstable_cache không lưu reject; không trả `[]`. Message không chứa DATABASE_URL (test kiểm `doesNotMatch /fake/`); `getDb()` cũng không in env.
4. **content-read.ts — OK.** Drizzle `eq/and/isNull` → tham số hoá, không nối chuỗi SQL. Sort trong JS (sort_order null cuối, rồi slug so code unit) — không phụ thuộc collation/thứ tự jsonb.
5. **db đi qua cùng validate/sort — OK.** `{...data, body}` → cùng `toPost`/`assertCollectionFields`/sort. `getXBySlug` dùng chung code path tìm trong danh sách. Required fields một nguồn; test `content-rules.test.ts` chặn loader hardcode lại.
6. **Build không cần DB ở mode file — OK.** `src/db/client.ts` lazy (Pool chỉ tạo trong `getDb()`), `store.ts` chỉ gọi `getDb()` trong hàm cache, `loadMdxCollection` không chạm store ở mode file. Test "chế độ file … không cần DATABASE_URL" PASS.
7. **Test stubs — OK.** `tools/db/test-stubs/*` chỉ import từ `tools/db/content-loaders.test.ts`; `tools/` bị `.dockerignore` loại, không file `src/` nào import → không vào bundle. Glob `tools/**/*.test.ts` không bắt stub (không có hậu tố `.test.ts`). `module.registerHooks` cần Node ≥ 22.15/23.5: CI `lts/*` OK, máy local OK.
8. **Scope — OK.** Không đụng registry/listings/home/overview/messages/company-info/render-mdx.

**Rủi ro Builder nêu (thứ tự readdir Linux vs tên file):** đánh giá **không phải vấn đề thực tế** — libuv `uv_fs_scandir` (nền của `fs.readdir` trên Unix) sắp xếp kết quả bằng `strcmp`, nên readdir trên Linux trả theo thứ tự byte của tên file; `compareByFileName` (`src/lib/content/load-mdx.ts:19-24`) so code unit trên `<slug>.mdx` với slug ASCII thường (I-2) → trùng thứ tự. Khớp bằng chứng so HTML trong container Linux. Lỗi `/en/case-studies/<slug-sai>` 500: có sẵn (CR-026), ngoài scope.

## Skill gates
- aislop: skip — không chạy (tránh tải gói qua npx trong phiên review); không chặn.
- oxlint (anti-slop): skip, oxlint not configured (không có `.oxlintrc.json`).
- ocr (open-code-review): skip, ocr not installed.
- AI-readable: OK — tên tự mô tả, hàm ngắn (< 20 dòng), indirection loader → load-mdx → store → content-read = 3 bước, có README `src/content/README.md` + decisions.md. 0 indicator.
- ai-friendly-web: N/A (không đổi bề mặt public/robots/sitemap logic).
- blitzstrike: N/A (không có endpoint/input mới từ người dùng).
- Responsive Checklist Gate: N/A — diff không đụng UI/route/CSS.

## Findings
- **[CRITICAL]** không có.
- **[MAJOR]** không có.
- **[MINOR] `src/content/README.md:7` + `src/lib/content/source.ts:14`** — mô tả "đọc lúc chạy, không bị đóng băng lúc build" dễ hiểu nhầm: route hiện vẫn SSG nên trang prerender bị chốt theo cờ lúc **build**; đặt `CONTENT_SOURCE=db` chỉ ở runtime cho image build mode file → trang prerender vẫn là nội dung file, chỉ trang render động đọc DB (trộn nguồn). Đề xuất: ghi rõ "cờ phải giống nhau ở build và runtime cho tới P3-T02" trong README/decisions; xử lý triệt để ở P3-T02.
- **[MINOR] `src/lib/content/store.ts:29-36`** — `getEntries` cache toàn bộ collection/locale (kể cả `body` MDX) thành 1 mục data cache; nếu blog lớn vượt giới hạn kích thước mục cache của Next (~2MB) thì mục không được cache → mỗi request trang render động sẽ truy vấn DB. Hiện dữ liệu nhỏ, không chặn; theo dõi khi nội dung tăng (có thể tách list không body + `getEntry` cho chi tiết ở task sau).
- **[MINOR] `src/lib/content/store.ts:30-34`** — không đặt `revalidate` → mục cache sống vô hạn tới khi có `revalidateTag` (P3-T03). Đúng thiết kế, nhưng nếu bật mode db trước P3-T03 thì sửa DB không lên web. Đề xuất: không bật `CONTENT_SOURCE=db` ở môi trường nào trước P3-T03 (ghi vào checklist cutover).

## Residual risk
- Không tự chạy build, parity loader có Postgres, so HTML 22 URL, kịch bản tắt DB (cần Docker/Postgres ngoài quyền reviewer) — dựa evidence Builder; logic code đọc lại khớp với các kết luận đó.
- Hành vi unstable_cache không cache reject: dựa tài liệu Next + evidence Builder (bật DB lại → 404 bình thường), test đơn vị dùng stub không kiểm được.

## Verdict
✅ **PASS** — mode `file` (mặc định, prod) giữ nguyên hành vi: cùng thư mục, thứ tự, dữ liệu, nhãn lỗi, sort; không mở kết nối DB lúc import/build. Không CRITICAL/MAJOR; 3 MINOR không chặn commit.
