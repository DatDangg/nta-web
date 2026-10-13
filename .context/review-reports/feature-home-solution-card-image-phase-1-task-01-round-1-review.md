Agent: reviewer

# Review — feature-home-solution-card-image · phase-1-task-01 · round 1 (CR-017)

- **Task:** `tasks/feature-home-solution-card-image/phase-1-task-01.md`
- **Change doc:** `spec/changes/2026-10-14-home-solution-card-image.md` · mẫu `spec/changes/assets/2026-10-14-home-solution-card-image/4.webp`
- **Diff đã review:** `git diff src/components/home/SolutionGridHome.tsx` (file code duy nhất; tracking `.context/*`, `spec/changes/*`, `tasks/*` bỏ qua theo scope)
- **Ngày:** 2026-10-14

## Review level
**NORMAL**

## Reason
Scope hẹp (1 component trình bày riêng của trang chủ, `SolutionHomeCard` + hằng mask), không đụng auth/API/schema/tenant/shared component. `HomeImage.tsx` dùng chung KHÔNG đổi (chỉ bỏ import ở file này). Không chọn FAST vì là UI public-facing, đổi pattern ảnh (`fill` + lớp nền chồng) và còn residual visual ở 1024/768 (chỉ có số đo DOM, không có screenshot).

## Blast radius
`/` và `/en` — khối Giải pháp (3 thẻ). Không file/component khác import `SolutionHomeCard`. Bỏ `HomeImage` (client component) khỏi file này → `SolutionGridHome` giờ thuần server component, giảm JS client (tích cực).

## Verify commands + result
| Lệnh | Kết quả | Nguồn |
|---|---|---|
| `npm run typecheck` | PASS | primary / builder attempt 2 |
| `npm run lint` | PASS (0 error; 1 warning có sẵn `src/components/mdx/index.tsx`, ngoài scope) | primary / builder |
| `npm run build` | PASS 59/59 | primary, terminal user |
| Visual `next start` :3100 | 1440 PASS (3 thẻ 389×395, cột chữ trái sạch, ảnh full cao nửa phải mờ trái); 375 PASS (ảnh phải mờ trái, chữ rõ, không tràn ngang); 1024/768 chỉ đo DOM (scrollWidth < innerWidth) | primary |

Reviewer không chạy lại (evidence primary đủ, theo yêu cầu dispatch). Đã đối chiếu thủ công: `package.json` → `tailwindcss ^3.4.18`, `next ^15.5.27`; `tailwind.config.ts` → `surface: 'var(--color-surface)'`, content quét `./src/**/*.{tsx,...}`; `globals.css` → `--color-surface: #ffffff`, không có dark mode.

## Checklist
| Mục | Kết quả |
|---|---|
| AC1: ảnh full chiều cao, nửa phải ~55–65%, tràn mép phải/trên/dưới, bo góc | PASS — `absolute inset-y-0 right-0 w-[60%]`, `fill object-cover`; thẻ `overflow-hidden rounded-lg` cắt góc |
| AC2: fade trái mượt, không fade trên, không `opacity-30` | PASS — mask còn đúng 1 `linear-gradient(to right, transparent, #000 50%)`; đã bỏ gradient top + `maskComposite`/`WebkitMaskComposite`; không còn `opacity-*` nào |
| AC3: chữ đọc rõ 1280/1440 | PASS — lớp nền `from-surface from-40% → transparent to-75%` + cột chữ `xl:max-w-[56%]`; ảnh chỉ đậm từ ~70% thẻ (40% offset + 50% mask) → khớp comment "~60–75%"; primary xác nhận 1440 |
| AC4: mobile/tablet ảnh hiện, chữ đọc, không tràn ngang | PASS (375 visual, 768/1024 DOM) — residual screenshot 1024/768 |
| AC5: build/typecheck/lint | PASS |
| `next/image fill` đúng | PASS — parent `absolute` có kích thước (inset-y-0 + w-[60%]); `sizes` hợp lý: xl ≈ 389×0.6 ≈ 233px → 260px; lg thẻ ≈ 300px×0.6 ≈ 18vw → 20vw; <1024 ≈ 55–60vw → 60vw. Không `priority` (dưới fold) — đúng |
| Tailwind class hợp lệ ở 3.4 | PASS — gradient color-stop position (`from-40%`, `to-75%`, `lg:to-90%`, `xl:to-75%`) có từ 3.3; `object-[40%_50%]`, `min-h-[18rem]`, `w-[60%]` là arbitrary value hợp lệ; `from-surface` với CSS var → Tailwind sinh fallback `--tw-gradient-to` nhưng bị `to-transparent` ghi đè, không lỗi |
| Stacking | PASS — `isolate` trên article; ảnh và lớp nền cùng `-z-10`, lớp nền đứng sau trong DOM → nằm trên ảnh, dưới chữ, trên nền `bg-surface` của article |
| a11y | PASS — ảnh và lớp nền `pointer-events-none`; lớp nền `aria-hidden="true"`; ảnh giữ `alt={solution.alt}` như trước (không regression; alt mô tả vẫn chấp nhận được dù ảnh mang tính trang trí) |
| Comment khớp code | PASS — JSDoc mask + JSDoc thẻ mô tả đúng width 60%, lớp nền mọi breakpoint, cột chữ 56%, lý do `object-[40%_50%]`, lý do không dùng `HomeImage` |
| Ngoài scope | PASS — chỉ `SolutionGridHome.tsx`; không đổi `HomeImage.tsx`, `content/home.ts`, ảnh, i18n |
| `as CSSProperties` → `satisfies CSSProperties` | PASS — chặt hơn, typecheck PASS |

## Findings
Không có finding blocking.

- **[NIT / chấp nhận] Bỏ fallback `onError` của `HomeImage`.** Trước đây ảnh lỗi → `<div role="img">` rỗng; giờ ảnh lỗi → trình duyệt hiện icon ảnh hỏng + alt text ở nửa phải (vẫn bị mask + lớp nền làm mờ phần lớn). Rủi ro thấp: 3 ảnh là file tĩnh local `public/images/illustrations/home-*.png`, đã build/visual PASS; không có nguồn remote. Không cần sửa; nếu sau này muốn đồng nhất thì thêm prop `fill` optional cho `HomeImage` (ngoài scope task này).
- **[NIT] `alt` mô tả cho ảnh trang trí.** Ảnh thuần minh hoạ, có thể dùng `alt=""` để screen reader bỏ qua; nhưng giữ nguyên behavior CR-016 và nội dung `content/home.ts` nằm ngoài scope → không yêu cầu đổi.

## Residual risk
- Chưa có screenshot 1024 (lg 3 cột, nền phủ tới 90% → ảnh chỉ rõ ~10–25% phải) và 768 — chỉ có số đo DOM. Nếu user thấy ảnh ở lg quá mờ có thể hạ `lg:to-85%` (tuning thẩm mỹ, không phải defect).
- Không có test tự động cho UI này (component trình bày, chấp nhận được).

## Verdict
**PASS**
