# Agent: reviewer — feature-content-database · phase-3-task-04 · round 1

- **CR:** CR-031 · R-16 (4.2.0) quyết định #9 · Task: `tasks/feature-content-database/phase-3-task-04.md`
- **Review level:** STRICT
- **Reason:** đổi shared i18n (`src/i18n/request.ts` — messages của MỌI trang + `NextIntlClientProvider`), nguồn dữ liệu liên hệ dùng ở layout (Footer + JSON-LD Organization mọi trang) và trang Liên hệ; cache key/tag data cache; nội dung từ DB render vào `href`/`iframe src`/JSON-LD.
- **Blast radius:** mọi route `[locale]/*` (messages + Footer + JSON-LD Organization), `/contact` + `/en/contact` (ContactDetails + JSON-LD ContactPage), revalidate tag `content:ui_messages`/`content:company_info`, seed `tools/db/file-source.ts` (đổi nơi khai báo `COMPANY_INFO_SLUG`). Client component (`ContactForm`, `useContactForm`, `contact-schema`) chỉ import hằng form — không đổi. Ngoài scope review: `docs/content-bot/`, `spec/changes/2026-10-14-telegram-content-bot.md`, `.context/progress.json`, `.context/runs/*`.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm test` | 78 tests: 77 pass, 0 fail, 1 skip (import/parity cần `TEST_DATABASE_URL`) |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — 0 error, 1 warning `<img>` có sẵn (`src/components/mdx/index.tsx:25`, ngoài diff) |
| `npm run build` (`SWC_NATIVE_BINDING_CACHE=C:\Users\datda\.swc-native-cache`, chế độ file) | PASS — `[locale]/*` vẫn `●` (generateStaticParams), `ƒ /api/revalidate`, `ƒ /sitemap.xml`, `ƒ Middleware` |
| Build/crawl chế độ `db`, write-path, thiếu key → 500, DB dừng, TTFB | Không tự chạy (reviewer không chạy app/DB) — dựa evidence Builder (task file mục Verification summary), nhất quán với code |

## Skill gates
| Gate | Kết quả |
|---|---|
| aislop (`npx aislop scan --changes --json`) | OK — score **99** (≥ 80). 1 error `ai-slop/hallucinated-import` `company-contact.ts:1` "server-only" không khai báo trong package.json (false positive: Next 15 alias sẵn `server-only`, cùng pattern `store.ts:1` đã PASS P3-T01); 2 warning: `company-contact.ts:21` double assertion, `company-info.ts:37` hardcoded URL (Google Maps, có sẵn) |
| oxlint (anti-slop) | skip, oxlint not configured (không có `.oxlintrc*`) |
| ocr (open-code-review) | skip, ocr not installed |
| AI-readable | OK — hàm ngắn (`collectShapeProblems` ~25 dòng), tên rõ, hằng có tên (`MAX_REPORTED_PATHS`), comment nêu WHY. 0 indicator |
| ai-friendly-web | N/A — không đổi robots/sitemap/llms; JSON-LD giữ nguyên nội dung ở chế độ file |
| blitzstrike | skip, không có môi trường pentest được phép |

## Responsive Checklist Gate
Diff UI chỉ đổi nguồn dữ liệu (props `contact`), **không đổi markup/class/CSS** (`Footer.tsx`, `ContactDetails.tsx` chỉ đổi chữ ký hàm + destructure). Builder: crawl 79 URL hash HTML chuẩn hoá trùng baseline 79/79.
| Mục | Kết quả |
|---|---|
| Layout (scroll ngang, mobile-first, grid) | N/A — không đổi layout |
| Typography/Spacing | N/A — không đổi |
| Media (iframe map) | N/A — cùng thuộc tính, chỉ đổi nguồn `embedUrl` |
| Touch/Interaction | N/A — không đổi |
| Viewport/A11y | N/A — không đổi |

## Kiểm theo trọng tâm

### Chế độ file (prod hiện tại) — OK
- `request.ts:31`: thêm đúng 1 lần `getContentSource()` (đọc env + trim) rồi `import('./messages/<locale>.json')` như cũ. Route `[locale]/*` là ISR (`●`) → `getRequestConfig` chỉ chạy khi render (miss), không phải mỗi request hit. Chi phí không đáng kể; Builder đo TTFB file mode không tệ hơn baseline.
- `getCompanyContact` (`company-contact.ts:17`) trả đúng hằng `COMPANY_CONTACT`; `jsonld.ts` chỉ đổi tham số → JSON-LD byte-giống. Bỏ `as const` ở `company-info.ts` → kiểu theo `interface CompanyContact`; typecheck PASS, không consumer nào dựa literal type.

### Chế độ db — shape check + cache — OK (có 1 MAJOR thiết kế, xem Findings)
- `shape.ts`: object → kiểm từng key của bản file (`key in candidate`), đệ quy; mảng chỉ kiểm là mảng; lá kiểm `typeof`; chuỗi file có chữ mà DB rỗng/whitespace → lỗi; `null` ở chỗ cần string → "cần string". Key thừa chấp nhận, không theo thứ tự (jsonb). Ném lỗi → trang 500, `unstable_cache` không lưu kết quả lỗi vì lỗi ném NGOÀI hàm cache (`assertMatchesShape` chạy sau `getEntries`) → data cache vẫn giữ bản DB, trang lỗi không vào route cache. Test `shape.test.ts` phủ đủ: đủ key/thứ tự khác/key thừa, thiếu lồng, sai kiểu/rỗng/null gốc, giới hạn 10, seed khớp chính nó.
- Tag: `getEntries('ui_messages'|'company_info', locale)` → `store.ts:27` `contentTags(collection)` = `['content','content:<c>']`; revalidate `{collection, slug}` luôn kèm tag collection (`revalidate.ts:55`) → khớp. Test `revalidate.test.ts:106-110` chốt whitelist + tag. Cache hit không query DB: `unstable_cache` key `['content-entries', c, locale]` + Builder đo `xact_commit` ~không đổi qua ~780 request.
- `readDbMessages` gộp `{slug: data}` theo namespace cấp 1 — khớp seed `file-source.ts` (1 bản ghi/locale/namespace).

### Ranh giới server/client — OK
- `company-contact.ts:1` `import 'server-only'`; chỉ import ở `[locale]/layout.tsx`, `contact/page.tsx` (server). `Footer`, `ContactDetails` không có `'use client'`, chỉ `import type` từ `company-info.ts`. Client (`ContactForm.tsx:9`, `useContactForm.ts:4`, `contact-schema.ts:1`) chỉ import `CONTACT_NEEDS`/`COMPANY_MAX_LENGTH`/`isContactNeed` — `company-info.ts` không kéo DB.
- Grep `COMPANY_CONTACT|createOrganizationJsonLd|createContactPageJsonLd` toàn `src/` + `tools/`: không còn nơi dùng hằng trực tiếp ngoài getter, seed, test. API contact/email, sitemap, robots không dùng company-info. Còn sót duy nhất: metadata description `contact/page.tsx:16-17` ghi cứng SĐT/email/địa chỉ (Builder đã ghi Residual risk) → MINOR.
- `middleware.ts` chỉ import `routing` — không kéo `request.ts`/DB vào edge.

### next-intl — OK
- `layout.tsx:59` `getMessages()` lấy từ cùng `getRequestConfig` → `NextIntlClientProvider` nhận đúng bản DB (chế độ db) / file (chế độ file); server `getTranslations` và client `useTranslations` cùng nguồn → không lệch hydration. Locale: `hasLocale` → fallback `defaultLocale` như cũ. Không có nơi nào khác đọc `messages/*.json` trực tiếp (grep).

### `.next/cache` qua deploy trên VPS — OK (không rủi ro prod)
- `Dockerfile:31-32` chỉ copy `.next/standalone` + `.next/static` (không có `.next/cache` của stage builder); `docker-compose.yml:38-39` volume duy nhất của `nta-web` là `/app/uploads` — **không** mount `.next/cache`. Data cache/route cache runtime nằm trong writable layer của container → deploy image mới (container recreate) bắt đầu sạch; `docker restart` giữ cache + trạng thái tag cùng nhau → nhất quán. Vấn đề Builder gặp chỉ là `.next/cache` local giữa các lần `next build` trên máy dev.

### Scope — OK
- Không đụng upload ảnh (P3-T05). Không migration (2 collection đã có trong `CONTENT_COLLECTIONS`, cột text). `COMPANY_INFO_SLUG` dời sang `content-rules.ts` + re-export ở `file-source.ts` — trace về task (dùng chung web + seed).

## Findings

### [MAJOR] F1 — Sau cutover, mỗi bản phát hành code thêm key chữ giao diện (hoặc thêm trường `CompanyContact`) sẽ làm **toàn site 500** cho tới khi DB được bổ sung
- **Vị trí:** `src/i18n/request.ts:21` (`assertMatchesShape(file JSON trong image, bản DB)`), `src/lib/contact/company-contact.ts:20`; deploy `.github/workflows/deploy.yml:48-54` (chỉ `check` + `migrate`, không có bước đồng bộ/kiểm `ui_messages`/`company_info` với image mới).
- **Kịch bản:** cờ `CONTENT_SOURCE=db` đang chạy. Dev thêm `footer.newKey` vào `messages/vi.json` + dùng trong JSX → deploy image mới → container recreate (cache rỗng) → mọi trang `[locale]/*` render đọc DB thiếu `footer.newKey` → `[content-shape] ... footer.newKey: thiếu` → **500 toàn bộ vi+en** (layout dùng messages). Không có gate trước khi swap container, task phase-4/5 cũng chưa có bước nào xử lý (grep `tasks/feature-content-database/phase-[45]-*.md`). Kiểm cấu trúc chặn đúng trường hợp bot/SQL xoá key, nhưng biến luồng phát triển thường ngày (thêm chữ mới) thành sự cố toàn site — mâu thuẫn mục tiêu khả dụng R-16.
- **Đề xuất fix (chọn 1, cần change-request/user chốt vì chạm quyết định "không fallback âm thầm"):**
  1. Tách 2 loại lỗi: key **thiếu** trong DB → dùng giá trị file seed (deep-merge DB đè lên file) + `console.warn` liệt kê key; **sai kiểu / rỗng** vẫn ném lỗi như hiện tại. Thêm test cho nhánh merge.
  2. Giữ ném lỗi nhưng thêm gate deploy trước khi chạy app: bước `nta-migrate` (hoặc lệnh `db:cli`) so `ui_messages`/`company_info` trong DB với file của image mới → chèn **additive** key thiếu (ghi version R-16a, nguồn `deploy`) hoặc fail deploy trước khi swap; ghi vào runbook + task cutover phase-4.
  Tối thiểu: ghi rủi ro này vào task + tạo task cụ thể ở phase-4 (cutover) trước khi bật `db` ở prod.

### [MINOR] F2 — URL lấy từ DB (`phone.href`, `email.href`, `map.embedUrl`, `map.openUrl`) không kiểm scheme/host
- **Vị trí:** `src/lib/contact/company-contact.ts:20-21` (chỉ kiểm cấu trúc), render ở `ContactDetails.tsx` (`<a href>`, `<iframe src>`), `Footer.tsx` (`<a href>`).
- Chế độ db, bot/editor (CR-030) ghi nhầm hoặc bị lạm dụng có thể đặt `iframe src` tới site bất kỳ. Trust model hiện tại là editor tin cậy (MDX body từ DB còn rủi ro hơn) nên không chặn PASS.
- **Đề xuất:** kiểm ở write-path (invariant trong `src/db/content-rules.ts` cho `company_info`: `tel:`/`mailto:`/`https://www.google.com/maps` / `https://maps.google.com/`) hoặc trong `getCompanyContact` trước khi trả.

### [MINOR] F3 — `as unknown as CompanyContact` (aislop warning)
- **Vị trí:** `src/lib/contact/company-contact.ts:21`. Chấp nhận được vì vừa kiểm runtime ở dòng 20; gọn hơn: cho `assertMatchesShape` thành generic assertion `asserts candidate is T` (`reference: T`) để bỏ double assertion.

### [MINOR] F4 — Metadata description trang Liên hệ ghi cứng SĐT/email/địa chỉ
- **Vị trí:** `src/app/[locale]/contact/page.tsx:16-17`. Sửa `company_info` qua DB không đổi description (lệch nội dung SEO). Builder đã ghi Residual risk; đề xuất ghi gap/task riêng (đưa mô tả vào `ui_messages` hoặc ghép từ `getCompanyContact` trong `generateMetadata`).

### [MINOR] F5 — Thiếu unit test cho nhánh db của `readDbMessages` / `getCompanyContact`
- **Vị trí:** `src/i18n/request.ts:18-23`, `src/lib/contact/company-contact.ts:16-22`. Gộp namespace theo slug, "thiếu bản ghi company_info → lỗi", "thiếu key → lỗi" mới chỉ có evidence thủ công của Builder. Đề xuất tách hàm thuần (`mergeNamespaces(entries)`, `pickCompanyContact(entries)`) và test bằng `node:test` như `shape.test.ts`.

### [MINOR] F6 — Shape check không kiểm phần tử mảng
- **Vị trí:** `src/lib/content/shape.ts:25-28`. Mảng rỗng/phần tử sai kiểu trong DB vẫn qua (render thiếu mục, không báo). Ghi chú; xử lý cùng F1 nếu đổi chiến lược kiểm.

## Residual risk
- Không tự chạy chế độ `db` (build/crawl/write-path/500/TTFB) — dựa evidence Builder; code nhất quán với evidence.
- Payload RSC chế độ db khác thứ tự key so với file (HTML trùng) — đã ghi ở task, không ảnh hưởng.
- Doc impact dời phase-5-task-01 (`docs/DESIGN.md`, `docs/content-bot/08`, `09`) — hợp lệ với kế hoạch, cần theo dõi.

## Verdict: ❌ FAIL
Lý do: 1 MAJOR (F1 — rủi ro sự cố toàn site ở chế độ db khi phát hành code thêm key, chưa có gate/task xử lý). Chế độ file (prod hiện tại) đúng, không đổi hành vi; ranh giới server/client, tag cache, next-intl, `.next/cache` đều OK. Sửa F1 (một trong hai hướng, hoặc user chấp nhận rủi ro + tạo task phase-4 cụ thể kèm gate trước cutover) → round 2.
