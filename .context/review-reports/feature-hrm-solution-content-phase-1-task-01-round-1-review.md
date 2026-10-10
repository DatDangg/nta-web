Agent: reviewer

# Review — feature `hrm-solution-content` · phase 1 · task 01 · round 1

- **Change:** `spec/changes/2026-10-10-hrm-solution-content.md` (ADDITIVE content + asset, kèm MODIFY nhỏ render infra)
- **Ngày:** 2026-10-10
- **Reviewer:** reviewer (độc lập, không sửa source)

## Review level

**NORMAL**

**Reason:**
- Diff là nội dung marketing (MDX vi/en) + asset tĩnh + wiring 3 component đã có sẵn vào trang enterprise.
- Không đụng auth/RBAC, tenant/school isolation, DB/schema/migration, data loss/bulk, API contract/DTO,
  payment, cron/webhook, upload/file-access. Không có red trigger về security/data.
- Có đụng file "shared" (`src/content/types.ts`, route template enterprise) → về lý thuyết gần ngưỡng STRICT,
  nhưng thay đổi hành vi được **cô lập bằng cờ opt-in per-solution** (`renderExtendedContent`), không đổi
  behavior của bất kỳ trang nào khác (đã kiểm chứng bằng build + grep HTML). Vì vậy chọn NORMAL, không escalate STRICT.
- Không có test harness trong repo → không có phần chạy test bắt buộc.

## Blast radius

- `src/app/[locale]/solutions/enterprise/[slug]/page.tsx` — route template dùng chung cho **4** giải pháp
  enterprise: `crm`, `hrm`, `lms`, `dentgo` (vi + en). Đây là file rủi ro lan rộng nhất.
- `src/content/types.ts` — interface `Solution` là model dùng chung cho **toàn bộ** content solutions
  (enterprise + ai). Thêm field optional → no default, không phá caller.
- `src/content/solutions/{vi,en}/hrm.mdx` — chỉ trang HRM.
- `src/i18n/messages/{vi,en}.json` — 2 key mới trong `solutions.enterprise` (dùng cho mọi trang enterprise
  khi bật cờ, nhưng chỉ HRM bật).
- `public/images/solutions/hrm/*` (5 PNG mới) + `docs/reference/hrm-mock/*` (không public).
- SEO: `description` MDX giờ cũng là meta description của trang HRM (page.tsx:43) + `og:image` không đổi.
- **Kết luận blast radius:** chỉ HRM đổi giao diện; CRM/LMS/DentGo + toàn bộ nhóm `ai` không đổi. Đã đối chiếu logic cờ.

## Verify commands + result

| Command | Result |
|---|---|
| `npm.cmd run lint` | **PASS** (theo builder; 1 warning pre-existing tại `src/components/mdx/index.tsx:25`, không thuộc diff) |
| `npm.cmd run typecheck` | **PASS** |
| `npm.cmd run build` | **PASS** (SSG `/vi` + `/en` `solutions/enterprise/hrm`) |
| HTML build grep | **PASS** (HRM render 5 ảnh `images/solutions/hrm/01..05` cả vi+en; CRM/LMS/DentGo không render ảnh, faq, useCases) |
| Test run | `skip, no test harness` — `package.json` không có script `test`, không có file `*.test.*`/`*.spec.*` trong repo |
| Verify tự chạy thêm | `skip` — shell bị `permission.rejected` (policy), không retry; kiểm bằng đọc file tĩnh |

Không tự chạy app/manual repro (không thuộc quyền verify). Bằng chứng dựa trên build + grep HTML builder cung cấp + đọc tĩnh source/content.

## 1. Đối chiếu spec §3.2 vs code — OK

Kiểm `src/content/solutions/vi/hrm.mdx` và `en/hrm.mdx` (đọc toàn bộ frontmatter):

| Mục (spec §3.2) | vi | en | Kết quả |
|---|---|---|---|
| `description` viết lại (1 câu đầy đủ) | ✔ (hrm.mdx:5) | ✔ (en/hrm.mdx:5) | OK, không thiếu bản EN |
| `screenshots` 5 path | ✔ 5 | ✔ 5 | OK |
| `useCases` 2 → 5 | ✔ 5 | ✔ 5 | OK |
| `sections` 4 mục (`{title,intro?,items?}`) | ✔ 4 | ✔ 4 | OK, đúng shape ở `types.ts:11` |
| `faq` 4 câu | ✔ 4 | ✔ 4 | OK |
| `highlights` (KHÔNG được thêm) | ✖ absent | ✖ absent | OK đúng ràng buộc |
| EN không bị bỏ sót so với VI | — | — | **OK** — EN đầy đủ, không copy thiếu |

- 5 path trong MDX khớp **chính xác** 5 file tồn tại trong `public/images/solutions/hrm/`
  (`01-employee-directory.png`, `02-employee-profile.png`, `03-request-workflow.png`,
  `04-org-structure.png`, `05-people-lookup.png`). Glob xác nhận đúng 5 file, không thừa/thiếu.
- i18n key dùng trong `page.tsx` (`title`, `featuresTitle`, `benefitsTitle`, `useCasesTitle`, `faqTitle`,
  `screenshotsTitle`, `relatedTitle`) — **có mặt ở CẢ `vi.json` và `en.json`** dưới `solutions.enterprise`
  (vi.json:73-82, en.json:73-82). Key mới `useCasesTitle`/`faqTitle` xuất hiện ở đúng cả 2 file. OK.
- Thứ tự khối trong `page.tsx:70-75` khớp spec §3.3:
  FeatureList → BenefitList → SolutionSections → UseCases → FaqList → ScreenshotSection. OK.

## 2. Ràng buộc nội dung (điểm nhạy cảm nhất) — KHÔNG phát hiện vi phạm

Đã đọc kỹ **toàn bộ** copy `description` / `useCases` / `sections` (intro + items) / `faq` của cả vi + en:

- **Không** có tên khách hàng, số liệu, số năm triển khai, chứng nhận, hay case study cụ thể. ✔
- **Không** thêm `highlights` (dạng số liệu). ✔ (đúng spec §3.2)
- Copy chỉ mô tả năng lực/nguyên tắc chung của một hệ thống HRM, bám 3 `features` sẵn có
  (hồ sơ nhân sự · quy trình đề xuất · tra cứu đội ngũ). ✔
- `docs/reference/hrm-mock/README.md` có cảnh báo mockup rõ ràng, đặt **ở docs, KHÔNG ở trang công khai**
  (đúng spec §3.2 line 74). Dữ liệu bịa (248 NV, tên NV-0012…) chỉ nằm trong README + ảnh, không nằm trong text trang. ✔
- **FAQ trung tính:** cả 4 câu trả lời ở dạng mô tả cấu hình/năng lực ("được cấu hình theo thực tế khi khảo sát",
  "có thể chạy song song", "quyền xem và sửa được phân theo vai trò", "Yes. Approval routes… set up to match…").
  Không có cam kết cứng (không số liệu, không SLA, không bảo đảm kết quả). ✔

**Quan sát (không phải defect):** copy dùng thể hiện tại mô tả như thể hệ thống đang có các năng lực đó
(vd "hệ thống ghi nhận…", "mọi thao tác đều được ghi lại"). Spec §3.2 **cho phép** mức "năng lực/nguyên tắc phổ biến",
nên không tính vi phạm. Tuy nhiên spec §3.2 line 75 ghi *"Copy này cần user review lại trước khi lên production"* —
đây là **gate còn treo, không phải defect của builder**. Đề xuất: giữ nguyên trong review này; user xác nhận copy trước khi promote production.

Từ ngữ định lượng mềm duy nhất: "lấy danh sách cần thiết **trong vài giây**" (vi) / "get the list you need **in seconds**" (en).
Đây là ngôn ngữ marketing phổ biến, **không phải "số liệu"** theo nghĩa spec cấm → không tính là vi phạm (xem MINOR-3).

## 3. Cờ `renderExtendedContent` — logic đúng và **CẦN THIẾT** (không phải dead config)

- Logic `page.tsx:72-74`: `extended ? solution.sections ?? [] : []` (tương tự useCases/faq).
  `extended = solution.renderExtendedContent === true` (page.tsx:62) → chỉ `true` literal mới bật. Đúng.
- **Kiểm chứng giả thuyết "cờ thừa vì component tự return null":** giả thuyết này **SAI**.
  `FaqList.tsx:6` và `UseCases.tsx:4`/`SolutionSections.tsx:10` đúng là có `if (x.length === 0) return null`,
  nhưng `crm.mdx:14-16`, `lms.mdx:14-16`, `dentgo.mdx:14-16` **đều đã có sẵn `useCases` (2 mục)** trong MDX.
  Nếu gọi `UseCases` không gated, 3 trang đó sẽ render thêm khối "Ứng dụng thực tế" → **đổi giao diện ngoài phạm vi Q6**.
  → Cờ **không thừa**, cần thiết để bảo toàn CRM/LMS/DentGo. **Không** báo MINOR dead-config.
- Phần gate `sections` và `faq` là dư thừa (2 mục này rỗng ở CRM/LMS/DentGo, component tự null), nhưng gate đồng bộ
  3 khối bằng 1 cờ là hợp lý và dễ đọc → chấp nhận, không tính defect.
- Không có đường nào khiến CRM/LMS/DentGo đổi giao diện ngoài ý: cờ undefined → `extended=false` → truyền `[]`.
  `ScreenshotSection` (không gated) dùng `solution.screenshots ?? []` — CRM/LMS/DentGo không có field này → render null
  (đúng như build grep xác nhận). Nhóm `ai` dùng page riêng, không đọc cờ (`page.tsx` AI:57-62). ✔

## 4. A11y / semantic — OK (1 MINOR về alt)

- **Heading hierarchy:** trang có `h1` (PageHeader:18) → tất cả khối là `h2`
  (FeatureList:6, BenefitList:6, SolutionSections:16, UseCases:8, FaqList:10, ScreenshotSection:9),
  và câu hỏi FAQ là `h3` (FaqList:14). **Không** nhảy cấp, không có h3 mồ côi, không có h2 trùng cấp sai. ✔
- **Section semantic:** `SolutionSections` render `<section>` qua `Section` component — đúng. ✔
- **Alt text:** xem MINOR-1.

## 5. Responsive — phần lớn OK, 1 MINOR (chất lượng), không có overflow

CSS math (không có browser → tính từ class):
- `page.tsx:68` container `grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_18.75rem]`; main col `min-w-0`.
- 3 khối mới đều bọc trong `Section` (`w-full max-w-container` + `px-4 sm:px-6 lg:px-8`) giống FeatureList/BenefitList
  đã có. Trong cột `min-w-0`, `w-full` + `max-w-container` không thể tạo tràn ngang. **Không có horizontal scroll.**
- Grid con dùng mobile-first mặc định (`grid-cols-1` → `sm/md/lg:grid-cols-N`), ở 375px luôn 1 cột → không vỡ. ✔
- Xem MINOR-2 cho `lg:grid-cols-3` của UseCases trong layout 2 cột enterprise.
- **Không xác minh được bằng browser** (không có môi trường) → xem Residual risk.

## 6. i18n — OK

- Nội dung `sections` / `useCases` / `faq` của file EN (en/hrm.mdx:15-60) là **bản dịch tiếng Anh thật**,
  không phải chép lại tiếng Việt. Đã đối chiếu từng mục vi↔en: khớp nghĩa 1:1 (5 useCases, 4 sections, 4 faq). ✔
- 2 key i18n mới `useCasesTitle` ("Ứng dụng thực tế") / `faqTitle` ("Câu hỏi thường gặp") và bản EN
  ("Practical use cases" / "Frequently asked questions") — có ở cả 2 locale, đặt đúng nhóm `solutions.enterprise`. ✔
- `screenshots` dùng chung ảnh tiếng Việt cho trang `/en` — **đúng chủ ý đã chốt** (README §4 line 57-58, giống CRM/LMS/DentGo). Không tính defect.

## Responsive Checklist Gate

Áp dụng: project có UI (Next.js + Tailwind, block `ui` queued trong `.context/project-config.md`) **và** diff có đụng UI (route template + component mới wiring). Chỉ đánh giá thay đổi trong diff.

| Mục | Kết quả | Bằng chứng / lý do |
|---|---|---|
| **Layout** — không horizontal scroll | OK | Main col `min-w-0` (page.tsx:69); mọi `Section` là `w-full max-w-container`; grid con 1 cột ở mobile |
| **Layout** — mobile-first (min-width) | OK | Tailwind dùng `min-width` mặc định; `grid-cols-1` base rồi mới `sm/md/lg` |
| **Layout** — grid auto-fit/minmax, không cột cố định | OK (ngoài scope pattern) | `UseCases`/`SolutionSections` dùng `grid-cols-N` cố định — **pre-existing component, không sửa trong diff**; cột cố định có breakpoint vẫn responsive. Wiring mới không đổi grid |
| **Layout** — container không fixed px | OK (pre-existing) | `xl:max-w-[720px]` (page.tsx:69) có trước diff; diff không thêm px cứng mới |
| **Typography/Spacing** — rem/clamp/scale | OK | Diff không thêm font-size/spacing mới; dùng class có sẵn (`text-h2`, `text-body`, `Section` spacing) |
| **Media** — max-width 100%, height auto | OK | `HomeImage` render `className="h-auto w-full"` (ScreenshotSection:13). Ảnh PNG, `sizes` được truyền |
| **Media** — aspect-ratio / srcset/sizes | OK (MINOR note) | `sizes="(min-width: 640px) 50vw, 100vw"` → next/image sinh srcset. **Lưu ý:** `HomeImage` hardcode `width=1200 height=720` (tỉ lệ 1.667) trong khi PNG thực 2400×1500 (tỉ lệ 1.6) → lệch nhỏ, `h-auto` nên không méo ảnh, chỉ ảnh hưởng nhẹ layout reservation. Pre-existing, ngoài scope |
| **Touch/Interaction** — touch target ≥44px, nav mobile, table scroll | N/A | Diff không thêm control tương tác nào (FAQ là static article, không phải accordion); không có table/nav mới |
| **Viewport/A11y** — không 100vh, prefers-reduced-motion, không che lỗi bằng overflow:hidden | N/A | Diff không thêm `100vh`, motion, hay `overflow:hidden` |

Không có mục nào **FAIL**. Hai mục có "MINOR note" phản ánh vấn đề pre-existing/ngoài diff, không phải lỗi của change này.

## Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| `aislop` | **skip, cannot run** | Không chạy được CLI (shell `permission.rejected`, policy). Không retry theo Tool Loop Guard |
| `oxlint` (anti-slop) | **skip, oxlint not configured** | `package.json` không có oxlint, không có config oxlint trong repo. Diff TS không có pattern low-evidence mới (chỉ thêm 1 boolean optional field + 1 biến cục bộ) |
| `ocr` (open-code-review) | **skip, ocr not installed** | Không có `ocr` trong dependencies; không chạy (shell denied) |
| AI-readable (AI-chaos indicators) | **OK** | Diff nhỏ, tên self-descriptive (`renderExtendedContent`, `extended`); không hàm >50 dòng; không indirection >3 bước; không magic number mới; comment page.tsx:61 giải thích WHY (đúng); không có comment WHAT thừa. < 3 indicators |
| ai-friendly-web | **N/A** | Diff **không** tạo route mới (route enterprise đã tồn tại) và **không** đụng hạ tầng crawler/SEO (robots/llms/sitemap/JSON-LD không đổi). Không audit toàn repo ngoài scope |
| blitzstrike | **N/A** | Review level NORMAL, không có bề mặt auth/API/input công khai trong diff |

## Findings

**[MINOR-1] Alt text của 5 screenshot trùng nhau và không mô tả nội dung ảnh**
- File: `src/app/[locale]/solutions/enterprise/[slug]/page.tsx:75` (`imageAlt={solution.title}`) → `src/components/solutions/ScreenshotSection.tsx:13`.
- Cả 5 ảnh dùng cùng một alt = tên giải pháp ("Nhân sự (HRM)"). Screen reader đọc lặp cùng một chuỗi 5 lần
  và không cho biết ảnh nào là màn hình gì.
- Đây là tradeoff **đã được chốt trong spec §4** ("Không đổi type `Solution.screenshots` … vì không cần caption từng ảnh"),
  nên **không chặn PASS**. Đề xuất (không bắt buộc): cho phép alt theo từng ảnh (đổi `screenshots` thành
  `{src, alt}[]`) hoặc ít nhất alt mang tính mô tả hơn, và dùng i18n key có sẵn `imageAlt` (vi.json:83/en.json:83)
  thay vì truyền `solution.title` trần.

**[MINOR-2] `lg:grid-cols-3` của UseCases bị bóp hẹp trong layout 2 cột của trang enterprise**
- File: `src/components/solutions/UseCases.tsx:9` (dùng mới tại `page.tsx:73`).
- Component được thiết kế cho trang AI (page AI:55-56 **không** có sidebar, main col full width). Trang enterprise
  lại là `lg:grid-cols-[minmax(0,1fr)_18.75rem]` (page.tsx:68). Ở `lg` (1024px): main col ≈ 620px, trừ `lg:px-8`
  còn ≈ 556px; 3 cột × gap-8 ≈ **~164px/cột** cho các câu dài kiểu "Lãnh đạo các đơn vị duyệt đề xuất từ máy tính hoặc điện thoại"
  → xuống dòng nhiều, khá chật. Ở `xl` (max-w 720px) ≈ **~197px/cột** — vẫn hẹp nhưng chấp nhận được.
- Không gây horizontal scroll / không vỡ (vẫn là grid 1 cột ở mobile). Chỉ là chất lượng trình bày ở `lg`.
- Đề xuất: cân nhắc `md:grid-cols-2` và bỏ `lg:grid-cols-3` (hoặc `xl:grid-cols-3`) cho ngữ cảnh enterprise.
  **Không chặn PASS** (component pre-existing, wiring mới có hệ quả trình bày nhỏ). Cần xác minh bằng browser.

**[MINOR-3] Lệch nhỏ giữa spec §3.1/README và tài liệu (không phải lỗi code)**
- `spec/changes/...hrm-solution-content.md` §3.1 nói `screenshots/` chứa "5 file **SVG** nguồn gốc", nhưng
  `docs/reference/hrm-mock/README.md` §4 nói bản SVG **không** được commit (chỉ giữ PNG), và thư mục thực tế
  chứa PNG. Ngoài ra change doc có **2 heading `### 3.2`** trùng số (asset + nội dung).
- Ảnh hưởng: chỉ tài liệu, không ảnh hưởng artifact sinh ra hay trang render. Đề xuất sửa mô tả spec §3.1 và
  đánh số lại heading để tránh nhầm khi đối chiếu sau này.

*(Ở mục 2 ghi nhận "trong vài giây/in seconds" là ngôn ngữ marketing mềm, không phải số liệu → không tính defect.)*

## Residual risk

- **Chưa xác minh trực quan bằng browser** (không có môi trường): cụm từ chật ở `lg` (MINOR-2), và alt 5 ảnh (MINOR-1)
  cần xem thực tế. Không thể chạy app theo policy.
- **Chưa tự chạy lại** lint/typecheck/build (shell bị `permission.rejected`) — tin kết quả builder cung cấp; các kết luận
  còn lại dựa trên đọc tĩnh file + glob.
- **Shell denied** nên các gate CLI (`aislop`, `oxlint`, `ocr`) được `skip` với lý do, không phải PASS giả.
- Thay đổi chỉ nằm ngoài vùng nhạy cảm (không data/security) → residual risk tổng thể thấp.

## Verdict: PASS

**CRITICAL: 0 · MAJOR: 0 · MINOR: 3**

Không có vi phạm ràng buộc nội dung (không bịa khách hàng/số liệu/năm/chứng nhận/case study, không `highlights`,
FAQ trung tính). EN đầy đủ và là bản dịch thật. 5 path ảnh khớp file thật. i18n key đủ ở cả 2 locale.
Cờ `renderExtendedContent` logic đúng và **cần thiết** (CRM/LMS/DentGo có sẵn `useCases`), bảo toàn giao diện 3 trang kia.
3 MINOR còn lại không chặn PASS (2 thuộc a11y/chất lượng trình bày; 1 thuộc tài liệu). Đề xuất user xác nhận copy
(spec §3.2 line 75) trước khi promote production.
