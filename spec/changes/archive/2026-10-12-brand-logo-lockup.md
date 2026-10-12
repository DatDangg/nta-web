---
id: brand-logo-lockup
type: feature
status: done
created: 2026-10-12
---

# 2026-10-12 — Đổi logo Header/Footer sang lockup mới (mark + chữ "NTA" + tagline)

## Yêu cầu

Nguyên văn user: _"thay logo của header thành cái này đi nhé"_ + **2 ảnh logo NTA** đính kèm
(mark teal + chữ "NTA" + tagline "ELEVATING INTELLIGENCE").

User đã **CHỐT** qua câu hỏi làm rõ:

1. Áp dụng cho **CẢ Header + Footer** (component `BrandLogo` dùng chung cho cả hai).
2. Hiển thị **đầy đủ mark + chữ "NTA" + tagline** — **không cắt** tagline.

## Bối cảnh / khảo sát (đã xác minh)

| Hạng mục | Sự thật trên đĩa |
|---|---|
| Asset nguồn user gửi | Đã trích ra đĩa: `C:\Users\datda\AppData\Local\Temp\opencode\nta-logo-user-1.png` — **816×306, PNG RGBA, nền TRONG SUỐT**, wordmark near-black (~#191E24), mark teal. Ảnh có viền trong suốt rộng → **crop sát nội dung** (bbox alpha) còn **488×137** trước khi dùng |
| Asset đích | `public/images/brand/logo-lockup.png` — trước là lockup **nền trắng đục** 2000×750 và **0 reference** trong `src/` (unused) → an toàn để overwrite; nay = lockup đã crop **488×137 PNG RGBA nền trong suốt** |
| Component render logo | `src/components/layout/BrandLogo.tsx` — hiện `LOGO_MARK_SRC='/images/brand/logo-mark.png'`, `width 480`, `height 397`, `className="h-9 w-auto"`, `alt=""` + `aria-hidden="true"`, prop `priority` |
| Nơi dùng | `Header.tsx:51` (`<BrandLogo priority />` trong `<Link aria-label=homeLabel className="flex min-h-11 items-center px-2">`) + `Footer.tsx:21` (`<BrandLogo />` trong `<Link aria-label=homeLabel className="mb-10 inline-flex">`) — đúng 2 caller |
| Header/Footer height | Header `h-16` (64px) mobile / `lg:h-[72px]` desktop → logo `h-10` (40px) vừa |
| A11y | Brand name cho screen reader lấy từ `aria-label` của `<Link>` bao ngoài (`nav.homeLabel` = `"NTA, trang chủ"` / `"NTA, home"`) → **giữ** `alt=""` + `aria-hidden="true"` trên `<Image>`, KHÔNG thêm alt (tránh đọc trùng) |
| JSON-LD | `src/lib/seo/jsonld.ts` dùng `logo-square.png` → **KHÔNG đụng** |

## Classification

- **Type:** MODIFY (post-build, đổi asset + thành phần hiển thị của brand logo component dùng chung)
  — không thêm/xoá requirement.
- **Risk:** LOW — 1 component (2 caller) + 1 asset, không chạm API/DB/auth/contract/schema.
  ⚠ Component **dùng chung** Header+Footer trên mọi route → reviewer chạy **STRICT** (theo
  `.agent/FEATURE_WORKFLOW.md` §6 "shared component").
- **Spec delta:** **KHÔNG đổi requirement.** Không có R-xx nào quy định **thành phần** logo thương hiệu
  (R-11 chỉ nói nav/footer; R-24 WCAG không đổi vì brand name vẫn còn qua `aria-label` của `<Link>`).
  → **KHÔNG bump `spec_version`** (giữ 3.0.0); vẫn chạy Spec Publisher để sinh `spec/test-scope/current.json`.

## Acceptance (bắt buộc)

- [x] `public/images/brand/logo-lockup.png` = ảnh user đã crop sát nội dung (488×137, PNG RGBA nền trong suốt)
- [x] `BrandLogo.tsx` render `/images/brand/logo-lockup.png` với `width={488}` / `height={137}`, `className="h-10 w-auto"`
- [x] Header (VI+EN) + Footer (VI+EN) render lockup; brand name a11y giữ `"NTA, trang chủ"` / `"NTA, home"`
- [x] `alt=""` + `aria-hidden="true"` giữ nguyên trên `<Image>`; `priority` vẫn truyền từ Header
- [x] `jsonld.ts` vẫn `logo-square.png` (không đụng SEO)
- [x] `.context/design-spec.md:22` reconcile cho khớp behavior mới (lockup thay mark-only)
- [x] `npm run lint` · `npm run typecheck` · `npm run build` PASS
- [x] Reviewer độc lập PASS + `spec/test-scope/current.json` sinh mới

## Ghi chú

- Không xử lý 2 change file pending khác (`2026-10-12-hairstyle-ai-gallery-screenshots.md`,
  `2026-10-12-solution-card-real-images.md`) — **không gộp**.
- ⚠ **Concurrency:** nhiều session cùng chạy trên repo. `scopeVersion` 16 (hair-style gallery) rồi **17
  (`home-solution-card-images`)** được session khác publish trong lúc chạy change này → change logo publish
  **scopeVersion 18** (giữ luật "scopeVersion tăng, không trùng số"). CHỈ stage file thuộc change này.
- **Close-out:** T01 done — reviewer STRICT PASS (round 1 + round 2). Residual MINOR: tagline ~5–6px ở `h-10`
  (cần user xác nhận thị giác); chưa screenshot browser thật. spec 3.0.0 KHÔNG bump; scope v18.
- Commit-first 1 task = 1 commit trên `main`; chỉ stage file thuộc change này; **không push**
  (`auto_push_after_pass: false`).
