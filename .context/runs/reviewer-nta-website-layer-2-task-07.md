# Run Journal — reviewer/nta-website · layer-2-task-07

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: reviewer/nta-website
phaseTask: layer-2-task-07
step: reviewer
agent: reviewer
status: done                       # round 2 (write-ahead) — builder fix MAJOR-1/2/3 + SSG rework xong
attempt: 0
interrupted: false
updatedAt: 2026-10-09T15:56:00+07:00
filesTouched: []
filesNew: [.context/review-reports/feature-nta-website-layer-2-task-07-round-1-review.md]
evidence:
  reportPath: .context/review-reports/feature-nta-website-layer-2-task-07-round-1-review.md
  round: 1
  verdict: FAIL
  verify: "reviewer ran lint/typecheck/build PASS (43 SSG); MAJOR-1 pagination bỏ qua ?page=; MAJOR-2 ShareBar đọc window khi render; MAJOR-3 thiếu metadataBase"
next: "reviewer round 2 (independent) verify 3 MAJOR fixed + SSG restored + MINOR"
loopSignal: none
approvals:
  - {gate: layer0_done, at: 2026-10-08T20:10:00+07:00, ok: true}
  - {gate: layer1_done, at: 2026-10-09T07:00:00+07:00, ok: true}
batchQueue: []
```

## Notes / WIP reasoning

- Task: Blog list (Screen 10) + MDX detail (Screen 11). Expected NORMAL; **STRICT nếu MDX render qua `dangerouslySetInnerHTML` không sanitize** (thực tế dùng next-mdx-remote/rsc → không phải).
- Check: list SSG có content (không client-only như task-06), grid bp, `<time>` theo locale, pagination (ẩn ≤9); detail MDX render (heading h2, list, ảnh, link), prose ≤720px; ShareBar 3 nút aria-label + copy toast `role="status"`; slug sai → 404; empty copy; metadata + canonical + hreflang + JSON-LD Article (không bịa field); RelatedPosts cùng category loại self; single `<main>`; i18n-only; Gap 6; anti-slop; lint warning `<img>`.

## History

- 2026-10-09T14:21:00+07:00 journal created (write-ahead trước khi gọi reviewer) — status=running
- 2026-10-09T15:56:00+07:00 ▶ round 2 write-ahead (builder fix MAJOR-1/2/3 + SSG rework xong; fix journal status=awaiting) — status=running
