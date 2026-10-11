# Spec Update — 2026-10-11 solution-detail-redesign

**spec_version:** 3.0.0 → 3.0.0 (**KHÔNG bump — không đổi requirement/behavior contract**)
**Trigger:** feature-update (change-request, class MODIFY render layout + content data)
**Change:** `spec/changes/archive/2026-10-11-solution-detail-redesign.md` (risk MEDIUM, T1–T5 done)
**Tasks:** `change-solution-detail-redesign-phase-1-task-01…05` · review PASS (T1/T2/T5 STRICT, T3/T4 NORMAL)

## Requirements

- **KHÔNG thêm/sửa/xoá requirement nào.** `SPECIFICATIONS.md` giữ nguyên 27 req R-01…R-27.
  - Change đổi **cách hiển thị** Screen 4 (trang chi tiết giải pháp) theo design spec
    `.context/design-spec-solution-detail.md` — không đổi ngữ nghĩa R-05 (giải pháp),
    R-06 (nội dung), R-07 (blog), R-24 (a11y), R-23 (responsive).
  - Schema `Solution.features: Feature[]` + field mới (`heroShot`/`imageCaption`/`layout`/
    `compliance`/`aiSection`/`audience`/`cta`) là **additive** + normalize ngược
    (`normalizeFeatures` chấp nhận `string[]`) → data cũ vẫn render, rollback an toàn.
- **Lý do KHÔNG bump:** theo `docs/SPEC_VERSIONING.md` — không requirement nào thêm/sửa/xoá/
  đổi ngữ nghĩa; đây là redesign layout + migrate data shape tương thích ngược.

## Thay đổi (render layout + data)

### T1 — 4 lỗi bố cục template (áp mọi trang)
`Container` primitive (nguồn duy nhất bề rộng) · `Section` full-width chỉ content giới hạn ·
`Header`/`CTABanner` bỏ hardcode `max-w-[1280px]` · `HomeImage` bỏ tỉ lệ cứng 1200×720 ·
grid 2 cột chỉ khi `relatedSolutions` thật.

### T2 — token + schema + component
Token `--color-ink` + 5 token ink · `--accent-ink` #64b5ff (bắt buộc — #0071e3 chỉ 3.4:1 trên
nền ink, fail AA) · `--space-hero/section` · `Section variant="ink"` · `.shot-fade-bottom` ·
`Feature` schema (`title/description/image/imageAlt/ratio/extraImages`) + `layout` flag ·
7 component: `Container` `SolutionHero` `FeatureZigZag`(+`FeatureImageRow`) `FaqAccordion`
`BentoCompliance` `AudienceCards` `AiSection`(+`AiAssistantPanel` DOM) · trang preview
`/dev/components` (dev-only, production 404).

### T3 — migrate `features` 8 file `.mdx`
`string[]` → `Feature[]`: CRM/HRM/DentGo chỉ tách `title`/`description` tại `—`/`:` **giữ nguyên
câu chữ** (rule spec §8.1); LMS dùng copy §11.2. `page.tsx` ghép lại `title — description` cho
`FeatureList` (đã gỡ ở T5 khi không còn nhánh legacy).

### T4 — CRM/HRM/DentGo layout mới
`SolutionHero` (ảnh `01-tong-quan`, HRM `max-w-[960px]` tỉ lệ 1.065, CTA 2 `#features`) +
`FeatureZigZag` gắn ảnh v2 theo `docs/screenshots-mapping.md`, alt riêng VI/EN bảng §7 ·
**chỉ HRM** `imageCaption` → `<figcaption>` "Giao diện minh hoạ"/"Illustrative interface" ở
hero + 3 feature + 5 screenshots · screenshots chuyển sang ảnh v2 chưa gắn (rule §5.1, hết trộn
khung cũ) · LMS đánh dấu `layout: 'lms'`.

### T5 — LMS layout riêng 8 block
Đúng thứ tự §5: hero → 4 features (3 zigzag + `FeatureImageRow` 3 ảnh) → bento **phương án A**
(ảnh `04-danh-gia-ai-tt27-crop`) → `AiSection` ink (panel DOM `AiAssistantPanel`, 3 gợi ý §11.4) →
3 thẻ "Dành cho ai" → FAQ `<details>` accordion (§11.6) → CTA cuối 1 nút → `CTAForm`.
**Bỏ render** benefits/useCases/sections/screenshots — **data giữ nguyên trong mdx** (R2).
Xoá hẳn nhánh legacy (PageHeader/FeatureList/bridge). EN H1 → "School Management (LMS)" (§11.8).
B2 đóng: FAQ/section AI không còn "cảnh báo sớm"/"early warning".

## Test scope (v11)

- **4 trang enterprise × 2 locale** đổi layout → SSG route output là vùng regression chính.
- Trang AI (`boxai`/`flycam`/`custom-ai`) + trang danh sách + `SolutionCard`: KHÔNG đổi hành vi
  (`shotFrame`/`caption` chỉ trang default truyền; `screenshots` union normalize ở card).
- i18n: +3 key `solutions.enterprise.{demoCta,featuresCta,featuresCtaAria}` (vi+en).
- Verify: `npm run lint` / `typecheck` / `build` PASS · `scripts/screenshots/.tmp/verify-t3-t5.mjs`
  (36 + 39 checks) · contact sheet 4 trang 375+1440.

## Phân tích

- **Không còn blocker** (B1 số hiệu thông tư, B2 "Cảnh báo sớm" — đóng hết).
- Ảnh v2 không bao giờ bị cắt (nhánh A/B theo tỉ lệ + fade đo `scrollHeight`, spec §3.1).
- Residual đã ghi reviewer: R-22/R-23 (Lighthouse perf/viewport 375-768-1280) đo ở gate
  DevOps/prod · MINOR còn lại (EN feature titles LMS ngoài §11 — spec không có bảng EN title).
