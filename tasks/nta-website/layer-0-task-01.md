# Task 01: Scaffold Next.js + TypeScript + Tailwind + verify scripts

## Layer
0

## Type
build (initial)

## Goal
Dựng khung dự án Next.js (App Router) + TypeScript + Tailwind CSS tại repo root, với cấu trúc thư mục
`src/` và **đúng các script** `lint`/`typecheck`/`build` mà `.context/project-config.md` yêu cầu —
đây là nền móng để mọi layer sau build/verify được.

## Classification / Risk
- Work item type: FEATURE (initial build)
- Feature change type: ADDITIVE (initial build)
- Scope: SHARED_FOUNDATION
- Root cause category: n/a
- Review level expected: NORMAL (reviewer tự chốt lại) — shared foundation nhưng không auth/API/data
- Blast radius: toàn repo (package.json, tsconfig, src/app — mọi task sau phụ thuộc)
- Doc impact: NO_DOC_IMPACT (stack đã ghi trong SPECIFICATIONS.md Tech Stack)
- Decision impact: NO

## Scope (spec refs)
- Tech Stack: `SPECIFICATIONS.md` (Next.js App Router + TS + Tailwind, tailwind only — không shadcn)
- R-23 (breakpoint thang Tailwind — baseline config), R-22 (build bundle), R-21 (SSR/SSG base)
- `.context/project-config.md`: `package_manager: npm`, `source_roots: [src]`, check_commands
  (`npm run lint` / `npm run typecheck` / `npm run build` — script PHẢI tồn tại đúng tên)
- Design: `docs/specs/2026-10-08-nta-website-design.md` §Architecture + §Tooling

## Dependencies
- (none — task đầu của dự án)

## Description
1. Scaffold Next.js 15 (App Router) + TypeScript + Tailwind CSS **bằng tay hoặc tmp-dir** —
   ⚠️ repo ĐÃ có file (`AGENTS.md`, `README.md`, `scripts/`, `skills/`, `spec/`, `.gitignore`…) →
   `create-next-app` trên thư mục không rỗng sẽ fail; builder scaffold thủ công hoặc tạo ở tmp rồi move.
2. `package.json` scripts (bắt buộc đúng tên):
   - `"lint": "next lint"` (hoặc `eslint .` — chọn 1, ghi vào Notes)
   - `"typecheck": "tsc --noEmit"`
   - `"build": "next build"`
3. Cấu trúc thư mục tối thiểu (theo design §Architecture):
   `src/app/`, `src/components/`, `src/content/`, `src/i18n/`, `src/lib/` + placeholder
   `src/app/layout.tsx` & `page.tsx` sẽ được thay bằng `[locale]` group ở task-02.
4. Tailwind config theo breakpoints đã chốt (sm640/md768/lg1024/xl1280/2xl1536), ESLint config,
   `.gitignore` bổ sung `node_modules/`, `.next/` (file `.gitignore` sẵn có 48 bytes — append, không ghi đè mất nội dung).

## Acceptance Criteria
- [ ] `npm install` chạy sạch (lockfile `package-lock.json` sinh ra — npm là package manager)
- [ ] `npm run lint` PASS · `npm run typecheck` PASS · `npm run build` PASS
- [ ] Script `lint`/`typecheck`/`build` đúng tên trong `package.json` (khớp `check_commands`)
- [ ] Cấu trúc `src/` (app, components, content, i18n, lib) tồn tại; app build được trang placeholder
- [ ] Tailwind breakpoints khớp R-23 (640/768/1024/1280/1536); không thêm shadcn/UI library ngoài Tailwind
- [ ] File gốc của repo (AGENTS.md, README.md, scripts/, skills/, spec/) không bị xóa/ghi đè

## Verification Summary
- Commands (`.context/project-config.md`): `npm install` · `npm run lint` · `npm run typecheck` · `npm run build`
- Test: `test_command: null` → skip, ghi lý do (v1 chưa có test framework)
- Manual evidence: `npm run dev` → trang placeholder render tại `http://localhost:3000`
- Reviewer report: `.context/review-reports/feature-nta-website-layer-0-task-01-round-1-review.md`

## Retry / Error Memory
- Attempt: 0
- Last failure type: n/a
- Error memory entry: none (ghi vào `.context/error-memory.md` khi fail)
- Escalation: none — sau 3 attempt fail → `architecture_review_needed`, dừng chờ review

## DoD (Definition of Done)
- [ ] Code written (chỉ trong scope)
- [ ] Tests: skip — `test_command: null` (v1 chưa có test framework), ghi lý do
- [ ] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [ ] Reviewer độc lập PASS
- [ ] `.context/progress.json` updated
- [ ] Error Memory updated (hoặc `n/a`), Doc Impact reconciled (hoặc `no doc impact`)
- [ ] committed — **1 task = 1 commit** (branch `main`, KHÔNG push — `auto_push_after_pass: false`)

## Files to Create/Modify
- `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs` (+ Tailwind)
- `eslint.config.mjs` (hoặc `.eslintrc.json`)
- `src/app/layout.tsx`, `src/app/page.tsx` (placeholder → thay ở task-02)
- `.gitignore` (append)

## Notes
- ⚠️ Không hardcode package manager: dùng `npm` (đã chốt trong project-config).
- Không cài dependency thừa (ponytail/YAGNI) — mỗi package thêm phải có lý do ghi vào Notes/commit body.
- Tailwind v4 (CSS-first) hay v3 (config file) → builder chọn theo version create-next-app mặc định còn
  hỗ trợ; ghi quyết định vào task Notes khi close-out.
