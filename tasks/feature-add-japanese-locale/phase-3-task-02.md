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
- Acceptance criteria: _pending_
- Verify commands + result: _pending_ (`npm run typecheck`, `npm run lint`, `npm test`, `npm run build` — lấy từ `.context/project-config.md`)
- Reviewer verdict: _pending_
- Doc impact: _pending_

## Bổ sung từ P2-T04 + spec-validator phase 2 (2026-11-09)
- G1: R-20a.6 (`SPECIFICATIONS.md:556`) ghi "qua `next/font`" nhưng thực tế self-host `public/fonts/noto-sans-jp/` (lý do F1: next/font đưa @font-face JP vào CSS chung vi/en). Sửa câu chữ R-20a.6 + `spec/updates/` + `spec/CHANGELOG.md` (intent → cần user xác nhận 1 dòng).
- `docs/DESIGN.md`: cơ chế font JP (chỉ ja link CSS), cách tái tạo (`tools/fonts/build-noto-jp.mjs`), giấy phép OFL-1.1.
- Residual trước deploy prod: thêm `OFL.txt` + copyright gốc (N4); sửa `rmSync(OUT_DIR)` xoá README khi tái tạo (N1); cân nhắc header cache immutable cho `/fonts/*` (N2, hiện `max-age=0`).
