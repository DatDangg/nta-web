# Task 02: Trang `/contact` theo mockup — hero, card thông tin + Google Maps, card form 2 cột

> Nguồn: CR-008 · Spec: R-10 §1–6 · Ref: `refs/mockup-contact.png`, `refs/hero-background.png` · Phụ thuộc: Task 01

## Phase
1 — UI (layer 1)

## Type
modification (`page.tsx`, `ContactForm.tsx`, i18n, JSON-LD) + addition (component card thông tin, minh hoạ hero)

## Scope
- `src/app/[locale]/contact/page.tsx`: `PageHeader` → `ListingHero` (nền sóng dùng chung — cùng ảnh `hero-background.png`
  đã có ở `public/images/shared/hero-waves.jpg`, không thêm asset nếu trùng), lưới 2 card.
- `src/components/contact/ContactDetails.tsx` (MỚI, thay `ContactInfo`/`OfficeHours` đang không dùng → xoá 2 file này):
  3 mục SĐT/Email/Địa chỉ, iframe Google Maps (`loading="lazy"`, `title`, `referrerPolicy`), link "Mở Google Maps",
  khối "Văn phòng NTA" 3 tiện ích.
- `src/components/contact/ContactVisual.tsx` (MỚI): minh hoạ kính 3D (CSS/SVG, `aria-hidden`, chỉ `lg+`) theo phong cách `GlassVisual`.
- `src/components/contact/ContactForm.tsx`: card form — eyebrow, tiêu đề, mô tả; lưới 2 cột `md+`; select "Nhu cầu"
  (native `<select>`, 9 mục); textarea có bộ đếm `n/500` (`aria-live` polite khi gần giới hạn); nút "Gửi liên hệ →".
- `src/i18n/messages/{vi,en}.json` (`contact.*`), `src/lib/seo/jsonld.ts` (ContactPage + Organization: telephone/email/address).

## Classification / Risk
- Change type: **MODIFY** (UI `/contact`) · Review level: **NORMAL** (+ frontend-checklist, responsive-web)
- Blast radius: `/contact`, `/en/contact`. `CTAForm` + các trang khác dùng `ListingHero` không đổi.
- Lưu ý error-memory Error 7: không dùng opacity modifier trên màu `var()`.

## Acceptance Criteria
- [x] Khớp bố cục mockup ở 1440; 1024/768/390/375 không tràn ngang; `< lg` 1 cột (thông tin → form)
- [x] SĐT `tel:0335546831`, email `mailto:admin@ntasolution.vn`, địa chỉ đúng; bản đồ đúng vị trí, lazy, có `title`
- [x] SĐT + Nhu cầu bắt buộc, nội dung 10–500 + bộ đếm; đủ states Default/Validating/Submitting/Success/Error/429
- [x] 1 `h1`; label gắn đúng input; focus/keyboard OK; vi/en đủ chuỗi; 0 console error
- [x] JSON-LD có telephone/email/address; typecheck + lint + build PASS

## Điều chỉnh so với plan
- Hero dùng `GlassVisual` có sẵn (tile chat/headset/mail + thẻ "Let's Build / Smarter Together") thay vì tạo `ContactVisual` mới.
- Thêm `ui/Select.tsx` + prop `showRequiredMark` / `counter` cho `Input`/`Textarea` (tương thích ngược); thêm 6 icon vào `listing/icons.tsx`.
- `contact.success`/`intro` đổi "1-2 ngày làm việc" → "24h" theo quyết định user (áp dụng cả CTA form).

## Feature Verification
- Acceptance: **PASS** · Reviewer: **PASS NORMAL (round 1)** — 0 CRITICAL/MAJOR, 4 MINOR
- Verify: `bash tools/linux-build.sh verify` = typecheck PASS · lint PASS · build PASS
- Playwright (snapshot `next start`): 1440/1024/768(en)/390, luồng validate + gửi thành công, JSON-LD, link tel/mailto, iframe lazy
- Doc impact: no doc impact (UI; API đã cập nhật ở task 01)

## Review
| Round | Verdict | Report |
|---|---|---|
| 1 | **PASS NORMAL** | `.context/review-reports/feature-contact-page-redesign-phase-1-task-02-round-1-review.md` |
