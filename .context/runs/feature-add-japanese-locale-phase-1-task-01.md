# Run Journal — feature/add-japanese-locale · phase-1-task-01

```yaml
workItem: feature/add-japanese-locale
phaseTask: phase-1-task-01
step: ready
agent: change-request
status: awaiting
attempt: 0
interrupted: false
updatedAt: 2026-11-09T10:30:00+07:00
filesTouched: [SPECIFICATIONS.md, spec/CHANGELOG.md, spec/changes/BACKLOG.md, spec/test-scope/current.json, spec/changes/2026-11-09-add-japanese-locale.md, .context/progress.json]
filesNew: [spec/updates/2026-11-09-add-japanese-locale.md, tasks/feature-add-japanese-locale/phase-1-task-01.md, tasks/feature-add-japanese-locale/phase-2-task-01..04.md, tasks/feature-add-japanese-locale/phase-3-task-01..02.md, .context/review-reports/feature-add-japanese-locale-spec-validation.md]
evidence:
  reportPath: .context/review-reports/feature-add-japanese-locale-spec-validation.md
  round: 1
  verdict: PASS
next: "Chờ user duyệt phase plan (7 task, 3 phase) + duyệt dòng HIGH_RISK_MIGRATION cho migration 0002 → rồi builder phase-1-task-01"
loopSignal: none
approvals: [{gate: phase_plan, at: null, ok: null}]
batchQueue: [phase-1-task-01, phase-2-task-01, phase-2-task-02, phase-2-task-03, phase-2-task-04, phase-3-task-01, phase-3-task-02]
```

## Notes / WIP reasoning

- Classify ADDITIVE (i18n + DB), risk HIGH → STRICT review cho P1-T01, P2-T02..04, P3-T01.
- Spec 4.11.0 → 4.12.0 (R-20a mới; sửa R-20, R-09c, R-13a). Test-scope v62.
- Spec-validator pre-plan: PASS có điều kiện. M-1 (tách SEED_LOCALES/CONTENT_LOCALES, parity bỏ qua ja 2 chiều), L-1 (I-1 chỉ vi/en), L-2 (--alt-ja), L-3 (chuỗi cố định ja trong generate.py), L-4 (/ja/contact) đã gộp vào SPECIFICATIONS R-20a/R-09c/R-13a trước khi lập task.
- Migration 0002: chỉ nới CHECK, không mất dữ liệu, nhưng drizzle sinh `ALTER TABLE ... DROP CONSTRAINT` → deploy/db/migration-gate.ts:38 chặn → cần dòng duyệt user. Không có DB staging (R-16c) → chạy thử trên DB tạm restore từ backup.
- publish-post giữ vi/en ở P1-T01, chuyển 3 locale cùng commit với generate.py ở P3-T01 (tránh cron thứ 7 vỡ).

## History

- 2026-11-09T10:00 change-request: classify + spec delta 4.12.0 + test-scope v62
- 2026-11-09T10:15 spec-validator pre-plan PASS (có điều kiện) → gaps gộp vào spec
- 2026-11-09T10:30 phase/task 3 phase 7 task; dừng ở checkpoint duyệt plan
