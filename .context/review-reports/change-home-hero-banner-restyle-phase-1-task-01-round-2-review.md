# Review — change/home-hero-banner-restyle — Phase 1 / Task 01 — Round 2

Agent: reviewer

- **Review level:** NORMAL
- **Reason:** MODIFY visual scope (1 section `/` + `/en`), không đụng shared service/API/auth/schema/tenant/DB. Có thêm rủi ro "shared component mới" (`HeroVisual`) + silent CSS-class failures nhưng không thuộc danh sách risk-đỏ bắt buộc STRICT; builder đã báo verify PASS nên không cần FAST tối giản. Round 2 có nhiều arbitrary Tailwind class → cần soi build output thật (đã làm).
- **Task:** `tasks/change-home-hero-banner/phase-1-task-01.md` · **Change:** `spec/changes/2026-10-12-home-hero-banner-restyle.md` (round-2 acceptance append)

## Blast radius

- `/` + `/en` (chỉ khối Hero) — `Hero` chỉ dùng ở `src/app/[locale]/page.tsx:48`; `HeroVisual` chỉ dùng ở `Hero.tsx:45`.
- File round-2: `src/components/home/HeroVisual.tsx` (mới), `src/components/home/Hero.tsx` (rewrite), `src/content/home.ts` (`heroPanels`), `src/app/[locale]/page.tsx` (prop `panels`), `src/i18n/messages/{vi,en}.json` (`heroTitleLead/Accent`), `.context/design-spec.md`.
- Working tree còn dirty `next.config.ts` (`distDir: '.next-build'`), `tsconfig.json`, `next-env.d.ts`, `.next-build/` (untracked, **không** gitignored) + các change của session khác → rủi ro commit nhiễm chéo.

## Verify commands + result

| Command (từ `.context/project-config.md`) | Result |
|---|---|
| `npm run lint` / `npm run typecheck` / `npm run build` | **Không chạy lại** — theo chỉ đạo task; builder báo PASS (lint 1 warning pre-existing mdx, build 53/53) |
| `git status --short` | **PASS** (shell session này cho phép) — xác nhận danh sách file dirty/untracked ở trên |
| `git diff …` | **Blocked** — `Permission denied: shell` → không retry (Tool Loop Guard) |
| Static verify bằng build artifact thật | **PASS** — đọc `.next-build/static/css/app/layout.css` + `.next-build/server/app/[locale]/page.js` (đúng artifact của round 2: có `aspect-ratio: 6/5`, `text-[13px]/[11px]/[10px]`, `drop-shadow-[0_2px_6px_rgb(0_0_0/0.45)]`, `Hero({panels})`) |

## Responsive Checklist Gate

Project có UI + diff đụng UI → **áp dụng**. Breakpoints profile: `640/768/1024/1280/1536` (đáy test 375/768/1280). Verify bằng CSS math + CSS build output (không có browser — theo báo cáo builder screenshot bị block).

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Không horizontal scroll | **OK** | `.hero-bleed-right` (globals.css L123-133) không đổi; `section` có `overflow-hidden`; builder DOM-eval 414: `scrollWidth == clientWidth` |
| Full-bleed mép phải | **OK** | margin = −[(min(100vw,1280)−100vw)/2 + padding] độc lập với grid (`0.85fr_1.15fr` không tham gia công thức) |
| Mobile-first `min-width` | **OK** | cả 2 media query dùng `min-width` |
| Grid không cột cố định px | **OK (N/A auto-fit)** | split cột chủ ý `md:grid-cols-[0.85fr_1.15fr]`, không phải card grid |
| Typography `rem`/`clamp` | **OK** | h1 `text-[clamp(2.5rem,2rem+2.5vw,4.25rem)]` → CSS build L1497 `font-size: clamp(2.5rem, 2rem + 2.5vw, 4.25rem)` (Tailwind `addWhitespaceAroundMathOperators`, `lib/util/dataTypes.js:122`). **Nghi vấn ban đầu của tôi (thiếu whitespace quanh `+`) đã bị bác bỏ bằng artifact thật.** |
| Media: aspect-ratio + srcset | **OK** (xem Findings #1 về object-position) | `aspect-[6/5]` → `aspect-ratio: 6/5` (CSS L785), `<Image fill>` + `sizes` + `priority` |
| Touch target ≥44px | **OK** | CTA `min-h-12` (48px, Button.tsx L26); panel không tương tác |
| Không dùng `100vh` | **OK** | chỉ `100vw` trong calc, đã clip |
| `prefers-reduced-motion` | **OK** | `Reveal` + globals.css L140/L147 |
| Không che lỗi bằng `overflow:hidden` | **OK** | dùng đúng mục đích clip bleed |
| Panels không tràn khung ở `lg` (1024) | **OK (CSS math)** | khung ảnh `lg` ≈ 552×460px; mép phải panel tối đa 98% → ~11px dư; đáy panel ~≤430px < 460px → không tràn. **Chưa verify bằng mắt desktop thật → Residual risk.** |

**Kết luận gate:** không có mục nào FAIL.

## Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| `aislop scan --changes` | **skip, not run** | Không chạy trong round này (max steps); không thay bằng heuristic |
| `oxlint` (anti-slop) | **skip, oxlint not configured** | Round-1 glob `.oxlintrc*` = 0 file (không re-check round này) |
| `ocr` (open-code-review) | **skip, not run** | Không chạy → không chặn PASS |
| AI-readable (`skills/ai-readable-codebase` §6) | **WARN (2 indicators)** | (1) `HeroVisual` ~130 dòng > `max_function_lines: 50` (project-config); (2) magic numbers dày (`left-[6%]/top-[10%]/w-[27%]`, `text-[13px]/[11px]/[10px]`, `[38,62,48,78,92,70]`). 2 < 3 → không FAIL |
| AI-friendly web | **N/A** | restyle nội bộ, không đụng `llms.txt/robots.txt/sitemap` |
| blitzstrike | **N/A** | không phải STRICT, không attack surface |
| frontend-checklist / impeccable | **OK (có lỗi CSS nêu ở Findings)** | semantics giữ; alt đúng; `priority` cho LCP; bỏ khung bo góc/nền xám đúng ảnh mẫu |

## Findings

1. **[MAJOR]** `src/components/home/HeroVisual.tsx:34` — `object-position-[70%_50%]` **không phải class hợp lệ của Tailwind v3**: core plugin đăng ký object-position dưới **prefix `object-`** (`node_modules/tailwindcss/lib/corePlugins.js:3082` → `[["object", ["object-position"]]]`), nên có **không** CSS nào được sinh. Bằng chứng: `.next-build/static/css/app/layout.css` có `.object-cover { object-fit: cover }` (L1310) nhưng **không có rule `object-position`** nào. Hệ quả: ảnh dùng mặc định `object-position: 50% 50%` → crop **căn giữa**, không tập trung robot ở 70% như acceptance ("bỏ phần city bên trái"), comment L28-30, và `.context/design-spec.md:118` khẳng định ⇒ yêu cầu + doc đều sai so với runtime.
   *Fix:* `object-[70%_50%]` (đúng prefix), hoặc thêm utility/`style={{ objectPosition: '70% 50%' }}`; sau đó reconcile lại design-spec/comment.

2. **[MAJOR]** `src/components/home/HeroVisual.tsx:76` — `bg-primary/40` **không sinh CSS**: `primary = 'var(--color-primary)'` (tailwind.config.ts L15) không có `<alpha-value>`, Tailwind v3 không áp được opacity modifier lên `var(...)` → class bị bỏ. Bằng chứng: CSS build có `.bg-primary` (L1237) nhưng **không có `.bg-primary\/40`**; grep toàn `src/` chỉ có duy nhất usage này. Hệ quả: 5/6 cột trong chart Panel 2 **trong suốt/vô hình**, chỉ còn 1 cột highlight → panel trông lỗi so với ảnh mẫu.
   *Fix:* dùng `bg-primary opacity-40` (opacity utility hoạt động), hoặc thêm token `primary-soft` = `rgb(var(--color-primary) / 0.4)` và dùng `bg-primary-soft`.

3. **[MAJOR] (spec/acceptance drift + commit hygiene)** — `next.config.ts:6` `distDir: '.next-build'` cùng `tsconfig.json`, `next-env.d.ts` đang bị sửa, và `.next-build/` **untracked nhưng không gitignored**. Không nằm trong `filesTouched` của journal cũng không nằm trong "Files to Modify" của task ⇒ dòng này **không trace về task** (kỹ thuật tạm để build cạnh dev server). Nếu bị `git add -A`/commit: production build đổi output dir khỏi `.next` (Docker/CI/deploy đang chờ `.next` + `output: 'standalone'` sẽ vỡ) và rác `.next-build/` lọt vào commit.
   *Fix:* xác nhận chủ sở hữu; revert `distDir` (và `tsconfig/next-env`) trước commit hoặc đảm bảo loại trừ tuyệt đối khỏi commit; thêm `.next-build/` vào `.gitignore` nếu vẫn dùng để build tạm.

4. **[MINOR]** `spec/changes/2026-10-12-home-hero-banner-restyle.md:23` — acceptance round-2 ghi "(cùng tỉ lệ 2:1, **không crop 2:1→6/5**)" nhưng code (`HeroVisual.tsx:31` `aspect-[6/5]`, `object-cover`) và `design-spec.md:118` lại **crop 6/5**. Mâu thuẫn acceptance vs implementation cần chốt: nhiều khả năng change file cũ, phải cập nhật lại (theo hướng crop — đúng với mục tiêu "giống ảnh 2" mà primary mô tả), không để tồn tại 2 nguồn sự thật.

5. **[MINOR]** `.context/design-spec.md:137` — bảng responsive vẫn ghi "md ≥768 | hero 2 cột (text **55% / ảnh 45%**)" trong khi code round 2 là `0.85fr_1.15fr` = **42.5% / 57.5%**. Doc as-built chưa reconcile hết mục Screen 1 Hero (task yêu cầu reconcile). Sửa lại tỉ lệ + ghi rõ h1 dùng clamp riêng (không `--text-hero`).

6. **[MINOR]** `src/components/home/HeroVisual.tsx:7-8,39` — `HERO_IMAGE.width/height` (1787×880) là **dead data**: chỉ `HERO_IMAGE.src` được truyền cho `<Image fill>`; comment "để truyền đúng tỉ lệ lấy srcset/sizes" không đúng (không truyền size nào). Gỡ `width/height` khỏi object hoặc truyền vào `<Image>` nếu muốn giữ.

7. **[MINOR]** `src/components/home/HeroVisual.tsx:38` — `sizes="(min-width: 1024px) 55vw, 100vw"` khai quá lớn cho 768–1023 (thực ≈ 0.575 × container ≈ 57vw nhưng đã dùng 100vw) và cho ≥1280 (thực ≈ 46vw khi container cap 1280) → tải source lớn hơn cần một chút. Không phải bug; cân nhắc `(min-width:1024px) 52vw, (min-width:768px) 58vw, 100vw`.

8. **[MINOR]** `src/components/home/HeroVisual.tsx:19-148` — hàm `HeroVisual` ~130 dòng, vượt `ui.max_function_lines: 50` (project-config). Đề xuất tách 5 panel thành subcomponent nhỏ (`AiPanel/ChartPanel/…`) → vừa đúng rule, vừa bớt lặp `GLASS` + markup list.

### Điểm đã kiểm & đạt

- **`text-[clamp(2.5rem,2rem+2.5vw,4.25rem)]` HỢP LỆ** — Tailwind normalize có bước `addWhitespaceAroundMathOperators` (`node_modules/tailwindcss/lib/util/dataTypes.js:122`) → CSS thật `.next-build/static/css/app/layout.css:1497` = `font-size: clamp(2.5rem, 2rem + 2.5vw, 4.25rem)`. Không phải lỗi.
- **Các arbitrary class còn lại đều tồn tại trong CSS build**: `aspect-ratio: 6/5` (L785), `bg-gradient-to-r/b` (L1264/1267), `from-white/55` (L1275), `via-white/20` (L1289), `to-white/5` (L1300), `to-[#e8f0f3]` (L1303), `bg-white/85` (L1258), `border-white/70` (L1205), `backdrop-blur-sm` (L1653), `shadow-lg` (L1604), `text-4xl/2xl` (L1483/1443), `font-black` (L1508), `rounded-xl` (L1143), `max-w-[60ch]` (L949), `leading-[1.08]` (L1529), `tracking-[-0.02em]` (L1532), `md:grid-cols-[0.85fr_1.15fr]` (L2209), `xl:gap-12` (L2455), `left-[…%]` (L638).
- **h1 split**: 1 `h1` duy nhất, 2 `<span className="block">`, text đầy đủ cho SR/SEO; EN "Digital solutions for / Vietnamese businesses" hợp lý.
- **Key i18n cũ**: grep `"heroTitle"` = **0 match**; chỉ còn `heroTitleLead/heroTitleAccent` (vi L66-67, en L66-67), không trùng key.
- **HeroVisual client**: `'use client'` cần thiết (`useState` + `onError`); props (`panels`, `imageAlt`) serializable server→client; `import type` (erased) nên không kéo server module vào client bundle.
- **Fallback lỗi ảnh**: giữ được tỉ lệ (`aspect-[6/5] w-full` + `role="img" aria-label`) — tốt hơn `HomeImage` (round-1 MINOR #3).
- **a11y**: image có `alt`; overlay gradient + container panels + wordmark đều `aria-hidden` → không đọc trùng nội dung trang trí.
- **Panel position/size ở `lg` (1024)**: khung ≈552×460; panel 4 → mép phải 96%, panel 5 → 98% (~11px dư); đáy panel ≤ ~430px → **không tràn** (CSS math).
- **Design-spec mục layout Hero (L115-120)** khớp code (full-bleed, bỏ khung, crop 6/5, panels `lg+ aria-hidden`, gradient) — chỉ còn bảng responsive L137 lệch (Finding #5).

## Residual risk

- Chưa render desktop thật (browser screenshot blocked phía builder) → vị trí/mật độ panel + wordmark trên ảnh chỉ verify bằng CSS math; **chưa xác nhận khớp ảnh mẫu bằng mắt**.
- Không chạy lại được `lint/typecheck/build` trong round này (`git diff` bị permission-gate); dựa vào builder + artifact `.next-build`.
- Tại `md` (768–1023) cột text chỉ ≈289px (768) nhưng font h1 ≈51px → tiêu đề có thể wrap 4–6 dòng (nhiều hơn ý đồ "4 dòng" của builder). Không vỡ layout nhưng cần soi mắt ở 768.
- `aislop` / `ocr` chưa chạy round này.

## Verdict

❌ **FAIL**

- **2 MAJOR** lỗi class Tailwind âm thầm không sinh CSS: `object-position-[70%_50%]` (HeroVisual.tsx:34) → mất crop 70%; `bg-primary/40` (HeroVisual.tsx:76) → 5/6 cột chart vô hình. Cả hai làm sai lệch mục tiêu round 2 so với ảnh mẫu và làm comment/design-spec mô tả sai runtime.
- **1 MAJOR** commit-hygiene/scope: `next.config.ts:6` `distDir: '.next-build'` (+ `tsconfig.json`, `next-env.d.ts`, `.next-build/` untracked không gitignore) không trace về task — phải xử lý trước commit.
- 5 MINOR (acceptance drift `spec/changes/…:23`, design-spec L137, dead `HERO_IMAGE.width/height`, `sizes` quá lớn, hàm >50 dòng).
