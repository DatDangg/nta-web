---
id: about-remove-capabilities-team
type: feature
status: in_progress
created: 2026-10-14
---

# Trang Về NTA: bỏ khối "Năng lực" và "Đội ngũ"

## Yêu cầu
User: "bỏ cái năng lực với đội ngũ trong cái về NTA đi".
Gỡ 2 khối khỏi trang `/about` (vi + en):
- **Năng lực** — `CapabilityGrid` (`about.capabilitiesTitle`)
- **Đội ngũ** — `TeamGrid` (`about.teamTitle`, `id="team"`)

## Bối cảnh / tái hiện (bug)
- Màn/route/role: `/about`, `/en/about` — public
- Expected: trang chỉ còn Hero · Giá trị · Con người NTA · Hành trình phát triển · Đối tác · CTA

## Acceptance (bắt buộc)
- [x] `/about` và `/en/about` không còn khối "Năng lực"/"Capabilities" và "Đội ngũ"/"Team"
- [x] Các khối còn lại giữ nguyên thứ tự và giao diện
- [x] Nút "Tìm hiểu thêm về đội ngũ" trong khối Con người NTA (đang cuộn tới `#team`) không còn trỏ vào anchor chết — xử lý (bỏ nút / trỏ chỗ khác) khi `/change`
- [x] Dọn import/i18n key/data không còn dùng nếu không chỗ khác tham chiếu; build/typecheck/lint PASS

## Ghi chú
- Code: `src/app/[locale]/about/page.tsx:63-64`; `src/components/about/AboutPeople.tsx` (CTA `#team`).
- Đổi behavior trang → cần spec delta (R- của trang Về NTA) + spec-publish/test-scope.

## Kết quả (2026-10-14)
- Done: bỏ CapabilityGrid + TeamGrid, bỏ nút "Tìm hiểu thêm về đội ngũ" (PA: bỏ nút), dọn component/i18n/data/2 ảnh SVG team.
- Spec 3.11.0 → 4.0.0 (R-04, R-04a) · test-scope v42 · task `tasks/feature-about-remove-capabilities-team/phase-1-task-01.md` · review round 1 PASS.
- Còn mở: `docs/BRD.md` FR-010 (intent) vẫn ghi 5 khối — chờ user xác nhận sửa.
