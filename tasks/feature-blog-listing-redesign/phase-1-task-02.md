# Task 02: Hero trang Tin tức — nền ảnh webp + breadcrumb pill + tiêu đề 2 dòng + minh hoạ SVG

> Nguồn: CR-003 · Spec: R-09a §1, §Tiêu đề, §Design · Ref: `refs/mockup-blog-listing.png`, `refs/hero-background.png`

## Phase
1 — UI (phụ thuộc: không; làm sau Task 01 để giữ thứ tự commit)

## Type
addition (component mới, không sửa `PageHeader` dùng chung)

## Classification / Risk
- Change type: **MODIFY** (UI `/blog`) · Scope: `src/components/blog/BlogHero.tsx` (mới), `src/components/blog/BlogHeroArt.tsx`
  (SVG trang trí `aria-hidden`, màu từ token), `public/images/blog/hero-bg.webp` (convert từ PNG 1.5MB, mục tiêu < 150KB),
  `src/app/[locale]/blog/page.tsx` (thay `PageHeader` bằng `BlogHero`), `messages/{vi,en}` (`blog.heroTitleLead`,
  `blog.heroTitleAccent`, `blog.heroDescription`).
- Review level: **NORMAL** (component mới, chỉ dùng ở `/blog`; `PageHeader` không đổi → about/contact không ảnh hưởng)
- Blast radius: `/blog`, `/en/blog` phần trên cùng. JSON-LD BreadcrumbList giữ nguyên.
- Lưu ý error-memory Error 7: không dùng opacity modifier (`/40`) trên màu `var()` — dùng class đã có/arbitrary rgb.

## Acceptance Criteria
- [ ] h1 2 dòng, dòng 2 phần nhấn màu primary; breadcrumb pill `<nav aria-label>` (Trang chủ › Tin tức)
- [ ] Nền webp qua `next/image` (`fill`, `sizes="100vw"`), không `priority` nếu không phải LCP; minh hoạ chỉ hiện `lg+`
- [ ] Khớp mockup 1440; 768/390 không tràn ngang
- [ ] vi/en đủ chuỗi; typecheck + lint + build PASS
