# phase-1-task-01 — Trang chủ khối Sản phẩm: thêm thẻ CTA "Sắp có thêm ứng dụng mới" cuối dải

- Change: CR-021 `spec/changes/2026-10-14-home-products-coming-soon-card.md`
- Classification / Risk: **ADDITIVE (UI)** · risk **LOW** (1 section public trang chủ, không API/schema/auth; tái dùng component + nội dung có sẵn)
- Status: done — phase plan user duyệt khi gõ /change (1 task); reviewer round 1 FAIL (F-1) → attempt 2 → round 2 PASS
- Spec: 3.13.0 → **3.14.0** (MINOR — thêm behavior; 3.13.0 đã thuộc CR-019 chạy song song) · test-scope v43 → **v44** (trigger feature-update)

## Spec delta (đã áp dụng vào SPECIFICATIONS.md 3.14.0 — R-03a)
> **(3.14.0 — CR-021)** Cuối dải, sau thẻ sản phẩm cuối, có 1 thẻ CTA viền đứt "Sắp có thêm ứng dụng mới" — cùng component,
> nội dung (`listingCtas[locale].products`, vi + en), icon `plus` và đích `/contact` (`/en/contact`) như thẻ CTA cuối lưới `/products`;
> rộng bằng 1 thẻ sản phẩm (85% mobile, ½ dải từ `md`), snap như thẻ khác, nằm trong vùng cuộn nên ←/→/phím/vuốt tính cả thẻ này.
> Thẻ chỉ hiện khi section hiện (không làm section hiện khi không có sản phẩm).

## Phạm vi code
| File | Việc |
|---|---|
| `src/components/home/ProductStrip.tsx` | Thêm prop `cta: ListingCta` (type từ `@/components/listing/types`); render `<ListingCtaCard cta={cta} />` (từ `@/components/listing/ListingCard`) bọc trong `div` cùng class kích thước thẻ sản phẩm (`w-[85%] shrink-0 snap-start md:w-[calc(50%-0.75rem)]`) làm phần tử CUỐI của dải `stripRef`. Giữ early-return khi `products.length === 0`. Không sửa `useScrollButtons` (canNext tính theo scrollWidth). |
| `src/app/[locale]/page.tsx` | Truyền `cta={{ ...listingCtas[locale].products, href: '/contact', icon: 'plus' }}` — y hệt `src/app/[locale]/products/page.tsx:82`. Import `listingCtas` từ `@/content/listings` (file đã import `listingItems`). |

Cách lấy locale: page server đã có `locale` → truyền prop (không dùng `useLocale` trong client component) — nhất quán với `products/page.tsx`.
**Không** thêm chuỗi i18n mới, **không** sửa `ListingCtaCard` (nếu cần chiều cao khớp thẻ sản phẩm: wrapper `flex` để thẻ `h-full` giãn theo hàng).

## Acceptance
- [ ] Thẻ hiển thị cuối dải sản phẩm trang chủ `/` và `/en`, nội dung = thẻ CTA `/products` (vi: "Sắp có thêm ứng dụng mới"/"Liên hệ đội ngũ NTA"; en: "More apps coming soon"/"Contact the NTA team")
- [ ] Style viền đứt như `/products`; rộng bằng thẻ sản phẩm; cao giãn bằng hàng
- [ ] Link → `/contact` (vi) / `/en/contact` (en)
- [ ] ←/→, phím ←/→ khi dải focus, vuốt mobile vẫn đúng; nút → bật được ở desktop khi có thẻ thứ 3; không tràn ngang trang ở 375/1440
- [ ] typecheck / lint / build PASS

## Verify commands (từ `.context/project-config.md`)
- `npm run typecheck` · `npm run lint` · `npm run build` (Windows: `npm.cmd`; sandbox lỗi native binding → ghi Blocked, chạy ở terminal user)
- Prerender `.next/server/app/vi.html` / `en.html` chứa tiêu đề thẻ CTA + href `/contact` / `/en/contact`.

## Doc impact (close-out)
- `SPECIFICATIONS.md` R-03a (3.14.0) + `spec/updates/2026-10-14-home-products-coming-soon-card.md` + `spec/CHANGELOG.md` + `spec/test-scope/current.json` v44
- `.context/design-spec.md` §Trang chủ mục 3 (Sản phẩm tiêu biểu) — ghi chú thẻ CTA cuối dải (as-built)
- Không đổi API/schema. Intent docs (BRD FR-003 "≥ 2 sản phẩm tiêu biểu") không đổi.

## Retry / Escalation
- 3 attempt FAIL → `architecture_review_needed`, dừng.

## Verification summary
### Builder attempt 1 (2026-10-14)
- Files changed:
  - `src/components/home/ProductStrip.tsx` — prop bắt buộc `cta: ListingCta`; sau `products.map` render `<div className="flex w-[85%] shrink-0 snap-start md:w-[calc(50%-0.75rem)]"><ListingCtaCard cta={cta} /></div>` (phần tử cuối trong `stripRef`). Early-return `products.length === 0` giữ nguyên; `useScrollButtons`/`ListingCtaCard` không sửa.
  - `src/app/[locale]/page.tsx` — import `listingCtas`; truyền `cta={{ ...listingCtas[locale].products, href: '/contact', icon: 'plus' }}` (y hệt `products/page.tsx:82`).
  - `.context/design-spec.md` §Trang chủ mục 3 — ghi chú as-built thẻ CTA cuối dải (CR-021).
- Client-safety: `ListingCard.tsx` chỉ import `next/image`, `@/i18n/navigation` (next-intl `createNavigation`), `./icons`, `./themes`, `./types` — không server-only → import được vào client component.
- `npm.cmd run typecheck` → PASS (exit 0).
- `npm.cmd run lint` → PASS (0 errors, 1 warning có sẵn ở `src/components/mdx/index.tsx:25`, ngoài scope).
- `npm.cmd run build` → **BLOCKED** (môi trường): `Failed to load next.config.ts` / `Error: Failed to load native binding` — lỗi sandbox, không liên quan code; không retry. Cần chạy build ở terminal user.
- Prerender grep (`.next/server/app/vi.html`/`en.html`) → **chưa chạy** (phụ thuộc build).
- Residual risk: chưa xác minh build + HTML prerender + hành vi cuộn/nút → ở trình duyệt (375/1440). Rủi ro thấp: tái dùng component/nội dung có sẵn, typecheck PASS.

### Builder attempt 2 (2026-10-14)
- Fix reviewer F-1 (`.context/review-reports/feature-home-products-coming-soon-card-phase-1-task-01-round-1-review.md`): `src/components/home/ProductStrip.tsx:68` wrapper thẻ CTA đổi `flex` → `grid`. Lý do: wrapper flex-row khiến `ListingCtaCard` (không có `w-full`) chỉ rộng theo max-content (~350px) ở lg+, không lấp slot 508px; grid item stretch cả 2 trục nên thẻ lấp đủ rộng, `h-full` của thẻ vẫn lấp chiều cao hàng. `ListingCtaCard` không sửa; không đổi file khác.
- `npm.cmd run typecheck` → PASS (exit 0).
- `npm.cmd run lint` → PASS (0 errors, 1 warning có sẵn `src/components/mdx/index.tsx:25`, ngoài scope).
- `npm.cmd run build` → không chạy (đã biết BLOCKED do native binding trong môi trường này).
- Residual risk: chưa xác minh trực quan độ rộng/chiều cao thẻ CTA ở trình duyệt (375/768/1440) và build/prerender; rủi ro thấp (đổi 1 class layout trên wrapper).
