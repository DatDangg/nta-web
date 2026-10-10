# Review — change-enterprise-solution-docs-web-ready · phase-1-task-01 · round-3 (độc lập)

Agent: reviewer

- **Task:** `tasks/change-enterprise-solution-docs-web-ready/phase-1-task-01.md`
- **Change file:** `spec/changes/archive/2026-10-10-enterprise-solution-docs-web-ready.md` (đã archive, vẫn là spec của task)
- **Review level:** `NORMAL`
- **Reason:** Docs-only — 4 file `docs/reference/{hrm-mock,crm-dragon-hotpot,lms-ismartschool,dentgo-smile}/README.md`,
  không đụng code/shared/API/auth/schema/migration/build → không thuộc diện STRICT theo tiêu chí kỹ thuật. Tuy nhiên nội dung
  có yếu tố **riêng tư/PII** (ảnh chụp hệ thống thật sẽ được publish ở change `.mdx` kế tiếp) nên round-3 **mở rộng verify
  sang đọc trực tiếp 10 ảnh PNG** để kiểm tính trung thực của các claim và cảnh báo redact — đúng trọng tâm MAJOR-1 của round-2.
- **Blast radius:** Docs không render lên web. Ảnh hưởng gián tiếp: 4 README là **nguồn nội dung** cho change kế tiếp đưa ảnh
  CRM/LMS/DentGo lên trang public → claim sai trong docs có thể khiến builder kế tiếp publish ảnh chứa PII/brand khách.
  Không đụng `src/content/solutions/**`, `public/`, `docs/API_SPEC.md`, `docs/ERD.md`, `docs/DESIGN.md`.

## Bối cảnh vòng

- Round-1 (`.../round-1-review.md`): chạy inline, PASS nhưng chỉ đọc text, không đối chiếu ảnh.
- Round-2 (`.../round-2-review.md`): độc lập, **FAIL** — MAJOR-1 (CRM §1 khẳng định "đã ẩn danh" nhưng ảnh vẫn lộ brand/chi nhánh/email admin),
  MINOR-1 (H1 chứa tên khách), MINOR-2 (LMS version + 30 tài khoản phụ huynh không bằng chứng).
- Round-3 (này): xác minh builder đã xử lý đúng round-2 và không hồi quy.

## Verify commands + result

| Check | Cách chạy | Result |
|---|---|---|
| `git status --short` / `git diff --stat -- docs/reference` (scope, Acceptance #7) | `shell` | ❌ **Blocked** — `Permission denied: shell` (session reviewer bị deny toàn bộ shell). Không retry (Tool Loop Guard). Acceptance #7 **không xác minh độc lập được** → Residual risk. |
| Ảnh có thật & khớp tên file trong §4/§8 | `Glob docs/reference/**/screenshots/*` | ✅ Khớp **100%**: HRM 5 · CRM 5 · LMS 7 · DentGo 5 (22 ảnh + `boxai` 3 ảnh, không tính). Mọi path trong cột "Ảnh minh hoạ" §4 + bảng §8 đều tồn tại thật, không có tên bịa. |
| 8 heading cùng tên + cùng thứ tự ở 4 file | `Read` 4 README | ✅ Đủ + đúng thứ tự, text heading y hệt nhau (1 Metadata → 8 Bảng mapping). |
| Còn kiểu "bản đồ chức năng N mục / M nhóm" / "13 trạng thái" | `Read` 4 README | ✅ 0 occurrence. |
| MAJOR-1 — CRM §1 đối chiếu ảnh | `Read` `crm-dragon-hotpot/screenshots/{01,02,05}.png` | ✅ **ĐÃ FIX ĐÚNG.** Xem Findings #Resolved. |
| MINOR-1 — ghi chú `title` trung tính §8 | `Read` §8 cả 4 file | ✅ Có ở **cả 4** file (CRM/LMS/DentGo/HRM). |
| MINOR-2 — LMS version + số liệu không bằng chứng | `Read` LMS §1 | ✅ Đã gỡ. Xem Findings #Resolved. |
| 3 file kia có sót rò rỉ tương tự | `Read` `hrm-mock/01`, LMS `01,02`, DentGo `01,02`, HRM `02,04` | ✅ Mỗi file đều có cảnh báo redact cụ thể + đúng thực tế ảnh (xem bên dưới). |
| lint / typecheck / build | — | `skip, no code change` (docs-only). |
| Test | `.context/project-config.md` → `test: null` | `skip, no test framework configured`. |

## Findings — xác minh round-2

### Resolved — [MAJOR-1] CRM §1 nay mô tả ĐÚNG thực tế ảnh (không còn khẳng định "đã ẩn danh")

- **File:** `docs/reference/crm-dragon-hotpot/README.md:12` + cảnh báo redact `:16`.
- **Nội dung mới (§1):** nêu rõ ảnh *hiển thị tên/SĐT/ngày sinh mẫu* + "*chưa có bằng chứng độc lập xác nhận mọi dữ liệu
  này là giả*"; liệt kê đích danh những gì **vẫn lộ**: brand `Dragon Hotpot`, tên chi nhánh/địa điểm
  (`Dragon Hot Pot Lê Duẩn`, `Nguyễn Huệ`, `Võ Văn Tân`), email quản trị `admin@ntacrm.vn`.
- **Bằng chứng ảnh (đọc trực tiếp round-3):**
  - `01-tong-quan.png`: sidebar brand `Dragon Hotpot — Sichuan · Riverside`; góc dưới `Owner Admin` / `admin@ntacrm.vn`;
    "Đặt bàn sắp tới" ghi `Dragon Hot Pot Lê Duẩn`. → khớp 100% câu cảnh báo.
  - `05-don-hang.png`: cột `CHI NHÁNH` hiển thị `Dragon Hot Pot Nguyễn Huệ` và `Dragon Hot Pot Võ Văn Tân`; header
    `7435 đơn hàng` + `1 / 372`; góc dưới `admin@ntacrm.vn`. → xác nhận tên chi nhánh `Nguyễn Huệ`/`Võ Văn Tân`
    trong README **không bịa**, có thật trong ảnh.
  - `02-khach-hang.png`: `2627 khách hàng` + `1 / 132`; danh sách có tên + SĐT (`0903 214 875`…).
- **Kết luận:** MAJOR-1 **đã được xử lý đúng** — claim ẩn danh sai đã bị thay bằng mô tả đúng thực tế + cảnh báo redact
  cụ thể (brand/logo, mọi tên chi nhánh/địa điểm, email/tên quản trị, tên/ĐT/ngày sinh/mã khách, dữ liệu giao dịch).
  Không còn mô tả ngược (không bảo "đã ẩn danh" khi thực tế chưa).

### Resolved — [MINOR-1] ghi chú `title` trung tính cho cả 4 file

- CRM `:78` → "Quản trị khách hàng (CRM)"; LMS `:80` → "Quản trị trường học"; DentGo `:82` → "Quản trị phòng khám nha khoa";
  HRM `:85` → "Quản trị nhân sự". Cả 4 đều ghi rõ: giữ H1 hiện tại **chỉ làm tên tài liệu nội bộ**, không dùng trên trang public.
- ✅ Đạt yêu cầu round-2 (đặt title trung tính ở change `.mdx` sau).

### Resolved — [MINOR-2] LMS gỡ version + số liệu không bằng chứng

- LMS `:13` nay ghi: `91 học sinh` hiển thị ở `02-dashboard-tong-quan.png` và `03-hoc-sinh.png`; `3 trường` hiển thị ở
  `01-da-truong-tong-quan.png`; **"Không nêu phiên bản sản phẩm vì không quan sát thấy trong ảnh; bỏ số liệu 30 tài khoản
  phụ huynh vì chưa đối chiếu được với ảnh."**
- Đối chiếu ảnh: `02-dashboard-tong-quan.png` có "Học sinh **91**"; `01-da-truong-tong-quan.png` có "Số trường **3** /
  3 trường đang quản lý" + phạm vi `Tất cả trường được phân quyền (3)`. → khớp, đúng nguồn, version đã gỡ. ✅

### Không hồi quy

- **8 heading:** đủ, đúng thứ tự, text giống nhau ở cả 4 file. ✅
- **§4 "Ảnh minh hoạ" + §8 mapping:** mọi tên file khớp thật trong `screenshots/` (glob 22/22). §4 CRM 4 dòng / LMS 4 dòng /
  DentGo 4 dòng / HRM 4 dòng; mỗi năng lực trỏ ≥1 ảnh. ✅
- **Không phát sinh claim mới thiếu căn cứ khi viết lại §1** — mọi tên riêng/con số **mới thêm** trong các cảnh báo đều
  verify được trên ảnh đã đọc:
  - HRM `:27` "email dùng domain `ntavietnam.tech`" → `02-employee-profile.png` có `minhanh.nguyen@ntavietnam.tech` ✅;
    "ảnh tổ chức còn hiển thị tên 'Công ty NTA'" → `04-org-structure.png` hiển thị `Công ty NTA / 248 nhân viên` ✅.
  - HRM `:20-21` "248 nhân viên / 4 khối" + "Kinh doanh 96 · Kỹ thuật 61 · Marketing 48 · Hành chính & Tài vụ 43",
    hợp đồng "186 / 44 / 18" → `04-org-structure.png` khớp số 96/61/48/43 và 186/44/18 ✅; NV-0012 Nguyễn Minh Anh –
    Trưởng phòng Kinh doanh → `02` ✅.
  - LMS `:16` "tên tài khoản quản trị demo (ví dụ Nguyễn Thanh Hà)" → `01`/`02` hiển thị `Nguyễn Thanh Hà` ✅.
  - DentGo `:14` "248 hồ sơ; 6 bệnh nhân mẫu" → `02-ho-so-khach-hang.png` có `248 hồ sơ` + 6 dòng ✅.
  - ✅ Kết luận: không phát hiện claim mới bịa.

### [MINOR-3] (mới, mang tính trình bày) HRM nhãn khối lệch nhẹ giữa §1 và ảnh

- **File:** `docs/reference/hrm-mock/README.md:20-21`.
- §1 ghi "248 nhân viên / **4 khối**" và "Hành chính **& Tài vụ** 43"; ảnh `01-employee-directory.png` ghi "4 **phòng ban**",
  ảnh `04-org-structure.png` ghi "4 khối" và nhãn khối là "**Hành chính**" 43. Số liệu khớp hoàn toàn, chỉ lệch nhãn.
- **Ảnh hưởng:** không sai lệch dữ liệu, chỉ mỹ từ. **Đề xuất (không chặn):** thống nhất "phòng ban/khối" và bỏ "& Tài vụ"
  cho khớp nhãn ảnh.

### [MINOR-4] (mới, mang tính trình bày) DentGo banner vs §1 khác cách gọi "hệ thống thật"

- **File:** `docs/reference/dentgo-smile/README.md:3` ("hệ thống đang chạy thật") vs `:8` ("hệ thống **demo** đang chạy thật").
- Không mâu thuẫn thực chất (môi trường demo nhưng vẫn là hệ thống chạy thật) và §1 đã làm rõ "demo"; chỉ là wording.
  **Đề xuất (không chặn):** đồng bộ 1 cách gọi.

### [MINOR-5] (carry-over, độ tin thấp) thông tin tài khoản demo không thấy trong ảnh đã đọc

- **File:** `docs/reference/lms-ismartschool/README.md:11` (`dieuhanh.lientruong`),
  `docs/reference/dentgo-smile/README.md:12` (`admin@demo1` / `123456`).
- Không thấy trong ảnh round-3 đọc (có thể ở màn login không nằm trong bộ ảnh). Không mâu thuẫn ảnh và **đã được cảnh báo
  đừng public** ở dòng warning tương ứng → chấp nhận được; chỉ là claim chưa verify độc lập. Không chặn.

## Bảng acceptance (từ change file)

| # | Tiêu chí | Kết quả |
|---|---|---|
| 1 | 4 file dùng cùng bộ 8 heading, đúng thứ tự | ✅ **PASS** (đọc cả 4 file) |
| 2 | Mỗi file có bảng mapping `.mdx` + liệt kê đủ ảnh + thứ tự đề xuất | ✅ **PASS** (glob 22/22 khớp) |
| 3 | Mỗi "năng lực chính" trỏ ≥1 ảnh cụ thể trong `screenshots/` | ✅ **PASS** (mọi path tồn tại thật) |
| 4 | Không còn "bản đồ chức năng N mục / M nhóm" ở §2 & §6 | ✅ **PASS** (0 occurrence) |
| 5 | Không bịa tên khách hàng / KPI / năm triển khai | ✅ **PASS** — claim "đã ẩn danh" sai của round-2 đã được thay bằng mô tả đúng + cảnh báo redact; mọi tên riêng/con số mới đều khớp ảnh đã đọc |
| 6 | `hrm-mock/README.md` vẫn cảnh báo mockup rõ | ✅ **PASS** (banner đầu file `:3-12` + lặp ở §1/§2/§7/§8; `highlights` để trống) |
| 7 | Không sửa file ngoài `docs/reference/**` (git diff chỉ 4 README) | ⚠️ **Không xác minh độc lập được** — shell bị permission-deny (không retry). Glob xác nhận `docs/reference/**` chỉ có 4 README + `boxai/README.md` + ảnh (không file lạ), nhưng không thể tự kiểm diff toàn repo → **Residual risk** |

## Skill gates

- `aislop` — `skip, docs-only (không có code change)`.
- `oxlint` / anti-slop — `skip, no TS/JS change`.
- `ocr` (open-code-review) — `skip, no code change`.
- AI-readable gate — ✅ **OK**: docs rõ ràng, self-descriptive, có heading/mapping; không có AI-chaos indicator trong diff
  (không tên mơ hồ, không magic number vô nghĩa, không comment WHAT).
- ai-friendly-web — `N/A` (change này nội bộ, không public-facing).
- blitzstrike — `N/A` (không phải STRICT auth/API/input).
- Responsive Checklist Gate — `N/A` (không đụng route/component/CSS; diff docs-only).

## Residual risk

1. **Acceptance #7 chưa verify độc lập** (shell bị deny toàn session) — cần primary chạy `git status --short` /
   `git diff --stat -- docs/reference` để chốt "chỉ 4 README".
2. **Chưa rà hết 22 ảnh** — round-3 đọc trực tiếp 10 ảnh (CRM `01,02,05`; HRM `01,02,04`; LMS `01,02`; DentGo `01,02`).
   Chưa đọc: CRM `03,04`; HRM `03,05`; LMS `03–07`; DentGo `03–05`. Build tool cap đọc (NORMAL) đã đạt; nếu cần chắc
   chắn tuyệt đối về PII trong các ảnh còn lại, cần user xác nhận thủ công.
3. **Bản gốc 3 README untracked không truy hồi được** (không có backup) → không diff trực tiếp để loại trừ "bịa thêm";
   round-3 bù bằng đối chiếu ảnh (10 ảnh).

## Verdict

✅ **PASS** (NORMAL)

- MAJOR-1 round-2 **đã được xử lý đúng**: CRM §1 mô tả đúng thực tế ảnh + cảnh báo redact đích danh, không còn mô tả ngược.
- MINOR-1 (title trung tính) và MINOR-2 (LMS version/số liệu) **đã xử lý** đủ; cả 4 file có ghi chú title trung tính ở §8.
- **Không hồi quy**: 8 heading giữ nguyên đúng thứ tự; §4/§8 khớp 22/22 ảnh thật; không phát sinh claim mới thiếu căn cứ
  (mọi tên riêng/số liệu mới trong cảnh báo đều khớp ảnh đã đọc).
- Chỉ còn MINOR trình bày (MINOR-3/4) và claim tài khoản demo chưa verify (MINOR-5) — **không đủ điều kiện FAIL**.
- Acceptance #7 không xác minh độc lập được do **shell permission-deny** (đã ghi Residual risk, không phải lỗi của diff).

**Không có file nguồn/docs nào bị sửa bởi reviewer.** Chỉ ghi report này (`.context/review-reports/`).
