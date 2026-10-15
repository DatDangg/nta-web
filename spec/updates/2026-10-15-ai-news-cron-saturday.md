# Spec update — 2026-10-15 · change `ai-news-cron-saturday`

- **Spec version**: 4.3.0 → **4.4.0** (MINOR — đổi behavior quan sát được: ngày đăng bài AI tuần)
- **Scope version**: v53 → **v54** (`feature-update`)
- **Trigger**: `feature-update` (change-request CR-036, MODIFY, risk low)
- **Change file**: `spec/changes/2026-10-15-ai-news-cron-saturday.md`
- **Task**: `tasks/feature-ai-news-cron-saturday/phase-1-task-01.md` (user duyệt 2026-10-15)
- **Thời điểm phát hành**: bước planning — hiệu lực khi task PASS

## Thay đổi

**SỬA R-09c** — "Bản tin AI tuần" (CR-019):
- Lịch cron: 08:00 **thứ 2** giờ VN → 08:00 **thứ 7** giờ VN (`0 1 * * 6` UTC). `workflow_dispatch` giữ nguyên.
- Thêm: bài thứ 7 mang số ISO week của chính tuần đó (thứ 2 → CN, giờ VN); `date` frontmatter = ngày chạy;
  mỗi tuần tối đa 1 bài, bài các tuần cũ không đổi.
- Không đổi: `generate.py` (week_info dùng `isocalendar()` giờ VN), guard, ảnh từng tin, job `publish-db`, route/UI/API/DB.

## Hệ quả vận hành
- Thứ 7 17/10/2026 (w42): bài w42 đã có → `skip` (publish-db vẫn chạy tự lành, insert-only).
- Bài tự động kế tiếp: thứ 7 24/10/2026 → `ai-weekly-2026-w43`. Không còn lượt thứ 2 19/10.

## Ảnh hưởng test
- Trực tiếp: `.github/workflows/ai-news.yml` lịch `0 1 * * 6`; doc runbook/README/DESIGN/content-bot ghi đúng lịch mới.
- Regression: slug ISO week giờ VN, dedupe tuần, test Python `tools/ai-news` không đổi.
- Chi tiết: `spec/test-scope/current.json` (scope v54).
