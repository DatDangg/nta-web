---
id: en-invalid-slug-500
type: bug
status: in_progress   # 2026-10-15 gộp CR-026 + CR-032 → tasks/bug-en-invalid-slug-500/phase-1-task-01.md (chờ duyệt plan)
created: 2026-10-14
---

# URL tiếng Anh có slug sai trả 500 thay vì 404

## Yêu cầu
Các URL `/en/...` có slug không tồn tại hoặc sai nhóm đang trả **500**; phải trả **404** (trang not-found) như bản tiếng Việt.

## Bối cảnh / tái hiện (bug)
- Màn/route/role: trang chi tiết tiếng Anh, khách vãng lai (không đăng nhập).
- Bước tái hiện: mở `/en/blog/nope`, `/en/products/nope`, `/en/case-studies/nope`, `/en/solutions/ai/crm` (slug enterprise đặt sai nhóm AI), `/en/solutions/enterprise/boxai` (slug AI đặt sai nhóm enterprise).
- Expected: HTTP 404 + trang not-found tiếng Anh.
- Actual: HTTP 500; log lỗi liên quan `requestLocale` (next-intl).

## Acceptance (bắt buộc)
- [ ] 5 URL trên (và mọi slug sai dưới `/en/*/[slug]`) trả 404 với trang not-found tiếng Anh.
- [ ] Bản vi tương ứng vẫn 404; slug hợp lệ vi + en vẫn 200; redirect 301 giữ nguyên.
- [ ] Chạy được ở cả 2 chế độ `CONTENT_SOURCE=file|db`.

## Ghi chú
- Phát hiện khi crawl 79 URL làm baseline cho CR-031 P3-T02/P3-T04 (14/10/2026). Đã có từ trước CR-031 (baseline HEAD cũng 500), ghi chú liên quan CR-026.
- Bằng chứng crawl nằm ở scratchpad của phiên CR-031 (thư mục `before/`, `t4-base/`).
