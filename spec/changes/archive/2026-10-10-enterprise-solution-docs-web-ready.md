---
id: enterprise-solution-docs-web-ready
type: feature
status: done
created: 2026-10-10
completed: 2026-10-10
---

# Viết lại docs mô tả 4 giải pháp doanh nghiệp theo hướng "web-ready content source"

## Yêu cầu

Viết lại 4 file `docs/reference/*/README.md` (HRM, CRM, LMS, DentGo) theo cấu trúc **nguồn nội dung
đưa lên web** thay vì tài liệu kỹ thuật nội bộ. Đây là bước tiền đề của change sau: đưa ảnh
lên web cho CRM / LMS / DentGo + thêm ảnh cho BoxAI (BoxAI đã có mô tả nhưng chưa có ảnh).

## Bối cảnh

Hiện trạng đã xác minh trên đĩa:

| Sản phẩm | Ảnh trong `public/images/solutions/` | Nội dung `.mdx` | Docs tham chiếu |
|---|---|---|---|
| HRM | ✅ 5 ảnh mockup | ✅ đầy đủ + `renderExtendedContent` | `hrm-mock/README.md` — viết kiểu internal note, có cảnh báo mockup |
| CRM | ✅ 5 ảnh | ❌ stub 17 dòng, không khai `screenshots` | `crm-dragon-hotpot/README.md` — kiểu tài liệu kỹ thuật |
| LMS | ✅ 7 ảnh | ❌ stub 17 dòng, không khai `screenshots` | `lms-ismartschool/README.md` — kiểu tài liệu kỹ thuật |
| DentGo | ✅ 5 ảnh | ❌ stub 17 dòng, không khai `screenshots` | `dentgo-smile/README.md` — kiểu tài liệu kỹ thuật |

**Vấn đề:** 4 docs kia viết theo kiểu "tài liệu tham chiếu cho dev" — bản đồ chức năng
13/60/70 mục, liệt kê 13 trạng thái đơn hàng, mô tả từng nút trên hồ sơ RHM. Đọc để hiểu sản
phẩm thì được, nhưng **không dùng được để đưa lên web**: khách hàng không đọc "13 trạng thái
đơn hàng", và copy nguyên sẽ thành trang kỹ thuật khó hiểu.

## Quyết định đã chốt (user)

| # | Quyết định |
|---|---|
| Q1 | Hướng: **web-ready content source** — docs viết sao cho builder có thể copy thẳng sang `.mdx` |
| Q2 | Phạm vi: **cả 4** (HRM + CRM + LMS + DentGo) |
| Q3 | Giữ cảnh báo mockup của HRM ở trong docs (không đưa lên trang công khai) |

## Thay đổi

### Cấu trúc mới cho mỗi `docs/reference/<slug>/README.md`

Mỗi file gồm 8 phần, cùng thứ tự, cùng tên heading — để đối chiếu song song giữa 4 sản phẩm:

1. **Metadata** — nguồn ảnh (URL hệ thống thật / mockup), ngày chụp, viewport, theme, tài khoản demo.
   Giữ cảnh báo mockup ngay đầu file nếu là mockup.
2. **Positioning — sản phẩm này là gì** — 1–2 câu, viết kiểu khách hàng đọc, nêu rõ khác biệt
   cốt lõi so với sản phẩm cùng loại phổ biến. KHÔNG liệt kê tên module.
3. **Vấn đề khách hàng gặp** — 3–4 dạng tình huống cụ thể trước khi có hệ thống (bảng tính rời,
   trao đổi qua Zalo/email, không biết ai đang chờ duyệt…). Đây là phần mở đầu của `sections` đầu tiên.
4. **Giải pháp — 3–4 năng lực chính** — mỗi năng lực 1 tiêu đề + 2–3 dòng giải thích, **kèm
   cột "ảnh minh hoạ"** trỏ tới file trong `screenshots/`. Đây là phần có giá trị nhất khi ảnh lên web.
5. **Tích hợp & bám văn bản pháp quy** (nếu có) — POS, Zalo OA, BHYT, TT27/TT70… (CRM, LMS, DentGo có; HRM không).
6. **Use case theo quy mô/ngành** — 4–5 mục, viết theo tình huống cụ thể ("doanh nghiệp 200–1000 nhân viên…")
   chứ không phải label ngắn ("Phòng khám nha khoa").
7. **Câu hỏi thường gặp** — 4 câu, trả lời trung tính, không cam kết số liệu chưa xác nhận.
8. **Bảng mapping sang schema `.mdx`** — từng khối trong docs → field tương ứng trong
   `src/content/types.ts` (`features`, `benefits`, `useCases`, `sections`, `faq`, `screenshots`),
   kèm danh sách ảnh và thứ tự đề xuất. Đây là phần để builder viết `.mdx` không phải tự suy.

### Ràng buộc nội dung (bắt buộc)

- **CRM / LMS / DentGo:** ảnh chụp từ hệ thống đang chạy thật → được phép mô tả năng lực cụ thể.
  Tuyệt đối **không** bịa tên khách hàng, số liệu KPI, năm triển khai, chứng nhận, case study.
- **HRM:** ảnh là **mockup tự dựng**, chưa có sản phẩm thật → giữ nguyên cảnh báo mockup ở §1 và
  không được suy ra năng lực chưa kiểm chứng. `highlights` (số liệu) vẫn để trống.
- Không liệt kê tên module/nút/bảng chi tiết ở phần positioning và use case — chỉ giữ ở phần
  "Metadata" và "năng lực" khi thật sự cần để minh hoạ.
- Ảnh là tiếng Việt; trang `/en` dùng chung ảnh (chấp nhận được, ghi chú trong docs).

### Ngoài phạm vi

- KHÔNG sửa `src/content/solutions/**` (`.mdx`) trong change này — đó là change sau.
- KHÔNG đụng `docs/reference/boxai/README.md` (BoxAI đã có mô tả đầy đủ trên web, chỉ thiếu ảnh).
- KHÔNG copy ảnh mới, KHÔNG đụng `public/`.

## Acceptance

- [ ] Cả 4 file `docs/reference/{hrm-mock,crm-dragon-hotpot,lms-ismartschool,dentgo-smile}/README.md`
      dùng **cùng một bộ 8 heading** theo đúng thứ tự nêu trên.
- [ ] Mỗi file có bảng mapping sang schema `.mdx` liệt kê đủ ảnh `screenshots/` kèm thứ tự đề xuất.
- [ ] Mỗi "năng lực chính" trỏ được tới ít nhất 1 ảnh cụ thể trong `screenshots/`.
- [ ] Không còn kiểu liệt kê "bản đồ chức năng N mục / M nhóm" ở phần positioning & use case.
- [ ] Không có tên khách hàng / số liệu KPI / năm triển khai bịa thêm ở bất kỳ file nào.
- [ ] `hrm-mock/README.md` vẫn cảnh báo rõ đây là mockup, không phải sản phẩm đang chạy.
- [ ] Không sửa file ngoài `docs/reference/**` (git diff chỉ có 4 README).

## Verify

- Docs-only → không cần `npm run build` / typecheck (ghi `skip, no code change` trong task).
- Đọc lại từng file, đối chiếu §4 với danh sách file thực tế trong `screenshots/`.

## Ghi chú

Change sau (chưa làm trong change này): đưa ảnh CRM/LMS/DentGo lên web + thêm `screenshots`
vào `.mdx`, và copy 3 ảnh BoxAI +o `.mdx` + `public/`. Cần user duyệt docs này trước.