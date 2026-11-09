Agent: spec-validator

# Spec validation (pre-plan) — CR-044 add-japanese-locale

- Mode: Spec validation (trước khi chia task)
- Input: `spec/changes/2026-11-09-add-japanese-locale.md`, `git diff SPECIFICATIONS.md` (4.11.0 → 4.12.0), `spec/CHANGELOG.md` 4.12.0, `spec/test-scope/current.json` (scopeVersion 62)
- Code đối chiếu: `deploy/db/migration-gate.ts`, `src/db/schema.ts`, `src/db/content-rules.ts`, `src/db/content-repo.ts`, `tools/db/{file-source,parity-check,publish-post,content-cli}.ts`, `tools/ai-news/generate.py`, `.github/workflows/ai-news.yml`

## Verdict: PASS (có điều kiện — sửa M-1 trong spec delta hoặc ghi rõ vào task phase 1 trước khi build)

0 ❌ · 0 HIGH · 1 MEDIUM · 4 LOW.

## Coverage (change doc → spec)

| Acceptance / quyết định | Spec | Kết quả |
|---|---|---|
| Route `/ja/...` 200, vi không prefix, `/en` không đổi | R-20a.1 | ✅ |
| Fallback khi thiếu ja (OQ-1 = en) | R-20a.2 (theo từng bản ghi, slug_registry/company_info) | ✅ |
| `ja.json` đủ key (OQ-2 dev dịch) | R-20a.3 + test parity key | ✅ |
| Bộ chuyển VI · EN · JA (OQ-4) | R-20a.4 | ✅ |
| Sitemap/hreflang/`x-default`=vi/`html lang` | R-20a.5 | ✅ |
| Font JP, không chậm vi/en | R-20a.6 (+R-22) | ✅ |
| Migration versioned + content-cli ghi ja | R-20a.9 | ✅ |
| AI news (OQ-3 = sinh cả ja) | R-09c "Bản ja" | ✅ (xem L-3) |
| typecheck/lint/build | test-scope regression | ✅ |
| Docs bot `collection/(vi|en|ja)/slug`, rebuild `nta-tools` | R-20a.11 | ✅ |

## Cross-check ràng buộc

- **R-16c / migration gate:** khớp code. `ALTER TABLE … DROP CONSTRAINT` khớp rule `ALTER TABLE ... DROP` (`migration-gate.ts:38`, bảng không tạo trong cùng file) → bị chặn trừ khi có `APPROVAL_MARKER_PATTERN` (`:9-10`); `ADD CONSTRAINT … CHECK` không bị chặn. Spec yêu cầu dòng duyệt + chạy thử trên DB tạm restore (đúng "thay verify staging" của R-16c) + backup trước migration (R-16b). OK.
- **R-08a.1:** R-20a.1 yêu cầu redirect 301 cũ có bản ja. OK.
- **R-21 / R-22:** hreflang/sitemap/JSON-LD/og:locale và LCP không tệ hơn. OK.
- **R-16 (ui_messages DB đè file):** R-20a.3 dùng chung cơ chế, chưa có bản ghi ja → `ja.json`. OK.

## Gaps

### M-1 (MEDIUM) — R-20a.10 mâu thuẫn với R-09c và chưa đủ cụ thể cho parity
- R-20a.10 nói "ja là locale chỉ có ở DB" nhưng R-09c (bản ja) sinh **file seed** `src/content/blog/ja/ai-weekly-*.mdx`.
- `parity-check.ts:49-51` `compareRecords` báo mọi bản ghi DB không có trong file là `thừa trong DB` → sau khi bot seed ja, mọi hàng ja sẽ bị báo "thừa", không chỉ "thiếu". Spec chỉ nói "không báo thiếu ja".
- `checkLocalePairs` (`parity-check.ts:63`) và `file-source.ts:139` cùng lặp `CONTENT_LOCALES`; `publish-post.ts:230` cũng lặp `CONTENT_LOCALES` nhưng R-09c cần nó đòi đủ 3 locale → cần 2 tập locale tách biệt.
- **Đề xuất sửa spec:** định nghĩa rõ `SEED_LOCALES = ['vi','en']` (file-source, parity, I-1 cặp) vs `CONTENT_LOCALES = ['vi','en','ja']` (DB CHECK, I-6, publish-post); parity **bỏ qua hàng locale ngoài `SEED_LOCALES` ở cả hai chiều** (không "thiếu", không "thừa"); file blog ja của AI news chỉ được `publish-post` đọc, file-source không import. Sửa câu "ja chỉ có ở DB" → "ja không có file seed import ban đầu (trừ bài AI news tuần)".

### L-1 (LOW) — I-1 cảnh báo write-path chưa định nghĩa cho 3 locale
`content-repo.ts:170-185` cảnh báo "chưa có bản ngôn ngữ còn lại — tạo cặp vi/en". Với ja, chưa rõ: tạo bản ja có cảnh báo không, tạo vi/en có đòi ja không. Đề xuất: I-1 chỉ kiểm cặp vi/en; ja không bắt buộc (khớp fallback en).

### L-2 (LOW) — `content-cli upload` chưa có `--alt-ja`
R-20a.9 nói `asset.alt.ja` hợp lệ nhưng CLI chỉ có `--alt-vi/--alt-en` (`content-cli.ts:58-59,208`). Ghi rõ có thêm cờ `--alt-ja` hay không (bot có thể chỉ dùng write-path trực tiếp).

### L-3 (LOW) — R-09c chưa liệt kê đủ chuỗi cố định cho ja
`generate.py` còn đoạn mở đầu (`:241`), nhãn nguồn `Nguồn/Source` (`:243`), ghi chú ảnh (`:62`) theo locale; spec chỉ nêu title/excerpt/caption/footnote. Đề xuất thêm 1 câu "mọi chuỗi cố định theo locale trong bài có bản ja" + giới hạn độ dài `title_ja/summary_ja` (TITLE_MAX/SUMMARY_MAX tính theo ký tự, áp dụng chung) để testable.

### L-4 (LOW) — R-13a.1 vẫn liệt kê `/contact`, `/en/contact`
Thêm `/ja/contact` vào câu liệt kê form (R-20a.8 đã phủ ý, chỉ là đồng bộ chữ).

## Residual risk
- Không chạy verify command (pre-plan, chưa có code đổi).
- Migration do drizzle-kit sinh có thể khác dạng `DROP CONSTRAINT`+`ADD CONSTRAINT`; builder phải inspect file SQL thật với gate test trước khi gắn dòng duyệt.
