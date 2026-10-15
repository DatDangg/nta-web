---
id: ai-news-cron-saturday
type: feature
status: in_progress
created: 2026-10-15
---

# Bản tin AI tuần: đổi lịch cron từ thứ 2 sang thứ 7 hằng tuần

## Yêu cầu
User (15/10): "đổi ngày chạy cron là vào thứ 7 hàng tuần".
Hiện workflow `.github/workflows/ai-news.yml` chạy 08:00 thứ 2 giờ VN (`cron: '0 1 * * 1'` UTC). Đổi sang thứ 7 hằng tuần.
Giờ chạy: **08:00 thứ 7 giờ VN** (user chốt 15/10) → `cron: '0 1 * * 6'` (UTC).

## Bối cảnh / tái hiện (bug)
- Không áp dụng (feature).

## Acceptance (bắt buộc)
- [ ] `ai-news.yml` chạy tự động 08:00 thứ 7 giờ VN (`0 1 * * 6` UTC), không còn lịch thứ 2; `workflow_dispatch` giữ nguyên.
- [ ] Slug bài vẫn theo ISO week giờ VN (`ai-weekly-<năm>-w<tuần>`), mỗi tuần tối đa 1 bài; không đổi bài các tuần cũ.
- [ ] Spec R-09c, runbook `docs/runbook/ai-news.md` (dòng lịch chạy) và comment trong workflow ghi đúng lịch mới.

## Ghi chú
- Slug tính theo ISO week (thứ 2 → CN) ở `tools/ai-news/generate.py` `week_info`. Thứ 7 vẫn thuộc tuần ISO hiện tại → bài thứ 7 là bản tin của chính tuần đó (trước đây thứ 2 đăng bài mang số tuần mới).
- Lượt thứ 7 17/10 rơi vào w42 — w42 đã có (vừa sinh lại 15/10) → `skip`. Bài tự động kế tiếp: thứ 7 24/10 (w43). Không còn lượt thứ 2 19/10.
- Câu mở bài "trong tuần qua" vẫn đúng ngữ nghĩa; nguồn tin last30days không phụ thuộc thứ.
- Không đổi DB/schema; job `publish-db` không phụ thuộc thứ.
