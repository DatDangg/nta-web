# Run Journal — builder/nta-website · layer-2-task-01

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: builder/nta-website
phaseTask: layer-2-task-01
step: builder
agent: builder
status: done                          # task-01 PASS r3
attempt: 0
interrupted: false
updatedAt: 2026-10-09T09:31:00+07:00
filesTouched: [src/i18n/messages/vi.json, src/i18n/messages/en.json, src/app/[locale]/page.tsx, .context/progress.json]
filesNew: [src/components/home/Hero.tsx, src/components/home/ProductStrip.tsx, src/components/home/CaseStudyHighlight.tsx, src/components/home/SolutionGridHome.tsx, src/components/home/HomeImage.tsx]
evidence:
  reportPath: null
  round: 0
  verdict: awaiting_review
  verify: "npm run lint PASS · npm run typecheck PASS · npm run build PASS (builder)"
next: "Chạy reviewer độc lập round 1 cho layer-2-task-01"
loopSignal: none
approvals:
  - {gate: layer0_done, at: 2026-10-08T20:10:00+07:00, ok: true}
  - {gate: layer1_done, at: 2026-10-09T07:00:00+07:00, ok: true}
batchQueue: []
```

## Notes / WIP reasoning

- Layer 2 đã unlock (user duyệt Layer 1 PASS). Task-01 = trang chủ `/` (Screen 1).
- Dependencies done: Layer 1 task-01..04 (tokens/shell/cards/Reveal), Layer 0 task-04 (content `src/content/home.ts`).
- Lưu ý khi consume content: `src/content/home.ts` EN hrefs đang pre-localized (`/en/...`) — Gap 6; đảm bảo không double-prefix khi render qua `next-intl` Link.
- R-03 = **≥2** ProductCard (đã ratify) — KHÔNG ≥3.

## History

- 2026-10-09T07:05:00+07:00 journal created (write-ahead trước khi gọi builder) — status=running
- 2026-10-09T08:00:00+07:00 builder implemented Screen 1, normalized EN content links, added image fallback and i18n; lint/typecheck/build PASS.
- 2026-10-09T08:15:00+07:00 user decision O1: omit metric (render qualitative). Builder step complete → next reviewer round 1.

## Builder summary

- Implemented the five homepage section families and localized home copy, with locale-specific static metadata/hreflang.
- Existing EN home content hrefs have `/en` stripped before passing to next-intl `Link`; route localization owns the prefix, preventing `/en/en/...`.
- Product strip uses the two actual products (R-03 minimum is ≥2); no fabricated case-study metric was added because both source case studies mark quantitative results as unconfirmed. This leaves the design's numeric case-result criterion unmet pending verified content.
- Empty product list returns no section; image load errors render the `surface-sunken` fallback. Exactly one image is marked priority (hero).
- `npm run lint`, `npm run typecheck`, `npm run build`: PASS. `test_command: null`; no tests configured. Oxlint config absent.
- Residual: no confirmed real numeric case-study result exists in content; no manual browser viewport verification. Reviewer to verify responsive behavior and keyboard strip navigation.
