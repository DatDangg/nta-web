# Task 03: Footer hiển thị SĐT / email / địa chỉ + close-out CR-008

> Nguồn: CR-008 · Spec: R-11 (3.6.0), BR-001 · Phụ thuộc: Task 01

## Phase
1 — UI (layer 1) + close-out

## Type
modification (`Footer.tsx`, i18n)

## Scope
- `src/components/layout/Footer.tsx`: khối liên hệ (icon + SĐT `tel:`, email `mailto:`, địa chỉ) lấy từ `company-info.ts`,
  đặt dưới tagline cột thương hiệu (giữ lưới 12 cột hiện tại).
- `src/i18n/messages/{vi,en}.json` (`footer.*` nhãn cho screen reader).
- Close-out: `docs/API_SPEC.md`, `spec/test-scope/current.json` (scope v32), progress, archive change doc, BACKLOG done.

## Classification / Risk
- Change type: **MODIFY** · Review level: **NORMAL** · Blast radius: footer mọi trang vi/en

## Acceptance Criteria
- [x] Footer mọi trang có SĐT/email/địa chỉ đúng, link bấm được; không tràn ngang 375; vi/en
- [x] typecheck + lint + build PASS

## Feature Verification
- Acceptance: **PASS** · Reviewer: **PASS NORMAL (round 1)**
- Verify: `bash tools/linux-build.sh verify` = typecheck PASS · lint PASS · build PASS
- Playwright footer: /contact 1440, /en 375 + 1024 — 1 link `tel:` trong footer, scrollWidth = viewport
- Close-out: test-scope v32, change doc → archive, BACKLOG done, progress
- Doc impact: no doc impact (API_SPEC đã cập nhật ở task 01)

## Review
| Round | Verdict | Report |
|---|---|---|
| 1 | **PASS NORMAL** | `.context/review-reports/feature-contact-page-redesign-phase-1-task-03-round-1-review.md` |
