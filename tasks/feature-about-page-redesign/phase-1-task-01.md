# feature-about-page-redesign · phase-1-task-01 — Trang /about: hero 2 cột + khối sứ mệnh + khối Con người NTA

- **CR:** CR-014 (`spec/changes/2026-10-13-about-page-redesign.md`) · spec R-04a (3.10.0)
- **Classification / Risk:** MODIFY + ADDITIVE (UI) · LOW–MEDIUM
  - Scope: `src/app/[locale]/about/page.tsx`, component mới `src/components/about/{AboutHero,AboutValues,AboutPeople}.tsx`,
    xoá `src/components/about/MissionBlock.tsx` (chỉ /about dùng), `TeamGrid` thêm `id="team"`, `src/components/listing/icons.tsx`
    (thêm icon target/eye/gem nếu cần — chỉ thêm, không sửa path cũ), `src/i18n/messages/{vi,en}.json` (key `about.*` mới),
    ảnh `public/images/about/building-kim-hoan.webp` + `team-people-temp.webp`.
  - Expected review level: **NORMAL** (icons.tsx dùng chung nhưng chỉ thêm tên mới; PageHeader/Breadcrumb/ListingHero không đổi)
  - Blast radius: `/about`, `/en/about`; regression: các trang dùng `ListingIcon`, `TeamGrid`
  - Doc impact: spec R-04a (3.10.0) qua spec-publisher ở close-out; `docs/DESIGN.md` nếu mô tả khối /about
  - Decision impact: không

## Scope
1. Hero 2 cột (nền gradient mint nhạt — dùng lại `HeroWaves`/`AccentText` của `ListingHero` hoặc gradient token), breadcrumb pill,
   H1 "Về **NTA**", tagline lớn, mô tả, 3 chỉ số icon (users / building / smile-star). Cột phải ảnh tòa Kim Hoàn (next/image,
   priority, alt VI/EN). Mobile: 1 cột, ảnh xếp dưới chữ, không tràn ngang.
2. Khối sứ mệnh: trái eyebrow + tiêu đề (phần "giá trị bền vững" màu brand); phải 3 thẻ icon Sứ mệnh · Tầm nhìn · Giá trị cốt lõi (4 bullet).
3. Khối Con người NTA: trái ảnh đội ngũ AI tạm (object-cover, bo góc); phải eyebrow + tiêu đề (phần nhấn brand) + mô tả + nút outline
   "Tìm hiểu thêm về đội ngũ →" link `#team`.
4. Bỏ `PageHeader` + `MissionBlock` khỏi /about; giữ CapabilityGrid, TeamGrid, MilestoneTimeline, PartnerLogos, CTABanner.
5. Giữ `generateMetadata` + breadcrumb JSON-LD nguyên trạng.

## Acceptance
- Desktop khớp bố cục mockup; mobile 375px 1 cột, không tràn ngang; VI + EN đủ nội dung (không hardcode chuỗi trong component).
- Ảnh tòa nhà = ảnh Kim Hoàn thật (webp, next/image, alt VI/EN); ảnh đội ngũ = ảnh AI tạm (comment ghi thay sau).
- `npm run typecheck`, `npm run lint`, `npm run build` PASS.

## Verification summary
- **Builder attempt 1 (13/10/2026)** — files:
  - Mới: `src/components/about/{AboutHero,AboutValues,AboutPeople}.tsx` (server components, tự `getTranslations('about')`),
    `public/images/about/building-kim-hoan.webp` (1200×900, q80, ~205 KB), `public/images/about/team-people-temp.webp`
    (cắt mockup extract {83,749,794,267}, q85, ~37 KB — lùi 2px mỗi cạnh để tránh góc bo/nền trắng của mockup).
  - Sửa: `src/app/[locale]/about/page.tsx` (bỏ PageHeader + MissionBlock, thêm AboutHero → AboutValues → AboutPeople trước
    CapabilityGrid…CTABanner; generateMetadata + JsonLd giữ nguyên), `src/components/about/TeamGrid.tsx` (`id="team"` + `scroll-mt-24`),
    `src/components/listing/icons.tsx` (thêm `target`/`eye`/`gem`, path cũ không đổi), `src/i18n/messages/{vi,en}.json`
    (thêm `about.hero|stats|values|people`, chèn sau `imageFallback`, không format lại dòng khác).
  - Xoá: `src/components/about/MissionBlock.tsx` (grep: chỉ /about import).
- **Acceptance theo code:**
  - Hero 2 cột `lg:grid-cols-[1.15fr_1fr]`, nền `HeroWaves` + `#f7fbfb`; breadcrumb pill; 1 `h1` "Về/About" + `AccentText` "NTA";
    tagline, mô tả, 3 chỉ số (users/building/smile) `sm:grid-cols-3` có vạch chia, mobile 1 cột. Ảnh Kim Hoàn `next/image fill priority`,
    `aspect-[4/3]` bo góc, hiện cả mobile (dưới chữ). Alt VI/EN từ i18n.
  - Khối sứ mệnh: eyebrow `›` + `missionTitle` + `h2` (phần nhấn AccentText); 3 thẻ `h3` icon target/eye/gem, `md:grid-cols-3`, mobile 1 cột; 4 bullet lấy `t.raw('values.core.items')`.
  - Khối Con người: ảnh tạm trái (`fill object-cover`, comment "ảnh AI tạm — thay ảnh thật sau"), eyebrow + `h2` + mô tả + nút outline rounded-full `href="#team"` (min-h-11).
  - Không chuỗi hiển thị hardcode trong component; script kiểm 27 key dùng trong 3 component → đủ ở cả vi + en (0 missing).
- **Verify commands:**
  - `npm run typecheck` → PASS.
  - `npm run lint` → PASS (0 error; 1 warning có sẵn `src/components/mdx/index.tsx` no-img-element, không thuộc task).
  - `npm run build` → **BLOCKED (môi trường)**: `Failed to load next.config.ts — Failed to load native binding`. Cause: `@swc/core` 1.16.13
    (nested trong `next-intl`, dùng khi load plugin next-intl) từ chối cache native addon vì DACL của `C:\Users\datda\AppData\Local`
    (và thư mục thay thế qua `SWC_NATIVE_BINDING_CACHE`) cấp quyền ghi cho SID khác. Không liên quan code task (next.config.ts không đổi,
    `next/dist/build/swc` của Next load OK). Cần chạy build ở máy/terminal user hoặc `bash tools/linux-build.sh verify`.
  - Smoke `/about`, `/en/about` → chưa chạy (phụ thuộc build).
- **Residual risk:** build + render thật chưa xác minh; so khớp pixel với mockup chưa kiểm bằng browser.
- **Builder attempt 2 / round 2 (13/10/2026)** — fix Reviewer round 1 F1 (MAJOR), chỉ sửa `src/components/about/AboutPeople.tsx`:
  - Root cause: khung ảnh `aspect-[794/267] min-h-[200px] lg:min-h-[280px]` — min-height quy đổi qua aspect-ratio thành min-width
    (~595px mobile, ~833px desktop) → tràn ngang 375px, đè cột chữ ở 1280px.
  - Fix: khung ảnh `relative h-[220px] w-full min-w-0 … sm:h-[280px] lg:h-[320px]` (bỏ aspect + min-h; chiều cao cố định theo breakpoint,
    rộng co theo cột; ảnh vẫn `fill object-cover`, `sizes` giữ nguyên). Cột chữ thêm `min-w-0`.
  - `npm run typecheck` → PASS. `npm run lint` → PASS (0 error; 1 warning có sẵn `src/components/mdx/index.tsx`). Build: primary chạy.

## Retry / Escalation
Max 3 attempt → `architecture_review_needed`.
