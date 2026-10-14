# Task 02: Ẩn địa danh case study Óc Eo + đổi slug `oc-eo-learning` → `heritage-site-ai-camera` + redirect 301 (CR-025 phần 3)

> Nguồn: CR-025 `spec/changes/2026-10-14-remove-bao-ha-anonymize-oc-eo.md` · Spec: R-08a.1 (mới), R-06e (link case study)
> Phụ thuộc: task-01 xong (tránh conflict `boxai.mdx` `relatedCases` + `listings.ts`).

## Phase
1 — content + config route (next.config redirects)

## Type
MODIFY (content + slug/URL) — không đổi component/schema.

## Classification / Risk
- Change type: **MODIFY** · Risk: **medium** (đổi URL public đã index/chia sẻ + thêm `redirects()` ở `next.config.ts` — tầng routing dùng chung, phải đúng với `localePrefix: 'as-needed'` của next-intl)
- Review level: **STRICT** (đụng navigation/routing dùng chung: `next.config.ts`, slug lookup trong `src/app/[locale]/solutions/ai/page.tsx`)
- Blast radius: `/case-studies/heritage-site-ai-camera` (vi/en, mới), URL cũ (301), `/case-studies` (thẻ), trang chủ, `/solutions/ai` (thẻ CTA cuối lưới),
  `/solutions/ai/boxai` + `/solutions/ai/flycam` (thẻ related), sitemap.

## Quyết định user (2026-10-14)
- Slug mới `heritage-site-ai-camera`; slug cũ **301** (vi + en).
- Cách gọi chung: vi "một khu di tích ở Việt Nam" · en "a heritage site in Vietnam".
- Giữ số liệu: "~433 ha", "khu di tích quốc gia đặc biệt" / "Special National Monument", ~200 camera, 12 tuần.

## Files (file:line khảo sát ngày 2026-10-14)
### Đổi tên file + slug
- `git mv src/content/case-studies/vi/oc-eo-learning.mdx → src/content/case-studies/vi/heritage-site-ai-camera.mdx` (+ en tương tự); `slug:` dòng 2.
### Text hiển thị cần thay (vi `src/content/case-studies/vi/...`, en cùng số dòng)
| dòng | field | vi hiện tại → đề xuất | en hiện tại → đề xuất |
|---|---|---|---|
| 3 | title | "…tại khu di tích Óc Eo – Ba Thê" → "Phương án AI camera và flycam cho một khu di tích ở Việt Nam" | "…for the Óc Eo – Ba Thê heritage site" → "Proposed AI camera and drone plan for a heritage site in Vietnam" |
| 6 | client | "Khu di tích Óc Eo – Ba Thê" → "Một khu di tích ở Việt Nam" | → "A heritage site in Vietnam" |
| 8 | challenge | "Khu di tích quốc gia đặc biệt Óc Eo – Ba Thê có quy mô…" → "Khu di tích quốc gia đặc biệt này có quy mô khoảng 433 ha…" | "The Óc Eo – Ba Thê Special National Monument spans…" → "This Special National Monument spans about 433 hectares…" |
| 20 | gallery alt | "…cho phương án Óc Eo – Ba Thê" → "…cho phương án khu di tích" | → "…for the heritage site proposal" |
| 30 | hero.breadcrumbLabel | "Óc Eo – Ba Thê" → "Khu di tích ở Việt Nam" | → "Heritage site in Vietnam" |
| 34 | hero.subtitle | → "Giải pháp Camera AI & Flycam cho một khu di tích ở Việt Nam" | → "AI camera & drone solution for a heritage site in Vietnam" |
| 35 | hero.description | "…bảo tồn bền vững di sản Óc Eo – Ba Thê." → "…bảo tồn bền vững di sản." | "…preservation of Óc Eo – Ba Thê." → "…preservation of the site." |
| 38 | hero.image.alt | "Minh hoạ khu khảo cổ Óc Eo – Ba Thê…" → "Minh hoạ khu khảo cổ…" | bỏ tên tương tự |
| 73 | pillars result item | "…di sản Óc Eo – Ba Thê." → "…di sản khu di tích." | → "…of the heritage site." |
| 98 | photos.title | "Không gian di sản Óc Eo – Ba Thê" → "Không gian khu di tích" | → "The heritage site landscape" |
| 112 | photos alt | "…núi Ba Thê phía sau…" → "…núi phía sau khu di tích" | "…Ba Thê mountain behind…" → "…a mountain behind the site" |
| 116 | vision.description | "…của Óc Eo – Ba Thê…" → "…của khu di tích…" | → "…of the site…" |
| 117 | vision.quote | "…di sản Óc Eo – Ba Thê, góp phần…" → "…di sản, góp phần…" | tương tự |
> Text đề xuất trên là mặc định; builder giữ nghĩa câu, chỉ bỏ địa danh. **USER ĐÃ DUYỆT NGUYÊN BẢNG (2026-10-14).**
### Link / lookup nội bộ đổi sang slug mới
- `src/content/listings.ts:246` (vi) + `:261` (en) — key `'oc-eo-learning'` → `'heritage-site-ai-camera'`
- `src/app/[locale]/solutions/ai/page.tsx:42` — `item.slug === 'oc-eo-learning'` → `'heritage-site-ai-camera'`; comment `:43` bỏ chữ "Óc Eo" (tuỳ chọn, nội bộ)
- `src/content/solutions/{vi,en}/boxai.mdx:75` (sau task-01 là dòng duy nhất của `relatedCases`) — slug mới
- `src/content/solutions/{vi,en}/flycam.mdx:78` — slug mới
### Redirect 301
- `next.config.ts` — thêm `async redirects()` với `statusCode: 301` (KHÔNG dùng `permanent: true` vì Next trả **308**):
  - `/case-studies/oc-eo-learning` → `/case-studies/heritage-site-ai-camera` (vi, không prefix — `localePrefix: 'as-needed'`)
  - `/vi/case-studies/oc-eo-learning` → `/case-studies/heritage-site-ai-camera` (tránh 2 bước redirect qua middleware)
  - `/en/case-studies/oc-eo-learning` → `/en/case-studies/heritage-site-ai-camera`
### Doc reconcile (as-built)
- `docs/DESIGN.md:125` — slug mới + bỏ địa danh; `docs/ERD.md:30` "(Óc Eo, phòng khám…)" → "(khu di tích, phòng khám…)"
- `docs/backlog-content.md:21` — slug mới (tham chiếu)

## Không làm (ngoài scope / chờ user)
- Tên file ảnh/asset có chữ `oc-eo` (`/images/cases/oc-eo/*.jpg`, `/images/illustrations/oc-eo-*.svg`, `public/images/cases/oc-eo-learning-overview.svg` mồ côi) — không hiển thị trên trang nhưng lộ trong URL ảnh/HTML → **USER CHỐT (2026-10-14): ĐỔI** — `git mv public/images/cases/oc-eo/` → `public/images/cases/heritage-site/`, `public/images/illustrations/oc-eo-*.svg` → `heritage-site-*.svg`, cập nhật mọi tham chiếu trong src/; XOÁ `public/images/cases/oc-eo-learning-overview.svg` (mồ côi). Acceptance: `grep -rn "oc-eo" src public` = 0 (trừ comment nội bộ).
- Intent doc `docs/BRD.md:90,98` ("vd Óc Eo") — **USER CHỐT: GIỮ NGUYÊN** (không sửa).
- Comment code nội bộ `src/app/[locale]/case-studies/[slug]/page.tsx:54`, `src/components/case-studies/showcase/ShowcaseTechnology.tsx:38`, `src/content/types.ts:167,176,188` — không hiển thị, giữ nguyên (theo ghi chú CR).

## Acceptance Criteria
- [ ] `/case-studies/heritage-site-ai-camera` + `/en/...` → 200; HTML render (gồm `<title>`, meta description, JSON-LD, alt) **không** chứa "Óc Eo", "Oc Eo", "Ba Thê", "Ba The".
- [ ] Hiển thị "một khu di tích ở Việt Nam" (vi) / "a heritage site in Vietnam" (en) ở title/subtitle/client.
- [ ] Giữ "433 ha" + "khu di tích quốc gia đặc biệt"/"Special National Monument".
- [ ] `curl -sI /case-studies/oc-eo-learning`, `/vi/case-studies/oc-eo-learning` → `301` + `Location: /case-studies/heritage-site-ai-camera`; `/en/case-studies/oc-eo-learning` → `301` + `/en/case-studies/heritage-site-ai-camera`.
- [ ] `sitemap.xml` có `heritage-site-ai-camera`, không có `oc-eo-learning`.
- [ ] Thẻ CTA cuối `/solutions/ai`, thẻ related ở `boxai` + `flycam`, thẻ ở `/case-studies` + trang chủ → link slug mới, render đủ (icon/theme từ listing meta).
- [ ] `grep -rn "oc-eo-learning" src` = 0; `grep -rnE "c Eo|Ba Th" src/content` = 0.
- [ ] typecheck · lint · build PASS.

## Verify commands (`.context/project-config.md`)
- Windows: `npm run typecheck` · `npm run lint` · `npm run build`
- Cowork/VM: `bash tools/linux-build.sh verify`; smoke redirect/404/200: `bash tools/linux-build.sh serve 3100 <curl -sI ...>`
- `test_command: null` → skip, no test framework.

## Retry / Escalation
- Attempt tối đa 3; ≥3 fail → `architecture_review_needed`, dừng chờ review.
- Nếu redirect xung đột middleware next-intl (vd loop/2 bước) → ghi error-memory, KHÔNG chuyển sang middleware custom khi chưa hỏi.

## Doc impact
- `SPECIFICATIONS.md`: R-08a.1 mới + R-06e (đã viết ở bước spec delta).
- `docs/DESIGN.md:125`, `docs/ERD.md:30`, `docs/backlog-content.md:21` reconcile. Không đổi API.

## Verification summary
- (Builder điền)
