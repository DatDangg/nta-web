# Spec update — 2026-10-14 · change `home-solution-card-photo`

- **Spec version**: 3.11.0 (**KHÔNG bump**: requirement/behavior contract không đổi; R-02a vẫn đúng, mỗi thẻ vẫn có ảnh bên phải fade vào nền)
- **Scope version**: v40 → **v41** (`feature-update`)
- **Trigger**: `feature-update` (change-request CR-018, post-build MODIFY UI, follow-up CR-017 / CR-016)
- **Change file**: `spec/changes/2026-10-14-home-solution-card-photo.md` (archive khi close-out)
- **Task**: `tasks/feature-home-solution-card-photo/phase-1-task-01.md`
- **Review**: `.context/review-reports/feature-home-solution-card-photo-phase-1-task-01-round-2-review.md`, round 2 **PASS**
  (round 1 FAIL M1: chữ đè ảnh ở 375/1024, đã fix ở attempt 3)

## Thay đổi

Thẻ **Giải pháp trang chủ** (`/` + `/en`, 3 thẻ DN · AI · Ứng dụng AI) theo ảnh mẫu
`spec/changes/assets/2026-10-14-home-solution-card-photo/5.webp`. Thay đổi chỉ ở phần trình bày:

- **Thẻ rộng hơn**: container riêng của section `max-w-[1400px]` (thay `max-w-container` 1280px). Chỉ áp dụng cho
  `SolutionGridHome`; token `max-w-container` trong `tailwind.config.ts` và các trang khác không đổi. Ở 1440px mỗi thẻ rộng khoảng 429px,
  tiêu đề 1 dòng (`xl:whitespace-nowrap`); thẻ `md:min-h-[16rem]`.
- **Ảnh dạng ảnh thật**: 3 ảnh mới `public/images/illustrations/home-{enterprise,ai,apps}-photo.webp` (1536×1024, 78–116KB),
  user tạo theo prompt trong change doc: laptop + dashboard / chip AI + màn hình camera giao thông / 2 điện thoại app giám sát.
  Thay 3 ảnh 3D `home-*.png` của CR-017 (file PNG cũ giữ trên đĩa, không còn được tham chiếu).
- **Bố cục ảnh** (1 khung `aspect-[3/2]`, không cắt ảnh):
  - md (768–1023) và xl (≥1280): `absolute` neo góc phải-dưới (md 55%, xl 80% bề rộng thẻ), cột chữ `max-w-[56%]`.
  - mobile (<768) và lg (1024–1279, 3 cột hẹp): dải ảnh trong flow ở đáy thẻ, dưới link "Tìm hiểu …", tràn sát mép thẻ.
  - Mask `photoFade`: mờ sang trái (`transparent → #000 45%`) giao với mờ mép trên (`transparent → #000 25%`), dùng `mask-composite: intersect`.
    Bỏ 2 lớp nền surface của CR-017 vì khung ảnh không còn nằm dưới chữ.
- **Alt VI/EN** mô tả nội dung ảnh, **không** có tiền tố "Minh hoạ"/"Illustration" (theo chốt của user). Không có caption.
- `sizes`: `(min-width: 1280px) 360px, (min-width: 1024px) 33vw, (min-width: 768px) 55vw, 100vw`.
- Nội dung chữ (tiêu đề, mô tả, 3 bullet, link) giữ nguyên như CR-016.

**Code:** `src/components/home/SolutionGridHome.tsx`, `src/content/home.ts` (chỉ field `image` + `alt` của 3 thẻ `solutions`, VI + EN),
`public/images/illustrations/home-{enterprise,ai,apps}-photo.webp`.

## Đối chiếu spec

- R-02a: "ảnh minh hoạ bên phải thẻ fade vào nền". md/xl đúng nguyên văn. Ở mobile và lg, ảnh là dải dưới link
  (bố cục responsive để chữ không đè ảnh, theo review M1). Coi đây là cách thích ứng responsive trong ràng buộc "mobile 1 cột,
  không tràn ngang", không phải đổi requirement, nên không bump. Nếu user muốn spec ghi rõ bố cục mobile/lg thì làm PATCH 3.11.1
  qua Change Request và cần user duyệt.
- Cụm "ảnh minh hoạ" trong R-02a hiểu là ảnh nói chung, không bắt buộc ảnh 3D, nên không mâu thuẫn với ảnh dạng ảnh thật.
- Không có chỗ nào trong spec cố định container 1280px cho khối này (1280 trong spec chỉ là breakpoint `xl`).

## Impact

- **Direct**: `/` và `/en`, khối Giải pháp (3 thẻ).
- **Dependents**: không có (`SolutionGridHome` / `SolutionHomeCard` chỉ dùng ở trang chủ; `HomeSectionHeader`, `HomeImage`, `SolutionCard`
  dùng chung không bị sửa).
- **Regression**: các khối khác của trang chủ (Hero, Sản phẩm tiêu biểu, Câu chuyện khách hàng, CTA), các trang khác dùng `max-w-container`
  (không đổi), link 3 thẻ đúng route VI/EN.

## Acceptance / verify

- Ở desktop thẻ rộng hơn CR-017 (container riêng 1400px); tiêu đề 1 dòng ở 1280/1440, VI + EN.
- Ảnh laptop / chip AI / điện thoại: ở md/xl nằm góc phải-dưới; ở mobile/lg là dải dưới link; ảnh tan vào nền thẻ.
- Chữ không đè ảnh ở 375/768/1024/1440 VI+EN (reviewer đo được hits = 0, kể cả 1280 EN).
- Ảnh có `naturalWidth > 0`, overflow ngang 0 ở mọi mốc.
- Alt mô tả nội dung, không có tiền tố "Minh hoạ".
- Verify: `npm run typecheck` PASS · `npm run lint` PASS (0 error; 1 warning có sẵn ở `src/components/mdx/index.tsx`) · `npm run build`:
  primary chạy lúc close-out (lần builder chạy bị BLOCKED vì native binding).

## Residual

- 1920 chưa đo riêng (dùng cùng container 1400 nên dự kiến giống 1440). Chưa kiểm tra `mask-composite` trên Safari.
- Ở xl thẻ "Doanh nghiệp", chậu cây nằm sát mép phải cột chữ (cách khoảng 3px), không phải chủ thể chính.
- Ở mobile/lg thẻ cao hơn vì có thêm dải ảnh khoảng 200–230px.
