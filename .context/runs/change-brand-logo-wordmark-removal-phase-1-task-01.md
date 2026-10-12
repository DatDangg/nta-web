# Run Journal — change/brand-logo-wordmark-removal · phase-1-task-01

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: change/brand-logo-wordmark-removal
phaseTask: phase-1-task-01
step: done
agent: change-request
status: done
attempt: 0
interrupted: false
updatedAt: 2026-10-12T07:00:00+07:00
filesTouched: [src/components/layout/BrandLogo.tsx, spec/CHANGELOG.md, spec/test-scope/current.json, .context/progress.json, .context/design-spec.md]
filesNew: [spec/changes/archive/2026-10-12-brand-logo-wordmark-removal.md, spec/updates/2026-10-12-brand-logo-wordmark-removal.md, tasks/change-brand-logo-wordmark-removal/phase-1-task-01.md, .context/review-reports/change-brand-logo-wordmark-removal-phase-1-task-01-round-1-review.md, .context/review-reports/change-brand-logo-wordmark-removal-spec-validation.md]
evidence:
  reportPath: .context/review-reports/change-brand-logo-wordmark-removal-phase-1-task-01-round-1-review.md
  round: 1
  verdict: PASS
next: "DONE — commit 4d49f0b trên main (KHÔNG push, auto_push false). Không còn việc."
loopSignal: none
approvals: []
batchQueue: []
```

## Notes / WIP reasoning

- Yêu cầu user: "ở logo ấy, xóa chữ NTA đi, để mỗi cái kia thôi" → bỏ wordmark "NTA", giữ lại mark (glyph).
- Vị trí: `src/components/layout/BrandLogo.tsx` (render `logo-mark.png` + `<span>NTA</span>`), dùng chung Header + Footer.
- KHÔNG đụng asset (`logo-lockup.png` không được reference trong `src/`; `logo-square.png` icon-only cho JSON-LD).
- Có 1 change file pending KHÁC chưa liên quan: `spec/changes/2026-10-12-solution-card-real-images.md` (đang CHỜ user duyệt) → change-request chỉ xử lý request này, KHÔNG gộp.
- `Header.tsx` dirty sẵn (từ task trước) — tuyệt đối không đưa vào commit của change này.

## History

- 2026-10-12T06:00:00+07:00 journal created (write-ahead trước khi gọi agent change-request)
