# Spec Validation — feature/hero-wide-screen-backdrop (CR-041) · phase 1

Agent: spec-validator (inline, chạy bởi change-request — như CR-040)
Spec: R-01b (SPECIFICATIONS.md 4.9.0) · scope v59 · task 01 (cd37ff0)

| Acceptance (change doc / R-01b 4.9.0) | Evidence | Kết quả |
|---|---|---|
| ≥ 1920: không còn mảng trắng trơn lớn hai bên hero | Ảnh `.context/review-reports/cr-041-screens/hero-vi-1920/2560/3840.png`: phải nền teal mờ nối ảnh, trái thành phố mờ dưới lớp phủ (builder + reviewer đã xem) | PASS |
| Không có đường cắt cứng ở cạnh stage | Mask 2 cạnh ảnh nét (30%/88%), quét độ sáng ±6px quanh mép stage 1920/2560 không có bước nhảy (builder); reviewer xác nhận bằng ảnh | PASS |
| Mép chữ = khung 1280, chữ dễ đọc | h1 left 112/352/672/1312 ở 1440/1920/2560/3840 = (W−1280)/2+32, lệch 0px; lớp phủ trắng kéo ra mép trái màn | PASS |
| Ảnh/panel không méo, không tải nặng hơn đáng kể | Khung ảnh/panel giữ aspect 1787/880, số đo như CR-040; ảnh mờ `sizes=640px` lazy, không tải ở ≤ 1440, > 1440 tối đa thêm `w=640` | PASS |
| ≤ 1440 + mobile/tablet giữ nguyên; vi + en | 1440: khung 95.7–1440, panel 707.3–1406.4, cao 662 = CR-040; mọi class mới gắn `min-[1441px]`; HeroMobileImage/Hero.tsx không trong diff; en 1920 số đo = vi | PASS |
| Không scroll ngang | scrollWidth = clientWidth 1024–3840 | PASS |

Gap: không. Residual: 3840 hai bên không đối xứng (phải teal, trái gần trắng do lớp phủ chữ) — chủ ý, cần user duyệt bằng mắt.

**Verdict: PASS**
