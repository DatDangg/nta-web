Agent: reviewer

# Review — feature-ai-news-naming-images · phase-1-task-01 · round 1 (CR-038)

- **Review level:** NORMAL
- **Reason:** Diff chỉ gồm chuỗi i18n, comment, 1 prop + wrapper ở `ArticleHeader` (component trang blog). Không sửa `src/components/shared/Breadcrumb.tsx` (shared), không đụng API/DB/auth/schema. Đúng expected level trong task file.
- **Scope review:** `src/i18n/messages/vi.json`, `src/i18n/messages/en.json`, `src/components/blog/FeaturedPosts.tsx`, `src/components/blog/ArticleHeader.tsx`, `src/components/blog/blog-labels.test.ts` (mới), `docs/DESIGN.md`, task file. File task-02 trong working tree (tools/ai-news, public/images/blog, docs/runbook) **không review**.
- **Blast radius:** `/blog`, `/en/blog` (nhãn thẻ highlight); `/blog/[slug]`, `/en/blog/[slug]` (breadcrumb). `Breadcrumb.tsx` không đổi → AboutHero / DetailHero / ListingHero / PageHeader giữ nguyên giao diện.

## Requirements coverage (change doc §1, §4 + acceptance)

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| §1 nhãn vi "Nổi bật" → "Tin mới", en "Featured" → "Latest" | OK | diff `vi.json:226`, `en.json:226`; `highlightTitle`/`featuredLabel`/`viewAll` không đổi |
| Comment FeaturedPosts | OK | chỉ comment (3 chỗ), không đổi logic |
| §4 breadcrumb `/blog/[slug]` dùng `pill` | OK | `ArticleHeader.tsx:16` `variant="pill"`, cùng prop như `DetailHero.tsx:50` |
| A11y | OK (kế thừa) | `Breadcrumb.tsx:30` home `aria-label={t('home')}`, `:40` `aria-current="page"`, `:42` `Link` của `@/i18n/navigation` (đúng locale) |
| Trang khác không đổi | OK | `Breadcrumb.tsx` không có trong diff |
| Doc impact | OK | `docs/DESIGN.md:216` "thẻ NỔI BẬT" → "thẻ TIN MỚI" (as-built). Bảng component `DESIGN.md:154` chỉ ghi chung "Breadcrumb Default", không mô tả variant theo trang → không cần sửa thêm |

## Breadcrumb pill vs DetailHero / wrapper `[&_ol]:rounded-3xl`

- Tailwind `^3.4.18` (`package.json:38`): arbitrary variant `[&_ol]:` có từ 3.1 → sinh `.\[\&_ol\]\:rounded-3xl ol { border-radius: 1.5rem }`. Specificity (0,1,1) > `.rounded-full` (0,1,0) → override chắc chắn, không phụ thuộc thứ tự CSS. `content: ['./src/**/*.{js,ts,jsx,tsx,mdx}']` có quét file này. `borderRadius` của theme nằm trong `extend` (`tailwind.config.ts:13,65`) → `3xl` mặc định (1.5rem) vẫn còn.
- Math 1 dòng: `py-1.5` (12px) + nút home `size-8` (32px) + border 2px = 46px → nửa chiều cao 23px < 24px → vẫn là viên thuốc, nhìn giống DetailHero. Nhiều dòng: bo 24px thay vì hình bầu dục → hợp lý.
- Khác biệt so với DetailHero: DetailHero đặt pill trên nền `HeroWaves` teal; header blog nền trắng → `border-white/80` + `bg-white/75` gần như vô hình, chỉ còn shadow. Đúng giới hạn scope (không thêm hero), nhưng cần mắt người xác nhận (Residual risk).

## Tiêu đề dài (CSS math, không có browser)

- `ol`: `inline-flex max-w-full flex-wrap gap-y-1`; `li` là flex item, min-width auto = min-content (từ dài nhất) → tiêu đề wrap trong khung.
- 320px: header `px-4` → 288px; `ol` `px-4` + border → ~254px nội dung; home 32px + gap 10px + "Tin tức"/"Blog" + gap; mục tiêu đề rơi xuống dòng mới và wrap theo từ → không tràn ngang. 375/768/1280: rộng hơn, cùng kết luận.
- Ngoại lệ: chuỗi liền không khoảng trắng rất dài vẫn có thể tràn (Breadcrumb không có `break-words`) — có sẵn trong shared component, ngoài scope.

## Verify commands + result

| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — 0 error, 1 warning có sẵn `src/components/mdx/index.tsx:26` (no-img-element), không thuộc diff |
| `npm test` | 195 tests: 192 pass, 2 skipped, **1 fail**. 2 test mới `blog-labels.test.ts` PASS |
| `npm run build` | **Không chạy được trên host này**: `Failed to load next.config.ts` / `Error: Failed to load native binding` — lỗi môi trường (native binding Next/SWC trên Windows), xảy ra lúc load config, trước khi biên dịch code → không liên quan diff. Primary cần chạy build ở môi trường build được (vd `bash tools/linux-build.sh verify`) trước commit |

**Test fail `tools/db/content-rules.test.ts:25` — xác nhận có sẵn, không liên quan:**
test kiểm `existsSync(path.join("public", image))` cho mọi ảnh trong nội dung file. 9 path `/uploads/*.jpg|png` bị thiếu đều đến từ `src/content/blog/{vi,en}/ai-weekly-2026-w42.mdx` (commit `51193a0`, không có trong working tree diff). `public/uploads/` không có ở máy local (ảnh upload runtime). Task-01 không đụng nội dung blog → lỗi có sẵn, không do task này.

## Responsive Checklist Gate (diff đụng UI)

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Không horizontal scroll | OK (CSS math) | `max-w-full` + `flex-wrap`, xem phần tiêu đề dài; chưa đo `scrollWidth` trên browser |
| Mobile-first media query | N/A | diff không thêm media query |
| Grid auto-fit/minmax | N/A | không đổi grid |
| Container không fixed px | OK | không thêm width cố định |
| Font-size rem / heading clamp | N/A | không đổi typography |
| Media (ảnh/aspect-ratio/srcset) | N/A | không đổi ảnh |
| Touch target ≥44px | OK (kế thừa, như DetailHero) | home `size-8` (32px), link `min-h-8` — giống hệt DetailHero/ListingHero vốn đã PASS trước đây; không phải hồi quy mới của task |
| Nav mobile / table | N/A | |
| 100vh / reduced-motion / overflow:hidden | N/A | không thêm |

## Skill gates

- **aislop:** skip — không chạy `npx aislop` để tránh tải package; diff 4 dòng code + 1 test, không thấy slop pattern (không dead code, không swallowed error).
- **oxlint (anti-slop):** skip, oxlint not configured (không có `.oxlintrc*`).
- **ocr (open-code-review):** skip, ocr not installed.
- **AI-readable:** OK — 0 indicator đáng kể (comment JSX giải thích WHY + con số 24/44px có lý do).
- **ai-friendly-web:** N/A — task không đổi crawl/SEO surface.
- **blitzstrike:** N/A — không phải STRICT/nhạy cảm.
- **Surgical diff (karpathy):** OK — mọi dòng trace về §1/§4.

## Findings

- **[MINOR] Test thứ 2 giòn, giá trị thấp** — `src/components/blog/blog-labels.test.ts:16-18` regex trên source `ArticleHeader.tsx` (`[^>]*` sẽ gãy nếu props có `=>`/`>`; không kiểm hành vi thật như aria-label/aria-current). Comment dòng 6 "Repo chưa có hạ tầng render component" không chính xác: `src/components/mdx/news-image.test.ts:6,49` đã dùng `renderToStaticMarkup`. Có precedent đọc source (`src/app/[locale]/not-found.test.ts:11`) và render `Breadcrumb` cần mock next-intl + `@/i18n/navigation`, nên chấp nhận được cho task LOW. Đề xuất (không bắt buộc): sửa comment thành "render cần provider next-intl + navigation → kiểm qua source", hoặc thêm test render `Breadcrumb variant="pill"` bọc `NextIntlClientProvider` nếu Link render được ngoài Next. Test 1 (giá trị message) là change-detector nhẹ, chấp nhận.
- **[MINOR] Override bằng descendant selector vào nội bộ shared component** — `src/components/blog/ArticleHeader.tsx:15` `[&_ol]:rounded-3xl` phụ thuộc cấu trúc `<ol>` của `Breadcrumb.tsx:28`; nếu Breadcrumb đổi markup, override mất im lặng. Chấp nhận vì scope cho phép xử lý trong ArticleHeader và tránh STRICT. Nếu sau này trang khác cần cùng kiểu → chuyển thành prop opt-in của Breadcrumb.
- **[MINOR] Pill trên nền trắng gần như mất viền/nền** — `ArticleHeader.tsx:12` header không có nền màu; nhất quán "kiểu" với DetailHero nhưng độ nổi kém hơn. Cần xác nhận bằng mắt ở bước browser verify; nếu quá mờ, chỉnh trong ArticleHeader.

Không có CRITICAL/MAJOR.

## Residual risk

- Chưa kiểm browser 320/375/768/1280 (`scrollWidth`) và độ rõ pill trên nền trắng — primary làm ở bước verify browser theo task file.
- `npm run build` không chạy được trên host (native binding) — primary phải chạy build ở môi trường build được trước commit; build FAIL → không commit/push.
- `content-rules.test.ts` fail có sẵn (thiếu `public/uploads` local) — đề xuất task riêng (vd test skip ảnh `/uploads/` khi thư mục không tồn tại), ngoài scope.

## Verdict

✅ **PASS** (điều kiện: primary xác nhận `npm run build` PASS ở môi trường build được + kiểm browser trước commit).
