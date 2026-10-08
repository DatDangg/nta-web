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
- [x] 5 section đúng thứ tự & 5 layout family khác nhau (không lặp grid card 2 lần)
- [x] Hero: h1 duy nhất, 2 CTA đúng label canonical, responsive theo bảng Screen 1 (base/md/lg/xl)
- [x] 3 SolutionCard điều hướng đúng `/solutions/enterprise`, `/solutions/ai`, `/products`
- [x] ProductStrip keyboard-scroll được (tab vào region, arrow điều khiển); ảnh `priority` đúng 1 ảnh
- [x] Empty: strip <1 sản phẩm → ẩn section; ảnh lỗi → fallback `surface-sunken`
- [x] Metadata 2 locale + hreflang 2 chiều; JSON-LD Organization/WebSite **defer Layer 4**
- [x] Không page-level loading/error (design §1.4 — R-01 chốt lại)
- [x] Check commands pass

## Verification Summary
- Commands: `npm run lint` · `npm run typecheck` · `npm run build` — PASS (primary re-run sau reviewer r3; `● /[locale]` SSG `/vi`+`/en`)
- Test: `test_command: null` → skip, chưa có test framework
- Manual evidence: reviewer dùng code + CSS math (không self-run browser)
- Reviewer report: `.context/review-reports/feature-nta-website-layer-2-task-01-round-3-review.md` (r1 FAIL → r2 FAIL → **r3 PASS**, STRICT)

## Retry / Error Memory
- Attempt: 2 (r1 FAIL fork card markup → fix1 → r2 FAIL dependency inversion → fix2 → r3 PASS)
- Last failure type: MAJOR architecture (dependency inversion: shared card import page module)
- Error memory entry: xem `.context/error-memory.md` (nếu ghi)
- Escalation: none — sau 3 attempt fail → `architecture_review_needed`

## DoD (Definition of Done)
- [x] Code written (chỉ trong scope)
- [x] Tests: skip — `test_command: null`, ghi lý do
- [x] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [x] Reviewer độc lập PASS (r3 STRICT)
- [x] `.context/progress.json` updated
- [x] Error Memory / Doc Impact recorded (NO_DOC_IMPACT)
- [x] committed — 1 task = 1 commit (branch `main`, KHÔNG push)

## Files to Create/Modify
- `src/app/[locale]/page.tsx` (thay placeholder)
- `src/components/home/{Hero,SolutionGridHome,ProductStrip,CaseStudyHighlight}.tsx`
- `src/components/shared/HomeImage.tsx` (moved từ `home/` để tránh dependency inversion)
- `src/components/cards/{SolutionCard,ProductCard}.tsx` (thêm prop optional cho home)
- `src/i18n/messages/{vi,en}.json` (`home.*`)

## Notes
- `[cần xác nhận]` R-01 Loading/Error: design §1.4 chốt SSG → **không page-level skeleton**;
  implement theo đó, ghi lại khi close-out.
- Anti-slop: không eyebrow/kicker, không scroll cue, không em-dash trong copy (design §1.3/§1.7).
- **O1 RESOLVED (user decision 2026-10-09):** CaseStudyHighlight render **định tính** (ảnh + tiêu đề + mô tả + link),
  KHÔNG có "số liệu thật" vì content không có metric xác nhận và không được bịa số (khớp Decision 1/3:
  CaseStudy metrics optional, no fabricated numbers). Ghi residual: nếu sau này có số liệu thật thì bổ sung.
- **R-03** = ≥2 ProductCard (đã ratify) — render đúng 2 sản phẩm thật.
