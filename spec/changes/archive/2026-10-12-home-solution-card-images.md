---
id: home-solution-card-images
type: feature
status: done
created: 2026-10-12
---

# 2026-10-12 — Trang chủ: 3 ảnh minh hoạ mới cho 3 thẻ giải pháp + thẻ cao đều / text thẳng hàng

- **Class:** MODIFY (asset + layout UI, post-build)
- **Risk:** LOW–MEDIUM — `SolutionCard` dùng chung với `/solutions/enterprise` + `/solutions/ai`
  (2 trang này render bằng nhánh `shot=true`; layout thẻ trang chủ dùng nhánh còn lại)
- **Slug:** `home-solution-card-images`

## Yêu cầu user (nguyên văn)

> "3 ảnh đầu t gửi, thay lần lượt vào 3 ảnh theo thứ tự trong ảnh 3, bên cạnh đó cho vị trí nó bằng
> nhau đi, text thẳng hàng, cả thẻ cao bằng nhau luôn"

## 1. Bối cảnh

Khối "3 mảng giải pháp" trang chủ (`SolutionGridHome`) render `home.solutionCards` (VI + EN) qua
`SolutionCard`. Trước change này 3 thẻ render **khác nhau**:

| Thẻ | `shot` | Ảnh | Layout |
|---|---|---|---|
| 1 · Giải pháp Doanh nghiệp | `true` | `solutions/v2/lms/01-tong-quan.png` (ảnh giao diện thật) | khung `CardShotImage` `aspect-[16/10]` **dính mép trên**, Link `p-0 overflow-hidden` |
| 2 · Giải pháp AI | không | `illustrations/ai-analysis.svg` (placeholder) | `p-4` + `HomeImage` `aspect-[16/10] rounded-lg object-cover` |
| 3 · Ứng dụng AI | không | `illustrations/ai-apps.svg` (placeholder) | như thẻ 2 |

Hệ quả: ảnh/thân thẻ lệch nhau, CTA "Tìm hiểu thêm" không thẳng hàng, Link không `h-full` nên
thẻ không cao đều.

## 2. Thay đổi

### 2.1 Ảnh (thứ tự gán CỐ ĐỊNH, không đổi mapping)

| Thẻ | `href` | Ảnh mới | Nội dung ảnh |
|---|---|---|---|
| 1 · Giải pháp Doanh nghiệp | `/solutions/enterprise` | `/images/illustrations/home-enterprise.jpg` (557×390) | Khung điện thoại + 4 icon: biểu đồ cột, nhân sự, cài đặt, lưới ứng dụng |
| 2 · Giải pháp AI | `/solutions/ai` | `/images/illustrations/home-ai.jpg` (555×390) | Khối "AI" phát sáng + 4 icon: sparkle, chat, tài liệu, code |
| 3 · Ứng dụng AI | `/products` | `/images/illustrations/home-apps.jpg` (554×390) | Cửa sổ ứng dụng có dashboard biểu đồ tăng trưởng + biểu tượng nhóm người |

3 ảnh do user gửi, đã trích từ hội thoại và copy sẵn vào `public/images/illustrations/`.
`alt` viết lại đúng ngôn ngữ VI/EN, mô tả nội dung ảnh.

### 2.2 Bố cục — 3 thẻ cao đều, text thẳng hàng

- **Bỏ `shot: true`** ở thẻ 1 (VI + EN) → cả 3 thẻ dùng **cùng một nhánh layout** của `SolutionCard`
  (`p-4` + `HomeImage` khung `aspect-[16/10] rounded-lg object-cover`). Ảnh mới là illustration
  phẳng, không có chữ cần giữ như ảnh giao diện thật ⇒ không cần nhánh `shot`.
- **Thẻ cao đều + CTA thẳng hàng:** Link thẻ `h-full flex flex-col`; phần thân `flex flex-1 flex-col`;
  CTA `mt-auto` (đẩy xuống đáy) → khi lưới stretch item (grid `align-items: stretch`, item là
  `.reveal-item` do `Reveal` sinh ra), tiêu đề / mô tả / CTA của 3 thẻ thẳng hàng theo cột.
- **KHÔNG đổi** `cardImageClass` / `cardShotFrameClass` / `cardLinkClass` (dùng chung với `AppCard`,
  `CaseStudyCard`, `ProductCard`, `PostCard`) — chỉ thêm class ở call site trong `SolutionCard`.

## 3. Phạm vi file (dự kiến)

| File | Thay đổi |
|---|---|
| `src/content/home.ts` | 3 `image` + `alt` (vi + en), bỏ `shot: true` thẻ 1 |
| `src/components/cards/SolutionCard.tsx` | Link `h-full flex flex-col`, thân `flex flex-1 flex-col`, CTA `mt-auto` |
| `public/images/illustrations/home-{enterprise,ai,apps}.jpg` | 3 asset mới (đã copy) |

Ngoài phạm vi (KHÔNG đụng): `AppCard` / `ProductCard` / `PostCard` / `CaseStudyCard`,
`cardStyles.ts`, `SolutionGridHome.tsx` (grid đã stretch sẵn; `shot` prop giữ nguyên cho 2 trang kia),
`.mdx` solutions, OG/JSON-LD/sitemap (`home.solutionCards[].image` **không** dùng cho OG —
OG = `/images/og-default.png`).

## 4. Không regression 2 trang dùng chung component

`/solutions/enterprise` (4 thẻ) + `/solutions/ai` (3 thẻ) gọi `SolutionCard` với
`shot={solution.cardImage !== undefined}` = **true** (8 `.mdx` đều có `cardImage`). Các trang này
bọc card trong `<li>` → `<Reveal>` → `.reveal-item` **không** bị ràng buộc chiều cao ⇒ `h-full`
resolve về `auto`, `flex-1`/`mt-auto` không có free space ⇒ **không đổi bố cục**. Vẫn phải kiểm
bằng HTML build: ảnh + alt + cấu trúc khung `aspect-[16/10]` của 2 trang giữ nguyên.

## 5. Acceptance

- [x] `home.ts` (vi + en): 3 `image` trỏ đúng `home-enterprise.jpg` / `home-ai.jpg` / `home-apps.jpg`
      theo đúng thứ tự thẻ 1/2/3; `alt` VI + EN mô tả đúng nội dung ảnh, đúng ngôn ngữ
- [x] Không còn `shot: true` ở `home.solutionCards` (cả 2 locale) → 3 thẻ cùng layout
- [x] 3 thẻ cao đều + tiêu đề/mô tả/CTA "Tìm hiểu thêm" thẳng hàng (Link `h-full flex flex-col`,
      thân `flex flex-1 flex-col`, CTA `mt-auto`)
- [x] Không còn tham chiếu ảnh cũ ở thẻ trang chủ HTML build: `lms/01-tong-quan.png`,
      `ai-analysis.svg`, `ai-apps.svg`
- [x] `/solutions/enterprise` + `/solutions/ai` + `/en/...`: ảnh/alt/khung thẻ không đổi
- [x] `nav`/OG/JSON-LD/sitemap không đổi (field `image` không phục vụ OG)
- [x] `npm run lint` · `npm run typecheck` · `npm run build` PASS
- [x] Reviewer PASS (NORMAL)

## 6. Ghi chú

- Tham chiếu spec: **R-02** (Module 1 — Trang chủ `/`: "Khối 3 mảng giải pháp … 3 card, điều hướng
  đúng trang, có hover state"). Change này **không đổi requirement** (số thẻ, đích điều hướng,
  hover giữ nguyên) → spec_version giữ `3.0.0`, chỉ publish lại scope cho template test.
- Migration: `db_tool: none` → bỏ qua gate migration.
- Change pending khác (KHÔNG đụng): `2026-10-12-solution-card-real-images.md`,
  `2026-10-12-brand-logo-lockup.md`.
