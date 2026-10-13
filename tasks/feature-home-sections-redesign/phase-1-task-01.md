# feature-home-sections-redesign · phase-1-task-01 — Header section dùng chung + khối "Giải pháp" trang chủ (mockup 2.webp nửa trên)

- **CR:** CR-016 (`spec/changes/2026-10-14-home-sections-redesign.md`) · spec delta R-02a (đề xuất, bump 3.11.0 lúc close-out)
- **Classification / Risk:** MODIFY (UI) · MEDIUM
  - Scope: `src/components/home/HomeSectionHeader.tsx` (MỚI), `src/components/home/SolutionGridHome.tsx`, `src/content/home.ts`
    (field `solutionCards` thêm `icon` + `bullets[]` + `linkLabel`), `src/i18n/messages/{vi,en}.json` (`home.solutionsEyebrow/…Lead/…Accent`),
    `src/app/[locale]/page.tsx` (props mới).
  - KHÔNG sửa `src/components/cards/SolutionCard.tsx` (dùng chung; CR-001 đang blocked trên file này).
  - Expected review level: **NORMAL** (component riêng trang chủ, không API/schema)
  - Blast radius: `/`, `/en`
  - Doc impact: SPECIFICATIONS R-02a (close-out) · `docs/DESIGN.md` nếu có mục trang chủ
  - Decision impact: không

## Scope
1. `HomeSectionHeader` (server-safe, tái dùng ở task 02/03): eyebrow chữ hoa teal + gạch ngang, tiêu đề H2 2 phần (lead đen +
   accent teal, `accentOnNewLine` tuỳ chọn), đoạn mô tả bên phải (lg: 2 cột; mobile: xếp dọc), slot `actions` bên phải (nút ←/→, link).
2. `SolutionGridHome` mới: nền nhạt; 3 thẻ ngang lg:3 cột / mobile 1 cột. Mỗi thẻ: ô icon vuông bo góc viền teal nhạt +
   tiêu đề + mô tả; 3 dòng bullet có icon teal (`ListingIcon`); link teal "Tìm hiểu … →" ở đáy (link là CTA duy nhất, focus-visible rõ);
   ảnh minh hoạ `home-*.png` absolute góc phải-dưới, `mask-image` fade trái/trên tan vào nền, `pointer-events-none`, không đè chữ
   (chữ chiếm ~60% bên trái trên lg; mobile ảnh nhỏ/mờ hơn).
3. Dữ liệu (vi+en) trong `home.ts` — bullet ĐỀ XUẤT (chờ user chốt; lấy từ giải pháp thật đã có trên site):
   - DN (`building`): Khách hàng & bán hàng — CRM (`users`) · Nhân sự & tổ chức — HRM (`idcard`) · Trường học, phòng khám — LMS, DentGo (`graduation`)
   - AI (`cpu`): Camera AI xử lý tại biên — BoxAI (`camera`) · Flycam tuần tra tự động (`drone`) · Trợ lý AI & AI API Gateway — FridayAI (`chat`)
   - Ứng dụng AI (`box`): Tạo nhạc từ ý tưởng — AI Music (`music`) · Thử kiểu tóc theo dáng mặt — HairStyle AI (`face`) · Ứng dụng di động cho người dùng cuối (`phone`)
   - Link: "Tìm hiểu giải pháp doanh nghiệp →" `/solutions/enterprise` · "Tìm hiểu giải pháp AI →" `/solutions/ai` · "Tìm hiểu các ứng dụng AI →" `/products`
4. i18n: tiêu đề tách `solutionsTitleLead` "Giải pháp phù hợp với" + `solutionsTitleAccent` "nhu cầu của bạn"; `solutionsEyebrow` "SOLUTIONS";
   `solutionsLead` (mô tả phải). Giữ/xoá `solutionsTitle` tuỳ còn nơi dùng (grep trước khi xoá).

## Acceptance
- Bố cục/thứ bậc chữ/màu khớp `2.webp` nửa trên; VI+EN có chữ, không hardcode.
- 3 link trỏ đúng route hiện có; ảnh có alt i18n; focus visible; 375/768/1280 không tràn ngang.
- `npm run typecheck`, `npm run lint`, `npm run build` PASS.

## Retry / Escalation
Max 3 attempt; fail lần 3 → `architecture_review_needed`.

## Verification summary

### Builder — attempt 1
- **Files:**
  - `src/components/home/HomeSectionHeader.tsx` (MỚI) — props `headingId, eyebrow, titleLead, titleAccent, accentOnNewLine?,
    description?, descriptionPlacement?: 'right' | 'below', actions?: ReactNode`. Eyebrow chữ hoa `text-primary-active` + gạch ngang
    `bg-primary`; H2 lead + `AccentText` (tái dùng từ `ListingHero`); `right` → mô tả cột phải cạnh tiêu đề (lg), `below` → mô tả dưới
    tiêu đề bên trái; `actions` luôn ở cột phải (lg), xếp dưới chữ trên mobile. Server-safe, không state → task 02 (←/→) và
    task 03 (`below` + ←/→ + "Xem tất cả") dùng lại được.
  - `src/components/home/SolutionGridHome.tsx` — viết lại: section `aria-labelledby`, header dùng `HomeSectionHeader accentOnNewLine`,
    lưới `grid-cols-1 lg:grid-cols-3`; thẻ riêng trang chủ `SolutionHomeCard` (không dùng `SolutionCard`): ô icon vuông viền teal nhạt,
    tiêu đề + mô tả, 3 bullet icon `ListingIcon` trong vòng tròn `bg-primary-light`, link teal "Tìm hiểu … →" (CTA duy nhất, `min-h-11`,
    focus-visible outline). Ảnh `home-*.png` absolute phải-dưới, `-z-10`, `pointer-events-none`, mask intersect fade trái/trên.
    Cột chữ `md:max-w-[60%]` / `xl:max-w-[64%]`; ở mobile và lg (3 cột hẹp) chữ full width, ảnh nhỏ + `opacity-30` để không cạnh tranh chữ.
  - `src/content/home.ts` — thêm type `HomeSolutionCard` (`icon`, `bullets[{icon,label}]`, `linkLabel`), bỏ `shot?` (không còn dùng);
    dữ liệu VI/EN bullet đúng bản user chốt; alt ảnh giữ nguyên.
  - `src/i18n/messages/{vi,en}.json` — thay `home.solutionsTitle` (chỉ dùng ở page.tsx, đã grep) bằng `solutionsEyebrow` ("SOLUTIONS" cả 2
    locale), `solutionsTitleLead`, `solutionsTitleAccent`, `solutionsLead` (diễn đạt lại ý mockup, không số liệu).
  - `src/app/[locale]/page.tsx` — truyền props mới cho `SolutionGridHome`.
  - KHÔNG sửa `SolutionCard`, `ProductStrip`, `CaseStudyHighlight`, `ProductCard`, `CaseStudyCard`, `.context/project-config.md`.
- **Verify:**
  - `npm run typecheck` — PASS
  - `npm run lint` — PASS (0 error; 1 warning có sẵn ở `src/components/mdx/index.tsx`, ngoài scope)
  - `npm run build` — **BLOCKED (môi trường)**: `Failed to load next.config.ts … [Error: Failed to load native binding]` (native @swc
    binding không nạp được, lỗi trước khi đọc source). Không sửa config để lách.
- **Residual risk:**
  - Chưa render/xem trực quan 375/768/1280 (build/dev cần cùng native binding) → reviewer/primary cần kiểm tra visual khi môi trường chạy được:
    độ chồng ảnh–chữ ở lg 1024–1279 (3 cột hẹp, ảnh mờ 30%) và độ cao thẻ đồng đều.
  - Ảnh `home-*.png` là RGB nền sáng; fade dựa vào mask — nếu nền ảnh lệch màu `bg-surface` có thể thấy viền nhẹ ở mép phải/dưới.
- **Primary verify (14/10/2026):** `npm.cmd run build` → PASS — chạy ở terminal user qua primary session, như CR-015 (59/59 static pages; chỉ warning cũ no-img-element `src/components/mdx/index.tsx`).
- **Reviewer round 1:** PASS (NORMAL) — `.context/review-reports/feature-home-sections-redesign-phase-1-task-01-round-1-review.md`; 3 nit không chặn (sizes ảnh lg, lang="en" eyebrow, chưa kiểm mắt 1024–1279).
- **Acceptance:** PASS (tĩnh) · **Doc impact:** SPECIFICATIONS R-02a ở close-out CR.
