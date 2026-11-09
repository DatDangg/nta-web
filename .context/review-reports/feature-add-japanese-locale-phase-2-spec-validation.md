Agent: spec-validator

# Phase Review — feature-add-japanese-locale · phase 2 (CR-044)

- **Mode:** Phase review (sau khi các task phase 2 PASS review)
- **Ngày:** 2026-11-09
- **Nguồn đối chiếu:** `SPECIFICATIONS.md` R-20a (4.12.0, dòng 541-570), R-22 (dòng 574); `spec/updates/2026-11-09-add-japanese-locale.md`;
  change doc `spec/changes/2026-11-09-add-japanese-locale.md`; `spec/test-scope/current.json` (scopeVersion 62);
  task `tasks/feature-add-japanese-locale/phase-2-task-0{1..4}.md`, `phase-3-task-02.md`; review reports P2-T01..T03 round 1, P2-T04 round 1 (FAIL) + round 2 (PASS);
  pre-plan `.context/review-reports/feature-add-japanese-locale-spec-validation.md`.
- **Implementation:** commit `453f3d5` (P2-T01), `8db8bae` (P2-T02), `f6ff288` (P2-T03); P2-T04 **chưa commit** (diff đĩa: `src/components/layout/LanguageToggle.tsx`,
  `src/app/[locale]/layout.tsx`, `src/app/globals.css`, mới `public/fonts/noto-sans-jp/` 124 woff2 + css + README, `tools/fonts/build-noto-jp.mjs`).
- Validator chỉ đọc (git log/show/diff/status + Grep/Read); không chạy server, không chạy verify command (dựa vào evidence reviewer).

## Verdict: ✅ COMPLETE (PASS) — có điều kiện close-out

Mọi điểm R-20a thuộc phase 2 đã có implementation + evidence review PASS. Không có MISSING. Có 1 PARTIAL dạng lệch câu chữ spec (font self-host
vs `next/font`) — đúng intent, phải reconcile ở P3-T02; và điều kiện: P2-T04 phải close-out + commit trước khi coi phase 2 đóng.

## Coverage matrix (R-20a ↔ task ↔ implementation)

| # | Requirement | Task | Evidence | Status |
|---|---|---|---|---|
| R-20a.1 | Routing `/ja/...` mọi trang, guard theo `routing.locales`, redirect 301 R-08a.1 có ja, vi không prefix | P2-T02, P2-T03 | `src/i18n/routing.ts` (8db8bae); page guard `isLocale` + `next.config.ts` redirect ja (f6ff288); grep `src/` không còn `locale !== 'vi'` / `'vi' \| 'en'` trong code (chỉ còn trong test fallback); review P2-T03 PASS | ✅ |
| R-20a.2 | Fallback en theo từng bản ghi (DB + file), registry/company_info thiếu → en, không 404/500, cảnh báo ≤1 lần | P2-T02 | `src/lib/content/locale-fallback.ts` + test, `store.ts`, `registry.ts`, `load-mdx.ts`, `company-contact.ts`, `tools/db/file-source.ts` + `tools/db/locale-fallback.test.ts`; review P2-T02 PASS | ✅ |
| R-20a.3 | `ja.json` đủ key như `en.json` + test parity vi/en/ja; db mode gộp ui_messages ja | P2-T01, P2-T02 | `src/i18n/messages/ja.json` (283 lá), `src/i18n/messages.test.ts`; `src/i18n/request.ts` (8db8bae); review P2-T01 PASS (MINOR dịch thuật → soát) | ✅ |
| R-20a.4 | Toggle VI · EN · JA (header desktop + drawer mobile), giữ path/slug, `aria-current`, ≥44px | P2-T04 | `LanguageToggle.tsx` map `routing.locales`, `href={pathname}`, `min-h-11 min-w-11`, dùng ở `Header.tsx:93`, `MobileNav.tsx:44`, `Footer.tsx:183`; review r1 live (`/en/about`→`/ja/about`, blog slug) + r2 PASS | ✅ (chưa commit) |
| R-20a.5 | Sitemap alternates vi/en/ja, hreflang + `x-default`=vi, `og:locale` ja_JP, JSON-LD `availableLanguage` ja, ngày `ja-JP` | P2-T02, P2-T03 | `src/app/sitemap.ts`, `src/lib/seo.ts`(+test), `src/lib/seo/jsonld.ts`, `src/lib/seo/breadcrumb.ts`, `src/lib/format/date.ts`(+test); review P2-T03 PASS (x-default bỏ khi path không có vi — hợp lệ) | ✅ |
| R-20a.6 | Font Noto Sans JP chỉ ở ja, vi/en không tải font JP, LCP R-22 giữ | P2-T04 | `layout.tsx` link CSS chỉ khi `locale === 'ja'`; `globals.css` `var(--font-noto-jp, Inter)`; review r2: grep `.next/static/**` 0 file chứa `Noto Sans JP` | ⚠️ PARTIAL — xem G1 (lệch câu chữ `next/font`) |
| R-20a.7 | Chữ chọn theo locale (skip-link, ScrollTop, title chi tiết sản phẩm/giải pháp DN) có ja | P2-T03 | `layout.tsx`, `ScrollTopButton.tsx`, `products/[slug]`, `solutions/enterprise/[slug]` (f6ff288); review P2-T03 PASS | ✅ |
| R-20a.8 | Form liên hệ `locale` nhận ja + `tools/contact-mail` | P2-T03 | `src/lib/api/contact-schema.ts`(+test), `tools/contact-mail/Code.gs`(+test) | ✅ (thứ tự deploy → P3-T02) |
| R-20a.9 / .10 | DB CHECK, CONTENT_LOCALES, I-6, `--alt-ja`, SEED_LOCALES, parity bỏ qua ja | P1-T01 (ngoài phạm vi phase 2) | `b2caf09`, review P1-T01 PASS | n/a phase 2 |
| R-20a.11 | Nội dung ja do bot seed sau deploy, docs bot | sau deploy / P3-T02 | — | ⏭ deferred |
| R-09c (sửa) | AI news tuần sinh vi/en/ja | P3-T01 | — | ⏭ deferred |
| Doc reconcile | `docs/API_SPEC.md` (locale vi\|en còn cũ), `docs/ERD.md`, `docs/DESIGN.md`, `docs/content-bot/`, runbook rollout | P3-T02 | — | ⏭ deferred |
| R-22 | vi/en không tải font JP, LCP không tệ hơn | P2-T04 | CSS chung về baseline (0 chunk JP); LCP không đo live | ✅ (residual R2) |
| test-scope v62 | Cases toggle/font/LCP (`current.json` dòng 26-27, 35, 49, 64) | — | khớp hướng implementation | ✅ |

## Gaps

- **G1 [PARTIAL — doc/spec drift, không chặn phase 2]** R-20a.6 (`SPECIFICATIONS.md:556`) ghi "qua `next/font` **Noto Sans JP**"; implementation
  self-host tĩnh (`public/fonts/noto-sans-jp/`, sinh bởi `tools/fonts/build-noto-jp.mjs`, link có điều kiện ở ja) vì `next/font` đưa ~95KB @font-face JP
  vào CSS chung render-blocking của vi/en (P2-T04 r1 F1 MAJOR). Intent của R-20a.6 ("chỉ ở ja, vi/en không tải font JP, LCP R-22 giữ") được thoả tốt hơn.
  **Cần ghi vào spec/doc ở P3-T02 — CÓ:** (a) sửa câu chữ R-20a.6 thành "self-host Noto Sans JP (subset unicode-range, `font-display: swap`), CSS chỉ
  link ở trang ja" — đây là chi tiết kỹ thuật trong cùng CR-044, ghi kèm `spec/updates/2026-11-09-add-japanese-locale.md` + `spec/CHANGELOG.md`
  (patch note, không bump intent; nếu primary coi R-20a là intent thì hỏi user xác nhận 1 dòng); (b) `docs/DESIGN.md` (current-state: cơ chế font JP,
  cách tái tạo, giấy phép OFL); (c) task file P2-T04 Scope 2 còn ghi `next/font/google` (reviewer N3) → sửa ở close-out P2-T04. Thêm G1 vào Blast radius/Scope của `tasks/feature-add-japanese-locale/phase-3-task-02.md` (hiện chưa liệt kê font).
- **G2 [điều kiện close-out]** P2-T04 chưa commit: cần close-out (Verification summary, Doc impact → trỏ P3-T02) + cập nhật `progress.json` + commit 1 task
  (chỉ stage `LanguageToggle.tsx`, `layout.tsx`, `globals.css`, `public/fonts/noto-sans-jp/**`, `tools/fonts/build-noto-jp.mjs`, task file, run journal/report;
  KHÔNG gộp `.claude/launch.json`, `cr-041-screens/`, `spec/changes/2026-10-19-hero-wide-screen-backdrop.md`).

## Residual risk (không chặn, chuyển backlog / checklist P3-T02 trước deploy prod)
- **R1** Thiếu `public/fonts/noto-sans-jp/OFL.txt` + dòng copyright (OFL-1.1 §2) — nên thêm trước deploy prod (reviewer N4); kèm sửa `build-noto-jp.mjs` `rmSync` xoá README (N1).
- **R2** LCP vi/en/ja chưa đo live; HTTP evidence (HTML `/`, `/en`, `/ja`) chỉ có từ builder smoke, reviewer không chạy server. Nên smoke trên staging/prod sau deploy.
- **R3** `/fonts/*` cache mặc định `max-age=0` (N2) — chỉ ảnh hưởng ja; đề xuất `headers()` immutable cho woff2.
- **R4** Thứ tự deploy: user phải dán lại `tools/contact-mail/Code.gs` lên Apps Script trước khi mở ja (P2-T03 MINOR #2) — phải có trong runbook P3-T02.
- **R5** `ja.json` dịch máy — danh sách thuật ngữ cần soát (P2-T01 MINOR-2..5) chuyển bot/user.
- **R6** Test suite: 1 fail pre-existing `tools/db/content-rules.test.ts:29` (thiếu ảnh uploads local) — không liên quan CR-044.

## Deferred sang phase 3 (không phải gap)
- P3-T01: R-09c AI news sinh bản ja (vi/en/ja), publish-post validate 3 locale, smoke `/ja/blog/<slug>`.
- P3-T02: reconcile `docs/API_SPEC.md` (locale `vi|en|ja`), `docs/ERD.md` (CHECK 0002), `docs/DESIGN.md` (+ G1 font), `docs/content-bot/` key `(vi|en|ja)`, runbook rollout (backup → thử 0002 → dòng duyệt `HIGH_RISK_MIGRATION` → deploy → smoke `/ja` → dán Code.gs → báo bot seed → rebuild `nta-tools`).
- Sau deploy: R-20a.11 bot seed nội dung ja.

## Verdict reasoning
0 MISSING, 1 PARTIAL (drift câu chữ, intent đạt), 0 conflict HIGH. Tất cả task phase 2 có review PASS (P2-T04 qua round 2 sau khi fix F1 đúng root cause).
→ ✅ COMPLETE cho phase 2, điều kiện: G2 commit P2-T04; G1 + R1/R4 được đưa vào scope P3-T02.
