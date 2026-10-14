# phase-1-task-01 — Trang chủ khối Sản phẩm: desktop (lg+) hiện đủ ≤ 3 thẻ 1 hàng, > 3 thẻ mới cuộn ngang

- Change: CR-022 `spec/changes/2026-10-14-home-products-show-three.md` (follow-up CR-016 / CR-021)
- Status: done — user duyệt plan 2026-10-14 (1 task); reviewer round 1 PASS (NORMAL)
- Spec: 3.14.0 → **3.15.0** (MINOR) · test-scope v44 → **v45** (trigger feature-update)

## Classification / Risk
- Change type: **MODIFY (UI)** — đổi behavior layout R-03a (desktop không còn là carousel khi ≤ 3 thẻ)
- Scope: 1 section public trang chủ `/` + `/en`; chỉ `src/components/home/ProductStrip.tsx` (+ `HomeProductCard` `sizes`)
- Risk: **LOW** — không API/schema/auth/data; không sửa hook/component dùng chung (`useScrollButtons`, `HomeScrollArrows`, `HomeSectionHeader` dùng chung với Case study → KHÔNG đụng)
- Expected review level: **NORMAL** (UI responsive, có tương tác bàn phím/nút)
- Blast radius: chỉ khối Sản phẩm trang chủ; khối Case study (`CaseStudyCarousel`) dùng chung hook/arrows phải giữ nguyên hành vi
- Doc impact: `SPECIFICATIONS.md` R-03a (bump MINOR) + `.context/design-spec.md` §Trang chủ mục 3 (as-built) + spec-publish (updates/CHANGELOG/test-scope)
- Decision impact: không — user đã chốt 2026-10-14 (lg+ hiện đủ, < lg giữ cuộn)

## Hiện trạng (evidence)
- `ProductStrip.tsx:62-70` — mỗi thẻ (sản phẩm + wrapper CTA) `w-[85%] shrink-0 snap-start md:w-[calc(50%-0.75rem)]` trong `scrollStripClass` (`gap-4 md:gap-6`) → từ md trở lên chỉ thấy 2 thẻ, thẻ thứ 3 phải cuộn.
- Dữ liệu: `home.featuredProducts` = 2 sản phẩm mỗi locale (`src/content/home.ts:73`, `:125`) + 1 thẻ CTA (CR-021) = **3 thẻ**.
- `useScrollButtons` tính `canPrev/canNext` từ `scrollWidth - clientWidth` + `ResizeObserver` → khi dải không tràn, cả 2 nút tự `disabled` (đã có sẵn).
- Breakpoint `lg = 1024px` (`tailwind.config` screens). Dải nằm trong `max-w-[1040px]`.

## Approach đề xuất
1. **Đếm thẻ**: `const cardCount = products.length + 1` (CTA luôn có khi section hiện). `const fitsDesktop = cardCount <= 3`.
2. **Độ rộng thẻ theo breakpoint** (class tĩnh, không sinh class động):
   - `< md`: giữ `w-[85%]`; `md`–`< lg`: giữ `md:w-[calc(50%-0.75rem)]` (mobile/tablet vẫn cuộn như cũ).
   - `lg+` và `cardCount === 3`: thêm `lg:w-[calc((100%-3rem)/3)]` (2 gap × `md:gap-6` 1.5rem = 3rem) → 3 thẻ lấp đúng 1 hàng, `scrollWidth == clientWidth`, không cuộn.
   - `cardCount <= 2`: giữ ½ dải (đã vừa 1 hàng, không cuộn) — không cần class mới.
   - `cardCount > 3`: giữ nguyên class hiện tại → cuộn ngang, mũi tên/phím/snap như cũ.
   - Gom thành 1 hằng `cardWidthClass` dùng chung cho thẻ sản phẩm và wrapper CTA (tránh 2 chỗ lệch nhau).
3. **Mũi tên**: khi `fitsDesktop` → bọc/ẩn cụm `HomeScrollArrows` ở `lg+` (`lg:hidden` trên wrapper do `ProductStrip` truyền vào `actions`, ví dụ `<div className="flex gap-3 lg:hidden">…</div>`), để desktop không hiện 2 nút vô dụng; `< lg` vẫn hiện + hoạt động. Fallback an toàn: kể cả không ẩn, `useScrollButtons` đã tự `disabled` cả 2 nút khi dải không tràn. `> 3` thẻ → không ẩn.
   - KHÔNG sửa `HomeSectionHeader`/`HomeScrollArrows`/`useScrollButtons` (dùng chung với Case study).
4. **Ảnh**: `HomeProductCard.tsx:35` `sizes="(min-width: 1024px) 508px, …"` → ở lg+ 3 cột thẻ chỉ ~330px. Cho `HomeProductCard` nhận prop `sizes` tuỳ chọn (default giữ chuỗi cũ) hoặc đổi giá trị lg thành `~340px` khi 3 cột. Builder chọn cách tối thiểu; không đổi ảnh/aspect.
5. Region `role="region" tabIndex={0}` + `onKeyDown` giữ nguyên (khi không cuộn được, phím ←/→ là no-op, không lỗi).
6. Không đổi copy/i18n, không đổi dữ liệu, không đổi `page.tsx`.

## Spec delta dự kiến (áp dụng vào `SPECIFICATIONS.md` R-03a lúc spec-publish, 3.14.0 → **3.15.0** MINOR — đổi behavior)
> **(3.15.0 — CR-022)** Từ `lg` (≥ 1024px): khi tổng số thẻ trong dải (sản phẩm + thẻ CTA) **≤ 3**, các thẻ hiện đủ trên **1 hàng**,
> không cuộn (3 thẻ → mỗi thẻ ⅓ dải; ≤ 2 thẻ → ½ dải), cụm nút ←/→ **ẩn** ở `lg+` (nếu hiện thì disabled vì dải không tràn).
> **> 3 thẻ** → giữ carousel ngang (½ dải mỗi thẻ, nút ←/→, phím ←/→, snap) như trên. Dưới `lg` (mobile 85%, tablet ½ dải) luôn là dải cuộn ngang
> như cũ. Song ngữ VI/EN như nhau. Thay câu "(2 sản phẩm + thẻ CTA → desktop nút → bật được)" của 3.14.0.

## Acceptance
- [ ] lg+ (1024 / 1280 / 1440), `/` và `/en`: 2 thẻ sản phẩm + thẻ CTA hiện đủ 1 hàng, không thanh cuộn ngang, không tràn trang, chiều cao thẻ bằng nhau theo hàng
- [ ] lg+: cụm nút ←/→ khối Sản phẩm không hiện (hoặc nếu hiện thì cả 2 disabled)
- [ ] < lg (375 / 768): giữ dải cuộn ngang 85% / ½, nút ←/→ hoạt động, phím ←/→ khi dải focus, snap, vuốt
- [ ] > 3 thẻ (kiểm bằng cách tạm thêm sản phẩm ở dev, KHÔNG commit): lg+ vẫn cuộn ngang + nút ←/→ bật đúng
- [ ] Khối Case study trang chủ không đổi hành vi
- [ ] typecheck / lint / build PASS

## Verify commands (từ `.context/project-config.md`)
- `npm run typecheck` · `npm run lint` · `npm run build` (Windows: `npm.cmd`). Agent qua Cowork/VM: `bash tools/linux-build.sh verify`.
- Build lỗi native binding trong sandbox → ghi `Blocked`, không retry, nhờ chạy ở terminal user.
- Kiểm trực quan ở trình duyệt 375 / 768 / 1024 / 1440 (dev server).

## Doc impact (close-out)
- `SPECIFICATIONS.md` R-03a (3.15.0) + `spec/updates/2026-10-14-home-products-show-three.md` + `spec/CHANGELOG.md` + `spec/test-scope/current.json` (scopeVersion v44 → v45, trigger `feature-update`)
- `.context/design-spec.md` §Trang chủ mục 3 — ghi as-built: lg+ ≤ 3 thẻ 1 hàng, > 3 thẻ cuộn
- Không đổi API/schema. Intent docs (BRD FR-003) không đổi.

## Retry / Escalation
- Reviewer FAIL → builder sửa trong cùng task (max 2 vòng review).
- 3 attempt FAIL → status `architecture_review_needed`, dừng chờ user.

## Verification summary

### Builder attempt 1 (2026-10-14)
- Files changed:
  - `src/components/home/ProductStrip.tsx` — `cardCount = products.length + 1`; 2 hằng class tĩnh literal đầy đủ
    (`cardWidthBaseClass` / `cardWidthThreeUpClass` thêm `lg:w-[calc((100%-3rem)/3)]`), chọn thành `cardWidthClass` dùng chung cho
    `HomeProductCard` và wrapper CTA (`grid ${cardWidthClass}`); `cardCount <= 3` → `HomeScrollArrows` bọc trong `<div className="flex gap-3 lg:hidden">`
    (giữ layout cụm nút < lg), > 3 thẻ truyền thẳng như cũ; 3 thẻ → truyền `imageSizes` lg 340px.
  - `src/components/home/HomeProductCard.tsx` — prop tuỳ chọn `imageSizes` (default = chuỗi cũ `(min-width: 1024px) 508px, …`), gắn vào `sizes`.
  - `.context/design-spec.md` §Trang chủ mục 3 — ghi as-built CR-022.
  - Không đụng `useScrollButtons.ts`, `HomeScrollArrows.tsx`, `HomeSectionHeader.tsx`, page/i18n/data.
- Verify:
  - `npm.cmd run typecheck` — PASS (tsc --noEmit, không lỗi)
  - `npm.cmd run lint` — PASS (0 errors; 1 warning có sẵn `src/components/mdx/index.tsx:25` no-img-element, ngoài scope)
  - `npm.cmd run build` — **Blocked** (`Failed to load next.config.ts` → `Failed to load native binding`, lỗi môi trường SWC native binding,
    không liên quan diff; không retry) → cần chạy `npm run build` ở terminal user.
  - Test: skip (`test_command` null, không có test framework).
- Residual risk:
  - Chưa kiểm trực quan trình duyệt 375 / 768 / 1024 / 1440 và kịch bản > 3 thẻ (chỉ suy luận: % width resolve theo content box dải,
    3 thẻ + 2 gap 1.5rem = 100% → `scrollWidth == clientWidth`).
  - Build chưa xác nhận do Blocked môi trường.

### Review round 1 (2026-10-14) — PASS (NORMAL)
- Report: `.context/review-reports/feature-home-products-show-three-phase-1-task-01-round-1-review.md`
- F1 LOW (chấp nhận, residual): ở lg+ wrapper `actions` rỗng vẫn render trong `HomeSectionHeader` → khoảng `lg:gap-8` (32px) sau mô tả; sửa phải đụng header dùng chung (ngoài scope).
- F2/F3 INFO: chuỗi class lặp; build + kiểm trực quan 375/768/1024/1440 chưa làm.
- Build: `npm.cmd run build` BLOCKED (`Failed to load native binding`) cả sandbox lẫn unsandboxed → cần chạy ở terminal user.
