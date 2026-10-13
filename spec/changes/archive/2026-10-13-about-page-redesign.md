---
id: about-page-redesign
type: feature
status: done
created: 2026-10-13
---

# Thiết kế lại trang "Về NTA" theo mockup

## Yêu cầu
Sửa lại trang `/about` (VI + `/en/about`) cho giống mockup `assets/2026-10-13-about-page-redesign/mockup-about.webp`:

1. **Hero 2 cột**: trái = breadcrumb pill (Trang chủ › Về NTA) + tiêu đề "Về **NTA**" (chữ NTA màu brand)
   + tagline lớn "Kiến tạo giá trị từ AI cho một tương lai thông minh hơn" + đoạn mô tả + hàng 3 chỉ số
   có icon (50+ Dự án triển khai · 30+ Đối tác doanh nghiệp · 99% Khách hàng hài lòng).
   Phải = **ảnh tòa nhà** — dùng ảnh thật `assets/2026-10-13-about-page-redesign/building-kim-hoan.webp`
   (tòa Kim Hoàn), không dùng ảnh tòa nhà AI trong mockup. Nền gradient xanh mint nhạt.
2. **Khối Sứ mệnh**: trái = eyebrow "Sứ mệnh của chúng tôi" + tiêu đề "Đưa AI vào thực tiễn, tạo **giá trị bền vững**";
   phải = 3 thẻ có icon: Sứ mệnh · Tầm nhìn · Giá trị cốt lõi (4 bullet: Đổi mới sáng tạo, Lấy khách hàng làm trung tâm,
   Chất lượng và hiệu quả, Phát triển bền vững).
3. **Khối Con người NTA**: trái = ảnh đội ngũ (user: "tạm dùng ảnh AI" — ảnh người trong mockup / ảnh AI tương đương),
   phải = eyebrow "Con người NTA" + tiêu đề "Chúng tôi tin vào sức mạnh của **con người và công nghệ**" + đoạn mô tả
   + nút outline "Tìm hiểu thêm về đội ngũ →".

## Acceptance (bắt buộc)
- [ ] Bố cục hero / sứ mệnh / con người khớp mockup ở desktop; responsive mobile (xếp 1 cột, không tràn ngang).
- [ ] Ảnh tòa nhà = ảnh Kim Hoàn thật (tối ưu webp/next/image, có alt VI/EN).
- [ ] Ảnh đội ngũ = ảnh AI tạm (ghi chú để thay ảnh thật sau).
- [ ] Đủ nội dung song ngữ VI + EN (i18n), metadata/breadcrumb JSON-LD giữ nguyên.
- [ ] Build / typecheck / lint PASS.

## Ghi chú
- Mockup chỉ thể hiện phần đầu trang → các khối hiện có bên dưới (Năng lực, Đội ngũ, Cột mốc, Đối tác, CTA)
  **cần chốt giữ hay bỏ** khi xử lý.
- Chỉ số 50+ / 30+ / 99% lấy từ mockup — **cần user xác nhận** là số liệu thật trước khi đưa lên site.
- Ảnh người AI: repo chưa có sẵn; phương án tạm = cắt từ mockup (độ phân giải thấp ~800×270, bị cắt đáy)
  hoặc user gửi ảnh AI riêng.
- Ảnh hưởng dự kiến: `src/app/[locale]/about/page.tsx`, `src/components/about/*`, `src/content/about/*`, messages i18n.

## Quyết định khi xử lý (mặc định do agent chọn, user có thể đổi)
> User gõ `/change` không trả lời 3 câu mở → agent chọn mặc định dưới đây (13/10/2026).
1. **Chỉ số 50+ / 30+ / 99%**: dùng đúng như mockup (mockup do user cung cấp); đặt trong i18n `about.stats`
   (`src/i18n/messages/{vi,en}.json`) để dễ sửa. ⚠️ Vẫn cần user xác nhận là số liệu thật.
2. **Khối hiện có**: GIỮ CapabilityGrid, TeamGrid, MilestoneTimeline, PartnerLogos, CTABanner bên dưới các khối mới.
   BỎ `PageHeader` + `MissionBlock` cũ (bị thay bởi hero + khối sứ mệnh mới, tránh trùng nội dung).
   TeamGrid giữ lại (khối "Con người NTA" là giới thiệu chung; nút "Tìm hiểu thêm về đội ngũ" cuộn tới TeamGrid `#team`).
3. **Ảnh đội ngũ AI tạm**: cắt vùng ảnh nhóm người từ mockup (x 80–880, y 746–1018) bằng `sharp` →
   `public/images/about/team-people-temp.webp`, hiển thị object-cover. **Ảnh tạm — thay ảnh thật sau.**
   Ảnh tòa Kim Hoàn thật → `public/images/about/building-kim-hoan.webp` (tối ưu webp).

## Kết quả (13/10/2026)
- Task `tasks/feature-about-page-redesign/phase-1-task-01.md` — commit `8853984`. Review NORMAL: round 1 FAIL (F1 tràn ngang khối Con người) → round 2 PASS.
- Spec 3.10.0 (R-04a) · test-scope v37. typecheck/lint/build PASS; smoke `/about`, `/en/about` 200.
- Còn chờ user: xác nhận số liệu 50+/30+/99%; thay ảnh đội ngũ thật (ảnh tạm 794×267 bị cắt 2 bên ở mobile).
