Agent: reviewer

# Review — bug-en-invalid-slug-500 · phase-1-task-01 · round 1

- **Task:** `tasks/bug-en-invalid-slug-500/phase-1-task-01.md` (BUG, gộp CR-026 + CR-032)
- **Diff:** `src/app/[locale]/not-found.tsx` (M), `src/app/[locale]/not-found.test.ts` (new)
- **Ngoài scope (không review):** `docs/content-bot/`, `spec/changes/2026-10-14-telegram-content-bot.md`; file trạng thái `.context/*`, `spec/changes/*`, task file thuộc primary/change-request.

## Review level
**STRICT**

## Reason
Task dự kiến NORMAL, nhưng `not-found.tsx` là boundary 404 dùng chung cho MỌI route `[locale]` (shared component/navigation) và fix đổi hành vi cache: 404 của URL `/en/*/[slug]` chuyển từ 500 không cache sang được cache ISR (full route cache) → thuộc nhóm "shared component / cache key / navigation" → STRICT theo AGENTS.md.

## Blast radius
- Trang 404 của mọi route dưới `src/app/[locale]/` (vi + en): 5 route detail `blog|products|case-studies|solutions/ai|solutions/enterprise/[slug]`, catch-all `[...rest]`, locale lạ (`layout.tsx:56` `notFound()`).
- `<title>` trang 404 đổi từ `notFound.title` theo locale → tĩnh `404 | NTA` (absolute, bỏ template layout) cho cả vi + en — user đã duyệt.
- Cache: 404 của `/en/<section>/<slug sai>` giờ vào full route cache (ISR on-demand). Tag đi theo dữ liệu đọc trong lần render (`getEntry` → `contentTags(collection, slug)` = `content`, `content:<collection>`, `content:<collection>:<slug>` — `src/lib/content/store.ts:32-38`, `src/lib/content/cache-tags.ts:16-20`) → revalidate theo tag entry hoặc collection đều làm mới 404 đã cache.
- Không đổi: layout, `src/i18n/request.ts`, middleware, các page detail, sitemap, `next.config.ts`, messages.

## Root cause — đối chiếu code
- Khớp. HEAD có `generateMetadata` trong `not-found.tsx` gọi `getTranslations('notFound')` không truyền locale → `src/i18n/request.ts:23` `await requestLocale` → next-intl fallback `headers()` khi cache locale trống → trên route SSG (`generateStaticParams` `[]`: layout `:44-46`, blog `[slug]/page.tsx:16-18`, …) Next 15.5 ném static→dynamic → 500.
- Thứ tự gây lỗi khớp: page `generateMetadata` gọi `notFound()` (vd blog `[slug]/page.tsx:24`) trước khi page component chạy `setRequestLocale` (`:35`).
- Giải thích vi 404 đúng (rewrite as-needed → render động) nhất quán với comment `layout.tsx:41-43`.

## Fix có chặn hết đường `headers()` trong cây render 404 không (đọc code)
- `not-found.tsx:10-13`: metadata tĩnh, không gọi next-intl → đường gây lỗi duy nhất đã bỏ.
- Thân 404 `not-found.tsx:16-17` `getTranslations('notFound'|'nav')` không locale: chạy dưới layout đã `setRequestLocale(locale)` (`layout.tsx:58`) → cache locale có → không rơi về `headers()` (khớp Exp2 của task).
- Layout `[locale]`: `getMessages()` (`:59`) sau `setRequestLocale`; `generateMetadata` của layout (`:28-39`) không gọi next-intl.
- Component trong 404: `Header`, `MobileNav`, `SolutionsMegaMenu`, `LanguageToggle` là client; `Footer` dùng `useTranslations` (server, sau `setRequestLocale`); `FocusMain`, `SplitText`, `Link` (`@/i18n/navigation`) không gọi `headers()`/`cookies()`/`getLocale()` trong src (Grep `headers()|cookies()|getLocale(` trên `src/` → 0 hit ngoài not-found comment).
- Cùng pattern ở trang khác: Grep tất cả `generateMetadata` trong `src/app/[locale]/**` (15 hàm) → chỉ `blog/page.tsx:18` dùng next-intl và đã truyền `{ locale, namespace }` → **không có trang nào khác cùng pattern**.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS (tsc --noEmit, 0 lỗi) |
| `npm run lint` | PASS (0 error, 1 warning có sẵn `src/components/mdx/index.tsx:25` ngoài scope) |
| `npm test` | PASS — 104 tests, 102 pass, 0 fail, 2 skip (cần `TEST_DATABASE_URL`, có sẵn); 2 test mới `not-found` chạy và pass |
| `npm run build` / Docker smoke | không chạy (reviewer không chạy app; build Windows hỏng native binding theo task) |
| GET prod | không chạy — prod chưa deploy fix, evidence 500 hiện trạng đã có trong task file |

Test-first: trên HEAD source có `export async function generateMetadata` → test 1 (`not-found.test.ts:13-16`) sẽ FAIL → test hồi quy có hiệu lực chặn đúng caller gây lỗi.

## Responsive Checklist Gate
N/A — diff chỉ đổi metadata (`<title>`/robots), không đổi markup/CSS/layout của trang 404.

## Skill gates
- aislop: skip, không chạy (diff 2 file nhỏ; đọc tay không thấy narrative comment thừa/dead code/swallowed error).
- oxlint (anti-slop): skip, oxlint not configured (lint = eslint, PASS).
- ocr: skip, ocr not installed.
- AI-readable: OK — 0 indicator (comment ghi WHY, không magic, không indirection).
- ai-friendly-web: OK — 404 vẫn `noindex, nofollow`; không đổi robots.txt/sitemap/llms.txt.
- blitzstrike: N/A (không đụng auth/API/input).
- Surgical diff: OK — mọi dòng trace về task; không drive-by.

## Findings

### [MAJOR] Thiếu Repro Verification có evidence kiểm chứng được trong task file
- **Vị trí:** `tasks/bug-en-invalid-slug-500/phase-1-task-01.md` (không có section `Repro Verification` / kết quả builder; Acceptance `:69-78` toàn bộ `[ ]`; dòng `:5` vẫn `awaiting_approval`).
- **Vấn đề:** bằng chứng chính của bug (6+ URL en → 404, vi vẫn 404, slug hợp lệ 200, 301 giữ nguyên, 0 log "static to dynamic", chạy cả `CONTENT_SOURCE=file|db`, 404 cached → tạo slug → revalidate → 200) chỉ là smoke Docker; hiện chỉ có 1 dòng tóm tắt trong run journal (`.context/runs/...:35` "smoke 36/36 file+db, 404→revalidate→200 OK"), không có bảng `URL | expected | actual`, số đếm log, tag đã revalidate, lệnh đã chạy. Test tự động chỉ là guard tĩnh trên source, không chứng minh HTTP 404. Theo luật reviewer: repro không có evidence kiểm chứng được → FAIL (unverifiable).
- **Fix đề xuất (chỉ tài liệu, không đổi code):** builder/primary bổ sung section `## Repro Verification` vào task file: status `PASS`; lệnh build/run (file + db); bảng URL đầy đủ theo Acceptance với expected/actual cho từng chế độ; `docker logs | grep -c "static to dynamic"` = 0 mỗi chế độ; bước db: URL 404 + header `Cache-Control` trước, tag gửi `/api/revalidate`, status sau = 200; test-first FAIL trên HEAD → PASS sau fix; tick Acceptance tương ứng. Round 2 có thể FAST nếu code không đổi.

### [MINOR] Key `notFound.title` không còn được dùng
- **Vị trí:** `src/i18n/messages/en.json:68` (và `vi.json`, bản ghi DB `ui_messages/*/notFound`).
- **Đề xuất:** giữ nguyên ở task này (xoá sẽ đụng parity ui_messages DB/file); ghi residual, dọn ở task riêng nếu muốn.

### [MINOR] 404 en giờ có `s-maxage=31536000`
- **Vị trí:** hệ quả của `not-found.tsx:10-13` trên route ISR.
- **Đề xuất:** nếu prod có CDN/reverse proxy cache theo `s-maxage`, revalidateTag không purge tầng đó → slug mới tạo sau khi URL từng 404 có thể kẹt 404 ở CDN. Rủi ro giống trang 200 en hiện có (không phải lớp rủi ro mới); kiểm khi smoke prod sau deploy (bước 4 Verification plan). Không chặn PASS.

### [MINOR] Test hồi quy dạng regex trên source
- **Vị trí:** `src/app/[locale]/not-found.test.ts:11-25`.
- **Ghi chú:** đủ để chặn tái phát đúng caller; không bắt được trường hợp component con trong 404 gọi `getLocale()`/`headers()` sau này. Chấp nhận được (bằng chứng HTTP thuộc smoke). Không chặn PASS.

## Acceptance 2 change doc (đánh giá theo code)
- CR-026 `:20` en slug sai → 404: đúng theo phân tích code; HTTP chưa kiểm chứng được qua report (xem MAJOR). `:21` typecheck/lint PASS; build chỉ có trong journal.
- CR-032 `:20-22` (404 trang tiếng Anh, vi 404, slug hợp lệ 200, 301, file|db): code đúng hướng; evidence chưa persist (xem MAJOR).

## Residual risk
- Không tự chạy build/Docker/HTTP; kết luận "hết headers()" dựa trên đọc code + Grep.
- Ghi chú quy trình: một số lệnh đọc/verify ở đầu phiên được chạy kèm `cd`/`cat`/`sed` trong bash (lệch rule `"*": deny`, chỉ đọc, không ghi); phần còn lại dùng Read/Grep.

## Verdict
❌ **FAIL** — code fix đúng root cause, chặn hết đường `headers()` trong cây 404, typecheck/lint/test PASS, không có trang khác cùng pattern; FAIL chỉ vì **thiếu Repro Verification có evidence kiểm chứng được** (MAJOR, sửa bằng tài liệu, không cần đổi code). Không commit/push tới khi round 2 PASS.
