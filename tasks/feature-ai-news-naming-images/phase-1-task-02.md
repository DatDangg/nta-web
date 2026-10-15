# feature-ai-news-naming-images · phase-1-task-02 — Generator: tên bản tin theo ngày + cover = ảnh tin đầu tiên có ảnh (fallback webp)

- **CR:** CR-038 · change doc `spec/changes/2026-10-15-ai-news-naming-images.md` (Yêu cầu §2, §3) · spec R-09c *Tên + ảnh thẻ* (4.6.0) · liên quan CR-035 (ảnh tin), CR-034 (publish-db)
- **Classification / Risk:** MODIFY · **MEDIUM**
  - Expected review level: **NORMAL** — pipeline tự đăng bài không duyệt tay (sai format → bài sai lên prod tự động); không đổi guard SSRF,
    secret hay DB. Reviewer kiểm kỹ: cover luôn hợp lệ cho I-7 ở `publish-post` (ảnh `/uploads` nằm trong manifest; webp tồn tại trong `public/`).
  - Blast radius: `tools/ai-news/generate.py` (frontmatter), `tools/ai-news/tests/`, asset mới `public/images/blog/ai-weekly-cover.webp`,
    `docs/runbook/ai-news.md`, `tools/ai-news/README.md`. Không đổi `og_image.py`, `image_sniff.py`, `.github/workflows/ai-news.yml`, `tools/db/*`.
  - Doc impact: runbook ai-news (mô tả bài + §7 ảnh tin) và README ai-news nếu nêu cover SVG.
  - Migration gate: không áp dụng.
- **Deps:** không. Task-03 phải dùng đúng format chuỗi task này chốt.

## Scope
1. `public/images/blog/ai-weekly-cover.webp` ← copy nguyên `spec/changes/assets/2026-10-15-ai-news-naming-images/ai-weekly-cover.webp`
   (1672×941, 68 KB, WebP VP8X; đủ nhẹ, next/image tự resize → **không resize**, không thêm lib/công cụ ảnh, không AI sinh ảnh).
   **Giữ** `public/images/blog/ai-weekly-cover.svg`: còn tham chiếu ở version v1 của w42 trong DB (`content_versions` — rollback về v1 cần file
   cho I-7), fixture `tools/db/fixtures/blog/{vi,en}/ai-weekly-2026-w42.mdx:7`, `tools/db/content-rules.test.ts:20`, `tools/db/publish-post.test.ts:105`,
   comment `Dockerfile:37`. Không sửa các file đó.
2. `tools/ai-news/generate.py`:
   - `:33` `COVER` → `FALLBACK_COVER = "/images/blog/ai-weekly-cover.webp"`.
   - Hàm thuần định dạng ngày từ `week["date"]` (ISO `YYYY-MM-DD`; không dùng locale hệ thống / `strftime('%b')`):
     vi `DD/MM/YYYY` (pad 2), en `D Mon YYYY` (ngày không pad, tháng `Jan..Dec` hằng trong code).
   - `_frontmatter` (`:188-198`): title vi `Bản tin AI tuần ngày {DD/MM/YYYY}`; en `AI Weekly Digest — {D Mon YYYY}`;
     excerpt vi `{N} điểm tin AI đáng chú ý trong bản tin ngày {DD/MM/YYYY}, kèm link nguồn gốc.`;
     en `{N} notable AI news items in the digest of {D Mon YYYY}, with links to the original sources.` Slug không đổi.
   - Cover: `_frontmatter` nhận thêm `cover`; `render_post` (`:225-233`) → cover = `upload_path(images[min(images)])` khi `images` khác rỗng,
     ngược lại `FALLBACK_COVER`. vi + en cùng cover. Nhánh "ảnh bỏ toàn bài" trong `publish` (`:379-400`) render lại với `images={}` → fallback tự đúng;
     `guarded_items` (`:351`) render không ảnh → fallback — không cần sửa thêm.
   - `validate_post` (`:207`) giữ regex frontmatter (chuỗi mới qua `json.dumps`).
3. Test `tools/ai-news/tests/`:
   - `test_ai_news.py:194-207` `test_render_frontmatter_and_footnote`: cover `/images/blog/ai-weekly-cover.webp` (không ảnh);
     title/excerpt vi + en theo ngày `2026-10-12` → `12/10/2026` / `12 Oct 2026`; assert không còn `tuần 42/2026` / `Week 42`.
   - Test định dạng ngày biên: `2026-01-03` → vi `03/01/2026`, en `3 Jan 2026`; `2026-12-31`; năm ISO biên (`2027-01-01`, slug `w53`) → title theo `01/01/2027`.
   - `test_og_image.py` `RenderImagesTest` (`:599`) / `CliImagesTest` (`:647-730`): ảnh ở tin 2 và 5 (tin 1 không ảnh) → cover = ảnh tin 2;
     ảnh tin 1 bị bỏ do trùng sha256 → cover = tin có ảnh kế tiếp; `test_all_image_failures_still_publish` → cover fallback webp;
     cover vi == cover en; cover `/uploads/...` có trong `manifest.json` (để `publish-post --images-dir` không báo thiếu ảnh).
   - Test fallback trỏ file thật: `public/images/blog/ai-weekly-cover.webp` tồn tại (đường dẫn tính từ repo root).
4. `docs/runbook/ai-news.md` + `tools/ai-news/README.md`: thay mô tả "cover SVG cố định" bằng quy tắc mới; đổi ảnh fallback = thay file webp (giữ tên).

## Verification plan
- `python3 -m unittest discover -s tools/ai-news/tests` PASS — **máy dev Windows không có Python**: chạy trong Linux VM (Cowork) hoặc
  `docker run --rm -v "$PWD":/w -w /w python:3.12-slim python -m unittest discover -s tools/ai-news/tests`; ghi rõ môi trường đã chạy.
- `npm test` (tools/db không đổi kỳ vọng — vẫn PASS), `npm run typecheck`, `npm run lint`, `npm run build`.
- `grep -n "ai-weekly-cover.svg" tools/ai-news/` → 0 kết quả.

## Acceptance
- [ ] Bài mới: title/excerpt vi + en theo ngày, không còn "tuần NN/YYYY"/"Week NN"; slug giữ `ai-weekly-YYYY-wNN`.
- [ ] cover = ảnh tin đầu tiên có ảnh; 0 ảnh → `/images/blog/ai-weekly-cover.webp` (file tồn tại trong `public/`).
- [ ] Ảnh trong từng tin không đổi; `AI_NEWS_IMAGES=off` vẫn ra bài chỉ text (cover fallback).
- [ ] Test ai-news PASS; npm test/typecheck/lint/build PASS.

## Retry / Escalation
- Attempt FAIL thật → sửa trên đĩa, tăng `attempt`; cancel ≠ fail. 3 attempt FAIL → `architecture_review_needed`, dừng báo user.

## Verification summary
Builder attempt 1 (2026-10-15):
- **Thay đổi:** `generate.py` — `COVER` → `FALLBACK_COVER` (webp) + `MONTH_ABBR_EN`; hàm thuần `format_post_date(locale, iso)`
  (vi `DD/MM/YYYY`, en `D Mon YYYY`, không dùng locale hệ thống); `_frontmatter(locale, week, n, cover)` title/excerpt theo `week["date"]`
  (= ngày chạy giờ VN, cũng là `date` frontmatter); `render_post` cover = `upload_path(images[min(images)])` hoặc `FALLBACK_COVER`.
  Slug + `validate_post` không đổi; nhánh "ảnh bỏ toàn bài" / `guarded_items` render `images={}` → fallback tự đúng.
  Asset `public/images/blog/ai-weekly-cover.webp` copy nguyên (cmp byte-identical, 68082 B). `ai-weekly-cover.svg` giữ nguyên.
- **Test thêm/sửa:** `test_ai_news.py` — frontmatter webp + title/excerpt 12/10/2026 · 12 Oct 2026, không còn "tuần 42/2026"/"week 42";
  `test_format_post_date_edges` (2026-01-03, 2026-12-31, 2027-01-01); `test_iso_year_boundary_title_uses_post_date` (slug w53, title 01/01/2027);
  `test_fallback_cover_file_exists_in_public`. `test_og_image.py` — cover = ảnh tin 2 khi ảnh ở tin 2 + 5, vi == en; fallback khi `{}`;
  CLI: cover = ảnh tin 1 và có trong `manifest.json`; tin 1 trùng sha256 với tin 3 (bỏ cả) → cover = ảnh tin 4 (manifest chỉ còn ảnh đó);
  `test_all_image_failures_still_publish` → cover fallback webp.
- **Docs:** `docs/runbook/ai-news.md` (đoạn Tên + ảnh thẻ đầu runbook; §8 bước 2: gỡ ảnh đang là `cover` → đổi cover), `tools/ai-news/README.md`.
- **Verify:**
  - `MSYS_NO_PATHCONV=1 docker run --rm -v "D:/prj/nta-web:/w" -w /w -e PYTHONDONTWRITEBYTECODE=1 python:3.12-slim python -m unittest discover -s tools/ai-news/tests`
    → **PASS** (Ran 83 tests, OK) — Docker python:3.12-slim trên máy dev Windows.
  - `grep -rn "ai-weekly-cover.svg" tools/ai-news/` → 0 kết quả trong source (chỉ còn file `__pycache__/*.pyc` cũ, không track).
  - `npm run typecheck` → PASS. `npm run lint` → PASS (0 error, 1 warning có sẵn `src/components/mdx/index.tsx:26`).
  - `npm test` → 192 pass / **1 fail có sẵn, ngoài scope**: `tools/db/content-rules.test.ts:25` báo 9 ảnh `/uploads/…` không có trong `public/`
    — đến từ bài seed `src/content/blog/{vi,en}/ai-weekly-2026-w42.mdx` (commit 51193a0, ảnh nằm ở volume uploads prod), task này không đụng
    `src/content` / `tools/db`. Chuyển lead/task-03 xử lý.
  - `npm run build` → **Blocked (môi trường)**: `Failed to load next.config.ts … Failed to load native binding` — lỗi native binding trên máy,
    không liên quan file Python/asset của task (task không đổi TS/next config). Cần chạy lại build ở môi trường CI/Linux.
- **Residual risk:** ảnh og:image không 16:9 sẽ bị cắt ở thẻ (user đã chấp nhận). Bài cũ (w42) không đổi — task-03.
