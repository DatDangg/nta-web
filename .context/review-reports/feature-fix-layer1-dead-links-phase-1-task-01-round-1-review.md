Agent: reviewer (⚠️ INLINE self-review — see Independence caveat)

# Review — feature fix-layer1-dead-links · phase-1 · task-01 · round 1

> ⚠️ **Independence caveat (bắt buộc đọc):** report này được chạy **inline bởi agent `change-request`**
> (cùng session đã implement), **KHÔNG** phải subagent `reviewer` độc lập. Nguyên nhân: môi trường trả
> `subagent depth limit reached (1)` → không spawn được `reviewer`; không có `ocr`/`aislop`/`oxlint` để thay thế.
> User đã chấp nhận phương án "commit với self-review minh bạch". **Residual risk:** nên re-run `reviewer`
> độc lập khi có môi trường cho phép (task này thay đổi shell/navigation dùng chung).
> Report tuân theo format reviewer (level/reason/blast radius/verify/findings/verdict).

## Review level / Reason
- **Review level:** STRICT
- **Reason:** scope CROSS-CUTTING — chạm shell navigation dùng chung (`MobileNav`, `Footer`) + shared cards
  (`ProductCard`/`AppCard`) → risk đỏ "shared component/navigation" theo `AGENTS.md` §Reviewer rules.

## Blast radius
- Mọi trang (2 locale) qua `Footer` + `MobileNav` (drawer).
- Home product strip (Layer 2) + `/products` page (Layer 2) qua `ProductCard`/`AppCard`.
- Plan docs `layer-2-task-01.md`, `layer-0-task-04.md` (R-03 requirement text).

## Verify commands + result (tự chạy)
| Command | Result |
|---|---|
| `npm run lint` | ✅ PASS (exit 0, eslint clean) |
| `npm run typecheck` | ✅ PASS (exit 0, tsc --noEmit) |
| `npm run build` | ✅ PASS (Next 15.5.27; `○ /_not-found`, `● /[locale]` (/vi,/en), `ƒ /[locale]/[...rest]`) |

## Findings

| # | Severity | Nội dung | Status |
|---|---|---|---|
| F1 | — | `ProductCard.tsx:14`, `AppCard.tsx:17` đổi ≥ `href={`/products/${product.slug}`}` → `href="/products"`. Grep `products/\${` chỉ còn match trong `src/lib/content/products.ts` (đường dẫn file nội dung, KHÔNG phải `href`) → không còn link tới `/products/[slug]`. | ✅ Fixed |
| F2 | — | `MobileNav.tsx`: bỏ entry `['solutions','/solutions']`; render nhóm solutions bằng label non-link `<p>{t('solutions')}</p>` + 2 sub-link `/solutions/enterprise`, `/solutions/ai`. Focus-trap vẫn query `a, button` (#42 close button + 2 sub-link + 5 item link + CTA) → hoạt động; label không nằm trong tab order (đúng — non-interactive). | ✅ Fixed |
| F3 | — | `Footer.tsx:25`: bỏ `<Link href="/privacy">`; giữ `<p>{t('copyright')}</p>` (dòng pháp lý). `Link` import vẫn dùng (columns + CTA). Grep `"/privacy"` trong `src/` = none. | ✅ Fixed |
| F4 | — | `layer-2-task-01.md:26` "≥3–4"→"≥2"; `:43` "≥3 ProductCard"→"≥2"; `layer-0-task-04.md:43` "≥3"→"≥2"; `:91` note reconcile ghi rõ đã ratify ≥2. Grep không còn "≥3–4"/tiêu biểu ≥3. | ✅ Fixed |
| O1 | LOW (non-blocking) | i18n key `footer.privacy` (vi/en) giờ không còn được dùng. Giữ lại có chủ đích (reserve cho trang privacy tương lai); không gây lỗi render. | Observation |
| O2 | LOW (non-blocking) | Route `/products` chưa tồn tại ở build hiện tại (Layer 2 task-05 sẽ tạo) → card link trỏ `/products` vẫn đi catch-all 404 **cho tới khi Layer 2 build**. Hợp lệ theo R-07 (route có trong spec/plan); đây là contract đã ratify. | Observation |
| O3 | — | Không đụng LOW Gap 5–10 / conflict C-A (đúng scope change). | Confirmed |

- Không thấy regression ở Header desktop solutions dropdown (`routeIsActive('/solutions')` vẫn là prefix match, không phải link), Footer 4-col, i18n VI/EN parity.
- Không có dấu hiệu security/a11y regression trong diff (9 dòng đổi trên 4 file code).

## Verdict
**PASS** (STRICT) — 4 acceptance criteria đạt, 0 CRITICAL/MAJOR, 2 LOW observation non-blocking.

## Residual risk / follow-up
1. Reviewer độc lập chưa chạy (env limit) — nên re-run `reviewer` khi có thể.
2. `/products` cần được build ở Layer 2 (đã có task-05) để link card resolve.
3. i18n key `footer.privacy` chưa dọn — sweep ở Layer 4 nếu muốn.
