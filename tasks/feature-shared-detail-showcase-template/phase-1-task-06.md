# phase-1-task-06 — Close-out CR-004

- Change: CR-004 `spec/changes/archive/2026-10-13-shared-detail-showcase-template.md`
- Classification / Risk: REMOVE (code chết) + refactor nhỏ · risk low · spec 3.5.1 (reconcile) · scope v30

## Việc đã làm
- Tách phần ảnh (staging CRM/DentGo/LMS dữ liệu giả, màn HRM, ảnh phụ CRM/DentGo, câu hỏi mở) sang CR-007 `spec/changes/2026-10-13-solution-detail-screenshots.md` theo yêu cầu user.
- Xoá component layout chi tiết cũ hết dùng: `src/components/solutions/{AiAssistantPanel,AiSection,AudienceCards,BenefitList,BentoCompliance,FaqAccordion,FaqList,FeatureList,FeatureZigZag,ScreenshotSection,ShotImage,SolutionHero,SolutionHighlights,SolutionSections,UseCases}.tsx`, `features.ts`, và trang dev `src/app/[locale]/dev/components/page.tsx` (chỉ để xem thử các component đó).
- Gom kiểm `showcase` vào loader: `getAllSolutions` / `getAllProducts` bắt buộc `showcase`, trả `WithShowcase<T>`; 3 trang chi tiết bỏ `throw`.
- Sửa comment còn nhắc `ShotImage` / `/dev/components` (globals.css, CardShotImage, lms.mdx vi/en).

## Verification
- `bash tools/linux-build.sh verify`: typecheck/lint/build PASS.
- Smoke: 7 giải pháp + 2 sản phẩm + 2 case study, vi + en → 200; `/dev/components` → 404.
- Review round 1 PASS; spec-validation PASS (`.context/review-reports/feature-shared-detail-showcase-template-{phase-1-task-06-round-1-review,spec-validation}.md`).

## Còn lại (ngoài phạm vi)
- Nhánh layout `default` của `case-studies/[slug]` gần như không dùng (2 case study đều showcase) — có thể dọn ở change khác.
- Field cũ trong `Solution` (`layout`, `compliance`, `aiSection`, `audience`, `heroShot`…) vẫn còn trong MDX/type, không còn component đọc.
