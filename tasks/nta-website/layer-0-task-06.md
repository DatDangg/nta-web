# Task 06 (remediation): Layer 0 — xử lý gap phase review (spec-validator round 1)

## Layer
0

## Type
build (initial) — remediation sau phase review

## Goal
Xử lý Gap List dari phase review Layer 0 (`.context/review-reports/feature-nta-website-layer-0-round-1-spec-review.md`)
theo các quyết định **user-ratified** tại checkpoint hết Layer 0, để re-validate PASS và unlock Layer 1.

## Classification / Risk
- Work item type: FEATURE (initial build — remediation)
- Feature change type: MODIFY (fix gap nội bộ Layer 0 + ratify contract)
- Scope: CROSS_CUTTING (CI, env, content contract `src/content/types.ts`, docs intent)
- Root cause category: contract/type gap + CI pipeline order
- Review level expected: STRICT — đụng shared contract `Solution`/`CaseStudy` (mọi page Layer 2 đọc) + CI
- Blast radius: `src/content/types.ts` + content solution/case; `src/lib/seo.ts`; `.github/workflows/ci.yml`; `.env.local.example`; SPECIFICATIONS.md R-03/R-06/R-15; design-spec Screen 1/6/9
- Doc impact: YES — cập nhật intent docs theo quyết định user-ratified (R-03, R-06, Screen 1/6/9) + `.context/decisions.md`
- Decision impact: YES (3 quyết định contract đã user ratify)

## Dependencies
- layer-0-task-01..05 (đã DONE + commit)

## Scope (spec refs + gap IDs)
### Fix "cứng" (không cần quyết định thêm)
- **G1 (HIGH):** CI order — `.github/workflows/ci.yml` chạy `typecheck` trước `build`, `next-env.d.ts:3` (tracked)
  reference `./.next/types/routes.d.ts` (gitignored) → TS6053 clean checkout. Fix: thêm bước sinh type Next
  (`npx next typegen` nếu hỗ trợ) **trước** `typecheck`, hoặc đổi thứ tự để `build` chạy trước `typecheck`.
  Verify bằng cách `rm -rf .next` rồi chạy đúng chuỗi CI.
- **G7 (LOW):** thêm `NEXT_PUBLIC_SITE_URL=` vào `.env.local.example`; đảm bảo `src/lib/seo.ts` dùng biến này
  (fallback giữ nguyên) — cân nhắc 1 hằng BASE_URL dùng chung với `metadataBase`.
- **G8 (LOW):** task-02 doc còn ghi `localePrefix: 'never'` → sửa thành `'as-needed'` cho khớp code.
- **G9 (LOW):** R-15 (`GET /api/posts`, `/api/case-studies`) — reconcile: v1 render static, không dựng API list;
  ghi rõ trong SPECIFICATIONS.md + `.context/decisions.md`.
- **G5 (LOW):** `about.partners: []` giữ nguyên (chưa có logo/đối tác thật) — ghi rõ là OQ#1 chờ xác nhận,
  KHÔNG thêm đối tác giả.

### Ratify contract (user approved 3 quyết định)
- **G2 (MED):** Screen 1/R-03 "≥3–4 sản phẩm tiêu biểu" → hạ về **"≥2 sản phẩm tiêu biểu"**; giữ 2 app thật
  (`music-app`, `hair-style-ai`), strip degrade gracefully khi <1. Cập nhật `SPECIFICATIONS.md` R-03 + design-spec
  Screen 1.
- **G3+G4 (MED):** mở rộng type `Solution` với optional: `image?: string`, `screenshots?: string[]`,
  `relatedCases?: string[]` (slug). Content solution trỏ SVG placeholder sẵn có trong `public/images/solutions/*`.
  R-06 "case study liên quan" → làm **optional** (chưa có case AI); cập nhật SPECIFICATIONS.md R-06 + design-spec
  Screen 6 (`CaseStudyLink` chỉ render khi `relatedCases` có dữ liệu).
- **G6 (LOW-MED):** thêm `CaseStudy.metrics?: { value: string; label: string }[]` cho ResultBlock (Screen 9);
  content KHÔNG bịa số — metrics để trống/omit khi chưa có số thật. Cập nhật design-spec Screen 9.

### Ghi nhận (không fix code)
- **G10/N2 (MED, process):** review trước đó không tái lập được verify do shell deny — residual, ghi vào decisions.
  Không sửa được trong task này.

## Acceptance Criteria
- [x] G1: CI order (`lint` → `next typegen` → `typecheck` → `build`) PASS từ clean `.next/` state; không TS6053
- [x] G7: `.env.local.example` có `NEXT_PUBLIC_SITE_URL`; `seo.ts` đọc biến qua `BASE_URL` có fallback
- [x] G8/G9/G5: R-15 static docs reconciled; G8 đã ghi `as-needed` trong task-02 trên đĩa; `partners: []` giữ nguyên
- [x] G2: SPECIFICATIONS.md R-03 + design-spec Screen 1 = "≥2"; home strip có đúng 2 app thật
- [x] G3/G4: type `Solution` có `image?`/`screenshots?`/`relatedCases?`; solution content VI/EN tham chiếu placeholder SVG; R-06 optional; Screen 6 ghi rõ
- [x] G6: type `CaseStudy` có `metrics?`; ResultBlock spec cập nhật; không bịa số
- [x] `.context/decisions.md` ghi quyết định ratified + R-15 static + G5/G10 residual
- [x] Check commands pass: `npm run lint` · `npm run typecheck` · `npm run build`
- [x] Loader smoke: solution/case đọc field optional không throw (2 locale)

## Verification Summary
- Commands: `rm -rf .next && npm run lint && npx next typegen && npm run typecheck && npm run build` — PASS; clean `.next` CI-order simulation generated route types before TypeScript, no TS6053. `npm run lint`, `npm run typecheck`, and `npm run build` all PASS.
- Loader smoke: Node/TypeScript direct loader smoke for `solutions` (7) and `case-studies` (2) in `vi` and `en` — PASS; optional fields parsed without throw. No real case metrics were introduced.
- Test: `test_command: null` → skip, v1 has no test framework.
- Reviewer report: `.context/review-reports/feature-nta-website-layer-0-task-06-round-1-review.md` — Verdict **PASS** (STRICT, 0 CRITICAL/MAJOR, 2 MINOR non-blocking)
- Sau PASS → spec-validator re-validate round 2 (phase review Layer 0)

## Retry / Error Memory
- Attempt: 0
- Escalation: none — sau 3 attempt fail → `architecture_review_needed`

## DoD (Definition of Done)
- [x] Code/docs written (chỉ trong scope)
- [x] Tests: skip — `test_command: null`, ghi lý do; loader smoke PASS
- [x] Check commands pass
- [x] Reviewer độc lập PASS (STRICT — 0 CRITICAL/MAJOR, 2 MINOR non-blocking)
- [x] `.context/progress.json` updated
- [x] Doc Impact / Decisions recorded
- [x] committed — 1 task = 1 commit (branch `main`, KHÔNG push)

## Files to Create/Modify
- `.github/workflows/ci.yml`
- `.env.local.example`
- `src/lib/seo.ts` (nếu cần hằng BASE_URL)
- `src/content/types.ts` + `src/content/solutions/{vi,en}/*.mdx` + `src/content/case-studies/{vi,en}/*.mdx`
- `SPECIFICATIONS.md` (R-03, R-06, R-15), `.context/design-spec.md` (Screen 1/6/9)
- `.context/decisions.md`
- `tasks/nta-website/layer-0-task-02.md` (G8 wording)

## Notes
- Đây là remediation trong initial build; intent docs đổi theo quyết định user-ratified tại checkpoint (không phải
  "sửa doc cho khớp code" tự phát).
- G10/N2: chưa có test framework (`test_command: null`) → verify tự động dựa CI; residual ghi decisions.
