# Spec Update — 2026-10-12 brand-logo-wordmark-removal

**spec_version:** 3.0.0 → 3.0.0 (**KHÔNG bump — không đổi requirement/behavior contract**)
**Trigger:** feature-update (change-request, class MODIFY UI/brand component)
**Change:** `spec/changes/archive/2026-10-12-brand-logo-wordmark-removal.md` (risk LOW)
**Tasks:** T01 `BrandLogo` bỏ wordmark "NTA", chỉ giữ mark — **done**, review PASS (STRICT)
**Nguồn:** mô tả trực tiếp của user — _"ở logo ấy, xóa chữ NTA đi, để mỗi cái kia thôi"_

## Requirements

- **KHÔNG thêm/sửa/xoá requirement nào.** `SPECIFICATIONS.md` giữ nguyên 27 req R-01…R-27.
  - Không có R-xx nào quy định **thành phần** của logo thương hiệu (R-11 chỉ nói nav/footer).
  - R-24 (WCAG 2.1 AA) **không đổi/không suy giảm**: tên thương hiệu cho screen reader vẫn còn qua
    `aria-label` của `<Link>` bao ngoài logo (`homeLabel` = "NTA, trang chủ" / "NTA, home").
- **Lý do KHÔNG bump:** theo `docs/SPEC_VERSIONING.md` — chỉ đổi **thành phần hiển thị** của một
  presentational component (bỏ một node text tĩnh), không requirement nào thêm/sửa/xoá/đổi ngữ nghĩa.

## Thay đổi

### T01 — `src/components/layout/BrandLogo.tsx` (1 file, +6/−6)
- Bỏ `<span className="text-xl font-semibold tracking-tight text-text-primary">NTA</span>` (wordmark).
- Bỏ `gap-2` ở wrapper `<span className="inline-flex items-center …">` (chỉ còn 1 child).
- Cập nhật docblock cho khớp (logo = chỉ mark; a11y name do `aria-label` ở `<Link>` ngoài).
- **KHÔNG đổi:** `Header.tsx`, `Footer.tsx`, `MobileNav.tsx`, i18n (`vi.json`/`en.json`), JSON-LD
  (`jsonld.ts` vẫn `logo-square.png`), asset (`logo-lockup.png` vẫn unused — 0 reference trong `src/`).

## Test scope (v15)

- **Trang bị đổi:** Header + Footer trên **mọi route**, cả 2 locale (VI+EN) — qua `BrandLogo`.
- **Blast radius:** `BrandLogo` chỉ có 2 caller (`Header.tsx:51`, `Footer.tsx:21`) — grep xác nhận.
- **Regression cần giữ:** a11y name link home (`"NTA, trang chủ"`/`"NTA, home"`), JSON-LD `logo-square.png`,
  `logo-lockup.png` unused, layout Header/Footer không vỡ.
- Verify: `npm.cmd run lint` (0 errors, 1 warning pre-existing `src/components/mdx/index.tsx`) · `typecheck`
  PASS · `build` PASS (chạy với `distDir` tách riêng để tránh tranh chấp `.next` với dev server rác).
  HTML build `.next-build` VI `/vi`: `>NTA<` = **0**, `logo-mark.png` = 9, `aria-label="NTA, trang chủ"` còn.
- `check-left-align` / test framework: **skip** — `test_command: null`.

## Phân tích

- **Không blocker.** Diff 1 file, subtractive JSX; brand name cho screen reader/SEO giữ nguyên.
- Residual: (1) Footer logo link tappable ≈43.5px (<44px AAA) sau khi bỏ wordmark — **MINOR non-blocking**
  (WCAG 2.5.8 AA 24×24 vẫn PASS), đề xuất task riêng thêm padding cho `<Link>` logo Footer;
  (2) build fail giả khi có `next dev` dùng chung `.next` (không liên quan diff — đã chứng minh HEAD cũng fail).
