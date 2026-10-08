# Task 01: Trang chủ `/` (Screen 1)

## Layer
2

## Type
build (initial)

## Goal
Render trang chủ 5 section/5 layout family theo design Screen 1: Hero (2 CTA), 3 mảng giải pháp,
strip sản phẩm scroll-snap, case study highlight (split 1 lần), CTABanner accent.

## Classification / Risk
- Work item type: FEATURE (initial build)
- Feature change type: ADDITIVE (initial build)
- Scope: SINGLE_SURFACE (1 route — dùng component Layer 1)
- Root cause category: n/a
- Review level expected: NORMAL — trang tĩnh SSG, không API
- Blast radius: route `/` (2 locale)
- Doc impact: NO_DOC_IMPACT (khớp design Screen 1)
- Decision impact: NO

## Scope (spec refs)
- **R-01:** Hero tagline + 2 CTA responsive đúng breakpoint
- **R-02:** 3 card mảng giải pháp (Doanh nghiệp/AI/App AI), hover state, điều hướng đúng trang
- **R-03:** sản phẩm tiêu biểu ≥2 + CTA cuối trang nổi bật
- **R-21/R-20:** metadata + hreflang/OG per page (baseline ở đây, audit tổng ở Layer 4)
- **R-23/R-24:** responsive table Screen 1 + a11y (h1 duy nhất, strip keyboard-scroll)
- Design: Screen 1 (§2) — copy VI/EN đã chốt trong design-spec

## Dependencies
- Layer 0 hoàn tất (task-04 content data), Layer 1: task-01 (tokens), task-02 (shell),
  task-03 (cards/PageHeader/CTABanner), task-04 (Reveal)

## Description
1. `src/app/[locale]/page.tsx` — thay placeholder: `generateStaticParams` 2 locale, metadata
   (title template `"%s | NTA"`, desc 150–160 ký tự, alternates languages) + copy theo Screen 1.
2. Components page-specific (`src/components/home/`):
   - `Hero`: h1 `--text-hero` 1 dòng desktop/2 dòng mobile, sub `max-w-[65ch]`, 2 CTA
     (primary "Liên hệ tư vấn" + outline "Xem giải pháp" — canonical), ảnh hero `priority`,
     layout stack → 2 cột md (55/45) theo bp table.
   - `SolutionGridHome`: 3 `SolutionCard` (ảnh thật + h3 + 1 dòng + link) — không 3 card icon y hệt.
   - `ProductStrip`: horizontal scroll-snap, ≥2 `ProductCard`, `role="region"` + `tabindex=0`,
     arrow desktop, swipe mobile; strip <1 → ẩn section.
   - `CaseStudyHighlight`: split 1 lần duy nhất (ảnh trái/text phải), 1 số liệu thật, link.
   - `CTABanner variant="primary"` accent cuối trang.
3. Reveal theo section (fade/slide 16px stagger 60ms, once).
4. Messages key `home.*` VI/EN.

## Acceptance Criteria
- [ ] 5 section đúng thứ tự & 5 layout family khác nhau (không lặp grid card 2 lần)
- [ ] Hero: h1 duy nhất, 2 CTA đúng label canonical, responsive theo bảng Screen 1 (base/md/lg/xl)
- [ ] 3 SolutionCard điều hướng đúng `/solutions/enterprise`, `/solutions/ai`, `/products`
- [ ] ProductStrip keyboard-scroll được (tab vào region, arrow điều khiển); ảnh `priority` đúng 1 ảnh
- [ ] Empty: strip <1 sản phẩm → ẩn section; ảnh lỗi → fallback `surface-sunken`
- [ ] Metadata 2 locale + hreflang 2 chiều; JSON-LD Organization/WebSite **defer Layer 4**
- [ ] Không page-level loading/error (design §1.4 — R-01 chốt lại)
- [ ] Check commands pass

## Verification Summary
- Commands: `npm run lint` · `npm run typecheck` · `npm run build`
- Test: `test_command: null` → skip, ghi lý do
- Manual evidence: dev `/` + `/en` ở 375/768/1280 — tab nav, hover cards, strip swipe
- Reviewer report: `.context/review-reports/feature-nta-website-layer-2-task-01-round-1-review.md`

## Retry / Error Memory
- Attempt: 0
- Last failure type: n/a
- Error memory entry: none
- Escalation: none — sau 3 attempt fail → `architecture_review_needed`

## DoD (Definition of Done)
- [ ] Code written (chỉ trong scope)
- [ ] Tests: skip — `test_command: null`, ghi lý do
- [ ] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [ ] Reviewer độc lập PASS
- [ ] `.context/progress.json` updated
- [ ] Error Memory / Doc Impact recorded
- [ ] committed — 1 task = 1 commit (branch `main`, KHÔNG push)

## Files to Create/Modify
- `src/app/[locale]/page.tsx` (thay placeholder)
- `src/components/home/Hero.tsx`, `ProductStrip.tsx`, `CaseStudyHighlight.tsx`
- `src/i18n/messages/{vi,en}.json` (`home.*`)

## Notes
- `[cần xác nhận]` R-01 Loading/Error: design §1.4 chốt SSG → **không page-level skeleton**;
  implement theo đó, ghi lại khi close-out.
- Anti-slop: không eyebrow/kicker, không scroll cue, không em-dash trong copy (design §1.3/§1.7).
