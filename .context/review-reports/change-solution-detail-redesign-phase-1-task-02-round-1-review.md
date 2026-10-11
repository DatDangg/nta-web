# Review Report — change `solution-detail-redesign` · Phase 1 · Task 02 · Round 1

Agent: reviewer

- **Commit review:** `f526c16` — `feat(solution-detail-t2): token ink/space, Feature[] schema, 6 component + trang preview`
- **Worktree chưa commit (polish sau commit):** `AiSection.tsx`, `AiAssistantPanel.tsx` (MỚI, untracked), `FaqAccordion.tsx`, `BentoCompliance.tsx`, `AudienceCards.tsx`, `FeatureZigZag.tsx`, `src/app/[locale]/dev/components/page.tsx`
- **Spec nguồn:** `.context/design-spec-solution-detail.md` §2 (token), §3.1 (cách hiển thị ảnh), §4.1 (schema), §5.3 (AI section)
- **Change request:** `spec/changes/2026-10-11-solution-detail-redesign.md` (§1 T2, §2 rủi ro, §4 acceptance T2)
- **Journal:** `.context/runs/t2-token-schema-components.md`
- **Review T1 (contract Container/Section):** `.context/review-reports/change-solution-detail-redesign-phase-1-task-01-round-2-review.md`
- **Review level:** `STRICT`

## Reason (vì sao STRICT)

- Rủi ro đỏ áp dụng: **schema/contract** (`Solution.features` breaking `string[]` → `Feature[]`), **shared component** dùng lại cho 4 trang giải pháp (8 route SSG), **token design system** (`--color-ink*`, `--accent-ink`).
- Thay đổi API component (`AiSection` bỏ `image/imageAlt/imageRatio` → `panel`; `FaqAccordion`/`BentoCompliance` thêm prop required) → phải soi hết call site.
- Change §5.2 yêu cầu reviewer STRICT cho T2.
- 4 trang enterprise đang **live trên prod** → sai tầng shared component = regression diện rộng.

## Blast radius

| Đối tượng | Phạm vi ảnh hưởng |
|---|---|
| `src/content/types.ts` (`Feature`, `Solution.features`) | Mọi consumer của `Solution.features`: `enterprise/[slug]`, `solutions/ai/[slug]`, `SolutionGridHome`, `FeatureList`, `FeatureZigZag` |
| `Container` (dùng bên trong 4 component mới) | `SolutionHero`, `FeatureZigZag`, `BentoCompliance`, `AudienceCards`, `FaqAccordion` |
| `Section` (thêm `variant="ink"`, `spacing`) | Mọi `<Section>` toàn site nếu truyền prop mới; 16 call site cũ không đổi |
| `ShotImage` + `features.ts` | Hero + feature ảnh của CRM/HRM/DentGo/LMS (T4/T5 sẽ wire) |
| `dev/components` route | Chỉ dev (notFound khi `NODE_ENV !== 'development'`) |
| Token `--color-ink*`, `--accent-ink`, `--space-hero/section` | Section AI (LMS), CTA cuối, hero |

**Thực tế hiện tại:** T2 **chưa gắn vào 4 trang thật** (T3–T5 mới wire) → blast radius chưa kích hoạt trên prod; rủi ro nằm ở API/pattern mà T3–T5 sẽ dùng.

## Verify commands + result

| Kênh | Kết quả |
|---|---|
| `npm.cmd run lint` | ❌ **Blocked — `permission.rejected: Permission denied: shell`** |
| `npm.cmd run typecheck` | ❌ **Blocked — permission denied** |
| `npm.cmd run build` | ⏸ Không thử (cùng lớp lệnh đã deny 2 lần — Tool Loop Guard: dừng, không retry biến thể) |
| `git show f526c16` / `git show f526c16:<file>` | ✅ Chạy được → đọc được toàn bộ diff commit |
| `git diff --stat -- src/` · `git status --short` | ❌ Blocked — permission denied. Diff worktree đọc bằng **Read file trực tiếp**. |
| `aislop scan --changes --json` | **skip** — shell deny |
| `npx oxlint` | **skip, oxlint not configured** (repo dùng eslint + eslint-config-next) |
| `ocr` | **skip** — shell deny, không xác minh được cài đặt; không chặn PASS |
| Browser render (375/768/1280) | ❌ Không thực hiện — reviewer không tự chạy app; nhiều mục dùng **CSS math**, phần không đo được ghi Residual risk |

> ⚠️ **Không reproduce được evidence "lint/typecheck/build PASS" của builder** (shell deny). Kết luận dưới đây là **phân tích source-level deterministic** (cấu trúc JSX, class, công thức contrast). Không có xác nhận build/lint/render độc lập.

---

## A. Requirements coverage (acceptance T2 — §4 change file)

| Acceptance | Kết quả | Bằng chứng |
|---|---|---|
| `Container` là nguồn duy nhất cho giới hạn bề rộng | ⚠ **Đạt lớp (mọi nơi dùng Container) nhưng SAI cách ghép** | 4 component tự bọc `<Container>` **và** caller bọc `<Section>` (Section cũng thêm Container) → nested Container → xem **MAJOR-1** |
| Contrast section `ink`: axe 0 vi phạm; `text-accent-ink` ≥ 4.5:1 | ❌ **FAIL** | `text-accent-ink` #64b5ff trên #1d1d1f = **7.69:1** ✅ (tính lại: L_acc=0.4296, L_ink=0.01239). NHƯNG `AiAssistantPanel` dùng `text-white/80` trên `bg-[#047857]` ≈ **4.11:1** và `text-white/85` ≈ **4.43:1** — **dưới AA 4.5:1** → xem **MAJOR-2** |
| `features` dạng `string[]` vẫn render (test bằng data cũ) | ⚠ **Đạt source-level, THIẾU test** | `normalizeFeatures()` (`features.ts:65-68`) đổi `string → {title}`; `FeatureZigZag:37` dùng nó; 2 trang map `typeof f === 'string' ? f : f.title`. **Không có test/data cũ** — dev preview chỉ dựng `Feature[]` (xem MINOR-5) |
| Touch target ≥ 44×44px | ✅ OK | `buttonStyles` sm/md `min-h-11` (44px), lg `min-h-12` (48px) (`Button.tsx:24-26`); `FaqAccordion` `<summary>` `min-h-11` (`FaqAccordion.tsx:43`) |

**Rà soát bổ sung (STRICT-specific):**

- `AiSection` bỏ `image/imageAlt/imageRatio` → `panel`: grep `AiSection` toàn `src/` = **chỉ** `dev/components/page.tsx:22,507` (đã truyền `panel`) + self. **Không còn consumer dùng API cũ** ✅.
- `FaqAccordion` thêm `title` required: call site duy nhất `dev/page.tsx:536` có truyền `title` ✅ (không có call site nào khác).
- `AiAssistantPanel` **không** có `'use client'` → **đúng** (component thuần, không hook). `ShotImage` có `'use client'` → **cần** (`useEffect/useRef/ResizeObserver`). ✅
- `BentoCompliance.figure` dùng `text-primary` (#0071e3) trên `bg-surface` = **#ffffff** (`globals.css:13`) → 4.69:1; nhưng số cực lớn `text-8xl`/`text-9xl` (96/128px, bold) → ngưỡng **large-text 3:1** → ✅ OK.
- Cờ `Solution.layout: 'default' | 'lms'` (§1 T2) **KHÔNG có** trong `types.ts` → **MAJOR-3**.
- `prefers-reduced-motion`: `globals.css:123-132` có override toàn cục `transition-duration: 0.01ms !important` → chevron `FaqAccordion` vẫn tôn trọng ✅.
- Token ink khớp spec §2.1 (đủ 6 token) + `--space-hero/section` khớp §2.2 ✅. Tailwind map đủ ✅.

---

## B. Responsive Checklist Gate (diff đụng UI → MANDATORY)

Breakpoints config: `640/768/1024/1280/1536`. Không có browser render → xác minh bằng **CSS math** trên code trong diff; phần không đo được ghi Residual risk (không bỏ trống gate).

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| **Layout — không horizontal scroll** | ✅ OK (CSS math) | Grid dùng `lg:grid-cols-2/3`, `minmax` gián tiếp; `text-8xl/9xl` số ngắn không tràn; `ShotImage` `max-w-full` |
| **Layout — mobile-first (`min-width`)** | ✅ OK | Chỉ dùng `sm:`/`md:`/`lg:`/`xl:` |
| **Layout — grid `auto-fit`/`minmax`, không cột cứng** | ✅ OK | `FeatureZigZag` `lg:grid-cols-2`; `Bento` `lg:grid-cols-3 lg:grid-rows-2`; `Audience` `md:grid-cols-3`; `AiSection` `lg:grid-cols-2` |
| **Layout — container không fixed px / căn đúng mép** | ❌ **FAIL** | **Nested Container**: `Section.tsx:46` bọc `<Container>`, các component lại tự bọc `<Container>` (`FeatureZigZag:40`, `Bento:34`, `Audience:16`, `Faq:38`) → cộng dồn `px-4 sm:px-6 lg:px-8` → nội dung thụt thêm ~32px so với section khác (mép trái lệch). Xem MAJOR-1 |
| **Typography — font `rem`, heading fluid** | ✅ OK | Dùng utility Tailwind (`text-h2/h3/body-lg` → `--text-*` clamp/rem); không thêm `px` font |
| **Media — ảnh `max-width:100%;height:auto`** | ✅ OK | `shotLayout` case A `h-auto w-auto max-w-full … mx-auto`; case B `h-auto w-full` + khung `max-H overflow-hidden` |
| **Media — `srcset`/`sizes`** | ✅ OK | `ShotImage` truyền `sizes`; call site đều cấp `sizes` |
| **Media — video/embed aspect** | N/A | Không có |
| **Touch — ≥44×44px** | ✅ OK | `min-h-11`/`min-h-12` (Button), `summary min-h-11` |
| **Touch — nav mobile** | N/A | Diff không đụng nav |
| **Table — scroll/card mobile** | N/A | Không có table |
| **Viewport — không `100vh` đơn thuần** | ✅ OK | Không có `vh/dvh` trong diff |
| **`prefers-reduced-motion`** | ✅ OK | Override toàn cục `globals.css:123-132` |
| **Không che lỗi bằng `overflow:hidden`** | ✅ OK | `overflow-hidden` chỉ trong nhánh B (khung cắt ảnh có chủ đích + fade) |
| **375 / 768 / 1280 render thật** | ⚠ **KHÔNG XÁC MINH ĐƯỢC** | Browser không chạy (reviewer không tự chạy app) → Residual risk, không tính FAIL (đã FAIL ở mục Layout) |

**Gate kết luận:** **FAIL** — mục "container căn đúng mép" vi phạm bằng bằng chứng source (nested Container cộng dồn padding).

---

## C. Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| `aislop scan` | **skip** — shell deny (không chạy được); không cài trong `package.json` | — |
| anti-slop / `oxlint` | **skip, oxlint not configured** | repo dùng eslint + eslint-config-next |
| `ocr` (open-code-review) | **skip** — shell deny, không xác minh được; không chặn PASS | — |
| **AI-readable gate** | ⚠ **Borderline (2 solid + 1 nhẹ, dưới/ngưỡng 3)** | (1) magic hex `#047857`/`#059669` trong `AiAssistantPanel.tsx:41`; (2) comment drift `globals.css:102-104` nói "Quyết định theo `ratio`" nhưng code **đo** `scrollHeight > clientHeight` (`ShotImage.tsx:54`) — spec §3.1 đã sửa 2026-11; (3) tên type `SectionSize` (`Section.tsx:10`) dùng cho prop `spacing`, dễ nhầm với prop `size` (borderline). → **không tự nó đủ FAIL**, nhưng nên sửa (2) và (1) |
| ai-friendly-web | **N/A** | Task nội bộ, chưa thêm surface public |
| blitzstrike | **N/A** | Không attack surface mới (thuần render/class CSS) |

---

## Findings

### [MAJOR-1] Nested `Container` → double horizontal padding, nội dung lệch mép so với section khác

- **File:** `src/components/solutions/FeatureZigZag.tsx:40`, `BentoCompliance.tsx:34`, `AudienceCards.tsx:16`, `FaqAccordion.tsx:38` + `src/components/ui/Section.tsx:46` + call site demo `src/app/[locale]/dev/components/page.tsx:453,459,467,489,526,535`.
- **Vấn đề:** `Section` **luôn** bọc children bằng `<Container>` (`Section.tsx:46`). Bốn component trên **cũng** tự bọc `<Container>`. Khi dùng đúng pattern đã minh hoạ ở trang preview (`<Section><FeatureZigZag/></Section>`, `<Section variant="alt"><BentoCompliance/></Section>`, …), ta có **Container lồng Container** → `px-4 sm:px-6 lg:px-8` cộng dồn: ở lg nội dung bị thụt thêm **32px** mỗi bên so với các section chỉ có 1 Container (home/about/…) → **lệch mép trái**, đúng lớp lỗi L2/L3 mà T1 đã sửa.
- **Bằng chứng (deterministic):** `Container` = `mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8` (`Container.tsx:34`). Ở 1280: 1 lớp → content 1216px; 2 lớp lồng → outer content 1216, inner padding 2×32 → content 1152px (thụt 32px). `AiSection.tsx:38` làm **đúng** (tự chứa `<Section>`, không thêm Container) → pattern **không nhất quán** giữa các component.
- **Tác động:** shared component sẽ dùng trên 4 trang live (T4/T5) → regression alignment diện rộng + vô hiệu hoá AC "Container là nguồn duy nhất" ở cấp bố cục.
- **Đề xuất:** chọn **một** pattern và áp cho cả 5 component: (a) component tự chứa `<Section>` như `AiSection` (khuyến nghị, đồng nhất), HOẶC (b) component **không** tự bọc `Container` — caller dùng `<Section>`; bỏ `<Container>` khỏi 4 component. Sửa luôn docstring "component KHÔNG tự py — `<Section>` lo padding" hiện chỉ đúng phần dọc.

### [MAJOR-2] Contrast `AiAssistantPanel` dưới WCAG AA trên nền xanh (vi phạm AC "axe 0 vi phạm")

- **File:** `src/components/solutions/AiAssistantPanel.tsx:44` (`text-white/80`), `:49` (`text-white/85`).
- **Vấn đề:** Thẻ nền `bg-[#047857]` (L≈0.1415). Text alpha trắng composite:
  - `text-white/80` → ~#CDE4DD → **4.11:1** (< 4.5) — nhãn `text-xs` 12px normal.
  - `text-white/85` → ~#D9EAE5 → **4.43:1** (< 4.5) — meta `text-sm` 14px normal.
- **Tác động:** panel nằm **trong section `ink`** → axe color-contrast sẽ báo vi phạm → **phá AC T2** "axe trả 0 vi phạm"; cũng là regression a11y so với tuyên bố evidence của builder (builder chỉ đo token `ink-*`, không đo panel xanh này).
- **Đề xuất:** dùng `text-white` (5.48:1 ✅) hoặc tăng opacity ≥ ~0.92; hoặc làm sáng nền thẻ. `description` (`text-white/90` ≈ 4.77:1 ✅) và `action` (`text-white` ✅) đạt.

### [MAJOR-3] Thiếu cờ schema `Solution.layout: 'default' | 'lms'` (§1 T2)

- **File:** `src/content/types.ts:30-51`.
- **Vấn đề:** Change §1 T2 quy định `types.ts` thêm **cờ `layout: 'default' | 'lms'`**; hiện `Solution` **không có** field này và không có ghi chú deferral nào trong journal/spec. Đây là deliverable T2 chưa hoàn thành (schema/contract).
- **Tác động:** T5 (layout LMS riêng, 8 block) sẽ phải branch bằng `slug`/`category` thay vì cờ data → lệch kế hoạch, hoặc phải bump schema thêm lần nữa (thêm 1 breaking touch vào `Solution`).
- **Đề xuất:** thêm `layout?: 'default' | 'lms'` vào `Solution` ngay trong T2 (hoặc ghi rõ quyết định hoãn + owner xác nhận).

### [MAJOR-4] `ShotImage` bỏ qua `skin` ở nhánh A (ratio ≥ 1.0) → ảnh mất bo góc/viền/bóng

- **File:** `src/components/solutions/ShotImage.tsx:75-78` (early return khi `!shot.frameClass`).
- **Vấn đề:** Ở nhánh A (`ratio >= 1.0` hoặc `undefined`) `shotLayout` trả `frameClass: ''`, và `ShotImage` **`return image;`** trước khi áp `skin` → **mọi ảnh ngang không nhận `rounded-lg border shadow-*`**. Nhưng call site **có truyền** `skin` với border/shadow: `SolutionHero.tsx:91` (`rounded-lg border border-border shadow-lg`), `FeatureZigZag:21` (`rounded-lg border border-border shadow-md`), `BentoCompliance:69` (`rounded-md border shadow-sm`). Spec §3 (bảng hero) + §3.1 + §4.2 yêu cầu ảnh case A có `rounded-lg border border-border shadow-*`.
- **Tác động:** đa số ảnh (hero CRM/LMS/DentGo ratio 1.35–1.40, feature ngang, DentGo `05` 1.476) render **không viền/không bóng/không bo góc** → lệch spec; và prop `skin` trở thành **tham số bị bỏ qua âm thầm** (dead/ignored param). Ngược lại nhánh B mới được áp `skin` (`:81`).
- **Đề xuất:** nhánh A trả `<Image className={`${shot.imageClass} ${skin} ${fade}`} …>` (áp skin lên chính ảnh), HOẶC nếu **cố ý** không khung cho case A thì bỏ `skin` khỏi các call site case-A và ghi rõ lý do — nhưng hiện trạng là bug (prop không có tác dụng).

### [MINOR-1] `AiAssistantPanel` hardcode màu bằng arbitrary hex, không dùng token

- **File:** `src/components/solutions/AiAssistantPanel.tsx:41` (`bg-[#047857]`, `ring-[#059669]`).
- **Vấn đề:** lệch nguyên tắc design-system (mọi màu qua token); magic value trong component.
- **Đề xuất:** thêm token (vd `--color-ai-panel` / `--color-ai-panel-border`) hoặc dùng cặp token gần nhất nếu chủ đích là "mô phỏng ảnh nền tảng".

### [MINOR-2] Comment drift: `.shot-fade-bottom` nói "quyết định theo ratio" nhưng code đo thực tế

- **File:** `src/app/globals.css:102-104`.
- **Vấn đề:** comment "Quyết định theo `ratio` trong data, không áp cứng" **mâu thuẫn code** (`ShotImage.tsx:54` quyết định fade bằng `scrollHeight > clientHeight + 1`) và mâu thuẫn spec §3.1 bản sửa 2026-11 ("Fade phải ĐO, không quyết định từ ratio"). Comment sai làm AI/người đọc dễ hiểu nhầm cơ chế.
- **Đề xuất:** sửa comment cho khớp (fade chỉ bật khi ảnh **thực sự** bị cắt — đo runtime).

### [MINOR-3] `Section.tsx` khai lại union size thay vì import `ContainerSize`; tên `SectionSize` gây nhầm

- **File:** `src/components/ui/Section.tsx:10,14`.
- **Vấn đề:** `Container.tsx:3` đã `export type ContainerSize` nhưng `Section.tsx:14` vẫn khai lại `'default' | 'prose' | 'narrow'` (tồn dư T1 MINOR-7) → dễ lệch khi thêm size. Thêm nữa, type `SectionSize` (`:10`) áp cho prop `spacing` (padding dọc), **không phải** `size` (bề rộng) → tên dễ gây nhầm (AI-readable indicator).
- **Đề xuất:** `import { ContainerSize }`; đổi tên type spacing (vd `SectionSpacing`).

### [MINOR-4] `Section.tsx` thiếu newline cuối file

- **File:** `src/components/ui/Section.tsx:49` (`\ No newline at end of file`).
- **Đề xuất:** thêm newline cuối file (tránh lint/format diff).

### [MINOR-5] AC "features `string[]` vẫn render" chưa được test bằng data cũ

- **File:** `src/app/[locale]/dev/components/page.tsx:177-186` (`toFeatures` luôn dựng `Feature[]`).
- **Vấn đề:** AC §4 T2 yêu cầu "test bằng data cũ chưa migrate" nhưng preview chỉ dùng `Feature[]`; nhánh `string[]` trong `normalizeFeatures` chưa có test/data. Project chưa có test framework (`test_command: null`) → theo workflow ghi residual, không tính FAIL.
- **Đề xuất:** thêm 1 block preview dùng `features={['chuỗi cũ 1', 'chuỗi cũ 2']}` (string[]) để chạm nhánh legacy.

**CRITICAL:** không có.
**MAJOR:** 4 (MAJOR-1 nested Container; MAJOR-2 contrast panel; MAJOR-3 thiếu cờ `layout`; MAJOR-4 `skin` bị bỏ qua ở nhánh A).

---

## Residual risk / Blocked

1. **Blocked:** shell `permission.rejected` → **không chạy được** `lint`/`typecheck`/`build`, `git diff/status`, `aislop`, `ocr`. Không reproduce được evidence "build PASS / 43 route / lint 0 errors" của builder.
2. **Blocked:** không render browser (reviewer không tự chạy app) → các mục "375/768/1280 render thật", "số ký tự/dòng", "axe 0 vi phạm" **chưa đo runtime**. MAJOR-2 tính bằng công thức WCAG (độ tin cậy cao); MAJOR-1 tính bằng CSS math (deterministic).
3. **Minority:** MAJOR-4 — nếu builder **cố ý** không khung cho case A (do khung macOS đã "nướng" sẵn vào PNG nền trong suốt) thì cần gỡ `skin` khỏi call site case-A + ghi chú; nếu không, đây là bug mất border/shadow. Không xác minh ảnh thật được (out of scope `public/images/**`).
4. **Tool-read cap:** đã dùng ~26 tool đọc (STRICT cap 25) do cần kiểm 4 gate bắt buộc (contrast, responsive, schema, call site) — không có vòng lặp tool.
5. Đã **bỏ qua** đúng phạm vi ngoài scope: `public/images/solutions/v2/**`, `scripts/screenshots/*`, `docs/screenshots-mapping.md`, `package-lock.json`, `.tmp/`.
6. **API API-change đã kiểm:** `AiSection` (panel) và `FaqAccordion` (title) — không còn consumer dùng API cũ; `AiAssistantPanel` không cần `'use client'` (đúng).

**Mức tin cậy verdict:** MEDIUM-HIGH cho 4 MAJOR (source-level deterministic). Không có xác nhận build/lint/render độc lập.

## Verdict: ❌ FAIL

- Còn **MAJOR** và **1 mục Responsive gate FAIL** → không đủ điều kiện PASS:
  - **MAJOR-1** nested `Container` → double horizontal padding, lệch mép (shared component, 4 trang).
  - **MAJOR-2** contrast `AiAssistantPanel` `text-white/80` 4.11:1 & `white/85` 4.43:1 — vi phạm AC "axe 0 vi phạm" của section `ink`.
  - **MAJOR-3** thiếu cờ schema `Solution.layout` (§1 T2).
  - **MAJOR-4** `ShotImage` bỏ qua `skin` ở nhánh A → ảnh mất bo góc/viền/bóng, lệch spec §3/§3.1/§4.2.
- **Đề xuất trước khi PASS lại:** sửa 4 MAJOR; chạy thật `npm run lint|typecheck|build` (khi shell được cấp quyền) để xác nhận verify của builder; bổ sung 1 block preview dùng `features: string[]` (MINOR-5); sửa comment drift `globals.css` (MINOR-2).
