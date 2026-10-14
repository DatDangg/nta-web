# feature-content-database · phase-5-task-02 — Bỏ cờ CONTENT_SOURCE + đường đọc file ở web

- **CR:** CR-031 · spec 4.2.0 (R-16) — tách từ scope 0 của `phase-5-task-01.md`
- **Classification / Risk:** MODIFY · HIGH
  - Expected review level: **STRICT** (đổi nguồn dữ liệu toàn site, shared loader/registry, prod)
  - Blast radius: mọi trang nội dung (loader MDX, registry, next-intl request, company-contact), compose/deploy (biến `CONTENT_SOURCE`), workflow Content ops, test.

## Điều kiện bắt đầu (cả hai)
1. Prod chạy `CONTENT_SOURCE=db` **ổn định ≥ 1 ngày** tính từ 14/10/2026 16:38 UTC (không 500 do `[content-store]`/`[content-shape]`, backup `daily-*` có, B10 của P4-T01 xong).
2. **User đồng ý** rõ (mất đường lùi nhanh "đổi variable về `file`" — sau task này lùi = revert commit + deploy).

## Scope
- Web chỉ đọc DB: bỏ nhánh `file` trong `src/lib/content/load-mdx.ts`, `src/lib/content/registry.ts`, `src/i18n/request.ts`, `src/lib/contact/company-contact.ts`;
  + các nơi khác còn tham chiếu cờ: `src/lib/content/ui-data.ts`, `src/lib/content/slug.ts`, `src/lib/contact/company-info.ts` (chỉ sửa tham chiếu, giữ `COMPANY_CONTACT`), test `tools/db/content-loaders.test.ts`;
  bỏ `src/lib/content/source.ts` (hoặc thu gọn) + memo đọc file production; bỏ `CONTENT_SOURCE` khỏi `docker-compose.yml`, `.github/workflows/deploy.yml` (bước Validate), runbook.
- **GIỮ** (quyết định P3-T04, `.context/decisions.md`): `src/i18n/messages/{vi,en}.json` + `COMPANY_CONTACT` (`src/lib/contact/company-info.ts`) làm dự phòng + chuẩn cấu trúc
  (gộp sâu DB đè file vẫn chạy) — **không xoá**.
- **GIỮ** `src/content/*` + hằng registry TS làm seed cho `tools/db/import-seed.ts` / `parity` (chỉ tools đọc, web không đọc).
- Test: cập nhật test phụ thuộc chế độ file (`src/lib/content/source.test.ts`, test loader/registry); thêm kiểm web không còn import đường đọc file.
- Doc reconcile: `docs/DESIGN.md` § Kiến trúc nội dung, `src/content/README.md`, `docs/runbook/{cutover-content-db,db,deploy-vps}.md`, `docs/ERD.md` nếu cần.

## Acceptance
- Không còn tham chiếu `CONTENT_SOURCE` trong `src/` (trừ comment lịch sử), compose, deploy.yml; build không cần DB như trước.
- typecheck/lint/test/build PASS; smoke local db: sitemap URL 200, 404 slug sai, data cache hit không truy vấn DB.
- Deploy prod + smoke như `docs/runbook/cutover-content-db.md` §3.

## Retry / Escalation
3 attempt fail → `architecture_review_needed`.

## Verification summary
_(chưa làm)_
