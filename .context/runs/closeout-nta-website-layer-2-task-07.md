# Run Journal — closeout/nta-website · layer-2-task-07

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: closeout/nta-website
phaseTask: layer-2-task-07
step: closeout
agent: primary
status: done                          # close-out hoàn tất: progress updated + commit ef7d3bb
attempt: 0
interrupted: false
updatedAt: 2026-10-09T16:12:00+07:00
filesTouched: [.context/progress.json, .context/error-memory.md, tasks/nta-website/layer-2-task-07.md, src/i18n/messages/vi.json, src/i18n/messages/en.json, src/lib/content/render-mdx.tsx, src/app/[locale]/layout.tsx]
filesNew: [src/app/[locale]/blog/page.tsx, src/app/[locale]/blog/[slug]/page.tsx, src/components/blog/ArticleHeader.tsx, src/components/blog/ShareBar.tsx, src/components/blog/RelatedPosts.tsx, src/components/blog/BlogFilter.tsx, src/components/mdx/index.tsx]
evidence:
  reportPath: .context/review-reports/feature-nta-website-layer-2-task-07-round-2-review.md
  round: 2
  verdict: PASS
  verify: "reviewer r2: lint PASS (1 warning <img>) · typecheck PASS · build PASS; /vi/blog + /en/blog trong prerender-manifest (SSG); pageUrl nonempty; og:image https://ntasolution.vn; primary tự verify manifest + blog.html slugs"
next: "commit close-out → layer-2 phase review (spec-validator) tại checkpoint hết layer"
loopSignal: none
approvals:
  - {gate: layer0_done, at: 2026-10-08T20:10:00+07:00, ok: true}
  - {gate: layer1_done, at: 2026-10-09T07:00:00+07:00, ok: true}
batchQueue: []
```

## Notes / WIP reasoning

- Doc Impact: **NO_DOC_IMPACT** — Screens 10–11, R-09/R-16/R-21/R-24; không đổi API contract/schema/behavior tài liệu hoá.
- Reviewer r1 FAIL (3 MAJOR: pagination không cài; ShareBar đọc window khi render; thiếu metadataBase) → builder fix.
  Builder fix lần 1 gây **regression SSG** (server `searchParams` → `/blog` rớt prerender-manifest) → rework #2 theo pattern task-06 (Suspense fallback server + `BlogFilter` client) → r2 PASS STRICT.
- Error-memory **Error 5** added (server `searchParams` opt-out khỏi SSG — mặt trái của Error 4).
- Deferred (MINOR, non-blocking): MINOR-4 `<img>` MDX aspect-ratio; MINOR-8 description dài; MINOR-9 BlogFilter nhận cả `body` (payload); MINOR-10 origin/PAGE_SIZE hardcode trùng. Theo dõi cho Layer 4 (SEO/perf) hoặc change request.
- Next: sau commit → **hết Layer 2** → phase review bằng `spec-validator` (checkpoint, chờ user duyệt trước khi unlock Layer 3).

## History

- 2026-10-09T16:05:00+07:00 close-out write-ahead — status=running
- 2026-10-09T16:12:00+07:00 close-out done — progress.json (layer-2-task-07 done, STRICT PASS r2) + error-memory Error 5 + task file DoD cập nhật; commit `ef7d3bb` (20 files), KHÔNG push (main = forbidden_branch). next = hết Layer 2 → spec-validator phase review (checkpoint chờ user).
