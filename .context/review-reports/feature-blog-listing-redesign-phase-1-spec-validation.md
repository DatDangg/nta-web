# Phase Review (spec-validation) — `blog-listing-redesign` phase 1

Agent: spec-validator · Ngày: 2026-10-13 · Chế độ: **Phase review** (built ≡ spec delta), round 1
Trạng thái phase: Task 01 `106acc3`, Task 02 `a90eecd` (đã commit); Task 03 chưa commit (reviewer round 2 PASS —
`.context/review-reports/feature-blog-listing-redesign-phase-1-task-03-round-2-review.md`).

## Verdict: ✅ PASS (✅ COMPLETE — không GAP chặn)

Mọi bullet của R-09 (ngày) + R-09a (kể cả "Chi tiết hành vi") đều đã build và khớp; có bằng chứng runtime.
Còn 3 điểm PARTIAL/MINOR và 1 điểm chờ user xác nhận (xem dưới). Không điểm nào chặn close-out.

## Phạm vi + bằng chứng
- Spec: `SPECIFICATIONS.md:130-186` (Module 7, spec_version 3.2.0); change doc `spec/changes/2026-10-13-blog-listing-redesign.md` (Acceptance :33-42, Quyết định :44-53).
- Code (device = container: md5 14 file khớp nhau): `src/lib/blog/{categories,filter}.ts`, `src/lib/format/date.ts`, `src/lib/content/posts.ts`,
  `src/content/types.ts:216-229`, `src/components/blog/{BlogListing,FeaturedPosts,BlogPostCard,BlogNewsVisual,ArticleHeader}.tsx`,
  `src/components/cards/PostCard.tsx`, `src/app/[locale]/blog/page.tsx`, `src/app/[locale]/blog/[slug]/page.tsx`, `src/i18n/messages/{vi,en}.json` (`blog.*`, 2 locale cùng key), `src/content/blog/{vi,en}/*.mdx`.
- Runtime: `next start :3100` (BUILD_ID 05:59, không có file `src` mới hơn build). `pw/func.mjs` (14 kịch bản), `pw/race.mjs` (B/C PASS),
  thêm probe riêng của validator (1440/768/390 × vi/en, detail page, history length, sitemap) — **0 console/page error**.
- Verify: `npm run typecheck` PASS · `npm run lint` 0 error (1 warning có sẵn `mdx/index.tsx`, ngoài phạm vi) — chạy lại ở container. Build: theo reviewer (BUILD_ID 05:59).
- Đối chiếu ảnh chụp 1440 `/blog` với `mockup-blog-listing.png`: bố cục hero / thanh lọc / khối nổi bật 3 cột / thẻ khớp; khác biệt chỉ là các điểm đã ghi lại (newsletter ẩn, breadcrumb icon nhà, h1 = dòng 1, ảnh bìa SVG có sẵn).

## Ma trận requirement ↔ implementation

| # | Requirement (SPECIFICATIONS.md) | Implementation | Status |
|---|---|---|---|
| 1 | R-09 ngày VI `08 Th10, 2026`, tháng không pad, ghép tay, ISO không lệch TZ; EN `Oct 8, 2026`; 1 util cho list + detail (:136-140) | `date.ts:10-14` (tách chuỗi ISO, EN `timeZone:'UTC'`); dùng ở `BlogPostCard.tsx:52`, `PostCard.tsx:21`, `ArticleHeader.tsx`. Runtime: `08 Th10, 2026`, `15 Th3, 2026`, `08 Th5, 2026`, EN `Oct 8, 2026`/`Mar 15, 2026`; detail `/blog/first-steps` "08 Th10, 2026", `datetime="2026-10-08"` | OK |
| 2 | Hero: nền sóng tối ưu, breadcrumb pill, tiêu đề 2 dòng có nhấn, mô tả, minh hoạ `aria-hidden` (:143-144, :158-162) | `blog/page.tsx:34-42` → `ListingHero` (`next/image` `priority` `hero-waves.jpg`, phục vụ qua `/_next/image` w=640/828/1920); `BlogNewsVisual.tsx` `aria-hidden`, ẩn dưới `lg`. Runtime: h1 duy nhất "Tin tức & Cập nhật"/"News & Updates", tagline "về AI và ứng dụng thực tiễn"/"on AI and real-world applications", breadcrumb Trang chủ › Tin tức | OK |
| 3 | 7 chip cố định, active nền primary, chip rỗng vẫn hiện (:145-148) | `BlogListing.tsx:110-137`, `categories.ts:4`. Runtime vi/en đủ 7 nhãn đúng thứ tự mockup; `?category=customer-stories` → empty + "Xóa bộ lọc" | OK |
| 4 | Khối nổi bật khi không lọc: 1 lớn (ảnh, badge, ngày, phút đọc, tiêu đề, tóm tắt, Đọc thêm) + ≤2 nhỏ + thẻ NỔI BẬT; thiếu bài co lại (:149-151) | `FeaturedPosts.tsx:49-71`, `BlogPostCard.tsx` variant `large/compact`; `if (!lead) return null`, `others.length===0` → thẻ NỔI BẬT về cột 3 | OK |
| 5 | Nút "Xem tất cả bài viết" cuộn tới mục 4 **và xoá bộ lọc** (:151) | `BlogListing.tsx:102-108` cuộn + focus `#blog-latest-title` (runtime: focus id đúng, scrollY 1117). Không gọi xoá lọc — xem P-1 | PARTIAL (MINOR) |
| 6 | Lưới "Bài viết mới nhất" 1/2/3/4 cột, bài còn lại sau nổi bật, rỗng → ẩn; lọc → ẩn nổi bật, lưới toàn kết quả (:152-153, :174) | `BlogListing.tsx:91-95, 160-172`; runtime cột lưới 1 (390) / 2 (768) / 4 (1440); 4 bài → nổi bật 3 + lưới 1 | OK |
| 7 | Danh mục = key cố định + nhãn i18n cho badge list + detail (:154-155) | `types.ts:216` union; 8 mdx đổi key đúng mapping (responsible-ai→ai-tech, digital-workflows→practical, learning-content→guides, first-steps→nta-news); badge `t('categories.<key>')` ở `BlogPostCard.tsx:47`, `PostCard.tsx:21`, `ArticleHeader.tsx:15` | OK |
| 8 | Phân trang 12; nổi bật chỉ trang 1, không tính vào 12; lọc 12/trang (:163-164) | `filter.ts:5-7, 57-61`; `BlogListing.tsx:92-95` (`showFeatured = !filtering && page === 1`, dùng page đã kẹp) | OK (runtime chỉ có 1 trang — xem R-1) |
| 9 | URL: Tất cả = không `category`; key lạ → Tất cả; `q` trim, rỗng bỏ; `page` kẹp; đổi lọc bỏ `page`; `replace`; debounce ~300ms; canonical không query (:165-167) | `filter.ts:23-41`, `BlogListing.tsx:65-89` (`history.replaceState`, 300ms). Runtime: `?category=bogus&page=99` → như mặc định; `/en/blog?q=%20%20` → như mặc định; `history.length` không tăng khi bấm chip; canonical `https://ntavietnam.tech/blog` | OK (P-2, P-3 MINOR) |
| 10 | Tìm kiếm AND với chip; tiêu đề + tóm tắt; trim/lowercase/NFD bỏ dấu/`đ→d`; chuỗi con (:168) | `filter.ts:18-20, 48-55`. Runtime: "du lieu" → "Chuẩn bị dữ liệu…"; `trends`+"du lieu" → rỗng; `nta-news`+"ai" → 1 bài; deep-link `?category=guides&q=noi%20dung` khôi phục ô tìm | OK |
| 11 | Thời gian đọc: token khoảng trắng body MDX, `ceil(/200)`, min 1; "N phút đọc"/"N min read" (:156, :169) | `posts.ts:8-14, 21`; i18n `readingTime`. Runtime mọi thẻ "1 phút đọc"/"1 min read" (body 100–184 token) | OK |
| 12 | Trạng thái: 0 bài → empty S10 thay phần dưới hero; lọc rỗng → "Không có bài viết phù hợp" + xoá lọc; ≤3 bài → ẩn mục 4, "Xem tất cả" cuộn tới thanh lọc (:170-171) | `blog/page.tsx:46-50`; `BlogListing.tsx:155-159`; `showAll` fallback `toolbarRef` (`:103`) khi không có heading mục 4 | OK (0 bài và ≤3 bài kiểm bằng code, không có dữ liệu runtime) |
| 13 | Responsive: nổi bật xl 3 cột / md–lg lớn full + 2 nhỏ 2 cột + NỔI BẬT full / base lớn→nhỏ→NỔI BẬT; chip cuộn ngang, không scroll ngang trang (:172-174) | `FeaturedPosts.tsx:55-68`. Runtime 1280: 3 cột x=32/553/938; 390: 1 cột theo thứ tự y 590→1082→1782; nhóm chip 390 `overflow-x:auto` scrollWidth 901 > clientWidth 344; `scrollWidth - innerWidth = 0` ở 390/768/1440 | OK |
| 14 | A11y: chip `button aria-pressed` trong `role="group"` có nhãn; search có label sr-only + `type="search"`; `role="status"` số kết quả; focus tới tiêu đề đích; reduced-motion; minh hoạ `aria-hidden` (:175-177) | `BlogListing.tsx:122-151, 105-107`; runtime nhãn group "Lọc theo danh mục", label "Tìm kiếm bài viết"/"Search articles", status "Có 1 bài viết"; chip cao ≥ 44px | OK |
| 15 | Kiểu `category` union; key lạ → build fail; bài liên quan = cùng key (:178) | `types.ts:216,223`; `posts.ts:18-20` throw; `[slug]/page.tsx:39` so sánh key → 4 bài khác key nên RelatedPosts ẩn (runtime `related:false`, đúng spec) | OK |
| 16 | Design: theo pattern `listing/*`; ảnh nền đã tối ưu, không thêm PNG 1.5MB (:179-180) | Dùng lại `hero-waves.jpg` (38KB); `git ls-files public` không có `hero-background.png`. Hex/rgb arbitrary theo pattern listing — `.context/decisions.md:49-52` | OK (chờ user xác nhận — U-1) |
| 17 | Blast radius: thẻ mới riêng; `PostCard` chỉ đổi nhãn badge + chuỗi ngày (:181-182) | `BlogPostCard.tsx` mới; diff `PostCard.tsx` chỉ có `useTranslations` + badge i18n; `ArticleHeader.tsx` chỉ đổi badge; bố cục detail giữ | OK |
| 18 | Ngoài phạm vi newsletter; BR-004 không bài/ảnh giả (:183) | Runtime không có "Đăng ký nhận tin"/"Subscribe"; dùng 4 bài + cover SVG có sẵn | OK |
| 19 | SEO/JSON-LD/sitemap không hồi quy | `/blog` title "Tin tức \| NTA"/"Blog \| NTA", BreadcrumbList giữ; detail BreadcrumbList + Article giữ; sitemap 10 URL blog, không URL có query | OK |
| 20 | i18n đủ vi/en cho chuỗi mới (Acceptance :38) | `blog.*` vi/en cùng bộ key (diff key rỗng); runtime EN đủ nhãn chip/hero/thẻ | OK |

## Doc reconcile (kiểm đã làm)

| Mục | Status | Ghi chú |
|---|---|---|
| `.context/design-spec.md` Screen 10 (:462-502) | OK | Layout, components, Data/URL, page size 12, states, responsive, a11y, copy vi/en, SEO (ghi gap JSON-LD `Blog` có từ trước). Wording `:476` ghi `router.replace` trong khi code dùng `history.replaceState` — cùng ngữ nghĩa replace, sửa chữ nếu muốn (MINOR). |
| design-spec Screen 11 (Copy) | OK | Ngày `08 Th10, 2026` / `Oct 8, 2026`; Badge = `blog.categories.<key>`. |
| design-spec §1.9 (:103) | OK | Đã thêm `BlogListing`, `FeaturedPosts`, `BlogPostCard`, `BlogNewsVisual`. |
| `docs/DESIGN.md` (Screen Tin tức/Blog + responsive) | OK | Components list + responsive desktop/large đã cập nhật. |
| `spec/test-scope/current.json` | OK | specVersion 3.2.0, scopeVersion 22, workItem `feature-blog-listing-redesign`, specRefs/changed/impact/acceptance khớp spec. |
| `src/lib/format/date.ts` docstring (:5-9) | OK | Đã cập nhật ví dụ mới. |

## Điểm còn lại (không chặn)
- **P-1 (MINOR, PARTIAL — req #5):** "Xem tất cả bài viết" không xoá lọc / không huỷ timer debounce (`BlogListing.tsx:102-108`). Vì khối nổi bật chỉ hiện khi KHÔNG lọc nên kết quả gần như tương đương; ngoại lệ: gõ từ khoá rồi bấm nút trong vòng 300ms → bộ lọc vẫn áp dụng sau khi cuộn. Đề xuất: `showAll` gọi `clearFilters()` trước khi cuộn, hoặc chỉnh spec :151 thành "cuộn tới mục 4" (bỏ "xoá bộ lọc" vì thừa).
- **P-2 (MINOR, req #9):** `Pagination` vẫn `router.push` (`src/components/ui/Pagination.tsx:31`, thêm history entry). Spec :167 "Cập nhật URL bằng `replace`" đặt trong ngữ cảnh lọc/tìm — nên ghi rõ "(chip/tìm kiếm; phân trang giữ `push` như các listing khác)" để tránh hiểu nhầm.
- **P-3 (MINOR, req #9):** deep-link `?q=%20%20` / `?category=bogus&page=99` giữ nguyên URL (hành vi = mặc định, đúng). Luật "rỗng → bỏ khỏi URL" chỉ áp dụng khi component ghi URL — chấp nhận được, ghi nhận.
- **R-1 (Residual risk):** chỉ có 4 bài nên không có runtime cho `page ≥ 2`, 0 bài, ≤3 bài; đã xác minh bằng đọc code (`filter.ts:57-61`, `BlogListing.tsx:92-108`, `blog/page.tsx:46`). Nên có unit test cho `paginate`/`filterPosts`/`parseBlogParams` khi có test runner.
- **U-1 (Chờ user xác nhận):** `.context/decisions.md:51-52` (màu hex/rgb arbitrary theo pattern listing, "Cần user xác nhận"). Change doc `:65` vẫn ghi "không hardcode màu mockup" và Acceptance `:35` vẫn nhắc `hero-background.png` — khi close-out cần cập nhật change doc theo spec :160-161, :179-180 + quyết định của user.

## Verdict Reasoning
- 20/20 requirement bullet có implementation; 19 OK, 1 PARTIAL MINOR (P-1); 0 MISSING; doc reconcile 6/6 đã làm.
- typecheck + lint PASS (validator chạy lại), build PASS (reviewer), runtime 0 lỗi console.
- → **✅ PASS / COMPLETE.** Close-out: xử lý P-1 (code 1 dòng hoặc chỉnh chữ spec), P-2 (chỉnh chữ spec), chốt U-1 với user.
