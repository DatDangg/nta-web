# feature-home-solution-card-photo · phase-1-task-01 — Thẻ Giải pháp trang chủ rộng hơn + ảnh thật bên phải (mẫu 5.webp)

- **CR:** CR-018 (follow-up CR-017 / CR-016) · change doc `spec/changes/2026-10-14-home-solution-card-photo.md`
- **Classification / Risk:** MODIFY (UI) · LOW
  - Scope:
    - `src/components/home/SolutionGridHome.tsx` (container riêng của section + `SolutionHomeCard`).
    - `src/content/home.ts` — CHỈ field `image` + `alt` của 3 thẻ `solutions` (VI + EN). Chữ/bullet giữ nguyên.
    - Ảnh mới: `public/images/illustrations/home-{enterprise,ai,apps}-photo.webp` (copy từ
      `spec/changes/assets/2026-10-14-home-solution-card-photo/`, 1536×1024, 80–120KB → không cần resize).
  - KHÔNG sửa token `max-w-container` (tailwind.config.ts) dùng chung; KHÔNG sửa `HomeSectionHeader`, `HomeImage` dùng chung.
  - Expected review level: **NORMAL**
  - Blast radius: `/`, `/en` (khối Giải pháp)
  - Doc impact: R-02a vẫn đúng (thẻ có ảnh bên phải) → spec_version không bump; test-scope +1.

## Scope
1. Container section: thay `max-w-container` bằng max-width riêng ~1400px (vd `max-w-[1400px]`), CHỈ trong `SolutionGridHome`.
   Ở 1440 thẻ ~430px+ rộng; tiêu đề "Giải pháp doanh nghiệp" 1 dòng (cân nhắc `whitespace-nowrap` ở xl nếu cần).
2. Thẻ thấp hơn, ngang hơn như mẫu: giảm `min-h`; cột chữ ~55–58% ở thẻ rộng.
3. Ảnh: dùng 3 ảnh webp mới; chủ thể nằm ~45–95% bề ngang ảnh → khung ảnh neo phải (`object-right`/`object-[x_50%]`),
   khung rộng đủ để chủ thể hiện trọn phần lớn; mask mờ dần sang trái; lớp nền surface giữ chữ đọc rõ.
4. Alt VI/EN mô tả nội dung ảnh, KHÔNG tiền tố "Minh hoạ"/"Giao diện minh hoạ"/"Illustration"/"Illustrative". Không caption.
5. Mobile/tablet/lg: ảnh vẫn hiện bên phải, chữ đọc được, không tràn ngang. `sizes` cập nhật theo khung mới.

## Acceptance
- Thẻ rộng hơn CR-017 ở desktop; "Giải pháp doanh nghiệp" 1 dòng ở 1440.
- Ảnh laptop / chip AI / điện thoại bên phải, tan vào nền thẻ; chữ không bị ảnh đè ở 375/1024/1440/1920, VI + EN.
- Ảnh `naturalWidth > 0`; overflow ngang 0.
- typecheck / lint / build PASS; reviewer PASS.

## Retry / Escalation
Max 3 attempt; fail lần 3 → `architecture_review_needed`.

## Verification summary

### Builder attempt 1 (2026-10-14)
- **Files:**
  - `public/images/illustrations/home-{enterprise,ai,apps}-photo.webp` (mới, `cp` nguyên từ assets, 1536×1024, 78–116KB).
  - `src/content/home.ts` — 6 dòng: `image` → `*-photo.webp`, `alt` VI/EN mô tả nội dung ảnh (không tiền tố "Minh hoạ"/"Illustration"). Chữ/bullet không đổi.
  - `src/components/home/SolutionGridHome.tsx`.
- **Cách làm:**
  - Container section `max-w-container` → `max-w-[1400px]` (chỉ section này; tailwind.config.ts không đổi). Ở 1440: (1400−64−48)/3 ≈ 429px/thẻ.
  - Thẻ `min-h-[18rem]` → `min-h-[16rem]` (chiều cao thực theo nội dung ~300px).
  - Khung ảnh `w-[60%]` → `w-[72%]`, `object-[40%_50%]` → `object-[85%_50%]`. Tính: xl khung ~310×300, ảnh cover render ~450px → hiện ảnh x 26–95% → chủ thể (45–95%) nằm ~48–95% bề ngang thẻ; lg khung ~219, ảnh ~480 → hiện 46–92%; mobile khung ~247, ảnh ~465 → hiện 40–93%.
  - Mask chỉ mờ sang trái (`transparent → #000 45%`), đổi tên `illustrationFade` → `photoFade`.
  - Lớp nền surface tách 2 biến thể theo breakpoint: thẻ rộng (md, xl — cột chữ 58%) `from-surface 45% → transparent 70%`; thẻ hẹp (mobile, lg — chữ full) `from-surface 40% → transparent 130%` (≈72% đục ở 65%, ≈33% ở mép phải) để chữ không đè phần ảnh đậm. Không dùng `surface/80` vì token là `var(--color-surface)` (Tailwind 3 không áp opacity modifier).
  - Cột chữ `56%` → `58%` (md/xl); h3 `xl:whitespace-nowrap`: cột chữ xl ~225px − icon 64px ≈ 161px không đủ cho "Giải pháp Doanh nghiệp" (~230px ở text-xl bold) → cho 1 dòng, phần tràn kết thúc ~74% bề ngang thẻ ở 1440 (~82% ở 1280), nằm ở dải trên 10–19% chiều cao — vùng nền sáng phía trên chủ thể của cả 3 ảnh.
  - `sizes` → `(min-width: 1024px) 480px, (min-width: 768px) 72vw, 480px` (bề ngang ảnh render thực do object-cover kéo theo chiều cao).
  - JSDoc cập nhật, bỏ nội dung `object-[40%_50%]` cũ.
- **Verify:**
  - `npm run typecheck` PASS.
  - `npm run lint` PASS (0 error; 1 warning có sẵn ở `src/components/mdx/index.tsx`, ngoài scope).
  - `npm run build` **BLOCKED** — `Failed to load native binding` khi load next.config.ts (lỗi môi trường, không retry).
  - Bổ sung: compile Tailwind CLI riêng cho component → các class mới (`max-w-[1400px]`, `min-h-[16rem]`, `object-[85%_50%]`, `to-[130%]`, `xl:whitespace-nowrap`) đều sinh CSS.
- **Residual risk:**
  - Chưa kiểm tra trực quan bằng trình duyệt (375/768/1024/1440/1920, VI+EN) — reviewer cần screenshot. Điểm cần soi: tiêu đề nowrap ở 1280 (tràn ~82% thẻ) và EN ở xl; độ đọc chữ trên ảnh ở lg 1024.
  - Build chưa chạy được do native binding → cần chạy lại ở môi trường có @next/swc đúng nền tảng.
  - 3 ảnh PNG cũ `home-{enterprise,ai,apps}.png` không còn tham chiếu trong `src/` nhưng giữ nguyên (ngoài scope xoá).

### Builder attempt 2 (2026-10-14)
- **Lý do:** primary xem trực quan ở 1440 → FAIL. Thẻ 429×383 gần vuông, ảnh full chiều cao render cover rộng ~575px, chủ thể rộng ~67% thẻ → 2 điện thoại (Ứng dụng AI) bắt đầu ~49% thẻ, đè mô tả + bullet; màn hình camera (Giải pháp AI) sát chữ. 375/1024 OK → giữ nguyên.
- **Files:** `src/components/home/SolutionGridHome.tsx` (chỉ đổi biến thể xl + JSDoc).
- **Cách làm (chỉ xl):**
  - Khung ảnh: `xl:inset-y-auto xl:bottom-0 xl:w-[75%] xl:aspect-[3/2]` → neo góc phải-dưới, ~322×214 ở 1440, đúng tỉ lệ ảnh nên không cắt. Chủ thể (45–95% ảnh) nằm ~59–96% bề ngang thẻ, ~60–95% chiều cao.
  - Cột chữ xl `58%` → `56%` (~237px tính cả padding ≈ 55% thẻ) → chủ thể bắt đầu ~252px, không pixel đậm nào dưới chữ.
  - Mask: 1 khung, 1 `<Image>`. `photoFade` = 2 linear-gradient (trái `transparent → #000 45%`; trên `transparent → #000 var(--photo-fade-top, 0%)`) + `maskComposite: 'intersect'` / `WebkitMaskComposite: 'source-in'`. Mặc định biến = 0% → lớp trên đục hoàn toàn → mobile/md/lg y hệt attempt 1 (intersect với lớp đục = chỉ còn mask trái). xl: `xl:[--photo-fade-top:25%]` → mờ mép trên khung.
  - Nền surface xl: `from-45%→70%` → `xl:from-40% xl:to-60%` (ảnh đã ngoài vùng chữ).
  - `sizes` thêm `(min-width: 1280px) 360px`. Giữ `xl:whitespace-nowrap` (cột chữ 56% càng hẹp); tiêu đề ở nửa trên thẻ, khung ảnh bắt đầu từ ~44% chiều cao → không chạm.
  - JSDoc cập nhật theo bố cục mới.
- **Verify:** `npm run typecheck` PASS · `npm run lint` PASS (0 error, 1 warning có sẵn ngoài scope) · Tailwind CLI: các class xl mới sinh CSS đúng · build: không chạy (primary build).
- **Residual risk:** chưa xem trực quan attempt 2 — cần primary chụp 1280/1440/1920 VI+EN. Ở 1280 thẻ ~389px: khung ~292×195, chủ thể ~59–96% (tỉ lệ giữ nguyên), nhưng thẻ có thể cao hơn do chữ wrap nhiều hơn → khoảng trống nửa dưới-trái lớn hơn mẫu.

### Builder attempt 3 (2026-10-14) — fix review round 1 M1
- **Lý do:** reviewer round 1 FAIL M1 — < xl khung ảnh full chiều cao × 72% nằm dưới chữ (375, 1024). xl đạt → giữ cách làm xl.
- **Files:** `src/components/home/SolutionGridHome.tsx` (chỉ file này + task file). Không đụng `home.ts`, token, component dùng chung.
- **Cách làm:**
  - Một khung ảnh duy nhất, luôn `aspect-[3/2]` (đúng tỉ lệ ảnh, không cắt, `object-cover` không cần `object-position`), đặt SAU cột chữ trong DOM:
    - Mobile (<768) + lg (1024–1279, chữ full bề ngang thẻ ~300px): dải ảnh trong flow ở đáy thẻ, dưới link (`relative -mx-5 -mb-5 mt-2`, lg `-mx-6 -mb-6`) → tràn sát mép thẻ, bo góc nhờ `overflow-hidden`.
    - md (768–1023, 1 cột ~705px): `absolute` neo phải-dưới, `w-[55%]`; cột chữ `58%` → `56%`.
    - xl: `absolute` neo phải-dưới, `75%` → `80%` (cột chữ 56% giữ nguyên).
  - Mask `photoFade` cố định: trái `transparent → #000 45%` ∩ trên `transparent → #000 25%` mọi breakpoint → bỏ biến `--photo-fade-top`.
  - Bỏ cả 2 lớp nền surface (phần khung dưới cột chữ đã trong suốt nhờ mask; dải đáy không có chữ).
  - `min-h-[16rem]` chỉ còn từ md (mobile/lg chiều cao theo nội dung + dải ảnh).
  - `sizes`: `(min-width: 1280px) 360px, (min-width: 1024px) 33vw, (min-width: 768px) 55vw, 100vw`.
  - JSDoc cập nhật.
- **Đo (dev :3101, Browser pane; khoảng cách tính từ mép trái/trên thẻ; "strong" = khung từ 45% ngang, 15% dọc; "hits" = rect dòng chữ h3/p/li/a giao vùng strong):**

  | Mốc | Lang | Overflow | Thẻ | Khung (x,y,w,h) | Chữ (phải/đáy) | Strong (x,y) | hits | naturalWidth |
  |---|---|---|---|---|---|---|---|---|
  | 375 | VI | 0 | 343×526–540 | 1,298–312,341×227 (đáy thẻ) | 322 / 278–292 | 154 / 332–346 | 0 | 375 ×3 |
  | 375 | EN | 0 | 343×517–540 | 1,289–312,341×227 | 322 / – | 154 / – | 0 | (load OK sau eager) |
  | 768 | VI | ≤0 | 705×319 | 317,60,387×258 | ≤376 / 282 | 491 / 98 | 0 | 422 ×3 |
  | 768 | EN | ≤0 | 705×296–319 | 317,37–60,387×258 | ≤387 / ≤282 | 491 | 0 | 422 ×3 |
  | 1024 | VI | ≤0 | 299×554 | 1,355,297×198 (đáy thẻ) | 274 / 335 | 135 / 384 | 0 | 337 ×3 |
  | 1024 | EN | ≤0 | 299×540 | 1,341,297×198 | 274 / 321 | 135 / 370 | 0 | 337 ×3 |
  | 1440 | VI | ≤0 | 429×384 | 86,155,342×228 | 237 (h3 nowrap 321, ở dải trên) / 348–356 | 240 / 190 | 0 | 359 ×3 |
  | 1440 | EN | ≤0 | 429×406 | 86,177,342×228 | 237 (h3 287) / 370 | 240 / 211 | 0 | 359 ×3 |

  - Overflow âm (−15) = thanh cuộn dọc (`scrollWidth < innerWidth`), không tràn ngang. Khung luôn nằm trong thẻ.
  - h3 1 dòng ở 1440 VI + EN (cả 3 thẻ). 1024: "Giải pháp Doanh nghiệp"/"Enterprise Solutions" 2 dòng (không yêu cầu).
  - Screenshot: 375 EN (dải ảnh laptop dưới link, chủ thể rõ), 768 EN (ảnh nửa phải, ngoài cột chữ), 1024 EN (3 dải ảnh đáy thẻ), 1440 VI + EN (ảnh phải-dưới, chữ không đè laptop/chip/điện thoại).
  - Ghi chú đo: Browser pane bị ẩn nên `loading="lazy"` và Reveal không tự kích hoạt → đặt tạm `loading='eager'` + thêm class `revealed` bằng JS chỉ để đo (không đổi source).
- **Verify:** `npm run typecheck` PASS · `npm run lint` PASS (0 error, 1 warning có sẵn `src/components/mdx/index.tsx`, ngoài scope) · build: không chạy (primary build).
- **Residual risk:**
  - xl 1440 thẻ "Doanh nghiệp": chậu cây (≈33–40% ngang ảnh, không phải chủ thể chính) nằm sát phải cột chữ, phần nền cửa sổ rất mờ dưới đuôi dòng bullet — mép strong (240px) chỉ cách chữ 3px. Nếu reviewer thấy sát quá → hạ `xl:w-[80%]` về `76–78%`.
  - Mobile/lg thẻ cao hơn (dải ảnh ~200–230px dưới link); nửa trái dải gần trống do mask (nửa trái ảnh vốn là nền sáng).
  - Chưa đo 1280 và 1920 trong attempt này (1920 dùng cùng container 1400 → giống 1440); Safari mask-composite chưa kiểm.

### Primary close-out (2026-10-14)
- Reviewer round 2 **PASS** (`.context/review-reports/feature-home-solution-card-photo-phase-1-task-01-round-2-review.md`); round 1 FAIL (M1) đã fix ở attempt 3.
- Terminal user (Windows, npm.cmd): `npm run typecheck` PASS · `npm run lint` PASS (0 error, 1 warning cũ mdx) · `npm run build` PASS 59/59.
