# Run Journal — builder/nta-website · layer-4-task-02

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: builder/nta-website
phaseTask: layer-4-task-02
step: done
agent: null
status: done                          # task-02 close-out hoàn tất (progress + task DoD + commit)
attempt: 0
interrupted: false
updatedAt: 2026-10-10T00:15:00+07:00
filesTouched: [next.config.ts, src/app/[locale]/layout.tsx, src/components/mdx/index.tsx]
filesNew: []
evidence:
  reportPath: .context/review-reports/feature-nta-website-layer-4-task-02-round-1-review.md
  round: 1
  verdict: PASS
  verify: "primary ran lint (0 err/1 warning img fallback) + typecheck + build PASS. Font: 7 woff2 trong .next/static/media; CSS unicode-range Vietnamese subset (u+1ea0-1ef9...). Perf trace (browser.trace, next start :3100): /+en, /en/blog/first-steps, /solutions/enterprise/crm → 0 longTasks, 0 longTaskBlocking. Lighthouse perf KHÔNG đo được (tool không benchmark perf) → Blocked, không claim điểm."
understand: "layer-4-task-02 = Performance: next/image audit + font next/font (VI subset) + bundle + next.config image; mục tiêu LCP<2.5s/Lighthouse perf ≥90 (R-22/R-23)"
next: "DONE — close-out task-02 (progress + task DoD + commit) → task layer-4-task-03"
loopSignal: none
approvals:
  - {gate: layer0_done, at: 2026-10-08T20:10:00+07:00, ok: true}
  - {gate: layer1_done, at: 2026-10-09T07:00:00+07:00, ok: true}
  - {gate: layer2_done, at: 2026-10-09T18:05:00+07:00, ok: true}
  - {gate: layer3_done_unlock_layer4, at: 2026-10-09T22:05:00+07:00, ok: true}
batchQueue: []
```

## Notes / WIP reasoning

- Task-01 done (`92f5a92`). Task-02 = perf tuning (MODIFY, không đổi UI behavior), review NORMAL.
- Thay đổi (diff nhỏ, 3 file):
  1. `src/app/[locale]/layout.tsx`: `Inter` từ `next/font/google` (subsets latin+vietnamese, `display:'swap'`, `variable:'--font-inter'`, `preload:true`) + `<html className={inter.variable}>`. Build tải được font (network OK) → 7 WOFF2.
  2. `next.config.ts`: `images: { formats: ['image/avif','image/webp'] }` (không đổi hành vi SVG).
  3. `src/components/mdx/index.tsx`: `ArticleImage` dùng `next/image` khi có width/height số; fallback `<img loading=lazy decoding=async>` có comment lý do (markdown thiếu intrinsic size) — đây là raw `<img>` duy nhất và hợp lệ theo AC.
- Ảnh content đều SVG → next/image passthrough unoptimized, đã có width/height → CLS kiểm soát. Hero `priority`, ảnh dưới fold lazy, `sizes` khớp grid (đã đúng từ trước).
- ⚠️ Subagent builder đã tự ghi file journal này (vi phạm "subagent không ghi journal") → primary đã normalize lại; ghi nhận.
- ⚠️ Còn 1 server `next-server` cũ trên port 3000 (không phải của session này) — không đụng.
- Doc impact: NO_DOC_IMPACT.

## History

- 2026-10-09T23:58:00+07:00 ▶ write-ahead builder — status=running (cancel sẽ redo builder).
- 2026-10-10T00:10:00+07:00 builder xong (3 file; lint/typecheck/build PASS; 7 WOFF2; Lighthouse perf không đo được). Subagent tự ghi journal (vi phạm) → primary normalize.
- 2026-10-10T00:15:00+07:00 primary verify độc lập: build/lint/typecheck PASS; Vietnamese subset unicode-range OK; browser trace 3 trang = 0 longTasks. status=awaiting → reviewer r1.
- 2026-10-10T00:22:00+07:00 reviewer r1 STRICT **PASS** (0 CRITICAL/MAJOR, 3 MINOR non-blocking; Lighthouse perf accepted Blocked). Report `.context/review-reports/feature-nta-website-layer-4-task-02-round-1-review.md`.
- 2026-10-10T00:25:00+07:00 close-out DONE — progress + task DoD + commit. status=done → task layer-4-task-03.
