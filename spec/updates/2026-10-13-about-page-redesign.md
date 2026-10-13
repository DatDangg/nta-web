# Spec Update — 2026-10-13 about-page-redesign
**spec_version:** 3.9.0 → 3.10.0 (MINOR)
**Trigger:** feature-update (CR-014, MODIFY + ADDITIVE UI)
**Requirements:** THÊM **R-04a** (Module 2 — Về NTA): thứ tự trang mới — (1) hero 2 cột: breadcrumb pill, H1 "Về **NTA**",
tagline, mô tả, 3 chỉ số có icon (50+ dự án · 30+ đối tác · 99% hài lòng — i18n `about.stats`, chờ user xác nhận số thật),
ảnh tòa Kim Hoàn thật (next/image, alt VI/EN); (2) khối sứ mệnh: eyebrow + H2 + 3 thẻ Sứ mệnh · Tầm nhìn · Giá trị cốt lõi (4 bullet);
(3) khối Con người NTA: ảnh đội ngũ AI tạm + H2 + mô tả + nút outline → `#team`; sau đó giữ năng lực, đội ngũ, cột mốc, đối tác, CTA (R-04).
PageHeader + MissionBlock cũ bỏ. Metadata + breadcrumb JSON-LD không đổi.
**Thay đổi code:** `src/components/about/{AboutHero,AboutValues,AboutPeople}.tsx` (mới), xoá `MissionBlock.tsx`, `TeamGrid.tsx` (`id="team"`),
`src/components/listing/icons.tsx` (+target/eye/gem), `src/app/[locale]/about/page.tsx`, `src/i18n/messages/{vi,en}.json`,
`public/images/about/{building-kim-hoan,team-people-temp}.webp` — commit `8853984`.
**Ảnh hưởng:** `/about`, `/en/about`. Không đổi API/schema/route.
**Nguồn:** `spec/changes/archive/2026-10-13-about-page-redesign.md`.
