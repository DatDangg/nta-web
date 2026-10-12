# Review — change-home-hero-banner-restyle — Phase 1 / Task 01 — Round 1

Agent: reviewer

- **Review level:** NORMAL
- **Reason:** MODIFY visual scope hẹp, 1 component (Hero) trên `/` + `/en`, không đụng shared service/API/auth/schema/tenant/data.
  Không có risk đỏ của STRICT; builder đã báo verify PASS nên không cần FAST tối giản. Mọi file trong scope là UI + i18n 2 key + doc.
- **Task:** `tasks/change-home-hero-banner/phase-1-task-01.md` · **Change:** `spec/changes/2026-10-12-home-hero-banner-restyle.md`

## Blast radius

- Ảnh hưởng: `/` và `/en` (chỉ khối Hero) — `Hero` được dùng duy nhất ở `src/app/[locale]/page.tsx`.
- File trong scope: `src/components/home/Hero.tsx`, `src/app/globals.css` (utility `.hero-bleed-right`),
  `src/i18n/messages/{vi,en}.json` (`home.heroImageAlt`), `.context/design-spec.md` (§Screen 1 Hero),
  asset `public/images/home/hero-banner.jpg`.
- `enterprise-hero.png`: grep `src/` = 0 reference còn lại → ảnh cũ đã gỡ sạch khỏi Hero, không còn ai reference.
- `hero-bleed-right`: chỉ định nghĩa ở `globals.css` L124/L130 và dùng ở `Hero.tsx` L32 → không rò rỉ sang component khác.
- Không đụng file dirty của session khác (theo diff manifest primary/task).

## Verify commands + result

> Shell bị permission-gate theo lệnh; `npm` cũng bị PowerShell execution policy chặn (`npm.ps1 cannot be loaded`).
> Đã thử tối đa theo Tool Loop Guard, không retry thêm.

| Command (từ `.context/project-config.md`) | Result |
|---|---|
| `npm run lint` (web_lint) | **Blocked** — PowerShell chặn `npm.ps1` (Execution Policy); `npm.cmd …` bị `Permission denied: shell` |
| `npm run typecheck` (web_typecheck) | **Blocked** — cùng nguyên nhân môi trường |
| `npm run build` | **Not run** — cùng rào cản; builder báo PASS (distDir tạm), không xác minh độc lập được |
| `git status/diff` | **Blocked** — `Permission denied: shell` |
| Static verify (Read/Grep/Glob) | **PASS** — đã chạy thay thế (xem Findings / Responsive Gate) |

→ Không xác minh độc lập được lint/typecheck/build; ghi **Residual risk** (không phải lỗi code, không phải lý do FAIL theo workflow khi command bị môi trường chặn).

## Responsive Checklist Gate

Project có UI (`ui:` trong project-config) và diff đụng UI → **áp dụng**. Breakpoints: `640/768/1024/1280/1536` (đáy test mặc định 375/768/1280).
Verify bằng **CSS math** (không có browser/không chạy được app).

Cấu trúc xác định: `section.overflow-hidden` → `Container` (`mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8`, `max-w-container`=1280px border-box) → grid `md:grid-cols-[1.1fr_0.9fr]`; cột phải = `Reveal.hero-bleed-right`.
`margin-right` cần để chạm mép phải viewport = −[(100vw − min(100vw,1280px))/2 + padding phải].

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Không horizontal scroll (`scrollWidth ≤ clientWidth`) | **OK** | `.hero-bleed-right` L124–133: `margin-right: calc((min(100vw,1280px) - 100vw)/2 - 1.5rem/2rem)`. `section` có `overflow-hidden` (Hero.tsx L20) cắt phần tràn. Over-bleed tối đa ≈ scrollbar/2 (~7.5px) khi viewport ≥1280 (do `100vw` gồm scrollbar) → **được clip, không tạo scroll ngang**. Mobile/tablet <768 không áp bleed → không tràn. |
| Full-bleed chạm mép phải ở desktop | **OK** | Công thức khớp: tại ≥1280, margin = −[(100vw−1280)/2]−padding; mép phải ảnh = contentRight + |margin| = viewport right (chênh ≤ scrollbar/2, clip bởi overflow-hidden) → chạm mép. |
| Padding 1.5rem vs 2rem đúng theo breakpoint | **OK** | `md`(≥768) dùng `1.5rem` = `sm:px-6`; `lg`(≥1024) dùng `2rem` = `lg:px-8`. Không lệch (Tailwind `sm`=640 nên 768–1023 là 1.5rem, ≥1024 là 2rem — CSS khớp). |
| Không vỡ <768 và 768–1024 | **OK** | <768: không media query bleed → ảnh 1 cột trong padding, không tràn. 768/900/1024: `min(100vw,1280)=100vw` ⇒ margin = −padding ⇒ mép ảnh = mép container = mép body (flush), không amp. |
| Mobile-first (`min-width`) | **OK** | Cả 2 media query dùng `min-width`. |
| Grid không cột cố định px / container không fixed px | **OK (N/A auto-fit)** | Hero là split 2 cột cố ý `1.1fr/0.9fr` (không phải card grid) → `minmax/auto-fit` không áp dụng; Container dùng `max-w-container` + `w-full`. |
| Typography `rem`/`clamp` (phần diff) | **N/A** | Diff không thêm font-size/spacing mới (h1 giữ `text-hero`). |
| Media: tỉ lệ ảnh + srcset | **OK** | `HomeImage` truyền `width=1787 height=880` + class `h-auto w-full` → box giữ tỉ lệ attribute, `w-full` = `max-width:100%`; next/image sinh `srcset` + `sizes="(min-width:768px) 50vw, 100vw"`. |
| Touch target ≥44px | **N/A** | Diff không thêm/thay control tương tác; 2 CTA không đổi. |
| Không dùng `100vh` đơn thuần | **OK** | Hero không dùng `100vh`; có `100vw` trong calc — đã xử lý bằng `overflow-hidden`. |
| `prefers-reduced-motion` | **OK** | `Reveal` tôn trọng reduced-motion; globals.css có block reduced-motion. |
| Không che lỗi bằng `overflow:hidden` | **OK** | `overflow-hidden` dùng đúng mục đích (clip bleed), không che layout hỏng. |

**Kết luận gate:** không có mục nào FAIL.

## Skill gates

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| `aislop scan --changes` | **Blocked** | Không chạy được (shell permission-gated); không thay bằng heuristic thủ công. |
| `oxlint` (anti-slop) | **skip, oxlint not configured** | Glob `**/.oxlintrc*` → no files; diff đụng TS/TSX (`Hero.tsx`) nhưng repo chưa cấu hình oxlint. |
| `ocr` (open-code-review) | **skip** | Không xác minh được đã cài (shell blocked); `ocr` chưa chạy — không chặn PASS. |
| AI-readable (`skills/ai-readable-codebase` §6) | **OK** | 1 indicator nhẹ: magic `1280` trong `globals.css` trùng `maxWidth.container` (đã có comment ⚠ buộc khớp `tailwind.config.ts` L48). Không có tên mơ hồ, không hàm >50 dòng, không indirection thừa, không comment WHAT. <3 indicator → không FAIL. |
| AI-friendly web | **N/A** | Task nội bộ/restyle visual, không đụng `llms.txt/robots.txt/sitemap` hay surface public mới. |
| blitzstrike (pentest) | **N/A** | Không phải STRICT, không có attack surface (auth/API/input). |
| frontend-checklist / impeccable | **OK (diff nhỏ)** | Semantics giữ nguyên; alt mô tả đúng; `priority` giữ cho LCP; không thêm anti-pattern visual (bỏ shadow/khung bo góc theo ảnh mẫu). |

## Findings

Không có **[CRITICAL]** / **[MAJOR]**.

1. **[MINOR]** `src/app/globals.css:125,131,121` — magic number `1280px` bị lặp lại trong CSS, phụ thuộc `maxWidth.container` ở `tailwind.config.ts:48`. Đã có comment ⚠ nhưng vẫn dễ drift nếu config đổi.
   *Fix đề xuất (khi có dịp, không bắt buộc cho task này):* inject container width qua CSS variable (`--container-max`) trong `tailwind.config`/`:root` rồi dùng `var(--container-max)` trong calc.
2. **[MINOR]** `src/app/globals.css:125,131` — `100vw` bao gồm bề rộng scrollbar nên over-bleed ~scrollbar/2 (≈7px) → ảnh bị **clip ~7px mép phải** trên browser có scrollbar dọc (Chrome Windows). Không gây scroll ngang (overflow-hidden) và không thấy rõ trên ảnh này, nhưng là chủ ý cần biết.
   *Fix đề xuất (tùy chọn):* thay `100vw` bằng biến trừ scrollbar hoặc chấp nhận (hiện tại OK).
3. **[MINOR]** `src/components/shared/HomeImage.tsx:38` — fallback `onError` render `<div role="img" className="h-auto w-full">` không có chiều cao → sập khung khi ảnh lỗi. Đây là code **có sẵn ngoài diff**; Hero giờ là ảnh LCP nên nếu asset lỗi sẽ lộ. Đề xuất task riêng (ngoài scope).

### Điểm đã kiểm & đạt

- **Ảnh không méo (theo attribute):** `Hero.tsx:9-13` đặt `width:1787/height:880` + `h-auto w-full` → box giữ đúng tỉ lệ ~2.03:1, không giãn. Ảnh thực tế đã đọc (Read hiển thị): robot AI + dashboard holographic — khớp mô tả. ⚠ **Không xác minh được pixel thực của file** (cần shell) → residual risk (thấp; số 1787×880 nhất quán ở change/task/comment).
- **Alt vi + en:** `vi.json:68` "Minh hoạ robot AI vận hành hệ thống quản trị doanh nghiệp"; `en.json:68` "Illustration of an AI robot operating an enterprise management system" → mô tả đúng nội dung ảnh, đã bỏ "giao diện minh hoạ/illustrative interface". a11y OK.
- **Không phá vỡ phần khác của `/`:** copy/CTA/href giữ nguyên — `Hero.tsx:26` `/contact`, L27 `/solutions/enterprise`, `h1`=`heroTitle`, subtext=`heroDescription`. Chỉ ảnh + wrapper + section overflow đổi.
- **`overflow-hidden` đủ:** section là tổ tiên trực tiếp của phần tràn → clip hiệu lực, không tạo scroll ngang.
- **Design-spec:** `.context/design-spec.md:116-117` đã cập nhật "tràn ra mép phải (full-bleed qua `.hero-bleed-right`), KHÔNG khung bo góc/nền xám" → khớp code (doc reconcile OK).

## Residual risk

- Chưa chạy độc lập được `npm run lint` / `npm run typecheck` / `npm run build` (shell permission-gated + PowerShell Execution Policy chặn `npm.ps1`). Dựa trên builder báo PASS + static review.
- Chưa xác minh được pixel thực của `hero-banner.jpg` (chỉ verify bằng Read hiển thị + con số khai báo).
- `aislop` / `ocr` chưa chạy (môi trường).
- Không có browser → full-bleed/scroll ngang verify bằng CSS math, chưa render thật.

## Verdict

✅ **PASS**

Không có CRITICAL/MAJOR; Responsive Checklist Gate không mục nào FAIL; công thức full-bleed đúng cho 768–1280+ (padding 1.5rem/2rem khớp breakpoint), mobile không tràn; alt text vi+en đúng; copy/CTA giữ nguyên.
Verify commands bị chặn bởi môi trường (không phải lỗi code) → ghi residual risk, không tính FAIL theo workflow.
