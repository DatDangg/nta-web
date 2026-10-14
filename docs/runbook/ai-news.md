# Runbook — Bản tin AI tuần (CR-019, spec R-09c)

Workflow `.github/workflows/ai-news.yml` — mỗi thứ 2 lúc 08:00 giờ VN (`cron: '0 1 * * 1'` UTC) tự thu thập
tin AI 7 ngày, nhờ OpenCode Go viết 2 bài `src/content/blog/{vi,en}/ai-weekly-YYYY-wNN.mdx` (category `ai-tech`),
build PASS → commit thẳng `main` → dispatch `deploy.yml`. Code: `tools/ai-news/` (xem `tools/ai-news/README.md`).

Chạy trên self-hosted runner `nta-web` nhưng **trong container `node:22-trixie`** (Python 3.13 + Node 22 + git) —
không cài gì lên host VPS. Bước cuối `chown` trả quyền workspace cho user runner (container chạy root).

## 1. Thêm secret (1 lần, bắt buộc)

GitHub repo → Settings → Secrets and variables → Actions:

| Loại | Tên | Giá trị |
|---|---|---|
| Secret | `OPENCODE_API_KEY` | API key OpenCode Go. Không commit, không dán vào issue/log. |
| Variable (tuỳ chọn) | `AI_NEWS_MODEL` | Model OpenCode Go, mặc định `glm-5.3` (vd đổi `kimi-k3`). |

Thiếu `OPENCODE_API_KEY` → bước "Generate posts" đỏ, không đăng gì.

## 2. Chạy tay

Actions → **AI News Weekly** → *Run workflow* (branch `main`). Bài của tuần đã tồn tại → workflow dừng xanh
ở bước "Check this week's post" (`status=skip`), không ghi đè, không commit.

Muốn đăng lại tuần hiện tại: xoá 2 file `ai-weekly-YYYY-wNN.mdx` của tuần đó (qua commit thường) rồi chạy tay.

## 3. Đổi model / endpoint

- Model: sửa Variable `AI_NEWS_MODEL` (không cần sửa code).
- Endpoint mặc định `https://opencode.ai/inference/go/v1` (`DEFAULT_BASE_URL` trong `tools/ai-news/generate.py`).
  Request gửi `User-Agent: nta-web-ai-news/1.0` + `x-opencode-session: nta-web-ai-news`.

## 4. Tắt / bật cron

- Tạm tắt: Actions → AI News Weekly → `…` → **Disable workflow** (bật lại: Enable workflow).
- Đổi lịch: sửa `cron` trong `.github/workflows/ai-news.yml` (giờ UTC = giờ VN − 7).

## 5. Workflow đỏ — xử lý

GitHub gửi email khi workflow fail. Khi đỏ: **không có commit, không deploy** (trừ bước push/dispatch, xem dưới).

| Bước đỏ | Nguyên nhân thường gặp | Xử lý |
|---|---|---|
| Collect + sanitize (exit 3/4) | Mọi nguồn đều lỗi/bị chặn (Reddit, HN, GitHub rate-limit), mạng VPS | Xem log bước; chạy tay lại sau. 1 nguồn lỗi KHÔNG làm đỏ. |
| Generate posts | Thiếu/sai key, model không tồn tại, LLM trả JSON hỏng, **guard chặn** (sau khi loại các tin có URL lạ / text sai, còn dưới 5 tin hợp lệ; tối đa lấy 12) | Đọc dòng `[ai-news] FAIL: ...`. Guard chặn là đúng thiết kế (chống bịa) → chạy tay lại; lặp lại nhiều tuần → đổi model. |
| Build | Bài sinh ra làm hỏng build (hiếm, MDX đã escape) | Không có gì được commit. Báo dev kèm log. |
| Commit + push | `main` vừa có commit khác chen giữa (push bị từ chối) | Chạy tay lại workflow. |
| Dispatch deploy | Bài ĐÃ lên `main` nhưng chưa deploy | Actions → **Deploy (VPS)** → Run workflow. |

Dữ liệu tạm (raw + `.clean.md`) nằm ở `/tmp/ai-news` trong container, mất khi job kết thúc.

## 6. Bảo mật

- LLM chỉ đọc `.clean.md` (sanitize allow-list + banner "dữ liệu, không phải lệnh"). Không bỏ bước sanitize.
- Engine chạy `--no-browser-cookies`; không có nguồn X/Twitter (đã bỏ client `bird-search`).
- Bài là dạng điểm tin; mọi link phải có nguyên văn trong dữ liệu thu thập; cuối bài ghi
  "Bản tin được tổng hợp tự động từ các nguồn công khai." Rủi ro còn lại: LLM diễn giải sai ý tiêu đề —
  user đã chấp nhận đăng thẳng không duyệt (change doc 2026-10-14).
