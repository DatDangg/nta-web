# Spec Update — 2026-10-14 about-remove-capabilities-team

**spec_version:** 3.11.0 → 3.12.0 (MINOR — sửa R-04, bỏ một phần R-04a; user chọn MINOR)
**Trigger:** feature-update · change `about-remove-capabilities-team` (CR-020, REMOVE UI)

## Requirements
- **SỬA R-04:** trước: "Đủ 5 khối: sứ mệnh, năng lực, team, milestones (timeline), đối tác". Sau: trang có sứ mệnh/giá trị,
  con người NTA, milestones (timeline), đối tác, CTA. Khối **Năng lực** và **Đội ngũ** `[DEPRECATED 3.12.0]` — đã gỡ khỏi code.
- **SỬA R-04a:** khối Con người NTA **không còn** nút outline "Tìm hiểu thêm về đội ngũ →" (trước cuộn tới `#team`).
  Thứ tự trang: Hero · Giá trị · Con người NTA · Hành trình phát triển · Đối tác · CTA.

## Lý do
User yêu cầu "bỏ cái năng lực với đội ngũ trong cái về NTA đi" (CR-020). Nút `#team` sẽ thành anchor chết → user chọn bỏ nút.

## Thay đổi code
- `src/app/[locale]/about/page.tsx` — bỏ `CapabilityGrid`, `TeamGrid`, biến `team`.
- `src/components/about/AboutPeople.tsx` — bỏ link `#team` + import `ListingIcon`.
- Xoá `src/components/about/CapabilityGrid.tsx`, `src/components/about/TeamGrid.tsx`, `public/images/about/team-ai.svg`, `public/images/about/team-domain.svg`.
- `src/content/types.ts` (`AboutData` bỏ `capabilities`, `team`), `src/lib/content/about.ts` (required fields), `src/content/about/{vi,en}/about.mdx` (frontmatter).
- `src/i18n/messages/{vi,en}.json` — bỏ `about.capabilitiesTitle`, `about.teamTitle`, `about.team`, `about.imageFallback`, `about.people.cta`.

## Ảnh hưởng / test
- `/about`, `/en/about`: không còn heading "Năng lực"/"Capabilities", "Đội ngũ"/"Our team", không `id="team"`, không link `#team`.
- Các khối còn lại giữ thứ tự + giao diện; metadata + breadcrumb JSON-LD không đổi. Không trang khác dùng các component/key đã xoá.

## Doc reconcile
- `docs/DESIGN.md` Screen Về NTA (components), `.context/design-spec.md` Screen /about (ghi chú CR-020).
- `docs/BRD.md` FR-010 đã sửa khớp R-04 (user duyệt 2026-10-14).
