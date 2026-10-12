# Review — change/home-hero-banner-restyle — Phase 1 / Task 01 — Round 3 (fix verification)

Agent: reviewer

- **Review level:** NORMAL
- **Reason:** Round 3 chỉ verify 8 fix của round-2 (2 MAJOR CSS class âm thầm + 1 MAJOR commit-hygiene + 5 MINOR) trên scope MODIFY visual (1 khối Hero ở `/` + `/en`). Không đụng shared service/API/auth/tenant/schema/DB. Không thuộc danh sách risk-đỏ bắt buộc STRICT. Fix #1/#2 dễ fail âm thầm (Tailwind không sinh CSS) nên phải soi **build artifact thật** — đã làm.
- **Task:** `tasks/change-home-hero-banner/phase-1-task-01.md` · **Change:** `spec/changes/2026-10-12-home-hero-banner-restyle.md`
- **Round trước:** round 2 = ❌ FAIL (3 MAJOR + 5 MINOR) → `.context/review-reports/change-home-hero-banner-restyle-phase-1-task-01-round-2-review.md`. Round 1 = PASS (không re-review).

## Blast radius

- `/` + `/en` (chỉ khối Hero) — `Hero` chỉ dùng ở `src/app/[locale]/page.tsx`; `HeroVisual` chỉ dùng ở `src/components/home/Hero.tsx:45`.
- File round-3 bị đụng bởi fix: `src/components/home/HeroVisual.tsx`, `spec/changes/2026-10-12-home-hero-banner-restyle.md`, `.context/design-spec.md`.
- Working tree dirty ngoài scope (session khác — **không** thuộc commit này): `next.config.ts` (`distDir: '.next-build'`), `tsconfig.json`, `next-env.d.ts`, `.next-build/` (untracked, **không** gitignored), `.context/runs/change-hairstyle-ai-gallery-screenshots.md`, `D public/images/illustrations/home-{ai,apps,enterprise}.jpg`, `?? public/images/illustrations/home-{ai,apps,enterprise}.png`, `?? kill-local.ps1`.

## Verify commands + result

| Command (từ `.context/project-config.md`) | Result |
|---|---|
| `npm.cmd run typecheck` / `npm.cmd run lint` / `npm.cmd run build` | **Blocked** — `Permission denied: shell` khi chạy verify (không retry, không đổi biến thể theo Tool Loop Guard). Builder báo PASS: typecheck + lint (0 error, 1 warning pre-existing mdx) + build 53/53. |
| `git status --short` | **PASS** (chạy được ở round này) — xác nhận danh sách file dirty/untracked ở Blast radius. |
| Static verify bằng **production build artifact thật** | **PASS** — `.next-build/static/css/8fc0eaa9a0fc8bfc.css` (hashed, chỉ có 1 file CSS → chứng tỏ `next build` đã chạy **sau** fix; artifact round 2 là `app/layout.css` dev-mode, đã khác): có `object-position:70% 50%`; có `.opacity-40{opacity:.4}`; **không** có selector escaped `bg-primary\/40`; vẫn có `aspect-ratio:6/5`. |

## Verify từng fix

| # | Fix | Kết quả | Bằng chứng |
|---|---|---|---|
| 1 | MAJOR#1 `object-position-[70%_50%]` → `object-[70%_50%]` | **FIXED** | `HeroVisual.tsx:143` = `className="object-cover object-[70%_50%]"`; CSS build có `object-position:70% 50%` (đúng prefix `object-` của v3). Comment L139 + `design-spec.md:118` ("object-position 70%") nay khớp runtime. |
| 2 | MAJOR#2 `bg-primary/40` → `bg-primary opacity-40` | **FIXED** | `HeroVisual.tsx:61` = `bg-primary ${i === 4 ? '' : 'opacity-40'}` (chỉ cột index ≠ 4 nhạt). CSS build có `.opacity-40{opacity:.4}`. `bg-primary/40` **gone** khỏi `src/` (chỉ còn trong comment L50 giải thích) và không có selector escaped trong CSS. Cả `bg-primary` + `opacity-40` là literal trong source → JIT sinh được. |
| 3 | MAJOR#3 commit hygiene | **ACCEPTED (đúng cách xử lý)** | Commit theo **danh sách tường minh từng file**, KHÔNG `git add -A` → loại tuyệt đối `next.config.ts`/`tsconfig.json`/`next-env.d.ts`/`.next-build/` + mọi file session khác. Xem MINOR-M1 bên dưới (nhắc danh sách exclusion còn thiếu tên). |
| 4 | MINOR#4 acceptance drift | **FIXED** | `spec/changes/2026-10-12-home-hero-banner-restyle.md:23-24`: "ảnh crop 2:1→6/5 (`aspect-[6/5]` + `object-cover object-[70%_50%]` — tập trung robot, bỏ city)". Khớp code + design-spec. |
| 5 | MINOR#5 design-spec responsive | **FIXED** | `.context/design-spec.md:137`: "md ≥768 | hero 2 cột (**text 42.5% / ảnh 57.5%**)" — đúng `md:grid-cols-[0.85fr_1.15fr]` (0.85/2 = 42.5%). |
| 6 | MINOR#6 dead `HERO_IMAGE.width/height` | **FIXED** | `HeroVisual.tsx:7` chỉ còn `const HERO_SRC = '/images/home/hero-banner.jpg';` — không còn object width/height, không còn comment sai về srcset/sizes. |
| 7 | MINOR#7 `sizes` | **FIXED** | `HeroVisual.tsx:147` = `sizes="(min-width: 768px) 60vw, 100vw"` — khớp tỉ lệ cột thật (~57.5% ở md, ảnh lớn hơn ở xl). |
| 8 | MINOR#8 tách panel | **RESOLVED (borderline)** | `ListPanel` (L24-47), `ChartPanel` (L51-67), `StatPanel` (L70-87) đều < 50 dòng. `HeroVisual` chính (L128-189): 62 dòng **raw** (kể cả blank + comment), nhưng ~47 dòng non-blank/non-comment < `max_function_lines: 50`. Đã giảm mạnh từ ~130 dòng ở round 2; không còn là blocker. |

## Responsive Checklist Gate

Project có UI + phase đụng UI → **áp dụng**. Breakpoints profile `640/768/1024/1280/1536` (đáy test 375/768/1280). Round-3 chỉ đổi **paint-only** (`object-position`, `opacity`) — **không** đổi box model/grid/font/scroll → kết luận gate round 2 giữ nguyên; không có mục nào bị fix round 3 tác động.

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Không horizontal scroll | **OK** | `.hero-bleed-right` (globals.css) không đổi ở round 3; `section overflow-hidden`; DOM-eval round 2 `scrollWidth == clientWidth`. |
| Full-bleed mép phải | **OK** | margin công thức độc lập grid; không đổi round 3. |
| Mobile-first `min-width` | **OK** | media query dùng `min-width`; không đổi round 3. |
| Grid không cột cố định px | **OK** | split chủ ý `md:grid-cols-[0.85fr_1.15fr]`, không phải card grid. |
| Typography `rem`/`clamp` | **OK** | `text-[clamp(2.5rem,2rem+2.5vw,4.25rem)]` → CSS build `font-size: clamp(2.5rem, 2rem + 2.5vw, 4.25rem)`. |
| Media: aspect-ratio + srcset | **OK** | `aspect-ratio:6/5` trong CSS build; `<Image fill>` + `sizes` + `priority`; `object-position` nay sinh CSS đúng (fix #1). |
| Touch target ≥44px | **OK** | CTA `min-h-12` (48px); panel không tương tác. |
| Không dùng `100vh` | **OK** | chỉ `100vw` trong calc, đã clip. |
| `prefers-reduced-motion` | **OK** | `Reveal` + globals.css xử lý. |
| Không che lỗi bằng `overflow:hidden` | **OK** | dùng đúng mục đích clip bleed. |
| Panels không tràn khung ở `lg` | **OK (CSS math, chưa mắt thật)** | khung ảnh `lg` ≈552×460px; mép phải panel tối đa 98% → ~11px dư; đáy ~≤430px < 460px. **Residual risk.** |

**Kết luận gate:** không có mục nào FAIL. Round-3 không tạo regression responsive (chỉ `object-position`/`opacity`).

## Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| `aislop scan --changes` | **skip, not run** | Không chạy trong round này; không thay bằng heuristic. |
| `oxlint` (anti-slop) | **skip, oxlint not configured** | Round-1 glob `.oxlintrc*` = 0 file. |
| `ocr` (open-code-review) | **skip, not run** | Chưa cài/chưa chạy → không chặn PASS. |
| AI-readable (`skills/ai-readable-codebase` §6) | **OK (1 indicator)** | Round 2 có 2 indicator (function >50 dòng + magic numbers); fix #8 gỡ indicator function-length → còn 1 (magic numbers `left-[6%]`…, `[38,62,48,78,92,70]`). 1 < 3 → OK. |
| AI-friendly web | **N/A** | restyle nội bộ, không đụng `llms.txt/robots.txt/sitemap`. |
| blitzstrike | **N/A** | không phải STRICT, không attack surface. |
| frontend-checklist / impeccable | **OK** | semantics giữ; alt đúng; CTA có mũi tên; bỏ khung bo góc/nền xám; panels `aria-hidden`. |

## Findings

Không còn **CRITICAL/MAJOR**. Còn lại toàn bộ là MINOR / residual:

1. **[MINOR]** (từ MAJOR#3, chưa đóng tuyệt đối) — Danh sách exclusion của commit cần ghi rõ **tên từng file** ngoài scope đang dirty, không chỉ nhóm "session khác": `next.config.ts`, `tsconfig.json`, `next-env.d.ts`, `.next-build/`, `.context/runs/change-hairstyle-ai-gallery-screenshots.md`, `D public/images/illustrations/home-ai.jpg|home-apps.jpg|home-enterprise.jpg`, `?? public/images/illustrations/home-ai.png|home-apps.png|home-enterprise.png`, `?? kill-local.ps1`. Builder đã chọn explicit-path (không `git add -A`) → an toàn; chỉ cần liệt kê tường minh khi commit.
   *Đề xuất (task hygiene riêng, không thuộc scope này):* thêm `.next-build/` vào `.gitignore` để phòng `add` rộng về sau.
2. **[MINOR]** `HeroVisual.tsx:128-189` — thân hàm `HeroVisual` = 62 dòng raw (kể cả blank/comment), nếu chấm theo tổng dòng vẫn nhỉnh `max_function_lines: 50`. Theo cách đếm non-blank/non-comment (~47) thì đạt. Không blocker; có thể rút gọn thêm khối panel nếu muốn chắc.
3. **[MINOR]** `HeroVisual.tsx:59` — `key={i}` (index làm key) trong `ChartPanel`. Với mảng tĩnh, không reorder → chấp nhận được; chỉ là note.
4. **[MINOR]** `HeroVisual.tsx:56` — chiều cao cột `style={{ height: `${h}%` }}` + `[38,62,48,78,92,70]`: magic numbers còn lại (đã nằm trong AI-readable indicator #1). Không blocker.

### Điểm đã kiểm & đạt (không re-review round 1)

- Fix #1 và #2 xác nhận **sinh CSS thật** trong production artifact — đây là bằng chứng quyết định round 2 thiếu.
- `design-spec.md:118` (crop 6/5 + object-position 70%) nay **khớp** code + `spec/changes` → hết drift giữa 3 nguồn.
- Không phát hiện defect mới do fix gây ra (không có class Tailwind mới không hợp lệ; không đổi layout/scroll).

## Residual risk

- Không chạy lại được `typecheck/lint/build` trong round này (`Permission denied: shell`) → dựa vào builder + artifact `.next-build/static/css/8fc0eaa9a0fc8bfc.css`. Artifact hashed mới là bằng chứng build đã chạy sau fix.
- Chưa render desktop thật bằng browser → vị trí/mật độ panel + wordmark chỉ verify bằng CSS math (kế thừa round 2), **chưa xác nhận khớp ảnh mẫu bằng mắt**.
- Ownership của `next.config.ts`/`tsconfig.json`/`next-env.d.ts` chỉ là **giả định** theo task note (session khác). Nếu thực ra thuộc task này → dòng `distDir: '.next-build'` không trace về task và phải revert.
- `.next-build/` untracked, **chưa** gitignored → rủi ro nếu về sau ai dùng `git add -A`.
- Tại `md` (768–1023) cột text ≈289px nhưng h1 ≈51px → tiêu đề có thể wrap 4–6 dòng; không vỡ layout, cần soi mắt ở 768.

## Verdict

✅ **PASS**

- MAJOR#1 (`object-[70%_50%]`) và MAJOR#2 (`bg-primary opacity-40`) **đã fix và được chứng minh bằng CSS production artifact** (`.next-build/static/css/8fc0eaa9a0fc8bfc.css` có `object-position:70% 50%` + `.opacity-40{opacity:.4}`; `bg-primary/40` gone).
- MAJOR#3 xử lý đúng: commit bằng explicit file list, loại tuyệt đối file ngoài scope → chấp nhận (kèm MINOR nhắc liệt kê tường minh + đề xuất gitignore `.next-build/` ở task riêng).
- 5 MINOR round 2 đều **FIXED**; MINOR#8 resolved (borderline, không blocker).
- Không còn CRITICAL/MAJOR; responsive gate không có mục FAIL.
