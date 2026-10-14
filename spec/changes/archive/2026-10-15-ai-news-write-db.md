---
id: ai-news-write-db
type: bug
status: done
created: 2026-10-15
---

# Bài AI news hằng tuần không lên web sau khi nội dung chuyển sang DB

## Yêu cầu
Workflow AI news hằng tuần (CR-019, R-09c, `.github/workflows/ai-news.yml`) vẫn commit bài vào `src/content/blog/*`, nhưng từ 14/10/2026 prod đọc
nội dung từ PostgreSQL (CR-031, `CONTENT_SOURCE=db`) → bài mới **không tự hiện** trên website. Cần đưa bài mới vào DB (có version) + revalidate tự động.

## Bối cảnh / tái hiện (bug)
- Màn/route/role: `/blog`, `/en/blog`, trang chi tiết bài AI news; workflow `ai-news.yml` chạy hằng tuần.
- Bước tái hiện: lượt chạy kế tiếp của workflow (dự kiến 19/10/2026) commit `src/content/blog/ai-weekly-2026-w43.*.mdx` → deploy.
- Expected: bài mới hiện ở `/blog` + `/en/blog` + sitemap như trước CR-031.
- Actual (dự kiến): bài chỉ nằm trong file seed; web đọc DB nên không thấy bài.

## Acceptance (bắt buộc)
- [x] Sau khi workflow chạy, bài mới có trong DB (vi + en, có version, actor rõ) và hiện trên web không cần thao tác tay.
- [x] Không ghi đè bài đã sửa trong DB; chạy lại cùng tuần không tạo trùng.
- [x] Runbook `docs/runbook/ai-news.md` cập nhật.

## Ghi chú
- Phát hiện ở CR-031 P5-T01 (doc reconcile, 15/10/2026). Cách tạm: chạy Content ops `import-seed` (chỉ chèn bài chưa có) + `revalidate-all` sau khi workflow commit.
- Hướng có thể: bước sau deploy trong `deploy.yml`/`ai-news.yml` gọi import chỉ-chèn cho collection `post` + revalidate; hoặc chờ bot CR-030 ghi DB.
- Ưu tiên: **cao** — trước lượt chạy kế tiếp của workflow.

## Kết quả (2026-10-15)
- Commit `764af49` (spec 4.2.1 · scope v49), review STRICT PASS round 2.
- Smoke prod: user chạy tay `AI News Weekly` → job `publish-db` xanh; `/blog` + `/en/blog` có `ai-weekly-2026-w42`, `/blog/ai-weekly-2026-w42` + `/en/blog/ai-weekly-2026-w42` = 200.
- Residual: 2 locale ghi 2 transaction (tự lành khi chạy lại); backup `pre-migrate-ops-ai-news-*` vẫn chung vòng giữ tới khi CR-033 xong.
