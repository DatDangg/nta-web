# Review — bug-blog-article-typography · phase-1-task-01 · round 1

Agent: reviewer

- Change: CR-023 (BUG UI) — `tasks/bug-blog-article-typography/phase-1-task-01.md`
- Diff: `git diff -- src/` → `src/components/mdx/index.tsx`, `src/app/[locale]/blog/[slug]/page.tsx` (2 file)
- Date: 2026-10-14

## Review level
**NORMAL**

## Reason
UI public (thân bài trang chi tiết Tin tức), không auth/API/schema/data/tenant. `mdxComponents` là module export dùng chung về hình thức nhưng chỉ có **1 consumer** (grep `mdxComponents|RenderMdx` trong `src/` → chỉ `src/app/[locale]/blog/[slug]/page.tsx:8,50`), nên không thuộc risk đỏ "shared component dùng nhiều màn". Root cause đã rõ, có evidence tĩnh (plugin vắng, preflight reset).

## Blast radius
- Thân bài MDX của `/[locale]/blog/[slug]` (vi + en): 5 bài × 2 locale hiện có + bài pipeline tương lai.
- Không đổi API, schema, route, metadata, `RenderMdx`, nội dung `.mdx`, `generate.py`.
- Không thêm dependency (`package.json`/lockfile không đổi — `git status` chỉ có 2 file src + file workflow).

## Verify commands + result
| Command | Result |
|---|---|
| `npm run typecheck` | PASS (`tsc --noEmit`, exit 0) |
| `npm run lint` | PASS — 0 error, 1 warning có sẵn `@next/next/no-img-element` tại `src/components/mdx/index.tsx:25` (`ArticleImage`, không đổi trong diff) |
| `npm run build` | **Blocked** (môi trường) — `Failed to load next.config.ts … [Error: Failed to load native binding]`. Lỗi native binding SWC/Windows, không liên quan diff. Chạy 1 lần, không retry. |

## Scope / surgical diff
- OK: chỉ 2 file đúng plan; không dependency mới; đúng phương án (b) user duyệt; h2 dùng `text-h3` đúng chốt; không đụng SPECIFICATIONS / spec_version.
- `page.tsx:49`: thay chuỗi `prose …` (no-op vì `tailwind.config.ts:91 plugins: []`) bằng `text-base text-text-primary` — đúng plan bước 2, không đổi cấu trúc.

## Kiểm class ↔ token (`tailwind.config.ts`, `src/app/globals.css`)
Tất cả class mới đều map được về token/utility có thật trong Tailwind 3.4:
`text-h3` (`--text-h3` clamp 1.375–1.5rem), `text-body-lg`, `text-base`, `text-sm`, `text-primary`/`hover:text-primary-hover`, `text-text-primary`, `text-text-secondary`, `marker:text-text-secondary`, `border-border`, `border-border-strong`, `bg-surface-sunken`, `outline-focus` (colors.focus), `font-mono` (`--font-mono`), `rounded-sm`/`rounded-md`, `scroll-mt-24`, `first:mt-0`, `space-y-2`, `list-disc`/`list-decimal`, arbitrary `[overflow-wrap:anywhere]`, `[&_code]:bg-transparent`, `[&_code]:p-0`. `content` glob `./src/**/*.{…tsx…}` quét được `src/components/mdx/index.tsx`.
Builder báo đã compile bằng Tailwind CLI → class sinh CSS; reviewer **không chạy lại được** (bash `npx tailwindcss` không nằm trong allow-list) → xác nhận bằng đối chiếu token tĩnh như trên.

## Acceptance (đối chiếu code)
| Mục | Kết quả |
|---|---|
| h2/h3 phân cấp | OK — h2 22–24px semibold `mt-12 mb-4` (h1 MDX map → h2, giữ hierarchy: h1 = title trong `ArticleHeader`); h3 `text-body-lg` 17–18px semibold `mt-8 mb-3` |
| p | OK — `my-5 leading-relaxed` |
| a | OK — `text-primary` underline offset 4, hover `primary-hover`, focus-visible outline `focus` (cùng pattern `CaseStudyLink.tsx:15`), `[overflow-wrap:anywhere]` |
| ul/ol/li | OK — preflight `list-style:none` được thay bằng `list-disc`/`list-decimal` + `pl-6`, marker màu secondary |
| blockquote | OK — `border-l-4 border-border-strong pl-4 italic text-text-secondary` |
| hr | OK — preflight đã đặt `border-top-width:1px; height:0`; `border-border` đặt màu, `my-10` khoảng cách |
| code / pre | OK — xem Specificity bên dưới |
| Bài cũ không vỡ | OK (tĩnh) — 4 bài cũ × 2 locale chỉ có đoạn văn (grep cú pháp markdown: chỉ 2 match/file = 2 dòng `---` frontmatter) → chỉ thêm `my-5` cho `p` |
| Bài pipeline tự nhận style | OK — style ở renderer `mdxComponents`, không phụ thuộc nội dung; `ai-weekly-2026-w42.mdx` chỉ dùng p/h2/a/hr/em |
| Link dài không tràn 375px | OK (tĩnh) — `overflow-wrap:anywhere` trên `a`; `pre` có `overflow-x-auto` |
| typecheck / lint / build PASS | typecheck PASS, lint PASS, **build Blocked** |

## Specificity `[&_code]` trong pre
`[&_code]:bg-transparent` sinh selector `.\[\&_code\]\:bg-transparent code` → specificity (0,1,1) > `.bg-surface-sunken` / `.px-1` / `.py-0.5` (0,1,0) trên `code` → code trong pre mất nền + padding inline đúng ý, không phụ thuộc thứ tự CSS. OK.

## className merge
`withClass(base, extra)` nối base + `props.className` (vd `language-*` từ code fence) thay vì ghi đè; `className` được destructure ra khỏi `props` nên không bị spread ghi đè ngược. Không dùng `tailwind-merge` → class trùng thuộc tính sẽ theo thứ tự CSS chứ không theo thứ tự chuỗi; hiện MDX chỉ truyền `language-*` nên không xung đột. OK.

## A11y
- Heading hierarchy: OK (h1 title → h2 → h3; h1 trong MDX hạ xuống h2).
- Focus-visible link: OK — utility `focus-visible:outline-focus` (0,2,0) thắng `*:focus-visible` (0,1,0) về màu outline; vẫn giữ `box-shadow` ring 4px từ globals → ring rõ, nhất quán các link khác trong repo.
- Contrast: `text-text-secondary` #6e6e73 trên trắng ≈ 5.0:1 (OK). `text-primary` #009e87 trên trắng ≈ **3.4:1** (< 4.5:1 AA cho chữ 16px) — xem Finding M1.

## Responsive Checklist Gate (diff đụng UI; không có browser được phép → CSS math)
| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Không horizontal scroll | OK (tĩnh) | wrapper `max-w-[720px] px-4` không đổi; link `overflow-wrap:anywhere`; `pre` `overflow-x-auto`; không width cố định mới |
| Mobile-first / container không fixed px | OK / N/A | diff không thêm media query/width cố định |
| Font-size rem / heading fluid | OK | `--text-h3`, `--text-body-lg` dùng `clamp()` rem; `--text-base`/`--text-sm` rem |
| Spacing theo scale | OK | spacing Tailwind (rem) |
| Media | N/A | `ArticleImage` không đổi |
| Touch target ≥44px | N/A | link inline trong đoạn văn (ngoại lệ WCAG 2.5.8 inline) |
| 100vh / reduced-motion / overflow:hidden | N/A | diff không dùng |
Residual: chưa đo thực tế ở 375/768/1280 (xem B1).

## Skill gates
- aislop: skip — không chạy trong round này (diff 2 file, ~40 dòng, đã soi tay: không narrative comment thừa, không dead code, không `as any`, không fallback ẩn).
- oxlint (anti-slop): skip, oxlint not configured (không có `.oxlintrc*`).
- ocr (open-code-review): skip, ocr not installed/không chạy.
- AI-readable: OK — 0 indicator (tên `articleHeadingClass`, `withClass` rõ nghĩa; 2 comment nêu WHY; file < 100 dòng).
- ai-friendly-web: OK — `public/llms.txt`, `src/app/robots.ts`, `src/app/sitemap.ts` tồn tại; diff không đổi.
- blitzstrike: N/A (không STRICT, không input/auth).

## Findings
### [CRITICAL]
- Không có.

### [MAJOR]
- Không có defect code.

### [MINOR]
- **M1** `src/components/mdx/index.tsx:47` — link `text-primary` (#009e87) trên nền trắng ≈ 3.4:1, dưới AA 4.5:1 cho chữ thường 16px. Đây là pattern sẵn có toàn repo (`blog/page.tsx:47`, `CaseStudyLink.tsx:15`, `RelatedSolutions.tsx:13`…) và đúng plan user duyệt ("link màu primary"), nên không chặn task này. Đề xuất task riêng: đổi màu chữ link trên nền sáng sang `primary-hover` (#007c6b ≈ 5.1:1) hoặc thêm token `primary-ink`. Ngoài scope CR-023.
- **M2** `src/components/mdx/index.tsx:61` — `code` inline không có rule ngắt dòng; token rất dài (không phải link) có thể tràn ngang ở 375px. Pipeline hiện không sinh inline code → rủi ro thấp; có thể thêm `[overflow-wrap:anywhere]` sau.
- **M3** `h4–h6`, `table` không có style (preflight trần). Đã ghi nhận trong plan (thẻ hiếm, ngoài scope).

### Blocking (không phải defect diff — điều kiện đóng bug)
- **B1 Repro Verification chưa có evidence.** Task file mục "Builder notes": "Repro visual (375/768/1280) chưa chạy"; journal `.context/runs/bug-blog-article-typography-phase-1-task-01.md:14` `evidence:` rỗng. Theo luật reviewer (bug repro closure): repro không có evidence kiểm chứng được → verdict bắt buộc FAIL (unverifiable). Reviewer không được tự chạy app.
  Cách đóng: primary/builder chạy dev server, mở `/vi/blog/ai-weekly-2026-w42`, `/en/blog/ai-weekly-2026-w42`, `/vi/blog/first-steps`, `/en/blog/responsible-ai` ở 375/768/1280; ghi vào mục `Repro Verification` của task: computed `h2` font-size (≈22–24px, weight 600), `p` margin ≠ 0, màu link = primary, `document.documentElement.scrollWidth <= clientWidth` → status PASS. Không cần sửa code.
- **B2 Build Blocked** (native binding). Acceptance yêu cầu build PASS → chạy `bash tools/linux-build.sh verify` (Cowork/VM) hoặc môi trường có SWC binding, ghi kết quả.

## Verdict
❌ **FAIL** (unverifiable) — code diff không có CRITICAL/MAJOR và đạt plan/acceptance ở mức tĩnh, nhưng bug task chưa có Repro Verification PASS có evidence (B1) và build còn Blocked (B2). Bổ sung evidence B1 (+ build nếu có môi trường) rồi chạy reviewer round 2; **không cần đổi code**.
