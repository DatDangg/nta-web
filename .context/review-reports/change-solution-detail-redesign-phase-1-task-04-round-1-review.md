Agent: reviewer

# Review — change `2026-10-11-solution-detail-redesign` · Phase 1 · Task T4 · round 1

- **Work item:** change-nta-website-solution-detail / T4 (CRM·HRM·DentGo layout mới)
- **Date:** 2026-10-12
- **Review level:** `NORMAL`
- **Reason:** change §5.2 chốt NORMAL cho T3/T4. Không đụng auth/tenant/schema-DB/API contract;
  blast radius giới hạn ở tầng render + content của 4 trang giải pháp (đều là SSG, 3 trang đổi layout,
  LMS giữ legacy). Riêng `types.ts` + `ScreenshotSection` là shared nhưng thay đổi mang tính
  additive/back-compat (union `string | object`, giữ nhánh `HomeImage` cho trang AI) → không đủ ngưỡng STRICT.

## Blast radius

| Khu vực | Ảnh hưởng |
|---|---|
| `/solutions/enterprise/{crm,hrm,dentgo}` × VI/EN | Đổi layout (SolutionHero + FeatureZigZag) — trang live trên prod |
| `/solutions/enterprise/lms` × VI/EN | Nhánh legacy (`layout==='lms'`) — kỳ vọng **không** đổi |
| `SolutionHero.tsx`, `FeatureZigZag.tsx`, `ScreenshotSection.tsx`, `ShotImage.tsx` | Shared component |
| `SolutionCard.tsx` (trang list + home) | normalize `screenshots[0]` union — chạm cả card AI/solution |
| `content/types.ts` | `HeroShot`, `solution.heroShot/imageCaption`, `screenshots` mở rộng union |
| `i18n/messages/{vi,en}.json` | +3 key `solutions.enterprise` |
| `.mdx` 8 file enterprise | 6 file crm/hrm/dentgo đổi data, 2 file lms thêm `layout: lms` |

## Verify commands + result

> ⚠ `shell` bị **permission denied** ngay lệnh đầu (`git status`) → theo Tool Loop Guard **DỪNG**, không retry,
> không vòng qua pipeline. Reviewer **không chạy được** verify command nào. Xác minh thay thế: đọc source
> (`Read`/`Grep`) + đối chiếu bảng §7 spec.

| Command | Kết quả |
|---|---|
| `npm.cmd run lint` | **Blocked** — permission denied: shell |
| `npm.cmd run typecheck` | **Blocked** — permission denied: shell |
| `npm.cmd run build` | **Blocked** — permission denied: shell |
| `node scripts/screenshots/.tmp/verify-t4.mjs` | **Blocked** — permission denied: shell |
| HTML evidence `.next/server/app/**/solutions/enterprise/*.html` | **Không tìm thấy** artifact trong workspace (Glob = 0 kết quả, kể cả hidden) → không soi được HTML build |
| Ảnh soi mắt `scripts/screenshots/.tmp/solutions-enterprise-{crm,hrm,dentgo}-vi-1440.png` | Không kiểm chứng được (không mở được ảnh trong phạm vi quyền) |
| Dev server port 3002 | **Không** tự probe (reviewer không tự chạy app) |

Builder báo lint/typecheck/build PASS + `verify-t4.mjs` 36/36 (journal T4). Reviewer **chấp nhận là evidence
của primary** nhưng **không tái lập độc lập được** → xem Residual risk.

## Kết quả soi theo 9 check đặc biệt (bằng chứng source)

1. **Alt từng ảnh khớp bảng §7 — OK.** Đối chiếu `src/content/solutions/{vi,en}/*.mdx` với bảng §7:
   - CRM hero `01` VI/EN khớp §7 CRM 01; features `03/04/05` khớp §7; screenshots `02` khớp §7 CRM 02.
   - DentGo hero `01`, features `03/04/05`, screenshots `02` — khớp §7 DentGo (cả VI/EN).
   - HRM mọi alt mang đúng tiền tố `Giao diện minh hoạ —` / `Illustrative interface —` (hero 01, features 02/08/09, screenshots 03/04/05/06/07) — khớp §7 HRM (cả VI/EN).
   - Mỗi ảnh dùng **đúng 1 lần**, không trùng hero/features/screenshots (CRM/DentGo 01–05; HRM 01–09).
2. **Caption chỉ HRM — OK.** `imageCaption` chỉ có ở `hrm.mdx` (`"Giao diện minh hoạ"` / `"Illustrative interface"`); CRM/DentGo không có → `solution.imageCaption === undefined`.
   `SolutionHero.tsx:95-111` và `FeatureZigZag.tsx:44-50` chỉ render `<figcaption>` khi có `caption`;
   `page.tsx:119` truyền `caption` cho `ScreenshotSection` chỉ khi `!useLegacyLayout`.
   → HRM có figcaption ở hero + 3 feature + 5 screenshots (VI lẫn EN); CRM/DentGo 0 figcaption.
3. **Chữ CRM/HRM/DentGo không bị sửa — KHÔNG xác minh được** (không chạy được `git diff 055e9b5`).
   Về mặt source: diff T4 chỉ nên thêm `heroShot` / `image+imageAlt+ratio` / `screenshots` v2 —
   nhưng reviewer không có evidence để chứng minh title/description không đổi. → Residual risk.
4. **Screenshots cũ không còn, screenshots mới không trùng hero/features — OK.** cả 3 trang dùng
   `/images/solutions/v2/<slug>/0x-*.png`; không còn `/images/solutions/<slug>/0x-*.png` trong mdx 3 trang.
5. **Nhánh legacy LMS — OK (theo source).** `page.tsx:68` `useLegacyLayout = layout === 'lms'`;
   LMS đi PageHeader + FeatureList bridge + ScreenshotSection `shotFrame=false` → nhánh `HomeImage` cũ.
   `caption` undefined. Không thấy đường render mới lọt vào LMS. (HTML so sánh không kiểm được → residual.)
6. **Trang AI không đổi — OK (theo source).** `ScreenshotSection` mặc định `shotFrame` falsy → nhánh `HomeImage`
   (DOM như cũ); `caption` không truyền → không figcaption. Trang AI không truyền prop mới.
7. **Anchor `#features` + CTA — OK (theo source).** `FeatureZigZag` nhận `id="features"` (`page.tsx:112`) → `Section id=...`;
   `primaryCta.href = localizedPath(locale, '/contact')` (đúng locale); `secondaryCta.href = '#features'`, có `ariaLabel`.
   *Chưa đọc được `Section.tsx` để xác nhận forward `id`* → residual.
8. **Feature không ảnh full-width, căn trái — OK.** `FeatureZigZag.tsx:78-88`: `!feature.image` → `<article>` trọn
   Container (default 1280), `<h3>` + `<p>` căn trái, **không** render khung ảnh rỗng. CRM F1 + DentGo F1 (không có `image`) rơi vào nhánh này.
9. **Không hardcode tên sản phẩm trong component — OK.** `SolutionHero`/`FeatureZigZag`/`ScreenshotSection` không hardcode;
   `imageMaxW` đến từ `solution.heroShot?.maxWidth` (mdx). *Lưu ý em-dash: xem MINOR #2.*

## Responsive Checklist Gate (diff đụng UI → bắt buộc)

Không có môi trường browser → xác minh bằng CSS-math + đọc class; phần chưa xác minh ghi vào Residual risk.

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout — không horizontal scroll | OK (suy luận) | Ảnh `max-w-full` + `w-auto h-auto`; grid `lg:grid-cols-2` + gap; text `max-w-[38rem]`/`[65ch]`; Container có `px-4 sm:px-6 lg:px-8` |
| Layout — mobile-first, grid `auto-fit`/không cột cố định | OK | `FeatureZigZag` 1 cột mobile → `lg:grid-cols-2`; screenshots `grid gap-6 sm:grid-cols-2` |
| Typography — rem / fluid | OK (một phần) | Dùng token (`text-display/h3/body`); **không đọc được `globals.css`** để chắc toàn bộ là rem → residual |
| Media — `max-width:100%`, aspect-ratio, không cắt | OK | `ShotImage` nhận `ratio`/`maxH`, spec §3.1 không `object-cover`/`aspect-*` cứng; hero `max-h-[640px]`, zig-zag `max-h-[320px] lg:max-h-[420px]` |
| Touch/interaction ≥ 44px | OK (suy luận) | CTA dùng `buttonStyles('primary','lg')` (min-h-12 theo spec §9); figcaption không interactive |
| Viewport — không `100vh` đơn thuần | OK | Không thấy `100vh` trong file đụng tới |
| `prefers-reduced-motion` | N/A | T4 không thêm motion |

**Bất kỳ mục nào FAIL → verdict FAIL**: không có mục nào FAIL.

## Skill gates

| Gate | Kết quả | Ghi chú |
|---|---|---|
| `aislop scan --changes` | **Blocked** | Shell permission denied → không chạy được |
| `oxlint` (anti-slop) | **Blocked** | Shell permission denied → không xác minh được config/chạy |
| `ocr` (open-code-review) | skip | Không xác minh được cài đặt (shell bị chặn) → không chặn PASS |
| AI-readable gate | **OK** | Component tách trách nhiệm rõ, hàm ngắn (<50 dòng), comment giải thích WHY; không có ≥3 AI-chaos indicators |
| ai-friendly-web | **N/A** | T4 là redesign trang sản phẩm hiện có, không tạo site public mới / không đụng `llms.txt`·`robots.txt`·`sitemap.xml` |
| blitzstrike | **N/A** | Chỉ áp cho STRICT nhạy cảm; T4 = NORMAL |

## Findings

**[MINOR #1] §4.3 (spec) vs acceptance T4 mâu thuẫn về container của feature không ảnh**
- Bằng chứng: `FeatureZigZag.tsx:78-88` render feature không ảnh **trọn Container default 1280**; spec §4.3 lại yêu cầu
  `<Container size="prose">` (720px). Acceptance T4 (#3) lại chốt "full-width, căn trái".
- Đánh giá: code bám **acceptance + §4.2** (note "đổi prose→default 1280") → hợp lý. Nhưng §4.3 còn chỏi ngược.
- Đề xuất: reconcile `.context/design-spec-solution-detail.md` §4.3 cho khớp acceptance (ghi rõ feature không ảnh dùng default 1280).

**[MINOR #2] "Không em-dash trong copy mới" vs alt/caption HRM bắt buộc em-dash**
- Bằng chứng: `hrm.mdx` alt `"Giao diện minh hoạ — …"` / caption `"Giao diện minh hoạ"` (§7 yêu cầu em-dash), trong khi
  acceptance "Chung" của change ghi "Không có em-dash trong copy mới".
- Đánh giá: đây là **ngoại lệ có chủ đích theo §7**, không phải lỗi copy — nhưng hai câu chữ trong tài liệu xung đột.
- Đề xuất: thêm ghi chú ngoại lệ §7 vào change/spec để lần verify sau không báo nhầm.

**[MINOR #3] Hero description tái dùng `solution.description` (đa câu) trong khi §3 yêu cầu 1 câu ≤62ch**
- Bằng chứng: `page.tsx:80` truyền `description={solution.description}`; `SolutionHero.tsx:70` đặt `max-w-[62ch]`.
  Ví dụ `en/crm.mdx` description là đoạn nhiều câu ("... instead of drifting away after each transaction.").
- Đánh giá: **không thuộc acceptance T4** và là content pre-existing (PageHeader cũng dùng cùng chuỗi) → không phải regression.
- Đề xuất: nếu muốn đúng §3, tách task riêng rút gọn description hero 1 câu.

**[MINOR #4] Evidence verify của T4 không tái lập được trong workspace**
- Bằng chứng: `shell` denied; Glob `.next/server/app/**/solutions/enterprise/*.html` = 0 kết quả; không mở được ảnh soi mắt.
- Đánh giá: reviewer chỉ xác minh được ở tầng source; lint/typecheck/build/verify-t4.mjs/HTML/screenshot đều dựa vào báo cáo builder.
- Đề xuất: khi commit T4, giữ artifact build/HTML hoặc mở quyền shell cho reviewer để tái lập (đúng tinh thần "không tin lời builder").

## Residual risk (không xác minh được trong phạm vi quyền + cap read-tool)

- `types.ts` (`HeroShot`, `heroShot.maxWidth`, union `screenshots`) và `ShotImage.tsx` (cơ chế KHÔNG cắt + fade đo runtime)
  chưa đọc trực tiếp → check "hero không bị cắt" và "max-w-960 HRM" dựa vào báo cáo builder + spec.
- `Section.tsx` chưa đọc → chưa xác nhận forward `id` (anchor `#features`) và `Container` nội bộ.
- `SolutionCard.tsx` chưa đọc → chưa xác nhận normalize `screenshots[0]` không đổi hành vi card AI/home (check #6).
- `i18n/messages/{vi,en}.json` chưa đọc → chưa xác nhận giá trị `demoCta`/`featuresCta`/`featuresCtaAria` (đúng "Đăng ký demo" / "Xem tính năng ›" và WCAG 2.5.3 label-in-name).
- Check #3 (chữ CRM/HRM/DentGo không đổi) không có `git diff` để chứng minh.
- Giới hạn: đã dùng hết cap 15 read-tool (Glob/Grep/Read) theo NORMAL → dừng, ghi residual thay vì đọc tiếp.

## Verdict

✅ **PASS** (NORMAL)

- Không có **CRITICAL**/**MAJOR**. Các finding còn lại là **MINOR** (tài liệu/ghi chú/residual), không chặn merge.
- 9 check đặc biệt: 7 OK, 1 OK-theo-source (LMS legacy), 1 **không xác minh được** (check #3 text-unchanged) — đã ghi residual.
- Responsive Checklist Gate: không mục nào FAIL.
- ⚠ Vì `shell` bị permission deny, reviewer **không tái lập** được lint/typecheck/build/verify-t4.mjs; PASS dựa trên
  static review (source + §7) + evidence builder. Đề nghị primary/Builder đính kèm bằng chứng build/HTML khi close-out T4.
