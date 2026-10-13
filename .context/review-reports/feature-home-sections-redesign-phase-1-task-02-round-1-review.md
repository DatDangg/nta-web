Agent: reviewer

# Review — feature-home-sections-redesign · phase-1-task-02 · round 1 (CR-016)

- **Review level:** NORMAL
- **Reason:** Chỉ đổi UI trang chủ (khối Sản phẩm). Không đụng auth/API/schema/data. `ProductStrip` chỉ dùng ở trang chủ; `HomeProductCard` là file mới, chỉ dùng ở đây; `HomeSectionHeader` (từ task 01) chỉ được dùng lại, không sửa. Không có rủi ro đỏ nào → không cần STRICT.
- **Blast radius:** `/` và `/en`, khối "Sản phẩm tiêu biểu". Đã bỏ key i18n `home.productsTitle`; grep `src/` không còn chỗ nào dùng. `ProductCard` (cards) giờ không còn chỗ nào dùng, đây là dead code đã ghi follow-up. `listingItems` chỉ được đọc, không sửa.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` (reviewer chạy) | PASS (`tsc --noEmit`, 0 lỗi) |
| `npm run lint` (reviewer chạy) | PASS: 0 error, 1 warning có từ trước ở `src/components/mdx/index.tsx:25` (no-img-element), nằm ngoài scope |
| `npm run build` | Reviewer không chạy (môi trường agent lỗi native binding). Lấy evidence primary: `npm.cmd run build` PASS ở terminal user, 59/59 static pages, chỉ có warning cũ |

## Đối chiếu yêu cầu
- **Card dọc như `1.webp`:** OK. Cả thẻ là 1 `Link` tới `/products/${slug}`, import từ `@/i18n/navigation` nên giữ locale, route `products/[slug]` có `generateStaticParams`. Poster `aspect-[6/7]` dùng `object-cover object-top`. Panel dưới có ô icon nền theme, tên, subtitle `line-clamp-1`, nút tròn mũi tên `aria-hidden` và hàng chip `theme.chip`. Màu violet/rose khớp mockup.
- **Header như `2.webp`:** OK. Eyebrow "PRODUCTS" kèm gạch ngang, H2 "Sản phẩm **tiêu biểu**", mô tả bên phải, nút ← nền trắng có viền, nút → nền `primary-light`.
- **Nút ←/→ disabled:** OK. `useScrollEdges` lắng nghe `scroll` (passive) và `ResizeObserver`, cleanup đủ cả `removeEventListener` lẫn `disconnect`. Sai số 1px. SSR render cả 2 nút ở trạng thái disabled, sau khi mount thì tính lại, không gây lỗi hydration vì state ban đầu giống nhau ở server và client. Từ md trở lên: 2 thẻ `calc(50%-0.75rem)` cộng gap 1.5rem vừa đúng 100%, không cuộn được nên cả 2 nút disabled, đúng acceptance. Mobile: thẻ rộng 85% nên cuộn được.
- **Bước cuộn:** dùng `offsetWidth` của thẻ đầu cộng `columnGap`, khớp với snap. Phím ←/→ trên `role="region"` vẫn hoạt động.
- **A11y:** `aria-label` của nút lấy từ i18n (`previousProducts`/`nextProducts`). `section aria-labelledby` trỏ tới H2 có id. Strip là `tabIndex=0` và có `focus-visible`. Nút size-12 (48px), đạt mức tối thiểu 44px.
- **i18n:** OK. VI và EN có đủ 4 key mới. Eyebrow "PRODUCTS" giống nhau ở 2 ngôn ngữ, đúng như user đã chốt. Mô tả viết lại theo ý mockup. Không có chuỗi hardcode, chỉ có comment.
- **Client bundle:** OK. Ghép `featuredProducts` với `listingItems` ngay ở server (`page.tsx`), nên client chỉ nhận đúng 8 field. `listings.ts` không bị import vào cây `'use client'`. `HomeProductCard` chỉ kéo theo `listingThemes` và `ListingIcon`, cả hai đều nhỏ.

## Responsive Checklist Gate (review tĩnh, không có browser)
| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Không cuộn ngang trang ở 375/768/1280 | OK | Thẻ `shrink-0` nằm trong strip `overflow-x-auto`, nên phần tràn bị giữ trong strip. `-mx-1` của strip nằm gọn trong padding `px-4` của container. Header mobile xếp `flex-col`, cột phải có `min-w-0` |
| Mobile-first `min-width` | OK | `md:`/`lg:`/`sm:` |
| Grid/cột | OK | Mobile 85%/thẻ (vuốt). md+ 2 thẻ trong khung `max-w-[1040px]` canh giữa |
| Typography | OK | H2 dùng `clamp()` (trong HomeSectionHeader). Chữ thẻ dùng các class `text-xl/sm/xs` (rem) |
| Media | OK | `next/image fill` + `aspect-[6/7]` + `sizes` khớp bề rộng (508px tính từ (1040−24)/2) |
| Touch target ≥44px | OK | Nút 48px, cả thẻ là link |
| Viewport/motion | OK | Không dùng `100vh`. Hiệu ứng zoom/translate chỉ bật dưới `motion-safe:` |
| Không dùng overflow:hidden để che lỗi | OK | `overflow-hidden` chỉ dùng để bo góc poster và thẻ |

## Skill gates
- aislop: skip. Không chạy `npx` vì có thể phải tải package. Đọc tay không thấy narrative slop, comment ghi WHY.
- oxlint (anti-slop): skip, chưa cấu hình oxlint (không có `.oxlintrc*`).
- ocr: skip, chưa cài ocr.
- AI-readable: OK. Tên rõ nghĩa, hàm ngắn, ProductStrip khoảng 140 dòng, không có indirection thừa. Có 0 indicator.
- ai-friendly-web: N/A, task này không đổi robots/sitemap/llms.
- blitzstrike: N/A, task không ở mức STRICT.

## Findings
- **[MINOR]** Focus ring của thẻ bị strip cắt mất một phần. Tại `src/components/home/HomeProductCard.tsx:27`, ring nằm cách thẻ 4–6px (`focus-visible:outline-offset-4` + outline 2px), trong khi strip (`ProductStrip.tsx`, div `overflow-x-auto`) chỉ chừa padding `px-1`/`pt-1`, tức 4px. Vì vậy ring bị cắt ở mép trên và 2 mép ngoài, chỉ còn thấy ở mép dưới và phần giữa 2 thẻ. Đề xuất một trong hai: dùng `focus-visible:outline-offset-[-2px]` (hoặc `ring-inset`), hoặc tăng padding/margin âm của strip lên `p-2 -m-2`.
- **[MINOR]** `src/app/[locale]/page.tsx:83`: phép destructure `listingItems[locale][product.slug]` không có guard. Nếu sau này `featuredProducts` thêm một slug chưa có trong `listingItems` thì render sẽ throw. Hiện 2 slug đều có đủ dữ liệu. Đề xuất `.filter` hoặc fallback khi thiếu, hoặc chấp nhận vì build tĩnh sẽ fail sớm. Builder đã ghi điểm này vào residual risk.
- **[MINOR / follow-up]** `featuredProducts[].description` trong `src/content/home.ts` và `src/components/cards/ProductCard.tsx` không còn chỗ nào dùng. Đã ghi follow-up dọn dead code, không xử lý trong CR này.
- **[INFO]** Subtitle và chip lấy từ data thật `listingItems` (ví dụ "Tạo nhạc từ ý tưởng của bạn với AI"), khác chữ trong mockup. Đây là chủ ý của task (scope 2).

## Residual risk
- Chưa kiểm tra trực quan bằng browser ở 375/768/1280. Phần responsive mới chỉ xác minh bằng tính toán CSS.
- Quy trình: lúc đầu reviewer dùng nhầm `sed` để đọc `.opencode/agent/reviewer.md`. Lệnh này không nằm trong danh sách allow, nhưng chỉ đọc và không ghi gì.

## Verdict
✅ **PASS**: không có CRITICAL hoặc MAJOR. Có 2 finding MINOR, builder có thể sửa nhanh (ưu tiên focus ring) hoặc ghi lại làm follow-up.
