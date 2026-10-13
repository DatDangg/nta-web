# Review — feature-home-sections-redesign · phase-1-task-01 · round 1

- **Agent:** reviewer
- **CR:** CR-016 (`spec/changes/2026-10-14-home-sections-redesign.md`) · mockup `2.webp` nửa trên
- **Ngày:** 2026-10-14

## Review level
**NORMAL**

## Reason
Thay đổi UI trang chủ, component mới riêng trang chủ (`HomeSectionHeader`, `SolutionHomeCard`), không đụng API/schema/auth/shared service.
`SolutionCard` dùng chung KHÔNG bị sửa (đã kiểm: chỉ bỏ import khỏi `SolutionGridHome`). Đổi shape `HomeContent.solutionCards` là dữ liệu nội bộ, chỉ 1 nơi tiêu thụ.

## Blast radius
`/` và `/en` (khối "Giải pháp"). Key i18n `home.solutionsTitle` bị thay — grep `src/` không còn nơi dùng. Field `shot?` bỏ khỏi `home.ts` — không còn tham chiếu ngoài `SolutionCard` (prop riêng của card, không liên quan).

## Scope đã review
- `src/components/home/HomeSectionHeader.tsx` (mới)
- `src/components/home/SolutionGridHome.tsx`
- `src/content/home.ts`
- `src/i18n/messages/vi.json`, `src/i18n/messages/en.json`
- `src/app/[locale]/page.tsx`
(Bỏ qua `.context/project-config.md` — file user, ngoài scope.)

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS (tsc --noEmit, 0 lỗi) — reviewer tự chạy |
| `npm run lint` | PASS — 0 error, 1 warning có sẵn `src/components/mdx/index.tsx:25` no-img-element (ngoài scope) — reviewer tự chạy |
| `npm run build` | Không chạy ở agent (native binding @swc lỗi môi trường). Evidence chấp nhận: `npm.cmd run build` PASS ở terminal user qua primary session (59/59 static pages, chỉ warning cũ mdx) |
| Visual 375/768/1280 | Không có trình duyệt → review tĩnh (xem dưới) |

## Kiểm tra theo acceptance
- **Bố cục/thứ bậc/màu vs `2.webp`:** eyebrow chữ hoa teal + gạch ngang; H2 2 dòng (lead đậm đen + accent gradient teal qua `AccentText`); mô tả cột phải trên lg; 3 thẻ ngang lg; thẻ có ô icon vuông viền teal nhạt, tiêu đề + mô tả, 3 bullet icon teal tròn, link teal "… →" ở đáy, ảnh minh hoạ góc phải-dưới fade trái/trên. Khớp mockup. Bullet theo bản user chốt (khác chữ mockup — đúng quyết định user).
- **i18n:** 4 key mới có đủ VI/EN; eyebrow "SOLUTIONS" cả 2 locale (user chốt); bullet/linkLabel/alt VI+EN trong `home.ts`. Không hardcode chữ hiển thị trong component.
- **Link/route:** `href.replace(/^\/en(?=\/)/, '')` → `/solutions/enterprise`, `/solutions/ai`, `/products`; render qua `Link` của `@/i18n/navigation` → tự thêm locale prefix. Đúng route hiện có.
- **A11y:** `<section aria-labelledby>` ↔ `h2#home-solutions-title`; thứ bậc h2 → h3; icon trang trí `aria-hidden`; mũi tên "→" `aria-hidden`; link là CTA duy nhất, `min-h-11` (44px), focus-visible outline `focus` + box-shadow global; ảnh có alt i18n, lớp ảnh `pointer-events-none`. Tương phản `primary-active` #00695a trên trắng đạt AA.
- **Responsive (tĩnh):**
  - 375: header xếp dọc (`flex-col`), H2 clamp min 1.75rem; thẻ 1 cột, chữ full width, ảnh 55% `opacity-30` nằm sau chữ (`-z-10` trong `isolate`); `overflow-hidden` trên thẻ → không tràn ngang. `min-w-0` ở các flex con.
  - 768: thẻ 1 cột, chữ `max-w-[60%]`, ảnh 48% opacity 100 bên phải → không đè chữ.
  - 1024–1279: 3 cột hẹp, chữ full width, ảnh 60% opacity 30 (đã nêu residual risk ở task).
  - 1280: chữ `max-w-[64%]`, ảnh 52% full opacity.
- **Tái dùng task 02/03:** `HomeSectionHeader` server-safe, không state; props `descriptionPlacement: 'right' | 'below'`, `actions?: ReactNode`, `accentOnNewLine?` đủ cho header "Sản phẩm" (mô tả phải + ←/→) và case study (mô tả dưới + actions).
- **Scope discipline:** không sửa `SolutionCard`/`ProductStrip`/`CaseStudyHighlight`. Hex tuỳ ý (`#cdeee6`, `rgb(0 158 135/…)`) khớp quy ước sẵn có (AboutHero, ListingHero) — không coi là defect.

## Findings
Không có finding mức blocker/major.

Nit (không chặn, không bắt sửa):
1. **N1 — `sizes` ảnh ở lg 1024–1279** (`SolutionGridHome.tsx`, `HomeImage sizes`): khoảng này rơi vào `(min-width: 768px) 360px` trong khi ảnh thực ~180px → tải ảnh lớn hơn cần. Có thể thêm `(min-width: 1024px) 200px`. Ảnh hưởng hiệu năng nhỏ.
2. **N2 — eyebrow tiếng Anh trên trang VI**: "SOLUTIONS" trong trang `lang="vi"` có thể bị trình đọc màn hình đọc theo giọng Việt; có thể bọc `lang="en"` khi locale vi. Rất nhỏ; user đã chốt dùng tiếng Anh.
3. **N3 — visual chưa xác minh thực tế**: chồng ảnh–chữ ở lg 1024–1279 (opacity 30%) và viền ảnh nền RGB so với `bg-surface` cần nhìn bằng mắt khi môi trường chạy được dev server (residual risk đã ghi trong task).

## Verdict
**PASS**
