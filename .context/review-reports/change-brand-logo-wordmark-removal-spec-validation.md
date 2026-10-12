Agent: spec-validator (inline — env chặn spawn subagent lồng, primary thực thi)

# Spec Validation — change/brand-logo-wordmark-removal

- **Change:** `spec/changes/archive/2026-10-12-brand-logo-wordmark-removal.md`
- **Class:** MODIFY (UI/brand component, post-build) · **Risk:** LOW
- **Spec version:** 3.0.0 → **3.0.0 (KHÔNG bump)** · **Scope:** v14 → **v15**
- **Ngày:** 2026-10-12

## Cross-check spec vs change

| Câu hỏi | Kết luận |
|---|---|
| Change có thêm/sửa/xoá requirement nào? | **KHÔNG.** `SPECIFICATIONS.md` giữ nguyên R-01…R-27. Không có R-xx quy định thành phần logo. |
| R-11 (Header/Footer nav) có bị đổi? | Không — chỉ đổi thành phần hiển thị của `BrandLogo` (bỏ wordmark text), nav/footer structure nguyên. |
| R-24 (WCAG AA) có bị suy giảm? | **Không.** Accessible name link home giữ qua `aria-label` = `homeLabel` (`"NTA, trang chủ"`/`"NTA, home"`); JSON-LD brand name giữ. |
| R-23 (responsive) có bị ảnh hưởng? | Không — diff chỉ *giảm* bề rộng; mark `h-9 w-auto` giữ tỉ lệ 480:397. |
| Có conflict với requirement/gap register? | Không. |
| Spec delta ghi đúng? | `spec/updates/2026-10-12-brand-logo-wordmark-removal.md` + `spec/CHANGELOG.md` + `spec/test-scope/current.json` (scope v15). |
| Doc intent bị sửa để khớp code? | Không — `docs/DESIGN.md`/`API_SPEC.md`/`ERD.md` không mô tả logo (0 match). `.context/design-spec.md:22` reconcile là file context as-built, hợp lệ. |

## Verdict

**✅ PASS** — không có gap/conflict. Không đổi requirement → không bump `spec_version`; `spec/test-scope/current.json` (v15) đã sinh.
