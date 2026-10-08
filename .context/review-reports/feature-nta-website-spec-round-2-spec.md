# Spec Validation Report — NTA Website (round-tagged copy)

**Agent:** spec-validator · **Round:** 2 (vòng cuối) · **Date:** 2026-10-08
**Entry Mode:** full_docs · **File validated:** `SPECIFICATIONS.md` (1.0.0 — đã sửa gap 1–6 round 1)

> 📄 Bản round-tagged — **nội dung y hệt** bản chính đã ghi đè: `.context/review-reports/spec-validation.md` (Round: 2).
> Round 1 (FAIL) còn lưu tại: `.context/review-reports/feature-nta-website-spec-round-1-spec.md`.

## Verdict: ✅ PASS

### Kiểm soát gap round 1
| Gap | Kết quả | Evidence |
|---|---|---|
| M1 HTTPS only (BRD:124, BRIEF:41) | ✅ FIXED | R-19 (dòng 148–150) |
| a1 Scope In/Out (BRD:47-53 / 55-58) | ✅ FIXED | Section Scope (dòng 26–34) |
| a2 Regulatory (BRD:159) | ✅ FIXED | Constraints soft (dòng 176–178) + Budget:157, Timeline:158 |
| a3 States home (DESIGN:82) + empty-state `[cần xác nhận]` | ✅ FIXED | R-01 (54–56), R-08 (90), R-09 (97) |
| M2 Citation decisions.md bịa | ✅ FIXED | Dòng 24 → BRIEF:15-16 + BRD:51,167 (grep OK) + git log; `e7f54aa` verify qua `.git/logs/HEAD:1` |
| m1–m8 citation drift | ✅ 8/8 FIXED | R-21→125,29 · R-22→123,28-29 · R-26→48,31,165 · R-24→128 · R-27 thêm 127 · R-02→69-71 · R-03→73-75 · R-11→DESIGN:147 |
| m9 Scalability nguồn | ✅ FIXED | skill + ERD:16-18 + config:40-41 (self-reference cosmetic) |
| C1–C3 conflict register | ✅ FIXED | Section "Cross-doc conflicts" (204–208) + inline notes |

Bonus round 1 đã fix: Priority Medium FR-040/060 (R-07/R-09), SearchHint (R-12), rate-limit threshold `[cần xác nhận]` (R-13).

### Regression scan
- 27/27 req còn đủ, không req bịa mới; mọi citation sửa-mới đều verify đúng dòng (BRD 51/157/158/159/31/127/128, DESIGN 147/166-173, config:107, API_SPEC:60, skills path tồn tại).
- Findings round 2: **CRITICAL 0 · MAJOR 0 · MINOR 4** (n1 residual `ab335bb` không verify trực tiếp do bash deny — corroborated bởi run journal spec-init; n2 self-reference cosmetic; n3 wording "khớp implementation" khi chưa có implementation; n4 DESIGN:82 trích "(principle)" cho empty-state — đã `[cần xác nhận]`).
- **0 ❌ · 0 ⚠️ · 0 HIGH conflict.**

### Conflict register (không chặn — chờ user)
C1 breakpoint (MEDIUM, → `/brainstorm`) · C2 form lưu/forward (MEDIUM, OQ#4) · C3 BRIEF:50 stale (LOW).

### Verdict Reasoning
Round 1: ❌ (1 ❌ + 3 ⚠️ + 2 MAJOR + 8 drift) → sửa → **Round 2: ✅ PASS** — 7/7 gap fixed đúng, không regression, các mục mơ hồ đều đã đưa vào `[cần xác nhận]`/conflict register đúng cơ chế.
**Hành động:** spec hợp lệ → tiếp `/brainstorm` approve → `/graph`; mang C1–C3 + `[cần xác nhận]` vào checkpoints.

---
*Agent: spec-validator · round-2 (cuối) · bản chính: `.context/review-reports/spec-validation.md` · KHÔNG sửa SPECIFICATIONS.md/docs.*
