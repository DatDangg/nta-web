---
id: home-footer-redesign
type: feature
status: pending
created: 2026-10-12
---

# Restyle dải CTA + Footer toàn site theo ảnh mẫu (user cung cấp)

## Yêu cầu (user)

> "sửa cho t cái đoạn footer đi, ảnh 3 là goal cần đạt, 2 ảnh đầu là ảnh nền"

Ảnh goal (ảnh 3) gồm **2 phần xếp liền nhau**:

**A. Dải CTA nền teal (trên)** — chính là `CTABanner` hiện tại (đang render ở cuối MỌI trang),
được restyle lại:
- Nền = **ảnh teal wave** (ảnh nền 1).
- Tiêu đề + mô tả GIỮ NGUYÊN copy hiện có (`ctaTitle` = "Cùng tìm giải pháp phù hợp",
  `ctaDescription` = "Trao đổi với đội ngũ NTA về mục tiêu và nhu cầu số hóa của tổ chức.") — đã khớp ảnh goal, KHÔNG đổi chuỗi.
- **MỚI**: hàng 3 gạch đầu dòng có icon (chữ trắng), ngăn bằng vạch dọc mảnh:
  - "Tư vấn chuyên sâu" (icon màn hình/monitor)
  - "Giải pháp phù hợp" (icon bánh răng/gear)
  - "Triển khai nhanh chóng" (icon tia sét/bolt)
- Nút CTA: **pill trắng, chữ đậm màu tối + mũi tên →** (nhãn giữ "Liên hệ tư vấn").

**B. Footer nền sáng (dưới)** — `Footer` hiện tại, restyle lại:
- Nền = **ảnh sáng (globe/dot)** (ảnh nền 2), phủ trên `background` để chữ vẫn đọc rõ.
- Cột 1 (thương hiệu): logo NTA (dùng `BrandLogo` sẵn có) + tagline
  **"Nền tảng vận hành doanh nghiệp thông minh với AI."** + hàng 3 icon social tròn
  (Facebook, LinkedIn, YouTube) — hiện chỉ có Facebook.
  Vạch dọc mảnh ngăn cột thương hiệu với các cột link.
- 3 cột link (heading đậm, link `text-secondary` → hover primary).
- **MỚI**: card nổi "Cần hỗ trợ?" (icon headset + tiêu đề + "Liên hệ với chúng tôi" + mũi tên →),
  trỏ `/contact`, đặt bên phải (trên nền globe ở desktop; xuống dưới trên mobile).
- Thanh legal dưới cùng: trái = copyright hiện có; phải = các link pháp lý.

## Phạm vi đã chốt với user

1. **Cả dải CTA + footer, ÁP DỤNG TOÀN SITE** (không chỉ trang chủ). Cả 2 component
   (`CTABanner`, `Footer`) đang render mọi trang VI+EN → thay đổi lan toàn site.
2. **Chỉ dùng link đã có trang** — map về trang gần nhất, BỎ mục không có trang để tránh dead link
   (đúng tiền lệ change `2026-10-09-fix-layer1-dead-links`).

### Mapping link footer (goal → route hiện có)

| Cột | Mục trong ảnh | Route dùng | Ghi chú |
|---|---|---|---|
| Về NTA | Giới thiệu | `/about` | |
| Về NTA | ~~Đội ngũ~~ | — | BỎ (không có trang; trang `/about` không có anchor team) |
| Về NTA | ~~Tuyển dụng~~ | — | BỎ (không có trang) |
| Về NTA | Liên hệ | `/contact` | |
| Giải pháp | Giải pháp Doanh nghiệp | `/solutions/enterprise` | |
| Giải pháp | Giải pháp AI | `/solutions/ai` | |
| Giải pháp | Ứng dụng AI | `/products` | |
| Giải pháp | Case Study | `/case-studies` | |
| Nội dung | Sản phẩm | `/products` | |
| Nội dung | Tin tức | `/blog` | |
| Nội dung | ~~Tài liệu~~ | — | BỎ (không có trang) |
| Nội dung | ~~Câu hỏi thường gặp~~ | — | BỎ (không có trang) |
| Legal | ~~Chính sách bảo mật / Điều khoản sử dụng / Sơ đồ trang~~ | — | BỎ cả 3 (không có trang; chỉ có `sitemap.xml`, không phải trang styled) → thanh legal chỉ còn copyright |

Nguồn sự thật route tồn tại: `src/app/[locale]/**/page.tsx` +
nav canonical ở `src/components/layout/Header.tsx:12-13`
(`/products /case-studies /blog /about /contact` + `/solutions/enterprise` + `/solutions/ai`).

## Bối cảnh / hiện trạng

- `src/components/shared/CTABanner.tsx` (29 dòng): `<section>` `bg-primary` + `<Container>` flex
  title/desc + 1 nút `buttonStyles(primary?'inverse':'primary')`. Dùng ở: home (`primary`),
  blog/[slug], solutions/enterprise, solutions/ai, about, case-studies/[slug], products (`alt`).
- `src/components/layout/Footer.tsx` (33 dòng): `bg-background-alt`; `BrandLogo` + grid 4 cột
  (3 cột link + 1 cột "Liên hệ" = link Facebook + `LanguageToggle`); thanh dưới = block CTA + copyright.
- i18n `footer` namespace (`vi.json`/`en.json`): `aboutGroup, solutionsGroup, contentGroup,
  contactGroup, ctaText, copyright, privacy`. `nav` namespace có: `solutions, enterprise, ai,
  products, caseStudies, news, about, contact`.
- `BrandLogo` render `logo-lockup.png` (mark + "NTA" + tagline "ELEVATING INTELLIGENCE"), `h-10 w-auto`.
- Design constraints (`.context/design-spec.md`): CẤM em-dash (`—`) trong chuỗi UI; CẤM eyebrow/
  kicker trên heading; CẤM middle-dot trang trí hàng loạt; 1 label cho mỗi intent CTA;
  touch target ≥ 44×44; `Container` = nguồn sự thật bề rộng (`max-w-[1280px] px-4 sm:px-6 lg:px-8`).

## Asset (đã đặt sẵn — do primary extract từ hội thoại)

- Nền dải CTA: `public/images/home/footer-cta-bg.jpg` (1920×819, teal wave tối).
- Nền footer: `public/images/home/footer-bg.jpg` (1922×818, sáng, globe dot mờ bên phải).
- Ảnh goal tham chiếu: `tasks/change-home-footer/refs/goal.jpg` (1923×818).

## Acceptance (bắt buộc)

- [ ] Dải CTA mọi trang: nền ảnh teal, tiêu đề/mô tả trắng, **3 gạch đầu dòng icon** ngăn vạch dọc,
      nút CTA pill trắng chữ tối + mũi tên →. Copy tiêu đề/mô tả GIỮ NGUYÊN.
- [ ] Footer mọi trang: nền sáng (ảnh), cột thương hiệu (logo + tagline + 3 social),
      vạch dọc phân cách, 3 cột link đúng mapping trên, card "Cần hỗ trợ?" → `/contact`,
      thanh legal (copyright).
- [ ] **0 dead link**: mọi `<Link>` trong Footer/CTABanner trỏ route tồn tại (grep route so với `src/app`).
- [ ] i18n **key parity VI/EN**: mọi key mới có đủ 2 locale; không em-dash trong chuỗi UI.
- [ ] A11y: social icon link có accessible name (`aria-label`), target ≥ 44×44; ảnh nền decorative
      (`aria-hidden`/`alt=""`); heading hierarchy hợp lệ (footer dùng `<h2>`).
- [ ] Responsive: mobile 1 cột (card hỗ trợ xuống dưới), tablet/desktop đúng layout ảnh; không scroll ngang.
- [ ] Không đổi behavior khác (nav, form, i18n toggle, JSON-LD).
- [ ] Verify: lint + typecheck + build PASS; HTML build kiểm tra VI + EN.

## Ghi chú

- MODIFY feature (visual + content). Shared component `CTABanner` + `Footer` render ở MỌI route VI+EN
  → reviewer mặc định **STRICT**.
- **CHỈ xử lý change này.** Working tree đang dirty do session khác:
  `2026-10-12-home-hero-banner-restyle`, `2026-10-12-home-solution-card-images`,
  `2026-10-12-solution-card-real-images` (pending, session khác sở hữu) + `src/components/cards/SolutionCard.tsx`,
  `src/content/home.ts` (uncommitted) → **KHÔNG gộp, KHÔNG commit file ngoài phạm vi change này**.
- Doc impact dự kiến: `.context/design-spec.md` mục §1.2 Footer + §CTA (mô tả header/footer) cần reconcile
  theo thiết kế mới; `docs/DESIGN.md` nếu mô tả footer.
- Residual đã biết: các mục link pháp lý/Đội ngũ/Tuyển dụng/Tài liệu/FAQ trong ảnh goal bị lược vì
  chưa có trang — nếu user muốn, tạo change riêng thêm trang.
