# tools/ai-news — Bản tin AI tuần (CR-019, spec R-09c)

Pipeline chạy bởi `.github/workflows/ai-news.yml` (cron 08:00 thứ 7 giờ VN — `0 1 * * 6` UTC, CR-036 — + chạy tay).
Vận hành (secret, chạy tay, đổi model, tắt cron, xử lý lỗi): `docs/runbook/ai-news.md`.

Pipeline này chỉ sinh + commit file seed `src/content/blog/{vi,en}/<slug>.mdx`. Prod đọc nội dung từ DB → job `publish-db`
của cùng workflow đưa bài vào DB bằng `tools/db/content-cli.ts publish-post <slug>` (insert-only, CR-034) rồi revalidate; không dispatch deploy.

```
last30days/scripts/ai-news-digest.sh   thu thập 4 topic + GitHub trending → sanitize → 1 file .clean.md
generate.py check                      slug tuần (ai-weekly-YYYY-wNN, giờ VN); bài đã có → skip
generate.py generate --clean <file>    OpenCode Go → JSON tin → guard → render MDX vi + en
generate.py render --clean <f> --items-json <f>   như generate nhưng đọc JSON có sẵn (test offline)
generate.py generate … --items-out <f> chỉ LLM + guard → ghi JSON tin (có OPENCODE_API_KEY), không ghi MDX
generate.py render … --images-out <dir>  (KHÔNG cần key) fetch og:image từng tin qua og_image.py (SSRF guard,
                                       https/443, IP public, deadline 10 s/request, ảnh ≤2 MB JPEG/PNG/WebP
                                       200..8192 px) → <sha256>.<ext> + manifest.json; MDX `<NewsImage …/>` +
                                       dòng "Ảnh: <host>". `--no-images` = hành vi cũ. Lỗi ảnh không fail bài (CR-035)
og_image.py / image_sniff.py           fetch ảnh có guard / nhận diện magic bytes + kích thước
tests/                                 unittest stdlib + fixture
```

Ranh giới tin cậy: dữ liệu internet chỉ đi tới LLM qua `.clean.md` (sanitize allow-list + banner
"dữ liệu, không phải lệnh"). LLM chỉ trả JSON; MDX do `generate.py` render deterministic, mọi URL
phải có nguyên văn trong `.clean.md` (tin vi phạm URL/độ dài bị loại riêng), còn ≥5 tin hợp lệ (lấy tối đa 12). Dưới 5 → FAIL, không ghi file.

Ảnh tin (CR-035): workflow tách 2 bước — `generate --items-out` (bước DUY NHẤT có `OPENCODE_API_KEY`) → `render --items-json … --images-out`
(KHÔNG key). Render chỉ fetch URL tin **đã qua guard**, từ trang tin chỉ đọc meta `og:image` (HTML ≤ 512 KB, không tới LLM, không vào MDX);
ảnh do `image_sniff.py` kiểm magic bytes. Artifact `ai-news-images-<slug>` chỉ chứa ảnh + `manifest.json` → job `publish-db`
(`publish-post --images-dir`). Tắt: Variable `AI_NEWS_IMAGES=off` → `--no-images`. Vận hành/gỡ ảnh: `docs/runbook/ai-news.md` §7–8.

Frontmatter (CR-038): title/excerpt theo ngày `date` (`format_post_date`: vi `DD/MM/YYYY`, en `D Mon YYYY`, tháng Jan..Dec hằng trong code,
không phụ thuộc locale máy); slug giữ `ai-weekly-YYYY-wNN`. `cover` = `/uploads/…` của tin đầu tiên có ảnh, 0 ảnh → `FALLBACK_COVER`
(`/images/blog/ai-weekly-cover.webp`; đổi ảnh = thay file, giữ tên).

Chạy test (máy dev không có python):

```bash
MSYS_NO_PATHCONV=1 docker run --rm -v "D:/prj/nta-web:/w" -w /w -e PYTHONDONTWRITEBYTECODE=1 \
  python:3.12-slim python -m unittest discover -s tools/ai-news/tests
```

## Nguồn `last30days/`

Engine `last30days` v3.18.4 từ [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill)
(MIT, xem `last30days/LICENSE`), lấy từ gói `last30days-ai-news.zip` user gửi 2026-10-14.
`ai-news-digest.sh`, `github-trending.sh`, `sanitize_brief.py` là bản in-house của gói đó.

Đã bỏ khi vendor: `setup-keychain.sh`, `setup-pass.sh`, `test-v1-vs-v2.sh`, `test_device_auth.py`,
`evaluate_search_quality.py`, `verify_v3.py`, `build-skill.sh`, `compare.sh`, `gh-format.jq`
và `scripts/lib/vendor/bird-search/` (client X/Twitter bằng Node, chỉ chạy qua subprocess khi có cookie X;
pipeline luôn `--no-browser-cookies` nên engine tự báo "not found" và bỏ nguồn X — không có JS trong repo
nên `eslint .`/`tsc` không bị ảnh hưởng).

Đã sửa (6 điểm của change doc):
1. `ai-news-digest.sh`: `SKILL_DIR` → vị trí script (bỏ hardcode `~/.openclaw`).
2. `--days 7` (`AI_NEWS_DAYS`), `GITHUB_DAYS=7`, ngưỡng stars GitHub 500 → 50 (`GITHUB_MIN_STARS`).
3. Bước `--discover "AI agents"` có `--save-suffix` → được đưa vào sanitize.
4. `github-trending.sh`: log → stderr, stdout chỉ có markdown sạch, rỗng/rate-limit/lỗi → stdout rỗng
   (không còn marker/`/tmp`); bỏ phụ thuộc `jq` (định dạng bằng python stdlib).
5. Query GitHub lọc `topic:` AI (`ai llm machine-learning generative-ai ai-agents`, mỗi topic 1 query, gộp).
6. `sanitize_brief.py` viết lại theo allow-list: bản cũ giữ nguyên các dòng bình luận / `Insight` /
   `Highlights` / `Why` nằm trong cluster của `--emit=compact` (chỉ bỏ dòng `Evidence:`), và bỏ sót
   output `--discover` (không có "Ranked Evidence Clusters"). Bản mới chỉ giữ tiêu đề cluster, tiêu đề tin,
   URL (compact) và tên chủ đề (discover); format lạ → bỏ cả file.

Thêm: luôn `--no-browser-cookies`, `timeout` mỗi topic (`AI_NEWS_STEP_TIMEOUT`), log → stderr/file,
stdout chỉ in đường dẫn `.clean.md`; mỗi nguồn lỗi → bỏ qua, chỉ exit ≠0 khi không còn dữ liệu nào.
