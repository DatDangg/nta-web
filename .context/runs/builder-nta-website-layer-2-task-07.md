# Run Journal — builder/nta-website · layer-2-task-07

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: builder/nta-website
phaseTask: layer-2-task-07
step: builder
agent: builder
status: awaiting                      # builder xong, chờ reviewer
attempt: 0
interrupted: false
updatedAt: 2026-10-09T14:20:00+07:00
filesTouched: [src/i18n/messages/vi.json, src/i18n/messages/en.json, src/lib/content/render-mdx.tsx]
filesNew: [src/app/[locale]/blog/page.tsx, src/app/[locale]/blog/[slug]/page.tsx, src/components/blog/ArticleHeader.tsx, src/components/blog/ShareBar.tsx, src/components/blog/RelatedPosts.tsx, src/components/mdx/index.tsx]
evidence:
  reportPath: null
  round: 0
  verdict: awaiting_review
  verify: "npm run lint PASS (1 warning <img> trong MDX mapping) · npm run typecheck PASS · npm run build PASS; blog list + post slugs SSG; HTML list có 4 post links"
understand: "layer-2-task-07 = Blog list + [slug] MDX detail (Screens 10-11)"
next: "Chạy reviewer độc lập round 1 cho layer-2-task-07"
loopSignal: none
approvals:
  - {gate: layer0_done, at: 2026-10-08T20:10:00+07:00, ok: true}
  - {gate: layer1_done, at: 2026-10-09T07:00:00+07:00, ok: true}
batchQueue: []
```

## Notes / WIP reasoning

- Deps done: Layer 1 task-02/03/04 (PostCard/PageHeader/Breadcrumb/Pagination/EmptyState), Layer 0 task-03 (MDX pipeline `src/lib/content/render-mdx.tsx` = next-mdx-remote/rsc) + task-04 (4 bài).
- MDX render SERVER-side qua `RenderMdx` (next-mdx-remote/rsc) — KHÔNG dangerouslySetInnerHTML; whitelist components (`src/components/mdx/index.tsx`).
- **Bài học task-06:** đảm bảo static HTML chứa list mặc định (không để content client-only qua useSearchParams); dùng Suspense fallback server-rendered nếu Pagination client.
- Date format theo locale: VI `08/10/2026`, EN `Oct 8, 2026`.
- RelatedPosts: cùng category, loại bài hiện tại; trống → ẩn. ShareBar copy-link → toast `role="status"`.
- Pagination pageSize 9; 4 bài → ẩn pagination (minimal policy).
- OQ#5: blog static MDX v1, không CMS. R-15 API động không làm v1.

## History

- 2026-10-09T13:58:00+07:00 journal created (write-ahead trước khi gọi builder) — status=running
- 2026-10-09T14:20:00+07:00 builder xong — list + MDX detail + 4 component + mdx mapping + 2 i18n + render-mdx nhận components; lint(1 warning)/typecheck/build PASS; blog SSG, HTML list có 4 link. status=awaiting → reviewer round 1.
