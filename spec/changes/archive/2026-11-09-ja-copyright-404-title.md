---
id: ja-copyright-404-title
type: bug
status: done
created: 2026-11-09
---

# Bản ja: copyright footer còn tiếng Anh + tiêu đề tab trang 404 thành tiếng Việt

## Yêu cầu
User (2026-11-09, sau quét ngôn ngữ 30 trang `/ja` trên prod), chọn sửa 2 mục:
1. Footer trang ja hiện "© NTA. All rights reserved." (tiếng Anh) — bản vi đã dịch ("© NTA. Bảo lưu mọi quyền.").
2. Trang 404 (`/ja/<sai>`, cả `/en/<sai>`, `/<sai>`): HTML server có `<title>404 | NTA</title>` nhưng load xong tiêu đề tab thành "NTA | Giải pháp công nghệ doanh nghiệp" (tiếng Việt) ở mọi locale.

## Bối cảnh / tái hiện (bug)
- Màn/route: footer mọi trang `/ja/...`; trang 404 mọi locale.
- Bước tái hiện: mở `https://ntavietnam.tech/ja/khong-ton-tai` → chờ load → xem tiêu đề tab (`document.title`).
- Expected: footer ja bằng tiếng Nhật; tiêu đề tab đúng ngôn ngữ của trang.
- Actual: footer tiếng Anh; tiêu đề tab tiếng Việt.
- Root cause (2): `src/app/[locale]/layout.tsx:33` `generateMetadata` trả `title` cứng tiếng Việt cho mọi locale; trang 404 sau khi load hiển thị title mặc định của layout.

## Acceptance (bắt buộc)
- [x] `ja.json` `footer.copyright` bằng tiếng Nhật; vi/en không đổi.
- [x] Title mặc định của layout theo locale (vi/en/ja), không gọi next-intl trong metadata (giữ ràng buộc CR-026/CR-032 — tránh 500 ở slug sai).
- [x] Trang 404 `/ja/...`, `/en/...`, `/...`: tiêu đề tab sau load đúng ngôn ngữ; vẫn trả HTTP 404, không 500.
- [x] Trang có title riêng không đổi.
- [x] typecheck + lint + test + build PASS.

## Ghi chú
Không đụng các mục user không chọn (địa chỉ tiếng Việt, breadcrumb JSON-LD "Blog").

## Đóng (2026-11-09)
- Fix: `ja.json` footer.copyright → "© NTA. 無断転載を禁じます。"; `src/app/[locale]/layout.tsx` title mặc định theo locale (map tĩnh vi/en/ja, không gọi next-intl).
- Verify: typecheck/lint PASS, test 228/231 (1 fail có sẵn content-rules uploads), build PASS; dev server: 404 ja/en/vi title đúng ngôn ngữ, HTTP 404 giữ.
- Reviewer NORMAL PASS round 1 — `.context/review-reports/bug-ja-copyright-404-title-phase-1-task-01-round-1-review.md`.
- Doc impact: no doc impact (DESIGN không ghi title mặc định). Spec: không đổi requirement → không bump.
