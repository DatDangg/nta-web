# Spec Validation — change/ai-solution-content (pre-plan)

> **Verdict: PASS (có điều kiện)**
> **Agent:** spec-validator (chạy INLINE bởi change-request — env chặn nested subagent, `subagent_depth=1`;
> theo precedent repo `fix-layer1-dead-links-spec-validation.md` ghi rõ inline self-review. Primary nên re-run
> validator độc lập nếu cần xác nhận hậu-build.)
> **Ngày:** 2026-10-09 · **Branch:** main
> **Phạm vi đã đọc:** `spec/changes/2026-10-09-ai-solution-content.md`, `SPECIFICATIONS.md` (R-06/R-06a–e, R-08/R-08a),
> `spec/updates/2026-10-09-ai-solution-content.md`, `spec/CHANGELOG.md`, `spec/test-scope/current.json`,
> `tasks/change-ai-solution-content/phase-1-task-01.md`, `phase-1-task-02.md`, `docs/BRD.md:87-100`,
> `docs/DESIGN.md:101-119`, `src/content/types.ts`, `src/app/[locale]/solutions/ai/[slug]/page.tsx`,
> `src/app/[locale]/solutions/ai/page.tsx`, `src/lib/content/{solutions,case-studies,load-mdx}.ts`,
> `src/content/solutions/{vi,en}/{custom-ai,boxai,flycam}.mdx`, `src/content/case-studies/{vi,en}/oc-eo-learning.mdx`,
> `src/content/home.ts`, `src/components/{solutions,case-studies,home}/*`, `package.json`.

## 1. Acceptance Coverage (5 mục trong change file)

| # | Acceptance | Requirement / Task bao phủ | Verdict |
|---|---|---|---|
| 1 | AI tùy chỉnh có nội dung Talvra (platform, template, lợi ích, use case), không placeholder | R-06a + task-02 (mapping custom-ai) | PASS |
| 2 | BoxAI có nội dung phần B (kiến trúc, thuật toán, lợi ích, ứng dụng ngành) + đề cập Đền Bảo Hà | R-06b + task-02 (mapping boxai; Đền Bảo Hà định tính) | PASS (điều kiện needs-input #2) |
| 3 | Flycam có nội dung phần B (DJI Dock 2, phạm vi phủ, thermal, use case) | R-06c + task-02 (mapping flycam) | PASS |
| 4 | Case Study Óc Eo sửa đúng phần C, đúng format vấn đề → giải pháp → kết quả | R-08a + task-02 (oc-eo-learning + `home.ts`) | PASS (điều kiện needs-input #1) |
| 5 | Song ngữ VI/EN (tối thiểu VI hoàn chỉnh) | R-20 + task-02 (8 file content + `home.ts` VI/EN) | PASS |

## 2. Findings

### CRITICAL
- (none)

### MAJOR
- **M-1 (đã xử lý trong plan):** Nội dung Óc Eo sai context **không chỉ** ở case-study MDX mà còn ở
  `src/content/home.ts:20` (VI) và `:32` (EN) — `featuredCase.title` = "Số hóa quản lý đào tạo tại Óc Eo",
  dùng bởi `CaseStudyHighlight` trên trang chủ (`src/app/[locale]/page.tsx:51`). Task-02 ban đầu bỏ sót file này.
  **→ Đã bổ sung** `src/content/home.ts` vào scope/acceptance/files của task-02 và `changed.files` + `impact.dependents`
  của `spec/test-scope/current.json`. Coverage acceptance #4 giờ đã đủ.

### MINOR
- **m-1:** `docs/DESIGN.md:105-107` (Screen "Chi tiết giải pháp AI") liệt kê components cũ
  (PageHeader, FeatureList, UseCases, CaseStudyLink, CTAForm) — thiếu `benefits`/section mới. Task-01 đã ghi
  doc impact `docs/DESIGN.md` → OK, chỉ cần reconcile lúc close-out.
- **m-2:** Acceptance #3 nêu rõ "**thermal**"; task-02 mapping flycam ghi "thiết bị" (bao hàm)
  nhưng chưa nêu tường minh thông số thermal `640x512 → 1280x1024 UHR`. Đề nghị builder ghi rõ (không chặn).
- **m-3:** Quy ước ID mới dùng sub-ID `R-06a…R-06e`, `R-08a` (trước đây chỉ R-01…R-27). Chấp nhận được
  (làm rõ refine của R-06/R-08), đã khớp giữa `SPECIFICATIONS.md` ↔ change file ↔ `test-scope.specRefs`.
- **m-4:** `spec/test-scope/current.json.generatedAt` = `2026-10-09T00:00:00+07:00` (mốc ngày, không phải giờ thật)
  — chấp nhận trong ngữ cảnh DEV, có thể cập nhật giờ thực lúc close-out.

### Ghi nhận (không phải defect)
- `benefits` đã có trong `Solution` type nhưng **chỉ** render ở trang enterprise → task-01 "thêm render ở AI page"
  đúng phạm vi, không phải bug.
- `relatedCases` đã được xử lý ở `solutions/ai/[slug]/page.tsx:43` → R-06e chỉ cần set dữ liệu, không cần code mới.
- `solutions/ai/page.tsx:43` tìm case study theo slug `oc-eo-learning` (không theo category) → đổi category sang `ai`
  **không** làm rớt teaser.
- Không có `remark-gfm`/`@tailwindcss/typography` trong repo → quyết định task-01 **không** dùng MDX body/table
  (dùng `sections` từ frontmatter) là khả thi và tránh thêm dependency. **Không conflict.**
- `CaseStudyFilter.tsx:18` đã hỗ trợ filter `ai` → đổi category an toàn.

## 3. Conflict check
| Đối tượng | Kết quả |
|---|---|
| `SPECIFICATIONS.md` cũ (R-06/R-08) | Không phá: chỉ mở rộng thêm R-06a–e/R-08a, giữ route/slug/phạm vi |
| `docs/BRD.md:88-90` (FR-030) | Khớp — AC "mô tả + case study liên quan (Óc Eo)" được thoả bởi R-06e + R-08a |
| `docs/BRD.md:98-100` (FR-050) | Khớp — ≥2 case study, format vấn đề→giải pháp→kết quả |
| `docs/DESIGN.md` | Lệch nhẹ ở component list (m-1) — xử lý qua doc reconcile |
| Code hiện tại | Không conflict; type mở rộng optional (không phá enterprise/home `SolutionCard`) |

## 4. Spec version
- `spec_version` 1.0.1 → **1.1.0 (MINOR)**: đúng `docs/SPEC_VERSIONING.md` (thêm requirement/content, không breaking).
- `scopeVersion` 4 → **5**: đúng (tăng 1 mỗi lần sinh scope).
- Trigger `feature-update`, `workItem: change-ai-solution-content`, specRefs `R-06a…R-06e, R-08a`: đúng schema hiện có.

## 5. Needs-input & Risk (BR-004)
1. **Óc Eo — phương án đề xuất hay dự án đã triển khai?** Phần C mô tả số liệu "từ phương án" (dự toán + lộ trình
   12 tuần). Nếu là **phương án**, `result`/`metrics` phải ghi "kết quả kỳ vọng / dự toán", KHÔNG ghi "đã đạt".
   → đã ghi trong `SPECIFICATIONS.md` R-08a + task-02 "Needs-input". **Không chặn plan, nhưng PHẢI chốt trước khi build task-02.**
2. **Đền Bảo Hà** — số camera/thiết bị/ngày triển khai chưa có → chỉ viết định tính; chờ anh Tuấn Anh. Đã ghi R-06b + task-02.
3. **BR-004** — Óc Eo & Đền Bảo Hà là di tích/dự án nhà nước; change file đã yêu cầu công bố (coi như user authorize),
   nhưng vẫn nên xác nhận quyền công bố tên + số liệu trước khi lên public.

## 6. Kết luận
- **PASS có điều kiện.** Spec delta + 2 task bao phủ đủ 5 acceptance; 1 MAJOR (home.ts) đã được bù vào plan.
- Điều kiện trước build task-02: chốt 2 needs-input (Óc Eo status + Đền Bảo Hà numbers) như human checkpoint.
- Đề xuất: Primary trình user duyệt plan (2 task) + hỏi 2 needs-input trước khi gọi `builder`.
