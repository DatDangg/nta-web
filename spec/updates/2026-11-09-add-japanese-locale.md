# Spec Update — 2026-11-09 add-japanese-locale

**spec_version:** 4.11.0 → 4.12.0 (MINOR)
**Trigger:** feature-update (CR-044, ADDITIVE i18n + DB, risk HIGH — DB migration + shared i18n/routing)
**Requirements:**
- THÊM **R-20a** — locale `ja` ngang hàng vi/en: route `/ja/...` mọi trang; fallback **en** theo từng bản ghi khi thiếu ja (OQ-1);
  `ja.json` đủ key như `en.json` (OQ-2); bộ chuyển **VI · EN · JA** (OQ-4); sitemap/hreflang/`og:locale`/JSON-LD có ja, `x-default` = vi;
  font Noto Sans JP chỉ ở trang ja; form liên hệ nhận `locale=ja`; DB CHECK + `CONTENT_LOCALES` + I-6 nhận ja (migration `drizzle/0002_*`,
  bị gate deploy chặn vì `DROP CONSTRAINT` → cần dòng duyệt `HIGH_RISK_MIGRATION` của user dù không mất dữ liệu); parity tách SEED_LOCALES (vi,en) khỏi CONTENT_LOCALES, bỏ qua hàng ja 2 chiều; I-1 chỉ kiểm cặp vi/en; `--alt-ja` tuỳ chọn.
- SỬA **R-20** (trỏ R-20a), **R-09c** (bản tin AI tuần sinh 3 bài vi/en/ja — OQ-3, format title/excerpt/chú thích ja, publish-post validate 3 locale,
  smoke `/ja/blog/<slug>`), **R-13a** (`locale` nhận `ja`), Overview/Tech Stack (ghi chú VI/EN/JA).
**Không đổi:** URL vi (không prefix) + `/en/...`, nội dung vi/en, schema bảng (chỉ CHECK), R-16 cơ chế gộp ui_messages.
**Ảnh hưởng:** mọi trang `src/app/[locale]/**`, i18n routing/request, content store/registry/loader, Header/LanguageToggle, layout font, SEO
(sitemap/metadata/JSON-LD), DB schema + content-rules + tools/db, `tools/ai-news` + `.github/workflows/ai-news.yml`, `tools/contact-mail`, `docs/content-bot/`.
**Hiệu lực:** khi phase 1–3 PASS + migration 0002 chạy prod (sau backup) — nội dung ja do bot seed sau đó.
