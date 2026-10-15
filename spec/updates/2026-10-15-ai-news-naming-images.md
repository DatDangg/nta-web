# Spec update — 2026-10-15 · change `ai-news-naming-images`

- **Spec version**: 4.5.0 → **4.6.0** (MINOR — sửa R-09c, R-09a, R-09: đổi hành vi hiển thị/sinh bài)
- **Scope version**: v55 → **v56** (`feature-update`)
- **Trigger**: `feature-update` (change-request CR-038, MODIFY, risk medium)
- **Change file**: `spec/changes/2026-10-15-ai-news-naming-images.md`
- **Tasks**: `tasks/feature-ai-news-naming-images/phase-1-task-01.md` (nhãn "Tin mới" + breadcrumb pill),
  `phase-1-task-02.md` (generator tên theo ngày + cover ảnh tin + fallback webp), `phase-1-task-03.md` (sửa bài w42 file seed + DB)
- **Thời điểm phát hành**: bước planning — hiệu lực khi phase 1 PASS và bài w42 đã sửa trong DB

## Thay đổi

**SỬA R-09c** — bản tin AI tuần:
- Tên theo **ngày** của bài (`date` frontmatter): vi `Bản tin AI tuần ngày DD/MM/YYYY`, en `AI Weekly Digest — D Mon YYYY`;
  excerpt vi `N điểm tin AI đáng chú ý trong bản tin ngày DD/MM/YYYY, kèm link nguồn gốc.`,
  en `N notable AI news items in the digest of D Mon YYYY, with links to the original sources.` Slug giữ `ai-weekly-YYYY-wNN`.
- `cover` = ảnh của **tin đầu tiên có ảnh** (`/uploads/<sha256>.<ext>`); không có ảnh nào → `/images/blog/ai-weekly-cover.webp`
  (ảnh user cung cấp, thay SVG cố định cho bài mới). `ai-weekly-cover.svg` giữ lại (version cũ + fixture còn tham chiếu).
- Bài đã đăng `ai-weekly-2026-w42` sửa theo quy tắc mới ở file seed + DB (version mới qua `updateEntry`, backup trước, revalidate).

**SỬA R-09a** — thẻ highlight khối nổi bật: nhãn `Nổi bật`/`Featured` → **`Tin mới`/`Latest`** (`blog.highlightEyebrow`).

**SỬA R-09** — breadcrumb trang chi tiết `/blog/[slug]` dùng kiểu **pill** như `DetailHero` (thay `plain`).

- Không đổi: slug/URL, body bài, ảnh trong từng tin, og:image/JSON-LD bài blog, schema DB, API, lịch cron.

## Ảnh hưởng test
- Trực tiếp: `/blog` + `/en/blog` (nhãn thẻ, ảnh thẻ w42), `/blog/<slug>` (breadcrumb pill, tiêu đề w42), `tools/ai-news/generate.py`
  (title/excerpt/cover).
- Phụ thuộc: `BlogPostCard`, `PostCard` (trang chủ/bài liên quan), `publish-post` (I-7 với cover), `content-cli update` + revalidate.
- Regression: các bài khác, ảnh từng tin, `AI_NEWS_IMAGES=off`, dedupe tuần, breadcrumb pill các trang khác.
- Chi tiết: `spec/test-scope/current.json` (scope v56).
