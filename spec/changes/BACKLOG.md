# BACKLOG — Yêu cầu & bug hậu-build (auto-intake)

> Khi build xong hết layer lần đầu (`mode: maintenance`), **mọi yêu cầu/bug user gửi qua chat
> được agent TỰ ĐỘNG ghi vào đây + tạo change doc** — user KHÔNG cần tạo file tay.
> User chỉ cần gõ `/change` (hoặc `/change <slug>`) → agent xử lý → cập nhật tracking.

## Bảng tracking

| ID | Tiêu đề | Loại | Trạng thái | Change file | Tạo | Xong |
|----|---------|------|-----------|-------------|-----|------|
| CR-001 | Thay ảnh placeholder thẻ giải pháp bằng ảnh giao diện thật | MODIFY + ADDITIVE | closed (không làm — user đóng 15/10) | `archive/2026-10-12-solution-card-real-images.md` | 2026-10-12 | 2026-10-15 |
| CR-002 | Case study nha khoa dạng showcase + nút mở DentGo | feature | done (spec 3.2.1 · scope v23) | `archive/2026-10-13-dental-case-study-showcase.md` | 2026-10-13 | 2026-10-13 |
| CR-003 | Thiết kế lại UI trang Tin tức theo mockup (hero, lọc danh mục, tìm kiếm, khối nổi bật, đăng ký nhận tin) | MODIFY + ADDITIVE | done (spec 3.2.0 · scope v22) | `archive/2026-10-13-blog-listing-redesign.md` | 2026-10-13 | 2026-10-13 |
| CR-004 | Tách khung case study (Óc Eo) thành template detail chung cho Giải pháp / Sản phẩm (data MDX, SSG, thêm block Lưới tính năng + FAQ) | MODIFY + ADDITIVE | done (spec 3.5.1 · scope v30; phần ảnh tách sang CR-007) | `archive/2026-10-13-shared-detail-showcase-template.md` | 2026-10-13 | 2026-10-13 |
| CR-005 | Thêm domain `ntasolution.vn` (+www) truy cập cùng site, GIỮ `ntavietnam.tech` là canonical | ADDITIVE (infra/nginx) | done (spec 3.5.0 · scope v27→v31) | `archive/2026-10-13-add-domain-ntasolution.md` | 2026-10-13 | 2026-10-13 |
| CR-006 | Bỏ khối "Chi tiết ứng dụng" ở trang /products | REMOVE | done (reconcile, scope v29) | `archive/2026-10-13-products-remove-app-details.md` | 2026-10-13 | 2026-10-13 |
| CR-007 | Ảnh chụp staging CRM/DentGo/LMS (dữ liệu giả) + dựng thêm màn HRM cho trang chi tiết giải pháp (tách từ CR-004) | ADDITIVE | done (spec 3.8.0 · scope v35; HRM +4 màn, CRM/DentGo/LMS +3 ảnh carousel mỗi trang) | `archive/2026-10-13-solution-detail-screenshots.md` | 2026-10-13 | 2026-10-13 |
| CR-008 | Thiết kế lại UI trang Liên hệ theo mockup + cập nhật SĐT/email/địa chỉ thật (Kim Hoàn, ngõ 19 Duy Tân) | MODIFY + ADDITIVE | done (spec 3.6.0 · scope v32) | `archive/2026-10-13-contact-page-redesign.md` | 2026-10-13 | 2026-10-13 |
| CR-009 | Dải chữ chạy trang chủ: bỏ chữ đậm + thêm icon từng mục (theo ảnh mẫu) | MODIFY (UI) | done (no spec delta) | `archive/2026-10-13-home-marquee-icons.md` | 2026-10-13 | 2026-10-13 |
| CR-010 | Header: dropdown "Giải pháp" thành mega menu 2 cột theo mockup | MODIFY (UI) | done (no spec delta) | `archive/2026-10-13-header-solutions-megamenu.md` | 2026-10-13 | 2026-10-13 |
| CR-011 | Thêm giải pháp AI "FridayAI" (AI API Gateway) vào /solutions/ai — nội dung + ảnh lấy từ fridayaix.com | ADDITIVE | done (spec 3.7.0 · scope v33) | `archive/2026-10-13-fridayai-solution.md` | 2026-10-13 | 2026-10-13 |
| CR-012 | Case study mới: AI Box tại đền Bảo Hà (showcase như Óc Eo, ảnh camera thật + bảng thuật toán AI) | ADDITIVE | done (spec 3.8.0 · scope v34) | `archive/2026-10-13-ai-box-bao-ha-case-study.md` | 2026-10-13 | 2026-10-13 |
| CR-013 | Ảnh carousel bấm phóng to (lightbox) + thiết kế lại thẻ case study (ảnh bị cắt) | MODIFY + ADDITIVE (UI) | done (spec 3.9.0 · scope v36) | `archive/2026-10-13-image-lightbox-case-study-card.md` | 2026-10-13 | 2026-10-13 |
| CR-014 | Thiết kế lại trang "Về NTA" theo mockup (hero ảnh tòa Kim Hoàn thật + sứ mệnh/tầm nhìn/giá trị + con người NTA ảnh AI tạm) | MODIFY + ADDITIVE (UI) | done (spec 3.10.0 · scope v37) | `archive/2026-10-13-about-page-redesign.md` | 2026-10-13 | 2026-10-13 |
| CR-015 | /about: ảnh tòa Kim Hoàn mờ viền tan vào nền như mẫu + fix thẻ Sứ mệnh/Tầm nhìn bị che đầu | MODIFY (UI) + BUG | done (spec 3.10.0 không bump · scope v38) | `archive/2026-10-13-about-hero-polish.md` | 2026-10-13 | 2026-10-14 |
| CR-016 | Trang chủ: thiết kế lại 3 khối Giải pháp · Sản phẩm (card dọc dài kiểu ảnh 1) · Câu chuyện khách hàng theo mockup | MODIFY (UI) + ADDITIVE | done | `archive/2026-10-14-home-sections-redesign.md` | 2026-10-14 | 2026-10-14 |
| CR-017 | Trang chủ khối Giải pháp: ảnh minh hoạ to chiếm nửa phải thẻ, mờ dần sang trái như mẫu (follow-up CR-016) | MODIFY (UI) | done (spec 3.11.0 không bump · scope v40) | `archive/2026-10-14-home-solution-card-image.md` | 2026-10-14 | 2026-10-14 |
| CR-018 | Trang chủ khối Giải pháp: thẻ rộng hơn + ảnh bên phải dạng ảnh thật (laptop / chip AI / điện thoại) như mẫu (follow-up CR-017) | MODIFY (UI) | done (spec 3.11.0 không bump · scope v41) | `archive/2026-10-14-home-solution-card-photo.md` | 2026-10-14 | 2026-10-14 |
| CR-019 | Tự động đăng "Bản tin AI tuần" (vi + en, dạng điểm tin, AI qua OpenCode Go) lên Tin tức qua GitHub Actions hằng tuần trên runner VPS, không duyệt tay | ADDITIVE | done (spec 3.13.0 · scope v43) | `archive/2026-10-14-weekly-ai-news-digest.md` | 2026-10-14 | 2026-10-14 |
| CR-020 | Trang Về NTA: bỏ khối "Năng lực" và "Đội ngũ" (vi + en); xử lý nút "Tìm hiểu thêm về đội ngũ" đang trỏ `#team` | REMOVE (UI) | done (spec 3.12.0 · scope v42) | `archive/2026-10-14-about-remove-capabilities-team.md` | 2026-10-14 | 2026-10-14 |
| CR-021 | Trang chủ khối Sản phẩm: thêm thẻ "Sắp có thêm ứng dụng mới" cuối dải như thẻ CTA trang Sản phẩm (vi + en) | ADDITIVE (UI) | done (spec 3.14.0 · scope v44) | `archive/2026-10-14-home-products-coming-soon-card.md` | 2026-10-14 | 2026-10-14 |
| CR-022 | Trang chủ khối Sản phẩm: hiện đủ 3 thẻ cùng lúc, chỉ cuộn ngang khi > 3 thẻ (follow-up CR-021) | MODIFY (UI) | done (spec 3.15.0 · scope v45) | `archive/2026-10-14-home-products-show-three.md` | 2026-10-14 | 2026-10-14 |
| CR-023 | Trang chi tiết Tin tức thiếu style thân bài (`prose` không có tác dụng) → Bản tin AI tuần hiển thị như text thô (vi + en) | BUG (UI) | done (spec 3.15.0 · scope v46) | `archive/2026-10-14-blog-article-typography.md` | 2026-10-14 | 2026-10-14 |
| CR-024 | Bản tin AI tuần: khung riêng dạng thẻ điểm tin (mỗi tin 1 thẻ, số thứ tự, nút nguồn) — làm sau CR-023 | ADDITIVE (UI) | closed (không làm — user đóng 15/10) | — | 2026-10-14 | 2026-10-15 |
| CR-025 | Bỏ khối "Triển khai thực tế tại Đền Bảo Hà" (BoxAI) + bỏ case study Bảo Hà; case study Óc Eo bỏ địa danh → "một khu di tích ở Việt Nam" (vi + en) | REMOVE + MODIFY (content) | done (spec 4.0.0 · scope v47) | `archive/2026-10-14-remove-bao-ha-anonymize-oc-eo.md` | 2026-10-14 | 2026-10-14 |
| CR-026 | Route tiếng Anh slug không tồn tại (/en/case-studies/…, /en/blog/…) trả 500 thay vì 404 (static→dynamic, headers qua next-intl requestLocale) — phát hiện khi smoke CR-025 | BUG (routing) | done (gộp CR-026+CR-032 · scope v50 · smoke prod PASS) | `archive/2026-10-14-en-dynamic-slug-not-found-500.md` | 2026-10-14 | 2026-10-15 |
| CR-027 | Case study khu di tích (vi): chỉnh 2 câu lặp ý ("di sản khu di tích" → "di sản văn hóa"; "của khu di tích" lần 2 → "của nơi đây") — follow-up CR-025 | MODIFY (content) | done (no spec impact) | — (copy fix 1 dòng, không tạo change doc) | 2026-10-14 | 2026-10-14 |
| CR-028 | Thêm trang Giải pháp AI "AI Operations Brain" (slug `ai-operations-brain`, vi + en) từ nội dung user gửi; giữ KPI ghi rõ là mục tiêu, bỏ ghi chú người duyệt | ADDITIVE (content) | done (spec 4.1.0 · scope v48) | `archive/2026-10-14-ai-operations-brain-solution.md` | 2026-10-14 | 2026-10-14 |
| CR-029 | Trang AI Operations Brain: thay ảnh SVG minh hoạ ở hero bằng ảnh minh hoạ user tạo (webp 1586×992) + thêm `cardImage` cho thẻ ở /solutions/ai (vi + en) — follow-up CR-028 | MODIFY (content) | done (no spec impact) | — (đổi ảnh, không tạo change doc) | 2026-10-14 | 2026-10-14 |
| CR-030 | Bot Telegram thêm/sửa/xoá nội dung website (Claude API đề xuất → người duyệt → commit main → CI deploy); context bot đã export ở `docs/content-bot/` | ADDITIVE (tooling) | done (thu hẹp: CLI create/update/delete + docs/content-bot theo DB; bot do user tự dựng) | `archive/2026-10-14-telegram-content-bot.md` | 2026-10-14 | 2026-10-15 |
| CR-031 | Thêm database lưu nội dung website (thay file MDX/TS) — nền cho bot Telegram CR-030 | ADDITIVE + MODIFY (kiến trúc/DB/infra) | in_progress (spec 4.2.0 · phase 1–3 done, P3 spec-validator PASS 14/10 · chờ checkpoint → P4 cutover) | `2026-10-14-content-database.md` | 2026-10-14 | |
| CR-032 | URL tiếng Anh slug sai (`/en/blog/nope`, `/en/solutions/ai/crm`...) trả 500 thay vì 404 | bug | done (gộp CR-026+CR-032 · scope v50 · smoke prod PASS) | `archive/2026-10-14-en-invalid-slug-500.md` | 2026-10-14 | 2026-10-15 |
| CR-033 | Backup Content ops (`pre-migrate-ops-*`) dùng chung vòng giữ 14 bản → đẩy mất backup trước-deploy | bug (ops) | done (scope v51 · VPS ops-backup PASS) | `archive/2026-10-14-ops-backup-rotation.md` | 2026-10-14 | 2026-10-15 |
| CR-034 | Bài AI news hằng tuần không lên web sau cutover DB (workflow vẫn ghi file `src/content/blog`) — ưu tiên cao, trước lượt chạy kế | bug | done (spec 4.2.1 · scope v49 · smoke prod PASS) | `archive/2026-10-15-ai-news-write-db.md` | 2026-10-15 | 2026-10-15 |
| CR-035 | Bản tin AI tuần: mỗi tin thêm ảnh (og:image trang nguồn → tải về `/uploads`, không hotlink; không có ảnh → chỉ text) (vi + en) | ADDITIVE | done (4 task, spec 4.3.0 / scope v53) | `archive/2026-10-15-ai-news-item-images.md` | 2026-10-15 | 2026-10-15 |
| CR-036 | Bản tin AI tuần: đổi lịch cron từ 08:00 thứ 2 sang thứ 7 hằng tuần (08:00 thứ 7 giờ VN — user chốt) | MODIFY | done (1 task, spec 4.4.0 / scope v54) | `archive/2026-10-15-ai-news-cron-saturday.md` | 2026-10-15 | 2026-10-15 |
| CR-037 | Form liên hệ đổ dữ liệu vào Google Sheet + báo Telegram (Apps Script Web App qua `CONTACT_FORM_TARGET`) — chốt OQ#4 | ADDITIVE | done (2 task, spec 4.5.0 / scope v55; Telegram tạm chưa bật) | `archive/2026-10-15-contact-form-google-sheet.md` | 2026-10-15 | 2026-10-15 |
| CR-038 | Bản tin AI + Blog: nhãn "Nổi bật" → "Tin mới", tên bản tin theo ngày, ảnh thẻ bản tin lấy ảnh tin đầu tiên có ảnh (fallback ảnh cố định), breadcrumb chi tiết tin đồng bộ kiểu pill | MODIFY | done (3 task, spec 4.6.0 / scope v56; DB prod: w42 v2 + ui_messages blog v2) | `archive/2026-10-15-ai-news-naming-images.md` | 2026-10-15 | 2026-10-15 |
| CR-039 | Form liên hệ: chỉ gửi email tới admin (`ADMIN_EMAIL` trong Script Properties), bỏ Google Sheet + Telegram — thay R-13a | MODIFY + REMOVE | done (1 task, spec 4.7.0 / scope v57; user cần dán script mới + đặt `ADMIN_EMAIL` + Phiên bản mới trên Apps Script) | `archive/2026-10-15-contact-form-email-only.md` | 2026-10-15 | 2026-10-15 |
| CR-040 | Trang chủ: căn thẳng hàng mép các section (container chung) + cân bố cục hero trên màn hình lớn | MODIFY | done (2 task, spec 4.8.0 / scope v58; khung chung Container 1280, hero stage 1440) | `archive/2026-10-19-home-layout-alignment.md` | 2026-10-19 | 2026-10-19 |
| CR-041 | Hero trang chủ: bỏ dải trắng hai bên trên màn rất rộng (nền full-bleed sau stage 1440, fade mép mềm) — follow-up CR-040 | MODIFY | done (1 task, spec 4.9.0 / scope v59; hướng A: nền mờ full-bleed sau stage 1440, mask mềm hai cạnh) | `archive/2026-10-19-hero-wide-screen-backdrop.md` | 2026-10-19 | 2026-10-19 |

## Quy tắc tracking

- **Trạng thái:** `pending` (chưa xử lý) · `in_progress` (đang xử lý) · `done` (xong, change file đã archive) · `blocked` (kẹt, cần user) · `closed` (user đóng, không làm — change file chuyển `archive/` nếu có).
- **Agent intake (tự động, khi user chat yêu cầu/bug trong maintenance mode):**
  1. Tạo change doc `spec/changes/YYYY-MM-DD-<slug>.md` (copy `_TEMPLATE.md`, điền yêu cầu + acceptance từ lời user — thiếu thông tin thì hỏi ngắn 1 lần, KHÔNG bịa).
  2. Thêm 1 dòng vào bảng trên với trạng thái `pending`.
  3. Báo user: "✅ Đã ghi vào backlog: <tiêu đề> — gõ `/change` (hoặc `/change <slug>`) để xử lý." **KHÔNG code ngay.**
- **Agent xử lý change (`/change`):** khi change được xử lý xong (status `done` + chuyển `archive/`) → cập nhật hàng tương ứng: `in_progress` (khi bắt đầu) → `done` + ngày xong. `blocked` khi cần user quyết định.
- **Duy nhất 1 nguồn:** mỗi dòng = 1 change doc ở `spec/changes/`. Không xoá dòng đã `done` (giữ lịch sử), chỉ cập nhật trạng thái.
- **`/change --list`:** liệt kê các dòng chưa `done` từ bảng này (kèm slug để chạy `/change <slug>`).
