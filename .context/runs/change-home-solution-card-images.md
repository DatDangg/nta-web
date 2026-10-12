# Run Journal — change/home-solution-card-images · phase-1-task-01

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: change/home-solution-card-images
phaseTask: phase-1-task-01
step: done
agent: primary
status: done
attempt: 0
interrupted: false
updatedAt: 2026-10-12T15:35:00+07:00
filesTouched: [src/content/home.ts, src/components/cards/SolutionCard.tsx, .context/progress.json]
filesNew:
  - public/images/illustrations/home-enterprise.jpg
  - public/images/illustrations/home-ai.jpg
  - public/images/illustrations/home-apps.jpg
  - spec/changes/archive/2026-10-12-home-solution-card-images.md
  - spec/updates/2026-10-12-home-solution-card-images.md
  - tasks/change-home-solution-card-images/phase-1-task-01.md
  - .context/review-reports/change-home-solution-card-images-phase-1-task-01-round-1-review.md
  - .context/runs/change-home-solution-card-images.md
evidence:
  reportPath: .context/review-reports/change-home-solution-card-images-phase-1-task-01-round-1-review.md
  round: 1
  verdict: PASS
next: "DONE — commit (chỉ file thuộc change này). KHÔNG push."
loopSignal: none
approvals: []
batchQueue: []
```

## Build/verify evidence (primary chạy thật)

- `npm.cmd run lint` = 0 errors (1 warning pre-existing `src/components/mdx/index.tsx`, ngoài scope)
- `npm.cmd run typecheck` = PASS
- `npm.cmd run build` = PASS
- HTML build `.next/server/app/vi.html` + `en.html`: `home-enterprise.jpg`=1, `home-ai.jpg`=1, `home-apps.jpg`=1; `01-tong-quan.png`=0, `ai-analysis.svg`=0, `ai-apps.svg`=0.
- `/solutions/enterprise` + `/solutions/ai` HTML: khung `aspect-[16/10]` + ảnh `cardImage` + alt nguyên trạng.

## Notes / WIP reasoning

- Yêu cầu user: "3 ảnh đầu t gửi, thay lần lượt vào 3 ảnh theo thứ tự trong ảnh 3, bên cạnh đó cho vị trí nó bằng nhau đi, text thẳng hàng, cả thẻ cao bằng nhau luôn".
- 3 ảnh trích từ hội thoại (session `ses_ed0f73a3dffe6gqZ0Y6Sfz2gtF`, user seq=4, `files=4` = 3 minh hoạ + 1 screenshot). Copy vào `public/images/illustrations/home-{enterprise,ai,apps}.jpg` (557×390 / 555×390 / 554×390, ratio ~1.42).
- `change-request` subagent chạy chạm step limit → để lại 4 file spec (change/update/CHANGELOG/test-scope v17); primary tiếp quản: tạo task, sửa `home.ts` (vi+en) + `SolutionCard.tsx`, verify, reviewer NORMAL PASS, progress, commit.
- ⚠️ Trong lượt này có **session/agent khác chạy song song** commit `eff61dd` (hairstyle) + `6ff88f7` (brand-logo-lockup, publish scope v18). Vì vậy `spec/test-scope/current.json` đang ở **v18** (sau change này). `spec/CHANGELOG.md` ĐÃ có dòng scope v17 của change này (nằm trong commit 6ff88f7). KHÔNG đụng lại 2 file này.
- Commit chỉ stage file thuộc change này; KHÔNG đụng dirty file của change khác (home hero-banner-restyle, home-footer, `public/images/home/`, `.next-build/`).

## History

- 2026-10-12T14:40:00+07:00 journal created (write-ahead trước khi gọi agent change-request)
- 2026-10-12T15:35:00+07:00 primary tiếp quản + close-out: reviewer NORMAL PASS r1, verify thật, progress, commit
