# Spec update — 2026-10-15 · change `ai-news-write-db`

- **Spec version**: 4.2.0 → **4.2.1** (PATCH — làm rõ cách "đăng" của R-09c sau cutover DB; ý định nghiệp vụ không đổi)
- **Scope version**: v48 → **v49** (`bug-fix`)
- **Trigger**: `bug-fix` (change-request CR-034, BUG)
- **Change file**: `spec/changes/2026-10-15-ai-news-write-db.md`
- **Task**: `tasks/bug-ai-news-write-db/phase-1-task-01.md`
- **Review**: `.context/review-reports/bug-ai-news-write-db-phase-1-task-01-round-2-review.md`, round 2 **PASS** (STRICT)

## Thay đổi

**SỬA R-09c** — "Bản tin AI tuần" (CR-019). Trước: đăng = commit file seed `src/content/blog/{vi,en}/ai-weekly-*.mdx` + dispatch `deploy.yml`.
Từ CR-031 (R-16) prod đọc nội dung từ PostgreSQL → bài chỉ nằm trong file, không lên web. Sau:
- Job `digest` vẫn commit file seed lên `main` (lịch sử + dedupe tuần); guard + `npm run build` giữ nguyên.
- Job mới `publish-db` (host runner, concurrency `deploy-nta-web`, chỉ `main`, secret DB/revalidate chỉ ở job này):
  `publish-post --dry-run` (validate cả vi+en, báo `missing|exists`) → có `missing` thì backup DB → `publish-post --confirm-prod`
  chỉ-thêm-mới qua `createEntry` (version 1, `content_versions` op `create`, actor `workflow:ai-news`, note có run id; bản đã có
  kể cả đã sửa/xoá mềm → `exists`, không ghi đè/không khôi phục) → revalidate collection `post` → smoke 2 URL vi/en.
- **Bỏ** dispatch `deploy.yml`.
- CLI `content-cli.ts`: cờ theo lệnh (`--dry-run`/`--actor` chỉ `publish-post`; `--note` chỉ `rollback`/`publish-post`), cờ sai lệnh → lỗi usage (exit 2), không chạm DB.
- Giữ nguyên: tự đăng hằng tuần, không duyệt tay.

## Ảnh hưởng test
- Workflow ai-news (job `publish-db`), CLI `publish-post` / kiểm cờ, `/blog` + `/en/blog` + chi tiết bài + sitemap.
- Regression: Content ops (`revalidate --all`, `upload`, `rollback`), deploy.yml không đổi, blog hiện có.
- Chi tiết: `spec/test-scope/current.json` (scope v49).
