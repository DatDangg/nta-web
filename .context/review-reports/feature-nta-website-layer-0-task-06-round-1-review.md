# Review — feature/nta-website · Layer 0 · Task 06 (remediation) · round 1

Agent: reviewer

> Type: task review (remediation sau phase review Layer 0)
> Work item: `feature/nta-website` · Layer `0` · Task `06` · Round `1`
> Đối tượng: diff chưa commit so với `5e6c630` — `.github/workflows/ci.yml`, `.env.local.example`,
> `src/lib/seo.ts`, `src/content/types.ts`, 14 solution MDX (`solutions/{vi,en}/*`), `SPECIFICATIONS.md`,
> `.context/design-spec.md`, `.context/decisions.md`, `tasks/nta-website/layer-0-task-06.md`.
> Nguồn gap: `.context/review-reports/feature-nta-website-layer-0-round-1-spec-review.md`.

---

## Review level

**STRICT**

## Reason

- Đụng **shared content contract** `Solution`/`CaseStudy` (`src/content/types.ts`) — mọi page Layer 2 đọc.
- Đụng **CI pipeline** (`.github/workflows/ci.yml`) — gate xác minh duy nhất của dự án.
- Đụng **intent docs** đã user-ratify (`SPECIFICATIONS.md` R-03/R-06/R-15, design-spec Screen 1/6/9).
- Không có DB/auth/tenant/payment → không leo thang thêm; STRICT là mức đúng.

## Blast radius

- `src/content/types.ts`: `Solution` (+`image?`/`screenshots?`/`relatedCases?`), `CaseStudy` (+`metrics?`) — consumer: `src/lib/content/solutions.ts`, `case-studies.ts`, mọi page L2 (SolutionCard/ScreenshotSection/CaseStudyLink/ResultBlock).
- `src/content/solutions/{vi,en}/*.mdx` (14 file): thêm `image:` frontmatter → loader `loadMdxDirectory<Solution>`.
- `src/lib/seo.ts`: hằng `BASE_URL` dùng cho hreflang/x-default (R-21).
- `.env.local.example`: khai `NEXT_PUBLIC_SITE_URL`.
- `.github/workflows/ci.yml`: thứ tự `lint → next typegen → typecheck → build`.
- Intent docs `SPECIFICATIONS.md`, `.context/design-spec.md`, `.context/decisions.md`.

## Verify commands + result

| Command (từ `project-config.md`) | Result |
|---|---|
| `npm run lint` | **Blocked** — shell permission denied (Tool Loop Guard: dừng, không retry/đổi biến thể) |
| `npm run typecheck` | **Blocked** — shell permission denied |
| `npm run build` | **Blocked** — shell permission denied |
| `rm -rf .next && npm run lint && npx next typegen && npm run typecheck && npm run build` | **Blocked** — shell permission denied |
| `git status --short` / `git diff HEAD` | **Blocked** — shell permission denied → không đọc được diff trực tiếp |

Thay vào đó, toàn bộ kiểm chứng dưới đây thực hiện bằng **Grep/Glob/Read** trên trạng thái đĩa hiện tại
(post-change). Ghi nhận đây là residual giống lớp G10 (môi trường reviewer bị deny shell), **không phải**
defect của builder. Builder khai trong `layer-0-task-06.md` §Verification Summary rằng chuỗi clean-`.next`
PASS; tôi xác minh **cơ chế** của chuỗi đó bằng static evidence (xem G1).

---

## Gap-by-gap verification (G1–G10)

### G1 (HIGH) — CI order / TS6053 trên clean checkout → ✅ PASS (static)

- `.github/workflows/ci.yml:23-30`: thứ tự `Lint` (23-24) → `Generate Next.js route types` = `npx next typegen` (25-26) → `Typecheck` (27-28) → `Build` (29-30). Đúng yêu cầu task (§G1) và đúng hướng dẫn phase review §6.3.
- Command `next typegen` là thật trong version đang pin: `node_modules/next/dist/bin/next:120` đăng ký subcommand `typegen` ("Generate TypeScript definitions for routes, pages, and layouts without running a full build."); implementation `node_modules/next/dist/cli/next-typegen.js` dùng `writeRouteTypesManifest`/`writeValidatorFile`.
- Output đích đúng file gây lỗi: `node_modules/next/dist/server/lib/router-utils/route-types-utils.js:265` ghi `routes.d.ts`; `setup-dev-bundler.js:269` dùng `distDir/types/routes.d.ts` → mặc định `.next/types/routes.d.ts`.
- Root cause xác nhận còn đúng trên đĩa: `next-env.d.ts:3` `/// <reference path="./.next/types/routes.d.ts" />`; `tsconfig.json:19` include `.next/types/**/*.ts`; `.gitignore:6` ignore `.next/`. → Trên clean checkout, `typegen` sinh file trước khi `tsc --noEmit` chạy ⇒ loại bỏ TS6053.
- **Residual:** không chạy lại được sim clean-`.next` (shell deny); không xác nhận được `next-env.d.ts` có tracked hay không qua `git` (nếu untracked, Next tự sinh lại — vẫn an toàn vì typegen chạy trước typecheck).

### G2 (MED) — Số sản phẩm tiêu biểu ≥2 → ✅ PASS

- `SPECIFICATIONS.md:59`: R-03 "≥ 2 sản phẩm tiêu biểu … hiện có 2 app thật theo R-07, section ẩn khi không có sản phẩm".
- `.context/design-spec.md:116`: "≥2 `ProductCard` (ảnh screenshot app + tên + 1 dòng), khớp 2 app thật hiện có; ẩn section khi không có sản phẩm…".
- `src/content/home.ts:16-19,28-31`: `featuredProducts` = đúng 2 app thật (`music-app`, `hair-style-ai`) ở cả 2 locale. Không bịa SP.

### G3 + G4 (MED) — `Solution.image?`/`screenshots?`/`relatedCases?` + SVG placeholder → ✅ PASS

- `src/content/types.ts:11-13`: `image?: string; screenshots?: string[]; relatedCases?: string[]`.
- Cả 7 solution × 2 locale có `image:` frontmatter (grep: 14 match). Tất cả path trỏ SVG **tồn tại** trong `public/images/solutions/`:
  `crm.svg`, `hrm.svg`, `lms.svg`, `dentgo.svg`, `boxai.svg`, `flycam.svg`, `custom-ai.svg` (glob liệt kê đủ 10 file, gồm cả các file này).
- R-06 optional: `SPECIFICATIONS.md:76` "…case study liên quan nếu có dữ liệu (tùy chọn)".
- Design Screen 6: `.context/design-spec.md:294` `CaseStudyLink` render khi `Solution.relatedCases` có dữ liệu; `:299` "vắng/rỗng → ẩn CaseStudyLink (KHÔNG hiện card rỗng); liên kết case study là tùy chọn".
- `screenshots`/`relatedCases` chưa có content dùng — chấp nhận được vì optional (task không yêu cầu bịa dữ liệu).

### G5 (LOW) — `about.partners: []` giữ nguyên → ✅ PASS

- `src/content/about/vi/about.mdx:20` và `src/content/about/en/about.mdx:20`: `partners: []` (không thêm đối tác giả).
- `.context/decisions.md:33-39` (Decision 3): giữ `[]`, ghi OQ#1 chờ xác nhận, PartnerLogos ẩn tới khi có dữ liệu thật.

### G6 (LOW–MED) — `CaseStudy.metrics?: {value,label}[]` → ✅ PASS

- `src/content/types.ts:35`: `metrics?: { value: string; label: string }[]` — đúng shape yêu cầu.
- Content **không bịa số**: grep `metrics:|value:|label:` trong `src/content/case-studies` → 0 match (metrics omit).
- Loader không bắt buộc `metrics`: `src/lib/content/case-studies.ts:6` chỉ require `slug,title,category,year,challenge,solution,result,gallery,related` → optional field không gây throw.
- Design Screen 9: `.context/design-spec.md:397` ResultBlock "…từ `CaseStudy.metrics` (số liệu thật, tối đa 3–4 chỉ số; **chưa có số liệu thật thì không hiển thị chỉ số**)".

### G7 (LOW) — `NEXT_PUBLIC_SITE_URL` + hằng BASE_URL → ✅ PASS

- `.env.local.example:74`: `NEXT_PUBLIC_SITE_URL=             # Public canonical site URL`.
- `src/lib/seo.ts:4`: `const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ntasolution.vn';` — hằng dùng chung, có fallback.
- Không phá hreflang/x-default: `src/lib/seo.ts:11-16` vẫn dựng `languages[locale]` theo `routing.locales` và `x-default = defaultLocale`.

### G8 (LOW) — Task-02 wording `'as-needed'` → ✅ PASS

- `tasks/nta-website/layer-0-task-02.md:33`: `localePrefix: 'as-needed'` + note deviation so với bản nháp `'never'` (line 34-35). Khớp `src/i18n/routing.ts`.

### G9 (LOW) — R-15 reconcile static v1 → ✅ PASS

- `SPECIFICATIONS.md:126`: R-15 "Không dựng `GET /api/posts` hoặc `GET /api/case-studies` trong v1; nội dung được render từ file tĩnh trong repo."
- `.context/decisions.md:25-31` (Decision 2): chốt static list content v1, API list ngoài scope.

### G10 / N2 (MED, process) — residual, không fix code → ⚠️ ACKNOWLEDGED (không tính PASS/FAIL code)

- `.context/decisions.md:33-39`: ghi G10/N2 là residual (shell deny lịch sử) đúng như task yêu cầu.
- Trong review này, shell cũng bị deny → **không tái lập độc lập** được `lint/typecheck/build`. Ghi ở §Residual risk, không quy kết builder.

---

## Kiểm tra khác

### Intent docs — chỉ đổi mục ratified

- Các mục ratified hiện đúng: R-03 (`SPECIFICATIONS.md:59`), R-06 (`:75-77`), R-15 (`:126`); design Screen 1 (`:115-116`), Screen 6 (`:289-306`), Screen 9 (`:391-403`).
- Không phát hiện mâu thuẫn còn sót trong `SPECIFICATIONS.md`/`.context/design-spec.md` ở các mục ratified (không còn "≥3–4 sản phẩm" tại Screen 1/R-03).
- **Residual:** không đọc được `git diff` (shell deny) ⇒ **không chứng minh được tuyệt đối** là không có edit ngoài scope ở các file docs. Đã kiểm nội dung các mục trọng tâm thấy đúng.

### Regression content

- Solution: 7 file × 2 locale (glob `src/content/solutions/**/*.mdx` = 14) — khớp.
- Task này chỉ sửa solution MDX; `products`/`case-studies`/`blog` không bị đụng ⇒ số lượng 2 product / 2 case / 4 post giữ nguyên như phase review ghi nhận.
- Loader: `loadMdxDirectory` spread frontmatter (`load-mdx.ts:17`); solution loader không assert (không bắt buộc field mới) ⇒ optional field không throw 2 locale.
- `.context/decisions.md` có đủ 3 decision (contract remediation, static v1, residual).

### Gate kết quả

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| Responsive Checklist | **N/A** | Diff không đụng UI (không route/component/CSS). |
| `aislop scan` | **skip** — shell permission denied | Không chạy được lệnh. |
| `oxlint` (anti-slop) | **skip, oxlint not configured** | `package.json` chỉ có `eslint`; không thấy config oxlint. |
| `ocr` (open-code-review) | **skip** — shell permission denied | Không chạy được lệnh. |
| AI-readable | **OK** | `types.ts` 63 dòng, `seo.ts` 19 dòng, `ci.yml` 30 dòng — dưới `max_file_lines: 300`; không magic number/indirection/comment WHAT mới; `decisions.md` cập nhật luồng contract. |
| ai-friendly-web | **N/A** | Task nội bộ (remediation), không phải web public/deploy. |
| blitzstrike (pentest) | **N/A** | Diff không phải auth/API public/input; không có attack surface mới. |

---

## Findings

### [MINOR] `.env.local.example:74` — vị trí biến `NEXT_PUBLIC_SITE_URL` lệch nhóm

- Biến canonical site URL nằm ngay dưới header `# CONTACT FORM` (line 71-73), cùng block `CONTACT_FORM_TARGET`, dù không liên quan form.
- Đề xuất: tách nhóm "SITE / SEO" riêng (hoặc gom cạnh DEPLOY) để tránh nhầm với secret form. Không chặn PASS.

### [MINOR] CI chưa hardening (`timeout-minutes`, `concurrency`)

- `.github/workflows/ci.yml:11` không set `timeout-minutes`, không `concurrency`. Đây là N4 (LOW) phase review, **ngoài scope** task-06 (Gap List không yêu cầu). Ghi nhận, đề xuất task riêng; không chặn PASS.

Không phát hiện **CRITICAL** hoặc **MAJOR** trong phạm vi đoạn diff.

## Residual risk

- Shell bị permission denied ⇒ **không tái lập độc lập** `npm run lint` / `typecheck` / `build` và không xem được `git diff`. Kết luận G1 dựa trên static verification (subcommand + output path + root-cause reference khớp). Đây là hạn chế môi trường reviewer (cùng lớp G10), cần CI thật chạy khi push làm gate xác minh cuối.
- Không xác nhận được `next-env.d.ts` có tracked hay không (không chạy `git ls-files`); cơ chế fix vẫn đúng trong cả hai trường hợp.
- Chưa verify collateral edits ngoài scope trên docs (không có diff).

## Verdict

✅ **PASS** — 0 CRITICAL · 0 MAJOR · 2 MINOR.

Toàn bộ gap G1–G9 được xử lý đúng và kiểm chứng tĩnh được; G10/N2 ghi nhận residual đúng yêu cầu.
Residual verify (shell deny) thuộc môi trường reviewer, không phải defect của builder; đề xuất CI trên push
là gate xác minh cuối cùng trước khi đóng Layer 0.
