# Spec Validation — feature/nta-website · Layer 0 (phase review · round 2)

Agent: spec-validator

> Type: **Phase review hết Layer 0** (initial build) — re-validate sau remediation task-06.
> Work item: `feature/nta-website` · Layer: `0` · Round: `2`
> Baseline round 1 (FAIL): `.context/review-reports/feature-nta-website-layer-0-round-1-spec-review.md` (G1–G10).
> Remediation: `tasks/nta-website/layer-0-task-06.md` · reviewer PASS STRICT
> `.context/review-reports/feature-nta-website-layer-0-task-06-round-1-review.md` · commit `c7c35c3` (vs `5e6c630`).
> Quyết định user-ratified tại checkpoint: G2 = "≥2 sản phẩm"; G3/G4 = `Solution` optional
> `image`/`screenshots`/`relatedCases` + R-06 optional; G6 = `CaseStudy.metrics?` không bịa số.
> Nguồn đọc: `SPECIFICATIONS.md` 1.0.0 · `.context/design-spec.md` · `.context/decisions.md` ·
> `.context/project-config.md` · `docs/ERD.md` · `docs/API_SPEC.md` · `src/content/**` · `src/lib/**` ·
> `.github/workflows/ci.yml` · `.env.local.example` · `next-env.d.ts` · `.gitignore` · `tasks/nta-website/layer-0-task-02.md` ·
> `.context/progress.json`.

---

## Verdict: ✅ PASS

Toàn bộ gap G1–G9 (round 1) **resolved**; G10/N2 ghi nhận residual đúng yêu cầu. **Không có ❌**,
**không có conflict HIGH**, **< 3 ⚠️** (chỉ 2 observation LOW, pre-existing, non-blocking).
R-15 đã reconciled. Layer 0 đủ điều kiện unlock Layer 1 (còn chờ human checkpoint).

---

## 1. Gap Resolution Matrix (G1–G10)

| ID | Mức (round 1) | Kết quả | Evidence (đọc trực tiếp round 2) |
|---|---|---|---|
| **G1** | HIGH | ✅ **RESOLVED** | `.github/workflows/ci.yml:23-30`: thứ tự `Lint`(23-24) → `Generate Next.js route types` = `npx next typegen`(25-26) → `Typecheck`(27-28) → `Build`(29-30). Root cause còn đúng: `next-env.d.ts:3` reference `./.next/types/routes.d.ts`; `.gitignore:6` ignore `.next/`. Subcommand xác nhận tồn tại: `node_modules/next/dist/cli/next-typegen.js` (+`.d.ts`). ⇒ trên clean checkout, Next sinh route types **trước** `tsc --noEmit` → loại TS6053. |
| **G2** | MEDIUM | ✅ **RESOLVED (ratified)** | `SPECIFICATIONS.md:59`: R-03 "≥ 2 sản phẩm tiêu biểu … section ẩn khi không có sản phẩm". `.context/design-spec.md:116`: "≥2 `ProductCard` … khớp 2 app thật hiện có". `src/content/home.ts:16-19` (vi) & `:28-31` (en): `featuredProducts` = đúng 2 app thật (`music-app`, `hair-style-ai`). Không còn "≥3–4" ở R-03/Screen 1. |
| **G3** | MEDIUM | ✅ **RESOLVED (ratified optional)** | `src/content/types.ts:13`: `relatedCases?: string[]`. `SPECIFICATIONS.md:76`: R-06 "…case study liên quan nếu có dữ liệu (tùy chọn)". `.context/design-spec.md:294,299`: `CaseStudyLink` render khi `Solution.relatedCases` có dữ liệu; rỗng → ẩn (không card rỗng). Không có case AI → chấp nhận vì optional; **không bịa case**. |
| **G4** | MEDIUM | ✅ **RESOLVED (ratified optional)** | `src/content/types.ts:11-12`: `image?: string; screenshots?: string[]`. 14/14 solution MDX (`solutions/{vi,en}/*.mdx`) có `image:` trỏ SVG **tồn tại**: `public/images/solutions/{crm,hrm,lms,dentgo,boxai,flycam,custom-ai}.svg`. Loader `src/lib/content/solutions.ts:7` chỉ assert base fields → optional field không throw. |
| **G5** | LOW | ✅ **RESOLVED (documented residual)** | `src/content/about/vi/about.mdx:20` & `src/content/about/en/about.mdx:20`: `partners: []` (không thêm đối tác giả). `.context/decisions.md:33-39` (Decision 3): giữ `[]`, OQ#1 chờ xác nhận thật, PartnerLogos ẩn tới khi có dữ liệu. |
| **G6** | LOW–MEDIUM | ✅ **RESOLVED (ratified, không bịa số)** | `src/content/types.ts:35`: `metrics?: { value: string; label: string }[]`. Content: **0** frontmatter `metrics:` (grep `^metrics:` = 0 match); result dạng định tính — `case-studies/vi/oc-eo-learning.mdx:10` "Kết quả định lượng chưa được xác nhận.", `case-studies/en/dental-clinic-operations.mdx:10` "No verified metrics are available for publication.". `.context/design-spec.md:397` (Screen 9): "…tối đa 3–4 chỉ số; **chưa có số liệu thật thì không hiển thị chỉ số**". Không có số liệu bịa. |
| **G7** | LOW | ✅ **RESOLVED** | `.env.local.example:74`: `NEXT_PUBLIC_SITE_URL=` (có comment canonical site URL). `src/lib/seo.ts:4`: `const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ntasolution.vn';`; hreflang/x-default giữ nguyên (`:11-16`). |
| **G8** | LOW | ✅ **RESOLVED** | `tasks/nta-website/layer-0-task-02.md:33`: `localePrefix: 'as-needed'` kèm note deviation so với bản nháp `'never'` (`:34-35`). Khớp `src/i18n/routing.ts`. |
| **G9** | LOW | ✅ **RESOLVED** | `SPECIFICATIONS.md:126`: R-15 "Không dựng `GET /api/posts` hoặc `GET /api/case-studies` trong v1; nội dung render từ file tĩnh". `.context/decisions.md:25-31` (Decision 2). `docs/API_SPEC.md:30-31` vẫn caveat đúng "(nếu cần động; v1 có thể là static)" → không mâu thuẫn. |
| **G10 / N2** | MEDIUM (process) | ⚠️ **ACKNOWLEDGED (residual, không fix code)** | `.context/decisions.md:33-39`: ghi G10/N2 là residual (shell-deny lịch sử). Trong round này shell cũng bị deny → **không tái lập độc lập** `lint/typecheck/build`/`git diff`; kết luận G1 dựa trên static evidence (subcommand thật + output path + reference khớp). Đúng yêu cầu task-06 (không phải defect builder). |

**Kết luận gap:** 9/9 gap code/docs (G1–G9) **resolved**; G10/N2 là residual quy trình đã được ghi nhận hợp lệ.

---

## 2. Coverage R-01…R-27 (so với round 1 — không đổi bất thường)

Legend: ✅ covered · 🟡 partial (nền tảng, hoàn thiện ở layer sau) · ⬜ deferred (có task layer sau).

- **Không có R nào mất owner.** Layer 0 vẫn chỉ deliver nền tảng: R-16 ✅, R-23 ✅; R-19/R-20/R-21/R-25/R-26/R-27 🟡; R-01..R-15/R-17/R-18/R-22/R-24 ⬜/🟡 với task ở L1–L4 (như round 1).
- **R-15 — thay đổi duy nhất:** round 1 = 🟡 ⚠️ (không owner, chốt static chưa reconcile) → round 2 = **✅ reconciled** (`SPECIFICATIONS.md:126` + `.context/decisions.md:25-31`). Đúng như yêu cầu.
- **R-03:** round 1 ⚠️ (conflict ≥3–4 vs content 2) → round 2 ✅ ratified "≥2" + content khớp.
- **R-06:** round 1 ⚠️ (thiếu case AI + thiếu field link) → round 2 ✅ optional `relatedCases` + R-06 optional.
- **R-08/R-26:** giữ nguyên 🟡 (case study list/detail + content mẫu at L2); G6 metrics giờ có contract.
- Không phát hiện requirement nào bị drop/đổi status bất thường.

---

## 3. Conflicts mới (spec vs design vs ERD vs code)

**Không có conflict HIGH. Không có ❌.** Chỉ 2 observation LOW, pre-existing (không phải conflict mới do task-06):

| # | Mức | Nội dung | Nguồn |
|---|---|---|---|
| O1 | ⚠️ LOW | Screen 1 – CaseStudyHighlight (featured case) mô tả "tên dự án, **1 kết quả số thật**, link" nhưng content result là câu định tính, chưa có empty-state clause riêng cho block này (Screen 9 đã có clause "không có số liệu → không hiển thị"). Pre-existing; không thuộc Gap List round 1; non-blocking (Layer 2 xử lý gracefully theo Decision 1 "no fabricated numbers"). | `.context/design-spec.md:117` vs `src/content/case-studies/vi/oc-eo-learning.mdx:10`; `.context/decisions.md:20` |
| O2 | ⚠️ LOW | Screen 6 example còn ghi "vd 'Óc Eo'" cho `CaseStudyLink` giải pháp AI, trong khi Óc Eo là `category: enterprise` và chưa có case AI. Vô hại (relatedCases optional) nhưng ví dụ có thể gây nhầm khi implement L2. | `.context/design-spec.md:294` vs `src/content/case-studies/vi/oc-eo-learning.mdx:4`; `SPECIFICATIONS.md:76` |

Checklist đối chiếu chéo (không phát hiện lệch mới):
- Spec R-03 "≥2" ↔ design Screen 1 "≥2" ↔ `home.ts` 2 app thật — **khớp**.
- Spec R-06 "case study liên quan tùy chọn" ↔ design Screen 6 `relatedCases` optional ↔ `types.ts:13` — **khớp**.
- Design Screen 9 `CaseStudy.metrics` ↔ `types.ts:35` ↔ content không bịa số — **khớp**.
- ERD entity (Solution has many CaseStudy; CaseStudy has many Image) ↔ `Solution.relatedCases` + `CaseStudy.gallery` — **tương thích** (không mâu thuẫn schema, ERD là mức khái niệm file-content).
- R-15 spec static ↔ `docs/API_SPEC.md:30-31` caveat "(nếu cần động; v1 có thể là static)" — **không mâu thuẫn**.
- `.context/decisions.md` phản ánh đúng 3 quyết định ratified (contract remediation / static v1 / residual), không có edit vượt phạm vi.
- SVG asset: các path content tham chiếu đều tồn tại (`glob public/images/**/*.svg` = 19 file, gồm đủ 7 solution SVG + product + case + blog).

---

## 4. Verdict Reasoning

- **G1 (HIGH — nguyên nhân FAIL round 1):** CI nay có bước `npx next typegen` **giữa** `lint` và `typecheck`,
  đúng thứ tự chuẩn; root cause (`.next/types/routes.d.ts` gitignored, reference trong `next-env.d.ts`) được
  xử lý đúng cơ chế. Xác minh `next-typegen.js` tồn tại trong `node_modules/next/dist/cli` → subcommand thật.
  ⇒ **hết điều kiện FAIL HIGH**.
- **G2/G3/G4/G6:** spec + design + code + decisions **khớp** đúng 3 quyết định user-ratified; content không bịa
  sản phẩm/case/số liệu; optional field không gây throw ở loader. Contract nội bộ Layer 2 tiêu thụ đã ổn định.
- **G5/G7/G8/G9:** lần lượt được giữ nguyên có chủ đích (partners []), khai env, sửa wording, reconcile static —
  tất cả có evidence trên đĩa.
- **R-15 reconciled**, coverage R-01..R-27 không đổi bất thường.
- Chỉ còn 2 observation **LOW pre-existing** (O1/O2) — không phải conflict mới, không chạm ngưỡng FAIL
  (không ❌ / không HIGH / < 3 ⚠️). G10/N2 residual quy trình đã được ghi nhận hợp lệ.

⇒ **✅ PASS** — Layer 0 "đã build đúng & đủ so với spec (bao gồm các quyết định ratified)"; unlock Layer 1
(qua human checkpoint).

**Residual risk / Blocked:**
- **Blocked (môi trường):** shell bị `permission denied` → không chạy được `npm run lint/typecheck/build`,
  `git diff`/`git ls-files`. Đã dừng theo Tool Loop Guard (không retry/đổi biến thể). Kết luận G1 dựa trên
  static verification độc lập (subcommand + output path + reference khớp).
- Chưa xác nhận được `next-env.d.ts` có tracked hay không (không chạy được `git ls-files`); cơ chế fix đúng
  trong cả hai trường hợp (typegen chạy trước typecheck). **CI trên push là gate xác minh cuối cùng.**
- O1/O2 cần xử lý ở Layer 2/L4 khi render (graceful empty cho featured case; chỉnh ví dụ Screen 6) — không chặn.
