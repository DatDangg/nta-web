Agent: reviewer

# Review: feature-blog-listing-redesign — phase-1-task-02 (round 1)

## Review level: NORMAL

## Reason
Task UI 1 trang (`/blog`, `/en/blog`): thay `PageHeader` bằng `ListingHero` có sẵn (thêm 1 consumer, KHÔNG sửa component dùng chung),
thêm 1 component trang trí `aria-hidden`, 4 key i18n, chỉnh wording spec. Không đụng auth/API/schema/shared service → không cần STRICT;
có UI + spec delta nên không FAST.

## Blast radius
- `src/app/[locale]/blog/page.tsx` → chỉ route `/blog`, `/en/blog` (metadata/JSON-LD giữ nguyên).
- `src/components/blog/BlogNewsVisual.tsx` (mới) — chỉ dùng ở blog page.
- `src/i18n/messages/{vi,en}.json` — chỉ thêm `blog.heroTitle/heroLead/heroAccent/heroDescription` (không đổi key cũ).
- `SPECIFICATIONS.md` R-09a §Tiêu đề, §Design — wording.
- `ListingHero`, `PageHeader` (about/contact), 4 trang danh sách khác: không đổi.
- Các file dirty khác trong `src/components/blog/` (BlogFilter/RelatedPosts/ShareBar) chỉ khác CRLF (`git diff --ignore-cr-at-eol` rỗng) → không thuộc task.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` (device) | PASS — `tsc --noEmit` không lỗi |
| `npx eslint src/app/[locale]/blog/page.tsx src/components/blog/BlogNewsVisual.tsx` (device) | PASS — 0 error/warning, exit 0 |
| `npm run build` | Không chạy trên device (node_modules Windows, không mạng). Builder: `next build` PASS ở bản container `/home/claude/nta`; reviewer xác minh md5 `BlogNewsVisual.tsx` + `blog/page.tsx` container == device |
| Kiểm CSS build (Error 7 — opacity modifier) | `bg-white/45`, `border-white/80`, `bg-white/20`, `border-white/70`, `bg-white/80`, `bg-white/90`, `aspect-[11/9]`, `max-w-[540px]`, `gap-[14%]`, `size-[15%]`, `drop-shadow-[…]`, `bg-[radial-gradient…]` đều có trong `.next/static/css` → không có class bị Tailwind bỏ im lặng (white không phải màu `var()`) |
| i18n parity | 4 key hero có đủ ở vi + en |
| Playwright (server `next start` :3100, font fallback do stub Inter) | `/blog` 375/1024/1280 + `/en/blog` 1024: scrollWidth == viewport, 0 console error. Builder: 390/768/1440 tương tự |
| DOM check 1440 (reducedMotion) | đúng 1 `h1` = "Tin tức & Cập nhật"; visual `aria-hidden="true"`; id SVG `blog-news-photo` duy nhất; `.listing-float` animation-duration = 0.01ms khi reduced-motion |
| So ảnh nền | `hero-waves.jpg` (38 674 B) vs `hero-background.png` (1.54 MB): cùng kích thước 1983×793, mean abs diff 0.72/255, max 40 → **cùng một ảnh** (bản JPEG nén lại), không bit-identical |

## Responsive Checklist Gate (375 / 768 / 1280 + 390/1024/1440)
- Layout — không horizontal scroll: **OK** (scrollWidth == viewport ở 375/390/768/1024/1280/1440). Mobile-first: **OK** (visual `hidden lg:block` trong ListingHero; grid hero `lg:grid-cols-[…]`). Container không fixed px: **OK** (visual `w-full max-w-[540px]`).
- Typography/Spacing: **OK** — h1/tagline dùng `clamp()` (ListingHero có sẵn); BlogNewsVisual không có chữ.
- Media: **OK** — nền qua `next/image` `fill` + `object-cover` `sizes="100vw"` (có sẵn); visual dùng `aspect-[11/9]`.
- Touch/Interaction: **OK** cho diff (không thêm phần tử tương tác). Ngoài scope: nút home của `Breadcrumb` pill `size-8` (32px < 44px) — component dùng chung có sẵn, đề xuất task riêng.
- Viewport/A11y: **OK** — không dùng `100vh`; reduced-motion tắt animation (rule global); không che lỗi bằng `overflow:hidden` (blob `-right-8 blur-3xl` không gây tràn — đã đo ở 1024).

## Skill gates
- aislop: skip, `aislop` chưa cài trên device.
- oxlint (anti-slop): skip, oxlint not configured (không có `.oxlintrc`).
- ocr (open-code-review): skip, ocr not installed.
- semgrep: skip, chưa cài; diff không có input người dùng/`dangerouslySetInnerHTML`/fetch → rủi ro bảo mật ~0.
- AI-readable: **OK** — 1 indicator nhẹ (helper `delay` lặp lần 3, xem MINOR-2); file 68 dòng, hàm < 50 dòng, comment nêu WHY/ý đồ minh hoạ.
- ai-friendly-web: **OK** — `public/llms.txt`, `src/app/robots.ts`, `src/app/sitemap.ts` có sẵn; task không đổi.
- blitzstrike: N/A (không phải task auth/API/input).

## UI craft-floor (impeccable)
- Contrast: tiêu đề `text-text-primary` trên nền sóng sáng + overlay trắng 72% bên trái → OK; mô tả `text-text-secondary` giữ nguyên như các trang danh sách đã duyệt.
- Shadow: offset + soft blur (`0_24px_60px_-20px`) → OK.
- Glass/blur & gradient text nằm trong refuse-list chung, nhưng ở đây là **yêu cầu brief** (mockup "tờ báo kính", nhấn teal) và đã là pattern được duyệt của `src/components/listing/*` → không tính vi phạm.
- Motion: 1 moment (pop-in + float), ease-out, có reduced-motion → OK.
- Không kicker/eyebrow, không section number, không emoji → OK.

## Surgical diff / Assumption check
- Mọi dòng trong `blog/page.tsx` trace về task (đổi hero, đưa danh sách vào `children` để chung nền sóng, gộp nhánh empty vào cùng wrapper). Không refactor ngoài scope.
- Giả định lớn (tái dùng ListingHero thay vì tạo BlogHero; không thêm asset; h1 = dòng 1) đã nêu rõ ở mục "Điều chỉnh so với plan đã duyệt" + cập nhật spec → không phải chọn thầm. Không over-engineer (ponytail OK).

## Verdict: ✅ PASS

## Summary
Hero `/blog` dùng lại `ListingHero` + minh hoạ CSS/SVG mới, khớp bố cục mockup 1440 (breadcrumb pill, tiêu đề + tagline nhấn teal, mô tả, visual phải),
không tràn ngang mọi mốc, 0 console error, typecheck/lint PASS, CSS build đủ class. Chỉ còn MINOR.

## Findings

### ✅ Good
- Tái dùng `ListingHero`/`hero-waves.jpg` thay vì tạo hero + asset 1.5 MB mới — đúng ponytail, đồng bộ 4 trang danh sách.
- Minh hoạ `aria-hidden`, không ảnh render sẵn, chỉ hiện `lg+`; SVG id duy nhất.
- Nhánh empty state vẫn giữ (nay nằm trong cùng container/nền sóng).

### Issues
- **[MINOR-1]** `SPECIFICATIONS.md:161` + `tasks/feature-blog-listing-redesign/phase-1-task-02.md:14` — ghi "trùng pixel" là không chính xác: hai file cùng ảnh, cùng 1983×793, nhưng JPEG nén lại (mean diff 0.72/255, max 40). Fix: đổi thành "cùng ảnh (bản JPEG đã nén 38KB của `hero-background.png`)".
- **[MINOR-2]** `src/components/blog/BlogNewsVisual.tsx:3,5` — `delay()` (bản thứ 3, sau `ListingHero.tsx:30`, `GlassVisual.tsx:31`) và hằng `GLASS` (trùng `GlassVisual.tsx:33`) bị copy. Fix gợi ý (không chặn): export `GLASS`/`delay` từ `src/components/listing/` và import lại; hoặc ghi nhận tech-debt.
- **[MINOR-3]** `SPECIFICATIONS.md:179-180` — spec delta bỏ ràng buộc "dùng design tokens, không hardcode màu mockup" đã chốt ở spec-validation round 1; `BlogNewsVisual` dùng hex cứng (`#5eead4`, `#2dd4bf`, `#0b9f8a`, `#9ff3e3`) — nhất quán với `listing/*` hiện có nên chấp nhận, nhưng là nới lỏng ràng buộc đã chốt → cần human xác nhận ở checkpoint (ghi `.context/decisions.md`).
- **[MINOR-4]** `src/i18n/messages/vi.json:158`, `en.json:158` — `blog.intro` thành key mồ côi (chỉ PageHeader cũ dùng). Fix: xoá key hoặc ghi rõ giữ lại cho task sau.
- **[MINOR-5]** Lệch có chủ đích so với mockup 1440: dòng 2 tiêu đề nhỏ hơn dòng 1 (mockup 2 dòng cùng cỡ); tấm kính ít nghiêng 3D hơn mockup và breadcrumb pill hiện icon nhà thay chữ "Trang chủ". Đã ghi trong task/spec; chỉ lưu ý để human duyệt visual ở checkpoint.

### 💡 Suggestions (ngoài scope, đề xuất task riêng)
- `Breadcrumb` pill: nút home 32×32px < 44px touch target (component dùng chung, có từ trước).

## Residual risk
- Screenshot dùng font fallback (Inter stub ở container) → chiều rộng chữ thực tế với Inter có thể khác chút; layout dùng `clamp()` + `minmax(0,…)` nên rủi ro tràn thấp.
- `next build` chỉ xác minh ở bản container (source trùng md5 với device).

## Verdict Reasoning
0 CRITICAL, 0 MAJOR; acceptance criteria đều đạt (h1 + tagline nhấn teal + breadcrumb pill; nền sóng dùng chung; visual `lg+` `aria-hidden`; không tràn 375–1440; 0 console error; vi/en đủ; typecheck/lint PASS, build PASS theo evidence). → PASS.
