# Task 02: App shell — root layout + Header + Footer (nav, lang toggle, drawer)

## Layer
1

## Type
build (initial)

## Goal
Dựng app shell chính thức trong `[locale]/layout.tsx`: Header sticky (nav desktop + dropdown + hamburger
drawer mobile + language toggle + CTA), Footer 4 cột (CTA BR-001 + legal + social), skip-link/landmarks,
và hoàn thiện messages VI/EN cho nav/footer/CTA.

## Classification / Risk
- Work item type: FEATURE (initial build)
- Feature change type: ADDITIVE (initial build)
- Scope: SHARED_FOUNDATION — **navigation/shared shell** (mọi trang dùng)
- Root cause category: n/a
- Review level expected: **STRICT** (shared navigation + shell — theo risk-based reviewer rules)
- Blast radius: mọi route (header/footer/layout), i18n messages, deep-link behavior
- Doc impact: NO_DOC_IMPACT (khớp design §1.1/§1.2 + R-11)
- Decision impact: NO

## Scope (spec refs)
- **R-11:** Header nav desktop ngang + mobile hamburger/drawer, sticky, active state; Footer 4 cột desktop
- **R-20:** toggle `VI|EN` ở header + footer
- **R-24:** landmarks `header/nav/main/footer`, skip-link, focus trap drawer, `aria-expanded/controls`
- **BR-001 (R-25):** mọi trang có CTA/liên hệ ở footer
- Design: §1.1 (App shell Header), §1.2 (Footer), §1.6 (a11y drawer)

## Dependencies
- task-01 Layer 1 (tokens/Button), task-02 Layer 0 (i18n provider/middleware)

## Description
1. `src/app/[locale]/layout.tsx`: skip-link "Bỏ qua tới nội dung" → `<main id="main">`,
   Header + Footer wrap, `metadataBase`暂 chưa (Layer 4) — chỉ đặt chỗ.
2. `Header.tsx`: sticky (64/72px, backdrop-blur sau scroll), wordmark "NTA" (OQ#1 → text logo),
   nav: Giải pháp (dropdown Enterprise/AI) · Sản phẩm · Case Study · Tin tức · Về NTA · Liên hệ,
   `VI|EN` toggle, CTA "Liên hệ tư vấn" (Button sm pill). Active route = text primary + underline 2px.
   Dropdown: hover + focus keyboard, `aria-expanded`.
3. `MobileNav` drawer (<1024px): slide-in 250ms + scrim, focus trap, Esc đóng, trả focus trigger,
   nav list + lang toggle + CTA; touch target ≥44px.
4. `Footer.tsx`: nền alt, 4 cột (Về NTA · Giải pháp · Nội dung · Liên hệ) → 2 cột tablet → 1 cột mobile;
   block CTA "Liên hệ tư vấn" (BR-001); legal copyright; social icons (SVG Phosphor 1 family);
   `VI|EN`. Placeholder hotline/email (OQ#2).
5. Messages `vi.json`/`en.json`: nav + footer + CTA canonical labels (tokens §11) — không đổi label
   giữa các trang.

## Acceptance Criteria
- [ ] Đủ landmark + skip-link; 1 `<h1>`/trang (layout không tự sinh h1)
- [ ] Desktop ≥1024px: nav ngang đầy đủ + dropdown keyboard-operable (`aria-expanded`, Esc đóng)
- [ ] Mobile <1024px: hamburger → drawer focus trap + Esc + trả focus; không trap tab ra ngoài
- [ ] Sticky header không nhảy layout (content offset đúng 64/72px); backdrop-blur sau scroll
- [ ] Active route hiển thị đúng ở cả 2 locale; lang toggle giữ path (VI ↔ EN)
- [ ] Footer 4→2→1 cột theo bp; CTA BR-001 có mặt mọi trang
- [ ] Messages VI/EN đủ key nav/footer, không key thiếu dịch
- [ ] Check commands pass

## Verification Summary
- Commands: `npm run lint` · `npm run typecheck` · `npm run build`
- Test: `test_command: null` → skip, ghi lý do
- Manual evidence: dev server — tab sequence (skip-link → nav → CTA), drawer mobile 375px,
  lang toggle round-trip, active underline
- Reviewer report: `.context/review-reports/feature-nta-website-layer-1-task-02-round-1-review.md`

## Retry / Error Memory
- Attempt: 0
- Last failure type: n/a
- Error memory entry: none
- Escalation: none — sau 3 attempt fail → `architecture_review_needed`

## DoD (Definition of Done)
- [ ] Code written (chỉ trong scope)
- [ ] Tests: skip — `test_command: null`, ghi lý do
- [ ] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [ ] Reviewer độc lập PASS (STRICT — shared navigation)
- [ ] `.context/progress.json` updated
- [ ] Error Memory / Doc Impact recorded
- [ ] committed — 1 task = 1 commit (branch `main`, KHÔNG push)

## Files to Create/Modify
- `src/app/[locale]/layout.tsx` (mở rộng từ task-02 Layer 0)
- `src/components/layout/Header.tsx`, `Footer.tsx`, `MobileNav.tsx`, `LanguageToggle.tsx`
- `src/i18n/messages/vi.json`, `src/i18n/messages/en.json`

## Notes
- Drawer/mobile nav là client component `'use client'` — giữ leaf, phần còn lại server component.
- Header/Footer render cả ở 404 (Layer 1 task-05) — tách khỏi page-specific content.
- Anti-slop: không version footer, không chuỗi meta trang trí, không em-dash trong copy.
