# Task 01: Thêm giải pháp AI FridayAI (nội dung + ảnh từ fridayaix.com)

> Nguồn: CR-011 · Spec: R-06, R-06e (3.7.0), R-08c

## Phase
1 — content + UI nhỏ

## Type
addition (content mdx + ảnh) + modification nhỏ (`ShowcaseCTA` hỗ trợ link ngoài)

## Scope
- `src/content/solutions/{vi,en}/fridayai.mdx` (MỚI): frontmatter đủ field bắt buộc + block `showcase`
  (hero, stats, pillars, features, details, photos variant screen, faq, cta). CTA hero + CTA cuối → `https://fridayaix.com/`.
- `public/images/solutions/fridayai.svg` (logo mark lấy từ SVG của site) ,
  `fridayai/01-he-sinh-thai-model.jpg` (1030×470), `02-danh-sach-model.jpg` (766×412), `03-trang-chu.jpg` (687×258) — ảnh chụp fridayaix.com 13/10/2026.
- `src/lib/content/slug.ts`: `aiSlugs` thêm `fridayai` (→ SSG, mega menu, listing).
- `src/content/listings.ts`: `listingItems.{vi,en}.fridayai` (icon plug, theme rose, danh mục `gateway`), thêm danh mục lọc `gateway`, mô tả trang AI nhắc FridayAI.
- `src/components/case-studies/showcase/ShowcaseCTA.tsx`: href `http(s)://` → `<a target="_blank" rel="noopener noreferrer">`, còn lại giữ `Link` i18n.

## Classification / Risk
- Change type: **ADDITIVE** (+ MODIFY nhỏ component dùng chung) · spec 3.6.0 → 3.7.0
- Review level: **NORMAL** · Blast radius: `/solutions/ai*`, mega menu, CTA mọi trang showcase
- Nội dung: không ghi cứng giá/khuyến mãi (giá đổi liên tục); số liệu độ trễ/uptime ghi "theo số liệu FridayAI" (BR-004)
- Doc impact: SPECIFICATIONS.md (R-06/R-06e) — không đổi API/schema/DESIGN

## Acceptance Criteria
- [x] Thẻ FridayAI ở `/solutions/ai` (vi + en), có ảnh + mô tả ngắn + chip
- [x] `/solutions/ai/fridayai` + `/en/...` dùng khung chung, đủ hero/tính năng/lợi ích/FAQ/CTA
- [x] Không có giá/khuyến mãi cứng trong text; ảnh có alt + caption nguồn
- [x] CTA dẫn sang fridayaix.com (tab mới); CTA nội bộ cũ không đổi
- [x] Mega menu + sitemap có mục mới (tự động theo `aiSlugs`)
- [x] typecheck + lint + build PASS

## Feature Verification
- Verify: `bash tools/linux-build.sh verify` = typecheck PASS · lint PASS (1 warning cũ `<img>` ở mdx) · build PASS
- Smoke `next start`: `/solutions/ai`, `/solutions/ai/fridayai`, `/en/solutions/ai/fridayai`, `/sitemap.xml`, ảnh = 200;
  title `FridayAI | NTA`; 2 nút `href="https://fridayaix.com/" target="_blank" rel="noopener noreferrer"`;
  listing có link `/solutions/ai/fridayai`; sitemap có vi/en + hreflang; trang chủ (mega menu) có link mới.

## Review
| Round | Verdict | Report |
|---|---|---|
| 1 | **PASS NORMAL** (3 MINOR) | `.context/review-reports/feature-fridayai-solution-phase-1-task-01-round-1-review.md` |

Xử lý MINOR: (2) đổi "độ trễ trung bình (P95)" → "độ trễ P95"; thẻ số liệu uptime 30 ngày (dễ lỗi thời) → SLA 99,9% Enterprise.
(1) không commit `logo-wordmark.svg` (không dùng). (3) hint "mở tab mới" cho screen reader: để task riêng (cả repo cùng pattern).
