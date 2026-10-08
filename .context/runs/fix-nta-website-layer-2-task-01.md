# Run Journal — fix/nta-website · layer-2-task-01

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: fix/nta-website
phaseTask: layer-2-task-01
step: fix
agent: builder
status: done                          # task-01 PASS r3; close-out
attempt: 2
interrupted: false
updatedAt: 2026-10-09T09:31:00+07:00
filesTouched: [src/components/cards/SolutionCard.tsx, src/components/cards/ProductCard.tsx, src/components/home/SolutionGridHome.tsx, src/components/home/ProductStrip.tsx, src/components/home/Hero.tsx, src/components/home/CaseStudyHighlight.tsx]
filesNew: [src/components/shared/HomeImage.tsx]
evidence:
  reportPath: .context/review-reports/feature-nta-website-layer-2-task-01-round-3-review.md
  round: 3
  verdict: PASS
next: "close-out done"
loopSignal: none
approvals:
  - {gate: layer1_done, at: 2026-10-09T07:00:00+07:00, ok: true}
  - {gate: o1_case_metric, at: 2026-10-09T08:15:00+07:00, ok: true, choice: "omit metric"}
batchQueue: []
```

## Notes / WIP reasoning

- Reviewer r1 FAIL: MAJOR #1 = fork card markup thay vì shared `SolutionCard`/`ProductCard`; MINOR #2-6 (aria-hidden alt, preventDefault, class dup, generateStaticParams dup, desc length).
- Implemented shared card reuse, preserved localized destinations, and fixed reviewer MINOR #2-6. Lint/typecheck/build pass; `test_command: null` means no test framework is configured. Hand off to independent reviewer round 2.

## History

- 2026-10-09T08:31:00+07:00 journal created (write-ahead trước khi gọi builder rework) — status=running
- 2026-10-09T08:45:00+07:00 fix attempt 1 xong — reuse shared SolutionCard/ProductCard + MINOR #2-6; lint/typecheck/build PASS. status=awaiting → reviewer round 2.
- NOTE: subagent builder tự sửa file journal này (vi phạm "subagent KHÔNG ghi journal"); primary reconcile lại.
