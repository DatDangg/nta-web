# Review: feature-nta-website — layer-0-task-01

Agent: reviewer

## Review level: NORMAL

## Reason
Task là scaffold nền móng (Next.js 15 App Router + TS + Tailwind + verify scripts) — `SHARED_FOUNDATION`,
toàn repo phụ thuộc, nhưng **không** đụng auth/RBAC, tenant isolation, DB/schema/migration, API contract,
payment, cron/webhook, upload/file access. Không có risk đỏ bắt buộc STRICT. Diff rộng (nhiều file config)
nên không đủ hẹp để FAST → chọn NORMAL (khớp dự kiến trong task file).

## Blast radius
- Toàn repo: `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`,
  `tailwind.config.ts`, `.eslintrc.json`, `.gitignore`, `next-env.d.ts`.
- `src/app/*` (layout/page/globals) + `src/{components,content,i18n,lib}/.gitkeep`.
- Mọi layer/task sau phụ thuộc stack + scripts `lint`/`typecheck`/`build` + breakpoint Tailwind ở đây.

## Verify commands + result
Lấy từ `.context/project-config.md` §Check commands: `install: npm install`, `web_lint: npm run lint`,
`web_typecheck: npm run typecheck`, `build: npm run build`, `test: null`.

- `shell` bị permission deny trong phiên reviewer này (thử `git ...` và `npm run lint`) → **Blocked:
  không chạy được verify command nào**; đã dừng theo Tool Loop Guard (không retry/đổi biến thể).
- Kiểm chứng thay thế (artifact + static, không phải chạy lệnh):
  - `package-lock.json` tồn tại (2.6k+ dòng, `node_modules/next` = `15.5.27`, `node_modules/tailwindcss`
    = `3.4.19`) → xác nhận `npm install` đã chạy và resolve.
  - `.next/types/routes.d.ts` tồn tại với nội dung `type AppRoutes = "/"` và `LayoutRoutes = "/"` →
    **bằng chứng build artifact**: `next build` đã chạy thành công và compile route placeholder `/`.
  - `node_modules/eslint` = `8.57.1`; `.eslintrc.json` = `next/core-web-vitals`; `eslint-config-next@15.5.9`
    có `overrides: [{ files: ['**/*.ts?(x)'], parser: '@typescript-eslint/parser' }]` → theo ESLint v8 docs
    (`--ext` default = `.js` + files khớp `overrides`), `eslint .` **có** lint `.ts/.tsx` → script lint không
    bị no-op (giả thuyết false-confidence đã loại).
  - `test_command: null` → `skip, no app configured` (v1 chưa có test framework) — đúng.

> Kết luận: test skip hợp lệ; install/build có bằng chứng artifact; lint/typecheck chỉ kiểm được tĩnh
> (chưa chạy trực tiếp). Ghi ở Residual risk.

## Acceptance Criteria check

| AC | Kết quả | Bằng chứng |
|---|---|---|
| `npm install` sạch + lockfile | ✅ (static) | `package-lock.json` tồn tại, next/react/tailwind resolve |
| `npm run lint/typecheck/build` PASS | ⚠️ Blocked (env) | lint/typecheck xác minh tĩnh; build có artifact `.next/types/routes.d.ts` |
| Script `lint`/`typecheck`/`build` đúng tên | ✅ | `package.json:9-10` `eslint .` / `tsc --noEmit`; `package.json:7` `next build` — khớp `check_commands` |
| Cấu trúc `src/` (app, components, content, i18n, lib) | ✅ | `src/app/*.tsx`, `src/{components,content,i18n,lib}/.gitkeep` |
| App build trang placeholder | ✅ (artifact) | `.next/types/routes.d.ts` `AppRoutes = "/"`; `src/app/page.tsx` render `<h1>` |
| Tailwind breakpoints 640/768/1024/1280/1536 | ✅ | `tailwind.config.ts:6-12` khớp chính xác R-23 |
| Không shadcn/UI library ngoài Tailwind | ✅ | `package.json` deps chỉ `next`, `react`, `react-dom`; không UI lib |
| File gốc repo không bị xóa/ghi đè | ✅ | `AGENTS.md`, `README.md`, `SPECIFICATIONS.md`, `opencode.jsonc`, `scripts/*`, `skills/*`, `spec/*` còn nguyên |
| `.gitignore` append không ghi đè | ✅ | Nội dung hiện tại 6 dòng = 5 dòng gốc (đúng 48 bytes như task mô tả) + `.next/` append |

## Responsive Checklist Gate (diff đụng UI: layout.tsx / page.tsx / globals.css / tailwind.config.ts)

Project có `ui:` trong project-config và diff đụng file UI, nên gate áp dụng — nhưng UI hiện là placeholder
**chưa có style** (chỉ `<h1>` + Tailwind directives). Không có môi trường browser → xác minh bằng static/CSS math.

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout (no h-scroll, mobile-first, grid, container) | N/A | Chưa có style/grid/container; `page.tsx` chỉ `<main><h1>`; `globals.css` chỉ 3 `@tailwind` directive |
| Typography/Spacing (rem, clamp, scale) | N/A | Chưa khai báo font-size/spacing nào |
| Media (img max-width, aspect-ratio, srcset) | N/A | Không có `<img>`/media trong diff |
| Touch/Interaction (44px, nav mobile, table scroll) | N/A | Không có control/nav/table trong diff |
| Viewport/A11y (100dvh, reduced-motion, overflow) | N/A | Không dùng `100vh`/overflow/ẩn lỗi |
| Breakpoint scale (nền tảng responsive) | OK (static) | `tailwind.config.ts` khai `screens` đúng 5 mốc; content glob `./src/**/*` đúng |

→ Không mục nào FAIL. Phần style/motion/states thực sự thuộc các layer task sau (task-02+).

## Skill gates

- **aislop** (`aislop scan --changes --json`, score ≥80): `skip` — không chạy được CLI (shell permission
  deny trong phiên). Ghi Residual risk, không tự bịa score.
- **anti-slop / oxlint**: `skip, oxlint not configured` — không có `.oxlintrc*`, không có cấu hình oxlint
  trong repo (`package.json` không có `oxlint`).
- **open-code-review (`ocr`)**: `skip` — không chạy được (shell blocked); không chặn PASS.
- **AI-readable gate**: `OK` — file nhỏ (layout 15 dòng, page 7 dòng, page.tsx/layout.tsx dưới 300 dòng);
  tên self-descriptive; không có magic number (breakpoint nằm trong config), không indirection, không
  comment WHAT thừa (comment trong `next-env.d.ts` là do Next sinh, marked "do not edit"); task khai
  `NO_DOC_IMPACT` và diff không đổi luồng chính → không đủ ≥3 indicator.
- **ai-friendly-web** (public-facing web): `N/A` — task scaffold nội bộ, chưa deploy/public; `llms.txt`/
  `robots.txt`/`sitemap.xml` thuộc Phase DevOps/deploy, ngoài scope task-01.
- **blitzstrike (pentest)**: `N/A` — chỉ áp dụng STRICT task nhạy cảm (auth/API public/input); task NORMAL
  và không có attack surface (không input/endpoint).
- **security**: `OK` (static) — không có user input, không secret hardcode, không `dangerouslySetInnerHTML`,
  không endpoint. `semgrep` không chạy được do shell blocked → ghi Residual risk.

## Findings

### ✅ Good
- Script names đúng `check_commands`; Tailwind `screens` khớp chính xác R-23 (640/768/1024/1280/1536).
- Không thêm dependency thừa (đúng ponytail/YAGNI): chỉ `next`, `react`, `react-dom` + dev tooling. Không shadcn.
- Không shadcn / UI library; Tailwind v3 (CSS-first directives) nhất quán giữa `postcss.config.mjs` +
  `globals.css` + `tailwind.config.ts`.
- `.gitignore` giữ nguyên 5 dòng gốc (48 bytes) và chỉ append `.next/` — không mất nội dung.
- Cấu trúc `src/` đủ 5 nhánh + `.gitkeep`; artifact `.next/types/routes.d.ts` chứng minh route placeholder build được.

### ❌ Issues
Không có CRITICAL/MAJOR. Các điểm dưới đây là MINOR/khuyến nghị (không block PASS):

- **[MINOR]** `next-env.d.ts:3` tham chiếu `/// <reference path="./.next/types/routes.d.ts" />`, nhưng
  `.next/` nằm trong `.gitignore` (sinh khi build). Trên bản checkout sạch, nếu chạy `npm run typecheck`
  (`tsc --noEmit`) **trước** `next build`/`next dev` lần đầu, file reference chưa tồn tại → nguy cơ lỗi
  TS6053, tức `typecheck` không tự đủ (self-sufficient) trên CI clean.
  - Bằng chứng: `node_modules/next/dist/lib/typescript/writeAppTypeDeclarations.js` luôn push directive
    `types/routes.d.ts` (không phụ thuộc config typedRoutes); `.next/types/routes.d.ts` chỉ là build artifact.
  - Đề xuất (không tự sửa): verify trên clean checkout; nếu fail, sắp thứ tự pipeline **build trước**
    typecheck, hoặc để Next generate types trước `tsc` trong CI (devops layer sau).
- **[MINOR]** Quyết định lint: design `docs/specs/2026-10-08-nta-website-design.md:57` ghi `next lint`,
  builder chọn `eslint .` (`package.json:9`). Task cho phép chọn 1 trong 2, nhưng yêu cầu **ghi vào Notes**
  khi close-out (task Notes dòng 86-87). Đảm bảo close-out có ghi quyết định + lý do (Tailwind v3 +
  eslint-config-next). Không phải lỗi code.
- **[MINOR]** `eslint@^8.57.1` đã EOL và bị npm đánh dấu `deprecated` trong lockfile. Không chặn scaffold;
  cân nhắc migrate ESLint 9 + flat config ở task riêng (cũng sẽ hết cảnh báo).
- **[MINOR — residual/không FAIL theo chỉ đạo]** `npm audit --audit-level=high` (không nằm trong
  `check_commands` của project-config) builder báo FAIL: 9 high / 3 moderate, remediation gợi ý breaking
  (Next 16 / Tailwind v4). Chưa verify được (shell blocked). Không tính FAIL cho task-01; đề xuất mở
  follow-up task đánh giá CVE thực tế + lộ trình nâng cấp (ngoài scope Layer 0).

### 💡 Suggestions
- `tailwind.config.ts` khai `theme.screens` trực tiếp (không `extend`) — trùng giá trị default Tailwind nên
  vô hại, nhưng nếu sau này muốn giữ breakpoint bổ sung thì đặt trong `extend.screens` để tránh ghi đè.
- Thêm `.eslintignore`/`ignorePatterns` khi có thêm file non-src nếu cần — hiện chưa cần.

## Residual risk
- Không chạy được `npm install`/`lint`/`typecheck`/`build`, `semgrep`, `aislop`, `ocr` do shell permission
  deny trong phiên reviewer → lint/typecheck dựa trên static + builder evidence; install/build có artifact
  (`package-lock.json`, `.next/types/routes.d.ts`).
- Không chạy được `git diff` (shell blocked) → không đối chiếu byte-level diff; việc "file gốc không bị ghi
  đè" xác minh bằng sự tồn tại file + byte-math `.gitignore` (48 bytes khớp mô tả task).
- Nguy cơ TS6053 clean-checkout ở Finding MINOR #1 chưa verify được (thiếu môi trường).

## Verdict Reasoning
Mọi acceptance criteria của task-01 đạt (verify tĩnh + artifact độc lập cho install/build; script đúng tên;
`src/` đủ; breakpoint khớp R-23; không shadcn; file gốc còn nguyên; `.gitignore` append đúng). Không có
CRITICAL/MAJOR. Các điểm còn lại là MINOR/residual và không thuộc phạm vi chặn của Layer 0. Task không phải
bug task nên không áp dụng điều kiện repro PASS.

## Verdict: ✅ PASS

_(Ghi chú: PASS này không thay thế việc chạy verify command thật — khuyến nghị primary/builder chạy lại
`npm run lint && npm run typecheck && npm run build` trên checkout sạch trước khi commit, và ghi quyết định
`eslint .` vào task Notes khi close-out.)_
