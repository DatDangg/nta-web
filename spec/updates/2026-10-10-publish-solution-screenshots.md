# Spec Update — 2026-10-10 publish-solution-screenshots

**spec_version:** 3.0.0 → 3.0.0 (**KHÔNG bump — không đổi requirement/behavior contract**)
**Trigger:** feature-update (change-request, class ADDITIVE content + MODIFY render infra nhỏ)
**Change:** `spec/changes/archive/2026-10-10-publish-solution-screenshots.md` (feature, risk MEDIUM, status done)

## Requirements

- **KHÔNG thêm/sửa/xoá requirement nào.** `SPECIFICATIONS.md` giữ nguyên 27 req R-01…R-27.
  - `screenshots` là field **đã có** trong interface `Solution` (`src/content/types.ts:15`) và **đã được render**
    ở nhóm enterprise (`ScreenshotSection` trên `enterprise/[slug]/page.tsx`). Change này chỉ **bổ sung nội dung**
    (khai `screenshots`/`sections`/`useCases`/`faq` vào `.mdx`) và **mở lại cách trình bày field có sẵn**
    trên nhóm AI (thêm `ScreenshotSection` vào `ai/[slug]/page.tsx`) — không đổi ngữ nghĩa R-05/R-06.
  - `renderExtendedContent` đã được đặc tả/implement ở change `hrm-solution-content`; change này chỉ **set `true`**
    cho 3 `.mdx` (CRM/LMS/DentGo) đã có sẵn data.
- **Lý do KHÔNG bump:** không requirement nào được thêm/sửa/xoá/đổi ngữ nghĩa; đây là bổ sung nội dung + tái dùng
  render/gate đã có. Theo `docs/SPEC_VERSIONING.md`, PATCH chỉ để "làm rõ requirement" — không áp dụng.
  Vẫn ghi `spec/updates/` + CHANGELOG + test-scope để test loop nắm vùng vừa đụng (đối xứng precedent
  `change-hrm-solution-content` — content + cờ opt-in, spec 3.0.0 KHÔNG bump).

## Thay đổi (content + render infra nhỏ)

- **Asset:** copy 3 ảnh BoxAI (`.jpg`, byte-identical, không nén/đổi format) → `public/images/solutions/boxai/`.
  Ảnh CRM/LMS/DentGo đã có sẵn trong `public/` (nay được `.mdx` tham chiếu).
- **`.mdx` CRM/LMS/DentGo (vi+en):** viết đầy đủ theo bảng mapping §8 của `docs/reference/*/README.md`
  (`description`, `features[]`, `benefits[]` viết lại cụ thể, `useCases[]`, `sections[]`, `faq[]`, `screenshots[]`
  đúng thứ tự, `renderExtendedContent: true`); `highlights` để trống.
- **`.mdx` BoxAI (vi+en):** thêm `screenshots[]` 3 ảnh; giữ nguyên các khối còn lại (không dùng `renderExtendedContent`).
- **Render infra:** thêm `<ScreenshotSection>` (sau `<FaqList>`) vào `src/app/[locale]/solutions/ai/[slug]/page.tsx`;
  thêm i18n key `solutions.ai.screenshotsTitle` ở `src/i18n/messages/{vi,en}.json`.

## Ảnh hưởng

- **Module:** `src/content/solutions/**` (nội dung), `src/app/[locale]/solutions/ai/[slug]` (render), i18n `solutions` (dùng chung).
- **Bề mặt public:** 3 trang AI detail (BoxAI có ảnh; Flycam/Custom-AI `ScreenshotSection` → `null`, không đổi layout)
  + 3 trang enterprise detail CRM/LMS/DentGo (bật extended content).
- **Regression:** HRM (vi+en) — KHÔNG đụng file HRM; enterprise page không đổi; verify bằng đếm `<img>`/heading trong HTML build.
- **Ràng buộc nội dung:** không bịa số liệu; không đưa URL hệ thống/tài khoản demo lên `.mdx` (grep = 0).

## Ghi nhận

- Verify: `npm run lint` · `npm run typecheck` · `npm run build` (repo `test_command: null` → skip, no test configured).
- Reviewer: **NORMAL trở lên** (shared component `ScreenshotSection` + i18n dùng chung).
- Caveat: ảnh BoxAI tiếng Anh giữ nguyên (user chốt (a), 10/10/2026); `highlights` BoxAI giữ nguyên trong khi
  acceptance "highlights trống ở cả 4" — mâu thuẫn nội tại change file → chọn giữ (theo §C), cần user xác nhận.

**Test scope:** `spec/test-scope/current.json` → `trigger: feature-update`, `scopeVersion` 9 → 10, `risk: medium`
(shared component + i18n dùng chung; bề mặt render đổi ở 3 trang enterprise + 1 trang AI).
