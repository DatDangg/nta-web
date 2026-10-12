# Spec Validation — feature/products-carousel-image-size

- **Verdict:** PASS
- **Review level:** NORMAL (inline — env chặn nested subagent depth=1; **round-1 self-validation**)
- **Reason:** Change post-build class **MODIFY (UI/layout)** — chỉ đổi cách bố trí ảnh trong cột media
  của `ScreenshotCarousel`; **không đổi ngữ nghĩa requirement** nào.
- **Change file:** `spec/changes/2026-10-12-products-carousel-image-size.md`
- **Work item:** `feature/nta-website`

## 1. Requirement liên quan

| Req | Nội dung | Ảnh hưởng bởi change? |
|---|---|---|
| **R-07** | `/products`: giới thiệu Music app & Hair-style AI — mô tả, ảnh/screenshot, kênh tải | **Không đổi ngữ nghĩa** — vẫn render ảnh/screenshot; chỉ đổi kích thước/bố cục ảnh |
| **R-23** | Responsive mobile-first, thang Tailwind 640/768/1024/1280/1536 | **Không đổi** — thay đổi giữ nguyên breakpoint (`w-full` ở mọi bp của slide) |
| **R-24** | WCAG 2.1 AA — alt text, keyboard nav, semantic | **Không đổi** — không sửa alt/role; carousel giữ dots/arrow/label |

→ **Không requirement nào thêm/sửa/xoá/đổi ngữ nghĩa.**

## 2. Quyết định version

Theo `docs/SPEC_VERSIONING.md` §Version scheme: MAJOR = xoá/đổi ngữ nghĩa req; MINOR = thêm req;
PATCH = sửa wording/làm rõ, không đổi behavior. Change này **không thuộc nhóm nào** (layout hiển thị,
không đổi req) → **KHÔNG bump `spec_version` (giữ 3.0.0)** là **ĐÚNG**.

Vẫn **sinh `spec/test-scope/current.json`** (`scopeVersion` +1) theo `.agent/spec-publish.md` rule 2
(change cần test biết vùng vừa sửa dù không bump spec).

## 3. Blast radius (xác nhận từ code)

- `grep ScreenshotCarousel` toàn repo = **chỉ** `src/app/[locale]/products/page.tsx` + chính component
  → blast radius = `/products` VI+EN.
- `AppCard` (`md:grid-cols-2`) + `products/page.tsx` (`lg:grid-cols-2`) **không đổi** → bố cục card giữ nguyên.
- `ProductCard` (trang chủ) dùng `cardImageSizes` (33vw) + `cardPosterImageClass` — **ngoài scope**, không đụng.
- `cardPosterImageClass` (`aspect-[9/16]`) dùng chung `ProductCard` + `ScreenshotCarousel` → **không sửa**
  (chỉ sửa wrapper slide trong carousel) → không hồi quy trang chủ.

## 4. Gap / conflict

- **Không phát hiện gap/conflict** giữa change file, acceptance và R-07/R-23/R-24.
- Acceptance change file đủ: slide 1-up, ảnh to, giữ bố cục card, `sizes` khớp, không hồi quy a11y, verify lint/typecheck/build.
- Regression đã liệt kê đủ: carousel dots/arrows/scroll-snap; ProductCard trang chủ (ngoài scope).

## 5. Kiểm tra đề xuất `sizes` (khuyến nghị trong change)

- Container `max-w-container: 1280px` (`tailwind.config.ts:48`). Ở ≥1280: content box 1216 → card
  `(1216-24)/2 = 596` → inner `596-64 = 532` → cột media `(532-24)/2 = 254px`.
- Ở 1024 (lg): media ≈ 190px. Ở 768–1023 (page 1 cột, card 2 cột): media ≈ 41vw.
- `sizes` cũ `"(min-width: 1024px) 33vw, ..."` khớp layout **3-up cũ** → nay sai (quá lớn so với 254px).
- Đề xuất: `"(min-width: 1024px) 256px, (min-width: 768px) 45vw, 100vw"` — khớp 254px ở ≥1280,
  hơi dư nhẹ ở 1024–1279 (an toàn, tránh mờ), đúng ở md/base.

## Kết luận

**PASS** — spec delta hợp lệ, không bump version, scope cần sinh sau khi T01 PASS.
