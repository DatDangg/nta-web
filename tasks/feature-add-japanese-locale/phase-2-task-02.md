# feature-add-japanese-locale · phase-2-task-02 — Locale ja ở routing/request + lớp fallback en (file + db)

- **CR:** CR-044 · change doc `spec/changes/2026-11-09-add-japanese-locale.md` · spec R-20a (4.12.0) · test-scope v62
- **Quyết định user (2026-11-09, không hỏi lại):** OQ-1 fallback **en** · OQ-2 dev dịch `ja.json` · OQ-3 AI news sinh cả ja · OQ-4 VI · EN · JA 3 nút liền.
- **Classification / Risk:** ADDITIVE · HIGH (shared i18n/routing, data cache/content store dùng mọi trang)
  - Expected review level: **STRICT** (shared service/cache key/navigation)
  - Blast radius: `src/i18n/routing.ts`, `src/i18n/request.ts`, `src/content/types.ts` (`Locale`), `src/lib/content/*` (store/registry/load-mdx/slug/ui-data), `src/lib/contact/company-*`, các `Record<Locale, …>` trong `src/content/{home,listings,solutions/overview}.ts` + test.
  - Doc impact: `docs/DESIGN.md` (cơ chế fallback) ở P3-T02.
  - Decision impact: fallback theo bản ghi (không trộn field) → `.context/decisions.md`.
- **Deps:** P1-T01 (CONTENT_LOCALES có ja), P2-T01 (ja.json — request import động `./messages/${locale}.json`).

## Scope
1. `routing.ts`: `locales: ['vi','en','ja']`, default vi, `as-needed` giữ. `Locale = 'vi' | 'en' | 'ja'` (nên suy từ `routing.locales`).
2. Fallback en **theo từng bản ghi** (R-20a.2) ở MỘT chỗ (lớp store/registry), không rải trong page:
   - db: get theo collection/slug locale ja thiếu → bản en cùng slug; `slug_registry`/thứ tự ja thiếu → của en; `company_info` ja thiếu → en. Cache tag giữ `content:<collection>`. Cảnh báo tối đa 1 lần/process/collection.
   - file (`CONTENT_SOURCE=file`): MDX `src/content/<coll>/ja/` không có → en; object TS `Record<Locale,T>` → kiểu cho phép thiếu ja (vd `Record<'vi'|'en',T> & Partial<Record<'ja',T>>`) + helper chọn locale fallback en. Không thêm bản ja vào file seed.
3. `request.ts`: db mode `buildUiMessages(getEntries('ui_messages','ja'), ja.json)` — chưa có bản ghi ja → dùng ja.json, **không** spam cảnh báo mỗi namespace mỗi request.
4. Test: store/registry fallback (có ja → ja nguyên bản; thiếu → en; slug không có ở cả hai → notFound), request ja (file + db stub).

## Acceptance
- Nội dung trang ja = en khi DB chưa có ja; vi/en output không đổi; không 500 khi ja thiếu toàn bộ; slug sai vẫn 404.
- typecheck + lint + test PASS (build đầy đủ kiểm ở P2-T03 nếu guard page còn chặn ja — ghi rõ).

## Retry / Escalation
Max 3 attempt; fail lần 3 → `architecture_review_needed` (không fix #4). Mỗi failed attempt append `.context/error-memory.md`.

## Verification summary
- Acceptance criteria: _pending_
- Verify commands + result: _pending_ (`npm run typecheck`, `npm run lint`, `npm test`, `npm run build` — lấy từ `.context/project-config.md`)
- Reviewer verdict: _pending_
- Doc impact: _pending_
