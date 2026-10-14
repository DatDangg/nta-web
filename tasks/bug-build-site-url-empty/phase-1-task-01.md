# bug-build-site-url-empty · phase-1-task-01 — Build hỏng khi NEXT_PUBLIC_SITE_URL rỗng (fix A+B+C)

- **Nguồn:** điều tra `tasks/feature-content-database/investigate-flaky-build.md` (CR-031, trước phase 3) · user duyệt 2026-10-15
- **Classification / Risk:** BUG (build/tooling) · LOW
  - Expected review level: **NORMAL** (SEO/canonical dùng chung nhưng không đổi hành vi prod)
  - Blast radius: `src/lib/seo.ts` (BASE_URL dùng ở metadata/sitemap/robots/JSON-LD), `Dockerfile` (ARG), `.context/project-config.md`.
  - Doc impact: project-config (quy ước bằng chứng build). Spec: không đổi requirement (R-21/R-27 giữ) → không bump.

## Root cause (đã chứng minh)
`docker build --target builder` không truyền `--build-arg NEXT_PUBLIC_SITE_URL` → `Dockerfile:11-12` ENV = `""` →
`src/lib/seo.ts:4` `??` không fallback → `BASE_URL=""` → `src/app/[locale]/layout.tsx:30` `new URL("")` ERR_INVALID_URL ở mọi trang `[locale]`.
Không arg FAIL 2/2; có arg / compose / CI PASS.

## Scope
- **A.** `src/lib/seo.ts:4`: `process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://ntavietnam.tech'` (rỗng/khoảng trắng → fallback canonical).
  Không bỏ dấu `/` cuối nếu code khác phụ thuộc — kiểm nơi dùng. Test (node --test + tsx): unset, rỗng, khoảng trắng → canonical; giá trị hợp lệ → giữ nguyên.
- **B.** `Dockerfile:11`: `ARG NEXT_PUBLIC_SITE_URL=https://ntavietnam.tech`.
- **C.** `.context/project-config.md` mục verify: bằng chứng build trong Docker = `docker compose build nta-web` (giống CI; cần env giả POSTGRES_PASSWORD/REVALIDATE_SECRET cho compose)
  hoặc `docker build --build-arg NEXT_PUBLIC_SITE_URL=https://ntavietnam.tech`; ghi lý do (trỏ file điều tra).
- **KHÔNG** đổi canonical: `ntavietnam.tech` vẫn là canonical cho cả `ntasolution.vn` (quyết định 13/10/2026). Không đổi compose/deploy.yml.

## Acceptance
- `docker build --target builder .` **không** truyền arg → PASS 61/61 (trước đây FAIL).
- `docker compose build nta-web` PASS 61/61; canonical/sitemap vẫn `https://ntavietnam.tech`.
- npm test / typecheck / lint PASS.

## Builder report
- **Agent:** builder · 2026-10-15 · Repro trước fix: test mới `src/lib/seo.test.ts` FAIL (chưa có `resolveSiteUrl`); root cause theo `investigate-flaky-build.md` (không điều tra lại).
- **A.** `src/lib/seo.ts`: thêm `CANONICAL_SITE_URL` + `resolveSiteUrl(raw)` = `raw?.trim() || CANONICAL_SITE_URL`; `BASE_URL = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL)` (giữ literal để Next inline). Nơi dùng BASE_URL (`robots.ts`, `sitemap.ts`, `[locale]/layout.tsx`, `blog/[slug]/page.tsx`, `seo/jsonld.ts`, `localizedPath`) đều nối `/...` sau BASE_URL → giá trị không có `/` cuối như cũ; không strip/thêm `/` (giữ nguyên hành vi). Test `src/lib/seo.test.ts` (unset/""/khoảng trắng → canonical; giá trị hợp lệ giữ nguyên, có trim).
- **B.** `Dockerfile`: `ARG NEXT_PUBLIC_SITE_URL=https://ntavietnam.tech`.
- **C.** `.context/project-config.md`: mục "Bằng chứng build trong Docker" + `docker_build_evidence_command` (compose với env giả hoặc `docker build --build-arg`), lý do + trỏ file điều tra.
- Canonical không đổi (ntavietnam.tech); không đụng compose/deploy.yml/DB.

### Verify
| Lệnh | Kết quả |
|---|---|
| `npm test` | PASS 56/57 (1 skip: test cần TEST_DATABASE_URL) |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS (0 error, 1 warning `<img>` có sẵn ở `src/components/mdx/index.tsx`) |
| `docker build --target builder -t nta-web-noarg-check:tmp .` (KHÔNG arg) | PASS — `Generating static pages (61/61)`; sitemap/robots trong image = `https://ntavietnam.tech` |
| `POSTGRES_PASSWORD=x REVALIDATE_SECRET=y docker compose -p nta-web-buildcheck build nta-web` | PASS — builder layer CACHED (cùng arg = default mới ⇒ cùng layer với bản không-arg 61/61) |

- Dọn: đã xoá `nta-web-noarg-check:tmp` và `nta-web:latest` (compose tag cố định `image: nta-web:latest` → build đã ghi đè tag local; không có container nào dùng). Giữ `nta-web-verify:cr028`.
- **Repro status:** PASS. **Residual risk:** compose build dùng cache nên không chạy lại `next build` riêng; nếu cần bằng chứng độc lập chạy compose với `--no-cache`. Lưu ý quy ước C: compose build ghi đè tag local `nta-web:latest`.

## Close-out
- Status: **done** · Acceptance: PASS · Repro: trước fix `docker build --target builder` không arg FAIL 2/2 → sau fix PASS 61/61; test seo FAIL trước fix, PASS sau.
- Verify: npm test 56 pass + 1 skip · typecheck PASS · lint PASS (1 warning có sẵn) · docker build --target builder (không arg) PASS 61/61 · sitemap/robots dùng https://ntavietnam.tech
- Reviewer verdict: NORMAL **PASS** — .context/review-reports/bug-build-site-url-empty-phase-1-task-01-round-1-review.md
- MINOR đã sửa: quy ước C trong project-config (lệnh chính `docker build --target builder -t nta-web-buildcheck:tmp .`, chạy được PowerShell; compose phụ + cảnh báo ghi đè `nta-web:latest`).
- Residual: biến đặt chuỗi không rỗng nhưng không phải URL hợp lệ vẫn làm `new URL()` lỗi (ngoài scope). Spec: không đổi requirement, không bump.
