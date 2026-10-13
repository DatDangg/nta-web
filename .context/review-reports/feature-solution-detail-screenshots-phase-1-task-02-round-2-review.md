# Review — feature-solution-detail-screenshots · phase-1-task-02 · round 2

Agent: reviewer · 2026-10-13 · CR-007

## Review level
**STRICT** (same as round 1)

## Reason
This round re-checks the round-1 findings. The task still touches live customer systems (GET only, with a client-side write lock) and publishes images that must not carry real PII. The round-2 diff also adds public content blocks to 4 enterprise pages (8 VI/EN files).

## Blast radius
- `src/content/solutions/{vi,en}/{crm,dentgo,lms}.mdx`: a new `showcase.photos` block, rendered by `ShowcaseLayout` → `ShowcasePhotos`. None of the 3 pages has `showcase.technology`, so `ShowcaseTechnology` (which reads `photos.items` as tiles) is not rendered and nothing else changes.
- `src/content/solutions/{vi,en}/hrm.mdx`: 4 items appended to the end of `photos.items`. The existing 6 items are unchanged in content and order. HRM has no `showcase.technology` either, so no tile changes.
- LMS `screenshots: []` → 2 entries. Only `SolutionCard` reads this key (`SolutionCard.tsx:25`), as a fallback when `image` is missing. LMS has `image: /images/solutions/lms.svg`, so the card does not change.
- `scripts/screenshots/*` is offline tooling only and is not shipped.

## Verify commands + result
| Command | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS (0 errors, 1 pre-existing warning `src/components/mdx/index.tsx:25` no-img-element) |
| `npm run build` | PASS 59/59 (run by primary in the user terminal). Reviewer inspected the build output in `.next/server/app/{vi,en}/solutions/enterprise/*.html` |
| `git diff --stat` | 18 files, all within the task scope (scripts/screenshots + 8 MDX files) |

## Fix verification
| # | Round 1 | Round 2 result |
|---|---|---|
| F1 (HIGH) | Images not rendered | **Fixed.** The built HTML for all 8 pages contains the carousel `<img>` with the right src. CRM: 02/06/07. DentGo: 02/06/07. LMS: 09/08/03. HRM: 02,08,09,03,06,07 + 10,11,12,13. Alt text in the HTML carries "(dữ liệu minh hoạ)" / "(illustrative data)". HRM alt text uses "Giao diện minh hoạ — …" / "Illustrative interface — …", consistent with its existing items. The caption `Dữ liệu minh hoạ` / `Illustrative data` renders on crm/dentgo/lms VI+EN. VI/EN parity holds: same src, same order and the same number of items on all 4 pages. Labels are translated correctly. The schema matches `CaseStudyShowcase['photos']` (`types.ts:216-231`): eyebrow/title/prevLabel/nextLabel/caption?/variant `screen`/items `{src, alt}`. All referenced PNGs exist (lms/03, crm/02, dentgo/02, hrm/10–13). No hero image is duplicated. |
| F2 (LOW) | `TOKEN_REFRESH` matched the whole URL | **Fixed.** `isTokenRefresh` tests `new URL(url).pathname` against a regex anchored at `$`, and returns `false` if parsing fails (fail-closed). |
| F3 (LOW residual) | WebSocket / service worker not intercepted | **Documented** in `scripts/screenshots/README.md` (the "Giới hạn" paragraph). |
| F4 (LOW) | DentGo finance phone numbers used a real format | **Fixed.** `fakePhone` → `0900 000 1xx`. Suppliers use `024 0000 018x`. Addresses are district-level only. `fixtures/dentgo.json` was regenerated. The recaptured `dentgo/06` and its crop show only the fake numbers and addresses. The size is unchanged (2656×1716, ratio 1.548). A few `0912 320 100` lines remain in `dentgo.json`, but they are pre-existing (not in the diff) and are not on screen 06. |
| F5 (INFO) | Avatar "OA" | **Fixed** for `crm/06`: the avatar now shows "TK", matching "Trần Quốc Khánh / owner@example.com". The domPatch `^\s*OA\s*$` only matches a text node that is exactly "OA" (case-insensitive because of the `gi` flags), so it does not touch the "Zalo OA" label in the text. `crm/07` was not recaptured (its crop does not show the sidebar footer), which is acceptable. |
| F6 (INFO) | Replacement screens | Still open for the user to confirm at approval (recorded as residual risk). |

## Image review (opened again: crm/06, crm/06-crop, dentgo/06, dentgo/06-crop)
- **CRM 06:** brand "Hồng Phúc Nướng & Lẩu", 6 complaints with names from the fixture, avatar TK, generic window title. No dragonhotpot, CukCuk or real email. The crop is sharp and the table is complete.
- **DentGo 06:** the print header shows only "PHÒNG KHÁM" (settings/logo return empty). Patients, phones and suppliers are all fake. Staff are "Lê Thị Hồng" and "Nguyễn Thu Hà" from the fixture, and the user is "BS. Trần Minh Khoa". All 12 columns are visible. The totals add up: 17.100.000 − 11.670.000 = 5.430.000.

## Findings
| # | Severity | Finding |
|---|---|---|
| N1 | INFO | The top edge of `dentgo/06-bao-cao-tai-chinh-crop.png` shows about 2px of the bottom border of the 3 summary cards. It is cosmetic only, and the crop is not referenced in the MDX. |
| N2 | INFO | The LMS carousel includes `03-ho-so-hoc-sinh` (an old image) so it has 3 items. That image was already in the repo and was covered by an earlier task's review. Not a blocker. |
| N3 | INFO (commit hygiene) | `.context/project-config.md` is staged (`M `) but is not part of this task. When committing, stage only this task's files. |

## Verdict
**PASS**. F1–F5 are fixed or documented. The images render with alt text and captions in VI and EN, PII is clean, and typecheck, lint and build all pass. The only open item is F6/residual risk: the user should confirm the 2 replacement screens (DentGo 06, LMS 08) at approval.
