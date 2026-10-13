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

4. **Nit gộp từ review task 02 (user chốt 2026-10-14):**
   a. `ProductStrip` nút ←/→ dùng ngưỡng: đầu `scrollLeft <= 8`, cuối `scrollLeft >= scrollWidth - clientWidth - 8`
      (hiện mobile nút "Sản phẩm trước" không disabled ở đầu vì scrollLeft=4). Case study dùng lại cùng logic — tách hook/helper dùng chung nếu gọn.
   b. `HomeProductCard.tsx:27` focus ring bị cắt bởi dải cuộn (overflow) → chừa padding/offset để ring hiển thị đủ.
   c. `page.tsx:83` guard `listingItems` thiếu slug → bỏ qua item thay vì undefined/crash.
5. Commit: CHỈ `git commit -- <paths>`; KHÔNG đụng `.context/project-config.md` (0cbde8d gộp nhầm — giữ nguyên, không revert).

## Acceptance
- Khớp `3.webp`; tối đa 3 thẻ; link chi tiết đúng; "Xem tất cả case study" → `/case-studies` (VI/EN).
- Không còn tham chiếu `featuredCase`; alt ảnh i18n; 375/768/1280 không tràn ngang.
- typecheck / lint / build PASS.

## Retry / Escalation
Max 3 attempt; fail lần 3 → `architecture_review_needed`.

## Verification summary
**Builder (attempt 1, 2026-10-14):**
- Files: `src/components/home/CaseStudyHighlight.tsx` (viết lại, server), mới `CaseStudyCarousel.tsx` (client: header + ←/→ + "Xem tất cả" + dải cuộn),
  mới `HomeCaseStudyCard.tsx`, mới `useScrollButtons.ts` (hook dùng chung + `scrollStripClass`), mới `HomeScrollArrows.tsx` (cặp nút ←/→ dùng chung),
  `ProductStrip.tsx` (dùng hook/nút chung), `src/app/[locale]/page.tsx`, `src/content/home.ts` (bỏ `featuredCase` + type),
  `src/i18n/messages/{vi,en}.json` (thêm `caseStudyEyebrow/TitleLead/TitleAccent/Lead`, `viewAllCaseStudies`, `viewDetail`, `previousCases`, `nextCases`; bỏ `home.caseStudyTitle` không còn dùng).
- Dữ liệu: `getAllCaseStudies(locale).slice(0, 3)`; ảnh `cover ?? gallery[0].src`; mô tả `showcase.hero.description ?? result` (cùng nguồn thẻ `/case-studies`);
  icon `listingItems[locale][slug]?.icon ?? 'building'`; alt `caseStudies.imageAlt` (i18n). `CaseStudyCard.tsx` không đổi.
- Nit §4: (a) ngưỡng 8px đầu/cuối trong `useScrollButtons` (Product + Case dùng chung); (b) dải cuộn `-mx-2 px-2 pt-2 scroll-px-2` chừa 8px > ring 6px (offset 4 + 2), `scroll-px-2` để snap thẻ đầu về scrollLeft 0 — `HomeProductCard.tsx` không cần sửa; (c) `page.tsx` `flatMap` bỏ qua slug thiếu meta.
- `grep featuredCase src` → 0.
- typecheck (`npm run typecheck`): PASS · lint (`npm run lint`): PASS (0 error, 1 warning cũ `src/components/mdx/index.tsx` no-img-element, ngoài scope).
- build: chờ primary chạy ở terminal user.
- Responsive 375/768/1280: chưa chạy browser; theo class: thẻ 85% / `calc(50%-0.75rem)` / `calc((100%-3rem)/3)`, strip `-mx-2` nằm trong padding Container 16px+ → không tràn ngang; actions header `flex-wrap`. Cần smoke trên trình duyệt.

**Builder (attempt 2, 2026-10-14) — fix review round 1:**
- F1: tách comparator `compareCaseStudies` (năm giảm dần, rồi slug) export trong `src/lib/content/case-studies.ts`; `src/app/[locale]/case-studies/page.tsx` dùng `studies.sort(compareCaseStudies)` (behavior y cũ);
  `CaseStudyHighlight.tsx` sort trên bản copy `[...studies].sort(compareCaseStudies).slice(0, 3)`.
  Thứ tự trang chủ (vi + en): `ai-box-bao-ha` (2026) → `oc-eo-learning` (2026) → `dental-clinic-operations` (2025) — khớp `/case-studies`.
- F2: ảnh fallback `gallery[0]` → alt `gallery[0].alt` (nếu rỗng → `caseStudies.imageAlt` i18n); ảnh `cover` giữ alt i18n.
- typecheck (`npm run typecheck`): PASS · lint (`npm run lint`): PASS (0 error, 1 warning cũ `src/components/mdx/index.tsx`, ngoài scope). Build: không chạy (theo chỉ đạo).
