---
id: brand-logo-wordmark-removal
type: feature
status: done
created: 2026-10-12
---

# 2026-10-12 — Bỏ wordmark chữ "NTA" khỏi logo thương hiệu (chỉ giữ mark)

## Yêu cầu

Nguyên văn user: _"ở logo ấy, xóa chữ NTA đi, để mỗi cái kia thôi :)))"_

→ Logo thương hiệu chỉ còn **mark** (glyph "N" cyan/teal — `logo-mark.png`), **bỏ wordmark text "NTA"**.
Áp dụng cho **mọi nơi** đang hiển thị logo thương hiệu.

## Bối cảnh / khảo sát (đã xác minh)

| Hạng mục | Sự thật trên đĩa |
|---|---|
| Component render logo | `src/components/layout/BrandLogo.tsx` — `<Image src="/images/brand/logo-mark.png" alt="" aria-hidden>` (dòng 19–27) + `<span className="text-xl font-semibold tracking-tight text-text-primary">NTA</span>` (dòng 28) |
| Nơi dùng | `Header.tsx:51` (`<BrandLogo priority />`) + `Footer.tsx:21` (`<BrandLogo />`) — chỉ 2 caller |
| A11y | `<Link>` bao ngoài có `aria-label` = `homeLabel` = `"NTA, trang chủ"` (VI, `src/i18n/messages/vi.json:15`) / `"NTA, home"` (EN, `en.json:15`) → **tên thương hiệu vẫn còn cho screen reader** sau khi bỏ wordmark |
| Asset | `logo-mark.png` (icon-only, trim sát viền) — dùng tiếp. `logo-square.png` (icon-only) chỉ dùng cho JSON-LD (`src/lib/seo/jsonld.ts:6`) → **không đụng**. `logo-lockup.png` (icon + "NTA" + tagline "ELEVATING INTELLIGENCE") **không được reference** trong `src/` → không đổi |
| Tagline | Tagline "ELEVATING INTELLIGENCE" chỉ tồn tại **bên trong** `logo-lockup.png` (unused) → không có tagline nào đang render; không cần xử lý |

## Classification

- **Type:** MODIFY (post-build, thay đổi brand logo component dùng chung) — không thêm/xoá requirement.
- **Risk:** LOW — 1 component, 2 caller, diff 1 khối JSX; không chạm API/DB/auth/contract/asset.
- **Spec delta:** **KHÔNG đổi requirement.** Không có R-xx nào quy định thành phần logo thương hiệu
  (R-11 chỉ nói nav/footer; OQ#1 nói brand kit đã được giải quyết ở commit `eb2a6f6 feat(brand): logo NTA moi`).
  → **không bump `spec_version`** (3.0.0 giữ nguyên), vẫn sinh `spec/test-scope/current.json` (scopeVersion +1).

## Acceptance (bắt buộc)

- [x] `BrandLogo` không còn render chữ "NTA" (không còn `<span>` text wordmark)
- [x] Mark `logo-mark.png` vẫn render đúng ở Header (VI+EN) + Footer (VI+EN)
- [x] Tên accessible của link home vẫn là "NTA, trang chủ" / "NTA, home" (không mất brand name cho a11y)
- [x] JSON-LD `logo-square.png` + `logo-lockup.png` không bị đụng
- [x] Không còn tham chiếu `BrandLogo`-wordmark nào khác trong `src/` (grep)
- [x] `npm run lint` · `npm run typecheck` · `npm run build` PASS
- [x] Reviewer độc lập PASS
- [x] `spec/test-scope/current.json` sinh mới (scopeVersion 14 → 15)

## Ghi chú

- Không xử lý change file `2026-10-12-solution-card-real-images.md` (pending khác, đang chờ user duyệt) — **không gộp**.
- Commit-first 1 task = 1 commit trên `main`; chỉ stage file thuộc change này; **không push** (`auto_push_after_pass: false`).
