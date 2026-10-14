# bug-en-invalid-slug-500 · phase-1-task-01 — `/en/<section>/<slug sai>` trả 500 thay vì 404 (gộp CR-026 + CR-032)

- **Nguồn:** `spec/changes/2026-10-14-en-dynamic-slug-not-found-500.md` (CR-026) + `spec/changes/2026-10-14-en-invalid-slug-500.md` (CR-032)
- **Gộp:** đã xác nhận **cùng 1 root cause** (cùng stack, cùng caller, 1 fix chữa cả 6 URL — xem Evidence). Không tách.
- **Trạng thái:** done — plan duyệt 15/10 (A, title "404 | NTA"), review STRICT FAIL r1 (thiếu repro evidence) → FAST PASS r2; scope v50

## Classification / Risk
- **Class:** BUG (routing / i18n / rendering) · **Severity:** medium (khách vãng lai gặp trang lỗi 500 thay vì 404; Googlebot thấy 5xx trên URL hỏng)
- **Risk:** LOW–MEDIUM — diff dự kiến 1 file (`src/app/[locale]/not-found.tsx`), nhưng file này là boundary 404 dùng chung cho MỌI route `[locale]`.
- **Root cause category:** framework interaction (next-intl `requestLocale` fallback `headers()` × Next 15.5 ISR on-demand).
- **Expected review level:** **NORMAL** (component dùng chung nhưng không đụng auth/data/schema/API; có smoke build thật). Reviewer được nâng STRICT nếu thấy cần.
- **Blast radius:**
  - `src/app/[locale]/not-found.tsx` → trang 404 của mọi route `[locale]` (vi + en; detail `blog|products|case-studies|solutions/ai|solutions/enterprise` + catch-all `[...rest]` + locale lạ).
  - KHÔNG đổi: `src/app/[locale]/layout.tsx`, `src/i18n/request.ts`, `src/middleware.ts`, 5 trang detail, `sitemap.ts` (force-dynamic, không dính), `next.config.ts` redirects 301.
  - Hệ quả mới: 404 của URL `/en/...` SSG giờ được **cache ISR** (`Cache-Control: s-maxage=31536000`, quan sát ở thí nghiệm) thay vì 500 không cache → phải kiểm tạo slug mới sau khi URL đó đã 404 vẫn ra 200 sau revalidate (chế độ db, tag `contentTags(collection, slug)` — `src/lib/content/store.ts:33-36`).
- **Doc impact:** dự kiến `no doc impact` (không đổi API/schema/behavior đã tài liệu hoá; hành vi mong đợi vốn là 404). Builder/Reviewer xác nhận lại.
- **Spec delta:** không — requirement không đổi (404 cho slug sai là hành vi mong đợi sẵn). Spec Publisher: KHÔNG bump `spec_version`, vẫn sinh `spec/test-scope/current.json` (`trigger: bug-fix`, `scopeVersion` +1).
- **Decision impact:** cần user chốt **title của trang 404** (xem Câu hỏi).

## Root cause (đã chứng minh — Iron Law)
Chuỗi gây lỗi (file:line):
1. Các route detail `src/app/[locale]/{blog,products,case-studies,solutions/ai,solutions/enterprise}/[slug]/page.tsx` có `generateStaticParams() { return [] }`
   (blog `:16`, products `:13`, case-studies `:21`, solutions/ai `:16`, solutions/enterprise `:16`) + layout `src/app/[locale]/layout.tsx` `generateStaticParams` `[]`
   → build đánh dấu `●` SSG; slug lạ render lần đầu theo kiểu **ISR on-demand (static)** — gọi `headers()` lúc runtime là lỗi.
2. Slug sai → `generateMetadata` của page gọi `notFound()` (vd blog `:24`, solutions/ai `:24` khi slug sai nhóm, enterprise `:24`) **trước** khi page component kịp `setRequestLocale`.
3. Next 15.5 xử lý metadata lỗi HTTP-fallback bằng cách resolve metadata của boundary not-found → gọi `generateMetadata` của
   **`src/app/[locale]/not-found.tsx:8-9`** → `getTranslations('notFound')` không truyền locale.
4. → `src/i18n/request.ts:22-23` `await requestLocale` → next-intl `node_modules/next-intl/dist/esm/development/server/react-server/RequestLocale.js:33`
   `getCachedRequestLocale() || getLocaleFromHeader()` → cache trống trong ngữ cảnh resolve metadata này → `headers()` (`:8`)
   → Next ném `Page changed from static to dynamic at runtime ..., reason: headers` → **500**.
5. Vì sao vi 404 đúng: middleware next-intl (`localePrefix: 'as-needed'`) rewrite `/x` → `/vi/x`; Next 15.5 render URL bị rewrite **động**
   (decisions.md CR-031 P3-T02) → `headers()` hợp lệ → 404 (title tiếng Việt lấy qua header). `/en/nope` (catch-all `[...rest]`, `ƒ` dynamic) cũng 404 đúng vì cùng lý do.
- Không phụ thuộc `CONTENT_SOURCE`: lỗi nằm ở metadata của not-found, tái hiện ở chế độ `file`; prod (`db`) cùng 500.

### Evidence
- **Prod (GET, 15/10/2026):** `/en/blog/nope`, `/en/products/nope`, `/en/case-studies/nope`, `/en/solutions/ai/crm`, `/en/solutions/enterprise/boxai`, `/en/solutions/ai/nope` → **500**;
  `/blog/nope`, `/products/nope`, `/case-studies/nope`, `/solutions/ai/crm`, `/solutions/enterprise/boxai`, `/en/nope`, `/nope`, `/fr/blog` → 404; `/en`, `/en/blog` → 200.
- **Tái hiện local** (Docker image prod từ HEAD `e3b1b38`, `CONTENT_SOURCE=file`): 5 URL en của CR-032 → 500; vi → 404. Log:
  `Error: Page changed from static to dynamic at runtime /en/blog/nope, reason: headers` … `at get requestLocale`.
  Stack đầy đủ (`--stack-trace-limit=80`): frame `Module.l` = hàm `generateMetadata` của module not-found (`title: (await getTranslations("notFound"))("title")`),
  gọi từ resolver metadata của Next (`generateMetadata ${route}` span) → xác định đúng caller là `not-found.tsx:8-9`.
- **Thí nghiệm loại trừ** (bản sao trong scratchpad, không đụng repo):
  - Exp1 — thêm `setRequestLocale(locale)` vào `generateMetadata` của layout → **vẫn 500** (cache locale không tới được ngữ cảnh resolve metadata not-found) → loại phương án "set locale sớm hơn".
  - Exp2 — bỏ `generateMetadata` của not-found, thay `export const metadata = { robots: { index: false, follow: false } }` →
    6 URL en → **404**, vi → 404, `/en/blog` `/blog` `/en` → 200, `/en/nope` `/nope` → 404, **0** log "static to dynamic"; nội dung trang 404 bản en vẫn tiếng Anh
    (RSC payload có `notFound.heading` = "Page not found"). Hệ quả phụ: `<title>` trang 404 rơi về title mặc định của layout (`NTA | Giải pháp công nghệ doanh nghiệp`) cho cả vi lẫn en.

## Phương án
- **Khuyến nghị — A: not-found metadata không phụ thuộc locale.** Trong `src/app/[locale]/not-found.tsx` thay `generateMetadata` (gọi next-intl) bằng
  `export const metadata` tĩnh: `robots: { index: false, follow: false }` + `title` tĩnh trung tính theo lựa chọn user (xem Câu hỏi). Thân trang giữ nguyên
  (`getTranslations` trong component chạy dưới layout đã `setRequestLocale` → đúng ngôn ngữ, đã chứng minh ở Exp2).
  Lý do: sửa đúng caller duy nhất gọi `headers()`; 1 file; giữ ISR cho en; không phụ thuộc `CONTENT_SOURCE` → an toàn với P5-T02 (bỏ đường đọc file).
  - A-biến thể (nếu user muốn title 404 theo ngôn ngữ trên tab trình duyệt): thêm client component nhỏ đặt `document.title` từ `useTranslations('notFound')` sau hydrate.
    HTML server vẫn title tĩnh (404 noindex nên không ảnh hưởng SEO). Thêm 1 component — chỉ làm nếu user chọn.
- **B (thay thế, không khuyến nghị):** bỏ `generateStaticParams` / đặt `export const dynamic = 'force-dynamic'` ở 5 route detail → en render động như vi.
  Mất cache ISR full-route của trang chi tiết en (mỗi request render lại), đổi chiến lược render đã chốt ở CR-031 P3-T02; diff 5 file.
- **C (loại):** `setRequestLocale` sớm hơn (layout/page `generateMetadata`) — Exp1 chứng minh không chữa được.
- **D (để sau):** `next/root-params` (next-intl khuyến nghị thay `setRequestLocale`) — chỉ có ở Next 16 / experimental; ngoài scope bug.

## Scope (Builder)
1. `src/app/[locale]/not-found.tsx`: bỏ `generateMetadata` dùng next-intl; `export const metadata: Metadata = { title: <theo user chốt>, robots: { index: false, follow: false } }`.
   Không đổi phần thân component. Nếu user chọn A-biến thể → thêm client component đặt `document.title` (giữ nhỏ, không thêm dependency).
2. Test hồi quy (test-first, fail trước fix): test `node:test` tĩnh đảm bảo `not-found.tsx` không export `generateMetadata` gọi API next-intl phụ thuộc request
   (`getTranslations`/`getLocale`/`getMessages` không truyền locale) — kèm comment lý do (static→dynamic). Bằng chứng chính vẫn là smoke build thật bên dưới.
3. KHÔNG sửa: layout, `src/i18n/request.ts`, middleware, các page detail, sitemap, `next.config.ts`, nội dung `messages/*.json` (trừ khi user chọn title mới cần key).

## Acceptance (gộp CR-026 + CR-032)
- [x] `/en/blog/nope`, `/en/products/nope`, `/en/case-studies/nope`, `/en/case-studies/xyz-nope`, `/en/blog/xyz-nope`, `/en/solutions/ai/xyz-nope`,
      `/en/solutions/ai/crm` (slug enterprise sai nhóm), `/en/solutions/enterprise/boxai` (slug AI sai nhóm) → **404** + trang not-found **tiếng Anh**; mọi slug sai dưới `/en/*/[slug]` cùng hành vi.
- [x] Bản vi tương ứng (`/blog/nope`, `/products/nope`, `/case-studies/nope`, `/case-studies/xyz-nope`, `/solutions/ai/crm`, `/solutions/enterprise/boxai`) vẫn **404** + trang not-found tiếng Việt.
- [x] Slug hợp lệ vi + en vẫn **200** (vd `/blog/first-steps`, `/en/blog/first-steps`, 1 product, 1 case study, 1 solution AI, 1 solution enterprise mỗi locale).
- [x] Redirect 301 giữ nguyên: `/case-studies/oc-eo-learning`, `/vi/case-studies/oc-eo-learning`, `/en/case-studies/oc-eo-learning` → 301 đúng đích.
- [x] `/en/nope`, `/nope`, `/fr/blog` vẫn 404; `/`, `/en`, `/en/blog`, `/blog`, `/sitemap.xml` 200.
- [x] Trang 404 vẫn `noindex`; title theo lựa chọn user.
- [x] Log server không còn `Page changed from static to dynamic`.
- [x] Chạy được ở **cả 2 chế độ** `CONTENT_SOURCE=file` và `CONTENT_SOURCE=db` (db: Postgres tạm local + `npm run db:migrate` + `npm run db:import-seed` vào DB tạm — KHÔNG đụng DB prod).
- [x] (db) URL `/en/blog/<slug-mới>` đã 404 (và bị cache ISR) → tạo bài slug đó qua CLI vào DB tạm → `POST /api/revalidate` theo tag → URL ra **200** (không kẹt 404 cache).
- [x] `npm test`, `npm run typecheck`, `npm run lint` PASS; build Docker PASS (`docker build --target builder -t nta-web-buildcheck:tmp .` rồi xoá image).

## Verification plan
1. Test-first: test hồi quy FAIL trên HEAD → PASS sau fix.
2. `npm test` · `npm run typecheck` · `npm run lint` (Windows) — `npm run build` trên Windows hỏng native binding → build qua Docker.
3. Smoke build thật: `docker build -t nta-web-smoke:tmp .` → chạy container 2 lần:
   - `CONTENT_SOURCE=file` (không DB);
   - `CONTENT_SOURCE=db` + `DATABASE_URL` trỏ Postgres container tạm (network riêng) đã migrate + import seed.
   Mỗi lần curl danh sách URL ở Acceptance, ghi bảng `URL | expected | actual` + `docker logs | grep -c "static to dynamic"` = 0. Xoá container/image/network tạm sau khi xong.
4. Sau push + deploy: smoke prod read-only (GET) cùng danh sách URL.

## Retry / Escalation
- attempt tối đa 3; cancel/interrupted không tính attempt. Lỗi lặp ≥ 2 lần → ghi `loopSignal`.
- ≥3 attempt FAIL → status `architecture_review_needed` (cân nhắc phương án B hoặc nâng cấp next-intl/Next) và dừng chờ user.

## Câu hỏi cần user quyết (checkpoint)
1. Title trang 404 sau fix (metadata không còn đọc được locale): (a) tĩnh trung tính `404 | NTA` — khuyến nghị; (b) song ngữ `Không tìm thấy trang · Page not found | NTA`;
   (c) giữ title mặc định layout; (d) (a)/(b) + client component đặt title theo ngôn ngữ sau hydrate.
2. Duyệt phương án A (không phải B — mất ISR en).

## Repro Verification
- **Original repro:** GET `/en/blog/nope`, `/en/products/nope`, `/en/case-studies/nope`, `/en/solutions/ai/crm`, `/en/solutions/enterprise/boxai`, `/en/solutions/ai/nope` (slug sai dưới route detail SSG `[]` + ISR on-demand của locale en).
- **Expected:** 404 + trang not-found nội dung tiếng Anh, `<meta name="robots" content="noindex, nofollow">`, `<title>404 | NTA</title>` (user chốt phương án A, title (a)); bản vi tương ứng 404; slug hợp lệ 200; redirect 301 giữ nguyên; log không có `Page changed from static to dynamic`.
- **Actual before fix:**
  - Prod (GET read-only, 15/10/2026, builder kiểm lại khi chạy task): `https://ntavietnam.tech/en/blog/nope` → **500**; `https://ntavietnam.tech/blog/nope` → 404.
  - Docker image prod build từ HEAD `e3b1b38`, `CONTENT_SOURCE=file`: 5 URL en của CR-032 → **500**, vi → 404; log `Error: Page changed from static to dynamic at runtime /en/blog/nope, reason: headers … at get requestLocale` (chi tiết ở § Root cause / Evidence phía trên).
  - Test hồi quy `src/app/[locale]/not-found.test.ts` chạy trên source HEAD (trước khi sửa `not-found.tsx`): `node --import tsx --test "src/app/**/*.test.ts"` → **pass 0 / fail 2** (`not-found does not export generateMetadata …`, `not-found exports static metadata …`, lỗi "missing `export const metadata`").
- **Actual after fix:** ở cả 2 chế độ `CONTENT_SOURCE=file` và `db`: 36/36 URL đúng kỳ vọng (bảng dưới), `docker logs <container> 2>&1 | grep -c 'static to dynamic'` = **0** ở mỗi chế độ; test hồi quy pass 2/2; kịch bản db (404 bị cache → tạo bài → revalidate → 200) PASS.
- **Evidence:** các lệnh + bảng bên dưới.
- **Status: PASS**

### Lệnh build / run (Windows host, Docker 29.8.1)
```bash
# Image prod (stage runner); next build chạy mới (log "✓ Compiled successfully")
docker build -t nta-web-smoke:tmp .

# (1) CONTENT_SOURCE=file, cổng host 3911
docker run -d --name nta-smoke-file -p 3911:8080 -e CONTENT_SOURCE=file nta-web-smoke:tmp
bash smoke.sh http://localhost:3911
docker logs nta-smoke-file 2>&1 | grep -c 'static to dynamic'      # → 0

# (2) CONTENT_SOURCE=db: Postgres tạm (KHÔNG phải DB prod), chỉ publish trên loopback
docker run -d --name nta-smoke-pg -e POSTGRES_PASSWORD=<tmp> -e POSTGRES_DB=nta_smoke -p 127.0.0.1:55432:5432 postgres:16
export DATABASE_URL=postgres://postgres:<tmp>@127.0.0.1:55432/nta_smoke   # loopback → guard isProductionDatabaseUrl = false
npm run db:migrate          # drizzle-kit migrate → "migrations applied successfully"
npm run db:import-seed      # import src/content vào DB tạm (vd solution_overview 2, slug_registry 11, ui_messages 12, company_info 1)
docker run -d --name nta-smoke-db -p 3912:8080 --add-host=host.docker.internal:host-gateway \
  -e CONTENT_SOURCE=db -e DATABASE_URL=postgres://postgres:<tmp>@host.docker.internal:55432/nta_smoke \
  -e REVALIDATE_SECRET=<test-secret> nta-web-smoke:tmp
bash smoke.sh http://localhost:3912
docker logs nta-smoke-db 2>&1 | grep -c 'static to dynamic'        # → 0 (kể cả sau kịch bản revalidate)

# Dọn: docker rm -f nta-smoke-file nta-smoke-db nta-smoke-pg; docker rmi nta-web-smoke:tmp nta-web-buildcheck:tmp postgres:16
```
`smoke.sh` (nằm ở scratchpad, không commit): với mỗi URL chạy `curl -s -D <headers>` rồi lấy status, header `location`, `<title>`, và kiểm `name="robots" content="noindex, nofollow"`.
Ngôn ngữ thân trang 404 xác định theo câu `does not exist or has been moved` (en) hoặc `Trang bạn tìm không tồn tại` (vi, ưu tiên nếu có).
Với các dòng 404 có kỳ vọng ngôn ngữ, script đánh MISMATCH nếu sai status, ngôn ngữ, title hoặc robots. Kết quả: `MISMATCH=0` ở cả 2 chế độ.

### Bảng URL (kết quả giống hệt ở `file` :3911 và `db` :3912)
| # | URL | expected | actual (file) | actual (db) | thân 404 | `<title>` | robots | location |
|---|---|---|---|---|---|---|---|---|
| 1 | `/en/blog/nope` | 404 | 404 | 404 | en | 404 \| NTA | noindex, nofollow | – |
| 2 | `/en/products/nope` | 404 | 404 | 404 | en | 404 \| NTA | noindex, nofollow | – |
| 3 | `/en/case-studies/nope` | 404 | 404 | 404 | en | 404 \| NTA | noindex, nofollow | – |
| 4 | `/en/case-studies/xyz-nope` | 404 | 404 | 404 | en | 404 \| NTA | noindex, nofollow | – |
| 5 | `/en/blog/xyz-nope` | 404 | 404 | 404 | en | 404 \| NTA | noindex, nofollow | – |
| 6 | `/en/solutions/ai/xyz-nope` | 404 | 404 | 404 | en | 404 \| NTA | noindex, nofollow | – |
| 7 | `/en/solutions/ai/nope` | 404 | 404 | 404 | en | 404 \| NTA | noindex, nofollow | – |
| 8 | `/en/solutions/ai/crm` | 404 | 404 | 404 | en | 404 \| NTA | noindex, nofollow | – |
| 9 | `/en/solutions/enterprise/boxai` | 404 | 404 | 404 | en | 404 \| NTA | noindex, nofollow | – |
| 10 | `/en/nope` | 404 | 404 | 404 | en | 404 \| NTA | noindex, nofollow | – |
| 11 | `/blog/nope` | 404 | 404 | 404 | vi | 404 \| NTA | noindex, nofollow | – |
| 12 | `/products/nope` | 404 | 404 | 404 | vi | 404 \| NTA | noindex, nofollow | – |
| 13 | `/case-studies/nope` | 404 | 404 | 404 | vi | 404 \| NTA | noindex, nofollow | – |
| 14 | `/case-studies/xyz-nope` | 404 | 404 | 404 | vi | 404 \| NTA | noindex, nofollow | – |
| 15 | `/solutions/ai/crm` | 404 | 404 | 404 | vi | 404 \| NTA | noindex, nofollow | – |
| 16 | `/solutions/enterprise/boxai` | 404 | 404 | 404 | vi | 404 \| NTA | noindex, nofollow | – |
| 17 | `/nope` | 404 | 404 | 404 | vi | 404 \| NTA | noindex, nofollow | – |
| 18 | `/fr/blog` | 404 | 404 | 404 | vi | 404 \| NTA | (script không kiểm) | – |
| 19 | `/blog/first-steps` | 200 | 200 | 200 | – | NTA chia sẻ định hướng phát triển giải pháp số \| NTA | – | – |
| 20 | `/en/blog/first-steps` | 200 | 200 | 200 | – | NTA shares its approach to digital solutions \| NTA | – | – |
| 21 | `/products/hair-style-ai` | 200 | 200 | 200 | – | Ứng dụng Hairstyle AI \| NTA | – | – |
| 22 | `/en/products/hair-style-ai` | 200 | 200 | 200 | – | Hairstyle AI App \| NTA | – | – |
| 23 | `/case-studies/heritage-site-ai-camera` | 200 | 200 | 200 | – | Phương án AI camera và flycam cho một khu di tích ở Việt Nam \| Case Study \| NTA | – | – |
| 24 | `/en/case-studies/heritage-site-ai-camera` | 200 | 200 | 200 | – | Proposed AI camera and drone plan for a heritage site in Vietnam \| Case Study \| NTA | – | – |
| 25 | `/solutions/ai/boxai` | 200 | 200 | 200 | – | BoxAI \| NTA | – | – |
| 26 | `/en/solutions/ai/boxai` | 200 | 200 | 200 | – | BoxAI \| NTA | – | – |
| 27 | `/solutions/enterprise/crm` | 200 | 200 | 200 | – | Giải pháp CRM \| NTA | – | – |
| 28 | `/en/solutions/enterprise/crm` | 200 | 200 | 200 | – | CRM Solution \| NTA | – | – |
| 29 | `/` | 200 | 200 | 200 | – | NTA \| Giải pháp Doanh nghiệp, AI và Ứng dụng AI | – | – |
| 30 | `/en` | 200 | 200 | 200 | – | NTA \| Enterprise, AI and App Solutions | – | – |
| 31 | `/en/blog` | 200 | 200 | 200 | – | Blog \| NTA | – | – |
| 32 | `/blog` | 200 | 200 | 200 | – | Tin tức \| NTA | – | – |
| 33 | `/sitemap.xml` | 200 | 200 | 200 | – | – | – | – |
| 34 | `/case-studies/oc-eo-learning` | 301 | 301 | 301 | – | – | – | `/case-studies/heritage-site-ai-camera` |
| 35 | `/vi/case-studies/oc-eo-learning` | 301 | 301 | 301 | – | – | – | `/case-studies/heritage-site-ai-camera` |
| 36 | `/en/case-studies/oc-eo-learning` | 301 | 301 | 301 | – | – | – | `/en/case-studies/heritage-site-ai-camera` |

Ghi chú: ở chế độ db, lần chạy smoke chỉ in các dòng lệch (`grep -v "| OK |"`), không có dòng nào và `MISMATCH=0`. Title, robots và ngôn ngữ của các dòng 404 nằm trong điều kiện OK của script nên vẫn được kiểm như ở chế độ file. Cột title của các URL 200 lấy từ lần chạy file.

### Kịch bản db: 404 bị cache ISR → tạo bài → revalidate → 200 (`CONTENT_SOURCE=db`, :3912)
Dựng "slug mới" trên DB tạm: sau import-seed, xoá hẳn bản en của `post/ai-weekly-2026-w42` (chỉ trong DB tạm `nta_smoke`):
`DELETE FROM content_versions WHERE entry_id IN (SELECT id FROM content_entries WHERE collection='post' AND locale='en' AND slug='ai-weekly-2026-w42'); DELETE FROM content_entries WHERE collection='post' AND locale='en' AND slug='ai-weekly-2026-w42';` → `DELETE 1` / `DELETE 1`.

| Bước | Lệnh | Kết quả |
|---|---|---|
| 1 | `curl -D - http://localhost:3912/en/blog/ai-weekly-2026-w42` (lần 1) | `404`, `x-nextjs-cache: MISS`, `Cache-Control: s-maxage=31536000` |
| 2 | cùng URL (lần 2) | `404`, `x-nextjs-cache: HIT`, `Cache-Control: s-maxage=31536000` (404 đã vào full-route cache) |
| 3 | `DATABASE_URL=<DB tạm loopback> npm run db:cli -- publish-post ai-weekly-2026-w42` | `publish-post post/vi/ai-weekly-2026-w42 status=exists` · `publish-post post/en/ai-weekly-2026-w42 status=created` |
| 4 | GET URL trước khi revalidate | `404` (vẫn đọc cache, đúng kỳ vọng) |
| 5 | `REVALIDATE_URL=http://127.0.0.1:3912/api/revalidate REVALIDATE_SECRET=<test-secret> npm run db:cli -- revalidate --collection post --slug ai-weekly-2026-w42` | `[revalidate] OK — {"status":"ok","revalidated":["content:post","content:post:ai-weekly-2026-w42"]}` |
| 6 | GET URL ×3 (cách nhau 1s) | `200` ×3, `<title>AI Weekly Digest — Week 42, 2026 \| NTA</title>` |
| 7 | GET `http://localhost:3912/blog/ai-weekly-2026-w42` | `200` |
| 8 | `docker logs nta-smoke-db 2>&1 \| grep -c 'static to dynamic'` | `0` |

## Verification Summary
| Lệnh | Kết quả |
|---|---|
| Test hồi quy trên HEAD (trước khi sửa) `node --import tsx --test "src/app/**/*.test.ts"` | FAIL 2/2 (đúng kỳ vọng test-first) |
| `npm test` (sau fix) | tests 104 · pass 102 · fail 0 (gồm 2 test mới, đều pass) |
| `npm run typecheck` | PASS (0 lỗi) |
| `npm run lint` | PASS: 0 error, 1 warning có sẵn `@next/next/no-img-element` ở `src/components/mdx/index.tsx:25` (ngoài scope) |
| `docker build -t nta-web-smoke:tmp .` | PASS (`✓ Compiled successfully`) |
| `docker build --target builder -t nta-web-buildcheck:tmp .` + `docker rmi` | PASS (exit 0), image đã xoá |
| Smoke `CONTENT_SOURCE=file` | 36/36 OK, `static to dynamic` = 0 |
| Smoke `CONTENT_SOURCE=db` (Postgres tạm + migrate + import-seed) | 36/36 OK, `static to dynamic` = 0, kịch bản revalidate PASS |
| Dọn dẹp | đã xoá container `nta-smoke-file/db/pg` và image `nta-web-smoke:tmp`, `nta-web-buildcheck:tmp`, `postgres:16` |

- **Files:** `src/app/[locale]/not-found.tsx` (sửa: `generateMetadata` → `export const metadata` `{ title: { absolute: '404 | NTA' }, robots: { index: false, follow: false } }`), `src/app/[locale]/not-found.test.ts` (mới).
- **Doc impact:** no doc impact (không đổi API/schema/behavior đã tài liệu hoá; 404 là hành vi mong đợi sẵn).

### Residual risk
- **Title 404 cố định** `404 | NTA` cho cả vi lẫn en (user chọn (a)), tab trình duyệt không còn title theo ngôn ngữ. Trang noindex nên không ảnh hưởng SEO.
- **404 của URL `/en/...` giờ được cache ISR** (`s-maxage=31536000`). Đã chứng minh revalidate theo tag mở lại được slug (bước 5–6). Nhưng nếu tạo bài mà **không** gọi `/api/revalidate` thì URL kẹt ở 404 cho tới khi revalidate. **CDN/nginx phía trước chưa kiểm**: nếu proxy tôn trọng `s-maxage` thì 404 có thể bị cache ngoài Next, và revalidate của Next không xoá được. Cần kiểm ở bước smoke prod sau deploy.
- **Key `notFound.title`** trong `src/i18n/messages/{vi,en}.json` không còn được dùng. Giữ nguyên để parity nguồn file/DB (`ui_messages`), không xoá trong bug này.
- **Test hồi quy là regex tĩnh** trên source `not-found.tsx` (chặn `generateMetadata` quay lại); nó không chứng minh HTTP 404, bằng chứng HTTP là smoke Docker ở trên. Nếu đổi format code (vd tách metadata sang biến khác) test có thể báo sai.
- Kịch bản "slug mới" được dựng bằng cách xoá bản en của 1 bài seed trong DB tạm rồi `publish-post` lại, không phải slug chưa từng tồn tại. Vẫn đi cùng đường code: 404 → insert → revalidate tag.
- Smoke prod sau deploy chưa chạy (thuộc bước sau push).
