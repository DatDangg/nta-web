# 09 — Bản đồ giao diện → dữ liệu

Dùng khi người dùng mô tả theo **cái họ nhìn thấy trên web** ("đổi dòng chữ to ở đầu trang CRM", "thêm 1 câu hỏi
ở cuối trang BoxAI"). Bot tra bảng này để ra **bản ghi + đường dẫn field** (field nằm trong `data`). Mọi bản ghi đều có bản `vi` và `en`.

Ký hiệu (bản ghi DB): `S` = `solution/<locale>/<slug>` · `P` = `product/<locale>/<slug>` ·
`C` = `case_study/<locale>/<slug>` · `B` = `post/<locale>/<slug>` ·
`L.listingItems[slug]` = `listing_item/<locale>/<slug>` · `L.listingPages[locale].<trang>` = `listing_page/<locale>/<trang>` · `H` = `home/<locale>/home` ·
`M.<ns>.*` = `ui_messages/<locale>/<ns>` · thông tin liên hệ = `company_info/<locale>/contact`. `about.mdx` = `about/<locale>/about`.
🔒 = chữ giao diện / liên hệ — **bot được sửa** (phạm vi chốt 15/10/2026), nhưng tóm tắt duyệt phải ghi rõ đây là chữ dùng chung toàn site. `<title>`/meta trong `src/app/**` vẫn là việc dev.

## 1. Khung chung (mọi trang)

| Vùng trên web | Dữ liệu |
|---|---|
| Menu Header: "Giải pháp" → mega menu 2 cột | Tên/mô tả nhóm: `L.listingPages[locale].enterprise|ai` (`title`, `lead`+`accent`, `description`). Mục con: `S.title` + `L.listingItems[slug].subtitle/icon`, thứ tự = `slug.ts` |
| Nhãn menu (Trang chủ, Sản phẩm, Tin tức…) | 🔒 `M.nav.*` |
| Footer: nhóm link, giới thiệu ngắn, tagline, mạng xã hội | 🔒 `M.footer.*` |
| Footer: SĐT / email / địa chỉ | 🔒 `company_info/{vi,en}/contact` (ghi giống nhau 2 locale) |

## 2. Trang chủ `/`

| Khối (từ trên xuống) | Dữ liệu |
|---|---|
| Hero: tiêu đề lớn, mô tả, alt ảnh | 🔒 `M.home.heroTitleLead`, `heroTitleAccent`, `heroDescription`, `heroImageAlt` |
| Hero: 5 panel kính nổi trên ảnh + chữ "NTA" trên robot | `H.heroPanels` (`wordmark`, `ai`, `chart`, `management`, `performance`, `apps`) |
| Dải chữ chạy dưới hero | `H.heroPanels.ai.items` + `management.items` + `apps.items` (icon cố định trong code — giữ đúng **4 mục/panel**) |
| Khối "Giải pháp": tiêu đề khối | 🔒 `M.home.solutionsEyebrow/TitleLead/TitleAccent/Lead` |
| Khối "Giải pháp": 3 thẻ (tên, mô tả, 3 gạch đầu dòng, ảnh, link) | `H.solutionCards[]` |
| Khối "Ứng dụng AI": tiêu đề khối | 🔒 `M.home.products*` |
| Khối "Ứng dụng AI": thẻ app | `H.featuredProducts[]` (title, image, alt) + `L.listingItems[slug]` (icon, màu, subtitle, chips). Slug thiếu trong `listingItems` → thẻ bị ẩn |
| Khối "Ứng dụng AI": thẻ CTA cuối | `L.listingCtas[locale].products` |
| Khối "Case study" | Tự lấy **3 case study** mới nhất (theo `C.year` giảm dần): `C.title`, `C.cover` (thiếu → `gallery[0]`)… Tiêu đề khối 🔒 `M.home.caseStudy*` |
| Banner CTA cuối trang | 🔒 `M.home.ctaTitle/ctaDescription` |
| `<title>`, meta description | 🔒 `homeMetadata` trong `src/app/[locale]/page.tsx` |

## 3. Trang danh sách: `/solutions/enterprise`, `/solutions/ai`, `/products`, `/case-studies`

Key trang trong `L`: `enterprise` · `ai` · `products` · `caseStudies`.

| Khối | Dữ liệu |
|---|---|
| Breadcrumb | `L.listingPages[locale][page].crumbs` |
| Tiêu đề hero (2 dòng, dòng 2 tô màu) | `.title` / `.lead` + `.accent` |
| Đoạn mô tả hero | `.description` |
| 3 điểm nhấn dưới hero | `.highlights[]` `{icon, title, text}` |
| 3 ô icon + thẻ kính trang trí bên phải | `.tiles[]`, `.glassCard` |
| Chip lọc danh mục | `.categories[]` `{id, label, icon}` |
| Ô tìm kiếm (placeholder) | `.searchPlaceholder` |
| **Thẻ giải pháp** | tiêu đề `S.title` · mô tả `S.description` · ảnh `S.cardImage` → `heroShot` → bỏ ảnh · icon/màu/phụ đề/chip/danh mục lọc `L.listingItems[slug]` (thiếu chips → 3 `S.features[].title` đầu) · thứ tự = `slug.ts` |
| **Thẻ sản phẩm** | `P.title`, `P.description`, ảnh = `P.screenshots[0]`, còn lại `L.listingItems[slug]` · thứ tự = `productSlugs` |
| **Thẻ case study** | tiêu đề `C.title` · phụ đề `C.showcase.hero.subtitle` (→ `client`) · mô tả `C.showcase.hero.description` (→ `result`) · chip = nhãn `category` + `sector` + `year` · nhãn trạng thái = `hero.eyebrow` · ảnh `C.cover` (→ `hero.image.src` → `gallery[0]`) · icon/màu `L.listingItems[slug]` · thứ tự `year` giảm dần rồi slug |
| Khối CTA cuối trang | `L.listingCtas[locale][page]` |
| Nhãn bộ lọc chung ("Tất cả", "Xóa bộ lọc"…) | `L.listingLabels[locale]` |

## 4. Trang chi tiết giải pháp / sản phẩm / case study (`layout: showcase`)

URL: `/solutions/enterprise/<slug>`, `/solutions/ai/<slug>` (`S`), `/products/<slug>` (`P`), `/case-studies/<slug>` (`C`).
Toàn bộ nội dung trang = **`data.showcase`** của bản ghi đó. Thứ tự trên web:

| # | Khối nhìn thấy | Field |
|---|---|---|
| 1 | Breadcrumb (mục cuối) | `showcase.hero.breadcrumbLabel` (S/P: `brandName` → `title`) |
| 2 | Dòng nhỏ phía trên tiêu đề | `showcase.hero.eyebrow` |
| 3 | Tiêu đề lớn (phần thường + phần tô màu) | `showcase.hero.titleLead` + `titleAccent` |
| 4 | Dòng phụ dưới tiêu đề | `showcase.hero.subtitle` |
| 5 | Đoạn mô tả hero | `showcase.hero.description` |
| 6 | Nút chính / nút video | `showcase.hero.primaryCta {label, href}` / `hero.video` |
| 7 | Ảnh lớn hero + chú thích | `showcase.hero.image {src, alt, width, height, caption}` |
| 8 | Ô trang trí cạnh hero | `L.listingItems[slug]` (icon/màu) |
| 9 | Hàng thẻ số liệu | `showcase.stats[] {icon, value, label}` |
| 10 | Dòng lưu ý dưới số liệu | `showcase.note` |
| 11 | 3 cột Thách thức / Giải pháp / Kết quả | `showcase.pillars[] {icon, title, items[]}` |
| 12 | Khối công nghệ (sơ đồ nút + màn hình) | `showcase.technology` (`nodes`, `screen` hoặc `alerts`, `caption`, `cta`) |
| 13 | Carousel ảnh | `showcase.photos` (`title`, `items[] {src, alt}`, `caption`, `variant`) |
| 14 | Lưới tính năng | `showcase.features {eyebrow, title, items[]}` (anchor `#features`) |
| 15 | Tình huống sử dụng / kết nối | `showcase.details.groups[]` |
| 16 | Khối tầm nhìn + trích dẫn | `showcase.vision` |
| 17 | Câu hỏi thường gặp | `showcase.faq.items[] {question, answer}` |
| 18 | Khối CTA cuối | `showcase.cta {title, description, label, href, image}` |
| — | `<title>` tab trình duyệt | S: "Giải pháp `brandName` \| NTA"; P: `brandName`/`title`; C: "`title` \| Case Study \| NTA" |
| — | Meta description (Google) | S/P: `description` · C: `result` |
| — | Giải pháp liên quan (enterprise) | các giải pháp enterprise chung `relatedCases` |

Khối tuỳ chọn không khai báo → **không hiển thị**. "Bỏ khối X" = xoá field tương ứng (không để rỗng).

## 5. Tin tức `/blog` và bài viết `/blog/<slug>`

| Khối | Dữ liệu |
|---|---|
| Hero trang Tin tức, nhãn lọc, ô tìm kiếm, tiêu đề các mục | 🔒 `M.blog.*` |
| Tên danh mục trên chip | 🔒 `M.blog.categories.<key>` (key = `B.category`) |
| 3 bài nổi bật đầu trang | **3 bài có `date` mới nhất** — muốn đưa bài lên đầu = đổi `date` (cân nhắc, ảnh hưởng tính trung thực) |
| Danh sách bài còn lại | các bài sau, `date` giảm dần |
| Thẻ bài | `B.cover`, `B.title`, `B.excerpt`, `B.date`, nhãn `category`, thời gian đọc (tự tính từ body) |
| Trang bài: tiêu đề, ngày, ảnh bìa | `B.title`, `B.date`, `B.cover` |
| Trang bài: nội dung | Body markdown sau frontmatter |
| Trang bài: "Bài liên quan" | tối đa 3 bài **cùng `category`** |
| Meta description bài | `B.excerpt` |

## 6. Giới thiệu `/about`

| Khối | Dữ liệu |
|---|---|
| Hero (tiêu đề, tagline, mô tả, ảnh tòa nhà) | 🔒 `M.about.hero.*` |
| Số liệu | 🔒 `M.about.stats` |
| Sứ mệnh / giá trị | 🔒 `M.about.values`, `missionTitle` (field `mission` trong `about.mdx` là dữ liệu đi kèm) |
| Con người NTA | 🔒 `M.about.people` |
| Mốc phát triển (timeline) | `about/<locale>/about` → `milestones[] {year, description}`; tiêu đề khối 🔒 `M.about.milestonesTitle` |
| Đối tác (logo) | `about.mdx` → `partners[] {name, logo}` — rỗng thì khối ẩn/trống; tiêu đề 🔒 `M.about.partnersTitle` |
| Banner CTA | 🔒 `M.about.ctaTitle/ctaDescription` |

## 7. Liên hệ `/contact`

Toàn bộ 🔒: chữ ở `M.contact.*`, thông tin công ty ở `company_info`, form gửi qua API
`/api/contact` (không lưu DB). Bot sửa được chữ (`M.contact`) và liên hệ (`company_info`), không sửa form.

## 8. Mẹo tra ngược

Tìm trong `data` các bản ghi (`list` + `show`), kể cả `ui_messages`. Chỉ thấy trong code (`src/app/**`) → báo "phần này cần dev sửa".
