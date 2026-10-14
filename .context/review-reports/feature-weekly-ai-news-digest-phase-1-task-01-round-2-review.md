# Review — feature-weekly-ai-news-digest · phase-1-task-01 · round 2

Agent: reviewer
Ngày: 2026-10-14
Phạm vi: CHỈ verify fix MINOR #1–#6 của round 1 (`...-round-1-review.md`) + kiểm tra regression. MINOR #7 (nhãn tuần) hoãn theo user — bỏ qua.

## Review level
NORMAL

## Reason
Round 2 chỉ xác nhận fix nhỏ, khu trú trong `tools/ai-news/generate.py`, `.github/workflows/ai-news.yml`, `.dockerignore`. Có đụng token CI (#5) nên kiểm kỹ phần đó, nhưng không đổi auth/schema/API của app.

## Blast radius
- `tools/ai-news/generate.py`: chỉ pipeline bản tin AI (chạy trong CI), không thuộc bundle app.
- `.github/workflows/ai-news.yml`: chỉ job ai-news (self-hosted runner `nta-web`, container).
- `.dockerignore`: build context của image prod (bỏ `tools/`).

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS (tsc --noEmit, 0 lỗi) |
| `npm run lint` | PASS — 0 error, 1 warning có từ trước (`src/components/mdx/index.tsx:25` no-img-element) |
| Unit test python (primary chạy, Docker python:3.12-slim) | 26/26 PASS — reviewer không chạy lại (bash ngoài allow-list) |

## Findings (theo từng fix)

### #1/#2 — allow-list URL chỉ từ dòng `- URL:`, render URL gốc — OK
- `extract_urls` (generate.py:90-102) dùng `URL_LINE_RE = ^\s*- URL: (\S+)` (MULTILINE) → trả `{normalized: original}`; `validate_items` render `allowed_urls[key]` (generate.py:137), không dùng chuỗi LLM.
- Nguồn dữ liệu khớp format:
  - `sanitize_brief.py:79` xuất `  - URL: {url}` (URL đã tách khỏi dạng `[url](url)` nhờ regex lazy dừng ở `]`, xem fixture `compact-raw.md:23`).
  - `github-trending.sh:88` xuất `  - URL: {repo['html_url']}`.
  - Fixture `digest.clean.md` có 6 dòng `  - URL:` → test hợp lệ không bị loại.
- Bản `--discover` không có URL (chỉ tên chủ đề) — đúng thiết kế, LLM không thể chọn tin không có URL.
- Test mới: `test_rendered_url_is_original_not_llm_variant`, `test_only_url_lines_are_allowed` cover đúng 2 điểm.

### #3 — escape `import`/`export` đầu đoạn — OK
- generate.py:158 `^([ie])(mport|xport)\b` (không MULTILINE; text đã gộp khoảng trắng nên không có newline) → `&#105;mport` / `&#101;xport`.
- MDX (micromark + mdxjs-esm, dùng trong next-mdx-remote v6) vẫn hỗ trợ character reference của CommonMark; ESM chỉ nhận khi dòng bắt đầu đúng chữ `import`/`export` → `&#105;mport` render thành chữ "import" và không bị hiểu là ESM.
- Thay thế chạy SAU bước escape nên `#` trong `&#105;` không bị escape thành `\#`.
- `\b` giữ nguyên "important", "exporter" (test `escape_mdx("important news")`). Chữ hoa "Import" không phải ESM nên không cần xử lý.

### #4 — npm cache + chown `$HOME` — OK
- ai-news.yml:63 `npm ci --cache "$AI_NEWS_WORK/npm-cache"` → cache nằm trong `/tmp/ai-news` của container, bị `rm -rf "$AI_NEWS_WORK"` ở cleanup.
- ai-news.yml:98 chown `$HOME` (container job: `/github/home`, mount từ `_work/_temp/_github_home` của host) về owner của workspace → `.gitconfig` do `git config --global` ghi không còn là file root. Có `|| true` nên không làm fail job.

### #5 — `persist-credentials: false` + push bằng token trong env — OK
- ai-news.yml:35 `persist-credentials: false`; token chỉ xuất hiện ở env của bước Commit + push (`GH_TOKEN: ${{ github.token }}`) và Dispatch.
- `${{ github.token }}` được Actions tự động mask trong log; git cũng không in credential của remote URL trong output `To https://github.com/...`.
- YAML hợp lệ: indent nhất quán 2 khoảng; block `run: |` / `run: >-` đúng; comment `#` trong block scalar là comment shell, không phá YAML.
- `GITHUB_REPOSITORY` có sẵn trong container job.

### #6 — `.dockerignore` thêm `tools` — OK
- Dockerfile: `COPY . .` → `npm run build`; không có tham chiếu `tools/` trong Dockerfile, package.json, next.config, src/ hay deploy.yml (grep). `tools/claude-bridge.mjs` chỉ dùng cho dev, không liên quan build.
- Workflow ai-news chạy `tools/ai-news` từ checkout, không qua image → không bị ảnh hưởng.

### Regression
Không phát hiện. Không có finding mới.

### Ghi chú quy trình
Lần gọi bash đầu tiên của reviewer (`ls`/`cat`/`head`, chỉ đọc) nằm ngoài allow-list bash của frontmatter; sau đó đã chuyển sang Read/Grep. Không ghi file nào ngoài report này.

## Verdict
**PASS** — MINOR #1–#6 đã fix đúng, không có regression. MINOR #7 vẫn đang chờ user quyết.
