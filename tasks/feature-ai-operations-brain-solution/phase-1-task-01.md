# Task 01: Thêm giải pháp AI "AI Operations Brain" (AI Vận hành Doanh nghiệp)

> Nguồn: CR-028 · Spec: R-06, R-06f (4.1.0), R-08c (khung showcase)

## Phase
1 — content (không đổi component)

## Type
addition (content mdx + SVG minh hoạ + whitelist slug + metadata thẻ listing)

## Scope
- `src/content/solutions/{vi,en}/ai-operations-brain.mdx` (MỚI): frontmatter đủ field bắt buộc (như `fridayai.mdx`)
  + block `showcase` (hero, stats, pillars, features, details, faq, cta). Nội dung theo
  `spec/changes/assets/2026-10-14-ai-operations-brain-solution/source-content.md`.
- `public/images/solutions/ai-operations-brain.svg` (MỚI): SVG minh hoạ trung tính, không ảnh khách hàng.
- `src/lib/content/slug.ts`: `aiSlugs` thêm `ai-operations-brain` (→ SSG, mega menu, listing, sitemap).
- `src/content/listings.ts`: `listingItems.{vi,en}['ai-operations-brain']` (3 chip theo bản nguồn) + danh mục lọc mới
  `operations` ("Vận hành doanh nghiệp" / "Business operations"); mô tả trang AI nhắc giải pháp mới.

## Classification / Risk
- Change type: **ADDITIVE** (content) · spec 4.0.0 → 4.1.0 (MINOR)
- Review level: **NORMAL** · Blast radius: `/solutions/ai*`, mega menu, sitemap
- Nội dung: KPI ghi rõ "Mục tiêu kỳ vọng khi triển khai" / "Target impact (when deployed)" (BR-004);
  KHÔNG có khối "LƯU Ý CHO NGƯỜI DUYỆT", KHÔNG tên người/khách hàng; `relatedCases: []`.
- Doc impact: SPECIFICATIONS.md (R-06/R-06f) — không đổi API/schema/DESIGN

## Acceptance Criteria
- [ ] Thẻ mới ở `/solutions/ai` (vi + en), mô tả ngắn + 3 chip
- [ ] `/solutions/ai/ai-operations-brain` + `/en/...` dùng khung chung, đủ hero/vấn đề/giải pháp/vòng lặp/Hiến pháp/agent/nguồn dữ liệu/KPI mục tiêu/lộ trình/ngành/CTA
- [ ] KPI ghi là mục tiêu; không khối ghi chú người duyệt; không tên người/khách hàng
- [ ] Mega menu + sitemap/hreflang có mục mới (tự động theo `aiSlugs`)
- [ ] typecheck + lint + build PASS

## Retry / Escalation
3 attempt fail → `architecture_review_needed`.

## Feature Verification
- Builder: agent change-request tự làm (builder subagent BLOCKED do ghi trùng, nội dung cuối = bản change-request).
- typecheck PASS · lint PASS (1 warning cũ `<img>` ở `src/components/mdx/index.tsx`).
- `npm run build` trên Windows FAIL do môi trường: `@swc/core` native addon từ chối cache root `C:SERSDATDAAPPDATAocal` (dacl có sid appcontainer s-1-15-3-…) — head cũng vậy, không liên quan change.
- build thay thế: `docker build --target builder --build-arg next_public_site_url=https://ntavietnam.tech .` = pass (61/61 trang). html vi/en có `<title>ai operations brain | nta</title>`, hreflang vi/en/x-default, có "mục tiêu kỳ vọng khi triển khai" / "target impact (when deployed)", 0 lần "tuấn anh"/"lƯu Ý cho ngƯỜi duyỆt"; listing /solutions/ai có thẻ + filter "vận hành doanh nghiệp"; trang chủ vi/en (mega menu) có link; sitemap có loc + hreflang.

## Review
| Round | Verdict | Report |
|---|---|---|
