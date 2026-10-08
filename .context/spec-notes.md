# Spec Notes

## Purpose
Ghi chú khi dựng/validate spec (`/spec-init`) và khi change request cập nhật spec.

## Format

```markdown
### {Ngày} — {change request / spec-init}

**Nguồn:** code scan | spec/changes/<file>
**Ghi chú:** {điểm cần lưu}
```

## Log

### 2026-10-08 — /spec-init (initial, reverse-engineer từ docs)

**Nguồn:** docs scan (repo CHƯA có app code — `source_roots: []`)
**Ghi chú:** Dựng `SPECIFICATIONS.md` 1.0.0 với 27 req (R-01…R-27) từ BRIEF + docs/{BRD,DESIGN,API_SPEC,ERD,PERMISSION} + project-config. Sinh `spec/test-scope/current.json` (scopeVersion 1, trigger initial-build, risk high). 6 điểm `[cần xác nhận]` = BRD Open Questions + package manager. Khi có code → đối chiếu lại, mâu thuẫn thì code thắng (cập nhật qua `/change`).

**Vòng 1 (2026-10-08):** spec-validator round 1 → **FAIL** (M1 HTTPS only missing, M2 citation `.context/decisions.md` bịa, m1–m8 citation drift, a1 scope section, a2 regulatory, a3 page states; report `.context/review-reports/spec-validation.md`). Đã sửa gap 1–6 trong `SPECIFICATIONS.md` (thêm Scope/Out-of-Scope, R-19 gộp HTTPS only, constraint regulatory/soft, states + empty-state `[cần xác nhận]`, sửa 8 citation, conflict register C1–C3). Round 2 pending.
