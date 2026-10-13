# Review — feature contact-page-redesign · phase-1-task-02 · round 1

**Agent:** reviewer (thực hiện trong phiên) · **Level:** NORMAL (+ frontend-checklist, responsive-web) · **Verdict:** PASS

## Phạm vi diff
`src/app/[locale]/contact/page.tsx`, `src/components/contact/{ContactForm,ContactDetails(mới)}.tsx`,
xoá `ContactInfo.tsx` + `OfficeHours.tsx` (không còn import), `src/components/ui/{Input,Textarea,Select(mới)}.tsx`,
`src/components/listing/icons.tsx` (+6 icon: call, car, headset, mail, pin, train), `src/lib/seo/jsonld.ts`, `src/i18n/messages/{vi,en}.json`.

## Kiểm tra (bản build `next start` → snapshot → Playwright Chromium)
- Bố cục khớp mockup 1440: hero (breadcrumb pill, 2 dòng tiêu đề + nhấn teal, mô tả, kính 3D), card thông tin trái + form phải. PASS
- 1024: info xếp dọc, form 1 cột (cột trái/phải đều hẹp ở `lg`). 768 (EN) + 390: 1 cột, info → form. PASS
- scrollWidth = viewport ở 1440/768/390. 1024 = 1032 do blob trang trí `-right-10` trong `GlassVisual` dùng chung (có sẵn ở /products, /case-studies) → ngoài scope, ghi residual.
- Luồng form: submit rỗng → 5 trường `aria-invalid` (name/email/phone/need/message), company tuỳ chọn không lỗi; `maxLength` company 150;
  bộ đếm `32/500` + sr-only "Đã nhập 32/500 ký tự"; submit hợp lệ → payload có `phone, company, need:"crm"` → trạng thái thành công
  "Đã gửi. Chúng tôi sẽ phản hồi trong 24h."; 0 pageerror. PASS
- `tel:+84335546831`, `mailto:admin@ntasolution.vn`; iframe `loading="lazy"` + `title`; link "Mở Google Maps" `target=_blank rel=noopener noreferrer` + sr-only "(mở tab mới)". PASS
- JSON-LD ContactPage.mainEntity + Organization (layout) có telephone/email/PostalAddress/contactPoint. PASS
- a11y: 1 `h1`; label `htmlFor` đúng; select native; dấu `*` `aria-hidden` (trường có thuộc tính `required`); icon `aria-hidden`. PASS
- Error 7 (opacity modifier trên màu var): grep = 0. PASS
- `CTAForm` không đổi hành vi (mặc định hook cũ); Input thêm `w-full min-w-0` — CTA vốn đã full-width trong grid, không đổi hình. PASS
- Verify: typecheck PASS · lint PASS (1 warning cũ) · build PASS.

## MINOR / residual
- Bản đồ không hiển thị trong môi trường test (sandbox chặn google.com) → cần user kiểm vị trí ghim trên trang thật.
- Tiêu đề "Tên doanh nghiệp / Tổ chức" xuống 2 dòng ở 1280–1440 (cột form ~420px); ô nhập canh đáy (`items-end`) nên vẫn thẳng hàng.
- Thông báo lỗi validate client chỉ hiện ở từng trường (không có hộp tóm tắt) — hành vi có từ trước của `useContactForm`.
- `GlassVisual` blob tràn 8px ở 1024 (shared, có từ trước) — đề xuất task riêng.
