# Agent: reviewer — feature-content-database · phase-3-task-04 · round 2

- **CR:** CR-031 · R-16 (4.2.0) quyết định #9 · Task: `tasks/feature-content-database/phase-3-task-04.md` (mục Round 2)
- **Review level:** STRICT
- **Reason:** như round 1 (shared i18n mọi trang, Footer/JSON-LD layout, cache tag) + round 2 thêm logic gộp DB/file chạy ở mọi trang chế độ db và rule validate write-path (`checkRecord`, dùng bởi `content-repo.ts:188` cho mọi ghi DB).
- **Blast radius:** `src/i18n/request.ts` (messages mọi trang), `src/lib/contact/company-contact.ts` (layout + `/contact`), `src/lib/content/{shape,ui-data}.ts` (mới/thay), `src/db/content-rules.ts` (`checkRecord` → write-path `content-repo.ts` + `parity-check.ts` + `import-seed.ts`), `.context/decisions.md`. Bỏ qua theo yêu cầu: `spec/changes/BACKLOG.md`, `spec/changes/2026-10-14-en-invalid-slug-500.md` (CR-032), `docs/content-bot/`, `.context/progress.json`, `.context/runs/*`.
- **Round 1:** `feature-content-database-phase-3-task-04-round-1-review.md` (FAIL — F1 MAJOR) — giữ nguyên.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm test` | 86 tests: 85 pass, 0 fail, 1 skip (import/parity cần `TEST_DATABASE_URL`) |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — 0 error, 1 warning `<img>` có sẵn (`src/components/mdx/index.tsx:25`, ngoài diff) |
| `npm run build` (`SWC_NATIVE_BINDING_CACHE=C:\Users\datda\.swc-native-cache`, chế độ file) | PASS — `Compiled successfully` |
| Chế độ db (crawl, thiếu key → 200 + warn, sai kiểu → 500, write-path từ chối embedUrl lạ, TTFB) | Không tự chạy (reviewer không chạy app/DB) — dựa evidence Builder (task file "Verification round 2"), nhất quán với code + unit test |

## Skill gates
| Gate | Kết quả |
|---|---|
| aislop (`--changes`) | OK — score **99**. Còn: `hallucinated-import` "server-only" `company-contact.ts:1` (false positive, Next alias — như round 1), `hardcoded-url` `company-info.ts:37` (URL Google Maps có sẵn). Warning double-assertion round 1 đã hết |
| oxlint (anti-slop) | skip, oxlint not configured |
| ocr | skip, ocr not installed |
| AI-readable | OK — hàm ≤ 20 dòng, tách thuần (`ui-data.ts`) khỏi đọc DB, comment nêu WHY. 0 indicator |
| ai-friendly-web | N/A — không đổi robots/sitemap/llms/JSON-LD |
| blitzstrike | skip, không có môi trường pentest được phép |
| Responsive Checklist Gate | N/A — round 2 không đụng UI/markup/CSS |

## (1) Đóng finding round 1
| Finding | Trạng thái | Bằng chứng |
|---|---|---|
| F1 MAJOR — thêm key trong code → toàn site 500 | **Đóng** | `shape.ts:36-51` key thiếu (`allowFallback`) → giá trị file + `missing`; `ui-data.ts:19-23` warn. Quyết định user ghi `decisions.md` (file seed giữ lâu dài, phase 5 không xoá). Test `ui-data.test.ts:31-42` (thiếu `footer.copyright` + thiếu cả namespace `nav` → file + 1 warn) |
| F2 MINOR — URL company_info không kiểm | **Đóng** (còn MINOR nhỏ R2-1 về `openUrl`) | `content-rules.ts:98-124` + `:141`; gọi ở write-path `content-repo.ts:188` (`validateRecord`) → bot/CLI ghi DB đều qua |
| F3 MINOR — `as unknown as` | **Đóng** | `mergeOverFile<T>` generic; 1 điểm ép `value as T` nội bộ có comment (`shape.ts:86-87`) — hợp lệ vì sai cấu trúc đã ném trước đó |
| F4 MINOR — metadata `/contact` ghi cứng | Không sửa (Residual risk, đã ghi) | Chấp nhận — ngoài scope |
| F5 MINOR — thiếu test nhánh db | **Đóng** | `ui-data.ts` thuần, warn inject; `ui-data.test.ts` 6 test (gộp = file, DB đè, thiếu → file + warn, rỗng → lỗi không warn, company_info thiếu trường, không có bản ghi/sai kiểu) |
| F6 MINOR — không kiểm phần tử mảng | **Đóng** | `shape.ts:53-61`: rỗng khi file có phần tử → lỗi; từng phần tử kiểm theo `fileValue[0]`, `allowFallback=false`. Test `shape.test.ts:34-44` |

## (2) Logic gộp sâu `mergeOverFile`
- **Không ghi đè bằng giá trị sai:** mọi nhánh sai (object ↔ không object, mảng ↔ không mảng, `typeof` khác, `null`, chuỗi rỗng khi file có chữ, mảng rỗng khi file có phần tử) đẩy vào `state.problems`; `mergeOverFile:83-85` ném nếu có bất kỳ problem nào → giá trị placeholder (`return fileValue`) không bao giờ trả ra ngoài. Không có try/catch nuốt lỗi; lỗi kiểu **không** đi qua kênh warn (test `ui-data.test.ts:44-49` chốt "không warn").
- **Chỉ "thiếu key" mới fallback**, và chỉ ở cấp object (không áp dụng trong phần tử mảng — đúng, vì không có giá trị file tương ứng vị trí). Key thừa DB giữ (`{...dbValue}`).
- **Mảng không mất phần tử:** `dbValue.map(...)` giữ đủ mọi phần tử DB, dài hơn hay ngắn hơn file đều giữ nguyên độ dài DB (DB là nguồn sự thật). File dài hơn DB → phần tử file dư **không** chèn vào (đúng — không trộn danh sách). Chỉ DB rỗng (file có phần tử) mới lỗi. Mảng thiếu hẳn (key không có trong DB) → lấy nguyên mảng file + warn.
- **Warn "1 lần/process":** khoá theo **toàn chuỗi message** (label + số key + ≤10 đường dẫn) → DB đổi sang tập key thiếu khác ⇒ message khác ⇒ warn lại; lỗi sai kiểu/rỗng luôn ném, không bao giờ bị nén. Chỉ không báo lại khi **cùng đúng tập key thiếu** tái diễn sau khi đã được sửa (đã từng log) — chấp nhận được (MINOR R2-3). Set chỉ tăng theo số message khác nhau — không rò rỉ đáng kể.
- **Cache:** fallback chạy sau `getEntries` (ngoài `unstable_cache`) → data cache chỉ chứa bản DB thô; bot bổ sung key + revalidate → trang dùng giá trị DB ngay.

## (3) Validate URL company_info — thử bypass
Dùng `new URL()` (WHATWG) rồi so `protocol`/`hostname` đã chuẩn hoá — không so chuỗi thô:
| Đầu vào | Kết quả |
|---|---|
| `https://google.com.evil/maps` (embed) | hostname `google.com.evil` ∉ whitelist → **chặn** |
| `https://www.google.com@evil.com/maps` (userinfo) | hostname `evil.com` → **chặn** |
| `https://www.google.com.:443/maps` (dấu chấm cuối) | hostname `www.google.com.` ∉ whitelist → **chặn** (an toàn, chặt) |
| `https://www.google.com/maps/../../url?q=evil` | pathname chuẩn hoá `/url` → **chặn** |
| `JAVASCRIPT:alert(1)` / `javascript:` cho `phone.href` | protocol `javascript:` ≠ `tel:` → **chặn** (test `content-rules.test.ts:98`) |
| `HTTPS://WWW.GOOGLE.COM/maps?...` | chuẩn hoá thường → cho qua (hợp lệ, cùng host) |
| `http://maps.google.com/maps` | không https → **chặn** (test `:107`) |
| thiếu `map` / giá trị không phải chuỗi | `parseUrl` → null → **chặn** (test `:108`) |
| `map.openUrl = https://evil.example/` | **cho qua** — chỉ kiểm `https:` (xem R2-1) |
| `phone.href = tel:...` có ký tự lạ | cho qua — scheme `tel:` vô hại |
Write-path chặn được; đường đọc web không kiểm URL (sửa thẳng bằng SQL sẽ bỏ qua) — chấp nhận vì DB chỉ ghi qua repo/CLI (đã ghi round 1).

## (4) Regression
- Chế độ file: `request.ts`/`company-contact.ts` nhánh file không đổi so với round 1 (hằng / import JSON). Builder crawl 79/79 + JSON-LD trùng byte.
- `checkRecord` thêm rule chỉ cho `collection === "company_info"`; seed hiện tại PASS (`content-rules.test.ts:27` duyệt mọi bản ghi seed + `:94`). Không ảnh hưởng collection khác.
- `ui-data.ts` không `server-only` (để test) nhưng chỉ được import bởi file server (`request.ts`, `company-contact.ts`); không client nào import. typecheck/lint/test/build PASS.

## Findings round 2

### [MINOR] R2-1 — `map.openUrl` chấp nhận mọi host https
- **Vị trí:** `src/db/content-rules.ts:122`. Link "mở bản đồ" (`<a href>` trang Liên hệ) có thể trỏ tới site bất kỳ nếu bot/editor ghi nhầm. Không phải XSS (chỉ https). **Đề xuất:** dùng chung whitelist host Google Maps như `embedUrl` (`www.google.com|maps.google.com|google.com|maps.app.goo.gl`).

### [MINOR] R2-2 — `key in dbValue` dính prototype
- **Vị trí:** `src/lib/content/shape.ts:44`. Nếu file có key trùng tên thuộc tính của `Object.prototype` (`constructor`, `toString`...) mà DB thiếu → không fallback mà báo "cần string" (500). Hiện messages/hằng không có key như vậy (grep 0). **Đề xuất:** `Object.hasOwn(dbValue, key)`.

### [MINOR] R2-3 — Phần tử mảng kiểm theo `fileValue[0]` + warn-once theo chuỗi
- **Vị trí:** `shape.ts:60`, `ui-data.ts:11-17`. Nếu sau này file có mảng object không đồng nhất (phần tử đầu có key mà phần tử khác không có), dữ liệu DB hợp lệ sẽ bị báo thiếu. Hiện chỉ có mảng chuỗi (`about.core.items`) → không ảnh hưởng. Warn-once không báo lại khi cùng tập key thiếu tái diễn trong cùng process. Ghi chú, không cần sửa ngay.

## Residual risk
- Không tự chạy chế độ db — dựa evidence Builder round 2.
- Key thiếu trong DB được lấp bằng chữ file → DB có thể lệch file lâu dài nếu không ai đọc log (Builder đã ghi; quyết định user).
- F4 (metadata `/contact` ghi cứng) vẫn mở — nên có task/gap riêng.
- Doc impact dời phase-5-task-01 (DESIGN + content-bot 08/09, kèm "file seed là bản dự phòng lâu dài").

## Verdict: ✅ PASS
Không còn CRITICAL/MAJOR. F1/F2/F3/F5/F6 đã đóng; F4 giữ ở Residual risk; 3 MINOR mới (R2-1..R2-3) không chặn, đề xuất xử lý khi tiện (R2-1, R2-2 sửa 1 dòng).
