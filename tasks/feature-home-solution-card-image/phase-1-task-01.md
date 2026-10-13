# feature-home-solution-card-image · phase-1-task-01 — Thẻ Giải pháp trang chủ: ảnh to nửa phải, mờ dần sang trái (mẫu 4.webp)

- **CR:** CR-017 (follow-up CR-016) · change doc `spec/changes/2026-10-14-home-solution-card-image.md`
- **Classification / Risk:** MODIFY (UI) · LOW
  - Scope: CHỈ `src/components/home/SolutionGridHome.tsx` (component `SolutionHomeCard` + hằng mask).
  - KHÔNG sửa `HomeImage.tsx` dùng chung trừ khi bắt buộc (nếu cần `fill` → ưu tiên `next/image` trực tiếp trong file này hoặc thêm prop optional không đổi behavior cũ).
  - KHÔNG đổi nội dung `src/content/home.ts`, ảnh, i18n.
  - Expected review level: **FAST/NORMAL**
  - Blast radius: `/`, `/en` (khối Giải pháp)
  - Doc impact: không đổi requirement (R-02a vẫn đúng: "ảnh minh hoạ" trong thẻ) → spec_version không bump; test-scope +1.
- **Ảnh:** user chốt 2026-10-14 dùng ảnh hiện có `public/images/illustrations/home-{enterprise,ai,apps}.png` (1496×1051, nền gần trắng).

## Scope
1. Lớp ảnh: `absolute inset-y-0 right-0 -z-10`, rộng ~58–62% thẻ (có thể khác theo breakpoint), cao full thẻ; ảnh `fill` + `object-cover` (căn giữa/hơi phải),
   tràn sát mép phải/trên/dưới; bo góc nhờ `overflow-hidden` + `rounded-lg` của thẻ.
2. Mask: CHỈ 1 gradient sang trái (transparent → #000 khoảng 40–50%). Bỏ gradient từ trên xuống + `maskComposite`. Bỏ mọi `opacity-30`.
3. Đọc chữ: cột chữ giữ max-w hợp lý (~58–62% ở thẻ rộng); nếu ảnh vẫn chạm chữ (thẻ hẹp ở lg 3 cột / mobile) → thêm lớp nền
   `bg-gradient-to-r from-surface via-surface/80 to-transparent` (hoặc tương đương) sau cột chữ, trên ảnh, để tương phản như mẫu.
4. Mobile / tablet: ảnh vẫn hiện rõ bên phải mờ trái; chữ đọc được; không tràn ngang. `sizes` cập nhật theo khung mới.
5. Thẻ cần chiều cao tối thiểu đủ để ảnh có diện tích (vd `min-h-[...]` nhẹ) — chỉ khi cần.

## Acceptance
- (= change doc) 3 thẻ ảnh full chiều cao nửa phải, fade mượt trái, không fade trên, không opacity-30 desktop; chữ đọc rõ 1280/1440;
  mobile/tablet ảnh hiện + chữ đọc được, 375/768 không tràn ngang.
- typecheck / lint / build PASS.

## Retry / Escalation
Max 3 attempt; fail lần 3 → `architecture_review_needed`.

## Verification summary

**Builder (attempt 1, 2026-10-14):**
- Files: `src/components/home/SolutionGridHome.tsx` (chỉ file này; `HomeImage.tsx` không đổi).
- Cách làm:
  - Lớp ảnh `absolute inset-y-0 right-0 -z-10`, rộng `w-[62%] md:w-[58%] lg:w-[62%] xl:w-[60%]`, cao full thẻ; dùng `next/image` trực tiếp (`fill` + `object-cover object-[60%_50%]`), alt giữ `solution.alt`. Bo góc nhờ `overflow-hidden rounded-lg` của thẻ.
  - Mask CHỈ `linear-gradient(to right, transparent, #000 45%)`; bỏ gradient trên-xuống, bỏ `maskComposite`, bỏ toàn bộ `opacity-30`; `as CSSProperties` → `satisfies CSSProperties`.
  - Đọc chữ: cột chữ giữ nguyên (`md:max-w-[60%] lg:max-w-none xl:max-w-[64%]`). Thẻ hẹp (mobile <768, lg 1024–1279) thêm lớp `bg-gradient-to-r from-surface from-40% to-transparent to-90%` (aria-hidden, trên ảnh dưới chữ — cùng `-z-10`, đứng sau ảnh trong DOM); ẩn ở md và xl (thẻ rộng, vùng chữ rơi vào phần ảnh đã mờ). Không dùng `via-surface/80` vì `surface` là CSS var hex → Tailwind 3 không áp được alpha.
  - Thẻ `min-h-[18rem]`; `sizes="(min-width: 1280px) 260px, (min-width: 1024px) 21vw, 62vw"`.
- Verify: `npm run typecheck` PASS · `npm run lint` PASS (0 error, 1 warning có sẵn ở `src/components/mdx/index.tsx`, ngoài scope) · `npm run build` **BLOCKED (môi trường)**: `Failed to load next.config.ts` / `Error: Failed to load native binding` (không retry; trên Cowork dùng `bash tools/linux-build.sh verify`).
- Residual risk: chưa kiểm tra trực quan bằng trình duyệt ở 375/768/1024/1280/1440 — cần reviewer/primary xem thực tế: (1) ở mobile ảnh 62% bề rộng × full cao thẻ bị `object-cover` cắt thành lát dọc giữa ảnh (chủ thể có thể lệch, chỉnh `object-[x_y]` nếu cần); (2) lg 3 cột (~300px) lớp nền che bớt nửa trái ảnh — ảnh vẫn rõ ở ~40% bên phải; (3) bullet có thể chạm vùng ảnh ở xl như mẫu. Không có test tự động cho UI này.

**Builder (attempt 2, 2026-10-14):** (primary FAIL attempt 1 ở 1440: xl ẩn lớp nền + cột chữ 64% → bullet đè phần ảnh đậm)
- Files: `src/components/home/SolutionGridHome.tsx` (chỉ file này).
- Thay đổi:
  - Lớp nền `bg-gradient-to-r from-surface from-40% to-transparent to-75% lg:to-90% xl:to-75%` áp MỌI breakpoint (bỏ `md:hidden`/`xl:hidden`); lg 3 cột chữ full bề rộng nên nền phủ dài tới 90%.
  - Cột chữ `md:max-w-[56%] lg:max-w-none xl:max-w-[56%]` (trước 60%/64%).
  - Ảnh `w-[60%]` mọi breakpoint; mask `linear-gradient(to right, transparent, #000 50%)`; `sizes` → `(min-width: 1280px) 260px, (min-width: 1024px) 20vw, 60vw`.
  - Vị trí ảnh `object-[40%_50%]` (KHÔNG dùng 65% như đề xuất): khung dọc (xl ~233×395) chỉ thấy ~41% bề ngang ảnh 3:2; object-x = 65% hiện vùng ảnh 38–80% → chủ thể ở giữa ảnh (khối AI ~50%, điện thoại ~48%) rơi về ~29% khung = vùng đã mờ. 40% hiện vùng 23–65% → chủ thể ở ~64% khung (ngoài vùng mờ). Đã xem cả 3 ảnh: enterprise (cột biểu đồ 45–75% ảnh) → ~52–100% khung; apps (ô cam 52–72%) → ~69–100% khung; ô xanh/tím bên trái và icon người của enterprise rơi vào vùng mờ (chấp nhận được).
- Verify: `npm run typecheck` PASS · `npm run lint` PASS (0 error, 1 warning có sẵn ở `src/components/mdx/index.tsx`). `npm run build`: để primary chạy (máy builder bị native binding, xem attempt 1).
- Residual risk: chưa xem trực quan — cần primary kiểm tra lại 1440/1280 (bullet vs ảnh), 1024 lg (ảnh còn rõ ở ~10–25% phải sau nền 90%; nếu quá mờ hạ `lg:to-85%`), md 768 (khung ảnh rộng, gần như thấy cả ảnh) và 375.
