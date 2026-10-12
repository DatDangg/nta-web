Agent: reviewer

# Review: feature-blog-listing-redesign — phase-1-task-03 (round 1)

## Review level: NORMAL

## Reason
Task UI trên 1 route public (`/blog`, `/en/blog`), component mới riêng trong `src/components/blog/` + hàm thuần
`src/lib/blog/filter.ts`. Không đụng auth/DB/API/schema. `Pagination` (shared) và `PostCard` không đổi. Trạng thái
nằm trên URL (input người dùng) → soi thêm security + race, nhưng không có risk đỏ để lên STRICT.

## Blast radius
- `/blog`, `/en/blog` phần dưới hero (thanh lọc, khối nổi bật, lưới, phân trang). Detail `/blog/[slug]` không đổi.
- `src/i18n/messages/{vi,en}.json` namespace `blog` (thêm 14 key, bỏ `blog.intro` — không còn chỗ dùng; `intro` ở contact/footer là namespace khác).
- `BlogFilter.tsx` xoá (staged) — không còn import nào (`grep BlogFilter src` = 0).
- Doc: `.context/design-spec.md` (Screen 10 viết lại, Screen 11 ví dụ ngày, §1.9), `docs/DESIGN.md`, `spec/test-scope/current.json` (scope v22).

## Verify commands + result
| Lệnh | Nơi chạy | Kết quả |
|---|---|---|
| md5 7 file trong scope (device vs container `/home/claude/nta`) | cả hai | khớp 100% |
| `npm run typecheck` | device | PASS (exit 0) |
| `npm run lint` (`eslint .`) | device | PASS — 0 error, 1 warning có sẵn (`src/components/mdx/index.tsx:25` `<img>`, ngoài scope) |
| `npx eslint src/components/blog src/lib/blog "src/app/[locale]/blog"` | device | PASS (0 problem) |
| `npm run build` | không chạy trên device (node_modules Windows); dùng evidence builder: `next build` PASS ở container (stub next/font Inter) | PASS (evidence) |
| Playwright `func.mjs` (builder) | container `next start :3100` | PASS theo builder |
| Playwright race test riêng của reviewer (độ trễ RSC 350ms / 600ms) | container | **FAIL 2/6 kịch bản** — xem MAJOR-1 |
| Playwright bàn phím + reduced-motion (reviewer) | container | focus ring chip có (global `*:focus-visible`), "Xem tất cả" → focus `#blog-latest-title`, reduced-motion OK |
| Kiểm class Tailwind trong CSS build (`.next/static/css`) | container | mọi class trong 3 component có CSS, trừ `motion-safe:ease-out-expo` (MINOR-1) |

## Responsive Checklist Gate (diff đụng UI)
Đo bằng Playwright full-page (scroll để kích reveal) ở 375 / 768 / 1280 (+ ảnh builder 390/1024/1440).
- Layout — không scroll ngang: **OK** (`scrollWidth == innerWidth` ở 375/768/1280).
- Layout — mobile-first, grid: **OK** — lưới `grid-cols-1 md:2 lg:3 xl:4`; khối nổi bật base 1 cột (lớn → 2 nhỏ → NỔI BẬT), md–lg bài lớn + NỔI BẬT full-width, 2 nhỏ 2 cột, xl 3 cột `1.38fr/1fr/0.86fr` — khớp R-09a §Responsive (đã xem ảnh). Grid cột cố định theo breakpoint là pattern có sẵn của repo, đúng spec.
- Hàng chip mobile: **OK** — cuộn ngang trong khung riêng (`overflow-x-auto min-w-0`), ô tìm kiếm xuống dòng dưới; lg+ chip + search 1 hàng.
- Typography/spacing: **OK** — rem/scale token; tiêu đề mục `1.5rem → 1.75rem`.
- Media: **OK** — `next/image fill` trong khung `aspect-*`, có `sizes` theo biến thể.
- Touch target ≥44px: **OK** — chip `min-h-11`, input `h-11`, nút xoá lọc `min-h-11`, nút "Xem tất cả" `min-h-11` + vòng tròn `size-11`.
- Viewport/A11y: **OK** — không dùng `100vh`; "Xem tất cả" dùng `behavior:'auto'` khi `prefers-reduced-motion` (đã test); hover lift dùng `motion-safe:`.

## Skill gates
- aislop: skip, `aislop` không cài trên device/container.
- oxlint (anti-slop): skip, oxlint not configured (không có `.oxlintrc*`).
- ocr: skip, ocr not installed.
- semgrep: skip, không cài; soi tay — xem Security bên dưới.
- AI-readable: OK — tên rõ (`parseBlogParams`, `buildBlogQueryString`, `filterPosts`, `paginate`), hằng có tên (`BLOG_PAGE_SIZE`, `BLOG_FEATURED_COUNT`, `SEARCH_DEBOUNCE_MS`), file ≤172 dòng, hàm ≤50 dòng (trừ JSX return của `BlogListingContent` ~60 dòng markup — chấp nhận được), comment nêu WHY. 0 indicator đáng kể.
- ai-friendly-web: N/A cho task này (không đổi robots/sitemap/llms; canonical `/blog` giữ không query).
- blitzstrike: N/A (không phải STRICT).
- Karpathy surgical: OK — mọi thay đổi trace về Task 03; `BlogFilter.tsx` xoá vì đã thành dead code do chính task; bỏ `blog.intro` (orphan key, không còn dùng) hợp lệ; không drive-by refactor.
- Impeccable craft-floor: OK — contrast chữ trắng/teal tối, badge chữ `primary-active` trên `#e6f7f3`; shadow mềm có offset; states đủ (default/empty 0 bài/lọc rỗng/≤3 bài). Ghi chú: thẻ "NỔI BẬT" là eyebrow — bị craft-floor cấm theo mặc định nhưng **spec R-09a §3 + mockup yêu cầu rõ** → theo spec, không tính finding.

### Security
- `q` từ URL chỉ dùng làm `value` input (React escape) và so khớp `includes` — không XSS/không regex injection.
- `category` validate bằng `isBlogCategory` (whitelist 6 key); `page` qua `Number.isInteger && > 0`, kẹp trên ở `paginate`.
- URL ghi bằng `URLSearchParams` (encode) + `pathname` của next-intl → không open-redirect/không chèn path.

### Kiểm hành vi theo spec R-09a §Chi tiết hành vi
- `replace` + `scroll:false`: OK (`navigate`, debounce). Debounce 300ms: OK. Trim `q`, rỗng → bỏ: OK. Đổi chip/từ khoá → bỏ `page`: OK (`buildBlogQueryString` không giữ page). Category lạ → Tất cả: OK. Page kẹp [1, tổng]: OK, khối nổi bật dựa trên page đã kẹp. AND + bỏ dấu + `đ→d` + tiêu đề+tóm tắt: OK (`filter.ts:18-55`). Page size 12, nổi bật không tính vào 12: OK.
- Suspense/prerender: fallback = `BlogListingContent` với `DEFAULT_BLOG_PARAMS` và `withPagination={false}` → HTML tĩnh có nội dung, `Pagination` (dùng `useSearchParams`) chỉ ở nhánh có URL: OK. Nhánh `useSearchParams` bail-out CSR ở boundary nên không hydrate lên HTML fallback → không có hydration mismatch (builder: 0 console error; reviewer: 0 pageerror trong 6 kịch bản).
- Gõ chậm trong khi debounce ghi URL (mạng nhanh và chậm 600ms): input giữ nguyên đủ chữ — OK (cơ chế `lastWrittenQuery`).
- A11y: `role="group"` + `aria-label`, `aria-pressed`, label sr-only + `type="search"`, `role="status"` (+`aria-live` thừa nhưng vô hại), focus "Xem tất cả" → `h2#blog-latest-title` (tabIndex −1), ≤3 bài → focus thanh lọc: OK.
- i18n: parity key `blog` vi/en = 0 khác biệt; ICU plural `resultCount` hợp lệ.

## Verdict: ❌ FAIL

## Summary
Code gọn, đúng spec gần như toàn bộ, build/typecheck/lint PASS, responsive OK. Còn 1 race thật giữa timer debounce
cũ và điều hướng chip / "Xóa bộ lọc" khi điều hướng RSC chậm hơn thời gian còn lại của timer → URL bị ghi đè về
trạng thái cũ.

## Findings

### ✅ Good
- Tách hàm thuần `filter.ts` (parse/build/filter/paginate) dễ test; `BlogListing` lo state URL, card/featured thuần trình bày.
- Fallback Suspense có nội dung thật (SEO/LCP) và tránh `useSearchParams` trong fallback.
- Xử lý race "gõ trong lúc URL đang cập nhật" đúng (không ghi đè chữ đang gõ).

### ❌ Issues
- **[MAJOR-1] Timer debounce cũ ghi đè lựa chọn chip / "Xóa bộ lọc"** — `src/components/blog/BlogListing.tsx:78-86` (effect debounce) kết hợp `:65-68` (`navigate`) và `:94-97` (`clearFilters`).
  - Nguyên nhân: timer được đặt với `params.category`/`params.query` của lần render lúc đặt. `navigate()` không huỷ timer đang chờ; timer chỉ bị huỷ khi URL mới đã commit (params đổi → cleanup). Nếu điều hướng `router.replace` (fetch RSC) chậm hơn thời gian còn lại của timer, timer bắn `router.replace` với trạng thái cũ và Next ưu tiên navigation sau cùng → lựa chọn của user bị mất.
  - Tái hiện (Playwright, trễ request RSC):
    - B: gõ "ai" → sau 50ms bấm chip "Hướng dẫn", RSC +350ms (và +600ms) → URL cuối `/blog?q=ai`, chip active "Tất cả" (kỳ vọng `?category=guides&q=ai`). Mạng nhanh (không trễ) thì PASS.
    - C: mở `/vi/blog?category=trends&q=zzzz` → bấm "Xóa bộ lọc", RSC +350ms → URL cuối `/blog?category=trends`, chip "Xu hướng" vẫn active (kỳ vọng `/blog`). `clearFilters` gọi `setDraftQuery('')` → effect đặt timer mới với `params.category='trends'` cũ.
  - Fix đề xuất (chọn 1, nhỏ): (a) giữ timer trong `useRef`, `navigate()` gọi `clearTimeout(timerRef.current)`, và trong effect debounce bỏ qua khi `draftQuery.trim() === lastWrittenQuery.current` (đã ghi rồi); hoặc (b) timer đọc category mới nhất qua ref thay vì closure. Cân nhắc thêm: Next 15 hỗ trợ `window.history.replaceState` đồng bộ với `useSearchParams` → lọc thuần client, không round-trip RSC, loại luôn độ trễ. Thêm 1 kịch bản Playwright có trễ RSC vào `func.mjs` để chặn hồi quy.
- **[MINOR-1] Class `motion-safe:ease-out-expo` không sinh CSS** — `src/components/blog/BlogPostCard.tsx:41`. Token khai ở `tailwind.config.ts:86` dưới `transitionTimingFunction` với key `'ease-out-expo'` → class thật là `ease-ease-out-expo`; hover lift rơi về easing mặc định. Lỗi pattern có sẵn toàn repo (`Button`, `ListingCard`, `Header`, `Footer`, ...) → ngoài scope, đề xuất task riêng đổi key token thành `out-expo` (giống error-memory Error 7: class "trông đúng" nhưng không sinh).
- **[MINOR-2] Vòng focus của chip bị cắt mép trên/dưới** — `src/components/blog/BlogListing.tsx:119`: container `overflow-x-auto` (kéo theo overflow-y cắt) chỉ có `pb-0.5`, ring global `box-shadow 0 0 0 4px` bị cắt phẳng trên/dưới (vẫn thấy, nhưng không trọn). Fix: thêm `py-1` (hoặc `p-1` và bù `-m-1`) cho hàng chip.
- **[MINOR-3] Phân trang dùng `router.push` (thêm history + cuộn lên đầu trang)** — `src/components/ui/Pagination.tsx:31` (component shared, không đổi trong task). R-09a §URL ghi "Cập nhật URL bằng `replace` (không thêm history)" — đọc theo ngữ cảnh là cho lọc/tìm; task file chốt "Pagination không đổi hành vi". Ghi nhận để user xác nhận; không chặn.

## Verdict Reasoning
1 MAJOR (race có tái hiện, làm sai hành vi R-09a §URL/§Trạng thái khi mạng chậm) → theo luật PASS = 0 CRITICAL/MAJOR → **FAIL**.
Sau khi sửa MAJOR-1 (+ tuỳ chọn MINOR-2), round 2 chỉ cần chạy lại race test B/C với trễ RSC + typecheck/lint.

## Residual risk
- `npm run build` không chạy trên device; dựa vào build container (stub next/font Inter) — font thật chưa xác minh ở build.
- Không chạy aislop/oxlint/ocr/semgrep (chưa cài).
