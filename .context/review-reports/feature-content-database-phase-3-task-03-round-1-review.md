# Agent: reviewer — feature-content-database · phase-3-task-03 · round 1

- **CR:** CR-031 · R-15a (4.2.0) · Task: `tasks/feature-content-database/phase-3-task-03.md`
- **Review level:** STRICT
- **Reason:** endpoint công khai có secret (security/token), rate-limit, refactor module dùng chung (`rate-limit.ts` factory, `getClientIp` chuyển sang `client-ip.ts`, tên tag chuyển sang `cache-tags.ts` dùng bởi `store.ts`) — risk đỏ theo AGENTS.md.
- **Blast radius:** `POST /api/revalidate` (mới); `POST /api/contact` (đổi import `getClientIp` + limiter factory); `src/lib/content/store.ts` (mọi đọc DB khi `CONTENT_SOURCE=db` — tag `unstable_cache`); `tools/db/content-cli.ts` (lệnh mới `revalidate`, đổi nhánh trước khi đòi `DATABASE_URL`); docs `docs/runbook/db.md` §9, `.env.example`. Ngoài scope review: `docs/content-bot/`, `spec/changes/2026-10-14-telegram-content-bot.md`, `.context/progress.json`, `.context/runs/*`.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm test` | 72 tests: 71 pass, 0 fail, 1 skip (import/parity cần `TEST_DATABASE_URL`) |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — 0 error, 1 warning `<img>` có sẵn (`src/components/mdx/index.tsx:25`, ngoài diff) |
| `npm run build` (`SWC_NATIVE_BINDING_CACHE=C:\Users\datda\.swc-native-cache`) | PASS — `ƒ /api/revalidate`, `ƒ /sitemap.xml`, `ƒ Middleware` |
| Smoke server/DB trước-sau (401/400/503/200, marker nội dung) | Không tự chạy (reviewer không chạy app/DB) — dựa evidence Builder (task file dòng 41-50), nhất quán với code + unit test |

## Skill gates
| Gate | Kết quả |
|---|---|
| aislop | skip, aislop chưa cài (không có `node_modules/.bin/aislop`) |
| oxlint (anti-slop) | skip, oxlint not configured |
| ocr (open-code-review) | skip, ocr not installed |
| AI-readable | OK — tên rõ, hàm ngắn (`handleRevalidateRequest` ~25 dòng), logic thuần tách khỏi route, hằng có tên (`SLUG_PATTERN`, `REVALIDATE_RATE_LIMIT`), comment nêu WHY. 0 indicator |
| ai-friendly-web | N/A — endpoint nội bộ, không đổi trang public |
| blitzstrike | skip, không có môi trường pentest được phép |
| Responsive Checklist Gate | N/A — diff không đụng UI |

## Kiểm theo trọng tâm

### Secret / thứ tự kiểm tra — OK
- `revalidate.ts:29-33` SHA-256 hai phía → 2 buffer 32 byte → `timingSafeEqual` không ném, thời gian không phụ thuộc độ dài/nội dung secret gửi lên. Header thiếu → `false` sớm (chỉ lộ "có/không có header", không lộ gì về secret) — chấp nhận được.
- Secret không xuất hiện trong log/response: log chỉ in tag (`:90`) hoặc thông báo cấu hình (`:74`); body 401 cố định `unauthorized`; CLI chỉ in HTTP status + body server (không echo secret).
- Thứ tự rate-limit → env → secret → body (`:69-86`) hợp lý: chặn dò secret hàng loạt trước khi băm; body chỉ đọc sau xác thực. Test `revalidate.test.ts:91` chốt 429 trước kiểm secret.
- 503 khi env thiếu/rỗng/chỉ khoảng trắng: body `unavailable` không lộ chi tiết; `docker-compose.yml:36` bắt buộc `REVALIDATE_SECRET` nên prod khó rơi vào nhánh này.

### Body / tag — OK
- Whitelist qua `isContentCollection` (`schema.ts:40`, `Array.includes` — không dính prototype; test `__proto__`/`Post`/`content`). Key thừa/trộn dạng/`all` ≠ `true` → 400; slug `^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$` chặn `../`, khoảng trắng, rỗng, >128 — tag luôn < 256 ký tự.
- Tag khớp store: `store.ts:27` `contentTags(collection)` → `['content','content:<c>']`, `:36` thêm `content:<c>:<slug>`; revalidate dùng cùng hàm `collectionTag`/`entryTag`/`ALL_CONTENT_TAG` từ `cache-tags.ts` → không lệch tên. `{collection, slug}` revalidate cả tag collection → danh sách (chỉ gắn tag collection) cũng mới.
- Đủ cho các nguồn đọc: mọi `unstable_cache` trong `src/` chỉ ở `store.ts` (grep) → registry/listing/sitemap đọc DB qua store đều mang tag `content` + `content:<c>`; sitemap `force-dynamic` (`sitemap.ts:10`) đọc data cache → mới sau revalidate. `/en` ISR: tag của `unstable_cache` gom vào route cache — Builder có evidence `MISS` rồi `HIT` với nội dung mới; không cần `revalidatePath`.

### Rate-limit / IP — OK
- Factory `rate-limit.ts:9-36` giữ nguyên thuật toán cũ, mỗi limiter Map riêng; `isContactRateLimited` vẫn 5/10 phút → hành vi contact không đổi. `getClientIp` chuyển nguyên văn (so diff), nhận `Request` thay `NextRequest` (tương thích).
- Spoof XFF: nginx `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for` (`deploy/nginx/*.conf`) → phần tử phải cùng = `$remote_addr` thật; header giả của client chỉ nằm bên trái → không bypass. App bind `127.0.0.1:3005` (`docker-compose.yml:29`) → không gọi thẳng từ ngoài để giả XFF. Khoá `unknown` chỉ dùng được từ trong host (bot/CLI) → kẻ tấn công ngoài không làm cạn quota của bot; Map tách limiter nên `unknown` của contact và revalidate không ảnh hưởng nhau.

### CLI — OK
- `content-cli.ts:128` nhánh `revalidate` chạy trước khi đòi `DATABASE_URL`; secret chỉ đọc từ env, gửi qua header, không in; thiếu env → exit 2 với hướng dẫn `read -rs`. Lỗi mạng (`fetch failed`) rơi về handler ngoài → `[cli] FAIL`, exit 1.

### Middleware / scope — OK
- `src/middleware.ts:7` matcher loại `api` → không redirect `/api/revalidate`. Không đụng next-intl messages/company-info (P3-T04) hay upload (P3-T05). Diff surgical, mọi dòng trace về task.

## Findings
- **[MINOR] N1 — trim không đối xứng.** `src/lib/api/revalidate.ts:72` trim secret server nhưng không trim header gửi lên. Nếu env server có khoảng trắng/`\r` cuối (vd `.env` CRLF) còn client gửi nguyên giá trị đó → 401 khó hiểu; ngược lại an toàn. Đề xuất: chỉ dùng trim để phát hiện rỗng (`!deps.expectedSecret?.trim()`) và so nguyên giá trị, hoặc ghi rõ trong runbook là secret không được có khoảng trắng đầu/cuối.
- **[MINOR] N2 — log lặp khi thiếu env.** `src/lib/api/revalidate.ts:74` `console.error` mỗi request khi thiếu `REVALIDATE_SECRET`; request không xác thực có thể spam log (giới hạn 30/phút/IP). Đề xuất: log 1 lần/process (cờ module) hoặc chấp nhận vì compose đã bắt buộc env.
- **[MINOR] N3 — lệch chữ spec.** R-15a (`SPECIFICATIONS.md:376`) chỉ nêu 401/400/200; 503 khi server thiếu secret là quyết định thiết kế hợp lý (đã ghi task file dòng 21-22) nhưng cần ghi vào `docs/API_SPEC.md` ở P5-T01 (đã có trong Doc impact) để client bot không hiểu nhầm.
- **[MINOR] N4 — thiếu test cho phần refactor dùng chung.** Không có test cho `isContactRateLimited` (5/10 phút) và `getClientIp` (rightmost XFF, IP sai → `unknown`). Code chuyển nguyên văn nên rủi ro thấp; đề xuất thêm 1-2 test khi có dịp (không chặn PASS).
- **[MINOR] N5 — rate-limit theo IPv6.** Khoá theo từng địa chỉ IPv6 → kẻ có /64 xoay địa chỉ vượt 30/phút. Không khai thác thực tế được vì secret dài ngẫu nhiên (brute-force bất khả), ghi nhận Residual risk.

Không có CRITICAL/MAJOR.

## Residual risk
- Đã nêu trong task: rate-limit/cache in-memory theo 1 instance; bot + CLI dùng chung khoá `unknown` 30/phút; 405 (GET) không có `no-store`; secret yếu không bị chặn.
- Bằng chứng trước/sau nội dung + test DB (83/83) chỉ theo evidence Builder — reviewer không chạy server/Postgres.

## Verdict
✅ **PASS** — không còn CRITICAL/MAJOR; test/typecheck/lint/build PASS. 5 MINOR (N1-N5) không chặn, đề xuất xử lý N1/N2 nếu tiện.
