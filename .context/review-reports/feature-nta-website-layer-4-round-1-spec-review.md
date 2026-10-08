# Spec Review — feature nta-website · Layer 4 · round 1

> **Mode:** Phase review (post-PASS, `spec-validator`) — READ-ONLY, không sửa code.
> **Work item:** `feature/nta-website` · **Layer 4** (layer cuối) · **Round:** 1
> **Report path:** `.context/review-reports/feature-nta-website-layer-4-round-1-spec-review.md`
> **Persist note:** subagent bị chặn tool ở bước cuối (max steps) nên **không tự ghi file**; primary persist nguyên văn.

Agent: spec-validator

## 0. Kết luận nhanh

- **VERDICT: ✅ PASS (initial build hoàn tất)** — mọi requirement trong phạm vi Layer 4 có owner + bằng chứng; không có ❌, không có HIGH conflict, không có requirement mất owner.
- **Gaps:** 0 **BLOCKING**; nhiều **NON-BLOCKING (MINOR)** + 2 mục **PARTIAL** do môi trường chặn đo (R-22 perf score, R-23 exact viewport) — đã được task cho phép `Blocked` và ghi residual.
- **Residual risk chính:** target phi chức năng **R-22 (Lighthouse Performance ≥90, LCP<2.5s, CLS<0.1)** và **R-23 (emulation chính xác 375/768/1280)** chưa đo được trong môi trường → phải đo lại ở gate DevOps/prod (bước `/start` 6). Không claim pass thay.

## 1. Phương pháp & mức độ xác minh

| Kiểm | Cách làm | Kết quả |
|---|---|---|
| Source/config | `Read` trực tiếp (`sitemap.ts`, `robots.ts`, `seo.ts`, `jsonld.ts`, `layout.tsx`, `next.config.ts`, `Dockerfile`, `.dockerignore`, `deploy.yml`, `ci.yml`, runbook, `llms.txt`) | ✅ verified |
| Build artifact | `Read` cấu trúc `.next/server/app/**` + `.next/standalone`; `Grep` 1 HTML mẫu (`vi/contact.html`) | ✅ cấu trúc verified, JSON-LD/meta spot-check |
| Chạy lint/typecheck/build/docker | Shell **permission denied** → theo Tool Loop Guard **dừng ngay, không retry** | ⚠️ **Residual** — tin theo task/reviewer report |
| Parse toàn bộ 43 HTML | Vượt ngân sách bước | ⚠️ **Residual** — chỉ spot-check + đối chiếu claim reviewer |
| Gap register file | Chưa định vị được file gap register chuyên biệt | ⚠️ **Residual** |

## 2. Coverage matrix (Layer 4)

| Req | Nguồn (spec/design) | Owner task | Bằng chứng file:line | Status | Note |
|---|---|---|---|---|---|
| **R-21** SEO (sitemap/robots/OG/JSON-LD, Lighthouse SEO≥90) | `SPECIFICATIONS.md:158-159`; `design-spec.md:85-92` | layer-4-task-01 (+03) | `src/app/sitemap.ts:8-29`; `src/app/robots.ts:4-6`; `src/lib/seo/jsonld.ts:1-42`; `src/app/[locale]/layout.tsx:19-30,52-54`; `public/llms.txt`; `public/images/og-default.png`; artifact `sitemap.xml.body`/`robots.txt.body` + 43 HTML | ✅ PASS | Detail desc <150 (content-derived), sitemap thiếu `lastModified`, `Organization.logo`=banner (không vuông) → MINOR non-blocking |
| **R-20** i18n/hreflang/localized meta 2 locale | `SPECIFICATIONS.md:156-157`; `design-spec.md:76-83` | layer-4-task-01 (+L0) | `src/lib/seo.ts:16-25` (`createLocaleAlternates`, `x-default=vi`); `layout.tsx:24-29` (og locale vi_VN/en_US); artifact `vi/contact.html` có `alternate hrefLang vi/en/x-default` | ✅ PASS | verified spot-check trên contact |
| **R-12** 404 `noindex` | `SPECIFICATIONS.md:115-116`; `design-spec.md:546-569` | layer-4-task-01 (audit) | artifact `_not-found.html`; task-01 AC "404 noindex" | ✅ PASS (một phần) | Chưa tự parse để confirm `robots:noindex` trong HTML — residual nhỏ |
| **R-22** Performance (LCP<2.5s, ảnh tối ưu, Lighthouse Perf≥90) | `SPECIFICATIONS.md:160-161`; `design-spec.md:92` | layer-4-task-02 (+03) | `src/app/[locale]/layout.tsx:10-17` (`Inter subsets['latin','vietnamese']`, display swap, preload); `next.config.ts:7` (avif/webp); `src/components/mdx/index.tsx` ArticleImage | ⚠️ **PARTIAL** | Code paths ✅; **Lighthouse Perf + LCP/CLS = Blocked** (env không có perf benchmark). Evidence thay thế: 0 longTasks/0 blocking. Target **chưa xác thực** |
| **R-23** Responsive (Tailwind bp, fluid) | `SPECIFICATIONS.md:162-169`; `design-spec.md` tables Screen 1–13 | layer-4-task-03 | `project-config.md:112` breakpoints; task-03 "overflow 0/11", "CSS math khớp design S12" | ⚠️ **PARTIAL** | Exact 375/768/1280 emulation **Blocked** (browser tool thiếu viewport API); chỉ base(<md)+math lg/md |
| **R-24** A11y WCAG 2.1 AA | `SPECIFICATIONS.md:170-171`; `design-spec.md:64-75` | layer-4-task-03 | `layout.tsx:57-61` (skip-link, `main#main tabIndex=-1`, landmark Header/main/Footer); task-03: Lighthouse a11y **1.0/0 fail /11 route**, heading fix (sr-only h2 4 list page), contrast fix `text-primary-active`, label-in-name fix, reduced-motion global | ✅ PASS | 4 MINOR carry-forward (m-L4T3-1..4) + `text-primary #0071e3` 4.31:1 ở link ngoài node axe flag → MINOR |
| **R-27** Deploy Cloud Run asia-southeast1, scale-to-zero, max 3 | `SPECIFICATIONS.md:191-193`; `project-config.md:51-52` | layer-4-task-04 | `Dockerfile:1-22`; `.dockerignore`; `.github/workflows/deploy.yml:14,42-50`; `docs/runbook/deploy-cloud-run.md`; `next.config.ts:6` | ✅ PASS | generate-only, chưa deploy; docker build Blocked (no docker) |
| **R-14** Health `/api/health` | `SPECIFICATIONS.md:127-128`; `docs/API_SPEC.md` | layer-3-task-01 / task-04 | artifact `.next/server/app/api/health/`; `deploy.yml:51-54` verify; runbook §Verify | ✅ PASS (một phần) | Standalone runtime 200 do primary ghi; tôi không tự chạy lại (shell denied) |
| **R-19** Security HTTPS-only + không lộ secret | `SPECIFICATIONS.md:150-152` | layer-4-task-04 | `deploy.yml:50` (`--set-secrets ...` name-only, không hardcode); runbook §Domain/HTTPS (Managed SSL, no app-level redirect); `NEXT_PUBLIC_SITE_URL` public-only (`seo.ts:4`) | ✅ PASS | `:latest` unpinned (m-L4T4-3), `NEXT_PUBLIC_SITE_URL` build-time (m-L4T4-2) → MINOR |
| R-17 (out-scope, guard) | `SPECIFICATIONS.md:144-146` | task-01 | `robots.ts:5` allow-all, không chặn AI crawler; `llms.txt` tồn tại | ✅ | ai-friendly-web gate PASS |

## 3. Đối chiếu artifact ↔ sitemap (reconcile số liệu)

- Sitemap: **8 static path + 13 dynamic path = 21 unique path** (`sitemap.ts:8`, cộng slug từ content) × 2 locale = **42 entry**; **không có `/api/*`, không 404**.
- Build: **21 HTML/locale × 2 = 42** + `_not-found.html` = **43 static HTML** ✅ khớp task-01 ("42 URL") + task-02/03 ("43 HTML").
- `localePrefix: 'as-needed'` (`src/i18n/routing.ts:6`) — `vi/*` = URL default không prefix, `en/*` = prefixed; **không phải duplicate content**.

## 4. Deploy config — kiểm chi tiết

- `Dockerfile`: multi-stage `node:22-slim`, `npm ci`, `npm run build`, runner `ENV ... PORT=8080 HOSTNAME=0.0.0.0`, tạo user non-root `nextjs` (uid 1001), copy `.next/standalone` + `.next/static` + `public`, `EXPOSE 8080`, `USER nextjs`, `CMD ["node","server.js"]` ✅ (standalone layout + non-root + PORT 8080).
- `.next/standalone/server.js` **tồn tại** ✅ (khớp CMD).
- `deploy.yml`: `on: workflow_dispatch` **chỉ** ✅; không auto push/tag/deploy; `permissions: contents:read, id-token:write`; dùng `vars.GCP_*` (không secret hardcode) ✅; flags R-27 đúng: `--region asia-southeast1` (`:14,45`), `--max-instances 3` (`:46`), `--min-instances 0` (`:47`), `--allow-unauthenticated` (`:48`), `--port 8080` (`:49`) ✅.
- `ci.yml`: push/PR → lint → `next typegen` → typecheck → build; nội dung hợp lệ (không thấy diff baseline vì shell denied) — **"unchanged" chưa xác thực git-level** (residual).
- `db_tool: none` / `migration_required: false` (`project-config.md:44-45`) → **bỏ migration gate** ✅; runbook ghi "Không cần DB/migration".
- Runbook đủ mục: Prerequisites / Build+push / Deploy / Verify `/api/health` / Rollback / Domain-HTTPS (R-19) / Scale-cost / Troubleshooting ✅.

## 5. Gap register (Layer 4)

**BLOCKING: không có.**

**PARTIAL (đo bị chặn — non-blocking, đã task-allow):**
- `[PARTIAL] R-22` — Lighthouse Performance score + LCP<2.5s + CLS<0.1 chưa đo (`layer-4-task-02.md:49-50`). Owner: layer-4-task-02.
- `[PARTIAL] R-23` — emulation chính xác 375/768/1280 chưa render (`layer-4-task-03.md:56`). Owner: layer-4-task-03.

**MINOR non-blocking (carry-forward):**
- m-L4T1: desc detail <150 ký tự; sitemap không `lastModified`; `Organization.logo` = banner (chưa có asset logo vuông).
- m-L4T2: MDX `sizes="100vw"` vs body max-w-720px (latent); `alt=''` default; `{...props}` spread.
- m-L4T3-1..4: `useContactForm.readServerErrors` dùng presence; `MobileNav` thiếu `overflow-y-auto`; `SolutionCard` "Learn more" `aria-hidden`; duplicate import/unused var pre-existing. `text-primary` 4.31:1 ngoài node flagged.
- m-L4T4-1..3: Dockerfile/deploy chưa pin `--platform linux/amd64`; `NEXT_PUBLIC_SITE_URL` build-time chưa truyền build-arg; `--set-secrets ...:latest` unpinned.
- Quan sát thêm: `progress.json` đặt `totalLayers: 5` trong khi layer-plan dừng ở **Layer 4** → lệch nhỏ metadata (non-blocking); `robots.ts` allow-all nên `/api/*` vẫn crawl được (không có requirement cấm).

## 6. Điều kiện hoàn tất / unlock

- **Layer 4 = layer cuối.** Initial build **hoàn tất** với điều kiện: primary (a) persist report này đúng path `-round-1-spec-review.md`; (b) cập nhật `progress.json` (feature `nta-website` → `done`, sửa `totalLayers`/`currentLayer` cho khớp layer-plan); (c) chạy **`spec-publisher`** bàn giao `spec/test-scope/current.json` (`trigger: initial-build`, `scopeVersion +1`) + `spec/CHANGELOG.md` (bước 5h); (d) close-out commit (branch `main`, **không push** — `forbidden_branch: main`, `auto_push_after_pass: false`).
- **Deploy thật** chỉ ở `/start` bước 6 sau **user approve**; đó là nơi đóng 2 PARTIAL (đo Lighthouse Perf/LCP/CLS + responsive 375/768/1280).

## 7. Residual risk

1. Không tự chạy lint/typecheck/build/docker (shell denied) → tin task/reviewer report.
2. Không parse toàn bộ 43 HTML → JSON-LD/heading/noindex chỉ spot-check (`vi/contact.html` OK) + đối chiếu claim task-01 r2.
3. R-22/R-23 target phi chức năng **chưa xác thực độc lập** — rủi ro trung bình nếu Lighthouse prod <90.
4. `ci.yml` "unchanged" và sự tồn tại gap register file chưa xác minh được.

**VERDICT: ✅ PASS — initial build hoàn tất (0 blocking gap; PARTIAL/MINOR non-blocking đã liệt kê, đóng tại gate DevOps/prod).**
