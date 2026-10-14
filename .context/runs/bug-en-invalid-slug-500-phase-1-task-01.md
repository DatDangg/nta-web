# Run Journal — bug/en-invalid-slug-500 · phase-1-task-01

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: bug/en-invalid-slug-500
phaseTask: phase-1-task-01
step: done
agent: null
status: done
attempt: 1
interrupted: false
updatedAt: 2026-10-15T19:15:00Z
filesTouched: [src/app/[locale]/not-found.tsx, spec/changes/2026-10-14-en-dynamic-slug-not-found-500.md, spec/changes/2026-10-14-en-invalid-slug-500.md, spec/changes/BACKLOG.md, .context/progress.json]
filesNew: [src/app/[locale]/not-found.test.ts, tasks/bug-en-invalid-slug-500/phase-1-task-01.md]  # docs/content-bot/ + CR-030 change doc KHÔNG thuộc task này
evidence:
  reportPath: .context/review-reports/bug-en-invalid-slug-500-phase-1-task-01-round-2-review.md
  round: 2
  verdict: PASS
next: "none — CR-026 + CR-032 done"
loopSignal: none
approvals: [{gate: phase_plan, at: 2026-10-15, ok: true, note: "user: duyệt phương án A, title 404 = (a) \"404 | NTA\""}]
batchQueue: [CR-026 en-dynamic-slug-not-found-500, CR-032 en-invalid-slug-500]
```

## Notes / WIP reasoning

User 15/10/2026: "đóng CR01 và CR024, rồi bắt đầu CR026 và CR032". Gộp 2 CR vì cùng hiện tượng (/en/*/[slug] sai → 500, log requestLocale next-intl, static→dynamic headers).

## History

- 2026-10-15 journal created. ▶ START [agent: change-request] root cause + plan (cancel sẽ redo bước này).
- 2026-10-15 ✅ DONE [agent: change-request] root cause: not-found.tsx generateMetadata getTranslations → requestLocale → headers() trên route SSG en; tái hiện prod + local; phương án A, review NORMAL, không spec delta. Chờ duyệt.
- 2026-10-15 user duyệt A + title (a). ▶ START [agent: builder] (cancel sẽ redo bước này).
- 2026-10-15 ✅ DONE [agent: builder] not-found metadata tĩnh; test 102 pass; docker build PASS; smoke 36/36 file+db, 404→revalidate→200 OK. ▶ START [agent: reviewer] round 1 (cancel sẽ redo bước này).
- 2026-10-15 ✅ DONE [agent: reviewer] round 1 STRICT FAIL: MAJOR thiếu Repro Verification trong task file (code OK). ▶ START [agent: builder] fix doc evidence (cancel sẽ redo bước này).
- 2026-10-15 ✅ DONE [agent: builder] thêm Repro Verification + Verification Summary vào task file, code không đổi. ▶ START [agent: reviewer] round 2 (cancel sẽ redo bước này).
- 2026-10-15 ✅ DONE [agent: reviewer] round 2 FAST PASS. ▶ START [agent: spec-publisher] (cancel sẽ redo bước này).
- 2026-10-15 ✅ DONE [agent: spec-publisher] scope v50 (spec 4.2.1 không bump); CR-031 close-out dời v51+. progress cập nhật → commit.
- 2026-10-15 commit 44e29a4 pushed; deploy xong, smoke prod PASS (6 URL en 404, title 404 | NTA, noindex, vi 404, hợp lệ 200, 301 ok). Archive 2 change doc + BACKLOG done.
