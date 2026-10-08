# Review: feature-nta-website — phase-0-task-02 (round 1)

> Source of truth cho task: `tasks/nta-website/layer-0-task-02.md`.

## Agent: reviewer

## Review level: STRICT

## Reason
Diff thay đổi **routing/điều hướng toàn site**: thêm `src/middleware.ts` + route group `[locale]`, sửa root
`src/app/layout.tsx`, xoá `src/app/page.tsx`, thêm `next.config.ts` plugin. Theo `.agent/reviewer.md` /
reviewer rules: **shared service/middleware/navigation → STRICT bắt buộc**. Task file dự kiến NORMAL, nhưng
blast radius "mọi route" nâng lên STRICT. Mặc dù không có auth/API/DB/schema, đây vẫn là hạ tầng dùng chung.

## Blast radius
- `src/middleware.ts` — áp cho mọi request (trừ `/api`, `_next`, `_vercel`, file có dấu `.`).
- `src/app/layout.tsx` — root layout toàn app (giờ pass-through, không render `<html>/<body>`).
- `src/app/[locale]/{layout,page}.tsx` — mọi route tương lai (Layer 2).
- `src/i18n/routing.ts`, `src/i18n/request.ts` — cấu hình locale + nạp messages, ảnh hưởng mọi page i18n.
- `src/lib/seo.ts` — helper hreflang dùng lại ở Layer 2/4.
- `next.config.ts`, `package.json`/`package-lock.json` (+`next-intl`), `.gitignore`.
- `src/app/page.tsx` (xoá) — route cũ.

## Verify commands + result
- `git status --short` / `git diff` / `npm install` / `npm run lint` / `npm run typecheck` / `npm run build`
  → **KHÔNG chạy được bởi reviewer — shell bị permission denied** (Tool Loop Guard: dừng, không retry).
- Static verification đã thực hiện: đọc đủ diff + source mới; Glob xác nhận **không còn `src/app/page.tsx`**
  (chỉ còn `src/app/layout.tsx`, `src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx`) → không trùng route.
- Build artifact `.next/**` không tồn tại trên đĩa → **không tự kiểm chứng được SSG `/vi` + `/en`**; dựa vào
  builder evidence (`build PASS`, SSG `/vi` + `/en`, dev smoke `/`=VI, `/en`=EN) → ghi vào Residual risk.
- `test_command: null` → `skip` đúng như task ghi (v1 chưa có test framework).

## Responsive Checklist Gate
Diff đụng UI ở mức tối thiểu (`src/app/[locale]/page.tsx` = placeholder `<main><h1>` không CSS; `layout.tsx`
chỉ render `<html lang>/<body>`). Không có CSS/token/media-query/grid nào được thêm. Test tại 375/768/1280
bằng CSS math: không có style tùy biến → không có nguy cơ overflow/breakpoint.

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout (no h-scroll, mobile-first, grid) | N/A | Không thêm layout/grid/width; page chỉ `<main><h1>` |
| Typography/Spacing (rem/clamp) | N/A | Không thêm font-size/spacing trong diff |
| Media (img aspect-ratio/srcset) | N/A | Không có ảnh/video/embed |
| Touch/Interaction (44px, nav/table) | N/A | Không có control tương tác |
| Viewport/A11y (`100dvh`, reduced-motion) | OK | Không dùng `100vh`; `<html lang={locale}>` đúng a11y/SEO |

## Skill gates
| Gate | Kết quả | Bằng chứng |
|---|---|---|
| `aislop scan --changes` | **skip** | Shell permission denied; không tìm thấy config `*aislop*`. Không tự bịa score |
| `npx oxlint` (anti-slop) | **skip, oxlint not configured** | Glob `**/.oxlintrc*` + `*oxlint*` = none. Builder chạy `npx oxlint` → chỉ warning có sẵn `next-env.d.ts`, không phát sinh error mới |
| `ocr` (open-code-review) | **skip, ocr chưa cài / shell denied** | Không chạy được; không chặn PASS theo workflow |
| AI-readable codebase | **OK** | File nhỏ (7–30 dòng), tên self-descriptive (`routing.ts`, `request.ts`, `createLocaleAlternates`), không hàm >50 dòng, không indirection >3 bước, không magic number. Chaos indicators < 3 |
| ai-friendly-web | **N/A** | SEO artifacts (`sitemap`/`robots`/`llms.txt`) thuộc `layer-4-task-01`; task này là plumbing, chưa deploy public |
| blitzstrike (pentest) | **N/A** | Không có môi trường live; không cài; task không thuộc scope pentest |
| Security scan (semgrep) | **skip** | Shell denied; diff không có user input / API / auth / secret / `dangerouslySetInnerHTML` |
| Dependency audit (`npm audit`) | **Residual** | Builder báo 9 high/3 moderate (pre-existing). `npm audit` **không nằm trong `check_commands`** → ghi residual, không tự FAIL theo hướng dẫn |

## Summary
Plumbing i18n VI/EN triển khai đúng R-20 và design §1.7/§Architecture: `as-needed` cho `/`=VI + `/en`=EN,
middleware locale-only (không auth, đúng R-17), `generateStaticParams` 2 locale, messages đồng key VI/EN,
route cũ đã xoá, helper hreflang trả `vi`/`en`/`x-default: vi` đúng. Không có CRITICAL/MAJOR; chỉ còn nit
tài liệu + residual không kiểm chứng được do shell bị deny. **PASS.**

## Findings

### ✅ Good
- `src/i18n/routing.ts:3-6` — `locales ['vi','en']`, `defaultLocale 'vi'`, `localePrefix 'as-needed'`:
  chính xác để có `/` = VI và `/en` = EN. **Deviation so với task step 2 (`'never'`) là hợp lý** — `'never'`
  sẽ không bao giờ sinh prefix `/en`, mâu thuẫn R-20/AC; `as-needed` là lựa chọn đúng. Đã ghi rõ ở task
  Notes line 85.
- `src/middleware.ts:4-7` — chỉ `createMiddleware(routing)`, matcher loại `/api`, `_next`, `_vercel`,
  file tĩnh. Không thêm auth/guard (đúng R-17 + task note line 83).
- `src/app/[locale]/layout.tsx:6-28` — `generateStaticParams` map 2 locale; guard `hasLocale` → `notFound()`;
  `setRequestLocale` + `getMessages`; `<html lang={locale}>` + `NextIntlClientProvider`. Root layout
  `src/app/layout.tsx` pass-through `return children` là pattern chính thức của next-intl (vendor `<html>` ở
  `[locale]/layout.tsx`) — khớp builder evidence build PASS.
- `src/lib/seo.ts:4-17` — hreflang đúng R-20/design §1.7: VI không prefix, EN `/en`, `x-default` = default.
- `src/i18n/messages/{vi,en}.json` — cùng namespace `common/nav/footer/cta`, keys khớp 100%, không thiếu
  bản dịch (AC #4/#6 thoả).
- `src/app/page.tsx` đã xoá; Glob xác nhận không còn route trùng với `[locale]` (AC #5 thoả).
- Surgical diff sạch: mọi file trace về task; không drive-by refactor; package.json dedup `next-intl`
  (fix của Primary) đúng — `next-intl` còn 1 key duy nhất (`package.json:14`); `.gitignore:7` thêm
  `*.tsbuildinfo` hợp lý (artifact `tsconfig.tsbuildinfo` tồn tại ở root).

### ❌ Issues (không có CRITICAL/MAJOR)
- **[MINOR] `tasks/nta-website/layer-0-task-02.md:33`** — Step 2 mô tả vẫn ghi `localePrefix: 'never'`
  trong khi implementation dùng `'as-needed'`. Đề xuất: sửa step 2 thành `'as-needed'` (hoặc gạch bỏ + trỏ
  Notes) để task file không tự mâu thuẫn với code. Không ảnh hưởng chức năng.
- **[MINOR] `tasks/nta-website/layer-0-task-02.md:47`** — AC "hreflang alternates render đúng qua helper"
  không thể quan sát trong task này: `createLocaleAlternates` (`src/lib/seo.ts:4`) chưa được page/metadata
  nào gọi (placeholder page không export `metadata`). Helper tự nó đúng qua static read; việc *render* được
  chuyển cho Layer 2 (task-01..07) + audit Layer 4 (đúng Description line 41). Đề xuất làm rõ AC là
  "helper trả đúng object" để tránh unverifiable wording.
- **[MINOR] `src/lib/seo.ts:7`** — Fallback base URL hardcode `https://ntasolution.vn` trong khi ưu tiên
  `NEXT_PUBLIC_SITE_URL`. Khớp design §1.8 (`metadataBase = https://ntasolution.vn`) nên chấp nhận được,
  nhưng nên là hằng dùng chung với `metadataBase` để tránh lệch khi đổi domain.

### 💡 Suggestions (non-blocking)
- Cân nhắc gọi `setRequestLocale(locale)` trong `[locale]/page.tsx` khi page bắt đầu dùng `getTranslations`
  thật (hiện SSG đã pass theo builder) để đảm bảo static rendering ổn định ở mọi page Layer 2.

### Residual risk / Blocked
- **Blocked**: không chạy được `npm install/lint/typecheck/build` (shell permission denied) → chưa tự xác
  minh độc lập; đồng thời `.next` không có trên đĩa nên không có artifact để đối chiếu SSG.
- **Residual**: `npm audit` 9 high/3 moderate pre-existing (builder báo) — ngoài `check_commands`, ngoài scope
  task, cần xử lý ở task/hạng mục riêng.
- **Residual**: `tsconfig.tsbuildinfo` đã được gitignore; nếu artifact này đã bị track từ task-01 thì
  `.gitignore` không tự untrack — cần xác nhận `git status` (reviewer không chạy được shell).

## Verdict: ✅ PASS

## Verdict Reasoning
Không có CRITICAL/MAJOR. Tất cả AC cốt lõi của plumbing (routing `/`=VI + `/en`=EN, hai locale static,
middleware locale-only, messages đồng key, không route trùng, helper hreflang đúng) được thoả và có bằng
chứng static; deviation `as-needed` là đúng và đã được ghi nhận. Các issue còn lại chỉ là nit tài liệu
(MINOR) + residual pre-existing/không kiểm chứng được do shell bị deny, không chặn PASS. Builder evidence
(`lint`/`typecheck`/`build` PASS, dev smoke 2 locale) là nguồn xác minh bổ sung.
