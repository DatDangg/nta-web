# Task 01: Gỡ case study Đền Bảo Hà + khối "Triển khai thực tế tại Đền Bảo Hà" ở trang BoxAI (CR-025 phần 1–2)

> Nguồn: CR-025 `spec/changes/2026-10-14-remove-bao-ha-anonymize-oc-eo.md` · Spec: R-06b (DEPRECATED đoạn Bảo Hà), R-08b.2 (DEPRECATED)
> Làm TRƯỚC task-02 (task-02 sửa tiếp `relatedCases` của boxai + `listings.ts`).

## Phase
1 — content (không đổi component)

## Type
REMOVE — gỡ case study `ai-box-bao-ha` + đoạn Bảo Hà trên trang `boxai` (vi/en).

## Classification / Risk
- Change type: **REMOVE** · Risk: **low–medium** (xoá route public đã index → 404 có chủ đích)
- Review level: **NORMAL** (chỉ MDX + 2 dòng listing + xoá ảnh tĩnh; không đụng component/API/schema)
- Blast radius: `/case-studies/ai-box-bao-ha` (vi/en → 404), `/case-studies` (bớt 1 thẻ), trang chủ khối case study
  (lấy từ `getAllCaseStudies` → tự bớt), `/solutions/ai/boxai` (bỏ 1 section ×2 + 1 thẻ related), sitemap (tự bớt).

## Quyết định user (2026-10-14)
- Route cũ → **404** bằng `src/app/[locale]/not-found.tsx` có sẵn — **không** redirect, **không** thiết kế lại 404.
- Gỡ ảnh `/images/cases/bao-ha/*` khỏi repo.

## Files (file:line khảo sát ngày 2026-10-14)
- XOÁ `src/content/case-studies/vi/ai-box-bao-ha.mdx`, `src/content/case-studies/en/ai-box-bao-ha.mdx`
- XOÁ `public/images/cases/bao-ha/{hero,courtyard,ai-detection,shrine}.jpg` (cả thư mục)
- `src/content/listings.ts:247` (vi) + `:262` (en) — xoá dòng `'ai-box-bao-ha': {...}`
- `src/content/solutions/vi/boxai.mdx`
  - `:66-67` xoá item `sections[]` "Triển khai thực tế tại Đền Bảo Hà" (title + intro)
  - `:74` xoá `- ai-box-bao-ha` trong `relatedCases` (giữ `oc-eo-learning` — task-02 đổi slug)
  - `:175-176` xoá item `showcase.details.items[]` "Triển khai thực tế tại Đền Bảo Hà"
- `src/content/solutions/en/boxai.mdx` — cùng vị trí: `:66-67`, `:74`, `:175-176` ("Deployment at Bao Ha Temple")
- Doc reconcile (as-built): `docs/DESIGN.md:112` bỏ "+ Đền Bảo Hà" khỏi mô tả nội dung BoxAI.

## Không làm (ngoài scope)
- Không sửa `src/app/[locale]/not-found.tsx`, `case-studies/[slug]/page.tsx` (route không còn MDX → `getCaseStudyBySlug` null → `notFound()` sẵn có).
- Không xoá `spec/changes/assets/2026-10-13-ai-box-bao-ha-case-study/` + archive/task/report cũ (lịch sử nội bộ, không publish).
- Không đụng ảnh `/images/solutions/boxai/*` (USER CHỐT 2026-10-14: giữ nguyên ảnh).

## Acceptance Criteria
- [ ] `/solutions/ai/boxai` + `/en/solutions/ai/boxai`: không còn chữ "Bảo Hà"/"Bao Ha" (grep HTML render = 0), không còn thẻ related Bảo Hà.
- [ ] `/case-studies` (vi/en) + `/` + `/en`: không còn thẻ/link `ai-box-bao-ha`.
- [ ] `/case-studies/ai-box-bao-ha` và `/en/case-studies/ai-box-bao-ha` → HTTP **404**, render trang 404 của site.
- [ ] `sitemap.xml` không có `ai-box-bao-ha`.
- [ ] `grep -rniE "bao-ha|Bảo Hà|Bao Ha" src public` = 0 kết quả.
- [ ] Không link gãy: không còn `relatedCases`/`related` trỏ slug đã xoá.
- [ ] typecheck · lint · build PASS.

## Verify commands (`.context/project-config.md`)
- Windows: `npm run typecheck` · `npm run lint` · `npm run build`
- Cowork/VM: `bash tools/linux-build.sh verify`; smoke: `bash tools/linux-build.sh serve 3100 <curl -o /dev/null -w "%{http_code}" ...>`
- `test_command: null` → skip, no test framework.

## Retry / Escalation
- Attempt tối đa 3; ≥3 fail → `architecture_review_needed`, dừng chờ review.

## Doc impact
- `SPECIFICATIONS.md`: R-06b + R-08b.2 đánh dấu DEPRECATED (đã viết ở bước spec delta).
- `docs/DESIGN.md:112` (as-built) reconcile. Không đổi API/ERD.

## Verification summary
- `grep -rniE "bao-ha|Bảo Hà|Bao Ha" src public` → 0 kết quả (exit 1). `relatedCases` boxai vi/en chỉ còn `oc-eo-learning`.
- `npm run typecheck` → PASS (exit 0).
- `npm run lint` → PASS (exit 0; 0 error, 1 warning có sẵn `no-img-element` ở `src/components/mdx/index.tsx:25`, không liên quan).
- `npm run build` → BLOCKED (môi trường): `next-intl/node_modules/@swc/core` không load native binding, `ERR_SWC_NATIVE_CACHE` — DACL `C:\Users\datda\AppData\Local` cấp quyền cho AppContainer SID (sandbox của agent). Không phải lỗi code; cần chạy build ngoài sandbox.
- Smoke 404 `/case-studies/ai-box-bao-ha` (vi/en): chưa chạy (phụ thuộc build). Đọc tĩnh: `src/app/[locale]/case-studies/[slug]/page.tsx:27-28,41-42` → `getCaseStudyBySlug` null → `notFound()`.

## Unblock evidence (phiên chính, 2026-10-14)
- `SWC_NATIVE_BINDING_CACHE='C:\Users\datda\.swc-native-cache' npm run build` → **PASS**.
- Smoke `next start -p 3123`: `/case-studies/ai-box-bao-ha` → **404** (title "Không tìm thấy trang | NTA"); `/case-studies`, `/solutions/ai/boxai`, `/en/solutions/ai/boxai` → 200, 0 chữ Bảo Hà; sitemap 0 `bao-ha`.
- `/en/case-studies/ai-box-bao-ha` → **500** ("Page changed from static to dynamic at runtime … reason: headers", từ `requestLocale` của next-intl). **Lỗi CÓ TỪ TRƯỚC, không do diff**: `/en/case-studies/xyz-nope`, `/en/blog/xyz-nope` cũng 500; vi không prefix → 404. Ghi thành bug riêng CR-026 (chờ user chốt).
