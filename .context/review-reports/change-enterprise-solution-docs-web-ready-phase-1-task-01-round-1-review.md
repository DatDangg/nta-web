# Review — change-enterprise-solution-docs-web-ready · phase-1-task-01 · round-1

- **Task:** `tasks/change-enterprise-solution-docs-web-ready/phase-1-task-01.md`
- **Change file:** `spec/changes/2026-10-10-enterprise-solution-docs-web-ready.md`
- **Review level:** NORMAL
- **Reason:** docs-only (4 reference README), không đụng shared/API/auth/schema/payment; không có code chạy → không thuộc diện STRICT.
- **Blast radius:** Không. Docs không được render lên web; là nguồn nội dung cho change `.mdx` sau.
- **⚠️ Caveat quan trọng:** môi trường chặn spawn subagent lồng (subagent depth limit = 1; session này đã là subagent `change-request`),
  nên **builder + reviewer chạy inline trong cùng session** (không độc lập hoàn toàn). Cùng pattern đã ghi nhận ở
  `change-cleanup-gcp-drift-comment-permission` ("Reviewer round-1 inline — primary nên re-run độc lập").
  **Đề xuất: primary re-run reviewer độc lập trước khi coi là đóng hoàn toàn.**

## Verify commands + result

| Check | Command | Result |
|---|---|---|
| Scope | `git status --short` | Chỉ `docs/reference/hrm-mock/README.md` (M) + 3 README trong dir untracked (`crm-dragon-hotpot`, `lms-ismartschool`, `dentgo-smile`). Không đụng `src/`, `public/`, `boxai/`, `.mdx`. `package-lock.json` dirty có sẵn (ngoài scope). |
| Diff tracked | `git diff --stat -- docs/reference` | `hrm-mock/README.md` 79 insertions / 119 deletions (rút gọn). |
| Headings | grep `^## ` | 8 heading giống hệt nhau ở cả 4 file, đúng thứ tự. |
| Images | so `screenshots/NN-*.png` referenced vs file thật | Khớp 100% (HRM 5, CRM 5, LMS 7, DentGo 5). |
| Banned phrase | grep `bản đồ chức năng \| 60 mục \| 70 mục \| 13 trạng thái` | 0 match. |
| Build/lint/typecheck | — | `skip, no code change` (docs-only). |

## Findings

- **0 CRITICAL · 0 MAJOR.**
- **MINOR-1 (non-blocking):** H1 tiêu đề CRM giữ tên tham chiếu "Dragon Hot Pot" (khớp tên sản phẩm/slug/URL trong nguồn cũ),
  và §8 map H1 → field `title`. Nếu trang public **không** muốn lộ tên khách hàng, cần đổi `title` ở change `.mdx` sau
  (dùng tên trung tính "CRM chuỗi F&B"). Không phải lỗi của task docs này (nguồn cũ đã có tên; change file không yêu cầu ẩn).
- **MINOR-2 (non-blocking):** §1 giữ con số provenance (CRM 2.627 khách/7.435 đơn; LMS 91 học sinh; DentGo 248 hồ sơ; HRM 248 NV).
  Đã ghi rõ "mốc provenance, không dùng làm số liệu marketing" và `highlights` để trống — đúng ràng buộc không bịa số.
- **MINOR-3 (non-blocking):** Ô "Ảnh minh hoạ" ở §4 gộp nhiều ảnh cho 1 năng lực (LMS năng lực 4 có 3 ảnh; DentGo năng lực 2 có 2 ảnh).
  Mapping §8 liệt kê đủ thứ tự nên builder `.mdx` vẫn suy được thứ tự — chấp nhận.

## Kiểm tra acceptance (change file)

| # | Tiêu chí | Kết quả |
|---|---|---|
| 1 | 4 file dùng cùng bộ 8 heading, đúng thứ tự | PASS |
| 2 | Mỗi file có bảng mapping sang schema `.mdx` + liệt kê đủ ảnh + thứ tự đề xuất | PASS |
| 3 | Mỗi "năng lực chính" trỏ ≥1 ảnh cụ thể trong `screenshots/` | PASS |
| 4 | Không còn "bản đồ chức năng N mục / M nhóm" ở §2 & §6 | PASS |
| 5 | Không bịa tên khách hàng / KPI / năm triển khai | PASS (xem MINOR-1/MINOR-2) |
| 6 | `hrm-mock/README.md` vẫn cảnh báo mockup rõ | PASS (blockquote đầu file + §1) |
| 7 | Không sửa file ngoài `docs/reference/**` | PASS (chỉ 4 README) |

## Verdict

**PASS** (NORMAL) — 0 CRITICAL/MAJOR; 3 MINOR non-blocking (2 ghi chú dành cho change `.mdx` sau, 1 chấp nhận).
Caveat: review inline do env chặn subagent lồng → primary nên re-run reviewer độc lập.
