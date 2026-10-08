# Reverse spec — 2026-10-08

**Nguồn:** docs scan (KHÔNG phải code — repo chưa có app code: `source_roots: []`)
**Người chạy:** `/spec-init` (primary thực thi prompt-level `.agent/spec-init.md`)
**Spec version:** 1.0.0 · scopeVersion: 1 · risk: high

## Phạm vi

Reverse-engineer `SPECIFICATIONS.md` từ docs canonical (`docs/INDEX.md`):

- `BRIEF.md` — mô tả dự án, NFR, stack
- `docs/BRD.md` — FR-001…FR-080, NFR, business rules, roles, open questions
- `docs/DESIGN.md` — screen inventory (route/components/states), responsive behavior
- `docs/API_SPEC.md` — POST /api/contact, GET /api/health, GET /api/posts|case-studies
- `docs/ERD.md` — v1 không DB; entity cấp khái niệm (file nội dung)
- `docs/PERMISSION.md` — roles, guard order, route matrix
- `.context/project-config.md` — deploy/CI-CD/db_tool

**Kết quả:** 27 requirement (R-01…R-27), 0 module bị sót so với BRD (9 module + API + NFR + deploy).

## Điểm `[cần xác nhận]`

1. Logo NTA + brand color chính thức (`docs/BRD.md:173`)
2. Hotline / email / địa chỉ thật (`docs/BRD.md:174`)
3. Danh sách sản phẩm & case study ưu tiên (`docs/BRD.md:175`)
4. Form liên hệ gửi về đâu (`docs/BRD.md:176`)
5. Blog CMS hay tĩnh (`docs/BRD.md:177`)
6. Package manager + verify commands (`package_manager: none`)

## Lưu ý

- Chưa validate code (không có code để cross-check) → spec-validator bước tiếp validate spec **vs docs**.
- Khi app code được dựng (Layer 0/1) → đối chiếu lại R-xx với code; mâu thuẫn → code thắng, cập nhật qua `/change`.
- `risk: high` vì chưa có test/app code nào.
