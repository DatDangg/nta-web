Agent: reviewer

# Review — feature-home-layout-alignment · phase-1-task-02 · round 2 (CR-040, R-01b)

- **Review level:** NORMAL
- **Reason:** UI-only, chỉ trang chủ `lg+`; không đụng auth/API/schema/shared service. Round 2 chỉ kiểm fix F1 (thêm 1 class `overflow-hidden` vào stage) + soát lại toàn diff task.
- **Blast radius:** `src/components/home/HeroVisual.tsx` (`HeroBackground`, chỉ dùng ở `/` vi+en, lg+), `src/components/home/Hero.tsx` (chiều cao section + cỡ h1), `src/components/home/HomeProductCard.tsx` (default `imageSizes`, chỉ chọn srcset), `docs/DESIGN.md` (as-built). `HeroMobileImage` (< lg) không đổi.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS (`tsc --noEmit`, 0 lỗi) |
| `npm run lint` | PASS (0 error, 1 warning có sẵn `src/components/mdx/index.tsx:26`, ngoài scope) |
| `npm run build` | không chạy lại (theo chỉ đạo); builder PASS `docker build --target builder` (Evidence attempt 2) |

## Kiểm F1 (round 1 MAJOR) — ĐÃ ĐÓNG
- `HeroVisual.tsx:149` stage = `relative mx-auto h-full w-full max-w-[1440px] overflow-hidden` → phần `scale(1.08)` của `motion-load-zoom` bị cắt tại mép stage = (W+1440)/2. Evidence attempt 2 (animation BẬT, mẫu early/mid/done ở 1440/1920/2560): img rect lúc zoom tới 1709 (1920) / 2029 (2560) nhưng mép hiển thị = 1680 / 2000 = (W+1440)/2; không còn ảnh lấn ra nền trắng. Phần tràn ≤ 29px nằm trong khung, dưới dải fade `w-24` → mép phải vẫn mờ sang trắng.
- **Không cắt panel/wordmark:** panel + wordmark là con của khung ảnh, vị trí % trong khung (left ≥ 45.5%, right ≤ 97.5%); khung `right-0` trong stage. Số đo: panel right ≤ 1646.4 (1920) < stage 1680, top ≥ 161 > 0, bottom ≤ 594 < cao section. Bóng panel `shadow-[0_0.6cqw_2cqw]` ≈ 27px blur → tối đa ~1673 < 1680, không bị cắt. `motion-pop-in` (translateY 30px, scale 0.92 — thu nhỏ) và `motion-float` (translate dọc −0.6cqw) đều không đẩy panel ra ngoài stage.
- **≤ 1440 không đổi hình:** stage `w-full` = bề rộng section, `h-full` của lớp `absolute inset-0` = cao section; section vốn `overflow-hidden` → vùng clip trùng khít. Tràn trái của khung ở 1024 (khung 1097 > 1024) trước do section cắt, nay stage cắt cùng mép. Tràn trên/dưới lúc zoom (Evidence 1440: img top 61.7 vs stage 77.3) — trước section cắt, nay stage cắt cùng mép. 1440 "done" giống hệt attempt 1 (ảnh 95.7–1440, panel 707.3–1406.4).
- `overflow-hidden` ở đây là clip animation trong vùng trang trí `aria-hidden`/ảnh nền, không che lỗi layout (không có nội dung text bị cắt).

## Soát lại mục round 1 đã PASS (không đổi trong attempt 2)
- Scope 6 mục, không drive-by: ✓ (attempt 2 chỉ thêm 1 class, diff các file khác giống round 1).
- `sizes` `(min-width: 1440px) 1345px, (min-width: 1174px) 94vw, (min-width: 1024px) 1097px, 1px` khớp công thức cao × 1787/880; `priority` giữ (LCP R-22): ✓
- Section `clamp(540px,46vw,662px)`, h1 max `4.46rem` (= cỡ ở 1440) → ≤ 1440 không đổi: ✓
- Fade phải `min-[1441px]:block`, ẩn ≤ 1440: ✓; mờ đáy full-width giữ lý do hợp lý: ✓
- < lg không đổi, a11y (`alt`, `aria-hidden`, 1 h1): ✓
- Không horizontal scroll: Evidence scrollW = clientW ở 1440/1920/2560 (animation bật): ✓
- `docs/DESIGN.md` as-built khớp code; không đụng intent docs: ✓ (không cần ghi thêm `overflow-hidden` — chi tiết cài đặt, không đổi behavior).
- `HomeProductCard` `imageSizes` 600px: ✓

## Findings
- **Không có BLOCKER/MAJOR mới.**
- [MINOR, giữ từ round 1, không chặn] F2 — hằng số `sizes` ở `HeroVisual.tsx` phụ thuộc chéo clamp ở `Hero.tsx:21`; đã có comment công thức + Residual risk.
- [INFO] Reviewer không chạy browser; xác minh bằng CSS math + số đo DOM có animation bật trong Evidence attempt 2 (kèm mô tả ảnh chụp 1920 t≈256ms ở scratch, không commit).

## Responsive Checklist Gate (diff UI)
| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Không horizontal scroll | OK | scrollW = clientW 1440/1920/2560 (Evidence attempt 2) |
| Container không fixed px | OK | `max-w-[1440px]` là max, fluid ≤ |
| Typography rem + clamp | OK | h1 `clamp(2.5rem,0.5rem+4.4vw,4.46rem)` |
| Ảnh sizes/srcset | OK | tính lại ở trên |
| Reduced-motion | OK | CSS motion không đổi; rule reduce cuối `globals.css` vẫn áp |
| Không che lỗi bằng overflow:hidden | OK | clip animation zoom trong lớp nền trang trí, vùng clip ≤ 1440 trùng section |

## Skill gates
- aislop / oxlint / ocr: skip, not installed/configured (như round 1)
- AI-readable: OK; ai-friendly-web: N/A; blitzstrike: N/A

## Residual risk
- Thẩm mỹ dải trắng hai bên stage ở 2560 cần mắt người duyệt (đã ghi Evidence từ attempt 1).

## Verdict: ✅ PASS
F1 đã đóng bằng clip đúng chỗ, không cắt panel/wordmark/bóng, không đổi hình ≤ 1440 và < lg; typecheck + lint PASS; không regression mới.
