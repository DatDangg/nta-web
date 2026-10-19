# feature-home-layout-alignment · phase-1-task-02 — Hero desktop trong stage 1440 căn giữa

- **CR:** CR-040 · spec **R-01b** (4.8.0), giữ R-01, R-22 (LCP)
- **Status:** done (2026-10-19) · attempt 2 · reviewer round 1 FAIL (MAJOR overflow zoom) → round 2 PASS (NORMAL)
- **Classification / Risk:** MODIFY (UI-only) · **LOW–MEDIUM**
  - Expected review level: **NORMAL** (chỉ trang chủ, chỉ `lg+`; có rủi ro thẩm mỹ + LCP ảnh hero).
  - Blast radius: `HeroVisual.tsx` (`HeroBackground`), `Hero.tsx` (class chiều cao section). `HeroMobileImage` (< lg) **không đổi**.
  - Doc impact: `docs/DESIGN.md` current-state hero — as-built.
- **Deps:** task 01 (để đo chung một khung).

## Hiện trạng (đọc code)
- Section `lg:h-[clamp(540px,46vw,820px)]`; khung ảnh `absolute inset-y-0 right-0 aspect-[1787/880] h-full` → rộng = h × 2,03.
  - 1440: h 662 → ảnh x 95–1440 (dính mép phải viewport); panel ngoài cùng phải tới ≈ x1406.
  - 1920: h 820 → ảnh x 255–1920; panel phải tới ≈ x1878, trong khi chữ bắt đầu x352 và mép khung nội dung phải = 1568 → lệch hẳn sang phải.
- Lớp phủ trắng `absolute inset-0` theo bề rộng **section** (0–56% viewport), không theo ảnh.

## Scope
1. `HeroBackground`: bọc nội dung hiện tại trong stage `relative mx-auto h-full w-full max-w-[1440px]` (vẫn trong lớp
   `absolute inset-0 -z-10 hidden lg:block`). Khung ảnh `right-0` + lớp phủ trắng + mờ đáy chuyển vào **trong stage** → ≤ 1440 hình ảnh y hệt hiện tại.
2. Viewport > 1440: thêm dải fade mép phải stage (vd `absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent`,
   chỉ hiện `min-[1441px]:block`), để ảnh không cắt cứng; ngoài stage là nền trắng của section.
3. `Hero.tsx:21`: `lg:h-[clamp(540px,46vw,820px)]` → `lg:h-[clamp(540px,46vw,662px)]` (662 = 46% × 1440) → tỉ lệ chữ ↔ ảnh ở mọi màn > 1440 như ở 1440.
4. `sizes` ảnh nền: `(min-width: 1024px) 120vw` → giá trị khớp bề rộng thật (vd `(min-width: 1440px) 1345px, (min-width: 1024px) 94vw`)
   để không tải ảnh quá lớn ở 1920+; giữ `priority`.
5. Kiểm h1 `clamp(...,5.75rem)` ở 1920 trong cột chữ `xl:max-w-[44%]`: không vỡ dòng xấu, không đè panel; nếu đè → cap max h1 bằng giá trị ở 1440 (~4.45rem)
   và ghi lý do trong Evidence.

6. (Từ review task 01 — F1 Low) `src/components/home/HomeProductCard.tsx:25`: `sizes` mặc định nhánh carousel (> 3 thẻ) `508px` → khớp thẻ ½ dải trong khung 1216 (≈ 596px → `600px`).

## Verify
- typecheck / lint / build như task 01.
- Ảnh chụp 1024/1280/1440/1920/2560 vi + en: ≤ 1440 giống trước (so ảnh), > 1440 ảnh không chạm mép phải viewport, panel không đè chữ,
  mép trái chữ hero = mép khung chung (≤ 2px). 375/768: không đổi.
- Không thanh cuộn ngang 1024–2560.

## Retry / Escalation
- Max 3 attempt; FAIL lần 3 → `architecture_review_needed`.

## Evidence
_(builder, 2026-10-19, attempt 1)_

### Thay đổi
- `src/components/home/HeroVisual.tsx` `HeroBackground`: khung ảnh `right-0` + panel + lớp phủ trắng gradient bọc trong stage `relative mx-auto h-full w-full max-w-[1440px]`. Thêm dải fade `absolute inset-y-0 right-0 hidden w-24 bg-gradient-to-l from-white min-[1441px]:block` **trong khung ảnh, trước lớp panel** (để fade ảnh mà không làm mờ panel "Giải pháp & ứng dụng" nằm sát mép phải khung). `sizes` ảnh nền `(min-width: 1024px) 120vw, 1px` → `(min-width: 1440px) 1345px, (min-width: 1174px) 94vw, (min-width: 1024px) 1097px, 1px` (1174 = điểm 46vw = 540; dưới đó khung cố định 540×2.03 = 1097px; `1px` dưới lg giữ nguyên vì ảnh nền ẩn). Giữ `priority`.
  - **Mờ đáy giữ full-width section** (ngoài stage): ngoài stage vốn nền trắng nên kết quả như nhau, và full-width không tạo mép dọc ở cạnh stage.
- `src/components/home/Hero.tsx`: `lg:h-[clamp(540px,46vw,820px)]` → `662px`; h1 `clamp(2.5rem,0.5rem+4.4vw,5.75rem)` → max `4.46rem` (= đúng cỡ ở 1440: 0.5rem + 4.4×14.4px = 71.36px). Comment section cập nhật (không còn "full-bleed").
  - **Lý do cap h1:** đo ở 1920 trước khi cap: h1 92px, 4 dòng, cao 394px, top 128 trong section 662; không đè panel (h1 right 887 < panel left 947) nhưng khối chữ to hơn 29% trong khi ảnh/section đã dừng ở 1440 → lệch tỉ lệ chữ ↔ ảnh, chữ "solutions for" sát panel 60px, khối chữ gần chạm trên/dưới. Cap → ở mọi viewport > 1440 hero giống hệt 1440 (chỉ dời giữa). ≤ 1440 không đổi (công thức cho ≤ 4.46rem).
- `src/components/home/HomeProductCard.tsx:25`: `imageSizes` mặc định lg `508px` → `600px` (F1 task 01); comment prop cập nhật.
- `docs/DESIGN.md` §Trang chủ: thêm dòng as-built "Hero desktop (R-01b, CR-040)".

### Verify
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS (0 error, 1 warning có sẵn `src/components/mdx/index.tsx:26`, ngoài scope) |
| `npm test` | 199 · 196 pass · 1 fail **có sẵn, ngoài scope** (`tools/db/content-rules.test.ts` "ảnh tồn tại" — thiếu `public/uploads` local), y hệt task 01 |
| `docker build --target builder -t nta-web-buildcheck:tmp .` | PASS (`✓ Compiled successfully`, `✓ Generating static pages (9/9)`), chạy 2 lần (trước/sau cap h1) → `docker rmi` đã xoá |

### Đo DOM (next start trong image builder, CONTENT_SOURCE=file, Edge headless + `scripts/screenshots/cdp.mjs`, scrollbar ẩn, reduced-motion, Accept-Language vi cho `/` → `lang=vi`, en cho `/en`)
vi và en cho **số giống hệt nhau** ở lg+ (chỉ khác chiều cao chữ ở 375 do dòng). Đơn vị px.

| W | h1 left | tiêu đề giải pháp / sản phẩm / case left | h1 font | section hero cao | khung ảnh l–r | (W+1440)/2 | fade phải | panel l–r | chữ (h1/mô tả/CTA) right max | giao panel×chữ | scrollW/clientW |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 375 | 16 | 16/16/16 | 40 | 747.5 (en 789.5) | ẩn | – | ẩn | – | 359 | – | 375/375 |
| 768 | 24 | 24/24/24 | 41.8 | 809 | ẩn | – | ẩn | – | 744 | – | 768/768 |
| 1024 | 32 | 32/32/32 | 53.1 | 540 | −72.6–1024 | – | ẩn | 426.4–996.6 | 416 | không | 1024/1024 |
| 1280 | 32 | 32/32/32 | 64.3 | 588.8 | 84.3–1280 | – | ẩn | 628.4–1250.1 | 567 | không | 1280/1280 |
| 1440 | 112 | 112/112/112 | 71.36 | 662 | 95.7–1440 | 1440 | ẩn | 707.3–1406.4 | 647 | không | 1440/1440 |
| 1920 | 352 | 352/352/352 | 71.36 | 662 | 335.7–1680 | 1680 | hiện | 947.3–1646.4 | 887 | không | 1920/1920 |
| 2560 | 672 | 672/672/672 | 71.36 | 662 | 655.7–2000 | 2000 | hiện | 1267.3–1966.4 | 1207 | không | 2560/2560 |

- Mép trái h1 = mép khung chung các section: chênh **0px**. Khung ảnh right ≤ W mọi viewport; > 1440 right = (W+1440)/2 đúng tuyệt đối.
- ≤ 1440: h1 112/647, ảnh x95.7–1440, panel tới 1406.4, cao 662 — khớp số đo hiện trạng trước sửa (ảnh 95–1440, panel ≈1406) → hình như trước.
- Ảnh nền tải (cache tắt, profile mới): 1024 → `w=1200`, 1280/1440/1920/2560 → `w=1920` (trước: `120vw` → 1920/2560 tải `w=3840`). Preload `imageSizes` khớp `sizes`.
- Ảnh chụp (scratch ngoài repo, không commit): 1440 — giống bản cũ; 1920 / 2560 — khối chữ + ảnh cân quanh khung 1280 (chữ mép trái khung, panel cuối kết thúc ~78px trong mép phải khung), ảnh fade mềm sang trắng ở mép phải stage và trái khung, không cắt cứng; hai bên ngoài stage là nền trắng liền với header/section dưới.

### Residual risk
- Đo với `CONTENT_SOURCE=file`; hero không phụ thuộc DB ngoài text panel (cùng độ dài) → rủi ro thấp.
- Ở > 1440 hai bên stage là dải trắng (rộng (W−1440)/2) — chủ ý theo plan; ở 2560 khá rộng, cần mắt người duyệt thẩm mỹ.
- Đo/ chụp với reduced-motion (panel không trôi); animation trôi nhẹ chỉ dịch vài px, không đổi kết luận "không giao chữ".
- `sizes` 1097px/94vw dựa trên tỉ lệ 1787/880 và clamp 540/46vw/662 — đổi các hằng này phải sửa `sizes` theo (đã ghi comment cạnh `Image`).

### Attempt 2 (builder, 2026-10-19) — sửa F1 review round 1
**Thay đổi:** `src/components/home/HeroVisual.tsx:149` stage `relative mx-auto h-full w-full max-w-[1440px]` → thêm `overflow-hidden`. Không đổi gì khác (Hero.tsx, HomeProductCard.tsx, DESIGN.md giữ nguyên attempt 1).
- Lý do an toàn ≤ 1440: stage = bề rộng/cao section, section vốn `overflow-hidden` → clip y như cũ. Panel kính + wordmark nằm trong khung ảnh (left ≥ 45.5%, right ≤ 97.5%), khung ảnh nằm trong stage → không bị cắt (đo bên dưới, kể cả lúc `motion-pop-in` dịch 30px).

**Verify**
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS (0 error, 1 warning có sẵn `src/components/mdx/index.tsx:26`, ngoài scope) |
| `docker build --target builder -t nta-web-buildcheck:tmp .` | PASS → `docker rmi` đã xoá, container đã stop |

**Đo DOM — animation BẬT** (next start trong image builder, `CONTENT_SOURCE=file`, Edge headless + `scripts/screenshots/cdp.mjs`, `prefers-reduced-motion: no-preference`, cache tắt, cao 900). Mẫu "early" lấy ngay khi `<img>` có trong DOM (t≈245–324ms, ảnh còn scale ~1.043–1.047), "mid" +300ms (t≈680–964ms), "done" +2.5s (transform `none`). Đơn vị px.

| W | mẫu | stage overflow | stage l–r | img rect l–r (gồm transform) | ảnh hiển thị right = min(img.r, stage.r) | (W+1440)/2 | panel+wordmark l–r / t–b | panel trong stage | scrollW/clientW |
|---|---|---|---|---|---|---|---|---|---|
| 1440 | early | hidden | 0–1440 | 64–1471.7 | 1440 | 1440 | 715.9–1401.5 / 208.8–622.3 | có | 1440/1440 |
| 1440 | mid | hidden | 0–1440 | 94.8–1440.9 | 1440 | 1440 | 714.4–1404.7 | có | 1440/1440 |
| 1440 | done | hidden | 0–1440 | 95.7–1440 | 1440 | 1440 | 707.3–1406.4 / 161.4–591.7 | có | 1440/1440 |
| 1920 | early | hidden | 240–1680 | 306.7–1709 | 1680 | 1680 | 955.9–1641.5 / 208.1–621.5 | có | 1920/1920 |
| 1920 | mid | hidden | 240–1680 | 333.2–1682.5 | 1680 | 1680 | 955.2–1641.5 | có | 1920/1920 |
| 1920 | done | hidden | 240–1680 | 335.7–1680 | 1680 | 1680 | 947.3–1646.4 / 162.1–592.4 | có | 1920/1920 |
| 2560 | early | hidden | 560–2000 | 626.7–2029 | 2000 | 2000 | 1275.9–1961.5 / 208.1–621.5 | có | 2560/2560 |
| 2560 | mid | hidden | 560–2000 | 653.2–2002.5 | 2000 | 2000 | 1275.2–1961.5 | có | 2560/2560 |
| 2560 | done | hidden | 560–2000 | 655.7–2000 | 2000 | 2000 | 1267.3–1966.4 / 165.6–594.3 | có | 2560/2560 |

- Lúc zoom, rect ảnh vượt mép phải stage ~29px (1709 > 1680 ở 1920) nhưng stage `overflow:hidden` cắt tại 1680 = (W+1440)/2; ảnh chụp 1920 t≈256ms (scratch, không commit) xác nhận không còn phần ảnh lấn ra nền trắng, mép phải vẫn mờ sang trắng nhờ dải fade.
- 1440 "done" giống hệt attempt 1 (ảnh 95.7–1440, panel 707.3–1406.4); phần tràn dọc của ảnh lúc zoom (top 61.7 < stage 77.3) trước đây do section cắt, nay stage cắt tại cùng mép → không đổi hình.
- Residual: dải fade `w-24` nằm trong khung nên phần ảnh scale tràn vào 0–29px trong mép phải (dưới fade) vẫn mờ dần; không còn mép cứng ngoài stage.
