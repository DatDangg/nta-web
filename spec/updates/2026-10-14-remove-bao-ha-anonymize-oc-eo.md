# Spec Update — 2026-10-14 remove-bao-ha-anonymize-oc-eo
**spec_version:** 3.15.0 → 4.0.0 (MAJOR)
**Trigger:** feature-update (CR-025, REMOVE + MODIFY content)

**Lý do MAJOR:** theo `docs/SPEC_VERSIONING.md` — MAJOR = "xoá requirement / đổi ngữ nghĩa requirement".
CR-025 (1) **xoá hẳn** requirement R-08b.2 (case study `ai-box-bao-ha` → route trả 404) và bỏ một ý của R-06b;
(2) **đổi ngữ nghĩa** R-08a (bỏ ràng buộc "giữ nguyên slug `oc-eo-learning`", đổi URL công khai sang slug mới).
URL public cũ không còn phục vụ nội dung (404 / 301) ⇒ breaking với consumer/test đang bám URL & nội dung cũ.
Khác CR-020 (3.12.0 MINOR): CR-020 chỉ bỏ khối UI bên trong R-04, không xoá requirement nào, không đổi route.

**Requirements:**
- **XOÁ (DEPRECATED) R-08b.2** — case study `ai-box-bao-ha` gỡ hẳn (MDX vi/en, meta listing, ảnh `/images/cases/bao-ha/*`,
  mọi link). `/case-studies/ai-box-bao-ha` (vi/en) → **404** bằng `src/app/[locale]/not-found.tsx` có sẵn, **không redirect**;
  không xuất hiện ở `/case-studies`, trang chủ, trang giải pháp, sitemap. Nội dung gốc giữ trong spec để truy vết.
- **SỬA R-06b** — bỏ ý "đề cập triển khai thực tế tại Đền Bảo Hà": trang `boxai` (vi/en) không còn khối Bảo Hà
  (`sections` + `showcase.details`), `relatedCases` không còn `ai-box-bao-ha`. Ảnh dashboard BoxAI (`01-dashboard-quan-tri.jpg`,
  `02-tasks-channels.jpg`) **giữ nguyên** (user chốt).
- **SỬA R-06e (link case study)** — trỏ case study khu di tích slug mới `heritage-site-ai-camera`.
- **THÊM R-08a.1** — case study khu di tích: nội dung hiển thị vi/en **không** chứa địa danh ("Óc Eo", "Ba Thê", tên riêng định danh)
  ở mọi field render (title, client, challenge/solution/result, gallery alt, showcase hero/pillars/photos/vision, metadata/JSON-LD);
  thay bằng "một khu di tích ở Việt Nam" / "a heritage site in Vietnam"; số liệu (~433 ha, khu di tích quốc gia đặc biệt, ~200 camera,
  12 tuần) giữ nguyên. Slug `oc-eo-learning` → `heritage-site-ai-camera`; 3 URL cũ (`/case-studies/…`, `/vi/…`, `/en/…`) → **301**
  cùng locale; sitemap chỉ slug mới; link nội bộ (boxai/flycam `relatedCases`, thẻ cuối `/solutions/ai`, listing meta) trỏ slug mới.
  **Bổ sung lúc publish:** tên file/thư mục ảnh cũng không chứa địa danh (`cases/oc-eo/` → `cases/heritage-site/`,
  `illustrations/oc-eo-*.svg` → `heritage-site-*.svg`; xoá `oc-eo-learning-overview.svg` mồ côi) — user chốt (f) 2026-10-14.
- **Làm rõ R-08a** — dòng "giữ nguyên slug `oc-eo-learning`" đánh dấu đã thay bởi R-08a.1.

**Thay đổi code:**
- `bc36b75` (task-01): xoá `src/content/case-studies/{vi,en}/ai-box-bao-ha.mdx`, `public/images/cases/bao-ha/*`; `src/content/listings.ts`
  bỏ entry; `src/content/solutions/{vi,en}/boxai.mdx` bỏ section + showcase item + relatedCases Bảo Hà.
- `b0d11d1` (task-02): `src/content/case-studies/{vi,en}/oc-eo-learning.mdx` → `heritage-site-ai-camera.mdx` (13 field theo bảng user duyệt);
  `next.config.ts` `redirects()` 301; ảnh đổi tên `public/images/cases/heritage-site/*`, `public/images/illustrations/heritage-site-*.svg`;
  link `src/content/listings.ts`, `src/app/[locale]/solutions/ai/page.tsx`, `src/content/solutions/{vi,en}/{boxai,flycam}.mdx`.

**Ảnh hưởng:** `/solutions/ai/boxai` (+`/en`), `/solutions/ai/flycam` (+`/en`), `/solutions/ai` (+`/en`), `/case-studies` (+`/en`),
trang chủ khối Câu chuyện khách hàng (R-03b), `/case-studies/heritage-site-ai-camera` (+`/en`), redirect slug cũ, sitemap.
Không đổi API/schema. Intent doc `docs/BRD.md` giữ nguyên (user chốt g).

**Known issue (ngoài phạm vi CR-025):** `/en/case-studies/ai-box-bao-ha` hiện trả **500** thay vì 404 — lỗi có từ trước
(`/en/<dynamic>/<slug-không-tồn-tại>` → 500), đã ghi **CR-026** `spec/changes/2026-10-14-en-dynamic-slug-not-found-500.md`.

**Nguồn:** `spec/changes/2026-10-14-remove-bao-ha-anonymize-oc-eo.md`.
