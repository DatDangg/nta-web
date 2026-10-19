# feature-home-layout-alignment · phase-1-task-02 — Hero desktop trong stage 1440 căn giữa

- **CR:** CR-040 · spec **R-01b** (4.8.0), giữ R-01, R-22 (LCP)
- **Status:** pending (chờ user duyệt plan; làm sau task 01) · attempt 0
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

## Verify
- typecheck / lint / build như task 01.
- Ảnh chụp 1024/1280/1440/1920/2560 vi + en: ≤ 1440 giống trước (so ảnh), > 1440 ảnh không chạm mép phải viewport, panel không đè chữ,
  mép trái chữ hero = mép khung chung (≤ 2px). 375/768: không đổi.
- Không thanh cuộn ngang 1024–2560.

## Retry / Escalation
- Max 3 attempt; FAIL lần 3 → `architecture_review_needed`.

## Evidence
_(builder điền)_
