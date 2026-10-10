Agent: reviewer

# Review — change-publish-solution-screenshots / phase-1-task-01 (round 1)

- **Task file:** `tasks/change-publish-solution-screenshots/phase-1-task-01.md`
- **Change file:** `spec/changes/2026-10-10-publish-solution-screenshots.md`
- **Repo:** `D:\prj\nta-web` (Next.js App Router, next-intl vi/en, MDX trong `src/content/solutions/`)
- **Date:** 2026-10-10

## Review level: STRICT

**Reason:** Nâng từ NORMAL (change file yêu cầu "NORMAL trở lên") theo yêu cầu primary:
- Sửa **shared component invocation** `ScreenshotSection` dùng chung nhóm trang enterprise + AI.
- **i18n key dùng chung** (`solutions.*`).
- **Nội dung public mới** (copy + ảnh) cho 4 trang × 2 locale.
- Bật cờ `renderExtendedContent` lần đầu cho 3 trang enterprise (đổi bề mặt render public).

## Blast radius

- 3 trang AI detail (`boxai`/`flycam`/`custom-ai`) × 2 locale — `ScreenshotSection` mới thêm.
- 4 trang enterprise detail (`crm`/`hrm`/`lms`/`dentgo`) × 2 locale — chỉ CRM/LMS/DentGo đổi nội dung hiển thị (bật cờ); HRM không đổi.
- i18n `solutions.ai.screenshotsTitle` + `solutions.enterprise.screenshotsTitle` (key nhóm).
- Trang danh sách `/solutions/enterprise` + `/solutions/ai` (đọc `title`/`description` của `.mdx` — CRM/LMS/DentGo đổi tiêu đề/mô tả).
- Asset `public/images/solutions/{crm,lms,dentgo,boxai}/**`.
- Spec artifacts: `spec/updates/*`, `spec/CHANGELOG.md`, `spec/test-scope/current.json`, `docs/DESIGN.md`.

## Verify commands + result

| Command | Result |
|---|---|
| `npm run lint` | **Blocked (environment)** — không chạy lại được: PowerShell chặn `npm.ps1` (`running scripts is disabled on this system`, ExecutionPolicy). Builder báo PASS (1 warning pre-existing). |
| `npm run typecheck` | **Blocked (environment)** — cùng lỗi ExecutionPolicy. Builder báo PASS. |
| `npm run build` | **Blocked (environment)** — không chạy lại được. Builder báo PASS 49/49 pages. **Corroborated:** đọc trực tiếp artifact build trên đĩa `.next/server/app/**` (HTML + RSC) — nội dung mới render đúng, xem bằng chứng dưới. |
| test_command | `skip, no test configured` (`test_command: null`). |

> Thay thế verify bằng **kiểm chứng artifact build** (HTML/RSC đã prerender) — mạnh hơn đọc code, phản ánh output thật tại thời điểm build gần nhất. Không chạy lại được shell ngoài `git` (các lệnh `node`/`npm.cmd`/`dir`/`Get-ChildItem`/`git hash-object` bị permission layer deny).

### Bằng chứng build (kiểm chứng render thực tế)

- **BoxAI (vi):** `.next/server/app/vi/solutions/ai/boxai.rsc:49` → `<h2>Hình ảnh giải pháp</h2>` + 3 `<li>` ảnh `/images/solutions/boxai/0{1,2,3}-*.jpg` đúng thứ tự.
- **BoxAI (en):** `.next/server/app/en/solutions/ai/boxai.rsc:49` → `<h2>Solution screenshots</h2>` + 3 ảnh, alt `BoxAI — edge AI for fixed cameras`.
- **flycam / custom-ai (vi+en):** KHÔNG xuất hiện heading "Hình ảnh giải pháp"/"Solution screenshots" trong body render (`grep "Hình ảnh giải pháp" .next/server/app` không trả match cho `flycam.html`/`custom-ai.html`). → `ScreenshotSection return null khi rỗng` xác nhận trên output thật.
- **CRM/LMS/DentGo (vi+en):** có screenshot section, đúng thứ tự:
  - CRM 5 ảnh: `01-tong-quan` → `02-khach-hang` → `03-chi-tiet-khach-hang` → `04-dat-ban` → `05-don-hang` (`.next/server/app/vi/solutions/enterprise/crm.rsc:48`, `en/.../crm.rsc:51`).
  - LMS 7 ảnh: `01-da-truong-tong-quan` … `07-hoc-ba-so` (`vi/.../lms.rsc:51`).
  - DentGo 5 ảnh: `01-tong-quan` … `05-kho-vat-tu` (`vi/.../dentgo.rsc:50`).
- **HRM (vi+en):** `hrm.rsc:49` vẫn render 5 ảnh `/images/solutions/hrm/0*.png` + heading như cũ. `enterprise/[slug]/page.tsx` KHÔNG nằm trong `git status` (không sửa) + `hrm.mdx` không đổi → output giữ nguyên.
- Thứ tự ảnh **khớp bảng mapping §8** của docs (kiểm chứng độc lập qua `git grep`):
  - CRM §8 (`docs/reference/crm-dragon-hotpot/README.md:95-99`): 01-tong-quan → 05-don-hang ✓
  - LMS §8 (`docs/reference/lms-ismartschool/README.md:97-103`): 01-da-truong-tong-quan → 07-hoc-ba-so ✓
  - DentGo §8 (`docs/reference/dentgo-smile/README.md:99-103`): 01-tong-quan → 05-kho-vat-tu ✓
- **i18n:** key resolve đúng khi render (`t('screenshotsTitle')` nhóm `solutions.ai` cho ra "Hình ảnh giải pháp"/"Solution screenshots") → key tồn tại đúng block, cả 2 locale.

## Responsive Checklist Gate

Diff đụng UI (thêm image grid qua `ScreenshotSection` trên trang AI + bật extended content 3 trang enterprise). Đánh giá theo CSS math (không có browser trong môi trường).

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout — không horizontal scroll | **OK** | `ScreenshotSection.tsx:10` `grid gap-6 sm:grid-cols-2` — base (<640px) 1 cột, ≥640 2 cột; không cột/lề fixed. Ảnh `h-auto w-full` (`:13`). |
| Layout — mobile-first (`min-width`) | **OK** | Tailwind `sm:` = `min-width:640px` (breakpoints profile 640/768/…). |
| Typography/Spacing | **OK** | Không thêm font-size `px`; dùng token `text-h2` + spacing `mt-6 gap-6` sẵn có. |
| Media (ảnh responsive) | **OK (một phần N/A)** | `HomeImage` + `sizes="(min-width: 640px) 50vw, 100vw"`, `className="h-auto w-full rounded-lg"`. `srcset` do next/image sinh — component dùng chung có sẵn (không đổi trong diff). |
| Touch/Interaction (≥44px) | **N/A** | Ảnh không phải control tương tác; không thêm nav/button. |
| Table mobile | **N/A** | Không có table. |
| Viewport/A11y (100vh, reduced-motion) | **N/A / OK** | Không thêm `100vh`; `ScreenshotSection` không animation. |

**Kết luận responsive: OK** (không mục nào FAIL). Phần `srcset`/render ảnh ở 375/768/1280 chưa xác minh bằng browser → xem Residual risk.

## Skill gates

| Gate | Kết quả | Bằng chứng / lý do |
|---|---|---|
| `aislop scan --changes` | **skip, không chạy được** | Shell ngoài `git` bị permission deny (`node`/`npm.cmd` deny) → không chạy được CLI. Diff là content + 2 dòng infra + i18n; đọc thủ công không thấy AI-slop (narrative comment/dead code/swallowed error/`as any`/todo stub). |
| `oxlint` (anti-slop) | **skip, oxlint not configured** | `package.json` devDependencies chỉ có `eslint` (không có `oxlint`); không có oxlint config. |
| `ocr` (open-code-review) | **skip, không cài/không chạy được** | Không có `ocr` trong môi trường; shell hạn chế. |
| AI-readable codebase | **OK** | Diff nhỏ, tên self-descriptive (`screenshotsTitle`, `ScreenshotSection`), không tăng indirection/magic number/hàm >50 dòng. `<3` AI-chaos indicators. |
| ai-friendly-web | **N/A** | Task là bổ sung nội dung trang có sẵn; không thêm route public mới; `robots.txt` + `sitemap.xml` đã có trong build (`.next/server/app/robots.txt`, `sitemap.xml`); không đổi cấu hình crawler. |
| blitzstrike (pentest) | **skip** | Task nội dung/render hiển thị, không đụng auth/API/input; không có attack surface mới. |

## Findings

### CRITICAL
Không có.

### MAJOR
Không có.

### MINOR

1. **[MINOR] `package-lock.json` dirty ngoài scope — tuyệt đối không đưa vào commit task.**
   `git diff package-lock.json` = 11 dòng xóa (gỡ entry `next-intl/node_modules/@swc/helpers`). Không liên quan nội dung task (task ngoài phạm vi: "KHÔNG đụng package-lock.json"). Hiện chưa commit nên chưa gây hậu quả, nhưng khi close-out phải đảm bảo `git add` chỉ các file thuộc task.
   - **Fix gợi ý:** stage tường minh danh sách file task (không `git add -A`).

2. **[MINOR] Alt text ảnh dùng chung 1 giá trị = `solution.title` cho mọi ảnh.**
   `ai/[slug]/page.tsx:64` và `enterprise/[slug]/page.tsx:75` truyền `imageAlt={solution.title}` cho cả danh sách → mỗi ảnh có alt giống nhau (vd 3 ảnh BoxAI đều alt "BoxAI — camera AI tại biên"). Đây là pattern **có sẵn** (enterprise đã dùng vậy), không phải lỗi mới do task; nhưng giảm chất lượng a11y/SEO (không mô tả nội dung từng ảnh).
   - **Fix gợi ý (ngoài scope task):** cho phép `screenshots` là mảng `{src, alt}` hoặc thêm i18n caption — đề xuất task riêng.

3. **[MINOR] `docs/DESIGN.md` mô tả AI detail chưa nêu rõ `ScreenshotSection` ẩn khi rỗng.**
   Khối "Screen: Chi tiết giải pháp AI" đã thêm `ScreenshotSection` vào Components nhưng note "rỗng → ẩn" chỉ nêu cho SolutionSections/Highlights/FaqList; note enterprise mới có câu "ScreenshotSection ẩn khi không có `screenshots`". Không sai lệch as-built, chỉ thiếu đối xứng.
   - **Fix gợi ý:** bổ sung nửa câu vào note AI detail cho nhất quán.

### Điểm cần user xem khi duyệt (không phải defect)

- **Ảnh BoxAI là UI tiếng Anh** trên trang `/vi` (`Intelligent Safety Alarm Management Platform`, `访客`) — quyết định (a) đã chốt (change §145, task §Quyết định #1). Cần user xác nhận khi xem trang.
- **`highlights` BoxAI giữ 21/3/4–16** trong khi acceptance change file ghi "highlights trống ở cả 4 trang" — mâu thuẫn nội tại đã giải quyết theo §C + user xác nhận 2026-10-10 (task §Caveat #2). Bên copy cần đọc lại giọng văn mới của CRM/LMS/DentGo/BoxAI.

## Kiểm chứng acceptance criteria

| AC | Kết quả | Bằng chứng |
|---|---|---|
| 3 ảnh BoxAI trong `public/images/solutions/boxai/`; boxai.mdx khai đúng | **PASS** | `glob public/images/solutions/**` liệt kê đủ 3 `.jpg`; `boxai.mdx` (vi+en) khai 3 path khớp tên file; render trong build. |
| Trang AI render ScreenshotSection; flycam/custom-ai không hụt ảnh/heading rỗng | **PASS** | `ai/[slug]/page.tsx:11,64` import + render sau `FaqList`; build HTML flycam/custom-ai không có heading screenshot. |
| `solutions.ai.screenshotsTitle` có ở vi+en | **PASS** | `vi.json:94` / `en.json:94` (block `solutions.ai`), chữ copy từ enterprise (`:81`); render build resolve đúng. |
| CRM/LMS/DentGo: screenshots đúng thứ tự, sections, useCases, faq, renderExtendedContent: true | **PASS** | `git diff` mdx: đủ field; thứ tự khớp §8 docs; build render sections/useCases/faq/screenshots. |
| `highlights` trống ở CRM/LMS/DentGo (BoxAI giữ) | **PASS** | `grep "highlights" src/content/solutions/**/*.mdx` chỉ match custom-ai/flycam/boxai; CRM/LMS/DentGo không có. |
| Grep `.mdx` không còn URL hệ thống/tài khoản demo/số liệu demo | **PASS** | `grep "admin@demo1\|123456\|187\.52\.119\.50\|sslip\.io\|dragonhotpotvietnam\.com\|2\.627\|7\.435\|248 hồ sơ\|91 học sinh" src/content/solutions` = **0 match**. |
| Regression HRM vi+en giữ nguyên | **PASS** | `hrm.mdx` + `enterprise/[slug]/page.tsx` không nằm trong `git status`; `hrm.rsc:49` vẫn 5 ảnh + heading như cũ. |
| CRM/LMS/DentGo không nhân đôi section/useCases/faq | **PASS** | `enterprise/[slug]/page.tsx:72-74` gọi mỗi khối đúng 1 lần, gate `extended`; không có nơi render trùng. |
| vi/en đủ cặp, không chênh cấu trúc | **PASS** | `git diff` cả 4 cặp mdx: cùng bộ field, cùng thứ tự; build render cả 2 locale. |
| lint/typecheck/build PASS | **Corroborated** | Không chạy lại được (ExecutionPolicy); artifact build trên đĩa phản ánh build thành công sau change. |

## Verdict: ✅ PASS

Không có CRITICAL/MAJOR. Toàn bộ acceptance criteria của task được kiểm chứng bằng artifact build + diff + grep. Các MINOR ghi nhận không chặn PASS.

## Residual risk / Blocked

- **Blocked (env):** không chạy lại được `npm run lint`/`typecheck`/`build` (PowerShell ExecutionPolicy chặn `npm.ps1`; `npm.cmd`/`node`/`dir`/`git hash-object` bị permission layer deny). Đã dùng artifact build `.next/server/app/**` làm bằng chứng thay thế.
- **Chưa xác minh:** kích thước/byte-integrity ảnh `public/**` (không stat được file — shell hạn chế; glob chỉ xác nhận tồn tại, không xác nhận >0 byte). Builder có evidence `Get-FileHash` khớp nguồn; đề nghị user mở trang xác nhận ảnh hiển thị.
- **Chưa xác minh:** ảnh BoxAI không chứa watermark URL hệ thống — cần **user xem trực tiếp** (reviewer không có browser/không đọc được file ảnh trong sandbox).
- **Chưa diff-verify được:** `docs/reference/boxai/` và `docs/reference/*/screenshots/` là thư mục **untracked** (asset nguồn có sẵn trên đĩa) → không so baseline được, không thể khẳng định "không bị sửa nội dung". `docs/reference/**/README.md` thì tracked + không nằm trong `git status` → xác nhận **không sửa**. Đây là rủi ro ngoài scope task (nguồn nội dung đã chốt).
