# feature-image-lightbox-case-study-card · phase-1-task-02 — Thẻ case study `/case-studies`: ảnh banner ngang 16/10

- **CR:** CR-013 (`spec/changes/2026-10-13-image-lightbox-case-study-card.md`)
- **Classification / Risk:** MODIFY (UI layout) · LOW–MEDIUM
  - Scope: chỉ biến thể `media.kind === 'photo'` trong `src/components/listing/ListingCard.tsx`
  - Expected review level: **NORMAL** (`ListingCard` dùng chung cho /products, /solutions/*, /case-studies nhưng chỉ đổi nhánh `photo`
    mà chỉ /case-studies dùng — reviewer phải xác nhận `phone`/`window` không đổi)
  - Blast radius: `/case-studies` (vi/en); regression check `/products`, `/solutions/enterprise`, `/solutions/ai`
  - Doc impact: spec R-08d (3.9.0) qua spec-publisher khi close-out
  - Decision impact: không

## Bối cảnh (evidence)
Cover: Bảo Hà 1364×1021 (1.336) · DentGo 1590×989 (1.608) · Óc Eo 1590×989 (1.608).
Hiện khung ảnh `photo` ở ≥ sm là `absolute inset-y-4 right-4 w-[44%] aspect-auto` → khung **dọc** (≈ 0.77 ở lg, ≈ 0.39 ở md)
⇒ chỉ hiện ~24–58% chiều ngang ảnh.

## Scope
1. `ListingCard`: với `media.kind === 'photo'`:
   - Render ảnh **trước** khối chữ (đầu thẻ), trong lề thẻ (≈ `mx-4 mt-4` hoặc `p-4`), bo góc ≈ 20px, giữ shadow/ring hiện có.
   - Khung `relative aspect-[16/10] overflow-hidden` ở **mọi** breakpoint (bỏ `sm:absolute ... sm:w-[44%] sm:aspect-auto`).
   - Ảnh `object-cover object-center`, `sizes` cập nhật theo bề rộng thẻ (vd `(min-width: 1024px) 560px, (min-width: 768px) 45vw, 92vw`).
   - Khối chữ full width (bỏ `sm:max-w-[56%]` cho `photo`); giữ `flex-1` + hàng chip/nút `mt-auto` để thẻ cùng hàng cao đều, đáy thẳng hàng.
   - Xem lại `min-h-[350px]` cho `photo` (giữ hoặc bỏ nếu thẻ đã đủ cao) — không để khoảng trống lạ.
2. Không đổi nhánh `phone` / `window`, `ListingCtaCard`, `cardStyles.ts`, `CaseStudyCard`, `SolutionCard`.
3. `src/app/[locale]/case-studies/page.tsx`: giữ truyền `width/height` thật (hero.image) — đã đúng cho Bảo Hà/DentGo; Óc Eo
   fallback 1590×989 trùng ảnh thật → không cần đổi trừ khi builder thấy lệch.

## Acceptance
- `/case-studies` vi/en ở 375 / 640 / 768 / 1024 / 1440px: ảnh cover là banner ngang 16/10 trên đầu thẻ; Óc Eo + DentGo
  hiện gần đủ ảnh (camera + drone Óc Eo, logo DentGo còn), Bảo Hà còn đủ chiều ngang (chỉ cắt ≈ 8% trên/dưới).
- Các thẻ cùng hàng cao bằng nhau, ảnh cùng chiều cao, hàng chip/nút thẳng hàng; thẻ CTA cuối lưới không vỡ.
- `/products`, `/solutions/enterprise`, `/solutions/ai` không đổi giao diện thẻ.
- Không tràn ngang mobile. `npm run typecheck`, `npm run lint`, `npm run build` PASS.

## Verification summary
- Acceptance criteria (builder, theo code — chưa kiểm bằng mắt trên trình duyệt):
  - `ListingCard` nhánh `photo`: ảnh render TRƯỚC khối chữ, khung `relative mx-4 mt-4 aspect-[16/10] overflow-hidden rounded-[20px]`
    + giữ shadow/ring, ở mọi breakpoint (đã bỏ `sm:absolute sm:inset-y-4 sm:right-4 sm:aspect-auto sm:w-[44%]`).
    Ảnh `object-cover object-center`, `sizes="(min-width: 1280px) 600px, (min-width: 768px) 46vw, 92vw"` (lưới columns=2: 1 cột < md, 2 cột ≥ md).
  - Khối chữ full width cho `photo` (bỏ `sm:max-w-[56%]`); giữ `flex-1` + hàng chip/nút `mt-auto` → thẻ cùng hàng (grid stretch + `h-full`) cao đều, đáy thẳng hàng; ảnh cùng tỉ lệ + cùng bề rộng cột → cùng chiều cao.
  - `min-h-[350px]` bỏ cho `photo` (banner 16/10 + nội dung đã cao hơn 350px ở mọi breakpoint), giữ nguyên cho `phone`/`window`.
  - Nhánh `phone`/`window`, `ListingCtaCard`, `cardStyles.ts`, `CaseStudyCard`, `SolutionCard`, `case-studies/page.tsx`: không đổi.
    `kind: 'photo'` chỉ được dùng ở `src/app/[locale]/case-studies/page.tsx` (grep).
- Verify commands + result:
  - `npm run typecheck` → PASS
  - `npm run lint` → PASS (0 error; 1 warning có sẵn `src/components/mdx/index.tsx` no-img-element, ngoài scope)
  - `npm run build` → BLOCKED trong sandbox (`Failed to load next.config.ts` / `Failed to load native binding` — swc native); cần chạy ở terminal user
  - Kiểm tra trực quan 375/640/768/1024/1440: chưa chạy (cần reviewer/primary xem trên trình duyệt)
- Build (terminal user, `npm.cmd run build`): **PASS** — lint+types OK, 59/59 static pages.
- Acceptance criteria: PASS (theo code + build; chưa smoke test trình duyệt)
- Reviewer verdict: **PASS** (NORMAL, round 1) — `.context/review-reports/feature-image-lightbox-case-study-card-phase-1-task-02-round-1-review.md`; 3 finding MINOR (JSDoc còn ghi "ảnh bên phải", khoảng trắng thừa className, điều kiện lặp cho TS) — không bắt buộc.
- Doc impact: spec R-08d (3.9.0) qua spec-publisher ở close-out CR.

## Retry / Escalation
Max 3 attempt → `architecture_review_needed`.
