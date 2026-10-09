# Task 01 (modification): Content model + render cho trang chi tiết Giải pháp AI (R-06d)

> Nguồn: change `spec/changes/2026-10-09-ai-solution-content.md` (acceptance 1–3, 5) · spec delta
> `spec/updates/2026-10-09-ai-solution-content.md` · R-06a–e (`SPECIFICATIONS.md`).

## Phase
1 (pre-build — schema/render, không có code AI content trước đó)

## Type
modification (post-build MODIFY — mở rộng content model + render; additivve phần section mới)

## Goal
Cho trang chi tiết Giải pháp AI (`/solutions/ai/[slug]`) render được **nội dung thật có cấu trúc** (kiến trúc,
thuật toán, lợi ích, ứng dụng ngành) thay vì chỉ `description` + `features` + `useCases` như hiện tại:
- render thêm `benefits` (field đã có trong type nhưng **chưa được render** ở trang AI),
- thêm **section nội dung có cấu trúc** (`sections`), **chỉ số nổi bật** (`highlights`) và **FAQ** (`faq`) —
  tất cả tùy chọn (optional), dữ liệu từ frontmatter content, **không thêm dependency mới** (không dùng
  `remark-gfm`/MDX table).
- Giữ SSG + i18n VI/EN; không phá trang enterprise (type `Solution` dùng chung).

## Classification / Risk
- Work item type: FEATURE (post-build modification)
- Change type: MODIFY (additive field/section)
- Scope: `src/content/types.ts` (type `Solution`) + `src/app/[locale]/solutions/ai/[slug]/page.tsx`
  + 1–3 component mới trong `src/components/solutions/` + i18n keys (nếu cần)
- Root cause category: n/a (không phải bug) — capability gap: content model/render chưa đủ cho nội dung thật
- Review level expected: **STRICT** — chạm shared content model `Solution` (dùng bởi AI + enterprise + home
  `SolutionCard`) và shared component mới; reviewer tự chọn cuối cùng
- Blast radius: 3 trang AI detail × 2 locale; 4 trang enterprise detail × 2 locale (chỉ đọc type);
  home `SolutionCard`; case-study link trên AI detail
- Doc impact: `docs/DESIGN.md` (Screen "Chi tiết giải pháp AI" — bổ sung component) + `.context/design-spec.md`
  nếu có; no API/schema/DB change
- Decision impact: NO (không đổi kiến trúc route)

## Scope (spec refs)
- **R-06d** (`SPECIFICATIONS.md`): render `benefits` + section nội dung có cấu trúc + highlights/FAQ tùy chọn; SSG + i18n.
- **R-06a/b/c** (acceptance 1–3): cần đúng các field để task-02 đổ nội dung Talvra/BoxAI/Flycam vào.
- **R-06e**: `relatedCases` đã được render sẵn ở `solutions/ai/[slug]/page.tsx:43` — chỉ cần đảm bảo không phá.
- design S "Chi tiết giải pháp AI": `docs/DESIGN.md:105-107` (components hiện tại: PageHeader, FeatureList, UseCases, CaseStudyLink, CTAForm).

## Description (đúng scope — KHÔNG mở rộng)
1. `src/content/types.ts` — mở rộng interface `Solution` bằng các field **optional** (không đổi field bắt buộc):
   - `sections?: { title: string; intro?: string; items?: string[] }[]` — section nội dung tự do có cấu trúc.
   - `highlights?: { value: string; label: string }[]` — chỉ số nổi bật (KPI).
   - `faq?: { question: string; answer: string }[]` — câu hỏi thường gặp.
   - (giữ nguyên `benefits`; không thêm `body`/MDX table để tránh dependency.)
2. Component mới trong `src/components/solutions/` (tên gợi ý): `SolutionSections.tsx` (render `sections`),
   `SolutionHighlights.tsx` (render `highlights`), `FaqList.tsx` (render `faq`) — theo pattern hiện có
   (`FeatureList`/`BenefitList`/`UseCases`, dùng `Section`, `max_file_lines: 300`, `max_function_lines: 50`).
   Có thể gộp miễn giữ component rõ trách nhiệm (AI-readable).
3. `src/app/[locale]/solutions/ai/[slug]/page.tsx` — render theo thứ tự hợp lý:
   `FeatureList` (giữ) → `BenefitList` (thêm) → `SolutionSections` → `SolutionHighlights` → `UseCases` (giữ)
   → `FaqList`. Section nào rỗng → component tự `return null` (giống `UseCases`).
4. i18n: chỉ thêm key nếu có label UI tĩnh mới (section title lấy từ content). Bổ sung cho cả `vi.json` + `en.json`.
5. KHÔNG đụng enterprise page/khác; KHÔNG đổi route/slug; KHÔNG cài dependency.

## Acceptance Criteria
- [ ] `Solution` type mở rộng optional, không phá enterprise/4 content cũ (typecheck + build PASS)
- [ ] Trang AI detail render `benefits` khi có dữ liệu
- [ ] Trang AI detail render `sections` (kiến trúc/thuật toán/ứng dụng ngành) + `highlights` + `faq` khi có dữ liệu; ẩn gọn khi rỗng
- [ ] Không thêm dependency trong `package.json`
- [ ] Heading hierarchy đúng (h1→h2→h3), a11y không regression
- [ ] `npm run lint` · `npm run typecheck` · `npm run build` PASS; 3 route AI × 2 locale vẫn prerender (SSG)
- [ ] Reviewer độc lập PASS (không tự review)

## Verification Plan
- Commands: `npm run lint` · `npm run typecheck` · `npm run build`
- Test: `test_command: null` → skip, ghi lý do (chưa cấu hình test framework)
- Evidence: `git diff package.json` = rỗng; build output route AI; `.next/prerender-manifest.json` có `/vi/solutions/ai/custom-ai`…;
  render thử với content tạm nếu task-02 chưa xong (không commit content tạm)

## Feature Verification
- Acceptance criteria: **PENDING** (chưa build — chờ user duyệt plan)
- Verify commands + result: **PENDING**
- Reviewer verdict: **PENDING** (report dự kiến `.context/review-reports/change-ai-solution-content-phase-1-task-01-round-1-review.md`)

## Retry / Escalation
- Attempt: 0
- Last failure type: n/a
- Error memory entry: none
- Escalation: sau 3 attempt fail → status `architecture_review_needed`, dừng, báo human (không thử fix #4)

## DoD (Definition of Done)
- [ ] Code written (chỉ trong scope)
- [ ] Tests: skip — `test_command: null`
- [ ] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [ ] Reviewer PASS (độc lập)
- [ ] `.context/progress.json` updated (close-out)
- [ ] Doc Impact/Reconcile recorded (`docs/DESIGN.md` Screen AI detail)
- [ ] committed — 1 task = 1 commit (branch `main`, KHÔNG push)

## Files to Create/Modify
- `src/content/types.ts`
- `src/app/[locale]/solutions/ai/[slug]/page.tsx`
- `src/components/solutions/SolutionSections.tsx` (new)
- `src/components/solutions/SolutionHighlights.tsx` (new, có thể gộp)
- `src/components/solutions/FaqList.tsx` (new, có thể gộp)
- `src/i18n/messages/vi.json` + `en.json` (chỉ key mới nếu cần)
- `docs/DESIGN.md` (doc reconcile — Screen AI detail)

## Notes
- Task-02 (content) phụ thuộc task-01.
- `benefits` hiện đã có trong `Solution` type nhưng chỉ render ở enterprise page — đây là phần "thêm render" ở AI page.
- KHÔNG dùng MDX body/`remark-gfm` (repo chưa cài; thêm dep ngoài scope).
- Builder KHÔNG tự commit / không update progress (close-out làm).
