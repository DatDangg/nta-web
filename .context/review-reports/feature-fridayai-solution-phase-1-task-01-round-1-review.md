Agent: reviewer

# Review — feature-fridayai-solution · phase 1 · task 01 · round 1

- Task: `tasks/feature-fridayai-solution/phase-1-task-01.md` (CR-011) · Spec: R-06 / R-06e (3.7.0)
- Review level: NORMAL
- Reason: additive content (2 MDX + images) + small modification of shared `ShowcaseCTA` (used by all showcase pages); no auth/API/schema/data.
- Blast radius: `/solutions/ai`, `/solutions/ai/fridayai` (+ `/en`), mega menu + sitemap (via `aiSlugs`), CTA block of every showcase page (internal hrefs still go through i18n `Link`).

## Verify commands + result
- `bash tools/linux-build.sh verify` (re-run by reviewer): typecheck PASS · lint PASS (1 pre-existing warning `<img>` in `src/components/mdx/index.tsx`, outside scope) · build PASS.

## Acceptance check
| AC | Result | Evidence |
|---|---|---|
| Card on `/solutions/ai` vi+en with image/description/chips | OK | `listings.ts` `listingItems.{vi,en}.fridayai`, `cardImage` in both MDX; icon `plug` and theme `rose` exist (`icons.tsx:44`, `themes.ts:5`) |
| Detail page uses shared showcase frame (hero/features/benefits/FAQ/CTA) | OK | `showcase` block complete in both MDX; frontmatter keys match `types.ts` (optional `sections/faq/screenshots` omitted, as in custom-ai) |
| No hard-coded prices/promotions in text | OK | Plans listed by name only; "Bảng giá ... cập nhật tại fridayaix.com"; screenshot caption warns prices may have changed |
| CTA to fridayaix.com new tab; internal CTAs unchanged | OK | `ShowcaseCTA.tsx:13,26-36` regex `^https?://` → `<a target="_blank" rel="noopener noreferrer">`, else `Link`; hero already handles external (`ShowcaseHero.tsx:24-25`) |
| Mega menu + sitemap auto | OK | `slug.ts:4` `aiSlugs` += `fridayai` |
| Images alt + source caption | OK | alt on cardImage, hero, both photos (vi/en); captions "Ảnh chụp từ website fridayaix.com" |
| VI/EN parity | OK | Both files 144 lines, identical structure/keys/values (locale number formats 99,97% / 99.97%) |

Spec: SPECIFICATIONS.md R-06 + R-06e, CHANGELOG 3.7.0 consistent with implementation.

## Responsive Checklist Gate
Diff touches UI only via content + one conditional element swap in `ShowcaseCTA` (same classes for `<a>` and `Link`).
- Layout: OK — no new layout CSS; reuses existing showcase components.
- Typography/Spacing: OK — unchanged.
- Media: OK — images rendered by existing components with declared width/height (1030×470) and `ratio: 2.191` (=1030/470).
- Touch/Interaction: OK — same `buttonStyles('inverse','lg')`.
- Viewport/A11y: OK/N/A — no vh/motion changes.
Residual risk: no browser run by reviewer; verified by code reading + builder smoke evidence.

## Skill gates
- aislop: skip, aislop not installed. Manual: no dead code / swallowed errors; one WHY comment in ShowcaseCTA (acceptable).
- oxlint (anti-slop): skip, oxlint not configured.
- ocr: skip, ocr not installed.
- AI-readable: OK — 0 indicators (clear names `isExternal`, `buttonClass`; small diff).
- ai-friendly-web: N/A for this task (no change to robots/llms/sitemap mechanism; sitemap auto-includes new slug).
- blitzstrike: N/A (no endpoint/input).
- Security: external hrefs are static frontmatter, `rel="noopener noreferrer"` present; SVG logos contain no `<script>`/event handlers/external hrefs.

## Findings
- [MINOR] `public/images/solutions/fridayai/logo-wordmark.svg` — added but not referenced anywhere in `src/` (unused asset). Fix: use it or drop it from the commit.
- [MINOR] `src/content/solutions/{vi,en}/fridayai.mdx:29-30,136` — "độ trễ trung bình (P95)" / "average latency (P95)" mixes mean and P95 percentile; reword (e.g. "độ trễ P95 dưới 180ms") or keep exactly the source wording. Uptime "99,97% trong 30 ngày gần nhất" (stats `:57`) is a time-varying figure frozen in content; acceptable with "theo số liệu FridayAI" but consider dropping "30 ngày gần nhất" or dating it.
- [MINOR] `src/components/case-studies/showcase/ShowcaseCTA.tsx:27` — external `target="_blank"` link has no "opens in new tab" hint for screen readers; consistent with existing pattern in repo (ShowcaseHero, Footer), so out of scope — suggest separate task.

No CRITICAL / MAJOR.

## Verdict
✅ PASS
