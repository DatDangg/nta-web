# Run Journal — fix/nta-website · layer-2-task-04

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: fix/nta-website
phaseTask: layer-2-task-04
step: fix
agent: builder
status: done                          # fix xong; reviewer r2 PASS; close-out
attempt: 1
interrupted: false
updatedAt: 2026-10-09T11:42:00+07:00
filesTouched: [src/app/[locale]/solutions/ai/page.tsx, src/app/[locale]/solutions/ai/[slug]/page.tsx, src/components/solutions/CaseStudyTeaser.tsx]
filesNew: []
evidence:
  reportPath: .context/review-reports/feature-nta-website-layer-2-task-04-round-1-review.md
  round: 1
  verdict: FAIL
  verify: "npm run lint PASS · npm run typecheck PASS · npm run build PASS (builder rework); AI overview + 6 detail route SSG"
next: "Chạy reviewer round 2 cho layer-2-task-04"
loopSignal: none
approvals:
  - {gate: layer0_done, at: 2026-10-08T20:10:00+07:00, ok: true}
  - {gate: layer1_done, at: 2026-10-09T07:00:00+07:00, ok: true}
batchQueue: []
```

## Notes / WIP reasoning

- MAJOR-1: `ai/page.tsx:44` order từ `readdir` chưa sort + `md:col-span-2` key theo slug `custom-ai` → order/2+1 không đảm bảo. Fix: sort theo `aiSlugs` + full-width theo position (index 2).
- MAJOR-2: `ai/[slug]/page.tsx:47` nested `<main>` trong layout `<main id="main">` → đổi thành `<div>` (theo enterprise sibling).
- MINOR-2: dùng `getAiStaticParams()` cho generateStaticParams (bỏ dead export). MINOR-3: teaser id dùng `useId`.
- Defer MINOR-1/4/5 (content/SEO: relatedCases rỗng, JSON-LD, CaseStudyLink image col).

## History

- 2026-10-09T11:25:00+07:00 journal created (write-ahead trước khi gọi builder rework) — status=running
- 2026-10-09T11:34:00+07:00 fix xong — sort theo aiSlugs + full-width theo index 2; `<main>`→`<div>`; dùng `getAiStaticParams()`; teaser id dùng `useId()`. lint/typecheck/build PASS. status=awaiting → reviewer round 2.
