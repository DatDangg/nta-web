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
2. Font Noto Sans JP ~~qua `next/font/google`~~ → **đổi sang self-host (attempt 2, fix F1 round 1)**: `public/fonts/noto-sans-jp/` (124 woff2 subset + `noto-sans-jp.css` + README license OFL-1.1) sinh bởi `tools/fonts/build-noto-jp.mjs` từ output next/font; `layout.tsx` chỉ link CSS khi locale ja. Gốc: (weight đang dùng, `display: swap`, không preload trên vi/en), class/biến font chỉ gắn khi locale ja (stack Inter → Noto Sans JP). Kiểm Network: vi/en không tải file font JP.
3. Screenshot 375/768/1280 vi/en/ja vào `.context/review-reports/`.

## Acceptance
- JA từ `/en/blog/<slug>` → `/ja/blog/<slug>`; VI → `/blog/<slug>`; EN từ `/ja/about` → `/en/about`.
- Glyph Nhật đúng; vi/en không tải font JP; LCP không tệ hơn đáng kể.
- typecheck + lint + build PASS.

## Retry / Escalation
Max 3 attempt; fail lần 3 → `architecture_review_needed` (không fix #4). Mỗi failed attempt append `.context/error-memory.md`.

## Verification summary
- Acceptance criteria: PASS — toggle 3 link giữ path (`/about` → `/en/about`,`/ja/about`; `/ja/about` → `/vi/about`(307→`/about`),`/en/about`), `aria-current` đúng VI/EN/JA; `lang` vi/en/ja; vi/en 0 stylesheet chứa "Noto Sans JP", ja có `/fonts/noto-sans-jp/noto-sans-jp.css`; drawer 375 không tràn (smoke builder).
- Verify commands + result: typecheck PASS · lint PASS (1 warn có sẵn mdx) · test 227/230 (1 fail có sẵn uploads, 2 skip) · build PASS (`SWC_NATIVE_BINDING_CACHE`) · HTTP smoke primary `next start :3927` (file mode): CSS 200 `text/css`, woff2 200 `font/woff2`, `Cache-Control: public, max-age=0` (mặc định public/) — server đã tắt.
- Reviewer verdict: round 1 FAIL (F1 CSS JP render-blocking mọi trang) → round 2 **STRICT PASS** (`.context/review-reports/feature-add-japanese-locale-phase-2-task-04-round-2-review.md`). MINOR không chặn: N1 script `rmSync(OUT_DIR)` xoá README khi tái tạo; N2 cache `/fonts/*` max-age=0 → đề xuất headers immutable (backlog); N4 chưa có OFL.txt + copyright gốc (residual risk, bổ sung trước deploy prod).
- Trade-off: self-host +5.7MB repo/image, đổi lại không phụ thuộc CDN ngoài (privacy, CSP, không cross-origin), chỉ trang ja tải.
- Doc impact: ghi quyết định self-host + font license vào `docs/DESIGN.md`/design-spec ở P3-T02.
