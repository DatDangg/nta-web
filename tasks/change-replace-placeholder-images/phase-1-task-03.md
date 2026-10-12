# Task 03: `/contact` — bỏ ô bản đồ giả và các dòng "(placeholder)"

> Nguồn: change `spec/changes/2026-10-12-replace-remaining-placeholder-images.md` — mục #15
> Độc lập T01/T02.

## Phase
1

## Type
removal (post-build REMOVE)

## Goal
Trang `/contact` không còn ô bản đồ nhúng Google Map toàn Việt Nam, không còn dòng thông tin
liên hệ ghi "(placeholder)".

## Classification / Risk
- Work item: FEATURE · Change type: REMOVE
- Scope: `src/app/[locale]/contact/page.tsx`, `src/components/contact/MapEmbed.tsx`,
  `src/components/contact/ContactInfo.tsx`, `src/i18n/messages/{vi,en}.json`
- Review level: **NORMAL** — không chạm auth/API/schema
- Blast radius: `/contact` (VI+EN)
- Doc impact: `docs/DESIGN.md` — Screen "Liên hệ" bỏ khối bản đồ (as-built)

## Description

User đã quyết (2026-10-12): **ẩn ô bản đồ + ẩn dòng placeholder**.
Nguyên tắc: **KHÔNG vẽ bản đồ giả, KHÔNG bịa số điện thoại / email / địa chỉ.**

1. `src/app/[locale]/contact/page.tsx:42` — bỏ `<MapEmbed />` và import của nó.
   **Giữ** form tư vấn (`CTAForm`) nguyên trạng.
2. `src/components/contact/MapEmbed.tsx` — xoá file **chỉ khi** không còn nơi nào import.
3. `src/components/contact/ContactInfo.tsx:8-10` — không render các dòng có giá trị placeholder.
   Cách làm: bỏ khối `placeholders` khỏi `vi.json`/`en.json` và render danh sách thông tin
   thật (rỗng → `return null`), thay vì so sánh chuỗi ở component.
4. `vi.json:171` — bỏ `contact.placeholders.*` và chuỗi giờ làm việc chứa "(placeholder, vui lòng xác nhận)".
   Làm tương ứng trên `en.json`.
5. **Footer — cũng đang in placeholder, và hiện ở MỌI trang** (không chỉ `/contact`):
   - `vi.json:32-33` → `"hotline": "Hotline: Đang cập nhật"`, `"email": "Email: Đang cập nhật"`
   - `en.json:32-33` → `"Hotline: Details to be announced"`, `"Email: Details to be announced"`
   - Render tại `src/components/layout/Footer.tsx:22` (`<p>{t('hotline')}</p><p>{t('email')}</p>`).
   Xoá 2 dòng `<p>` đó khỏi `Footer.tsx` và xoá 2 key khỏi cả 2 file message.
   Giữ nguyên `<h2>{t('contactGroup')}</h2>`, `LanguageToggle`, link Facebook.
6. Không điền số điện thoại/email/địa chỉ/giờ làm việc giả. Để trống cho tới khi có thông tin thật.

## Acceptance Criteria
- [ ] `/contact` (VI+EN) không còn `<iframe>` bản đồ
- [ ] Footer **mọi trang** không còn in "Hotline: Đang cập nhật" / "Email: Đang cập nhật"
- [ ] Không còn chuỗi `"(placeholder"` hay `"Đang cập nhật"` trong `src/i18n/messages/*.json`
- [ ] Không có thông tin liên hệ giả nào được thêm vào
- [ ] Form tư vấn vẫn hoạt động, layout không vỡ (không còn khoảng trống 2 cột rỗng)
- [ ] `MapEmbed.tsx` đã xoá hoặc đã ngắt import (không import chết)
- [ ] lint · typecheck · build PASS; reviewer PASS

## Verification Plan
- Commands: theo `.context/project-config.md`
- `/contact` + `/en/contact`: không iframe, mọi `<img>`/`<iframe>` load hợp lệ
- Overflow 0 ở 375 / 1440; `grep -rn "placeholder" src/i18n/messages/`

## Feature Verification
- Acceptance: **PENDING** · Verify: **PENDING** · Reviewer: **PENDING**

## Retry / Escalation
- Attempt: 0 · Escalation: sau 3 attempt fail → `architecture_review_needed`

## DoD
- [ ] Code written trong scope · [ ] Check commands pass · [ ] Reviewer PASS
- [ ] `.context/progress.json` updated · [ ] Doc impact recorded (`docs/DESIGN.md`)
- [ ] committed — 1 task = 1 commit (branch `main`, **KHƯA push**)

## Files to Modify
- `src/app/[locale]/contact/page.tsx`
- `src/components/contact/MapEmbed.tsx` (xoá)
- `src/components/contact/ContactInfo.tsx`
- `src/components/layout/Footer.tsx` ← footer hotline/email placeholder
- `src/i18n/messages/{vi,en}.json`
- `docs/DESIGN.md` (doc reconcile)

## Notes
- KHÔNG push, KHÔNG deploy. Nếu branch ≠ `main` → **DỪNG, báo lại**.