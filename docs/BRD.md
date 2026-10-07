# Business Requirements Document (BRD) — NTA Website

> Tài liệu nghiệp vụ cho website công ty NTA. Agent auto-detect và dùng file này khi dựng/validate spec.

---

## Project Overview

**Project Name:** NTA Website
**Version:** 1.0
**Date:** 2026-10-07
**Author:** Eve (AI assistant) — theo yêu cầu anh Tuấn Anh

## Business Context

**Problem Statement:**
NTA có 3 mảng giải pháp (doanh nghiệp, AI, app AI) nhưng chưa có một website tập trung
để giới thiệu năng lực, sản phẩm và dự án tiêu biểu. Khách B2B và cơ quan nhà nước cần
một nơi tra cứu hồ sơ năng lực, case study và thông tin liên hệ chính thức.

**Business Objectives:**
- Có website giới thiệu chính thức, hiện đại, thể hiện đúng 3 mảng giải pháp.
- Là kênh hồ sơ năng lực phục vụ đấu thầu / tư vấn khách doanh nghiệp và nhà nước.
- Tăng lead qua form liên hệ (hotline/email).
- Nền tảng để mở rộng: blog/tin tức, case study, SEO.

**Success Metrics:**
- Website live và load < 2.5s (LCP) trên 4G.
- Điểm Lighthouse Performance/SEO ≥ 90.
- Form liên hệ hoạt động, không spam.
- ≥ 9 trang nội dung theo dàn ý đã chốt.

---

## Stakeholders

| Role | Name | Responsibility |
|------|------|----------------|
| Product Owner | Anh Tuấn Anh | Quyết định cuối, cung cấp nội dung/brand |
| Developer | Eve / opencode agents | Build, deploy |
| End User | Khách B2B, cơ quan nhà nước, đối tác | Người xem website |

---

## Scope

### In Scope
- 9 nhóm trang: Trang chủ, Về NTA, Giải pháp Doanh nghiệp (+4 trang con), Giải pháp AI (+case study), Sản phẩm App, Case Study, Tin tức/Blog, Liên hệ, Footer.
- UI responsive mobile-first, dark tech theme.
- SEO cơ bản: meta/OG per page, sitemap, robots, JSON-LD.
- Form liên hệ (lưu/forward, có chống spam).
- Deploy Google Cloud Run (asia-southeast1).

### Out of Scope
- Hệ thống đăng nhập / CMS quản trị phức tạp (có thể bổ sung sau).
- E-commerce / thanh toán.
- Đa ngôn ngữ đầy đủ (EN) ở phiên bản đầu — xem Open Questions.
- Tính năng nghiệp vụ của các sản phẩm (CRM/HRM/LMS/DentGo…).

---

## Functional Requirements

### Module 1: Trang chủ
**FR-001:** Hero section giới thiệu NTA + CTA liên hệ.
- Priority: High
- Acceptance Criteria: Hero hiển thị tagline, 2 CTA (Tư vấn / Xem giải pháp), responsive đúng 4 breakpoint.

**FR-002:** Khối 3 mảng giải pháp (Doanh nghiệp / AI / App AI) dẫn tới trang tương ứng.
- Priority: High
- Acceptance Criteria: 3 card, click điều hướng đúng, có hover state.

**FR-003:** Khối sản phẩm tiêu biểu + khối CTA cuối trang.
- Priority: High
- Acceptance Criteria: Hiển thị ít nhất 3–4 sản phẩm, CTA nổi bật.

### Module 2: Về NTA
**FR-010:** Trình bày sứ mệnh, năng lực, team, milestones, đối tác.
- Priority: High
- Acceptance Criteria: Đủ 5 khối nội dung, có timeline milestones.

### Module 3: Giải pháp Doanh nghiệp
**FR-020:** Trang tổng quan + 4 trang con CRM / HRM / LMS / DentGo.
- Priority: High
- Acceptance Criteria: mỗi giải pháp 1 trang riêng, mô tả tính năng + lợi ích + CTA.

### Module 4: Giải pháp AI
**FR-030:** Trang tổng quan + trang con BoxAI, Flycam/Drone, AI tùy chỉnh.
- Priority: High
- Acceptance Criteria: mỗi giải pháp có mô tả + case study liên quan (vd Óc Eo).

### Module 5: Sản phẩm App
**FR-040:** Trang giới thiệu Music app & Hair-style AI.
- Priority: Medium
- Acceptance Criteria: mỗi app có mô tả, ảnh/screenshot, kênh tải (nếu có).

### Module 6: Case Study
**FR-050:** Danh sách + trang chi tiết dự án tiêu biểu (Óc Eo, triển khai phòng khám…).
- Priority: High
- Acceptance Criteria: ít nhất 2 case study, layout chi tiết rõ vấn đề → giải pháp → kết quả.

### Module 7: Tin tức / Blog
**FR-060:** Danh sách bài viết + trang chi tiết.
- Priority: Medium
- Acceptance Criteria: list + detail, phân trang hoặc lazy-load.

### Module 8: Liên hệ
**FR-070:** Form liên hệ (tên, email, SĐT, nội dung) + hotline + map + thông tin công ty.
- Priority: High
- Acceptance Criteria: validate input, chống spam/rate-limit, phản hồi thành công/lỗi rõ ràng.

### Module 9: Điều hướng & Footer
**FR-080:** Header nav (desktop + mobile hamburger) + Footer đầy đủ.
- Priority: High
- Acceptance Criteria: nav hoạt động mọi breakpoint, footer có pháp lý + social + liên hệ.

---

## Non-Functional Requirements

| Category | Requirement |
|----------|------------|
| Performance | LCP < 2.5s, ảnh tối ưu qua `next/image`, lazy-load, bundle gọn |
| Security | HTTPS only, form rate-limit + chống spam, không lộ secret (Secret Manager) |
| SEO | SSR/SSG, meta + OpenGraph per page, sitemap.xml, robots.txt, JSON-LD Organization |
| Scalability | Cloud Run scale-to-zero, max-instances 3 (đủ cho traffic marketing) |
| Availability | ≥ 99.5% (Cloud Run SLA) |
| Accessibility | WCAG 2.1 AA — contrast, keyboard, alt text, semantic HTML |
| Responsive | Mobile-first, 4 breakpoint (375 / 768 / 1280 / 1536) |
| Language | Tiếng Việt (mặc định) |

---

## User Roles & Permissions

| Role | Permissions |
|------|------------|
| Visitor (công khai) | Xem toàn bộ nội dung công khai, gửi form liên hệ |
| Admin (tương lai) | Quản trị nội dung blog/case study (ngoài phạm vi v1) |

> Website v1 là content-driven, **không có đăng nhập người dùng**.

---

## Business Rules

- **BR-001:** Mọi trang phải có thông tin liên hệ hoặc CTA ở footer/đáy trang.
- **BR-002:** Form liên hệ phải xác thực email + SĐT hợp lệ trước khi gửi.
- **BR-003:** Nội dung phải phản ánh đúng 3 mảng giải pháp, không trộn lẫn sản phẩm ngoài danh mục.
- **BR-004:** Không công bố thông tin khách hàng/dự án chưa được phép (đặc biệt dự án nhà nước).

---

## Constraints

- **Technical:** Next.js (App Router) + TypeScript + Tailwind CSS; deploy Google Cloud Run.
- **Budget:** Ưu tiên free tier GCP (scale-to-zero), hạn chế dịch vụ trả phí.
- **Timeline:** Dựng xong khung + nội dung mẫu để test nhanh (anh chạy `/start` ngày kế tiếp).
- **Regulatory:** Không có yêu cầu đặc biệt; chú ý bản quyền ảnh/nội dung.

---

## Assumptions

- Nội dung chi tiết (mô tả sản phẩm, case study) sẽ được điền dần sau; v1 dùng nội dung mẫu hợp lý.
- Chưa có logo/brand color chính thức → tạm dùng dark tech theme.
- Domain: dùng `*.run.app` trước, gắn domain riêng sau.

---

## Open Questions

- [ ] Logo NTA (file/svg) và bảng màu thương hiệu chính thức?
- [ ] Domain chính thức (vd `nta.vn`)? Ai quản lý DNS?
- [ ] Có cần song ngữ Việt/Anh không, hay chỉ tiếng Việt?
- [ ] Hotline / email / địa chỉ thật để hiển thị?
- [ ] Danh sách sản phẩm & case study ưu tiên đưa lên trước?
- [ ] Form liên hệ gửi về đâu (email nào / CRM / Google Sheet)?
- [ ] Có cần khu blog/tin tức thật (CMS) hay chỉ trang tĩnh?
