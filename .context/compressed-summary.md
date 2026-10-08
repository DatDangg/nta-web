# .context/compressed-summary.md

## Last compressed: 2026-10-09T07:00+07:00 (sau khi Layer 1 complete + unlock Layer 2)

> Source of truth cho resume các session sau. Đọc file này trước thay vì toàn bộ history.
> Kèm: `.context/progress.json` (full), `.context/error-memory.md` (5 entry cuối), `.context/decisions.md` (full).

### Completed Tasks (1 line mỗi task)
- layer-0-task-01: scaffold Next.js + TypeScript + Tailwind — DONE (commit `51b75e0`)
- layer-0-task-02: i18n VI/EN plumbing với next-intl — DONE (`965ea6e`)
- layer-0-task-03: content schema, MDX pipeline và loaders — DONE (`9419440`)
- layer-0-task-04: sample content VI/EN cho 9 nhóm trang — DONE (`dd392df`, fix attempt)
- layer-0-task-05: CI workflow, env example, gitignore, README — DONE (`4d47a82`)
- layer-0-task-06: remediation CI typegen, env, Solution/CaseStudy contract, spec reconcile — DONE (`c7c35c3`)
- layer-1-task-01: design tokens + Button/Section/Badge primitives — DONE (`e5b569c`, 3 rounds)
- layer-1-task-02: app shell Header/Footer/drawer + i18n nav — DONE (`268dc79`, 2 rounds)
- layer-1-task-03: PageHeader/Breadcrumb/CTABanner + card family — DONE (`19d51c6`, 2 rounds)
- layer-1-task-04: interactive components Reveal/FilterBar/Pagination/Skeleton/EmptyState — DONE (`843c7a4`, 3 rounds)
- layer-1-task-05: 404 not-found page (Screen 13) — DONE (`e40d486`, FAIL r1 → fix → PASS r2 STRICT)
- fix-layer1-dead-links-phase-1-task-01: MODIFY post-build fix Gap 1–4 (dead links + plan drift) — DONE (`bb1900e`; independent reviewer r2 PASS `1b9ef39`)

### Key Decisions
- Xem `.context/decisions.md` (full). Nổi bật: R-03 = ≥2 sản phẩm (Decision 1, ratified); v1 dùng static content files, không API động (Decision 2); giữ `about.partners: []` chờ xác nhận (Decision 3).
- Domain: ntasolution.vn; song ngữ VI/EN; style light minimal Apple; đối tượng nhà nước + tư nhân.
- Layer 1 contracts ratified + phase review r2 PASS (4/4 gap MED đóng).

### Error Patterns Learned (xem `.context/error-memory.md`)
- Reveal/animation trong Next App Router: `useLayoutEffect` KHÔNG đủ chống SSR flash — phải gate trạng thái ẩn bằng CSS/class ở server render.
- Text/a11y label hiển thị phải đi qua i18n, KHÔNG hardcode copy design (lỗi FilterBar task-04).

### Current State
- Phase: loop (initial build)
- Current layer: **layer-2** (đã unlock sau khi user duyệt)
- Layers done: 0, 1 · Còn layer 2 (7 task), 3 (3 task), 4 (4 task)
- Next task: **layer-2-task-01** (home page, Screen 1)
- Branch: `main` (staging-direct); push KHÔNG tự động (`forbidden_branch: main`, `auto_push_after_pass: false`)
- Spec: `SPECIFICATIONS.md` 1.0.0 (27 req) · `spec/test-scope/current.json` scopeVersion 2 (trigger feature-update)

### Deferred / Non-blocking (sweep Layer 4 đề xuất)
- LOW Gap 5–10 (footer columns, `home.ts` EN href pre-localized — lưu ý khi Layer 2 consume, task-04 doc stale, `hover:border-strong` no-op, icon family chưa Phosphor, `aria-label="Language"` hardcode).
- Conflict C-A: wording card radius (design-tokens §4 `rounded-md` vs design-spec/code `rounded-lg`).
- task-05 MINOR #2: metadata nested not-found `<title>` chưa runtime-verify (defer Layer 4).
- Layer-0 O1/O2 (featured-case số liệu, ví dụ Ốc Eo) deferred Layer 2.

### Anomalies noted
- Commit `9c2a1db` (dup message task-04) là dangling, không ancestor HEAD — bỏ qua.
- `usage()` / plugin `loop-guard` không có trong runtime → usage gate không kiểm được.
- Subagent con (change-request) gặp `subagent depth limit (1)` → reviewer phải chạy ở primary.
