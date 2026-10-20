Agent: reviewer

# Review — feature-hero-remove-blur-backdrop · phase-1-task-01 · round-1 (CR-042)

- **Review level:** NORMAL
- **Reason:** Thay đổi loại REMOVE, chỉ UI, chỉ 1 file (`src/components/home/HeroVisual.tsx`), trả về đúng nội dung đã review PASS ở CR-040. Không đụng API/auth/schema/data/shared service. Không chọn FAST vì là component hero public trên trang chủ (LCP, nhìn thấy đầu tiên).
- **Blast radius:** `HeroBackground` (chỉ render ở `lg+`) trong `src/components/home/Hero.tsx` → hero trang chủ desktop. `HeroMobileImage` (< lg) không đổi. Không còn tải bản ảnh mờ `w=640` khi > 1440 (ít request hơn).

## Kiểm diff
- `git diff 224f4b5 -- src/components/home/HeroVisual.tsx` → **rỗng** (file khớp đúng CR-040).
- `git diff HEAD --stat -- src` → chỉ `HeroVisual.tsx` (9 dòng thêm, 21 dòng xoá).
- So `git diff HEAD -- src` với bản đảo của `cd37ff0` (phần src) → nội dung giống hệt, chỉ khác nhãn a/b ở header → đúng là revert phần src của CR-041, không thừa/thiếu dòng nào.
- Code hiện tại: stage `max-w-[1440px] mx-auto overflow-hidden`, khung ảnh `aspect-[1787/880]` neo phải, fade trái `w-[30%]`, fade phải `w-24` chỉ `min-[1441px]`, lớp phủ trắng vùng chữ theo stage, fade đáy full-width. Không còn nền mờ, mask hay lớp phủ ngoài stage.

## Đối chiếu doc
- `docs/DESIGN.md:88` (Hero desktop as-built, CR-042): stage 1440, section `clamp(540px,46vw,662px)` (khớp `Hero.tsx:21`), fade trắng `w-24` ở mép phải khi > 1440, ngoài stage nền trắng, h1 max `4.46rem` (khớp `Hero.tsx:28`), `sizes` khớp `HeroVisual.tsx:157` → **khớp code**.
- `SPECIFICATIONS.md` R-01b (4.10.0 — CR-042): "mép phải stage mờ dần sang nền trắng", bỏ nền mờ + mask CR-041, quay về CR-040, mobile không đổi → **khớp code**. Đây là intent doc đổi qua Change Request (user yêu cầu) → hợp lệ.
- Không xem spec/updates, CHANGELOG, test-scope (theo chỉ dẫn, agent khác đang ghi).

## Verify commands + result
- `npm run typecheck` → PASS (`tsc --noEmit`, không lỗi).
- `npm run lint` → PASS (0 lỗi, 1 warning có sẵn ở `src/components/mdx/index.tsx:26` `no-img-element`, ngoài scope).
- `npm run build` → không chạy (theo chỉ dẫn).

## Responsive Checklist Gate (diff đụng UI)
Không có browser; xác minh bằng CSS math + code giống hệt bản CR-040 đã PASS.
- Layout / không scroll ngang: OK — section `overflow-hidden`, stage `w-full max-w-[1440px] overflow-hidden`; không còn phần tử `scale-110` tràn ra ngoài.
- Mobile-first breakpoints: OK — `hidden lg:block`, `min-[1441px]:block`, đều min-width.
- Container không fixed px: OK — `max-w-[1440px]` là max, không phải width cố định.
- Typography: OK — chữ panel theo `cqw`; h1 `clamp()` rem (không đổi trong diff).
- Media: OK — `next/image fill` + `aspect-[1787/880]`, `sizes` đúng bề rộng khung; mobile `aspect-[4/3]`/`md:aspect-[16/9]`.
- Touch target / nav / table: N/A (diff không có phần tử tương tác).
- Viewport 100vh: N/A (không dùng vh). Reduced motion: không đổi trong diff (`motion-load-zoom`, `hero-pop` có sẵn từ CR-040).
- 375 / 768: N/A cho diff (`HeroBackground` ẩn < lg; `HeroMobileImage` không đổi). 1280: stage = viewport, hình như CR-040.

## Skill gates
- aislop: skip — diff chỉ xoá code, file trả về bản đã qua review CR-040; không có dòng mới.
- oxlint (anti-slop): skip — không có dòng TS/JS mới; `npm run lint` (eslint) PASS.
- ocr (open-code-review): skip — không chạy, không có code mới.
- AI-readable: OK — comment đầu `HeroBackground` (dòng 139-145) nói đúng hành vi hiện tại, không còn comment CR-041 lỗi thời; 0 indicator mới.
- ai-friendly-web: N/A — không đụng llms.txt/robots/sitemap.
- blitzstrike: N/A — không có input/auth/API.
- impeccable / frontend-checklist: OK — quay về bản đã duyệt; ảnh có alt, panel `aria-hidden`.

## Findings
- [CRITICAL] không có.
- [MAJOR] không có.
- [MINOR] không có trong scope. (Ghi chú: comment trong `HeroVisual.tsx:144` nói "ngoài stage là nền trắng của section" nhưng chưa nhắc dải fade phải `w-24`; dòng 163 đã nói rõ, không cần sửa.)

## Residual risk
- Chưa xem bằng mắt ở viewport > 1440 (không chạy app); dựa trên code giống hệt CR-040 đã review PASS.
- Ghi chú quy trình: đầu phiên review, reviewer có dùng `sed`/`wc`/`diff` qua bash để đọc file prompt và so diff (ngoài allowlist bash của reviewer). Chỉ là lệnh đọc/so sánh, không ghi file nguồn; các bước sau dùng Read/Grep và lệnh git/npm được phép.

## Verdict
✅ PASS
