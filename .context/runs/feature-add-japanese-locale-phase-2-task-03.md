# Run Journal — feature/add-japanese-locale · phase-2-task-03

```yaml
workItem: feature/add-japanese-locale
phaseTask: phase-2-task-03
step: done
agent: change-request
status: done
attempt: 1
interrupted: false
updatedAt: 2026-11-09T16:00:00+07:00
filesTouched: [next.config.ts, "src/app/[locale]/** (13 page + layout)", src/app/sitemap.ts, src/components/motion/ScrollTopButton.tsx, "src/i18n/messages/{vi,en,ja}.json", src/lib/api/contact-schema.ts, src/lib/api/contact-schema.test.ts, src/lib/content/slug.ts, src/lib/format/date.ts, src/lib/seo.ts, src/lib/seo.test.ts, src/lib/seo/jsonld.ts, tools/contact-mail/Code.gs, tools/contact-mail/code.test.ts]
filesNew: [.context/review-reports/feature-add-japanese-locale-phase-2-task-03-round-1-review.md, src/lib/seo/breadcrumb.ts, src/lib/format/date.test.ts, .context/runs/feature-add-japanese-locale-phase-2-task-03.md]
evidence: {reportPath: .context/review-reports/feature-add-japanese-locale-phase-2-task-03-round-1-review.md, round: 1, verdict: PASS, builder: "PASS typecheck/lint/build; test 227/230 (1 fail co san uploads, 2 skip); smoke file mode 15 route /ja 200 lang=ja, hreflang ja + x-default vi, slug sai 404"}
next: "builder P2-T04 (LanguageToggle VI·EN·JA + font). KHÔNG push chưa được yêu cầu"
loopSignal: none
preExistingDirty: [.claude/launch.json, .context/review-reports/cr-041-screens/, spec/changes/2026-10-19-hero-wide-screen-backdrop.md]
```

## History

- 2026-11-09T15:00 change-request: ▶ START [agent: builder] P2-T03 (cancel → redo bước này)
- 2026-11-09T15:35 ✅ DONE [agent: builder] P2-T03 — guard → isLocale(routing), breadcrumb helper + localeHref, metadata maps Record<Locale>, LANGUAGE_TAG/OG_LOCALE, availableLanguage routing.locales, date ja, contact locale ja, Code.gs ja, redirect R-08a.1 ja, sitemap chi phat alternate locale co that. Verify primary: typecheck/lint/build PASS, test 227/230 (fail co san), curl PASS.
- 2026-11-09T15:40 ▶ START [agent: reviewer] STRICT round 1 (cancel → redo bước này)
- 2026-11-09T16:00 ✅ DONE [agent: reviewer] STRICT PASS round 1 (4 MINOR, không chặn). Close-out + commit P2-T03 (không push).
