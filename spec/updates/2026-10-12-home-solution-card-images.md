# Spec Update — 2026-10-12 home-solution-card-images

**spec_version:** 3.0.0 → 3.0.0 (**KHÔNG bump — không đổi requirement/behavior contract**)
**Trigger:** feature-update (change-request, class MODIFY asset + layout UI)
**Change:** `spec/changes/2026-10-12-home-solution-card-images.md` (risk LOW–MEDIUM)
**Tasks:** T01 thay 3 ảnh minh hoạ thẻ giải pháp trang chủ + cho 3 thẻ cao đều / text thẳng hàng — **done**, review PASS (NORMAL)
**Nguồn:** mô tả trực tiếp của user — _"3 ảnh đầu t gửi, thay lần lượt vào 3 ảnh theo thứ tự trong ảnh 3, bên cạnh đó cho vị trí nó bằng nhau đi, text thẳng hàng, cả thẻ cao bằng nhau luôn"_

## Requirements

- **KHÔNG thêm/sửa/xoá requirement nào.** `SPECIFICATIONS.md` giữ nguyên 27 req R-01…R-27.
  - **R-02** (`SPECIFICATIONS.md:58`) — Module 1 Trang chủ `/`: "Khối 3 mảng giải pháp (Doanh nghiệp /
    AI / App AI) — 3 card, điều hướng đúng trang, có hover state" — change này **giữ nguyên** số thẻ
    (3), đích điều hướng (`/solutions/enterprise`, `/solutions/ai`, `/products`) và hover state.
    Chỉ đổi **asset ảnh** + căn chỉnh bố cục trong thẻ ⇒ vẫn thoả R-02, không cần đổi ngữ nghĩa.
  - `docs/DESIGN.md:83` chỉ mô tả thứ tự khối trang chủ ("hero → 3 mảng → sản phẩm → case study → CTA"),
    không mô tả ảnh từng thẻ ⇒ không có as-built doc nào phải reconcile.
- **Lý do KHÔNG bump:** theo `docs/SPEC_VERSIONING.md` — chỉ đổi **dữ liệu nội dung/asset** của khối
  có sẵn + class Tailwind căn chỉnh thẻ, không requirement nào thêm/sửa/xoá/đổi ngữ nghĩa.

## Thay đổi

### T01 — `src/content/home.ts` (vi + en)
- 3 `solutionCards[].image` → `/images/illustrations/home-enterprise.jpg` (thẻ 1 Giải pháp Doanh nghiệp),
  `home-ai.jpg` (thẻ 2 Giải pháp AI), `home-apps.jpg` (thẻ 3 Ứng dụng AI) — **thứ tự gán cố định**.
- `alt` viết lại VI + EN đúng ngôn ngữ, mô tả đúng nội dung ảnh (điện thoại + icon biểu đồ/nhân sự/
  cài đặt/lưới ứng dụng · khối AI + icon sparkle/chat/tài liệu/code · dashboard biểu đồ tăng trưởng +
  biểu tượng nhóm người).
- **Bỏ `shot: true`** ở thẻ 1 ⇒ cả 3 thẻ dùng cùng nhánh layout thường của `SolutionCard`
  (`p-4` + khung `aspect-[16/10] rounded-lg object-cover`).
- **Asset mới** (copy sẵn): `public/images/illustrations/home-enterprise.jpg` (557×390),
  `home-ai.jpg` (555×390), `home-apps.jpg` (554×390).

### T01 — `src/components/cards/SolutionCard.tsx`
- Link thẻ `h-full flex flex-col`; thân thẻ `flex flex-1 flex-col`; CTA "Tìm hiểu thêm" `mt-auto`
  ⇒ 3 thẻ cao đều trong lưới và tiêu đề/mô tả/CTA thẳng hàng theo cột.
- **KHÔNG đổi** `cardLinkClass` / `cardImageClass` / `cardShotFrameClass` (`cardStyles.ts` dùng chung
  `AppCard` / `CaseStudyCard` / `ProductCard` / `PostCard`).
- **KHÔNG đổi** `SolutionGridHome.tsx` (lưới đã `align-items: stretch`; `.reveal-item` là grid item),
  `.mdx` solutions, OG/JSON-LD/sitemap (`home.solutionCards[].image` không phục vụ OG).

## Test scope (v17)

- **Trang bị đổi:** `/` + `/en` — khối "3 mảng giải pháp" (`SolutionGridHome`).
- **Blast radius:** `SolutionCard` dùng chung với `/solutions/enterprise` (4 thẻ) và `/solutions/ai`
  (3 thẻ) — 2 trang này render **nhánh `shot=true`** và card nằm trong `<li>` → `<Reveal>` →
  `.reveal-item` **không** bị ràng buộc chiều cao ⇒ `h-full` resolve về `auto`, `flex-1`/`mt-auto`
  không có free space ⇒ bố cục 2 trang **không đổi** (phải kiểm bằng HTML build).
- **Regression cần giữ:** `/solutions/enterprise` + `/solutions/ai` (`shot` + ảnh `cardImage` + alt
  nguyên trạng); `cardStyles`/`AppCard`/`CaseStudyCard`/`ProductCard`/`PostCard` không đổi;
  hover/`focus-visible`/`line-clamp-2` của thẻ giữ nguyên; OG = `og-default.png`.
- Verify: `npm run lint` (0 errors, 1 warning pre-existing `src/components/mdx/index.tsx`) ·
  `typecheck` PASS · `build` PASS. HTML build `/` + `/en`: 3 ảnh mới xuất hiện, 0 tham chiếu
  `lms/01-tong-quan.png` / `ai-analysis.svg` / `ai-apps.svg` ở thẻ trang chủ.
- test framework: **skip** — `test_command: null`.

## Phân tích

- **Không blocker.** Diff nhỏ (1 file content + 1 component + 3 asset). Rủi ro LOW–MEDIUM vì
  `SolutionCard` là component dùng chung (đã kiểm không regression 2 trang kia qua HTML build).
- Residual: chưa render browser thật để xác nhận "3 thẻ cao đều" bằng mắt (lưới stretch + `h-full`
  đã kiểm bằng cấu trúc DOM HTML build); `object-cover` khung 16/10 với ảnh tỉ lệ ~1.42 cắt ~6%
  chiều cao mỗi mép — ảnh là illustration phẳng có lề rộng nên không mất chi tiết.
