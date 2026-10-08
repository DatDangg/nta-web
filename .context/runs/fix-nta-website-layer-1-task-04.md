# Run Journal — fix/nta-website · layer-1-task-04

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: fix/nta-website
phaseTask: layer-1-task-04
step: fix
agent: builder
status: awaiting                     # fix attempt 2 xong + verify PASS; chờ reviewer round 3 (user approve)
attempt: 2
interrupted: false
updatedAt: 2026-10-09T03:15:00+07:00
filesTouched: [src/i18n/messages/en.json, src/i18n/messages/vi.json, tasks/nta-website/layer-1-task-04.md, src/app/globals.css, src/app/[locale]/layout.tsx]
filesNew: [src/components/ui/Reveal.tsx, src/components/ui/FilterBar.tsx, src/components/ui/Pagination.tsx, src/components/ui/Skeleton.tsx, src/components/ui/EmptyState.tsx]
evidence:
  reportPath: .context/review-reports/feature-nta-website-layer-1-task-04-round-2-review.md
  round: 2
  verdict: FAIL
  verify: "npm run lint PASS · npm run typecheck PASS · npm run build PASS (builder attempt 2)"
next: "Chạy reviewer độc lập round 3 cho layer-1-task-04"
loopSignal: none
approvals:
  - {gate: layer0_done, at: 2026-10-08T20:10:00+07:00, ok: true}
batchQueue: []
```

## Notes / WIP reasoning

- MAJOR1 Reveal: state true + set false trong useEffect → flash visible→invisible→fade. Fix: set hidden trước paint (CSS class mặc định hidden + observer thêm class, hoặc useLayoutEffect + no-JS guard).
- MAJOR2 Pagination: không flex-wrap/overflow → tràn 375px. Fix: flex-wrap/overflow-x-auto hoặc truncate page numbers.

## History

- 2026-10-09T02:25:00+07:00 journal created (write-ahead builder fix attempt 1) — status=running
- 2026-10-09T02:40:00+07:00 session resume: reconcile đĩa → fix MAJOR#1 (Reveal useLayoutEffect), MAJOR#2 (Pagination flex-wrap/window/icon) + FilterBar md:flex-wrap đã áp dụng; verify lint/typecheck/build PASS → status=awaiting, next=reviewer round 2
- 2026-10-09T03:00:00+07:00 user approve option A (vượt max 2 vòng) → fix attempt 2 write-ahead, status=running
- 2026-10-09T03:15:00+07:00 fix attempt 2 xong: Reveal chuyển CSS-gate (`html.js .reveal`) + inline script layout + bỏ useLayoutEffect; FilterBar dùng `filter.groupLabel` i18n (bỏ hardcode VI, xoá dead key); note Suspense/key cho Layer 2. Verify lint/typecheck/build PASS → awaiting, next=reviewer round 3
