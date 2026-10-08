# Run Journal — fix/nta-website · layer-1-task-01

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: fix/nta-website
phaseTask: layer-1-task-01
step: fix
agent: builder
status: done                         # fix attempt 2 xong; chuyển reviewer round 3
attempt: 2
interrupted: false
updatedAt: 2026-10-08T21:35:00+07:00
filesTouched: [src/app/globals.css, tailwind.config.ts, tasks/nta-website/layer-1-task-01.md]
filesNew: [src/components/ui/Button.tsx, src/components/ui/Section.tsx, src/components/ui/Badge.tsx]
evidence:
  reportPath: .context/review-reports/feature-nta-website-layer-1-task-01-round-1-review.md
  round: 1
  verdict: FAIL
next: "Builder fix 2 MAJOR + MINOR → verify → reviewer round 2"
loopSignal: none
approvals:
  - {gate: layer0_done, at: 2026-10-08T20:10:00+07:00, ok: true}
batchQueue: []
```

## Notes / WIP reasoning

- Round 1 FAIL: MAJOR1 secondary hover `bg-surface-sunken` trùng `bg-background-alt` (#f5f5f7) → no-op; MAJOR2 focus ring primary (#0071E3) vô hình trên Section accent (cùng nền).
- MINOR: thiếu shadow tokens; active scale không animate; ghost contrast 4.31:1; Inter chưa load; overlay/skeleton/gradient chưa map.

## History

- 2026-10-08T20:50:00+07:00 journal created (write-ahead builder fix attempt 1) — status=running
- 2026-10-08T21:05:00+07:00 fix DONE — 2 MAJOR + MINOR fixed; verify PASS. status=done.
- 2026-10-08T21:20:00+07:00 journal reopened — fix attempt 2 (round 2 FAIL). status=running.
- 2026-10-08T21:35:00+07:00 fix attempt 2 DONE — focus-visible dùng chung + contrast AA; verify PASS. status=done.
