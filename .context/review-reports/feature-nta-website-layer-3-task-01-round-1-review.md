# Review Report — feature/nta-website · layer-3-task-01 · round 1

Agent: reviewer

- **Task:** `tasks/nta-website/layer-3-task-01.md` — API `GET /api/health` + `POST /api/contact`
- **Review level:** `STRICT`
- **Reason:** Task chạm **API contract công khai** + **security** (rate-limit, honeypot, input validation, secret `CONTACT_FORM_TARGET` server-only) — đúng nhóm risk đỏ bắt buộc STRICT (API contract/DTO dùng nhiều client + security/secret). Task file cũng ghi `Review level expected: STRICT`.
- **Blast radius:** `POST /api/contact` (public endpoint — 2 UI surface: ContactForm + CTAForm Layer 3 task-02/03), `GET /api/health` (Cloud Run uptime), `src/lib/api/{rate-limit,contact-schema,forward}.ts`; không đụng schema/DB (`db_tool: none`), không đụng SSG pages (chỉ thêm route handler).
- **Round:** 1 · **Attempt builder:** 0 (theo run journal)

## Verify commands + result

| Command | Result |
|---|---|
| `npm run lint` (web_lint_command) | **Blocked** — shell permission denied (`permission.rejected: shell`). Không retry theo Tool Loop Guard. |
| `npm run typecheck` (web_typecheck_command) | **Blocked** — shell denied |
| `npm run build` (build_command) | **Blocked** — shell denied |
| `npm run test` | `skip, test_command: null` (chưa có test framework — `.context/project-config.md:36`) |
| `aislop scan --changes --json` | `skip` — shell denied (không chạy được CLI) |
| `npx oxlint` | `skip, oxlint not configured` (không có `.oxlintrc.json`/`oxlint.json` trong repo) |
| `ocr review` | `skip` — shell denied / không xác nhận cài đặt |

> ⚠️ Không chạy được runtime/curl matrix trong phiên này. Toàn bộ acceptance bên dưới được xác minh **tĩnh trên source** (Read/Grep) — đây là source of truth cho logic; runtime evidence của builder **không được dùng làm bằng chứng PASS**. Phần không xác minh được ghi ở **Residual risk**.

## Checklist theo yêu cầu (đối chiếu contract + R-18/R-19)

| # | Hạng mục | Kết quả | Bằng chứng (file:line) |
|---|---|---|---|
| 1a | health 200 `{status:"ok",timestamp ISO}` + `Cache-Control: no-store` | **OK** | `src/app/api/health/route.ts:1-6` |
| 1b | contact 200 `{status:"ok"}` | **OK** | `src/app/api/contact/route.ts:38,43` |
| 1c | 400 `{status:"error",errors:{field}}` | **OK** | `route.ts:27,34`; `contact-schema.ts:29-47` |
| 1d | 429 `{status:"error",message}` | **OK** | `route.ts:16-19` |
| 2 | Guard order R-18 `rateLimit → validate → honeypot → forward` | **OK** | rate-limit `route.ts:15`; parse `24`; validate `32`; honeypot `37`; forward `42` |
| 3 | Honeypot filled → 200 giả, KHÔNG forward | **OK** (static) | `route.ts:37-39` return trước `forwardContactForm` |
| 4 | Rate-limit 5/10min/IP, request thứ 6 → 429, window đúng | **OK** (logic) | `rate-limit.ts:1-2,7-19` — `length >= 5` chặn, `now - t < 10*60*1000` |
| 5 | Validate name 2–100 / email / phone optional 9–15 / message 10–2000 | **OK** | `contact-schema.ts:29-44`; `EMAIL_PATTERN:13`, `PHONE_PATTERN:14` |
| 6 | Secret safety R-19 (server-only, không log PII, 500 generic) | **OK** | `forward.ts:6-9` (fail-closed nếu `NEXT_PUBLIC_CONTACT_FORM_TARGET` set); `route.ts:44-48` generic 500; `lib/api/*` chỉ được import bởi `route.ts` (grep) |
| 7 | Method ≠ POST → 405; non-JSON body → 400; không route thừa (R-15) | **OK** | App Router trả 405 khi chỉ export POST; `route.ts:23-30`; glob `src/app/api/**/*.ts` chỉ có 2 route |
| 8 | Route xuất hiện trong build, không phá SSG | **Blocked** (không chạy build) | — |
| 9 | `/api/*` không bị middleware i18n locale-prefix | **OK** | `src/middleware.ts:6-8` matcher loại trừ `api` |

## Responsive Checklist Gate

**N/A** — diff chỉ gồm API route handler + lib server-side, **không đụng UI/route/component/CSS**. Không áp dụng gate responsive.

## Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| aislop | `skip` — shell denied, không chạy được `aislop scan` | — |
| oxlint (anti-slop) | `skip, oxlint not configured` | glob không tìm thấy config oxlint |
| ocr (open-code-review) | `skip` — shell denied / chưa xác nhận cài | — |
| AI-readable (ai-readable-codebase) | **OK** | file 6–63 dòng (<300), hàm ≤50 dòng; tên self-descriptive (`isContactRateLimited`, `validateContactForm`, `forwardContactForm`); không magic number vô nghĩa (hằng số có tên); 1 file 1 trách nhiệm. <3 indicator. |
| ai-friendly-web | **N/A** | Task API, không thêm/sửa web page/SEO artifact (llms.txt/robots/sitemap ngoài scope task này) |
| blitzstrike (pentest) | `skip` — không có môi trường/không cài; chỉ finding STRIKE-validated mới tính FAIL | — |

## Findings

### [MAJOR] Rate-limit bị bypass qua header `X-Forwarded-For` do client kiểm soát
- **File:** `src/app/api/contact/route.ts:10-12` (hàm `getClientIp`)
- **Evidence:** `getClientIp` lấy `x-forwarded-for` rồi `split(',')[0]?.trim()` — **token trái cùng**. Trên GCP Cloud Run/GFE (deploy platform đã chốt `gcp-cloud-run`, `.context/project-config.md:51`), platform **append** IP client thật vào cuối chuỗi; token trái cùng có thể do client tự gửi. Kẻ tấn công đổi giá trị `X-Forwarded-For` mỗi request → mỗi request là một "IP" khác → **không bao giờ chạm ngưỡng 5/10 phút** → vô hiệu hoá toàn bộ control chống spam (chính là security control của task). Builder đã ghi residual "trusts forwarded client IP header" nhưng chưa mitigate và chưa được user chấp nhận.
- **Ảnh hưởng:** `POST /api/contact` public — spam/abuse không giới hạn; kèm Finding dưới đây thành vector DoS.
- **Fix đề xuất:** xác định IP tin cậy theo trust boundary của platform (ví dụ lấy token do GFE append ở cuối chuỗi, hoặc dùng header do infra set như `x-real-ip`), **không** tin token client gửi; validate token là IP hợp lệ; nếu không xác định được → fallback bucket an toàn (không dùng chung `unknown` cho tất cả). Nếu cần "đúng" theo thiết kế hiện tại, tối thiểu ghi rõ + được user accept như một residual có kiểm soát.

### [MINOR] Map rate-limit không evict IP cũ → tăng bộ nhớ vô hạn
- **File:** `src/lib/api/rate-limit.ts:4,7-19`
- **Evidence:** `requestsByIp` chỉ `set` key khi có request; key không bao giờ `delete`. Khi mảng recent rỗng vẫn giữ key. Kết hợp Finding MAJOR (IP do client kiểm soát) → kẻ tấn công gửi N giá trị `X-Forwarded-For` khác nhau tạo N entry giữ vĩnh viễn trong process → phình bộ nhớ (DoS nhẹ).
- **Fix đề xuất:** xoá key khi mảng lọc rỗng (`if (recentRequests.length === 0) requestsByIp.delete(ip)`), và/hoặc cap kích thước Map (LRU) + sweep định kỳ.

### [MINOR] Fallback IP `'unknown'` tạo bucket chung
- **File:** `src/app/api/contact/route.ts:11`
- **Evidence:** Khi thiếu `x-forwarded-for`, mọi request dùng key `'unknown'` → 5 request đầu của **tất cả** client (không có header) chia sẻ một bucket, có thể chặn nhầm ở môi trường không qua proxy.
- **Fix đề xuất:** bucket fallback theo kết nối/hằng số an toàn riêng hoặc log cảnh báo cấu hình thiếu header.

### [MINOR] Honeypot chỉ chứa khoảng trắng không bị "trap"
- **File:** `src/app/api/contact/route.ts:37`
- **Evidence:** `validation.data.honeypot.trim() !== ''` — honeypot `"   "` được coi là rỗng nên vẫn forward (không trả 200 giả). Bot auto-fill thường điền text nên impact thấp; chỉ là edge case.
- **Fix đề xuất:** quyết định rõ ngữ nghĩa (nếu coi mọi giá trị non-empty, kể cả whitespace, là filled → dùng `honeypot !== ''`).

### Ghi chú (không tính FAIL)
- `phone` không được `.trim()` (`contact-schema.ts:25`) → `" 123456789"` bị 400; UI hiện gửi số đã chuẩn hoá nên chấp nhận được, nhưng nên trim cho nhất quán.
- 429 không kèm `Retry-After` — API_SPEC không yêu cầu, không tính defect.

## Kết luận các gate

- Contract shape 200/400/429 + health no-store: **khớp API_SPEC** → `no doc impact` (xác nhận đối chiếu `docs/API_SPEC.md:40-67`).
- Guard order R-18, honeypot, R-15 (chỉ 2 route), R-19 (secret server-only, không log PII, 500 generic), middleware không locale-prefix API: **đạt**.
- **Không** còn CRITICAL. Còn **1 MAJOR** (rate-limit bypass) + 3 MINOR.

## Residual risk

- Không chạy được `npm run lint|typecheck|build` và curl matrix do **shell permission denied** → các mục phụ thuộc runtime (build route output, SSG không vỡ, 405/JSON-parse thực tế, rate-limit window thực tế) chưa được xác minh độc lập. Cần chạy lại ở môi trường có quyền shell.
- Hành vi X-Forwarded-For của GCP GFE chưa được kiểm chứng trên hạ tầng thật (Layer 4) — Finding MAJOR cần xác nhận trust boundary khi deploy.
- Rate-limit in-memory per-instance (đã ghi Decision 4) — không chính xác khi scale ngang.

## Verdict

❌ **FAIL**

Lý do: còn **1 finding MAJOR** — rate-limit (security control chống spam của public endpoint) bị bypass qua `X-Forwarded-For` do client kiểm soát, chưa được mitigate/accept. Cần builder fix trust boundary IP (và nên xử lý kèm MINOR eviction Map) rồi review lại round 2.
