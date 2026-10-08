# Review Report — feature/nta-website · layer-3-task-01 · round 2

Agent: reviewer

- **Task:** `tasks/nta-website/layer-3-task-01.md` — API `GET /api/health` + `POST /api/contact`
- **Review level:** `STRICT`
- **Reason:** Task chạm **API contract công khai** + **security** (rate-limit, honeypot, input validation, secret `CONTACT_FORM_TARGET` server-only) — đúng nhóm risk đỏ bắt buộc STRICT (API contract/DTO dùng nhiều client + security/secret). Task file ghi `Review level expected: STRICT`. Round 2 verify lại 1 MAJOR security (rate-limit bypass) → vẫn STRICT.
- **Blast radius:** `POST /api/contact` (public endpoint — 2 UI surface: ContactForm + CTAForm Layer 3 task-02/03), `GET /api/health` (Cloud Run uptime), `src/lib/api/{rate-limit,contact-schema,forward}.ts`; không đụng schema/DB (`db_tool: none`), không đụng SSG pages.
- **Round:** 2 · **Attempt builder:** 1 (rework sau r1 FAIL — `.context/runs/fix-nta-website-layer-3-task-01.md`)
- **Baseline:** `.context/review-reports/feature-nta-website-layer-3-task-01-round-1-review.md` (r1 FAIL: 1 MAJOR + 3 MINOR)

## Verify commands + result

| Command | Result |
|---|---|
| `npm run lint` (web_lint_command) | **Blocked** — shell permission denied (`permission.rejected: shell`). Không retry theo Tool Loop Guard. |
| `npm run typecheck` (web_typecheck_command) | **Blocked** — shell denied |
| `npm run build` (build_command) | **Blocked** — shell denied |
| `npm run test` | `skip, test_command: null` (chưa có test framework — `.context/project-config.md:36`) |
| `aislop scan --changes --json` | `skip` — shell denied |
| `npx oxlint` | `skip, oxlint not configured` — glob `.oxlintrc.json`/`oxlint.json`/`oxlintrc.json` = 0 kết quả |
| `ocr review` | `skip` — shell denied / không xác nhận cài đặt |
| curl matrix runtime | **Blocked** — shell denied (không chạy độc lập). Dùng evidence builder chỉ để tham chiếu, **không** tính là bằng chứng PASS. |

> ⚠️ Toàn bộ acceptance dưới đây xác minh **tĩnh trên source** (Read/Grep). Runtime evidence của builder (`fix-...builder.md`) **không** dùng làm bằng chứng PASS. Phần không xác minh được ghi ở **Residual risk**.

## MAJOR r1 closure — rate-limit bypass qua `X-Forwarded-For`

**r1 defect:** `getClientIp` lấy token **trái nhất** (`split(',')[0]`) → client tự gửi XFF đổi mỗi request → mỗi request một "IP" → không bao giờ chạm ngưỡng.

**Fix hiện tại** — `src/app/api/contact/route.ts:36-40`:
```ts
function getClientIp(request: NextRequest): string {
  // Cloud Run/GFE appends the trusted client IP rightmost; rate-limit state is in-memory per instance.
  const trustedIp = request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim();
  return trustedIp && isValidIpAddress(trustedIp) ? trustedIp : SHARED_FALLBACK_KEY;
}
```

**Xác minh tĩnh độc lập (logic):**

| Kịch bản | Suy luận | Kết quả |
|---|---|---|
| Đổi token XFF bên trái, giữ rightmost cố định | `.at(-1)` chỉ đọc token phải nhất; token trái không vào key → key không đổi → request 1..5 ghi cùng bucket, request 6 `recentRequests.length (5) >= CONTACT_RATE_LIMIT (5)` → **429**. Không thoát ngưỡng. | **CLOSED** |
| Thiếu XFF | `?.` → `undefined` → `trustedIp` falsy → trả `SHARED_FALLBACK_KEY` cho mọi request → chung bucket → request 6 → **429**. Fail-closed, **không** bypass. | **CLOSED** |
| XFF không hợp lệ (rác, không phải IP) | `isValidIpAddress` = false → `SHARED_FALLBACK_KEY` chung → fail-closed. | **CLOSED** |
| Rightmost là IP hợp lệ do proxy append | dùng làm key → mỗi client 1 bucket. | **OK** (theo premise GFE append) |

- Key không còn do token client kiểm soát (trừ khi proxy **không** append như giả định — xem Residual risk).
- Fallback không cho qua: dùng chung bucket (`SHARED_FALLBACK_KEY`) thay vì trả `''`/cho phép → đúng yêu cầu r1 "fallback bucket an toàn".
- `isValidIpAddress` (`route.ts:11-34`) validate IPv4 (4 octet 0–255) + IPv6 (kể cả IPv4-mapped `::ffff:a.b.c.d`); input không hợp lệ → false → fallback (fail-closed, không có nhánh cho phép khi lỗi).

**Kết luận:** MAJOR r1 **đã đóng ở mức logic/code**. Việc xác nhận hành vi append thực tế của GFE là kiểm chứng hạ tầng (Layer 4) — ghi Residual.

## 3 MINOR r1 closure

| # | r1 MINOR | Fix | Kết quả |
|---|---|---|---|
| M1 | Map rate-limit không evict IP cũ → phình bộ nhớ | `rate-limit.ts:8-17` duyệt toàn Map mỗi call: filter timestamp hết hạn; `activeTimestamps.length === 0` → `requestsByIp.delete(address)`. Có eviction. | **CLOSED** |
| M2 | Fallback `'unknown'` bucket chung (tên chưa rõ) | `route.ts:9` tách hằng số có tên `SHARED_FALLBACK_KEY` + comment ngữ nghĩa (`route.ts:37`); value `'unknown'` không trả về client, không lộ internal. Trade-off collateral-throttle đã ghi rõ (`fix-...builder.md:8`). | **CLOSED** (MINOR) |
| M3 | Honeypot whitespace-only không bị trap | `route.ts:65` dùng `validation.data.honeypot.length > 0` (raw, không trim); schema (`contact-schema.ts:27`) giữ honeypot **raw** → `"   "` length 3 > 0 → trả 200 giả, không forward. | **CLOSED** |

## Checklist theo yêu cầu (contract + R-18/R-19/R-15)

| # | Hạng mục | Kết quả | Bằng chứng (file:line) |
|---|---|---|---|
| 1a | health 200 `{status:"ok",timestamp ISO}` + `Cache-Control: no-store` | **OK** | `src/app/api/health/route.ts:1-6` |
| 1b | contact 200 `{status:"ok"}` | **OK** | `src/app/api/contact/route.ts:66,71` |
| 1c | 400 `{status:"error",errors:{field}}` | **OK** | `route.ts:54-58` (non-JSON `errors.form`), `route.ts:60-63` (validate) |
| 1d | 429 `{status:"error",message}` | **OK** | `route.ts:43-48` |
| 1e | 500 generic, không lộ internal | **OK** | `route.ts:72-77` (`FORWARD_ERROR_MESSAGE`) |
| 1f | Method ≠ POST → 405 | **OK** | App Router: chỉ export `POST` → 405 (không export GET/PUT…) |
| 2 | Guard order R-18 `rateLimit → validate → honeypot → forward` | **OK** | rate-limit `route.ts:43` → parse/validate `50-63` → honeypot `65-67` → forward `69-71` |
| 3 | Honeypot filled (kể cả whitespace) → 200 giả, KHÔNG forward | **OK** | `route.ts:65-67` return trước `forwardContactForm` |
| 4 | Rate-limit 5/10min/IP, request 6 → 429, window đúng | **OK** (logic) | `rate-limit.ts:1-2` (`5`, `10*60*1000`), `23-26` (`>= 5` → true) |
| 5 | Validate name 2–100 / email / phone optional 9–15 / message 10–2000 | **OK** | `contact-schema.ts:29-44`; `EMAIL_PATTERN:13`, `PHONE_PATTERN:14` |
| 6 | Secret safety R-19 (server-only, không log PII, 500 generic) | **OK** | `forward.ts:6-9` (fail-closed nếu thiếu target hoặc `NEXT_PUBLIC_CONTACT_FORM_TARGET` set); grep `lib/api` → **chỉ** `route.ts:2-4` import; không có `console.log/error/warn` trong `src` |
| 7 | Không route thừa (R-15) | **OK** | glob `src/app/api/**/*.ts` = đúng 2 route (`contact/route.ts`, `health/route.ts`) |
| 8 | `/api/*` không bị middleware i18n locale-prefix | **OK** | `src/middleware.ts:7` matcher loại trừ `api` |
| 9 | Route xuất hiện trong build / không phá SSG | **Blocked** (không chạy build) | — |
| 10 | Đối chiếu `docs/API_SPEC.md` | **OK — no doc impact** | 200/400/429 shape + health `{status,timestamp}` khớp `docs/API_SPEC.md:52-67`; request fields khớp `40-50` |

## Responsive Checklist Gate

**N/A** — diff chỉ gồm API route handler + lib server-side, **không đụng UI/route page/component/CSS**. Gate responsive không áp dụng.

## Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| aislop | `skip` — shell denied, không chạy được `aislop scan` | — |
| oxlint (anti-slop) | `skip, oxlint not configured` | glob `**/{.oxlintrc.json,oxlint.json,oxlintrc.json}` = 0 kết quả |
| ocr (open-code-review) | `skip` — shell denied / chưa xác nhận cài | — |
| AI-readable (ai-readable-codebase) | **OK** | file 6–78 dòng (<300); hàm ≤50 dòng (max `isValidIpAddress` ~24, `POST` ~36); tên self-descriptive (`getClientIp`, `isContactRateLimited`, `validateContactForm`, `forwardContactForm`, `SHARED_FALLBACK_KEY`); hằng số có tên, không magic number; 1 file 1 trách nhiệm. <3 indicator. |
| ai-friendly-web | **N/A** | Task API server-side, không thêm/sửa web page/SEO artifact |
| blitzstrike (pentest) | `skip` — không có môi trường/không cài; chỉ finding STRIKE-validated mới tính FAIL | — |

## Findings

### [MINOR] `isValidIpAddress` tự viết, IPv6 logic phức tạp — rủi ro false-negative (không phải lỗ hổng)
- **File:** `src/app/api/contact/route.ts:11-34`
- **Evidence:** Validator IPv6 thủ công (xử lý `::`, IPv4-mapped, group length). Một số dạng hợp lệ hiếm (zone id `%`, IPv4-mapped viết khác chuẩn) có thể bị coi là không hợp lệ.
- **Ảnh hưởng:** Chỉ gây **collateral throttle** (rơi vào bucket chung → bị 429 sớm), **không** tạo bypass (fail-closed). Không chặn PASS.
- **Fix đề xuất (tùy chọn):** dùng `net.isIP()` của Node (`node:net`) hoặc util có sẵn để giảm bề mặt sai sót; hoặc giữ nguyên vì fail-closed.

### Ghi chú (không tính FAIL)
- `SHARED_FALLBACK_KEY = 'unknown'`: mọi request thiếu/không hợp lệ IP dùng chung 1 bucket → có thể chặn nhầm ở môi trường không qua proxy (dev/local). Là trade-off fail-closed đã ghi rõ; không phải defect.
- Prune Map duyệt toàn bộ mỗi request (O(số IP tracked)) + filter lặp cho IP hiện tại — chi phí nhỏ, chấp nhận được ở scale hiện tại.
- `phone` không `.trim()` (`contact-schema.ts:25`) — kế thừa note r1, không phải defect (UI gửi số chuẩn hoá).
- 429 không kèm `Retry-After` — API_SPEC không yêu cầu.
- **Process (ngoài scope code):** `.context/runs/feature-nta-website-layer-3-task-01.builder.md` là stray note do subagent ghi (journal do primary quản) + journal builder gốc chưa cập nhật entry round-2 → primary nên dọn/reconcile ở close-out. Không ảnh hưởng code.

## Kết luận các gate

- Contract shape 200/400/429/500/405 + health no-store: **khớp `docs/API_SPEC.md`** → `no doc impact`.
- Guard order R-18, honeypot, R-15 (đúng 2 route), R-19 (secret server-only, không log PII, 500 generic), middleware không locale-prefix API: **đạt**.
- **Không** còn CRITICAL/MAJOR. 1 MINOR non-blocking mới (validator tự viết, fail-closed) + note process.

## Residual risk

- **Shell permission denied** → không chạy độc lập `npm run lint|typecheck|build`, curl matrix, `aislop`, `ocr`. Các mục phụ thuộc runtime (build route output, SSG không vỡ, 405/JSON-parse thực tế, rate-limit window thực tế) chưa xác minh độc lập. Cần chạy lại ở môi trường có quyền shell.
- **Trust boundary GFE append (rightmost)**: closure MAJOR phụ thuộc premise "GCP Cloud Run/GFE append IP client tin cậy ở **phải nhất**" — chưa kiểm chứng được trên hạ tầng thật trong phiên này (websearch không trả kết quả). Builder cũng ghi nhận rủi ro tương tự (`fix-...builder.md:21`). **Bắt buộc xác nhận trên staging/Cloud Run (Layer 4)**; nếu proxy KHÔNG append như giả định → MAJOR mở lại.
- Rate-limit in-memory per-instance (Decision 4) — không chính xác khi scale ngang/restart (đã ghi Decision/residual).

## Verdict

✅ **PASS**

Lý do: MAJOR r1 (rate-limit bypass qua `X-Forwarded-For`) **đã được mitigate đúng hướng đề xuất** — dùng token phải nhất do proxy tin cậy append + validate IP + fallback bucket chung fail-closed (không cho qua); 3 MINOR r1 (prune Map / fallback bucket tên rõ / honeypot whitespace) **đã đóng**; contract 200/400/429/500/405, guard order R-18, R-19, R-15 **không regression**. Không còn CRITICAL/MAJOR. Các residual (shell blocked; xác nhận GFE append trên hạ tầng) không phải defect code và đã được ghi rõ để xử lý ở Layer 4/close-out.
