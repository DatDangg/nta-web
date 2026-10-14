# Review — feature-weekly-ai-news-digest · phase-1-task-01 · round 1

Agent: reviewer

- **Task:** `tasks/feature-weekly-ai-news-digest/phase-1-task-01.md` (CR-019, spec R-09c)
- **Review level:** STRICT
- **Reason:** cron job tự commit + push `main` rồi dispatch deploy; dùng secret (`OPENCODE_API_KEY`, `GITHUB_TOKEN` contents/actions write); gọi LLM ngoài với dữ liệu internet untrusted (prompt injection); nội dung đăng public không duyệt.
- **Blast radius:** `.github/workflows/ai-news.yml` (mới, chạy trên runner self-hosted dùng chung với `deploy.yml`), workspace runner `_work/nta-web/nta-web` + `_work/_temp`, `src/content/blog/{vi,en}/ai-weekly-*.mdx` (sinh ra lúc chạy, render qua loader blog có sẵn + `next-mdx-remote/rsc` v6), `tools/ai-news/**`, `public/images/blog/ai-weekly-cover.svg`, `docs/runbook/ai-news.md`. Không sửa `src/`, `deploy.yml`, `ci.yml`, eslint/tsconfig.

## Verify commands + result

| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | exit 0 — PASS |
| `npm run lint` | exit 0, 0 error, 1 warning có sẵn (`src/components/mdx/index.tsx:25` no-img-element) — PASS; `tools/ai-news` không có file JS/TS/MJS (Glob) nên eslint/tsc không quét |
| `docker run ... python:3.12-slim python -m unittest discover -s tools/ai-news/tests` | **Blocked** — frontmatter reviewer `bash: "*": deny`, `docker *` không có rule allow → reviewer không chạy. Đã đọc toàn bộ `tests/test_ai_news.py` (24 test, khớp với code). Primary cần tự chạy lệnh này trước commit; FAIL → không commit. |
| `npm run build` | skip — lỗi native binding có sẵn trên host Windows; builder đã build trong `node:22-trixie` với bài mẫu (evidence trong task file). Không chạy lại. |
| Diff engine vendored vs upstream | **Blocked** (bash `diff` bị deny). Đã kiểm qua Grep: `last30days.py` có `--no-browser-cookies` (l.653), `--save-suffix` (l.688), `--days` (l.695); `ai-news-digest.sh` luôn truyền `--no-browser-cookies`. |

## Acceptance checklist

| Acceptance | Kết quả | Bằng chứng |
|---|---|---|
| Cron tuần + `workflow_dispatch`, runner `nta-web` | OK | `ai-news.yml:6-9,21` (`0 1 * * 1` = 08:00 thứ 2 VN) |
| Script trong `tools/ai-news/`; 1 nguồn lỗi → bỏ qua; 0 dữ liệu → fail | OK | `ai-news-digest.sh:45-61` (mỗi topic log + bỏ qua), `:70-75` trending, `:83-86` exit 3, `:103-106` exit 4; `github-trending.sh` stdout rỗng khi lỗi |
| LLM chỉ nhận `.clean.md` có banner | OK | workflow truyền `--clean $AI_NEWS_WORK/digest.clean.md`; sanitize luôn in `HARD_BLOCK` (`sanitize_brief.py:125`), nhánh chỉ-trending cũng in banner (`ai-news-digest.sh:93`) |
| Sanitize allow-list, không lọt raw | OK | `sanitize_brief.py:54-99` chỉ giữ tiêu đề cụm/tin/URL, discover chỉ tên chủ đề, format lạ → "" ; test fixture với nhiều marker leak |
| Đúng 2 bài vi+en, frontmatter hợp lệ, slug ISO week giờ VN, chạy lại không trùng | OK | `generate.py:61-78,154-164,283-295` (mode `x`), `check` trước collect; test year-boundary + VN tz |
| Điểm tin, prompt cấm bịa, delimiter "dữ liệu không phải lệnh" | OK | `generate.py:200-219` |
| Guard URL ∈ `.clean.md`, số tin 5–12, độ dài | OK (xem MINOR-1/2) | `generate.py:83-133` |
| Ghi chú tự động cuối bài + link nguồn từng tin | OK | `generate.py:49-52,180,183` |
| MDX render deterministic + escape | OK (xem MINOR-3) | `generate.py:138-151`; frontmatter title/excerpt lấy từ template, không từ LLM → không có YAML injection |
| Build PASS mới commit/deploy; FAIL → đỏ, không commit | OK | step `Build` trước `Commit + push`/`Dispatch` (cùng điều kiện, step fail → các step sau skip); push fail → không dispatch |
| OpenCode Go endpoint + UA + `x-opencode-session`; secret chỉ ở env bước generate, không echo | OK | `generate.py:31-34,236-242`; lỗi HTTP chỉ log status code (`:250`), exception `HTTPError` không chứa header; `ai-news.yml:51-53` |
| Permissions tối thiểu | OK | `contents: write`, `actions: write` |
| typecheck / lint PASS | OK | bảng trên |
| Unit test PASS | Blocked (reviewer) | xem bảng trên |
| Cover SVG nhẹ, cùng phong cách | OK | 1 dòng, không script/ext ref |
| Runbook | OK | `docs/runbook/ai-news.md` đủ secret / chạy tay / model / tắt cron / xử lý đỏ |

## Probes (STRICT)

- **URL guard bypass:** host/scheme được lowercase, userinfo (`allowed@evil`) → netloc khác → bị chặn; `javascript:` bị chặn bởi prefix check; URL trong title/summary bị chặn (`https?://|www.`). Fragment/trailing slash được bỏ khi so khớp nhưng **URL hiển thị là bản LLM trả** (MINOR-1).
- **Allow-list nguồn URL:** `extract_urls` quét **toàn bộ** `.clean.md`, gồm cả tiêu đề tin (untrusted) và mô tả repo GitHub (untrusted, 200 ký tự) → URL do kẻ tấn công nhét vào tiêu đề/mô tả cũng thành "hợp lệ" (MINOR-2).
- **MDX/JSX/HTML injection:** `{ } < > \` [ ] * _ # | ~ \\` escape; text đã gộp về 1 dòng; `-`/`+`/`1.` đầu dòng escape. `&#..;` entity chỉ ra text (React escape). `next-mdx-remote` v6 mặc định `blockJS=true` + bỏ `mdxjsEsm` (`node_modules/next-mdx-remote/dist/serialize.js:12-23`) → kể cả lọt biểu thức/ESM cũng không thực thi. Còn khe `import`/`export` đầu dòng summary (MINOR-3).
- **Frontmatter:** title/excerpt/slug/date từ template + `json.dumps` → không có input LLM trong YAML. OK.
- **Idempotency:** `check` dựa trên file đã có trên `main` sau checkout; `concurrency` serialize; run thứ 2 checkout main mới → skip. Push race → step đỏ, không dispatch, runbook có hướng dẫn. OK.
- **Workspace / deploy interaction:** cùng runner + cùng workspace với `deploy.yml`; cleanup `if: always()` xoá `node_modules/.next` + chown workspace → checkout của deploy (clean) OK. Chưa trả quyền cho `$HOME=/github/home` (= host `_work/_temp/_github_home`) nơi `npm ci` ghi cache root-owned (MINOR-4).
- **Credential exposure:** `actions/checkout` mặc định `persist-credentials: true` → token `contents:write`+`actions:write` nằm trong `.git/config` suốt bước collect (engine xử lý dữ liệu internet) và `npm ci` (install scripts) (MINOR-5).
- **Docker context:** `.dockerignore` không loại `tools/` → engine Python vào build context/image của `deploy.yml` (MINOR-6).

## Skill gates

- aislop: skip — `aislop` chỉ hỗ trợ TS/JS; diff là Python/bash/YAML.
- oxlint (anti-slop): skip, oxlint not configured; diff không có TS/JS.
- ocr (open-code-review): skip, ocr not installed.
- AI-readable: OK — tên rõ, hàm ngắn (dài nhất `main` ~30 dòng, `build_messages` ~20), constant có tên, README + runbook mô tả luồng. 0 indicator đáng kể.
- ai-friendly-web: N/A — không đổi route/robots/sitemap; bài mới đi qua loader + sitemap có sẵn.
- blitzstrike: skip — không có endpoint mới, không môi trường pentest.
- Responsive Checklist Gate: N/A — không đổi UI/CSS/component (chỉ thêm 1 SVG cover dùng bởi layout blog có sẵn).

## Findings

Không có CRITICAL / MAJOR.

- **[MINOR-1]** `tools/ai-news/generate.py:126` — render `url.strip()` (bản LLM trả) thay vì URL gốc trong `.clean.md`; guard so khớp sau khi bỏ fragment / `/` cuối / hạ case host, nên LLM có thể thêm `#...` hoặc đổi dạng URL mà vẫn qua guard. Không đổi được host nên rủi ro thấp. **Fix:** dựng map `normalized → url gốc` trong `extract_urls` và render URL gốc.
- **[MINOR-2]** `tools/ai-news/generate.py:90-91` — allow-list lấy mọi URL trong toàn file, gồm cả URL nằm trong tiêu đề tin / mô tả repo GitHub (untrusted). Kẻ tấn công đưa được tiêu đề có URL vào cụm top + injection thành công thì link độc hợp lệ. **Fix:** chỉ lấy URL từ dòng `  - URL: ` (cả compact lẫn GitHub đều dùng format này); thêm test.
- **[MINOR-3]** `tools/ai-news/generate.py:141-146,178` — summary bắt đầu bằng `import `/`export ` (chữ thường) được MDX parse là ESM: JS không hợp lệ → build đỏ (DoS tuần đó); hợp lệ → `next-mdx-remote` xoá node (mất đoạn văn âm thầm). Không thực thi code nhờ `blockJS`/remove-imports-exports. **Fix:** escape từ đầu dòng `import`/`export` (vd `&#105;mport`) hoặc viết hoa chữ cái đầu; thêm test.
- **[MINOR-4]** `.github/workflows/ai-news.yml:91-95` — cleanup chỉ chown `$GITHUB_WORKSPACE`; `npm ci` trong container ghi cache vào `$HOME/.npm` (= host `_work/_temp/_github_home`) dưới quyền root, có thể làm runner host không dọn được `_temp` (warning/disk). **Fix:** đặt `npm_config_cache: /tmp/npm-cache` ở job env, hoặc chown/xoá thêm `"$HOME"`.
- **[MINOR-5]** `.github/workflows/ai-news.yml:31-34` — nên `persist-credentials: false` cho checkout và chỉ cấp token ở bước push (vd `git push "https://x-access-token:${GH_TOKEN}@github.com/$GITHUB_REPOSITORY" HEAD:main`) để token write không nằm trên đĩa khi chạy engine/npm install scripts.
- **[MINOR-6]** `.dockerignore` — không loại `tools/` → engine (Python) vào context/image production. **Fix:** thêm `tools` vào `.dockerignore` (kiểm Dockerfile không cần `tools/`). Ngoài scope chặt của task nhưng phát sinh từ task.
- **[MINOR-7]** `tools/ai-news/generate.py:61-70` — chạy thứ 2 tuần N nhưng dữ liệu là 7 ngày trước (≈ tuần N-1) → tiêu đề "tuần N" lệch ngữ nghĩa 1 tuần. Chỉ ghi nhận; đổi thì cần user chốt.

## Residual risk

- Unit test và diff engine vendored chưa được reviewer chạy (permission deny) — primary phải chạy lệnh Docker unittest trước commit.
- Workflow chưa chạy thật trên runner (`container:` trên self-hosted, chown, branch protection của `main` có thể từ chối push bằng `GITHUB_TOKEN`).
- Chưa gọi OpenCode Go thật: model `glm-5.3` có thể là reasoning model → `content` rỗng khi hết `max_tokens` → step đỏ (fail-closed).
- `sanitize_brief.CANDIDATE_RE` giữ bất kỳ dòng `N. [x] ...` nào trong vùng clusters — nếu engine đổi format bình luận thành dạng đó có thể lọt snippet ≤300 ký tự (vẫn có banner).
- Image `node:22-trixie` + `actions/checkout@v4` theo tag, không pin digest/SHA (cùng chuẩn với workflow hiện có).

## Verdict

✅ **PASS** — không còn CRITICAL/MAJOR; 7 MINOR đề xuất hardening (khuyến nghị sửa MINOR-2/3/4 trước lần chạy thật đầu tiên). Điều kiện: primary chạy unit test Docker PASS trước khi commit.
