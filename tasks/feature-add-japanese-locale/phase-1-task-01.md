# feature-add-japanese-locale · phase-1-task-01 — DB + content rules + tools/db nhận locale ja (migration 0002)

- **CR:** CR-044 · change doc `spec/changes/2026-11-09-add-japanese-locale.md` · spec R-20a (4.12.0) · test-scope v62
- **Quyết định user (2026-11-09, không hỏi lại):** OQ-1 fallback **en** · OQ-2 dev dịch `ja.json` · OQ-3 AI news sinh cả ja · OQ-4 VI · EN · JA 3 nút liền.
- **Classification / Risk:** ADDITIVE · HIGH (DB schema/migration prod, write-path nội dung dùng chung bot/workflow)
  - Expected review level: **STRICT** (DB/schema/migration, shared content-rules)
  - Blast radius: `src/db/schema.ts`, `src/db/content-rules.ts`, `src/db/content-repo.ts` (I-1), `drizzle/0002_*` + `drizzle/meta`, `tools/db/{file-source,parity-check,content-cli,publish-post}.ts` + test. KHÔNG đụng `src/app`, `src/i18n`, type `Locale` của web (phase 2).
  - Doc impact: `docs/ERD.md` (CHECK locale) — reconcile ở P3-T02.
  - Decision impact: tách `SEED_LOCALES` khỏi `CONTENT_LOCALES` → append `.context/decisions.md`.
- **Deps:** không (task đầu). Web vẫn chạy vi/en sau task này.

## Scope
1. `src/db/schema.ts`: `CONTENT_LOCALES = ["vi","en","ja"]`; CHECK `content_entries_locale_check` → `IN ('vi','en','ja')`. Thêm `SEED_LOCALES = ["vi","en"] as const` (export dùng chung).
2. `npm run db:generate` → `drizzle/0002_*.sql` + snapshot/journal (KHÔNG `drizzle-kit push`). Đọc SQL thật: kỳ vọng `ALTER TABLE ... DROP CONSTRAINT "content_entries_locale_check"` + `ADD CONSTRAINT ... CHECK`.
   Chạy gate (`deploy/db/migration-gate.ts` + test) trên file thật → ghi kết quả. Gate chặn → dòng duyệt
   `-- HIGH_RISK_MIGRATION: approved YYYY-MM-DD by <user>` **CHỈ thêm khi user đã duyệt rõ ở checkpoint** (chưa duyệt → để trống, ghi `BLOCKED: chờ duyệt`, không tự điền tên user).
3. `src/db/content-rules.ts`: I-6 nhận ja (qua CONTENT_LOCALES); asset `alt` cho phép key `ja` (tuỳ chọn; vi/en như cũ).
4. `src/db/content-repo.ts:~170-185` cảnh báo I-1: chỉ kiểm cặp vi/en (SEED_LOCALES), không đòi ja.
5. `tools/db/content-cli.ts`: `upload` thêm `--alt-ja` tuỳ chọn; ghi bản ghi locale ja OK; locale lạ → lỗi I-6.
6. `tools/db/file-source.ts` + `parity-check.ts`: lặp `SEED_LOCALES`; parity **bỏ qua hàng ja cả 2 chiều** (không "thiếu", không "thừa trong DB").
7. `tools/db/publish-post.ts`: **giữ vi/en** trong task này (hằng = SEED_LOCALES) để cron AI news thứ 7 không vỡ; P3-T01 mới chuyển 3 locale.
8. Test: schema.test (CHECK có ja), content-rules.test (ja hợp lệ, `fr` bị chặn, alt.ja), parity/file-source test (hàng ja bị bỏ qua), content-cli test `--alt-ja`, migration-gate trên 0002.

## Acceptance
- Migration versioned `drizzle/0002_*` committed; bản ghi cũ đều thoả CHECK mới; không DROP/đổi bảng/cột/dữ liệu.
- `content-cli` ghi được bản ghi ja; locale ngoài vi/en/ja → lỗi I-6.
- parity vi/en PASS như cũ, hàng ja không gây FAIL; publish-post vẫn vi/en.
- Rollout ghi rõ: migration **không** destructive về dữ liệu nhưng bị gate chặn → cần dòng duyệt user; backup → restore DB tạm + chạy thử 0002 → user duyệt → deploy.yml (backup pre-migrate → gate → migrate → build/up). Không có DB staging (R-16c).
- typecheck + lint + test PASS.

## Ngoài phạm vi
Không chạy migration lên prod/DB thật; không seed ja; không sửa web.

## Retry / Escalation
Max 3 attempt; fail lần 3 → `architecture_review_needed` (không fix #4). Mỗi failed attempt append `.context/error-memory.md`.

## Verification summary
- Acceptance criteria: _pending_
- Verify commands + result: _pending_ (`npm run typecheck`, `npm run lint`, `npm test`, `npm run build` — lấy từ `.context/project-config.md`)
- Reviewer verdict: _pending_
- Doc impact: _pending_
