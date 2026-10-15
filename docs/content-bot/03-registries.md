# 03 — Registry: bản ghi phải sửa kèm khi thêm / xoá / đổi slug

Sửa **nội dung** trang đã có → chỉ đụng bản ghi nội dung đó (vi + en). **Thêm / xoá / đổi slug** cần ghi thêm các
bản ghi dưới đây, nếu không trang sẽ 404, thiếu trên danh sách, hoặc link chết. Thứ tự ghi: `05` §3 / §5.

## Bảng tổng hợp

| Loại | Thêm mới | Xoá | Đổi slug |
|---|---|---|---|
| **Blog** (`post`) | `post/{vi,en}/<slug>` (+ upload cover). Không registry | delete `post/{vi,en}/<slug>` | Thêm + xoá + báo dev redirect 301 |
| **Giải pháp** (`solution`) | `slug_registry/{vi,en}/<slug>` (group `enterprise`/`ai`) → `solution/{vi,en}/<slug>` → `listing_item/{vi,en}/<slug>` | delete nội dung → registry → listing_item + dọn tham chiếu | Thêm + xoá + redirect |
| **Sản phẩm** (`product`) | registry (group `product`) → `product/{vi,en}/<slug>` → `listing_item` (+ `home.featuredProducts` nếu lên trang chủ) | delete nội dung → registry → listing_item → bỏ khỏi `home.featuredProducts` | Thêm + xoá + redirect |
| **Case study** (`case_study`) | `case_study/{vi,en}/<slug>` → `listing_item/{vi,en}/<slug>` | delete nội dung → listing_item + dọn `related` ở case study khác | Thêm + xoá + redirect |
| **About** | — (1 bản ghi/locale, chỉ sửa) | — | — |

## Chi tiết

### `slug_registry` (thay `src/lib/content/slug.ts`)
- 1 bản ghi / slug / locale, `data = {"group": "enterprise" | "ai" | "product"}`, **ghi giống nhau cho vi và en**.
- `sortOrder` = **thứ tự hiển thị** trên trang danh sách và mega menu Header (0, 1, 2…). Chèn giữa → cập nhật `sortOrder` các bản ghi sau.
- Solution/product không có registry → write-path **từ chối** tạo nội dung (I-3); `category` của solution phải = `group` (I-4).
- Hiện trạng: `list --collection slug_registry --locale vi`.
- Case study và blog **không** có registry.

### `listing_item` (thay `listingItems` trong `listings.ts`)
Metadata thẻ theo slug — **bản vi và en riêng**:
```json
{ "icon": "workflow", "theme": "amber", "categories": ["operations"], "subtitle": "Bộ não vận hành đa tác vụ",
  "chips": ["Đa tác vụ (Multi-Agent)", "AI Hiến pháp", "Con người phê duyệt"] }
```
- `categories` phải là `id` có trong `listing_page/<locale>/<trang>` → `categories`:
  - products: `creative` · `entertainment` · `image` · `lifestyle`
  - caseStudies: `enterprise` · `ai` · `app-ai`
  - enterprise: `sales` · `hr` · `education` · `healthcare`
  - ai: `vision` · `drone` · `assistant` · `gateway` · `operations`
- Thiếu bản ghi → thẻ vẫn hiện nhưng icon/màu mặc định (`layers`/`teal`), không lọc được theo danh mục.
- Case study hiện để `subtitle: ""`, `chips: []`.
- `chips` chỉ diễn đạt lại tính năng đã có trong nội dung — không thêm tuyên bố mới (BR-004).

`listing_page/<locale>/{products,caseStudies,enterprise,ai}` = hero + danh mục lọc 4 trang danh sách. Thêm danh mục lọc mới =
thêm phần tử `categories` ở **cả vi và en**. `listing_cta` = CTA cuối trang, `listing_labels/<locale>/labels` = nhãn chung.

### `home/<locale>/home`
- `solutionCards[].bullets` — tên giải pháp theo nhóm (vd "Khách hàng & bán hàng — CRM"). Xoá/đổi tên giải pháp → sửa bullet (vi + en).
- `featuredProducts[]` — `{slug, title, description, image, alt}`; slug phải còn sống.
- `heroPanels` — chữ trên ảnh hero trang chủ.

### `solution_overview/<locale>/{enterprise,ai}`
Tiêu đề/mô tả 2 nhóm giải pháp. Hiếm khi cần sửa.

### Redirect 301 — KHÔNG nằm trong DB
Xoá / đổi slug trang đã public → URL cũ 404 cho tới khi **dev** thêm 3 dòng (không prefix, `/vi`, `/en`) vào
`next.config.ts` → `redirects()` rồi deploy. Bot chỉ **báo** trong tin nhắn kết quả (đề xuất đích: trang thay thế
hoặc trang danh sách, vd `/solutions/ai`).

## Tham chiếu chéo cần dọn khi xoá / đổi slug

Tìm slug cũ trong `data` của các bản ghi còn sống (`show` từng bản ghi liên quan, hoặc `list` rồi `show`):
- `related` của case study khác; `relatedCases` của giải pháp.
- `href` trong `showcase` (`primaryCta`, `technology.cta`, `cta`) — vd case study nha khoa trỏ `/solutions/enterprise/dentgo`.
- Link markdown trong `body` bài blog.
- `home` (bullets, featuredProducts).

Không dọn ảnh: asset cũ để nguyên (không ảnh hưởng web, dùng lại được).
