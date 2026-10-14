# phase-1-task-01 — Trang chi tiết Tin tức: bật style thân bài (typography) cho nội dung MDX

- Change: CR-023 `spec/changes/2026-10-14-blog-article-typography.md` (liên quan CR-019 / R-09c; CR-024 khung thẻ riêng = làm sau)
- Status: **done** — user duyệt phương án (b) 2026-10-14; reviewer round 2 PASS (NORMAL); spec 3.15.0 (không bump) · test-scope v46 (bug-fix)
- Spec: dự kiến **không bump** `spec_version` (3.15.0 giữ nguyên) — bug thuần; close-out vẫn sinh `spec/test-scope/current.json` (trigger `bug-fix`, scopeVersion v45 → v46)

## Classification / Risk
- Change type: **BUG (UI)** — code ≠ intent: design-spec trang chi tiết blog đã yêu cầu "prose heading hierarchy bắt đầu từ h2; link nội dung underline offset" (`.context/design-spec.md:537`) nhưng thân bài không có style nào.
- Scope (user chốt 2026-10-14): **CHỈ Mức 1** — style thân bài chung cho `/[locale]/blog/[slug]`. KHÔNG khung thẻ riêng (CR-024), KHÔNG sửa `tools/ai-news/generate.py`.
- Risk: **LOW** — không API/schema/auth/data; `mdxComponents` chỉ có 1 consumer (`src/app/[locale]/blog/[slug]/page.tsx:8,50`) → blast radius = thân bài trang chi tiết Tin tức (vi + en).
- Expected review level: **NORMAL** (UI public, responsive, a11y link/heading).
- Doc impact dự kiến: `.context/design-spec.md` §Blog detail ghi as-built typography thân bài; không đổi intent docs.

## Repro
- Route: `/vi/blog/ai-weekly-2026-w42`, `/en/blog/ai-weekly-2026-w42` (khách vãng lai).
- Actual: `## 1. …` cùng cỡ/độ đậm với đoạn văn, đoạn/“Nguồn:” dính nhau, không khoảng cách giữa tin, link chỉ có gạch chân màu chữ thường; `---` + `*…*` cuối bài không phân biệt.
- Expected: h2/h3 phân cấp rõ, khoảng cách đoạn/tin, link màu primary nhận diện được, list/blockquote/hr có style, link dài không tràn ngang mobile.

## Root cause (evidence)
1. `src/app/[locale]/blog/[slug]/page.tsx:49` bọc thân bài bằng `prose prose-base … prose-headings:* prose-a:* prose-img:* prose-li:marker:*` — các class này **chỉ sinh CSS khi có plugin `@tailwindcss/typography`**.
2. `tailwind.config.ts:91` `plugins: []` và `package.json` không có `@tailwindcss/typography` (dependencies/devDependencies); `node_modules/@tailwindcss/` không tồn tại → Tailwind 3.4.19 (`node_modules/tailwindcss`) bỏ qua toàn bộ class `prose*` (không lỗi build, chỉ là no-op).
3. Tailwind **preflight** reset `h1–h6` (font-size/weight inherit), `p/ul/ol/blockquote` (margin 0), `ul/ol` (list-style none) → MDX render ra thẻ HTML trần không còn khoảng cách/phân cấp.
4. `src/components/mdx/index.tsx:29-40` map `h2/h3/p/ul/ol/li/blockquote/code/pre` thành thẻ trần không class (chỉ `a` có `underline underline-offset-4`, `img` có `my-8 rounded-md`) → không có lớp style dự phòng.
5. Vì sao trước giờ không lộ: 4 bài cũ (`first-steps`, `digital-workflows`, `learning-content`, `responsible-ai`, vi+en, mỗi file 14 dòng) chỉ có đoạn văn; bài `ai-weekly-2026-w42` (CR-019 sinh) là bài đầu tiên có `##`, link, `---`, `*em*`.

Kết luận: không phải lỗi nội dung/pipeline; là thiếu lớp typography cho thân bài. Sửa ở `generate.py` là sửa triệu chứng → ngoài scope.

## Phương án
| | (a) Cài `@tailwindcss/typography` | (b) Style trong `mdxComponents` (không thêm dependency) |
|---|---|---|
| Thay đổi | +1 devDependency (`@tailwindcss/typography@^0.5.x`, tương thích Tailwind 3.4) + `plugins: [typography]` + cấu hình `theme.extend.typography` map màu/cỡ về CSS vars (vì scale mặc định của prose ≠ token: h2 prose ~1.5em, token `text-h2` 32–40px là section title) | Thêm className Tailwind theo token cho từng thẻ trong `src/components/mdx/index.tsx` (h2, h3, p, a, ul, ol, li, blockquote, hr, code, pre, strong/em nếu cần); bỏ class `prose*` chết ở `page.tsx:49` |
| Dependency | **Có** (devDep mới, lockfile đổi) | **Không** |
| Phủ acceptance | Đủ + phủ thêm table/nested list/figure… | Đủ cho mọi thẻ MDX đang/ sẽ sinh (pipeline chỉ sinh h2/p/a/hr/em) — thẻ hiếm (table) chưa có style |
| Bám design tokens | Phải override lại khá nhiều biến `--tw-prose-*` + kích thước | Trực tiếp dùng `text-h3`, `text-primary`, `text-text-secondary`, `border-border`, spacing token |
| Diff | ~3 file + lockfile + cấu hình typography dài | 2 file, ~15–25 dòng |

**Khuyến nghị: (b)** — ponytail/YAGNI: `mdxComponents` đã tồn tại đúng để làm việc này và chỉ có 1 consumer; không thêm dependency; bám token trực tiếp. Nếu sau này bài có table/nội dung phong phú → cân nhắc (a) ở CR riêng.

## Plan (theo (b) — đã duyệt 2026-10-14)
1. `src/components/mdx/index.tsx` — thêm className cho từng thẻ (giá trị cuối do builder chốt theo token):
   - `h2` (cả map `h1→h2`): `mt-12 mb-4 text-h3 font-semibold leading-snug text-text-primary scroll-mt-24` (dùng `text-h3` 22–24px vì `text-h2` 32–40px quá lớn cho heading trong bài 720px; bài đầu tiên không có margin-top thừa: `first:mt-0`).
   - `h3`: `mt-8 mb-3 text-body-lg font-semibold text-text-primary`.
   - `p`: `my-5 leading-relaxed` (màu kế thừa `text-text-primary`).
   - `a`: `text-primary underline underline-offset-4 hover:text-primary-hover break-words [overflow-wrap:anywhere]` + focus-visible ring theo token `focus` (link dài không tràn mobile).
   - `ul`/`ol`: `my-5 pl-6 list-disc|list-decimal space-y-2`; `li`: `marker:text-text-secondary`.
   - `blockquote`: `my-6 border-l-4 border-border-strong pl-4 italic text-text-secondary`.
   - `hr`: `my-10 border-border`; `em`/`strong` giữ mặc định trình duyệt (preflight không reset) — chỉ thêm nếu cần.
   - `code` inline: `rounded-sm bg-surface-sunken px-1 py-0.5 font-mono text-sm`; `pre`: `my-6 overflow-x-auto rounded-md bg-surface-sunken p-4 text-sm` (code trong pre không double bg).
2. `src/app/[locale]/blog/[slug]/page.tsx:49` — thay chuỗi `prose …` (no-op) bằng wrapper tối thiểu (vd `text-base text-text-primary`) — không đổi cấu trúc trang.
3. KHÔNG sửa `generate.py`, nội dung `.mdx`, `RenderMdx`, component khác.

## Acceptance
- [x] Thân bài trang chi tiết Tin tức có style h2/h3, p, a, ul/ol, blockquote, hr (khoảng cách + phân cấp rõ), đúng token.
- [x] `ai-weekly-2026-w42` vi + en: tiêu đề từng tin nổi bật, khoảng cách giữa các tin, dòng nguồn là link màu primary rõ ràng.
- [x] 4 bài cũ × 2 locale không vỡ layout (đoạn văn chỉ thêm khoảng cách).
- [x] Bài pipeline tuần sau tự nhận style (style nằm ở renderer, không phụ thuộc nội dung).
- [x] Mobile 375px: không tràn ngang (link dài wrap).
- [x] typecheck / lint / build PASS.

## Verification
- `npm run typecheck` · `npm run lint` · `npm run build` (Windows: `npm.cmd`; Cowork/VM: `bash tools/linux-build.sh verify`). Build lỗi native binding trong sandbox → ghi `Blocked`, không retry.
- Test framework: `test_command: null` (project-config) → không có unit test; xác nhận bằng repro trực quan.

## Repro Verification
- Trước fix: mở `/vi/blog/ai-weekly-2026-w42` → computed style `h2` font-size = 16px (bằng `p`), `p` margin 0 (đã xác nhận qua root cause: preflight + plugin vắng).
- Sau fix: cùng trang vi + en, viewport 375 / 768 / 1280 — `h2` font-size ≈ 22–24px, weight 600, có margin-top; `p` có margin; link màu primary; không horizontal scroll (`document.documentElement.scrollWidth <= clientWidth`); kiểm thêm `/vi/blog/first-steps`, `/en/blog/responsible-ai`.

## Retry / Escalation
- Max 3 attempt fail thật → `architecture_review_needed`, dừng, không fix #4.
- Redo do cancel không tăng attempt.

## Doc impact (close-out)
- `.context/design-spec.md` §Blog detail: ghi as-built typography thân bài (style qua `mdxComponents`, không dùng plugin typography).
- `spec/test-scope/current.json` (trigger `bug-fix`, scopeVersion +1). Không bump `spec_version` (trừ khi user muốn ghi rõ requirement typography vào R-09 → PATCH).
- Không đổi API/schema; intent docs không đổi.

## Builder notes (round 1)
- Changed files:
  - `src/components/mdx/index.tsx` — className theo token cho h1→h2/h2 (`text-h3` semibold, `mt-12 mb-4 first:mt-0 scroll-mt-24`), h3 (`text-body-lg`), p (`my-5 leading-relaxed`), a (`text-primary` underline offset, `hover:text-primary-hover`, focus-visible outline `focus` giống `cardStyles.ts`, `[overflow-wrap:anywhere]`), ul/ol (`list-disc|list-decimal pl-6 space-y-2 my-5`), li (`marker:text-text-secondary`), blockquote (`border-l-4 border-border-strong` + `text-text-secondary` italic), hr mới (`my-10 border-border`), code inline (`bg-surface-sunken font-mono text-sm`), pre (`overflow-x-auto` + `[&_code]:bg-transparent [&_code]:p-0`). Merge `props.className` qua helper `withClass`. `img` giữ nguyên.
  - `src/app/[locale]/blog/[slug]/page.tsx:49` — `prose …` (no-op) → `text-base text-text-primary`.
- Verify:
  - `npm.cmd run typecheck` → PASS (exit 0).
  - `npm.cmd run lint` → PASS (0 errors, 1 warning có sẵn: `@next/next/no-img-element` ở `ArticleImage` fallback `<img>` — không đổi).
  - `npm.cmd run build` → **Blocked** (môi trường): `Failed to load next.config.ts … [Error: Failed to load native binding]` — lỗi native binding SWC, không liên quan diff; không retry.
  - Bổ sung: compile Tailwind CLI (`tailwind.config.ts`, `@tailwind utilities`) → các class mới đều sinh CSS (`text-h3`, `overflow-wrap: anywhere`, `marker:text-text-secondary`, `[&_code]:…`, `first:mt-0`, `outline-focus`, `scroll-mt-24`, `list-decimal`, `border-border-strong`).
- Repro visual (375/768/1280) chưa chạy — cần dev server/browser; để reviewer/primary xác nhận.

## Review round 1 — FAIL (chỉ do thiếu bằng chứng, không có defect CRITICAL/MAJOR)
- Report: `.context/review-reports/bug-blog-article-typography-phase-1-task-01-round-1-review.md` (NORMAL)
- B1: Repro Verification sau fix chưa có bằng chứng trình duyệt. B2: `npm run build` chưa PASS.
- MINOR (không chặn, ngoài scope): M1 contrast `text-primary` trên nền trắng ~3.4:1 (pattern có sẵn toàn repo → đề xuất CR riêng); M2 inline code chưa có quy tắc wrap; M3 h4–h6/table chưa style.

## Blocked — môi trường agent (2026-10-14)
- `npm.cmd run build` và `node node_modules/next/dist/bin/next build`: `Failed to load next.config.ts` → `Failed to load native binding`.
- Nguyên nhân (đã chẩn đoán qua `next/dist/server/config` loadConfig): `@swc/core` của `next-intl` (`node_modules/next-intl/node_modules/@swc/core/binding.js`) từ chối cache root `C:\Users\datda\AppData\Local\swc` vì DACL cấp quyền cho SID AppContainer của sandbox agent ("DACL grants replacement rights … to SID S-1-15-3-…"). `@next/swc-win32-x64-msvc` tự load OK. Đặt `SWC_NATIVE_BINDING_CACHE` vào `node_modules/.cache/swc-native` vẫn lỗi. Không phải lỗi do diff; không sửa quyền hệ thống.
- Dev server cũng cần load `next.config.ts` → không chạy được repro trực quan trong sandbox.
- Cần user chạy ở terminal: `npm run build` và `npm run dev` → kiểm `/vi|en/blog/ai-weekly-2026-w42`, `/vi/blog/first-steps`, `/en/blog/responsible-ai` ở 375/768/1280 (h2 ≈ 22–24px/600, `p` có margin, link màu primary, `document.documentElement.scrollWidth <= clientWidth`) → rồi chạy reviewer round 2 → close-out.

## Unblock evidence (2026-10-14, phiên chính ngoài sandbox)
- B2 build: `SWC_NATIVE_BINDING_CACHE='C:\Users\datda\.swc-native-cache' npm run build` → **PASS** (compile + generate static pages, gồm `/[locale]/blog/[slug]`). Lỗi trước là DACL cache mặc định `AppData\Local\swc`, không liên quan diff.
- B1 Repro Verification sau fix (`next start`, port 3100):
  - `/vi/blog/ai-weekly-2026-w42` desktop: h2 "1. Character.ai…" fontSize 22px, fontWeight 600, marginTop 48px; p marginBottom 20px; "Nguồn: Hacker News" là link màu primary gạch chân; giữa các tin có khoảng cách rõ.
  - `/en/blog/ai-weekly-2026-w42` 375×812: h2 22px; scrollWidth 375 = innerWidth (không tràn ngang); heading/đoạn/link "Source: arXiv" tách bạch.
  - `/vi/blog/first-steps` 375px: 3 đoạn có khoảng cách; scrollWidth 375 = innerWidth; layout không vỡ.
- Redo reviewer do blocked môi trường → **không tăng attempt** (attempt = 0).

## Close-out (2026-10-14)
- Review round 2: **PASS** (NORMAL) — `.context/review-reports/bug-blog-article-typography-phase-1-task-01-round-2-review.md`
- Verify: typecheck PASS · lint PASS (0 error, 1 warning cũ `no-img-element`) · build PASS (phiên chính, `SWC_NATIVE_BINDING_CACHE` thay thế do DACL sandbox)
- Doc reconcile: `.context/design-spec.md` §Blog detail — ghi as-built typography thân bài qua `mdxComponents`. Intent docs không đổi; không đổi API/schema.
- Spec publish: `spec_version` 3.15.0 (không bump) · `spec/test-scope/current.json` scopeVersion 46 (trigger `bug-fix`) · `spec/CHANGELOG.md` 1 dòng reconcile.
- Residual risk / đề xuất CR riêng: **M1** contrast link `text-primary` (#009e87) trên nền trắng ~3.4:1 < WCAG AA 4.5:1 — pattern toàn site → CR riêng (đổi link trên nền sáng sang `primary-hover` ~5.1:1 hoặc token `primary-ink`). M2 inline code chưa wrap; M3 h4–h6/table chưa style (ngoài scope). Chưa đo 768px / `/en/blog/responsible-ai` (diff không có breakpoint).
