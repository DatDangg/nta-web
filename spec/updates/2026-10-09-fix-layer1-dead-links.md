# Spec Update — 2026-10-09 fix-layer1-dead-links

**spec_version:** 1.0.0 → 1.0.0 (**KHÔNG bump** — không đổi requirement)
**Trigger:** feature-update
**Requirements:** KHÔNG THÊM/SỬA/XOÁ. Reconcile code + plan về spec **đã ratified**:
- **R-07** (`SPECIFICATIONS.md:81`): `ProductCard`/`AppCard` không còn trỏ `/products/[slug]` (không có route) → `/products`
- **R-05/R-06** (`:69`,`:75`): `MobileNav` bỏ link cha `/solutions` (không có route) → giữ 2 sub-link
- **R-11** (`:109-111`): `Footer` bỏ link `/privacy` (design "nếu có", chưa có route) → giữ dòng pháp lý copyright
- **R-03** (`:59`): plan text `layer-2-task-01.md`/`layer-0-task-04.md` "≥3–4"/"≥3" → "**≥2**"

**Ảnh hưởng:** module `nav-footer`, `home` (product strip — Layer 2), `products` (Layer 2).
Không đổi API/DB/contract. Không thêm route.

**Lý do không bump version:** requirement văn bản không đổi; chỉ sửa code/plan lệch khỏi spec ratified
(xem `.agent/spec-publish.md` §1 — "Chỉ bump khi requirement đổi").

**Test scope:** `spec/test-scope/current.json` → `trigger: feature-update`, `scopeVersion` 1 → 2, `risk: low`.
