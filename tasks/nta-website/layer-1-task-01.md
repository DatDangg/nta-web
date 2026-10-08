# Task 01: Design tokens → Tailwind theme + Button/Section/Badge primitives

## Layer
1

## Type
build (initial)

## Goal
Chính thức hóa design tokens vào `globals.css`/Tailwind theme và dựng bộ primitive dùng chung
(`Button`, `Section`, `Badge`, container utilities, focus ring, reduced-motion) — nền cho mọi component ở các task sau.

## Classification / Risk
- Work item type: FEATURE (initial build)
- Feature change type: ADDITIVE (initial build)
- Scope: SHARED_FOUNDATION (theme + primitive component)
- Root cause category: n/a
- Review level expected: NORMAL — styling foundation, không data/API/auth
- Blast radius: mọi UI component + page (theme lock light, palette 1 accent)
- Doc impact: NO_DOC_IMPACT (tokens khớp `skills/nextjs/design-tokens.md` + `docs/DESIGN.md`)
- Decision impact: NO

## Scope (spec refs)
- **R-23:** breakpoint thang Tailwind, fluid `clamp()/rem`, container 1280px
- **R-24:** focus ring 2px, contrast WCAG 2.1 AA, touch target ≥44px
- **R-22:** baseline performance (CSS gọn, không dependency nặng)
- Design: §1.3 (Section/layout system), §1.5 (motion), §1.6 (a11y global) · Tokens: `skills/nextjs/design-tokens.md`

## Dependencies
- task-01 Layer 0 (scaffold + Tailwind)

## Description
1. **ĐỌC BẮT BUỘC** `skills/nextjs/design-tokens.md` trước khi viết code (design-spec dòng 4).
2. `src/app/globals.css`: token CSS variables (color `#0071E3` primary, `#F5F5F7` alt, ink/surface/error,
   type scale Inter/SF Pro, spacing/radius scale, `--z-header`, `--color-focus`) + theme lock **light**.
3. Tailwind mapping: colors, container (`max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8`), breakpoints
   chuẩn (640/768/1024/1280/1536), typography base fluid.
4. Components:
   - `Button` (primary/secondary/ghost/outline × sm/md/lg, pill, hover + `active:scale-[0.98]`,
     focus ring, touch ≥44px, 1 CTA label/intent — tokens §11)
   - `Section` (default/alt/accent; `py-12 md:py-16 xl:py-24`)
   - `Badge` (category/mảng — không truyền đạt info riêng bằng màu)
5. Motion foundation: `prefers-reduced-motion` → static global; reveal task-04 làm riêng.

## Acceptance Criteria
- [x] Token khớp `skills/nextjs/design-tokens.md` (màu, type, spacing, radius, focus, z-index)
- [x] `Button` đủ variant/size, contrast ≥4.5:1 (primary 4.7:1), focus ring thấy rõ trên mọi nền
- [x] `Section` render 3 variant nền xen kẽ; container đúng 1280px + padding theo bp
- [x] `Badge` không dùng màu làm kênh duy nhất (kèm chữ)
- [x] File ≤300 dòng, function ≤50 dòng (project-config ui rules)
- [x] Check commands pass

## Verification Summary
- Fix attempt 2: `npm run lint` PASS · `npm run typecheck` PASS · `npm run build` PASS.
- Contrast evidence (Node WCAG sRGB relative luminance calculation): `#0066CC` on white **5.57:1**, on alt `#F5F5F7` **5.11:1**; primary white text on `#0071E3` **4.70:1**. This covers ghost/outline text across both light section backgrounds and primary CTA.
- Focus treatment: all `:focus-visible` elements now receive a 2px white outline (2px offset) plus 4px `--color-focus` box-shadow. On `Section accent`, white outline contrasts with the blue surface; on white/alt surfaces, blue outer ring contrasts with the light surface.
- Test: skip — `test_command: null`, repo chưa cấu hình test framework. Oxlint skip — no Oxlint config found.
- Manual focus/hover smoke: not run; components are not mounted on current route. Runtime keyboard verification remains for integration smoke test.
- Doc Impact: NO_DOC_IMPACT — presentation-only token/component adjustments.
- Notes: `gradient-soft` moved to Tailwind `backgroundImage`; Inter loading remains deferred to app-shell integration with system font fallback.
- Reviewer report: `.context/review-reports/feature-nta-website-layer-1-task-01-round-3-review.md` — Verdict **PASS** (NORMAL, 0 CRITICAL/MAJOR, 3 MINOR defer non-blocking; round 1+2 FAIL → fix)

## Retry / Error Memory
- Attempt: 2
- Last failure type: reviewer round 2 — ghost text below AA on light surfaces; non-primary focus ring invisible on accent section.
- Error memory entry: reviewer report `.context/review-reports/feature-nta-website-layer-1-task-01-round-2-review.md`; contrast calculation showed hover-blue used as body text, and focus styling depended on button variant rather than the surface context.
- Escalation: none — sau 3 attempt fail → `architecture_review_needed`

## DoD (Definition of Done)
- [x] Code written (chỉ trong scope)
- [x] Tests: skip — `test_command: null`, ghi lý do
- [x] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [x] Reviewer độc lập PASS
- [x] `.context/progress.json` updated
- [x] Error Memory / Doc Impact recorded
- [x] committed — 1 task = 1 commit (branch `main`, KHÔNG push)

## Files to Create/Modify
- `src/app/globals.css`
- `tailwind.config.ts` (hoặc theme block trong CSS nếu Tailwind v4 — theo lựa chọn task-01 L0)
- `src/components/ui/Button.tsx`, `src/components/ui/Section.tsx`, `src/components/ui/Badge.tsx`

## Notes
- KHÔNG shadcn — Tailwind only (đã chốt).
- Tokens design đã confirm ở `/start` bước 3 → không tự đổi giá trị; lệch = báo lại user, không sửa lén.
