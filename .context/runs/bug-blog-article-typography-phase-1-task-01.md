# Run Journal — bug/blog-article-typography · phase-1-task-01

```yaml
workItem: bug/blog-article-typography
phaseTask: phase-1-task-01
step: done
agent: change-request
status: done
attempt: 0
interrupted: false
updatedAt: 2026-10-14T00:00:00+07:00
filesTouched: [spec/changes/BACKLOG.md, .context/progress.json, src/components/mdx/index.tsx, src/app/[locale]/blog/[slug]/page.tsx]
filesNew: [spec/changes/2026-10-14-blog-article-typography.md, tasks/bug-blog-article-typography/phase-1-task-01.md, .context/runs/bug-blog-article-typography-phase-1-task-01.md, .context/review-reports/bug-blog-article-typography-phase-1-task-01-round-1-review.md, .context/review-reports/bug-blog-article-typography-phase-1-task-01-round-2-review.md]
evidence:
  reportPath: .context/review-reports/bug-blog-article-typography-phase-1-task-01-round-2-review.md
  round: 2
  verdict: PASS
next: "commit + push origin main"
loopSignal: none
approvals: [{gate: phase_plan, at: 2026-10-14, ok: true, note: "phương án (b), h2=text-h3, không bump spec"}]
batchQueue: []
```

## Notes / WIP reasoning

- CR-023, class BUG (UI), scope Mức 1 (user chốt). Root cause: `page.tsx:49` dùng `prose*` nhưng không cài `@tailwindcss/typography` (`tailwind.config.ts:91` plugins rỗng, package.json không có) + preflight reset + `mdxComponents` thẻ trần.
- Phương án (a) cài plugin vs (b) className trong `src/components/mdx/index.tsx` (1 consumer). Khuyến nghị (b).
- Spec: không bump spec_version; close-out sinh test-scope trigger bug-fix (v45 → v46).

## History

- 2026-10-14 journal created — classify + root cause + task file; awaiting phase_plan checkpoint
- 2026-10-14 user duyệt plan (b) → START builder
- 2026-10-14 DONE builder: typecheck PASS, lint PASS (1 warn cũ), build BLOCKED native binding (env)
- 2026-10-14 START reviewer round 1
- 2026-10-14 DONE reviewer round 1: FAIL (B1 repro evidence thiếu, B2 build blocked; code không có CRITICAL/MAJOR)
- 2026-10-14 BLOCKED: build/dev không chạy được trong sandbox (@swc/core next-intl, DACL cache AppData\Local\swc). Không commit/push.
- 2026-10-14 unblock: build PASS + repro trình duyệt (phiên chính) → START reviewer round 2 (attempt giữ 0)
- 2026-10-14 DONE reviewer round 2: PASS (NORMAL) → START close-out
- 2026-10-14 DONE spec-publisher (scope v46) + design-spec as-built + archive + BACKLOG done → commit
