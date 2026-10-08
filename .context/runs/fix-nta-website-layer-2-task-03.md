# Run Journal — fix/nta-website · layer-2-task-03

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: fix/nta-website
phaseTask: layer-2-task-03
step: fix
agent: builder
status: done                          # fix xong; reviewer r2 PASS; close-out
attempt: 1
interrupted: false
updatedAt: 2026-10-09T10:58:00+07:00
filesTouched: [src/app/[locale]/solutions/enterprise/[slug]/page.tsx, src/i18n/messages/vi.json]
filesNew: []
evidence:
  reportPath: .context/review-reports/feature-nta-website-layer-2-task-03-round-1-review.md
  round: 1
  verdict: PASS
  verify: "npm run lint PASS · npm run typecheck PASS · npm run build PASS (builder rework); 5 route × 2 locale SSG"
next: "Chạy reviewer round 2 cho layer-2-task-03"
loopSignal: none
approvals:
  - {gate: layer0_done, at: 2026-10-08T20:10:00+07:00, ok: true}
  - {gate: layer1_done, at: 2026-10-09T07:00:00+07:00, ok: true}
batchQueue: []
```

## Notes / WIP reasoning

- Reviewer r1 PASS, 5 MINOR. Chọn fix 3 cái correctness thật:
  - #2 `[slug]/page.tsx:22` `solution.slug.toUpperCase()` → "DENTGO" (sai brand "DentGo"); dùng `solution.title`.
  - #3 `solutions.enterprise.title` = "Giải pháp cho doanh nghiệp" ≠ design "Giải pháp Doanh nghiệp" (breadcrumb + page title).
  - #4 related filter thiếu guard `category === 'enterprise'` (link luôn trỏ /solutions/enterprise).
- Defer #1 (metadata hardcoded — nhất quán home/about) và #5 (content rỗng → section ẩn, allowed). Note residual.

## History

- 2026-10-09T10:40:00+07:00 journal created (write-ahead trước khi gọi builder rework) — status=running
- 2026-10-09T10:45:00+07:00 fix #2/#3/#4 — metadata dùng solution.title; VI title "Giải pháp Doanh nghiệp"; related guard category=enterprise. Phát hiện EN dentgo "…solution Solution" → refine tiếp.
- 2026-10-09T10:48:00+07:00 refine metadata sang brand map slug (CRM/HRM/LMS/DentGo) khớp design example. lint/typecheck/build PASS. status=awaiting → reviewer round 2.
