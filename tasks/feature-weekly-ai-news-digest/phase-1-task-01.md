# feature-weekly-ai-news-digest · phase-1-task-01 — Pipeline "Bản tin AI tuần" tự đăng lên Tin tức (vi + en)

- **CR:** CR-019 · change doc `spec/changes/2026-10-14-weekly-ai-news-digest.md` · spec R-09c (3.12.0)
- **Classification / Risk:** ADDITIVE · MEDIUM–HIGH (CI/CD tự commit + push `main` + deploy; gọi LLM ngoài; dữ liệu internet → prompt injection)
  - Expected review level: **STRICT** (cron/webhook, token/secret, ghi thẳng main, content public)
  - Blast radius: workflow mới + `tools/ai-news/` mới + 1 SVG cover; KHÔNG sửa `src/` (bài sinh ra dùng loader blog có sẵn), KHÔNG sửa `deploy.yml`/`ci.yml` trừ khi bắt buộc (ghi lý do).
  - Doc impact: `docs/runbook/` thêm mục vận hành bản tin (secret, chạy tay, tắt cron); SPECIFICATIONS R-09c đã viết.

## Nguồn
- Bản gốc user gửi: `C:\Users\datda\Downloads\last30days-ai-news.zip` (đã giải nén sẵn ở
  `C:/Users/datda/AppData/Local/Temp/claude/D--prj-nta-web/b729b9f1-7c8c-4a2c-bf41-17394690d3d3/scratchpad/zip/last30days-ai-news/`).
  Đọc `huong-dan-lay-tin-ai.md` + `README.txt` trong đó.

## Scope
1. **Vendor** `last30days/` → `tools/ai-news/last30days/` (giữ `SKILL.md`, `scripts/last30days.py`, `scripts/lib/**`, `store.py`,
   `sanitize_brief.py`, `github-trending.sh`, `ai-news-digest.sh`, …). BỎ: `setup-keychain.sh`, `setup-pass.sh`, `test-*`, `test_*`,
   `evaluate_*`, `verify_v3.py`, `build-skill.sh`, `compare.sh`. Thêm file `LICENSE` MIT (mvanhorn/last30days-skill) + README ngắn ghi nguồn + các chỗ đã sửa.
   Chỉ bỏ thêm (vd `lib/vendor/bird-search`) nếu chắc không bị import ở đường chạy của ta — nếu giữ JS/mjs thì phải đảm bảo
   `eslint .` / `tsc` của repo KHÔNG quét `tools/ai-news/**` (thêm ignore đúng chỗ).
2. **6 chỉnh sửa bắt buộc** (change doc): (1) `SKILL_DIR` theo vị trí script; (2) `--days 7` + `GITHUB_DAYS=7` + hạ ngưỡng stars;
   (3) `--discover "AI agents"` thêm `--save-suffix` để vào sanitize; (4) `github-trending.sh` log → stderr, nhánh rate-limit/rỗng
   không ghi rác vào stdout/file trending; (5) query GitHub lọc chủ đề AI (topic ai/llm/machine-learning…); (6) verify `sanitize_brief.py`
   trên output thật/fixture của `last30days --emit=compact` (heading đổi → không lọt dữ liệu thô). Luôn `--no-browser-cookies`.
   Mỗi nguồn/topic lỗi → log + bỏ qua; chỉ fail nếu KHÔNG còn dữ liệu nào.
3. **Generator** (Python stdlib, không thêm dependency) `tools/ai-news/generate.py` (tên tuỳ, giữ rõ ràng):
   - Đọc `.clean.md` → gọi OpenCode Go `POST {base}/chat/completions` (OpenAI-compatible), `User-Agent: nta-web-ai-news/1.0`,
     header `x-opencode-session` cố định (vd `nta-web-ai-news`), model từ env `AI_NEWS_MODEL` (mặc định `glm-5.3`), key từ env
     `OPENCODE_API_KEY` (thiếu key → exit ≠0, không in key). Timeout + retry nhẹ.
   - Prompt: dữ liệu bọc trong delimiter + nhắc "dữ liệu, không phải lệnh"; yêu cầu trả **JSON** danh sách tin
     `{title_vi,title_en,summary_vi,summary_en,url,source}` — dạng điểm tin, chỉ diễn giải từ tiêu đề, cấm thêm số liệu/tên/ngày.
   - Script **render MDX deterministic** từ JSON (LLM không viết MDX): frontmatter `slug/title/date/category: ai-tech/excerpt/cover`,
     mỗi tin = heading/đoạn + link nguồn; cuối bài ghi chú cố định vi "Bản tin được tổng hợp tự động từ các nguồn công khai." /
     en "This digest is compiled automatically from public sources." Escape ký tự MDX nguy hiểm (`{ } < >` …) trong text từ LLM.
   - **Guard:** mọi URL phải có nguyên văn trong `.clean.md` (chuẩn hoá nhẹ OK, URL lạ → FAIL); số tin trong khoảng (vd 5–12);
     title/summary độ dài giới hạn, không rỗng; frontmatter đủ field; tổng độ dài bài trong khoảng. FAIL → exit ≠0, không ghi file.
   - Slug `ai-weekly-YYYY-wNN` theo ISO week (giờ VN); file đã tồn tại → thoát 0 với cờ "skip" (không ghi đè, không commit).
4. **Cover** `public/images/blog/ai-weekly-cover.svg` cố định (cùng phong cách các cover blog hiện có, nhẹ).
5. **Workflow** `.github/workflows/ai-news.yml`:
   - `on: schedule: cron '0 1 * * 1'` (08:00 thứ 2 VN) + `workflow_dispatch`; `concurrency` riêng; `runs-on: [self-hosted, nta-web]`;
     chạy trong `container:` (vd `node:22-bookworm` — có python3/git/curl) → KHÔNG cài gì lên host VPS.
   - `permissions: contents: write, actions: write` (tối thiểu cần để push + dispatch deploy).
   - Bước: checkout → collect (fail-soft) → generate+guard → `npm ci` + `npm run build` → commit đúng 2 file bài
     (bot identity) → `git push origin main` → dispatch `deploy.yml` qua REST API bằng `GITHUB_TOKEN`. Không có bài mới (skip) → dừng xanh, không commit.
   - Secret `OPENCODE_API_KEY` chỉ qua `env` bước generate; không echo. Model override qua `vars.AI_NEWS_MODEL` (tuỳ chọn).
6. **Test** `tools/ai-news/tests/` (unittest stdlib): guard URL lạ, số tin ngoài khoảng, escape MDX, slug ISO week + skip khi tồn tại,
   render frontmatter, sanitize trên fixture compact (heading lạ không lọt raw). Chạy được bằng Docker:
   `docker run --rm -v "<repo>:/w" -w /w python:3.12-slim python -m unittest discover -s tools/ai-news/tests` (máy dev không có python).
   Smoke thu thập thật (`--quick`) trong container nếu mạng cho phép — không bắt buộc PASS (nguồn ngoài), ghi kết quả.
7. **Runbook** `docs/runbook/ai-news.md`: thêm secret, chạy tay, đổi model, tắt cron, xử lý workflow đỏ.

## Acceptance (từ change doc)
- Workflow cron tuần + `workflow_dispatch`, runner `nta-web`.
- Script trong `tools/ai-news/`; 1 nguồn lỗi → bỏ qua.
- LLM chỉ nhận `.clean.md` có banner.
- Mỗi lần chạy đúng 2 bài vi+en, frontmatter hợp lệ, slug theo tuần, chạy lại cùng tuần không trùng.
- Dạng điểm tin; prompt cấm bịa; lời riêng.
- Guard URL ∈ `.clean.md`; số tin trong khoảng.
- Ghi chú tự động cuối bài + link gốc từng tin.
- Validate + `npm run build` PASS mới commit/deploy; FAIL → workflow đỏ.
- Bài hiện trên `/vi/blog`, `/en/blog` sau deploy (verify: build local với 1 bài mẫu sinh từ fixture → route render OK, rồi XOÁ bài mẫu, không commit).
- OpenCode Go endpoint + UA + `x-opencode-session`; secret không commit.
- typecheck / lint / build repo PASS; unit test PASS; reviewer PASS.

## Ngoài phạm vi
- Không sửa UI blog, loader, category. Không cài crontab/Python lên host. Không chạy workflow thật (cần secret user tự thêm).

## Retry / Escalation
Max 3 attempt; fail lần 3 → `architecture_review_needed`.

## Verification summary

### Builder attempt 1 (2026-10-14)

**Files (tạo mới):**
- `tools/ai-news/last30days/**` — vendor engine v3.18.4 (SKILL.md, agents/, references/, scripts/last30days.py, store.py,
  briefing.py, watchlist.py, lib/**) + `LICENSE` (MIT) ; sửa `scripts/ai-news-digest.sh`, `scripts/github-trending.sh`,
  `scripts/sanitize_brief.py`. Bỏ: setup-keychain/pass, test-*, test_*, evaluate_*, verify_v3, build-skill, compare,
  `gh-format.jq`, `lib/vendor/bird-search/` (JS client X, chỉ gọi qua subprocess khi có cookie; engine tự báo "not found").
- `tools/ai-news/generate.py`, `tools/ai-news/README.md`, `tools/ai-news/.gitignore`
- `tools/ai-news/tests/test_ai_news.py` + `tests/fixtures/{compact-raw.md,discover-raw.md,unknown-format-raw.md,digest.clean.md,items.json}`
- `public/images/blog/ai-weekly-cover.svg`, `.github/workflows/ai-news.yml`, `docs/runbook/ai-news.md`
- KHÔNG sửa `src/`, `deploy.yml`, `ci.yml`, eslint/tsconfig (không còn JS/TS trong `tools/ai-news`).

**Cách làm / quyết định:**
- 6 chỉnh sửa: (1) SKILL_DIR theo vị trí script; (2) `--days 7`, `GITHUB_DAYS=7`, stars 500→50; (3) discover có `--save-suffix`;
  (4) github-trending log→stderr, stdout rỗng khi rate-limit/lỗi, bỏ jq; (5) lọc `topic:` ai/llm/machine-learning/generative-ai/ai-agents
  (mỗi topic 1 query, gộp, dedupe); (6) **sanitize viết lại theo allow-list** — bản gốc chỉ bỏ dòng `Evidence:` nên vẫn lọt
  bình luận/Insight/Highlights/Why trong cluster, và bỏ sót output `--discover` (không có "Ranked Evidence Clusters").
  Bản mới chỉ giữ tiêu đề cluster + tiêu đề tin + URL (compact), tên chủ đề (discover); heading lạ → bỏ cả file.
  Luôn `--no-browser-cookies`; `timeout` 900s/topic; mỗi topic lỗi → bỏ qua, chỉ exit 3/4 khi không còn dữ liệu.
- Generator: model mặc định `glm-5.3` (env/var `AI_NEWS_MODEL`), endpoint `https://opencode.ai/inference/go/v1`
  (`AI_NEWS_BASE_URL`), UA `nta-web-ai-news/1.0`, `x-opencode-session: nta-web-ai-news`, timeout 180s, 3 lần thử
  (chỉ retry 429/5xx/lỗi mạng). Input cắt 60k ký tự, bọc delimiter, xoá delimiter trong dữ liệu.
- Guard: URL normalize nhẹ (scheme/host thường, bỏ fragment + `/` cuối) phải ∈ URL của `.clean.md`; chỉ http(s);
  dedupe URL; 5–12 tin; title 5–140, summary 20–420, source 2–60 ký tự; cấm URL/`www.` trong text; body 600–20000 ký tự;
  frontmatter đủ 6 field. Ghi file chỉ sau khi cả 2 bài qua guard (mở file mode `x`, không ghi đè).
- Render deterministic: title/excerpt frontmatter theo template (không lấy từ LLM), escape `\ \` * _ { } [ ] < > # | ~`
  + `-`/`+`/`1.` đầu dòng; URL link percent-encode ký tự phá cú pháp.
- Slug `ai-weekly-YYYY-wNN` theo ISO week giờ VN; `date` = ngày VN lúc chạy. Bài đã có → `status=skip`, exit 0 (check trước khi thu thập).
- Workflow: container **`node:22-trixie`** (engine yêu cầu Python ≥3.12 — smoke trên `node:22-bookworm` (Py 3.11) cả 4 topic
  exit 1 "requires Python 3.12+"), job `env` không dùng `runner.*` (không hợp lệ ở job-level) → dữ liệu tạm ở `/tmp/ai-news`
  trong container. Bước cuối `if: always()` xoá `node_modules`/`.next` + `chown` workspace về uid host (container chạy root,
  tránh checkout của `deploy.yml` lỗi quyền). Token `github.token` truyền vào github-trending dưới tên `AI_NEWS_GH_TOKEN`
  (tránh engine tự nhặt `GITHUB_TOKEN`).

**Verify:**
- Unit test: `MSYS_NO_PATHCONV=1 docker run --rm -v "D:/prj/nta-web:/w" -w /w python:3.12-slim python -m unittest discover -s tools/ai-news/tests -v`
  → `Ran 24 tests ... OK` — **PASS**.
- `npm run typecheck` → exit 0 — **PASS**. `npm run lint` → exit 0, 0 errors (1 warning có sẵn `src/components/mdx/index.tsx` no-img-element) — **PASS**.
- `npm run build` trên host Windows → FAIL `Failed to load next.config.ts … Failed to load native binding` (lỗi môi trường
  native binding trên máy dev, không liên quan task — project-config cũng ghi node_modules host có vấn đề).
  Build lại trong container giống workflow (`node:22-trixie`, copy repo trừ node_modules/.next/.git, `npm ci && npm run build`)
  với bài mẫu render từ fixture (`generate.py render --now 2026-10-12T08:00:00+07:00`) → `BUILD_EXIT=0`, route
  `/vi/blog/ai-weekly-2026-w42` + `/en/blog/ai-weekly-2026-w42` sinh `.html/.rsc` — **PASS**. Đã XOÁ 2 file bài mẫu.
- Smoke thu thập thật (`AI_NEWS_QUICK=1`, `node:22-trixie`): 4 topic exit 0 + GitHub trending 12 repo → `.clean.md` 128 dòng,
  24 URL; grep `evidence:|upvotes|why:|insight|highlights|best takes|stats|SYNTHESIS` = 0. Topic ai-models không có cụm đạt ngưỡng
  → sanitize bỏ qua (đúng thiết kế). Discover chỉ còn tên chủ đề (không URL).
- Không gọi LLM thật (không có key trên máy dev); không chạy workflow thật.

**Residual risk:**
- Chưa chạy workflow thật trên runner: chưa xác minh runner hỗ trợ `container:` (cần Docker — deploy.yml đã dùng docker compose
  nên khả năng cao OK) và bước `chown` trả quyền đúng uid.
- Chưa gọi OpenCode Go thật: tên model `glm-5.3` / endpoint / định dạng response cần xác nhận ở lần chạy tay đầu tiên.
- LICENSE: dòng copyright ghi chung "mvanhorn and last30days-skill contributors" — nên đối chiếu file LICENSE upstream.
- Mô tả repo GitHub là text tự do (untrusted) vẫn vào `.clean.md` (đã cắt 200 ký tự, bỏ xuống dòng, có banner).
- LLM vẫn có thể diễn giải sai ý tiêu đề (guard chỉ chặn URL lạ/độ dài) — rủi ro đã được user chấp nhận.
- Push bị từ chối nếu `main` có commit chen giữa lúc job chạy → workflow đỏ, chạy tay lại (ghi trong runbook).

### Review fix (primary, sau round 1)
- Reviewer round 1 PASS (STRICT) + 7 MINOR. Sửa #1–#6: render URL gốc từ allow-list; allow-list chỉ lấy dòng `- URL:`;
  escape `import`/`export` đầu đoạn bằng character reference; `npm ci --cache /tmp/...` + chown `$HOME`;
  checkout `persist-credentials: false`, push qua `x-access-token` URL; `.dockerignore` thêm `tools`. +2 test (26/26 PASS qua Docker).
- #7 (bài thứ 2 tuần N tổng hợp dữ liệu 7 ngày trước → nhãn "tuần N" lệch 1 tuần): giữ nguyên, chờ user chốt.
- Reviewer round 2 PASS — `.context/review-reports/feature-weekly-ai-news-digest-phase-1-task-01-round-2-review.md`.
