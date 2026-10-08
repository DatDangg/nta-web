---
id: fix-layer1-dead-links
type: feature
status: done
created: 2026-10-09
---

# Fix Layer-1 dead links + plan drift (Gap 1–4 từ phase review Layer 1)

## Yêu cầu
Sửa 4 gap MED do spec-validator phase review Layer 1 phát hiện (report
`.context/review-reports/feature-nta-website-layer-1-round-1-spec-review.md`):

1. **Gap 1** — `src/components/cards/ProductCard.tsx:14` và `src/components/cards/AppCard.tsx:17`
   link tới `/products/${slug}` nhưng **không có route `/products/[slug]`** (R-07 chỉ định nghĩa `/products`).
   → Sửa để không trỏ tới route không tồn tại (trỏ về `/products`).
2. **Gap 2** — `src/components/layout/MobileNav.tsx:10` link `/solutions` nhưng **không có route `/solutions`**
   (chỉ có `/solutions/enterprise`, `/solutions/ai`). → Bỏ link cha, giữ 2 sub-link (khớp desktop dropdown).
3. **Gap 3** — `src/components/layout/Footer.tsx:25` link `/privacy` nhưng **không có route `/privacy`**
   (design ghi "Chính sách (nếu có)"). → Bỏ link.
4. **Gap 4** — `tasks/nta-website/layer-2-task-01.md:26,43` ghi R-03 "**≥3–4**"/"**≥3**" mâu thuẫn
   `SPECIFICATIONS.md:59` R-03 = "**≥2**". → Reconcile text plan về "≥2"; align stale text `layer-0-task-04.md:43`.

## Acceptance (bắt buộc)
- [ ] `ProductCard`/`AppCard` không render href tới route không tồn tại (`/products/[slug]`)
- [ ] `MobileNav` không còn link `/solutions` (chỉ còn 2 sub-link hợp lệ)
- [ ] `Footer` không còn link `/privacy`
- [ ] `layer-2-task-01.md` (và `layer-0-task-04.md`) khớp R-03 ratified = "≥2"
- [ ] `npm run lint` · `npm run typecheck` · `npm run build` PASS
- [ ] Reviewer độc lập PASS cho task modification

## Ghi chú
- Nguồn: spec-validator phase review Layer 1 round 1 (FAIL) — 3 gap MED dead-link + 1 plan drift MED.
- Không đổi public API/contract mới; chỉ align code/plan về spec đã ratified (R-03/R-07/R-05/R-06/R-11).
- Các LOW (Gap 5–10) + conflict C-A **không** nằm trong change này (xử lý riêng sau).
- Routing: post-build MODIFY, đi qua agent `change-request`.
