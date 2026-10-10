# Review — change-enterprise-solution-docs-web-ready · phase-1-task-01 · round-2 (độc lập)

Agent: reviewer

- **Task:** `tasks/change-enterprise-solution-docs-web-ready/phase-1-task-01.md`
- **Change file:** `spec/changes/archive/2026-10-10-enterprise-solution-docs-web-ready.md` (đã archive, vẫn là spec của task)
- **Review level:** `NORMAL`
- **Reason:** Docs-only (4 file `docs/reference/*/README.md`), không đụng code/shared/API/auth/schema/migration → không thuộc diện STRICT.
  Round-2 chạy **độc lập** (khác session change-request của round-1) và mở rộng verify sang **đọc trực tiếp ảnh screenshot** để kiểm tính trung thực + rủi ro lộ danh tính khách hàng.
- **Blast radius:** Docs không được render lên web. Ảnh hưởng gián tiếp: 4 README này là **nguồn nội dung** cho change `.mdx` kế tiếp (đưa ảnh CRM/LMS/DentGo lên trang public) → sai lệch trong docs có thể lan sang trang public.
- **Round-1:** `...phase-1-task-01-round-1-review.md` — PASS (NORMAL), caveat "chạy inline, primary nên re-run độc lập".
  Round-2 **phủ định một phần** kết luận đó (xem MAJOR-1) sau khi kiểm bằng chứng ảnh.

## Verify commands + result

| Check | Cách chạy | Result |
|---|---|---|
| `git status --short` (scope) | `shell` | ❌ **Blocked** — `Permission denied: shell` (session reviewer bị deny toàn bộ shell). Không retry (Tool Loop Guard). Acceptance #7 **không xác minh độc lập được** → Residual risk. |
| `git show HEAD:docs/reference/hrm-mock/README.md` (bản gốc) | `shell` | ❌ **Blocked** (cùng lý do). 3 dir còn lại untracked → bản gốc không truy hồi được (không có backup trong `docs/reference`, không có bản sao trong `spec/changes/archive/`). |
| Ảnh có thật & khớp tên file | `Glob docs/reference/**/*` | ✅ Khớp **100%**: HRM 5 · CRM 5 · LMS 7 · DentGo 5. Mọi path trong cột "Ảnh minh hoạ" §4 + bảng §8 đều tồn tại thật, không có tên bịa. |
| Nội dung bị cấm ("bản đồ chức năng", "N mục/M nhóm", "13 trạng thái") | `Grep` trong `docs/**` | ✅ 0 match. |
| Tên khách hàng trong `src/content/solutions/**` | `Grep dragon\|iSmartSchool\|DentGo` | Chỉ có `dentgo.mdx` (slug/image/title chuẩn) — không lộ tên khách. |
| Schema field thật | `Read src/content/types.ts` | ✅ Mọi field §8 trỏ tới (`title, description, features, benefits, useCases, sections{title,intro?,items?}, highlights, faq, screenshots, renderExtendedContent`) đều tồn tại. |
| Cờ render + thứ tự render | `Read src/app/[locale]/solutions/enterprise/[slug]/page.tsx` | ✅ `extended = renderExtendedContent === true` (dòng 62) gate `sections`/`useCases`/`faq` (dòng 72-74); `features`/`benefits`/`screenshots` luôn render. `highlights` **không** được render ở trang enterprise. |
| Tính trung thực nội dung (đối chiếu ảnh thật) | `Read` 7 ảnh PNG | ⚠️ Xem Findings. Số liệu §1 khớp ảnh (CRM 2627/132 + 7435/372; LMS 91; DentGo 248 + 6 dòng) — **trung thực**. Nhưng claim ẩn danh (CRM §1) **mâu thuẫn ảnh**. |
| lint / typecheck / build | — | `skip, no code change` (docs-only). |
| Test | `.context/project-config.md: test: null` | `skip, no test framework configured`. |

## Findings

### [MAJOR-1] CRM `README.md` §1 khẳng định đã ẩn danh — nhưng ảnh screenshot cho thấy điều ngược lại; rủi ro lộ danh tính khách hàng ở change `.mdx` kế tiếp

- **File:** `docs/reference/crm-dragon-hotpot/README.md:12`
- **Câu trong docs:** *"toàn bộ tên khách, số điện thoại, ngày sinh, **tên chi nhánh**, email quản trị và mã khách CụcCuk đã được thay bằng dữ liệu demo giả."*
- **Bằng chứng ảnh (đọc trực tiếp):**
  - `docs/reference/crm-dragon-hotpot/screenshots/02-khach-hang.png` và `05-don-hang.png`: cột **CHI NHÀNH** hiển thị `Dragon Hot Pot Nguyễn Huệ`, `Dragon Hot Pot Võ Văn Tân`; `01-tong-quan.png` hiện `Dragon Hot Pot Lê Duẩn` → **tên chi nhánh KHÔNG bị thay** (và là chi nhánh thật của chuỗi, brand `Dragon Hotpot — Sichuan · Riverside` hiển thị nguyên ở sidebar mọi ảnh).
  - Góc dưới sidebar (`01/02/05`): `admin@ntacrm.vn` vẫn đọc được (chỉ phủ một thanh mờ, không thay bằng dữ liệu giả) → claim "email quản trị đã thay" **không đúng**.
  - Số điện thoại khách trong `02-khach-hang.png` (`0903 214 875`, `0918 336 502`, …) là dạng số VN trông thật; **không có bằng chứng** chúng là bịa.
- **Đánh giá mức độ:** MAJOR vì đây là **tài liệu provenance** mà change `.mdx` sau sẽ dựa vào để publish ảnh lên trang công khai. Một claim "đã ẩn danh" sai có thể khiến builder kế tiếp xuất bản ảnh còn chứa logo thương hiệu khách, tên chi nhánh, email quản trị (`ntacrm.vn`) và (chưa xác minh) dữ liệu khách thật.
- **Đề xuất fix (docs-only, nhỏ):**
  1. Sửa §1 CRM cho **đúng thực tế**: nêu rõ mục nào đã thay (tên khách/SĐT/… nếu có bằng chứng) và mục nào **không** (logo thương hiệu, tên chi nhánh, email admin).
  2. Ghi thêm yêu cầu "trước khi đưa lên web phải **che/redact** logo thương hiệu + tên chi nhánh + email admin và xác nhận dữ liệu khách là giả" (handoff cho change `.mdx`).
  3. Nếu giữ nguyên ảnh, bắt buộc user xác nhận công khai tên khách hàng (xem MINOR-1).

### [MINOR-1] H1 → `title` đẩy tên khách hàng lên trang public (`Dragon Hot Pot CRM`)

- **File:** `docs/reference/crm-dragon-hotpot/README.md:1` + mapping `:76`; render `src/app/[locale]/solutions/enterprise/[slug]/page.tsx:67` (PageHeader) và `:66` (breadcrumb JSON-LD).
- H1 = "Dragon Hot Pot CRM" và §8 map H1 → `title`. `title` render công khai ở hero + breadcrumb → **rò tên khách hàng**. (`metadata.title` thì dùng `enterpriseBrandNames` = "CRM", nên chỉ tiêu đề tab là an toàn — xác nhận qua `page.tsx:21-26,37-38`.)
- (Round-1 đã ghi MINOR-1 dạng này — xác nhận lại độc lập, giữ nguyên không đổi.)
- **Đề xuất:** ở change `.mdx` sau, đặt `title` trung tính ("CRM chuỗi F&B nhà hàng") và giữ tên tham chiếu chỉ trong docs; `description` (§2) hiện **không** chứa tên khách nên OK.

### [MINOR-2] LMS §1 nêu "Phiên bản hiển thị trên sản phẩm: iSmartSchool LMS v2.4 · Multi-tenant Cloud Platform" — không thấy trong ảnh

- **File:** `docs/reference/lms-ismartschool/README.md:10`
- Không xuất hiện trong `01-da-truong-tong-quan.png` và `02-dashboard-tong-quan.png` (2/7 ảnh đã đọc). Có thể nằm ở màn hình login (không có trong bộ ảnh) → **chưa chứng minh được**.
- **Đề xuất:** bỏ, hoặc ghi rõ nguồn (màn hình nào), hoặc chỉ giữ "đa trường (multi-tenant)" vốn đã thấy trong ảnh ("Không gian liên trường", "3 trường đang quản lý").

### [MINOR-3] LMS §1 "30 tài khoản phụ huynh" chưa đối chiếu được

- **File:** `docs/reference/lms-ismartschool/README.md:14`
- Chỉ đọc mẫu 2 ảnh LMS; con số này không có trong đó (sẽ ở màn "Phụ huynh"). Không phải lỗi, nhưng là claim chưa verify.

### Ghi nhận tích cực (để rõ round-2 không chỉ soi lỗi)

- **Trung thực số liệu:** CRM §1 `2.627 / 132 trang` (ảnh `02-khach-hang.png`) và `7.435 / 372 trang` (ảnh `05-don-hang.png`); LMS §1 `91 học sinh` (ảnh `03-hoc-sinh.png` "Tổng số: 91 học sinh" và `02-dashboard` "Học sinh 91"); DentGo §1 `248 hồ sơ` + "6 bệnh nhân mẫu hiển thị" (ảnh `02-ho-so-khach-hang.png`) — **tất cả khớp ảnh**, đúng nhãn "mốc provenance".
- **HRM:** cảnh báo mockup giữ nguyên ở đầu file (`README.md:3-12`) + lặp ở §1/§4/§7; `highlights` để trống (§1 `:25`, §8 `:93`); không có KPI/khách hàng/năm triển khai bịa; §5 ghi "Không áp dụng" → đúng ràng buộc mockup.
- **Mô tả năng lực khớp ảnh:** CRM năng lực 1 khớp `01-tong-quan` (4 KPI + "Đặt bàn sắp tới" + "Sinh nhật tuần này"); năng lực 2 khớp bộ lọc hạng thành viên + "mức độ quan tâm OA" (`02`); năng lực 4 mô tả "vòng đời trạng thái đầy đủ" chung chung, **không** liệt kê 13 trạng thái (đúng yêu cầu). DentGo năng lực 1 khớp đúng 6 chỉ số + bộ lọc chi nhánh của `01-tong-quan`.
- **Đồng nhất 4 file:** cùng 1 bộ 8 heading, cùng thứ tự, cùng độ sâu (đều có §2-§8, §4 bảng 4 dòng, §7 4 câu FAQ); chỉ khác phần "banner" đầu file (HRM: cảnh báo mockup bắt buộc; 3 file kia: 2 dòng giới thiệu) — chấp nhận được.
- **Mapping §8 ↔ schema:** tên field + ngữ nghĩa khớp `src/content/types.ts`; `renderExtendedContent: true` mô tả đúng hành vi gate ở `page.tsx:62,72-74`.
- **Không còn kiểu "bản đồ chức năng N mục / M nhóm"** ở §2/§6 (grep = 0).

## Bảng acceptance (từ change file)

| # | Tiêu chí | Kết quả |
|---|---|---|
| 1 | 4 file dùng cùng bộ 8 heading, đúng thứ tự | ✅ PASS |
| 2 | Mỗi file có bảng mapping `.mdx` + liệt kê đủ ảnh + thứ tự đề xuất | ✅ PASS |
| 3 | Mỗi "năng lực chính" trỏ ≥1 ảnh cụ thể trong `screenshots/` | ✅ PASS (đối chiếu Glob: HRM 5 · CRM 5 · LMS 7 · DentGo 5, khớp 100%) |
| 4 | Không còn "bản đồ chức năng N mục / M nhóm" ở §2 & §6 | ✅ PASS (grep = 0) |
| 5 | Không bịa tên khách hàng / KPI / năm triển khai | ⚠️ PASS một phần — không phát hiện bịa; **nhưng** claim "đã ẩn danh" ở CRM §1 sai/mâu thuẫn ảnh (MAJOR-1) và 1 claim version LMS chưa chứng minh (MINOR-2) |
| 6 | `hrm-mock/README.md` vẫn cảnh báo mockup rõ | ✅ PASS |
| 7 | Không sửa file ngoài `docs/reference/**` (git diff chỉ 4 README) | ⚠️ **Không xác minh độc lập được** — shell/git bị permission-deny. Glob cho thấy `docs/reference/**` chỉ gồm 4 README + `boxai/README.md` + ảnh (không có file lạ), nhưng không thể phát hiện thay đổi ngoài `docs/reference` → Residual risk |

## Skill gates

- `aislop` — `skip, docs-only (không có code change)`.
- `oxlint` / anti-slop — `skip, no TS/JS change`.
- `ocr` (open-code-review) — `skip, no code change`.
- AI-readable gate — ✅ OK (docs rõ ràng, self-descriptive, không có AI-chaos indicator trong diff).
- ai-friendly-web — `N/A` (change này không public-facing; docs nội bộ).
- blitzstrike — `N/A` (không phải STRICT nhạy cảm auth/API).
- Responsive Checklist Gate — `N/A` (không đụng route/component/CSS; không có thay đổi UI trong diff).

## Residual risk

1. **Acceptance #7 chưa verify độc lập** (shell bị chặn) — cần primary chạy `git status --short` / `git diff --stat` để chốt "chỉ 4 README".
2. **Không truy hồi được bản gốc** của 3 README untracked → không thể diff trực tiếp để loại trừ "bịa thêm"; round-2 bù bằng đối chiếu ảnh (7/22 ảnh đọc trực tiếp).
3. **Chưa rà toàn bộ 22 ảnh** — các ảnh chưa đọc: CRM `03,04`; LMS `04,05,06,07`; DentGo `03,04,05`; HRM cả 5 (mockup). Nếu cần chắc chắn về PII trong ảnh, cần user xác nhận thủ công.

## Verdict

❌ **FAIL** (NORMAL) — 1 **MAJOR** (MAJOR-1: claim ẩn danh ở CRM §1 mâu thuẫn với ảnh thật → rủi ro lộ danh tính khách hàng khi change `.mdx` kế tiếp publish ảnh), cùng MINOR-1/2/3.

**Kết luận độc lập:** cấu trúc + độ đồng nhất + mapping schema + ràng buộc mockup HRM đều đạt; nhưng round-1 (chạy inline, chỉ đọc text) **bỏ sót** việc đối chiếu ảnh. Sau khi builder sửa MAJOR-1 (chỉ sửa câu §1 CRM + thêm ghi chú redact cho change sau) thì có thể PASS lại (round-3, không cần đổi cấu trúc 4 file).

**Không có file source/docs nào bị sửa bởi reviewer.** Chỉ ghi report này.
