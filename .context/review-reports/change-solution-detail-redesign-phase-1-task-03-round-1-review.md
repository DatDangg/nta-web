# Review — change `solution-detail-redesign` · Phase 1 · Task T3 · Round 1

Agent: reviewer

> **Đường dẫn report:** ghi theo tên canonical của workflow (`<feature|change>-<slug>-phase-<N>-task-<NN>-round-<R>-review.md`),
> đồng bộ với report T1/T2 trong cùng folder. Orchestrator yêu cầu alias `change-solution-detail-t3-round-1-review.md`
> → **không tạo file trùng**; dùng file này (nội dung là source of truth).

## Review level

`NORMAL`

## Reason

- Task **data-only**: migrate `features: string[]` → `Feature[]` trong 8 file `.mdx` + 1 expression trong `page.tsx`.
- **Không** đỏ risk: không auth/RBAC, không tenant isolation, không đổi schema code (`types.ts` do T2 làm, T3 không đụng),
  không API contract, không payment, không migration DB (`db_tool: none`).
- Có **breaking data shape** trong working tree (8 file đổi shape cùng lúc) → không đủ điều kiện `FAST`
  (T2 đã có `normalizeFeatures()` làm rollback path). Change file §5.2 cũng chốt **NORMAL cho T3/T4**.
- → Chọn `NORMAL`.

## Blast radius

| Vùng | Ảnh hưởng |
|---|---|
| `src/content/solutions/{vi,en}/{crm,hrm,dentgo,lms}.mdx` | 8 file, chỉ block `features` đổi shape; `benefits/useCases/sections/screenshots/faq` nguyên |
| `src/app/[locale]/solutions/enterprise/[slug]/page.tsx:82` | 1 expression (map features → `string[]` cho `FeatureList`) |
| `FeatureList` (`src/components/solutions/FeatureList.tsx`) | API không đổi (`string[]`), DOM/`<li>` count không đổi → 4 trang enterprise × 2 locale |
| `FeatureZigZag` / `normalizeFeatures` (`src/components/solutions/features.ts`) | Không đổi, vẫn nhận cả `string[]` |
| AI solution pages (`src/app/[locale]/solutions/ai/[slug]/page.tsx:57`) | Không đụng; data AI **không** migrate trong task này → không regression |
| `SolutionGridHome.tsx:26`, `ProductStrip`/`AppCard` | `features: []` / type `Product.features: string[]` riêng → không ảnh hưởng |

## Verify commands + result

| Command | Result |
|---|---|
| `npm run lint` | **BLOCKED (environment)** — `npm.ps1 cannot be loaded because running scripts is disabled` (ExecutionPolicy). Exited 1. |
| `npm.cmd run lint` | **BLOCKED (permission)** — reviewer allowlist chỉ khớp literal `npm run …`; `npm.cmd …` bị deny. Không retry biến thể. |
| `npm run typecheck` | **Not run** — cùng blocker `npm.ps1` (đã quan sát ở lint → không lặp lại invocation bị chặn). |
| `npm run build` | **Not run** — cùng blocker `npm.ps1`. |
| `npx tsc --noEmit` | **BLOCKED (environment)** — `npx.ps1 cannot be loaded … scripts is disabled`. |
| `node scripts/screenshots/.tmp/verify-t3.mjs` | **Not run** — script đọc `.next/server/app/**/solutions/enterprise/*.html`; glob artifact → **0 file** (không có build output trong working tree) + `node` không nằm trong allowlist reviewer. |
| `aislop scan --changes --json` | **skip** — `The term 'aislop' is not recognized` (chưa cài). |
| `ocr --version` | **skip** — `The term 'ocr' is not recognized` (chưa cài). |

**Verification thay thế (trong phạm vi được allow):** `git diff HEAD` cho 8 `.mdx` + `page.tsx` + đọc trực tiếp
`FeatureList.tsx` / `features.ts` / `types.ts` / `page.tsx`. Toàn bộ phần soi nội dung dưới đây dựa trên diff thật,
không dựa lời builder.

> ⚠ **Không xác minh được runtime/compile trong round này** (lint/typecheck/build bị environment chặn) → xem *Residual risk*.
> Builder claim (journal T3): lint 0 error · typecheck PASS · build 51/51 · verify-t3 8/8 — **reviewer không tái lập được**.

## Kiểm chứng nội dung (diff-based, đây là phần quyết định verdict)

### 1. Trùng chuỗi gốc — CRM / HRM / DentGo (AC(b)) — ✅ OK

Join trong `page.tsx:82` = `title + " — " + description`, khớp đúng format bản gốc (em-dash có space 2 bên):

| File | Bản gốc (git) | Sau migrate (title + ` — ` + description) | Khớp |
|---|---|---|---|
| vi/crm 1–4 | `"Tổng quan vận hành hằng ngày — màn hình chào…"` … | title `Tổng quan vận hành hằng ngày` + desc `màn hình chào…` | ✅ 4/4 |
| en/crm 1–4 | `"Daily operations overview — a time-based…"` … | ✅ | ✅ 4/4 |
| vi/dentgo 1–4 | `"Tổng quan ca làm đa chi nhánh — bảng điều khiển…"`, ……, `"Kho vật tư – thuốc gắn vào điều trị — quản lý…"` | tách tại **duy nhất** `—`; `–` (en-dash) trong title **giữ nguyên** | ✅ 4/4 |
| en/dentgo 1–4 | `"Inventory – supplies tied to treatment — manage…"` | ✅ | ✅ 4/4 |
| vi/hrm 1–3 | `"Hồ sơ nhân sự"` / `"Quy trình đề xuất"` / `"Tra cứu thông tin đội ngũ"` | title-only (không có `—`/`:` → theo rule §8.1) | ✅ 3/3 |
| en/hrm 1–3 | `"Employee records"` / `"Request workflows"` / `"Team information lookup"` | title-only | ✅ 3/3 |

Không thêm/bớt từ, không đổi viết hoa, không thêm dấu chấm, không đổi dấu câu trong 7 file này. ✅

### 2. Số tính năng (AC(a)) — ✅ OK

`crm 4 · hrm 3 · dentgo 4 · lms 4` × VI/EN = đúng như trước migrate (đếm trực tiếp trên số dòng `- title:` thêm vào diff,
khớp số dòng bị xoá của block `features`). Không gộp, không mất feature.

### 3. LMS copy (ngoại lệ §11.2) — ✅ OK

- Title VI khớp §5.1: `Quản trị đa trường & bảng điều khiển` · `Hồ sơ học sinh – phụ huynh – nhân sự` ·
  `Đánh giá học sinh + trợ lý AI gợi ý nhận xét` · `Thời khoá biểu · giáo án điện tử · học bạ số`.
- Description VI/EN khớp **từng ký tự** §11.2 (VI #1–4, EN #1–4), gồm cả en-dash `kéo–thả` / `soạn–duyệt`.
- **Không có em-dash mới** trong copy LMS của `mdx`; không có `+`/`−` marker hay "cảnh báo sớm".

### 4. YAML / field khác — ✅ OK

- Diff chỉ nằm trong hunk `features:` (`@@ -6,10 +6,14 @@` với crm/dentgo/lms, `@@ -6,9 +6,9 @@` với hrm) →
  `benefits`, `useCases`, `sections`, `screenshots`, `faq`, `title`, `description`, `image`, `slug`,
  `renderExtendedContent` **không đổi** (còn nguyên trong file, kể cả nhánh bị T5 ngừng render).
- Scalar đều quote `"…"`, indent 2 space nhất quán; không có tab; ký tự đặc biệt (`&`, `360°`, `:`, `(`, `)`, `·`, `–`, `—`)
  đều nằm trong chuỗi quote → YAML hợp lệ.

### 5. `page.tsx:82` — fix hợp lý hay regression? — ✅ **Hợp lý (transitional bridge), KHÔNG phải regression**

- Trước T3: data là `string[]` → `typeof f === 'string' ? f : f.title` render đúng chuỗi gốc.
- Sau T3 (nếu không sửa): data là `Feature[]` → chỉ còn `f.title` → **mất description** = vi phạm AC(b) "câu chữ giống hệt".
- Fix ghép `title — description` giữ **nguyên văn bản render + nguyên DOM** (`<span>` như cũ, `FeatureList` vẫn nhận `string[]`,
  `key` vẫn unique) → đúng tinh thần "chỉ tách title/description, không đổi cái người dùng thấy" trong khoảng T3→T4.
- Type narrowing không đổi so với code T2 đã commit (cùng union `Feature[] | string[]`), nhánh `description` falsy → fallback `title`, trả về `string`.
- ❗ Kèm **nghĩa vụ bắt buộc cho T4**: khi trang chuyển sang `FeatureZigZag`, phải **bỏ** phép ghép này (nếu để lại sẽ
  hiển thị `title — description` như một dòng/hoặc lặp description).
- Hệ quả phụ: trong khoảng T3→T4, HTML LMS có ký tự ` — ` do phép ghép sinh ra (không phải copy trong `mdx`).
  Vi phạm tạm thời AC "không em-dash trong copy mới" ở **tầng render**, tự hết sau T4/T5 → xem Findings #1.

## Responsive Checklist Gate

**N/A** — diff T3 không đụng UI structure/CSS/route:
- `.mdx`: chỉ block `features` đổi shape (strings → map), không đổi markup.
- `page.tsx`: chỉ đổi biểu thức trong prop `features={…}`; **không** đổi `className`, không thêm/xoá element, không đổi breakpoint.
- Nội dung render ra giữ nguyên độ dài (LMS ngắn hơn bản gốc) → không phát sinh rủi ro overflow 375/768/1280.
- Không có môi trường browser → nếu có thay đổi layout ở T4/T5, gate responsive phải chạy lại đầy đủ ở (các) task đó.

## Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| aislop | `skip, not installed` | `aislop scan --changes --json` → `The term 'aislop' is not recognized` |
| oxlint (anti-slop) | `skip, oxlint not configured` | `package.json` devDeps không có oxlint; không có file config oxlint trong repo |
| ocr (open-code-review) | `skip, ocr not installed` | `ocr --version` → `The term 'ocr' is not recognized` (không chặn PASS theo gate) |
| AI-readable | **OK** (0 indicator) | Diff không thêm hàm/biến mới ngoài 1 expression; không magic number, không indirection mới, không comment WHAT thêm, không đổi luồng chính → không cần cập nhật README/ARCHITECTURE |
| ai-friendly-web | `N/A` | Task không đụng route/meta/crawl artifact. `public/llms.txt` **có** (glob OK); `public/robots.txt`/`public/sitemap.xml` không thấy (có thể sinh qua App Router) → thuộc gate deploy/DevOps, không phải T3 |
| blitzstrike | `N/A` | NORMAL, data-only tĩnh (YAML nội dung), không có attack surface/input |
| Security | `N/A` | Không input người dùng, không secret, không query, không sanitize boundary mới |
| Responsive | `N/A` | Không đụng UI (xem gate trên) |

## Findings

### [MINOR] #1 — `page.tsx:82` ghép `' — '` là bridge tạm, phải gỡ ở T4 (kèm rủi ro em-dash render cho LMS)

`src/app/[locale]/solutions/enterprise/[slug]/page.tsx:82`

- Không phải regression (xem mục 5), nhưng là **hardcode separator** trùng kiến thức với data và là code phải xoá.
- Fix đề xuất: giữ nguyên cho T3 (đúng AC), **bổ sung dòng "T4 bắt buộc revert dòng này"** vào task/journal T4;
  ở T4 dùng `normalizeFeatures()` + `FeatureZigZag` (render `title`/`description` tách phần tử) thay vì ghép chuỗi.
- Ảnh hưởng phụ: HTML LMS trong khoảng T3→T4 chứa ` — ` do ghép (copy trong `mdx` thì sạch, đúng §11.8) →
  cần xác nhận lại ở screenshot duyệt T4/T5 ("không em-dash").

### [MINOR] #2 — `lms.mdx` chưa có cờ `layout: 'lms'` (spec R3/§10.1) — phải chốt ở T4/T5

`src/content/solutions/vi/lms.mdx:8` + `src/content/solutions/en/lms.mdx:8`

- Spec §3 R3/§10.1 chốt: thay `renderExtendedContent` bằng `layout: 'default' | 'lms'` (LMS = `lms`).
- `types.ts` hiện tại: thiếu cờ → `default` ⇒ nếu T5 quên thêm, **layout LMS sẽ không kích hoạt**.
- AC của T3 chỉ gồm 2 mục (đủ số tính năng + câu chữ) nên **không tính FAIL cho T3**, nhưng T3 là task duy nhất sửa 8 file `.mdx`
  — cần ghi nhận để T4/T5 đóng, tránh rơi mất.

### [MINOR] #3 — EN title LMS giữ bản dịch cũ (spec thiếu bảng EN title)

`src/content/solutions/en/lms.mdx:9-15`

- §11.2 chỉ có bảng **description** VI/EN; "tiêu đề giữ nguyên như §5.1" nhưng §5.1 chỉ có title **VI** → không có nguồn EN.
- Builder giữ EN title gốc (đã ghi trong journal) — hợp lý (không tự bịa), nhưng title EN #3 `Regulation-based assessment with AI support`
  lệch trọng tâm so với title VI mới (`… + trợ lý AI gợi ý nhận xét`). Đề xuất: spec-validator/user xác nhận ở T5;
  nếu cần, thêm bảng EN title vào §11.

### [MINOR] #4 — description tách ra bắt đầu bằng chữ thường (đúng rule §8.1 nhưng sẽ nhìn lạ trong zig-zag T4)

`vi/*.mdx`, `en/*.mdx` — description bắt đầu lowercase (`màn hình chào theo buổi…`, `a time-based landing screen…`).

- Đúng rule §8.1 ("không đổi viết hoa", "không thêm dấu chấm nếu bản gốc không có") → **không phải defect của T3**.
- Nhưng ví dụ ngay trong §8.1 lại viết hoa description (`"Lịch sử đến quán…"`, thêm cả dấu chấm) → spec tự mâu thuẫn.
  Khi T4 render description thành đoạn riêng/`<p>` riêng, câu sẽ bắt đầu bằng chữ thường.
- Đề xuất: T4 QA thị giác + user chốt 1 trong 2 hướng (giữ nguyên chữ thường, hoặc cho phép capitalize khi render — không sửa data).

### [MINOR] #5 — Commit hygiene: working tree còn thay đổi không thuộc T3

- `git diff HEAD --stat` cho thấy ngoài 8 `.mdx` + `page.tsx`, còn:
  `package-lock.json` (`-11`), `src/app/[locale]/dev/components/page.tsx`, `scripts/screenshots/capture.mjs`,
  `.context/design-spec-solution-detail.md`, `spec/changes/2026-10-11-solution-detail-redesign.md` (thuộc T2, **chưa commit**).
- Đề xuất: commit T3 **chỉ 9 file** (`src/content/solutions/**` + `page.tsx`) để giữ "1 task = 1 commit" và surgical diff;
  phần còn lại commit/đặt tên riêng (T2) hoặc ghi rõ trong commit body.

### [MINOR] #6 — Không tìm thấy task file T3

Glob `tasks/change-solution-detail*/**/*.md` → 0 kết quả. AC/rule phải lấy từ change file §4 + design spec §8.1;
traceability/progress vẫn ổn nhưng task file sẽ giúp close-out rõ ràng hơn. Không chặn.

### Không có [CRITICAL] / [MAJOR]

Không có mục nào vi phạm AC(a)/(b), không mất/hỏng field YAML, không regression cho consumer khác của `features`.

## Residual risk

1. **Chưa chạy được lint / typecheck / build** trong round này (blocker environment: ExecutionPolicy chặn `npm.ps1`/`npx.ps1`;
   allowlist reviewer chỉ khớp literal `npm run …`, `npm.cmd …` bị deny). Bằng chứng thay thế là diff + đọc code; rủi ro
   type-error được đánh giá rất thấp (1 expression, cùng shape union đã build PASS ở T2) nhưng **chưa được tái lập độc lập**.
2. `scripts/screenshots/.tmp/verify-t3.mjs` **không chạy được**: cần build output (`globs `.next/**.html` → 0 file`) và `node` không nằm trong allowlist. Bằng chứng "8/8 route render" hiện chỉ từ journal builder.
3. Chưa kiểm tra bằng browser: độ dài dòng/overflow 375–1440 của 4 trang (thay đổi text không đổi layout → rủi ro thấp).
4. Chưa xác minh các file AI (`flycam/custom-ai/boxai`) có/không có `features` — ngoài scope T3, không đụng data này.
5. Cap tool đọc của reviewer (NORMAL: 15) đã bị vượt nhẹ trong quá trình soi diff/glob; các mục chưa soi hết đã ghi ở trên.

## Verdict

✅ **PASS**

- AC(a) 4 trang × 2 locale đủ số tính năng: **đạt** (crm 4 · hrm 3 · dentgo 4 · lms 4).
- AC(b) câu chữ CRM/HRM/DentGo giống hệt bản gốc, chỉ tách `title`/`description`: **đạt** (đối chiếu từng ký tự trên diff).
- LMS dùng copy §11.2 + title §5.1: **đạt**, không em-dash trong `mdx`.
- `page.tsx:82` là **fix transitional hợp lý, không phải regression**; kèm nghĩa vụ revert ở T4 (Findings #1) và
  bổ sung cờ `layout: 'lms'` (Findings #2).
- Không có CRITICAL/MAJOR. 6 MINOR là việc theo dõi/đóng ở T4–T5 hoặc hygiene commit — không chặn commit T3
  **với điều kiện** commit đúng phạm vi 9 file và ghi nhận residual risk #1/#2 (verify command chưa tái lập được trong môi trường này).
