Agent: reviewer

# Review — change-hairstyle-ai-gallery-screenshots · phase-1 · task-01 · round-1

- **Task:** `tasks/change-hairstyle-ai-gallery-screenshots/phase-1-task-01.md`
- **Change:** `spec/changes/2026-10-12-hairstyle-ai-gallery-screenshots.md` (MODIFY, post-build, content/asset)
- **Spec delta:** `spec/updates/2026-10-12-hairstyle-ai-gallery-screenshots.md`; `spec/CHANGELOG.md` (scope v16)
- **Date:** 2026-10-12

## Review level

**NORMAL**

## Reason

- Type MODIFY content/asset, 1 sản phẩm, 1 trang (`/products` + `/en/products`); mỗi file chỉ +3 dòng trong mảng `screenshots`.
- Không chạm shared component/API/auth/schema/tenant/i18n/DB; `ScreenshotCarousel` vốn đã hỗ trợ nhiều slide (dots/prev-next khi `length > 1`).
- Không thuộc nhóm risk đỏ bắt buộc STRICT (không auth/permission/tenant/migration/contract dùng nhiều client/payment/...).
- Vì là content/asset hiển thị cho người dùng cuối và có 3 asset nhị phân mới → không hạ xuống FAST (cần kiểm chứng asset + build output thật).

## Blast radius

- Direct: `/products` và `/en/products` — carousel card `hair-style-ai` (1 → 4 slide, hiện thêm dots + prev/next vì `length > 1`).
- Không lan sang: card home `hair-style-ai` (`src/content/home.ts:18,30` dùng `image` riêng = ảnh Welcome), carousel `music-app`, `ScreenshotCarousel.tsx`, `products/page.tsx`, i18n `products.screenshotAlt`, `cardStyles`.
- Data/asset mới: `public/images/products/hair-style-ai-{try-on,analysis,rating}.jpg`.

## Verify commands + result

> Lưu ý: phiên review này **không được cấp quyền chạy `shell`** (permission denied) → không tự chạy lại được `lint`/`typecheck`/`build`. Thay vào đó xác minh độc lập qua **artifact build trên đĩa** + đọc source. Các lệnh do primary báo cáo được đối chiếu với artifact, không mâu thuẫn.

| Lệnh / kiểm tra | Result | Bằng chứng |
|---|---|---|
| `npm run lint` (primary) | PASS (0 errors; 1 warning pre-existing `src/components/mdx/index.tsx`) | Không chạy lại được (shell denied) — chấp nhận theo báo cáo primary |
| `npm run typecheck` (primary) | PASS | idem |
| `npm run build` (primary) | PASS | idem |
| Build artifact render 4 ảnh (VI) | OK | `.next/server/app/vi/products.html` + `vi/products.rsc` chứa `hair-style-ai-(try-on\|analysis\|rating)\.jpg` (Grep match line 1 / line 46) |
| Build artifact render 4 ảnh (EN) | OK | `.next/server/app/en/products.html` + `en/products.rsc` chứa `hair-style-ai-try-on` (Grep match) |
| 4 file asset tồn tại | OK | Glob: `hair-style-ai.jpg`, `-try-on.jpg`, `-analysis.jpg`, `-rating.jpg` |
| Asset là JPEG hợp lệ + đúng màn hình | OK | Read ảnh thành công; nội dung khớp: Try On (dot 2), Analysis (dot 3), Rating/“Help us grow” (dot 4) |
| Thứ tự mảng `screenshots` (vi) | OK | `vi/hair-style-ai.mdx:5-9`: Welcome → try-on → analysis → rating |
| Thứ tự mảng `screenshots` (en) | OK | `en/hair-style-ai.mdx:5-9`: giống hệt vi (đồng bộ) |
| `home.ts` không đổi | OK | `src/content/home.ts:18,30` vẫn `image: '/images/products/hair-style-ai.jpg'` (ảnh Welcome) |
| Không hồi quy `music-app` | OK | `vi/music-app.mdx:5-6` vẫn `screenshots: [/images/products/ai-music-app.png]` (1 ảnh) |
| `spec/test-scope/current.json` sinh mới | OK | `scopeVersion: 16`, `workItem: change-hairstyle-ai-gallery-screenshots`, `specVersion: 3.0.0` |
| `spec/CHANGELOG.md` dòng scope v16 | OK | Đúng mô tả thay đổi, không bump version (R-07 không giới hạn số ảnh) |

## Responsive Checklist Gate

**N/A (không đụng UI code).** Diff chỉ gồm 2 file nội dung `.mdx` + 3 asset ảnh; **không** thay đổi route/component/CSS/media-query. Vì vậy các mục layout/typography/media/touch/viewport không có thay đổi trong diff để đánh giá.

Kiểm tra phụ (ngoài diff, chỉ để chắc không phát sinh hồi quy khi carousel có thêm slide):

- Tỉ lệ ảnh: 941×1672 → 0.5628 vs khung `aspect-[9/16]` = 0.5625 → lệch < 0.1%, `object-cover` không crop đáng kể. **OK.**
- Touch target dots/prev-next trong `ScreenshotCarousel.tsx:74-75,84` = `min-h-11 min-w-11` (44px). **OK** (component không đổi — ngoài scope).

## Skill gates

- `aislop`: **skip** — phiên này không chạy được shell (permission denied); diff chỉ là nội dung `.mdx`/asset, không có code logic mới.
- Anti-slop `oxlint`: **skip, no code diff** (không đụng file TS/TSX).
- `ocr` (open-code-review): **skip, not run** (shell denied; không có code logic mới để review).
- AI-readable: **OK** — không thêm hàm/file logic; mdx tên field self-descriptive (`screenshots`).
- ai-friendly-web: **N/A** (thay đổi nội dung card sản phẩm, không đổi llms.txt/robots/sitemap).
- blitzstrike: **skip** (task không nhạy cảm auth/API).

## Findings

**[MINOR / informational]** `ScreenshotCarousel.tsx:67` truyền `width=900 height=1600` (`CARD_POSTER_IMAGE_RATIO`) trong khi ảnh thật 941×1672 — lệch tỉ lệ ~0.05%, không gây méo/nhảy layout do khung `aspect-[9/16]` + `object-cover`. **Không thuộc diff này** (component không đổi) → đề xuất bỏ qua, không tính vào verdict.

**[MINOR / residual]** Alt text chung (`products.screenshotAlt` + `{title}`) cho cả 4 ảnh — đã được ghi nhận là out-of-scope (muốn alt riêng phải breaking-change schema `screenshots: string[]` → `{src,alt}[]`). Chấp nhận theo task.

Không có **[CRITICAL]** / **[MAJOR]**.

Chú ý dọn dẹp: report này chỉ kiểm task T01. Các file khác đang dở trong working tree (`spec/test-scope/current.json`, `spec/CHANGELOG.md`, `spec/updates/...`, `tasks/change-.../`) là artifact của change này; change `brand-logo-wordmark-removal` (commit `157fe78`) **không** thuộc phạm vi review.

## Verdict

✅ **PASS** (NORMAL, round-1)

- Thứ tự 4 ảnh Welcome → Try On → Analysis → Rating khớp yêu cầu, vi/en đồng bộ.
- 4 asset tồn tại, là JPEG hợp lệ, nội dung khớp từng màn; tỉ lệ khớp khung carousel.
- `home.ts` không đổi (card home vẫn ảnh Welcome); `music-app` không hồi quy; không lan file ngoài scope.
- Build output chứa 3 asset mới (VI+EN) ⇒ carousel sẽ render đủ 4 slide + dots + prev/next.
- Không còn CRITICAL/MAJOR.

### Residual risk (chưa xác minh độc lập)

1. Không chạy lại được `lint`/`typecheck`/`build` (shell permission denied) — kết quả dựa trên báo cáo primary + sự hiện diện của artifact build nhất quán.
2. Kích thước pixel chính xác 941×1672 chưa đo trực tiếp (không có công cụ đo); xác nhận gián tiếp qua tỉ lệ hiển thị dọc ≈9:16 khi đọc ảnh.
3. Chưa đếm byte-level đúng 4 `<img>`/4 dots trong HTML (HTML là 1 dòng dài); suy ra từ mảng `screenshots` (4 phần tử) + `ScreenshotCarousel` map 1:1 + build chứa 3 asset mới.
4. Chưa render browser thật để xác nhận `next/image` không `onError` (carousel có fallback `markImageFailed`).
