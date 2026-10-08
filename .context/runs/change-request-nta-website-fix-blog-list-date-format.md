# Run Journal — change-request/nta-website · fix-blog-list-date-format

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: change-request/nta-website
phaseTask: fix-blog-list-date-format
step: change_request
agent: change-request
status: running                       # write-ahead trước khi gọi change-request (MODIFY post-build)
attempt: 0
interrupted: false
updatedAt: 2026-10-09T16:40:00+07:00
filesTouched: []
filesNew: [spec/changes/2026-10-09-fix-blog-list-date-format.md]
evidence:
  reportPath: .context/review-reports/feature-nta-website-layer-2-round-1-spec-review.md
  round: 1
  verdict: FAIL
  verify: "conflict C-L2-1 MED — format ngày blog list (PostCard dateStyle:medium) ≠ detail (dd/mm/yyyy) ≠ design S11"
next: "change-request: classify MODIFY → spec delta → spec-publish → task → builder → reviewer → spec-validator → doc reconcile → progress → commit → archive"
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
