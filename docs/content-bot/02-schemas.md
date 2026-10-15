# 02 — Schema nội dung (= `data` của bản ghi)

Nguồn sự thật: `src/content/types.ts` (interface) + `src/db/content-rules.ts` (`REQUIRED_FIELDS`, enum).
Các mục dưới ghi theo đường dẫn file seed cũ cho dễ đối chiếu; trong DB: frontmatter → `data` (JSON), thân MDX → `body`,
khoá = `<collection>/<locale>/<slug>` (`08` §2: blog → `post`, solutions → `solution`, products → `product`, case-studies → `case_study`).
Ký hiệu: **(bắt buộc)** = write-path từ chối ghi khi thiếu. `?` = tuỳ chọn.

Quy ước chung:
- `data` là JSON (cú pháp `04` §F).
- `data.slug` = slug của khoá, chỉ `a-z 0-9 -`. **Cùng slug cho cả `vi` và `en`.**
- Ảnh = `/uploads/<hash>.<ext>` (từ `db:cli upload`) hoặc ảnh tĩnh có sẵn `/images/...`. Ảnh phải tồn tại (I-7).
- `ratio` = rộng / cao (số thập phân, vd `1.396`), lấy từ kích thước ảnh thật (output `upload`) — không đoán.

---

## 1. Blog — `post/<locale>/<slug>`

```yaml
slug: "first-steps"            # (bắt buộc)
title: "..."                   # (bắt buộc)
date: "2026-10-14"             # (bắt buộc) ISO YYYY-MM-DD, quyết định thứ tự
category: "practical"          # (bắt buộc) 1 trong enum dưới
excerpt: "..."                 # (bắt buộc) 1–2 câu, hiện ở thẻ + meta description
cover: "/images/blog/xxx.svg"  # (bắt buộc)
```
Sau frontmatter là **body markdown** (bắt buộc, không rỗng). `readingMinutes` tự tính — KHÔNG khai báo.

`category` enum (`src/lib/blog/categories.ts`):
`ai-tech` · `practical` · `customer-stories` · `nta-news` · `trends` · `guides`.
Nhãn hiển thị nằm ở `src/i18n/messages/<locale>.json` → `blog.categories`.

---

## 2. Giải pháp — `solution/<locale>/<slug>`

Body để trống; toàn bộ dữ liệu trong frontmatter.

| Field | Kiểu | Ghi chú |
|---|---|---|
| `slug` | string | (bắt buộc) phải có trong `enterpriseSlugs` hoặc `aiSlugs` (03) |
| `title` | string | (bắt buộc) tên đầy đủ, hiện ở thẻ + mega menu |
| `brandName` | string? | tên ngắn cho breadcrumb + `<title>` SEO |
| `description` | string | (bắt buộc) mô tả thẻ + meta description |
| `category` | `enterprise` \| `ai` | (bắt buộc) quyết định URL `/solutions/<category>/<slug>` |
| `features` | list | (bắt buộc) `{title, description?, image?, imageAlt?, ratio?}` hoặc chuỗi. Tiêu đề dùng làm chip/từ khoá tìm kiếm |
| `benefits` | string[] | (bắt buộc) |
| `showcase` | object | (bắt buộc) **nội dung trang chi tiết** — xem §6 |
| `image` | string? | SVG đại diện (placeholder thẻ) |
| `cardImage` | `{src, alt, ratio?}`? | Ảnh thật cho thẻ danh sách; thiếu → `heroShot` → `image` |
| `heroShot` | `{src, alt, ratio?, maxWidth?}`? | |
| `useCases`, `sections`, `highlights`, `faq`, `screenshots`, `relatedCases`, `renderExtendedContent`, `layout`, `compliance`, `aiSection`, `audience`, `cta`, `imageCaption` | tuỳ chọn | Dữ liệu cũ / phụ trợ — giữ nguyên khi sửa, không cần điền khi tạo mới |

---

## 3. Sản phẩm (ứng dụng AI) — `product/<locale>/<slug>`

| Field | Kiểu | Ghi chú |
|---|---|---|
| `slug` | string | (bắt buộc) phải có trong `productSlugs` (03) |
| `title` | string | (bắt buộc) |
| `brandName` | string? | |
| `description` | string | (bắt buộc) |
| `screenshots` | string[] | (bắt buộc) ít nhất 1 ảnh |
| `downloadUrl` | string \| null | `null` khi chưa phát hành — **không bịa link store** |
| `features` | string[]? | |
| `showcase` | object | (bắt buộc) — §6 |

---

## 4. Case study — `case_study/<locale>/<slug>`

| Field | Kiểu | Ghi chú |
|---|---|---|
| `slug` | string | (bắt buộc) |
| `title` | string | (bắt buộc) |
| `category` | `enterprise` \| `ai` \| `app-ai` | (bắt buộc) |
| `year` | number | (bắt buộc) — quyết định thứ tự (giảm dần) |
| `challenge` | string | (bắt buộc) |
| `solution` | string | (bắt buộc) |
| `result` | string | (bắt buộc) — dùng làm meta description. Chưa có số liệu xác nhận → ghi rõ như vậy (BR-004) |
| `gallery` | `{src, alt}[]` | (bắt buộc, có thể `[]` nếu có `cover`) |
| `related` | string[] | (bắt buộc, thường `[]`) — slug case study khác |
| `sector` | string? | vd "Y tế" |
| `client` | string? | **Ẩn danh** nếu chưa được phép công bố (BR-004) |
| `cover` | string? | Ảnh thẻ; thiếu → `gallery[0]` |
| `layout` | `default` \| `showcase` | Nên dùng `showcase` (mọi case study hiện tại) |
| `showcase` | object | Bắt buộc khi `layout: showcase` — §6 |

---

## 5. About — `about/<locale>/about`

```yaml
mission: "..."                       # (bắt buộc)
milestones:                          # (bắt buộc)
  - year: 2022
    description: "..."
partners: []                         # (bắt buộc) [{name, logo: "/images/..." | null}]
```

---

## 6. Block `showcase` (trang chi tiết giải pháp / sản phẩm / case study)

Interface `CaseStudyShowcase` trong `types.ts`. Thứ tự block trên trang: hero → stats → pillars →
technology → photos → features → details → vision → faq → cta. Block tuỳ chọn thiếu → **ẩn**, không lỗi.

```yaml
showcase:
  hero:                                   # (bắt buộc)
    breadcrumbLabel: "..."                # ?
    eyebrow: "Y tế · 2025"                # dòng nhỏ trên tiêu đề
    titleLead: "Số hóa quy trình"         # phần đầu tiêu đề
    titleAccent: "tại phòng khám nha khoa"  # phần tô màu
    subtitle: "..."
    description: "..."
    image: { src, alt, width?, height?, caption? }   # width/height = kích thước gốc ảnh; caption bắt buộc nếu là ảnh minh hoạ
    primaryCta: { label, href }           # href nội bộ: "/solutions/enterprise/dentgo" hoặc "#features"
    video?: { label, href }               # chỉ khi có URL video thật
  stats:                                  # (bắt buộc) thường 3 mục
    - { icon: <ShowcaseIcon>, value: "...", label: "..." }
  pillars:                                # (bắt buộc) thường 3 cột: challenge / solution / result
    - { icon: <ShowcaseIcon>, title: "...", items: ["...", "..."] }
  technology?:
    id?, eyebrow, title, description, cta?: {label, href}
    nodes: ["Camera", {label: "...", icon: <ShowcaseNodeIcon>}]
    alerts?: [{title, meta}]              # bỏ qua khi có screen
    screen?: { src, alt, width, height, device?: monitor|phone }
    caption: "..."                        # (bắt buộc trong technology)
  photos?:
    eyebrow, title, prevLabel, nextLabel, caption?
    variant?: photo|screen|phone
    aspect?: "720/1561"                   # chỉ với variant phone
    items: [{src, alt}]
  features?:  { eyebrow, title, items: [{title, description, icon?: <ShowcaseIcon>}] }
  details?:   { eyebrow, title, groups: [{title, intro?, items?: [...]}] }
  vision?:    { eyebrow, title, description, quote?, quoteSource?, image?: {src, alt} }   # quote chỉ khi có trích dẫn thật
  note?: "..."                            # lưu ý dưới thẻ số liệu (vd "đây là phương án đề xuất")
  faq?:       { eyebrow, title, items: [{question, answer}] }
  cta:                                    # (bắt buộc)
    title, description, label, href       # href thường "/contact"
    image?: "/images/..."
```

### Enum icon

- `ShowcaseIcon`: `area` · `camera` · `calendar` · `challenge` · `solution` · `result` · `modules`
- `ShowcaseNodeIcon`: `camera` · `drone` · `vms` · `calendar` · `records` · `inventory` · `photo` · `ai` · `music` · `share`
- `ListingIconName` (dùng trong `listing_item`, `home`): `apps arrow bolt box building call camera chart chat check car cpu drone gear face graduation grid heart home idcard image headset landmark layers mail music pen phone plug plus search shield smile pin sparkles tooth train users workflow target eye gem`
- `ListingTheme`: `violet` · `rose` · `sky` · `teal` · `amber` · `emerald` · `indigo`

Giá trị ngoài enum → write-path từ chối (I-6) hoặc icon không hiển thị. Không tự thêm enum mới — đó là việc code, ngoài phạm vi bot.
