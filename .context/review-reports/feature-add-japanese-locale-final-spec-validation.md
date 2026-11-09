Agent: spec-validator

# Final Spec Validation — CR-044 feature-add-japanese-locale (thêm locale `ja`)

- **Mode:** Phase review tổng (toàn CR)
- **Ngày:** 2026-11-09
- **Nguồn đối chiếu:** `SPECIFICATIONS.md` R-20a.1–.11 (dòng 541-571, spec 4.12.0), R-09c bản ja (375-380), R-22; change doc
  `spec/changes/2026-11-09-add-japanese-locale.md` (Acceptance dòng 35-44, `status: in_progress`); `spec/test-scope/current.json` (4.12.0 / scopeVersion 62 / feature-update).
- **Implementation:** `3455f16` (intake + spec delta), `b2caf09` P1-T01, `453f3d5` P2-T01, `8db8bae` P2-T02, `f6ff288` P2-T03, `7013440` P2-T04, `2696f88` P3-T01;
  P3-T02 (doc reconcile + `next.config.ts` + `tools/fonts/build-noto-jp.mjs`) **chưa commit** (git diff).
- **Report tham chiếu:** pre-plan `feature-add-japanese-locale-spec-validation.md`; phase 2 `...-phase-2-spec-validation.md` (G1, R1-R5); phase 3
  `...-phase-3-spec-validation.md`; task review P1-T01 r1, P2-T01..T03 r1, P2-T04 r1 (FAIL F1) + r2 (PASS), P3-T01 r1 (PASS STRICT), P3-T02 r1 (PASS NORMAL).
- Validator chỉ đọc; không chạy server/verify command.

## Verdict: ✅ COMPLETE (implementation) — CR-044 chưa đủ điều kiện "done/archive" tới khi xong 2 điều kiện dưới

Mọi requirement R-20a.1–.10 và R-09c ja đã có code + test + review PASS; R-20a.11 phần repo (docs bot, runbook) đã xong, phần seed là bước user sau deploy (đúng spec).
0 MISSING. 1 gap intent mở (G1) chờ user. Điều kiện trước khi đóng change doc → `spec/changes/archive/` + BACKLOG done:
1. Commit P3-T02 (close-out).
2. User trả lời G1 (xác nhận câu chữ R-20a.6 mới → sửa spec qua spec-publish; hoặc giữ G1 ghi nhận mở trong change doc khi archive).
R-20a ghi "hiệu lực khi phase 1–3 PASS + migration chạy prod" → **hiệu lực production còn chờ rollout của user** (`docs/runbook/db.md` §10).

## Coverage matrix (requirement → task → evidence → status)

| # | Requirement | Task | Evidence | Status |
|---|---|---|---|---|
| R-20a.1 | Routing `/ja/...` mọi trang có `/en`, vi không prefix, redirect 301 R-08a.1 có ja, guard theo `routing.locales` | P2-T02, P2-T03 | `src/i18n/routing.ts:4` (8db8bae); page guard `isLocale` + `next.config.ts` redirect ja (f6ff288); review P2-T03 PASS | ✅ (200 live chưa đo trên prod — smoke trong runbook) |
| R-20a.2 | Fallback en theo từng bản ghi (DB + file), registry/company_info → en, không 404/500, cảnh báo ≤1 lần | P2-T02 | `src/lib/content/locale-fallback.ts:11` + test, `store.ts:49`, `registry.ts`, `tools/db/file-source.ts` + `locale-fallback.test.ts`; review P2-T02 PASS | ✅ |
| R-20a.3 | `ja.json` đủ key như `en.json`, test parity; db mode ui_messages ja gộp đè | P2-T01, P2-T02 | `src/i18n/messages/ja.json` (283 lá), `src/i18n/messages.test.ts`, `src/i18n/request.ts`; review P2-T01 PASS | ✅ (dịch máy — R-5) |
| R-20a.4 | Toggle VI · EN · JA desktop + drawer, giữ path, aria-current, ≥44px | P2-T04 | `LanguageToggle.tsx` (7013440) dùng ở `Header.tsx:93`, `MobileNav.tsx:44`; review P2-T04 r2 PASS | ✅ |
| R-20a.5 | Sitemap/hreflang vi/en/ja + x-default vi, og ja_JP, JSON-LD ja, ngày ja-JP | P2-T02, P2-T03 | `src/app/sitemap.ts`, `src/lib/seo.ts`, `src/lib/seo/jsonld.ts`, `src/lib/format/date.ts` (+test); review P2-T03 PASS | ✅ |
| R-20a.6 | Font Noto Sans JP chỉ ở ja, vi/en không tải font JP, LCP R-22 giữ — "qua `next/font`" | P2-T04, P3-T02 | `src/app/[locale]/layout.tsx:74` link CSS chỉ khi `locale === 'ja'`; `public/fonts/noto-sans-jp/` self-host; `next.config.ts` headers immutable woff2 (P3-T02); `.context/decisions.md:229-240`; `docs/DESIGN.md` | ⚠️ Intent đạt, **câu chữ lệch** — G1 open pending user |
| R-20a.7 | Chữ chọn theo locale (skip-link, ScrollTop, title chi tiết) có ja | P2-T03 | `layout.tsx`, `ScrollTopButton.tsx`, `products/[slug]`, `solutions/enterprise/[slug]` (f6ff288) | ✅ |
| R-20a.8 | Form liên hệ `locale` vi\|en\|ja + `tools/contact-mail` nhận ja | P2-T03 | `src/lib/api/contact-schema.ts:42`(+test), `tools/contact-mail/Code.gs:30,115`; `docs/API_SPEC.md:51,58` | ✅ code · ⏭ user dán Code.gs (`db.md:307`) |
| R-20a.9 | CHECK `IN ('vi','en','ja')` migration `drizzle/0002_*`, CONTENT_LOCALES, I-6, alt.ja, `--alt-ja`, I-1 chỉ vi/en, dòng duyệt HIGH_RISK, thử trên DB tạm | P1-T01, P3-T02 | `drizzle/0002_happy_magma.sql:2-3` (dòng duyệt approved 2026-11-09), `src/db/schema.ts:46,87`, `content-repo.ts:174`, `content-cli.ts:60,209`, gate `deploy/db/migration-gate.ts:10`; runbook thử `migrate-on-restore.sh` `db.md:311` | ✅ code · ⏭ chạy thử + migrate prod = user |
| R-20a.10 | SEED_LOCALES vs CONTENT_LOCALES, parity bỏ ja 2 chiều | P1-T01 | `tools/db/parity-check.ts:30,67`; review P1-T01 PASS | ✅ |
| R-20a.11 | Nội dung ja do bot seed sau deploy; `docs/content-bot/` key `(vi\|en\|ja)`; rebuild `nta-tools` | P3-T02 | diff `docs/content-bot/*` (11 file); `db.md:329` build `nta-tools`, seed slug_registry ja trước | ✅ repo · ⏭ seed = user/bot sau deploy |
| R-09c ja | 3 bài/tuần, title/excerpt/出典/画像/ghi chú cuối ja, alt ja, guard + dry-run 3 locale, commit 3 file, smoke `/ja/blog`, tuần cũ fallback en | P3-T01 | `tools/ai-news/generate.py:61,66,74,217,298-303`; `publish-post.ts:99-104,150-152`; `ai-news.yml:118,210,237`; review P3-T01 PASS STRICT | ✅ |
| R-22 | vi/en không tải font JP, LCP không tệ hơn | P2-T04 | review P2-T04 r2: 0 chunk `.next/static` chứa Noto Sans JP | ✅ (LCP live chưa đo — residual) |
| Doc reconcile | API_SPEC, ERD, DESIGN, content-bot, runbook db/ai-news, decisions | P3-T02 | git diff (21 file); review P3-T02 PASS, m1/m2 đã sửa | ✅ (chưa commit) |
| CD Acceptance 1-9 | Change doc dòng 36-44 | tất cả | tương ứng R-20a.1/.2/.3/.4/.5/.6/.9 + R-09c + verify PASS (typecheck/lint/build, test 1 fail baseline) | ✅ nội dung đạt; checkbox chưa tick, `status: in_progress` — cập nhật ở close-out CR |
| test-scope v62 | Cases toggle/font/LCP/routing/fallback/AI news ja | — | `spec/test-scope/current.json:2-5`; phase 3 không đổi behavior → không cần bump | ✅ (nếu G1 được xác nhận → spec-publish bump patch, cập nhật mô tả case font) |

## Gaps
- **G1 [OPEN — intent, pending user]** `SPECIFICATIONS.md:556` R-20a.6 "qua `next/font`" ≠ code self-host `public/fonts/noto-sans-jp/`. Câu đề xuất ở
  `tasks/feature-add-japanese-locale/phase-3-task-02.md` §"Gap pending user". Không phải lỗi task; intent R-20a.6 (chỉ ja, vi/en 0 byte font JP) được thoả.
  Cần user xác nhận → sửa SPECIFICATIONS.md + `spec/updates/` + `spec/CHANGELOG.md` (+ test-scope nếu case nhắc next/font) qua spec-publisher.
- **G2 [điều kiện close-out]** P3-T02 chưa commit (xem phase 3 report — không gộp `.claude/launch.json`, `cr-041-screens/`, `spec/changes/2026-10-19-hero-wide-screen-backdrop.md`).
- **G3 [close-out CR]** Change doc `status: in_progress`, Acceptance chưa tick; BACKLOG chưa done — xử lý sau G1/G2.

## Residual risk / bước của user (không chặn implementation)
- **R-1** `public/fonts/noto-sans-jp/OFL.txt` + copyright **chưa có** (Glob xác nhận) — user thêm trước deploy (`db.md:305`). Deploy prod khi thiếu = vi phạm OFL-1.1 §2.
- **R-2** Rollout prod chưa thực hiện: backup, thử 0002 trên DB tạm, dán Code.gs, push, kiểm CHECK, smoke `/ja/*`, rebuild `nta-tools`, bot seed ja — phải xong migration
  **trước cron AI news thứ 7** (`0 1 * * 6`); nếu không: đăng lẻ vi/en + smoke `/ja/blog` đỏ (tự lành khi chạy lại).
- **R-3** LCP vi/en/ja và HTTP 200 các route `/ja/*` chưa đo trên staging/prod; header cache font + build chỉ có evidence builder.
- **R-4** Python unittest (Docker) + test Postgres publish-post 3 locale chưa được reviewer chạy lại — cần CI/DB.
- **R-5** `ja.json` dịch máy — thuật ngữ cần bot/user soát (P2-T01 MINOR-2..5).
- **R-6** `BODY_MIN = 600` chung cho ja — theo dõi lượt cron đầu.
- **R-7** Rollback = revert cả dải commit CR-044 (`db.md:337`); sau revert `schema.ts` về CHECK hẹp trong khi DB ở 0002 — không chạy `drizzle-kit generate` khi đó.
- **R-8** Baseline test fail `tools/db/content-rules.test.ts:29` — không liên quan.

## Verdict reasoning
0 MISSING, 0 conflict HIGH, mọi task có review PASS (P2-T04 qua r2 đúng root cause). Lệch duy nhất là câu chữ intent R-20a.6 (G1), đã được ghi đúng quy trình
và không được phép tự sửa. → ✅ COMPLETE về implementation; CR-044 chỉ archive sau G2 (commit P3-T02) + quyết định G1 của user; hiệu lực prod sau rollout R-2.
