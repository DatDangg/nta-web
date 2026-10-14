---
id: blog-article-typography
type: bug
status: done
created: 2026-10-14
---

# Trang chi tiết bài Tin tức không có style nội dung → Bản tin AI tuần hiển thị như text thô

## Yêu cầu
Bài "Bản tin AI tuần" do pipeline CR-019 tự sinh hiển thị rất xấu: tiêu đề từng tin (`##`), đoạn tóm tắt
và dòng "Source/Nguồn" dính liền nhau thành một khối chữ thường, không có khoảng cách, không phân cấp.
Cần khung trình bày nội dung bài viết đúng chuẩn (heading, đoạn, link, list…) cho mọi bài Tin tức,
và trình bày Bản tin AI tuần dễ đọc theo dạng điểm tin.

## Bối cảnh / tái hiện (bug)
- Màn/route/role: `/[locale]/blog/[slug]` — vd https://ntavietnam.tech/en/blog/ai-weekly-2026-w42 (cả `/vi/...`), khách vãng lai.
- Bước tái hiện: mở bài `ai-weekly-2026-w42`, cuộn xuống phần thân bài.
- Expected: mỗi tin có tiêu đề nổi bật (cỡ chữ/đậm lớn hơn), khoảng cách giữa các tin, đoạn tóm tắt tách dòng, link nguồn nhận diện được là link.
- Actual: "1. Character.ai initiates…" có cùng cỡ/độ đậm với đoạn văn, các dòng dính nhau, không khoảng cách giữa các tin; trông như text thô.

## Acceptance (bắt buộc)
- [x] Thân bài trên trang chi tiết Tin tức có style cho h2/h3, đoạn văn, link, list, blockquote… (khoảng cách + phân cấp rõ), đúng design tokens hiện có.
- [x] Bài `ai-weekly-2026-w42` (vi + en) tiêu đề từng tin nổi bật, có khoảng cách giữa các tin; dòng nguồn là link rõ ràng.
- [x] Các bài cũ (first-steps, digital-workflows, learning-content, responsible-ai) không bị vỡ layout.
- [x] Bài Bản tin AI tuần các tuần sau (pipeline tự sinh) tự nhận style này, không cần sửa tay.
- [x] Responsive mobile ổn (không tràn ngang với link dài).

## Ghi chú
- Điều tra nhanh khi intake (chưa phải kết luận cuối): `src/app/[locale]/blog/[slug]/page.tsx:49` dùng class `prose …`
  nhưng repo **không cài `@tailwindcss/typography`** (`tailwind.config.ts` → `plugins: []`) → toàn bộ class `prose*` không có tác dụng.
  Bài cũ chỉ có đoạn văn nên không lộ; bản tin AI có `##` + link nên lộ rõ.
- Liên quan CR-019 (R-09c, `tools/ai-news/generate.py` render MDX).
- **Scope (user chốt 2026-10-14): CHỈ Mức 1** — bật style thân bài chung (typography) cho trang chi tiết Tin tức.
  KHÔNG làm khung thẻ riêng cho bản tin, KHÔNG sửa `generate.py` trong CR này. Khung thẻ riêng → CR-024 (làm sau).
