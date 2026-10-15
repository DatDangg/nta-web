# 06 — Khung tối thiểu (chuyển sang JSON để ghi DB)

Khung dưới đây đủ field bắt buộc. Viết ở dạng MDX cho dễ đọc — khi ghi DB: frontmatter → object `data` (JSON), phần dưới `---` → `body` (chỉ blog; loại khác `body: null`), `listingItems` → `data` của bản ghi `listing_item/<locale>/<slug>`. Thay `<...>`; xoá block tuỳ chọn nếu không có dữ liệu thật.
Bản `en` cùng cấu trúc, chỉ dịch chữ. Muốn trang đầy đủ như hiện có → `db:cli show` 1 bản ghi thật cùng loại.

## 1. Blog — `post/<locale>/<slug>`

```mdx
---
slug: "<slug>"
title: "<Tiêu đề bài>"
date: "<YYYY-MM-DD>"
category: "<ai-tech|practical|customer-stories|nta-news|trends|guides>"
excerpt: "<1–2 câu tóm tắt>"
cover: "/images/blog/<cover>.svg"
---

<Đoạn mở đầu.>

## <Mục 1>

<Nội dung.>

## <Mục 2>

<Nội dung.>
```

## 2. Giải pháp — `solution/<locale>/<slug>`

Mẫu đầy đủ: `src/content/solutions/vi/ai-operations-brain.mdx` (AI), `src/content/solutions/vi/crm.mdx` (enterprise).

```yaml
---
slug: <slug>
brandName: "<Tên ngắn>"
title: "<Tên đầy đủ>"
description: "<Mô tả 1–2 câu cho thẻ + SEO>"
category: <enterprise|ai>
image: /images/solutions/<slug>.svg
features:
  - title: "<Tính năng 1>"
    description: "<mô tả>"
  - title: "<Tính năng 2>"
    description: "<mô tả>"
  - title: "<Tính năng 3>"
    description: "<mô tả>"
benefits:
  - "<Lợi ích 1>"
  - "<Lợi ích 2>"
showcase:
  hero:
    breadcrumbLabel: "<Tên ngắn>"
    eyebrow: "<Giải pháp AI|Giải pháp doanh nghiệp> · <lĩnh vực>"
    titleLead: "<Nửa đầu tiêu đề>"
    titleAccent: "<nửa tô màu>"
    subtitle: "<Tên sản phẩm>"
    description: "<2–3 câu>"
    image:
      src: /images/solutions/<slug>.svg
      alt: "<Mô tả ảnh>"
      width: <px>
      height: <px>
      caption: "<bắt buộc nếu là minh hoạ>"
    primaryCta:
      label: "Nhận tư vấn"
      href: "/contact"
  stats:
    - icon: modules
      value: "<giá trị thật>"
      label: "<nhãn>"
    - icon: solution
      value: "<...>"
      label: "<...>"
    - icon: calendar
      value: "<...>"
      label: "<...>"
  pillars:
    - icon: challenge
      title: "Thách thức"
      items: ["<...>", "<...>", "<...>"]
    - icon: solution
      title: "Giải pháp"
      items: ["<...>", "<...>", "<...>"]
    - icon: result
      title: "<Kết quả | Kết quả kỳ vọng>"
      items: ["<...>", "<...>", "<...>"]
  features:
    eyebrow: "Tính năng"
    title: "<Tiêu đề khối>"
    items:
      - title: "<...>"
        description: "<...>"
  faq:
    eyebrow: "Câu hỏi thường gặp"
    title: "<Tiêu đề khối>"
    items:
      - question: "<...>"
        answer: "<...>"
  cta:
    title: "<Lời mời>"
    description: "<1 câu>"
    label: "Liên hệ tư vấn"
    href: "/contact"
---
```
Kèm: thêm slug vào `enterpriseSlugs`/`aiSlugs` + `listingItems` vi/en (03).

## 3. Sản phẩm — `product/<locale>/<slug>`

Mẫu đầy đủ: `src/content/products/vi/music-app.mdx`.

```yaml
---
slug: <slug>
brandName: "<Tên app>"
title: "<Tên hiển thị>"
description: "<Mô tả>"
screenshots:
  - /images/products/<slug>.jpg
downloadUrl: null
features:
  - "<Tính năng 1>"
  - "<Tính năng 2>"
  - "<Tính năng 3>"
showcase:
  hero: { ... như §2, primaryCta: { label: "Xem tính năng", href: "#features" } }
  stats: [ ... ]
  pillars: [ ... ]
  features:
    eyebrow: "Tính năng"
    title: "<...>"
    items: [ ... ]
  cta: { title: "<...>", description: "<...>", label: "Liên hệ", href: "/contact" }
---
```
Kèm: `productSlugs` + `listingItems` vi/en (+ `home.ts` `featuredProducts` nếu cần).

## 4. Case study — `case_study/<locale>/<slug>`

Mẫu đầy đủ: `src/content/case-studies/vi/dental-clinic-operations.mdx`.

```yaml
---
slug: <slug>
title: "<Tiêu đề>"
category: <enterprise|ai|app-ai>
sector: "<Lĩnh vực>"
client: "<Mô tả ẩn danh, vd: Một chuỗi bán lẻ tại Hà Nội>"
year: <YYYY>
challenge: "<1–2 câu>"
solution: "<1–2 câu>"
result: "<Kết quả đã xác nhận | Chưa có chỉ số đã được xác nhận để công bố.>"
gallery: []
cover: /images/cases/<slug>/hero.jpg
related: []
layout: showcase
showcase:
  hero:
    breadcrumbLabel: "<...>"
    eyebrow: "<Lĩnh vực> · <YYYY>"
    titleLead: "<...>"
    titleAccent: "<...>"
    subtitle: "<...>"
    description: "<...>"
    image: { src: /images/cases/<slug>/hero.jpg, alt: "<...>", width: <px>, height: <px> }
    primaryCta: { label: "Khám phá giải pháp", href: "/solutions/<enterprise|ai>/<slug-giải-pháp>" }
  stats: [ ... 3 mục ... ]
  pillars: [ challenge, solution, result ]
  note: "<bắt buộc nếu là phương án đề xuất>"
  cta: { title: "<...>", description: "<...>", label: "Liên hệ tư vấn", href: "/contact" }
---
```
Kèm: `listingItems` vi/en với `subtitle: ''`, `chips: []`, `categories: ['<category>']`.

## 5. `listing_item/{vi,en}/<slug>` (data = 1 entry `listingItems` cũ, ghi CẢ vi và en)

```ts
'<slug>': { icon: '<ListingIconName>', theme: '<ListingTheme>', categories: ['<id danh mục>'], subtitle: '<phụ đề ngắn>', chips: ['<chip 1>', '<chip 2>', '<chip 3>'] },
```
