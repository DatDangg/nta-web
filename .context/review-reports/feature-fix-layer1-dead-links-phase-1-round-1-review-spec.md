Agent: spec-validator (⚠️ INLINE re-check — see caveat)

# Spec Re-check — feature fix-layer1-dead-links · phase 1 · round 1

> ⚠️ **Caveat:** chạy **inline bởi agent `change-request`** — môi trường chặn spawn subagent
> (`subagent depth limit reached (1)`), nên không có spec-validator độc lập. User đã chấp nhận.
> Mục tiêu: xác nhận 4 gap MED của `.context/review-reports/feature-nta-website-layer-1-round-1-spec-review.md`
> đã đóng. READ-ONLY đối với source (không sửa code trong bước này).

## VERDICT: ✅ PASS (4/4 gap MED đã đóng; LOW 5–10 + C-A ngoài scope)

### Verify commands (re-run)
| Command | Result |
|---|---|
| `npm run lint` | ✅ PASS |
| `npm run typecheck` | ✅ PASS |
| `npm run build` | ✅ PASS |

### Gap re-check

| Gap | Nguồn gốc | Trạng thái | Evidence |
|---|---|---|---|
| **Gap 1** — ProductCard/AppCard link `/products/[slug]` không tồn tại | report §2 Gap 1 | ✅ **ĐÓNG** | `ProductCard.tsx:14`, `AppCard.tsx:17` = `href="/products"`; grep `products/\${` trong `src/components` = none |
| **Gap 2** — MobileNav link cha `/solutions` không tồn tại | report §2 Gap 2 | ✅ **ĐÓNG** | `MobileNav.tsx` items bỏ `['solutions','/solutions']`; label non-link + 2 sub-link; grep `'/solutions'` chỉ còn `Header.tsx:52` (prefix match, không phải link) |
| **Gap 3** — Footer link `/privacy` không tồn tại | report §2 Gap 3 | ✅ **ĐÓNG** | `Footer.tsx:25` chỉ còn copyright; grep `"/privacy"` trong `src/` = none |
| **Gap 4** — `layer-2-task-01` "≥3–4"/"≥3" stale vs R-03 "≥2" | report §2 Gap 4 | ✅ **ĐÓNG** | `layer-2-task-01.md:26,43` = "≥2"; `layer-0-task-04.md:43` = "≥2"; `:91` note ratify |

### Requirements cross-check (không đổi requirement — chỉ align code/plan)
- **R-07** (`SPECIFICATIONS.md:81`): code giờ chỉ trỏ `/products` ✅
- **R-05/R-06** (`:69,:75`): không còn link tới `/solutions` index ✅
- **R-11** (`:109-111`): footer vẫn 4 cột + pháp lý (copyright) + social + liên hệ ✅
- **R-03** (`:59`): plan text khớp "≥2" ratified ✅
- **Spec delta:** KHÔNG có (không sửa `SPECIFICATIONS.md`, không bump `spec_version`) — đúng vì code/plan được align về spec đã ratified.

### Conflicts
- **C-B** (R-03 "≥2" vs plan "≥3–4") → ✅ **giải quyết** bằng reconcile plan.
- **C-A** (card radius tokens vs design-spec) → ngoài scope, vẫn mở (LOW-MED).

### Còn mở (ngoài scope change này)
- LOW Gap 5–10 (footer columns/address, home.ts EN pre-localized hrefs, layer-1-task-04 close-out stale,
  `hover:border-strong` no-op, icon family, hardcoded aria) — xử lý riêng sau.
- Layer-0 O1/O2 defer Layer 2.

### Điều kiện re-run độc lập
Re-run `spec-validator` phase review Layer 1 round 2 khi có môi trường spawn subagent, để ratify chính thức
việc unlock Layer 2.
