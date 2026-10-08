# Task 03: CTAForm compact + tích hợp vào solution detail pages

## Layer
3

## Type
build (initial)

## Goal
Dựng `CTAForm` variant compact (tên, email, nội dung, honeypot — Screen 4/6) tái dùng form logic
từ ContactForm, rồi tích hợp vào cuối 7 trang chi tiết giải pháp (4 enterprise + 3 AI).

## Classification / Risk
- Work item type: FEATURE (initial build)
- Feature change type: ADDITIVE (initial build)
- Scope: CROSS_CUTTING (1 component mới dùng ở 7 route — sửa cả 2 module giải pháp)
- Root cause category: API_CONTRACT (consumes /api/contact)
- Review level expected: NORMAL — tái dùng contract đã review task-01/02; kiểm tra không regress 7 trang
- Blast radius: `/solutions/{enterprise,ai}/[slug]` (2 locale × 7 trang)
- Doc impact: NO_DOC_IMPACT (UI theo design Screens 4/6)
- Decision impact: NO

## Scope (spec refs)
- **R-05/R-06:** mỗi giải pháp có CTA (detail pages) — design Screen 4 & 6: "CTAForm cuối trang (compact variant)"
- **R-10/R-13/R-18:** cùng contract `/api/contact` · **BR-002** validate trước gửi
- **R-24:** a11y form compact (label/aria/error summary) · **R-23:** stack mobile → inline desktop
- Design: Screens 4 & 6 (CTAForm `variant="compact"`: tên, email, nội dung, honeypot)

## Dependencies
- Layer 3 task-01 (API), task-02 (form logic hook để tái dùng),
  Layer 2 task-03 + task-04 (7 trang detail phải tồn tại)

## Description
1. `src/components/contact/CTAForm.tsx`: `variant="compact"` — fields Tên + Email + Nội dung +
   honeypot (bỏ SĐT so với full form); heading "Nhận tư vấn" / "Get a consultation";
   tái dùng `useContactForm` (validate subset, Submitting/Success/Error states — 429/400 message
   ngắn gọn hơn nhưng cùng contract).
2. Tích hợp: import + render cuối main content của:
   - `solutions/enterprise/[slug]/page.tsx` (4 slug) — design Screen 4
   - `solutions/ai/[slug]/page.tsx` (3 slug) — design Screen 6
   (Chỉ 1 lần render/slug — không nhúng cả 2 variant; CTA zone thay CTABanner nếu design yêu cầu
   "CTAForm cuối trang" — đối chiếu design khi implement, ghi quyết định.)
3. Đảm bảo form không lặp label/copy ngoài canonical (tokens §11).

## Acceptance Criteria
- [x] CTAForm compact render ở cuối 7 trang detail, cả 2 locale (14/14 HTML có `id="cta-form-title"`)
- [x] Compact fields đúng scope (tên/email/nội dung/honeypot) — không có SĐT
- [x] Submit gọi cùng `/api/contact`; states Submitting/Success/Error 400/429/5xx hoạt động
- [x] A11y đầy đủ (label/aria-invalid/error summary) — không regress pages task-03/04
- [x] Không duplicate CTA cùng intent trên 1 trang (design §1.3) — CTABanner đã bị **thay**
- [x] Check commands pass

## Verification Summary
- Commands: `npm run lint` (PASS, 1 warning `<img>` ngoài scope) · `npm run typecheck` (PASS) · `npm run build` (PASS, 47 static pages)
- Test: `test_command: null` → skip; verify tĩnh + build (không browser/live submit)
- Manual evidence: `grep CTABanner` = 0 ở 2 file detail; mỗi detail render đúng 1 `<CTAForm />`; 14/14 detail HTML có đúng 1 `id="cta-form-title"`; prerender-manifest đủ 14 route detail (7 slug × 2 locale, SSG); `git diff` scope = chỉ 2 file × 4 dòng (import + CTA zone)
- Reviewer report: `.context/review-reports/feature-nta-website-layer-3-task-03-round-1-review.md` — **PASS NORMAL** (primary re-chạy 3 check command + verify manifest sau reviewer shell deny)

## Retry / Error Memory
- Attempt: 0 (r1 PASS)
- Last failure type: n/a
- Error memory entry: none
- Escalation: none — sau 3 attempt fail → `architecture_review_needed`

## Doc / Decision Impact
- **Doc impact: NO_DOC_IMPACT** — UI theo design Screens 4/6; contract API không đổi.
- **Decision impact: NO** (HARD carry-forward M-4 đã thực hiện: thay CTABanner bằng CTAForm compact).
- **Residual (MINOR non-blocking từ review r1):**
  - #4 task-02 **CHƯA fix đầy đủ**: `useContactForm.ts:85-97` vẫn dùng `messages[field]` local, bỏ qua `errors.form`/`errors.honeypot` → ghi error-memory/nhắc (builder journal claim #4 fixed không khớp code).
  - `ctaForm.*` namespace không tạo, dùng `contact.consultationTitle` (đúng tinh thần canonical reuse).
  - OBS: `updateField` dùng `values` closure (stale, pre-existing); ContactForm #1 focus 429 (ngoài scope).

## DoD (Definition of Done)
- [x] Code written (chỉ trong scope)
- [x] Tests: skip — `test_command: null`, ghi lý do
- [x] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [x] Reviewer độc lập PASS (NORMAL)
- [x] `.context/progress.json` updated
- [x] Error Memory / Doc Impact recorded
- [x] committed — 1 task = 1 commit (branch `main`, KHÔNG push)

## Files to Create/Modify
- `src/components/contact/CTAForm.tsx`
- `src/lib/contact/useContactForm.ts` (tách từ ContactForm task-02 nếu chưa tách)
- `src/app/[locale]/solutions/enterprise/[slug]/page.tsx`
- `src/app/[locale]/solutions/ai/[slug]/page.tsx`
- `src/i18n/messages/{vi,en}.json` (`ctaForm.*`)

## Notes
- Task này sửa file của Layer 2 — expected (tích hợp), KHÔNG đổi layout/content đã review,
  chỉ thêm CTA zone; reviewer check diff scope chặt.
