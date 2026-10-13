# Review — feature-ai-box-bao-ha-case-study · phase-1-task-01 · round 1

**Agent:** reviewer (vai reviewer chạy trong phiên change-request, Cowork) · **Level:** NORMAL · **Verdict:** PASS

## Scope
Diff: 2 MDX case study mới (vi/en), 4 ảnh `public/images/cases/bao-ha/*`, 2 dòng `src/content/listings.ts`,
đoạn Bảo Hà + `relatedCases` ở `src/content/solutions/{vi,en}/boxai.mdx`. Không đụng component/API/schema.

## Checks
| Hạng mục | Kết quả |
|---|---|
| Acceptance change doc CR-012 | PASS — đủ block showcase, ảnh camera thật, 4 chức năng, số liệu đã chốt |
| Quyết định user (không chip, không số liệu vận hành, hero ảnh thật, cập nhật BoxAI) | PASS — grep không có `Jetson`/`BM1684`/`Sophgo` trong 2 MDX mới; không có số cảnh báo/tỷ lệ báo giả |
| BR-004 (không bịa số) | PASS — chỉ 3 AI Box / 48 camera / 24/7 + số lượt khách ghi nguồn Báo Lào Cai; pillar "Giá trị mang lại" có `note` nói rõ là năng lực, không phải số đo |
| Riêng tư ảnh | PASS — mặt người ở `ai-detection.jpg` (Sân phủ chúa) và `shrine.jpg` (gian thờ) đã làm mờ; OSD chữ Trung + vết chụp màn hình đã cắt |
| Type/schema MDX | PASS — field khớp `CaseStudyShowcase`; icon node `camera/ai/vms`, icon stats/features thuộc `ShowcaseIcon` |
| Anchor CTA hero | PASS — `#giai-phap` (vi) / `#solution` (en) khớp `technology.id` |
| SEO | PASS — title, canonical đúng; sitemap có route mới (vi/en) |
| Responsive | PASS — Playwright overflowX = 0 ở 1440 và 390, vi + en |
| Regression | PASS — `/case-studies/oc-eo-learning`, `/case-studies`, `/solutions/ai/boxai` 200 |
| Không gộp file ngoài task | PASS — phần FridayAI đã được phiên khác commit (`12243e3`) trước khi stage |
| Verify | typecheck PASS · lint 0 error (1 warning cũ `src/components/mdx/index.tsx`) · build PASS (`tools/linux-build.sh verify`, chạy lại sau khi sửa câu chữ hero) |

## Findings
- (fixed trong round) Câu mô tả hero EN "detects fire, fights, restricted-area intrusion and counts people early" sai ngữ pháp → sửa vi/en.
- (nit, không chặn) Icon `challenge` (tam giác cảnh báo) dùng cho thẻ Báo cháy/Ẩu đả — chấp nhận được, chưa có icon lửa riêng.
- (nit) Khối case study liên quan cuối trang BoxAI giờ trỏ Bảo Hà thay vì Óc Eo (chỉ render `relatedCases[0]`) — đúng ý user (case triển khai thật ưu tiên); Óc Eo vẫn ở `/solutions/ai`.

## Residual risk
- Mô tả thuật toán lấy từ brief user cung cấp, chưa đối chiếu cấu hình box thật.
