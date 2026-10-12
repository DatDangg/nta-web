# Spec update — 2026-10-13 · change `oc-eo-case-study-showcase`

- **Spec version**: 3.0.0 → **3.1.0** (MINOR — thêm R-08b: biến thể bố cục mới cho chi tiết case study)
- **Scope version**: v20 → **v21** (`feature-update`)
- **Change file**: `spec/changes/archive/2026-10-12-oc-eo-case-study-showcase.md`
- **Task**: `tasks/change-oc-eo-case-study-showcase/phase-1-task-01.md`
- ⚠️ **Ghi bù workflow**: code round 1 làm trực tiếp (session Cowork) và đã vào commit `1e90308`; change doc/task/
  spec ghi bù theo yêu cầu user; round 2 fix + close-out đi đúng workflow.

## Thay đổi

- **R-08b (mới)**: chi tiết case study có biến thể `layout: showcase` (dữ liệu `CaseStudyShowcase` trong
  frontmatter) — hero ảnh lớn, thẻ 3 số liệu, 3 cột Thách thức/Giải pháp đề xuất/Kết quả kỳ vọng, dòng lưu ý
  `note`, khối Camera AI + Flycam + `VmsMock`, carousel ảnh có caption, khối tầm nhìn (quote + `quoteSource`),
  thẻ CTA. Không MetaBar / khối văn xuôi / gallery.
- **`cover`**: ảnh thẻ ở `/case-studies` (và RelatedStudies/filter) ưu tiên `cover`, thiếu → `gallery[0]`.
- **Trang chủ**: `featuredCase` vi/en dùng `/images/cases/oc-eo/hero.jpg` + alt "Minh hoạ…".
- **Content**: `oc-eo-learning` vi/en chuyển `layout: showcase`; 6 ảnh `public/images/cases/oc-eo/`
  (hero = ảnh user; 5 ảnh carousel **crop từ hero**, placeholder — caption + alt ghi rõ minh hoạ).
- **design-spec**: Screen 9 thêm mục "biến thể `layout: showcase`".

## Impact

- **Direct**: `/case-studies/oc-eo-learning`, `/en/case-studies/oc-eo-learning`.
- **Dependents**: `CaseStudyCard` (list `/case-studies`, `CaseStudyFilter`, `RelatedStudies`); khối featured case `/`.
- **Regression**: case `dental-clinic-operations` giữ layout default (không `layout`/`cover`); JSON-LD
  Breadcrumb + Article giữ ở cả 2 nhánh.

## Acceptance / verify

- Round 1 FAIL (4 MAJOR) → round 2 fix → **round 2 PASS** (0 CRITICAL/MAJOR mở; MINOR-10/11/13/14 non-blocking).
- `npm run typecheck` PASS · `npm run lint` 0 errors (1 warning pre-existing mdx) · `npm run build` PASS
  (bản snapshot đúng scope commit; `next/font` Inter stub chỉ trong sandbox build vì không có mạng Google Fonts).
- CSS artifact: `.bg-[rgb(0_158_135/0.4)]`, `.border-[rgb(33_217_173/0.8)]` sinh đúng; 0 class `/NN` trên màu var.
- Playwright: vi 1440/390, en 1440, dental, `/case-studies` — HTTP 200, không scroll ngang, 0 console error.

## Residual

- 5 ảnh carousel là crop minh hoạ độ phân giải thấp — thay ảnh chụp thực địa khi có.
- Nút "Xem video giới thiệu" ẩn tới khi có URL video.
- Working tree còn change `site-wide-motion` (CountUp/split-line trên `ShowcaseHero`/`ShowcaseOverview`) **chưa
  commit** — tách khỏi commit này; Screen 9 ghi "result numbers static (KHÔNG count-up)" → change motion cần đối chiếu.
