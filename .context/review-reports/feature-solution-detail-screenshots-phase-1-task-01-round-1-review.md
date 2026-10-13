# Review — feature-solution-detail-screenshots · phase-1-task-01 · round 1

Agent: reviewer
CR: CR-007 (`spec/changes/2026-10-13-solution-detail-screenshots.md`)
Task: `tasks/feature-solution-detail-screenshots/phase-1-task-01.md`

## Review level
**NORMAL**

## Reason
The change is an offline mock (`scripts/screenshots/*`), static PNG assets and MDX frontmatter. There is no API, auth, schema, shared runtime component or migration. The only runtime surface is the `screenshots:` array of the HRM solution page, which the existing content schema validates (typecheck and build pass).

## Blast radius
- Public page `/solutions/.../hrm` in VI and EN: the screenshot gallery gains 4 items.
- The mock tool `scripts/screenshots/mock-hrm` gains 4 nav entries. These would appear in any future recapture of 01–09. The committed 01–09 PNGs are not regenerated.
- `statusTone` map: the diff only adds keys. Existing mappings are unchanged, so screens 01–09 render the same apart from the sidebar.

## Verify commands + result
| Command | Result |
|---|---|
| `npm run typecheck` (re-run by reviewer) | PASS |
| `npm run lint` (re-run by reviewer) | PASS — 0 errors, 1 existing warning (`no-img-element`, `src/components/mdx/index.tsx:25`) |
| `npm run build` | Primary ran it in the user terminal: lint and types OK, 59/59 static pages. Inside the sandbox it hits an swc native-binding environment error, which is not counted as a defect |
| grep `ntavietnam\|Công ty NTA\|NTA Việt Nam` in `scripts/screenshots/` | no matches |
| PNG dimension vs ratio | 10: 2656×2340 = 1.135 ✓ · 11: 2656×2222 = 1.195 ✓ · 12: 2656×2872 = 0.925 ✓ · 13: 2656×2584 = 1.028 ✓ (VI and EN identical) |

## Acceptance check
- [x] 4 PNGs and 4 crops exist. The macOS frame, title bar, top bar, sidebar style, cards, badges and typography match 01 (`01-tong-quan.png`, compared visually). No broken layout or overflow in 10–13.
- [x] Alt text uses "Giao diện minh hoạ — …" (VI) and "Illustrative interface — …" (EN) for all 4 items.
- [x] No `ntavietnam.tech` or "Công ty NTA" in the mock, fixture or new images. The tenant is the fake "Minh Quang HRM" and all people are fake Vietnamese names. The title bar "NTA HRM · Quản trị nhân sự" is the product name and is the same as in 01–09.
- [x] typecheck and lint PASS; build PASS according to primary.
- [x] MDX frontmatter is valid YAML with the same indentation and keys (`src`/`alt`/`ratio`) as the existing items.

## Data consistency (checked by hand)
- **10 Recruitment:** 46+19+9+3+2 = 79 ✓. Each column's visible cards plus "+N khác" equals the column total ✓. 5 positions / 9 openings matches the 01 overview ✓.
- **12 KPI:** 27+98+51+10 = 186 ✓. Percentages round correctly ✓. Department progress 36+49+12+16+14 = 127 = "Đã hoàn tất" ✓. All 10 total scores equal 0.7·KPI + 0.3·competency ✓. Grades follow the thresholds A ≥ 90 / B ≥ 80 / C ≥ 65 / D ✓. 186 people over 10 per page gives 19 pages ✓. Deadline 20/10 is "Còn 10 ngày" from 10/10 ✓.
- **13 Turnover:** monthly joins = 51 and leaves = 23 ✓. These match the 01 overview headcount series (158→186, every month reconciles) ✓. Average headcount 174 gives 23/174 = 13.2% ✓. Department joins/leaves sum to 51/23 ✓, headcount sums to 186 ✓, and net and rate columns are correct ✓. Leave reasons sum to 23 ✓.
- **11 Contracts:** every "Còn N ngày" value is correct from 10/10/2026 ✓, and every contract term matches its start and end dates ✓. ≤30 days = 4 ✓, ≤60 days = 8 ✓.

## Findings
No blocking findings.

| # | Severity | Finding |
|---|---|---|
| F1 | Minor (non-blocking) | **Screen 11 footer contradicts the filter.** The filter chip says "Hết hạn trong: 60 ngày" and the footer says "Hiển thị **9** hợp đồng hết hạn trong 60 ngày tới" (`mock-hrm/app.js`, `F.contracts.length`). The 9th row (Bùi Tiến Dũng, 12/12/2026) is "Còn 63 ngày", and the ≤60 KPI card shows 8. Fix options: drop the 63-day row, change its end date to ≤ 09/12/2026, or use `contractSummary.expiring60` in the footer and filter the rows. |
| F2 | Minor (non-blocking) | **Screen 11 summary cards do not add up.** "Đang hiệu lực 186" but the visible cards show 141 + 39 = 180. The 6 probation contracts exist in the fixture (`contractSummary.probation`) but have no card. A careful reader may notice. Option: add a "Thử việc 6" card or a sub-label. |
| F3 | Cosmetic (non-blocking) | **Sidebar differs between old and new images.** 01–09 have 8 nav items and 10–13 have 12. In the gallery, the "Tuyển dụng / Hợp đồng / KPI / Báo cáo" items appear only in the new shots. This is not a broken layout or a functional defect, and each screen is internally coherent. However, a product gallery looks more polished when the nav is identical across shots. Recommendation: recapture 01–09 with `capture.mjs hrm` in a follow-up, or now if cheap. Recapturing may change their heights, so re-measure `ratio` for 01–09 in both MDX files afterwards. This does not block acceptance, because the task deliberately chose not to recapture and documented that choice. |
| F4 | Cosmetic (non-blocking) | **Headcount stays flat across October.** Screen 10 shows 2 hires with "Nhận việc 01/10/2026 · Đang hội nhập", but headcount is still 186 at 10/10 (screens 11/12) and on the overview. Only a very close reading would notice. Option: change those dates to 30/09 or keep them as is. |

## Verdict
**PASS** — acceptance criteria met. F1–F4 are minor or cosmetic and can be fixed optionally in this task or as a follow-up. F1 is the cheapest to fix if the builder touches the mock again.
