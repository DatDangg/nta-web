---
id: add-japanese-locale
type: feature
status: in_progress
created: 2026-11-09
---

# Thêm tiếng Nhật (ja) cho website

## Yêu cầu
User (2026-11-09) muốn web có thêm bản tiếng Nhật. Bot nội dung (Telegram) báo phần code là việc của dev; sau khi web mở locale `ja`, bot sẽ dịch và seed toàn bộ bản ghi ja từ bản vi/en.

Phạm vi của dev (repo này): mở locale `ja` ở tầng web + DB + tooling. **Nội dung dịch do bot làm**, trừ file UI messages `ja.json` (bản dự phòng/chuẩn cấu trúc, xem OQ-2).

## Hiện trạng (kiểm tra code 2026-11-09)
- `src/i18n/routing.ts`: `locales: ['vi','en']`, `defaultLocale: 'vi'`, `localePrefix: 'as-needed'` → `/ja` 404.
- `src/i18n/messages/`: chỉ có `vi.json`, `en.json`.
- `src/content/types.ts`: `type Locale = 'vi' | 'en'`.
- `src/db/schema.ts:44` `CONTENT_LOCALES = ["vi","en"]` + `:78` CHECK `locale IN ('vi','en')` → **cần migration** mới seed được ja.
- `src/db/content-rules.ts` (I-6) chặn locale ngoài `CONTENT_LOCALES` → bot không ghi được ja.
- ~20 guard `if (locale !== 'vi' && locale !== 'en') notFound()` trong `src/app/[locale]/**/page.tsx` (home, about, blog, blog/[slug], case-studies, contact, products, solutions/ai, solutions/enterprise).
- Chữ chọn theo kiểu "vi hoặc mặc định en": `layout.tsx:76` (skip link), `ScrollTopButton.tsx:46`, title `products/[slug]`, `solutions/enterprise/[slug]`.
- `LanguageToggle.tsx`: nút gạt 2 ngôn ngữ VI/EN.
- Font `Inter` (`layout.tsx:12`) không có glyph tiếng Nhật.
- `src/lib/seo/jsonld.ts:18` `availableLanguage: ['vi','en']`.
- Sitemap + hreflang chạy theo `routing.locales` → tự nhận khi thêm ja; `x-default` vẫn trỏ vi.
- `src/i18n/request.ts`: chế độ db gộp `ui_messages` DB đè lên file JSON — thiếu/sai shape → lỗi trang.

## Rủi ro đã thấy
- **`tools/db/publish-post.ts` (AI news hằng tuần, CR-034) lặp `CONTENT_LOCALES`** → thêm ja vào đó là workflow đòi file bài ja, có thể vỡ lượt cron thứ 7. Cần tách "locale web hỗ trợ" khỏi "locale bắt buộc" hoặc cho AI news chỉ vi/en (OQ-3).
- **`tools/db/parity-check.ts`** đòi đủ mọi locale → sẽ báo thiếu ja cho đến khi bot seed xong.
- Migration đổi CHECK constraint trên bảng prod → đi đúng flow dev → migration versioned → staging → prod.
- Trang ja chưa có bản ghi DB → phải có fallback, không được 404/500 (OQ-1).

## Acceptance (bắt buộc)
- [ ] `/ja`, `/ja/about`, `/ja/solutions/...`, `/ja/products/...`, `/ja/case-studies`, `/ja/blog`, `/ja/blog/<slug>`, `/ja/contact` trả 200; URL tiếng Việt vẫn không prefix, `/en/...` không đổi.
- [ ] Thiếu bản ghi/key ja → hiển thị theo fallback đã chốt (OQ-1), không 404/500.
- [ ] `src/i18n/messages/ja.json` đủ toàn bộ key như `en.json`.
- [ ] Bộ chuyển ngôn ngữ có VI / EN / JA, giữ đúng trang hiện tại khi đổi.
- [ ] Sitemap + hreflang có `ja`; `x-default` vẫn là vi; `<html lang="ja">` ở trang ja.
- [ ] Glyph tiếng Nhật hiển thị đúng (font JP), không làm chậm đáng kể trang vi/en.
- [ ] Migration versioned cho phép `locale = 'ja'`; CLI nội dung (`content-cli`) ghi được bản ghi ja.
- [ ] Workflow AI news hằng tuần vẫn chạy được (không đòi bài ja, trừ khi user chốt khác).
- [ ] typecheck + lint + build PASS.

## Câu hỏi mở (cần user chốt trước khi build)
- **OQ-1 Fallback:** trang/khối ja chưa có bản ghi → hiện bản **en** (đề xuất) hay hiện vi?
- **OQ-2 `ja.json`:** dev dịch bằng máy (Claude) rồi bot/user soát lại (đề xuất), hay chờ bot gửi bản dịch?
- **OQ-3 AI news hằng tuần:** chỉ vi/en (đề xuất), hay sinh thêm bản ja?
- **OQ-4 Bộ chuyển ngôn ngữ:** 3 nút liền VI · EN · JA (đề xuất, giống hiện tại) hay dropdown?

## Quyết định user (2026-11-09)
User: "đổi hết tất cả luôn" → làm đủ bộ, ja ngang hàng vi/en ở mọi nơi:
- OQ-1: thiếu bản ghi ja → fallback **en** (chỉ là lưới an toàn trong lúc bot seed).
- OQ-2: dev dịch `ja.json` đủ key (bot/user soát sau).
- OQ-3: bản tin AI hằng tuần **sinh cả bản ja** (vi/en/ja).
- OQ-4: bộ chuyển VI · EN · JA (3 nút liền).

## Ghi chú
- Sau khi deploy + migration lên prod → báo bot seed đủ bộ ja (home, about, ui_messages, company_info, listing_page, listing_item, solution, product, case_study, post, slug_registry, solution_overview), rebuild image `nta-tools`.
- Docs bot (`docs/content-bot/`) cần cập nhật: key cho phép `collection/(vi|en|ja)/slug`.

## Tiến độ xử lý
- 2026-11-09: change-request — ADDITIVE, risk HIGH; spec 4.12.0 (R-20a) / test-scope v62; spec-validator pre-plan PASS (gaps gộp vào spec);
  task `tasks/feature-add-japanese-locale/phase-1-task-01 … phase-3-task-02`. Chờ user duyệt plan + duyệt dòng `HIGH_RISK_MIGRATION` cho migration 0002.
