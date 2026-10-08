Agent: spec-validator

# Spec Review — feature nta-website · Layer 1 · round 1

> Phase review Layer 1 (task-01..05). READ-ONLY cross-check spec ↔ design ↔ code ↔ plan.
> ⚠️ Report được **primary persist** verbatim (spec-validator hết step trước khi ghi file).

## VERDICT: ❌ FAIL (phase review — ⚠️ GAPS FOUND)

Layer 1 delivered its 5 tasks faithfully at the component level (tokens, shell, content components, interactive components, 404) and all check commands pass. **However, cross-check against spec/design/planned route set surfaces 3 MED gaps + 1 MED plan-conflict** that will propagate into Layer 2 (dead links / wrong card contract / stale task requirement). Per the rule *"Verdict PASS chỉ khi không còn gap HIGH/MED chặn Layer 2"* → **FAIL pending ratification**.

No ❌ HIGH security/data conflict; no ❌ spec requirement missing for Layer-1 scope itself. The blockers are **navigation contract** and **plan-doc drift**, not data/security.

## Verify commands + result (spec-validator tự chạy)
| Command | Result |
|---|---|
| `npm run lint` | ✅ PASS |
| `npm run typecheck` | ✅ PASS |
| `npm run build` | ✅ PASS (Next 15.5.27; `○ /_not-found`, `● /[locale]` (/vi,/en), `ƒ /[locale]/[...rest]`) |

## 1. Coverage matrix (Layer-1 scope vs spec/design)

| Req | Source | Status | Note |
|---|---|---|---|
| R-11 nav/footer | `SPECIFICATIONS.md:109-111`; design §1.1/§1.2 | 🟡 PARTIAL | Header ✅, Footer ✅ 4-col + CTA BR-001 + legal/social/toggle. But 3 dead links (Gaps 1–3) and Footer "Giải pháp" omits the 4+3 slug sub-links described in design §1.2 |
| R-12 404 | `SPECIFICATIONS.md:112`; design Screen 13 | ✅ | `not-found.tsx` + `[...rest]/page.tsx`; h1/message/HomeLink/4 suggestion links; `robots:noindex`. Runtime `<title>` = residual (see §5) |
| R-20 i18n | `SPECIFICATIONS.md:153` | 🟡 PARTIAL | Toggle VI/EN + path retention + VI/EN key parity ✅; hreflang localized meta = Layer 4 (design §1.7/§1.8, not L1 scope) |
| R-22 performance | `SPECIFICATIONS.md:157` | 🟡 PARTIAL | No heavy deps; `next/image` with `sizes` ✅; **Inter font still not loaded** (`--font-inter` unset) — defer Layer 4 (Gap H) |
| R-23 responsive | `SPECIFICATIONS.md:159-166`; project-config ui.breakpoints | ✅ | Tailwind screens 640–1536; `max-w-container` 1280; fluid `clamp`; grid 1→2→3 |
| R-24 a11y | `SPECIFICATIONS.md:167` | 🟡 PARTIAL | Landmarks/skip-link/focus-trap/`aria-expanded/current`/44px ✅; hardcoded `aria-label="Language"` + `aria-current="true"` (LOW, Gap I); icon family deferred (Gap J) |
| R-01…R-10, R-13…R-19, R-21, R-25…R-27 | — | ⬜ deferred | Owned by Layer 2/3/4 tasks (verified present in `tasks/nta-website/layer-2..4-*.md`) |
| R-02/R-05/R-06/R-07/R-08/R-09 (card contracts) | design §1.9; tasks L2 | 🟡 PARTIAL | Cards typed to content types ✅; **product-detail link contract wrong** (Gap 1) |

**No spec requirement lost its owner.** Layer-1 task→code mapping verified for all 5 tasks.

## 2. Gap list (blocking / non-blocking)

### Gap 1 — [MED] Product card family links to a non-existent `/products/[slug]` route
- Evidence: `src/components/cards/ProductCard.tsx:14` (`href={`/products/${product.slug}`}`); `src/components/cards/AppCard.tsx:17` (same). No `/products/[slug]` route exists in any layer task (grep of `tasks/nta-website` shows only `src/app/[locale]/products/page.tsx` in `layer-2-task-05.md:73`; no `products/[slug]`).
- Spec/design: `SPECIFICATIONS.md:81` R-07 defines only `/products`; design Screen 7 (`design-spec.md:321-350`) has no product detail page; design Screen 1 (`design-spec.md:116`) product strip mentions no detail link.
- Impact: Layer-2 home strip (`layer-2-task-01.md:43` mounts `ProductCard`) and `/products` page (`AppCard`) render links → catch-all → **404** on a primary surface.
- Needs user decision (contract): either (a) ProductCard/AppCard link to `/products` (or non-link), or (b) approve a new `/products/[slug]` route via Change Request.

### Gap 2 — [MED] MobileNav links to non-existent `/solutions` index
- Evidence: `src/components/layout/MobileNav.tsx:10` (`['solutions','/solutions']`) → rendered `href="/solutions"` at `:43`. No `/solutions` route planned (only `/solutions/enterprise`, `/solutions/ai`). Desktop header uses a dropdown button with only the two sub-links (`Header.tsx:51-56`).
- Spec/design: R-05 `SPECIFICATIONS.md:69`, R-06 `:75`; design §1.1 (`design-spec.md:22-27`) — mobile drawer "nav list" mirrors desktop (no `/solutions` parent link).
- Impact: dead link on mobile on every page → 404 (catch-all).

### Gap 3 — [MED] Footer "Chính sách bảo mật" links to non-existent `/privacy`
- Evidence: `src/components/layout/Footer.tsx:25` (`href="/privacy"`). No `/privacy` route in spec or any layer task.
- Spec/design: design §1.2 (`design-spec.md:35`) says "link Chính sách **(nếu có)**". No privacy page in `SPECIFICATIONS.md` Scope.
- Impact: dead link on every page → 404; also a stray SEO signal.
- Fix likely = remove the link (not a requirement) until a privacy page is approved.

### Gap 4 — [MED] `layer-2-task-01` stale requirement conflicts with ratified R-03 "≥2"
- Evidence: `tasks/nta-website/layer-2-task-01.md:26` ("R-03: sản phẩm tiêu biểu **≥3–4**") and `:43` ("**≥3** `ProductCard`"). Authoritative: `SPECIFICATIONS.md:59` R-03 = "**≥ 2** sản phẩm tiêu biểu"; design Screen 1 `design-spec.md:116` = "**≥2** `ProductCard`"; ratified in `layer-0-task-06.md:41` (G2) and `.context/design-spec.md`. Only 2 real products exist (`src/content/home.ts:16-19,28-31`).
- Impact: Layer-2 task-01 must not be executed as written (would demand fabricated products). Fix task text before Layer 2.
- (Related stale text: `layer-0-task-04.md:43` still says "≥3"; `:91` correctly notes the 2-vs-≥3 ratification.)

### Gap 5 — [LOW] Footer "Giải pháp"/"Liên hệ" columns partially match design §1.2
- Evidence: `Footer.tsx:8-9` solution column = only `enterprise` + `ai` overview links; design §1.2 (`design-spec.md:32-33`) describes "Enterprise + 4 slug, AI + 3 slug" and contact column including "**địa chỉ** placeholder". `Footer.tsx:21` has hotline + email only (no address).
- Spec: R-11 (`SPECIFICATIONS.md:109-111`) requires only "4 cột desktop, pháp lý + social + liên hệ" → LOW, not a hard spec breach.

### Gap 6 — [LOW] `home.ts` EN hrefs are pre-localized, risking double-prefix in Layer 2
- Evidence: `src/content/home.ts:24-26,32` store `/en/solutions/enterprise`, `/en/products`, `/en/case-studies/...` while the rest of the app relies on `next-intl` `Link` to prefix locale (`src/i18n/navigation.ts`). If Layer-2 renders these via `Link`, result may be `/en/en/...`. Inconsistent with i18n pattern (design-tokens §11).
- Not a Layer-1 deliverable defect but a contract to fix before Layer 2 consumes it.

### Gap 7 — [LOW] `layer-1-task-04.md` close-out is stale
- Evidence: task DoD items `:73-76` unchecked (`Reviewer PASS`, `progress updated`, `committed`), and Verification Summary `:61` cites only round-1/round-2 reports — but `feature-nta-website-layer-1-task-04-round-3-review.md` exists and `progress.json` marks task-04 `done`/PASS. Task file = source of truth for residual; should be reconciled.

### Gap 8 — [LOW] `hover:border-strong` in Button secondary is likely a no-op
- Evidence: `src/components/ui/Button.tsx:13`; Tailwind color key is `'border-strong'` (`tailwind.config.ts:26`) so the valid class is `border-border-strong`. Build CSS search found **no** `.hover\:border-strong` and **no** `.border-border-strong` → hover border-color does not change (secondary still has `hover:bg-border` feedback). Reviewer task-01 r3 claimed it now works — that claim is unverified/questionable. Non-blocking (craft).

### Gap 9 — [LOW] Header/Footer icon family not Phosphor; glyphs used
- Evidence: `Footer.tsx:21` hand-drawn Facebook `<path>`; `MobileNav.tsx:38,42` glyphs `☰`/`×`. Design-tokens §10 says one family (Phosphor), no hand-drawn paths; `@phosphor-icons/react` not in `package.json`. Already accepted MINOR (task-02 r2 m1) — non-blocking, track for polish.

### Gap 10 — [LOW] Hardcoded EN `aria-label="Language"` + `aria-current="true"`
- Evidence: `LanguageToggle.tsx:13,14,16`. task-02 r2 MINOR m3/m6. Non-blocking.

## 3. Conflicts mới (spec ↔ design ↔ code ↔ plan)

| # | Mức | Nội dung | Nguồn |
|---|---|---|---|
| C-A | MED | Card radius: design-tokens §4 says "Card thường = `rounded-md` (8px)"; design-spec Screen 1/3 says "Card `rounded-lg`"; code uses `rounded-lg` (`cardStyles.ts:1-3`). Design-spec is screen-authoritative → code OK, but tokens wording conflicts. LOW-MED observation | `design-tokens.md:160,168` vs `design-spec.md:114` vs `cardStyles.ts:1` |
| C-B | MED | R-03 "≥2" (spec/design) vs `layer-2-task-01` "≥3–4"/"≥3" (Gap 4) | `SPECIFICATIONS.md:59` vs `layer-2-task-01.md:26,43` |

No HIGH conflict, no ❌ security/data conflict, no dropped requirement.

## 4. Đã đạt (verified)

- Tokens match `skills/nextjs/design-tokens.md` §1–§12 (colors, clamp type, radius, shadows, z-index, durations). Only token-authoritative file; `skills/react-nodejs/design-tokens.md` is an unrelated placeholder and correctly not used.
- Button variants/sizes, pill, `min-h-11/12`, `min-w-11`, `active:scale-[0.98]`, global `*:focus-visible` (white 2px + 4px `--color-focus`), reduced-motion global (`globals.css:73-104`).
- Section 3 variants + `py-12 md:py-16 xl:py-24` + `max-w-container px-4 sm:px-6 lg:px-8`; Badge uses text not color-only.
- App shell: single `<main id="main" tabIndex={-1}>` (`layout.tsx:34`), skip-link, Header sticky 64/72 + backdrop-blur, drawer focus-trap/Esc/`inert`, active route, lang toggle preserves path, Footer 4→2→1 + CTA BR-001.
- Interactive: Reveal (CSS gate + `html.js`, no-JS/reduced-motion safe), FilterBar (`aria-pressed`, `role="status"`), Pagination (`aria-current`, keeps `?filter=`), Skeleton aspect-ratio, EmptyState.
- 404: correct content, 4 suggestion links, `robots:noindex`, `FocusMain`, no animation.
- i18n key sets VI/EN symmetric for nav/footer/interactive/notFound.
- **Check commands independently PASS** (lint/typecheck/build) — the recurring "shell denied" residual is cleared for this round.

## 5. Defer/observation status

| Item | Nguồn | Trạng thái |
|---|---|---|
| Layer-0 **O1** (featured-case "1 kết quả số thật" vs qualitative content, no empty clause) | `feature-nta-website-layer-0-round-2-spec-review.md:65` | ⚠️ **Still open**, deferred to Layer 2 (non-blocking) |
| Layer-0 **O2** (Screen 6 example "Óc Eo" for AI link) | `...layer-0-round-2...md:66` | ⚠️ **Still open**, deferred to Layer 2 (non-blocking) |
| task-05 **MINOR #2** nested `not-found` `<title>` metadata | `layer-1-task-05.md:84-86`; r2 report §MINOR A | ✅ **Documented residual** in task file; deferred to Layer 4 a11y/SEO sweep (accepted) |
| task-01 **Inter font not loaded** | task-01 r3 MINOR; `layer-4-task-02.md:77` | ⚠️ Deferred to Layer 4 (documented) |
| task-01 **ghost/outline on accent** | task-01 r3 MINOR | ✅ Addressed by CTABanner `inverse` variant (`CTABanner.tsx:23`) |
| task-02 m1/m3/m5/m6/m7/m8; task-04 MINORs | r2/r3 reports | ⚠️ Deferred non-blocking; some should be swept in Layer 4 (icons, lang aria, footer touch targets) |

## 6. Điều kiện verify lại (nếu FAIL)

1. **Ratify content of Gap 1** (product card link target: `/products` vs non-link vs new detail route) and fix `ProductCard.tsx`/`AppCard.tsx` accordingly.
2. **Fix Gap 2**: remove `/solutions` parent `Link` in `MobileNav.tsx` (make it a non-link section label, or point to `/solutions/enterprise`).
3. **Fix Gap 3**: remove `Footer.tsx:25` `/privacy` link or approve a privacy route.
4. **Fix Gap 4**: correct `layer-2-task-01.md:26,43` to "≥2" (and align `layer-0-task-04.md:43`) before Layer 2 starts.
5. Optional (LOW): Gaps 5–10.
6. Re-run `npm run lint && npm run typecheck && npm run build`; then re-run spec-validator **round 2**.

## 7. Remaining tasks not completed

- **Report file was not written** (tool access ended). Primary persisted this report verbatim.
- No source files were modified (read-only honored).

## 8. Recommendation

**Do NOT unlock Layer 2 yet.** Present Gaps 1–4 at the human checkpoint and ask the user to ratify the navigation contracts (product card target; `/solutions` link; `/privacy` link) and to fix the `layer-2-task-01` "≥3–4" drift. Apply LOW fixes opportunistically. Then start Layer 2.

**Route for fixes:** these are post-build modifications → route via `change-request` (`/change` or `/feature` MODIFY) per `AGENTS.md`; the plan-text drift (Gap 4) is a doc reconcile, not a code change.
