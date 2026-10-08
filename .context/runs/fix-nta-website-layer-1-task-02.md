# Run Journal — fix/nta-website · layer-1-task-02

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: fix/nta-website
phaseTask: layer-1-task-02
step: fix
agent: builder
status: done                         # fix xong; chuyển reviewer round 2
attempt: 1
interrupted: false
updatedAt: 2026-10-09T00:40:00+07:00
filesTouched: [src/app/[locale]/layout.tsx, src/i18n/messages/en.json, src/i18n/messages/vi.json, tasks/nta-website/layer-1-task-02.md]
filesNew: [src/components/layout/Header.tsx, src/components/layout/Footer.tsx, src/components/layout/MobileNav.tsx, src/components/layout/LanguageToggle.tsx, src/i18n/navigation.ts]
evidence:
  reportPath: .context/review-reports/feature-nta-website-layer-1-task-02-round-1-review.md
  round: 1
  verdict: FAIL
next: "Builder fix 4 MAJOR + MINOR → verify → reviewer round 2"
loopSignal: none
approvals:
  - {gate: layer0_done, at: 2026-10-08T20:10:00+07:00, ok: true}
batchQueue: []
```

## Notes / WIP reasoning

- MAJOR: M1 `bg-background/85` opacity drop (raw var hex color) → header mất nền khi scroll; M2 nested `<a><button>` mọi CTA; M3 2 landmark `<main>` (layout + page.tsx); M4 thiếu key `nav.home`.
- Root: theme color định nghĩa bằng raw `var()` hex → Tailwind alpha modifier không sinh CSS. Fix gốc: chuyển palette sang `rgb(var(--x) / <alpha-value>)` hoặc dùng nền solid.
- MINOR: duration-250 invalid; hardcode z-index; icon/glyph; Header >50 dòng; logo touch <44; aria-label i18n; import trùng; social rel/target.

## History

- 2026-10-09T00:25:00+07:00 journal created (write-ahead builder fix attempt 1) — status=running
- 2026-10-09T00:40:00+07:00 fix DONE — 4 MAJOR + MINOR fixed; verify PASS. status=done.
