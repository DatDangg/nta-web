# Run Journal — feature/content-database · plan (CR-031)

```yaml
workItem: feature/content-database
phaseTask: plan
step: ready
agent: spec-validator
status: awaiting
attempt: 0
interrupted: false
updatedAt: 2026-10-14T22:00:00+07:00
filesTouched: [spec/changes/BACKLOG.md, SPECIFICATIONS.md, spec/CHANGELOG.md, .context/project-config.md, .context/progress.json]
filesNew: [spec/changes/2026-10-14-content-database.md, spec/updates/2026-10-14-content-database.md, tasks/feature-content-database/*, .context/runs/feature-content-database-plan.md]
evidence:
  reportPath: .context/review-reports/feature-content-database-spec-validation.md
  round: 2
  verdict: PASS
next: "Chờ user duyệt phase plan (+ trả lời phạm vi i18n/company-info/ảnh) → phase-1-task-01 builder"
loopSignal: none
approvals: []                       # chờ {gate: phase_plan}
batchQueue: []
```

## Notes / WIP reasoning

- Classify: ADDITIVE (DB, lịch sử, backup, revalidate API) + MODIFY kiến trúc (nguồn nội dung file → DB, render SSG → on-demand + cache).
- Risk HIGH, review STRICT (DB/schema/migration, infra VPS dùng chung, shared loaders/navigation, secret endpoint, bulk import).
- Spec 4.1.0 → 4.2.0 (MINOR) ghi ở planning, hiệu lực khi cutover PASS; test-scope v49 sinh ở close-out.
- Không đụng `docs/content-bot/` + change doc CR-030 (untracked, thuộc CR-030).
- Push: task 2 cần secret trước; task 5–7 giữ local tới cutover (task 8).

## History

- 2026-10-14T22:00+07:00 journal created; BACKLOG CR-031 → in_progress; spec delta + config + 9 task files ghi xong.
- 2026-10-14 spec-validator round 1 FAIL (3 MAJOR/7 MINOR) → sửa plan/spec (cờ CONTENT_SOURCE, test runner, collection không CHECK…) → round 2 PASS (4 MINOR, đã sửa cả 4).
- 2026-10-14 commit planning; DỪNG checkpoint phase_plan.
