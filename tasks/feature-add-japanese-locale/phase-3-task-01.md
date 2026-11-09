# feature-add-japanese-locale · phase-3-task-01 — Bản tin AI tuần sinh + đăng vi/en/ja (generate.py, publish-post, ai-news.yml)

- **CR:** CR-044 · change doc `spec/changes/2026-11-09-add-japanese-locale.md` · spec R-20a (4.12.0) · test-scope v62
- **Quyết định user (2026-11-09, không hỏi lại):** OQ-1 fallback **en** · OQ-2 dev dịch `ja.json` · OQ-3 AI news sinh cả ja · OQ-4 VI · EN · JA 3 nút liền.
- **Classification / Risk:** ADDITIVE · HIGH (cron ghi thẳng main + ghi DB prod, LLM output, nội dung public)
  - Expected review level: **STRICT** (cron, DB write-path, content public)
  - Blast radius: `tools/ai-news/generate.py` + `tools/ai-news/tests/`, `tools/db/publish-post.ts` + test, `.github/workflows/ai-news.yml`, `docs/runbook/ai-news.md`.
  - Doc impact: runbook ai-news.
- **Deps:** P1-T01 (DB nhận ja), P2-T02/T03 (`/ja/blog/<slug>` 200 cho smoke). generate.py + publish-post + workflow đổi **cùng 1 commit** (tránh cron thứ 7 lệch).

## Scope
1. `generate.py`: `LOCALES = ("vi","en","ja")`; LLM trả thêm `title_ja`/`summary_ja` (guard độ dài theo ký tự, không rỗng); bài ja: title `AIウィークリーダイジェスト — YYYY年M月D日`, excerpt `YYYY年M月D日のダイジェストから注目のAIニュースN件を、元記事へのリンク付きで紹介します。`, đoạn mở đầu + nhãn nguồn `出典` + chú thích ảnh `画像: <domain>` + câu bản quyền ảnh + ghi chú cuối `本ダイジェストは公開情報をもとに自動で作成しています。`; alt ảnh có ja; escape MDX như vi/en; cùng slug/cover.
2. `publish-post.ts`: dry-run validate **cả 3 locale** trước khi ghi; tuần cũ không có file ja → bỏ qua locale ja (không lỗi), không ghi đè bản có sẵn.
3. `ai-news.yml`: `git add` thêm file ja; smoke thêm `/ja/blog/$SLUG`; parse dòng `post/<locale>/<slug>` gồm ja.
4. Test: unittest generate (render ja, thiếu title_ja → FAIL), publish-post 3 locale + tuần cũ thiếu ja.
5. Runbook cập nhật.

## Acceptance
- generate với fixture → 3 file vi/en/ja hợp lệ; build PASS với bài mẫu (xoá, không commit).
- publish-post dry-run báo missing/exists theo 3 locale; chạy lại → 0 ghi.
- unittest (Docker python) + `npm test` + typecheck + lint PASS. Không chạy workflow thật.

## Retry / Escalation
Max 3 attempt; fail lần 3 → `architecture_review_needed` (không fix #4). Mỗi failed attempt append `.context/error-memory.md`.

## Verification summary
- Acceptance criteria: _pending_
- Verify commands + result: _pending_ (`npm run typecheck`, `npm run lint`, `npm test`, `npm run build` — lấy từ `.context/project-config.md`)
- Reviewer verdict: _pending_
- Doc impact: _pending_
