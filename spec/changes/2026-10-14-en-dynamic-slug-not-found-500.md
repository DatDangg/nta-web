---
id: en-dynamic-slug-not-found-500
type: bug
status: pending
created: 2026-10-14
---

# Slug không tồn tại ở route tiếng Anh trả 500 thay vì 404

## Hiện tượng
- Bản build production (`next build` + `next start`): `/en/case-studies/<slug-không-có>`, `/en/blog/<slug-không-có>` → **HTTP 500**.
  Log: `Error: Page changed from static to dynamic at runtime /en/case-studies/…, reason: headers` (stack qua `requestLocale` của next-intl).
- Route tiếng Việt (không prefix, vd `/case-studies/xyz-nope`) → 404 đúng với trang `not-found.tsx`.
- Phát hiện khi smoke CR-025 (`/en/case-studies/ai-box-bao-ha` phải ra 404).

## Expected
- Mọi slug không tồn tại (vi + en) → HTTP 404 + trang 404 có sẵn của site.

## Acceptance
- [ ] `/en/case-studies/xyz-nope`, `/en/blog/xyz-nope`, `/en/solutions/ai/xyz-nope`… → 404 (vi vẫn 404).
- [ ] Build / typecheck / lint PASS.
