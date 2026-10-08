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
- [x] Đủ landmark + skip-link; 1 `<h1>`/trang (layout không tự sinh h1)
- [x] Desktop ≥1024px: nav ngang đầy đủ + dropdown keyboard-operable (`aria-expanded`, Esc đóng)
- [x] Mobile <1024px: hamburger → drawer focus trap + Esc + trả focus; không trap tab ra ngoài
- [x] Sticky header không nhảy layout (content offset đúng 64/72px); backdrop-blur sau scroll
- [x] Active route hiển thị đúng ở cả 2 locale; lang toggle giữ path (VI ↔ EN)
- [x] Footer 4→2→1 cột theo bp; CTA BR-001 có mặt mọi trang
- [x] Messages VI/EN đủ key nav/footer, không key thiếu dịch
- [x] Check commands pass

## Verification Summary
- Fix attempt 1 commands: `npm run lint` PASS · `npm run typecheck` PASS · `npm run build` PASS
- M1 evidence: `.next/static/css/e07a59b0494a37bf.css` contains
  `.bg-background\/85{background-color:rgb(var(--color-background)/.85)}`; Tailwind emits the alpha utility.
- Reviewer round 1 findings addressed: theme background token now supports alpha; CTA anchors use button styling
  without nested buttons; the home page relies on the layout's single `main`; VI/EN `nav.home` translations added.
- `npx oxlint`: skipped — no Oxlint configuration in the repository. No configured test command (`null`).
- Test: `test_command: null` → skip, ghi lý do
- Manual evidence: static inspection confirms localized `usePathname` active matching, locale switch
  retains the current path, drawer 250ms transition/scrim/focus trap/Escape/focus restoration, and
  scroll blur while retaining in-flow 64/72px header height. Browser smoke (375/768/1280, tab
  sequence/interactions) not run: browser tool disconnected; dev server launch timed out and port
  3000 belongs to an unknown process.
- Reviewer report: `.context/review-reports/feature-nta-website-layer-1-task-02-round-2-review.md` — Verdict **PASS** (STRICT, 0 CRITICAL/MAJOR, 8 MINOR non-blocking; round 1 FAIL → fix)

### Builder notes
- Fix attempt 1: resolved M1–M4 above. Also changed drawer transitions to `duration-base`, replaced hardcoded
  z-index utilities with configured tokens, and enlarged/localized the header home link. No source behavior beyond
  reviewer findings and these directly related minor issues changed.
- Implemented app landmarks, skip link, translated shared navigation/footer, locale toggle links,
  and the mobile drawer with focus management.
- Completed desktop active-route underline and keyboard dropdown with `aria-expanded`/Escape;
  scroll-dependent backdrop blur does not change header flow height.
- Mobile drawer includes 250ms slide, scrim, focus trap, Escape/click close, and trigger focus restore;
  language controls are minimum 44px targets. Footer has responsive columns, CTA, legal, one SVG
  social icon, locale toggle, and hotline/email placeholders. VI/EN message key sets are paired.
- Browser smoke remains unverified because browser was unavailable.
- Doc Impact: NO_DOC_IMPACT. Tests skipped because `test_command: null`.

## Retry / Error Memory
- Attempt: 1
- Last failure type: reviewer STRICT round 1 — 4 MAJOR (M1 alpha background utility dropped; M2 nested interactive CTA;
  M3 duplicate main landmark; M4 missing nav.home translation).
- Error memory entry: none — reviewer report provided root cause and specific fix; fixes validated by configured checks.
- Escalation: none — sau 3 attempt fail → `architecture_review_needed`

## DoD (Definition of Done)
- [x] Code written (chỉ trong scope)
- [x] Tests: skip — `test_command: null`, ghi lý do
- [x] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [x] Reviewer độc lập PASS (STRICT — shared navigation)
- [x] `.context/progress.json` updated
- [x] Error Memory / Doc Impact recorded
- [x] committed — 1 task = 1 commit (branch `main`, KHÔNG push)

## Files to Create/Modify
- `src/app/[locale]/layout.tsx` (mở rộng từ task-02 Layer 0)
- `src/components/layout/Header.tsx`, `Footer.tsx`, `MobileNav.tsx`, `LanguageToggle.tsx`
- `src/i18n/messages/vi.json`, `src/i18n/messages/en.json`

## Notes
- Drawer/mobile nav là client component `'use client'` — giữ leaf, phần còn lại server component.
- Header/Footer render cả ở 404 (Layer 1 task-05) — tách khỏi page-specific content.
- Anti-slop: không version footer, không chuỗi meta trang trí, không em-dash trong copy.
