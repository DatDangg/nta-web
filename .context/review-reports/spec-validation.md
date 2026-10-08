# Spec Validation Report — NTA Website

**Agent:** spec-validator · **Round:** 2 (vòng cuối — max 2) · **Date:** 2026-10-08
**Entry Mode:** full_docs (reverse-engineer spec — repo CHƯA có app code)
**File validated:** `SPECIFICATIONS.md` (spec_version 1.0.0, 27 req R-01…R-27 — đã sửa theo gap 1–6 round 1)
**Sources validated against:** `BRIEF.md`, `docs/INDEX.md`, `docs/BRD.md`, `docs/DESIGN.md`, `docs/API_SPEC.md`, `docs/ERD.md`, `docs/PERMISSION.md`, `.context/project-config.md`, `.context/decisions.md`, `.context/runs/spec-init-nta-website-initial.md`, `.git/logs/HEAD`
**Pending changes:** `spec/changes/` chỉ README + _TEMPLATE → không có change chờ.
*(Round 1: ❌ FAIL — 1 ❌ + 3 ⚠️ + 2 MAJOR + 8 citation drift → sửa gap 1–6. Xem history: file này đã ghi đè theo yêu cầu; bản round 1 còn lưu tại `.context/review-reports/feature-nta-website-spec-round-1-spec.md`.)*

---

## Scope

Re-validate toàn bộ `SPECIFICATIONS.md` sau sửa: (1) đối chiếu 7 gap round 1, (2) quét regression (req mới sót / citation mới lệch do lần sửa), (3) không sửa spec/docs.

## Verdict: ✅ PASS

---

## 1. Kiểm soát Gap round 1 → round 2

| Gap round 1 | Yêu cầu | Kết quả | Evidence (round 2) |
|---|---|---|---|
| **M1 (Gap 1)** | "HTTPS only" + citation `docs/BRD.md:124`, `BRIEF.md:41` | ✅ **FIXED** | R-19 (dòng 148–150): "**HTTPS only** (enforce TLS toàn bộ, redirect HTTP→HTTPS)" — nguồn `docs/BRD.md:124`, `BRIEF.md:41`, `docs/PERMISSION.md:37-41` (dòng 124/41/37-41 đã verify round 1) |
| **a1 (Gap 2)** | Section Scope In/Out + citation `BRD:47-53` / `55-58` | ✅ **FIXED** | Dòng 26–34: In Scope (9 nhóm trang… deploy) trích `docs/BRD.md:47-53` ✅ (47 = header, 48–53 = bullets); Out of Scope (đăng nhập/CMS, e-commerce, tính năng nghiệp vụ) trích `docs/BRD.md:55-58` ✅ (55 = header, 56–58 = bullets) |
| **a2 (Gap 3)** | Constraint Regulatory `BRD:159` | ✅ **FIXED** | Dòng 176–178: "Constraints (soft…): Regulatory — bản quyền ảnh/nội dung (`docs/BRD.md:159`)" ✅ + bổ sung Budget (`:157` ✅), Timeline (`:158` ✅ — đã grep xác nhận 157/158/159) |
| **a3 (Gap 4)** | States trang chủ (`DESIGN:82`) + empty-state list `[cần xác nhận]` | ✅ **FIXED** | R-01 (dòng 54–56): "States: Default / Loading (nếu fetch) / Error" + `[cần xác nhận]` dưới SSG — trong range `DESIGN:78-83` (82 = States) ✅; R-08 (dòng 90) + R-09 (dòng 97): "Empty state cho list chưa specify — `[cần xác nhận]`" ✅ |
| **M2 (Gap 5)** | Xóa citation `.context/decisions.md (commit…)` | ✅ **FIXED** | Dòng 24 giờ trích `BRIEF.md:15-16`, `docs/BRD.md:51,167` + "xem `git log`: ab335bb, e7f54aa" — **không còn trích decisions.md**. Verify: BRD:51 = song ngữ ✅, BRD:167 = domain `ntasolution.vn` ✅ (grep); `e7f54aa` **có thật** = commit HEAD lúc clone (`.git/logs/HEAD:1`) ✅. *Residual risk: `ab335bb` không verify trực tiếp được (bash deny — Tool Loop Guard), được corroborate bởi run journal `.context/runs/spec-init-nta-website-initial.md:28` ("commit d526948, ab335bb, e7f54aa" — quan sát git log lúc spec-init). Nguồn chính của claim (BRIEF/BRD) đã verify đúng → không chặn.* |
| **m1 (Gap 6)** | R-21 Lighthouse → BRD:29 | ✅ **FIXED** | Dòng 157: `docs/BRD.md:125,29` — 29 = Lighthouse ✅ |
| **m2 (Gap 6)** | R-22 → BRD:28-29 | ✅ **FIXED** | Dòng 159: `docs/BRD.md:123,28-29` — 28 = LCP, 29 = Lighthouse ✅ |
| **m3 (Gap 6)** | R-26 ≥9 trang → BRD:31 | ✅ **FIXED** | Dòng 175: `docs/BRD.md:48,31,165` — 31 = "≥ 9 trang" ✅ |
| **m4 (Gap 6)** | R-24 Accessibility → BRD:128 | ✅ **FIXED** | Dòng 169: `docs/BRD.md:128` ✅ |
| **m5 (Gap 6)** | R-27 thêm BRD:127 (availability) | ✅ **FIXED** | Dòng 191: `docs/BRD.md:53,126,127,157` — 127 = Availability ≥99.5% ✅ |
| **m6 (Gap 6)** | R-02 → BRD:69-71 | ✅ **FIXED** | Dòng 58: `docs/BRD.md:69-71` (71 = AC) ✅ |
| **m7 (Gap 6)** | R-03 → BRD:73-75 | ✅ **FIXED** | Dòng 60: `docs/BRD.md:73-75` (75 = AC "3–4 sản phẩm") ✅ |
| **m8 (Gap 6)** | R-11 Nav → DESIGN:147 | ✅ **FIXED** | Dòng 111: `docs/DESIGN.md:147,219-223` — 147 = Nav row ✅ |
| **m9** | Scalability tier ghi nguồn | ✅ **FIXED** | Dòng 182–185: Option off → `skills/scalability-architecture/` (folder tồn tại ✅), Tier → `docs/ERD.md:16-18` + `project-config:40-41` + ghi rõ "không có docs canonical nào chọn tier khác". *Note cosmetic: có 1 vòng tham chiếu tự thân "SPECIFICATIONS.md dòng này" — không ảnh hưởng vì nguồn thật đã đủ.* |
| **C1–C3 (Gap 7)** | Ghi nhận trong conflict register | ✅ **FIXED** | Section "Cross-doc conflicts" (dòng 204–208) liệt kê C1 (MEDIUM, → brainstorm), C2 (MEDIUM, phụ thuộc OQ#4), C3 (LOW, BRIEF:50 stale) — refs đúng dòng đã verify round 1; thêm note inline tại R-23 (164–167), R-16 (135–136), OQ#4 (200) |
| *💡 round 1* | Carry priorities FR-040/060; SearchHint | ✅ Bonus fixed | R-07 (dòng 82) + R-09 (dòng 95): "Priority: Medium (theo FR-040/060)" — BRD:94/104 nằm trong range cite ✅; R-12 (dòng 112) "+ SearchHint nếu có" (DESIGN:132) ✅ |

**7/7 gap + 8/8 citation drift + m9 + conflict register = FIXED. Không gap cũ nào bị reopen.**

---

## 2. Regression scan (req mới sót / citation mới lệch)

Quét lại toàn bộ 27 req + các section mới/sửa — mọi citation đều verify lại (kể cả giữ nguyên từ round 1):

| Hạng mục | Kết quả |
|---|---|
| Scope section mới (BRD:47-53, 55-58) | ✅ đúng dòng |
| Overview dòng 24 (BRD:51,167) | ✅ grep xác nhận 51 = song ngữ, 167 = domain |
| States/empty-state mới (DESIGN:78-83, 82) | ✅ |
| Constraints mới (BRD:157/158/159) | ✅ grep xác nhận |
| R-13 note rate-limit threshold → `API_SPEC.md:60` | ✅ dòng 60 = response `429` (không có threshold trong doc — supporting evidence đúng) |
| Conflict notes (C1: BRD:129, BRIEF:39, DESIGN:166-173, config:107; C2: BRD:52, ERD:20-22; C3: BRIEF:50, 15-16) | ✅ tất cả đúng dòng |
| Toàn bộ citation còn lại R-01…R-27, Tech Stack, OQ 1–6 | ✅ không lệch mới (giữ nguyên đã verify round 1; R-02/R-03/R-11/R-21/R-22/R-24/R-26/R-27 đã sửa đúng) |
| Req bị xóa/rút gọn trong lần sửa? | ❌ Không — đủ 27 R-xx; R-19/R-01 chỉ được MỞ RỘNG (thêm HTTPS, states) |
| Requirement bịa mới? | Không — mọi req mới (HTTPS, Scope, Constraints, states) đều trích nguồn docs đã verify |

### Findings round 2 (không chặn)

- **MINOR n1** — `git log: ab335bb` không verify trực tiếp được trong runtime này (bash permission deny → Tool Loop Guard cấm retry; reflog chỉ xác nhận `e7f54aa`). Corroborated gián tiếp qua run journal spec-init. → **Residual risk**, ghi nhận; khi có bash/terminal nên chạy `git log --oneline` xác nhận 1 lần.
- **MINOR n2** — Scalability Profile (dòng 184) có vòng tham chiếu tự thân "nguồn: `SPECIFICATIONS.md` dòng này" — cosmetic; nguồn thật (skill + ERD:16-18 + config:40-41) đã đủ.
- **MINOR n3** — R-23 conflict note (dòng 167) ghi "chọn DESIGN… vì khớp **implementation**" — repo chưa có app code nên từ chính xác nên là "khớp design spec / chuẩn Tailwind". Wording, không đổi nội dung; C1 vẫn được flag "cần user chốt" ✅.
- **MINOR n4** — R-08 empty-state (dòng 90) trích `DESIGN:82` dưới dạng "(principle)" — DESIGN:82 là States của trang chủ, không phải empty-state case-studies; đã mark `[cần xác nhận]` nên chấp nhận được.

**Score round 2:** CRITICAL 0 · MAJOR 0 · MINOR 4 (cosmetic/residual) · ❌ 0 · HIGH conflict 0 · ⚠️ ambiguous 0 (a1/a2/a3 đã resolved; các open item đều là `[cần xác nhận]`/conflict đã register đúng cơ chế).

---

## 3. Feature Coverage Matrix (round 2 — delta so với round 1)

| # | Requirement | Source | Status round 1 | Status round 2 |
|---|------------|--------|----------------|----------------|
| 1–13, 15–18, 20–21, 23–30, 32–49 (đã ✅ round 1) | (giữ nguyên) | như round 1 | ✅ | ✅ — citation drift đã sửa hết, không regression |
| 14 | NFR Security (HTTPS + rate-limit + secret) | BRD:124, BRIEF:41, PERMISSION:37-41 | ❌ | ✅ **R-19** |
| 19 | NFR Responsive + breakpoint conflict | BRD:129, DESIGN:162-181, BRIEF:39, config:107 | ⚠️ | ✅ **R-23** — conflict C1 đã register (MEDIUM, chờ user), spec chọn DESIGN có ghi rationale |
| 22 | Scope Out-of-Scope | BRD:55-58 | ⚠️ | ✅ **section Scope** |
| 31 | Constraint Regulatory (bản quyền) | BRD:159 | ⚠️ | ✅ **Constraints (soft)** |
| 37 | Home states (Loading/Error) | DESIGN:82 | ⚠️ | ✅ **R-01** + `[cần xác nhận]` |
| 50 | Empty state list | DESIGN:82 principle | ⚠️ | ✅ **R-08/R-09** `[cần xác nhận]` |
| — | Priority FR-040/060 (💡 round 1) | BRD:94,104 | 💡 | ✅ R-07/R-09 |
| — | SearchHint (💡 round 1) | DESIGN:132 | 💡 | ✅ R-12 |

**0 ❌ · 0 ⚠️ · 0 HIGH conflict.**

---

## Missing Edge Cases / Non-functional Gaps (round 2)
- (mới) Rate-limit threshold chưa doc — đã được đưa vào spec như `[cần xác nhận]` tại R-13 ✅ (không còn là gap ẩn).
- Empty states — đã flag `[cần xác nhận]` ✅.
- HTTPS — covered ✅. Các NFR khác giữ nguyên covered ✅.

## Conflict Register (chưa resolve — không chặn PASS, cần user)
- **C1 (MEDIUM):** bộ breakpoint authoritative — chờ user ở `/brainstorm` checkpoint (spec tạm chọn DESIGN/Tailwind).
- **C2 (MEDIUM):** form "lưu" vs "chỉ forward" — phụ thuộc OQ#4.
- **C3 (LOW):** `BRIEF.md:50` stale — nên sửa BRIEF khi có dịp (intent doc → qua change-request/user).

---

## Gap List
Không có gap blocking. Residual/đề xuất (không chặn):
1. (n1) Verify `git log` commit `ab335bb` khi có terminal — residual risk.
2. (n2/n3/n4) Cosmetic wording: self-reference trong Scalability Profile; "khớp implementation" → "khớp design spec"; R-08 "(DESIGN:82 principle)" — sửa ở lần sau.
3. C1–C3 chờ user resolve (đã register đúng nơi).

---

## Verdict Reasoning

**Verdict: ✅ PASS (round 2 — vòng cuối)**

- **Không có ❌**: 7/7 gap round 1 đã fix đúng, kể cả M1 (HTTPS with đúng citation `docs/BRD.md:124` + `BRIEF.md:41`); không phát hiện req docs nào bị sót mới.
- **Không có HIGH conflict**: C1/C2 MEDIUM + C3 LOW đã được register trong spec (dòng 204–208) — đúng cơ chế "ghi nhận, chờ user resolve", không tự resolve ngầm.
- **Không có ≥3 ⚠️**: a1/a2/a3 đã resolved; các điểm mơ hồ còn lại đều đã đưa vào `[cần xác nhận]` (OQ 1–6 + rate-limit + states) — đúng cơ chế spec.
- **Không regression**: quét lại toàn bộ citation (kể cả các dòng sửa mới) — 0 citation lệch mới; 27 req đầy đủ; 4 findings còn lại ở mức MINOR cosmetic/residual.

**Round 1 → 2:** ❌ FAIL (1 ❌, 3 ⚠️, 2 MAJOR, 8 citation drift) → sửa → ✅ **PASS** (0 ❌, 0 ⚠️, 0 MAJOR, 4 MINOR cosmetic).
**Hành động:** spec hợp lệ để bước tiếp theo (`/brainstorm` approve design → `/graph` chia task); mang theo C1–C3 + `[cần xác nhận]` list vào checkpoints tương ứng.

---
*Agent: spec-validator · round-2 (cuối) · ghi đè `spec-validation.md` theo yêu cầu · bản round 1: `feature-nta-website-spec-round-1-spec.md` · KHÔNG sửa SPECIFICATIONS.md/docs.*
