---
id: ai-box-bao-ha-case-study
type: feature
status: done                        # close-out 2026-10-13
created: 2026-10-13
---

# Case study mới: AI Box tại đền Bảo Hà (layout showcase như Óc Eo)

## Yêu cầu
User (2026-10-13): "trong đây là hình ảnh và thông tin về AI box, làm cho t 1 phần case study về cái AI box này đi"
(kèm file zip: 1 brief nội dung + 4 ảnh chụp camera thật tại đền).

Thêm 1 case study mới `/case-studies/<slug>` (vi + en), dùng `layout: showcase` có sẵn (như `oc-eo-learning`,
`dental-clinic-operations`), nội dung bám brief: Hero (3 chỉ số) → Thách thức → Giải pháp → Kết quả kỳ vọng →
Công nghệ (thuật toán AI, kiến trúc camera → AI Box → dashboard, cảnh báo minh hoạ) → Thư viện ảnh → Tầm nhìn → CTA.
Nút trong khối Giải pháp/Hero mở trang giải pháp BoxAI (`/solutions/.../boxai` — kiểm tra route thật khi làm).

## Input
- Brief: `spec/changes/assets/2026-10-13-ai-box-bao-ha-case-study/brief-case-study-bao-ha.md`
- Ảnh camera thật (đã đổi tên):
  - `cam-01-san-chinh.png` — sân chính, lư hương (Kênh 1, 29/08/2026)
  - `cam-02-tam-quan-noi-san.png` — Tam Quan Nội – Sân
  - `cam-03-san-phu-chua-ai-detect.png` — Sân phủ chúa, có marker AI nhận diện người (13/10/2026)
  - `cam-04-gian-tho.png` — trong gian thờ

## Acceptance
- [x] Trang `/case-studies/<slug>` + `/en/...` render showcase, desktop 1440 + mobile 390 không tràn ngang.
- [x] Có thẻ case study mới ở trang danh sách `/case-studies` (cover + bộ lọc đúng ngành).
- [x] Ảnh camera được dùng ở carousel Công nghệ / thư viện ảnh; tối ưu dung lượng (webp/jpg), alt tiếng Việt/Anh.
- [x] BR-004: không bịa số liệu — chỉ dùng số đã chốt (3 AI Box, 48 camera, 4 chức năng) + số liệu báo có nguồn; bỏ mọi mục **[cần xác nhận]** còn lại.
- [x] Số liệu 136.000+ / 300.000 lượt khách ghi nguồn Báo Lào Cai.
- [x] tsc + eslint + build PASS · Reviewer PASS · spec delta + publish.

## Đã chốt với user (2026-10-13)
1. Trạng thái: **đã triển khai** → nhãn Hero "Triển khai · 2026"; bỏ câu "chưa phải số liệu đo được sau triển khai", giữ ý "kết quả mục tiêu" nhưng không gọi là đề xuất.
2. Quy mô: **3 AI Box, 48 camera** → chỉ số Hero thứ 2 = "3 AI Box · 48 camera".
3. Chức năng đang bật: **báo cháy, phát hiện đánh nhau (ẩu đả), xâm nhập vùng cấm, đếm người** → bảng thuật toán chỉ giữ 4 dòng này (+ 2 lớp nền detection/tracking). Bỏ: báo khói, vượt tuyến, lảng vảng, phá hoại camera.
4. **Được** nêu tên đền Bảo Hà và đăng ảnh camera thật.
5. Số liệu vận hành: **không đưa vào** → bỏ đoạn placeholder số liệu, không thêm mục này.
6. Ảnh Hero: **dùng ảnh camera thật** (đề xuất `cam-01-san-chinh` hoặc `cam-02-tam-quan-noi-san` — không có người rõ mặt); không tạo ảnh minh hoạ AI.

## Ghi chú
- Riêng tư (vẫn áp dụng dù được phép đăng): `cam-03` và `cam-04` thấy rõ người (có người đang lễ trong gian thờ) → làm mờ mặt trước khi đăng;
  ảnh có timestamp/OSD camera ("Kênh1", ngày giờ, chữ Trung) → cân nhắc crop/che. `cam-04` chụp gần ban thờ → brief
  khuyên không chụp cận cung cấm, nên hỏi user có dùng không.
- Ảnh có dashboard nội bộ (apibaoha) nếu dùng phải che IP/tên miền.
- Tái dùng component showcase hiện có (ShowcaseTechnology hỗ trợ `screen`/`alerts`); bảng thuật toán có thể cần
  block mới (ShowcaseFeatures/ShowcaseDetails?) — agent phân tích khi `/change`.

## Close-out (2026-10-13)
- Slug `ai-box-bao-ha` · ảnh `public/images/cases/bao-ha/` (hero = Tam Quan Nội, mặt người đã làm mờ) · không nêu tên chip (user chọn).
- Trang BoxAI: đoạn Bảo Hà cập nhật 3 AI Box · 48 camera · 4 chức năng; `relatedCases` ưu tiên `ai-box-bao-ha`.
- Task: `tasks/feature-ai-box-bao-ha-case-study/phase-1-task-01.md` · review PASS · spec 3.7.0 → 3.8.0 · test-scope v34.
