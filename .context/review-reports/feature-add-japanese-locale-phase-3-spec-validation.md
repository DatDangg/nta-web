Agent: spec-validator

# Phase Review — feature-add-japanese-locale · phase 3 (CR-044)

- **Mode:** Phase review (sau khi P3-T01, P3-T02 PASS review)
- **Ngày:** 2026-11-09
- **Nguồn đối chiếu:** `SPECIFICATIONS.md` R-09c bản ja (dòng 375-380), R-20a (dòng 541-571, 4.12.0); change doc `spec/changes/2026-11-09-add-japanese-locale.md`;
  `spec/test-scope/current.json` (specVersion 4.12.0, scopeVersion 62); task `tasks/feature-add-japanese-locale/phase-3-task-0{1,2}.md`;
  review `feature-add-japanese-locale-phase-3-task-01-round-1-review.md` (PASS STRICT), `...-phase-3-task-02-round-1-review.md` (PASS NORMAL);
  phase 2 validation `feature-add-japanese-locale-phase-2-spec-validation.md` (G1, R1..R5).
- **Implementation:** P3-T01 commit `2696f88`; P3-T02 **chưa commit** (git diff: `docs/content-bot/*` 11 file, `docs/API_SPEC.md`, `docs/ERD.md`, `docs/DESIGN.md`,
  `docs/runbook/{db,ai-news}.md`, `.context/decisions.md`, `next.config.ts`, `tools/fonts/build-noto-jp.mjs`, task file, `progress.json`).
- Validator chỉ đọc (git log/show/diff/status + Grep/Read); không chạy server/verify command — dựa vào evidence reviewer/builder.

## Verdict: ✅ COMPLETE (PASS) — có điều kiện close-out

R-09c bản ja và toàn bộ phần doc reconcile/runbook mà phase 2 đẩy sang đã có implementation + review PASS. 0 MISSING. G1 vẫn mở (intent, chờ user — không phải lỗi task).
Điều kiện: P3-T02 phải close-out + commit (1 task = 1 commit, chỉ stage file của task).

## Coverage matrix

| # | Requirement | Task | Evidence | Status |
|---|---|---|---|---|
| R-09c ja-1 | Mỗi tuần sinh 3 bài `blog/{vi,en,ja}/ai-weekly-YYYY-wNN.mdx`, cùng slug/tin/ảnh/cover | P3-T01 | `tools/ai-news/generate.py` (LOCALES ja; render cùng `items`/`images`); review P3-T01 §Đối chiếu | ✅ |
| R-09c ja-2 | LLM trả `title_ja`/`summary_ja`; độ dài theo ký tự như vi/en | P3-T01 | `generate.py:298-303` (prompt), `_validate_item:175-177` (review) | ✅ |
| R-09c ja-3 | Title `AIウィークリーダイジェスト — YYYY年M月D日`, excerpt ja đúng mẫu | P3-T01 | `generate.py:217`, `:218`, `format_post_date` `:206-207` | ✅ |
| R-09c ja-4 | Chú thích ảnh `画像: <domain>`, ghi chú cuối `本ダイジェストは…`, nhãn `出典`, câu bản quyền ảnh ja, intro ja | P3-T01 | `generate.py:61` (FOOTNOTE), `:66` (bản quyền ảnh), `:74` (`SOURCE_LABEL` 出典), `IMAGE_CREDIT`/`_image_lines:249` | ✅ |
| R-09c ja-5 | Alt ảnh có `ja` | P3-T01 | `generate.py:398` manifest alt ja; `tools/db/publish-post.ts:150-152` đọc `alt.ja` | ✅ |
| R-09c ja-6 | Guard + `publish-post --dry-run` validate cả 3 locale trước khi ghi bất kỳ bản nào | P3-T01 | guard item-level loại tin thiếu ja khỏi cả 3 locale, test `test_missing_title_ja_fails_whole_run_writes_nothing`; `publish-post.ts:99-104,245-247` validate trước ghi | ✅ |
| R-09c ja-7 | Workflow commit 3 file, smoke `/ja/blog/<slug>` | P3-T01 | `.github/workflows/ai-news.yml:118` (git add 3 file), `:210` regex `(vi\|en\|ja)`, `:237` smoke `/ja/blog/$SLUG` | ✅ |
| R-09c ja-8 | Tuần cũ không có ja → fallback en; chạy lại chỉ thêm locale `missing` có file | P3-T01 (+P2-T02) | `publish-post` bỏ qua ja thiếu file (`skippedLocales`), `check` dùng `any()`; fallback `src/lib/content/locale-fallback.ts` | ✅ |
| R-20a.11 | `docs/content-bot/` key `collection/(vi\|en\|ja)/slug`; hướng dẫn rebuild `nta-tools` | P3-T02 | diff `docs/content-bot/{00,01,03,04,05,06,07,08,09,10,README}.md`; reviewer: regex `07` khớp `routing.ts:4` + `schema.ts:46`; `db.md:329` build `nta-tools` | ✅ (seed ja = bước user sau deploy) |
| Doc API | `docs/API_SPEC.md` locale contact `vi\|en\|ja` | P3-T02 | `docs/API_SPEC.md:51,58` khớp `contact-schema.ts:42`, `Code.gs:30` | ✅ |
| Doc ERD | CHECK 0002, I-1 bỏ ja, SEED/CONTENT_LOCALES | P3-T02 | diff `docs/ERD.md`; reviewer: `drizzle/0002_happy_magma.sql:2-3`, `schema.ts:87`, `content-repo.ts:174` | ✅ |
| Doc DESIGN | Fallback en, font JP self-host chỉ ja, tái tạo, OFL (G1-b) | P3-T02 | diff `docs/DESIGN.md` (+33 dòng); `src/app/[locale]/layout.tsx:74` link CSS chỉ khi `locale === 'ja'` | ✅ |
| Runbook rollout (R4, R-20a.9) | backup → thử 0002 DB tạm → dòng duyệt → push/deploy.yml → kiểm CHECK → smoke `/ja` → dán Code.gs → rebuild nta-tools → bot seed ja; hạn chót trước cron; rollback | P3-T02 | `docs/runbook/db.md` §10 (`:298-337`): OFL `:305`, Code.gs `:307`, `migrate-on-restore.sh` `:311`, nta-tools `:329`, cron `0 1 * * 6` `:333`, rollback dải commit CR-044 `:337` | ✅ |
| Runbook ai-news | bản ja, tiền điều kiện migration (MINOR P3-T01), "Dùng lại cho bài khác" + ja (m1) | P3-T01, P3-T02 | diff `docs/runbook/ai-news.md`; task P3-T02 ghi m1/m2 đã sửa | ✅ |
| Decision log G1 | Ghi lý do self-host thay `next/font` | P3-T02 | diff `.context/decisions.md:229-240` | ✅ |
| R3 (N2) | Cache immutable cho woff2 hash | P3-T02 | `next.config.ts` `headers()` source `/fonts/noto-sans-jp/:file([0-9a-f]{16}\\.woff2)`; CSS giữ mặc định; header thật = evidence builder (curl) | ✅ |
| R1-a (N1) | Script tái tạo font không xoá README/OFL | P3-T02 | `tools/fonts/build-noto-jp.mjs:35-39` chỉ `rmSync` `*.woff2` + `noto-sans-jp.css` | ✅ |
| R1-b | `public/fonts/noto-sans-jp/OFL.txt` + copyright | — (user) | Glob: chỉ có `README.md`, `noto-sans-jp.css` (+woff2) — OFL.txt **chưa có**; đã nằm trong checklist `db.md:305` | ⏭ user trước deploy |
| G1 | R-20a.6 câu chữ "qua `next/font`" ≠ code self-host | P3-T02 (ghi pending) | `SPECIFICATIONS.md:556`; task P3-T02 §"Gap pending user" có câu đề xuất, status open | ⚠️ open — pending user (intent, không được tự sửa) |
| test-scope v62 | Không đổi behavior/spec ở phase 3 → không cần bump | — | `spec/test-scope/current.json:2-5` (4.12.0, 62, feature-update) | ✅ |

## Gaps
- **G1 [OPEN — intent, pending user]** R-20a.6 (`SPECIFICATIONS.md:556`) vẫn ghi "qua `next/font`". Phase 3 đã làm đúng phần được phép: decision log + `docs/DESIGN.md` (as-built)
  + câu đề xuất trong task P3-T02. Sửa SPECIFICATIONS.md + `spec/updates/` + `spec/CHANGELOG.md` chỉ sau khi user xác nhận 1 dòng. Không chặn phase 3.
- **G2 [điều kiện close-out]** P3-T02 chưa commit. Chỉ stage file của task (docs đã liệt kê, `next.config.ts`, `tools/fonts/build-noto-jp.mjs`, `.context/decisions.md`,
  task file, `progress.json`, run journal, review report P3-T02 + 2 report spec-validation này). **KHÔNG** gộp `.claude/launch.json`, `.context/review-reports/cr-041-screens/`,
  `spec/changes/2026-10-19-hero-wide-screen-backdrop.md`.

## Residual risk
- **R-a** Python unittest (Docker) và test Postgres publish-post 3 locale (`tools/db/publish-post.test.ts:196-252`) reviewer không chạy được — dựa claim builder 86 OK; cần CI/DB xác nhận.
- **R-b** `BODY_MIN = 600` áp chung cho ja (`generate.py:52,280`) — chữ Nhật đặc, có thể làm fail cả run; theo dõi log các lượt đầu.
- **R-c** Nếu cron thứ 7 chạy trước khi migration 0002 lên prod → đăng lẻ vi/en, ja fail CHECK (tự lành khi chạy lại). Runbook `db.md:333` đã đặt hạn chót.
- **R-d** Header cache font thật + `npm run build` chỉ có evidence builder (reviewer bị chặn allowlist).
- **R-e** Baseline test fail `tools/db/content-rules.test.ts:29` (thiếu `/uploads` local) — không liên quan CR-044.

## Verdict reasoning
0 MISSING, 0 conflict HIGH; tất cả task phase 3 review PASS (P3-T01 STRICT, P3-T02 NORMAL, MINOR đã xử lý/ghi residual). G1 là gap intent chờ user, đã được ghi đúng quy trình.
→ ✅ COMPLETE cho phase 3, điều kiện G2 (commit P3-T02).
