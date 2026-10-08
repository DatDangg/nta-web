# Run Journal — fix/nta-website · layer-1-task-03

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: fix/nta-website
phaseTask: layer-1-task-03
step: fix
agent: builder
status: done                         # fix xong; chuyển reviewer round 2
attempt: 1
interrupted: false
updatedAt: 2026-10-09T01:40:00+07:00
filesTouched: [tasks/nta-website/layer-1-task-03.md]
filesNew: [src/components/shared/, src/components/cards/]
evidence:
  reportPath: .context/review-reports/feature-nta-website-layer-1-task-03-round-1-review.md
  round: 1
  verdict: FAIL
next: "Builder fix 2 MAJOR + MINOR → verify → reviewer round 2"
loopSignal: none
approvals:
  - {gate: layer0_done, at: 2026-10-08T20:10:00+07:00, ok: true}
batchQueue: []
```

## Notes / WIP reasoning

- MAJOR1: AppCard slot downloadLinks (link) lồng trong `<Link>` bọc khối → nested a/2 focus target. MAJOR2: CTABanner chồng bg-background lên buttonStyles('secondary') → override thua, contrast 4.33:1.
- MINOR: PostCard 16:10 vs 16:9; thiếu `sizes`; breadcrumb slice(-3); card return null thay fallback.

## History

- 2026-10-09T01:25:00+07:00 journal created (write-ahead builder fix attempt 1) — status=running
- 2026-10-09T01:40:00+07:00 fix DONE — 2 MAJOR + MINOR fixed; verify PASS. status=done.
