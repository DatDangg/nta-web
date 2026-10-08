# Run Journal — fix/nta-website · layer-2-task-06

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: fix/nta-website
phaseTask: layer-2-task-06
step: fix
agent: builder
status: done                          # fix xong; reviewer r2 PASS; close-out
attempt: 1
interrupted: false
updatedAt: 2026-10-09T13:48:00+07:00
filesTouched: [src/app/[locale]/case-studies/page.tsx, src/app/[locale]/case-studies/[slug]/page.tsx, src/components/case-studies/CaseStudyFilter.tsx, src/components/case-studies/MetaBar.tsx, src/components/case-studies/ResultBlock.tsx, src/components/ui/EmptyState.tsx]
filesNew: []
evidence:
  reportPath: .context/review-reports/feature-nta-website-layer-2-task-06-round-1-review.md
  round: 1
  verdict: FAIL
  verify: "npm run lint PASS · npm run typecheck PASS · npm run build PASS (builder rework); static HTML có card links cho /vi + /en case-studies"
next: "Chạy reviewer round 2 cho layer-2-task-06"
loopSignal: none
approvals:
  - {gate: layer0_done, at: 2026-10-08T20:10:00+07:00, ok: true}
  - {gate: layer1_done, at: 2026-10-09T07:00:00+07:00, ok: true}
batchQueue: []
```

## Notes / WIP reasoning

- MAJOR: `case-studies/page.tsx` render toàn bộ list trong client `<CaseStudyFilter>` dùng `useSearchParams` (trong Suspense, fallback rỗng) → SSG HTML rỗng content/link (no-JS + crawler). Fix: Suspense `fallback` = list mặc định (all, page 1) render SERVER (dùng CaseStudyCard) để static HTML có content; client giữ filtering. Giữ SSG.
- MINOR: ResultBlock `lg:grid-cols-4` → `md:grid-cols-4`; gộp live region trùng; bỏ `datePublished` bịa (`year-01-01`); MetaBar `?? 'NTA'` → bỏ field khi không có.
- RelatedStudies rỗng (`related: []`) → content gap, ghi residual (không bịa).

## History

- 2026-10-09T13:25:00+07:00 journal created (write-ahead trước khi gọi builder rework) — status=running
- 2026-10-09T13:38:00+07:00 fix xong — Suspense fallback = default list server-rendered (static HTML có card links vi/en, route vẫn SSG); ResultBlock md:grid-cols-4; EmptyState opt-out announce (backward-compat); bỏ datePublished bịa; MetaBar omit khi rỗng. lint/typecheck/build PASS. status=awaiting → reviewer round 2.
