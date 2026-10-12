---
id: oc-eo-case-study-showcase
type: feature
status: done                        # round 2 PASS 2026-10-13
created: 2026-10-12
---

# Case study Óc Eo – Ba Thê: trang chi tiết dạng showcase + ảnh thẻ danh sách + ảnh khối trang chủ

> ⚠️ **Ghi bù (retroactive).** Code đã được làm trực tiếp trong session Cowork 2026-10-12 **không qua**
> `/change` (vi phạm router `AGENTS.md`), sau đó đã nằm trong commit `1e90308`. File này + task +
> spec delta được ghi bù theo yêu cầu user để đưa change vào đúng workflow.

## Yêu cầu
User (3 yêu cầu liên tiếp, cùng 1 mục tiêu):
1. "sửa lại phần content của cái case study óc eo - ba thê như ảnh 1" — ảnh mockup
   `tasks/change-oc-eo-case-study-showcase/refs/target-showcase-mockup.jpg` + ảnh minh hoạ
   `refs/source-hero.jpg` (camera AI + flycam trên khu khảo cổ).
2. "thay ảnh này vào cái của óc eo ba thê trong cái danh sách case study ở ngoài" — ảnh thẻ ở `/case-studies`.
3. "sửa cả ở ngoài này luôn, ở trang chủ" — khối "Câu chuyện khách hàng / Customer story" ở `/`
   (trước: `refs/home-featured-before.jpg`, sơ đồ SVG kiến trúc).

## Acceptance (bắt buộc)
- [x] `/case-studies/oc-eo-learning` (+ `/en`) render bố cục showcase giống mockup: hero (breadcrumb, eyebrow
      "Phương án đề xuất · 2026", h1 2 màu, subtitle, mô tả, CTA anchor) + ảnh lớn; thẻ 3 số liệu; 3 cột
      Thách thức / Giải pháp đề xuất / Kết quả kỳ vọng; khối Camera AI + Flycam + VMS minh hoạ; carousel ảnh;
      khối Hướng tới tương lai (quote); thẻ CTA bo góc → `/contact`.
- [x] Case study khác (nha khoa) giữ nguyên layout default (opt-in bằng `layout: showcase`).
- [x] Thẻ Óc Eo ở `/case-studies` dùng `hero.jpg` (field `cover`), case khác không đổi.
- [x] Khối featured case ở trang chủ (vi + en) dùng `hero.jpg` + alt mô tả là minh hoạ.
- [x] Nội dung vi/en đầy đủ, key parity.
- [x] Không còn class Tailwind không sinh CSS (reviewer r1 MAJOR-1 — fix round 2).
- [x] Ảnh crop từ hình minh hoạ AI được ghi rõ là minh hoạ (BR-004 — caption + alt "Minh hoạ —", fix round 2).
- [x] Reviewer PASS (round 2, NORMAL).

## Ghi chú
- Tham chiếu: R-08, R-08a (`SPECIFICATIONS.md`), design-spec Screen 9, BR-004 (không trình bày phương án như
  kết quả đã triển khai).
- Spec delta: thêm **R-08b** (biến thể bố cục `showcase` cho chi tiết case study + `cover` cho thẻ) → MINOR
  `3.0.0 → 3.1.0`. Xem `spec/updates/2026-10-12-oc-eo-case-study-showcase.md`.
- Quyết định có chủ ý (ghi nhận theo reviewer MAJOR-3): **h1 là slogan** ("Bảo tồn di sản bằng công nghệ AI"),
  tên dự án nằm ở subtitle; biến thể showcase **không** render MetaBar
  (client/sector/year), 3 khối Challenge/Solution/Result dạng văn xuôi và `gallery` 3 sơ đồ SVG — thay bằng
  dữ liệu `showcase` có cấu trúc. Disclaimer "phương án đề xuất" thể hiện qua eyebrow + cột "Kết quả kỳ vọng" +
  ghi chú "(tùy khảo sát và phê duyệt)" + dòng `note` dưới thẻ số liệu (round 2); quote có `quoteSource`
  ("Định hướng của NTA cho phương án"); carousel có `caption` minh hoạ. `gallery` giữ trong frontmatter làm fallback cho layout default.
- Exemption craft-floor (eyebrow trên heading, gradient text h1, `backdrop-blur-sm` thẻ quote): user yêu cầu
  khớp mockup; giới hạn trong biến thể showcase, không lan ra component dùng chung.
- Nút "Xem video giới thiệu" trong mockup: **chỉ render khi có `hero.video.href` thật** — chưa có video ⇒ ẩn.
- Commit hygiene (reviewer MAJOR-4): code nằm trong `1e90308` bị gộp cùng file ngoài scope của session khác
  (Hero/HeroVisual, globals.css, next.config/tsconfig/next-env, Footer, home.ts heroPanels, ảnh home-*.png,
  .gitignore, 2 file `.context/runs`/`tasks`). Đã push/không rewrite history — chỉ ghi nhận ở đây.

## Kết quả
- Round 1 FAIL (4 MAJOR) → round 2 fix (VmsMock tách file, class alpha arbitrary, caption/alt minh hoạ, `note`,
  `quoteSource`, `Link` cho CTA không phải anchor, a11y carousel) → **round 2 PASS**.
- Spec 3.0.0 → **3.1.0** (R-08b) · scope v20 → v21 · design-spec Screen 9 + biến thể showcase.
- Tổng file showcase: 9 (`ShowcaseHero/Overview/Technology/Photos/Vision/CTA/Layout`, `VmsMock`, `icons`).
