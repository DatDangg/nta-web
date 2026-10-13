# Task 01: Case study mới AI Box tại đền Bảo Hà (showcase) + cập nhật đoạn Bảo Hà ở trang BoxAI (CR-012)

> Nguồn: CR-012 `spec/changes/2026-10-13-ai-box-bao-ha-case-study.md` · Spec: R-08b, R-08b.2 (mới), R-06b · BR-004

## Phase
1 — content (không đổi component)

## Type
ADDITIVE — case study mới `ai-box-bao-ha` (vi/en, `layout: showcase`) + ảnh camera thật; sửa nội dung đoạn Bảo Hà ở `boxai` (vi/en).

## Classification / Risk
- Change type: **ADDITIVE** (+ sửa content BoxAI theo số liệu user đã xác nhận) · Risk: **low**
- Review level: **NORMAL** (chỉ data MDX + ảnh tĩnh + 1 dòng listing; không đụng component/API/schema)
- Blast radius: `/case-studies/ai-box-bao-ha` (vi/en, mới), `/case-studies` (thẻ mới), `/solutions/ai/boxai` (đoạn Bảo Hà + thẻ case study liên quan đổi từ Óc Eo sang Bảo Hà), sitemap.

## Quyết định user (2026-10-13)
- Đã triển khai · 3 AI Box · 48 camera · chức năng bật: báo cháy, ẩu đả, xâm nhập, đếm người.
- Được nêu tên đền + đăng ảnh camera thật · không đưa số liệu vận hành · hero = ảnh camera thật.
- **Không nêu tên chip** (brief ghi Sophgo BM1684, trang BoxAI ghi NVIDIA Jetson → tránh mâu thuẫn).
- Cập nhật luôn đoạn "Triển khai thực tế tại Đền Bảo Hà" ở trang BoxAI + link sang case study.

## Files
- `src/content/case-studies/{vi,en}/ai-box-bao-ha.mdx` (MỚI)
- `public/images/cases/bao-ha/{hero,courtyard,ai-detection,shrine}.jpg` (MỚI — từ 4 ảnh camera user gửi; jpg q82;
  làm mờ mặt người ở `ai-detection` + `shrine`; `ai-detection` cắt bỏ dải OSD ngày giờ/chữ Trung phía trên + vết chụp màn hình phía dưới)
- `src/content/listings.ts` (thêm meta thẻ `ai-box-bao-ha` vi/en — chỉ 2 dòng của task này, phần FridayAI đang dở KHÔNG thuộc task)
- `src/content/solutions/{vi,en}/boxai.mdx` (đoạn Bảo Hà ×2 mỗi locale: 3 AI Box · 48 camera · 4 chức năng; `relatedCases` thêm `ai-box-bao-ha` lên đầu)

## Mapping block
- Hero (eyebrow "Triển khai · 2026", ảnh Tam Quan Nội, caption ảnh thật) · stats 3 AI Box / 48 camera / 24/7
- Pillars Thách thức (có số lượt khách + nguồn Báo Lào Cai) / Giải pháp đã triển khai / Giá trị mang lại (năng lực, không số đo) + `note` minh bạch
- Technology: nodes camera → AI Box → dashboard, `screen` = ảnh camera có marker AI, CTA → `/solutions/ai/boxai`
- Photos 4 ảnh thật (caption: ảnh thật, đã làm mờ mặt) · Vision + quote "Tầm nhìn của NTA cho dự án"
- Features = 2 lớp nền + 4 chức năng đang bật · Details = giảm báo giả + luồng xử lý sự kiện · CTA → `/contact`

## Acceptance Criteria
- [x] `/case-studies/ai-box-bao-ha` + `/en/...` 200, title `AI Box giám sát an toàn tại đền Bảo Hà | Case Study | NTA`, canonical đúng
- [x] 1440 + 390 không tràn ngang (overflowX = 0 cả vi/en); 4 ảnh 200
- [x] `/case-studies` (vi/en) có thẻ mới; sitemap có `ai-box-bao-ha`
- [x] `/solutions/ai/boxai` (vi/en) hiển thị số 3 AI Box · 48 camera và link case study Bảo Hà
- [x] BR-004: chỉ số đã xác nhận + số lượt khách có nguồn; không số liệu vận hành; không nêu chip
- [x] Riêng tư: mặt người trong ảnh đã làm mờ
- [x] typecheck PASS · lint 0 error (1 warning cũ `mdx/index.tsx`) · build PASS

## Verification summary
- `bash tools/linux-build.sh verify` (VM): typecheck PASS · lint PASS · build PASS
- `linux-build.sh serve` + curl: 8 route 200 (case study vi/en, /case-studies vi/en, boxai vi/en, oc-eo, sitemap), 4 ảnh 200
- Playwright (cloud, bản build cùng source): overflowX 0 ở 1440/390 vi+en; soát ảnh chụp full page
- Lưu ý: Playwright mặc định Accept-Language en → route `/case-studies/...` render EN (hành vi locale detect sẵn có, không thuộc task)

## Retry / Escalation
- Attempt 1 PASS. (≥3 fail → `architecture_review_needed`.)

## Residual risk
- Mô tả thuật toán (YOLO INT8, Kalman/Hungarian, pose) lấy từ brief user cung cấp, chưa đối chiếu cấu hình box thật.
- Ảnh camera ~1365px ngang: đủ cho layout hiện tại, không phải ảnh độ phân giải cao.

## Doc impact
- `SPECIFICATIONS.md`: thêm R-08b.2 (case study thứ 3 dùng showcase) + cập nhật R-06b / R-08a (số liệu Bảo Hà đã xác nhận) → MINOR.
- Không đổi API/ERD/DESIGN.
