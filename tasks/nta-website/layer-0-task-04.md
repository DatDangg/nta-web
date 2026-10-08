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
- [ ] Đủ content VI **và** EN cho: home, about, 4+3 solution slug, 2 products, ≥2 case studies, ≥3 posts
- [ ] Mọi copy đúng rules design §1.7: không em-dash, không ALL CAPS có dấu, không slogan rỗng,
      không TODO/lorem, mọi giá trị chưa có gắn placeholder rõ ràng (OQ#1–3)
- [ ] BR-004: case chưa xin phép → anonymize (không tên khách thật); BR-003: chỉ 3 mảng
- [ ] Số liệu case study chỉ dùng số thật/để trống — không bịa %
- [ ] Loader đọc được toàn bộ content; `npm run build` PASS
- [ ] Check commands pass

## Verification Summary
- Commands: `npm run lint` · `npm run typecheck` · `npm run build`
- Test: `test_command: null` → skip, ghi lý do
- Manual evidence: build log không warn missing field; duyệt nhanh 2 locale
- Reviewer report: `.context/review-reports/feature-nta-website-layer-0-task-04-round-1-review.md`

## Retry / Error Memory
- Attempt: 0
- Last failure type: n/a
- Error memory entry: none
- Escalation: none — sau 3 attempt fail → `architecture_review_needed`

## DoD (Definition of Done)
- [ ] Code/content written (chỉ trong scope)
- [ ] Tests: skip — `test_command: null`, ghi lý do
- [ ] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [ ] Reviewer độc lập PASS
- [ ] `.context/progress.json` updated
- [ ] Error Memory / Doc Impact recorded (`no doc impact`)
- [ ] committed — 1 task = 1 commit (branch `main`, KHÔNG push)

## Files to Create/Modify
- `src/content/solutions/{vi,en}/*.mdx|ts` (overview + 7 slug)
- `src/content/products/{vi,en}/*`, `src/content/case-studies/{vi,en}/*`,
  `src/content/blog/{vi,en}/*`, `src/content/about/{vi,en}/*`
- `public/images/**` (placeholder assets)

## Notes
- `[cần xác nhận]` còn lại (không chặn): OQ#1 logo/brand · OQ#2 hotline/email/địa chỉ ·
  OQ#3 nội dung thật → dùng placeholder dễ thay, ghi rõ trong content.
- Content EN dịch sát pattern design (≤ VI + 30% độ dài) — reviewer so sánh song song 2 bản.
