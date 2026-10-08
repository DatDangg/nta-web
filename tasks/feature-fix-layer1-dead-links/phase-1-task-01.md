# Task 01 (modification): Fix Layer-1 dead links + plan drift (Gap 1–4)

> Nguồn: change `spec/changes/2026-10-09-fix-layer1-dead-links.md` · report
> `.context/review-reports/feature-nta-website-layer-1-round-1-spec-review.md` (FAIL round 1).

## Layer
1 (modification sau phase review Layer 1)

## Type
modification (post-build MODIFY)

## Goal
Align code + plan về spec ĐÃ RATIFIED: bỏ 3 dead-link (Gap 1–3) và reconcile stale R-03 "≥3–4" → "≥2" (Gap 4).
Không thêm route / requirement mới.

## Classification / Risk
- Work item type: FEATURE (post-build modification)
- Feature change type: MODIFY
- Scope: CROSS-CUTTING (shared cards + shell nav/footer + plan docs)
- Root cause category: n/a — contract drift vs ratified spec (R-03/R-05/R-06/R-07/R-11)
- Review level expected: STRICT — chạm component shell/navigation dùng chung (`MobileNav`/`Footer`) + shared cards
- Blast radius: mọi trang (Footer/MobileNav); home strip + `/products` (ProductCard/AppCard)
- Doc impact: reconcile plan task text (`layer-2-task-01.md`, `layer-0-task-04.md`); no API/schema/requirement doc change
- Decision impact: NO

## Scope (spec refs)
- **R-07** (`SPECIFICATIONS.md:81`): chỉ có `/products` — KHÔNG có `/products/[slug]`
- **R-05/R-06** (`:69`,`:75`): chỉ `/solutions/enterprise`, `/solutions/ai` — KHÔNG có `/solutions` index
- **R-11** (`:109-111`): footer 4 cột + pháp lý + social + liên hệ; design §1.2 "Chính sách (nếu có)"
- **R-03** (`:59`): sản phẩm tiêu biểu **≥2** (đã ratify `layer-0-task-06.md:41` — G2)
- design-spec Screen 1 (`.context/design-spec.md:116`): **≥2** `ProductCard`; §1.1 mobile nav mirror desktop (không có link cha `/solutions`)

## Dependencies
- Layer 0 + Layer 1 đã done/PASS. Không phụ thuộc Layer 2.

## Description (đúng 4 fix — KHÔNG mở rộng)
1. **Gap 1** — `src/components/cards/ProductCard.tsx:14` và `src/components/cards/AppCard.tsx:17`:
   đổi `href={`/products/${product.slug}`}` → `href="/products"`.
2. **Gap 2** — `src/components/layout/MobileNav.tsx:10,43`: bỏ link cha `/solutions`; giữ label nhóm
   (non-link, dùng key `nav.solutions`) + 2 sub-link `/solutions/enterprise`, `/solutions/ai`.
3. **Gap 3** — `src/components/layout/Footer.tsx:25`: bỏ `<Link href="/privacy">`; giữ dòng copyright (pháp lý).
4. **Gap 4** — `tasks/nta-website/layer-2-task-01.md:26` "≥3–4" → "≥2"; `:43` "≥3 `ProductCard`" → "≥2 `ProductCard`";
   `tasks/nta-website/layer-0-task-04.md:43` "≥3" → "≥2"; reconcile note `:91` (đã ratified ≥2).

## Acceptance Criteria
- [ ] ProductCard/AppCard KHÔNG render href tới route không tồn tại `/products/[slug]`
- [ ] MobileNav KHÔNG còn link tới `/solutions`; vẫn còn đủ 2 sub-link enterprise/ai
- [ ] Footer KHÔNG còn link `/privacy`; dòng copyright vẫn còn
- [ ] `layer-2-task-01.md` + `layer-0-task-04.md` khớp R-03 ratified = "≥2"
- [ ] KHÔNG đụng LOW Gap 5–10 / conflict C-A
- [ ] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [ ] Reviewer độc lập PASS (STRICT)

## Verification Plan
- Commands: `npm run lint` · `npm run typecheck` · `npm run build`
- Test: `test_command: null` → skip, ghi lý do
- Evidence: grep không còn `/products/${`, `'/solutions'`, `/privacy`; build route list; `git diff` 2 file plan

## Feature Verification
- Acceptance criteria: **PASS** (4/4 fix đạt)
- Verify commands + result:
  - `npm run lint` → ✅ PASS (exit 0)
  - `npm run typecheck` → ✅ PASS (exit 0)
  - `npm run build` → ✅ PASS (Next 15.5.27; `○ /_not-found`, `● /[locale]` (/vi,/en), `ƒ /[locale]/[...rest]`)
- Evidence:
  - `grep 'products/\${' src/components` → none (chỉ còn match path file nội dung ở `src/lib/content/products.ts`, không phải href)
  - `grep "'/solutions'" src/` → chỉ `Header.tsx:52` (prefix match), MobileNav none
  - `grep '"/privacy"' src/` → none
  - plan docs: `layer-2-task-01.md:26,43` + `layer-0-task-04.md:43` = "≥2"; `:91` note ratify
- Reviewer verdict: **PASS** (STRICT) — `.context/review-reports/feature-fix-layer1-dead-links-phase-1-task-01-round-1-review.md`
  - ⚠️ report ghi rõ là **inline self-review** (env chặn spawn reviewer độc lập; user đã chấp nhận).
- Spec re-check: **PASS** (4/4 gap MED đóng) — `.context/review-reports/feature-fix-layer1-dead-links-phase-1-round-1-review-spec.md`

## Retry / Error Memory
- Attempt: 0
- Last failure type: n/a
- Error memory entry: none
- Escalation: none — sau 3 attempt fail → `architecture_review_needed`

## DoD (Definition of Done)
- [x] Code + plan docs written (chỉ trong scope)
- [x] Tests: skip — `test_command: null`, chưa cấu hình test framework
- [x] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [x] Reviewer PASS (⚠️ inline self-review — env depth limit; user chấp nhận)
- [x] `.context/progress.json` updated
- [x] Error Memory / Doc Impact recorded (plan-doc reconcile; no API/schema change)
- [x] committed — 1 task = 1 commit (branch `main`, KHÔNG push)

## Files to Create/Modify
- `src/components/cards/ProductCard.tsx`
- `src/components/cards/AppCard.tsx`
- `src/components/layout/MobileNav.tsx`
- `src/components/layout/Footer.tsx`
- `tasks/nta-website/layer-2-task-01.md`
- `tasks/nta-website/layer-0-task-04.md`

## Notes
- Không đổi requirement → `spec_version` giữ **1.0.0** (reconcile only); vẫn sinh `spec/test-scope/current.json` (`trigger: feature-update`, `scopeVersion` 1 → 2).
- KHÔNG thêm route mới (`/products/[slug]`, `/solutions`, `/privacy`) — chỉ align code/plan về spec ratified.
- Builder KHÔNG tự commit / không update progress (workflow close-out làm).
