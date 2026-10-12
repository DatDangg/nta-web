Agent: reviewer

# Review — `change-replace-placeholder-images` · Phase 1 · Task 04 · Round 1

- **Task:** `tasks/change-replace-placeholder-images/phase-1-task-04.md`
- **Nguồn:** `spec/changes/2026-10-12-replace-remaining-placeholder-images.md` (§3 #5/#6, §4, §5-T04)
- **Repo / branch:** `D:\prj\nta-web` · `main` (working tree, CHƯA commit)
- **Ngày review:** 2026-10-12
- **Round:** 1

---

## Review level

**NORMAL**

## Reason

- Task tự khai **NORMAL**; diff chỉ đụng **content** (`src/content/home.ts`, 4 `.mdx`, `src/i18n/messages/{vi,en}.json`) + **khung ảnh** của 2 component (`cardStyles.ts`, `ProductCard.tsx`, `ScreenshotCarousel.tsx`) — không chạm auth/RBAC, tenant/org, DB/schema/migration, API contract/DTO, payment, cron/webhook, security/token/upload.
- Điểm cần cân nhắc: `cardStyles.ts` là module **cards dùng chung** (đỏ-risk "shared component") và `ScreenshotCarousel` là component. Tuy nhiên:
  - Thay đổi trong `cardStyles.ts` là **thuần additive** — chỉ **thêm** export `cardPosterImageClass`; `cardImageClass` (line 2) giữ nguyên byte-for-byte ⇒ `SolutionCard`/`CaseStudyCard`/`AppCard` **không đổi hành vi**.
  - `ScreenshotCarousel` **chỉ** được dùng bởi `/products` (grep xác nhận — xem dưới) ⇒ blast radius thực tế hẹp.
- Kết luận: giữ **NORMAL** (đúng rule "additive-only + single-consumer"). Ghi nhận trigger "shared" tồn tại về mặt kỹ thuật nhưng không nâng STRICT vì không có thay đổi hành vi shared.

---

## Blast radius

| Khu vực | Ảnh hưởng |
|---|---|
| `/` (trang chủ) VI+EN | 2 thẻ sản phẩm (`featuredProducts`) — ảnh + khung `cardPosterImageClass` (9/16) + alt |
| `/products` VI+EN | `ScreenshotCarousel` khung `16/10`+`xl:4/5` → `9/16`; alt qua i18n `products.screenshotAlt` |
| `src/components/cards/cardStyles.ts` | +1 export mới; các export cũ không đổi |
| Consumers khác của `cardImageClass` | `SolutionCard`, `CaseStudyCard`, `AppCard` — **không đổi** (không import `cardPosterImageClass`) |
| Assets | `public/images/products/` — xoá 2 SVG preview, thêm 2 ảnh mới |

`ScreenshotCarousel` consumer: chỉ `src/app/[locale]/products/page.tsx:6` (import) + `:55` (render) — không nơi khác.

---

## Verify commands + result

| Command | Kết quả |
|---|---|
| `npm run lint` | **skip — shell bị permission deny** trong session review (`Permission denied: shell`). Không chạy lại được. Builder khai PASS (0 errors / 1 warning pre-existing) — **reviewer CHƯA xác minh độc lập**. |
| `npm run typecheck` | **skip — shell bị permission deny** (như trên). |
| `npm run build` | **skip — shell bị permission deny** (như trên). |
| `check-left-align` | **skip, no script trong repo** (task đã ghi nhận). |
| Bằng chứng HTML `.next/server/app/*.html` | **không tự kiểm** (shell deny). Builder khai render `ai-music-app.png` + `hair-style-ai.jpg` + class `aspect-[9/16]`. |

> Ghi chú: rule Tool Loop Guard — shell bị deny ⇒ **dừng ngay**, không retry. Xác minh thay thế bằng đọc source (Read/Grep) trong phạm vi cap NORMAL.

### Kiểm chứng qua source (thay cho shell)

- ✅ **Wiring đủ 4 chỗ:** `home.ts:17,18` (vi) + `:29,30` (en) dùng `ai-music-app.png` / `hair-style-ai.jpg`; 4 `.mdx` (`vi|en/music-app.mdx:6`, `vi|en/hair-style-ai.mdx:6`) cùng ảnh mới.
- ✅ **`cardImageClass` KHÔNG sửa** — `cardStyles.ts:2` vẫn `aspect-[16/10] ...`; grep `cardImageClass` cho thấy `SolutionCard:56,58`, `CaseStudyCard:19`, `AppCard:19` vẫn dùng class này ⇒ không regression.
- ✅ **`cardPosterImageClass`** = `aspect-[9/16] w-full rounded-lg bg-surface-sunken object-cover` (`cardStyles.ts:11`) — dùng ở `ProductCard.tsx:17`.
- ✅ **Tỉ lệ khớp ảnh:** 941/1672 = 0.5628 ≈ 9/16 = 0.5625; `ProductCard` truyền `width={900} height={1600}` (900/1600 = 0.5625) ⇒ `object-cover` trong khung 9/16 **không crop / không distort**.
- ✅ **`ScreenshotCarousel`**: khung `aspect-[9/16]` ở cả nhánh ảnh (`:66`) và nhánh placeholder lỗi (`:64`).
- ✅ **Alt prefix đúng ngôn ngữ, không mojibake:** `home.ts` vi `"Giao diện minh hoạ — …"` (2 thẻ), en `"Illustrative interface — …"`; i18n `vi.json:123` `"Giao diện minh hoạ — {title}"`, `en.json:123` `"Illustrative interface — {title}"`; `products/page.tsx:53,57` truyền `{ title: product.title }`.
- ✅ **Không còn ref SVG cũ:** grep `music-app-preview|hair-style-ai-preview` trong `src` = 0 match.
- ✅ **Assets tồn tại + SVG cũ đã xoá:** `glob public/images/products/*` chỉ còn `hair-style-ai.jpg` + `ai-music-app.png`.
- ✅ **`AppCard` fallback không dùng ở `/products`:** `AppCard` (`products/page.tsx:52`) nhận `media` = `<ScreenshotCarousel>` (`:55`); fallback `cardImageClass` (`AppCard.tsx:19`) chỉ chạy khi `media` falsy ⇒ không render ở `/products`. (Xác minh bằng suy luận từ grep, xem Residual risk.)

---

## Responsive Checklist Gate

Diff đụng UI (`ProductCard.tsx`, `cardStyles.ts`, `ScreenshotCarousel.tsx`) ⇒ gate **áp dụng**. Breakpoints: `640/768/1024/1280/1536` (`.context/project-config.md`); mốc kiểm mặc định 375 / 768 / 1280. Không có môi trường browser ⇒ xác minh bằng **CSS math**.

### Layout
- ✅ **OK — no horizontal scroll:** `ProductCard` ảnh `w-full` (không fixed px); `ScreenshotCarousel` dùng `overflow-x-auto` trên container riêng (carousel cuộn ngang *có chủ đích*, không đẩy overflow ra document — `ScreenshotCarousel.tsx:60`).
- ✅ **OK — mobile-first (`min-width` media query):** class dùng tiền tố Tailwind `md:`/`lg:`/`xl:` (`ScreenshotCarousel.tsx:62`, `:66`); không có `max-width` query ngược.
- ✅ **N/A — grid auto-fit/minmax:** diff không đổi grid; khung ảnh `w-full` bám container.
- ✅ **OK — container không fixed `px`:** không thêm width cố định.

### Typography / Spacing
- ✅ **N/A** — không đổi font-size / heading / spacing trong diff.

### Media
- ✅ **OK — `aspect-ratio` + không tràn:** ảnh có khung `aspect-[9/16]` + `w-full`; `object-cover` (khung = tỉ lệ ảnh ⇒ không crop).
- ✅ **OK — srcset/sizes:** dùng `next/image` (sinh `srcset`), có `sizes` (`ProductCard.tsx:17`, `ScreenshotCarousel.tsx:66`).
- ✅ **N/A** — không có video/embed trong diff.

### Touch / Interaction
- ✅ **OK — touch target ≥ 44×44px:** nút carousel `min-h-11 min-w-11` (=44px) (`ScreenshotCarousel.tsx:73,74,83`).
- ✅ **N/A** — không đổi nav/hamburger.
- ✅ **N/A** — không có table.

### Viewport / A11y
- ✅ **OK — không `100vh` trần:** không dùng.
- ✅ **OK — `prefers-reduced-motion`:** carousel `motion-reduce:snap-none motion-reduce:scroll-auto` + behavior `instant` (`ScreenshotCarousel.tsx:35,60`); `cardLinkClass` dùng `motion-safe:` (`cardStyles.ts:1`).
- ✅ **OK — không che lỗi bằng `overflow:hidden`:** khung poster dùng `aspect` + `object-cover`; nhánh lỗi ảnh vẫn render placeholder có `role="img"` (`ScreenshotCarousel.tsx:64`).

**Responsive gate verdict: OK** (xác minh bằng CSS math; browser không khả dụng → xem Residual risk).

> Quan sát (không tính FAIL): poster 9/16 trên mobile 375px ⇒ thẻ sản phẩm cao (~343px rộng → ~610px cao). Là hệ quả của quyết định user-chốt khung theo poster; chấp nhận được.

---

## Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| `aislop scan --changes` | **skip — shell permission denied** (không chạy được). | — |
| `npx oxlint` (anti-slop) | **skip — shell permission denied**; chưa xác minh được repo có oxlint config. | — |
| `ocr` (open-code-review) | **skip — shell permission denied** / chưa xác minh cài đặt. Không chặn PASS. | — |
| AI-readable-codebase | **OK** | Tên self-descriptive (`cardPosterImageClass`); file ≤300 dòng (`cardStyles.ts` 29, `ProductCard.tsx` 22, `ScreenshotCarousel.tsx` 94); hàm ≤50 dòng; comment nêu **WHY** (user-chốt) không phải WHAT. 2 nit nhỏ ghi ở Findings (không đủ 3 indicator để FAIL). |
| ai-friendly-web | **N/A** | Diff không đụng `llms.txt`/`robots.txt`/`sitemap.xml`; đây là task thay nội dung/ảnh, không phải task deploy/cấu trúc web public. |
| blitzstrike (pentest) | **N/A** | Task không thuộc nhóm STRICT nhạy cảm (không auth/API public/input mới). |

---

## Findings

### [MINOR] Import `CARD_IMAGE_RATIO` không dùng (dead code) — `src/components/cards/ProductCard.tsx:3`
`ProductCard` import `CARD_IMAGE_RATIO` nhưng trong file (22 dòng) **không** tham chiếu — `:17` dùng literal `width={900} height={1600}`. Đây là dead import.
- Hệ quả: nếu eslint config bật `@typescript-eslint/no-unused-vars` (vd `next/typescript`), lint sẽ **error** ⇒ mâu thuẫn claim "lint PASS" của builder → khi đó phải coi là **verification-integrity issue**. Không xác minh được config (shell deny).
- Fix đề xuất: bỏ `CARD_IMAGE_RATIO` khỏi import; hoặc (tốt hơn) thêm hằng `CARD_POSTER_IMAGE_RATIO = { width: 900, height: 1600 }` vào `cardStyles.ts` và dùng thay 2 literal — vừa hết dead import vừa hết magic number.

### [MINOR] Magic number lặp — `ProductCard.tsx:17` và `ScreenshotCarousel.tsx:66`
`width={900} height={1600}` hardcode 2 nơi (đúng 9/16). Nên đưa về hằng chung cạnh `cardPosterImageClass` để tránh lệch khi đổi khung về sau.

### [MINOR] Comment stale — `src/components/cards/cardStyles.ts:16-17`
Comment của `cardShotFrameClass` viết "…`cardImageClass` dùng `object-cover` cho ảnh SVG phẳng của **thẻ sản phẩm** / case study." Sau task này thẻ sản phẩm (`ProductCard`) **không còn** dùng `cardImageClass` ⇒ comment đã lệch thực tế. Fix: sửa còn "case study / card khác".

### [MINOR/ngoài scope] `sizes` nhỏ hơn bề rộng slide thực — `src/components/products/ScreenshotCarousel.tsx:66`
Slide là `lg:w-1/3` (~33vw, `:62`) nhưng `sizes` khai `(min-width: 1024px) 17vw` ⇒ browser chọn ảnh nhỏ hơn cần thiết → ảnh có thể **hơi mờ** ở desktop lớn. Nghi vấn **có sẵn từ trước** (không thuộc dòng task này đổi), reviewer không xác minh được pre-existing (shell deny nên không xem `git diff`/blame). Đề xuất: **task riêng** sửa `sizes` cho khớp `33vw` (hoặc dùng `w-1/2`/`w-1/3` đồng bộ). Không tính FAIL cho phase này.

### [MINOR/doc] Sai lệch tên file trong task — `tasks/.../phase-1-task-04.md:15`
Mục "Blocked" ghi `public/images/products/ai-music-app.jpg` nhưng thực tế là `ai-music-app.png` (giữ PNG để không re-encode — đã ghi ở Feature Verification `:66`). Chỉ là doc nit.

### Ghi nhận (không phải defect)
- AC trong task (`:50` "khung 16/10 đều nhau") đã bị **user override** (chốt khung 9/16 để không mất chữ — task Feature Verification `:65`, spec §3 #10) ⇒ AC này **superseded**, không tính FAIL.
- `AppCard` fallback vẫn dùng `cardImageClass` (16/10) — chấp nhận được vì `media` luôn có ở `/products`; nếu tương lai có nơi render `AppCard` không `media` thì khung 16/10 sẽ lệch với poster 9/16 → cân nhắc khi mở rộng.

---

## Residual risk (chưa xác minh được trong session)

1. **Verify commands (lint/typecheck/build) chưa chạy lại độc lập** — shell bị permission deny. Dựa trên đọc source, thay đổi hợp lệ và nhất quán, nhưng không tự chứng minh build xanh.
2. **eslint có flag unused-import hay không** — quyết định `[MINOR]` #1 có phải **MAJOR** (build fail) hay không. Cần chạy `npm run lint` / xem `eslint.config.*`.
3. **`src/components/shared/HomeImage.tsx`** chưa đọc (hết cap tool đọc) — suy luận HomeImage là wrapper `next/image` generic (đã dùng sẵn ở `ProductCard` trước đó), việc đổi `className` + `width/height` không gây distortion; chưa kiểm trực tiếp.
4. **`src/app/[locale]/products/page.tsx`** chưa đọc toàn văn — xác nhận `media` luôn được truyền cho `AppCard` bằng suy luận từ grep (`:52` AppCard, `:53` imageAlt, `:55` ScreenshotCarousel), chưa thấy trực tiếp khối JSX.
5. **Magic bytes ảnh** (`.jpg` là JPEG, `.png` là PNG) chưa kiểm (shell deny) — chỉ xác nhận tồn tại + phần mở rộng khớp qua `glob`.
6. **Layout thực tế trình duyệt** ở 375/768/1280 chưa xem (không có browser) — gate chạy bằng CSS math; poster 9/16 trên mobile cao, nhưng đúng quyết định thiết kế.
7. **Ref SVG preview cũ ngoài `src`** (docs/scripts) không grep repo-wide (hết cap) — trong `src` = 0 ref.

---

## Verdict

✅ **PASS**

- Không có **CRITICAL/MAJOR**; chỉ có 4 finding **MINOR** (dead import, magic number, comment stale, doc nit) + 1 quan sát ngoài scope (`sizes`).
- Wiring 4 chỗ + alt prefix VI/EN + khung 9/16 + `cardImageClass` không đổi + xoá SVG cũ — **đã kiểm chứng qua source**.
- Đây **không phải bug task** ⇒ điều kiện "repro PASS" không áp dụng.
- Builder **nên** dọn finding `[MINOR]` #1 (bỏ import `CARD_IMAGE_RATIO` / dùng hằng) trước khi close-out; nếu không, ghi nhận vào residual risk và có thể xử lý ở task dọn dẹp riêng.
- **Không commit/push** (Reviewer chỉ ghi report; user/primary quyết định).
