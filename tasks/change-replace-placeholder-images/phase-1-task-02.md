# Task 02: Wiring — trang chủ, /solutions/ai, /case-studies, /blog, /about

> Nguồn: change `spec/changes/2026-10-12-replace-remaining-placeholder-images.md`
> Bao phủ mục #1, #3, #4, #7, #10, #11, #12, #13, #14 (phần **nối vào site**)
> Phụ thuộc: **T01** (assets phải tồn tại trước)

## Phase
1

## Type
modification (post-build MODIFY — content + i18n + 1 component)

## Goal
Gắn asset của T01 vào site, kèm alt đúng ngôn ngữ.

## Classification / Risk
- Work item: FEATURE · Change type: MODIFY
- Scope: `src/content/**`, `src/components/home/Hero.tsx`, `src/i18n/messages/{vi,en}.json`
- Review level: **STRICT** — chạm content model `Solution` dùng chung + shared card component
- Blast radius: home (VI+EN), `/solutions/ai` (VI+EN), 4 trang blog (VI+EN),
  2 trang case-study + gallery (VI+EN), `/about` (VI+EN)
- Doc impact: `docs/DESIGN.md` nếu có mô tả ảnh thẻ

## Description

1. **Hero** — `src/components/home/Hero.tsx:31` `enterprise.svg` → `/images/solutions/v2/enterprise-hero.png`.
   Class hiện `aspect-[4/3] object-cover` → **đổi để không cắt 2 bên**.
   Cập nhật `home.heroImageAlt` ở `vi.json:62` + `en.json`.
2. **2 thẻ trang chủ** — `src/content/home.ts:13/25` (`ai.svg`) và `:14/26` (`apps.svg`)
   → `/images/illustrations/ai-analysis.svg`, `/images/illustrations/ai-apps.svg`.
   Alt (SVG không chữ → dùng chung VI/EN):
   - vi: `Minh hoạ dữ liệu được phân tích bằng AI` / `Minh hoạ ứng dụng AI trên điện thoại`
   - en: `Illustration of data analyzed with AI` / `Illustration of an AI mobile app`
   **Không** sửa 2 dòng đã dùng ảnh v2 (`:12`, `:24`).
3. **`/solutions/ai`** — dùng đường `cardImage`/`cardImageAlt` đã có sẵn trong
   `src/content/types.ts:81` (enterprise mdx đang dùng). Thêm cho **cả 2 locale**:
   - `boxai` → `/images/solutions/boxai/01-dashboard-quan-tri.jpg` (đã có sẵn)
   - `flycam` → `/images/solutions/v2/flycam/01-tong-quan.png`
   - `talvra` → `/images/solutions/v2/talvra/01-tong-quan.png`
   Alt prefix `"Giao diện minh hoạ — "` / `"Illustrative interface — "` (cả 3 đều là mock giao diện).
   **Không** đụng field `image` (OG).
4. **Blog** — `cover:` trong `src/content/blog/{vi,en}/*.mdx:7` (4 bài × 2 locale = 8 file)
   → 4 SVG mới của T01. Kiểm tra `PostCard`/`BlogFilter`/alt hiện tại
   (`vi.json:154` = "Ảnh bìa bài viết {title}") — SVG không chữ nên dùng chung được.
5. **Case study nha khoa** — thẻ `CaseStudyCard` → `/images/solutions/v2/dentgo/01-tong-quan.png`.
   Kiểm tra `CaseStudyCard` lấy ảnh thế nào (có thể cần frontmatter field mới như gallery ở
   `dental-clinic-operations.mdx:12`). Mở rộng gallery thêm 2–3 ảnh DentGo từ
   `public/images/solutions/v2/dentgo/`.
6. **Case study Óc Eo** — thẻ (home + `/case-studies`) → `/images/illustrations/oc-eo-architecture.svg`.
   Gallery `src/content/case-studies/{vi,en}/oc-eo-learning.mdx:19` mở từ 1 → **3 ảnh**
   (tổng quan + 1 chi tiết tầng edge + 1 chi tiết vận hành), cùng bộ sơ đồ.
   Alt **riêng từng ảnh**, VI/EN.
7. **Đội ngũ** — `src/content/about/{vi,en}/about.mdx:11,14` → `team-ai.svg` / `team-domain.svg`
   (khớp chuyên môn từng thành viên). Xoá `public/images/about/team-placeholder.svg` **chỉ khi**
   không còn reference nào.

## Acceptance Criteria
- [ ] Hero hiện collage enterprise đủ, không cắt 2 bên
- [ ] 2 thẻ AI trang chủ dùng SVG mới, alt đúng VI/EN
- [ ] 3 thẻ `/solutions/ai` dùng ảnh thật/mock, alt có tiền tố "Giao diện minh hoạ —"
- [ ] Field `image` (OG) của solutions **không đổi**
- [ ] 8 file blog mdx trỏ SVG mới; không còn `*-cover.svg` cũ
- [ ] Thẻ case nha khoa dùng DentGo v2; gallery ≥ 3 ảnh, alt từng ảnh
- [ ] Gallery Óc Eo = 3 ảnh, alt từng ảnh VI/EN
- [ ] Không còn reference `team-placeholder.svg`; không còn chữ "Ảnh đội ngũ sẽ cập nhật"
- [ ] **Không sửa** `cardImageClass` trong `src/components/cards/cardStyles.ts`
- [ ] lint · typecheck · build PASS; reviewer PASS

## Verification Plan
- Commands: theo `.context/project-config.md`
- Mọi `<img>` trên `/`, `/solutions/ai`, `/blog`, `/case-studies`,
  `/case-studies/oc-eo-learning`, `/case-studies/dental-clinic-operations`, `/about`
  → `naturalWidth > 0`, ở **cả** `/` và `/en`
- Overflow 0 ở 375 / 1440; chạy check `check-left-align`
- `grep` không còn reference tới file SVG placeholder đã thay

## Feature Verification
- Acceptance: DONE (primary tiếp quản sau khi builder hết bước — xem journal) · Verify: PASS · Reviewer: PENDING
- Verify thật (primary): `npm.cmd run lint` PASS (0 errors, 1 warning pre-existing `src/components/mdx/index.tsx:25`);
  `npm.cmd run typecheck` PASS; `npm.cmd run build` PASS (compiled, 51 route).
- HTML build check: `/`+`/en` = enterprise-hero.png; `/solutions/ai` vi+en = boxai jpg + flycam/talvra png + alt đúng;
  `/about` vi+en = team-ai/team-domain; `/case-studies/dental-clinic-operations` = 3 ảnh dentgo;
  `/case-studies/oc-eo-learning` = 3 SVG. `grep` trong `src` = 0 ref SVG placeholder cũ.
- `check-left-align`: **skip** — không có script trong repo (không có `verify-*.mjs`/`check-left-align`).
- Lỗi phát hiện & sửa khi tiếp quản: builder ghi mojibake `?` ở alt (6 solution `cardImageAlt`, 6 gallery alt),
  alt EN dùng tiếng Việt (home.ts), và dùng **sai format** `cardImage` (string + `cardImageAlt`) thay vì object
  `{src, alt, ratio}` → `/solutions/ai` không render ảnh. Đã sửa hết + set ratio thật (boxai 1.954; flycam/talvra 1.396).

## Retry / Escalation
- Attempt: 0 · Escalation: sau 3 attempt fail → `architecture_review_needed`

## DoD
- [ ] Code written trong scope · [ ] Check commands pass · [ ] Reviewer PASS
- [ ] `.context/progress.json` updated · [ ] Doc impact recorded
- [ ] committed — 1 task = 1 commit (branch `main`, **KHÔNG push**)

## Files to Modify
- `src/components/home/Hero.tsx`
- `src/content/home.ts`
- `src/content/solutions/{vi,en}/{boxai,flycam,talvra}.mdx`
- `src/content/blog/{vi,en}/*.mdx` (4 × 2)
- `src/content/case-studies/{vi,en}/{dental-clinic-operations,oc-eo-learning}.mdx`
- `src/content/about/{vi,en}/about.mdx`
- `src/i18n/messages/{vi,en}.json`
- `public/images/about/team-placeholder.svg` (xoá)

## Notes
- Phụ thuộc T01. KHÔNG push, KHÔNG deploy. Nếu branch ≠ `main` → **DỪNG, báo lại**.