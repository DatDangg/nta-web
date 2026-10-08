# Run Journal — builder/nta-website · layer-2-task-06

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: builder/nta-website
phaseTask: layer-2-task-06
step: builder
agent: builder
status: awaiting                      # builder xong, chờ reviewer
attempt: 0
interrupted: false
updatedAt: 2026-10-09T13:12:00+07:00
filesTouched: [src/i18n/messages/vi.json, src/i18n/messages/en.json]
filesNew: [src/app/[locale]/case-studies/page.tsx, src/app/[locale]/case-studies/[slug]/page.tsx, src/components/case-studies/MetaBar.tsx, src/components/case-studies/ChallengeBlock.tsx, src/components/case-studies/SolutionBlock.tsx, src/components/case-studies/ResultBlock.tsx, src/components/case-studies/ImageGallery.tsx, src/components/case-studies/RelatedStudies.tsx, src/components/case-studies/CaseStudyFilter.tsx]
evidence:
  reportPath: null
  round: 0
  verdict: awaiting_review
  verify: "npm run lint PASS · npm run typecheck PASS · npm run build PASS (builder); list + case slugs SSG"
understand: "layer-2-task-06 = Case Studies list + [slug] detail (Screens 8-9)"
next: "Chạy reviewer độc lập round 1 cho layer-2-task-06"
loopSignal: none
approvals:
  - {gate: layer0_done, at: 2026-10-08T20:10:00+07:00, ok: true}
  - {gate: layer1_done, at: 2026-10-09T07:00:00+07:00, ok: true}
batchQueue: []
```

## Notes / WIP reasoning

- Deps done: Layer 1 task-02/03/04 (FilterBar/Pagination/EmptyState/CaseStudyCard/PageHeader/Breadcrumb), Layer 0 task-04 (≥2 case).
- List: FilterBar client-side + `?filter=` deep link + grid + Pagination `?page=` (pageSize 9; ≤9 case → ẩn) + EmptyState.
- Detail: MetaBar `<dl>` (khách hàng/lĩnh vực/năm) → Challenge → Solution → Result (số thật, không count-up) → ImageGallery (trống ẩn) → RelatedStudies 3 card (trống ẩn) → CTABanner alt.
- BR-004: anonymize khách hàng chưa xin phép; không bịa số liệu.
- Filter+pagination là client component nhận list từ server — KHÔNG fetch API (nếu thấy client fetch ẩn → STRICT).
- Lightbox không bắt buộc v1 (skip = ghi lý do).

## History

- 2026-10-09T12:55:00+07:00 journal created (write-ahead trước khi gọi builder) — status=running
- 2026-10-09T13:12:00+07:00 builder xong — list + detail + 7 component + 2 i18n; lint/typecheck/build PASS; list + case slugs SSG. status=awaiting → reviewer round 1.
