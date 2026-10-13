# Review — feature-solution-detail-screenshots · phase-1-task-02 · round 1

Agent: reviewer · 2026-10-13 · CR-007

## Review level
**STRICT**

## Reason
The task touches live customer systems (CRM, DentGo, LMS staging/prod) over the network, adds a client-side write-lock (security-relevant), and publishes images that could leak real customer PII.

## Blast radius
- `scripts/screenshots/*`: offline tooling only, not shipped. A change to `live.mjs`/`capture.mjs` affects every future live capture.
- `src/content/solutions/{vi,en}/{crm,dentgo,lms}.mdx`: frontmatter `screenshots:` only. This key is consumed only by `SolutionCard` (`firstShot` fallback when `image` is missing). All three pages have `image:`, so the cards do not change.
- 12 new PNGs under `public/images/solutions/v2/`. Old 01–07 PNGs are unchanged (`git status` shows no `M` on any PNG).

## Verify commands + result
| Command | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS (0 errors, 1 pre-existing warning `src/components/mdx/index.tsx` no-img-element) |
| `npm run build` | not run by reviewer (sandbox swc), primary runs it |
| `git status --short --ignored` | `scripts/screenshots/.tmp/` is ignored (`!!`). `.gitignore` has `scripts/screenshots/.tmp/` and `.tmp/`. Nothing from `.tmp` is untracked or staged |

## Checks
### 1. PII (all 6 main images and 6 crops opened)
- **CRM 06/07:** customer names (Nguyễn Thị Hồng Nhung, Bùi Tiến Dũng, …) come from `build-crm-fixture.mjs` `NAM`. Brand is "Hồng Phúc Nướng & Lẩu", user is "Trần Quốc Khánh / owner@example.com". OA ID `4207318865120094417` and templates `418302/418317` are hardcoded in `build-crm-fixture.mjs:299-307`. The Zalo sample values "Nguyễn Văn An"/"DH4895439" are app constants. The branch has been patched to "Hồng Phúc – Cao Thắng". No dragonhotpot, CukCuk or real email remains.
- **DentGo 06/07:** patients, phones, suppliers and staff come from the fixture. Branch "Nha khoa Minh Tâm – Trần Duy Hưng" is from `build-dentgo-fixture.mjs:49`. The print header shows only "PHÒNG KHÁM", because `/admin/settings` and `/files/brand-logo` return empty. User is "BS. Trần Minh Khoa".
- **LMS 08/09:** schools Minh Châu/Hoa Phượng/Bình Minh and codes TH_* come from `build-lms-fixture.mjs:102-104`. Real school names are mapped through the existing domPatch (`live.mjs:83-85`). User is "Phạm Quang Vinh".
- Window titles are generic (`CRM · Quản trị khách hàng`, …). Bell, avatar and corners are clean.
- Fixtures and builders: grep found no `dragon|cukcuk|sslip|IP staging|ntavietnam|@domain` hits. They contain no email addresses at all.

### 2. Read-only safety (`live.mjs` `blockWrite`/`guard`)
- After `guard.lock()` (called after login and LMS `afterLogin`), every method other than GET/HEAD/OPTIONS is `Fetch.failRequest`ed. Exceptions: localhost, and URLs matching `TOKEN_REFRESH`. The check runs before the fixture and static rules. Probe mode also goes through it.
- If `failRequest` throws, the request stays paused instead of continuing (fail-closed). OK.
- The allow-list is tight enough. The minor points are under Findings.

### 3. Regression
- `trimTransparentBottom` returns the original shot when there is no transparent bottom row (`last >= height-1`), so normal shots do not change.
- LMS retry: up to 3 attempts, and it throws when no school is picked, so it never captures the wrong screen.
- Probe: reading the body at `loadingFinished` is more correct. `shape()` still prints only key names and types, never values.
- `shots.mjs` only adds entries. Old PNGs were not recaptured.

### 4. MDX
- Frontmatter YAML is valid (typecheck/lint PASS).
- Every alt text has "(dữ liệu minh hoạ)" / "(illustrative data)".
- VI/EN parity is correct (same src, ratio and order).
- Ratio = width/height of the main PNG, checked against the real dimensions: crm06 2656×1902=1.396 ✓, crm07 2656×3702=0.717 ✓, dentgo06 2656×1716=1.548 ✓, dentgo07 2656×2058=1.291 ✓, lms08 2656×1902=1.396 ✓, lms09 2656×3686=0.721 ✓.

### 5. Visuals
- macOS frame, 2656px width and crops are consistent with the existing v2 images. Theme per app is consistent (CRM dark, DentGo/LMS light).

## Findings
| # | Severity | Finding |
|---|---|---|
| F1 | **HIGH** | **The new images do not appear on any page.** The enterprise detail page (`src/app/[locale]/solutions/enterprise/[slug]/page.tsx:58`) renders only `ShowcaseLayout showcase={solution.showcase}`. The image carousel takes `showcase.photos` (`ShowcaseLayout.tsx:33,36` → `ShowcasePhotos`). Frontmatter `screenshots:` is read only by `SolutionCard.tsx:25-27`, as a fallback when `image` is missing, and crm/dentgo/lms all have `image`. CRM/DentGo/LMS have no `showcase.photos` block, so all 6 new images (and CRM `02-khach-hang`, DentGo `02-ho-so-khach-hang`) are dead content. The change doc acceptance says "CRM / DentGo / LMS có ảnh staging mới **trong block ảnh**" (block ảnh trượt / công nghệ) and is not met. Root cause: task scope §4 wrote "add to `screenshots:`". The builder followed the task, but the task is wrong against the CR. Fix: add a `showcase.photos` block (eyebrow/title/prevLabel/nextLabel/caption/`variant: screen`/items with alt "dữ liệu minh hoạ") to VI and EN for all 3 pages, following `vi/hrm.mdx:200-223`. **Same latent defect in task-01 (already committed):** HRM 10–13 were added only to `screenshots:` and are missing from `showcase.photos`. The coordinator should open a follow-up for this. |
| F2 | LOW | `TOKEN_REFRESH` is tested against the full URL including the query string and is not anchored to the path. A non-GET whose query contains `/auth/refresh` would get through. Suggestion: test `new URL(url).pathname`. |
| F3 | LOW (residual) | `Fetch.enable` on the page session does not intercept WebSocket frames (socket.io after upgrade) or requests that originate in a service worker. Screens are only viewed (no clicks), so the risk is low. Record it as residual risk in README/task. |
| F4 | LOW | DentGo 06 fixture phone numbers use a real format (mobile `0912 320 100`, landlines `024 3856 1120`, `024 6290 4471`, `024 3822 5566`) together with real street addresses. They may belong to real subscribers or businesses. Suggestion: use clearly fake numbers (e.g. `0900 000 xxx`, `024 0000 xxxx`). This is not a blocker, since these are fixture-fabricated values, not leaked customer data. |
| F5 | INFO | CRM avatar shows initials "OA" (from the real account name "Owner Admin") while the name has been patched to "Trần Quốc Khánh". This is not PII, only an inconsistency (probably the same in the old images). |
| F6 | INFO | The two replacement screens (DentGo 06 finance report, LMS 08 school comparison) were chosen by the coordinator. The user should confirm them when approving (already recorded under Residual risk in the task). |

## Verdict
**FAIL**: F1 (HIGH). Content and PII are clean, the write-lock is acceptable, ratios and alt text are correct. But the images are not rendered, so the CR acceptance is not met. Once F1 is fixed (add to `showcase.photos` VI+EN), the next round only needs to check the frontmatter and build. F2–F4 are optional.
