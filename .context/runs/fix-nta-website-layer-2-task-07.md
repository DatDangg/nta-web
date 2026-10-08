# Run Journal — fix/nta-website · layer-2-task-07

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: fix/nta-website
phaseTask: layer-2-task-07
step: fix
agent: builder
status: awaiting                      # builder fix-mode hoàn tất (SSG phục hồi) → chờ reviewer round 2
attempt: 1
interrupted: false
updatedAt: 2026-10-09T15:55:00+07:00
filesTouched: []
filesNew: []
evidence:
  reportPath: .context/review-reports/feature-nta-website-layer-2-task-07-round-1-review.md
  round: 1
  verdict: FAIL
next: "Builder fix 3 MAJOR + MINOR → reviewer round 2"
loopSignal: none
approvals:
  - {gate: layer0_done, at: 2026-10-08T20:10:00+07:00, ok: true}
  - {gate: layer1_done, at: 2026-10-09T07:00:00+07:00, ok: true}
batchQueue: []
```

## Notes / WIP reasoning

- MAJOR-1: `blog/page.tsx:44` hardcode `currentPage={1}`, không slice theo `?page=`. Fix: client list (như CaseStudyFilter) đọc `?page=`, slice pageSize 9, render grid + Pagination; page bọc Suspense fallback = page 1 server-rendered (SSG HTML có content). Giữ route SSG.
- MAJOR-2: `ShareBar.tsx:9` đọc `window` khi render → SSG href rỗng + hydration mismatch. Fix: nhận `pageUrl` (canonical absolute) từ server prop; href copy từ prop; copy dùng prop + try/catch.
- MAJOR-3: thiếu `metadataBase` → OG image = localhost. Fix: thêm `metadataBase` (env `NEXT_PUBLIC_SITE_URL`/`https://ntasolution.vn`) ở `[locale]/layout.tsx`.
- MINOR: MDX `img` → `next/image`; `aria-label` trên div role-less (thêm `role="group"`); bp grid theo design; bỏ param `locale` không dùng; list meta.

## History

- 2026-10-09T14:33:00+07:00 journal created (write-ahead trước khi gọi builder rework) — status=running
- 2026-10-09T14:34:00+07:00 ⛔ builder rework FAILED to start — provider **usage limit reached** (`tool.execution` error `ses_ee3aaef8bffeFnXtk8ya0r7Lyo`). KHÔNG có thay đổi nào được ghi (git status: chỉ có work của builder #1). Redo bước `fix` này ở session mới. `attempt` giữ 1 (không phải lỗi code).
- 2026-10-09T15:05:00+07:00 ▶ Session Start Protocol resume: workItem `feature/nta-website`, step `fix`/running → redo builder fix mode (đọc r1 report). Disk reconcile OK: dirty files == manifest builder #1, task-07 chưa commit, không nhiễm chéo. `usage()` tool không khả dụng → skip usage gate.
- 2026-10-09T15:20:00+07:00 builder fix-mode trả về: sửa xong MAJOR-1/2/3 + MINOR 4-8, lint/typecheck/build PASS. NHƯNG builder tự flag **regression SSG**: dùng server `searchParams` ở `blog/page.tsx` → `/vi/blog` + `/en/blog` KHÔNG còn trong `.next/prerender-manifest.json` (chỉ còn `[slug]`), `blog.html` biến mất (route table vẫn ghi ● nhưng manifest không có). Vi phạm R-16 (SSG) + task-06 lesson + reviewer "giữ route SSG". Primary verify trực tiếp (prerender-manifest + ls) → xác nhận regression.
- 2026-10-09T15:40:00+07:00 ▶ re-invoke `builder` (fix mode, attempt giữ 1 — correction cùng fix cycle): chuyển list sang pattern task-06 `CaseStudyFilter` (server Suspense fallback = grid page 1 + client component đọc `useSearchParams`).
- 2026-10-09T15:55:00+07:00 ✅ builder rework #2 xong. Primary verify: prerender-manifest có `/vi/blog` + `/en/blog`; `blog.html` chứa 4 slug; canonical EN `https://ntasolution.vn/en/blog`; lint/typecheck/build PASS. Files: `blog/page.tsx` (bỏ server searchParams) + `blog/BlogFilter.tsx` (mới, client). status=awaiting → reviewer round 2.
