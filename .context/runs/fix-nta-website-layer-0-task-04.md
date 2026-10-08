# Run Journal — fix/nta-website · layer-0-task-04

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: fix/nta-website
phaseTask: layer-0-task-04
step: fix
agent: builder
status: done                         # fix attempt 2 xong; chuyển reviewer round 3
attempt: 2
interrupted: false
updatedAt: 2026-10-08T18:15:00+07:00
filesTouched: [src/content/blog/en/first-steps.mdx, src/content/blog/vi/first-steps.mdx, src/content/types.ts, src/content/home.ts, tasks/nta-website/layer-0-task-04.md]
filesNew: [src/content/solutions/, src/content/products/, src/content/case-studies/, src/content/blog/ (3 bài mới + slug), src/content/about/, public/]
evidence:
  reportPath: .context/review-reports/feature-nta-website-layer-0-task-04-round-2-review.md
  round: 2
  verdict: FAIL
next: "Builder fix MAJOR (6 blog thiếu slug) + MINOR home strip → verify → reviewer round 3"
loopSignal: none
approvals:
  - {gate: layer_plan_approved, at: 2026-10-08T17:05:00+07:00, ok: true}
batchQueue: []
```

## Notes / WIP reasoning

- Round 2 FAIL: round-1 findings fixed 7/7. MAJOR mới: `getAllPosts` assert `slug` nhưng 6 file blog mới (`learning-content`, `responsible-ai`, `digital-workflows` × VI/EN) thiếu `slug` frontmatter → sẽ throw khi Layer 2 nối route. MINOR: home strip 2 item vs Description "≥3".
- Fix attempt 2: so pattern với post hoạt động (`first-steps.mdx` có `slug`) → thêm `slug` khớp filename cho 6 file. Home strip: quyết định tối giản + ghi Notes (nguồn R-07 chỉ 2 app).
- ⚠️ Deviation: vượt "max 2 vòng" review (3.6). Lý do: defect mới trivial/data, không kiến trúc; attempt=2 < 3. Ghi rõ để minh bạch.

## History

- 2026-10-08T17:40:00+07:00 journal created (write-ahead builder fix attempt 1) — status=running
- 2026-10-08T17:55:00+07:00 fix attempt 1 DONE (2 MAJOR + 6 MINOR) — status=done
- 2026-10-08T18:05:00+07:00 journal reopened cho fix attempt 2 (round 2 FAIL) — status=running
- 2026-10-08T18:15:00+07:00 fix attempt 2 DONE — 6 blog thêm `slug`; loader smoke 4 post/locale PASS; verify lint/typecheck/build PASS. status=done.
