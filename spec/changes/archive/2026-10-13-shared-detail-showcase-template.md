---
id: shared-detail-showcase-template
type: feature
status: done
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
- [x] Trang chi tiết case study và các trang trong phạm vi render bằng **cùng 1 component layout**; khác nhau chỉ ở data.
- [x] Case study Óc Eo + nha khoa hiển thị không đổi sau khi tách khung (không regression).
- [x] Block Lưới tính năng + FAQ là optional; block thiếu data thì ẩn, không vỡ layout.
- [x] Data mỗi trang nằm trong frontmatter MDX (VI + EN); không hard-code nội dung/brand/demo URL trong `page.tsx`.
- [x] Nội dung LMS hiện có (TT27, AI, đối tượng) không bị mất — nằm trong Lưới tính năng / FAQ.
- [x] Stats/pillar/vision tuân BR-004: không số liệu bịa, ảnh minh hoạ có ghi chú.
- [x] URL cũ giữ nguyên; metadata, canonical/alternates, breadcrumb JSON-LD, sitemap đúng.
- [x] Vẫn SSG, không thêm DB/API nội dung.
- [x] Component cũ không còn dùng được xoá; build/typecheck/lint PASS.

## Ghi chú
- Tham chiếu spec: R-15, R-16, R-21 (SEO), BR-004.
- CR-002 (case study nha khoa showcase) đã close-out 2026-10-13 — khung showcase hiện có field `technology.screen`, `photos.variant: screen` dùng lại được cho trang giải pháp.
- Working tree đang có thay đổi chưa commit từ template-sync (`AGENTS.md`, `.agent/`, `.opencode/`…) → commit riêng trước, không gộp vào change này.
- **Chốt thêm với user (2026-10-13):**
  - Phạm vi: **toàn bộ** trang chi tiết — 4 giải pháp Enterprise (CRM, DentGo, LMS, HRM), 3 giải pháp AI (BoxAI, Flycam, Custom AI)
    và 2 sản phẩm (Kiểu tóc AI, Music app; thêm route `/products/[slug]`).
  - Thiếu ảnh → agent **tự tạo ảnh minh hoạ** (mock theo phong cách sản phẩm), mọi ảnh tự tạo phải có alt/caption ghi "minh hoạ" (BR-004).
  - User đã gửi link + tài khoản staging CRM / DentGo / LMS **qua chat** — KHÔNG ghi mật khẩu vào repo/change doc.
- **Chụp ảnh staging CRM / DentGo / LMS (chốt 2026-10-13):** cả 3 là staging, dữ liệu demo. Ảnh dùng trên web vẫn phải
  **thay toàn bộ thông tin bên trong bằng dữ liệu giả trông như thật** (tên người, SĐT, email, địa chỉ, mã hồ sơ, số tiền,
  tên tổ chức…) để không trùng dữ liệu khách nếu có.
  - Cách làm: chỉ thay chữ **trên trình duyệt trước khi chụp** (sửa DOM phía client), KHÔNG tạo/sửa/xoá bản ghi nào trên staging.
  - Dữ liệu giả: tên/SĐT/địa chỉ kiểu Việt Nam hợp lý, nhất quán giữa các màn của cùng một hệ thống; không dùng tên người/doanh nghiệp có thật.
  - Rà lại từng ảnh trước khi đưa vào repo: không còn chữ gốc ở tiêu đề tab, avatar, ô tìm kiếm, thông báo, góc màn hình.
  - Alt/caption ghi "dữ liệu minh hoạ" (BR-004).
- **HRM (chốt 2026-10-13):** agent tự dựng thêm màn (mockup, cùng phong cách 9 màn `public/images/solutions/v2/hrm/`).
  Đề xuất ban đầu (chốt danh sách ở checkpoint plan của `/change`): tuyển dụng (pipeline ứng viên) · hợp đồng lao động
  (sắp hết hạn / gia hạn) · đánh giá hiệu suất (KPI) · đào tạo · báo cáo biến động nhân sự.
  - Áp quy tắc dữ liệu giả như staging: thay email `@ntavietnam.tech` và tên "Công ty NTA" trong ảnh HRM hiện có/ảnh mới
    bằng tên tổ chức giả (cảnh báo trong `docs/reference/hrm-mock/README.md`).
- **Push:** user dặn chưa push (2026-10-13) — chỉ commit local cho tới khi user bảo.
- **Sản phẩm (2026-10-13, layer 3 xong):** user gửi info + ảnh 2 app qua chat → `/products/music-app`, `/products/hair-style-ai` dùng khung chung (task `phase-1-task-05`). Không dùng màn Premium app nhạc (rating 4.8 chưa kiểm chứng) và màn welcome app tóc (ảnh chưa rõ giấy phép). Chờ link store + Privacy/Terms chính thức.
- **Đóng 2026-10-13:** theo yêu cầu user, phần ảnh (chụp staging CRM/DentGo/LMS với dữ liệu giả + dựng thêm màn HRM + ảnh phụ CRM `02-khach-hang`, DentGo `02-ho-so-khach-hang`) tách sang **CR-007** `spec/changes/2026-10-13-solution-detail-screenshots.md`, kèm câu hỏi mở (demo DentGo/LMS `http://`, duyệt FAQ Talvra + câu FAQ 5 LMS). Acceptance ảnh staging/HRM theo dõi ở CR-007.
- Close-out (`phase-1-task-06`): xoá component layout cũ hết dùng + trang `/dev/components`; kiểm `showcase` gom vào loader (`getAllSolutions`/`getAllProducts`, kiểu `WithShowcase<T>`). Review PASS + spec-validation PASS.
