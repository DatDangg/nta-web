# feature-home-sections-redesign · phase-1-task-02 — Khối "Sản phẩm tiêu biểu": header kiểu 2.webp + card dọc dài kiểu 1.webp

- **CR:** CR-016 · spec delta R-03a
- **Classification / Risk:** MODIFY (UI) · MEDIUM
  - Scope: `src/components/home/ProductStrip.tsx` (client), `src/components/home/HomeProductCard.tsx` (MỚI), `src/content/home.ts`
    (`featuredProducts` thêm `icon`/`theme`/`chips` — hoặc đọc `listingItems` theo slug), i18n `home.productsEyebrow/…Lead/…Accent`.
  - KHÔNG sửa `src/components/cards/ProductCard.tsx` (sau task này không còn nơi dùng → ghi follow-up dọn dead code, không xoá trong CR này).
  - Expected review level: **NORMAL**
  - Blast radius: `/`, `/en`
  - Doc impact: SPECIFICATIONS R-03a (close-out)

## Scope
1. Header: `HomeSectionHeader` (task 01) — eyebrow "PRODUCTS", "Sản phẩm **tiêu biểu**", mô tả phải, 2 nút tròn ←/→ (nút → nền teal nhạt
   như mockup), `aria-label` i18n có sẵn `previousProducts/nextProducts`; `disabled` khi ở đầu/cuối hoặc không cuộn được
   (theo dõi `scrollLeft`/`scrollWidth` qua listener `scroll` + `ResizeObserver`).
2. `HomeProductCard` (card dọc như `1.webp`): cả thẻ là 1 `Link` → `/products/<slug>`; poster trên `aspect-[6/7]` (`next/image fill`,
   `object-cover object-top`, bo góc trên); panel trắng dưới: ô icon app (nền theme nhạt, `ListingIcon` music/face), tên + mô tả 1 dòng
   (`listingItems.subtitle`, `line-clamp-1`), nút tròn mũi tên màu theo theme (trang trí, `aria-hidden`), hàng chip `listingItems.chips`
   (màu `listingThemes[theme].chip`).
3. Strip: snap-x; mobile ~85% chiều rộng/thẻ (vuốt), md+ 2 thẻ (khung max ~1040px canh giữa như mockup); >2 sản phẩm thì tự cuộn.
   Giữ `role="region"` + phím ←/→ hiện có.
4. Ảnh poster: `music-app` → `/images/products/ai-music-app.png` (941×1671, dọc 9:16); `hair-style-ai` → `/images/products/hair-style-ai.jpg`
   (941×1672, dọc 9:16). Crop `object-top` về ~6:7. Alt giữ chuỗi hiện có.

## Acceptance
- Card dọc kiểu `1.webp`; nút ←/→ hoạt động khi danh sách tràn (mobile/tablet), disabled đúng khi không cuộn được (desktop 2 thẻ).
- Mỗi card link đúng `/products/<slug>` (VI/EN); chip/subtitle từ data thật; 375/768/1280 không tràn ngang trang.
- typecheck / lint / build PASS.

## Retry / Escalation
Max 3 attempt; fail lần 3 → `architecture_review_needed`.

## Verification summary
(builder/reviewer điền)
