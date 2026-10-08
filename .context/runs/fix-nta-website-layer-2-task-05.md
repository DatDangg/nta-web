# Run Journal — fix/nta-website · layer-2-task-05

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: fix/nta-website
phaseTask: layer-2-task-05
step: fix
agent: builder
status: done                          # fix xong; reviewer r2 PASS; close-out
attempt: 1
interrupted: false
updatedAt: 2026-10-09T12:46:00+07:00
filesTouched: [src/components/cards/AppCard.tsx, src/app/[locale]/products/page.tsx, src/components/products/ScreenshotCarousel.tsx, src/components/products/DownloadLinks.tsx, src/i18n/messages/vi.json, src/i18n/messages/en.json]
filesNew: []
evidence:
  reportPath: .context/review-reports/feature-nta-website-layer-2-task-05-round-1-review.md
  round: 1
  verdict: FAIL
  verify: "npm run lint PASS · npm run typecheck PASS · npm run build PASS (builder rework); /vi/products + /en/products SSG"
next: "Chạy reviewer round 2 cho layer-2-task-05"
loopSignal: none
approvals:
  - {gate: layer0_done, at: 2026-10-08T20:10:00+07:00, ok: true}
  - {gate: layer1_done, at: 2026-10-09T07:00:00+07:00, ok: true}
batchQueue: []
```

## Notes / WIP reasoning

- MAJOR-1 (ảnh trùng): `AppCard` render `screenshots[0]` + page nhét `ScreenshotCarousel` (gồm cả [0]) vào slot `downloadLinks` → trùng. Fix: thêm prop `media?: ReactNode` cho AppCard; khi có media → render media làm cột ảnh (NGOÀI content `<Link>`, giữ rule no-nested-interactive của layer-1); page truyền `media={<ScreenshotCarousel/>}` + `downloadLinks={<DownloadLinks/>}` tách riêng.
- MAJOR-2 (carousel nhiều ảnh): content layer-0 chỉ có 1 screenshot/sp → arrows không hiện. **Content gap** (mẫu placeholder), không phải lỗi code; carousel đúng khi 1 slide + dots. Ghi residual; nếu r2 vẫn FAIL → escalate user (thêm placeholder screenshots vs chấp nhận).
- MINOR: validate downloadUrl protocol; aria-roledescription i18n; heading AppCard h2 (page h1); sizes; JSON-LD (defer).
- AppCard chỉ được dùng ở `/products` (grep) → đổi shared component ít blast radius nhưng vẫn ghi rõ.

## History

- 2026-10-09T12:27:00+07:00 journal created (write-ahead trước khi gọi builder rework) — status=running
- 2026-10-09T12:36:00+07:00 fix xong — AppCard thêm `media` slot (media ngoài Link, h2); page tách media/downloadLinks (hết trùng); DownloadLinks validate http(s); aria-roledescription i18n; sizes 100/50/17vw. lint/typecheck/build PASS. status=awaiting → reviewer round 2.
