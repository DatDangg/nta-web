Agent: reviewer

# Review — feature-add-japanese-locale · phase-2-task-04 · round 1

- **CR:** CR-044 · change doc `spec/changes/2026-11-09-add-japanese-locale.md` · spec R-20a · task `tasks/feature-add-japanese-locale/phase-2-task-04.md`
- **Diff reviewed (uncommitted):** `src/components/layout/LanguageToggle.tsx`, `src/app/[locale]/layout.tsx`, `src/app/globals.css`

## Review level
**STRICT**

## Reason
`LanguageToggle` là shared navigation (Header desktop, MobileNav drawer, Footer legal bar — mọi trang); `[locale]/layout.tsx` + `globals.css` `--font-sans` ảnh hưởng render/perf mọi trang (R-22).

## Blast radius
- `LanguageToggle` dùng ở `Header.tsx:93`, `MobileNav.tsx:44`, `Footer.tsx:183` → 3 instance/trang, mọi route, 3 locale.
- `layout.tsx`: import `Noto_Sans_JP` ở root layout chung → CSS @font-face của Noto được bundle vào stylesheet chung của layout, **tải trên mọi trang vi/en/ja**.
- `globals.css` `--font-sans`: font stack toàn site.

## Verify commands + result
| Command | Result |
|---|---|
| `npm run typecheck` | PASS (tsc --noEmit, 0 lỗi) |
| `npm run lint` | PASS (0 error, 1 warning pre-existing `src/components/mdx/index.tsx:26` no-img-element) |
| `npm test` | 230 tests: 227 pass, **1 fail pre-existing** (`tools/db/content-rules.test.ts:29` uploads), 2 skipped — không liên quan task |
| `SWC_NATIVE_BINDING_CACHE=... npm run build` | PASS |
| `next start -p 3917` (CONTENT_SOURCE=file) + kiểm live qua Browser pane | xem bên dưới |

Live check (prod build):
- Toggle `/en/about`: `VI /vi/about hreflang=vi` · `EN /en/about aria-current=true` · `JA /ja/about hreflang=ja`. `/ja/about`: `VI /vi/about` · `EN /en/about` · `JA aria-current=true`. `/en/blog`, `/ja/blog` tương tự → giữ path đúng. `hrefLang` do next-intl Link tự gắn cho link khác locale. OK.
- `<html>` `/en/*`: `__variable_0e3364` (Inter only); `/ja/*`: thêm `__variable_000d52` (Noto). `lang` đúng.
- `/en/about`: woff2 tải = 2 (Inter), 125 face Noto ở trạng thái `unloaded` → không tải file font JP. OK.
- `/ja/about`: computed font-family `Inter, "Inter Fallback", "Noto Sans JP", "Noto Sans JP Fallback", ...`; 22 face Noto loaded, 23 woff2; h1 `会社紹介 NTA` render bằng Noto. OK.
- vi/en computed: `Inter, "Inter Fallback", Inter, -apple-system, ...` → Inter vẫn là font chính, fallback CSS var hợp lệ (literal `Inter` trùng lặp, vô hại). Không hồi quy font Latin/Việt.
- Không có `<link rel=preload as=font>` ở cả 3 locale; `.next/server/next-font-manifest.json` = `{"app":{}...}`. Diff không đổi config Inter (`preload: true` giữ nguyên) và Noto có `preload:false` → về logic không thể là nguyên nhân mất preload Inter. Không so được trực tiếp với build HEAD (reviewer không được checkout/stash) → ghi **residual risk, pre-existing nghi vấn**, đề xuất backlog riêng.

## Findings

### F1 — MAJOR (perf/R-22, blocking): CSS @font-face Noto Sans JP (~95 KB raw / ~32 KB nén) là stylesheet render-blocking trên MỌI trang vi/en
- Evidence: HTML `/en/about`, `/en/blog` link 3 stylesheet: `1749123b1b28c3d0.css` (83 KB raw / 16.3 KB nén — CSS app), `3b7fa2b925980c49.css` (2.1 KB — Inter), **`a5c08e6ffafb8109.css` (95 050 B raw, encodedBodySize 31 852 B, 129 rule `Noto Sans JP`; 94 892 B trong đó là @font-face Noto)**. Chunk này chỉ tồn tại vì `Noto_Sans_JP(...)` được gọi ở `src/app/[locale]/layout.tsx:33` (root layout chung cho 3 locale).
- Tác động: byte CSS chặn render trên vi/en (thị trường chính) tăng từ ~17 KB lên ~49 KB nén (~x2.9) + 1 request render-blocking thêm; trên mạng chậm (slow 4G ~1.6 Mbps) ≈ +150 ms trước first paint/LCP. Mâu thuẫn mục tiêu task "font Noto Sans JP **chỉ ở trang ja**" và acceptance "LCP không tệ hơn đáng kể"; comment ở `layout.tsx:29-32` chỉ đúng về file font, không đề cập chi phí CSS.
- Gợi ý fix (builder chọn, đo lại): nạp @font-face Noto chỉ khi `locale === 'ja'`, ví dụ self-host Noto Sans JP (OFL) dưới `public/fonts/` + 1 file CSS tĩnh, render `<link rel="stylesheet" href=... precedence="default">` (hoặc `<style>` inline) có điều kiện trong layout, và bỏ import `next/font/google` Noto khỏi module layout chung. Sau fix: kiểm `/en/*` không còn stylesheet chứa `Noto Sans JP`, `/ja/*` vẫn render glyph Nhật, không FOIT.
- Nếu user chấp nhận đánh đổi (ghi rõ trong task + decisions) thì có thể hạ xuống residual risk; reviewer không tự hạ.

### F2 — MINOR (residual, nghi pre-existing): không có preload font Inter ở mọi locale
- `next-font-manifest.json` rỗng (`app:{}`, `appUsingSizeAdjust:false`) dù Inter `preload:true`; file Inter tên `*-s.p.woff2` (preloadable). Không chứng minh được là hồi quy của task này (khả năng cao pre-existing). Đề xuất ghi backlog riêng, không chặn task.

### F3 — INFO: a11y / layout toggle
- `aria-current="true"` đúng locale, `hrefLang` trên link khác locale, `min-h-11 min-w-11` (44px) mỗi link, separator `aria-hidden`, group `aria-label="Language"`. Code gọn, map theo `routing.locales` (`vi, en, ja` → thứ tự VI · EN · JA đúng OQ-4), bỏ regex strip `/en` thừa (usePathname next-intl đã bỏ prefix). Không thấy slop.
- Footer legal bar (`Footer.tsx:181`) `flex-col` dưới `sm` → toggle ~3×44px + separator, không tràn 375px (suy từ class; drawer 375px đã được primary kiểm live).
- `VI` href `/vi/about` → 307 về `/about` là hành vi next-intl as-needed (giống code cũ `locale="vi"`), không phải hồi quy.

## Acceptance
| Criterion | Status |
|---|---|
| JA từ `/en/blog/<slug>` → `/ja/blog/<slug>`; VI → `/blog/<slug>`; EN từ `/ja/about` → `/en/about` | PASS (href đúng; VI qua `/vi/...` → 307 như cũ) |
| Glyph Nhật đúng (Noto ở ja) | PASS |
| vi/en không tải font JP | PASS (file font) — nhưng xem F1 (CSS) |
| LCP không tệ hơn đáng kể | **FAIL/không đạt bằng chứng** — F1 thêm ~32 KB CSS render-blocking cho vi/en; LCP chưa đo |
| typecheck + lint + build PASS | PASS |

## Verdict
**FAIL** — do F1 (MAJOR, perf vi/en). Về 5a để builder fix F1 (hoặc user chấp nhận đánh đổi rõ ràng). F2 ghi backlog riêng.

## Ghi chú vận hành
Server `next start -p 3917` đã dừng task nền bằng TaskStop nhưng tiến trình node con trên Windows **vẫn đang lắng nghe cổng 3917**. Reviewer không có quyền bash `netstat`/`taskkill` (permission `"*": deny`) → primary cần kill PID đang giữ cổng 3917.
