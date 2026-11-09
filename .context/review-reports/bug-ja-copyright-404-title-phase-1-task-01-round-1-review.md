# Review — bug-ja-copyright-404-title phase-1-task-01 round 1 (CR-045)

Agent: reviewer
Date: 2026-11-09
Change doc: `spec/changes/2026-11-09-ja-copyright-404-title.md`

## Review level
NORMAL

## Reason
Diff 2 file, nhỏ, không đụng auth/schema/API/DB. Nhưng `src/app/[locale]/layout.tsx` là layout dùng chung cho mọi trang (metadata kế thừa) → không đủ điều kiện FAST. Không có risk đỏ → không STRICT.

## Scope reviewed
- `src/app/[locale]/layout.tsx` — `generateMetadata`: map tĩnh `DEFAULT_TITLE: Record<Locale,string>` (vi/en/ja), chuẩn hoá locale lạ → `routing.defaultLocale`, `OG_LOCALE[locale]` dùng chung biến đã chuẩn hoá; thêm `import type { Locale } from '@/content/types'`.
- `src/i18n/messages/ja.json` — `footer.copyright` → `© NTA. 無断転載を禁じます。`.

## Blast radius
- Title mặc định của layout chỉ hiện khi segment con KHÔNG đặt title. Grep `generateMetadata|metadata` trong `src/app`: mọi `page.tsx` dưới `[locale]` (home, about, contact, blog, blog/[slug], case-studies(+slug), products(+slug), solutions/ai(+slug), solutions/enterprise(+slug)) đều tự đặt title → không đổi.
- Phụ thuộc title mặc định: `[locale]/[...rest]/page.tsx` (catch-all → notFound) và boundary 404 sau hydrate → đúng mục tiêu fix.
- `not-found.tsx` giữ `export const metadata` tĩnh `{ absolute: '404 | NTA' }`, không có `generateMetadata` (test `not-found.test.ts` vẫn PASS) → ràng buộc CR-026/CR-032 giữ nguyên; layout không gọi next-intl/headers() → không phát sinh 500 ISR.
- `openGraph.locale`: hành vi không đổi (trước đã fallback qua `isLocale`, nay dùng cùng biến chuẩn hoá).
- Footer copyright: `Footer.tsx:182` đọc `t('copyright')`. UI messages chế độ db gộp `ui_messages/<locale>` lên file; theo archive CR-044 (dòng 72) `ui_messages ja` KHÔNG seed DB → `ja.json` là nguồn thật, fix có hiệu lực sau deploy, không cần thao tác DB. vi/en không đổi.

## Verify commands + result
| Command | Result |
|---|---|
| `npm run typecheck` | PASS (tsc --noEmit, 0 lỗi — `Record<Locale,…>` đủ key vi/en/ja) |
| `npm run lint` | PASS — 0 error, 1 warning cũ (`src/components/mdx/index.tsx:26` no-img-element, không thuộc diff) |
| `npm test` | 231 tests: 228 pass, 1 fail, 2 skipped. Fail duy nhất: "toàn bộ nội dung file hiện tại qua quy tắc từng bản ghi + ảnh tồn tại" (content-rules ảnh uploads) — có sẵn trước diff, không liên quan. Test messages/ja (import ja.json, request db giữ ja.json) PASS → parity key ja.json còn nguyên. |
| `npm run build` | Không chạy lại — dùng evidence coordinator (PASS với `SWC_NATIVE_BINDING_CACHE`). Diff không thêm route/dependency. |
| Dev-server smoke | Evidence coordinator: 404 vi/en/ja title đúng ngôn ngữ, HTTP 404 giữ nguyên, trang có title riêng không đổi, copyright vi/en/ja đúng. Reviewer không chạy lại (không có quyền khởi server). |

## Findings
- Không có defect blocking.
- [INFO] Câu copyright `無断転載を禁じます。` là cách ghi bản quyền phổ biến, tự nhiên trên web Nhật (tương đương "Bảo lưu mọi quyền"). Đạt.
- [INFO] Title ja `NTA | 企業向けテクノロジーソリューション` nhất quán với thuật ngữ đang dùng ở các trang khác (`企業向けソリューション`, `企業向け・AI・アプリソリューション`).
- [LOW / residual risk] Nếu sau này seed `ui_messages/ja/footer` vào DB bằng bản copy từ en, giá trị DB sẽ đè `ja.json` và lỗi tái xuất hiện. Không cần làm gì cho CR này; nên lưu ý khi seed ui_messages ja.
- [LOW] Không có unit test khoá title mặc định theo locale (có thể thêm test source-assert như `not-found.test.ts`). Không bắt buộc — thay đổi tĩnh, typecheck đảm bảo đủ key.

## Doc impact
Không đổi API/schema. `docs/DESIGN.md` nếu có mô tả title mặc định layout (cứng tiếng Việt) → cập nhật thành "theo locale"; nếu không có → `no doc impact`. Coordinator xác nhận khi close-out.

## Verdict
PASS
