---
id: ai-solution-content
type: feature
status: pending
created: 2026-10-09
---

# Add/Update nội dung Giải pháp AI (Talvra, Box AI, Flycam) + Case Study Óc Eo

## Yêu cầu

Bổ sung + cập nhật nội dung thật (content-driven) cho website NTA, gồm 3 phần:

### 1. Giải pháp AI — AI tùy chỉnh (Custom AI) = Talvra
- Trang "AI tùy chỉnh" (thuộc Module 4: Giải pháp AI, `FR-030`) dùng **context Talvra** làm nội dung chính.
- Nguồn context:
  - `projects/talvra/GAMMA_PROMPT_TALVRA_OVERVIEW.md` — nội dung giới thiệu non-technical (tiếng Anh, phù hợp làm cả bản VI/EN)
  - `projects/talvra/README.md` — thông tin nền tảng, template bot (support/sales/ecommerce), channels (Zalo/Telegram/KioskViet), cách thức triển khai nhanh
- Nội dung cần có: Talvra là platform tạo trợ lý AI riêng cho doanh nghiệp; 3 template assistant; triết lý "start small, start real"; lợi ích (lên sóng nhanh, đa kênh, con người kiểm soát); use case / pilot hiện tại.

### 2. Giải pháp AI — Box AI + Flycam
- Trang "BoxAI" và "Flycam/Drone" (thuộc `FR-030`) dùng các **proposal AI camera + flycam** + dự án **triển khai thực tế tại Đền Bảo Hà** làm nội dung.
- Nguồn context:
  - `projects/ai-box/GIAI_PHAP_TONG_HOP_AI_CAMERA_FLYCAM_v3.md` — bản chính thức trình khách (08/10/2026): kiến trúc 3 tầng (camera + AI Box Jetson + Flycam DJI Dock 2/Matrice 3TD + VMS), 21 thuật toán + 3 tính năng nền, ngân sách AI theo kênh, phụ lục ngành (Di tích / Rừng-Kiểm lâm / KCN-Kho)
  - Dự án vừa triển khai tại **Đền Bảo Hà** (box AI + flycam) — dùng làm case study/content minh họa triển khai thực tế (thông tin chi tiết hiện trường/thiết bị/số lượng cần anh xác nhận bổ sung nếu cần)
- Nội dung cần có: BoxAI (edge AI trên NVIDIA Jetson, 16 kênh/box, chạy local khi mất mạng, 21 thuật toán: đào trộm/cháy/đánh nhau/ANPR Việt Nam…); Flycam (DJI Dock 2 tự động, phủ 6–10 km, thermal, tuần tra waypoint); lợi ích cho khách nhà nước/doanh nghiệp/KCN/di tích.

### 3. Case Study — Sửa "Số hoá quản lý đào tạo tại Óc Eo"
- Case study Óc Eo hiện tại (`FR-050`) bị ghi là **"Số hoá quản lý đào tạo tại Óc Eo"** → cần **sửa lại** cho đúng context Óc Eo đã vẽ/dựng.
- Dùng **context Óc Eo** làm nguồn nội dung:
  - `projects/ai-box/OC_EO_200CAM_PHUONG_AN.md` — phương án 200 camera khu di tích Óc Eo – Ba Thê (433 ha, An Giang), kiến trúc 3 tầng, 11 nhóm thuật toán, dự toán ~1.2–2.5 tỷ, lộ trình 12 tuần
  - `projects/ai-box/OC_EO_RESEARCH_PLAN.md` — kế hoạch nghiên cứu & code thuật toán AI 12 tuần
  - `projects/ai-box/OC_EO_HOC_LAP_TRINH.md` — lộ trình đào tạo/chuyển giao năng lực code AI camera (từ 0 → DeepStream)
  - `projects/ai-box/OC_EO_TRIEN_KHAI_CHI_TIET.md` — triển khai chi tiết
  - `projects/ai-box/GIAI_PHAP_TONG_HOP_AI_CAMERA_FLYCAM_v3.md` (phụ lục Di tích) — giải pháp tổng hợp cho di tích
- Nội dung cần có: bối cảnh (khu di tích rộng 433 ha, bảo vệ khảo cổ, chống đào trộm/cháy/phá hoại), giải pháp (AI box + camera + flycam + trung tâm VMS), kết quả/số liệu từ phương án, giá trị bảo tồn di sản.

## Bối cảnh
- Website đang ở giai đoạn khởi tạo spec (chưa build xong phần content thật) — SPECIFICATIONS.md chưa có nội dung cụ thể, chỉ có framework từ BRIEF/BRD.
- Hiện trạng: `docs/BRD.md` mô tả Module 4 (Giải pháp AI) và Module 6 (Case Study) nhưng chưa có nội dung thật từ các dự án/tài liệu kinh doanh NTA.
- Mục tiêu: đưa content thật (từ Talvra, AI box/flycam proposal, Óc Eo) vào spec để builder render được trang web hoàn chỉnh.

## Acceptance (bắt buộc)
- [ ] Trang "Giải pháp AI / AI tùy chỉnh" có nội dung Talvra (mô tả platform, template, lợi ích, use case) — đủ để render thật không phải placeholder.
- [ ] Trang "Giải pháp AI / BoxAI" có nội dung từ `GIAI_PHAP_TONG_HOP_AI_CAMERA_FLYCAM_v3.md` (kiến trúc, thuật toán, lợi ích, ứng dụng ngành) + đề cập triển khai Đền Bảo Hà.
- [ ] Trang "Giải pháp AI / Flycam" có nội dung flycam từ proposal v3 (DJI Dock 2, phạm vi phủ, thermal, use case).
- [ ] Case Study Óc Eo được **sửa** từ "Số hoá quản lý đào tạo" sang đúng nội dung dự án AI camera + flycam tại khu di tích (dùng context Óc Eo), đúng format vấn đề → giải pháp → kết quả.
- [ ] Nội dung song ngữ VI/EN (theo `BRIEF.md`) — tối thiểu bản VI hoàn chỉnh.

## Ghi chú
- Nguồn nằm ngoài repo: `projects/ai-box/GIAI_PHAP_TONG_HOP_AI_CAMERA_FLYCAM_v3.md`, `projects/ai-box/OC_EO_*.md`, `projects/talvra/GAMMA_PROMPT_TALVRA_OVERVIEW.md`, `projects/talvra/README.md` — agent cần đọc các file này từ workspace.
- **Đền Bảo Hà:** nếu cần chi tiết hiện trường (số camera, thiết bị, ngày triển khai) → hỏi anh Tuấn Anh confirm, KHÔNG tự bịa số liệu.
- Đây là change ADDITIVE/MODIFY cho content pages — sau khi spec update cần `spec-publish` + sinh `spec/test-scope/current.json` đúng quy trình.