# Run Journal — builder/nta-website · layer-4-task-01

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: builder/nta-website
phaseTask: layer-4-task-01
step: done
agent: null
status: done                          # task-01 close-out hoàn tất (progress + task DoD + commit 249d0c9)
attempt: 0
interrupted: false
updatedAt: 2026-10-09T22:55:00+07:00
filesTouched: [src/app/[locale]/about/page.tsx, src/app/[locale]/blog/[slug]/page.tsx, src/app/[locale]/blog/page.tsx, src/app/[locale]/case-studies/[slug]/page.tsx, src/app/[locale]/case-studies/page.tsx, src/app/[locale]/contact/page.tsx, src/app/[locale]/layout.tsx, src/app/[locale]/products/page.tsx, src/app/[locale]/solutions/ai/[slug]/page.tsx, src/app/[locale]/solutions/ai/page.tsx, src/app/[locale]/solutions/enterprise/[slug]/page.tsx, src/app/[locale]/solutions/enterprise/page.tsx, src/i18n/messages/en.json, src/i18n/messages/vi.json]
filesNew: [src/app/sitemap.ts, src/app/robots.ts, src/lib/seo/jsonld.ts, src/components/seo/JsonLd.tsx, public/llms.txt, public/images/og-default.png]
evidence:
  reportPath: .context/review-reports/feature-nta-website-layer-4-task-01-round-2-review.md
  round: 2
  verdict: PASS
  fix: "MAJOR-1 blog detail OG → bỏ override, dùng default raster og-default.png (og:type/site_name/locale không mất). MAJOR-2 gom domain về src/lib/seo.ts (BASE_URL + createLocaleAlternates/localizedPath), dùng cho mọi page + jsonld/sitemap/robots/layout; src grep còn 0 hardcode. MINOR-1 canonical mọi route, MINOR-2 case-study JSON-LD bỏ additionalType + inLanguage BCP-47, MINOR-5 hreflang home không trailing slash, MINOR-6 bỏ dead template. Verify: typecheck+lint+build PASS; 43 HTML canonical/og:type/og:site_name/og:locale/twitter/hreflang=3 đủ; title>60=0 desc>160=0; blog og:image raster; sitemap 42 URL; robots OK."
  verify: "primary ran lint (0 err, 1 pre-existing img warning) + typecheck + build PASS (43 static HTML). Audit: title>60=0, desc>160=0, static/list desc all 150-160, no double brand suffix. sitemap 42 URLs (no /api/*, no 404), robots allow-all + sitemap + no AI block, llms.txt present, og-default.png 1200x630. JSON-LD parse err 0; Org/WebSite all pages; BreadcrumbList all detail; Article (blog+case detail); ContactPage (contact)."
understand: "layer-4-task-01 = SEO sitemap/robots/JSON-LD/metadata audit + llms.txt (R-21, R-20, R-12; design §1.8)"
next: "DONE — close-out task-01 (progress + task DoD + commit) → task layer-4-task-02"
loopSignal: none
approvals:
  - {gate: layer0_done, at: 2026-10-08T20:10:00+07:00, ok: true}
  - {gate: layer1_done, at: 2026-10-09T07:00:00+07:00, ok: true}
  - {gate: layer2_done, at: 2026-10-09T18:05:00+07:00, ok: true}
  - {gate: layer3_done_unlock_layer4, at: 2026-10-09T22:05:00+07:00, ok: true}
batchQueue: []
```

## Notes / WIP reasoning

- Lần 2 builder subagent vẫn chưa hoàn tất audit metadata (tự báo incomplete). Primary tiếp quản phần còn thiếu (đúng ground truth đã đo):
  1. **Regression title double-suffix**: builder thêm `title.template '%s | NTA'` ở layout nhưng mọi page đã tự có `... | NTA` → title render `"... | NTA | NTA"`. Fix: bỏ template, layout title = plain string (TS `DefaultTemplateString` bắt buộc template nếu dùng object default). Verify 0 title >60, không double suffix.
  2. **Desc 150–160 cho static/list route** (design §1.8): sửa blog list, solutions enterprise/AI, products, case-studies list, contact (VI+EN) → tất cả 150–160.
  3. Giữ nguyên desc **detail** (blog/case/solution slug) vì lấy từ content và per-screen design (§1.8 global vs Screen 4/6/9/11) không mandate 150–160 — ghi residual.
- JSON-LD: builder thêm helper Organization/WebSite/Breadcrumb + component `JsonLd`; wire BreadcrumbList cho detail pages; Article (blog detail) + ContactPage (contact).
- Files builder tạo: sitemap.ts, robots.ts, jsonld.ts, JsonLd.tsx, llms.txt, og-default.png.
- Residual: detail-page desc <150 (content-derived); truthfullness của số liệu JSON-LD (logo dùng og-default); Sitemap chưa `lastModified`/priority (không bắt buộc).
- Doc impact: NO_DOC_IMPACT.

## History

- 2026-10-09T22:20:00+07:00 ▶ write-ahead builder — status=running (cancel sẽ redo builder).
- 2026-10-09T22:35:00+07:00 builder subagent round 1 incomplete (core artifacts, thiếu metadata audit + BreadcrumbList wiring) → primary follow-up builder round 2 → vẫn incomplete metadata audit.
- 2026-10-09T22:55:00+07:00 primary tự hoàn tất surgical fix (title template + desc 150–160 static routes) + verify toàn bộ (lint/typecheck/build + audit). status=awaiting → reviewer.
- 2026-10-09T23:10:00+07:00 reviewer r1 STRICT **FAIL** (MAJOR-1 blog OG SVG + shallow-merge mất og tag; MAJOR-2 bỏ helper chung/hardcode domain). Report `.context/review-reports/feature-nta-website-layer-4-task-01-round-1-review.md`.
- 2026-10-09T23:35:00+07:00 primary fix MAJOR-1 + MAJOR-2 (+ MINOR-1/2/4/5/6) và verify lại (typecheck/lint/build + audit 43 HTML). status=awaiting → reviewer r2.
- 2026-10-09T23:50:00+07:00 reviewer r2 STRICT **PASS** (2 MAJOR đóng, 5/6 MINOR đóng, 0 regression). Report `.context/review-reports/feature-nta-website-layer-4-task-01-round-2-review.md`. Primary áp dụng nốt MINOR mới (Article image → absolute URL) + rebuild PASS.
- 2026-10-09T23:55:00+07:00 close-out DONE — progress.json + task DoD + commit `249d0c9`. status=done → task layer-4-task-02.
