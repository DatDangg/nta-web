---
id: shared-detail-showcase-template
type: feature
status: pending
created: 2026-10-13
---

# Tách khung case study (Óc Eo) thành template detail chung cho Giải pháp / Sản phẩm

## Yêu cầu
Tách `ShowcaseLayout` (khung trang chi tiết case study mẫu Óc Eo) thành **component detail dùng chung**.
Các trang chi tiết giải pháp (và các trang khác trong phạm vi chốt bên dưới) trình bày lại theo đúng khung này —
cùng UI, cùng thứ tự block; mỗi trang chỉ khác **data** trong frontmatter MDX (VI + EN).

Thứ tự block (giữ nguyên khung Óc Eo):
Hero → Stats (3 số) + 3 pillar → Technology (sơ đồ + ảnh màn) → Ảnh trượt → Vision → **[Lưới tính năng]** → **[FAQ]** → CTA.

Đã chốt với user (2026-10-13):
- Nguồn data: **vẫn MDX trong repo, SSG** — không thêm DB/API nội dung (R-15, R-16). Giữ `lib/content/*` làm lớp loader.
- Map nội dung cho trang giải pháp:
  - Stats: chỉ số liệu **có thật của sản phẩm** (số phân hệ, số vai trò…), không ghi kết quả kinh doanh không có nguồn (BR-004).
  - 3 pillar: **Vấn đề / Giải pháp / Lợi ích** (thay Thách thức / Giải pháp / Kết quả của case study).
  - Vision: không có trích dẫn thật của khách → ẩn quote, giữ đoạn mô tả.
- **Cách (b):** thêm 2 block **optional** vào khung chung — **Lưới tính năng** + **FAQ**, cùng phong cách Óc Eo, nằm trước CTA,
  chỉ hiện khi có data. Nội dung riêng của LMS (tuân thủ TT27, AI, đối tượng sử dụng) map vào 2 block này.
- Ảnh màn hình:
  - CRM, DentGo, LMS: chụp thêm từ **staging** (user cung cấp link + tài khoản demo).
  - HRM: hệ thống tự thiết kế → agent **tự dựng thêm màn** theo đúng phong cách 9 màn hiện có rồi chụp; ảnh ghi chú "minh hoạ" (BR-004).
- Giữ nguyên URL hiện có; `page.tsx` chỉ load data + breadcrumb/JSON-LD/metadata theo loại trang.

## Bối cảnh / tái hiện (bug)
- Không áp dụng (feature).

## Acceptance (bắt buộc)
- [ ] Trang chi tiết case study và các trang trong phạm vi render bằng **cùng 1 component layout**; khác nhau chỉ ở data.
- [ ] Case study Óc Eo + nha khoa hiển thị không đổi sau khi tách khung (không regression).
- [ ] Block Lưới tính năng + FAQ là optional; block thiếu data thì ẩn, không vỡ layout.
- [ ] Data mỗi trang nằm trong frontmatter MDX (VI + EN); không hard-code nội dung/brand/demo URL trong `page.tsx`.
- [ ] Nội dung LMS hiện có (TT27, AI, đối tượng) không bị mất — nằm trong Lưới tính năng / FAQ.
- [ ] Stats/pillar/vision tuân BR-004: không số liệu bịa, ảnh minh hoạ có ghi chú.
- [ ] URL cũ giữ nguyên; metadata, canonical/alternates, breadcrumb JSON-LD, sitemap đúng.
- [ ] Vẫn SSG, không thêm DB/API nội dung.
- [ ] Component cũ không còn dùng được xoá; build/typecheck/lint PASS.

## Ghi chú
- Tham chiếu spec: R-15, R-16, R-21 (SEO), BR-004.
- CR-002 (case study nha khoa showcase) đã close-out 2026-10-13 — khung showcase hiện có field `technology.screen`, `photos.variant: screen` dùng lại được cho trang giải pháp.
- Working tree đang có thay đổi chưa commit từ template-sync (`AGENTS.md`, `.agent/`, `.opencode/`…) → commit riêng trước, không gộp vào change này.
- **Chốt thêm với user (2026-10-13):**
  - Phạm vi: **toàn bộ** trang chi tiết — 4 giải pháp Enterprise (CRM, DentGo, LMS, HRM), 3 giải pháp AI (BoxAI, Flycam, Custom AI)
    và 2 sản phẩm (Kiểu tóc AI, Music app; thêm route `/products/[slug]`).
  - Thiếu ảnh → agent **tự tạo ảnh minh hoạ** (mock theo phong cách sản phẩm), mọi ảnh tự tạo phải có alt/caption ghi "minh hoạ" (BR-004).
  - User đã gửi link + tài khoản staging CRM / DentGo / LMS **qua chat** — KHÔNG ghi mật khẩu vào repo/change doc.
- **Needs-input (chưa chốt):**
  - CRM: link gửi là domain thật của khách (`cms.dragonhotpotvietnam.com`) — cần xác nhận là staging/dữ liệu demo hay prod; nếu dữ liệu thật phải che toàn bộ thông tin khách.
  - Dữ liệu trên staging DentGo / LMS có phải dữ liệu demo không.
  - Danh sách màn HRM cần dựng thêm (hoặc để agent đề xuất).
