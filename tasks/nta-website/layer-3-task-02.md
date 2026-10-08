# Task 02: Trang Liên hệ `/contact` + ContactForm states (Screen 12)

## Layer
3

## Type
build (initial)

## Goal
Render trang contact 2 cột (form 60% | info 40%) với `ContactForm` đủ 6 states
(Default/Validating/Submitting/Success/Error 400/429/5xx), a11y theo design Screen 12,
gọi `POST /api/contact`.

## Classification / Risk
- Work item type: FEATURE (initial build)
- Feature change type: ADDITIVE (initial build)
- Scope: SINGLE_SURFACE (1 route + 1 client form)
- Root cause category: API_CONTRACT (consumes /api/contact)
- Review level expected: NORMAL — form client; reviewer kiểm tra contract 400/429 khớp API (nâng STRICT nếu lệch)
- Blast radius: route `/contact` (2 locale)
- Doc impact: NO_DOC_IMPACT (UI states khớp design Screen 12; contract API task-01)
- Decision impact: NO

## Scope (spec refs)
- **R-10:** form (tên, email, SĐT, nội dung) + hotline + map + thông tin công ty; 5 states
- **R-13/R-18:** consume contract 200/400/429 · **R-25 BR-002:** validate email + SĐT trước khi gửi
- **R-24:** label visible, `aria-describedby` + `aria-invalid`, error summary `role="alert"`,
  success `role="status"`, honeypot không focusable, iframe `title`, touch ≥44px
- **R-23:** responsive (form 1 cột base; 2 cột md; 60/40 lg)
- Design: Screen 12 (states table + copy VI/EN)

## Dependencies
- Layer 3 task-01 (API contract), Layer 1 task-02 (shell), task-01 (Button/inputs primitives)

## Description
1. `src/app/[locale]/contact/page.tsx`: PageHeader + Breadcrumb · 2 cột form/info ·
   ContactInfo (hotline/email/address placeholder — OQ#2) · OfficeHours · MapEmbed (iframe lazy,
   `title="Bản đồ vị trí NTA"`, aspect 16:9). Metadata "Liên hệ | NTA" / "Contact | NTA"
   + JSON-LD ContactPage (defer Layer 4 nếu cần data thật).
2. `src/components/contact/ContactForm.tsx` (client leaf):
   - Fields: Họ và tên (2–100) · Email · Số điện thoại (tuỳ chọn, 9–15 số) · Nội dung (10–2000) ·
     Honeypot (`hidden`, `tabIndex={-1}`, `aria-hidden`, không label hiển thị)
   - **Default:** label visible + helper, nút primary "Gửi yêu cầu"
   - **Validating:** validate on blur + submit; error `error-ink` dưới field, `aria-invalid`;
     BR-002 chặn submit khi invalid
   - **Submitting:** nút disabled + "Đang gửi…" + spinner 16px, `aria-busy`, chống double-submit
   - **Success:** thay form bằng block success (icon + copy "Đã gửi. Chúng tôi sẽ phản hồi trong
     1-2 ngày làm việc.") `role="status"` + nút gửi yêu cầu khác (focus heading)
   - **Error 400:** render `errors` từng field inline + summary `role="alert"` (links nhảy tới field,
     focus summary)
   - **Error 429:** "Bạn gửi quá nhanh. Vui lòng thử lại sau." `role="alert"`
   - **Error 5xx/mạng:** "Không gửi được. Vui lòng thử lại hoặc liên hệ hotline." + nút thử lại
3. Input/Textarea shared (`src/components/ui/Input.tsx`, `Textarea.tsx`) nếu chưa có.
4. Copy VI/EN theo design Screen 12; messages key `contact.*`.

## Acceptance Criteria
- [ ] 6 states render đúng (validate matrix: name/email/phone/message từng lỗi)
- [ ] POST payload khớp API task-01; 400 → inline + summary; 429 → 1 thông báo; 5xx → retry
- [ ] Honeypot gửi rỗng ở trường ẩn, không tab tới được
- [ ] A11y: label/`aria-describedby`/`aria-invalid`, error summary focus, success `role="status"`
- [ ] Responsive 3 bp (1 cột → 2 cột → 60/40); map iframe `title` + lazy
- [ ] Placeholder OQ#2 (hotline/email/địa chỉ) hiển thị rõ là placeholder dễ thay
- [ ] Check commands pass

## Verification Summary
- Commands: `npm run lint` · `npm run typecheck` · `npm run build`
- Test: `test_command: null` → manual matrix với mock/local API (mỗi state 1 evidence screenshot/log)
- Reviewer report: `.context/review-reports/feature-nta-website-layer-3-task-02-round-1-review.md`

## Retry / Error Memory
- Attempt: 0
- Last failure type: n/a
- Error memory entry: none
- Escalation: none — sau 3 attempt fail → `architecture_review_needed`

## DoD (Definition of Done)
- [ ] Code written (chỉ trong scope)
- [ ] Tests: skip — `test_command: null` (manual state matrix, ghi evidence)
- [ ] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [ ] Reviewer độc lập PASS
- [ ] `.context/progress.json` updated
- [ ] Error Memory / Doc Impact recorded
- [ ] committed — 1 task = 1 commit (branch `main`, KHÔNG push)

## Files to Create/Modify
- `src/app/[locale]/contact/page.tsx`
- `src/components/contact/ContactForm.tsx`, `ContactInfo.tsx`, `OfficeHours.tsx`, `MapEmbed.tsx`
- `src/components/ui/Input.tsx`, `Textarea.tsx` (nếu chưa có)
- `src/i18n/messages/{vi,en}.json` (`contact.*`)

## Notes
- Form logic (validate + submit + states) tách thành hook/util `src/lib/contact/useContactForm.ts`
  để CTAForm compact (task-03) tái dùng — không copy-paste.
- Không lưu DB (R-16) — chỉ forward.
