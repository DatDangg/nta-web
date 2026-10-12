# Spec Update — 2026-10-12 brand-logo-lockup

**spec_version:** 3.0.0 → 3.0.0 (**KHÔNG bump — không đổi requirement/behavior contract**)
**Trigger:** feature-update (change-request, class MODIFY UI/brand asset)
**Change:** `spec/changes/archive/2026-10-12-brand-logo-lockup.md` (risk LOW; review **STRICT**)
**Tasks:** T01 đổi logo Header+Footer sang lockup mới (mark + "NTA" + tagline) — **done**, review PASS (STRICT, round 1 + round 2)
**Nguồn:** mô tả trực tiếp của user — _"thay logo của header thành cái này đi nhé"_ (+2 ảnh logo NTA).
User đã chốt: **(1)** áp dụng **cả Header + Footer** (component `BrandLogo` dùng chung); **(2)** hiển thị **đầy đủ mark + chữ "NTA" + tagline "ELEVATING INTELLIGENCE"** (không cắt tagline).

## Requirements

- **KHÔNG thêm/sửa/xoá requirement nào.** `SPECIFICATIONS.md` giữ nguyên 27 req R-01…R-27.
  - Không có R-xx nào quy định **thành phần** logo thương hiệu (R-11 chỉ nói nav/footer).
  - R-24 (WCAG 2.1 AA) **không đổi/không suy giảm**: tên thương hiệu cho screen reader vẫn còn qua
    `aria-label` của `<Link>` bao ngoài logo (`homeLabel` = "NTA, trang chủ" / "NTA, home").
- **Lý do KHÔNG bump:** theo `docs/SPEC_VERSIONING.md` — chỉ đổi **asset + thành phần hiển thị** của một
  presentational component (đổi ảnh mark-only → lockup), không requirement nào thêm/sửa/xoá/đổi ngữ nghĩa.

## Thay đổi

### T01 — lockup mới ở Header + Footer (2 file code/asset + 1 dòng design doc)
- `public/images/brand/logo-lockup.png`: overwrite asset cũ (lockup **nền trắng đục** 2000×750, **0 reference**
  trong `src/`) bằng **ảnh user** đã **crop sát nội dung** → **488×137, PNG RGBA nền trong suốt**.
- `src/components/layout/BrandLogo.tsx`: `LOGO_MARK_SRC` (`logo-mark.png`, 480×397, `h-9`) →
  `LOGO_LOCKUP_SRC` (`logo-lockup.png`, 488×137), `width={488}` / `height={137}`, `className="h-10 w-auto"`;
  cập nhật docblock. Giữ `alt=""` + `aria-hidden="true"` + prop `priority`.
- `.context/design-spec.md:22`: reconcile (mark-only → lockup `logo-lockup.png`: mark + wordmark "NTA" + tagline).
- **KHÔNG đổi:** `Header.tsx`, `Footer.tsx` (đều gọi `BrandLogo` → tự đổi theo), i18n (`vi.json`/`en.json`),
  JSON-LD (`jsonld.ts` vẫn `logo-square.png`), `logo-mark.png` (giữ file, nay 0 reference trong `src/`).

## Test scope (v18)

- **Trang bị đổi:** Header + Footer trên **mọi route**, cả 2 locale (VI+EN) — qua `BrandLogo`.
- **Blast radius:** `BrandLogo` chỉ có 2 caller (`Header.tsx:51`, `Footer.tsx:21`) — grep xác nhận.
- **Regression cần giữ:** a11y name link home (`"NTA, trang chủ"` / `"NTA, home"`), JSON-LD `logo-square.png`,
  layout Header/Footer không vỡ (logo `h-10` = 40px < header 64/72px), JSON-LD không bị đụng.
- Verify: `npm run lint` (0 errors, 1 warning pre-existing `src/components/mdx/index.tsx`) · `typecheck`
  PASS · `build` PASS (chạy trong **bản copy cách ly** — `next dev` đang chiếm `.next` ở port 3000).
  HTML build `vi.html` / `en.html` / `en/about.html` / `vi/contact.html`: `logo-lockup.png` = **9**,
  `logo-mark.png` = **0**, `>NTA<` = **0**, `aria-label` home (VI/EN) còn.
- `check-left-align` / test framework: **skip** — `test_command: null`.

## Phân tích

- **Không blocker.** Diff 1 component + 1 asset; brand name cho screen reader/SEO giữ nguyên.
- Residual (MINOR, non-blocking):
  1. Tagline "ELEVATING INTELLIGENCE" chỉ cao ~5–6px ở `h-10` (40px) → **không đọc được rõ**; trade-off cố hữu
     của full lockup trong header 64/72px. Cần **user xác nhận thị giác** (tăng cỡ logo hoặc bỏ tagline nếu muốn).
  2. Chưa có screenshot browser thật (tool screenshot cần desktop window hiển thị) → chưa chứng minh thị giác
     375/768/1280 + mức độ chật ở `lg` ~1024px (ước tính header còn ~150px slack ⇒ rủi ro thấp).
