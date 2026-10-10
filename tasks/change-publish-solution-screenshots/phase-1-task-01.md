# phase-1-task-01 — Đưa ảnh + nội dung 4 giải pháp lên web (CRM/LMS/DentGo/BoxAI)

**Change file (nguồn sự thật):** `spec/changes/2026-10-10-publish-solution-screenshots.md`
**Work item:** `change-publish-solution-screenshots`
**Slug:** `change-publish-solution-screenshots`

## Classification / Risk

- **Change type:** ADDITIVE (nội dung .mdx cho CRM/LMS/DentGo đang là stub) + MODIFY nhỏ (render infra: thêm `ScreenshotSection` vào trang AI + i18n key + copy asset).
- **Scope:**
  - `public/images/solutions/boxai/*.jpg` (copy 3 ảnh — mới).
  - `public/images/solutions/{crm,lms,dentgo}/*.png` (asset đã có trên đĩa, chưa tracked — nay được `.mdx` tham chiếu).
  - `src/content/solutions/{vi,en}/{crm,lms,dentgo,boxai}.mdx`.
  - `src/app/[locale]/solutions/ai/[slug]/page.tsx` (thêm `<ScreenshotSection>`).
  - `src/i18n/messages/{vi,en}.json` (`solutions.ai.screenshotsTitle`).
  - `docs/DESIGN.md` (reconcile as-built — Screen AI/Enterprise detail).
- **Expected review level:** NORMAL trở lên. Có cờ đỏ "shared component" (`ScreenshotSection` dùng chung enterprise + AI) + i18n dùng chung → nếu thấy rủi ro regression, reviewer nâng STRICT.
- **Blast radius:** 3 trang AI detail (`boxai`/`flycam`/`custom-ai`) × 2 locale; 4 trang enterprise detail × 2 locale (chỉ 3 trang đổi nội dung hiển thị do bật cờ, HRM không đổi); i18n `solutions.*` (dùng chung mọi trang solutions).
- **Doc impact:** `docs/DESIGN.md` current-state (components Screen AI detail + Enterprise detail). Không đụng `docs/API_SPEC.md` / `docs/ERD.md` (không đổi API/schema). Intent docs (BRD/PRD) không đổi.
- **Decision impact:** Không đổi kiến trúc/route/schema/API. `renderExtendedContent` là cờ opt-in đã có sẵn trong spec (change HRM).

## Quyết định user đã chốt (KHÔNG hỏi lại)

1. **Ảnh BoxAI chụp UI tiếng Anh → chọn (a): giữ nguyên ảnh gốc.** Không thêm caption tiếng Việt,
   không redact, không đóng khung lại. Trang `/vi` sẽ thấy ảnh UI tiếng Anh — user review khi xem trang.
   (Đã chốt ở change file §145; mục "câu hỏi chưa chốt" nay đã đóng.)
2. **`auto proceed`** — bỏ checkpoint duyệt phase plan; chạy trọn luồng.
3. **`highlights` BoxAI giữ nguyên** (2026-10-10) — số 21/3/4–16 là thông số sản phẩm trong spec R-06b,
   không phải số liệu trong ảnh demo. CRM/LMS/DentGo để trống. (Xem "Caveat nội dung" #2.)

## Mục tiêu

Nối ảnh chụp + docs đã hoàn tất vào trang web: khai `screenshots` trong `.mdx`, viết đầy đủ nội dung
CRM/LMS/DentGo theo bảng mapping §8 của từng docs, và thêm ảnh cho BoxAI.

## Deliverables

### A. Asset — copy 3 ảnh BoxAI (byte-identical, KHÔNG nén/đổi format)
- `docs/reference/boxai/screenshots/01-dashboard-quan-tri.jpg` → `public/images/solutions/boxai/01-dashboard-quan-tri.jpg`
- `docs/reference/boxai/screenshots/02-tasks-channels.jpg` → `public/images/solutions/boxai/02-tasks-channels.jpg`
- `docs/reference/boxai/screenshots/03-ai-box.jpg` → `public/images/solutions/boxai/03-ai-box.jpg`

### B. Nội dung `.mdx` — CRM / LMS / DentGo (vi + en)
Map theo bảng §8 mỗi docs → field `Solution` (`src/content/types.ts`):

| Khối docs | Field |
|---|---|
| §2 Positioning | `description` |
| §3 Vấn đề khách hàng gặp | `sections[0].intro` |
| §4 Năng lực chính | `features[]` (4 phần tử `"<Tiêu đề> — <mô tả>"`) + `sections[0].items[]` |
| §4 Ảnh minh hoạ | `screenshots[]` (đúng thứ tự §8) |
| §5 Tích hợp / pháp quy | `sections[1].title` + `sections[1].items[]` |
| §6 Use case | `useCases[]` (5) |
| §7 FAQ | `faq[]` (4) |
| Kết quả/giá trị | `benefits[]` (2, viết lại cụ thể hơn) |
| Số liệu | `highlights[]` → **để trống** |
| Cờ render | `renderExtendedContent: true` |

`screenshots[]` theo thứ tự §8:
- CRM (5): `01-tong-quan` · `02-khach-hang` · `03-chi-tiet-khach-hang` · `04-dat-ban` · `05-don-hang`
- LMS (7): `01-da-truong-tong-quan` · `02-dashboard-tong-quan` · `03-hoc-sinh` · `04-danh-gia-tt27` · `05-thoi-khoa-bieu` · `06-giao-an-dien-tu` · `07-hoc-ba-so`
- DentGo (5): `01-tong-quan` · `02-ho-so-khach-hang` · `03-ho-so-rhm` · `04-lich-hen` · `05-kho-vat-tu`

`title`: chọn trung tính theo giọng NTA — CRM "Quản trị khách hàng (CRM)", LMS "Quản trị trường học (LMS)",
DentGo "Quản trị phòng khám nha khoa (DentGo)" (§8 mỗi docs cho phép).

### C. Nội dung `.mdx` — BoxAI (vi + en)
- Thêm `screenshots:` 3 ảnh `/images/solutions/boxai/0{1,2,3}-*.jpg`.
- Giữ nguyên `sections` / `useCases` / `faq` / `highlights` / `features` / `benefits` / `description`.
- **KHÔNG** thêm `renderExtendedContent` (nhóm `ai` luôn render).

### D. Render infra
- `src/app/[locale]/solutions/ai/[slug]/page.tsx` — import `ScreenshotSection`, render sau `<FaqList>` (đúng vị trí
  `enterprise/[slug]/page.tsx:75`).
- `src/i18n/messages/{vi,en}.json` — thêm `solutions.ai.screenshotsTitle` (copy chữ từ `solutions.enterprise.screenshotsTitle`).

## Ràng buộc nội dung (bắt buộc — vi phạm = FAIL)

- **Không bịa số liệu.** Số trong ảnh demo (2.627 khách / 7.435 đơn; 91 học sinh; 248 hồ sơ…) KHÔNG đưa vào `highlights`/`description`.
- `highlights` để trống ở CRM/LMS/DentGo (chưa có số liệu thật đã xác nhận). **BoxAI giữ `highlights` hiện có**
  (21 thuật toán / 3 tính năng nền / 4–16 kênh — là thông số sản phẩm đã có trong spec R-06b + change đã duyệt,
  không phải số liệu demo). ⇒ Xem "Caveat nội dung" bên dưới.
- KHÔNG đưa lên trang public: URL hệ thống, `admin@demo1`, `123456`, `187.52.119.50`, `demo1.76.13.214.188.sslip.io`,
  `cms.dragonhotpotvietnam.com`. Docs nội bộ `docs/reference/**` giữ nguyên (ngoài phạm vi sửa).
- Brand/tên khách hàng trong ảnh: giữ nguyên (user chốt 10/10/2026).
- Cả `vi` và `en` cho mọi `.mdx`.
- Không sửa `docs/reference/**`. Không tạo case study mới. Không đụng HRM ngoài regression check.

## Acceptance Criteria

- [ ] 3 ảnh BoxAI trong `public/images/solutions/boxai/`; `boxai.mdx` (vi+en) khai đúng `screenshots`.
- [ ] Trang AI render `ScreenshotSection`; `flycam`/`custom-ai` (không ảnh) không hụt ảnh/heading rỗng (component `return null` khi rỗng).
- [ ] `solutions.ai.screenshotsTitle` có ở cả `vi.json` + `en.json`.
- [ ] CRM/LMS/DentGo `.mdx` (vi+en): `screenshots` đúng thứ tự, `sections`, `useCases`, `faq`, `renderExtendedContent: true`.
- [ ] `highlights` trống ở CRM/LMS/DentGo. (BoxAI giữ highlights hiện có — xem caveat.)
- [ ] Grep toàn bộ `src/content/solutions/**/*.mdx` không còn URL hệ thống / `admin@demo1` / `123456` / `187.52.119.50` / `dragonhotpotvietnam.com`.
- [ ] Regression: trang HRM (vi+en) hiển thị y hệt trước change.
- [ ] `npm run lint`, `npm run typecheck`, `npm run build` PASS (`test_command: null` → `skip, no test configured`).

## Verification Plan

- Commands (từ `.context/project-config.md`): `npm run lint` · `npm run typecheck` · `npm run build`.
- Test: `test_command: null` → **skip, no test configured**.
- Evidence:
  - `Get-FileHash` 3 ảnh BoxAI nguồn vs `public/` = khớp.
  - `grep -riE "admin@demo1|123456|187\.52\.119\.50|sslip\.io|dragonhotpotvietnam\.com" src/content/solutions` = 0.
  - Đếm `<img>`/heading trong HTML build các trang (đặc biệt HRM regression).
  - `git diff` chỉ file thuộc task.

## Caveat nội dung (user review khi xem trang)

1. **Ảnh BoxAI tiếng Anh** giữ nguyên (quyết định (a)). `/vi` sẽ thấy UI tiếng Anh (`Intelligent Safety Alarm
   Management Platform`, `访客` = khách). Đúng thực tế sản phẩm đang chạy.
2. **`highlights` BoxAI giữ nguyên** trong khi change file acceptance ghi "highlights trống ở cả 4 trang".
   → §C change file ghi rõ "Giữ nguyên ... highlights đã có"; số 21/3/4–16 là thông số sản phẩm (spec R-06b),
   không phải số liệu demo ảnh. **User đã xác nhận 2026-10-10: giữ highlights BoxAI.** Mâu thuẫn nội tại
   của change file đã được giải quyết theo §C.
3. Nội dung `.mdx` viết lại từ `docs/reference/**` (nguồn đã chốt) — cần user đọc lại giọng văn/cách diễn đạt.

## Retry / Error Memory

- attempt 0.

## Doc / Decision Impact

- Reconcile as-built: `docs/DESIGN.md` — Screen "Chi tiết giải pháp AI" bổ sung `ScreenshotSection`;
  Screen "Chi tiết giải pháp doanh nghiệp" bổ sung `Sections/UseCases/FaqList` (gate `renderExtendedContent`).
- Không đổi `docs/API_SPEC.md` / `docs/ERD.md` (không API/schema). Không đổi intent docs.
- Không đổi requirement/behavior contract → `spec_version` giữ **3.0.0**; sinh `spec/updates/` + CHANGELOG +
  `spec/test-scope/current.json` (scope v9 → v10, trigger `feature-update`, risk `medium`).

## Feature Verification

- **Acceptance criteria — kết quả verify (primary chạy lại 2026-10-10, sau reviewer):**
  1. ✅ 3 ảnh BoxAI trong `public/images/solutions/boxai/`; `boxai.mdx` vi+en khai đúng `screenshots`
     (01-dashboard-quan-tri / 02-tasks-channels / 03-ai-box). Hash byte-identical với `docs/reference/boxai/screenshots/`.
  2. ✅ Trang AI render `ScreenshotSection`. Kiểm chứng trên HTML build `.next/server/app/**`:
     BoxAI có heading "Hình ảnh giải pháp" (vi) / "Solution screenshots" (en) + 3 `<img>` đúng thứ tự;
     `flycam`/`custom-ai` **không** có heading (component `return null` khi rỗng) — không ảnh hụt.
  3. ✅ `solutions.ai.screenshotsTitle` có ở cả `src/i18n/messages/vi.json` và `en.json`, resolve đúng ở runtime.
  4. ✅ CRM/LMS/DentGo `.mdx` (vi+en): `screenshots` đúng thứ tự bảng §8 docs (CRM 5 / LMS 7 / DentGo 5 —
     reviewer đối chiếu độc lập `docs/reference/*/README.md:95-103`), có `sections` 2, `useCases` 5,
     `faq` 4, `renderExtendedContent: true`.
  5. ✅ `highlights` trống ở CRM/LMS/DentGo; BoxAI giữ 21/3/4–16 (user chốt 10/10).
  6. ✅ Grep `src/content/solutions/**` cho `admin@demo1|123456|187.52.119.50|sslip.io|dragonhotpotvietnam` = **0 match**.
  7. ✅ Regression HRM: `hrm.mdx` + `enterprise/[slug]/page.tsx` không nằm trong `git status`; HTML build
     HRM vẫn 5 ảnh — không đổi layout.
  8. ✅ `npm run lint` = 0 errors (1 warning pre-existing `src/components/mdx/index.tsx:25` ngoài scope);
     `npm run typecheck` = PASS; `npm run build` = PASS (49/49 static pages).
     `test_command: null` → **skip, no test configured** (repo chưa có test framework).

- **Verify commands + result:**
  | Command | Result |
  |---|---|
  | `npm run lint` | PASS — 0 errors, 1 warning pre-existing (ngoài scope) |
  | `npm run typecheck` | PASS — `tsc --noEmit` exit 0 |
  | `npm run build` | PASS — 49/49 static pages, SSG đủ AI (boxai/flycam/custom-ai) + enterprise (crm/hrm/lms/dentgo) |
  | test | skip — no test configured |

- **Reviewer verdict:** **PASS (STRICT, round 1)** —
  `.context/review-reports/change-publish-solution-screenshots-phase-1-task-01-round-1-review.md`
  — 0 CRITICAL · 0 MAJOR · 3 MINOR (non-blocking).
  - MINOR-1: `package-lock.json` dirty ngoài scope → close-out phải stage tường minh, không `git add -A`.
  - MINOR-2: alt text ảnh = `solution.title` cho mọi ảnh (pattern có sẵn, không phải lỗi mới) → task riêng nếu muốn.
  - MINOR-3: `docs/DESIGN.md` khối AI detail chưa nêu "ScreenshotSection ẩn khi rỗng" (thiếu đối xứng, không sai as-built).

- **Residual risk:**
  - Reviewer bị sandbox chặn chạy `npm`/đọc ảnh → **primary chạy lại đủ 3 lệnh verify** (bảng trên) sau reviewer, PASS cả 3.
  - **Chưa verify bằng mắt**: 3 ảnh BoxAI hiển thị đúng, không lộ watermark/URL hệ thống trong ảnh → user mở trang xác nhận.
  - `docs/reference/{boxai,*/screenshots}/` là untracked (asset nguồn có sẵn trên đĩa, ngoài phạm vi task) —
    `docs/reference/**/README.md` (tracked) xác nhận không bị sửa.

## Files to Create/Modify

- `public/images/solutions/boxai/01-dashboard-quan-tri.jpg` (new)
- `public/images/solutions/boxai/02-tasks-channels.jpg` (new)
- `public/images/solutions/boxai/03-ai-box.jpg` (new)
- `src/content/solutions/vi/{crm,lms,dentgo,boxai}.mdx`
- `src/content/solutions/en/{crm,lms,dentgo,boxai}.mdx`
- `src/app/[locale]/solutions/ai/[slug]/page.tsx`
- `src/i18n/messages/{vi,en}.json`
- `docs/DESIGN.md`
- `spec/updates/2026-10-10-publish-solution-screenshots.md`, `spec/CHANGELOG.md`, `spec/test-scope/current.json`

## Ngoài phạm vi (KHÔNG làm)

- KHÔNG sửa `docs/reference/**`.
- KHÔNG nén/đổi format ảnh.
- KHÔNG sửa `enterprise/[slug]/page.tsx` / `hrm.mdx` (HRM chỉ regression check).
- KHÔNG tạo case study mới.
- KHÔNG đụng `package-lock.json` (dirty sẵn — nhiễu).
