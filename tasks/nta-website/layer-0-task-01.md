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
- [x] `npm install` chạy sạch (lockfile `package-lock.json` sinh ra — npm là package manager)
- [x] `npm run lint` PASS · `npm run typecheck` PASS · `npm run build` PASS
- [x] Script `lint`/`typecheck`/`build` đúng tên trong `package.json` (khớp `check_commands`)
- [x] Cấu trúc `src/` (app, components, content, i18n, lib) tồn tại; app build được trang placeholder
- [x] Tailwind breakpoints khớp R-23 (640/768/1024/1280/1536); không thêm shadcn/UI library ngoài Tailwind
- [x] File gốc của repo (AGENTS.md, README.md, scripts/, skills/, spec/) không bị xóa/ghi đè

## Verification Summary
- Commands (`.context/project-config.md`): `npm install` PASS · `npm run lint` PASS (`eslint .`) · `npm run typecheck` PASS · `npm run build` PASS (prerender `/`).
- Test: `test_command: null` → skip, `v1 chưa có test framework`.
- Manual evidence: chưa chạy `npm run dev` (residual); build artifact `.next/types/routes.d.ts` (`AppRoutes = "/"`) chứng minh route placeholder compile OK.
- Reviewer report: `.context/review-reports/feature-nta-website-layer-0-task-01-round-1-review.md` — Verdict **PASS** (NORMAL, 0 CRITICAL/MAJOR).

## Retry / Error Memory
- Attempt: 0 (lần gọi builder 1 bị interrupt do cancel — redo, không tính attempt)
- Last failure type: n/a
- Error memory entry: none (không có lỗi verify; `npm audit` không thuộc `check_commands`)
- Escalation: none

## DoD (Definition of Done)
- [x] Code written (chỉ trong scope)
- [x] Tests: skip — `test_command: null` (v1 chưa có test framework), ghi lý do
- [x] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [x] Reviewer độc lập PASS
- [x] `.context/progress.json` updated
- [x] Error Memory updated (`n/a`), Doc Impact reconciled (`NO_DOC_IMPACT`)
- [x] committed — **1 task = 1 commit** (branch `main`, KHÔNG push — `auto_push_after_pass: false`)

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

## Notes (close-out)
- **Tailwind v3** (`^3.4.18`, resolve 3.4.19) + `tailwind.config.ts` khai `screens` 640/768/1024/1280/1536.
- **Lint = `eslint .`** (không dùng `next lint`): task cho phép chọn 1; dùng `eslint .` + `.eslintrc.json`
  (`next/core-web-vitals`), eslint-config-next có overrides `**/*.ts?(x)`.
- **Next nâng `^15.5.27`** (từ 15.5.9) sau audit advisories; React 19.1.1.
- **Doc Impact: NO_DOC_IMPACT** (stack đã ghi trong SPECIFICATIONS.md Tech Stack).
- **Residual risk / follow-up (không block PASS):**
  1. `npm audit --audit-level=high` FAIL (9 high/3 moderate) — KHÔNG thuộc `check_commands`; remediation gợi ý
     breaking major (Next 16/Tailwind v4) → đề xuất task follow-up đánh giá CVE (ngoài Layer 0).
  2. `next-env.d.ts` reference `.next/types/routes.d.ts` (gitignored) → nguy cơ TS6053 trên clean checkout
     nếu chạy `typecheck` trước `build`; CI DevOps layer cần build-trước-typecheck.
  3. `eslint@^8.57.1` EOL → cân nhắc migrate ESLint 9 flat config ở task riêng.
  4. Chưa chạy `npm run dev` thủ công (build artifact đã chứng minh route OK).
- ⚠️ Protocol: builder subagent tự ghi journal (vi phạm "subagent KHÔNG ghi") — Primary đã reconcile.
