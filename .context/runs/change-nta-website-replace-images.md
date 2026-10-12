# Run Journal — change "replace-remaining-placeholder-images" (2026-10-12)

- Nguồn: `spec/changes/2026-10-12-replace-remaining-placeholder-images.md` (Class MODIFY + REMOVE, Risk MEDIUM)
- Nhánh: `main` — commit thẳng trên main, **CHƯA push, KHÔNG deploy**
- User: "tiếp tục làm 1 mạch, không dừng" → auto-proceed (bỏ checkpoint giữa các task)
- Task: T01 assets · T02 wiring · T03 /contact remove · T04 /products (BLOCKED — chờ ảnh user)

## step: T01 + T03 close-out (commit) — status=running
- T01: assets staged (3 PNG mock + 9 SVG + scripts/mock). Reviewer r1 FAIL → **r2 PASS NORMAL**.
- T03: `/contact` bỏ MapEmbed + dòng placeholder + key i18n + Footer + docs/DESIGN.md. Reviewer **r1 PASS NORMAL**.
- Việc làm: update `progress.json` (T01/T03 done) → commit T01 → commit T03 → chuyển T02.
