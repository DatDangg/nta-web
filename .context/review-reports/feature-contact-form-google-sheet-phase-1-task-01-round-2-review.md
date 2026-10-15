# Review — feature-contact-form-google-sheet · phase-1-task-01 · round 2

Agent: reviewer
Ngày: 2026-10-15 · CR-037 · spec R-13a (4.5.0)

## Review level
**STRICT**

## Reason
Giữ mức round 1: endpoint công khai nhận PII, secret token, token bot Telegram, chống formula injection. Round 2 kiểm đóng HIGH-1 + regression.

## Blast radius
`tools/contact-sheet/Code.gs` (`sanitizeCell_`, `buildRow_`), `tools/contact-sheet/code.test.ts`, `tools/contact-sheet/README.md` (mục e/g), Verification summary task file. Không đụng `src/`. Hợp đồng payload/response không đổi (đầu vào task-02).
Ngoài scope: `spec/changes/BACKLOG.md`, `spec/changes/2026-10-15-ai-news-naming-images.md`.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm test` (chạy thay `node --import tsx --test tools/contact-sheet/code.test.ts` — lệnh `node …` không nằm trong allow-list bash của reviewer; script `test` = cùng runner, glob gồm `tools/**/*.test.ts`) | 184 test · 181 pass · 2 skip (cần DB) · 1 fail **có sẵn, ngoài scope** `tools/db/content-rules.test.ts` (9 ảnh `/uploads/<sha>` không có local — giống round 1). Toàn bộ test `tools/contact-sheet/code.test.ts` PASS. |
| `npm run lint` | 0 error, 1 warning có sẵn (`src/components/mdx/index.tsx` no-img-element). |
| `npm run typecheck` | PASS. |

## Đối chiếu
- **HIGH-1 (round 1) — ĐÃ ĐÓNG.** `Code.gs:96-100` `sanitizeCell_`: null/undefined/`''` → `''`, mọi chuỗi khác → `"'" + text` (đúng 1 dấu `'`, không phụ thuộc ký tự đầu). `buildRow_` (`Code.gs:114-124`) chỉ map sanitize cho cột 2–8. Test mới: SĐT `0901234567` → `'0901234567`; `2026-10-15`/`TRUE`/`1/2`/`1e5` → có `'` ở cột tên/công ty/nội dung; dòng đầy đủ 8 cột cập nhật kỳ vọng.
- **Formula injection:** `= + - @ \t \r` vẫn → `'<value>` (test l.214-223). OK.
- **Không `''` kép do code:** `'` chỉ thêm 1 lần; `sanitizeCell_("=1+1")` → `'=1+1` (test l.245). Input người dùng bắt đầu bằng `'` sẽ thành `''x` — Sheet hiển thị `'x` = đúng giá trị gốc, chấp nhận.
- **Cột thời gian:** không sanitize, test l.250-254 khoá `"2026-10-15 15:00:00"` không `'`. OK.
- **Telegram:** `notifyTelegram_(…, payload)` → `buildTelegramText_(p)` đọc thẳng `payload` (`Code.gs:52`, `:150-163`), KHÔNG dùng row đã sanitize → text không có `'`. OK.
- **Rỗng/null:** phone/company/need `null`/`''` → ô `''` (test l.165-171). OK.
- **Các mục round 1 đã đạt vẫn đạt:** token XOR không short-circuit + check trước validate/ghi; validate lỏng hơn web; lock/finally, Telegram sau khi nhả lock; log mã cố định không token/PII; không `parse_mode`/`getUpdates`/`setWebhook`; README placeholder, không secret thật. README mục g mô tả đúng hành vi `'`; mục e ghi rủi ro dòng trùng (LOW-2 round 1).

## Findings

### HIGH / MEDIUM
— không có.

### LOW (không chặn)
1. Test Telegram (`code.test.ts:258-267`) kiểm `text.includes("0901234567")` — vẫn đúng nếu text chứa `'0901234567`, nên chưa có test khoá "text Telegram không có `'`". Code hiện đúng (dùng `payload`); đề xuất thêm `assert.ok(!text.includes("'"))` hoặc kiểm dòng `SĐT: 0901234567` để chặn regression sau này.
2. (giữ từ round 1, đã ghi residual risk) nhãn `NEED_LABELS_` chỉ khoá tập key; hành vi `'` trên Sheet thật chỉ kiểm được ở E2E.

## Verdict
**PASS** — HIGH-1 đã đóng, không regression về injection / cột thời gian / Telegram / bảo mật. Chỉ còn LOW không chặn.
