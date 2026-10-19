Agent: reviewer

# Review — feature-home-layout-alignment · phase-1-task-02 · round 1 (CR-040, R-01b)

- **Review level:** NORMAL
- **Reason:** UI-only, chỉ trang chủ `lg+`; không đụng auth/API/schema/shared service. `HeroBackground`/`Hero` chỉ dùng ở `/` (vi+en). Rủi ro: thẩm mỹ + LCP ảnh hero (R-22) + motion.
- **Blast radius:** `src/components/home/HeroVisual.tsx` (`HeroBackground`), `src/components/home/Hero.tsx` (chiều cao section + cỡ h1), `src/components/home/HomeProductCard.tsx` (default `imageSizes` — chỉ ảnh hưởng srcset chọn ảnh, không đổi layout), `docs/DESIGN.md` (as-built). `HeroMobileImage` (< lg) không đổi trong diff.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS (tsc --noEmit, 0 lỗi) |
| `npm run lint` | PASS (0 error, 1 warning có sẵn `src/components/mdx/index.tsx:26`, ngoài scope) |
| `npm run build` | không chạy lại (build local lỗi swc, đã biết); builder PASS bằng `docker build --target builder` — chấp nhận theo chỉ đạo |

## Kiểm theo yêu cầu
- **Scope:** đúng 6 mục task; không drive-by refactor. Stage `relative mx-auto h-full w-full max-w-[1440px]` bọc khung ảnh + panel + phủ trắng, vẫn trong `absolute inset-0 -z-10 hidden lg:block`. Mờ đáy giữ full-width (lý do hợp lý: ngoài stage nền trắng, tránh mép dọc).
- **Công thức sizes** (khung = cao × 1787/880 = cao × 2.0307; cao = clamp(540, 46vw, 662)):
  - ≥ 1440: 662 × 2.0307 = 1344.3 → `1345px` ✓
  - 1174–1440: 0.46 × 2.0307 = 93.4vw → `94vw` ✓ (dư nhẹ, an toàn); 540/0.46 = 1173.9 → mốc `1174` ✓
  - 1024–1174: 540 × 2.0307 = 1096.6 → `1097px` ✓; `1px` < lg giữ như cũ (ảnh ẩn). `priority` giữ ✓ (LCP R-22).
- **≤ 1440 không đổi:** stage = viewport ⇒ khung ảnh `right-0`, phủ trắng `inset-0` cùng hệ quy chiếu như trước; thứ tự vẽ (ảnh → fade trái → panel → phủ trắng → mờ đáy) giữ nguyên. Fade phải `min-[1441px]:block` ẩn ở ≤ 1440. Section clamp max chỉ bind khi 46vw > 662 (≈ > 1439px) ✓. Số đo Evidence 1440 (ảnh 95.7–1440, panel tới 1406.4) khớp hiện trạng.
- **< lg không đổi:** `HeroMobileImage` không nằm trong diff; class `lg:` duy nhất bị đổi ✓. h1 cap chỉ có hiệu lực > 1440 nên 375/768 không đổi ✓.
- **a11y:** `alt={imageAlt}` giữ; fade mới, panel, phủ trắng đều `aria-hidden` ✓. h1 vẫn duy nhất.
- **Tràn ngang:** stage `w-full max-w` trong lớp `absolute inset-0`; khung ảnh tràn trái ở 1024 (−72.6) bị section `overflow-hidden` cắt như trước; Evidence scrollW = clientW 375→2560 ✓.
- **Doc as-built:** `docs/DESIGN.md` dòng "Hero desktop (as-built, R-01b, CR-040)" khớp code (stage 1440, clamp 662, fade w-24, h1 4.46rem, sizes, mobile không đổi) ✓. Không đụng intent docs.
- **h1 cap 4.46rem (ngoài chữ "nếu đè panel" của task):** **CHẤP NHẬN.** 0.5rem + 4.4vw tại 1440 = 8 + 63.36 = 71.36px = 4.46rem đúng tuyệt đối → với mọi viewport ≤ 1440 công thức ≤ max, không đổi gì. Spec R-01b (SPECIFICATIONS.md:65-66) ghi rõ mục tiêu "chiều cao hero tối đa 662px … để bố cục chữ ↔ ảnh như ở 1440" và design-spec.md:148 "không phóng to chữ ngoài clamp; hero stage ≤ 1440" — cap h1 là hệ quả trực tiếp của yêu cầu đó (ảnh dừng 662 mà chữ tiếp tục lớn 29% thì phá tỉ lệ). Lý do + số đo đã ghi Evidence. Không cần spec delta riêng.
- **Motion / reduced-motion:** class `motion-load-zoom`, `hero-pop`, `split-line` giữ nguyên; reduced-motion không bị ảnh hưởng. **Nhưng** có regression motion ở > 1440 — xem F1.

## Findings

### [MAJOR] F1 — > 1440: animation zoom ảnh hero tràn ra ngoài mép phải stage, vượt qua dải fade, cắt cứng trong ~1.4s mỗi lần tải
- **Vị trí:** `src/components/home/HeroVisual.tsx:148-159` (stage / khung ảnh không clip) + `src/app/globals.css:157-164` (`@keyframes motion-load-zoom { from { transform: scale(1.08) } }`, 1400ms).
- **Phân tích:** `<Image fill>` có `transform: scale(1.08)` quanh tâm khung 1345px → tràn ~54px mỗi bên. Khung ảnh và stage đều **không** `overflow-hidden`. Trước đây ảnh dính mép phải viewport nên section `overflow-hidden` cắt phần tràn. Nay ở 1920: mép phải khung = 1680, ảnh lúc t=0 tràn tới ≈ 1734 với **mép cứng, đủ opacity** — dải fade `w-24` nằm trong khung (1584–1680) nên không che phần tràn. Kết quả: mỗi lần tải trang ở > 1440 (above the fold, ảnh LCP) mép phải ảnh "cắt cứng" lấn ra nền trắng rồi co lại — trái mục tiêu "mép phải stage mờ dần sang nền trắng, không cắt cứng" (R-01b, task scope 2) và yêu cầu "không regression motion". Builder đo/chụp với reduced-motion nên không thấy.
- **Fix đề xuất:** thêm `overflow-hidden` vào stage (`relative mx-auto h-full w-full max-w-[1440px] overflow-hidden`) — ≤ 1440 stage = section (vốn đã `overflow-hidden`) nên không đổi hình; hoặc `overflow-hidden` trên khung ảnh (pattern zoom chuẩn; phần tràn trái ở ≤ 1440 vốn nằm dưới lớp phủ trắng ~#fff nên khác biệt không đáng kể). Đây là clip animation hợp lệ, không phải "che lỗi layout". Chụp lại 1920 **không** reduced-motion ở t≈0–200ms để chứng minh.

### [MINOR] F2 — Hằng số `sizes` phụ thuộc chéo 2 file
- `HeroVisual.tsx:157` (`1345px`/`94vw`/`1174`/`1097px`) phụ thuộc clamp `540/46vw/662` ở `Hero.tsx:21` và tỉ lệ `1787/880`. Đã có comment cạnh `Image` và Residual risk ghi rõ → chấp nhận, không chặn. (Tuỳ chọn: comment ở `Hero.tsx:21` trỏ ngược `HeroVisual` sizes.)

### [MINOR] F3 — F1 task 01 (HomeProductCard `imageSizes` 600px)
- `HomeProductCard.tsx:25`: 508 → 600 khớp ½ dải trong khung 1216 (≈ 596). OK, chỉ ảnh hưởng chọn srcset, không đổi layout. Ghi nhận đã đóng.

## Responsive Checklist Gate (diff UI)
| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout — không horizontal scroll | OK | Evidence scrollW=clientW 375/768/1024/1280/1440/1920/2560; CSS: stage `w-full max-w`, tràn trái bị section clip như cũ |
| Layout — mobile-first / container không fixed px | OK | `max-w-[1440px]` là max (fluid ≤), `lg:` min-width; không đổi < lg |
| Typography — rem + clamp | OK | h1 `clamp(2.5rem,0.5rem+4.4vw,4.46rem)` |
| Media — ảnh có sizes/srcset đúng | OK | sizes khớp bề rộng thật (tính lại ở trên); `priority` giữ |
| Touch/Interaction | N/A | không đổi phần tử tương tác |
| Viewport/A11y — reduced-motion | OK | không đổi CSS motion; reduced-motion vẫn tắt animation |
| Viewport/A11y — không che lỗi bằng overflow:hidden | OK (lưu ý F1: fix đề xuất là clip animation, không che lỗi layout) | |

Ghi chú: reviewer không chạy browser; mốc 375/768/1280 xác minh bằng CSS math + số đo DOM trong Evidence. F1 xác minh bằng CSS math (transform không bị clip), chưa chụp — Residual risk thấp vì cơ chế rõ ràng.

## Skill gates
- aislop: skip, not installed (không có `node_modules/.bin/aislop`)
- oxlint (anti-slop): skip, oxlint not configured
- ocr (open-code-review): skip, ocr not installed
- AI-readable: OK — 0 indicator đáng kể (comment giải thích WHY, magic number sizes có comment công thức)
- ai-friendly-web: N/A (không đổi llms/robots/sitemap)
- blitzstrike: N/A (không phải task nhạy cảm)

## Residual risk
- F1 chưa xác nhận bằng ảnh chụp (suy từ CSS); thẩm mỹ dải trắng hai bên stage ở 2560 cần mắt người duyệt (đã ghi Evidence).

## Verdict: ❌ FAIL
Lý do: 1 MAJOR (F1 — regression motion > 1440, ảnh zoom tràn cắt cứng qua dải fade). Fix 1 class; còn lại (scope, sizes, ≤ 1440/< lg không đổi, a11y, doc, h1 cap) đạt.
