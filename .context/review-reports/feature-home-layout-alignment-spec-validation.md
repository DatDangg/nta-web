# Spec Validation — feature/home-layout-alignment (CR-040) · phase 1

Agent: spec-validator (inline, chạy bởi change-request — như CR-039)
Spec: R-01b (SPECIFICATIONS.md 4.8.0) · scope v58 · tasks 01 (96afa0a) + 02 (4759a15)

| Acceptance (change doc / R-01b) | Evidence | Kết quả |
|---|---|---|
| Mọi section + header + footer chung khung, mép thẳng hàng mọi breakpoint (≤ 2px) | DOM đo task 01: logo, h1, tiêu đề + thẻ đầu/cuối Giải pháp/Sản phẩm/Case, CTA, footer = 32/112/352 (1280/1440/1920), phải 1248/1328/1568; 1024/768/375 = 32/24/16; lệch 0px | PASS |
| Không section dùng max-width riêng / khung lồng hẹp | grep `max-w-[1400px]`, `max-w-[1040px]` trong src/: 0 kết quả (reviewer task 01) | PASS |
| Màn 1440–1920+ cân đối, ảnh hero không dính mép phải, cao ≤ 662px | DOM task 02: ảnh kết thúc (W+1440)/2 (1680 @1920, 2000 @2560) kể cả khi zoom (overflow-hidden), cao 662, panel không đè chữ | PASS |
| ≤ 1440 hero như cũ; < lg không đổi | 1440: ảnh 95.7–1440, panel 707–1406 như trước; HeroMobileImage không trong diff | PASS |
| Mobile/tablet không vỡ, không đổi nội dung/hành vi | scrollWidth = clientWidth 375–2560; carousel R-03a/R-03b, R-02a giữ nguyên (reviewer) | PASS |
| vi + en | Số đo vi `/` và en `/en` giống nhau | PASS |

Gap: không. Ghi chú: h1 cap 4.46rem (= giá trị ở 1440) là hệ quả của R-01b "bố cục chữ ↔ ảnh như ở 1440" — không cần spec delta.
Residual: nhánh carousel > 3 thẻ chưa đo DOM (prod hiện 3 thẻ); dải trắng hai bên stage ở màn ≥ 2560 cần user duyệt bằng mắt.

**Verdict: PASS**
