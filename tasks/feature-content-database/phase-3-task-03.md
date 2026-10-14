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
