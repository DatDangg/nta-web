# feature-content-database · phase-3-task-04 — Chữ giao diện (next-intl messages) + thông tin công ty đọc từ DB

- **CR:** CR-031 · spec R-16 (4.2.0, quyết định #9)
- **Classification / Risk:** MODIFY (i18n + shared) · HIGH
  - Expected review level: **STRICT** (shared i18n cho mọi trang, footer/liên hệ, navigation)
  - Blast radius: `src/i18n/request.ts`, `src/lib/contact/company-info.ts` + ~6 file dùng, mọi trang (messages).
  - Doc impact: DESIGN, content-bot 08/09 (phase 5).

## Scope
1. `getRequestConfig`: `CONTENT_SOURCE=db` → messages lấy từ collection `ui_messages` (gộp namespace) qua `store.ts` có cache tag
   `content:ui_messages`; `file` → import JSON như hiện tại (fallback). Validate: bản DB phải đủ key như file seed (thiếu key → lỗi rõ, không render chuỗi rỗng).
2. `company-info.ts` → getter async đọc collection `company_info` theo locale (chế độ `file` giữ hằng hiện tại); cập nhật nơi dùng.
3. Revalidate (P3-T03) nhận `ui_messages`, `company_info` trong whitelist.
4. Kiểm: chế độ `file` HTML y nguyên; chế độ `db` sửa 1 chuỗi messages + 1 trường company-info → revalidate → web đổi không build.

## Acceptance
- 2 chế độ cờ đều build + chạy; parity HTML chế độ `db` = `file`. typecheck/lint/test/build PASS.

## Thiết kế (builder)
- `src/i18n/request.ts`: `CONTENT_SOURCE=file` → `import('./messages/<locale>.json')` như cũ (chỉ thêm 1 lần đọc cờ). `db` → `getEntries('ui_messages', locale)`
  (store.ts, `unstable_cache` tag `content` + `content:ui_messages`) → gộp `{namespace: data}` → `assertMatchesShape(file JSON, bản DB)`.
- `src/lib/content/shape.ts` (mới, thuần): so cấu trúc bản DB với bản file seed — key thiếu / sai kiểu / chuỗi rỗng (file có chữ) → ném lỗi liệt kê ≤ 10 đường dẫn;
  không dựa thứ tự key (jsonb), key thừa chấp nhận. Lỗi ném ra → trang 500, Next không cache trang lỗi.
- Company info: `company-info.ts` vẫn là hằng + `interface CompanyContact` (file này client cũng import — `CONTACT_NEEDS`, `COMPANY_MAX_LENGTH` — nên KHÔNG đọc DB ở đây).
  Getter server-only mới `src/lib/contact/company-contact.ts` `getCompanyContact(locale)`: file = hằng; db = `company_info/<locale>/contact` qua store + kiểm cấu trúc.
  Nơi dùng nhận qua props/tham số: `[locale]/layout.tsx` (Footer + JSON-LD Organization), `contact/page.tsx` (ContactDetails + JSON-LD ContactPage);
  `Footer`, `ContactDetails` (server component) nhận prop `contact`; `jsonld.ts` `createOrganizationJsonLd(contact)`, `createContactPageJsonLd(locale, contact)`.
  Client (`ContactForm`, `useContactForm`, `contact-schema`) chỉ dùng hằng form — không đổi.
- `COMPANY_INFO_SLUG` dời từ `tools/db/file-source.ts` sang `src/db/content-rules.ts` (dùng chung web + seed; file-source re-export).
- Schema/seed/parity/revalidate: `ui_messages`, `company_info` ĐÃ có trong `CONTENT_COLLECTIONS` (cột `collection` text, không CHECK) + seed P2-T01 + parity
  (generic theo `readFileSource`) + whitelist P3-T03 → **không migration**. Thêm test whitelist 2 collection.

## Verification summary (builder, 14/10/2026)
- `npm run typecheck` PASS · `npm run lint` PASS (0 error, 1 warning có sẵn `src/components/mdx/index.tsx` `<img>`) · `npm test` 77 pass / 1 skip (cần DB) / 0 fail;
  với `TEST_DATABASE_URL` (Postgres tạm) 89 pass / 0 fail · `npm run build` PASS cả `file` và `CONTENT_SOURCE=db` (build db khi container DB đã DỪNG → build không cần DB).
- Test mới: `src/lib/content/shape.test.ts` (5 test: đủ key/thứ tự khác/key thừa, thiếu namespace/key lồng, sai kiểu/rỗng, giới hạn 10, seed messages + company_info khớp chính nó),
  `revalidate.test.ts` +1 (whitelist + tag `ui_messages`/`company_info`).
- Chế độ `file`: baseline build HEAD `63df27c` trước sửa → crawl 79 URL (52 sitemap + 27 thêm): status + hash HTML chuẩn hoá **trùng 79/79**; 7 trang mẫu **same 7/7**.
- Chế độ `db` (Postgres 16.15 Docker tạm `nta-t4-pg` cổng 55434 loopback, đã xoá; migrate → import-seed 136 bản ghi → `db:parity` PASS):
  crawl 79/79 trùng baseline, 7/7 same; 6 trang (`/`, `/en`, `/contact`, `/en/contact`, `/about`, `/en/blog`) HTML ngoài script trùng file + JSON-LD trùng byte.
- Write-path: `updateEntry` (có version) sửa `ui_messages/footer.tagline` + `company_info/contact.phone.display` cho vi+en → trước revalidate web vẫn bản cũ →
  `db:cli revalidate --collection ui_messages --slug footer` + `--collection company_info --slug contact` → `/`, `/about`, `/contact` (vi) và `/en`, `/en/contact` (MISS rồi HIT) hiện chuỗi mới, không build lại.
- Thiếu key: xoá `footer.copyright` (vi) bằng SQL + revalidate → `/about`, `/contact` 500, log `[content-shape] ui_messages/vi trong DB không đủ key so với bản file: footer.copyright: thiếu`;
  `/en/about` 200; khôi phục + revalidate → 200.
- DB dừng: trang vi đã có data cache 200; trang vừa bị revalidate mà chưa đọc lại (`/en/contact`) 500 (đúng R-16: không có cache thì báo lỗi).
- Cache hit không query DB: ~780 request db mode → `xact_commit` 532 → 536 (gồm 2 truy vấn đo của psql).
- TTFB local median/p90 ms (60 req sau 5 warmup, 3 vòng): baseline HEAD (file): `/` 24.1/35.2, `/en` 13.5/15.7, `/solutions/ai/boxai` 23.4/30.2.
  Sau — file: `/` 23.9–29.1/34–42, `/en` 13.5–14.1, `/contact` 24.5–25.0, boxai 22.8–23.9. db: `/` 25.2–32.8/36–39, `/en` 13.7–14.1, `/contact` 25.0–25.9, boxai 24.4–26.7.
  Tất cả ≤ 50 ms (R-16); chế độ file không tệ hơn baseline.

## Residual risk
- Review round 2 STRICT PASS — R2-1 (openUrl cùng whitelist Google Maps) + R2-2 (`Object.hasOwn`) sửa inline; R2-3 (phần tử mảng so theo phần tử đầu; cảnh báo không lặp cùng tập key) chấp nhận. F4 (metadata Liên hệ ghi cứng) còn mở.
- (Round 2) File JSON messages + hằng `COMPANY_CONTACT` giữ lâu dài làm bản dự phòng + chuẩn cấu trúc (decisions.md) — phase 5 không xoá.
- Gộp/kiểm cấu trúc chạy mỗi request ở chế độ db (dữ liệu ~15 KB, không đo thấy khác TTFB) — không memo.
- (Round 2) Key thiếu trong DB được lấp bằng chữ file → nếu không ai đọc log cảnh báo, DB có thể lệch file lâu dài (web vẫn đúng chữ file).
- Payload RSC (`NextIntlClientProvider`) chế độ db có thứ tự key messages theo jsonb ≠ file → byte payload khác, HTML render trùng.
- (F4, giữ) `contact/page.tsx` metadata description vẫn ghi cứng SĐT/email/địa chỉ (chuỗi SEO riêng, không lấy từ company-info trước task này) → sửa company_info qua DB không đổi description. Ngoài scope.
- Có sẵn trước task (baseline cũng vậy): `/en/*/nope` và `/en/solutions/ai/crm`, `/en/solutions/enterprise/boxai` trả 500 thay vì 404 (lỗi `requestLocale` trong log) — nên mở bug riêng.
- `.next/cache/fetch-cache` (data cache) tồn tại qua các lần `next build` local → lần đầu crawl db dính dữ liệu test cũ của P3-T03; đã xoá thư mục để đo. Image Docker build sạch nên không ảnh hưởng prod.
- DB dừng: trang có tag vừa revalidate mà chưa render lại → 500 cho tới khi DB lên (theo thiết kế R-16).

## Doc impact
- `docs/DESIGN.md` (luồng i18n/company-info theo cờ) + `docs/content-bot/08`, `09` (collection `ui_messages`/`company_info` sửa được) → dời **phase-5-task-01** (doc reconcile). Task này: no doc change.

## Round 2 — sửa theo review round 1 (`.context/review-reports/feature-content-database-phase-3-task-04-round-1-review.md`)
- **F1 (user chốt):** `src/lib/content/shape.ts` `mergeOverFile<T>` gộp sâu DB đè file: key thiếu → giá trị file + danh sách đường dẫn → `console.warn`
  (≤ 10 đường dẫn, 1 lần/process/nội dung — `warnOncePerProcess`); sai kiểu / rỗng / mảng rỗng → ném lỗi; key thừa giữ. Áp dụng ui_messages + company_info.
  Quyết định ghi `.context/decisions.md` (file seed giữ lâu dài, phase 5 không xoá).
- **F2:** `src/db/content-rules.ts` `checkRecord` → `company_info`: `phone.href` tel:, `email.href` mailto:, `map.embedUrl` https host `maps.google.com|www.google.com|google.com` path `/maps…`, `map.openUrl` https.
- **F3:** bỏ `as unknown as`; `mergeOverFile<T>(fileValue: T, …): {value: T}` generic (1 điểm ép kiểu nội bộ có comment).
- **F5:** nhánh db tách thành hàm thuần `src/lib/content/ui-data.ts` (`buildUiMessages`, `buildCompanyContact`, warn inject được); `request.ts`/`company-contact.ts` chỉ còn đọc store + gọi hàm thuần.
- **F6:** phần tử mảng kiểm theo phần tử đầu của mảng file (kiểu, rỗng, key trong object phần tử — thiếu → lỗi vì không có giá trị file tương ứng vị trí).
- **F4:** không sửa (Residual risk).

## Verification round 2 (builder, 14/10/2026)
- `npm run typecheck` PASS · `npm run lint` PASS (0 error, 1 warning có sẵn `<img>`) · `npm test` 86 tests: 85 pass / 1 skip / 0 fail;
  `TEST_DATABASE_URL` (Postgres tạm) 97/97 pass · aislop `--changes` score 99.
- Test mới/sửa: `shape.test.ts` (6: đủ key, thiếu → file + đường dẫn, sai kiểu/rỗng/null → lỗi, phần tử mảng, giới hạn 10, seed khớp chính nó),
  `ui-data.test.ts` (6: gộp namespace = file, DB đè, thiếu `footer.copyright` + thiếu namespace → file + 1 warn, rỗng → lỗi không warn, company_info thiếu trường → hằng + warn, không có bản ghi/sai kiểu → lỗi),
  `tools/db/content-rules.test.ts` +1 (URL company_info), `revalidate.test.ts` (round 1).
- `npm run build` PASS chế độ file và `CONTENT_SOURCE=db` (build db khi container DB dừng).
- Chế độ file: crawl 79 URL status + hash HTML trùng baseline HEAD `63df27c` 79/79, 7 trang mẫu 7/7, JSON-LD 6 trang trùng byte.
- Chế độ db (Postgres 16.15 tạm `nta-t4-pg`, đã xoá): migrate → import 136 bản ghi → `db:parity` PASS; crawl 79/79 trùng baseline, 7/7, JSON-LD 6/6 trùng.
- Thiếu key: SQL xoá `footer.copyright` (vi) + revalidate → `/about`, `/contact`, `/` **200** hiện chữ file "© NTA. Bảo lưu mọi quyền."; log 1 dòng
  `[content-shape] ui_messages/vi trong DB thiếu 1 key, dùng giá trị file seed: footer.copyright`.
- Sai kiểu: `footer.copyright = 123` + revalidate → `/about` 500, log `… sai cấu trúc so với bản file: footer.copyright: cần string`; khôi phục → 200.
- Write-path: `updateEntry` company_info `map.embedUrl = https://evil.example/x` → bị từ chối `I-6 company_info map.embedUrl phải là https Google Maps …`.
- TTFB median/p90 ms (60 req, 2 vòng): file `/` 22.2–23.3/25–27, `/en` 14.0–14.1, `/contact` 25.3–25.4, boxai 23.1–24.2;
  db `/` 27.3–28.7/38, `/en` 13.9, `/contact` 24.3–24.8, boxai 24.6–25.1 — tất cả ≤ 50 ms, file không tệ hơn baseline (`/` 24.1).
- Doc impact (bổ sung): DESIGN + content-bot 08/09 ghi thêm "file seed messages/company-info là bản dự phòng lâu dài" — vẫn dời phase-5-task-01.
