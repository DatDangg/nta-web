# Task 04: Sample content v1 (VI/EN) cho 9 nhóm trang

## Layer
0

## Type
build (initial)

## Goal
Soạn toàn bộ nội dung mẫu song ngữ VI/EN trong `src/content/` cho đủ 9 nhóm trang, theo copy đã chốt
trong `.context/design-spec.md` — để mọi page task ở Layer 2 chỉ việc render, không block chờ content.

## Classification / Risk
- Work item type: FEATURE (initial build)
- Feature change type: ADDITIVE (initial build)
- Scope: SINGLE_SURFACE (content files — không đổi code page)
- Root cause category: n/a
- Review level expected: NORMAL — content song ngữ, kiểm tra BR-003/BR-004 + copy rules
- Blast radius: `src/content/**`; mọi trang đọc content
- Doc impact: NO_DOC_IMPACT (content = repo data, không đổi docs intent)
- Decision impact: NO

## Scope (spec refs)
- **R-26:** ≥9 nhóm trang, nội dung mẫu hợp lý
- **R-07:** ≥2 app (Music, Hair-style AI) · **R-08:** ≥2 case study (Óc Eo, phòng khám — anonymize)
- **R-04:** about đủ 5 khối (sứ mệnh/năng lực/team/milestones/đối tác)
- **R-25:** BR-003 (đúng 3 mảng), BR-004 (không công bố khách hàng chưa được phép → anonymize)
- Design §1.7 (copy tone VI/EN, cấm slogan rỗng, không em-dash) + copy block từng Screen 1–12

## Dependencies
- task-03 (types + cấu trúc content + loader phải có trước)

## Description
1. **Solutions:** overview enterprise (intro) + 4 slug (`crm|hrm|lms|dentgo`) và overview ai +
   3 slug (`boxai|flycam|custom-ai`) — mỗi bản VI + EN: title, desc, features, benefits, use-cases.
2. **Products:** 2 app (Music app, Hair-style AI) — mô tả, feature bullets, download link = null
   (→ "Sắp ra mắt" badge, Screen 7 Empty state).
3. **Case studies:** ≥2 case — 1 "Óc Eo"/giáo dục + 1 phòng khám nha khoa anonymize (BR-004):
   meta, challenge, result (chỉ số **thật hoặc bỏ trường**, KHÔNG số bịa 99.9%), gallery placeholder.
4. **Blog:** ≥3 bài VI/EN (frontmatter: title, date, category, excerpt, cover) — body đủ dài
   để test prose rendering.
5. **About:** mission, 4 capabilities, team (placeholder role), milestones, partners (logo null-safe).
6. **Home data:** 3 mảng card, sản phẩm tiêu biểu ≥3, case highlight 1.
7. Đặt `public/images/` placeholder đúng aspect ratio (hoặc SVG/gradient placeholder) — alt text mô tả.

## Acceptance Criteria
- [x] Đủ content VI **và** EN cho: home, about, 4+3 solution slug, 2 products, ≥2 case studies, ≥3 posts
- [x] Mọi copy đúng rules design §1.7: không em-dash, không ALL CAPS có dấu, không slogan rỗng,
      không TODO/lorem, mọi giá trị chưa có gắn placeholder rõ ràng (OQ#1–3)
- [x] BR-004: case chưa xin phép → anonymize (không tên khách thật); BR-003: chỉ 3 mảng
- [x] Số liệu case study chỉ dùng số thật/để trống — không bịa %
- [x] Loader-required frontmatter được kiểm tra; `npm run build` PASS
- [x] Check commands pass

## Verification Summary
- Commands: `npm run lint` · `npm run typecheck` · `npm run build`
- Test: `test_command: null` → skip, ghi lý do
- Fix round 1: cập nhật gallery type khớp object src/alt, dịch useCases riêng cho 7 giải pháp EN, xử lý các minor finding; kiểm tra loader smoke và lệnh verify ghi bên dưới.
- Verify commands: `npm run lint` PASS; `npm run typecheck` PASS; `npm run build` PASS (SSG 5/5).
- Loader smoke evidence: gray-matter parsed gallery objects with string `src`/`alt`; all 7 EN solution useCases arrays are distinct.
- Fix attempt 2 (review round 2): added the filename-matching `slug` frontmatter to all six VI/EN blog posts missing it.
- Loader smoke: invoked `getAllPosts` for both locales; VI returned 4 posts with slugs `first-steps, learning-content, responsible-ai, digital-workflows`; EN returned the same 4 slugs. No loader exception.
- Verify commands (attempt 2): `npm run lint` PASS; `npm run typecheck` PASS; `npm run build` PASS (SSG 5/5).
- Test: `test_command: null` → skip, not configured.
- Reviewer: PASS độc lập — round 3 (STRICT), 0 CRITICAL/MAJOR/1 MINOR (home strip deviation, non-blocking).
- Reviewer report: `.context/review-reports/feature-nta-website-layer-0-task-04-round-3-review.md` (round 1/2 FAIL → fix → round 3 PASS)

## Retry / Error Memory
- Attempt: 2
- Last failure type: n/a
- Error memory entry: none
- Escalation: none — sau 3 attempt fail → `architecture_review_needed`

## DoD (Definition of Done)
- [x] Code/content written (chỉ trong scope)
- [x] Tests: skip — `test_command: null`, chưa cấu hình test framework
- [x] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [x] Reviewer độc lập PASS
- [x] `.context/progress.json` updated
- [x] Error Memory / Doc Impact recorded (`NO_DOC_IMPACT`, content-only)
- [x] committed — 1 task = 1 commit (branch `main`, KHÔNG push)

## Files to Create/Modify
- `src/content/solutions/{vi,en}/*.mdx|ts` (overview + 7 slug)
- `src/content/products/{vi,en}/*`, `src/content/case-studies/{vi,en}/*`,
  `src/content/blog/{vi,en}/*`, `src/content/about/{vi,en}/*`
- `public/images/**` (placeholder assets)

## Notes
- MINOR 5: featured product chỉ giữ 2 app có thật, thêm slug để Layer 2 link theo product route; Screen 1 cho phép ẩn strip nếu <1, không thêm BoxAI vào product.
- Home product strip giữ 2 sản phẩm thật theo R-07, không thêm sản phẩm giả. Layer 2 phải render strip 2 item và degrade gracefully (arrow/dots nếu không phù hợp); design owner cần ratify lựa chọn 2 vs ≥3 cho Screen 1.
- MINOR 7: cả hai case thuộc bucket `enterprise`; `sector` giữ lĩnh vực cụ thể và `client` giữ nhãn khách hàng đã ẩn danh cho MetaBar.
- Home cards có 3 mảng theo thiết kế: Doanh nghiệp, AI, Ứng dụng AI. Tổng hợp overview riêng để loader solution chỉ đọc đúng 7 slug chi tiết.
- OQ#1–3: chưa có logo, thông tin liên hệ hoặc nội dung thật được xác nhận; dùng wordmark/placeholder hoặc copy mẫu, không khẳng định số liệu. Download URL của cả hai app là `null`.
- Builder không chạy reviewer, cập nhật progress hoặc commit; các mục close-out đó còn chờ workflow chính.
- `[cần xác nhận]` còn lại (không chặn): OQ#1 logo/brand · OQ#2 hotline/email/địa chỉ ·
  OQ#3 nội dung thật → dùng placeholder dễ thay, ghi rõ trong content.
- Content EN dịch sát pattern design (≤ VI + 30% độ dài) — reviewer so sánh song song 2 bản.
