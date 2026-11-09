# Run Journal — feature/add-japanese-locale · phase-2-task-04

```yaml
workItem: feature/add-japanese-locale
phaseTask: phase-2-task-04
step: close-out
agent: change-request
status: done
attempt: 2
interrupted: false
updatedAt: 2026-11-09T18:45:00+07:00
filesTouched: ["src/components/layout/LanguageToggle.tsx", "src/app/[locale]/layout.tsx", src/app/globals.css]
filesNew: [.context/review-reports/cr-044-screens/, .context/runs/feature-add-japanese-locale-phase-2-task-04.md]
evidence: {reportPath: .context/review-reports/feature-add-japanese-locale-phase-2-task-04-round-2-review.md, round: 2, verdict: PASS, specValidation: .context/review-reports/feature-add-japanese-locale-phase-2-spec-validation.md (PASS có điều kiện G1)}
next: "P3-T01 builder (AI news vi/en/ja) — activeWorkItem phase-3-task-01 ready"
loopSignal: none
preExistingDirty: [.claude/launch.json, .context/review-reports/cr-041-screens/, spec/changes/2026-10-19-hero-wide-screen-backdrop.md]
```

## History

- 2026-11-09T16:10 change-request: ▶ START [agent: builder] P2-T04 — LanguageToggle VI·EN·JA + Noto Sans JP chỉ ở ja (cancel → redo bước này)
- 2026-11-09T16:30 ✅ DONE [agent: builder] P2-T04 — toggle loop routing.locales, Noto_Sans_JP preload:false variable chỉ gắn html khi ja, --font-sans thêm var(--font-noto-jp, Inter). Verify primary smoke PASS (xem evidence). Screens 768/1280 vi/en/ja → cr-044-screens/ (375 headless Edge không chính xác → kiểm live ở browser pane, không lưu file).
- 2026-11-09T16:45 ▶ START [agent: reviewer] STRICT round 1 (cancel → redo bước này)
- 2026-11-09T17:05 ✅ DONE [agent: reviewer] STRICT FAIL round 1 — F1 MAJOR: next/font Noto_Sans_JP trong root layout sinh CSS @font-face JP (~95KB, ~32KB gzip) render-blocking trên MỌI trang vi/en (R-22). F2 MINOR có sẵn (không preload Inter, next-font-manifest app rỗng) → backlog. Primary đã kill server cổng 3917 reviewer để lại.
- 2026-11-09T17:10 ▶ START [agent: builder] fix F1 attempt 2 (cancel → redo bước này)
- 2026-11-09T17:40 ✅ DONE [agent: builder] fix F1 attempt 2 — (a) dynamic import next/font FAIL (CSS JP vẫn link ở vi/en); (b) self-host: tools/fonts/build-noto-jp.mjs sinh public/fonts/noto-sans-jp/ (124 woff2 + noto-sans-jp.css, 5.7MB) từ output next/font; layout bỏ Noto_Sans_JP, render <link rel=stylesheet precedence> chỉ khi ja. Đo: /,/en 0 CSS chứa Noto; /ja có link trong head. typecheck/lint/build PASS, test 227/230 (fail có sẵn). Server :3917 đã đóng. Chưa thêm file LICENSE OFL.
- 2026-11-09T18:00 change-request: thêm public/fonts/noto-sans-jp/README.md (OFL-1.1 + URL nguồn; không có OFL.txt trên máy). ▶ START [agent: reviewer] STRICT round 2 (cancel → redo bước này)
- 2026-11-09T18:25 ✅ DONE [agent: reviewer] STRICT PASS round 2 — report round-2; MINOR N1 (rmSync xoá README), N2 (cache /fonts max-age=0), N3 (task scope ghi next/font → đã sửa task file), N4 (OFL.txt residual). Reviewer không chạy server (deny) → primary tự smoke HTTP :3927: vi/en 0 CSS Noto, ja 1; CSS text/css 200, woff2 font/woff2 200, Cache-Control public,max-age=0; toggle href + aria-current đúng; server PID 20132 đã kill.
- 2026-11-09T18:30 ▶ START [agent: spec-validator] phase 2 (cancel → redo bước này)
- 2026-11-09T18:40 ✅ DONE [agent: spec-validator] phase 2 PASS có điều kiện — G1 R-20a.6 ghi next/font vs self-host → P3-T02 (đã ghi vào phase-3-task-02.md); G2 commit P2-T04.
- 2026-11-09T18:45 close-out: task file verification, progress.json (P2-T04 done, activeWorkItem → phase-3-task-01 ready), commit.
