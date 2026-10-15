---
id: ai-news-naming-images
type: feature
status: in_progress
created: 2026-10-15
---

# Bản tin AI + Blog: nhãn "Nổi bật" → "Tin mới", tên bản tin theo ngày, ảnh thẻ bản tin lấy từ ảnh trong bài, breadcrumb chi tiết tin đồng bộ

## Yêu cầu
User (chat 2026-10-15):
- "tin nổi bật thành tin mới" → làm rõ: **nhãn** trên trang /blog.
- "sửa lại cái tên tuần → ngày bao nhiêu" → làm rõ: tên = "bản tin tuần" + **ngày** của bài.
- "sửa lại ảnh ở mấy cái tin" → làm rõ: là **ảnh thẻ bản tin ở danh sách /blog** (cover), KHÔNG phải ảnh trong từng tin.
  Ảnh cố định chung "trông dumb quá" → mỗi bản tin lấy 1 ảnh từ trong bài; không có thì dùng ảnh cố định.
  Ảnh trong từng tin giữ nguyên (og:image bài gốc — CR-035).
- Bổ sung: breadcrumb trang chi tiết tin tức chưa đồng bộ với breadcrumb các trang khác.

1. **Nhãn "Nổi bật" → "Tin mới"** ở khối highlight trang /blog
   (`src/components/blog/FeaturedPosts.tsx:27`, key `blog.highlightEyebrow`: vi `Nổi bật` → `Tin mới`; en `Featured` → `Latest`).
2. **Tên bản tin theo ngày:** `Bản tin AI tuần 42/2026` → `Bản tin AI tuần ngày 15/10/2026`
   (en: `AI Weekly Digest — 15 Oct 2026`); excerpt bỏ "tuần NN/YYYY", dùng ngày.
   Áp cho generator (`tools/ai-news/generate.py:190-193`) + bài `ai-weekly-2026-w42` đã đăng (trong DB).
3. **Ảnh thẻ bản tin (thẻ ở danh sách /blog) lấy từ ảnh trong bài:** hiện mọi số dùng chung SVG cố định
   `/images/blog/ai-weekly-cover.svg` (`tools/ai-news/generate.py:33` `COVER`). Đổi: `cover` = ảnh của **tin đầu tiên có ảnh**
   trong số đó (`/uploads/...`); số không có tin nào có ảnh → fallback ảnh cố định MỚI do user tự gen AI
   (`public/images/blog/ai-weekly-cover.webp`, 16:9, thay SVG cũ). File gốc user gửi 2026-10-15 (~1672×941, 68 KB):
   `spec/changes/assets/2026-10-15-ai-news-naming-images/ai-weekly-cover.webp` → copy vào `public/` (resize ~1200 nếu cần).
   KHÔNG dùng AI sinh ảnh (user chốt 2026-10-15). Ảnh trong từng tin **không đổi**.
4. **Breadcrumb chi tiết tin** (`src/components/blog/ArticleHeader.tsx:13`) đang dùng variant `plain`
   (chữ xám, chữ "Trang chủ"), trong khi các trang chi tiết khác (`DetailHero` — products/solutions/case-studies) dùng
   variant `pill` (viên thuốc, icon nhà, mục hiện tại màu thương hiệu) → đổi sang `pill` cho đồng bộ.

## Bối cảnh / tái hiện
- Route: `/blog` (nhãn), `/blog/<slug>` (breadcrumb, tên, ảnh) — vi + en.
- Generator: `tools/ai-news/generate.py`, workflow `.github/workflows/ai-news.yml` (cron 08:00 thứ 7 VN).
- LLM hiện tại: opencode gateway `glm-5.3` (`OPENCODE_API_KEY`) — chỉ text, **không sinh ảnh**.

## Acceptance (bắt buộc)
- [ ] /blog: nhãn khối highlight hiển thị "Tin mới" (vi) / "Latest" (en).
- [ ] Bài bản tin mới + bài w42: title/excerpt theo ngày (vi + en), không còn "tuần NN/YYYY". Slug giữ nguyên `ai-weekly-YYYY-wNN` (giữ URL).
- [ ] Thẻ bản tin ở /blog hiện ảnh của tin đầu tiên có ảnh; số không có ảnh nào → ảnh cố định `ai-weekly-cover.webp` (theo Yêu cầu §3; `ai-weekly-cover.svg` giữ lại cho version cũ/fixture, không dùng cho bài mới). Bài w42 đã đổi cover. Ảnh trong từng tin giữ nguyên.
- [ ] Breadcrumb `/blog/<slug>` dùng cùng kiểu `pill` với các trang chi tiết khác; desktop + mobile không vỡ (tiêu đề dài).
- [ ] Test `tools/ai-news/tests/` cập nhật + PASS; typecheck/lint/build PASS.

## Open questions
- Không còn — đã chốt hết (2026-10-15).

## Ghi chú
Liên quan R-09c (spec 4.4.0), CR-035 (ảnh tin), CR-036 (cron thứ 7). Bài đã lên DB sau cutover (CR-034) → sửa bài w42 qua DB/CLI content.
`ArticleHeader` (đầu trang chi tiết) không render `cover` → không bị lặp ảnh tin 1 ở trang chi tiết. Cần check OG/meta image + JSON-LD dùng `cover` vẫn hợp lệ (ảnh `/uploads` raster tốt hơn SVG cho OG).
