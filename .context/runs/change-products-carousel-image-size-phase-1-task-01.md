# Run Journal — change/products-carousel-image-size · phase-1-task-01

```yaml
workItem: feature/nta-website
phaseTask: change-products-carousel-image-size-phase-1-task-01
step: done
agent: change-request
status: done
attempt: 0
interrupted: false
updatedAt: 2026-10-12T05:00:00+07:00
filesTouched: [src/components/layout/Header.tsx]   # dirty sẵn từ user — KHÔNG thuộc task này, KHÔNG revert
filesNew: []
evidence:
  reportPath: .context/review-reports/change-products-carousel-image-size-phase-1-task-01-round-1-review.md
  round: 1
  verdict: PASS
next: "DONE — đã commit. User reload /products xem ảnh to ~3×."
loopSignal: none
approvals: []
batchQueue: []
```

## Notes / WIP reasoning

User báo ảnh trên `/products` quá bé. Root cause (đã điều tra):

- `products/page.tsx:49` — grid `lg:grid-cols-2` → mỗi AppCard ≈ 1/2 container.
- `AppCard.tsx:18` — `md:grid-cols-2` → cột media ≈ 1/2 card.
- `ScreenshotCarousel.tsx:63` — slide `lg:w-1/3` → mỗi slide ≈ 1/3 cột media.
- Poster dọc 9/16 (`cardPosterImageClass`) → tích ≈ 1/12 container → poster ~100px.

Quyết định (user chốt): carousel **1 ảnh/slide** (`w-full`), giữ bố cục card 2 cột.
Fix: `ScreenshotCarousel.tsx` 2 dòng (slide class + `sizes`).
Kết quả: scope v13→v14, spec 3.0.0 KHÔNG bump. Reviewer PASS (round-1 độc lập từ primary).
Verify primary chạy thật: lint/typecheck/build PASS + HTML build xác nhận.

## History

- 2026-10-12T00:00:00+07:00 journal created
- 2026-10-12T05:00:00+07:00 DONE — code + spec publish + progress + commit
