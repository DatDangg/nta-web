---
id: en-dynamic-slug-not-found-500
type: bug
status: done   # 2026-10-15 gộp CR-026 + CR-032 → tasks/bug-en-invalid-slug-500/phase-1-task-01.md (chờ duyệt plan)
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
- [x] `/en/case-studies/xyz-nope`, `/en/blog/xyz-nope`, `/en/solutions/ai/xyz-nope`… → 404 (vi vẫn 404).
- [x] Build / typecheck / lint PASS.

## Kết quả (2026-10-15)
- Gộp với CR-026/CR-032 vào `tasks/bug-en-invalid-slug-500/phase-1-task-01.md`; commit `44e29a4`, scope v50 (spec 4.2.1 không bump).
- Smoke prod sau deploy: 6 URL en slug sai → 404 (title `404 | NTA`, noindex); vi 404; slug hợp lệ 200; 301 `oc-eo-learning` giữ nguyên.
- Residual: title 404 cố định vi+en; 404 en trả `Cache-Control: s-maxage=31536000` (ISR, revalidate tag mở lại được).
