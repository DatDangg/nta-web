---
spec_version: 1.0.1
updated_at: 2026-10-09
---

# SPECIFICATIONS.md — NTA Website

<!--
  File này được tự động generate sau khi hoàn thành spec (từ code hoặc từ change request).
  KHÔNG chỉnh sửa thủ công — thay đổi đi qua `/change` (agent change-request).
  Nguồn khởi tạo: reverse-engineer từ docs (repo CHƯA có app code) — /spec-init 2026-10-08.
  Sửa vòng 1 theo spec-validator round 1 (gap 1–6, report: .context/review-reports/spec-validation.md).
-->

## Overview

**NTA Website** — website giới thiệu (marketing/showcase, content-driven) của công ty NTA, giới thiệu
3 mảng giải pháp: (1) Giải pháp doanh nghiệp (CRM, HRM, LMS, DentGo), (2) Giải pháp AI (BoxAI,
flycam/drone, AI tùy chỉnh), (3) App AI (music app, hair-style AI). Hướng B2B: khách doanh nghiệp,
cơ quan nhà nước, đối tác. **Không** có đăng nhập người dùng ở v1.
Nguồn: `BRIEF.md:5-17`, `docs/BRD.md:14-31`.

Domain: **`ntasolution.vn`** · Song ngữ **VI/EN** · Phong cách **light minimal kiểu Apple**.
Nguồn: `BRIEF.md:15-16`, `docs/BRD.md:51,167` (quyết định ngày 08/10/2026 — xem `git log`: ab335bb, e7f54aa).

## Scope

- **In Scope:** 9 nhóm trang (trang chủ, về NTA, giải pháp DN + 4 trang con, giải pháp AI + trang con,
  sản phẩm app, case study, blog, liên hệ, nav/footer) · UI responsive mobile-first light minimal ·
  SEO cơ bản · song ngữ VI/EN · form liên hệ có chống spam · deploy Cloud Run.
  Nguồn: `docs/BRD.md:47-53`
- **Out of Scope:** hệ thống đăng nhập / CMS quản trị phức tạp (phase sau) · e-commerce / thanh toán ·
  tính năng nghiệp vụ của sản phẩm (CRM/HRM/LMS/DentGo…).
  Nguồn: `docs/BRD.md:55-58`

## Tech Stack

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS — nguồn: `BRIEF.md:46`, `docs/BRD.md:156`
- **Nội dung:** file nội dung trong repo (MDX / JSON / TS), render SSG/SSR — nguồn: `docs/ERD.md:20-22`
- **i18n:** `next-intl` hoặc `next-i18n` (mặc định VI, toggle EN, route `/en/...`) — nguồn: `BRIEF.md:42`
- **Database/ORM:** none (`db_tool: none`, `migration_required: false`) — nguồn: `.context/project-config.md:40-41`, `docs/ERD.md:16-18`
- **Deploy:** Google Cloud Run `asia-southeast1`, scale-to-zero — nguồn: `BRIEF.md:43`, `docs/BRD.md:53`
- **CI/CD:** GitHub Actions — nguồn: `.context/project-config.md:48`
- ⚠️ `[cần xác nhận]` package manager (dự kiến npm — `.context/project-config.md:22`)

> **Trạng thái:** repo **chưa có app code** (`source_roots: []`). Mọi R-xx dưới đây reverse-engineer
> từ docs, đánh dấu `[reverse-engineered from docs]` — sẽ được xác thực lại với code ở Phase 5/layer 0.

## Features

### Module 1 — Trang chủ `/`

- **R-01:** Hero section: tagline + 2 CTA (Tư vấn / Xem giải pháp), responsive đúng breakpoint.
  States: Default / Loading (nếu fetch) / Error. `[reverse-engineered from docs]`
  — nguồn: `docs/BRD.md:65-67` (FR-001), `docs/DESIGN.md:78-83`
  `[cần xác nhận]` dưới SSG (không fetch) liệu có cần Loading/Error state — chốt khi implement.
- **R-02:** Khối 3 mảng giải pháp (Doanh nghiệp / AI / App AI) — 3 card, điều hướng đúng trang, có hover state.
  `[reverse-engineered from docs]` — nguồn: `docs/BRD.md:69-71` (FR-002)
- **R-03:** Khối sản phẩm tiêu biểu (≥ 2 sản phẩm tiêu biểu) + CTA cuối trang nổi bật; hiện có 2 app thật theo R-07, section ẩn khi không có sản phẩm.
  `[reverse-engineered from docs]` — nguồn: `docs/BRD.md:73-75` (FR-003)

### Module 2 — Về NTA `/about`

- **R-04:** Đủ 5 khối: sứ mệnh, năng lực, team, milestones (timeline), đối tác; logo đối tác grayscale → màu khi hover.
  `[reverse-engineered from docs]` — nguồn: `docs/BRD.md:78-80` (FR-010), `docs/DESIGN.md:85-90`

### Module 3 — Giải pháp Doanh nghiệp

- **R-05:** Trang tổng quan `/solutions/enterprise` + 4 trang con `/solutions/enterprise/[slug]`
  (`crm` | `hrm` | `lms` | `dentgo`); mỗi giải pháp: mô tả tính năng + lợi ích + CTA; slug sai → 404.
  `[reverse-engineered from docs]` — nguồn: `docs/BRD.md:83-85` (FR-020), `docs/DESIGN.md:92-99`

### Module 4 — Giải pháp AI

- **R-06:** Trang tổng quan `/solutions/ai` + trang con `/solutions/ai/[slug]`
  (`boxai` | `flycam` | `custom-ai`); mỗi giải pháp có mô tả + case study liên quan nếu có dữ liệu (tùy chọn).
  `[reverse-engineered from docs]` — nguồn: `docs/BRD.md:88-90` (FR-030), `docs/DESIGN.md:101-107`

### Module 5 — Sản phẩm App

- **R-07:** `/products`: giới thiệu Music app & Hair-style AI — mô tả, ảnh/screenshot, kênh tải (nếu có).
  Priority: Medium (theo FR-040). `[reverse-engineered from docs]`
  — nguồn: `docs/BRD.md:93-95` (FR-040), `docs/DESIGN.md:109-111`

### Module 6 — Case Study

- **R-08:** Danh sách `/case-studies` (filter theo mảng, pagination) + chi tiết `/case-studies/[slug]`
  (meta bar, Challenge → Solution → Result, gallery, related); ít nhất 2 case study (Óc Eo, phòng khám…).
  `[reverse-engineered from docs]` — nguồn: `docs/BRD.md:98-100` (FR-050), `docs/DESIGN.md:113-119`
  - Empty state cho list chưa specify — `[cần xác nhận]` khi implement (`docs/DESIGN.md:82` principle).

### Module 7 — Tin tức / Blog

- **R-09:** Danh sách `/blog` + chi tiết `/blog/[slug]`, phân trang hoặc lazy-load.
  Priority: Medium (theo FR-060). `[reverse-engineered from docs]`
  — nguồn: `docs/BRD.md:103-105` (FR-060), `docs/DESIGN.md:121-123`
  - Empty state cho list chưa specify — `[cần xác nhận]` khi implement.
  - Ngày hiển thị trên card blog **list** dùng **cùng format locale** với detail (design S11):
    VI `dd/mm/yyyy` (`08/10/2026`), EN `Oct 8, 2026` — **1 nguồn util dùng chung**
    (`src/lib/format/date.ts`). _(clarify 2026-10-09 — fix C-L2-1)_
- `[cần xác nhận]` blog là static file hay cần CMS (Open Question — `docs/BRD.md:177`)

### Module 8 — Liên hệ

- **R-10:** `/contact`: form (tên, email, SĐT, nội dung) + hotline + map + thông tin công ty;
  states: Default / Validating / Submitting / Success / Error.
  `[reverse-engineered from docs]` — nguồn: `docs/BRD.md:108-110` (FR-070), `docs/DESIGN.md:125-128`
- `[cần xác nhận]` hotline/email/địa chỉ thật + form gửi về đâu (`docs/BRD.md:174-176`)

### Module 9 — Điều hướng & Footer

- **R-11:** Header nav (desktop ngang + mobile hamburger/drawer, sticky, active state) + Footer
  (4 cột desktop, pháp lý + social + liên hệ), hoạt động mọi breakpoint.
  `[reverse-engineered from docs]` — nguồn: `docs/BRD.md:113-115` (FR-080), `docs/DESIGN.md:147,219-223`
- **R-12:** Trang 404: NotFoundMessage + HomeLink (+ SearchHint nếu có).
  `[reverse-engineered from docs]` — nguồn: `docs/DESIGN.md:130-132`

## API Endpoints

Base URL: dev `http://localhost:3000/api` · prod `https://ntasolution.vn/api` — `docs/API_SPEC.md:15-20`

- **R-13:** `POST /api/contact` — nhận form (name bắt buộc 2–100 ký tự, email bắt buộc, phone tuỳ chọn
  9–15 số, message bắt buộc 10–2000 ký tự, honeypot phải rỗng). Response: `200 {status:"ok"}` /
  `400 {status:"error",errors}` / `429 {status:"error",message}`.
  `[reverse-engineered from docs]` — nguồn: `docs/API_SPEC.md:40-61`
  - `[cần xác nhận]` rate-limit threshold (request/window) chưa doc nào định nghĩa — `docs/API_SPEC.md:60`
- **R-14:** `GET /api/health` — `{status:"ok",timestamp}` cho Cloud Run / uptime.
  `[reverse-engineered from docs]` — nguồn: `docs/API_SPEC.md:63-67`
- **R-15:** Không dựng `GET /api/posts` hoặc `GET /api/case-studies` trong v1; nội dung được render từ file tĩnh trong repo.
  API danh sách động nằm ngoài phạm vi v1. Nguồn ban đầu: `docs/API_SPEC.md:30-31` (tùy chọn).

## Database Schema

- **R-16:** v1 **không có DB** — nội dung nằm ở file trong repo (MDX/JSON/TS), render SSG/SSR;
  form liên hệ **forward** qua email/API bên thứ ba, không lưu DB.
  `[reverse-engineered from docs]` — nguồn: `docs/ERD.md:16-22,34`, `.context/project-config.md:40-41`
  - ⚠️ Conflict C2 (ghi nhận): `docs/BRD.md:52` ghi "lưu/forward" vs `docs/ERD.md:20-22` "chưa cần lưu DB"
    — spec theo ERD (không lưu DB); phụ thuộc Open Question #4 (form gửi về đâu).
- Entity ở mức khái niệm (file nội dung, không phải bảng): Solution, Product, CaseStudy, Post,
  ContactSubmission — `docs/ERD.md:26-34`

## Authentication

- **R-17:** v1 **không có auth người dùng**. Roles: `VISITOR` (public, xem + gửi form) và `ADMIN`
  (quản trị — phase sau, ngoài scope v1).
  `[reverse-engineered from docs]` — nguồn: `docs/PERMISSION.md:6-13`, `docs/BRD.md:134-141`
- **R-18:** Guard order cho `POST /api/contact`: `rateLimit` → `validate(schema)` → `honeypot`
  (có giá trị → bot, trả 200 giả, không gửi) → handler. Các route còn lại public, không guard.
  `[reverse-engineered from docs]` — nguồn: `docs/PERMISSION.md:17-26`
- **R-19 (Security):** **HTTPS only** (enforce TLS toàn bộ, redirect HTTP→HTTPS) + không lộ secret ra
  client: biến `NEXT_PUBLIC_*` chỉ dùng cho giá trị công khai; secret ở Secret Manager / env server.
  `[reverse-engineered from docs]` — nguồn: `docs/BRD.md:124`, `BRIEF.md:41`, `docs/PERMISSION.md:37-41`

## Non-functional Requirements

- **R-20 (i18n):** Song ngữ Việt/Anh — mặc định VI, toggle EN, route `/en/...`, hreflang + localized meta.
  `[reverse-engineered from docs]` — nguồn: `BRIEF.md:42`, `docs/BRD.md:51,130`
- **R-21 (SEO):** SSR/SSG, meta + OpenGraph per page, `sitemap.xml`, `robots.txt`, JSON-LD Organization;
  Lighthouse SEO ≥ 90. `[reverse-engineered from docs]` — nguồn: `BRIEF.md:38`, `docs/BRD.md:125,29`
- **R-22 (Performance):** LCP < 2.5s trên 4G; ảnh tối ưu (`next/image`), lazy-load, bundle gọn;
  Lighthouse Performance ≥ 90. `[reverse-engineered from docs]` — nguồn: `BRIEF.md:37`, `docs/BRD.md:123,28-29`
- **R-23 (Responsive):** Mobile-first, thang breakpoint Tailwind: base < 640px, sm 640, md 768,
  lg 1024, xl 1280, 2xl 1536; ưu tiên fluid (`clamp()`, `rem`, `%`); responsive behavior chi tiết
  từng screen ở `docs/DESIGN.md:181-223`. `[reverse-engineered from docs]`
  — nguồn: `BRIEF.md:39`, `docs/BRD.md:129`, `docs/DESIGN.md:162-181`, `.context/project-config.md:107`
  - ⚠️ Conflict C1 (ghi nhận, cần user chốt): 4 nguồn liệt kê 4 bộ breakpoint khác nhau
    (`docs/BRD.md:129` "375/768/1280/1536" · `BRIEF.md:39` "375/768/1280+" · `docs/DESIGN.md:166-173`
    thang Tailwind 6 bp · `.context/project-config.md:107` `[375,768,1280]`). Spec lấy DESIGN (Tailwind)
    làm authoritative vì khớp implementation; 375 ≈ base, 1280 ≈ xl.
- **R-24 (Accessibility):** WCAG 2.1 AA — contrast, keyboard nav, alt text, semantic HTML.
  `[reverse-engineered from docs]` — nguồn: `BRIEF.md:40`, `docs/BRD.md:128`
- **R-25 (Business rules):** BR-001 mọi trang có CTA/liên hệ ở footer; BR-002 validate email + SĐT
  hợp lệ trước khi gửi; BR-003 nội dung đúng 3 mảng, không trộn sản phẩm ngoài danh mục;
  BR-004 không công bố thông tin khách hàng/dự án chưa được phép (đặc biệt dự án nhà nước).
  `[reverse-engineered from docs]` — nguồn: `docs/BRD.md:147-150`
- **R-26 (Content):** ít nhất 9 nhóm trang theo dàn ý; nội dung v1 dùng nội dung mẫu hợp lý
  (điền dần khi có nội dung thật). `[reverse-engineered from docs]` — nguồn: `docs/BRD.md:48,31,165`
- **Constraints (soft, không testable riêng):** Regulatory — chú ý bản quyền ảnh/nội dung
  (`docs/BRD.md:159`); Budget — ưu tiên free tier GCP (`docs/BRD.md:157`); Timeline — dựng khung +
  nội dung mẫu nhanh (`docs/BRD.md:158`).

## Scalability Profile (OPTIONAL — chỉ khi user bật Scalability Option)

- **Scalability Option:** off — nguồn: `skills/scalability-architecture/` (off → áp dụng mặc định)
- **Tier:** Standard — mặc định khi off (modular monolith + stateless; v1 không DB) —
  nguồn: `SPECIFICATIONS.md` dòng này + `docs/ERD.md:16-18`, `.context/project-config.md:40-41`
  (không có docs canonical nào chọn tier khác — không bật High Traffic/Enterprise)

## Deployment

- **R-27:** Deploy Google Cloud Run `asia-southeast1`, scale-to-zero, max-instances 3, availability
  ≥ 99.5%; domain `ntasolution.vn` (gắn sau khi có DNS); CI/CD GitHub Actions; ưu tiên free tier GCP.
  `[reverse-engineered from docs]` — nguồn: `BRIEF.md:43`, `docs/BRD.md:53,126,127,157`, `.context/project-config.md:47-48`

---

## `[cần xác nhận]` (Open Questions — chưa phải requirement chốt)

1. Logo NTA + brand color chính thức (`docs/BRD.md:173`) — hiện dùng palette neutral light tạm (`docs/BRD.md:166`).
2. Hotline / email / địa chỉ thật (`docs/BRD.md:174`).
3. Danh sách sản phẩm & case study ưu tiên (`docs/BRD.md:175`).
4. Form liên hệ gửi về đâu — email / CRM / Google Sheet (`docs/BRD.md:176`) — giải quyết Conflict C2.
5. Blog có cần CMS thật hay trang tĩnh (`docs/BRD.md:177`).
6. Package manager + verify commands (`package_manager: none`, `.context/project-config.md:22`).

## Cross-doc conflicts (ghi nhận — chờ user resolve qua `/brainstorm`)

- **C1 (MEDIUM):** bộ breakpoint authoritative — xem R-23. → hỏi user ở brainstorm checkpoint.
- **C2 (MEDIUM):** form liên hệ "lưu" (BRD:52) vs "chỉ forward, không DB" (ERD:20-22) — phụ thuộc OQ#4.
- **C3 (LOW):** `BRIEF.md:50` stale (liệt domain/ngôn ngữ là "còn thiếu" trong khi `BRIEF.md:15-16` đã chốt).

---
*Generated by: /spec-init (reverse-engineer từ docs — repo chưa có app code)*
*Validated by: .agent/spec-validator.md (round 1: FAIL → sửa gap 1–6 → round 2)*
