# Spec Update — 2026-10-10 enterprise-solution-docs-web-ready

**spec_version:** 3.0.0 → 3.0.0 (**KHÔNG bump — không đổi requirement/behavior**)
**Trigger:** feature-update (change-request, class MODIFY docs-only)
**Change:** `spec/changes/archive/2026-10-10-enterprise-solution-docs-web-ready.md` (MODIFY, risk LOW)

## Requirements

- **KHÔNG thêm/sửa/xoá requirement nào.** `SPECIFICATIONS.md` (27 req R-01…R-27) không tham chiếu `docs/reference/**`;
  change này chỉ viết lại 4 file tài liệu tham chiếu, **không đổi hành vi web** và không đụng code/schema.

**Lý do KHÔNG bump `spec_version`:** không thay đổi requirement/scope/behavior. Đây là bổ sung nội dung nguồn
(web-ready) cho change `.mdx` sau. Theo `docs/SPEC_VERSIONING.md`, PATCH chỉ để "làm rõ requirement" — không áp dụng.
Vẫn ghi `spec/updates/` + CHANGELOG + test-scope để test loop nắm vùng vừa đụng (đối xứng precedent
`change-cleanup-gcp-drift-comment-permission`).

## Thay đổi (docs-only)

4 file `docs/reference/*/README.md` viết lại theo **cấu trúc 8 heading web-ready** (Metadata · Positioning ·
Vấn đề khách hàng gặp · Giải pháp — năng lực chính · Tích hợp & bám văn bản pháp quy · Use case theo quy mô/ngành ·
Câu hỏi thường gặp · Bảng mapping sang schema `.mdx`):

- `docs/reference/hrm-mock/README.md` (mockup — giữ cảnh báo, `highlights` trống)
- `docs/reference/crm-dragon-hotpot/README.md`
- `docs/reference/lms-ismartschool/README.md`
- `docs/reference/dentgo-smile/README.md`

Mỗi file có cột "Ảnh minh hoạ" trỏ tới file thật trong `screenshots/` + bảng mapping khối → field `Solution`
(`features`/`benefits`/`useCases`/`sections`/`faq`/`screenshots`/`highlights`/`renderExtendedContent`).
Bỏ kiểu "bản đồ chức năng N mục / M nhóm" ở positioning & use case.

## Ảnh hưởng

- **Module:** không có (docs tham chiếu nội bộ, không được render).
- **Ngoài phạm vi (giữ nguyên):** `src/content/solutions/**` (`.mdx`), `docs/reference/boxai/README.md`, `public/**`.
- **Change sau (chưa làm):** đưa ảnh CRM/LMS/DentGo lên web + thêm `screenshots` vào `.mdx`; copy 3 ảnh BoxAI + `public/`.

## Ghi nhận

- Verify docs-only: `skip, no code change` cho lint/typecheck/build; thay bằng đối chiếu 8 heading + danh sách ảnh thật.
- Reviewer round-1 = **PASS NORMAL** (0 CRITICAL/MAJOR, 3 MINOR non-blocking). Caveat: review inline do env chặn
  spawn subagent lồng → primary nên re-run reviewer độc lập.

**Test scope:** `spec/test-scope/current.json` → `trigger: feature-update`, `scopeVersion` 8 → 9, `risk: low`
(không có bề mặt runtime cần test).
