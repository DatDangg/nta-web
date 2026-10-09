# Spec Update — 2026-10-09 ai-solution-content

**spec_version:** 1.0.1 → 1.1.0 (**MINOR — bổ sung yêu cầu nội dung + render**)
**Trigger:** feature-update
**Requirements:**

- **SỬA/mở rộng R-06** (Module 4 — Giải pháp AI, FR-030): thêm yêu cầu nội dung thật cho 3 trang con:
  - **R-06a** `custom-ai` = nền tảng **Talvra** (vấn đề, định nghĩa, 4 nguyên tắc, 3 template, hành trình
    6 bước, kênh Zalo/KioskViet/Telegram, khác biệt, an toàn & kiểm soát, tiến độ + roadmap, đối tượng,
    tầm nhìn, CTA).
  - **R-06b** `boxai` = **AI camera + AI Box (NVIDIA Jetson)** (kiến trúc 3 tầng, phần cứng, ngân sách
    thuật toán/kênh, 21 thuật toán + 3 tính năng nền, gói theo ngành, KPI) + **đề cập triển khai thực tế
    tại Đền Bảo Hà** (định tính — số liệu chờ xác nhận).
  - **R-06c** `flycam` = **DJI Dock 2 + Matrice 3TD** (thông số, thời gian phản ứng, diện tích phủ, 4 route,
    lịch theo cấp cháy I–V, bộ lọc trigger, KPI, FAQ).
  - **R-06d** render: trang chi tiết AI render `benefits` + section nội dung có cấu trúc + chỉ số/FAQ tùy chọn;
    giữ SSG + i18n VI/EN.
  - **R-06e** link giải pháp AI → case study liên quan (Óc Eo).
- **SỬA/mở rộng R-08** (Module 6 — Case Study, FR-050): thêm **R-08a** — case study `oc-eo-learning` sửa
  nội dung từ "Số hoá quản lý đào tạo tại Óc Eo" → **dự án AI camera + flycam tại khu di tích Óc Eo – Ba Thê**
  (content thật, phần C), đúng format vấn đề → giải pháp → kết quả; category `enterprise` → `ai`; giữ slug.

**Lý do bump MINOR:** bổ sung yêu cầu nội dung + thay đổi cách render trang chi tiết AI (thêm section
có cấu trúc / benefits) — vượt mức "làm rõ wording" nên không phải PATCH, nhưng không phá vỡ requirement cũ
(không xoá/đổi ngữ nghĩa R-06/R-08 gốc) → không phải MAJOR.

**Ảnh hưởng:** module `solutions-ai` (3 trang con + type `Solution` + component render) và module
`case-studies` (1 case study + category → filter list). Không đổi API/DB/route. i18n VI/EN (nguồn EN dịch từ VI).

**⚠️ Needs-input (không tự bịa):**
- Số liệu hiện trường **Đền Bảo Hà** (số camera, thiết bị, ngày triển khai) — chờ anh Tuấn Anh xác nhận.
- **Óc Eo** (phần C) là **phương án đề xuất** hay **dự án đã triển khai** — cần xác nhận để ghi "Kết quả" trung thực (BR-004).

**Nguồn:** `spec/changes/2026-10-09-ai-solution-content.md` (content A/B/C nhúng sẵn).
**Scope sinh:** `spec/test-scope/current.json` (scopeVersion 5).
