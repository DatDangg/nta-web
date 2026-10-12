# phase-1-task-01 — Bỏ wordmark "NTA" khỏi BrandLogo (chỉ giữ mark)

- **Change:** `spec/changes/2026-10-12-brand-logo-wordmark-removal.md`
- **Slug:** `change-brand-logo-wordmark-removal`
- **Phase:** 1 (UI — component dùng chung)
- **Status:** done

## Scope

Sửa **duy nhất** `src/components/layout/BrandLogo.tsx`: bỏ `<span>NTA</span>` (wordmark), giữ `logo-mark.png`.
Không đổi asset, không đổi Header/Footer markup, không đổi i18n, không đổi JSON-LD.

## Classification / Risk

| Mục | Giá trị |
|---|---|
| Change type | MODIFY (UI/brand component dùng chung) |
| Scope | 1 file (`src/components/layout/BrandLogo.tsx`), 2 caller (`Header.tsx`, `Footer.tsx`) |
| Expected review level | NORMAL (không shared logic/API/auth/DB; shared UI component nhưng không có contract) |
| Blast radius | Header + Footer toàn site (2 locale). Không lan sang route/API/data |
| Root cause category | N/A (feature/UI change, không phải bug) |
| Doc impact | none (xem §Doc / Decision Impact) |
| Decision impact | Không đổi kiến trúc/ownership/API contract → không cần `.context/decisions.md` |

## Inputs

- `src/components/layout/BrandLogo.tsx` (dòng 18–29)
- Reference: `Header.tsx:51`, `Footer.tsx:21`, `src/i18n/messages/vi.json:15`, `en.json:15`

## Acceptance Criteria

1. `BrandLogo` không còn text "NTA" trong DOM; chỉ còn `<Image src="/images/brand/logo-mark.png">`.
2. Header (VI+EN) + Footer (VI+EN) vẫn render mark, không layout vỡ (`inline-flex items-center`).
3. Accessible name của link home giữ nguyên `"NTA, trang chủ"` / `"NTA, home"` (nhờ `aria-label` từ `homeLabel`).
4. `jsonld.ts` vẫn trỏ `logo-square.png`; `logo-lockup.png` vẫn unused (không thêm reference mới).
5. Build HTML: markup brand logo không còn chuỗi `>NTA<` trong vùng logo.
6. `npm run lint` / `npm run typecheck` / `npm run build` PASS (`test_command: null` → skip, no test framework).

## Verification Plan

```
web lint      → npm run lint        (expect PASS)
web typecheck → npm run typecheck   (expect PASS)
build         → npm run build       (expect PASS, đủ route SSG như trước)
grep          → "NTA" trong src/components/layout/BrandLogo.tsx = 0
build HTML    → .next/server/app/[locale]... hoặc .next/*.html: kiểm vùng header/footer logo
```

## Feature Verification

- **Acceptance criteria:** PASS (1–6). `BrandLogo` chỉ còn `<Image logo-mark.png>` (DOM không còn "NTA");
  Header+Footer VI+EN render mark; a11y name link home `"NTA, trang chủ"`/`"NTA, home"` giữ nguyên;
  `jsonld.ts` vẫn `logo-square.png`, `logo-lockup.png` vẫn unused; không đụng Header/Footer/MobileNav.
- **Verify commands:**
  - `npm.cmd run typecheck` → **PASS** (exit 0).
  - `npm.cmd run lint` → **PASS** (exit 0; 0 errors, 1 warning pre-existing `src/components/mdx/index.tsx:25 no-img-element`).
  - `npm.cmd run build` → **PASS** (exit 0) — chạy với `distDir: '.next-build'` trong `next.config.ts` để tránh
    tranh chấp thư mục `.next` với một `next dev` nền (opencode background) liên tục (tái)khởi động. Đã chứng minh
    failure (`Invariant: no direct app page entry found for /_not-found`, `ENOENT …/{...}/page.ts`) là **giả** và
    **không do diff**: build trên HEAD (stash `BrandLogo.tsx`) cũng fail tương tự. Sau verify đã revert
    `next.config.ts` + `tsconfig.json` + `next-env.d.ts` về HEAD.
  - HTML build `.next-build` VI `/vi`: `>NTA<` = **0**; `logo-mark.png` = 9; `aria-label="NTA, trang chủ"` còn (header+footer).
  - `test_command: null` → **skip, no test framework**.
- **Reviewer verdict:** **PASS** (STRICT, round 1) — `.context/review-reports/change-brand-logo-wordmark-removal-phase-1-task-01-round-1-review.md`.
  0 CRITICAL/MAJOR; 2 MINOR non-blocking (footer logo tappable ≈43.5px <44 AAA → task riêng; `design-spec.md:22`
  stale → đã reconcile trong close-out).
- **Spec Validator verdict:** PASS (inline — không có requirement nào đổi; spec 3.0.0 KHÔNG bump, scope v14→v15).
- **Residual risk:** chưa render browser thật (chỉ HTML build + CSS math); MINOR #1 touch-target Footer còn treo (task riêng).


## Retry / Error Memory

- Attempt 1: —
- (Mọi failed attempt phải append `.context/error-memory.md` hoặc ghi rõ vì sao không có entry.)

## Doc / Decision Impact

- **Doc impact: none.** `docs/DESIGN.md` không mô tả thành phần logo thương hiệu (chỉ có `PartnerLogos` ở
  trang Về NTA — không liên quan). `docs/API_SPEC.md` / `docs/ERD.md`: N/A.
- `.context/design-spec.md:22` có câu cũ "logo (trái, text wordmark 'NTA' khi chưa có logo OQ#1)" — **đã stale
  từ commit `eb2a6f6`** (đã có logo mark thật), không phải intent doc thuộc diện cấm sửa; reconcile ghi kèm
  trong close-out nếu cần (không chặn).
- Không đổi kiến trúc/ownership/API contract → không append `.context/decisions.md`.
