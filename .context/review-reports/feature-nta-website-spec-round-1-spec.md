# Spec Validation Report — NTA Website

**Agent:** spec-validator · **Round:** 1 · **Date:** 2026-10-08
**Entry Mode:** full_docs (reverse-engineer spec — repo CHƯA có app code)
**File validated:** `SPECIFICATIONS.md` (spec_version 1.0.0, 27 req R-01…R-27)
**Sources validated against:** `BRIEF.md`, `docs/INDEX.md` (canonical list), `docs/BRD.md`, `docs/DESIGN.md`, `docs/API_SPEC.md`, `docs/ERD.md`, `docs/PERMISSION.md`, `.context/project-config.md`, `.context/decisions.md`
**No pending change requests:** `spec/changes/` chỉ có README + _TEMPLATE → không có change chờ.
**Note:** `.context/doc-index.json` không tồn tại → fallback theo `.agent/spec-validator.md` Step 1 (BRIEF + `docs/` theo `docs/INDEX.md`).

> 📄 Bản round-tagged của report này (nội dung y hệt): `.context/review-reports/spec-validation.md` — file này tồn tại để tuân thủ quy tắc đặt tên `round-<R>`.

---

## Scope

Validate `SPECIFICATIONS.md` (do `/spec-init` dựng, reverse-engineer từ docs) so với docs canonical — repo chưa có code nên **không cross-check code**. Kiểm: (a) requirement docs bị sót trong spec, (b) req trong spec không có nguồn docs, (c) mâu thuẫn giữa các docs, (d) citation file:line sai.

---

## Findings

### MAJOR

**M1 — [MISSING] NFR Security "HTTPS only" không có trong spec**
- Nguồn: `docs/BRD.md:124` (NFR table → Security: "HTTPS only, form rate-limit + chống spam, không lộ secret") và `BRIEF.md:41` ("Security: HTTPS only; form liên hệ có rate-limit + chống spam; không lộ secret").
- Spec chỉ cover 2/3 sub-item: rate-limit (R-13 `429`, R-18 guard) và secret (R-19). **"HTTPS only" hoàn toàn không xuất hiện** trong `SPECIFICATIONS.md`.
- Đây là ❌ Missing theo checklist 2A (có trong source doc, không có trong spec).

**M2 — [CITATION] Overview trích nguồn không tồn tại: `.context/decisions.md` (commit ab335bb, e7f54aa)**
- `SPECIFICATIONS.md:23` ghi: "Nguồn: `BRIEF.md:15-16`, `.context/decisions.md` (commit ab335bb, e7f54aa)".
- Thực tế `.context/decisions.md` chỉ là template rỗng ("_No decisions recorded yet_", 17 dòng) — **không có quyết định nào, không có commit nào** được ghi ở đó.
- Nội dung claim (domain/song ngữ/style) vẫn đúng nhờ `BRIEF.md:15-16` — nhưng citation thứ hai là bịa/sai lệch. Cần xóa hoặc thay bằng nguồn thật.

### MINOR — citation drift (8)

| # | Req | Trích dẫn hiện tại | Vấn đề (đã verify bằng grep) |
|---|-----|--------------------|------------------------------|
| m1 | R-21 | `docs/BRD.md:125,30` | Dòng 30 = "Form liên hệ hoạt động, không spam"; Lighthouse ≥90 nằm ở **dòng 29** |
| m2 | R-22 | `docs/BRD.md:123,30` | Dòng 30 không phải nguồn; LCP = **28**, Lighthouse = **29** |
| m3 | R-26 | `docs/BRD.md:48,29,165` | Dòng 29 = Lighthouse; "≥ 9 nhóm trang" nằm ở **dòng 31** (48 và 165 đúng) |
| m4 | R-24 | `docs/BRD.md:127` | Dòng 127 = Availability; Accessibility = **dòng 128** |
| m5 | R-27 | `docs/BRD.md:53,126,157` | Claim "availability ≥ 99.5%" cần **dòng 127** (126 = Scalability — vẫn cần cho max-instances 3) |
| m6 | R-02 | `docs/BRD.md:69-70` | AC "3 card, hover state" ở **dòng 71** — ngoài range; nên 69-71 |
| m7 | R-03 | `docs/BRD.md:72-73` | Dòng 72 trống; FR-003 ở 73; AC "3–4 sản phẩm" ở **75** — nên 73-75 |
| m8 | R-11 | `docs/DESIGN.md:146` | Dòng 146 = Timeline; component **Nav (hamburger + drawer) ở dòng 147** |

### MINOR — khác (2)

- m9 — Section "Scalability Profile" (`SPECIFICATIONS.md:152-155`): "Tier: Standard (modular monolith + stateless)" **không trích nguồn docs nào** — suy ra từ skill/hoặc cấu hình mặc định, không có trong docs canonical. Không phải req bịa (OPTIONAL section), nhưng nên ghi nguồn hoặc bỏ.
- m10 — `docs/INDEX.md` chưa classify `docs/SPEC_VERSIONING.md` và `docs/smoke-tests/` (không thuộc canonical cũng không thuộc historical) — quan sát ngoài phạm vi spec, ghi nhận cho spec-init/INDEX owner.

### ⚠️ Ambiguous (3)

| # | Vấn đề | Nguồn | Ghi chú |
|---|--------|-------|---------|
| a1 | Spec **không có section Scope/Out-of-Scope** — BRD liệt kê rõ Out of Scope: không đăng nhập/CMS quản trị, e-commerce/thanh toán, tính năng nghiệp vụ sản phẩm (CRM/HRM/…) | `docs/BRD.md:55-58` | Overview có cover "Không có đăng nhập" và R-17 ADMIN phase-sau, nhưng ranh giới scope vẫn mơ hồ → rủi ro scope creep khi chia task |
| a2 | Constraint Regulatory: "chú ý bản quyền ảnh/nội dung" không có trong spec | `docs/BRD.md:159` | Soft constraint, không testable — nhưng là nguồn docs chưa được phản ánh |
| a3 | Trạng thái trang ngoài contact: DESIGN specify trang chủ "Default, Loading (nếu fetch), Error" (và empty state chưa specify cho list) — spec chỉ nêu states cho form liên hệ (R-10) | `docs/DESIGN.md:82` | Mơ hồ dưới SSG (không fetch → không cần Loading?) — cần chốt khi implement |

---

## Cross-Document Conflicts (ghi nhận — KHÔNG tự sửa)

| # | Conflict | Nguồn A | Nguồn B | Spec lấy theo | Impact |
|---|----------|---------|---------|---------------|--------|
| C1 | **Danh sách breakpoint**: "4 breakpoint (375/768/1280/1536)" vs "đủ 4 breakpoint (375/768/1280+)" vs 6 breakpoint Tailwind (base<640, sm 640, md 768, lg 1024, xl 1280, 2xl 1536) vs `[375, 768, 1280]` | `docs/BRD.md:129`, `BRIEF.md:39` | `docs/DESIGN.md:166-173`, `.context/project-config.md:107` | R-23 theo DESIGN (Tailwind) | **MEDIUM** — có thể hòa giải (375 → base, 1280 → xl…): BRD/BRIEF = target device widths, DESIGN = thang Tailwind; nhưng 4 nguồn liệt kê 4 bộ số khác nhau → implementer dễ hiểu sai. Cần user/design xác nhận bộ nào authoritative |
| C2 | **Form liên hệ lưu hay chỉ forward**: BRD In-Scope "Form liên hệ (lưu/forward…)" vs ERD "chưa cần lưu DB — forward qua email/API bên thứ ba" | `docs/BRD.md:52` | `docs/ERD.md:20-22` + `project-config.md:40-41` (`db_tool: none`) | R-16 theo ERD (forward, không lưu DB) | **MEDIUM** — phụ thuộc Open Question #4 (form gửi về đâu); spec đã ghi nhận OQ nhưng 2 doc vẫn lệch nhau |
| C3 | **BRIEF self-inconsistent về domain/ngôn ngữ**: dòng 50 liệt kê "domain, ngôn ngữ" là "còn thiếu", trong khi dòng 15-16 ghi "✅ Đã chốt (08/10/2026): Domain ntasolution.vn · Song ngữ VI/EN" | `BRIEF.md:50` | `BRIEF.md:15-16` + `docs/BRD.md:167` | Overview spec theo "đã chốt" | **LOW** — BRIEF dòng 50 stale; BRD Open Questions cũng không liệt domain/ngôn ngữ |

Không có conflict mức HIGH.

---

## Feature Coverage Matrix

| # | Requirement | Source | Status | Note |
|---|------------|--------|--------|------|
| 1 | FR-001 Hero + 2 CTA + 4 breakpoint | BRD:65-67 | ✅ | R-01 |
| 2 | FR-002 3 card giải pháp + hover | BRD:69-71 | ✅ | R-02 — citation range thiếu dòng 71 (m6) |
| 3 | FR-003 Sản phẩm tiêu biểu 3–4 + CTA | BRD:73-75 | ✅ | R-03 — citation range sai (m7) |
| 4 | FR-010 Về NTA 5 khối + timeline | BRD:78-80 | ✅ | R-04 |
| 5 | FR-020 Enterprise overview + 4 slug | BRD:83-85, DESIGN:92-99 | ✅ | R-05 |
| 6 | FR-030 AI overview + 3 slug + case study | BRD:88-90, DESIGN:101-107 | ✅ | R-06 |
| 7 | FR-040 Products Music + Hair-style | BRD:93-95, DESIGN:109-111 | ✅ | R-07 |
| 8 | FR-050 Case study list/detail ≥2 | BRD:98-100, DESIGN:113-119 | ✅ | R-08 (filter + pagination + Challenge→Solution→Result) |
| 9 | FR-060 Blog list/detail + pagination | BRD:103-105, DESIGN:121-123 | ✅ | R-09 + OQ CMS |
| 10 | FR-070 Contact form + hotline + map | BRD:108-110, DESIGN:125-128 | ✅ | R-10 (5 states đầy đủ) |
| 11 | FR-080 Header nav + Footer | BRD:113-115, DESIGN:147,219-223 | ✅ | R-11 — citation DESIGN:146 → 147 (m8) |
| 12 | Screen 404 (NotFoundMessage + HomeLink) | DESIGN:130-132 | ✅ | R-12 — bỏ qua SearchHint (💡 minor) |
| 13 | NFR Performance (LCP<2.5s, ≥90) | BRD:123,28-29, BRIEF:37 | ✅ | R-22 — citation drift (m2) |
| 14 | NFR Security (HTTPS / rate-limit / secret) | BRD:124, BRIEF:41 | ❌ | **M1 — "HTTPS only" mất hẳn** |
| 15 | NFR SEO (SSR/SSG, OG, sitemap, robots, JSON-LD, ≥90) | BRD:125,29, BRIEF:38 | ✅ | R-21 — citation drift (m1) |
| 16 | NFR Scalability (scale-to-zero, max 3) | BRD:126 | ✅ | R-27 |
| 17 | NFR Availability ≥99.5% | BRD:127 | ✅ | R-27 — citation thiếu dòng 127 (m5) |
| 18 | NFR Accessibility WCAG 2.1 AA | BRD:128, BRIEF:40 | ✅ | R-24 — citation drift (m4) |
| 19 | NFR Responsive mobile-first + breakpoints | BRD:129, DESIGN:162-223, BRIEF:39 | ⚠️ | R-23 đúng theo DESIGN — nhưng conflict C1 (4 bộ breakpoint khác nhau) |
| 20 | NFR Language song ngữ hreflang | BRD:51,130, BRIEF:42 | ✅ | R-20 |
| 21 | Scope In-Scope (9 nhóm trang, i18n, form, deploy) | BRD:47-53 | ✅ | R-01…R-12, R-20, R-26, R-27 |
| 22 | Scope Out-of-Scope | BRD:55-58 | ⚠️ | **a1** — không có section Scope/Out-of-Scope trong spec |
| 23 | Roles VISITOR / ADMIN (future) | BRD:134-141, PERMISSION:6-13 | ✅ | R-17 |
| 24 | BR-001 CTA mọi trang | BRD:147 | ✅ | R-25 |
| 25 | BR-002 validate email + SĐT | BRD:148 | ✅ | R-25 |
| 26 | BR-003 đúng 3 mảng, không trộn | BRD:149 | ✅ | R-25 |
| 27 | BR-004 không công bố chưa được phép | BRD:150 | ✅ | R-25 |
| 28 | Constraints Technical (Next.js/TS/Tailwind) | BRD:156, BRIEF:46 | ✅ | Tech Stack |
| 29 | Constraints Budget free tier | BRD:157 | ✅ | R-27 |
| 30 | Constraints Timeline (khung + nội dung mẫu nhanh) | BRD:158 | 💡 | Soft delivery constraint — không cần req riêng |
| 31 | Constraints Regulatory (bản quyền ảnh/nội dung) | BRD:159 | ⚠️ | **a2** — missing |
| 32 | Assumptions: nội dung mẫu; palette tạm; domain | BRD:165-167 | ✅ | R-26 + OQ#1 + Overview |
| 33 | Open Questions ×5 | BRD:173-177 | ✅ | `[cần xác nhận]` 1–5 đầy đủ |
| 34 | Success metrics (LCP / Lighthouse / form anti-spam / ≥9 trang) | BRD:28-31 | ✅ | R-21, R-22, R-13/R-18, R-26 (citation m1-m3) |
| 35 | Design screen inventory (13 screens) | DESIGN:78-132 | ✅ | R-01…R-12 phủ đủ 13 route |
| 36 | Contact form states (5 states) | DESIGN:128 | ✅ | R-10 |
| 37 | Home states Default/Loading/Error + empty states | DESIGN:82 | ⚠️ | **a3** |
| 38 | Responsive behavior từng screen | DESIGN:181-223 | ✅ | R-23 (pointer) |
| 39 | API POST /api/contact contract đầy đủ | API_SPEC:40-61 | ✅ | R-13 — khớp từng field (name 2–100, phone 9–15, message 10–2000, honeypot, 200/400/429) |
| 40 | API GET /api/health | API_SPEC:63-67 | ✅ | R-14 |
| 41 | API GET /api/posts, /api/case-studies (optional) | API_SPEC:30-34 | ✅ | R-15 + OQ đúng tinh thần "v1 có thể static" |
| 42 | Base URL dev/prod | API_SPEC:15-20 | ✅ | Mục API Endpoints |
| 43 | No DB, content files SSG/SSR, forward form | ERD:16-22,34, project-config:40-41 | ✅ | R-16 (xem conflict C2) |
| 44 | Entities khái niệm (Solution/Product/CaseStudy/Post/ContactSubmission) | ERD:26-34 | ✅ | R-16 — relations (Category/Tag/Image) chưa nêu (💡, mức conceptual là chấp nhận được) |
| 45 | Guard order rateLimit→validate→honeypot→handler | PERMISSION:17-26 | ✅ | R-18 — khớp từng bước incl. "200 giả" |
| 46 | Route ↔ permission matrix (4 hàng) | PERMISSION:28-35 | ✅ | R-14/R-15/R-18 + "route còn lại public" |
| 47 | Secret hygiene NEXT_PUBLIC_* / Secret Manager | PERMISSION:37-41 | ✅ | R-19 |
| 48 | CI/CD GitHub Actions + deploy GCP Cloud Run | project-config:47-48, BRD:53 | ✅ | R-27 |
| 49 | Package manager chưa chốt → cần xác nhận | project-config:22 | ✅ | `[cần xác nhận]` #6 |
| 50 | Page states/edge cases khác (loading, empty list) | DESIGN:82 + checklist 2D | ⚠️ | **a3** |

💡 Minor suggestions (không chặn): carry BRD priorities (FR-040/FR-060 = Medium) vào spec để graph ưu tiên; component library/breadcrumb/share bar/office hours/search hint là chi tiết design-phase — giữ ở `design-spec.md`, không bắt buộc ở spec.

---

## Missing Edge Cases
- **a3** — Loading/Error states cho trang chủ & empty states cho list (blog/case-studies) chưa specify.
- Rate-limit **threshold** (số request/Window) không doc nào định nghĩa — API_SPEC chỉ có `429`. (Gap ở docs, không phải spec — ghi nhận khi implement R-13/R-18.)

## Non-functional Gaps
- **M1 — HTTPS only** (BRD:124, BRIEF:41) chưa có trong spec.
- Các NFR còn lại (Performance/SEO/Scalability/Availability/Accessibility/Responsive/Language) covered ✅.

---

## Gap List (trả về builder / spec-init)

1. **[MISSING · M1]** Thêm req NFR Security "HTTPS only" (redirect/enforce TLS) — nguồn `docs/BRD.md:124`, `BRIEF.md:41` — hoặc ghi rõ reason nếu coi Cloud Run TLS là mặc định (cần user xác nhận, không tự suy diễn).
2. **[MISSING · a1]** Thêm section Scope/Out-of-Scope vào spec (nguồn `docs/BRD.md:55-58`).
3. **[MISSING · a2]** Bổ sung constraint Regulatory "chú ý bản quyền ảnh/nội dung" (`docs/BRD.md:159`) — hoặc ghi reason không đưa vào requirement.
4. **[PARTIAL · a3]** Specify trạng thái trang ngoài contact: home Loading/Error (`docs/DESIGN.md:82`), empty state cho list — hoặc ghi "[cần xác nhận]" nếu để graph/phase design chốt.
5. **[CITATION · M2]** Sửa citation `.context/decisions.md (commit ab335bb, e7f54aa)` — file rỗng, không có nội dung này.
6. **[CITATION · m1-m8]** Sửa 8 citation drift (BRD dòng 29/30/31/127/71/75, DESIGN dòng 147, R-27 bổ sung BRD:127).
7. **[CONFLICT · C1-C3 — ghi nhận, cần user resolve]** Chốt bộ breakpoint authoritative (BRD "4 bp" vs DESIGN Tailwind 6 bp vs project-config `[375,768,1280]`); form liên hệ "lưu/forward" (phụ thuộc OQ#4); BRIEF:50 stale (domain/ngôn ngữ đã chốt).

---

## Verdict Reasoning

**Verdict: ❌ FAIL**

FAIL triggers (`.agent/spec-validator.md`):
- **≥1 ❌** → có **1 ❌** (M1 — HTTPS only missing) ✗
- **≥3 ⚠️** → có **3 ⚠️** (a1 out-of-scope, a2 regulatory, a3 page states) ✗
- HIGH conflict → **không có** (C1/C2 MEDIUM, C3 LOW — ghi nhận, không tự resolve)

Không PASS vì: 1 requirement NFR của BRD mất hẳn trong spec + 3 điểm ambiguous + 1 citation bịa (decisions.md) + 8 citation drift. Nội dung chức năng总体 coverage tốt (tất cả 11 FR, 4 BR, roles/guards, API contract, entities, 6/6 Open Questions đều covered đúng nguồn) — sai sót tập trung ở NFR Security, section scope, và precision của citation.

**Hành động:** quay lại `/spec-init` (hoặc change-request) sửa các gap 1–6 theo Gap List → re-validate round 2 (max 2 rounds; nếu vẫn FAIL → hỏi human resolve, đặc biệt C1 breakpoint + M1 HTTPS).

---
*Agent: spec-validator · round-1 · file round-tagged, bản chính tại `.context/review-reports/spec-validation.md` · KHÔNG sửa SPECIFICATIONS.md/docs — chỉ ghi report.*
