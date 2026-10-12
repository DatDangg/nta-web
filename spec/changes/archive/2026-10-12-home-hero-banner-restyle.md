---
id: home-hero-banner-restyle
type: feature
status: done
created: 2026-10-12
---

# Restyle banner Hero trang chủ theo ảnh mẫu (dùng ảnh minh hoạ mới)

## Yêu cầu
- Trang chủ (`/`), khối Hero (`src/components/home/Hero.tsx`).
- **Thay ảnh minh hoạ hero**: bỏ mockup dashboard `enterprise-hero.png`, dùng ảnh mới
  `public/images/home/hero-banner.jpg` (ảnh user cung cấp — "ảnh 1").
- **Restyle để trông giống ảnh mẫu "ảnh 2"** (`tasks/change-home-hero-banner/refs/target-banner-2.jpg`):
  - Ảnh minh hoạ lớn hơn, tràn ra mép phải của section (full-bleed), **bỏ khung bo góc + nền xám**
    (`rounded-lg bg-surface-sunken`).
  - Giữ nguyên chữ + 2 CTA bên trái (đã khớp ảnh mẫu: "Giải pháp số hóa cho doanh nghiệp Việt"…).
- Cập nhật `heroImageAlt` (vi + en) cho khớp ảnh mới (ảnh giờ là minh hoạ robot AI, không còn là "giao diện minh hoạ").

### Round 2 — hoàn thiện theo ảnh mẫu (user chỉ định lại "ảnh 2 là goal, ảnh 1 là ảnh nền")
- [ ] **Headline 2 màu**: `heroTitle` tách `heroTitleLead` (đen) + `heroTitleAccent` (teal `--color-primary`),
      2 block xuống dòng — khớp ảnh mẫu ("Giải pháp số hoá cho" / "doanh nghiệp Việt").
- [ ] **5 panel kính nổi + wordmark NTA** overlay trên ảnh: ảnh crop 2:1→6/5
      (`aspect-[6/5]` + `object-cover object-[70%_50%]` — tập trung robot, bỏ city như ảnh mẫu),
      panel `bg-white/85 backdrop-blur`, vị trí % theo ảnh mẫu; CHỈ `lg+`, container `aria-hidden`.
- [ ] **Lớp phủ sáng gradient** dịu hologram baked-in trong ảnh 1 theo phong cách ảnh 2.
- [ ] **CTA primary có mũi tên →**; **nền gradient** trắng→xanh nhạt; grid text 42% / ảnh 58%.
- [ ] Nội dung panel theo locale qua `getHomeContent().heroPanels` (vi + en).

## Bối cảnh
- Hero hiện tại: grid 2 cột `md:grid-cols-[1.1fr_0.9fr]`, ảnh bọc `rounded-lg bg-surface-sunken object-contain`,
  `width/height` 2656×1902, `sizes="(min-width: 768px) 45vw, 100vw"`, `priority`.
- Ảnh mới: `hero-banner.jpg` 1787×880 (tỉ lệ ~2.03:1), JPEG.
- Ảnh mẫu "ảnh 2": 1788×880; layout = text trái, minh hoạ phải tràn mép.
- Ảnh `enterprise-hero.png` chỉ được dùng ở Hero (không reference nơi khác trong `src/`).

## Acceptance (bắt buộc)
- [ ] Hero trang chủ dùng ảnh mới, bỏ khung bo góc/nền xám, ảnh tràn ra mép phải giống ảnh mẫu ở desktop.
- [ ] Mobile: ảnh xếp dưới chữ, không tràn/lệch, không méo, không scroll ngang.
- [ ] `heroImageAlt` vi + en đúng nội dung ảnh mới.
- [ ] Không đổi copy/CTA/behavior khác.
- [ ] Verify: lint + typecheck + build PASS; responsive (mobile/desktop) không vỡ.

## Ghi chú
- MODIFY feature (visual). Có thể cần cập nhật `.context/design-spec.md` mục Hero
  (quy tắc "ảnh `rounded-lg`" → full-bleed).
- Asset user cung cấp: `public/images/home/hero-banner.jpg` (đã đặt sẵn);
  refs: `tasks/change-home-hero-banner/refs/source-banner-1.jpg` (nguồn) + `target-banner-2.jpg` (mẫu đích).
- **CHỈ xử lý change này.** Working tree đang có các change dang dở khác do session khác:
  `brand-logo-lockup`, `solution-card-real-images`, `hairstyle-ai-gallery` →
  KHÔNG gộp, KHÔNG commit file ngoài phạm vi change này.
