# 2026-10-12 — Thay ảnh placeholder còn lại trên toàn site

- **Class:** MODIFY (thay ảnh render) + REMOVE (bỏ ô bản đồ + dòng placeholder ở `/contact`)
- **Risk:** MEDIUM — chạm `home.ts`, `Hero.tsx`, `SolutionCard`, `CaseStudyCard`, content mdx, i18n
- **Trạng thái:** User đã duyệt hướng xử lý + "làm hết một lượt, không dừng giữa"
- **Nhánh:** `main` — **commit thẳng trên main, CHƯA push, CHƯA deploy**
- **Thay thế:** `2026-10-12-solution-card-real-images.md` (task T9 xong — thẻ `/solutions/enterprise` đã dùng ảnh v2; T10 giữ placeholder)

## 1. Vấn đề

Còn nhiều ảnh placeholder SVG (khung xám + chữ) trên production.

## 2. Khảo sát (đã đối chiếu local)

| # | Vị trí (file:line) | Hiện tại | Hướng |
|---|---|---|---|
| 1 | Hero `src/components/home/Hero.tsx:31` | `solutions/enterprise.svg` | Mock collage enterprise v2 |
| 2 | Thẻ "Giải pháp Doanh nghiệp" | ✅ **đã xong** (`v2/lms/01-tong-quan.png`, `shot:true`) | — |
| 3 | `src/content/home.ts:13` / `:25` | `solutions/ai.svg` | Minh hoạ SVG không chữ |
| 4 | `src/content/home.ts:14` / `:26` | `solutions/apps.svg` | Minh hoạ SVG không chữ |
| 5 | 2 thẻ sản phẩm trang chủ `home.ts:17,18,29,30` | `products/*.svg` | **Ảnh do user cung cấp** — task-03 |
| 6 | `/products` `src/content/products/{vi,en}/{music-app,hair-style-ai}.mdx:6` | `products/*.svg` | **Ảnh do user cung cấp** — task-03 |
| 7 | `/solutions/ai` BoxAI | `solutions/boxai.svg` | Dùng `solutions/boxai/01-dashboard-quan-tri.jpg` (đã có sẵn) |
| 8 | `/solutions/ai` Flycam | `solutions/flycam.svg` | Mock macOS dashboard điều hành bay |
| 9 | `/solutions/ai` Talvra | `solutions/custom-ai.svg` | Mock macOS chat trợ lý AI |
| 10 | `/blog` 4 ảnh bìa | `blog/*-cover.svg` | SVG series 4 hình cùng bộ |
| 11 | Thẻ case study nha khoa | `cases/dental-clinic-operations-overview.svg` | Dùng `solutions/v2/dentgo/01-tong-quan.png` |
| 12 | Gallery `/case-studies/oc-eo-learning` (`oc-eo-learning.mdx:19`, 1 ảnh) | `oc-eo-learning-overview.svg` | Sơ đồ kiến trúc 3 tầng, mở rộng lên 3 ảnh |
| 13 | Thẻ case study Óc Eo (home + `/case-studies`) | `oc-eo-learning-overview.svg` | Sơ đồ SVG |
| 14 | `/about` 2 thẻ đội ngũ (`about/{vi,en}/about.mdx:11,14`) | `about/team-placeholder.svg` (**có chữ "Ảnh đội ngũ sẽ cập nhật"**) | Minh hoạ trừu tượng không chữ, **không mặt người** |
| 15 | `/contact` | `MapEmbed.tsx:6` nhúng Google Map `?q=Vietnam&output=embed` (cả nước); `vi.json:171` `contact.placeholders.*` + giờ làm việc đều chứa "(placeholder)" | **Ẩn ô bản đồ + ẩn dòng placeholder** — user đã duyệt |
| 16 | OG image | ✅ `og-default.png` đã có logo NTA + slogan, đúng 1200×630 | **Không làm** |

## 3. Yêu cầu đã chốt

1. Dùng ảnh có sẵn cho #7, #11 (v2 DentGo cho thẻ + gallery).
2. Dựng mock HTML/CSS trong `scripts/screenshots/mock-<slug>/`, chụp bằng pipeline có sẵn
   (`scripts/screenshots/capture.mjs`), cùng phong cách ảnh v2.
3. Sơ đồ SVG cho Óc Eo — **không** dựng ảnh hiện trường/di tích giả.
4. Minh hoạ SVG không chữ cho #3, #4, #13, #14 — cùng một bộ phong cách.
5. Mock/dữ liệu **giả**, ngữ cảnh Việt Nam, không tên/thương hiệu/logo thật.
6. Sản phẩm chưa ra mắt hoặc mock không phải app thật → alt có tiền tố
   `"Giao diện minh hoạ — "` / `"Illustrative interface — "`.
7. Alt **riêng từng ảnh**, VI/EN. Minh hoạ SVG không chữ → dùng chung 2 locale.
8. Đồng bộ design token site + phong cách ảnh v2. Ảnh có khung: nền ngoài trong suốt,
   bóng do component thêm, thẻ cao đều, **không cắt 2 bên**.
9. **Mọi mock và script lưu trong repo** để tạo lại được.
10. #5/#6: dùng ảnh user cung cấp, **ép tỉ lệ 16/10, KHÔNG cắt chữ**.
11. Commit trên `main`. **CHƯA push.**

## 4. Acceptance

- [ ] #1 hero dùng collage enterprise v2; ảnh hiện đủ, không cắt 2 bên
- [ ] #3 #4 #13 #14 là SVG không chữ (`grep` không có `<text>`), cùng bộ phong cách
- [ ] #7 #11 dùng ảnh thật có sẵn; alt có tiền tố "Giao diện minh hoạ —" nếu là mock giao diện
- [ ] #8 #9 là mock macOS; ô video Flycam là khung vẽ, **không** ảnh chụp từ trên giả như thật
- [ ] #10 4 ảnh bìa blog nhìn ra **một series**
- [ ] #12 gallery Óc Eo có 3 ảnh
- [ ] #14 không có mặt người, không còn chữ "sẽ cập nhật"
- [ ] #15 không còn iframe bản đồ, không còn chữ "(placeholder)"
- [ ] Mọi `<img>` `naturalWidth > 0`; overflow 0 ở 375/1440; `check-left-align` PASS; VI + EN
- [ ] lint · typecheck · build PASS; reviewer PASS
- [ ] KHÔNG push, KHÔNG deploy

## 5. Task breakdown

- **T01** — dựng assets: mock enterprise/flycam/talvra + SVG (ai, apps, oc-eo, blog×4, team×2) → commit
- **T02** — wiring: `home.ts`, `Hero.tsx`, mdx solutions/cases/blog/about, i18n alt → commit
- **T03** — `/contact`: bỏ bản đồ + dòng placeholder → commit
- **T04** — `/products` + 2 thẻ sản phẩm: dùng ảnh user cung cấp, ép 16/10 → commit

## 6. Ngoài scope

- `/solutions/enterprise` cards (đã xong) · `og-default.png` (đã ổn)
- `AppCard` / `ProductCard` / `CaseStudyCard` / `RelatedSolutions` không đổi hành vi
- `cardImageClass` trong `src/components/cards/cardStyles.ts` dùng chung 4 component → **không sửa**,
  thêm class riêng nếu cần
- Không thêm OG image, bản đồ giả, thông tin liên hệ giả, người giả