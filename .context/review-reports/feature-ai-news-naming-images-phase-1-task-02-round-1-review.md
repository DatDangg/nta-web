Agent: reviewer

# Review — feature-ai-news-naming-images · phase-1-task-02 · round 1 (CR-038)

- **Task:** `tasks/feature-ai-news-naming-images/phase-1-task-02.md` — generator: tên bản tin theo ngày + cover = ảnh tin đầu tiên có ảnh (fallback webp)
- **Đối chiếu:** change doc `spec/changes/2026-10-15-ai-news-naming-images.md` §2 + §3; `SPECIFICATIONS.md` R-09c *Tên + ảnh thẻ* (4.6.0, :311-323)
- **Phạm vi diff:** `tools/ai-news/generate.py`, `tools/ai-news/tests/test_ai_news.py`, `tools/ai-news/tests/test_og_image.py`,
  `tools/ai-news/README.md`, `docs/runbook/ai-news.md`, `public/images/blog/ai-weekly-cover.webp` (mới), task file.
  File của task-01 (`src/i18n`, `src/components/blog`, `docs/DESIGN.md`) — ngoài scope, bỏ qua.

## Review level
**NORMAL**

## Reason
Pipeline tự đăng bài không duyệt tay → sai frontmatter lên prod tự động, nhưng diff chỉ đổi chuỗi title/excerpt + giá trị `cover`;
không đổi guard SSRF (`og_image.py`), secret, DB, `tools/db/*`, workflow. Logic chọn cover 1 dòng, có test.

## Blast radius
- Frontmatter bài `ai-weekly-YYYY-wNN` vi/en sinh mới (title, excerpt, cover) → thẻ /blog, trang chủ, bài liên quan.
- `publish-post` I-7: cover `/uploads/…` phải có trong `manifest.json`; cover fallback phải tồn tại trong `public/`.
- Bài cũ (w42) và version v1 trong DB không bị đụng (svg giữ nguyên).

## Kiểm theo yêu cầu
| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Title/excerpt vi theo ngày `DD/MM/YYYY` | OK | `generate.py` `format_post_date` pad `:02d`; `_frontmatter` chuỗi khớp nguyên văn R-09c :313/:315 |
| Title/excerpt en `D Mon YYYY`, tháng hằng Jan..Dec | OK | `MONTH_ABBR_EN` tuple, không dùng `strftime('%b')`/locale; khớp R-09c :314/:316 |
| Đúng ngày VN | OK | Nguồn ngày = `week["date"]` = `now.astimezone(VN_TZ).date()` (`week_info` :73-82), cũng là `date` frontmatter |
| Biên năm ISO | OK | `test_iso_year_boundary_title_uses_post_date`: 2027-01-01 → slug `ai-weekly-2026-w53`, title `01/01/2027` / `1 Jan 2027` |
| Slug giữ nguyên | OK | `week["slug"]` không đổi; test assert `slug: "ai-weekly-2026-w42"` |
| Cover = ảnh tin đầu tiên có ảnh SAU lọc/dedup | OK | `render_post` dùng `images[min(images)]`; `images` là đúng dict trả về từ `og_image.collect_images` (đã lọc lỗi + bỏ trùng sha256) và cũng chính dict dùng chèn `NewsImage` vào body + `write_images` (manifest) trong `publish` (:395-411) → cover luôn là ảnh có trong body + manifest |
| Cover vi == en | OK | cùng `images` cho cả 2 locale; test assert set covers có 1 phần tử |
| Fallback webp (0 ảnh, `AI_NEWS_IMAGES=off`, ảnh bỏ toàn bài, `guarded_items`) | OK | `images` rỗng → `FALLBACK_COVER`; nhánh except :404-409 render lại không ảnh và `write_images` ghi manifest rỗng → nhất quán |
| I-7 / publish-post | OK | `tools/db/publish-post.ts:189-191` `uploadPathsOf` gom ảnh từ cả `data` (cover) + `body` → cover `/uploads` được kiểm với manifest; fallback `public/images/blog/ai-weekly-cover.webp` tồn tại (test `test_fallback_cover_file_exists_in_public`); `.dockerignore` không loại `public/images` |
| Asset webp | OK | `cmp` với `spec/changes/assets/.../ai-weekly-cover.webp` → byte-identical |
| Không phá CR-035 | OK | `_image_lines`, NewsImage, footnote, manifest không đổi; test CR-035 cũ giữ nguyên, chỉ bổ sung assert cover |
| SVG giữ lại | OK | không xoá `ai-weekly-cover.svg`; `tools/db/*`, `src/content` không đổi (`git diff --stat HEAD -- src/content tools/db` rỗng) |
| Docs | OK | runbook: đoạn "Tên + ảnh thẻ" + §8 bước 2 nhắc đổi `cover` khi gỡ đúng ảnh đó; README ai-news cập nhật; không còn `cover.svg`/`COVER` cũ trong `tools/ai-news` source |

## Verify commands + result
- `npm test` → 1 fail: `tools/db/content-rules.test.ts:29` — 9 ảnh `/uploads/…` không có local. **Có từ trước, không do diff**: đến từ seed
  `src/content/blog/{vi,en}/ai-weekly-2026-w42.mdx` (commit `51193a0`), diff không đụng `src/content` / `tools/db`. Không tính cho task này.
- `docker run --rm -v "D:/prj/nta-web:/w" -w /w python:3.12-slim python -m unittest discover -s tools/ai-news/tests` → **Blocked (permission)**:
  frontmatter reviewer `bash "*": deny`, `docker` không có rule allow; `pytest *` được allow nhưng máy không có Python.
  Reviewer KHÔNG tự chạy lại được → **primary phải chạy lệnh này trong session chính và ghi kết quả (kỳ vọng `Ran 83 tests … OK`) vào task file TRƯỚC khi commit**.
  Đọc tĩnh test: import đủ (`re`, `hashlib`, `os`, `datetime`), helper dùng (`news_net`, `render_args`, `read_post`, `run_main`, `fixture_items`, `WEEK`) tồn tại; route `agent-framework-2` tạo trùng sha256 với tin #1 → khớp log `"ảnh tin #1 bỏ: trùng ảnh với tin khác"`.
- `npm run typecheck` / `npm run lint` / `npm run build`: không chạy lại — diff không đổi TS/JS; builder báo typecheck/lint PASS, build Blocked do native binding máy dev (không liên quan diff).

## Responsive Checklist Gate
N/A — diff không đụng UI (route/component/CSS); chỉ generator Python + asset tĩnh.

## Skill gates
- aislop: skip — diff không có TS/JS; code Python thêm nhỏ, không narrative comment/dead code/swallowed error.
- oxlint (anti-slop): N/A — không đụng TS/JS.
- ocr (open-code-review): skip, ocr not installed / không trong allowlist chạy.
- AI-readable: OK — 0 indicator (tên rõ `FALLBACK_COVER`, `format_post_date`; hàm ngắn; README cập nhật).
- ai-friendly-web: N/A — không đổi web public surface.
- blitzstrike: N/A — không đổi input/SSRF guard.

## Findings
- [MINOR] `tools/ai-news/generate.py` `format_post_date`: locale khác `"vi"` đều ra định dạng en (mặc định ngầm). Chấp nhận được vì `LOCALES = ("vi","en")` và
  `_frontmatter` đã dùng cùng pattern; không cần sửa.
- [MINOR] `docs/runbook/ai-news.md:13-19` đoạn mới đặt ngay trước dòng "Thứ 7 17/10/2026 (w42)…" không có dòng trống phân cách → hai đoạn dính nhau khi render Markdown
  (dòng 19 nối vào đoạn CR-038). Đề xuất thêm 1 dòng trống trước "Thứ 7 17/10/2026". Không chặn.

Không có CRITICAL/MAJOR.

## Residual risk
- Python unittest chưa được reviewer chạy độc lập (Blocked permission) — điều kiện commit: primary chạy lại lệnh docker, PASS.
- og:image không 16:9 bị cắt ở thẻ (user đã chấp nhận). Bài w42 hiện tại không đổi — thuộc task-03.

## Verdict
✅ **PASS** (có điều kiện: primary chạy lại `python -m unittest discover -s tools/ai-news/tests` qua docker và PASS trước khi commit; FAIL → không commit, trả builder).
