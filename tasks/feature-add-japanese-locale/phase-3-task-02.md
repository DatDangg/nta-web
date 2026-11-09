# feature-add-japanese-locale · phase-3-task-02 — Doc reconcile + docs bot (vi|en|ja) + runbook rollout migration / nta-tools

- **CR:** CR-044 · change doc `spec/changes/2026-11-09-add-japanese-locale.md` · spec R-20a (4.12.0) · test-scope v62
- **Quyết định user (2026-11-09, không hỏi lại):** OQ-1 fallback **en** · OQ-2 dev dịch `ja.json` · OQ-3 AI news sinh cả ja · OQ-4 VI · EN · JA 3 nút liền.
- **Classification / Risk:** ADDITIVE · LOW (docs) — có hướng dẫn rollout migration prod
  - Expected review level: **NORMAL**
  - Blast radius: `docs/content-bot/*.md` (key `collection/(vi|en|ja)/slug`, collection cần seed ja, fallback en), `docs/API_SPEC.md`, `docs/ERD.md`, `docs/DESIGN.md`, `docs/runbook/db.md` (hoặc deploy runbook), `docs/runbook/ai-news.md` nếu còn thiếu.
  - Doc impact: chính task này (as-built). KHÔNG sửa intent docs (BRD/PRD) — lệch → ghi gap.
- **Deps:** P1-T01..P3-T01 PASS.

## Scope
1. Reconcile as-built docs theo code thật.
2. Runbook rollout: backup → restore DB tạm + chạy 0002 → user thêm dòng duyệt → push → deploy.yml (backup pre-migrate → gate → migrate → build/up → health) → smoke `/ja/...` → báo bot seed ja → rebuild image `nta-tools` (theo `docs/content-bot/10-server.md`) → user dán lại Apps Script `tools/contact-mail/Code.gs`.
3. Grep docs bot không còn `(vi|en)` lỗi thời.

## Acceptance
- Docs khớp code; checklist rollout đủ bước + rollback (0002 chỉ nới CHECK → không cần down migration; rollback = revert app, CHECK rộng hơn vô hại).

## Retry / Escalation
Max 3 attempt; fail lần 3 → `architecture_review_needed` (không fix #4). Mỗi failed attempt append `.context/error-memory.md`.

## Verification summary
- Acceptance criteria (builder, 2026-11-09):
  - Docs khớp code: PASS — `docs/content-bot/{00,01,03,04,05,06,07,08,09,10,README}`, `docs/API_SPEC.md`, `docs/ERD.md`, `docs/DESIGN.md`,
    `docs/runbook/{db,ai-news}.md` (evidence code: `src/i18n/routing.ts:4`, `src/db/schema.ts:46-53,87`, `drizzle/0002_happy_magma.sql`,
    `src/lib/content/locale-fallback.ts`, `src/lib/content/store.ts:49`, `src/lib/content/registry.ts` `getRegistrySlugs` đọc `vi`,
    `src/i18n/request.ts` (ui_messages ja → ja.json), `src/db/content-repo.ts:155,170-177` (I-3 cùng locale, I-1 bỏ ja),
    `src/lib/api/contact-schema.ts:42` + `src/lib/content/slug.ts:10`, `tools/contact-mail/Code.gs:30`, `deploy/db/migration-gate.ts:10`).
  - Runbook rollout: PASS — `docs/runbook/db.md` §10 "Rollout CR-044": checklist (OFL.txt, dán Code.gs, backup tay, chạy thử 0002 §5b), deploy.yml,
    kiểm migration/CHECK, smoke `/ja`, `/ja/blog`, `/ja/contact` + vi/en không có `noto-sans-jp`, rebuild `nta-tools`, bot seed ja (slug_registry trước),
    hạn chót trước cron `0 1 * * 6`; rollback = revert app, không down migration. Dòng duyệt HIGH_RISK_MIGRATION **đã có sẵn** ở `0002` (approved 2026-11-09 by Bruce) → runbook ghi "không cần thêm".
  - N1 PASS: `tools/fonts/build-noto-jp.mjs` chỉ xoá `*.woff2` + `noto-sans-jp.css`, giữ README.md/OFL.txt (không chạy lại script — cần build tạm next/font).
  - N2 PASS: `next.config.ts` `headers()` source `/fonts/noto-sans-jp/:file([0-9a-f]{16}\\.woff2)` (124/124 file khớp tên 16 hex).
  - Grep cuối `docs/content-bot docs/API_SPEC.md docs/ERD.md docs/DESIGN.md docs/runbook`: không còn `(vi|en)`; còn `{vi,en}` có lý do:
    cột nguồn file seed (`08` §2, ERD Collection — ja không có file seed, ghi chú ngay dưới), số đếm seed lịch sử 14/10 (`db.md` §8),
    sự cố w42 lịch sử (`ai-news.md` §180–325), cặp bắt buộc I-1 vi+en (đúng code).
- Verify commands + result (builder):
  - `npm run typecheck` PASS · `npm run lint` PASS (0 error, 1 warn có sẵn `src/components/mdx/index.tsx:26` no-img-element)
  - `npm test` 231 tests: 228 pass / 1 fail / 2 skip — fail = baseline có sẵn (content-rules "toàn bộ nội dung file … ảnh tồn tại", thiếu `/uploads`); test gate `0002` PASS
  - `SWC_NATIVE_BINDING_CACHE=… npm run build` PASS (exit 0)
  - `npx next start -p 3107` + curl (header thật):
    - `curl -sI /fonts/noto-sans-jp/00d49745793628af.woff2` → `HTTP/1.1 200 OK`, `Cache-Control: public, max-age=31536000, immutable`, `Content-Type: font/woff2`
    - `curl -sI /fonts/noto-sans-jp/noto-sans-jp.css` → `HTTP/1.1 200 OK`, `Cache-Control: public, max-age=0`, `Content-Type: text/css; charset=UTF-8`
    - `curl -sI /fonts/noto-sans-jp/README.md` → `200`, `Cache-Control: public, max-age=0`
    - server đã tắt sau khi đo.
- Reviewer verdict: **PASS** NORMAL round 1 — `.context/review-reports/feature-add-japanese-locale-phase-3-task-02-round-1-review.md` (0 BLOCKER/MAJOR; m1 + m2 MINOR đã sửa ở `docs/runbook/ai-news.md` "Dùng lại cho bài khác" + `docs/runbook/db.md` §10 Rollback). Reviewer bị chặn build/next start/curl → evidence header lấy từ builder (trên).
- Doc impact: chính task này (as-built) + `.context/decisions.md` (quyết định font self-host). Intent (`SPECIFICATIONS.md`, BRD) KHÔNG sửa — xem G1.

## Gap pending user (G1 — intent, KHÔNG tự sửa)
- R-20a.6 (`SPECIFICATIONS.md`) ghi "glyph tiếng Nhật qua `next/font` Noto Sans JP"; code thật self-host (lý do: `.context/decisions.md` CR-044 P2-T04).
  Repo không có gap register (`docs/changes/TECHNICAL_REQUIREMENT_GAPS.md` không tồn tại) → ghi tại đây.
- Câu đề xuất (chờ user xác nhận 1 dòng, rồi mới sửa SPECIFICATIONS.md + `spec/updates/` + `spec/CHANGELOG.md`):
  "Font Noto Sans JP tự host trong `public/fonts/noto-sans-jp/`, chỉ link ở trang ja (không tải trên vi/en)".
- Status: **open — pending user**.

## Bổ sung từ P2-T04 + spec-validator phase 2 (2026-11-09)
- G1: R-20a.6 (`SPECIFICATIONS.md:556`) ghi "qua `next/font`" nhưng thực tế self-host `public/fonts/noto-sans-jp/` (lý do F1: next/font đưa @font-face JP vào CSS chung vi/en). Sửa câu chữ R-20a.6 + `spec/updates/` + `spec/CHANGELOG.md` (intent → cần user xác nhận 1 dòng).
- `docs/DESIGN.md`: cơ chế font JP (chỉ ja link CSS), cách tái tạo (`tools/fonts/build-noto-jp.mjs`), giấy phép OFL-1.1.
- Residual trước deploy prod: thêm `OFL.txt` + copyright gốc (N4); sửa `rmSync(OUT_DIR)` xoá README khi tái tạo (N1); cân nhắc header cache immutable cho `/fonts/*` (N2, hiện `max-age=0`).
