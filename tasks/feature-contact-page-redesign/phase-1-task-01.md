# Task 01: Nguồn dữ liệu liên hệ dùng chung + API `/api/contact` nhận `company`, `need`

> Nguồn: CR-008 · Spec: R-10 §2–3, R-13 (3.6.0) · Ref: `refs/mockup-contact.png`

## Phase
1 — Data/API (layer 0)

## Type
addition (1 module dữ liệu) + modification (schema/forward/hook)

## Scope
- `src/lib/contact/company-info.ts` (MỚI): SĐT hiển thị + `tel:`, email, địa chỉ (đủ trường PostalAddress),
  URL nhúng + URL mở Google Maps, danh sách key `need` (9 key) — 1 nguồn cho trang Liên hệ, Footer, JSON-LD.
- `src/lib/api/contact-schema.ts`: thêm `company?` (≤150, trim) và `need?` (thuộc 9 key); rule cũ giữ nguyên.
- `src/lib/api/forward.ts`: chuyển tiếp thêm `company`, `need`.
- `src/lib/contact/useContactForm.ts`: thêm field `company`, `need`; cấu hình theo form (`required` cho phone/need,
  `messageMax`) — mặc định giữ hành vi cũ để `CTAForm` không đổi.

## Classification / Risk
- Change type: **MODIFY** (API contract mở rộng tương thích ngược) + ADDITIVE (module dữ liệu)
- Review level: **NORMAL** · Blast radius: `/api/contact`, `CTAForm` (trang chi tiết giải pháp), `ContactForm`
- Doc impact: `docs/API_SPEC.md` (2 field mới)

## Acceptance Criteria
- [x] Payload cũ (name/email/message, không phone) vẫn 200 → CTA form không vỡ
- [x] `company` > 150 ký tự hoặc `need` ngoài 9 key → 400 với `errors.company|need`
- [x] `company`, `need` có trong payload chuyển tiếp
- [x] typecheck + lint + build PASS

## Feature Verification
- Acceptance: **PASS** · Reviewer: **PASS NORMAL (round 1)** — 0 CRITICAL/MAJOR, 1 MINOR
- Verify: `bash tools/linux-build.sh verify` = typecheck PASS · lint PASS · build PASS
- Smoke `next start` POST /api/contact: payload CTA cũ 200 · company 151 + need sai 400 · payload đủ 200
- Ghi chú: `ContactForm.tsx` đổi 1 dòng kiểu `FIELDS` để build qua (toàn bộ form viết lại ở Task 02).
- Doc impact: `docs/API_SPEC.md` (company, need)

## Review
| Round | Verdict | Report |
|---|---|---|
| 1 | **PASS NORMAL** | `.context/review-reports/feature-contact-page-redesign-phase-1-task-01-round-1-review.md` |
