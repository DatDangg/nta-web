# Task 02: Về NTA `/about` (Screen 2)

## Layer
2

## Type
build (initial)

## Goal
Render trang About 7 section theo design Screen 2: PageHeader · MissionBlock · CapabilityGrid ·
TeamGrid · MilestoneTimeline · PartnerLogos (grayscale→màu) · CTABanner.

## Classification / Risk
- Work item type: FEATURE (initial build)
- Feature change type: ADDITIVE (initial build)
- Scope: SINGLE_SURFACE (1 route)
- Root cause category: n/a
- Review level expected: NORMAL — trang tĩnh SSG
- Blast radius: route `/about` (2 locale)
- Doc impact: NO_DOC_IMPACT (khớp design Screen 2)
- Decision impact: NO

## Scope (spec refs)
- **R-04:** đủ 5 khối (sứ mệnh, năng lực, team, milestones, đối tác) + logo grayscale→màu khi hover
- **R-23:** responsive table Screen 2 (timeline dọc→ngang lg, grid đổi cột)
- **R-24:** timeline `<ol>` semantic, ảnh team alt = tên, logo alt = tên đối tác `rel="noopener"`
- **R-21/R-20:** metadata + hreflang per page · Design: Screen 2

## Dependencies
- Layer 1: task-01 (tokens), task-02 (shell), task-03 (PageHeader/Breadcrumb/CTABanner), task-04 (Reveal);
  Layer 0 task-04 (about content)

## Description
1. `src/app/[locale]/about/page.tsx`: metadata ("Về NTA | NTA" / "About NTA | NTA", desc 150–160 ký tự,
   alternates) + copy Screen 2.
2. Components page-local (`src/components/about/`):
   - `MissionBlock`: statement lớn `h2` centered `max-w-[48ch]`, KHÔNG card
   - `CapabilityGrid`: 4 mục dạng list/divider KHÔNG card (tránh lặp family với TeamGrid)
   - `TeamGrid`: ảnh + tên + vai trò (placeholder OQ#3), 1→2→3-4 cột
   - `MilestoneTimeline`: `<ol>` semantic; vertical mobile → **horizontal ở lg**
   - `PartnerLogos`: grayscale → màu 250ms hover; **không logo → ẩn section**
3. Empty policy (§1.4): không milestone → ẩn Timeline; ảnh team lỗi → fallback.
4. Reveal section; messages key `about.*`.

## Acceptance Criteria
- [x] Đủ 5 khối + PageHeader + CTABanner (7 section), thứ tự đúng design
- [x] Timeline semantic `<ol>`, horizontal ở lg; logos grayscale hover + alt text
- [x] Empty: 0 logo/milestone → section ẩn (không để trống)
- [x] ≥4 layout family, không 3 section liên tiếp cùng family
- [x] Responsive khớp bảng Screen 2 (375/768/1280) — reviewer responsive gate: no FAIL
- [x] Metadata 2 locale + hreflang; check commands pass

## Verification Summary
- Commands: `npm run lint` · `npm run typecheck` · `npm run build` — PASS (primary re-run sau reviewer r2; `/vi/about` + `/en/about` SSG)
- Test: `test_command: null` → skip, chưa có test framework
- Manual evidence: reviewer dùng code + CSS math (không self-run browser); logo hover/timeline orientation chưa verify browser thật (partners rỗng)
- Reviewer report: `.context/review-reports/feature-nta-website-layer-2-task-02-round-2-review.md` (r1 FAIL EN desc 164 > 160 → fix → **r2 PASS**, NORMAL)

## Retry / Error Memory
- Attempt: 2 (r1 FAIL MAJOR EN meta description 164 chars + MINOR dead href branch/background alt → fix → r2 PASS)
- Last failure type: MAJOR acceptance-criterion (SEO description length 150–160)
- Error memory entry: none (pattern đã rõ, không lặp lại cần ghi)
- Escalation: none — sau 3 attempt fail → `architecture_review_needed`

## DoD (Definition of Done)
- [x] Code written (chỉ trong scope)
- [x] Tests: skip — `test_command: null`, ghi lý do
- [x] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [x] Reviewer độc lập PASS (r2 NORMAL)
- [x] `.context/progress.json` updated
- [x] Error Memory / Doc Impact recorded (NO_DOC_IMPACT)
- [x] committed — 1 task = 1 commit (branch `main`, KHÔNG push)

## Files to Create/Modify
- `src/app/[locale]/about/page.tsx`
- `src/components/about/MissionBlock.tsx`, `CapabilityGrid.tsx`, `TeamGrid.tsx`,
  `MilestoneTimeline.tsx`, `PartnerLogos.tsx`
- `src/i18n/messages/{vi,en}.json` (`about.*`)

## Notes
- Team/logo/thông tin thật = placeholder (OQ#1/OQ#3) — ghi rõ trong content, không bịa tên thật.
