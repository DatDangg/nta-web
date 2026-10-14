# Spec Validation — CR-031 feature/content-database — HẾT PHASE 3

Agent: spec-validator · Mode: **Phase review** · Ngày: 2026-10-14 · Round: 1
Phạm vi: P3-T01 (`fee45c8`) · P3-T02 (`414a911`) · P3-T03 (`63df27c`) · P3-T04 (`3c01ce6`) · P3-T05 (`7cc99bb`). Cutover prod (import, bật `CONTENT_SOURCE=db`, smoke) thuộc phase 4,
doc reconcile + bỏ cờ thuộc phase 5 → không tính là gap (chỉ nêu điều kiện).
Nguồn đối chiếu: `SPECIFICATIONS.md:371-414,470-474` (R-15, R-15a, R-16, R-16a/b/c/d, R-27), spec delta `spec/updates/2026-10-14-content-database.md`,
change doc `spec/changes/2026-10-14-content-database.md` (quyết định #1–#10, Acceptance `:42-47`), plan `tasks/feature-content-database/README.md`,
task files `phase-3-task-0{1..5}.md` (Verification summary + Residual risk), `phase-4-task-01.md`, `.context/decisions.md:117-191` (CR-031 P3-T01..T05),
review reports P3-T01 r1, P3-T02 r1/r2, P3-T03 r1, P3-T04 r1/r2, P3-T05 r1 (tất cả kết thúc STRICT PASS), report phase 2.
Code đọc trực tiếp: `src/lib/content/{store,cache-tags,source}.ts`, `src/lib/api/revalidate.ts`, `src/app/api/revalidate/route.ts`, `src/db/schema.ts:19-36`,
`src/app/[locale]/contact/page.tsx:15-17`, `docker-compose.yml`, `.github/workflows/deploy.yml`, `.env.example`, `docs/runbook/db.md`.
Validator **không chạy lại** test/build/crawl; số liệu verify lấy từ Builder (task file) + Reviewer. `git log origin/main..HEAD` rỗng → cả 5 commit **đã lên main** (prod đang chạy code phase 3 ở chế độ `file`).
Bỏ qua theo yêu cầu: `docs/content-bot/`, `spec/changes/2026-10-14-telegram-content-bot.md` (CR-030).

## Verdict: ✅ PASS (⚠️ GAPS FOUND — 0 BLOCKER, 1 MAJOR, 6 MINOR)

Phase 3 hiện thực đủ phần spec thuộc phase 3: đọc DB có cache tag sau cờ `CONTENT_SOURCE` (mặc định `file`), render không cần DB lúc build (hướng C),
`POST /api/revalidate` đúng R-15a, chữ giao diện + company-info đọc DB, lưu trữ/phục vụ ảnh upload đúng R-16d. Bằng chứng local mạnh (crawl 79 URL + HTML 7 trang
trùng baseline ở cả 2 chế độ, cache hit không truy vấn DB, DB dừng → trang đã cache 200, sửa DB → revalidate → web đổi không build lại, upload sau build hiển thị qua `next/image`).
MAJOR-1 là **lệch tài liệu intent** (spec R-16 chưa ghi quyết định P3-T04 user đã chốt) — không phải lỗi code, không chặn phase 4 nhưng phải sửa spec trước khi đánh dấu acceptance / trước phase 5.
Phase 4 **chưa sẵn sàng chạy ngay**: còn thiếu dây cờ `CONTENT_SOURCE` trong compose/deploy, cách chạy import/CLI trên VPS, runbook cutover (mục "Điều kiện phase 4").

## Ma trận coverage

| # | Requirement (phần phase 3) | Nguồn spec | Implementation / bằng chứng | Status | Ghi chú |
|---|---|---|---|---|---|
| 1 | Web đọc nội dung từ DB (MDX: post/solution/product/case_study/about) | R-16 `:383-385` | `store.ts` `getEntries/getEntry` → `src/db/content-read.ts` (lọc `deleted_at IS NULL`); loader `load-mdx.ts` chế độ db `{...data, body}` qua cùng validate/map/sort; test "mọi loader vi/en: db deep-equal file" (P3-T01, 74 pass có DB) | ✅ | không dựa thứ tự key jsonb (`decisions.md:126`) — đóng điều kiện #2 phase 2 |
| 2 | Registry slug/listings/home/overview từ DB | R-16 `:384` | `src/lib/content/registry.ts` getter async; singleton thiếu → lỗi rõ; `readKeyedRequired` (P3-T02 r2 F3); test registry db deep-equal file | ✅ | `getSolutionOverview` chưa có call site trong `src` (chỉ seed) |
| 3 | Chữ giao diện next-intl + company-info từ DB | R-16 `:388-389` (#9) | `src/i18n/request.ts`, `src/lib/contact/company-contact.ts`, `ui-data.ts`, `shape.ts` `mergeOverFile`; JSON-LD/Footer/ContactDetails nhận props | ✅ / ⚠️ | thiếu key DB → dùng file + warn (user chốt) — **lệch R-16 "chỉ từ DB"** → MAJOR-1; metadata Liên hệ ghi cứng → MINOR-2 |
| 4 | Mọi trang hiển thị **y hệt** (vi + en, cùng URL) | R-16 `:386`, Acceptance `:43` | crawl 79 URL status+Location trùng baseline; HTML 7 trang `<head>` trùng (P3-T02 r2), JSON-LD 6 trang trùng byte (P3-T04 r2) — cả `file` và `db` | ✅ (local) | parity toàn site + screenshot = P4-T01 §1; payload RSC messages khác thứ tự key (HTML trùng) |
| 5 | Sửa DB + R-15a → trang cập nhật **không build lại** | R-16 `:386-387`, Acceptance `:44` | P3-T03: `updateEntry` v1→v2→v3 + `db:cli revalidate` → 4 URL vi/en đổi ngay, `/en` MISS rồi HIT; P3-T04: ui_messages + company_info tương tự | ✅ (local) | prod chứng minh ở P4 smoke |
| 6 | Slug mới thêm vào DB **có route ngay** (không phụ thuộc `generateStaticParams`) | R-16 `:387` | mọi `[slug]` `generateStaticParams` → `[]`, không có `dynamicParams = false` (grep `src/` chỉ thấy `sitemap.ts:10 force-dynamic`) | ⚠️ | **chưa có bằng chứng tạo bản ghi mới → 200 + có trong listing/sitemap sau revalidate** (chỉ có bằng chứng sửa bản ghi cũ) → MINOR-3 |
| 7 | Build image **không cần DB** | R-27 `:474` | `npm run build` PASS `CONTENT_SOURCE=db` không DATABASE_URL / DB dừng (P3-T02, P3-T04); `docker build --target builder` PASS (P3-T02 r2) | ✅ | |
| 8 | Trang đã cache **không truy vấn DB** | R-16 `:392` | 180 req → `xact_commit` +2 (gồm query đo) (P3-T02); ~780 req → +4 (P3-T04) | ✅ | |
| 9 | Hiệu năng: TTFB local khi data cache hit ≤ 50 ms | R-16 `:393-394` (sửa P3-T02, user chốt) | median/p90 db `/` 27–35/≤46, `/en` ~14, boxai ~25–35 ms; file `/` 22–34 ms (P3-T02 r2, P3-T04 r2) | ✅ (local) | prod chưa đo → residual |
| 10 | DB lỗi: trang đã cache phục vụ; trang chưa cache lỗi rõ, không cache trang rỗng | R-16 `:395` | `store.ts` `readOrThrow` ném `[content-store] …` (không lộ URL); DB dừng → cached 200, uncached 500, DB lên → tự phục hồi (P3-T01/T02/T04) | ✅ | trang vừa revalidate lúc DB dừng → 500 tới khi DB lên (đúng thiết kế) |
| 11 | Cờ `CONTENT_SOURCE=file\|db` giai đoạn chuyển tiếp | R-16 `:396` | `source.ts` mặc định `file`, giá trị lạ ném lỗi, đọc env lúc gọi | ✅ | **chưa có trong `docker-compose.yml`/`deploy.yml`** → điều kiện P4 #1 |
| 12 | Sau cutover bỏ cờ + đường đọc file | R-16 `:396` | — (phase 5) | ⏳ | **mâu thuẫn** với quyết định P3-T04 giữ file messages/company-info lâu dài → MAJOR-1 |
| 13 | Ảnh `public/images` giữ trong repo | R-16 `:390` | `images.localPatterns = ['/images/**','/uploads/**']` (`next.config.ts`); ảnh tĩnh vẫn tối ưu 200 (P3-T05) | ✅ | đường local ngoài 2 pattern giờ bị 400 — decisions ghi mọi ảnh tĩnh ở `/images` |
| 14 | R-15 không có API đọc nội dung công khai | R-15 `:371-373` | chỉ thêm `POST /api/revalidate` + `GET /uploads/<hash>` (file ảnh, không phải API nội dung) | ✅ | |
| 15 | R-15a: secret `x-revalidate-secret` constant-time, 401 không lộ lý do | `:374-376` | `revalidate.ts` SHA-256 hai phía + `timingSafeEqual`, trim, 401 `unauthorized`; xác thực trước khi đọc body | ✅ | |
| 16 | R-15a: body `{collection, slug?}` / `{all:true}`, collection whitelist → 400; 200 `{status:"ok",revalidated:[…]}` | `:377` | `parseRevalidateTarget` (key thừa/trộn → 400), `isContentCollection` (15 collection gồm `ui_messages`, `company_info`, `asset` — `schema.ts:19-36`), `tagsForTarget` (slug → kèm tag collection) | ✅ | |
| 17 | R-15a: không cache, không nhận GET | `:378` | route chỉ export POST (GET → 405); mọi JSON `Cache-Control: no-store` | ✅ | 405 do Next sinh không có `no-store` (không có nội dung) |
| 18 | R-15a (ngoài spec): 503 thiếu secret server, 429 rate-limit | — | `revalidate.ts` 503 `unavailable`, 429 `too_many_requests` | ⚠️ | hành vi hợp lý nhưng **chưa ghi trong R-15a** → MINOR-4 (gộp P5-T01) |
| 19 | R-16d: volume bền ngoài image, trong backup | `:402-403`, R-16b, R-27 `:474` | compose `${NTA_UPLOADS_DIR:-/opt/nta-web-data/uploads}:/app/uploads`; sidecar mount `:ro` + `uploads-<UTC>.tar.gz` (P1-T02) | ✅ | |
| 20 | R-16d: URL ổn định `/uploads/<hash>.<ext>`, `next/image` không build lại | `:403-404` | `GET /uploads/[...path]` → `serve-upload.ts`; standalone + docker: upload SAU build → 200 + `/_next/image` 200 webp; restart / tạo lại container vẫn 200 | ✅ | |
| 21 | R-16d: metadata + lịch sử trong DB (collection `asset`, có version) | `:404` | `save-image.ts` → asset created/reused/restored (rollbackEntry); `checkRecord` kiểm path↔slug↔mime | ✅ | khớp quy ước I-7 phase 2 (`decisions.md:110`) — đóng điều kiện #3 phase 2 |
| 22 | R-16d: chỉ JPEG/PNG/WebP magic bytes, không SVG, ≤ 5 MB, giới hạn kích thước, tên do server sinh | `:404-405` | magic bytes, ≤ 5 MB, cạnh ≤ 8192 px, tên = sha256 + đuôi theo magic; tmp → rename | ✅ | WebP kiểm chưa chặt (P3-T05 F3, rủi ro thấp nhờ `nosniff`) |
| 23 | R-16d: chống path traversal; phục vụ chỉ đọc trong thư mục upload | `:405-406` | whitelist tên `^[0-9a-f]{64}\.(jpg\|png\|webp)$` + `realpath` trong `UPLOAD_DIR` + file thường; `../`, `%2e%2e`, `%2F`, `\`, symlink → 404; POST → 405 | ✅ | |
| 24 | Cache tag nội dung + revalidate làm mới cả listing | R-16 / R-15a | `cache-tags.ts`: `content`, `content:<c>`, `content:<c>:<slug>`; danh sách chỉ tag collection → revalidate slug luôn bắn tag collection | ✅ | |
| 25 | Khả dụng ≥ 99.5% (R-27), web chưa phụ thuộc DB tới cutover | R-16 `:395`, R-27 | compose `nta-web` **chưa** `depends_on nta-db` (`docker-compose.yml:40`) | ✅ (giai đoạn file) | cutover phải thêm — điều kiện P4 #1 |

## Prod hiện tại (`CONTENT_SOURCE` không đặt → `file`) — thay đổi hành vi so với trước phase 3

| Thay đổi | Dự kiến/chấp nhận? | Bằng chứng | Ghi chú |
|---|---|---|---|
| Trang vi đổi SSG → render mỗi request (trên memo file ở production) | ✅ user chốt hướng C (R-16 sửa) | TTFB local `/` 22–34 ms (trước ~13.5 ms), ≤ 50 ms | CPU server tăng; **chưa đo TTFB prod** → residual |
| Trang `/en/*` ISR on-demand (render lần đầu rồi HIT) thay vì prerender | ✅ | `x-nextjs-cache: HIT` | request đầu sau mỗi deploy chậm hơn |
| `htmlLimitedBots: /.*/` — metadata luôn trong `<head>` | ✅ (sửa F1 P3-T02) | `<head>` trùng bản SSG 7/7 | đổi lấy SEO đúng |
| `sitemap.xml` `force-dynamic` | ✅ | sitemap 52 URL giống baseline | |
| `images.localPatterns` chặn `/_next/image` cho đường local ngoài `/images`, `/uploads` | ✅ | ảnh tĩnh đều ở `/images` (decisions) | nếu sau này có ảnh tĩnh ở thư mục khác → 400 |
| Route mới `GET /uploads/<hash>` (404 khi chưa có ảnh), `POST /api/revalidate` (cần secret) | ✅ | | `REVALIDATE_SECRET` bắt buộc trong compose từ P1-T02 |
| Rate-limit contact tách `client-ip.ts` (refactor P3-T03) | ✅ không đổi hành vi | test rate-limit +1 | |
| Status code 79 URL (gồm 404/301/307 và 5 × 500 `/en/<slug sai>`) | ✅ không đổi | trùng baseline cả 2 chế độ | 500 là lỗi có sẵn (CR-032 pending) |

Kết luận: không thấy thay đổi hành vi ngoài dự kiến. Lưu ý: crawl dựa trên baseline local; prod chưa có số đo sau deploy.

## Gaps

### MAJOR-1 — R-16 chưa phản ánh quyết định P3-T04 (file messages/company-info là dự phòng lâu dài) [CONFLICT spec ↔ decisions ↔ code]
- `SPECIFICATIONS.md:385` "web đọc nội dung **chỉ từ DB**" và `:396` "sau cutover bỏ cờ + đường đọc file" ↔ `.context/decisions.md:163-169`: chế độ db **gộp sâu DB đè file**,
  key thiếu → dùng chữ file + `console.warn`; `src/i18n/messages/{vi,en}.json` + `COMPANY_CONTACT` **giữ lâu dài, phase 5 KHÔNG xoá**. Spec delta `spec/updates/2026-10-14-content-database.md`
  có mục cập nhật P3-T02 nhưng **không có** mục P3-T04. Change doc quyết định #7 ("web ngừng đọc file") cũng chưa có ngoại lệ.
- Đây là intent doc → chỉ sửa qua CR + user duyệt; user **đã chốt** (P3-T04 round 1 F1) nên chỉ cần ghi nhận: thêm vào R-16 (và spec delta, cùng 4.2.0 vì chưa phát hành test-scope) đại ý:
  "chữ giao diện + thông tin công ty: DB là nguồn chính; key thiếu trong DB dùng bản file seed (giữ lâu dài làm chuẩn cấu trúc) + cảnh báo log; sai kiểu/rỗng → lỗi.
  Phase 5 chỉ bỏ cờ + đường đọc file của MDX/registry." Đồng thời sửa `:396` cho khớp.
- Hệ quả cần nói rõ trong spec/test-scope: acceptance "hiển thị y hệt" ở chế độ db có thể đạt nhờ fallback file — parity P4 phải kiểm **log không có cảnh báo `[content-shape]`**
  (nếu không, DB thiếu key mà không ai biết; bot CR-030 sửa key đó sẽ tạo key mới chứ không sửa bản đang hiển thị).
- Thời điểm: sửa trước khi đánh dấu acceptance CR-031 / trước P5-T01; không chặn bắt đầu P4.

### MINOR-1 — Xoá bản ghi bắt buộc (singleton) vẫn không có chặn/cảnh báo [mang từ MINOR-1 phase 2, nay đã rõ hậu quả]
- Loader DB đã định nghĩa bản ghi bắt buộc: `home`, `listing_labels` thiếu → ném lỗi (`decisions.md:139`); `listing_page/cta/solution_overview` thiếu key → lỗi (P3-T02 F3).
  `deleteValidation` (`src/db/content-repo.ts`) vẫn chưa chặn xoá các bản ghi này → 1 lệnh xoá qua CLI/bot = trang chủ/listing 500 (sau revalidate). ui_messages/company_info thì được lấp bằng file.
- Cần xử lý trước khi bot CR-030 có lệnh xoá; với CLI hiện tại (1 operator, có rollback) chấp nhận.

### MINOR-2 — Metadata trang Liên hệ ghi cứng SĐT/email/địa chỉ [PARTIAL quyết định #9 "bot sửa được mọi chữ trên web"]
- `src/app/[locale]/contact/page.tsx:15-17` `metadataByLocale` có hotline/email/địa chỉ cố định; sửa `company_info` qua DB không đổi `<meta description>` (P3-T04 F4 để mở).
- Đề xuất: lấy description từ `ui_messages` (hoặc ghép từ company_info) — task nhỏ trước cutover hoặc gộp CR-030. Không ảnh hưởng hiển thị hiện tại.

### MINOR-3 — Chưa có bằng chứng "slug mới thêm vào DB có route ngay" [PARTIAL R-16 `:387`]
- Cấu trúc đúng (`generateStaticParams` → `[]`, không `dynamicParams=false`, sitemap force-dynamic, registry/listing đọc store có tag), nhưng các bằng chứng P3 chỉ là **sửa** bản ghi có sẵn.
- P4 smoke (hoặc local trước P4) phải thêm: tạo bản ghi mới (post vi+en; solution mới cần cả `slug_registry`) → revalidate → URL mới 200, có trong listing + sitemap + hreflang; rồi xoá mềm/rollback.

### MINOR-4 — R-15a chưa ghi 503 (thiếu secret ở server) và 429 (rate-limit 30/phút) [drift spec ↔ code]
- `src/lib/api/revalidate.ts` trả 503 `unavailable` / 429 `too_many_requests`; spec chỉ nêu 401/400/200. Ghi vào R-15a + `docs/API_SPEC.md` ở P5-T01 (đã có trong task P3-T03 doc impact, N3).
- Lưu ý vận hành: request đi thẳng `127.0.0.1:3005` (CLI/bot trên VPS) chung khoá rate-limit `unknown`.

### MINOR-5 — Plan P4-T01 tham chiếu cũ + thiếu bước [PARTIAL plan]
- `tasks/feature-content-database/phase-4-task-01.md:10` so "bản đọc file (commit trước task 5)" — sau P3-T02 hướng C, bản file **cũng** đã đổi render (vi động); baseline đúng phải là commit trước `fee45c8` (SSG) cho so HTML, và HEAD chế độ file cho so status.
- Thiếu: cách chạy import/parity/CLI trên VPS, dây cờ `CONTENT_SOURCE` vào compose/deploy, `revalidate --all` sau import, kiểm log `[content-shape]`, tạo slug mới (MINOR-3), quyền ghi upload khi CLI chạy ngoài container (xem điều kiện P4).
- Kế hoạch lùi `:17` "đặt lại `CONTENT_SOURCE=file` + deploy lại" — hiện compose không có biến này nên lùi cũng cần sửa compose/secret; và nội dung đã sửa trong DB sau cutover sẽ **biến mất khỏi web** khi lùi (file không có) — cần ghi rõ cho user.

### MINOR-6 — Theo dõi kích thước mục data cache theo collection (giới hạn ~2 MB của Next `unstable_cache`)
- `getEntries('post', locale)` cache cả danh sách kèm `body` MDX trong 1 mục (follow-up P3-T01 chưa đo). Vượt giới hạn → Next bỏ cache mục đó → mỗi request truy vấn DB (vi phạm R-16 `:392` một cách âm thầm khi blog lớn lên).
- Đề xuất: ghi số byte hiện tại vào P4 evidence; nếu gần ngưỡng, listing không kèm `body`.

### Ghi chú tracking (không tính gap)
- `spec/changes/BACKLOG.md:41` CR-031 vẫn ghi "P1-T01 done · P1-T02 chờ user" — trạng thái cũ; nên cập nhật (P3 done, chờ P4) khi close-out phase.
- CR-032 (500 cho `/en/<slug sai>`) và 500 cho đường có dấu chấm không có route (`/package.json`) — có sẵn trước phase 3, không đổi; P3-T05 residual ghi cùng họ CR-032.

## Đóng điều kiện phase 2 (đã nêu cho phase 3)

| Điều kiện phase 2 | Trạng thái | Bằng chứng |
|---|---|---|
| #1 `tools/` bị loại khỏi Docker context | ⏳ chuyển P4 | CLI upload/revalidate/import vẫn ở `tools/` (P3-T05 residual) — xem P4 #2 |
| #2 jsonb không giữ thứ tự key → so render | ✅ | loader sort theo tên file/sort_order; so HTML 7 trang + crawl 79 URL ở chế độ db |
| #3 quy ước I-7 asset `data.path` | ✅ | `checkRecord` asset path↔slug↔mime; save-image.test |
| #4 REQUIRED_FIELDS một nguồn | ✅ | loader dùng `REQUIRED_FIELDS` qua `assertCollectionFields`; test "loader không hardcode required fields" |
| #5 tách đọc khỏi `content-repo.ts` | ✅ | `src/db/content-read.ts` + `store.ts` server-only |
| #6 company_info không theo locale, lưu 2 bản | ✅ (chốt) | P3-T04 đọc `company_info/<locale>/contact`; sửa phải sửa cả vi + en (bot CR-030 cần biết) |
| #7 version seed `sort_order` NULL | ✅ không ảnh hưởng | prod chưa import |
| Residual `docker build --target builder` flaky prerender | ✅ | P3-T02 r2 PASS; build không còn prerender trang nội dung |
| MINOR-1/2/3/4 phase 2 | ⏳ mở | MINOR-1 → MINOR-1 trên; MINOR-2/4 trước CR-030; MINOR-3 → P4 bước backup bắt buộc |

## Điều kiện / việc cần cho phase 4 (cutover prod)

**Chặn cutover (phải có trước khi bật `db`):**
1. **Dây cờ + phụ thuộc DB trong deploy:** `docker-compose.yml` `nta-web` chưa có `CONTENT_SOURCE` và chưa `depends_on nta-db` (`:40`); `deploy.yml` chưa truyền biến.
   Cần: thêm `CONTENT_SOURCE: ${CONTENT_SOURCE:-file}` (hoặc giá trị cố định) + `depends_on: nta-db: condition: service_healthy`; quyết định đặt cờ ở đâu (GitHub variable / compose)
   để **lùi về `file` không cần sửa code**. Lưu ý `depends_on` làm web phụ thuộc DB khi khởi động (ảnh hưởng R-27 99.5%) — đúng thiết kế sau cutover.
2. **Chạy import/parity/CLI trên VPS:** `tools/` bị `.dockerignore` loại → không có trong image `nta-web`. Chọn 1 cách và ghi runbook: (a) chạy từ workspace runner/clone repo trên VPS bằng `tsx`
   với `DATABASE_URL` trỏ `nta-db` qua mạng compose (DB không publish port → cần `docker run --network <compose-net>` image node có repo, hoặc tạm publish loopback);
   (b) image/target riêng `nta-tools`. Đây cũng là cách bot CR-030 sẽ gọi `saveImage`/revalidate.
3. **Quyền ghi thư mục upload:** CLI `upload` chạy ngoài container phải ghi `/opt/nta-web-data/uploads` với uid **1001** (owner `1001:1001`); chạy bằng root → file root-owned
   (web vẫn đọc được nhưng lần ghi sau của `nextjs` có thể EACCES với tmp/rename trên cùng thư mục — chỉ thư mục cần quyền, file cũ thì được). Runbook: chạy với `--user 1001:1001`
   hoặc `chown` sau; kiểm `ls -ln` trước smoke. Thư mục chưa tồn tại → Docker tạo root-owned (đã chứng minh EACCES) → kiểm trước.
4. **Runbook cutover** (`docs/runbook/db.md` chưa có mục cutover): backup `pre-migrate-before-import-<UTC>` (ghi tên file vào task) → xác nhận migration 0000+0001 đã apply
   (`select count(*) from drizzle.__drizzle_migrations` = 2, `\d content_versions` có `sort_order`) → user xác nhận → `db:import-seed --confirm-prod` → `db:parity` PASS trên prod
   → bật cờ + deploy → **`db:cli revalidate --all`** (an toàn dù container mới có cache rỗng) → smoke → kế hoạch lùi.
5. **Smoke bắt buộc** (bổ sung P4-T01 §3): mọi URL sitemap vi/en 200, 301/404 như cũ; `grep '[content-shape]'` log = 0 (MAJOR-1); `[content-store]` = 0;
   tạo bản ghi mới → route ngay (MINOR-3) → xoá mềm/rollback; sửa 1 bản ghi → revalidate → đổi → rollback (lịch sử có version); upload 1 ảnh → `/uploads/<hash>` + `/_next/image` 200,
   còn sau `docker restart nta-web`; đo TTFB prod (vi + en) so với ngưỡng 50 ms (+ độ trễ mạng); DB dừng ngắn → trang đã cache vẫn 200.

**Rủi ro user cần biết:**
- Migrate/import chạy **thẳng DB prod**, không staging (user đã chấp nhận) — chỉ bù bằng backup + `migrate-on-restore.sh` (chưa chạy trên VPS — residual phase 2).
- Sau khi bật `db`, nội dung chỉ đổi qua DB; commit sửa file MDX **không còn lên web** (trừ messages/company-info key mới — fallback file). Lùi về `file` = mất mọi sửa DB khỏi web.
- `revalidateTag` chỉ làm mới cache trong 1 process `nta-web`; scale > 1 instance cần cache handler chung.
- Trang vừa revalidate mà DB đang lỗi → 500 tới khi DB lên (đúng R-16).
- CR-032 (500 thay 404 cho `/en/<slug sai>`) vẫn tồn tại — không do CR-031, nhưng smoke sẽ thấy 5 URL 500; nên fix trước hoặc ghi rõ là baseline.
- Metadata Liên hệ ghi cứng (MINOR-2) — nếu user định sửa SĐT/địa chỉ qua bot ngay sau cutover thì description SEO sẽ lệch.

## Chưa chứng minh (residual)

| Mục | Trạng thái | Cách chứng minh |
|---|---|---|
| Deploy prod của 5 commit phase 3 thành công + hành vi prod chế độ file | đã push main; validator không kiểm được run CI/prod | xem run deploy gần nhất + crawl sitemap prod (status) + TTFB `/`, `/en` |
| TTFB/CPU prod sau đổi SSG → render động | chỉ số local | đo từ VPS/ngoài sau deploy |
| Test (`npm test`, có/không `TEST_DATABASE_URL`) | Builder: 112 tests (111 pass, 1 skip symlink Windows) ở P3-T05 | validator không chạy lại |
| Kích thước mục data cache `post` | chưa đo | log số byte `JSON.stringify(entries)` ở P4 |
| `migrate-on-restore.sh` + restore thử trên VPS (phase 1/2) | chưa | chạy ở P4-T01 §4 |
| Ghi upload với uid 1001 trên VPS thật | chỉ docker local | smoke P4 |

## Verdict reasoning
- Không có ❌ MISSING cho requirement phase 3; mọi mục R-15a, R-16 (đọc/render/cache/hiệu năng/khả dụng), R-16d có implementation + bằng chứng local + reviewer STRICT PASS.
- 1 MAJOR là lệch **tài liệu intent** đã có quyết định user rõ ràng (không phải conflict chưa giải quyết) → không phải HIGH conflict, nhưng phải cập nhật spec trước khi đóng CR.
- 6 MINOR có điều kiện kích hoạt muộn (bot CR-030, cutover P4, P5 doc reconcile) và không đổi hành vi prod hiện tại (chế độ file, thay đổi render đã được user chấp nhận).
- Phase 3 → **PASS**. Phase 4 chỉ nên bắt đầu sau khi xử lý điều kiện chặn #1–#4 (có thể làm trong P4-T01 trước human checkpoint cutover).
