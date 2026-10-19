# Run Journal — feature/home-layout-alignment · phase-1-task-01

```yaml
workItem: feature/home-layout-alignment
phaseTask: phase-1-task-01
step: ready
agent: change-request
status: awaiting
attempt: 0
interrupted: false
updatedAt: 2026-10-19T10:30:00+07:00
filesTouched: [spec/changes/BACKLOG.md, .context/progress.json, SPECIFICATIONS.md, spec/CHANGELOG.md, spec/test-scope/current.json, .context/design-spec.md]
filesNew: [spec/changes/2026-10-19-home-layout-alignment.md, spec/updates/2026-10-19-home-layout-alignment.md, tasks/feature-home-layout-alignment/phase-1-task-01.md, tasks/feature-home-layout-alignment/phase-1-task-02.md, .context/runs/feature-home-layout-alignment-phase-1-task-01.md]
evidence:
  reportPath: null
  round: 0
  verdict: null
next: "⏸ chờ user duyệt plan CR-040 (khung 1280 vs 1440, hero stage 1440) → builder phase-1-task-01"
loopSignal: none
approvals: []
batchQueue: [phase-1-task-01, phase-1-task-02]
```

## Notes / WIP reasoning
- Classify MODIFY (UI-only, layout/spacing), risk LOW–MEDIUM: đụng component dùng chung? — KHÔNG đổi `Container`/token
  (phương án khuyến nghị); chỉ 3 component trang chủ. Phương án thay thế (token 1440) mới đụng toàn site → STRICT.
- Đo bằng đọc code (không chạy dev server). Công thức Container: content-left = (W−1280)/2 + 32 khi W ≥ 1280.
  1440: Container 112–1328 · Solutions 52–1388 (Δ−60) · Products 200–1240 (Δ+88) · Hero ảnh 95–1440 (dính mép phải).
  1920: Container 352–1568 · Solutions 292–1628 · Products 440–1480 · Hero ảnh 255–1920, panel phải tới x≈1878.
  Tỉ lệ lệch trong ảnh user (−15 / +22 so với Hero) khớp −60 / +88 × 0,25 (ảnh chụp bị thu nhỏ) → xác nhận nguyên nhân.
- Dưới 1280 Solutions = Container (1400 không chặn); Products chỉ lệch khi W > 1104 (lúc content > 1040).
- Header: link logo `px-2` → chữ logo lùi +8px so với mép content (lệch nhỏ, sửa trong task 01).

## History
- 2026-10-19 journal created — BACKLOG CR-040 in_progress; classify MODIFY; spec delta R-01b → 4.8.0; spec/updates + CHANGELOG +
  test-scope v58; design-spec §Screen 1 ghi rule khung chung; task 01 (khung chung) + task 02 (hero stage) soạn. Chưa gọi builder.
