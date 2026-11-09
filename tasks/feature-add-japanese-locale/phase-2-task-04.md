# feature-add-japanese-locale · phase-2-task-04 — LanguageToggle VI · EN · JA + font Noto Sans JP chỉ ở trang ja

- **CR:** CR-044 · change doc `spec/changes/2026-11-09-add-japanese-locale.md` · spec R-20a (4.12.0) · test-scope v62
- **Quyết định user (2026-11-09, không hỏi lại):** OQ-1 fallback **en** · OQ-2 dev dịch `ja.json` · OQ-3 AI news sinh cả ja · OQ-4 VI · EN · JA 3 nút liền.
- **Classification / Risk:** ADDITIVE · MEDIUM (Header dùng mọi trang, performance R-22)
  - Expected review level: **STRICT** (shared component/navigation)
  - Blast radius: `src/components/layout/LanguageToggle.tsx` (+ Header/drawer mobile), `src/app/[locale]/layout.tsx` (next/font), token font nếu cần.
  - Doc impact: `docs/DESIGN.md` / `.context/design-spec.md` ở P3-T02.
- **Deps:** P2-T03.

## Scope
1. Toggle 3 nút liền **VI · EN · JA** (desktop + drawer mobile), giữ đúng path/slug (next-intl navigation với `locale`), nút đang chọn `aria-current`/`aria-pressed`, vùng bấm ≥ 44px mobile, không tràn ngang 375px.
2. Font `Noto_Sans_JP` qua `next/font/google` (weight đang dùng, `display: swap`, không preload trên vi/en), class/biến font chỉ gắn khi locale ja (stack Inter → Noto Sans JP). Kiểm Network: vi/en không tải file font JP.
3. Screenshot 375/768/1280 vi/en/ja vào `.context/review-reports/`.

## Acceptance
- JA từ `/en/blog/<slug>` → `/ja/blog/<slug>`; VI → `/blog/<slug>`; EN từ `/ja/about` → `/en/about`.
- Glyph Nhật đúng; vi/en không tải font JP; LCP không tệ hơn đáng kể.
- typecheck + lint + build PASS.

## Retry / Escalation
Max 3 attempt; fail lần 3 → `architecture_review_needed` (không fix #4). Mỗi failed attempt append `.context/error-memory.md`.

## Verification summary
- Acceptance criteria: _pending_
- Verify commands + result: _pending_ (`npm run typecheck`, `npm run lint`, `npm test`, `npm run build` — lấy từ `.context/project-config.md`)
- Reviewer verdict: _pending_
- Doc impact: _pending_
