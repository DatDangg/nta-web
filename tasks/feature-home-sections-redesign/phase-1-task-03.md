# feature-home-sections-redesign · phase-1-task-03 — Khối "Câu chuyện khách hàng" 3 thẻ + ←/→ + "Xem tất cả" (mockup 3.webp)

- **CR:** CR-016 · spec delta R-03b
- **Classification / Risk:** MODIFY (UI) + ADDITIVE (1 → 3 case) · MEDIUM
  - Scope: `src/components/home/CaseStudyHighlight.tsx` (viết lại; phần cuộn tách client nhỏ `CaseStudyCarousel.tsx` nếu cần),
    `src/app/[locale]/page.tsx` (lấy `getAllCaseStudies(locale)` thay `home.featuredCase`), `src/content/home.ts` (bỏ `featuredCase` + type),
    i18n `home.caseStudyEyebrow/…Lead/…Accent/viewAllCaseStudies/viewDetail/previousCases/nextCases`.
  - KHÔNG sửa `src/components/cards/CaseStudyCard.tsx` (dùng ở `/case-studies` + RelatedStudies).
  - Expected review level: **NORMAL**
  - Blast radius: `/`, `/en`
  - Doc impact: SPECIFICATIONS R-03b (close-out; câu R-08 "khối featured trang chủ dùng ảnh cover" vẫn đúng)

## Scope
1. Header: eyebrow "CASE STUDY", "Câu chuyện **khách hàng**", mô tả 2 dòng dưới tiêu đề (bên trái, như mockup); bên phải: nút ←/→ +
   nút viền "Xem tất cả case study →" → `/case-studies`.
2. Thẻ (lg 3 cột, md 2, mobile vuốt ~85%): ảnh `cover` (fallback `gallery[0]`) `aspect-[16/9]`; chip ngành = `sector` + icon
   `listingItems[slug].icon` (landmark/tooth); tiêu đề; mô tả `line-clamp-2`; đáy: "Xem chi tiết →" + nút tròn mũi tên trang trí.
   Cả thẻ là 1 link → `/case-studies/<slug>`.
3. Dữ liệu: tối đa 3 case từ `getAllCaseStudies(locale)` (hiện đúng 3: `oc-eo-learning`, `ai-box-bao-ha`, `dental-clinic-operations`),
   thứ tự như trang `/case-studies`. Nút ←/→ disabled khi không cuộn được (desktop 3 thẻ vừa khung).

## Acceptance
- Khớp `3.webp`; tối đa 3 thẻ; link chi tiết đúng; "Xem tất cả case study" → `/case-studies` (VI/EN).
- Không còn tham chiếu `featuredCase`; alt ảnh i18n; 375/768/1280 không tràn ngang.
- typecheck / lint / build PASS.

## Retry / Escalation
Max 3 attempt; fail lần 3 → `architecture_review_needed`.

## Verification summary
(builder/reviewer điền)
