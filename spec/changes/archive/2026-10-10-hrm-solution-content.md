# Change: Bổ sung nội dung + hình ảnh cho trang giải pháp HRM

- **Ngày:** 2026-10-10
- **Loại:** ADDITIVE (nội dung + asset), kèm MODIFY nhỏ (render infra dùng chung)
- **Trigger:** user yêu cầu — trang HRM hiện chưa có mô tả chi tiết và chưa có hình ảnh vì dự án không có sản phẩm thật.

## 1. Hiện trạng

Trang `/solutions/enterprise/hrm` render:

- PageHeader (title + `description` 1 câu)
- FeatureList (3 mục)
- BenefitList (2 mục)
- ScreenshotSection → **không render** (`hrm.mdx` không có field `screenshots`)
- RelatedSolutions → không render (không có `relatedCases`)

`useCases` có trong MDX nhưng **component `UseCases` không được gọi** ở trang enterprise (chỉ trang AI có).
`sections`, `faq` chưa có data và chưa được render ở trang enterprise.

→ Trang HRM hiện rất "trắng": 3 tính năng + 2 lợi ích + ảnh placeholder 1 dòng. Không có phần mô tả giải pháp.

## 2. Yêu cầu đã chốt (user)

| # | Quyết định |
|---|---|
| Q1 | Phạm vi: **trang chi tiết HRM** (`/solutions/enterprise/hrm`) |
| Q2 | Kiểu ảnh: **mockup giao diện** — NTA chưa có dự án HRM thật nên phải dựng giả |
| Q3 | "Mô tả" = **mô tả dự án/giải pháp HRM** (không phải caption từng ảnh) |
| Q4 | Số lượng: **5 ảnh** |
| Q5 | Lưu theo convention của repo: `docs/reference/<slug>/` + copy sang `public/` |
| Q6 | Side-effect: **chỉ HRM** được hiện nội dung mở rộng, CRM/LMS/DentGo giữ nguyên |

## 3. Thay đổi

### 3.1 Tài liệu tham khảo (mới) — `docs/reference/hrm-mock/`

Theo đúng convention của `crm-dragon-hotpot` / `lms-ismartschool` / `dentgo-smile` / `boxai`:

- `README.md` — mô tả mô phỏng, **ghi rõ đây là mockup chứ không phải ảnh chụp sản phẩm chạy thật**,
  kèm danh sách việc còn lại khi có sản phẩm thật.
- `screenshots/` - 5 file PNG (bản SVG nguồn không commit, xem README §4).

Vì đây là nội dung dự kiến (chưa đối chiếu hệ thống thật), README **phải cảnh báo** không được
coi là năng lực sản phẩm đã xác nhận.

### 3.2 Asset trang (mới) — `public/images/solutions/hrm/`

Copy 5 ảnh từ `docs/reference/hrm-mock/screenshots/` (PNG 2400×1500, xuất từ SVG vẽ tay):

1. `01-employee-directory.png` — bảng danh sách nhân sự (filter + bảng + cột trạng thái)
2. `02-employee-profile.png` — hồ sơ nhân sự chi tiết (tab, thông tin, lịch sử công tác)
3. `03-request-workflow.png` — quy trình đề xuất/phê duyệt (4 bước + danh sách chờ)
4. `04-org-structure.png` — cơ cấu tổ chức / phòng ban (sơ đồ cây + headcount)
5. `05-people-lookup.png` — tra cứu đội ngũ theo phòng ban / loại hợp đồng

Yêu cầu asset: giao diện tiếng Việt, dùng palette design token (`--color-primary #0071e3`, `#1d1d1f`,
`#d2d2d7`, `#f5f5f7`), dấu tiếng Việt phải render đầy đủ. Bộ dữ liệu mô phỏng dùng chung xuyên
suốt 5 ảnh (xem `docs/reference/hrm-mock/README.md` §5) để các màn hình khớp nhau.

### 3.4 Nội dung (`src/content/solutions/{vi,en}/hrm.mdx`)

- `description`: viết lại thành mô tả giải pháp đầy đủ hơn (1 câu, phục vụ cả hero lẫn meta description).
- `screenshots`: 5 path ảnh mới.
- `useCases`: mở rộng 2 → 5 mục.
- `sections`: 4 mục mô tả giải pháp (intro + items), theo đúng shape
  `{ title, intro?, items? }` đã có trong `src/content/types.ts`.
- `faq`: 4 câu hỏi thường gặp.

**Ràng buộc nội dung (quan trọng):** dự án **không có sản phẩm HRM thật** để đối chiếu. Vì vậy:
- KHÔNG bịa tên khách hàng, số liệu, số năm triển khai, chứng nhận, hay case study cụ thể.
- KHÔNG thêm `highlights` (dạng số liệu) vì bắt buộc phải có con số thật.
- Chỉ mô tả **năng lực/nguyên tắc** ở mức phổ biến của một hệ thống quản trị nhân sự, bám sát
  3 `features` đã có sẵn trong file (hồ sơ nhân sự · quy trình đề xuất · tra cứu đội ngũ).
- Cảnh báo mockup phải nằm trong `docs/reference/hrm-mock/README.md`, không được ở trang công khai.
- Copy này cần user review lại trước khi lên production.

### 3.3 Render infra (`src/app/[locale]/solutions/enterprise/[slug]/page.tsx`)

Thêm vào main column, theo đúng thứ tự trang AI đang làm (pattern đã được review PASS ở
`change-ai-solution-content-phase-1-task-01`):

```
FeatureList
→ BenefitList
→ SolutionSections   (mới)
→ UseCases            (mới — component đã có sẵn, chưa ai gọi ở enterprise)
→ FaqList             (mới)
→ ScreenshotSection   (đã có, giờ có data)
```

**Cờ opt-in `renderExtendedContent`** (mới trong `Solution`): ba khối `SolutionSections` / `UseCases` /
`FaqList` chỉ nhận data khi `solution.renderExtendedContent === true`, chỉ HRM bật.

Lý do phải có cờ thay vì để component tự `return null` khi data rỗng: **CRM / LMS / DentGo đã có
sẵn `useCases` trong MDX** nhưng trước đó chưa được render. Bật chung sẽ làm 3 trang đó đổi giao diện
ngoài phạm vi đã chốt. Nhóm `ai` luôn render các khối này và không dùng cờ.

### 3.5 i18n

Thêm key vào `solutions.enterprise` (cả `vi.json` và `en.json`):
`useCasesTitle`, `faqTitle`. Copy chữ dựa trên key cùng nhóm ở `solutions.ai`.

## 4. Ngoài phạm vi

- CRM / LMS / DentGo vẫn chưa có screenshots + mô tả (user chọn phạm vi HRM).
- Không đổi type `Solution.screenshots` (giữ `string[]`) vì không cần caption từng ảnh.
- Không đổi `next.config.ts` (SVG qua `next/image` đã chạy sẵn toàn site).

## 5. Verify

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- Visual check: `/solutions/enterprise/hrm` (vi + en), `/solutions/enterprise/crm` (đảm bảo không đổi)