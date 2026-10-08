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
- [ ] Checklist a11y §1.6 đầy đủ PASS cho 9 nhóm trang + 404 (2 locale — ít nhất VI đầy đủ, EN抽样)
- [ ] Heading hierarchy mỗi trang: h1 → h2 → h3 không nhảy cấp
- [ ] Keyboard flow hoàn chỉnh mọi trang; drawer/carousel/filter không trap sai
- [ ] Contrast spot-check: text chính, CTA, badge, error text ≥4.5:1 (in report)
- [ ] Responsive 3 bp × 9 trang: không tràn/chồng layout
- [ ] Reduced-motion: mọi animation tắt được
- [ ] Check commands pass

## Verification Summary
- Commands: `npm run lint` · `npm run typecheck` · `npm run build`
- Test: `test_command: null` → checklist evidence trong report + screenshots 3 bp
- Gate skills: `frontend-checklist` + `impeccable` (craft-floor) — reviewer ghi kết quả
- Reviewer report: `.context/review-reports/feature-nta-website-layer-4-task-03-round-1-review.md`

## Retry / Error Memory
- Attempt: 0
- Last failure type: n/a
- Error memory entry: none
- Escalation: none — sau 3 attempt fail → `architecture_review_needed`

## DoD (Definition of Done)
- [ ] Code written (chỉ trong scope — fix a11y/responsive)
- [ ] Tests: skip — `test_command: null`, ghi lý do
- [ ] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [ ] Reviewer độc lập PASS
- [ ] `.context/progress.json` updated
- [ ] Error Memory / Doc Impact recorded
- [ ] committed — 1 task = 1 commit (branch `main`, KHÔNG push)

## Files to Create/Modify
- `src/components/**`, `src/app/[locale]/**` (fix nhỏ theo phát hiện)
- Checklist result ghi trong review report (không tạo doc mới)

## Notes
- Tooling nếu có: `npx lighthouse --only-categories=accessibility` hoặc axe qua browser —
  không cài được → manual checklist + ghi `Blocked` phần tool, KHÔNG claim pass giả.
