# Run Journal — change-request/nta-website · fix-blog-list-date-format

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: change-request/nta-website
phaseTask: fix-blog-list-date-format
step: change_request
agent: change-request
status: awaiting                      # change-request xong, commit edb5c4f; chờ reviewer độc lập round 2
attempt: 0
interrupted: false
updatedAt: 2026-10-09T17:20:00+07:00
filesTouched: [.context/progress.json, SPECIFICATIONS.md, spec/CHANGELOG.md, spec/test-scope/current.json, src/components/cards/PostCard.tsx, src/components/blog/ArticleHeader.tsx]
filesNew: [src/lib/format/date.ts, tasks/feature-fix-blog-list-date-format/phase-1-task-01.md, spec/updates/2026-10-09-fix-blog-list-date-format.md]
evidence:
  reportPath: .context/review-reports/feature-fix-blog-list-date-format-phase-1-task-01-round-1-review.md
  round: 1
  verdict: PASS
  verify: "commit edb5c4f; spec 1.0.0→1.0.1; util src/lib/format/date.ts; PostCard+ArticleHeader dùng chung; change archived status done"
next: "reviewer độc lập round 2 (change task) → spec-validator Layer 2 round 2 → checkpoint unlock Layer 3"
loopSignal: none
approvals:
  - {gate: layer0_done, at: 2026-10-08T20:10:00+07:00, ok: true}
  - {gate: layer1_done, at: 2026-10-09T07:00:00+07:00, ok: true}
  - {gate: layer2_phase_review_round1, at: 2026-10-09T16:25:00+07:00, ok: false}
batchQueue: []
```

## Notes / WIP reasoning

- User chọn tại checkpoint Layer 2: **Fix C-L2-1 rồi re-review**. Route post-build → agent `change-request` (class MODIFY).
- Change file: `spec/changes/2026-10-09-fix-blog-list-date-format.md`.
- Sau khi change-request xong → primary chạy lại **spec-validator Layer 2 round 2** → nếu PASS thì trình checkpoint unlock Layer 3.
- M-2 (related content), M-4 (CTAForm defer L3), residual SSG pagination KHÔNG thuộc change này.

## History

- 2026-10-09T16:40:00+07:00 ▶ write-ahead change-request MODIFY — status=running
- 2026-10-09T17:20:00+07:00 change-request xong (output rỗng nhưng đĩa đã xong): task `tasks/feature-fix-blog-list-date-format/phase-1-task-01.md`, util `src/lib/format/date.ts`, PostCard+ArticleHeader unified, spec 1.0.0→1.0.1, reviewer+spec report (inline), progress update, **commit `edb5c4f`**, change archived status done. ⚠️ reviewer/spec report là **inline self-review** (subagent depth limit) → primary phải chạy lại độc lập. status=awaiting.
