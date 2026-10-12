# phase-1-task-01 — Đổi logo sang lockup mới (`logo-lockup.png`) ở Header + Footer

- **Change:** `spec/changes/2026-10-12-brand-logo-lockup.md`
- **Slug:** `change-brand-logo-lockup`
- **Phase:** 1 (UI — component dùng chung + asset)
- **Status:** done

## Scope

1. Overwrite asset `public/images/brand/logo-lockup.png` bằng ảnh user đã **crop sát nội dung** (488×137, PNG RGBA nền trong suốt).
2. Sửa **duy nhất** `src/components/layout/BrandLogo.tsx`: đổi src → `/images/brand/logo-lockup.png`,
   `width={488}` `height={137}`, `className="h-10 w-auto"`, cập nhật docblock.
3. Reconcile `.context/design-spec.md:22` cho khớp behavior mới.

Không đổi: `Header.tsx`, `Footer.tsx`, i18n, JSON-LD (`jsonld.ts`), các asset logo khác.

## Classification / Risk

| Mục | Giá trị |
|---|---|
| Change type | MODIFY (UI/brand component dùng chung + asset) |
| Scope | 1 file code (`BrandLogo.tsx`) + 1 asset + 1 dòng design-spec; 2 caller (`Header.tsx:51`, `Footer.tsx:21`) |
| Expected review level | **STRICT** (shared component, mọi route/mọi locale) |
| Blast radius | Header + Footer toàn site (VI+EN). Không lan sang route/API/data/SEO |
| Root cause category | N/A (feature/UI change, không phải bug) |
| Doc impact | `docs/*`: none. `.context/design-spec.md:22` (design doc) → reconcile |
| Decision impact | Không đổi kiến trúc/ownership/API contract → không cần `.context/decisions.md` |

## Inputs

- Asset nguồn: `C:\Users\datda\AppData\Local\Temp\opencode\nta-logo-user-1.png` (816×306 RGBA) → crop bbox alpha còn 488×137
- `src/components/layout/BrandLogo.tsx`
- Reference: `Header.tsx:51`, `Footer.tsx:21`, `.context/design-spec.md:22`

## Acceptance Criteria

1. `public/images/brand/logo-lockup.png` là ảnh user đã crop sát nội dung (488×137, PNG RGBA nền trong suốt).
2. `BrandLogo` render `<Image src="/images/brand/logo-lockup.png" width={488} height={137} className="h-10 w-auto" alt="" aria-hidden="true">`.
3. Header (VI+EN) + Footer (VI+EN) render lockup, layout không vỡ (`inline-flex items-center`).
4. Accessible name của link home giữ nguyên `"NTA, trang chủ"` / `"NTA, home"`.
5. `priority` vẫn truyền từ Header (`<BrandLogo priority />`); `Footer.tsx`/`Header.tsx` không bị sửa.
6. `jsonld.ts` vẫn `logo-square.png`.
7. `.context/design-spec.md:22` không còn mô tả mark-only.
8. `npm run lint` / `npm run typecheck` / `npm run build` PASS (`test_command: null` → skip, no test framework).

## Verification Plan

```
web lint      → npm run lint        (expect PASS)
web typecheck → npm run typecheck   (expect PASS)
build         → npm run build       (expect PASS — dùng distDir tách riêng vì có `next dev` nền ở .next)
asset check   → PNG dims/format của public/images/brand/logo-lockup.png = 488x137 RGBA
grep          → logo-lockup.png xuất hiện trong src/components/layout/BrandLogo.tsx; logo-mark.png = 0 trong BrandLogo
build HTML    → .next-build/server/app/{vi,en}/**: header+footer render logo-lockup.png, không còn logo-mark.png
```

## Feature Verification

- **Acceptance criteria:** PASS (1–8).
  - (1) `logo-lockup.png` = 488×137, `Format32bppArgb`, góc `A=0` (trong suốt), 54,308 bytes.
  - (2)(5) `BrandLogo` render `logo-lockup.png` `width={488}` `height={137}` `className="h-10 w-auto"` `alt=""` `aria-hidden`; giữ `priority`; `Header.tsx`/`Footer.tsx` không sửa (`git diff` chỉ đụng `BrandLogo.tsx`).
  - (3) HTML build header+footer (VI+EN) render `logo-lockup.png`.
  - (4) `aria-label` home VI ("NTA, trang chủ") + EN ("NTA, home") còn trong HTML build.
  - (6) `jsonld.ts` vẫn `logo-square.png` (không đụng). (7) `design-spec.md:22` đã reconcile.
- **Verify commands:** (primary chạy thật)
  - `npm.cmd run lint` → **PASS** (0 errors, 1 warning pre-existing `src/components/mdx/index.tsx`).
  - `npm.cmd run typecheck` → **PASS** (exit 0).
  - `npm.cmd run build` → **PASS** (`✓ Compiled successfully`) — chạy trong **bản copy cách ly** `%TEMP%\opencode\nta-build` với `distDir: '.next-build'` (vì `next dev` đang chiếm `.next` ở port 3000). Log: `%TEMP%\opencode\nta-lockup-build.log`.
  - HTML build (`vi.html`, `en.html`, `en/about.html`, `vi/contact.html`): `logo-lockup.png` = **9**, `logo-mark.png` = **0**, `>NTA<` = **0**, `aria-label` home còn.
  - `test_command: null` → **skip, no test framework**.
- **Reviewer verdict:** **PASS** — round 1 + round 2 đều **STRICT** (shared component Header/Footer, mọi route/2 locale).
  Report: `.context/review-reports/change-brand-logo-lockup-phase-1-task-01-round-2-review.md`.
  Round 1 tìm MINOR (viền trong suốt rộng → logo nhỏ) → primary crop asset 488×137 + `h-10` → round 2 PASS (2 MINOR non-blocking).
- **Spec Validator verdict:** spec 3.0.0 **KHÔNG bump** (không đổi requirement) — verified trong change/update file; scope v18.
- **Residual risk:** (MINOR non-blocking) (1) tagline ~5–6px ở `h-10` → không đọc rõ, cần user xác nhận thị giác; (2) chưa screenshot browser thật (tool screenshot cần desktop window) → chưa chứng minh thị giác 375/768/1280 + độ chật `lg` (ước còn ~150px slack).

## Retry / Error Memory

- Attempt 1: —
- (Mọi failed attempt phải append `.context/error-memory.md` hoặc ghi rõ vì sao không có entry.)

## Retry / Escalation Policy

- Attempt 1 fail → `.agent/error-analyzer.md`, xác định lại root cause, fix tối thiểu.
- Attempt 2 fail → so với pattern đang chạy + kiểm tra lại assumption.
- Attempt 3 fail → **KHÔNG fix #4**; set `architecture_review_needed`, báo human.

## Doc / Decision Impact

- `docs/API_SPEC.md` / `docs/ERD.md` / `docs/DESIGN.md`: **no doc impact** (`docs/DESIGN.md` không mô tả
  thành phần logo thương hiệu — chỉ có `PartnerLogos` ở trang Về NTA).
- `.context/design-spec.md:22` — design doc (không phải intent doc cấm sửa) → reconcile trong task này.
- Không đổi kiến trúc/ownership/API contract → không append `.context/decisions.md`.
