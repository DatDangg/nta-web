# 01 — Site map: URL ↔ bản ghi nội dung

## Kiến trúc nhanh

- Next.js 15 (App Router) + `next-intl`. Nội dung đọc từ **PostgreSQL** (`content_entries`) — mô hình ở `08`.
  Bản ghi = (`collection`, `locale`, `slug`) → `data` (JSON) + `body` (MDX).
- 2 ngôn ngữ: `vi` (mặc định, URL không prefix) và `en` (URL prefix `/en`).
  Ví dụ: `/blog/first-steps` (vi) ↔ `/en/blog/first-steps` (en) ↔ bản ghi `post/vi/first-steps`, `post/en/first-steps`.
- Trang được cache; ghi DB xong phải `revalidate` (`05` §0) thì web mới hiện nội dung mới. Không cần build/deploy.
- Lưới an toàn = write-path (`08` §4): thiếu field / sai enum / ảnh không tồn tại → CLI từ chối, không ghi.
- Domain canonical: `https://ntavietnam.tech`.

## Bảng route

| URL (vi; en thêm `/en`) | Bản ghi | Ghi chú |
|---|---|---|
| `/` | `home/<locale>/home` + case study / giải pháp / sản phẩm + `ui_messages/<locale>/home` | Trang chủ |
| `/about` | `about/<locale>/about` + `ui_messages/<locale>/about` | `mission`, `milestones`, `partners` |
| `/blog` | mọi `post/<locale>/*`, sắp theo `date` giảm dần | Lọc theo `category` |
| `/blog/<slug>` | `post/<locale>/<slug>` | `body` markdown/MDX |
| `/solutions/enterprise` · `/solutions/ai` | `listing_page/<locale>/{enterprise,ai}` + giải pháp theo `slug_registry` (`sortOrder`) | Danh sách |
| `/solutions/enterprise/<slug>` | `solution/<locale>/<slug>` với `category: enterprise` | Trang chi tiết = **block `showcase`** |
| `/solutions/ai/<slug>` | `solution/<locale>/<slug>` với `category: ai` | Trang chi tiết = **block `showcase`** |
| `/products` · `/products/<slug>` | `listing_page/<locale>/products` · `product/<locale>/<slug>` | Chi tiết = **block `showcase`** |
| `/case-studies` · `/case-studies/<slug>` | `listing_page/<locale>/caseStudies` · `case_study/<locale>/<slug>`, sắp `year` giảm dần rồi slug | `layout: showcase` → render `showcase`; khác → layout mặc định |
| `/contact` | `ui_messages/<locale>/contact` + `company_info/<locale>/contact` | Form gửi qua API, không lưu |
| Menu / footer (mọi trang) | `ui_messages/<locale>/{nav,footer}` + `company_info` | |

> **Quan trọng:** trang chi tiết giải pháp / sản phẩm / case study `layout: showcase` **chỉ render block
> `showcase`** trong `data`. Các field cấp ngoài (`features`, `benefits`, `sections`, `faq`, `useCases`…)
> dùng cho thẻ danh sách, mega menu, tìm kiếm, hoặc là dữ liệu cũ. Người dùng nói "sửa nội dung trang X"
> → gần như luôn là sửa trong `data.showcase`.

## Hiện trạng (snapshot 2026-10-15 — luôn `list` lại trước khi dùng)

| Loại | Slug |
|---|---|
| Giải pháp enterprise | `crm`, `hrm`, `lms`, `dentgo` |
| Giải pháp AI | `boxai`, `flycam`, `custom-ai`, `fridayai`, `ai-operations-brain` |
| Sản phẩm | `music-app`, `hair-style-ai` |
| Case study | `dental-clinic-operations`, `heritage-site-ai-camera` |
| Blog | `first-steps`, `digital-workflows`, `learning-content`, `responsible-ai`, `ai-weekly-*` |

Bài `ai-weekly-YYYY-wNN` do workflow tự động `.github/workflows/ai-news.yml` đăng vào DB mỗi thứ 7
(`docs/runbook/ai-news.md`) — bot **không** sửa/ghi đè các bài này trừ khi người duyệt yêu cầu rõ.
