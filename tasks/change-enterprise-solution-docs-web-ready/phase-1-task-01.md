# phase-1-task-01 — Viết lại 4 README giải pháp theo hướng "web-ready content source"

**Change file (nguồn sự thật):** `spec/changes/2026-10-10-enterprise-solution-docs-web-ready.md`
**Work item:** `change-enterprise-solution-docs-web-ready`
**Slug:** `change-enterprise-solution-docs-web-ready`

## Classification / Risk

- **Change type:** MODIFY (docs-only — viết lại nội dung tham chiếu; không đổi behavior web, không đụng code/schema).
- **Scope:** 4 file, CHỈ trong `docs/reference/{hrm-mock,crm-dragon-hotpot,lms-ismartschool,dentgo-smile}/README.md`.
- **Expected review level:** NORMAL (docs-only, không shared/API/auth/schema; builder tự đối chiếu acceptance).
- **Blast radius:** Không có (docs không được render lên web; đây là nguồn nội dung cho change `.mdx` sau).
- **Doc impact:** Chính 4 README này (as-built reference docs). Không đụng API_SPEC/ERD/DESIGN.
- **Decision impact:** Định hướng nội dung (web-ready) cho change sau đưa ảnh lên web; không đổi requirement.

## Mục tiêu

Viết lại 4 file README mô tả giải pháp theo kiểu **nguồn nội dung đưa lên web** (builder copy thẳng sang `.mdx`),
thay cho kiểu "tài liệu kỹ thuật nội bộ" (bản đồ 13/60/70 chức năng, 13 trạng thái đơn hàng, từng nút hồ sơ RHM).

## Inputs (đọc trước khi viết)

- `spec/changes/2026-10-10-enterprise-solution-docs-web-ready.md` — yêu cầu + acceptance (nguồn sự thật).
- 4 README hiện tại (nguồn nội dung để **rút gọn**, không bịa thêm):
  - `docs/reference/hrm-mock/README.md`
  - `docs/reference/crm-dragon-hotpot/README.md`
  - `docs/reference/lms-ismartschool/README.md`
  - `docs/reference/dentgo-smile/README.md`
- `src/content/types.ts` → interface `Solution` (field thật: `title`, `description`, `features[]`, `benefits[]`,
  `category`, `useCases[]`, `sections[]{title,intro?,items?}`, `highlights[]{value,label}`, `faq[]{question,answer}`,
  `image`, `screenshots[]`, `relatedCases[]`, `renderExtendedContent`).
- Ảnh thật trong `screenshots/` (đã liệt kê bên dưới — KHÔNG tự đoán tên file khác).

## Deliverables (4 file)

1. `docs/reference/hrm-mock/README.md`
2. `docs/reference/crm-dragon-hotpot/README.md`
3. `docs/reference/lms-ismartschool/README.md`
4. `docs/reference/dentgo-smile/README.md`

## Cấu trúc bắt buộc — CÙNG MỘT BỘ 8 HEADING, CÙNG THỨ TỰ, Ở CẢ 4 FILE

Mỗi file: 1 dòng H1 tiêu đề sản phẩm, rồi đúng 8 heading cấp 2 sau (text y hệt nhau giữa 4 file):

```
## 1. Metadata
## 2. Positioning — sản phẩm này là gì
## 3. Vấn đề khách hàng gặp
## 4. Giải pháp — năng lực chính
## 5. Tích hợp & bám văn bản pháp quy
## 6. Use case theo quy mô/ngành
## 7. Câu hỏi thường gặp
## 8. Bảng mapping sang schema `.mdx`
```

### §1 Metadata — nội dung cần có

- Nguồn ảnh (URL hệ thống thật **hoặc** mockup), ngày chụp/dựng, viewport, theme, ngôn ngữ, tài khoản demo (nếu có).
- Ghi chú ảnh tiếng Việt; trang `/en` dùng chung ảnh (chấp nhận được).
- Nếu là mockup (HRM): **giữ cảnh báo mockup rõ ràng ngay đầu file** — NTA chưa có dự án HRM thật, toàn bộ là mô phỏng,
  phải thay bằng ảnh thật khi có hệ thống. `highlights` để trống.
- Nếu là ảnh hệ thống thật (CRM/LMS/DentGo): ghi rõ dữ liệu trong ảnh đã ẩn danh/mô phỏng (theo README cũ).
- Có thể gom "bộ dữ liệu/số liệu dùng trong ảnh" (dữ liệu provenance) vào §1 — chi tiết kỹ thuật chỉ được giữ ở đây và §4.

### §2 Positioning — sản phẩm này là gì

- 1–2 câu, viết kiểu khách hàng đọc, nêu rõ **khác biệt cốt lõi** so với sản phẩm cùng loại phổ biến.
- **KHÔNG** liệt kê tên module/chức năng.

### §3 Vấn đề khách hàng gặp

- 3–4 **tình huống cụ thể** trước khi có hệ thống (bảng tính rời, trao đổi qua Zalo/email, không biết ai đang chờ duyệt…).
- Đây là phần mở đầu của `sections` đầu tiên (dùng làm `sections[0].intro`).

### §4 Giải pháp — năng lực chính

- **3–4 năng lực chính** (đúng số lượng đã chốt bên dưới). Mỗi năng lực: 1 tiêu đề + 2–3 dòng giải thích.
- **Kèm cột "Ảnh minh hoạ"** trỏ tới file thật trong `screenshots/` (không tự đoán tên).

### §5 Tích hợp & bám văn bản pháp quy

- CRM/LMS/DentGo: liệt kê hệ tích hợp / văn bản pháp quy (POS, Zalo OA, BHYT, TT27/TT70…).
- HRM: ghi rõ **không áp dụng** (mockup, chưa có tích hợp/văn bản nào được kiểm chứng).

### §6 Use case theo quy mô/ngành

- 4–5 mục, viết theo **tình huống cụ thể** ("doanh nghiệp 200–1000 nhân viên…", "chuỗi 3–20 chi nhánh…"),
  KHÔNG dùng label ngắn ("Phòng khám nha khoa").

### §7 Câu hỏi thường gặp

- 4 câu, trả lời **trung tính**, không cam kết số liệu chưa xác nhận, không bịa.

### §8 Bảng mapping sang schema `.mdx`

- Bảng: từng khối trong README → field tương ứng trong `src/content/types.ts`.
- Bảng/danh sách **toàn bộ ảnh `screenshots/` + thứ tự đề xuất**.
- Mapping chuẩn dùng cho cả 4 file:

  | Khối trong README | Field `Solution` | Ghi chú |
  |---|---|---|
  | H1 tên sản phẩm | `title` | |
  | §2 Positioning | `description` | 1–2 câu hero + meta |
  | §3 Vấn đề | `sections[0].intro` | mở đầu section đầu |
  | §4 Năng lực | `features[]` (mỗi năng lực = 1 phần tử "Tiêu đề — mô tả") và `sections[0].items[]` | 3–4 năng lực |
  | §4 ảnh minh hoạ | `screenshots[]` | theo thứ tự đề xuất |
  | §5 Tích hợp/pháp quy | `sections[1]` (`title` + `items[]`) | HRM: bỏ trống/không áp dụng |
  | §6 Use case | `useCases[]` | 4–5 mục |
  | §7 FAQ | `faq[]` | 4 câu |
  | §2/§4 kết quả | `benefits[]` | 2–3 outcome ngắn |
  | số liệu | `highlights[]` | **để trống** (chờ user xác nhận con số hiển thị công khai) |
  | cờ render | `renderExtendedContent` | `true` (để trang enterprise render sections/useCases/faq) |

## Năng lực + ảnh minh hoạ đã chốt (theo ảnh thật trong `screenshots/`)

### HRM (mockup) — 5 ảnh
1. **Danh bạ nhân sự tập trung** → `01-employee-directory.png`
2. **Hồ sơ nhân sự** → `02-employee-profile.png`
3. **Quy trình đề xuất & phê duyệt** → `03-request-workflow.png`
4. **Cơ cấu tổ chức & tra cứu đội ngũ** → `04-org-structure.png`, `05-people-lookup.png`

Nguồn nội dung: README cũ §2 (danh bạ/quy trình/tổ chức/tra cứu) — chỉ mô tả **năng lực dự kiến**, không suy diễn thêm.
§5 của file mới: Không áp dụng. `highlights` để trống.

### CRM Dragon Hot Pot — 5 ảnh
1. **Tổng quan vận hành hằng ngày** → `01-tong-quan.png`
2. **Hồ sơ khách hàng 360° + phân hạng** → `02-khach-hang.png`, `03-chi-tiet-khach-hang.png`
3. **Quản lý đặt bàn theo chi nhánh** → `04-dat-ban.png`
4. **Quản lý đơn hàng & đối soát doanh thu** → `05-don-hang.png`

§5 tích hợp: CụcCuk POS · Zalo OA · Cục gọi.

### iSmartSchool LMS — 7 ảnh
1. **Quản trị đa trường & bảng điều khiển** → `01-da-truong-tong-quan.png`, `02-dashboard-tong-quan.png`
2. **Hồ sơ học sinh – phụ huynh – nhân sự** → `03-hoc-sinh.png`
3. **Đánh giá học sinh theo TT27** (kèm AI gợi ý nhận xét) → `04-danh-gia-tt27.png`
4. **Điều hành giảng dạy: thời khoá biểu · giáo án · học bạ số** → `05-thoi-khoa-bieu.png`, `06-giao-an-dien-tu.png`, `07-hoc-ba-so.png`

§5: TT27/2020 · TT70/2026 · Liên thông CSDL ngành.

### DentGo Smile — 5 ảnh
1. **Tổng quan ca làm đa chi nhánh** → `01-tong-quan.png`
2. **Hồ sơ khách hàng & hồ sơ RHM/EMR liên thông** → `02-ho-so-khach-hang.png`, `03-ho-so-rhm.png`
3. **Lịch hẹn & chăm sóc khách** → `04-lich-hen.png`
4. **Kho vật tư – thuốc gắn vào điều trị** → `05-kho-vat-tu.png`

§5: Zalo OA · SMS · Labo ngoài · Hoá đơn điện tử/thuế · BHYT/mã thuốc QG.

## Ràng buộc nội dung (bắt buộc — vi phạm = FAIL)

- CRM/LMS/DentGo: ảnh hệ thống chạy thật → được mô tả năng lực cụ thể, nhưng **TUYỆT ĐỐI không bịa**
  tên khách hàng, số liệu KPI, năm triển khai, chứng nhận, case study. Chỉ dùng số liệu **đã có trong README cũ**
  (để ở §1 provenance), không thêm số mới.
- HRM: giữ cảnh báo mockup; không suy ra năng lực chưa kiểm chứng; không thêm số liệu; `highlights` trống.
- KHÔNG dùng kiểu "bản đồ chức năng N mục / M nhóm" ở §2 và §6. Không liệt kê từng nút/bảng/module chi tiết ở §2/§6.
- Ảnh tiếng Việt; `/en` dùng chung ảnh (ghi chú trong docs).
- Cột "ảnh minh hoạ" và bảng mapping **chỉ dùng tên file có thật** trong `screenshots/` (đã liệt kê ở trên).

## Ngoài phạm vi (KHÔNG làm)

- KHÔNG sửa `src/content/solutions/**` (`.mdx`).
- KHÔNG sửa `docs/reference/boxai/README.md`.
- KHÔNG copy ảnh, KHÔNG đụng `public/`.
- KHÔNG đụng `package-lock.json` (dirty sẵn — nhiễu).
- CHỈ stage/đổi 4 file README nói trên.

## Acceptance Criteria (từ change file)

- [ ] Cả 4 file dùng **cùng một bộ 8 heading**, đúng thứ tự ở trên.
- [ ] Mỗi file có bảng mapping sang schema `.mdx`, liệt kê đủ ảnh `screenshots/` + thứ tự đề xuất.
- [ ] Mỗi "năng lực chính" trỏ được tới ≥1 ảnh cụ thể trong `screenshots/`.
- [ ] Không còn kiểu liệt kê "bản đồ chức năng N mục / M nhóm" ở §2 & §6.
- [ ] Không có tên khách hàng / số liệu KPI / năm triển khai bịa thêm ở bất kỳ file nào.
- [ ] `hrm-mock/README.md` vẫn cảnh báo rõ đây là mockup, không phải sản phẩm đang chạy.
- [ ] Không sửa file ngoài `docs/reference/**` (git diff chỉ có 4 README).

## Verification Plan

- Docs-only → **không** chạy `npm run build` / `lint` / `typecheck` (ghi `skip, no code change`).
- Verify = đọc lại 4 file; đối chiếu §4 với danh sách file thật trong `screenshots/`; kiểm 8 heading khớp giữa 4 file;
  xác nhận `git status --short` **chỉ** có 4 README (ngoài các file dirty có sẵn).
- Lệnh gợi ý: `git status --short`, `git diff --stat -- docs/reference`.

## Retry / Error Memory

- attempt 0. (docs-only, không có error memory dự kiến)

## Doc / Decision Impact

- Cập nhật 4 reference README (as-built nội dung). Không đổi `docs/API_SPEC.md` / `docs/ERD.md` / `docs/DESIGN.md`.
- Không đổi requirement → `spec_version` giữ 3.0.0 (spec-publisher ghi delta + scope, không bump).

## Feature Verification

- **Round-2 findings addressed:** CRM §1 now distinguishes the customer data visible in screenshots from the still-visible Dragon Hotpot brand, branch/location names and administrator email; a prominent redact-before-publication warning enumerates data to mask. LMS removed the unsubstantiated product version and parent-account count, labels visible counts as demo-image provenance, and warns about its system URL and displayed personal names. DentGo now qualifies its mock-data assertion and warns against public disclosure of its demo URL/credentials and visible personal/clinical identifiers. HRM mockup metadata now warns about the visible NTA contact/name details. CRM/LMS/DentGo §8 retains the current H1 as an internal document name and recommends neutral public `title` values.
- **Acceptance criteria:** pending primary/reviewer confirmation; heading and image mapping checks performed after edits (see below).
- **Verify commands + result:** docs-only → **skip, no code change** for lint/typecheck/build.
  - Read all 4 README files and all 22 screenshots; no source/system URL appears embedded in the HRM images. CRM, LMS and DentGo screenshots contain the brands/system identities and personal/demo data described by the new warnings.
  - §4 image names and §8 screenshot mapping compared against actual `screenshots/` contents: HRM 5, CRM 5, LMS 7, DentGo 5.
  - Confirmed the required 8 headings retain their names and order in all 4 documents.
- **Residual risk:** The visible CRM/LMS/DentGo details must be redacted and the fictitious status of remaining data confirmed before public publication. DentGo README still documents demo access credentials; do not copy them into public content. Git status already contains unrelated dirty/untracked files from the primary workflow; do not infer the full workspace scope from this builder diff.
- **Reviewer verdict:** pending round-3; round-2 report `.context/review-reports/change-enterprise-solution-docs-web-ready-phase-1-task-01-round-2-review.md` was FAIL and findings addressed for independent re-review.

### Ghi chú cho change `.mdx` sau (từ review)

- MINOR-1: H1/title CRM giữ tên tham chiếu "Dragon Hot Pot" → nếu trang public không muốn lộ tên khách, đổi `title` ở `.mdx` sau.
- MINOR-2: con số trong §1 là mốc provenance; `highlights` để trống — chỉ bật khi có số liệu user xác nhận.
- MINOR-3: 1 năng lực có thể trỏ nhiều ảnh; §8 đã liệt kê đủ thứ tự.
