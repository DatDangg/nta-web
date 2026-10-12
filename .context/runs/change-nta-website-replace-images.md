# Run Journal — change "replace-remaining-placeholder-images" (2026-10-12)

- Nguồn: `spec/changes/2026-10-12-replace-remaining-placeholder-images.md` (Class MODIFY + REMOVE, Risk MEDIUM)
- Nhánh: `main` — commit thẳng trên main, **CHƯA push, KHÔNG deploy**
- User: "tiếp tục làm 1 mạch, không dừng" → auto-proceed (bỏ checkpoint giữa các task)
- Task: T01 assets · T02 wiring · T03 /contact remove · T04 /products (BLOCKED — chờ ảnh user)

## step: T01 + T03 close-out (commit) — status=done ✅
- T01: assets staged (3 PNG mock + 9 SVG + scripts/mock). Reviewer r1 FAIL → **r2 PASS NORMAL**.
- T03: `/contact` bỏ MapEmbed + dòng placeholder + key i18n + Footer + docs/DESIGN.md. Reviewer **r1 PASS NORMAL**.
- Commit: T01 `bcf4d16` · T03 `fe73912`. progress.json đã update T01/T03 done. **Không push.**

## step: T02 wiring — status=awaiting
- Builder subagent **hết bước giữa chừng** (chưa verify, chưa cập nhật task/journal). Primary tiếp quản.
- Sửa lỗi builder để lại: mojibake `?` ở alt (6 solution cardImageAlt + 6 gallery alt), alt EN dùng tiếng Việt
  (home.ts 3 dòng), và **sai format** `cardImage` (string + `cardImageAlt`) → object `{src, alt, ratio}`
  (khớp `crm.mdx`) — nếu không `/solutions/ai` không render ảnh. Set ratio: boxai 1.954, flycam/talvra 1.396.
- Hero: `enterprise.svg` → `enterprise-hero.png`, `aspect-[4/3] object-cover` → `object-contain` + width/height
  khớp tỉ lệ thật (2656×1902) để không cắt 2 bên, không letterbox lệch.
- Gallery Óc Eo: builder tạo thêm 2 SVG không chữ `oc-eo-edge-detail.svg` + `oc-eo-operations-detail.svg`.
- Verify (primary, thật): lint PASS (0 errors/1 warning pre-existing) · typecheck PASS · build PASS.
  HTML: `/`+`/en` hero mới; `/solutions/ai` render đủ 3 cardImage + alt VI/EN; `/about` team-ai/team-domain;
  dental = 3 ảnh dentgo; oc-eo = 3 SVG. `grep` src = 0 ref placeholder cũ. `check-left-align`: skip (không có script).
- Next: reviewer STRICT. Cancel sẽ redo bước này.
