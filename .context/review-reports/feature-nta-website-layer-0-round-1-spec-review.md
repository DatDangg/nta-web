# Spec Validation — feature/nta-website · Layer 0 (phase review · round 1)

> Type: **Phase review hết Layer 0** (initial build) — cross-check deliverable Layer 0 với spec/design/docs
> TRƯỚC khi unlock Layer 1.
> Work item: `feature/nta-website` · Layer: `0` · Round: `1`
> Nguồn đọc: `SPECIFICATIONS.md` 1.0.0 · `.context/design-spec.md` · `docs/DESIGN.md` · `docs/ERD.md` ·
> `docs/BRD.md` · `docs/API_SPEC.md` · `docs/PERMISSION.md` · `BRIEF.md` · `.context/project-config.md` ·
> `docs/specs/2026-10-08-nta-website-design.md` · `tasks/nta-website/layer-0-task-0{1..5}.md` ·
> `.context/review-reports/feature-nta-website-layer-0-task-0{1..5}-*.md` · code `src/**`, `public/**`,
> `.github/workflows/ci.yml`, `.env.local.example`, `.gitignore`, `package.json`.

---

## Verdict: ❌ FAIL

FAIL do **1 conflict HIGH** + **≥3 ⚠️ (MEDIUM)**: CI verify order mâu thuẫn với residual Task-01 (HIGH),
và các gap contract/type (Solution thiếu field ảnh + link case study; R-03 vs R-07 count; CaseStudy.result
không có metrics cho ResultBlock). Danh sách gap cần xử lý ở mục **Gap List** cuối báo cáo.
**Không tự sửa code, không commit** — trả gap cho builder/loop/design owner.

---

## 1. Feature Coverage Matrix (R-01…R-27)

Legend: ✅ covered · 🟡 partial (đã có nền, cần layer sau) · ⬜ deferred (có task ở layer sau) · ❌ missing/no owner.

| Req | Nguồn spec | Layer 0 status | Owner layer / note |
|---|---|---|---|
| R-01 Hero | `SPECIFICATIONS.md:53-56` | ⬜ | L2 `layer-2-task-01` (Home). Chưa làm ở L0 — đúng kế hoạch. |
| R-02 3 mảng card | `SPECIFICATIONS.md:57-58` | ⬜ | L2 task-01. Data sẵn: `src/content/home.ts:11-15` (3 card) ✅. |
| R-03 SP tiêu biểu ≥3–4 + CTA | `SPECIFICATIONS.md:59-60` | ⬜ ⚠️ | L2 task-01. **Conflict C4**: `home.ts:16-19,28-31` chỉ 2 item, spec đòi ≥3–4. |
| R-04 About 5 khối | `SPECIFICATIONS.md:64-65` | ⬜ 🟡 | L2 task-02. Content có 5 block nhưng `partners: []` (`about/vi/about.mdx:20`) → ẩn PartnerLogos. |
| R-05 Enterprise + 4 slug | `SPECIFICATIONS.md:69-71` | 🟡 | Content+slug sẵn: `slug.ts:3` `crm|hrm|lms|dentgo`, 4×2 file. Route ở L2 task-03. |
| R-06 AI + 3 slug + case related | `SPECIFICATIONS.md:75-77` | 🟡 ⚠️ | L2 task-04. **Conflict C5**: không có case study AI; Óc Eo `category: enterprise`; type Solution thiếu link case. |
| R-07 Products (2 app) | `SPECIFICATIONS.md:81-83` | 🟡 | L2 task-05. Content 2×2 (`products/{vi,en}/music-app|hair-style-ai`), `downloadUrl: null` ✅. |
| R-08 Case study list+detail | `SPECIFICATIONS.md:87-90` | 🟡 | L2 task-06. 2×2 case ✅; cả 2 `category: enterprise` → filter AI/App AI rỗng (edge case). |
| R-09 Blog list+detail | `SPECIFICATIONS.md:94-98` | 🟡 | L2 task-07. 4×2 post, slug khớp filename ✅. |
| R-10 Contact page | `SPECIFICATIONS.md:102-105` | ⬜ | L3 task-02. |
| R-11 Nav/Footer | `SPECIFICATIONS.md:109-111` | ⬜ | L1 task-02 (immediate next layer). |
| R-12 404 | `SPECIFICATIONS.md:112-113` | ⬜ | L1 task-05. |
| R-13 POST /api/contact | `SPECIFICATIONS.md:119-123` | ⬜ | L3 task-01. |
| R-14 GET /api/health | `SPECIFICATIONS.md:124-125` | ⬜ | L3 task-01. |
| R-15 GET /api/posts, /api/case-studies | `SPECIFICATIONS.md:126-128` | 🟡 ⚠️ | Không có task nào own. `layer-0-task-03.md:27,87` chốt "bỏ qua ở v1 (static)". Cần doc-reconcile R-15. |
| R-16 No DB, content file | `SPECIFICATIONS.md:132-138` | ✅ | L0 task-03: `src/content/types.ts` + `src/lib/content/*` + MDX pipeline (`load-mdx.ts`, `render-mdx.tsx`). |
| R-17 No auth | `SPECIFICATIONS.md:142-144` | 🟡 | Middleware locale-only, không guard (`src/middleware.ts:1-8`) ✅; API no-auth ở L3. |
| R-18 Guard order contact | `SPECIFICATIONS.md:145-147` | ⬜ | L3 task-01. |
| R-19 HTTPS + no secret leak | `SPECIFICATIONS.md:148-150` | 🟡 | L0 task-05: env example, không `NEXT_PUBLIC_*` secret, `.env.local` ignored ✅; HTTPS enforce ở L4. |
| R-20 i18n VI/EN | `SPECIFICATIONS.md:154-155` | 🟡 | L0 task-02 plumbing done (`routing.ts`, `middleware.ts`, `[locale]/layout.tsx`, messages skeleton, `seo.ts`). Full nav/footer/meta ở L1/L2. |
| R-21 SEO | `SPECIFICATIONS.md:156-157` | 🟡 | L0 task-02 hreflang helper (`seo.ts:4-17`) — chưa được gọi. sitemap/robots/JSON-LD ở L4 task-01. |
| R-22 Performance | `SPECIFICATIONS.md:158-159` | ⬜ | L4 task-02. |
| R-23 Responsive breakpoints | `SPECIFICATIONS.md:160-167` | ✅ | L0 task-01: `tailwind.config.ts:6-12` = 640/768/1024/1280/1536, khớp R-23 + `project-config.md:112`. |
| R-24 Accessibility | `SPECIFICATIONS.md:168-169` | ⬜ | L4 task-03. |
| R-25 Business rules | `SPECIFICATIONS.md:170-173` | 🟡 | BR-003 ✅ (`home.ts` 3 mảng), BR-004 ✅ (case anonymize, `dental-clinic-operations.mdx:6,9`); BR-001 ở L1, BR-002 ở L2/L3. |
| R-26 ≥9 nhóm trang + content mẫu | `SPECIFICATIONS.md:174-175` | 🟡 | L0 task-04 có content đủ 9 nhóm; nhưng partners rỗng + thiếu ảnh solution (xem C6). |
| R-27 Deploy Cloud Run | `SPECIFICATIONS.md:189-191` | 🟡 | L0 task-05 CI verify; deploy thật ở L4 task-04. |

**Kết luận coverage L0:** Layer 0 chỉ deliver **nền tảng** (R-16, R-23 ✅; R-19/R-20/R-21/R-25/R-26/R-27 🟡).
**Không có R nào thiếu hẳn owner task** trừ **R-15** (intentional static, nhưng cần reconcile). Mọi R trang/UI
đều có task ở L1–L4.

---

## 2. Cross-Document Conflicts

| # | Mức | Nội dung | Nguồn |
|---|---|---|---|
| C1 | ✅ resolved | Breakpoint: 4 nguồn khác nhau → chốt thang Tailwind. Spec R-23 + `project-config.md:112` + `tailwind.config.ts:6-12` khớp. | `SPECIFICATIONS.md:164-167`, `.context/project-config.md:112` |
| C2 | MEDIUM (open) | Form "lưu/forward" vs "không lưu DB". Chưa resolve (OQ#4) — ảnh hưởng L3. | `docs/BRD.md:52` vs `docs/ERD.md:20-22`; `SPECIFICATIONS.md:135-136` |
| C3 | LOW (open) | `BRIEF.md:50` stale ("domain/ngôn ngữ còn thiếu" dù đã chốt `BRIEF.md:15-16`). | `BRIEF.md:50` |
| **C4** | **MEDIUM (new)** | R-03 đòi "≥3–4 sản phẩm tiêu biểu" nhưng R-07/BRD FR-040 chỉ định nghĩa 2 app; content có 2. Spec tự mâu thuẫn; design Screen 1 ghi "≥3–4 ProductCard". Chưa có quyết định ratify. | `SPECIFICATIONS.md:59-60,81-83`; `docs/BRD.md:73-75,93-95`; `.context/design-spec.md:115-116`; `src/content/home.ts:16-19,28-31` |
| **C5** | **MEDIUM (new)** | R-06 yêu cầu mỗi giải pháp AI có "case study liên quan (vd Óc Eo)", nhưng content chỉ có 2 case đều `category: enterprise`; Óc Eo bị gán `enterprise`. Type `Solution` không có field link case study → Screen 6 `CaseStudyLink` không có nguồn dữ liệu. | `SPECIFICATIONS.md:75-77`; `docs/BRD.md:88-90`; `.context/design-spec.md:293-296,299`; `src/content/case-studies/vi/oc-eo-learning.mdx:4`; `src/content/types.ts:3-11` |
| **C6** | **MEDIUM (new)** | Design Screens 3/4/5/6 cần ảnh solution (`SolutionCard` ảnh thật, `ScreenshotSection`), nhưng type `Solution` không có `image`/`screenshots` và content solution không tham chiếu ảnh (SVG tồn tại nhưng unused). | `.context/design-spec.md:112-116,189-191,222-228,260-264`; `src/content/types.ts:3-11`; `src/content/solutions/vi/crm.mdx` (không có image) |
| C7 | LOW (new) | Task-02 step mô tả còn ghi `localePrefix: 'never'`, code dùng `'as-needed'`. | `tasks/nta-website/layer-0-task-02.md:33` vs `src/i18n/routing.ts:6` |
| C8 | LOW (new) | `docs/DESIGN.md:156` "cân nhắc shadcn/ui" vs quyết định chốt "Tailwind only, không shadcn". | `docs/DESIGN.md:156` vs `.context/design-spec.md:8`; `.context/project-config.md:27` |
| C9 | LOW (new) | `seo.ts:7` đọc `NEXT_PUBLIC_SITE_URL` nhưng biến này không có trong env example → luôn rơi về fallback hardcode. | `src/lib/seo.ts:7`; `.env.local.example` (không có var) |

---

## 3. Missing Edge Cases (trước khi vào Layer 1/2)

1. **[PARTIAL] Screen 9 ResultBlock** — design yêu cầu "số liệu thật, số lớn `display` + label; 3–4 chỉ số
   tối đa" nhưng type `CaseStudy.result` là `string` và content chỉ có 1 câu
   (`oc-eo-learning.mdx:10`, `dental-clinic-operations.mdx:10`). Không có cấu trúc `metrics[]` để render.
   `src/content/types.ts:31`, `.context/design-spec.md:396,414-415`.
2. **[PARTIAL] Screen 6 `CaseStudyLink`** — không có case study bucket `ai`/`app-ai`; `Solution` lack field
   link case → xem C5.
3. **[PARTIAL] Screen 4 `RelatedSolutions` / Screen 9 `RelatedStudies`** — `CaseStudy.related: []` ở cả 2 case
   (`oc-eo-learning.mdx:14`, `dental-clinic-operations.mdx:14`) và `Solution` không có `related` →
   block sẽ luôn ẩn (empty state hợp lệ, nhưng không demo được).
4. **[PARTIAL] Screen 2 `PartnerLogos` (R-04)** — `partners: []` (`about/vi/about.mdx:20`, `about/en/about.mdx`)
   → 5-block About chỉ render 4 block; R-04 "đủ 5 khối" không quan sát được end-to-end.
5. **[PARTIAL] Screen 8 FilterBar** — cả 2 case `category: enterprise` → pill "AI"/"App AI" luôn rỗng;
   empty-state có spec nhưng không có dữ liệu minh hoạ cho các bucket khác.
6. **[LOW] `/vi` duplicate** — reviewer task-02 ghi build output có `/vi` + `/en`
   (`feature-nta-website-layer-0-task-02-round-1-review.md:29,46`), trong khi R-20 thiết kế VI không prefix
   (`/`). Cần đảm bảo canonical VI trỏ `/` (tránh duplicate content index) khi làm metadata ở L4.
7. **[LOW] i18n helper chưa được gọi** — `createLocaleAlternates` chưa dùng ở page nào; AC task-02 đã được
   làm rõ là "helper trả đúng object" (reviewer MINOR, `...task-02...:89-93`). Cần tích hợp ở L2/L4.
8. **[LOW] `getAboutData` non-deterministic** — lấy `items[0]` theo thứ tự `readdir`
   (`src/lib/content/about.ts:6`); với 1 file hiện OK nhưng nên lookup tường minh `about.mdx`.

---

## 4. Non-functional Gaps

| # | Mức | Gap | Bằng chứng |
|---|---|---|---|
| N1 | **HIGH** | **CI verify order**: workflow chạy `lint → typecheck → build`, nhưng `next-env.d.ts:3` tham chiếu `./.next/types/routes.d.ts` (build artifact, gitignored) → trên clean checkout `npm run typecheck` có nguy cơ **TS6053** trước khi build sinh file. Residual Task-01 đã cảnh báo "CI cần build-trước-typecheck" nhưng task-05 lại đặt typecheck trước build. | `.github/workflows/ci.yml:23-28`; `next-env.d.ts:3`; `tsconfig.json:19`; `tasks/nta-website/layer-0-task-01.md:96-99` |
| N2 | MEDIUM | **Độc lập verify yếu**: 4/5 reviewer report bị `shell permission denied` → `lint/typecheck/build` chỉ dựa builder evidence, không tái lập độc lập (chỉ task-05 reviewer chạy được). | `...task-01...:23-24,124-131`, `...task-02...:25-31`, `...task-03...:6`, `...task-04...:28-29` |
| N3 | MEDIUM | **`NEXT_PUBLIC_SITE_URL` thiếu trong env** → hreflang/metadataBase luôn dùng fallback hardcode `https://ntasolution.vn`; nên có 1 hằng BASE_URL dùng chung với `metadataBase`. | `src/lib/seo.ts:7`; `.env.local.example` (không có var) |
| N4 | LOW | CI thiếu hardening: không `timeout-minutes`, không `concurrency`. | `.github/workflows/ci.yml:11`; reviewer task-05 MINOR (`...task-05...:88-92`) |
| N5 | LOW | **Dependency/security residual**: `npm audit` 9 high/3 moderate; `eslint@8.57.1` EOL. Ngoài `check_commands`, chưa có follow-up task. | `package.json:25`; `tasks/...task-01.md:95-100` |
| N6 | LOW | **Không có test framework** (`test_command: null`) → loader/slug/i18n/routing không có test tự động. Hợp lệ theo v1 nhưng là rủi ro regression cho L2–L4. | `.context/project-config.md:36,86` |
| N7 | INFO | `spec/test-scope/current.json` vẫn là bản `trigger: initial-build`/`scopeVersion 1` từ reverse-spec; chưa cập nhật sau L0 (đúng workflow: spec-publisher chạy ở cuối layer cuối §5h). | `spec/test-scope/current.json:1-6` |
| N8 | INFO | R-19 HTTPS enforce + deploy chưa có ở L0 (đúng kế hoạch L4). Env example không chứa `NEXT_PUBLIC_*` secret ✅. | `.env.local.example:71-75`; `SPECIFICATIONS.md:148-150` |

---

## 5. Tech Stack Consistency

| Hạng mục | Spec | Implementation | Kết quả |
|---|---|---|---|
| Framework | Next.js App Router + TS (`SPECIFICATIONS.md:38`) | `next ^15.5.27`, App Router `src/app` | ✅ |
| Styling | Tailwind CSS, "Tailwind only (không shadcn)" (`project-config.md:27`) | `tailwindcss ^3.4.18` + `tailwind.config.ts` | ✅ (xem C8 cho doc legacy) |
| i18n | `next-intl` hoặc `next-i18n` (`SPECIFICATIONS.md:40`) | `next-intl ^4.14.9` + middleware + `[locale]` | ✅ |
| Content | file MDX/JSON/TS, SSG/SSR (`SPECIFICATIONS.md:39`) | `gray-matter` + `next-mdx-remote ^6` + loaders server-only | ✅ |
| DB | none (`project-config.md:44-45`) | không có ORM/DB | ✅ |
| Scripts | `lint`/`typecheck`/`build` đúng `check_commands` | `package.json:7-10` (`eslint .`, `tsc --noEmit`, `next build`) | ✅ |
| CI/CD | GitHub Actions (`project-config.md:52`) | `.github/workflows/ci.yml` | ✅ (xem N1) |

Không phát hiện lệch stack nghiêm trọng. Chỉ C8 (doc intent còn nhắc shadcn) là stale text.

---

## 6. Suggestions (non-blocking, hướng xử lý)

1. **Chốt C4** (số sản phẩm tiêu biểu) tại checkpoint design/brainstorm: hoặc hạ R-03/design về "≥2", hoặc
   bổ sung sản phẩm hợp lệ trong 3 mảng (không bịa để tránh vi phạm BR-003/anti-slop).
2. **Chốt C5 + C6 + edge case #1**: trước Layer 2, cần một trong hai —
   - thêm field vào type: `Solution.image`/`screenshots`, `Solution.relatedCaseStudy` (hoặc `related`),
     `CaseStudy.metrics?: {value,label}[]` + content tương ứng; **hoặc**
   - bổ sung mapping module tường minh (slug → ảnh, slug → case) nếu giữ type tối giản.
   Đây là *contract nội bộ* dùng bởi mọi page L2, sửa sau sẽ tốn hơn.
3. **Sửa N1 trước khi bật CI**: đổi thứ tự pipeline (build trước typecheck) **hoặc** thêm bước sinh type
   của Next (`next build`/typegen) trước `tsc`, **hoặc** bỏ reference `.next/types/routes.d.ts` khỏi
   `next-env.d.ts` tracked. Cũng nên xác nhận `next-env.d.ts` có được track hay không.
4. **Thêm `NEXT_PUBLIC_SITE_URL=` vào `.env.local.example`** + tách hằng `BASE_URL` dùng chung cho
   `seo.ts` và `metadataBase` (R-21).
5. **Sửa doc stale**: task-02 `'never'` → `'as-needed'` (C7); cân nhắc ghi chú `docs/DESIGN.md:156` đã bị
   thay bởi quyết định "Tailwind only" (C8).
6. **Rà soát R-15**: ghi rõ trong spec/doc rằng v1 render static, API list không dựng (hoặc mở task riêng).
7. **Canonical `/vi` vs `/`** (edge case #6): xác nhận next-intl `as-needed` không tạo route index trùng khi
   làm metadata L4.
8. Bổ sung follow-up task đánh giá `npm audit` + migrate ESLint 9 (N5) và (khi có) test framework (N6).

---

## 7. Gap List (để builder/loop xử lý — spec-validator KHÔNG tự sửa)

| ID | Loại | Requirement/task liên quan | Mô tả gap | Mức |
|---|---|---|---|---|
| G1 | Conflict | Task-01 residual §96-99 ↔ `layer-0-task-05` CI | CI chạy typecheck trước build vs `next-env.d.ts` reference artifact `.next/types/routes.d.ts` → nguy cơ TS6053 clean checkout. | HIGH |
| G2 | Conflict / content | R-03 ↔ R-07 ↔ `home.ts` | Số sản phẩm tiêu biểu: spec ≥3–4 vs content 2. Chưa ratify. | MEDIUM |
| G3 | Missing | R-06 / Screen 6 / `types.ts` | Không có case study AI + `Solution` thiếu field link case study → `CaseStudyLink` không nguồn. | MEDIUM |
| G4 | Missing | Screens 3/4/5/6 / `types.ts` | `Solution` thiếu `image`/`screenshots`; content solution không tham chiếu ảnh → `SolutionCard`/`ScreenshotSection` thiếu dữ liệu. | MEDIUM |
| G5 | Partial | R-04 / Screen 2 / `about.mdx:20` | `partners: []` → PartnerLogos ẩn; R-04 "đủ 5 khối" chưa quan sát được. | LOW |
| G6 | Partial | Screen 9 / `types.ts:31` | `CaseStudy.result` string, không có `metrics[]` cho ResultBlock 3–4 chỉ số. | LOW–MEDIUM |
| G7 | Non-functional | R-21 / `.env.local.example` | `NEXT_PUBLIC_SITE_URL` dùng nhưng không khai trong env. | LOW |
| G8 | Doc | R-20 / task-02 | Task doc ghi `localePrefix: 'never'` vs code `'as-needed'`. | LOW |
| G9 | Doc | R-15 | Không task nào own; chốt static cần reconcile. | LOW |
| G10 | Process | R-19/verify | 4/5 review không tái lập verify (shell deny) → CI là xác minh thật duy nhất, càng làm G1 nghiêm trọng. | MEDIUM |

---

## 8. Verdict Reasoning

- Layer 0 **đã làm đúng các deliverable nền tảng**: scaffold Next 15 + TS + Tailwind v3 + scripts đúng
  `check_commands`; i18n `next-intl` VI/EN (`as-needed`) với middleware locale-only; content domain layer
  (types + MDX pipeline + loaders server-only + slug helpers khớp R-05/R-06); content mẫu đủ 9 nhóm trang
  (BR-003/BR-004 OK); CI + env + gitignore + README. R-16/R-23 **đạt**; nhiều R ở trạng thái 🟡 nền tảng.
- Tuy nhiên, có **1 conflict HIGH** (G1 — CI order vs `next-env.d.ts` reference; reviewer task-01 đã cảnh báo
  nhưng task-05 triển khai ngược) và **nhiều ⚠️ MEDIUM** (G2 count sản phẩm; G3/G4 contract `Solution`
  thiếu field ảnh + link case study — dùng bởi mọi page Layer 2; G6 metrics case study).
- Vì các gap type/contract này là **hợp đồng nội bộ** mà Layer 2 tiêu thụ, sửa sau khi Layer 2 đã build sẽ
  đắt hơn nhiều; và CI có nguy cơ fail ngay lần push đầu. Do đó theo FAIL trigger (≥1 HIGH conflict + ≥3 ⚠️),
  kết quả phase review Layer 0 là **FAIL** — cần chốt/xử lý Gap List **trước khi unlock Layer 1**.
- Lưu ý: một số gap là "documented deviation" (G2 đã ghi ở `layer-0-task-04.md:90-91`; G5/G9 là
  `[cần xác nhận]` OQ) và **không** tự động đồng nghĩa code sai — nhưng chưa được user/design ratify nên
  chưa thể coi Layer 0 "đúng & đủ so với spec".

**Residual risk / Blocked:**
- **Blocked**: không chạy được `git ls-files`/`git status`/`npm run *` (shell permission denied) → không tự
  xác minh N1 (tracking `next-env.d.ts`, CI thật) và không tái lập lint/typecheck/build. Đã dừng theo
  Tool Loop Guard, không retry.
- Giả định N1 dựa trên: `.gitignore` KHÔNG ignore `next-env.d.ts` (`/home/alpenliebe/Desktop/NTA_web/.gitignore`),
  `next-env.d.ts:3` chứa reference tới artifact `gitignore` `.next/`. Nếu `next-env.d.ts` không được track,
  N1 giảm còn MEDIUM.
