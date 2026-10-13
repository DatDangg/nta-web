# Task 01: Case study nha khoa dạng showcase + nút mở chi tiết DentGo (close-out CR-002)

> Nguồn: CR-002 · Spec: R-08b (+ delta 3.2.1) · BR-004

## Phase
1 — UI + content

## Type
modification (content `dental-clinic-operations` vi/en sang `layout: showcase`) + mở rộng type showcase tương thích ngược

## Bối cảnh
Code chính đã nằm trong commit `78548bd` (gộp chung đợt "bộ trang danh sách mới"), đã push/deploy nhưng chưa qua
review + close-out. Task này = review + sửa lệch acceptance + spec delta + close-out.

## Classification / Risk
- Change type: **MODIFY** (content + type optional) · Risk: low
- Review level: **NORMAL** (component showcase dùng chung với Óc Eo nhưng field mới đều optional)
- Blast radius: `/case-studies/dental-clinic-operations` (vi/en), `/case-studies/oc-eo-learning` (regression), thẻ danh sách case study.

## Phát hiện khi review (round 1)
- Change doc ghi "nút hero Khám phá giải pháp mở thẳng `/solutions/enterprise/dentgo` (user yêu cầu 2026-10-13)"
  nhưng frontmatter vi/en vẫn là `href: "#solution"` (chỉ cuộn xuống khối Giải pháp).
  Root cause: yêu cầu cuối của user chưa được áp vào data trước khi commit `78548bd`.
- Fix: `hero.primaryCta.href` → `/solutions/enterprise/dentgo` (vi + en). `ShowcaseHero` dùng `Link` next-intl cho href
  không bắt đầu bằng `#` → tự thêm `/en` ở bản EN.

## Acceptance Criteria
- [x] `/case-studies/dental-clinic-operations` (+ `/en`) render showcase; 1440 + 390 không tràn ngang; 0 ảnh lỗi
- [x] Nút hero → `/solutions/enterprise/dentgo` (VI) · `/en/solutions/enterprise/dentgo` (EN) — click điều hướng đúng
- [x] Nút khối Giải pháp → trang DentGo
- [x] Óc Eo render như cũ (không tràn, 0 ảnh lỗi)
- [x] BR-004: số liệu dạng mô tả, `note` + caption ghi dữ liệu demo / ảnh minh hoạ
- [x] typecheck PASS · lint 0 error · build PASS

## Verification summary
- `npm run typecheck` (device) PASS · `npm run lint` (device) 0 error, 1 warning cũ `mdx/index.tsx`
- `npm run build` (container, bản `git archive HEAD` + fix; Google Fonts bị chặn mạng sandbox → mock CSS font chỉ để build) PASS
- Playwright `next start`: kiểm overflow, ảnh, link hero/khối Giải pháp, vi/en

## Residual risk
- Nội dung cột Thách thức / Thay đổi mang lại suy ra từ mô tả cũ + trang DentGo, chưa có xác nhận từ khách hàng (đã ghi `note`).

## Doc impact
- `SPECIFICATIONS.md` R-08b (field optional mới) → spec 3.2.1 · không đổi API/ERD.
