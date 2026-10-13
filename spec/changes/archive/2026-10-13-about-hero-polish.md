---
id: about-hero-polish
type: feature
status: done
created: 2026-10-13
done: 2026-10-14
commit: d76caa2
---

# Trang /about: ảnh tòa Kim Hoàn mờ viền như mẫu + thẻ Sứ mệnh/Tầm nhìn bị cắt

## Yêu cầu
Tiếp CR-014 (`2026-10-13-about-page-redesign.md`). Ảnh hiện trạng: `../assets/2026-10-13-about-hero-polish/actual-bug.webp`;
mockup: `../assets/2026-10-13-about-page-redesign/mockup-about.webp`.

1. **MODIFY (UI)** — Ảnh tòa Kim Hoàn ở hero: bỏ khung thẻ bo góc + bóng; viền ảnh **mờ/tan dần (blur/fade) vào nền**
   như mockup (ảnh tràn về mép phải, mép trái/dưới hoà vào nền gradient mint).
2. **BUG** — Khối "Sứ mệnh của chúng tôi": đầu các thẻ Sứ mệnh / Tầm nhìn / Giá trị cốt lõi bị che (mất viền trên),
   và dưới hàng chỉ số hero có khoảng trắng thừa lớn.

## Bối cảnh / tái hiện (bug)
- Màn/route/role: `/about`, `/en/about`, desktop (~1240px), khách.
- Expected: thẻ hiện đủ viền + bo góc; hero không có khoảng trống thừa.
- Actual: dải nền hero phủ lên đầu khối Sứ mệnh.
- Root cause (đã xác định): `src/components/about/AboutHero.tsx:28` — `<HeroWaves className="h-[720px]" />` là lớp absolute
  cao cố định 720px, hero thực tế thấp hơn → lớp nền tràn ra dưới hero. Wrapper `relative isolate` (positioned) vẽ ĐÈ lên
  `<Section>` kế tiếp (không positioned) → che đầu thẻ + tạo vùng trắng (fade `to-[#f7fbfb]`).

## Acceptance (bắt buộc)
- [x] Ảnh tòa nhà viền mờ tan vào nền như mẫu (desktop); mobile vẫn hiển thị ảnh gọn, không tràn ngang.
- [x] Thẻ Sứ mệnh/Tầm nhìn/Giá trị cốt lõi hiện đủ viền ở 375/768/1280px; không còn khoảng trắng thừa dưới hero.
- [x] Không ảnh hưởng ListingHero/DetailHero (dùng chung HeroWaves).
- [x] Build / typecheck / lint PASS.

## Kết quả (CR-015 · 14/10/2026)
- Task: `tasks/feature-about-hero-polish/phase-1-task-01.md` · commit `d76caa2` · Reviewer round 1 PASS (NORMAL).
- Spec: không đổi requirement R-04a → giữ `spec_version` 3.10.0; test-scope v38 (`bug-fix`).
