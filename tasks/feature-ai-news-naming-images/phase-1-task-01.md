# feature-ai-news-naming-images · phase-1-task-01 — Nhãn "Tin mới"/"Latest" + breadcrumb chi tiết tin kiểu pill

- **CR:** CR-038 · change doc `spec/changes/2026-10-15-ai-news-naming-images.md` (Yêu cầu §1, §4) · spec R-09a, R-09 (4.6.0)
- **Classification / Risk:** MODIFY · **LOW**
  - Expected review level: **NORMAL** (đổi chuỗi i18n + prop 1 component trang; không đụng API/DB/auth).
    Nếu buộc phải sửa component dùng chung `src/components/shared/Breadcrumb.tsx` (xem Scope 3) → **STRICT** (shared component).
  - Blast radius: `/blog`, `/en/blog` (thẻ highlight), `/blog/[slug]`, `/en/blog/[slug]` (breadcrumb). Trang khác không đổi.
  - Doc impact: `docs/DESIGN.md` nếu có mô tả breadcrumb / thẻ "Nổi bật" của blog (current-state) → reconcile; không có → `no doc impact`.
  - Migration gate: không áp dụng.
- **Deps:** không (độc lập task-02/03).

## Scope
1. `src/i18n/messages/vi.json:226` `"highlightEyebrow": "Nổi bật"` → `"Tin mới"`; `src/i18n/messages/en.json:226` `"Featured"` → `"Latest"`.
   Hiển thị in hoa nhờ `uppercase` sẵn có ở `src/components/blog/FeaturedPosts.tsx:27` → "TIN MỚI"/"LATEST".
   Không đổi `highlightTitle`, `featuredLabel`, `viewAll`.
2. `src/components/blog/FeaturedPosts.tsx:10,44-45` — sửa comment "NỔI BẬT" → "TIN MỚI" (chỉ comment).
3. `src/components/blog/ArticleHeader.tsx:13` — `<Breadcrumb … />` thêm `variant="pill"` (cùng kiểu `src/components/listing/DetailHero.tsx:50`).
   - Kiểm tiêu đề dài (bài w42 + bài blog có tiêu đề dài nhất) ở 320 / 375 / 768 / 1280 px: pill (`rounded-full`, `flex-wrap`) không tràn ngang,
     không vỡ khung xấu khi xuống dòng. Nếu vỡ → xử lý **trong ArticleHeader** trước (vd bọc `max-w-full`; không đổi text h1).
     Chỉ khi buộc phải sửa `Breadcrumb.tsx` (dùng ở AboutHero / DetailHero / ListingHero / PageHeader) → thay đổi opt-in
     (prop mới, mặc định giữ nguyên) + review STRICT + kiểm lại các trang dùng pill.
   - Header blog hiện nền trắng (không có HeroWaves) → kiểm pill vẫn rõ (border white/80 + shadow). Nếu mờ, chỉ chỉnh trong ArticleHeader,
     không thêm hero mới / không đổi bố cục header.
   - A11y: icon nhà có `aria-label` (`nav.home`), mục hiện tại `aria-current="page"`, link "Tin tức"/"Blog" → `/blog` đúng locale.
4. Test: test render ArticleHeader/Breadcrumb/FeaturedPosts có sẵn → cập nhật kỳ vọng; hạ tầng test component có sẵn → thêm 1 test nhẹ
   (ArticleHeader render pill: link home có aria-label, mục hiện tại aria-current). Không có hạ tầng → ghi lý do, kiểm bằng trình duyệt.

## Verification plan
- `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` (lệnh theo `.context/project-config.md`; Cowork: `bash tools/linux-build.sh verify`).
- Trình duyệt (dev/preview): `/blog`, `/en/blog` thấy "TIN MỚI"/"LATEST"; `/blog/ai-weekly-2026-w42`, `/en/blog/ai-weekly-2026-w42` + 1 bài thường:
  breadcrumb pill; 320/375/768/1280 px không scroll ngang (`document.documentElement.scrollWidth <= innerWidth`).

## Acceptance
- [ ] /blog: nhãn thẻ highlight "Tin mới" (vi) / "Latest" (en).
- [ ] Breadcrumb `/blog/<slug>` kiểu pill như trang chi tiết khác; desktop + mobile không vỡ với tiêu đề dài.
- [ ] Các trang khác dùng Breadcrumb không đổi giao diện.

## Retry / Escalation
- Attempt FAIL thật (reviewer/verify) → sửa trên đĩa, tăng `attempt`; cancel ≠ fail. 3 attempt FAIL → `architecture_review_needed`, dừng báo user.

## Verification summary
**Builder (attempt 1, 2026-10-15)**

Files changed:
- `src/i18n/messages/vi.json` — `blog.highlightEyebrow` "Nổi bật" → "Tin mới".
- `src/i18n/messages/en.json` — `blog.highlightEyebrow` "Featured" → "Latest".
- `src/components/blog/FeaturedPosts.tsx` — chỉ comment "NỔI BẬT" → "TIN MỚI" (3 chỗ).
- `src/components/blog/ArticleHeader.tsx` — `<Breadcrumb … variant="pill" />`, bọc `<div className="[&_ol]:rounded-3xl">`.
- `src/components/blog/blog-labels.test.ts` (mới) — test nguồn/message: nhãn vi/en + ArticleHeader dùng `variant="pill"`.
- `docs/DESIGN.md` — current-state Blog desktop "thẻ NỔI BẬT" → "thẻ TIN MỚI" (doc reconcile as-built).

Không sửa `src/components/shared/Breadcrumb.tsx` (không bắt buộc) → các trang AboutHero/DetailHero/ListingHero/PageHeader không đổi.

Tiêu đề dài (kiểm qua CSS/class, chưa kiểm trình duyệt):
- Pill: `ol` = `inline-flex max-w-full flex-wrap`, `li` flex item co được tới min-content (từ dài nhất) → tiêu đề dài xuống dòng trong khung, không tràn ngang ở 320/375/768/1280 (container `px-4` mobile).
- Vấn đề duy nhất thấy được: khi xuống nhiều dòng, `rounded-full` của `ol` biến khung thành hình bầu dục, chữ đầu/cuối dòng sát mép cong.
  Xử lý trong ArticleHeader: `[&_ol]:rounded-3xl` (24px; selector `.x ol` specificity cao hơn `.rounded-full`). 1 dòng cao 44px (py-1.5 + nút home size-8) → 24px ≥ 22px nên dáng vẫn là viên thuốc y hệt DetailHero; nhiều dòng thì bo vừa.
- Nền header blog trắng: pill `bg-white/75 border-white/80` + shadow `0_6px_20px_-8px` vẫn tách nền nhờ shadow; viền trắng sẽ không thấy trên nền trắng — chấp nhận, không thêm hero/không đổi bố cục (theo scope). Cần mắt người xác nhận ở bước browser.
- A11y: kế thừa Breadcrumb pill — link home `aria-label={t('home')}`, mục hiện tại `aria-current="page"`, link `/blog` qua `Link` của `@/i18n/navigation` (đúng locale).
- Residual: từ đơn rất dài không có khoảng trắng (không thực tế với tiêu đề tin) vẫn có thể tràn vì Breadcrumb không có `break-words` — không sửa để khỏi đụng component dùng chung.

Verify:
- `npm run typecheck` — PASS.
- `npm run lint` — PASS (0 error, 1 warning có sẵn `src/components/mdx/index.tsx:26` no-img-element, không liên quan).
- `npm test` — 195 test, 194 pass, 1 fail **không liên quan task**: `tools/db/content-rules.test.ts` "toàn bộ nội dung file hiện tại … ảnh tồn tại" báo thiếu 9 file `/uploads/*.jpg|png` vì máy local không có `public/uploads/` (ảnh upload runtime, không thuộc repo). 2 test mới của task PASS.
- `npm run build` — chưa chạy (agent chính chạy).
- Trình duyệt (320/375/768/1280, scrollWidth) — chưa chạy; cần kiểm ở bước verify của agent chính/reviewer.
