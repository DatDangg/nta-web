# Run Journal — feature/home-solution-card-image · phase-1

```yaml
workItem: feature/home-solution-card-image
phaseTask: phase-1-task-01
step: close-out
agent: change-request
status: done
attempt: 2
interrupted: false
updatedAt: 2026-10-14
filesTouched: [spec/changes/BACKLOG.md, .context/progress.json]
filesNew: [spec/changes/2026-10-14-home-solution-card-image.md, spec/changes/assets/2026-10-14-home-solution-card-image/4.webp, tasks/feature-home-solution-card-image/phase-1-task-01.md, .context/runs/feature-home-solution-card-image-phase-1.md]
evidence:
  reportPath: .context/review-reports/feature-home-solution-card-image-phase-1-task-01-round-1-review.md
  round: 1
  verdict: PASS
next: "none — CR-017 done"
loopSignal: none
approvals: [{gate: phase_plan, at: 2026-10-14, ok: true, note: "dùng ảnh hiện có"}]
```

## Notes
- KHÔNG commit `.context/project-config.md`; commit bằng `git commit -- <paths>`.

## History
- 2026-10-14 classify MODIFY(UI) LOW; BACKLOG CR-017 in_progress; user duyệt plan + dùng ảnh hiện có → START builder phase-1-task-01 (cancel sẽ redo bước này)
- 2026-10-14 DONE builder attempt 1: typecheck PASS, lint PASS; build sandbox BLOCKED → build ở terminal user (npm.cmd) PASS 59/59. Visual 1440: chữ đè ảnh đậm ở xl (lớp nền xl:hidden, cột chữ 64%) → FAIL acceptance đọc chữ → START builder attempt 2 (cancel sẽ redo bước này)
- 2026-10-14 DONE builder attempt 2: nền surface mọi breakpoint, cột chữ md/xl 56%, ảnh w-60% mask 50%, object-[40%_50%]; typecheck/lint PASS; build (terminal user, npm.cmd) PASS 59/59. Visual: 1440 chữ trái sạch + ảnh nửa phải OK; 375 ảnh rõ + chữ đọc được; DOM 1024/768/375 không tràn ngang (sw<vw). Screenshot 1024/768 timeout pane → residual. → START reviewer round 1 (cancel sẽ redo bước này)
- 2026-10-14 DONE reviewer round 1 PASS (NORMAL), 2 nit không chặn (mất fallback onError; alt trang trí). Reviewer tự báo 1 lệnh bash read-only ngoài allowlist. → START spec-publisher (cancel sẽ redo bước này)
- 2026-10-14 DONE spec-publisher: spec 3.11.0 không bump, spec/updates/2026-10-14-home-solution-card-image.md, CHANGELOG, test-scope v40. Close-out: change doc + assets → archive, BACKLOG CR-017 done, progress done → commit task + close-out + push
