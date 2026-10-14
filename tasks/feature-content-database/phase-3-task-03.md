# feature-content-database · phase-3-task-03 — `POST /api/revalidate` có bảo vệ secret

- **CR:** CR-031 · spec R-15a (4.2.0)
- **Classification / Risk:** ADDITIVE (API) · HIGH (security/token)
  - Expected review level: **STRICT**
  - Blast radius: mới `src/app/api/revalidate/route.ts`; middleware next-intl không được chặn/redirect path này.
  - Doc impact: `docs/API_SPEC.md` (phase 5).

## Scope
1. Chỉ POST; header `x-revalidate-secret` so `crypto.timingSafeEqual` với `REVALIDATE_SECRET` (env thiếu → endpoint từ chối, log rõ);
   sai/thiếu → `401`. Body `{collection, slug?}` | `{all:true}`; collection ngoài whitelist → 400. `revalidateTag` theo tag của phase-3-task-01
   (+ `revalidatePath` nếu cần cho sitemap/listing). `Cache-Control: no-store`. Rate-limit nhẹ (tái dùng pattern `/api/contact`).
2. Thêm lệnh `revalidate` vào `tools/db/content-cli.ts` (task 4) gọi endpoint này.
3. Test: 401 (thiếu/sai secret), 400 (body sai), 200 + trang đổi nội dung sau update DB (local, không build lại).

## Acceptance
- Sửa 1 bản ghi DB local → gọi endpoint → trang hiện nội dung mới không build lại (bằng chứng trước/sau).

## Thiết kế (Builder, 2026-10-14)
- `src/app/api/revalidate/route.ts` (chỉ export `POST` → method khác 405) nối `revalidateTag` thật + env vào `src/lib/api/revalidate.ts` (logic thuần, test không cần Next).
- Thứ tự: rate-limit (30 req/phút/IP, `isRevalidateRateLimited`) → `REVALIDATE_SECRET` thiếu/rỗng → **503** `{status:"error",message:"unavailable"}` + `console.error`
  (chọn 503 thay 401: lỗi cấu hình server, không phải lỗi người gọi; body không lộ chi tiết) → header `x-revalidate-secret` so constant-time
  (SHA-256 hai phía → `timingSafeEqual` 32 byte, không ném/không rò độ dài) sai/thiếu → **401** → mới đọc body.
- Body: `{all:true}` → `["content"]`; `{collection}` → `["content:<c>"]`; `{collection, slug}` → `["content:<c>","content:<c>:<slug>"]`. Collection ∉ `CONTENT_COLLECTIONS`
  (`src/db/schema.ts`, cùng nguồn write-path) → 400 `unknown_collection`; JSON lỗi → 400 `invalid_json`; key thừa / trộn 2 dạng / slug sai pattern
  (`^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$`) → 400 `invalid_body`. Mọi phản hồi của handler có `Cache-Control: no-store`.
- Tên tag chuyển từ `store.ts` sang `src/lib/content/cache-tags.ts` (dùng chung đọc + revalidate, không lệch tên). `getClientIp` chuyển nguyên văn từ
  contact route sang `src/lib/api/client-ip.ts`; `rate-limit.ts` thành factory (`isContactRateLimited` giữ ngưỡng 5/10 phút như cũ).
- **revalidateTag đủ, không cần revalidatePath** (kiểm thực tế): tag của `unstable_cache` được gom vào entry route cache ISR của `/en/...`
  → sau revalidate, request đầu tới `/en/...` là `MISS` (render chặn, nội dung mới ngay), request sau `HIT`. Trang vi render theo request trên data cache.
  Sitemap `force-dynamic`. Middleware: matcher loại `api` → `POST /api/revalidate` không bị redirect (200, không `Location`).
- CLI: `npm run db:cli -- revalidate --collection <c> [--slug <s>] | --all` — `REVALIDATE_URL` + `REVALIDATE_SECRET` từ env, không cần DATABASE_URL, không in secret.

## Verification summary (Builder, 2026-10-14)
| Lệnh / kiểm tra | Kết quả |
|---|---|
| `npm test` (không TEST_DATABASE_URL) | 72 tests: 71 pass, 0 fail, 1 skip (+7 test revalidate, +1 rate-limit) |
| `TEST_DATABASE_URL=… npm test` (Postgres 16 Docker tạm `nta-p3t03-tmp` @127.0.0.1:55434) | 83/83 pass (chạy trước khi thêm test rate-limit) |
| `npm run typecheck` / `npm run lint` | PASS / 0 error, 1 warning `<img>` có sẵn |
| `npm run build` — `CONTENT_SOURCE=db` không DATABASE_URL; và chế độ file mặc định | PASS / PASS (`ƒ /api/revalidate`) |
| Server `next start` (db, secret đặt): GET → 405 · thiếu/sai secret → 401 · JSON lỗi → 400 `invalid_json` · `{"collection":"users"}` → 400 `unknown_collection` · 401/400 có `cache-control: no-store` | PASS |
| Server không đặt `REVALIDATE_SECRET` → POST (secret rỗng / bất kỳ) → 503 `unavailable` + log `[revalidate] REVALIDATE_SECRET chưa đặt` | PASS |
| CLI sai secret → `FAIL — HTTP 401`; collection lạ → `FAIL — HTTP 400 unknown_collection` | PASS |

**Bằng chứng trước/sau (không build lại, cùng 1 process `next start`):** sửa `post/{vi,en}/first-steps` title qua `updateEntry` (write-path P2-T02, v1→v2)
- Trước revalidate (2 lần, sau cả các call bị 401/400): `/blog/first-steps`, `/blog` (vi) và `/en/blog/first-steps`, `/en/blog` (`x-nextjs-cache: HIT`) **không** có marker `P3T03-1`.
- `db:cli revalidate --collection post --slug first-steps` → `{"status":"ok","revalidated":["content:post","content:post:first-steps"]}`
  → cả 4 URL có marker `P3T03-1` ngay request đầu (`/en` = `MISS`), request sau `/en` = `HIT`.
- Lần 2 (v2→v3, marker `P3T03-2`): trước revalidate vẫn `P3T03-1`; `revalidate --all` → `["content"]` → 4 URL có `P3T03-2`.
- Container tạm đã `docker rm -f`; không đụng `ismartschool-postgres`.

## Residual risk
- Review round 1 STRICT PASS — MINOR N1 (trim header) sửa inline; N2 log lỗi mỗi request khi thiếu env (chỉ khi cấu hình sai), N4 chưa test isContactRateLimited/getClientIp, N5 IPv6 xoay địa chỉ /64 vượt rate-limit (secret ngẫu nhiên dài → không khai thác thực tế) — chấp nhận; N3 mã 503 ghi vào API_SPEC ở P5-T01.
- Rate-limit in-memory theo instance (như contact); request đi thẳng `127.0.0.1:3005` không qua nginx → khoá chung `unknown` (bot + CLI trên VPS dùng chung 30/phút).
- `revalidateTag` chỉ làm mới cache trong process đang chạy (1 container `nta-web`); scale nhiều instance cần cache handler dùng chung.
- Chưa phủ: chữ giao diện next-intl / company-info (P3-T04), ảnh upload (P3-T05) — các nguồn đó chưa gắn tag nội dung.
- Response 405 (GET) do Next sinh, không có header `no-store` (không có nội dung để cache).
- Secret yếu không bị chặn (chỉ chặn rỗng) — giá trị prod do người vận hành đặt (GitHub Secret).
- Deploy: `docker-compose.yml:36` (`REVALIDATE_SECRET` bắt buộc) + `.github/workflows/deploy.yml:25` đã truyền từ P1-T02 — không cần secret mới.

## Doc impact
- `docs/API_SPEC.md` (endpoint `POST /api/revalidate`) — dời phase 5 (P5-T01 reconcile).
- Đã cập nhật: `docs/runbook/db.md` §9 (lệnh `revalidate`), `.env.example` (`REVALIDATE_URL` cho CLI).
