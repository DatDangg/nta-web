# Run Journal — feature/home-layout-alignment · phase-1-task-02

```yaml
workItem: feature/home-layout-alignment
phaseTask: phase-1-task-02
step: done
agent: change-request
status: awaiting
attempt: 2
interrupted: false
updatedAt: 2026-10-19T13:00:00+07:00
filesTouched: [src/components/home/HeroVisual.tsx, src/components/home/Hero.tsx, src/components/home/HomeProductCard.tsx, docs/DESIGN.md, tasks/feature-home-layout-alignment/phase-1-task-02.md]
filesNew: []
evidence:
  reportPath: .context/review-reports/feature-home-layout-alignment-phase-1-task-02-round-2-review.md
  round: 2
  verdict: PASS
next: "spec-validator phase 1 → close-out CR-040 → push"
loopSignal: none
approvals: ["2026-10-19 user duyệt plan CR-040 (\"thấy nào ổn thì chọn đi\") → khung 1280 giữ token, hero stage 1440, cao ≤ 662px"]
batchQueue: [phase-1-task-02]
```


## Notes / WIP reasoning
- Task 01 done (96afa0a). Task 02 thêm F1 (HomeProductCard sizes 508 → 600).

## History
- 2026-10-19 ▶ START [agent: builder] phase-1-task-02 (running)
- builder DONE: typecheck/lint PASS, test 196/199 (fail môi trường cũ), docker build PASS; DOM: h1 lệch 0px, ảnh > 1440 kết thúc (W+1440)/2, panel không đè chữ, không tràn ngang; h1 cap 4.46rem (lệch nhẹ khỏi điều kiện "chỉ cap khi đè" — lý do cân đối) → ▶ START [agent: reviewer] round 1 (running)
- reviewer round 1 FAIL (MAJOR F1: motion-load-zoom scale 1.08 tràn ~54px ngoài stage > 1440, thiếu overflow-hidden) → ▶ START [agent: builder] attempt 2 (running)
- builder attempt 2 DONE: overflow-hidden stage; typecheck/lint/docker build PASS; đo bật animation 1440/1920/2560: ảnh clip đúng (W+1440)/2, 1440 không đổi → ▶ START [agent: reviewer] round 2 (running)
- reviewer round 2 PASS (NORMAL) → close-out task 02, commit
