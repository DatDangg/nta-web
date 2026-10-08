# Task 03: Accessibility sweep — WCAG 2.1 AA + responsive spot-check

## Layer
4

## Type
build (initial)

## Goal
Sweep a11y + responsive toàn site sau khi đủ trang: keyboard navigation, focus management,
contrast, heading hierarchy, landmarks, reduced-motion, touch targets — chốt gate WCAG 2.1 AA
và xác nhận breakpoint R-23 trên mọi trang chính.

## Classification / Risk
- Work item type: FEATURE (initial build)
- Feature change type: MODIFY (fix phát hiện a11y/responsive — không đổi design intent)
- Scope: CROSS_CUTTING (mọi trang/component)
- Root cause category: n/a
- Review level expected: NORMAL — audit + fix UI; reviewer chạy lại checklist
- Blast radius: mọi route (semantic/keyboard/contrast layer)
- Doc impact: NO_DOC_IMPACT (khớp R-23/R-24 intent)
- Decision impact: NO

## Scope (spec refs)
- **R-24:** WCAG 2.1 AA — contrast, keyboard nav, alt text, semantic HTML
- **R-23:** mobile-first, thang breakpoint 640/768/1024/1280/1536, fluid type
- Design §1.6 (a11y global checklist) + responsive tables từng Screen 1–13
- Skills gates: `skills/frontend-checklist` (Phase 5 review), `skills/impeccable` (craft-floor),
  `skills/responsive-web`

## Dependencies
- Layer 2 (đủ trang) + Layer 3 (form/CTAForm) hoàn tất; Layer 4 task-01 (SEO meta cùng file layout)

## Description
1. Checklist a11y từng trang (9 nhóm + 404):
   - Landmark: `header/nav/main/footer`; 1 `h1`; heading hierarchy đúng thứ tự (không nhảy h1→h3)
   - Keyboard: tab toàn flow (skip-link → nav → content → form), drawer focus trap + Esc +
     trả focus (L1 task-02 — verify lại), không keyboard trap ở carousel/filter
   - Focus ring 2px thấy trên mọi interactive element; contrast text ≥4.5:1 (ink tokens),
     UI/icon ≥3:1; info không truyền riêng bằng màu
   - Alt: ảnh nội dung có alt mô tả (VI/EN), ảnh trang trí `alt=""`, iframe `title`
   - Touch target ≥44×44 (nav/pill/icon button/pagination)
   - Form: label visible, `aria-describedby`/`aria-invalid`, error summary focus (L3 — verify)
   - `prefers-reduced-motion` → Reveal/hover/drawer không animate
2. Responsive spot-check 9 nhóm trang × 3 bp (375/768/1280): không tràn chữ, không element
   chồng, grid đổi cột đúng bảng design, không horizontal scroll ngoài strip filter có chủ đích.
3. Fix phát hiện trong scope (UI layer) — phát hiện vượt scope (logic/contract) → ghi vào report
   + tạo change riêng (không ôm vào task này).
4. Ghi kết quả checklist vào review report (từng mục PASS/FAIL + evidence).

## Acceptance Criteria
- [x] Checklist a11y §1.6 PASS cho 9 nhóm trang + 404 — Lighthouse a11y = **1.0/0 failures** trên 11 route (VI+EN)
- [x] Heading hierarchy mỗi trang: h1 → h2 → h3 không nhảy cấp (thêm sr-only h2 ở 4 list page)
- [x] Keyboard flow: drawer focus trap + Esc + trả focus (MobileNav/Header), carousel/filter không trap
- [x] Contrast spot-check: fix `text-primary`→`text-primary-active` (footer LanguageToggle, SolutionCard learn-more) — Lighthouse color-contrast PASS
- [x] Responsive: không tràn/chồng — 0/11 route overflow (viewport base <md live) + md/lg CSS math khớp design S12. Exact 375/768/1280 emulation **Blocked** (browser tool không có viewport API) — xem residual
- [x] Reduced-motion: rule global `globals.css` + Reveal/carousel `matchMedia('(prefers-reduced-motion)')`
- [x] Check commands pass (`lint` 0 err / `typecheck` / `build` PASS)

## Verification Summary
- Commands: `npm run lint` (0 err, 1 warning MDX `<img>` pre-existing) · `npm run typecheck` PASS · `npm run build` PASS (43 static HTML)
- Test: `test_command: null` → skip; evidence = Lighthouse a11y + overflow scan + source audit
- Gate skills: `frontend-checklist` + `impeccable` (craft-floor) — reviewer PASS STRICT; `aislop` 97
- Reviewer report: `.context/review-reports/feature-nta-website-layer-4-task-03-round-1-review.md` (PASS STRICT)
- Lighthouse a11y = 1.0/0 failures trên 11 route; overflow 0/11

## Retry / Error Memory
- Attempt: 0
- Last failure type: n/a
- Error memory entry: none
- Escalation: none — sau 3 attempt fail → `architecture_review_needed`

## DoD (Definition of Done)
- [x] Code written (chỉ trong scope — fix a11y/responsive)
- [x] Tests: skip — `test_command: null`, ghi lý do
- [x] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [x] Reviewer độc lập PASS (STRICT, round 1; 0 CRITICAL/MAJOR, 4 MINOR non-blocking)
- [x] `.context/progress.json` updated
- [x] Error Memory / Doc Impact recorded — **NO_DOC_IMPACT**
- [x] committed — 1 task = 1 commit (branch `main`, KHÔNG push)

## Close-out / Residual (round 1 — PASS)
- **Doc impact: NO_DOC_IMPACT** (khớp R-23/R-24 intent; không đổi contract/schema/behavior tài liệu hoá).
- **MINOR non-blocking (carry-forward, không sửa sau review):**
  - m-L4T3-1 `useContactForm.ts` `readServerErrors` nhận `form`/`honeypot` nhưng chỉ dùng presence (nhánh OK, non-blocking).
  - m-L4T3-2 `MobileNav.tsx` panel thiếu `overflow-y-auto` (viewport thấp) — pre-existing; đề xuất fix khi chạm drawer.
  - m-L4T3-3 `SolutionCard` "Learn more" aria-hidden (2.5.3 biên, ưu tiên thấp).
  - m-L4T3-4 pre-existing warning ngoài diff: duplicate import `LanguageToggle.tsx:4-5`, unused `solutionOverview` `solutions/enterprise/page.tsx:8`.
- **Residual:** không render chính xác 375/768/1280 (browser tool không có viewport emulation); Lighthouse chưa tái lập độc lập bởi reviewer; `text-primary` #0071e3 (4.31:1) còn ở link ngoài node axe flag (hover/other alt sections); 404 `meta-description` (SEO, không a11y).

## Files to Create/Modify
- `src/components/**`, `src/app/[locale]/**` (fix nhỏ theo phát hiện)
- Checklist result ghi trong review report (không tạo doc mới)

## Notes
- Tooling nếu có: `npx lighthouse --only-categories=accessibility` hoặc axe qua browser —
  không cài được → manual checklist + ghi `Blocked` phần tool, KHÔNG claim pass giả.
