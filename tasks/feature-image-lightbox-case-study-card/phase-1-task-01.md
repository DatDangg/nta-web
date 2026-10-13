# feature-image-lightbox-case-study-card · phase-1-task-01 — Lightbox cho carousel ảnh `ShowcasePhotos`

- **CR:** CR-013 (`spec/changes/2026-10-13-image-lightbox-case-study-card.md`)
- **Classification / Risk:** ADDITIVE (UI interaction) · MEDIUM
  - Scope: component client mới + sửa `ShowcasePhotos` (dùng chung trong `ShowcaseLayout`)
  - Expected review level: **STRICT** (shared component dùng ở 4 route chi tiết; a11y modal/focus)
  - Blast radius: `/case-studies/[slug]` (showcase), `/solutions/enterprise/[slug]`, `/solutions/ai/[slug]`, `/products/[slug]` — vi/en
  - Doc impact: spec R-08d (3.9.0) qua spec-publisher khi close-out; `docs/DESIGN.md` current-state nếu có mô tả carousel
  - Decision impact: không thêm thư viện; dùng `<dialog>` native

## Scope
1. Tạo `src/components/ui/Lightbox.tsx` (`'use client'`):
   - Props tối thiểu: `items: { src; alt }[]`, `index: number | null`, `onIndexChange(i)`, `onClose()`, nhãn i18n
     (`close`, `prev`, `next`, `counter`/`dialogLabel`).
   - Dùng `<dialog>` native + `showModal()` (top layer, nền inert, Esc qua sự kiện `cancel`) — không cần portal.
     Tham khảo pattern focus/ khoá cuộn của `src/components/layout/MobileNav.tsx`.
   - Ảnh hiện đủ: `next/image` `fill` + `object-contain` trong khung `max-h-[85vh]`/`w-[min(92vw,1400px)]`, `sizes="92vw"`.
   - Đóng: nút X (≥ 44×44), Esc, bấm vùng nền (click target = chính `<dialog>`/backdrop, không phải ảnh/nút).
   - Trước/sau: 2 nút + `ArrowLeft`/`ArrowRight`; vòng lặp đầu↔cuối hoặc disable ở 2 đầu (chọn 1, nhất quán).
     Ẩn nút khi chỉ có 1 ảnh. Bộ đếm "n / N" + alt làm chú thích (bỏ qua nếu alt rỗng).
   - Mobile: vuốt ngang (pointer events, ngưỡng ~50px) để chuyển ảnh; nút vẫn dùng được.
   - Focus: khi mở focus vào nút đóng; khi đóng trả focus về nút ảnh đã bấm. Khoá cuộn `<html>` khi mở, gỡ khi đóng/unmount.
   - Motion: fade/scale chỉ dưới `motion-safe:`; `prefers-reduced-motion` → không animation.
   - `aria-label`/`aria-labelledby` cho dialog; nút có `aria-label`.
2. Sửa `src/components/case-studies/showcase/ShowcasePhotos.tsx`:
   - Bọc mỗi ảnh trong `<button type="button">` (aria-label "Phóng to ảnh: {alt}" / "Enlarge image: {alt}", focus ring giống ARROW_CLASS),
     `cursor-zoom-in`, giữ nguyên layout/kích thước item, hover scale và cả 3 variant (`photo`/`screen`/`phone`).
   - Bấm → mở `Lightbox` tại index ảnh. Không phá cuộn ngang/scroll-snap/nút trước-sau của carousel.
3. i18n: thêm key VI/EN (vd `common.lightbox.{open,close,prev,next,counter,label}`) vào `src/i18n/messages/vi.json` + `en.json`
   (hoặc field trong data nếu ShowcasePhotos không có client messages — chọn cách khớp code hiện có, ghi lý do).

## Out of scope
Ảnh hero, ảnh khối công nghệ (`ScreenMock`/`VmsMock`), `ImageGallery` (layout default), thẻ listing (task 02).

## Acceptance
- Bấm bất kỳ ảnh carousel (cả 3 variant) ở 4 loại trang chi tiết → mở lightbox, ảnh hiện đủ không cắt.
- Đóng bằng X / Esc / bấm nền; trước/sau bằng nút + ←/→; vuốt trên mobile; bộ đếm đúng.
- Tab chỉ đi trong lightbox khi mở; đóng xong focus quay về ảnh đã bấm; trang không cuộn nền khi mở.
- `prefers-reduced-motion: reduce` → không animation. Mobile 375px không tràn ngang.
- Không thêm dependency. `npm run typecheck`, `npm run lint`, `npm run build` PASS (lệnh theo `.context/project-config.md`).

## Verification summary
- Files: `src/components/ui/Lightbox.tsx` (mới), `src/components/case-studies/showcase/ShowcasePhotos.tsx`,
  `src/i18n/messages/vi.json`, `src/i18n/messages/en.json` (key `common.lightbox.{open,label,close,prev,next,counter}`).
  i18n qua `useTranslations` vì `NextIntlClientProvider` ở `src/app/[locale]/layout.tsx` truyền toàn bộ messages cho client (giống `MobileNav`).
- Acceptance criteria (theo code, chưa smoke test trình duyệt):
  - Mở: mỗi ảnh carousel (photo/screen/phone) nằm trong `<button type="button">` `absolute inset-0` trong `<li>` cũ → layout/kích thước/hover scale/scroll-snap/nút trước-sau giữ nguyên; aria-label "Phóng to ảnh: {alt}" / "Enlarge image: {alt}", `cursor-zoom-in`, focus ring `outline-focus` (offset âm vì `<li>` overflow-hidden).
  - Ảnh đủ: `next/image fill object-contain` trong khung `h-[min(78dvh,900px)] w-[min(92vw,1400px)]`, `sizes="92vw"`.
  - Đóng: nút X (size-11 = 44px), Esc (native `cancel`→`close`, đồng bộ state qua sự kiện `close`), bấm nền (click không nằm trong `[data-lightbox-content]`).
  - Trước/sau: nút + ←/→ + vuốt ngang ≥50px (pointer events, `touch-pan-y`); **vòng lặp đầu↔cuối**; ẩn nút + bộ đếm khi chỉ 1 ảnh. Bộ đếm "n / N" + alt làm chú thích (`aria-describedby`), bỏ alt rỗng.
  - Focus: mở → focus nút đóng; đóng → `ShowcasePhotos` focus lại đúng nút ảnh đã bấm (lưu `event.currentTarget`). Tab bị giữ trong dialog nhờ `showModal()` (nền inert). Khoá cuộn `html` khi mở, khôi phục khi đóng/unmount.
  - Motion: fade + scale chỉ dưới `motion-safe:`; reduced-motion → hiện tức thì. Không thêm dependency.
- Verify commands + result:
  - `npm run typecheck` → PASS (tsc không lỗi)
  - `npm run lint` → PASS (0 error; 1 warning có sẵn `src/components/mdx/index.tsx:25` no-img-element, ngoài scope)
  - `npm run build` → sandbox BLOCKED (native binding swc khi nạp next.config.ts); chạy lại ở terminal user (`npm.cmd run build`) → **PASS** (lint+types OK, 59/59 static pages)
- Residual risk: chưa smoke test trình duyệt (375/768/1280, Safari focus, vuốt thật trên mobile); build đã PASS ở terminal user.
- Acceptance criteria: PASS (theo code + build; chưa smoke test trình duyệt)
- Reviewer verdict: **PASS** (STRICT, round 1) — `.context/review-reports/feature-image-lightbox-case-study-card-phase-1-task-01-round-1-review.md`; 3 finding MINOR không bắt buộc (onClose gọi 2 lần/đóng, bấm vùng trống trong khung ảnh không đóng, scrollbar-gutter) — ghi nhận residual.
- Doc impact: spec R-08d (3.9.0) áp dụng ở close-out CR qua spec-publisher; không đổi API/schema.

## Retry / Escalation
Max 3 attempt → `architecture_review_needed`.
