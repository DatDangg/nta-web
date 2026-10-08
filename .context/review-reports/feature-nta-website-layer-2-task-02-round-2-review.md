Agent: reviewer

# Review — `layer-2-task-02` · Screen 2 `/about` (feature: nta-website) · round 2

- **Work item:** `builder/nta-website`
- **Phase/Task:** layer-2-task-02 (round 2 — rerun sau round-1 FAIL đã rework)
- **Review level:** `NORMAL`
- **Reason:** Trang tĩnh SSG (`db_tool: none`, `test_command: null`), scope 1 route (2 locale). Các shared
  primitive (`Section`, `Reveal`, `HomeImage`, `PageHeader`, `CTABanner`) được **tiêu thụ, không sửa**.
  Không có diff lên auth/tenant/schema/API/webhook/payment → không có trigger đỏ bắt buộc `STRICT`.
- **Date:** 2026-10-08 (rerun; ghi đè bản round-2 dang dở của phiên bị interrupt)
- **Bối cảnh:** Round-1 FAIL vì 1 MAJOR (EN meta description 164 ký tự) + 3 MINOR. Round này xác minh
  MAJOR/MINOR đã fix và re-check toàn bộ acceptance criteria.

## Blast radius

- Route `/about` (VI) + `/en/about` (EN) — render 7 section + metadata/hreflang.
- `src/components/about/*` (5 component page-local: MissionBlock, CapabilityGrid, TeamGrid,
  MilestoneTimeline, PartnerLogos).
- `src/i18n/messages/{vi,en}.json` (khoá `about.*`).
- Tiêu thụ (không sửa): `src/components/ui/{Section,Reveal}.tsx`, `src/components/shared/{PageHeader,CTABanner,HomeImage}.tsx`,
  `src/lib/content/about.ts`, `src/content/about/{vi,en}/about.mdx`, `src/content/types.ts`, `src/lib/seo.ts`.
- Không ảnh hưởng route/client/data khác; không đổi contract dùng chung.

## Verify commands + result

> ⚠️ **Shell bị permission deny cho subagent reviewer này** (`permission.rejected: "Permission denied: shell"`).
> Theo Tool Loop Guard: **không retry, không đổi biến thể**. Vì vậy toàn bộ lệnh shell (gồm `git status/diff`
> và 3 verify command) **không chạy trực tiếp được** trong phiên review này → **Blocked** (không tự FAIL workflow
> vì lý do môi trường; cùng tiền lệ round-1 và review layer-0/layer-2-task-01). Xác minh thay thế bằng review tĩnh
> toàn bộ file trong scope + builder journal.

| Command (project-config) | Kết quả |
|---|---|
| `npm run lint` | **Blocked** — shell permission denied (builder evidence round-1: PASS) |
| `npm run typecheck` | **Blocked** — shell permission denied (builder evidence round-1: PASS; round-2 type delta kiểm tĩnh) |
| `npm run build` | **Blocked** — shell permission denied (builder evidence round-1: PASS, `/vi/about` + `/en/about` SSG) |
| `test` (`test_command: null`) | **skip, no test framework configured** |
| `git status --short` / `git diff` | **Blocked** — shell permission denied; scope xác minh qua đọc file + builder journal `filesNew`/`filesTouched` |
| `migration` (`db_tool: none`) | **N/A** |

Builder evidence: `.context/runs/builder-nta-website-layer-2-task-02.md:20`
(`npm run lint PASS · npm run typecheck PASS · npm run build PASS`, `/vi/about` + `/en/about` SSG).
**Lưu ý (không chặn):** journal chưa cập nhật mốc round-2 rework (vẫn `step: builder / status: awaiting`, history
dừng ở round-1) → evidence verify chỉ còn giá trị round-1; round-2 delta được reviewer kiểm tĩnh (xem Findings).

## Responsive Checklist Gate

Diff **đụng UI** (route + 5 component; round-2 delta chạm `PartnerLogos` + metadata) → gate áp dụng. Đối chiếu
design-spec Screen 2 responsive table (375/768/1280; project-config `responsive_breakpoints: [640,768,1024,1280,1536]`),
xác minh bằng CSS math (không có browser để render).

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout — không horizontal scroll | **OK** | `CapabilityGrid.tsx:9` `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` (fr, không cột px cứng); `TeamGrid.tsx:20` `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`; `PartnerLogos.tsx:15` `grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6`; container `Section.tsx:26` `max-w-container px-4 sm:px-6 lg:px-8` |
| Layout — mobile-first (`min-width`) | **OK** | Mọi biến thể dùng prefix `sm:`/`md:`/`lg:`; không có `max-width` media query |
| Layout — grid `auto-fit/minmax`, không cột cố định | **OK (chấp nhận)** | Dùng `grid-cols-N` (fr) theo design table; không px cứng; design không yêu cầu auto-fit |
| Typography — rem/fluid | **OK** | `globals.css:32-36` tokens `clamp(...)` (`--text-h2/h3/body-lg/display`); component dùng `text-h2`/`text-h3`/`text-body-lg` |
| Spacing — scale/clamp | **OK** | `Section.tsx:23` `py-12 md:py-16 xl:py-24`; `mt-8`/`gap-6` |
| Media — `aspect-ratio`, ảnh không tràn | **OK** | `TeamGrid.tsx:9` `aspect-[4/3] overflow-hidden`; logo `h-12 w-auto max-w-full object-contain`; `sizes` có ở team (`TeamGrid.tsx:10`) + logo (`PartnerLogos.tsx:28`) |
| Touch — target ≥ 44×44px | **N/A** | Round-2 đã gỡ link ngoài ở `PartnerLogos` → logo là ảnh tĩnh, không có interactive target mới; logo `h-12`=48px |
| Table → scroll/card trên mobile | **N/A** | Không có `<table>` trong diff |
| Nav hamburger mobile | **N/A** | Nav thuộc layout layer-1, ngoài diff |
| Viewport — không `100vh` | **OK** | Không có `100vh`/`h-screen` trong diff |
| A11y — `prefers-reduced-motion` | **OK** | `globals.css:88-95` + `Reveal.tsx:18-22` (matchMedia → static) |
| Không che lỗi bằng `overflow:hidden` | **OK** | `overflow-hidden` ở TeamGrid chỉ bo ảnh `rounded-lg`, không che layout tràn |
| Responsive khớp bảng Screen 2 | **OK** | base: capability 1 / team 1 / logos 3 / timeline dọc; md: capability 2 / logos 4 / timeline dọc; lg: capability 4 / team 4 / logos 6 / timeline ngang (`MilestoneTimeline.tsx:12` `lg:flex`) |

**Kết luận gate:** không có mục FAIL. Phần chưa xác minh trực quan (render/hover thật) ghi ở Residual risk.

## Skill gates

| Gate | Kết quả | Bằng chứng / lý do |
|---|---|---|
| aislop (`aislop scan --changes`) | **skip** | Shell permission denied; không tìm thấy config aislop (`glob **/{.aisloprc*,aislop.config.*}` → none) |
| anti-slop / oxlint | **skip, oxlint not configured** | `glob **/{.oxlintrc*,oxlint.json,oxlintrc.json}` → none |
| open-code-review (`ocr`) | **skip, not run** | Shell denied; diff TS/JS soi thủ công: không thấy XSS/SQLi/NPE/thread-safety (SSG tĩnh, không input/DB) |
| AI-readable codebase | **OK** | 5 file 15-32 dòng, hàm <50 dòng; tên self-descriptive; không comment WHAT; indirection thấp. Chỉ 1 tín hiệu nhẹ: magic number trong arbitrary value (`-start-[1.95rem]`, `lg:-top-[0.4rem]`) → <3 indicators |
| ai-friendly-web | **N/A** | Task build page nội bộ, không phải deploy public; `robots.txt`/`sitemap.xml`/JSON-LD SEO defer Layer 4 (khớp design §1.8 + precedent `layer-2-task-01`) |
| blitzstrike (pentest) | **N/A** | NORMAL, không auth/API public/xử lý input |

## Findings

### Confirmation round-2 fixes (không còn là finding)

1. **[MAJOR round-1 → RESOLVED] EN meta description 150–160.**
   `src/app/[locale]/about/page.tsx:21`:
   `"Learn about NTA and our expertise in enterprise solutions, artificial intelligence and practical mobile apps for businesses and organizations across Vietnam."`
   = **157 ký tự** ✅ (giới hạn 150–160). VI `page.tsx:17` = **151 ký tự** ✅. Cả 2 locale đạt
   (`tasks/nta-website/layer-2-task-02.md:34,51`, `design-spec.md:181`).
2. **[MINOR round-1 → RESOLVED] Dead `href` branch / contract mismatch.**
   `PartnerLogos.tsx:6` nay dùng `type Partner = AboutData['partners'][number]`; `AboutData.partners` =
   `{ name; logo: string | null }[]` (`types.ts:60`) → **không còn `href`/`<a rel="noopener">`** dead branch
   (`grep` xác nhận không còn `.href` trong `src/components/about`). Contract khớp 100%.
3. **[MINOR round-1 → RESOLVED] Stable key.** `PartnerLogos.tsx:17` `key={`${partner.logo ?? partner.name}-${index}`}`
   → không còn trùng khi 2 logo cùng tên; ổn định cho list tĩnh SSG.
4. **[MINOR round-1 → RESOLVED] Background `PartnerLogos` vs `CTABanner`.** `PartnerLogos.tsx:12` nay
   `variant="default"`; `CTABanner` vẫn `variant="alt"` (`page.tsx:67`) → không còn 2 `background-alt` liền nhau
   trong trường hợp section render.
5. **[MINOR round-1 → deferred] Hardcoded `alternates`** (`page.tsx:32-38`) — builder defer sang Layer 4
   (SEO audit), nhất quán với `layer-2-task-01`. Đồng ý defer: chức năng hreflang `vi`/`en`/`x-default` **đúng**,
   không phải defect chặn task.

### [MINOR — informational, non-blocking] `PartnerLogos` default có thể liền `MilestoneTimeline` default khi có partner

- **File:** `src/components/about/PartnerLogos.tsx:12` + `src/components/about/MilestoneTimeline.tsx:9`
- **Evidence:** Thứ tự nền khi **có** partner: MissionBlock `alt` → CapabilityGrid `default` → TeamGrid `alt` →
  MilestoneTimeline `default` → PartnerLogos `default` → CTABanner `alt`. Khi PartnerLogos render, sẽ có 2 `default`
  liền nhau (MT + PL), lệch design §1.3 "nền xen kẽ `background` ↔ `background-alt`" (`design-spec.md:39`).
- **Đánh giá:** **không chặn PASS**. Với content hiện tại `partners: []` (`src/content/about/vi/about.mdx:20`,
  layer-0-task-06 G5 — quyết định có chủ đích, không thêm đối tác giả), `PartnerLogos` bị ẩn → **output render thực tế
  vẫn xen kẽ hoàn hảo** (alt→default→alt→default→alt). Ngoài ra đây là hệ quả của việc builder **thực thi đúng**
  khuyến nghị round-1 (`variant="alt"` → `default`), và do `CTABanner` cố định `alt` ở cuối nên không thể đạt xen kẽ
  tuyệt đối cho mọi vị trí section. Ghi nhận để Layer 4 (khi thêm partner thật) cân nhắc đổi `MilestoneTimeline`
  sang `alt` hoặc điều chỉnh chuỗi nền. Không phải bug hiện tại.

### [Observation — process, ngoài code] Builder journal chưa cập nhật mốc round-2

- **File:** `.context/runs/builder-nta-website-layer-2-task-02.md:8-13,38-40`
- **Evidence:** journal vẫn `step: builder / status: awaiting / reportPath: null / round: 0`, history dừng ở round-1
  dù đã rework round-2. Đây là primary-owned artifact (subagent reviewer không được ghi vào `.context/runs/*`).
- **Ảnh hưởng:** evidence verify (`npm run *`) hiện chỉ còn giá trị round-1. Reviewer bù bằng review tĩnh round-2 delta
  (type/key/variant/string) — xem Residual risk. Đề xuất primary cập nhật journal + cân nhắc cho builder re-run 3
  verify command sau rework để evidence round-2 đầy đủ.

## Kiểm tra xác nhận acceptance criteria (round 2)

| AC / yêu cầu | Kết quả | Bằng chứng |
|---|---|---|
| 7 section đúng thứ tự design | ✅ | `page.tsx:61-67`: PageHeader → MissionBlock → CapabilityGrid → TeamGrid → MilestoneTimeline → PartnerLogos → CTABanner |
| Timeline semantic `<ol>` + ngang ở `lg` | ✅ | `MilestoneTimeline.tsx:12` `<ol>` + `lg:flex lg:border-s-0 lg:border-t`; dot `aria-hidden` |
| Logo grayscale→màu 250ms + alt = tên đối tác | ✅ (code) | `PartnerLogos.tsx:28` `grayscale transition-[filter] duration-[250ms] hover:grayscale-0`; `alt={partner.name}` |
| `rel="noopener"` cho link ngoài | ✅ N/A | Không còn link ngoài (contract không có `href`); hợp lệ sau khi gỡ dead branch |
| Empty: 0 milestone → ẩn Timeline | ✅ | `MilestoneTimeline.tsx:7` `if (milestones.length === 0) return null` |
| Empty: 0 logo → ẩn PartnerLogos | ✅ | `PartnerLogos.tsx:9-10` filter logo + `return null` |
| Team image error → fallback | ✅ | `HomeImage.tsx:17-19` `onError` → `role="img" aria-label` fallback |
| ≥4 layout family, không 3 liên tiếp cùng family | ✅ | header/statement/divider-list/image-grid/timeline/logo-grid/banner — không có 3 section liền cùng family |
| Card-family không lặp (Mission/Capability không card) | ✅ | `MissionBlock` text centered; `CapabilityGrid.tsx:11` list + `border-t`, không elevation/shadow |
| Metadata title 2 locale | ✅ | `page.tsx:16,20` "Về NTA \| NTA" / "About NTA \| NTA" |
| description 150–160 (2 locale) | ✅ | VI=151, EN=157 (đếm bằng runtime) |
| `alternates`/hreflang vi/en/x-default | ✅ (chức năng) | `page.tsx:32-38` (hardcode → defer Layer 4, xem confirmation #5) |
| Copy hiển thị qua i18n | ✅ | `page.tsx` dùng `t(...)` cho mọi nhãn; nội dung dài lấy từ MDX locale; `vi.json:71-86` / `en.json:71-86` parity |
| No scope creep / no fork shared | ✅ (tĩnh) | Chỉ 6 file mới + 2 i18n; không sửa `components/ui|shared|layout`; khớp builder journal `filesNew`/`filesTouched` |
| Anti-slop (`as any`, dead code, copy loop) | ✅ | Không `as any`; dead `href` branch đã gỡ; không `filter().map` copy thừa |
| File ≤300 / hàm ≤50 dòng | ✅ | file 15-32 dòng; hàm ngắn (max ~4 dòng) |

## Residual risk

- Không chạy được `npm run lint/typecheck/build` và `git diff` (shell denied) → review tĩnh + builder evidence
  round-1; round-2 type delta (`Partner` type, gỡ `href`) đã kiểm tĩnh: không còn tham chiếu `.href`, prop khớp
  `AboutData['partners']` → không kỳ vọng lỗi type. Vẫn nên primary/builder re-run 3 command sau rework.
- Không xác minh trực quan trên browser: hover grayscale→màu, timeline đổi orientation tại lg. Với content hiện tại
  `partners: []`, output **không render** PartnerLogos → hover logo + `rel="noopener"` **không thể xác minh runtime**
  (đây là hệ quả empty policy có chủ đích, không phải lỗi code). Task `layer-2-task-02.md:56` ghi manual evidence
  "logo hover" — không khả thi với `partners: []`; ghi nhận là rủi ro evidence.
- Scope thay đổi xác minh qua đọc file + journal (không có `git status`).

## Verdict

✅ **PASS**

Lý do: [MAJOR] round-1 (EN meta description 164) đã fix — nay **157 ký tự**, VI **151** (cả 2 đạt 150–160).
3 [MINOR] round-1 (dead `href` branch, stable key, background `PartnerLogos` vs `CTABanner`) đã fix và xác nhận.
Không còn **CRITICAL/MAJOR**. Các MINOR còn lại (hardcode `alternates` defer Layer 4; `PartnerLogos` default có thể
liền `MilestoneTimeline` default chỉ khi có partner — hiện không render; journal chưa cập nhật round-2) đều
**non-blocking** và không vi phạm acceptance criteria. Không có mục Responsive gate FAIL.

**Action cho primary (không chặn merge/commit):**
1. Cập nhật `.context/runs/builder-nta-website-layer-2-task-02.md` mốc round-2 (write-ahead do subagent không ghi).
2. Re-run `npm run lint` · `npm run typecheck` · `npm run build` sau rework để evidence round-2 đầy đủ; nếu PASS → close-out.
3. (Layer 4) chuẩn hoá `alternates` bằng `createLocaleAlternates`; khi thêm partner thật → điều chỉnh chuỗi nền.
