# Design Specification — NTA Website

> Design notes cho website NTA. Agent extract design tokens + screen specs từ file này.
> ⚠️ Chưa có Figma/brand chính thức — bảng dưới là **đề xuất tạm (light minimal kiểu Apple)**, sẽ cập nhật khi có brand kit.
> ✅ Đã chốt (08/10/2026): phong cách **simple nhưng ấn tượng kiểu Apple** — sáng, nhiều whitespace, typography lớn, animation subtle.

---

## Design References

**Figma Link:** _(chưa có — cập nhật sau)_
**Design Tool:** Figma (dự kiến)

**Reference Images:**
- _(chưa có — anh gửi screenshot tham chiếu nếu muốn hướng khác)_

---

## Brand & Visual Identity

### Color Palette (đề xuất — light minimal Apple)

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#0071E3` | CTA, link, accent (Apple blue) |
| Primary Hover | `#0077ED` | Hover CTA/link |
| Background | `#FFFFFF` | Nền trang (trắng) |
| Background Alt | `#F5F5F7` | Section xen kẽ (xám nhạt Apple) |
| Surface | `#FFFFFF` | Card, panel |
| Text Primary | `#1D1D1F` | Heading, body (gần đen) |
| Text Secondary | `#6E6E73` | Label, caption (xám) |
| Border | `#D2D2D7` | Divider, viền input |
| Error | `#FF3B30` | Trạng thái lỗi |
| Success | `#34C759` | Trạng thái thành công |
| Warning | `#FF9500` | Cảnh báo |

> Gradient chủ đạo (nếu dùng): `linear-gradient(180deg, #FFFFFF 0%, #F5F5F7 100%)` — rất nhẹ, không lòe loẹt.

### Typography

| Token | Font | Size | Weight | Usage |
|-------|------|------|--------|-------|
| Heading 1 | Inter / system | 48–64px (clamp) | 700 | Hero title |
| Heading 2 | Inter | 32–40px | 700 | Section title |
| Heading 3 | Inter | 22–24px | 600 | Card title |
| Body | Inter | 16–18px | 400 | Nội dung |
| Small | Inter | 14px | 400 | Label, caption |
| XSmall | Inter | 12px | 400 | Meta, hint |

Font stack: `-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` (SF Pro trước cho vibe Apple, Inter fallback hỗ trợ tiếng Việt).

### Spacing Scale

| Token | Value |
|-------|-------|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| 2xl | 48px |
| 3xl | 64px |
| 4xl | 96px |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| sm | 4px | Input, tag |
| md | 8px | Card |
| lg | 16px | Section card, modal |
| full | 9999px | Pill, avatar, badge |

---

## Screen Inventory

### Screen: Trang chủ
- **Route:** `/`
- **Layout:** Full width; hero → 3 mảng → sản phẩm → case study → CTA
- **Components:** Header sticky, Hero (title + subtitle + 2 CTA), SolutionCards ×3, ProductGrid, CaseStudyHighlight, CTABanner, Footer
- **States:** Default, Loading (nếu fetch), Error
- **Notes:** Hiệu ứng subtle (fade/slide-in) khi scroll; ảnh hero tối ưu.

### Screen: Về NTA
- **Route:** `/about`
- **Layout:** Full width, các section xếp dọc
- **Components:** PageHeader, MissionBlock, CapabilityGrid, TeamGrid, MilestoneTimeline, PartnerLogos, CTABanner
- **States:** Default
- **Notes:** Timeline milestones theo mốc năm; logo đối tác dạng grayscale → màu khi hover.

### Screen: Giải pháp Doanh nghiệp (tổng quan)
- **Route:** `/solutions/enterprise`
- **Components:** PageHeader, SolutionIntro, SolutionGrid (CRM/HRM/LMS/DentGo), CTABanner

### Screen: Chi tiết giải pháp doanh nghiệp
- **Route:** `/solutions/enterprise/[slug]` (`crm` | `hrm` | `lms` | `dentgo`)
- **Components:** PageHeader, FeatureList, BenefitList, ScreenshotSection, RelatedSolutions, CTAForm
- **States:** Default, 404 (slug sai)

### Screen: Giải pháp AI (tổng quan)
- **Route:** `/solutions/ai`
- **Components:** PageHeader, SolutionIntro, SolutionGrid (BoxAI / Flycam / AI tùy chỉnh), CaseStudyTeaser, CTABanner

### Screen: Chi tiết giải pháp AI
- **Route:** `/solutions/ai/[slug]` (`boxai` | `flycam` | `custom-ai`)
- **Components:** PageHeader, FeatureList, UseCases, CaseStudyLink, CTAForm

### Screen: Sản phẩm App
- **Route:** `/products`
- **Components:** PageHeader, AppCard (Music app, Hair-style AI), ScreenshotCarousel, DownloadLinks, CTABanner

### Screen: Case Study (danh sách)
- **Route:** `/case-studies`
- **Components:** PageHeader, FilterBar (theo mảng), CaseStudyGrid, Pagination

### Screen: Case Study (chi tiết)
- **Route:** `/case-studies/[slug]`
- **Components:** PageHeader, MetaBar (khách hàng, lĩnh vực, năm), ChallengeBlock, SolutionBlock, ResultBlock (số liệu), ImageGallery, RelatedStudies, CTA

### Screen: Tin tức / Blog
- **Route:** `/blog` + `/blog/[slug]`
- **Components:** PageHeader, PostList, PostCard, Pagination; detail: ArticleHeader, ArticleBody, ShareBar, RelatedPosts

### Screen: Liên hệ
- **Route:** `/contact`
- **Components:** PageHeader, ContactForm (tên, email, SĐT, nội dung), ContactInfo (hotline/email/địa chỉ), MapEmbed, OfficeHours
- **States:** Default, Validating, Submitting, Success, Error

### Screen: 404
- **Route:** `*`
- **Components:** NotFoundMessage, HomeLink, SearchHint

---

## Component Library

| Component | Variants | Notes |
|-----------|----------|-------|
| Button | Primary, Secondary, Ghost, Outline | Sizes: sm/md/lg; light theme, bo tròn nhẹ, không shadow nặng |
| Input / Textarea | Default, Focus, Error, Disabled | Có label + helper/error text |
| Card | SolutionCard, ProductCard, CaseStudyCard, PostCard | Hover lift nhẹ |
| Section | Default, Alternate (surface), Accent | Padding responsive |
| Modal | Small, Medium | Dùng cho chi tiết nhanh nếu cần |
| Badge | Info, Success, Warning, Error | Tag lĩnh vực/danh mục |
| Timeline | Milestones | Cho trang Về NTA |
| Nav | Desktop, Mobile (hamburger + drawer) | Sticky, active state |
| Breadcrumb | Default | Cho trang con |

---

## Design Style

- **Overall feel:** Apple-like — clean, minimal, sang trọng, tin cậy
- **Color scheme:** Light (trắng + xám trung tính); contrast cao cho doanh nghiệp nhà nước lẫn tư nhân
- **UI Library:** Tailwind CSS (cân nhắc shadcn/ui cho form/nav)
- **Animation level:** Subtle — fade/slide-in nhẹ khi scroll, hover mượt, không heavy motion, không confetti/effect rườm rà
- **Signature Apple-style elements:** heading to đậm (48-96px hero), nội dung trung tâm, section xen kẽ trắng/#F5F5F7, card tròn (border-radius lg), ảnh lớn, ít đường kẻ

---

## Responsive Breakpoints (Mobile-First)

> **MANDATORY:** Đọc `skills/responsive-web/SKILL.md` + `skills/responsive-web/responsive.md` trước khi thiết kế responsive.

| Breakpoint | Width | Tailwind | Target |
|------------|-------|----------|--------|
| Base (Mobile) | < 640px | (default) | Phone — viết styles mặc định trước |
| sm | ≥ 640px | `sm:` | Large phones, small tablets |
| md | ≥ 768px | `md:` | Tablets |
| lg | ≥ 1024px | `lg:` | Laptops |
| xl | ≥ 1280px | `xl:` | Desktops |
| 2xl | ≥ 1536px | `2xl:` | Large screens |

**Nguyên tắc:**
- **Mobile-first**: viết base styles cho mobile → `min-width` để enhance.
- **Content-based breakpoints**.
- **Ưu tiên fluid** (`clamp()`, `rem`, `%`, `fr`, `vw`) hơn fixed `px`.
- **Container queries** cho component-level responsive.

## Responsive Behavior (BẮT BUỘC cho mỗi screen)

### Screen: Trang chủ
- **Mobile (< 640px):** nav hamburger, hero stack dọc (title → subtitle → CTA full-width), 3 solution card xếp 1 cột, product grid 1–2 cột.
- **Tablet (≥ 768px):** hero 2 cột (text | ảnh), solution card 2–3 cột, product grid 2 cột.
- **Desktop (≥ 1024px):** nav ngang đầy đủ, hero 2 cột rộng, solution 3 cột, product 3–4 cột.
- **Large (≥ 1280px):** max-width container ~1280px, spacing 4xl, hero ảnh lớn hơn.

### Screen: Về NTA
- **Mobile:** mọi block 1 cột; timeline dọc; team 1–2 cột.
- **Tablet:** capability grid 2 cột; team 2–3 cột.
- **Desktop:** capability 3 cột; timeline ngang; partner logos 4–6/cột.
- **Large:** container max-width, spacing rộng.

### Screen: Chi tiết giải pháp ([slug])
- **Mobile:** 1 cột; ảnh full-width; CTA cuối sticky-bottom tuỳ chọn.
- **Tablet:** 2 cột (nội dung | ảnh minh hoạ).
- **Desktop:** 2 cột rộng + sidebar "giải pháp liên quan".
- **Large:** nội dung giới hạn ~720px cho dễ đọc.

### Screen: Case Study (chi tiết)
- **Mobile:** 1 cột; meta bar stack dọc; gallery 1 cột.
- **Tablet:** meta bar ngang; gallery 2 cột.
- **Desktop:** 2 cột (nội dung | gallery); related 3 cột.
- **Large:** container rộng, gallery 3 cột.

### Screen: Blog (list + detail)
- **Mobile:** list 1 cột; detail 1 cột, chữ 16–18px.
- **Tablet:** list 2 cột; detail ~680px.
- **Desktop:** list 3 cột + sidebar; detail ~720px.
- **Large:** list 3–4 cột.

### Screen: Liên hệ
- **Mobile:** form 1 cột trên, info dưới; map full-width.
- **Tablet:** form | info 2 cột; map full-width.
- **Desktop:** 2 cột (form 60% | info+map 40%).
- **Large:** container max-width, spacing rộng.

### Screen: Header / Footer
- **Mobile:** header hamburger + drawer; footer 1 cột (accordion nhóm link tuỳ chọn).
- **Tablet:** footer 2 cột.
- **Desktop:** header nav ngang; footer 4 cột.
- **Large:** footer 4–5 cột, container max-width.
