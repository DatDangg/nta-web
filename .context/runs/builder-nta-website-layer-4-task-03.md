# Run Journal — builder/nta-website · layer-4-task-03

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: builder/nta-website
phaseTask: layer-4-task-03
step: done
agent: null
status: done                          # task-03 close-out hoàn tất (progress + task DoD + commit 8fd5bbc)
attempt: 0
interrupted: false
updatedAt: 2026-10-10T01:55:00+07:00
filesTouched: [src/app/[locale]/blog/page.tsx, src/app/[locale]/case-studies/page.tsx, src/app/[locale]/contact/page.tsx, src/app/[locale]/solutions/ai/page.tsx, src/app/[locale]/solutions/enterprise/page.tsx, src/components/cards/AppCard.tsx, src/components/cards/CaseStudyCard.tsx, src/components/cards/PostCard.tsx, src/components/cards/ProductCard.tsx, src/components/cards/SolutionCard.tsx, src/components/contact/ContactForm.tsx, src/components/layout/LanguageToggle.tsx, src/components/layout/MobileNav.tsx, src/lib/contact/useContactForm.ts]
filesNew: []
evidence:
  reportPath: .context/review-reports/feature-nta-website-layer-4-task-03-round-1-review.md
  round: 1
  verdict: PASS
  verify: "lint 0 err (1 pre-existing MDX <img> warning) + typecheck PASS + build PASS. Lighthouse a11y = 1.0 (0 failures) trên 11 route (home/about/products/case-studies/blog/solutions-enterprise/solutions-ai/contact + 3 detail + 404). Horizontal overflow: 0/11 trang (sw == vw). Reviewer r1 STRICT PASS (0 CRITICAL/MAJOR, 4 MINOR non-blocking). aislop 97."
understand: "layer-4-task-03 = Accessibility sweep WCAG 2.1 AA (R-24) + responsive spot-check (R-23) toàn site; fix UI-layer phát hiện; carry-forward m-L3-1/3/4"
next: "DONE — close-out task-03 (progress + task DoD + commit 8fd5bbc) → task layer-4-task-04 (deploy config Cloud Run, generate files — KHÔNG deploy)"
loopSignal: none
approvals:
  - {gate: layer0_done, at: 2026-10-08T20:10:00+07:00, ok: true}
  - {gate: layer1_done, at: 2026-10-09T07:00:00+07:00, ok: true}
  - {gate: layer2_done, at: 2026-10-09T18:05:00+07:00, ok: true}
  - {gate: layer3_done_unlock_layer4, at: 2026-10-09T22:05:00+07:00, ok: true}
batchQueue: []
```

## Notes / WIP reasoning

### Nguồn gốc session
- Resume từ session mới: `git status` sạch, task-01 (`92f5a92`) + task-02 (`7d6675b`) done+committed. Layer 4 unlocked.
- Builder subagent chạy 1 lần → **incomplete** ("Task completed: no"): chỉ áp 3 carry-forward (m-L3-1/3/4) các file contact, chưa làm checklist toàn site + responsive. → **Primary tiếp quản** (đúng pattern các task trước).

### Phát hiện & fix (cross-cutting a11y/responsive sweep)

1. **i18n regression do bản fix m-L3-4 của builder** (`src/lib/contact/useContactForm.ts`):
   builder surface thẳng message server (`readServerMessage`/`apiErrors[field]`) nhưng server messages **VI-hardcoded** (`src/lib/api/contact-schema.ts:30-46`, `route.ts:6-8`) → locale `/en` sẽ hiển thị tiếng Việt ở 429/400/500 (vi phạm R-20 i18n + a11y language-of-parts).
   **Fix:** server chỉ dùng để biết *field nào* lỗi; text luôn lấy từ `messages` (localized). Bỏ `readServerMessage`. Giữ `readServerErrors` (validate shape). m-L3-1/3/4 vẫn đóng: 429 đưa vào summary có `summaryRef` (focus OK); field errors localized; `errors.form/honeypot` presence → summary generic localized.
2. **Heading hierarchy h1→h3 skip** (R-24/design AC "không nhảy cấp"): card list dùng `<h3>` (PostCard/CaseStudyCard/SolutionCard) nhưng section list không có `<h2>`. Fix: thêm `<h2 className="sr-only" id="...-list-title">` + đổi `<section aria-label>` → `aria-labelledby` tại `/blog`, `/case-studies`, `/solutions/enterprise`, `/solutions/ai`. Xác minh trong HTML build: mọi trang h1→h2→h3, không skip.
3. **m-L3-3 responsive (design S12)**: bản fix của builder (`md:col-span-2 lg:col-span-1`) đúng md (map full-width) nhưng sai lg (map rơi vào cột 60% thay vì cột 40% dưới info). Fix: `lg:col-start-2 lg:row-start-2` cho map + `lg:col-start-2 lg:row-start-1` cho aside → base stack / md form|info + map full-width / lg form 60% | (info+map) 40% — khớp bảng design.
4. **Lighthouse color-contrast fail** (`text-primary` #0071e3 = 4.31:1 trên `bg-background-alt` #f5f5f7 < 4.5):
   - Footer `LanguageToggle` active locale (`text-primary` → `text-primary-active` #0066cc = 5.1:1).
   - `SolutionCard` span "learn more".
5. **Lighthouse label-content-name-mismatch** (WCAG 2.5.3 Label in Name): card links có `aria-label={title}` nhưng visible text nhiều hơn (excerpt/category/features). Fix: bỏ `aria-label` khỏi Link card (`PostCard`, `SolutionCard`, `CaseStudyCard`, `ProductCard`, `AppCard`) → accessible name lấy từ nội dung (chứa visible text).
6. **Horizontal overflow trên trang 404** (sw 990 > vw 638): do `MobileNav` panel đóng `translate-x-full` không bị clip. Fix: `overflow-hidden` trên wrapper `fixed inset-0`. Xác minh 404 còn 0 overflow; các trang khác không đổi.

### Verify (primary chạy độc lập)
- `npm run lint` → 0 error, 1 warning (MDX `<img>` — pre-existing, đã accepted Layer 2/task-02).
- `npm run typecheck` → PASS.
- `npm run build` → PASS (43 static HTML).
- Lighthouse a11y: **1.0 / 0 failures** trên 11 route (trước fix: 0.96 với color-contrast + label-content-name-mismatch).
- Horizontal overflow: **0/11 route** ở viewport native của browser tool (~638px, dưới md 768 → bao phủ layout base/mobile). 404 có thêm 1 SEO failure `meta-description` (không phải a11y; 404 cố ý `robots: noindex`, không cần description).
- **Blocked:** browser tool không có emulation viewport → không render chính xác 375/768/1280 hay screenshots. Đã bù bằng CSS math + đo overflow live ở width < md. Ghi residual.

### Residual / non-blocking
- `text-primary` (#0071e3) vẫn 4.31:1 trên `bg-background-alt` cho các link KHÔNG được Lighthouse flag (hover states, các link trên section alt khác như RelatedSolutions/CaseStudyLink tuỳ nền). Đã fix các node axe flag; token gốc giữ nguyên (design intent).
- Badge dùng `bg-background-alt` trên section `bg-background-alt` (blog/case list) → pill không tương phản nền (visual only, text vẫn đạt contrast).
- Không chạy được axe manual / keyboard walkthrough tự động; dựa Lighthouse + source review.
- Lighthouse `meta-description` trên 404 (SEO, không a11y).

## History

- 2026-10-10T00:35:00+07:00 ▶ write-ahead builder layer-4-task-03 — status=running.
- 2026-10-10T00:50:00+07:00 builder subagent incomplete (3 carry-forward contact files; checklist/responsive chưa) → primary tiếp quản.
- 2026-10-10T01:05:00+07:00 primary fix i18n regression + heading hierarchy + m-L3-3 lg + contrast + label-in-name + 404 overflow.
- 2026-10-10T01:25:00+07:00 verify: lint/typecheck/build PASS; Lighthouse a11y 1.0/0 fail (11 route); overflow 0/11. status=awaiting → reviewer r1.
- 2026-10-10T01:40:00+07:00 reviewer r1 **STRICT PASS** (0 CRITICAL/MAJOR, 4 MINOR non-blocking; aislop 97). Report `.context/review-reports/feature-nta-website-layer-4-task-03-round-1-review.md`.
- 2026-10-10T01:55:00+07:00 close-out DONE — progress.json + task DoD + commit `8fd5bbc`. status=done → task layer-4-task-04.
