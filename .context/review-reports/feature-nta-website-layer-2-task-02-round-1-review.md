Agent: reviewer

# Review — `layer-2-task-02` · Screen 2 `/about` (feature: nta-website)

- **Work item:** `builder/nta-website`
- **Phase/Task:** layer-2-task-02 (round 1)
- **Review level:** `NORMAL`
- **Reason:** Trang tĩnh SSG (`db_tool: none`, `test_command: null`), scope 1 route (2 locale); các shared
  primitive được **tiêu thụ, không sửa** (không có diff lên `src/components/ui/**`, `shared/**`, layout).
  Không đụng auth/tenant/schema/API/webhook/payment → không có trigger đỏ nào bắt buộc `STRICT`.
- **Date:** 2026-10-09

## Blast radius

- Route `/about` (VI) và `/en/about` (EN) — render + metadata/hreflang.
- `src/components/about/*` (5 component page-local mới).
- `src/i18n/messages/{vi,en}.json` (thêm khoá `about.*`).
- Tiêu thụ (không sửa): `src/components/shared/{PageHeader,CTABanner,HomeImage}.tsx`,
  `src/components/ui/{Section,Reveal}.tsx`, `src/lib/content/about.ts`, `src/content/about/{vi,en}/about.mdx`,
  `src/content/types.ts`, `src/lib/seo.ts`.
- Không ảnh hưởng route/client/data khác; không có thay đổi contract dùng chung.

## Verify commands + result

> ⚠️ **Bash bị permission deny cho subagent reviewer này** (`permission.rejected: "Permission denied: shell"`).
> Theo Tool Loop Guard: không retry, không đổi biến thể. Vì vậy các lệnh shell (gồm `git status/diff` và 3
> verify command) **không chạy trực tiếp được** trong phiên review này → đánh dấu **Blocked**, không tự ý FAIL
> workflow vì lý do môi trường (tiền lệ: review layer-0 round-1 cũng shell-deny và dùng static + builder evidence).

| Command (project-config) | Result |
|---|---|
| `npm run lint` | **Blocked** — shell permission denied (builder evidence: PASS) |
| `npm run typecheck` | **Blocked** — shell permission denied (builder evidence: PASS) |
| `npm run build` | **Blocked** — shell permission denied (builder evidence: PASS, `/vi/about` + `/en/about` SSG) |
| `test` (`test_command: null`) | **skip, no test framework configured** |
| `git status --short` / `git diff` | **Blocked** — shell permission denied; scope xác minh qua task file + builder journal (`filesNew`/`filesTouched`) |
| `migration` (`db_tool: none`) | N/A |

Builder evidence tham chiếu: `.context/runs/builder-nta-website-layer-2-task-02.md:20`
(`npm run lint PASS · npm run typecheck PASS · npm run build PASS`). Reviewer **không tự chạy app/manual repro**.

## Responsive Checklist Gate

Diff **đụng UI** (route + 5 component) → gate áp dụng. Đối chiếu design-spec Screen 2 responsive table
(375/768/1280; project-config `responsive_breakpoints`), xác minh bằng CSS math (không có browser).

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout — không horizontal scroll | **OK** | `CapabilityGrid.tsx:9` `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` (fr, không cột px cứng); `TeamGrid.tsx:20` `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`; `PartnerLogos.tsx:14` `grid-cols-3 sm:grid-cols-4 lg:grid-cols-6`; container `Section.tsx:26` `max-w-container px-4 sm:px-6 lg:px-8` |
| Layout — mobile-first (`min-width`) | **OK** | Mọi biến thể dùng prefix `sm:`/`md:`/`lg:` (không có `max-width` query) |
| Layout — grid `auto-fit/minmax`, không cột cố định | **OK (chấp nhận)** | Dùng `grid-cols-N` fr (layout 3/4/6 cột theo design table), không dùng px cứng; khớp design (không yêu cầu auto-fit) |
| Typography — rem/fluid | **OK** | `globals.css:32-36` tokens `clamp(...)` (`--text-h2/h3/body-lg/display`); component dùng `text-h2`/`text-h3`/`text-body-lg` |
| Spacing — scale/clamp | **OK** | `Section.tsx:23` `py-12 md:py-16 xl:py-24`; `mt-8`/`gap-6` |
| Media — `aspect-ratio`, ảnh không tràn | **OK** | `TeamGrid.tsx:9` `aspect-[4/3] overflow-hidden`; `HomeImage` render `next/image`; logo `h-12 w-auto max-w-full object-contain`; `sizes` có ở cả team + logo |
| Touch — target ≥ 44×44px | **OK** | `PartnerLogos.tsx:17` link `min-h-11` (=2.75rem=44px); logo `h-12` (48px) |
| Table → scroll/card trên mobile | **N/A** | Không có `<table>` trong diff |
| Nav hamburger mobile | **N/A** | Nav thuộc layout layer-1, ngoài diff |
| Viewport — không `100vh` | **OK** | Không có `100vh`/`h-screen` trong diff |
| A11y — `prefers-reduced-motion` | **OK** | `globals.css:88-93` + `Reveal.tsx:18-22` (matchMedia → static) |
| Không che lỗi bằng `overflow:hidden` | **OK** | `overflow-hidden` ở TeamGrid chỉ để bo ảnh `rounded-lg`, không che layout tràn |
| Responsive khớp bảng Screen 2 | **OK** | base: capability 1 cột / team 1 cột / logos 3 / timeline dọc; md: capability 2 / team 2 / logos 4 / timeline dọc; lg: capability 4 / team 4 / logos 6 / timeline ngang (`MilestoneTimeline.tsx:12` `lg:flex`) |

**Kết luận gate:** không có mục FAIL. Phần chưa xác minh trực quan (hover thật trên browser) ghi ở Residual risk.

## Skill gates

| Gate | Kết quả | Bằng chứng / lý do |
|---|---|---|
| aislop (`aislop scan --changes`) | **skip** | Shell permission denied; không tìm thấy config aislop (`glob .aisloprc*/aislop.config.*` → none) |
| anti-slop / oxlint | **skip, oxlint not configured** | `glob .oxlintrc*` / `oxlint.json` → none |
| open-code-review (`ocr`) | **skip, not run** | Shell denied; diff TS/JS đã được soi thủ công (không thấy XSS/SQLi/NPE/thread-safety) |
| AI-readable codebase | **OK** | 5 file 15-32 dòng, hàm <50 dòng; tên self-descriptive; không comment WHAT; indirection thấp. Chỉ 1 tín hiệu nhẹ: vài magic number trong arbitrary value (`-start-[1.95rem]`, `lg:-top-[0.4rem]`) → <3 indicators |
| ai-friendly-web | **N/A** | Task build page, không phải deploy public; `robots.txt`/`sitemap.xml`/JSON-LD SEO defer Layer 4 task-01 (khớp design §1.8 + layer-2-task-01 precedent) |
| blitzstrike (pentest) | **N/A** | NORMAL, không auth/API public/xử lý input |

## Findings

### [MAJOR] EN meta description vượt giới hạn 160 ký tự (AC fail)
- **File:** `src/app/[locale]/about/page.tsx:21`
- **Evidence:** EN description = **164 ký tự**:
  `"Learn about NTA and our capabilities in enterprise solutions, artificial intelligence and practical mobile applications for businesses and organizations in Vietnam."`
  Task AC yêu cầu "desc 150–160 ký tự" (`tasks/nta-website/layer-2-task-02.md:34,51`) và design-spec
  `design-spec.md:88` ("`description` (150–160 ký tự)") + `design-spec.md:181` (Screen 2 SEO).
  VI description = 151 ký tự ✅ (đạt). EN 164 → vượt 4 ký tự → vi phạm acceptance criterion.
- **Fix đề xuất:** rút EN còn 150–160 ký tự, ví dụ:
  `"Learn about NTA and our capabilities in enterprise, AI and practical mobile app solutions for businesses and organizations in Vietnam."` (~145–155; chỉnh lại cho khớp 150–160).

### [MINOR] Nhánh link ngoài của `PartnerLogos` không thể render (contract mismatch, dead branch)
- **File:** `src/components/about/PartnerLogos.tsx:5,17` ↔ `src/content/types.ts:60`
- **Evidence:** `PartnerLogos` khai báo `Partner = { name; logo; href? }` và render
  `<a … rel="noopener" target="_blank">` khi `partner.href` tồn tại (`PartnerLogos.tsx:17`). Nhưng
  `AboutData.partners` (`types.ts:60`) là `{ name: string; logo: string | null }[]` — **không có `href`**;
  page truyền thẳng `about.partners` (`page.tsx:66`) → nhánh `href`/`rel="noopener"` (R-24) **không bao giờ
  chạy**. Đồng thời `Key` theo `partner.name` sẽ trùng nếu 2 logo cùng tên.
- **Fix đề xuất:** thêm `href?: string` vào `AboutData.partners` (nếu partner có website) hoặc bỏ `href`
  khỏi `Partner` để tránh dead branch; nếu giữ thì thêm key ổn định (`partner.href ?? name`).

### [MINOR] Section `PartnerLogos` (alt) liền trước `CTABanner` (alt) — phá luật xen kẽ nền
- **File:** `src/components/about/PartnerLogos.tsx:11` + `src/app/[locale]/about/page.tsx:67`
- **Evidence:** `PartnerLogos` dùng `Section variant="alt"`; `CTABanner` được gọi `variant="alt"` (§background-alt).
  Khi có partner (hiện tại `partners: []` nên section ẩn), 2 section `background-alt` sẽ đứng liền nhau,
  vi phạm design §1.3 "nền xen kẽ `background` ↔ `background-alt`".
- **Fix đề xuất:** cho `PartnerLogos` dùng `variant="default"` (giữ CTABanner `alt` theo design Screen 2).

### [MINOR] Metadata `alternates` hardcode, bỏ qua helper chung `createLocaleAlternates`
- **File:** `src/app/[locale]/about/page.tsx:32-38` ↔ `src/lib/seo.ts:6`
- **Evidence:** URLs hreflang hardcode `https://ntasolution.vn/...` → bỏ qua `NEXT_PUBLIC_SITE_URL`
  (Layer-0 note N3/G7 đã thêm env này). Helper `createLocaleAlternates('/about')` sẵn có nhưng không được
  dùng; trùng lặp với home page (layer-2-task-01). Chức năng hreflang `vi`/`en`/`x-default` vẫn **đúng**.
- **Fix đề xuất:** cân nhắc dùng `createLocaleAlternates('/about')`; hoặc để Layer-4 task-01 (SEO audit) chuẩn hoá.

### [Observation — out of scope, đề xuất task riêng] `PageHeader` render `<header>` → 2 `banner` landmark
- **File:** `src/components/shared/PageHeader.tsx:15` (pre-existing layer-1, **không** nằm trong diff task này)
- **Evidence:** site Header (layout) là `<header>`; `PageHeader` trong `<main>` cũng là `<header>` → 2 banner
  landmark/trang. Không tính FAIL cho phase này (ngoài scope diff); đề xuất task riêng khi audit a11y Layer 4.

### Accepted residual risk (không phải defect)
- `src/content/about/{vi,en}/about.mdx:20` `partners: []` là quyết định **có chủ đích** (layer-0-task-06 G5:
  "giữ nguyên, chưa có logo/đối tác thật, KHÔNG thêm đối tác giả"). Hệ quả: `PartnerLogos` bị ẩn đúng theo
  empty policy, nên khối "Đối tác" (R-04) + hover grayscale→màu + `rel="noopener"` **không xuất hiện ở output
  hiện tại** và không thể xác minh runtime. Task `layer-2-task-02.md:56` ghi manual evidence "logo hover" —
  điều này **không thể đúng** với content `partners: []`; ghi nhận là rủi ro evidence (không phải lỗi code).
- Không xác minh được `npm run lint/typecheck/build` và `git diff` do shell bị deny; đã review tĩnh toàn bộ
  file trong scope.

## Kiểm tra xác nhận (đạt)

| Yêu cầu | Kết quả | Bằng chứng |
|---|---|---|
| 7 section đúng thứ tự design | ✅ (code) | `page.tsx:61-67`: PageHeader → MissionBlock → CapabilityGrid → TeamGrid → MilestoneTimeline → PartnerLogos → CTABanner |
| ≥4 layout family, không 3 liên tiếp cùng family | ✅ | centered / statement / divider-list / image-grid / timeline / logo-grid / banner |
| Card-family không lặp (MissionBlock/CapabilityGrid không phải card) | ✅ | `MissionBlock.tsx` chỉ text centered; `CapabilityGrid.tsx:11` list + `border-t`, không elevation/shadow |
| Timeline semantic `<ol>` + ngang ở `lg` | ✅ | `MilestoneTimeline.tsx:12-15` `<ol>`, `lg:flex lg:border-s-0 lg:border-t`, dot aria-hidden |
| Logo grayscale→màu 250ms | ✅ (code) | `PartnerLogos.tsx:17,27` `grayscale transition-[filter] duration-[250ms] hover:grayscale-0` |
| Logo alt = tên đối tác | ✅ | `PartnerLogos.tsx:27` `alt={partner.name}` |
| `rel="noopener"` khi external | ⚠️ code đúng nhưng unreachable | xem finding MINOR (contract mismatch) |
| Empty: 0 milestone → ẩn Timeline | ✅ | `MilestoneTimeline.tsx:7` `if (length === 0) return null` |
| Empty: 0 logo → ẩn PartnerLogos | ✅ | `PartnerLogos.tsx:8-9` filter logo + `return null` |
| Team image error → fallback | ✅ | `HomeImage.tsx:17-19` `onError` → `role="img" aria-label` + nền `surface-sunken` |
| Metadata title 2 locale | ✅ | `page.tsx:16,20` "Về NTA \| NTA" / "About NTA \| NTA" |
| description 150–160 | ❌ EN=164 (VI=151 ✅) | xem finding MAJOR |
| `alternates`/hreflang vi/en/x-default | ✅ (chức năng) | `page.tsx:32-38` |
| Copy hiển thị qua i18n | ✅ | `page.tsx` dùng `t(...)` cho mọi nhãn; nội dung dài lấy từ MDX locale |
| Gap 6 không double `/en` | ✅ N/A | About không render link content nào; link duy nhất (`CTABanner` → `/contact`) qua `@/i18n/navigation` Link, không pre-prefix |
| No scope creep / no fork shared | ✅ | 5 component page-local mới; không sửa `components/ui|shared|layout` |
| Anti-slop (`as any`, dead code, filter().map copy) | ⚠️ | Không `as any`, không copy loop; có dead branch `href` (finding MINOR) |
| File ≤300 / hàm ≤50 dòng | ✅ | file 15-32 dòng; hàm ngắn |

## Verdict

❌ **FAIL**

Lý do: 1 finding **[MAJOR]** — EN meta description 164 ký tự vượt trần 150–160 (vi phạm acceptance criterion
`layer-2-task-02.md:34,51` và design-spec §1.8). PASS chỉ khi không còn CRITICAL/MAJOR, do đó round 1 chưa đạt.

**Action cho builder (round 2):**
1. Rút EN meta description (`page.tsx:21`) về 150–160 ký tự.
2. (Khuyến nghị, không chặn) gỡ dead branch `href` trong `PartnerLogos` hoặc bổ sung `href?` vào
   `AboutData.partners`; đổi `PartnerLogos` sang `variant="default"` để giữ xen kẽ nền.

**Residual risk:** không chạy được `npm run lint/typecheck/build` và `git diff` (shell denied) → dựa một phần
vào builder evidence + review tĩnh; không xác minh hover/timeline orientation trên browser thật.
