# Task 02 (modification): Nội dung thật cho 3 trang Giải pháp AI + Case Study Óc Eo (R-06a/b/c, R-06e, R-08a)

> Nguồn: change `spec/changes/2026-10-09-ai-solution-content.md` (content A/B/C + acceptance 1–5) · spec delta
> `spec/updates/2026-10-09-ai-solution-content.md` · R-06a–c/e, R-08a (`SPECIFICATIONS.md`).

## Phase
1 (content authoring — sau task-01 render)

## Type
modification (post-build MODIFY + content additive)

## Goal
Đổ **nội dung thật** (không placeholder) vào 8 file content:
- `custom-ai` VI+EN: nền tảng Talvra (phần A).
- `boxai` VI+EN: AI camera + AI Box (phần B) + đề cập triển khai thực tế **Đền Bảo Hà** (định tính).
- `flycam` VI+EN: DJI Dock 2 + Matrice 3TD (phần B).
- `oc-eo-learning` VI+EN: sửa sang **dự án AI camera + flycam khu di tích Óc Eo – Ba Thê** (phần C),
  đúng format vấn đề → giải pháp → kết quả; category `enterprise` → `ai`.

## Classification / Risk
- Work item type: FEATURE (post-build modification)
- Change type: MODIFY (content) — additive cho các field mới của task-01
- Scope: 8 file `.mdx` content + (bắt buộc) `relatedCases` cho `flycam`/`boxai`
- Root cause category: n/a — nội dung hiện tại là placeholder ("Số hóa quản lý đào tạo tại Óc Eo" sai context)
- Review level expected: **STRICT** — nội dung công khai, có rủi ro claim sai/BR-004 (thông tin khách hàng/dự án
  nhà nước chưa được phép), bilingual, liên quan SEO metadata
- Blast radius: 3 trang AI detail × 2 locale; case study detail + list filter + AI overview teaser + home teaser;
  SEO metadata (title/description lấy từ content)
- Doc impact: `docs/DESIGN.md` (nội dung/current-state), `docs/generated/*` inventory nếu có; no API/schema change
- Decision impact: NO

## Scope (spec refs)
- **R-06a** `custom-ai` = Talvra (phần A.1 marketing EN + A.2 business context VI, đã lọc bỏ credentials/infra).
- **R-06b** `boxai` = AI camera + AI Box (phần B: B.1–B.13) + Đền Bảo Hà (định tính, **không số liệu bịa**).
- **R-06c** `flycam` = DJI Dock 2 + Matrice 3TD (phần B: B.6–B.9, B.13).
- **R-06e** liên kết case study Óc Eo (BRD FR-030 AC `docs/BRD.md:90`).
- **R-08a** `oc-eo-learning` (phần C) — vấn đề → giải pháp → kết quả; category `ai`; giữ slug.
- NFR: **R-20** (i18n VI/EN), **R-21** (SEO meta từ content), **R-25 BR-004** (không công bố thông tin chưa được phép),
  **R-26** (content thật), **R-24** (heading hierarchy/alt).

## Content mapping (dùng content nhúng trong change file — nguồn DUY NHẤT, không đọc file ngoài repo)
- `custom-ai`: description (1–2 câu) + `benefits` + `useCases` + `sections`:
  vấn đề của SME · Talvra là gì · 4 nguyên tắc · 3 template (Support/Sales/Ecommerce) · hành trình 6 bước ·
  kênh (Zalo/KioskViet/Telegram) · điểm khác biệt · an toàn & kiểm soát · tiến độ + roadmap · đối tượng · tầm nhìn.
- `boxai`: description + `benefits` (lợi ích) + `useCases` (ứng dụng ngành) + `highlights` (KPI) + `sections`:
  kiến trúc 3 tầng · phần cứng (Orin NX/Nano, DeepStream) · ngân sách thuật toán/kênh · danh mục 21 thuật toán +
  3 tính năng nền · gói theo ngành (di tích/rừng/KCN) · **triển khai Đền Bảo Hà (định tính)**.
- `flycam`: description + `benefits` + `useCases` + `highlights` (thời gian phản ứng) + `sections`:
  thiết bị · thời gian phản ứng theo khoảng cách · 3 khái niệm diện tích phủ · 4 route · lịch theo cấp cháy I–V ·
  bộ lọc trigger · FAQ.
- `oc-eo-learning`: `title`, `category: ai`, `sector`, `client`, `year`, `challenge`/`solution`/`result` (phần C),
  `metrics` (vd ~200 camera, ~433 ha, lộ trình 12 tuần — **chỉ số từ phương án, ghi đúng bản chất**),
  `gallery` (alt đúng context), `related`.
- `relatedCases: [oc-eo-learning]` cho `flycam` (+ `boxai` nếu hợp lý) để thoả R-06e.
- `src/content/home.ts`: cập nhật `featuredCase` (VI+EN) — title/description/alt hiện vẫn là "Số hóa quản lý đào tạo
  tại Óc Eo" → đổi sang context dự án AI camera + flycam Óc Eo (trang chủ `CaseStudyHighlight` đang hiển thị nội dung cũ).
- **EN**: dịch trung thành từ bản VI (BRIEF yêu cầu song ngữ; tối thiểu VI hoàn chỉnh).

## Acceptance Criteria
- [ ] Trang AI / **AI tùy chỉnh** có nội dung Talvra (platform, template, lợi ích, use case) — render thật, không placeholder
- [ ] Trang AI / **BoxAI** có nội dung phần B (kiến trúc, thuật toán, lợi ích, ứng dụng ngành) + đề cập triển khai Đền Bảo Hà
- [ ] Trang AI / **Flycam** có nội dung flycam phần B (DJI Dock 2, phạm vi phủ, thermal, use case)
- [ ] Case Study Óc Eo sửa từ "Số hoá quản lý đào tạo" sang đúng nội dung phần C, đúng format vấn đề → giải pháp → kết quả
- [ ] Trang chủ `CaseStudyHighlight` (`src/content/home.ts` featuredCase) không còn hiển thị tiêu đề "Số hóa quản lý đào tạo tại Óc Eo"
- [ ] Song ngữ VI/EN (VI hoàn chỉnh; EN dịch tương ứng); không còn chuỗi placeholder cũ
- [ ] **KHÔNG bịa** số liệu Đền Bảo Hà; **KHÔNG** ghi "kết quả đã đạt" cho Óc Eo nếu chưa xác nhận là dự án đã triển khai
- [ ] `npm run lint` · `npm run typecheck` · `npm run build` PASS; SSG giữ nguyên
- [ ] Reviewer độc lập PASS (không tự review)

## Verification Plan
- Commands: `npm run lint` · `npm run typecheck` · `npm run build`
- Test: `test_command: null` → skip, ghi lý do
- Evidence: grep chuỗi placeholder cũ (`Số hóa quản lý đào tạo`) = 0 trong content mới; đọc lại 8 file content;
  build output; render check 3 AI route + case study detail ở cả 2 locale

## Feature Verification
- Acceptance criteria: **PENDING** (chưa build — chờ user duyệt plan + trả lời needs-input)
- Verify commands + result: **PENDING**
- Reviewer verdict: **PENDING** (report dự kiến `.context/review-reports/change-ai-solution-content-phase-1-task-02-round-1-review.md`)

## ⚠️ Needs-input (gate trước khi build)
1. **Óc Eo**: phần C là **phương án đề xuất** hay **dự án đã triển khai**? → quyết định wording `result`/`metrics`
   (nếu là phương án: ghi rõ "phương án/dự toán/kết quả kỳ vọng", KHÔNG ghi "đã đạt").
2. **Đền Bảo Hà**: số camera/thiết bị/ngày triển khai chưa có → chỉ viết **định tính**, chờ anh Tuấn Anh confirm.
3. Xác nhận được phép công bố tên Óc Eo / Đền Bảo Hà (BR-004 — dự án nhà nước/di tích).

## Retry / Escalation
- Attempt: 0
- Last failure type: n/a
- Error memory entry: none
- Escalation: sau 3 attempt fail → `architecture_review_needed`, dừng, báo human

## DoD (Definition of Done)
- [ ] Content written (8 file, chỉ trong scope)
- [ ] Tests: skip — `test_command: null`
- [ ] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [ ] Reviewer PASS (độc lập)
- [ ] `.context/progress.json` updated (close-out)
- [ ] Doc Impact/Reconcile recorded
- [ ] committed — 1 task = 1 commit (branch `main`, KHÔNG push)

## Files to Create/Modify
- `src/content/solutions/vi/custom-ai.mdx` + `en/custom-ai.mdx`
- `src/content/solutions/vi/boxai.mdx` + `en/boxai.mdx`
- `src/content/solutions/vi/flycam.mdx` + `en/flycam.mdx`
- `src/content/case-studies/vi/oc-eo-learning.mdx` + `en/oc-eo-learning.mdx`
- `src/content/home.ts` (featuredCase VI+EN — sửa tiêu đề/mô tả Óc Eo trên trang chủ)
- `docs/DESIGN.md` (doc reconcile — nội dung current-state) nếu cần

## Notes
- Task này phụ thuộc task-01 (field `sections`/`highlights`/`faq` + render).
- Giữ slug `oc-eo-learning` (không đổi URL/SEO). Ảnh gallery hiện là SVG placeholder — có thể giữ ảnh cũ hoặc
  ghi chú cần ảnh mới (không chặn build).
- Builder KHÔNG tự commit / không update progress.
