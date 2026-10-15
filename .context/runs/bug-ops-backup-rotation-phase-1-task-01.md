# Run Journal — bug/ops-backup-rotation · phase-1-task-01

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: bug/ops-backup-rotation
phaseTask: phase-1-task-01
step: closeout
agent: change-request
status: awaiting
attempt: 0
interrupted: false
updatedAt: 2026-10-15T00:00:00Z
filesTouched: [spec/changes/BACKLOG.md, spec/changes/2026-10-14-ops-backup-rotation.md, .context/progress.json]
filesNew: [tasks/bug-ops-backup-rotation/phase-1-task-01.md, .context/runs/bug-ops-backup-rotation-phase-1-task-01.md]  # docs/content-bot/ + spec/changes/2026-10-14-telegram-content-bot.md KHÔNG thuộc task này
evidence:
  reportPath: .context/review-reports/bug-ops-backup-rotation-phase-1-task-01-round-1-review.md
  round: 1
  verdict: PASS
next: "deploy chạy sau push → user bấm Content ops backup trên VPS (log ops-backup-…dump, không có rotate xoá pre-migrate-<sha>) → archive CR-033 + BACKLOG done"
loopSignal: none
approvals: ["2026-10-15 user duyệt fix plan (prefix ops-<nguồn>, nhãn tay vòng deploy, legacy pre-migrate-ops-* vòng ops)"]
batchQueue: [CR-033 ops-backup-rotation]
```

## Notes / WIP reasoning

- Classify: BUG (ops), severity medium, review STRICT (backup/rotate xoá file).
- Root cause: `deploy/db/backup.sh:18-21` whitelist chỉ `daily|pre-migrate-*` → ops buộc dùng tiền tố `pre-migrate-ops-*`
  (`content-ops.yml:85`, `ai-news.yml:151`); `backup.sh:97-98` rotate glob `pre-migrate-*.dump` gom chung với deploy (`deploy.yml:56`) → `rotate` `:41-46` xoá bản deploy cũ nhất.
- Caller thứ 2 ngoài change doc: `ai-news.yml:151` (CR-034) — đưa vào scope.
- Fix plan: tiền tố `ops-<nguồn>-<UTC>-<run>`, vòng ops = `ops-*` + legacy `pre-migrate-ops-*`; vòng deploy = `pre-migrate-*` trừ `pre-migrate-ops-*`.

## History

- 2026-10-15 journal created — `/change CR033`; backlog CR-033 → in_progress; task file tạo; ⏸ HUMAN CHECKPOINT (chưa gọi builder).
- 2026-10-15 user duyệt plan → builder: backup.sh tách 2 vòng + workflows + runbook; harness 13/13 PASS (sh+dash), HEAD tái hiện bug; typecheck/lint/test PASS; npm run build FAIL môi trường (Failed to load native binding).
- 2026-10-15 reviewer STRICT round 1 PASS (2 MINOR không chặn). spec-publisher: scope v51 (bug-fix), spec 4.2.1 giữ nguyên.
- 2026-10-15 commit fix local; KHÔNG push vì build FAIL.
- 2026-10-15 docker build --target builder PASS (npm run build trong container) → push origin main.
