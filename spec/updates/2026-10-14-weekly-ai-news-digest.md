# Spec update — 2026-10-14 · change `weekly-ai-news-digest`

- **Spec version**: 3.12.0 → **3.13.0** (MINOR — thêm requirement R-09c)
- **Scope version**: v42 → **v43** (`feature-update`)
- **Trigger**: `feature-update` (change-request CR-019, ADDITIVE)
- **Change file**: `spec/changes/2026-10-14-weekly-ai-news-digest.md` (archive khi close-out)
- **Task**: `tasks/feature-weekly-ai-news-digest/phase-1-task-01.md`
- **Review**: `.context/review-reports/feature-weekly-ai-news-digest-phase-1-task-01-round-2-review.md`, round 2 **PASS**
  (round 1 PASS STRICT với 7 MINOR; #1–#6 đã sửa, #7 lệch nhãn tuần chờ user)
- Ghi chú: đoạn R-09c đã lỡ được commit cùng close-out CR-020 (`bccda08`) dưới nhãn 3.12.0 — sửa nhãn thành 3.13.0 ở update này.

## Thay đổi

**THÊM R-09c** — "Bản tin AI tuần" tự đăng lên Tin tức, không duyệt tay:
- `.github/workflows/ai-news.yml`: cron `0 1 * * 1` (08:00 thứ 2 giờ VN) + `workflow_dispatch`; `runs-on: [self-hosted, nta-web]`,
  `container: node:22-trixie` (Python 3.13 — engine cần ≥3.12); không cài gì lên host.
- `tools/ai-news/`: vendor `last30days` (MIT) + script in-house đã sửa (SKILL_DIR theo vị trí, `--days 7`, discover có suffix,
  github-trending log → stderr + lọc topic AI + 7 ngày, `--no-browser-cookies`, fail-soft từng nguồn) +
  `sanitize_brief.py` viết lại theo allow-list (chỉ tiêu đề + URL) + `generate.py` (OpenCode Go, guard, render MDX).
- Guard: URL phải nằm ở dòng `- URL:` của `.clean.md` (bài render URL gốc), 5–12 tin, cấm URL trong chữ, giới hạn độ dài,
  escape MDX (gồm `import`/`export` đầu đoạn), frontmatter do template sinh; `npm run build` PASS mới commit + dispatch deploy.
- Slug `ai-weekly-YYYY-wNN` (ISO week giờ VN), category `ai-tech`, cover `/images/blog/ai-weekly-cover.svg`; tuần đã có bài → skip.
- Runbook: `docs/runbook/ai-news.md` (secret `OPENCODE_API_KEY`, `vars.AI_NEWS_MODEL`, chạy tay, tắt cron, xử lý workflow đỏ).

## Ảnh hưởng test
- Bài `ai-weekly-*` xuất hiện ở `/blog`, `/en/blog` (lọc `ai-tech`, tìm kiếm, khối nổi bật/mới nhất) + trang chi tiết.
- Không đổi UI/loader blog; regression: danh sách/chi tiết blog hiện có.
