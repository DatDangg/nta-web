Agent: spec-validator

# Spec Review — feature nta-website · Layer 1 · round 2

> Phase review re-run (round 2) sau change `fix-layer1-dead-links`. READ-ONLY cross-check spec ↔ design ↔
> code ↔ plan. Mục tiêu: **xác nhận 4 gap MED round 1 đã đóng thật** + re-scan gap/conflict mới.
> Nguồn round 1: `.context/review-reports/feature-nta-website-layer-1-round-1-spec-review.md` (❌ FAIL).

## VERDICT: ✅ PASS

4/4 gap MED round 1 đã đóng thật (verified trên file nguồn, không chỉ dựa report). Không phát sinh gap/conflict
HIGH/MED mới. Các LOW round 1 (Gap 5–10, conflict C-A) vẫn treo nhưng **non-blocking**. → **Đủ điều kiện unlock Layer 2.**

## Trạng thái 4 gap MED (round 1 → round 2)

| Gap | Nội dung | Trạng thái | Bằng chứng (verified trực tiếp) |
|---|---|---|---|
| **Gap 1** | ProductCard/AppCard link `/products/[slug]` (route không tồn tại) | ✅ **ĐÓNG** | `ProductCard.tsx:14` `href="/products"`; `AppCard.tsx:17` `href="/products"`; grep `src/` cho `/products/${` = 0 match (chỉ còn `src/lib/content/products.ts:6` là filename path nội dung, không phải href) |
| **Gap 2** | MobileNav link cha `/solutions` (route không tồn tại) | ✅ **ĐÓNG** | `MobileNav.tsx:10` items không còn `solutions`; `:43` label nhóm = `<p className="flex min-h-11 items-center">{t('solutions')}</p>` (non-link) + 2 `Link` `/solutions/enterprise`, `/solutions/ai`. Grep `'/solutions'` chỉ còn `Header.tsx:52` = `routeIsActive('/solutions')` (prefix match active state, **không phải link**) |
| **Gap 3** | Footer link `/privacy` (route không tồn tại) | ✅ **ĐÓNG** | `Footer.tsx:25` chỉ còn `<p>{t('copyright')}</p>`, không còn `<Link href="/privacy">`; grep `/privacy` trong `src/` = 0 match |
| **Gap 4** | Plan text R-03 "≥3–4"/"≥3" mâu thuẫn ratified "≥2" | ✅ **ĐÓNG** | `tasks/nta-website/layer-2-task-01.md:26` = "sản phẩm tiêu biểu **≥2**"; `:43` = "**≥2** `ProductCard`"; `tasks/nta-website/layer-0-task-04.md:43` = "sản phẩm tiêu biểu **≥2**"; `:91` note ratify ≥2 giữ nguyên. Khớp `SPECIFICATIONS.md:59` R-03 |

## Coverage matrix (Layer-1 scope ↔ spec/design ↔ code)

| Req | Source | Round-2 status | Note |
|---|---|---|---|
| R-11 nav/footer | `SPECIFICATIONS.md:109-111`; design §1.1/§1.2 | ✅ | Header ✅; Footer 4-col + CTA BR-001 + legal/social/toggle ✅; 3 dead-link đã gỡ (Gap 1–3). Footer "Giải pháp" vẫn chỉ 2 link — thuộc Gap 5 (LOW, non-blocking) |
| R-07 `/products` | `SPECIFICATIONS.md:81` | ✅ | Cards giờ link đúng `/products`; route `/products` do Layer 2 task-05 build (per plan) |
| R-05/R-06 solutions | `SPECIFICATIONS.md:69,75` | ✅ | Chỉ `/solutions/enterprise`, `/solutions/ai`; không còn link cha `/solutions` ở mobile |
| R-03 featured products | `SPECIFICATIONS.md:59`; design Screen 1 | ✅ | Code + plan đều khớp "≥2"; đúng 2 sản phẩm thật (`src/content/home.ts`) |
| R-12 404 / R-20 i18n / R-22 perf / R-23 responsive / R-24 a11y | round-1 §1 | 🟡 (không đổi) | Giữ nguyên trạng thái PARTIAL/✅ round 1; các residual (Inter font, hreflang meta, icon family, hardcoded aria) đã defer Layer 4 — không nằm trong scope change này |
| R-01…R-10, R-13…R-19, R-21, R-25…R-27 | — | ⬜ deferred | Owner Layer 2/3/4 (không đổi) |

Không requirement nào mất owner; change không thêm/đổi requirement (`spec_version` giữ 1.0.0, chỉ reconcile).

## Gap / conflict MỚI phát sinh từ change

- **Không có HIGH/MED mới.** Change chỉ align code/plan về spec đã ratified (R-03/R-05/R-06/R-07/R-11), không đổi contract.
- MINOR mới (non-blocking):
  - **F-01** i18n key `footer.privacy` giờ unused (dead key) sau khi bỏ link — dọn ở Layer 4 sweep. Không chặn.
  - **F-02** route `/products` chưa tồn tại ở build hiện tại (Layer 2 task-05 sẽ tạo) → link tạm qua catch-all. Hợp lệ theo R-07/plan.

## LOW round 1 — còn treo (out of scope, xác nhận non-blocking)

| # | Nội dung | Trạng thái round 2 |
|---|---|---|
| Gap 5 | Footer "Giải pháp"/"Liên hệ" thiếu sub-link 4+3 slug + địa chỉ | ⚠️ Still open (non-blocking) — `Footer.tsx:8` vẫn 2 link |
| Gap 6 | `home.ts` EN hrefs pre-localized (rủi ro double-prefix) | ⚠️ Still open (non-blocking) — **cần để mắt khi Layer 2 consume** |
| Gap 7 | `layer-1-task-04.md` close-out stale | ⚠️ Still open (non-blocking) |
| Gap 8 | `hover:border-strong` no-op ở Button secondary | ⚠️ Still open (non-blocking, craft) |
| Gap 9 | Icon family chưa Phosphor (glyph/hand-drawn) | ⚠️ Still open (non-blocking) |
| Gap 10 | hardcoded `aria-label="Language"` + `aria-current="true"` | ⚠️ Still open (non-blocking) |
| C-A | Card radius tokens §4 "rounded-md" vs design-spec "rounded-lg" | ⚠️ Still open (LOW-MED, non-blocking; code khớp design-spec) |

→ Tất cả vẫn **non-blocking**; không có cái nào cản Layer 2.

## Verify commands

| Command | Result |
|---|---|
| `npm run lint` | ⚠️ **Không chạy được bởi spec-validator** — shell bị permission deny (`git show` denied). Không retry theo Tool Loop Guard |
| `npm run typecheck` | ⚠️ Không chạy được (shell deny) |
| `npm run build` | ⚠️ Không chạy được (shell deny) |

- Evidence bù: reviewer độc lập round 2 (STRICT) đã tự chạy **3/3 PASS** (`...-phase-1-task-01-round-2-independent-review.md:36-40`, Next 15.5.27) + task-01 Verification Summary (`phase-1-task-01.md:62-64`) cùng kết quả. Không có mâu thuẫn giữa các nguồn.
- `test: null` → skip, no test framework configured.

## Điều kiện unlock Layer 2

1. ✅ 4 gap MED đã đóng (verified trên file nguồn).
2. ✅ Không còn gap/conflict HIGH/MED chặn Layer 2.
3. ✅ Reviewer độc lập STRICT PASS (round 2); check commands PASS (qua reviewer).
4. ✅ Change archived (`spec/changes/archive/2026-10-09-fix-layer1-dead-links.md`); không còn change file pending; `spec/test-scope/current.json` `scopeVersion` 1→2, `trigger: feature-update`.
5. ⚠️ LOW Gap 5–10 + C-A: xử lý opportunistic / Layer 4 sweep — **không** phải điều kiện unlock.

## Recommendation

**✅ UNLOCK Layer 2.** 4 gap MED round 1 đã đóng thật; không phát sinh blocker mới. Đề xuất:
- Cho phép bắt đầu Layer 2 (Layer 2 chỉ unlock khi Layer 1 PASS + user duyệt — hiện thỏa điều kiện PASS).
- Khi Layer 2 tiêu thụ `src/content/home.ts`, chú ý **Gap 6** (href EN pre-localized) để tránh double-prefix locale.
- Sweep LOW Gap 5–10 + C-A ở Layer 4 (không chặn tiến độ).

## Residual risk

- spec-validator **không tự chạy** lint/typecheck/build (shell deny) → dựa vào evidence reviewer độc lập (cùng kết quả, không mâu thuẫn). Nếu muốn độc lập tuyệt đối, primary chạy lại 3 command.
- Không browser-test responsive (không có môi trường browser) — reviewer đã xác minh bằng CSS math; ghi residual.
