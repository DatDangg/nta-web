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
- [ ] Token khớp `skills/nextjs/design-tokens.md` (màu, type, spacing, radius, focus, z-index)
- [ ] `Button` đủ variant/size, contrast ≥4.5:1 (primary 4.7:1), focus ring thấy rõ trên mọi nền
- [ ] `Section` render 3 variant nền xen kẽ; container đúng 1280px + padding theo bp
- [ ] `Badge` không dùng màu làm kênh duy nhất (kèm chữ)
- [ ] File ≤300 dòng, function ≤50 dòng (project-config ui rules)
- [ ] Check commands pass

## Verification Summary
- Commands: `npm run lint` · `npm run typecheck` · `npm run build`
- Test: `test_command: null` → skip, ghi lý do
- Manual evidence: trang demo/placeholder render Button × variant; keyboard tab thấy focus ring
- Reviewer report: `.context/review-reports/feature-nta-website-layer-1-task-01-round-1-review.md`

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
- `src/app/globals.css`
- `tailwind.config.ts` (hoặc theme block trong CSS nếu Tailwind v4 — theo lựa chọn task-01 L0)
- `src/components/ui/Button.tsx`, `src/components/ui/Section.tsx`, `src/components/ui/Badge.tsx`

## Notes
- KHÔNG shadcn — Tailwind only (đã chốt).
- Tokens design đã confirm ở `/start` bước 3 → không tự đổi giá trị; lệch = báo lại user, không sửa lén.
