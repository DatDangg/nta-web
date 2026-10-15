# feature-ai-news-item-images · phase-1-task-03 — Trang chi tiết blog: component MDX `NewsImage` → next/image + dòng nguồn ảnh

- **CR:** CR-035 · deps: task-01 (dạng thẻ `<NewsImage src="/uploads/<sha>.<ext>" alt="…" width="W" height="H" />` + dòng nguồn ảnh)
- **Classification / Risk:** ADDITIVE (UI) · **MEDIUM**
  - Expected review level: **NORMAL** (component MỚI, không sửa `ArticleImage` / `mdxComponents.img`; chỉ thêm 1 key vào `mdxComponents` dùng chung). Reviewer nâng STRICT nếu diff đụng component cũ.
  - Blast radius: `src/components/mdx/` (thêm `NewsImage` + đăng ký trong `mdxComponents`) + test. Không đổi loader/DB/route `/uploads`, không đổi `next.config` (`localPatterns` `/uploads/**` đã có).
  - Doc impact: `docs/DESIGN.md` nếu có mục MDX components; còn lại `no doc impact`.

## Vấn đề
MDX 3 KHÔNG map JSX viết thẳng (`<img>` thường) sang `components.img` (`@mdx-js/mdx/lib/plugin/recma-jsx-rewrite.js:177-180`), và `next-mdx-remote` v6 truyền width/height dạng **chuỗi** → ảnh tin cần component riêng để đi qua `next/image`.

## Quyết định user (2026-10-15)
Q1 chấp nhận rủi ro bản quyền + runbook gỡ ảnh · Q2 "Ảnh: <tên miền>" dưới ảnh + chú thích cuối bài · Q3 bỏ GIF · Q4 tự bỏ ảnh trùng. Plan đã duyệt.

## Scope
1. **Thêm component `NewsImage`** (`src/components/mdx/`, đăng ký trong `mdxComponents`): nhận src CHỈ dạng `/uploads/<sha256 hex thường 64 ký tự>.(jpg|png|webp)` (khác → không render ảnh, trả `null`); width/height chuỗi số nguyên 1..8192 (khác → không render ảnh); alt bắt buộc (rỗng/thiếu → không render ảnh). Hợp lệ → `next/image` (giữ `sizes`, `loading=lazy`, class như `ArticleImage`). **Không sửa `ArticleImage`**, không đổi `mdxComponents.img`.
2. Dòng nguồn ảnh (`<em>` ngay sau ảnh): kiểm hiển thị nhỏ/nhạt, khoảng cách ảnh–caption hợp lý; chỉ thêm style khi nhìn sai. Ngoài `NewsImage` không thêm component mới.
3. Verify route `src/app/uploads/[...path]` phục vụ `jpg/png/webp` cho next/image (có từ CR-031 — chỉ verify, không sửa).

## Tests
- Render THẬT qua `RenderMdx`/compile MDX: `<NewsImage src="/uploads/<sha256>.webp" width="800" height="450" alt="…"/>` → next/image (`/_next/image?url=%2Fuploads…`).
- src ngoài (`http…`, `//…`) / sai dạng (không phải sha256, ext khác, `..`) / width-height không phải chuỗi số 1..8192 / thiếu alt → không ra ảnh.
- Regression: nội dung hiện có không đổi markup ảnh (`ArticleImage` giữ nguyên).

## Acceptance
- [ ] Ảnh tin hiển thị qua `/_next/image?url=/uploads/...`, giữ chỗ đúng tỉ lệ (không CLS), alt = tiêu đề tin.
- [ ] Mobile 375px: ảnh không tràn, caption đọc được (frontend-checklist + responsive-web).

## Verification plan
`npm test`, `npm run typecheck`, `npm run lint`, `npm run build`; xem trên dev server với bài fixture có ảnh `/uploads` (UPLOAD_DIR tạm).

## Retry / Escalation
Như task-01.

## Verification summary
- **Code:** `src/components/mdx/news-image.tsx` (mới — validate src `/uploads/<64 hex thường>.(jpg|png|webp)`, width/height số nguyên 1..8192 dạng chuỗi hoặc number, alt không rỗng; sai → `null`; đúng → `next/image` class/sizes/lazy như `ArticleImage`) + `src/components/mdx/index.tsx` (import + key `NewsImage` trong `mdxComponents`; `ArticleImage`/`img` giữ nguyên).
- **Test:** `src/components/mdx/news-image.test.ts` — render thật qua `compileMDX` (next-mdx-remote/rsc, cùng pipeline `MDXRemote` của `RenderMdx`) + `renderToStaticMarkup`: thẻ như generate.py sinh → `/_next/image?url=%2Fuploads%2F<sha>.webp`, width/height/alt/lazy/sizes + `<em>Ảnh: host</em>`; jpg/png + cạnh 1/8192; number hợp lệ (gọi trực tiếp — MDX v6 chặn biểu thức `{}`); 15 ca sai (http, `//`, không sha, sha hoa, gif, `..`, query, 0, 8193, thập phân, âm, chữ, thiếu height, thiếu alt, alt rỗng) → không có `<img>`; regression ảnh markdown vẫn qua `ArticleImage` (`<img>` trần).
- **Scope §2 (dòng nguồn `<em>`):** không thêm style — `*Ảnh: host*` render `<p class="my-5 leading-relaxed"><em>…</em></p>` (nghiêng, khoảng cách ảnh–caption = margin collapse `my-8`/`my-5` ≈ 2rem). Chưa xem trực quan trên dev server.
- **Scope §3:** route `src/app/uploads/[...path]/route.ts` → `serveUpload` khớp `UPLOAD_FILE_NAME_PATTERN` `^[0-9a-f]{64}\.(jpg|png|webp)$`, `next.config` `localPatterns` có `/uploads/**` — không sửa.
- **Verify:** `npm test` 137 tests, 135 pass, 0 fail, 2 skipped · `npm run typecheck` PASS · `npm run lint` 0 error (1 warning có sẵn `no-img-element` ở `ArticleImage`) · `npm run build` Windows lỗi môi trường (`Failed to load native binding` khi nạp next.config.ts) → `docker build --target builder -t nta-web-buildcheck:tmp .` PASS, đã `docker rmi`.
- **Doc impact:** `docs/DESIGN.md` không có mục MDX components → no doc impact.
